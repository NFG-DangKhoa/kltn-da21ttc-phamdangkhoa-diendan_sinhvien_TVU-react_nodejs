// src/services/draftService.js
// Ví dụ nếu bạn sử dụng axios
import axios from 'axios';

const API_BASE_URL = '/api/drafts'; // Thay thế bằng URL API của bạn

export const getDrafts = async () => {
    const response = await axios.get(API_BASE_URL);
    return response.data;
};

export const createDraft = async (draftData) => {
    const response = await axios.post(API_BASE_URL, draftData);
    return response.data;
};

export const updateDraftApi = async (id, draftData) => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, draftData);
    return response.data;
};

export const deleteDraftApi = async (id) => {
    await axios.delete(`${API_BASE_URL}/${id}`);
};