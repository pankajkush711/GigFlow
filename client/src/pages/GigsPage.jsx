import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchGigs } from '../store/gigsSlice';

function GigsPage() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.gigs);
  const user = useSelector((state) => state.auth.user);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchGigs());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchGigs(search));
  };

  return (
    <section className="card">
      <h1 className="card-title">Open Gigs</h1>
      <p className="muted">Browse all currently open jobs on GigFlow.</p>

      <form
        onSubmit={handleSearch}
        style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}
      >
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="primary-button" type="submit">
          Search
        </button>
      </form>

      {loading ? (
        <p className="muted" style={{ marginTop: '1rem' }}>
          Loading gigs...
        </p>
      ) : (
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {list.length === 0 && (
            <p className="muted">No open gigs yet. Be the first to post one!</p>
          )}
          {list.map((gig) => (
            <div
              key={gig._id}
              style={{
                borderRadius: '0.75rem',
                border: '1px solid rgba(148,163,184,0.5)',
                padding: '1rem',
              }}
            >
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{gig.title}</h2>
              <p className="muted" style={{ marginTop: '0.25rem' }}>
                {gig.description}
              </p>
              <p className="muted" style={{ marginTop: '0.25rem' }}>
                Budget: <strong>${gig.budget}</strong>
              </p>
              <p className="muted" style={{ marginTop: '0.25rem' }}>
                Posted by: {gig.ownerId?.name || 'Unknown'}
              </p>
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <Link className="primary-button" to={`/gigs/${gig._id}/bids`}>
                  {user && String(user.id) === String(gig.ownerId?._id)
                    ? 'View Bids / Hire'
                    : 'View & Bid'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default GigsPage;

