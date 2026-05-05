import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
});

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const saveProfile = (data) => API.post('/profile/save', data);
export const getProfile = (user_id) => API.get(`/profile/get/${user_id}`);
export const getPlaces = (data) => API.post('/recommendations/places', data);
export const getMatch = (data) => API.post('/recommendations/match', data);