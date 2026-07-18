import api from "./axiosInstance";

export const fetchUsers = async () => {
    const { data } = await api.get('/admin/users');
    return data;
};

export const updateUserStatus = async (userId, updateData) => {
    const { data } = await api.put(`/admin/users/${userId}/status`, updateData);
    return data;
};

export const fetchFeedbacks = async () => {
    const { data } = await api.get('/admin/feedback');
    return data;
};

export const updateFeedbackStatus = async (feedbackId, status) => {
    const { data } = await api.put(`/admin/feedback/${feedbackId}/status`, { status });
    return data;
};
