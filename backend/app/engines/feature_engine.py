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

VIBE_MAP = {
    'energetic': 0,
    'relaxed': 1,
    'adventurous': 2,
    'romantic': 3,
    'social': 4
}

def build_feature_vector(profile_data):
    vector = np.zeros(30)

    lifestyle = profile_data.get('lifestyle_phase', '')
    if lifestyle in LIFESTYLE_MAP:
        vector[LIFESTYLE_MAP[lifestyle]] = 1.0

    foods = profile_data.get('food_vibe', [])
    for food in foods:
        if food in FOOD_MAP:
            vector[9 + FOOD_MAP[food]] = 1.0

    music = profile_data.get('atmosphere_music', [])
    for m in music:
        if m in MUSIC_MAP:
            vector[17 + MUSIC_MAP[m]] = 1.0

    activities = profile_data.get('activities', [])
    for act in activities:
        if act in ACTIVITY_MAP:
            vector[23 + ACTIVITY_MAP[act]] = 1.0

    budget = profile_data.get('budget', 50)
    vector[29] = min(float(budget) / 200.0, 1.0)

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