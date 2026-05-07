# VibeMap 🧭
> Discover your city, personalized for your vibe.

VibeMap is a lifestyle-based place recommendation web application that matches users to locations based on their personality, preferences, and lifestyle phase. It uses machine learning similarity matching to connect users with similar vibes and recommend places they are likely to enjoy.

---

## 📌 Project Overview

**Final Year Project (FYP)**
**Type:** Full-Stack Web Application
**Domain:** Recommender Systems / Lifestyle Technology

### The Problem
Traditional search engines return the same results for everyone. VibeMap solves this by personalising place discovery based on *who you are*, not just *what you search for*.

### The Solution
VibeMap builds a **Lifestyle DNA profile** for each user through an onboarding quiz, converts it into a **feature vector**, and uses **cosine similarity** and **KMeans clustering** to match users with similar lifestyles and recommend places they will love.

---

## 🏗️ System Architecture
User fills Onboarding Quiz
↓
Feature Vector generated (NumPy)
↓
Stored in database (JSON)
↓
Similarity Engine (Scikit-learn cosine similarity)
↓
Peer Group assigned (KMeans clustering)
↓
Google Places API fetches real places
↓
Recommendation Engine scores & ranks places
↓
Results displayed with Vibe Match %

---

## 🧠 Machine Learning Components

### Feature Vector Engine
Each user's quiz answers are converted into a 30-dimensional numerical vector:
- Dimensions 0-8: Lifestyle phase (one-hot encoded)
- Dimensions 9-16: Food preferences (multi-hot encoded)
- Dimensions 17-22: Music atmosphere (multi-hot encoded)
- Dimensions 23-29: Activities (multi-hot encoded)
- Dimension 29: Budget (normalised 0-1)

### Similarity Matching
Uses **cosine similarity** from Scikit-learn to compare user feature vectors:
vibemap/
├── backend/
│   ├── app/
│   │   ├── init.py          # Flask app factory
│   │   ├── engines/
│   │   │   ├── feature_engine.py    # Feature vector generation
│   │   │   ├── similarity_engine.py # Cosine similarity & KMeans
│   │   │   └── places_engine.py     # Google Places API integration
│   │   ├── models/
│   │   │   └── db.py            # Database read/write helpers
│   │   └── routes/
│   │       ├── auth.py          # Register & login endpoints
│   │       ├── profile.py       # Profile save & get endpoints
│   │       └── recommendations.py # Places & match endpoints
│   ├── data/
│   │   └── database.json        # User profiles, vectors, logs
│   ├── requirements.txt         # Python dependencies
│   └── run.py                   # Flask entry point
├── frontend/
│   └── src/
│       ├── api/
│       │   └── api.js           # Axios API calls
│       ├── components/
│       │   ├── MapView.js       # Google Maps component
│       │   └── MapView.css
│       └── pages/
│           ├── Login.js         # Login page
│           ├── Login.css
│           ├── Register.js      # Registration page
│           ├── Register.css
│           ├── Onboarding.js    # Lifestyle quiz
│           ├── Onboarding.css
│           ├── Dashboard.js     # Main discovery page
│           ├── Dashboard.css
│           ├── Profile.js       # Vibe profile editor
│           └── Profile.css
├── .gitignore
└── README.md

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- Google Places API key
- Google Maps API key

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/vibemap.git
cd vibemap

# 2. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # Mac/Linux

# 3. Install Python dependencies
pip install -r backend/requirements.txt

# 4. Add your Google API key
echo "GOOGLE_PLACES_API_KEY=your_key_here" > backend/.env

# 5. Run the Flask server
cd backend
python run.py
```

Backend runs at: `http://127.0.0.1:5000`

### Frontend Setup

```bash
# In a new terminal
cd vibemap/frontend

# 1. Install dependencies
npm install

# 2. Add your Google Maps API key
echo "REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here" > .env

# 3. Start the React app
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/profile/save` | Save vibe profile & generate feature vector |
| GET | `/api/profile/get/:user_id` | Get user profile |
| POST | `/api/recommendations/places` | Get place recommendations |
| POST | `/api/recommendations/match` | Get peer group & similar users |

---

## 🎯 Key Features

- **Lifestyle DNA Profiling** — 6-step onboarding quiz capturing lifestyle, food, music, activities, budget and bio
- **Feature Vector Generation** — Automatic conversion of quiz answers into 30-dimensional numerical vectors
- **Cosine Similarity Matching** — ML-powered user-to-user similarity scoring
- **KMeans Peer Grouping** — Automatic clustering of users into lifestyle groups
- **3-Layer Cold Start System** — Graceful degradation for new apps with few users
- **Google Places Integration** — Real-time place discovery based on user location
- **Vibe Match Score** — Personalised % match score for each recommended place
- **Vibe Neighbors** — See other users with similar lifestyles
- **Interactive Map View** — Toggle between list and map view of recommendations
- **Profile Management** — Update lifestyle preferences anytime

---

## 📊 Database Schema

### USER_PROFILES
| Field | Type | Description |
|-------|------|-------------|
| user_id | string (PK) | Unique user identifier |
| username | string | Display name |
| password | string | User password |
| registration_date | datetime | Account creation date |
| profile | object | Lifestyle profile data |

### Feature Vector Engine
Each user's quiz answers are converted into a 36-dimensional numerical vector:
- Dimensions 0-8: Lifestyle phase (one-hot encoded)
- Dimensions 9-16: Food preferences (multi-hot encoded)
- Dimensions 17-22: Music atmosphere (multi-hot encoded)
- Dimensions 23-29: Activities (multi-hot encoded)
- Dimension 30: Budget (normalised 0-1)
- Dimensions 31-36: Age range (weighted 1.5x for stronger demographic matching)

### PEER_GROUPS
| Field | Type | Description |
|-------|------|-------------|
| group_id | string (PK) | Unique group identifier |
| group_name | string | Lifestyle group name |

### RECOMMENDATION_LOGS
| Field | Type | Description |
|-------|------|-------------|
| log_id | string (PK) | Unique log identifier |
| user_id | string (FK) | Reference to user |
| group_id | string (FK) | Reference to peer group |
| location | string | Searched location |
| category | string | Place category |
| layer_used | integer | Cold start layer (1/2/3) |
| recommendation_time | datetime | Timestamp |

---

## 🔮 Future Improvements

- PostgreSQL database for production scalability
- JWT authentication for secure sessions
- User ratings and reviews for visited places
- Saved/favourited places feature
- Push notifications for vibe-matched events
- Mobile app version (React Native)
- Advanced NLP analysis of personal bio
- Collaborative filtering with explicit feedback

---

## 👨‍💻 Author

**Wantananyam Wongwarachai**
Final Year Project — Computer Science
Year 2026

---

## 📄 License

This project is developed as an academic Final Year Project.