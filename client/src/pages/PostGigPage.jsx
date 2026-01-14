import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createGig } from '../store/gigsSlice';

function PostGigPage() {
  const [form, setForm] = useState({ title: '', description: '', budget: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.gigs);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(
      createGig({
        title: form.title,
        description: form.description,
        budget: Number(form.budget),
      }),
    );
    if (res.meta.requestStatus === 'fulfilled') {
      navigate('/');
    }
  };

  return (
    <section className="card">
      <h1 className="card-title">Post a New Gig</h1>
      <p className="muted">
        Any logged-in user can post a job. Freelancers will be able to bid on it.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
      >
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Describe the work..."
          value={form.description}
          onChange={handleChange}
          rows={4}
          required
        />
        <input
          name="budget"
          type="number"
          placeholder="Budget (USD)"
          value={form.budget}
          onChange={handleChange}
          required
        />
        <button className="primary-button" type="submit">
          Post Gig
        </button>
        {error && (
          <p className="muted" style={{ color: '#f97373' }}>
            {error}
          </p>
        )}
      </form>
    </section>
  );
}

export default PostGigPage;

