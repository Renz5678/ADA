import api from './axiosInstance';

export const getChatHistory = async () => {
    const { data } = await api.get('/chat/history');
    return data;
};

export const sendChatMessage = async (message) => {
    const { data } = await api.post('/chat/message', { message });
    return data;
};

export const clearChatHistory = async () => {
    const { data } = await api.delete('/chat/history');
    return data;
};
