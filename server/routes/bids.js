import express from 'express';
import Bid from '../models/Bid.js';
import Gig from '../models/Gig.js';
import { authRequired } from '../middleware/auth.js';
import { notifyUserHired } from '../index.js';

const router = express.Router();

// POST /api/bids
router.post('/', authRequired, async (req, res) => {
  try {
    const { gigId, message, price } = req.body;
    if (!gigId || !message || !price) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const gig = await Gig.findById(gigId);
    if (!gig || gig.status !== 'open') {
      return res.status(400).json({ message: 'Gig not open for bids' });
    }

    const bid = await Bid.create({
      gigId,
      freelancerId: req.user.id,
      message,
      price,
    });

    res.status(201).json(bid);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/bids/:gigId - only gig owner
router.get('/:gigId', authRequired, async (req, res) => {
  try {
    const { gigId } = req.params;
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    if (String(gig.ownerId) !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view bids' });
    }

    const bids = await Bid.find({ gigId })
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/bids/:bidId/hire - atomic-ish hire logic without transactions
router.patch('/:bidId/hire', authRequired, async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    const gig = await Gig.findById(bid.gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (String(gig.ownerId) !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to hire for this gig' });
    }

    // Try to mark gig as assigned only if it's still open
    const updatedGig = await Gig.findOneAndUpdate(
      { _id: gig._id, status: 'open' },
      { $set: { status: 'assigned' } },
      { new: true },
    );

    if (!updatedGig) {
      return res.status(400).json({ message: 'Gig already assigned' });
    }

    // Try to mark the selected bid as hired only if still pending
    const updatedBid = await Bid.findOneAndUpdate(
      { _id: bid._id, status: 'pending' },
      { $set: { status: 'hired' } },
      { new: true },
    ).populate('freelancerId', 'name email');

    if (!updatedBid) {
      return res.status(400).json({ message: 'Bid is not pending' });
    }

    // Reject all other pending bids for this gig
    await Bid.updateMany(
      { gigId: gig._id, _id: { $ne: bid._id }, status: 'pending' },
      { $set: { status: 'rejected' } },
    );

    // Notify freelancer via socket.io
    notifyUserHired(updatedBid.freelancerId?._id || bid.freelancerId, {
      bidId: updatedBid._id,
      gigId: updatedGig._id,
      gigTitle: updatedGig.title,
      message: 'You have been hired!',
    });

    return res.json({
      message: 'Freelancer hired successfully',
      gig: updatedGig,
      bid: updatedBid,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;

