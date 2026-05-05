from flask import Blueprint, request, jsonify
from app.models.db import read_db, write_db
import uuid
from datetime import datetime

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    db = read_db()

    for user in db['user_profiles']:
        if user['username'] == username:
            return jsonify({'error': 'Username already exists'}), 400

    new_user = {
        'user_id': str(uuid.uuid4()),
        'username': username,
        'password': password,
        'registration_date': datetime.now().isoformat()
    }

    db['user_profiles'].append(new_user)
    write_db(db)

    return jsonify({'message': 'User registered successfully', 'user': {
        'user_id': new_user['user_id'],
        'username': new_user['username']
    }}), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    db = read_db()

    for user in db['user_profiles']:
        if user['username'] == username and user['password'] == password:
            return jsonify({'message': 'Login successful', 'user': {
                'user_id': user['user_id'],
                'username': user['username']
            }}), 200

    return jsonify({'error': 'Invalid username or password'}), 401