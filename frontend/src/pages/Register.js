import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/api';
import './Register.css';
import './Login.css';

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await registerUser({
        username: form.username,
        password: form.password
      });
      localStorage.setItem('vibemap_user', JSON.stringify(res.data.user));
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="register-page">
      <div className="register-card">

        <div className="register-header">
          <div className="register-logo">🧭</div>
          <h1 className="register-brand">VibeMap</h1>
          <p className="register-tagline">Join and discover your city.</p>
        </div>

        <div className="register-body">
          <h2 className="register-title">Create Account</h2>
          <p className="register-sub">Start your vibe journey today.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                type="text"
                placeholder="Choose a username"
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
                placeholder="Create a password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label">Confirm Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Confirm your password"
                value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                required
              />
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Join VibeMap'}
            </button>
          </form>

          <p className="form-footer">
            Already a member?{' '}
            <Link to="/login" className="form-link">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}