import axios from 'axios';

const API_URL = 'http://localhost:5000/api/marquee';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const getMarquees = () => axios.get(API_URL, getAuthHeaders());
export const createMarquee = (content, backgroundColor) => axios.post(API_URL, { content, backgroundColor }, getAuthHeaders());
export const updateMarquee = (id, content, backgroundColor) => axios.put(`${API_URL}/${id}`, { content, backgroundColor }, getAuthHeaders());
export const deleteMarquee = (id) => axios.delete(`${API_URL}/${id}`, getAuthHeaders());
export const setActiveMarquee = (id) => axios.put(`${API_URL}/activate/${id}`, {}, getAuthHeaders());
export const deactivateMarquee = (id) => axios.put(`${API_URL}/deactivate/${id}`, {}, getAuthHeaders());
export const getActiveMarquee = () => axios.get(`${API_URL}/active`);
