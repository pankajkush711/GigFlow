import express from 'express';
import Gig from '../models/Gig.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

// GET /api/gigs?search=title
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const query = { status: 'open' };
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    const gigs = await Gig.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });
    res.json(gigs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/gigs
router.post('/', authRequired, async (req, res) => {
  try {
    const { title, description, budget } = req.body;
    if (!title || !description || !budget) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const gig = await Gig.create({
      title,
      description,
      budget,
      ownerId: req.user.id,
    });

    res.status(201).json(gig);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

