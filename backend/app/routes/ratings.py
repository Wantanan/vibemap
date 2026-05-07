from flask import Blueprint, request, jsonify
from app.models.db import read_db, write_db
from app.engines.similarity_engine import get_similar_users
import uuid
from datetime import datetime

bp = Blueprint('ratings', __name__, url_prefix='/api/ratings')

@bp.route('/submit', methods=['POST'])
def submit_rating():
    data = request.get_json()
    user_id = data.get('user_id')
    place_id = data.get('place_id')
    place_name = data.get('place_name')
    place_address = data.get('place_address')
    place_category = data.get('place_category')
    rating = data.get('rating')
    review = data.get('review', '')

    if not all([user_id, place_id, place_name, rating]):
        return jsonify({'error': 'Missing required fields'}), 400

    if not 1 <= int(rating) <= 5:
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400

    db = read_db()

    existing = None
    for r in db['place_ratings']:
        if r['user_id'] == user_id and r['place_id'] == place_id:
            existing = r
            break

    if existing:
        existing['rating'] = int(rating)
        existing['review'] = review
        existing['updated_at'] = datetime.now().isoformat()
        message = 'Rating updated successfully'
    else:
        new_rating = {
            'rating_id': str(uuid.uuid4()),
            'user_id': user_id,
            'place_id': place_id,
            'place_name': place_name,
            'place_address': place_address,
            'place_category': place_category,
            'rating': int(rating),
            'review': review,
            'created_at': datetime.now().isoformat()
        }
        db['place_ratings'].append(new_rating)
        message = 'Rating submitted successfully'

    write_db(db)
    return jsonify({'message': message}), 200

@bp.route('/place/<place_id>', methods=['GET'])
def get_place_ratings(place_id):
    db = read_db()
    ratings = []

    for r in db['place_ratings']:
        if r['place_id'] == place_id:
            username = 'Unknown'
            lifestyle = ''
            for user in db['user_profiles']:
                if user['user_id'] == r['user_id']:
                    username = user.get('username', 'Unknown')
                    lifestyle = user.get('profile', {}).get('lifestyle_phase', '')
                    break
            ratings.append({
                **r,
                'username': username,
                'lifestyle': lifestyle
            })

    avg_rating = 0
    if ratings:
        avg_rating = round(
            sum(r['rating'] for r in ratings) / len(ratings), 1
        )

    return jsonify({
        'ratings': ratings,
        'avg_rating': avg_rating,
        'total_ratings': len(ratings)
    }), 200

@bp.route('/neighbour-ratings', methods=['POST'])
def get_neighbour_ratings():
    data = request.get_json()
    user_id = data.get('user_id')
    place_id = data.get('place_id')

    if not user_id:
        return jsonify({'neighbour_ratings': []}), 200

    db = read_db()
    similar_users = get_similar_users(user_id, top_n=10)
    similar_ids = [u['user_id'] for u in similar_users]

    neighbour_ratings = []
    for r in db['place_ratings']:
        if r['place_id'] == place_id and r['user_id'] in similar_ids:
            username = 'Unknown'
            lifestyle = ''
            for user in db['user_profiles']:
                if user['user_id'] == r['user_id']:
                    username = user.get('username', 'Unknown')
                    lifestyle = user.get('profile', {}).get('lifestyle_phase', '')
                    break
            score = next(
                (u['similarity_score'] for u in similar_users
                 if u['user_id'] == r['user_id']), 0
            )
            neighbour_ratings.append({
                **r,
                'username': username,
                'lifestyle': lifestyle,
                'similarity_score': score
            })

    neighbour_ratings.sort(key=lambda x: x['similarity_score'], reverse=True)
    return jsonify({'neighbour_ratings': neighbour_ratings}), 200

@bp.route('/user/<user_id>', methods=['GET'])
def get_user_ratings(user_id):
    db = read_db()
    ratings = [r for r in db['place_ratings'] if r['user_id'] == user_id]
    return jsonify({'ratings': ratings}), 200