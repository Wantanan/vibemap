import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, saveProfile } from '../api/api';
import './Profile.css';

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
    setProfile({
      ...profile,
      [key]: current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
    });
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
    return <div className="profile-loading"><p>Loading your vibe profile...</p></div>;
  }

  return (
    <div className="profile-page">

      <nav className="profile-navbar">
        <div className="navbar-brand">🧭 VibeMap</div>
        <button className="btn-nav" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </nav>

      <div className="profile-content">

        <div className="profile-header">
          <div className="profile-header-icon">👤</div>
          <div>
            <h1 className="profile-header-title">Your Vibe Profile</h1>
            <p className="profile-header-sub">Tailor VibeMap to your unique lifestyle.</p>
          </div>
        </div>

        {/* Section 1 */}
        <div className="profile-section">
          <div className="profile-section-header">
            <span className="section-num">1</span>
            <span className="section-icon">🏠</span>
            <h2 className="section-title">The Basics</h2>
          </div>
          <div className="profile-row">
            <div className="profile-field">
              <label className="profile-label">Display Name</label>
              <input className="profile-input" value={user?.username} disabled />
            </div>
            <div className="profile-field">
              <label className="profile-label">Lifestyle Phase</label>
              <select
                className="profile-select"
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

        {/* Section 2 */}
        <div className="profile-section">
          <div className="profile-section-header">
            <span className="section-num">2</span>
            <span className="section-icon">🍽️</span>
            <h2 className="section-title">Food Vibe</h2>
          </div>
          <div className="check-grid">
            {FOOD_OPTIONS.map(opt => (
              <label key={opt} className="check-label">
                <input
                  type="checkbox"
                  className="check-input"
                  checked={(profile.food_vibe || []).includes(opt)}
                  onChange={() => toggleMulti('food_vibe', opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        {/* Section 3 */}
        <div className="profile-section">
          <div className="profile-section-header">
            <span className="section-num">3</span>
            <span className="section-icon">🎵</span>
            <h2 className="section-title">Atmosphere Music</h2>
          </div>
          <div className="check-grid">
            {MUSIC_OPTIONS.map(opt => (
              <label key={opt} className="check-label">
                <input
                  type="checkbox"
                  className="check-input"
                  checked={(profile.atmosphere_music || []).includes(opt)}
                  onChange={() => toggleMulti('atmosphere_music', opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        {/* Section 4 */}
        <div className="profile-section">
          <div className="profile-section-header">
            <span className="section-num">4</span>
            <span className="section-icon">⚡</span>
            <h2 className="section-title">Activities</h2>
          </div>
          <div className="check-grid">
            {ACTIVITY_OPTIONS.map(opt => (
              <label key={opt} className="check-label">
                <input
                  type="checkbox"
                  className="check-input"
                  checked={(profile.activities || []).includes(opt)}
                  onChange={() => toggleMulti('activities', opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        {/* Section 5 */}
        <div className="profile-section">
          <div className="profile-section-header">
            <span className="section-num">5</span>
            <span className="section-icon">💰</span>
            <h2 className="section-title">Budget per Outing</h2>
          </div>
          <div className="profile-slider-val">${profile.budget}</div>
          <input
            type="range"
            className="profile-slider"
            min={10} max={200} step={10}
            value={profile.budget}
            onChange={e => setProfile({ ...profile, budget: parseInt(e.target.value) })}
          />
          <div className="profile-slider-labels">
            <span>Budget-friendly</span>
            <span>Mid-range</span>
            <span>Splurge</span>
          </div>
        </div>

        {/* Section 6 */}
        <div className="profile-section">
          <div className="profile-section-header">
            <span className="section-num">6</span>
            <span className="section-icon">❤️</span>
            <h2 className="section-title">Personal Bio</h2>
          </div>
          <textarea
            className="profile-textarea"
            placeholder="Briefly describe your daily vibe..."
            value={profile.personal_bio || ''}
            onChange={e => setProfile({ ...profile, personal_bio: e.target.value })}
            rows={4}
          />
        </div>

        {error && <p className="profile-error">{error}</p>}
        {success && <p className="profile-success">{success}</p>}

        <div className="profile-footer">
          <span className="vibe-ready">✨ Vibe Analysis Ready</span>
          <div className="footer-btns">
            <button className="btn-cancel" onClick={() => navigate('/dashboard')}>
              Cancel
            </button>
            <button className="btn-save-profile" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Vibe Profile'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}