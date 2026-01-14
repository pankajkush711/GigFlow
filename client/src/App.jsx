import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from './store/authSlice';
import GigsPage from './pages/GigsPage';
import AuthPage from './pages/AuthPage';
import PostGigPage from './pages/PostGigPage';
import GigBidsPage from './pages/GigBidsPage';
import ProtectedRoute from './components/ProtectedRoute';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="app-title">
        <Link to="/">GigFlow</Link>
      </div>
      <nav style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <Link to="/" className="muted">
          Gigs
        </Link>
        {user && (
          <Link to="/post-gig" className="muted">
            Post Gig
          </Link>
        )}
        {user ? (
          <>
            <span className="muted">Hi, {user.name}</span>
            <button className="primary-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <button className="primary-button" onClick={() => navigate('/auth')}>
            Login / Register
          </button>
        )}
      </nav>
    </header>
  );
}

function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<GigsPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/post-gig"
            element={
              <ProtectedRoute>
                <PostGigPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gigs/:gigId/bids"
            element={
              <ProtectedRoute>
                <GigBidsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
