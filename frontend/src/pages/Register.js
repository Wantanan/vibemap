import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/api';

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
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>🧭</div>
          <h1 style={styles.brand}>VibeMap</h1>
          <p style={styles.tagline}>Join and discover your city.</p>
        </div>

        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.sub}>Start your vibe journey today.</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Choose a username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Confirm Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Confirm your password"
              value={form.confirm}
              onChange={e => setForm({ ...form, confirm: e.target.value })}
              required
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Creating account...' : 'Join VibeMap'}
          </button>
        </form>

        <p style={styles.footer}>
          Already a member?{' '}
          <Link to="/login" style={styles.link}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', background: '#f0f4f8',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
  },
  card: {
    background: '#fff', borderRadius: '16px', padding: '2rem',
    width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)'
  },
  header: {
    background: '#3aada8', margin: '-2rem -2rem 1.5rem',
    padding: '2rem', borderRadius: '16px 16px 0 0', textAlign: 'center', color: '#fff'
  },
  logo: { fontSize: '40px', marginBottom: '8px' },
  brand: { fontSize: '24px', fontWeight: '700', color: '#fff' },
  tagline: { fontSize: '14px', opacity: 0.85, marginTop: '4px' },
  title: { fontSize: '20px', fontWeight: '600', color: '#3aada8', marginBottom: '4px' },
  sub: { fontSize: '14px', color: '#888', marginBottom: '1.5rem' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', color: '#555', marginBottom: '6px' },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1.5px solid #e0e0e0', fontSize: '14px', outline: 'none'
  },
  btn: {
    width: '100%', padding: '12px', background: '#f5a623',
    color: '#412402', border: 'none', borderRadius: '10px',
    fontSize: '15px', fontWeight: '600', marginTop: '1rem', cursor: 'pointer'
  },
  footer: { textAlign: 'center', fontSize: '13px', color: '#888', marginTop: '1rem' },
  link: { color: '#3aada8', fontWeight: '500', textDecoration: 'none' }
};