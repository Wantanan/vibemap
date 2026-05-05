import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, saveProfile } from '../api/api';

const FOOD_OPTIONS = ['Italian','Japanese','Mexican','Vegan/Healthy','Thai','Middle Eastern','Seafood','Burgers/Pub'];
const MUSIC_OPTIONS = ['Lo-fi / Chill','Electronic / Dance','Jazz / Blues','Rock / Indie','Classical','Pop / Top 40'];
const ACTIVITY_OPTIONS = ['Hiking / Nature','Museums / Art','Social / Nightlife','Shopping','Workshops','Fitness','Live Music'];
const LIFESTYLE_OPTIONS = [
  'Digital Nomad','Young Professional','Family-First Explorer',
  'Gen-Z Trendsetter','Active Senior','Empty Nester',
  'Solo Traveler','Student / Academic','Creative Freelancer'
];

export default function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('vibemap_user'));
  const [profile, setProfile] = useState({
    lifestyle_phase: '',
    food_vibe: [],
    atmosphere_music: [],
    activities: [],
    budget: 50,
    personal_bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await getProfile(user.user_id);
      if (res.data.profile && Object.keys(res.data.profile).length > 0) {
        setProfile({ ...profile, ...res.data.profile });
      }
    } catch (err) {
      console.log('No profile yet');
    }
    setLoading(false);
  };

  const toggleMulti = (key, value) => {
    const current = profile[key] || [];
    if (current.includes(value)) {
      setProfile({ ...profile, [key]: current.filter(v => v !== value) });
    } else {
      setProfile({ ...profile, [key]: [...current, value] });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await saveProfile({ user_id: user.user_id, profile_data: profile });
      setSuccess('Vibe profile saved successfully! ✨');
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <p>Loading your vibe profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.brand}>🧭 VibeMap</div>
        <div style={styles.navRight}>
          <button style={styles.btnBack} onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <div style={styles.content}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>👤</div>
          <div>
            <h1 style={styles.headerTitle}>Your Vibe Profile</h1>
            <p style={styles.headerSub}>Tailor VibeMap to your unique lifestyle.</p>
          </div>
        </div>

        {/* Section 1 — The Basics */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionNum}>1</span>
            <span style={styles.sectionIcon}>🏠</span>
            <h2 style={styles.sectionTitle}>The Basics</h2>
          </div>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Display Name</label>
              <input
                style={styles.input}
                value={user?.username}
                disabled
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Lifestyle Phase</label>
              <select
                style={styles.select}
                value={profile.lifestyle_phase}
                onChange={e => setProfile({ ...profile, lifestyle_phase: e.target.value })}
              >
                <option value="">Select lifestyle...</option>
                {LIFESTYLE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2 — Food Vibe */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionNum}>2</span>
            <span style={styles.sectionIcon}>🍽️</span>
            <h2 style={styles.sectionTitle}>Food Vibe</h2>
          </div>
          <div style={styles.checkGrid}>
            {FOOD_OPTIONS.map(opt => (
              <label key={opt} style={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={(profile.food_vibe || []).includes(opt)}
                  onChange={() => toggleMulti('food_vibe', opt)}
                  style={styles.checkbox}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        {/* Section 3 — Atmosphere Music */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionNum}>3</span>
            <span style={styles.sectionIcon}>🎵</span>
            <h2 style={styles.sectionTitle}>Atmosphere Music</h2>
          </div>
          <div style={styles.checkGrid}>
            {MUSIC_OPTIONS.map(opt => (
              <label key={opt} style={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={(profile.atmosphere_music || []).includes(opt)}
                  onChange={() => toggleMulti('atmosphere_music', opt)}
                  style={styles.checkbox}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        {/* Section 4 — Activities */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionNum}>4</span>
            <span style={styles.sectionIcon}>⚡</span>
            <h2 style={styles.sectionTitle}>Activities</h2>
          </div>
          <div style={styles.checkGrid}>
            {ACTIVITY_OPTIONS.map(opt => (
              <label key={opt} style={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={(profile.activities || []).includes(opt)}
                  onChange={() => toggleMulti('activities', opt)}
                  style={styles.checkbox}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        {/* Section 5 — Budget */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionNum}>5</span>
            <span style={styles.sectionIcon}>💰</span>
            <h2 style={styles.sectionTitle}>Budget per Outing</h2>
          </div>
          <div style={styles.sliderVal}>${profile.budget}</div>
          <input
            type="range"
            min={10} max={200} step={10}
            value={profile.budget}
            onChange={e => setProfile({ ...profile, budget: parseInt(e.target.value) })}
            style={styles.slider}
          />
          <div style={styles.sliderLabels}>
            <span>Budget-friendly</span>
            <span>Mid-range</span>
            <span>Splurge</span>
          </div>
        </div>

        {/* Section 6 — Personal Bio */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionNum}>6</span>
            <span style={styles.sectionIcon}>❤️</span>
            <h2 style={styles.sectionTitle}>Personal Bio</h2>
          </div>
          <textarea
            style={styles.textarea}
            placeholder="Briefly describe your daily vibe..."
            value={profile.personal_bio || ''}
            onChange={e => setProfile({ ...profile, personal_bio: e.target.value })}
            rows={4}
          />
        </div>

        {/* Footer */}
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <div style={styles.footer}>
          <span style={styles.vibeReady}>✨ Vibe Analysis Ready</span>
          <div style={styles.footerBtns}>
            <button style={styles.btnCancel} onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
            <button style={styles.btnSave} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Vibe Profile'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f0f4f8' },
  loadingPage: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: '#888'
  },
  navbar: {
    background: '#fff', padding: '1rem 2rem',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  brand: { fontSize: '20px', fontWeight: '700', color: '#3aada8' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  btnBack: {
    background: 'none', border: '1.5px solid #e0e0e0',
    color: '#666', padding: '8px 16px',
    borderRadius: '8px', fontSize: '13px', cursor: 'pointer'
  },
  content: { maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' },
  header: {
    display: 'flex', alignItems: 'center',
    gap: '16px', marginBottom: '2rem',
    background: '#fff', borderRadius: '16px',
    padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
  },
  headerIcon: {
    width: '56px', height: '56px', borderRadius: '50%',
    background: '#e1f5ee', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '24px'
  },
  headerTitle: { fontSize: '22px', fontWeight: '700', color: '#3aada8' },
  headerSub: { fontSize: '14px', color: '#888', marginTop: '4px' },
  section: {
    background: '#fff', borderRadius: '16px',
    padding: '1.5rem', marginBottom: '1rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
  },
  sectionHeader: {
    display: 'flex', alignItems: 'center',
    gap: '10px', marginBottom: '1rem'
  },
  sectionNum: {
    width: '24px', height: '24px', borderRadius: '50%',
    background: '#3aada8', color: '#fff',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '12px', fontWeight: '600'
  },
  sectionIcon: { fontSize: '18px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#3aada8' },
  row: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  field: { flex: 1, minWidth: '200px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', color: '#555', marginBottom: '6px' },
  input: {
    width: '100%', padding: '10px 14px',
    borderRadius: '8px', border: '1.5px solid #e0e0e0',
    fontSize: '14px', background: '#f5f5f5', color: '#888'
  },
  select: {
    width: '100%', padding: '10px 14px',
    borderRadius: '8px', border: '1.5px solid #e0e0e0',
    fontSize: '14px', outline: 'none', cursor: 'pointer'
  },
  checkGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '10px'
  },
  checkLabel: {
    display: 'flex', alignItems: 'center',
    gap: '8px', fontSize: '14px',
    color: '#333', cursor: 'pointer',
    background: '#f5f5f5', padding: '8px 12px',
    borderRadius: '8px'
  },
  checkbox: { accentColor: '#3aada8', width: '16px', height: '16px' },
  sliderVal: {
    textAlign: 'center', fontSize: '24px',
    fontWeight: '700', color: '#3aada8', marginBottom: '10px'
  },
  slider: { width: '100%', accentColor: '#3aada8' },
  sliderLabels: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: '12px', color: '#888', marginTop: '6px'
  },
  textarea: {
    width: '100%', padding: '12px',
    borderRadius: '10px', border: '1.5px solid #e0e0e0',
    fontSize: '14px', resize: 'vertical', outline: 'none'
  },
  error: { color: '#e24b4a', fontSize: '13px', marginBottom: '1rem' },
  success: { color: '#0f6e56', fontSize: '13px', marginBottom: '1rem', fontWeight: '500' },
  footer: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginTop: '1.5rem',
    background: '#fff', borderRadius: '16px',
    padding: '1rem 1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
  },
  vibeReady: { fontSize: '13px', color: '#3aada8', fontWeight: '500' },
  footerBtns: { display: 'flex', gap: '10px' },
  btnCancel: {
    background: 'none', border: '1.5px solid #e0e0e0',
    color: '#666', padding: '10px 20px',
    borderRadius: '10px', fontSize: '14px', cursor: 'pointer'
  },
  btnSave: {
    background: '#f5a623', color: '#412402',
    border: 'none', padding: '10px 24px',
    borderRadius: '10px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer'
  }
};