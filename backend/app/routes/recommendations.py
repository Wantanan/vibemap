from flask import Blueprint, request, jsonify
from app.engines.similarity_engine import find_peer_group, get_similar_users
from app.engines.places_engine import search_places, get_place_photo
from app.models.db import read_db, write_db
import uuid
from datetime import datetime

bp = Blueprint('recommendations', __name__, url_prefix='/api/recommendations')

LIFESTYLE_KEYWORDS = {
    'Digital Nomad': ['cafe', 'coworking', 'wifi', 'coffee'],
    'Young Professional': ['restaurant', 'bar', 'networking', 'gym'],
    'Family-First Explorer': ['park', 'family', 'kids', 'playground'],
    'Gen-Z Trendsetter': ['trendy', 'instagram', 'nightlife', 'shopping'],
    'Active Senior': ['park', 'garden', 'wellness', 'community'],
    'Empty Nester': ['restaurant', 'theatre', 'art', 'travel'],
    'Solo Traveler': ['cafe', 'hostel', 'adventure', 'sightseeing'],
    'Student / Academic': ['library', 'cafe', 'budget', 'campus'],
    'Creative Freelancer': ['art', 'studio', 'cafe', 'workshop']
}

def get_user_count():
    db = read_db()
    return len(db.get('feature_vectors', []))

def determine_layer(user_id):
    total_users = get_user_count()
    if total_users < 2:
        return 1
    similar_users = get_similar_users(user_id, top_n=3)
    has_similar = len([u for u in similar_users if u['similarity_score'] > 50]) > 0
    if total_users < 10 or not has_similar:
        return 2
    return 3

def get_neighbour_place_ratings(user_id, places):
    db = read_db()
    similar_users = get_similar_users(user_id, top_n=10)
    similar_ids = [u['user_id'] for u in similar_users]

    neighbour_ratings = {}
    for r in db['place_ratings']:
        if r['user_id'] in similar_ids:
            pid = r['place_id']
            if pid not in neighbour_ratings:
                neighbour_ratings[pid] = {
                    'ratings': [],
                    'reviewers': [],
                    'reviews': []
                }
            username = next(
                (u['username'] for u in db['user_profiles']
                 if u['user_id'] == r['user_id']), 'Unknown'
            )
            neighbour_ratings[pid]['ratings'].append(r['rating'])
            neighbour_ratings[pid]['reviewers'].append(username)
            if r.get('review'):
                neighbour_ratings[pid]['reviews'].append({
                    'text': r['review'],
                    'rating': r['rating'],
                    'username': username
                })

    for place in places:
        pid = place.get('place_id')
        if pid in neighbour_ratings:
            ratings = neighbour_ratings[pid]['ratings']
            avg = round(sum(ratings) / len(ratings), 1)
            reviews = neighbour_ratings[pid]['reviews']
            top_review = max(reviews, key=lambda x: x['rating']) if reviews else None

            place['neighbour_avg_rating'] = avg
            place['neighbour_reviewers'] = neighbour_ratings[pid]['reviewers']
            place['neighbour_rating_count'] = len(ratings)
            place['neighbour_top_review'] = top_review['text'] if top_review else None
        else:
            place['neighbour_avg_rating'] = None
            place['neighbour_reviewers'] = []
            place['neighbour_rating_count'] = 0
            place['neighbour_top_review'] = None

    return places

def score_places(places, user_vector=None, lifestyle=None, user_id=None):
    scored = []
    for place in places:
        base_score = (place.get('rating', 3.0) / 5.0) * 50

        keyword_score = 0
        if lifestyle and lifestyle in LIFESTYLE_KEYWORDS:
            keywords = LIFESTYLE_KEYWORDS[lifestyle]
            name_lower = place.get('name', '').lower()
            for kw in keywords:
                if kw in name_lower:
                    keyword_score += 10
        keyword_score = min(keyword_score, 20)

        neighbour_score = 0
        if place.get('neighbour_avg_rating'):
            neighbour_score = (place['neighbour_avg_rating'] / 5.0) * 30

        popularity_score = 10 if place.get('open_now') else 0

        place['vibe_match'] = min(
            round(base_score + keyword_score + neighbour_score + popularity_score),
            100
        )

        if place.get('photo_reference'):
            place['photo_url'] = get_place_photo(place['photo_reference'])
        else:
            place['photo_url'] = None
        place.pop('photo_reference', None)

        scored.append(place)

    scored.sort(key=lambda x: (
        x.get('neighbour_avg_rating') or 0,
        x.get('vibe_match', 0)
    ), reverse=True)

    return scored

@bp.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'Recommendations engine ready!'}), 200

@bp.route('/places', methods=['POST'])
def get_places():
    data = request.get_json()
    user_id = data.get('user_id')
    location = data.get('location', '')
    category = data.get('category', 'Restaurants')

    if not location:
        return jsonify({'error': 'Location is required'}), 400

    db = read_db()
    user_profile = None
    user_vector = None
    lifestyle = None

    for user in db['user_profiles']:
        if user['user_id'] == user_id:
            user_profile = user.get('profile', {})
            lifestyle = user_profile.get('lifestyle_phase', '')
            break

    for fv in db['feature_vectors']:
        if fv['user_id'] == user_id:
            user_vector = fv['feature_data']
            break

    layer = determine_layer(user_id) if user_id else 1

    places = search_places(location, category)
    if isinstance(places, tuple):
        return jsonify(places[0]), places[1]

    if user_id and layer == 3:
        places = get_neighbour_place_ratings(user_id, places)

    scored_places = score_places(places, user_vector, lifestyle, user_id)

    similar_users = []
    recommendation_mode = ''

    if layer == 1:
        recommendation_mode = 'popular'
        message = 'Showing top-rated places near you'
    elif layer == 2:
        recommendation_mode = 'lifestyle'
        message = f'Showing places popular with {lifestyle}s near you'
    elif layer == 3:
        recommendation_mode = 'peer'
        similar_users = get_similar_users(user_id, top_n=3)
        message = 'Showing places your vibe neighbours love'

    if user_id:
        group_id, _ = find_peer_group(user_id)
        log = {
            'log_id': str(uuid.uuid4()),
            'user_id': user_id,
            'group_id': group_id,
            'location': location,
            'category': category,
            'layer_used': layer,
            'recommendation_time': datetime.now().isoformat()
        }
        db['recommendation_logs'].append(log)
        write_db(db)

    return jsonify({
        'layer': layer,
        'recommendation_mode': recommendation_mode,
        'message': message,
        'places': scored_places,
        'similar_users': similar_users
    }), 200

@bp.route('/match', methods=['POST'])
def match():
    data = request.get_json()
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({'error': 'user_id required'}), 400

    db = read_db()
    user_vector = None
    for fv in db['feature_vectors']:
        if fv['user_id'] == user_id:
            user_vector = fv['feature_data']
            break

    if not user_vector:
        return jsonify({
            'error': 'No feature vector found. Complete your profile first.'
        }), 404

    group_id, match_score = find_peer_group(user_id)
    group_name = ''
    for g in db['peer_groups']:
        if g['group_id'] == group_id:
            group_name = g['group_name']
            break

    similar_users = get_similar_users(user_id, top_n=3)
    layer = determine_layer(user_id)

    return jsonify({
        'layer': layer,
        'peer_group': {
            'group_id': group_id,
            'group_name': group_name,
            'match_score': round(match_score * 100, 1)
        },
        'similar_users': similar_users
    }), 200