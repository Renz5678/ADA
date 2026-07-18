import api from "./axiosInstance";

export const submitFeedback = async (feedbackData) => {
    const { data } = await api.post('/feedback', feedbackData);
    return data;
};
