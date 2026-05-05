import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '../../data/database.json')
PLACES_PATH = os.path.join(os.path.dirname(__file__), '../../data/places.json')

def read_db():
    with open(DB_PATH, 'r') as f:
        return json.load(f)

def write_db(data):
    with open(DB_PATH, 'w') as f:
        json.dump(data, f, indent=2)

def read_places():
    with open(PLACES_PATH, 'r') as f:
        return json.load(f)