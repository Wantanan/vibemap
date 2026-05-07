import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlaces, getMatch, getUserRatings } from '../api/api';
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
  const [neighbourPlaces, setNeighbourPlaces] = useState([]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadMatch();
  }, []);

  const loadMatch = async (searchLocation = '') => {
    try {
      const res = await getMatch({ user_id: user.user_id });
      setPeerGroup(res.data.peer_group);
      setLayer(res.data.layer);

      const similar = res.data.similar_users || [];
      setSimilarUsers(similar);

      const neighbourData = await Promise.all(
        similar.map(async (u) => {
          try {
            const ratingsRes = await getUserRatings(u.user_id);
            const allRatings = ratingsRes.data.ratings || [];

            const areaRatings = searchLocation
              ? allRatings.filter(r =>
                  r.place_address?.toLowerCase().includes(
                    searchLocation.toLowerCase()
                  ) ||
                  r.place_name?.toLowerCase().includes(
                    searchLocation.toLowerCase()
                  )
                )
              : [];

            const topRating = areaRatings
              .sort((a, b) => b.rating - a.rating)[0] || null;

            return { ...u, top_place: topRating };
          } catch {
            return { ...u, top_place: null };
          }
        })
      );
      setNeighbourPlaces(neighbourData);
    } catch (err) {
      console.log('Match not ready yet');
    }
  };

  const handleSearch = async () => {
    if (!location.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await getPlaces({
        user_id: user.user_id,
        location,
        category
      });
      setPlaces(res.data.places || []);
      setMessage(res.data.message || '');
      setLayer(res.data.layer);
      await loadMatch(location);
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

      {/* Navbar */}
      <nav className="dashboard-navbar">
        <div className="navbar-brand">🧭 VibeMap</div>
        <div className="navbar-right">
          <span className="navbar-greeting">Hey, {user?.username}</span>
          {peerGroup && (
            <span className="navbar-persona">{peerGroup.group_name}</span>
          )}
          <button className="btn-nav" onClick={() => navigate('/profile')}>
            Profile
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Hero */}
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

        {/* Category Tabs */}
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

        {/* Layer Badge */}
        {layer && getLayerBadge() && (
          <div className="layer-badge" style={{ background: getLayerBadge().color }}>
            ✨ {getLayerBadge().label}
            {message && <span> — {message}</span>}
          </div>
        )}

        {/* Vibe Neighbors — above discover, only when searched */}
        {searched && similarUsers.length > 0 && (
          <div className="neighbors-section">
            <div className="neighbors-header">
              <span className="neighbors-header-icon">👥</span>
              <div>
                <h2 className="section-title">Vibe Neighbors</h2>
                <p className="neighbors-sub">
                  Best places rated by people like you in {location}
                </p>
              </div>
            </div>

            <div className="neighbors-grid">
              {neighbourPlaces.map((u, i) => (
                <div key={i} className="neighbor-card">

                  <div className="neighbor-user-row">
                    <div className="neighbor-avatar">
                      {u.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="neighbor-user-info">
                      <div className="neighbor-name">{u.username}</div>
                      <div className="neighbor-lifestyle">{u.lifestyle}</div>
                    </div>
                    <span className="neighbor-similarity">
                      ⭐ {u.similarity_score}%
                    </span>
                  </div>

                  <span className="similar-vibe-badge">Similar Vibe</span>

                  {u.top_place ? (
                    <div className="neighbor-top-place">
                      <p className="neighbor-place-label">
                        Top pick in {u.top_place.place_category}:
                      </p>
                      <p className="neighbor-place-name">
                        {u.top_place.place_name}
                      </p>
                      <div className="neighbor-place-stars">
                        {'⭐'.repeat(u.top_place.rating)}
                        <span>{u.top_place.rating}/5</span>
                      </div>
                      {u.top_place.review && (
                        <p className="neighbor-place-review">
                          "{u.top_place.review}"
                        </p>
                      )}
                      <div className="neighbor-place-footer">
                        <span className="similar-vibe-badge">
                          ✨ VIBE MATCH
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="neighbor-empty">
                      <p>📍 No match in this area yet</p>
                      <p className="neighbor-empty-sub">
                        Be the first to rate places here!
                      </p>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discover Section */}
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
                      <img
                        src={place.photo_url}
                        alt={place.name}
                        className="place-img"
                      />
                    ) : (
                      <div className="place-img-placeholder">
                        {CATEGORIES.find(c => c.label === category)?.icon || '📍'}
                      </div>
                    )}
                    <div className="place-body">
                      <div className="place-top-row">
                        <span className="place-category-badge">
                          {place.category}
                        </span>
                        {place.vibe_match && (
                          <span className="vibe-match">
                            ✨ {place.vibe_match}%
                          </span>
                        )}
                      </div>
                      <div className="place-title-row">
                        <h3 className="place-name">{place.name}</h3>
                        {place.rating > 0 && (
                          <span className="place-rating">
                            ⭐ {place.rating}
                          </span>
                        )}
                      </div>
                      <p className="place-address">📍 {place.address}</p>
                      {place.neighbour_avg_rating && (
                        <div className="place-neighbour-review">
                            <div className="place-neighbour-title">
                                <span>👥</span>
                                <span>Vibe Neighbour Says</span>
                            </div>
                            <div className="place-neighbour-stars">
                                {'⭐'.repeat(Math.round(place.neighbour_avg_rating))}
                                <span style={{ fontSize: '11px', color: '#888', marginLeft: '4px' }}>
                                    {place.neighbour_avg_rating}/5
                                    {place.neighbour_rating_count > 1 &&
                                    ` (${place.neighbour_rating_count} reviews)`
                                    }
                                </span>
                            </div>
                            {place.neighbour_top_review && (
                                <p className="place-neighbour-text">
                                    "{place.neighbour_top_review}"
                                </p>
                            )}
                            {place.neighbour_reviewers && place.neighbour_reviewers.length > 0 && (
                                <p className="place-neighbour-name">
                                    — {place.neighbour_reviewers[0]}
                                    {place.neighbour_reviewers.length > 1 &&
                                    ` + ${place.neighbour_reviewers.length - 1} more`
                                    }
                                </p>
                            )}
                        </div>
                        )}
                      {place.open_now !== null && (
                        <span className={`open-badge ${place.open_now ? 'open-now' : 'closed'}`}>
                          {place.open_now ? '● Open Now' : '● Closed'}
                        </span>
                      )}
                      <button
                        className="btn-explore"
                        onClick={() => navigate(
                          `/place/${place.place_id}`,
                          { state: { place } }
                        )}
                      >
                        Explore Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <MapView places={places} />
            )}
          </>
        )}

        {/* Empty State */}
        {!searched && (
          <div className="empty-state">
            <div className="empty-icon">🧭</div>
            <h3 className="empty-title">Ready to explore?</h3>
            <p className="empty-sub">
              Enter a city or neighbourhood above and select a
              category to discover places matched to your vibe.
            </p>
            {!peerGroup && (
              <button
                className="btn-complete-profile"
                onClick={() => navigate('/onboarding')}
              >
                Complete Your Vibe Profile ✨
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}