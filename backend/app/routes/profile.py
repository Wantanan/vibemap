from flask import Blueprint, request, jsonify
from app.engines.feature_engine import save_feature_vector
from app.models.db import read_db, write_db

bp = Blueprint('profile', __name__, url_prefix='/api/profile')

@bp.route('/save', methods=['POST'])
def save_profile():
    data = request.get_json()
    user_id = data.get('user_id')
    profile_data = data.get('profile_data')

    if not user_id or not profile_data:
        return jsonify({'error': 'user_id and profile_data required'}), 400

    db = read_db()
    for user in db['user_profiles']:
        if user['user_id'] == user_id:
            user['profile'] = profile_data
            break

    write_db(db)

    vector = save_feature_vector(user_id, profile_data)

    return jsonify({
        'message': 'Profile saved and feature vector generated',
        'vector_length': len(vector)
    }), 200

@bp.route('/get/<user_id>', methods=['GET'])
def get_profile(user_id):
    db = read_db()
    for user in db['user_profiles']:
        if user['user_id'] == user_id:
            return jsonify({'profile': user.get('profile', {})}), 200
    return jsonify({'error': 'User not found'}), 404