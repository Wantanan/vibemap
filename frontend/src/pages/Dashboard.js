import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlaces, getMatch } from '../api/api';

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
      const res = await getPlaces({
        user_id: user.user_id,
        location,
        category
      });
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
    <div style={styles.page}>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.brand}>🧭 VibeMap</div>
        <div style={styles.navRight}>
          <span style={styles.greeting}>Hey, {user?.username}</span>
          {peerGroup && (
            <span style={styles.persona}>{peerGroup.group_name}</span>
          )}
          <button style={styles.btnProfile} onClick={() => navigate('/profile')}>
            Profile
          </button>
          <button style={styles.btnLogout} onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Your City, <span style={styles.heroVibe}>Your Vibe</span>
        </h1>
        <p style={styles.heroSub}>
          Personalized local discovery for <strong>{user?.username}</strong>
        </p>

        {/* Search Bar */}
        <div style={styles.searchRow}>
          <input
            style={styles.searchInput}
            placeholder="Search activities, restaurants, parks..."
            value={location}
            onChange={e => setLocation(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button style={styles.btnFind} onClick={handleSearch}>
            {loading ? 'Searching...' : 'Find Lens'}
          </button>
        </div>
      </div>

      <div style={styles.content}>

        {/* Category Tabs */}
        <div style={styles.tabs}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.label}
              style={{
                ...styles.tab,
                ...(category === cat.label ? styles.tabActive : {})
              }}
              onClick={() => setCategory(cat.label)}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Layer Badge */}
        {layer && getLayerBadge() && (
          <div style={{ ...styles.layerBadge, background: getLayerBadge().color }}>
            ✨ {getLayerBadge().label}
            {message && <span style={styles.layerMsg}> — {message}</span>}
          </div>
        )}

        {/* Places Grid */}
        {searched && (
          <>
            <h2 style={styles.sectionTitle}>
              Discover {category}
            </h2>
            {loading ? (
              <div style={styles.loadingWrap}>
                <p style={styles.loadingText}>Finding the best places for your vibe...</p>
              </div>
            ) : places.length === 0 ? (
              <div style={styles.emptyWrap}>
                <p>No places found. Try a different location or category.</p>
              </div>
            ) : (
              <div style={styles.placesGrid}>
                {places.map(place => (
                  <div key={place.place_id} style={styles.placeCard}>
                    {place.photo_url ? (
                      <img
                        src={place.photo_url}
                        alt={place.name}
                        style={styles.placeImg}
                      />
                    ) : (
                      <div style={styles.placeImgPlaceholder}>
                        <span style={{ fontSize: '40px' }}>
                          {CATEGORIES.find(c => c.label === category)?.icon || '📍'}
                        </span>
                      </div>
                    )}

                    <div style={styles.placeBody}>
                      <div style={styles.placeTopRow}>
                        <span style={styles.placeCategoryBadge}>{place.category}</span>
                        {place.vibe_match && (
                          <span style={styles.vibeMatch}>
                            ✨ VIBE MATCH {place.vibe_match}%
                          </span>
                        )}
                      </div>

                      <div style={styles.placeTitleRow}>
                        <h3 style={styles.placeName}>{place.name}</h3>
                        {place.rating > 0 && (
                          <span style={styles.rating}>⭐ {place.rating}</span>
                        )}
                      </div>

                      <p style={styles.placeAddress}>📍 {place.address}</p>

                      {place.open_now !== null && (
                        <span style={{
                          ...styles.openBadge,
                          background: place.open_now ? '#e1f5ee' : '#fce8e8',
                          color: place.open_now ? '#0f6e56' : '#a32d2d'
                        }}>
                          {place.open_now ? '● Open Now' : '● Closed'}
                        </span>
                      )}

                      <button style={styles.btnExplore}>
                        Explore Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Vibe Neighbors */}
        {similarUsers.length > 0 && (
          <div style={styles.neighborsSection}>
            <div style={styles.neighborHeader}>
              <div>
                <h2 style={styles.sectionTitle}>👥 Vibe Neighbors</h2>
                <p style={styles.neighborSub}>People who share your {peerGroup?.group_name} lifestyle</p>
              </div>
            </div>
            <div style={styles.neighborGrid}>
              {similarUsers.map((u, i) => (
                <div key={i} style={styles.neighborCard}>
                  <div style={styles.neighborAvatar}>
                    {u.username?.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.neighborName}>{u.username}</div>
                  <div style={styles.neighborLifestyle}>{u.lifestyle}</div>
                  <div style={styles.neighborScore}>
                    ✨ {u.similarity_score}% match
                  </div>
                  <span style={styles.similarVibeBadge}>Similar Vibe</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state — no search yet */}
        {!searched && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🧭</div>
            <h3 style={styles.emptyTitle}>Ready to explore?</h3>
            <p style={styles.emptySub}>
              Enter a city or neighbourhood above and select a category to discover places matched to your vibe.
            </p>
            {!peerGroup && (
              <button
                style={styles.btnCompleteProfile}
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

const styles = {
  page: { minHeight: '100vh', background: '#f0f4f8' },
  navbar: {
    background: '#fff', padding: '1rem 2rem',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  brand: { fontSize: '20px', fontWeight: '700', color: '#3aada8' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  greeting: { fontSize: '14px', color: '#666' },
  persona: {
    background: '#e1f5ee', color: '#0f6e56',
    padding: '4px 12px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '500'
  },
  btnProfile: {
    background: 'none', border: '1.5px solid #3aada8',
    color: '#3aada8', padding: '6px 16px',
    borderRadius: '8px', fontSize: '13px', cursor: 'pointer'
  },
  btnLogout: {
    background: 'none', border: '1.5px solid #e0e0e0',
    color: '#888', padding: '6px 16px',
    borderRadius: '8px', fontSize: '13px', cursor: 'pointer'
  },
  hero: {
    background: 'linear-gradient(135deg, #3aada8 0%, #0f6e56 100%)',
    padding: '3rem 2rem', textAlign: 'center', color: '#fff'
  },
  heroTitle: { fontSize: '36px', fontWeight: '700', marginBottom: '8px' },
  heroVibe: { color: '#f5a623', fontStyle: 'italic' },
  heroSub: { fontSize: '16px', opacity: 0.9, marginBottom: '2rem' },
  searchRow: {
    display: 'flex', gap: '10px', maxWidth: '600px',
    margin: '0 auto', flexWrap: 'wrap'
  },
  searchInput: {
    flex: 1, padding: '12px 16px', borderRadius: '10px',
    border: 'none', fontSize: '14px', outline: 'none',
    minWidth: '200px'
  },
  btnFind: {
    background: '#f5a623', color: '#412402',
    border: 'none', padding: '12px 24px',
    borderRadius: '10px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer'
  },
  content: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' },
  tabs: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' },
  tab: {
    background: '#fff', border: '1.5px solid #e0e0e0',
    borderRadius: '20px', padding: '8px 16px',
    fontSize: '13px', cursor: 'pointer', color: '#555',
    transition: 'all 0.15s'
  },
  tabActive: {
    background: '#3aada8', color: '#fff',
    border: '1.5px solid #3aada8', fontWeight: '500'
  },
  layerBadge: {
    color: '#fff', padding: '8px 16px',
    borderRadius: '8px', fontSize: '13px',
    fontWeight: '500', marginBottom: '1.5rem',
    display: 'inline-block'
  },
  layerMsg: { opacity: 0.85 },
  sectionTitle: {
    fontSize: '22px', fontWeight: '600',
    color: '#3aada8', marginBottom: '1rem'
  },
  loadingWrap: { textAlign: 'center', padding: '3rem' },
  loadingText: { color: '#888', fontSize: '15px' },
  emptyWrap: { textAlign: 'center', padding: '2rem', color: '#888' },
  placesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem', marginBottom: '2rem'
  },
  placeCard: {
    background: '#fff', borderRadius: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    overflow: 'hidden'
  },
  placeImg: { width: '100%', height: '180px', objectFit: 'cover' },
  placeImgPlaceholder: {
    width: '100%', height: '180px',
    background: '#f0f4f8', display: 'flex',
    alignItems: 'center', justifyContent: 'center'
  },
  placeBody: { padding: '1rem' },
  placeTopRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '8px'
  },
  placeCategoryBadge: {
    background: '#e1f5ee', color: '#0f6e56',
    padding: '3px 10px', borderRadius: '12px',
    fontSize: '11px', fontWeight: '500'
  },
  vibeMatch: {
    background: '#0f6e56', color: '#fff',
    padding: '3px 10px', borderRadius: '12px',
    fontSize: '11px', fontWeight: '600'
  },
  placeTitleRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '4px'
  },
  placeName: { fontSize: '16px', fontWeight: '600', color: '#3aada8' },
  rating: { fontSize: '13px', fontWeight: '500', color: '#f5a623' },
  placeAddress: { fontSize: '13px', color: '#888', marginBottom: '8px' },
  openBadge: {
    display: 'inline-block', padding: '3px 10px',
    borderRadius: '12px', fontSize: '11px',
    fontWeight: '500', marginBottom: '10px'
  },
  btnExplore: {
    width: '100%', padding: '10px',
    background: '#3aada8', color: '#fff',
    border: 'none', borderRadius: '10px',
    fontSize: '13px', fontWeight: '500', cursor: 'pointer',
    marginTop: '8px'
  },
  neighborsSection: {
    background: '#fff', borderRadius: '16px',
    padding: '1.5rem', marginTop: '2rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
  },
  neighborHeader: { marginBottom: '1rem' },
  neighborSub: { fontSize: '13px', color: '#888' },
  neighborGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '1rem'
  },
  neighborCard: {
    background: '#f0f4f8', borderRadius: '12px',
    padding: '1rem', textAlign: 'center'
  },
  neighborAvatar: {
    width: '48px', height: '48px', borderRadius: '50%',
    background: '#3aada8', color: '#fff',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '20px',
    fontWeight: '600', margin: '0 auto 8px'
  },
  neighborName: { fontSize: '14px', fontWeight: '500', color: '#1a1a1a' },
  neighborLifestyle: { fontSize: '12px', color: '#888', marginTop: '2px' },
  neighborScore: { fontSize: '13px', color: '#0f6e56', fontWeight: '500', marginTop: '6px' },
  similarVibeBadge: {
    display: 'inline-block', background: '#e1f5ee',
    color: '#0f6e56', padding: '3px 10px',
    borderRadius: '12px', fontSize: '11px',
    fontWeight: '500', marginTop: '6px'
  },
  emptyState: {
    textAlign: 'center', padding: '4rem 2rem',
    background: '#fff', borderRadius: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
  },
  emptyIcon: { fontSize: '48px', marginBottom: '1rem' },
  emptyTitle: { fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' },
  emptySub: { fontSize: '14px', color: '#888', marginBottom: '1.5rem' },
  btnCompleteProfile: {
    background: '#f5a623', color: '#412402',
    border: 'none', padding: '12px 24px',
    borderRadius: '10px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer'
  }
};