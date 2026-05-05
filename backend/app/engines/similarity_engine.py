import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
from app.models.db import read_db, write_db

LIFESTYLE_TO_GROUP = {
    'Digital Nomad': 'g1',
    'Young Professional': 'g2',
    'Family-First Explorer': 'g3',
    'Gen-Z Trendsetter': 'g4',
    'Active Senior': 'g5',
    'Empty Nester': 'g6',
    'Solo Traveler': 'g7',
    'Student / Academic': 'g8',
    'Creative Freelancer': 'g9'
}

def find_peer_group(user_id):
    db = read_db()

    user_profile = None
    for user in db['user_profiles']:
        if user['user_id'] == user_id:
            user_profile = user.get('profile', {})
            break

    if not user_profile:
        return None, 0.0

    lifestyle = user_profile.get('lifestyle_phase', '')
    group_id = LIFESTYLE_TO_GROUP.get(lifestyle, 'g1')

    return group_id, 1.0

def get_similar_users(user_id, top_n=3):
    db = read_db()
    vectors = db.get('feature_vectors', [])

    if len(vectors) < 2:
        return []

    user_vector = None
    for fv in vectors:
        if fv['user_id'] == user_id:
            user_vector = np.array(fv['feature_data'])
            break

    if user_vector is None:
        return []

    similar = []
    for fv in vectors:
        if fv['user_id'] == user_id:
            continue

        other_vec = np.array(fv['feature_data'])
        score = cosine_similarity(
            user_vector.reshape(1, -1),
            other_vec.reshape(1, -1)
        )[0][0]

        other_user = None
        for u in db['user_profiles']:
            if u['user_id'] == fv['user_id']:
                other_user = u
                break

        if other_user:
            similar.append({
                'user_id': fv['user_id'],
                'username': other_user.get('username', 'Unknown'),
                'lifestyle': other_user.get('profile', {}).get('lifestyle_phase', ''),
                'similarity_score': round(float(score) * 100, 1)
            })

    similar.sort(key=lambda x: x['similarity_score'], reverse=True)
    return similar[:top_n]

def cluster_users():
    db = read_db()
    vectors = db.get('feature_vectors', [])

    if len(vectors) < 3:
        return {}

    user_ids = [fv['user_id'] for fv in vectors]
    matrix = np.array([fv['feature_data'] for fv in vectors])

    n_clusters = min(3, len(vectors))
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(matrix)

    clusters = {}
    for user_id, label in zip(user_ids, labels):
        clusters[user_id] = int(label)

    return clusters