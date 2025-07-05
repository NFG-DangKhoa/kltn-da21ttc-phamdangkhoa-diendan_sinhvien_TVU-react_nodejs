import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/forum-rules';

// Get current forum rules
export const getCurrentRules = async () => {
    try {
        const response = await axios.get(API_BASE_URL);
        return response.data;
    } catch (error) {
        console.error('Error getting current rules:', error);
        throw error;
    }
};

// Check if user needs to agree to rules
export const checkRulesAgreement = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return { data: { needsAgreement: false } };
        }

        const response = await axios.get(`${API_BASE_URL}/check-agreement`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error checking rules agreement:', error);
        throw error;
    }
};

// User agrees to rules
export const agreeToRules = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await axios.post(`${API_BASE_URL}/agree`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error agreeing to rules:', error);
        throw error;
    }
};

// Admin: Update rules
export const updateRules = async (title, content) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await axios.put(API_BASE_URL, 
            { title, content },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating rules:', error);
        throw error;
    }
};

// Admin: Get rules history
export const getRulesHistory = async (page = 1, limit = 10) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await axios.get(`${API_BASE_URL}/history?page=${page}&limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting rules history:', error);
        throw error;
    }
};

export default {
    getCurrentRules,
    checkRulesAgreement,
    agreeToRules,
    updateRules,
    getRulesHistory
};
