import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveProfile } from '../api/api';
import './Onboarding.css';

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
    min: 10, max: 200, step: 10, unit: '$'
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

  const handleSingle = (value) => setAnswers({ ...answers, [step.key]: value });

  const handleMulti = (value) => {
    const vals = answers[step.key] || [];
    setAnswers({
      ...answers,
      [step.key]: vals.includes(value)
        ? vals.filter(v => v !== value)
        : [...vals, value]
    });
  };

  const canNext = () => {
    if (step.type === 'slider' || step.type === 'text') return true;
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
      await saveProfile({ user_id: user.user_id, profile_data: answers });
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">

        <div className="onboarding-brand">
          <span className="onboarding-brand-icon">🧭</span>
          <span className="onboarding-brand-name">VibeMap</span>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <p className="step-label">Step {current + 1} of {STEPS.length} — {step.title}</p>
        <h2 className="step-question">{step.question}</h2>

        {step.type === 'single' && (
          <div className="options-grid">
            {step.options.map(opt => (
              <button
                key={opt.value}
                className={`opt-card ${answers[step.key] === opt.value ? 'selected' : ''}`}
                onClick={() => handleSingle(opt.value)}
              >
                <div className="opt-icon">{opt.icon}</div>
                <div className="opt-label">{opt.value}</div>
                {opt.desc && <div className="opt-desc">{opt.desc}</div>}
              </button>
            ))}
          </div>
        )}

        {step.type === 'multi' && (
          <div className="tags-wrap">
            {step.options.map(opt => (
              <button
                key={opt.value}
                className={`tag-btn ${(answers[step.key] || []).includes(opt.value) ? 'selected' : ''}`}
                onClick={() => handleMulti(opt.value)}
              >
                {opt.icon} {opt.value}
              </button>
            ))}
          </div>
        )}

        {step.type === 'slider' && (
          <div className="slider-wrap">
            <div className="slider-val">
              ${answers[step.key] || step.min}
            </div>
            <input
              type="range"
              className="slider-input"
              min={step.min} max={step.max} step={step.step}
              value={answers[step.key] || step.min}
              onChange={e => setAnswers({ ...answers, [step.key]: parseInt(e.target.value) })}
            />
            <div className="slider-labels">
              <span>Budget-friendly</span>
              <span>Mid-range</span>
              <span>Splurge</span>
            </div>
          </div>
        )}

        {step.type === 'text' && (
          <textarea
            className="bio-textarea"
            placeholder="Briefly describe your daily vibe..."
            value={answers[step.key] || ''}
            onChange={e => setAnswers({ ...answers, [step.key]: e.target.value })}
            rows={4}
          />
        )}

        {error && <p className="onboarding-error">{error}</p>}

        <div className="onboarding-nav">
          <button
            className="btn-back"
            onClick={() => setCurrent(current - 1)}
            disabled={current === 0}
          >
            Back
          </button>
          <button
            className="btn-next"
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