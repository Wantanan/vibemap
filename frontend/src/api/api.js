import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
});

export const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const saveProfile = (data) => API.post('/profile/save', data);
export const getProfile = (user_id) => API.get(`/profile/get/${user_id}`);
export const getPlaces = (data) => API.post('/recommendations/places', data);
export const getMatch = (data) => API.post('/recommendations/match', data);
export const submitRating = (data) => API.post('/ratings/submit', data);
export const getPlaceRatings = (place_id) => API.get(`/ratings/place/${place_id}`);
export const getNeighbourRatings = (data) => API.post('/ratings/neighbour-ratings', data);
export const getUserRatings = (user_id) => API.get(`/ratings/user/${user_id}`);