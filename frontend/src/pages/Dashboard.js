import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlaces, getMatch } from '../api/api';
import MapView from '../components/MapView';
import './Dashboard.css';

const CATEGORIES = [
  { label: 'Restaurants', icon: '🍽️' },
  { label: 'Cafes', icon: '☕' },
  { label: 'Nightlife', icon: '🎵' },
  { label: 'Outdoors', icon: '🌿' },
  { label: 'Kids & Family', icon: '👨‍👩‍👧' },
  { label: 'Education', icon: '📚' },
  { label: 'Shopping', icon: '🛍️' },
  { label: 'Wellness', icon: '🧘' }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('vibemap_user'));

  const [category, setCategory] = useState('Restaurants');
  const [location, setLocation] = useState('');
  const [places, setPlaces] = useState([]);
  const [similarUsers, setSimilarUsers] = useState([]);
  const [peerGroup, setPeerGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [layer, setLayer] = useState(null);
  const [searched, setSearched] = useState(false);
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadMatch();
  }, []);

  const loadMatch = async () => {
    try {
      const res = await getMatch({ user_id: user.user_id });
      setPeerGroup(res.data.peer_group);
      setSimilarUsers(res.data.similar_users || []);
      setLayer(res.data.layer);
    } catch (err) {
      console.log('Match not ready yet');
    }
  };

  const handleSearch = async () => {
    if (!location.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await getPlaces({ user_id: user.user_id, location, category });
      setPlaces(res.data.places || []);
      setMessage(res.data.message || '');
      setLayer(res.data.layer);
      setSimilarUsers(res.data.similar_users || []);
    } catch (err) {
      console.log('Error fetching places');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('vibemap_user');
    navigate('/login');
  };

  const getLayerBadge = () => {
    if (layer === 1) return { label: 'Popular Near You', color: '#3aada8' };
    if (layer === 2) return { label: `${peerGroup?.group_name || 'Your Tribe'} Picks`, color: '#f5a623' };
    if (layer === 3) return { label: 'Vibe Neighbour Match', color: '#0f6e56' };
    return null;
  };

  return (
    <div className="dashboard-page">

      <nav className="dashboard-navbar">
        <div className="navbar-brand">🧭 VibeMap</div>
        <div className="navbar-right">
          <span className="navbar-greeting">Hey, {user?.username}</span>
          {peerGroup && <span className="navbar-persona">{peerGroup.group_name}</span>}
          <button className="btn-nav" onClick={() => navigate('/profile')}>Profile</button>
          <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
        </div>
      </nav>

      <div className="dashboard-hero">
        <h1 className="hero-title">
          Your City, <span className="hero-vibe">Your Vibe</span>
        </h1>
        <p className="hero-sub">
          Personalized local discovery for <strong>{user?.username}</strong>
        </p>
        <div className="search-row">
          <input
            className="search-input"
            placeholder="Enter a city or neighbourhood..."
            value={location}
            onChange={e => setLocation(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn-find" onClick={handleSearch}>
            {loading ? 'Searching...' : 'Find Lens'}
          </button>
        </div>
      </div>

      <div className="dashboard-content">

        <div className="category-tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat.label}
              className={`tab-btn ${category === cat.label ? 'active' : ''}`}
              onClick={() => setCategory(cat.label)}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {layer && getLayerBadge() && (
          <div className="layer-badge" style={{ background: getLayerBadge().color }}>
            ✨ {getLayerBadge().label}
            {message && <span> — {message}</span>}
          </div>
        )}

        {searched && (
          <>
            <div className="discover-header">
              <h2 className="section-title">Discover {category}</h2>
              <div className="view-toggle">
                <button
                  className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  ☰ List
                </button>
                <button
                  className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                  onClick={() => setViewMode('map')}
                >
                  🗺️ Map
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-wrap">
                <p>Finding the best places for your vibe...</p>
              </div>
            ) : places.length === 0 ? (
              <div className="empty-wrap">
                <p>No places found. Try a different location or category.</p>
              </div>
            ) : viewMode === 'list' ? (
              <div className="places-grid">
                {places.map(place => (
                  <div key={place.place_id} className="place-card">
                    {place.photo_url ? (
                      <img src={place.photo_url} alt={place.name} className="place-img" />
                    ) : (
                      <div className="place-img-placeholder">
                        {CATEGORIES.find(c => c.label === category)?.icon || '📍'}
                      </div>
                    )}
                    <div className="place-body">
                      <div className="place-top-row">
                        <span className="place-category-badge">{place.category}</span>
                        {place.vibe_match && (
                          <span className="vibe-match">✨ {place.vibe_match}%</span>
                        )}
                      </div>
                      <div className="place-title-row">
                        <h3 className="place-name">{place.name}</h3>
                        {place.rating > 0 && (
                          <span className="place-rating">⭐ {place.rating}</span>
                        )}
                      </div>
                      <p className="place-address">📍 {place.address}</p>
                      {place.open_now !== null && (
                        <span className={`open-badge ${place.open_now ? 'open-now' : 'closed'}`}>
                          {place.open_now ? '● Open Now' : '● Closed'}
                        </span>
                      )}
                      <button className="btn-explore">Explore Details</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <MapView places={places} />
            )}
          </>
        )}

        {similarUsers.length > 0 && (
          <div className="neighbors-section">
            <h2 className="section-title">👥 Vibe Neighbors</h2>
            <p className="neighbors-sub">
              People who share your {peerGroup?.group_name} lifestyle
            </p>
            <div className="neighbors-grid">
              {similarUsers.map((u, i) => (
                <div key={i} className="neighbor-card">
                  <div className="neighbor-avatar">
                    {u.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="neighbor-name">{u.username}</div>
                  <div className="neighbor-lifestyle">{u.lifestyle}</div>
                  <div className="neighbor-score">✨ {u.similarity_score}% match</div>
                  <span className="similar-vibe-badge">Similar Vibe</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!searched && (
          <div className="empty-state">
            <div className="empty-icon">🧭</div>
            <h3 className="empty-title">Ready to explore?</h3>
            <p className="empty-sub">
              Enter a city or neighbourhood above and select a category to discover places matched to your vibe.
            </p>
            {!peerGroup && (
              <button className="btn-complete-profile" onClick={() => navigate('/onboarding')}>
                Complete Your Vibe Profile ✨
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}