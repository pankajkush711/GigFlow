import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchBids, createBid, hireBid } from '../store/bidsSlice';
import { fetchGigs } from '../store/gigsSlice';

function GigBidsPage() {
  const { gigId } = useParams();
  const dispatch = useDispatch();
  const { byGig, loading, error } = useSelector((state) => state.bids);
  const { list: gigs } = useSelector((state) => state.gigs);
  const user = useSelector((state) => state.auth.user);
  const [message, setMessage] = useState('');
  const [price, setPrice] = useState('');

  const bids = byGig[gigId] || [];
  const gig = gigs.find((g) => g._id === gigId);
  const isOwner = gig && user && String(gig.ownerId?._id) === String(user.id);

  // Load gig metadata
  useEffect(() => {
    dispatch(fetchGigs());
  }, [dispatch]);

  // Only gig owner can see all bids, so only they should request them
  useEffect(() => {
    if (isOwner) {
      dispatch(fetchBids(gigId));
    }
  }, [dispatch, gigId, isOwner]);

  const handleBid = async (e) => {
    e.preventDefault();
    const res = await dispatch(
      createBid({ gigId, message, price: Number(price) }),
    );
    if (res.meta.requestStatus === 'fulfilled') {
      setMessage('');
      setPrice('');
    }
  };

  const handleHire = async (bidId) => {
    await dispatch(hireBid(bidId));
  };

  return (
    <section className="card">
      {gig && (
        <>
          <h1 className="card-title">{gig.title}</h1>
          <p className="muted" style={{ marginTop: '0.25rem' }}>
            {gig.description}
          </p>
          <p className="muted" style={{ marginTop: '0.25rem' }}>
            Budget: <strong>${gig.budget}</strong> • Status: {gig.status}
          </p>
        </>
      )}

      {!isOwner && (
        <form
          onSubmit={handleBid}
          style={{
            marginTop: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <h2 className="card-title" style={{ fontSize: '1.1rem' }}>
            Submit a Bid
          </h2>
          <textarea
            placeholder="Message to the client..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            required
          />
          <input
            type="number"
            placeholder="Your bid price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <button className="primary-button" type="submit">
            Place Bid
          </button>
        </form>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h2 className="card-title" style={{ fontSize: '1.1rem' }}>
          Bids
        </h2>
        {isOwner && loading && (
          <p className="muted" style={{ marginTop: '0.5rem' }}>
            Loading bids...
          </p>
        )}
        {isOwner && error && (
          <p className="muted" style={{ marginTop: '0.5rem', color: '#f97373' }}>
            {error}
          </p>
        )}
        {isOwner && !loading && bids.length === 0 && (
          <p className="muted" style={{ marginTop: '0.5rem' }}>
            No bids yet.
          </p>
        )}
        <div
          style={{
            marginTop: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {bids.map((bid) => (
            <div
              key={bid._id}
              style={{
                borderRadius: '0.75rem',
                border: '1px solid rgba(148,163,184,0.5)',
                padding: '0.75rem',
              }}
            >
              <p className="muted">
                From:{' '}
                <strong>{bid.freelancerId?.name || 'Unknown freelancer'}</strong>
              </p>
              <p className="muted" style={{ marginTop: '0.25rem' }}>
                {bid.message}
              </p>
              <p className="muted" style={{ marginTop: '0.25rem' }}>
                Price: <strong>${bid.price}</strong> • Status:{' '}
                <strong>{bid.status}</strong>
              </p>
              {isOwner && bid.status === 'pending' && (
                <button
                  className="primary-button"
                  style={{ marginTop: '0.5rem' }}
                  onClick={() => handleHire(bid._id)}
                >
                  Hire
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default GigBidsPage;

