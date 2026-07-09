import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clientApi from '../api/clientApi.js';

export const useClientNotifications = () => {
    return useQuery({
        queryKey: ['clientNotifications'],
        queryFn: async () => {
            const { data } = await clientApi.get('/client-notifications');
            return data;
        },
        refetchInterval: 30000 // Poll every 30s
    });
};

export const useClientUnreadCount = () => {
    return useQuery({
        queryKey: ['clientUnreadCount'],
        queryFn: async () => {
            const { data } = await clientApi.get('/client-notifications/unread-count');
            return data.count;
        },
        refetchInterval: 30000 // Poll every 30s
    });
};

export const useMarkClientAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await clientApi.put(`/client-notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientNotifications'] });
            queryClient.invalidateQueries({ queryKey: ['clientUnreadCount'] });
        }
    });
};

export const useMarkAllClientAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            await clientApi.put('/client-notifications/mark-all-read');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientNotifications'] });
            queryClient.invalidateQueries({ queryKey: ['clientUnreadCount'] });
        }
    });
};
