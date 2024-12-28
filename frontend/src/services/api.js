// src/services/api.js

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Problems Endpoints
export const getProblems = () => api.get('/problems/');
export const getProblem = (id) => api.get(`/problems/${id}`);
export const createProblem = (data) => api.post('/problems/', data);
export const updateProblem = (id, data) => api.put(`/problems/${id}`, data);
export const deleteProblem = (id) => api.delete(`/problems/${id}`);

// Tags Endpoints
export const getTags = () => api.get('/tags/');
export const createTag = (data) => api.post('/tags/', data);
export const updateTag = (id, data) => api.put(`/tags/${id}`, data);
export const deleteTag = (id) => api.delete(`/tags/${id}`);

// Sources Endpoints
export const getSources = () => api.get('/sources/');
export const createSource = (data) => api.post('/sources/', data);
export const updateSource = (id, data) => api.put(`/sources/${id}`, data);
export const deleteSource = (id) => api.delete(`/sources/${id}`);

// Problem Upload Endpoint
export const uploadProblemImage = (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  return api.post('/upload_problem/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default api;
