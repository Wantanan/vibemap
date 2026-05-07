import numpy as np
from app.models.db import read_db, write_db
import uuid
from datetime import datetime

LIFESTYLE_MAP = {
    'Digital Nomad': 0,
    'Young Professional': 1,
    'Family-First Explorer': 2,
    'Gen-Z Trendsetter': 3,
    'Active Senior': 4,
    'Empty Nester': 5,
    'Solo Traveler': 6,
    'Student / Academic': 7,
    'Creative Freelancer': 8
}

FOOD_MAP = {
    'Italian': 0,
    'Japanese': 1,
    'Mexican': 2,
    'Vegan/Healthy': 3,
    'Thai': 4,
    'Middle Eastern': 5,
    'Seafood': 6,
    'Burgers/Pub': 7
}

MUSIC_MAP = {
    'Lo-fi / Chill': 0,
    'Electronic / Dance': 1,
    'Jazz / Blues': 2,
    'Rock / Indie': 3,
    'Classical': 4,
    'Pop / Top 40': 5
}

ACTIVITY_MAP = {
    'Hiking / Nature': 0,
    'Museums / Art': 1,
    'Social / Nightlife': 2,
    'Shopping': 3,
    'Workshops': 4,
    'Fitness': 5,
    'Live Music': 6
}

AGE_MAP = {
    '18-24': 0,
    '25-34': 1,
    '35-44': 2,
    '45-54': 3,
    '55-64': 4,
    '65+': 5
}

def build_feature_vector(profile_data):
    vector = np.zeros(37)

    # Lifestyle (0-8)
    lifestyle = profile_data.get('lifestyle_phase', '')
    if lifestyle in LIFESTYLE_MAP:
        vector[LIFESTYLE_MAP[lifestyle]] = 1.0

    # Food (9-16)
    foods = profile_data.get('food_vibe', [])
    for food in foods:
        if food in FOOD_MAP:
            vector[9 + FOOD_MAP[food]] = 1.0

    # Music (17-22)
    music = profile_data.get('atmosphere_music', [])
    for m in music:
        if m in MUSIC_MAP:
            vector[17 + MUSIC_MAP[m]] = 1.0

    # Activities (23-29)
    activities = profile_data.get('activities', [])
    for act in activities:
        if act in ACTIVITY_MAP:
            vector[23 + ACTIVITY_MAP[act]] = 1.0

    # Budget (30) - normalised
    budget = profile_data.get('budget', 50)
    vector[30] = min(float(budget) / 200.0, 1.0)

    # Age range (31-36) - weighted higher for better matching
    age_range = profile_data.get('age_range', '')
    if age_range in AGE_MAP:
        idx = 31 + AGE_MAP[age_range]
        if idx < len(vector):
            vector[idx] = 1.5

    return vector.tolist()

def save_feature_vector(user_id, profile_data):
    vector = build_feature_vector(profile_data)

    db = read_db()

    existing = None
    for fv in db['feature_vectors']:
        if fv['user_id'] == user_id:
            existing = fv
            break

    if existing:
        existing['feature_data'] = vector
        existing['updated_at'] = datetime.now().isoformat()
    else:
        new_vector = {
            'vector_id': str(uuid.uuid4()),
            'user_id': user_id,
            'feature_data': vector,
            'created_at': datetime.now().isoformat()
        }
        db['feature_vectors'].append(new_vector)

    write_db(db)
    return vector