import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api/api';
import './Login.css';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginUser(form);
      localStorage.setItem('vibemap_user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <div className="login-logo">🧭</div>
          <h1 className="login-brand">VibeMap</h1>
          <p className="login-tagline">Discover your city, personalized for your vibe.</p>
        </div>

        <div className="login-body">
          <h2 className="login-title">Member Login</h2>
          <p className="login-sub">Welcome back to VibeMap.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                type="text"
                placeholder="Enter username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="form-footer">
            Not a member?{' '}
            <Link to="/register" className="form-link">Join VibeMap</Link>
          </p>
        </div>
      </div>
    </div>
  );
}