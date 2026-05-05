import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveProfile } from '../api/api';

const STEPS = [
  {
    key: 'lifestyle_phase',
    title: 'Lifestyle Phase',
    question: 'Which best describes your current lifestyle?',
    type: 'single',
    options: [
      { value: 'Digital Nomad', icon: '✈️', desc: 'Remote worker, city-hopper' },
      { value: 'Young Professional', icon: '💼', desc: 'Ambitious, efficiency-driven' },
      { value: 'Family-First Explorer', icon: '👨‍👩‍👧', desc: 'Kid-friendly, safety-conscious' },
      { value: 'Gen-Z Trendsetter', icon: '⚡', desc: 'Hyper-connected, trend-first' },
      { value: 'Active Senior', icon: '🌿', desc: 'Health-conscious, community-focused' },
      { value: 'Empty Nester', icon: '❤️', desc: 'Rediscovering freedom' },
      { value: 'Solo Traveler', icon: '🧭', desc: 'Independent adventurer' },
      { value: 'Student / Academic', icon: '📚', desc: 'Curious, budget-savvy' },
      { value: 'Creative Freelancer', icon: '🎨', desc: 'Artsy, culture-driven' }
    ]
  },
  {
    key: 'food_vibe',
    title: 'Food Vibe',
    question: 'What cuisines do you love?',
    type: 'multi',
    options: [
      { value: 'Italian', icon: '🍝' },
      { value: 'Japanese', icon: '🍣' },
      { value: 'Mexican', icon: '🌮' },
      { value: 'Vegan/Healthy', icon: '🥗' },
      { value: 'Thai', icon: '🍜' },
      { value: 'Middle Eastern', icon: '🧆' },
      { value: 'Seafood', icon: '🦞' },
      { value: 'Burgers/Pub', icon: '🍔' }
    ]
  },
  {
    key: 'atmosphere_music',
    title: 'Atmosphere Music',
    question: 'What music vibe fits your outings?',
    type: 'multi',
    options: [
      { value: 'Lo-fi / Chill', icon: '🎵' },
      { value: 'Electronic / Dance', icon: '🎧' },
      { value: 'Jazz / Blues', icon: '🎷' },
      { value: 'Rock / Indie', icon: '🎸' },
      { value: 'Classical', icon: '🎻' },
      { value: 'Pop / Top 40', icon: '🎤' }
    ]
  },
  {
    key: 'activities',
    title: 'Activities',
    question: 'What activities do you enjoy?',
    type: 'multi',
    options: [
      { value: 'Hiking / Nature', icon: '🏔️' },
      { value: 'Museums / Art', icon: '🖼️' },
      { value: 'Social / Nightlife', icon: '🎉' },
      { value: 'Shopping', icon: '🛍️' },
      { value: 'Workshops', icon: '🔧' },
      { value: 'Fitness', icon: '💪' },
      { value: 'Live Music', icon: '🎶' }
    ]
  },
  {
    key: 'budget',
    title: 'Budget',
    question: 'What is your typical spend per outing?',
    type: 'slider',
    min: 10,
    max: 200,
    step: 10,
    unit: '$'
  },
  {
    key: 'personal_bio',
    title: 'Personal Bio',
    question: 'Briefly describe your daily vibe...',
    type: 'text'
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('vibemap_user'));
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({ budget: 50 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const step = STEPS[current];
  const progress = Math.round((current / STEPS.length) * 100);

  const handleSingle = (value) => {
    setAnswers({ ...answers, [step.key]: value });
  };

  const handleMulti = (value) => {
    const current_vals = answers[step.key] || [];
    if (current_vals.includes(value)) {
      setAnswers({ ...answers, [step.key]: current_vals.filter(v => v !== value) });
    } else {
      setAnswers({ ...answers, [step.key]: [...current_vals, value] });
    }
  };

  const handleSlider = (value) => {
    setAnswers({ ...answers, [step.key]: parseInt(value) });
  };

  const handleText = (value) => {
    setAnswers({ ...answers, [step.key]: value });
  };

  const canNext = () => {
    if (step.type === 'slider') return true;
    if (step.type === 'text') return true;
    if (step.type === 'single') return !!answers[step.key];
    if (step.type === 'multi') return (answers[step.key] || []).length > 0;
    return true;
  };

  const handleNext = () => {
    if (current < STEPS.length - 1) {
      setCurrent(current + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await saveProfile({
        user_id: user.user_id,
        profile_data: answers
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.brandRow}>
          <span style={styles.brandIcon}>🧭</span>
          <span style={styles.brandName}>VibeMap</span>
        </div>

        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>

        <p style={styles.stepLabel}>Step {current + 1} of {STEPS.length} — {step.title}</p>
        <h2 style={styles.question}>{step.question}</h2>

        {step.type === 'single' && (
          <div style={styles.grid}>
            {step.options.map(opt => (
              <button
                key={opt.value}
                style={{
                  ...styles.optCard,
                  ...(answers[step.key] === opt.value ? styles.optSelected : {})
                }}
                onClick={() => handleSingle(opt.value)}
              >
                <div style={styles.optIcon}>{opt.icon}</div>
                <div style={styles.optLabel}>{opt.value}</div>
                {opt.desc && <div style={styles.optDesc}>{opt.desc}</div>}
              </button>
            ))}
          </div>
        )}

        {step.type === 'multi' && (
          <div style={styles.tagWrap}>
            {step.options.map(opt => {
              const selected = (answers[step.key] || []).includes(opt.value);
              return (
                <button
                  key={opt.value}
                  style={{ ...styles.tag, ...(selected ? styles.tagSelected : {}) }}
                  onClick={() => handleMulti(opt.value)}
                >
                  {opt.icon} {opt.value}
                </button>
              );
            })}
          </div>
        )}

        {step.type === 'slider' && (
          <div style={styles.sliderWrap}>
            <div style={styles.sliderVal}>
              {step.unit}{answers[step.key] || step.min}
            </div>
            <input
              type="range"
              min={step.min}
              max={step.max}
              step={step.step}
              value={answers[step.key] || step.min}
              onChange={e => handleSlider(e.target.value)}
              style={styles.slider}
            />
            <div style={styles.sliderLabels}>
              <span>Budget-friendly</span>
              <span>Mid-range</span>
              <span>Splurge</span>
            </div>
          </div>
        )}

        {step.type === 'text' && (
          <textarea
            style={styles.textarea}
            placeholder="Briefly describe your daily vibe..."
            value={answers[step.key] || ''}
            onChange={e => handleText(e.target.value)}
            rows={4}
          />
        )}

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.nav}>
          <button
            style={styles.btnBack}
            onClick={() => setCurrent(current - 1)}
            disabled={current === 0}
          >
            Back
          </button>
          <button
            style={{
              ...styles.btnNext,
              opacity: canNext() ? 1 : 0.4
            }}
            onClick={handleNext}
            disabled={!canNext() || loading}
          >
            {loading ? 'Saving...' : current === STEPS.length - 1 ? 'Find My Vibe ✨' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', background: '#f0f4f8',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '1rem'
  },
  card: {
    background: '#fff', borderRadius: '16px',
    padding: '2rem', width: '100%',
    maxWidth: '560px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)'
  },
  brandRow: {
    display: 'flex', alignItems: 'center',
    gap: '8px', marginBottom: '1.5rem'
  },
  brandIcon: { fontSize: '22px' },
  brandName: { fontSize: '18px', fontWeight: '600', color: '#3aada8' },
  progressBar: {
    height: '4px', background: '#e0e0e0',
    borderRadius: '4px', marginBottom: '1.5rem'
  },
  progressFill: {
    height: '4px', background: '#3aada8',
    borderRadius: '4px', transition: 'width 0.4s ease'
  },
  stepLabel: { fontSize: '12px', color: '#888', marginBottom: '6px', letterSpacing: '0.05em' },
  question: { fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '1.5rem' },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '10px', marginBottom: '1.5rem'
  },
  optCard: {
    background: '#fff', border: '1.5px solid #e0e0e0',
    borderRadius: '12px', padding: '14px 10px',
    cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s'
  },
  optSelected: { border: '2px solid #3aada8', background: '#e1f5ee' },
  optIcon: { fontSize: '24px', marginBottom: '6px' },
  optLabel: { fontSize: '13px', fontWeight: '500', color: '#1a1a1a' },
  optDesc: { fontSize: '11px', color: '#888', marginTop: '2px' },
  tagWrap: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '1.5rem' },
  tag: {
    background: '#fff', border: '1.5px solid #e0e0e0',
    borderRadius: '20px', padding: '8px 16px',
    fontSize: '13px', cursor: 'pointer', color: '#1a1a1a', transition: 'all 0.15s'
  },
  tagSelected: { background: '#e1f5ee', border: '2px solid #3aada8', color: '#0f6e56', fontWeight: '500' },
  sliderWrap: { marginBottom: '1.5rem' },
  sliderVal: { textAlign: 'center', fontSize: '20px', fontWeight: '600', color: '#3aada8', marginBottom: '10px' },
  slider: { width: '100%', accentColor: '#3aada8' },
  sliderLabels: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginTop: '6px' },
  textarea: {
    width: '100%', padding: '12px', borderRadius: '10px',
    border: '1.5px solid #e0e0e0', fontSize: '14px',
    resize: 'vertical', outline: 'none', marginBottom: '1.5rem'
  },
  error: { color: '#e24b4a', fontSize: '13px', marginBottom: '1rem' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' },
  btnBack: {
    background: 'none', border: '1.5px solid #e0e0e0',
    borderRadius: '10px', padding: '10px 20px',
    fontSize: '14px', color: '#888', cursor: 'pointer'
  },
  btnNext: {
    background: '#f5a623', border: 'none',
    borderRadius: '10px', padding: '10px 28px',
    fontSize: '14px', fontWeight: '600', color: '#412402', cursor: 'pointer'
  }
};