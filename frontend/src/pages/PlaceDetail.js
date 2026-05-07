import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { submitRating, getPlaceRatings, getNeighbourRatings } from '../api/api';
import './PlaceDetail.css';

export default function PlaceDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('vibemap_user'));
  const place = location.state?.place;

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [allRatings, setAllRatings] = useState([]);
  const [neighbourRatings, setNeighbourRatings] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!place) { navigate('/dashboard'); return; }
    loadRatings();
  }, []);

  const loadRatings = async () => {
    setLoading(true);
    try {
      const [ratingsRes, neighbourRes] = await Promise.all([
        getPlaceRatings(place.place_id),
        getNeighbourRatings({ user_id: user?.user_id, place_id: place.place_id })
      ]);
      setAllRatings(ratingsRes.data.ratings || []);
      setAvgRating(ratingsRes.data.avg_rating || 0);
      setNeighbourRatings(neighbourRes.data.neighbour_ratings || []);

      const userRating = ratingsRes.data.ratings?.find(r => r.user_id === user?.user_id);
      if (userRating) {
        setRating(userRating.rating);
        setReview(userRating.review || '');
      }
    } catch (err) {
      console.log('Error loading ratings');
    }
    setLoading(false);
  };

  const handleSubmitRating = async () => {
    if (!rating) return;
    setSubmitting(true);
    setSuccess('');
    try {
      await submitRating({
        user_id: user.user_id,
        place_id: place.place_id,
        place_name: place.name,
        place_address: place.address,
        place_category: place.category,
        rating,
        review
      });
      setSuccess('Your rating has been saved! ✨ It will help your vibe neighbours discover this place.');
      await loadRatings();
    } catch (err) {
      console.log('Error submitting rating');
    }
    setSubmitting(false);
  };

  const renderStars = (count) => '⭐'.repeat(count) + '☆'.repeat(5 - count);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const neighbourIds = neighbourRatings.map(r => r.user_id);

  const combinedRatings = [
    ...neighbourRatings,
    ...allRatings.filter(r => !neighbourIds.includes(r.user_id))
  ];

  if (!place) return null;

  if (loading) {
    return (
      <div className="detail-loading">
        <p>Loading place details...</p>
      </div>
    );
  }

  return (
    <div className="detail-page">

      <nav className="detail-navbar">
        <div className="navbar-brand">🧭 VibeMap</div>
        <button className="btn-nav" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </nav>

      <div className="detail-content">

        {/* Hero Card */}
        <div className="detail-hero">
          {place.photo_url ? (
            <img src={place.photo_url} alt={place.name} className="detail-hero-img" />
          ) : (
            <div className="detail-hero-placeholder">📍</div>
          )}

          <div className="detail-hero-body">
            <div className="detail-top-row">
              <div>
                <h1 className="detail-name">{place.name}</h1>
                <p className="detail-address">📍 {place.address}</p>
              </div>
              {place.vibe_match && (
                <span className="detail-vibe-match">✨ Vibe Match {place.vibe_match}%</span>
              )}
            </div>

            <div className="detail-badges">
              <span className="detail-category-badge">{place.category}</span>
              {place.open_now !== null && (
                <span className={`detail-open-badge ${place.open_now ? 'detail-open' : 'detail-closed'}`}>
                  {place.open_now ? '● Open Now' : '● Closed'}
                </span>
              )}
            </div>

            <div className="detail-rating-row">
              {place.rating > 0 && (
                <span className="detail-google-rating">⭐ {place.rating} Google Rating</span>
              )}
              {avgRating > 0 && (
                <span className="detail-neighbour-rating">
                  ✨ {avgRating} VibeMap Rating ({allRatings.length} reviews)
                </span>
              )}
              {place.neighbour_avg_rating && (
                <span className="detail-neighbour-rating">
                  👥 {place.neighbour_avg_rating} Neighbour Rating
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Rate This Place */}
        <div className="rating-section">
          <h2 className="rating-section-title">
            {allRatings.find(r => r.user_id === user?.user_id)
              ? '✏️ Update Your Rating'
              : '⭐ Rate This Place'}
          </h2>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '1rem' }}>
            Your rating helps your vibe neighbours discover great places!
          </p>

          <div className="star-row">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                className={`star-btn ${(hovered || rating) >= star ? 'active' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
              >
                {(hovered || rating) >= star ? '⭐' : '☆'}
              </button>
            ))}
            {rating > 0 && (
              <span style={{ fontSize: '14px', color: '#888', alignSelf: 'center', marginLeft: '8px' }}>
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </span>
            )}
          </div>

          <textarea
            className="review-textarea"
            placeholder="Share your experience... (optional)"
            value={review}
            onChange={e => setReview(e.target.value)}
            rows={3}
          />

          <button
            className="btn-submit-rating"
            onClick={handleSubmitRating}
            disabled={!rating || submitting}
          >
            {submitting ? 'Saving...' : '💾 Save Rating'}
          </button>

          {success && <p className="rating-success">{success}</p>}
        </div>

        {/* Reviews */}
        <div className="reviews-section">
          <h2 className="reviews-title">
            👥 What Vibers Say
            {combinedRatings.length > 0 && (
              <span style={{ fontSize: '14px', fontWeight: '400', color: '#888', marginLeft: '8px' }}>
                ({combinedRatings.length} review{combinedRatings.length !== 1 ? 's' : ''})
              </span>
            )}
          </h2>

          {combinedRatings.length === 0 ? (
            <div className="no-reviews">
              <p>🌟 Be the first to review this place!</p>
              <p style={{ marginTop: '8px', fontSize: '12px' }}>
                Your review will help others with similar vibes discover it.
              </p>
            </div>
          ) : (
            combinedRatings.map((r, i) => {
              const isNeighbour = neighbourIds.includes(r.user_id);
              const isMe = r.user_id === user?.user_id;
              return (
                <div key={i} className={`review-card ${isNeighbour ? 'neighbour' : ''}`}>
                  <div className="review-header">
                    <div className="review-user">
                      <div className={`review-avatar ${isNeighbour ? 'neighbour' : ''}`}>
                        {r.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="review-username">
                          {isMe ? 'You' : r.username}
                          {isNeighbour && !isMe && (
                            <span className="neighbour-badge" style={{ marginLeft: '8px' }}>
                              Similar Vibe
                            </span>
                          )}
                        </div>
                        {r.lifestyle && (
                          <div className="review-lifestyle">{r.lifestyle}</div>
                        )}
                      </div>
                    </div>
                    <div className="review-stars">{renderStars(r.rating)}</div>
                  </div>

                  {r.review && <p className="review-text">"{r.review}"</p>}
                  <p className="review-date">{formatDate(r.created_at || r.updated_at)}</p>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}