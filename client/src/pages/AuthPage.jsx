import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../store/authSlice';

function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'login') {
      const res = await dispatch(
        loginUser({ email: form.email, password: form.password }),
      );
      if (res.meta.requestStatus === 'fulfilled') {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } else {
      const res = await dispatch(
        registerUser({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      );
      if (res.meta.requestStatus === 'fulfilled') {
        navigate('/');
      }
    }
  };

  return (
    <section className="card">
      <h1 className="card-title">
        {mode === 'login' ? 'Login to GigFlow' : 'Create your GigFlow account'}
      </h1>
      <p className="muted">
        Use one account to post jobs as a client and bid on jobs as a freelancer.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
        <button
          type="button"
          className="primary-button"
          onClick={() => setMode('login')}
        >
          Login
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={() => setMode('register')}
        >
          Register
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
      >
        {mode === 'register' && (
          <input
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
            required
          />
        )}
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
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

export default AuthPage;

