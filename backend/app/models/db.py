import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '../../data/database.json')
PLACES_PATH = os.path.join(os.path.dirname(__file__), '../../data/places.json')

def init_db():
    if not os.path.exists(DB_PATH):
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        default_db = {
            "user_profiles": [],
            "feature_vectors": [],
            "peer_groups": [
                {"group_id": "g1", "group_name": "Digital Nomad"},
                {"group_id": "g2", "group_name": "Young Professional"},
                {"group_id": "g3", "group_name": "Family-First Explorer"},
                {"group_id": "g4", "group_name": "Gen-Z Trendsetter"},
                {"group_id": "g5", "group_name": "Active Senior"},
                {"group_id": "g6", "group_name": "Empty Nester"},
                {"group_id": "g7", "group_name": "Solo Traveler"},
                {"group_id": "g8", "group_name": "Student / Academic"},
                {"group_id": "g9", "group_name": "Creative Freelancer"}
            ],
            "recommendation_logs": [],
            "place_ratings": []
        }
        with open(DB_PATH, 'w') as f:
            json.dump(default_db, f, indent=2)
        print("Database initialised successfully")

def read_db():
    init_db()
    with open(DB_PATH, 'r') as f:
        return json.load(f)

def write_db(data):
    init_db()
    with open(DB_PATH, 'w') as f:
        json.dump(data, f, indent=2)

def read_places():
    if not os.path.exists(PLACES_PATH):
        return []
    with open(PLACES_PATH, 'r') as f:
        return json.load(f)