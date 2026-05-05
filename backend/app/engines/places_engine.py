import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('GOOGLE_PLACES_API_KEY')

CATEGORY_TO_TYPE = {
    'Restaurants': 'restaurant',
    'Cafes': 'cafe',
    'Nightlife': 'night_club',
    'Outdoors': 'park',
    'Kids & Family': 'amusement_park',
    'Education': 'library',
    'Shopping': 'shopping_mall',
    'Wellness': 'spa'
}

def search_places(location, category='Restaurants', radius=2000):
    place_type = CATEGORY_TO_TYPE.get(category, 'restaurant')

    if location.lower() == 'near me':
        return {'error': 'Please enter a specific location'}, 400

    geo_url = 'https://maps.googleapis.com/maps/api/geocode/json'
    geo_params = {
        'address': location,
        'key': API_KEY
    }
    geo_response = requests.get(geo_url, params=geo_params)
    geo_data = geo_response.json()

    if not geo_data['results']:
        return {'error': 'Location not found'}, 404

    lat = geo_data['results'][0]['geometry']['location']['lat']
    lng = geo_data['results'][0]['geometry']['location']['lng']

    places_url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
    places_params = {
        'location': f'{lat},{lng}',
        'radius': radius,
        'type': place_type,
        'key': API_KEY
    }
    places_response = requests.get(places_url, params=places_params)
    places_data = places_response.json()

    results = []
    for place in places_data.get('results', [])[:10]:
        results.append({
            'place_id': place.get('place_id'),
            'name': place.get('name'),
            'address': place.get('vicinity'),
            'rating': place.get('rating', 0),
            'category': category,
            'location': {
                'lat': place['geometry']['location']['lat'],
                'lng': place['geometry']['location']['lng']
            },
            'photo_reference': place['photos'][0]['photo_reference'] if place.get('photos') else None,
            'open_now': place.get('opening_hours', {}).get('open_now', None)
        })

    return results

def get_place_photo(photo_reference, max_width=400):
    if not photo_reference:
        return None
    return f"https://maps.googleapis.com/maps/api/place/photo?maxwidth={max_width}&photo_reference={photo_reference}&key={API_KEY}"

def get_place_details(place_id):
    url = 'https://maps.googleapis.com/maps/api/place/details/json'
    params = {
        'place_id': place_id,
        'fields': 'name,rating,formatted_address,opening_hours,photos,reviews,website,formatted_phone_number,price_level',
        'key': API_KEY
    }
    response = requests.get(url, params=params)
    data = response.json()
    return data.get('result', {})