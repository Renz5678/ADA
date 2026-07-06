import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../api/notifications';

export const useNotifications = () => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: getNotifications,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useUnreadCount = () => {
    return useQuery({
        queryKey: ['notifications', 'unreadCount'],
        queryFn: getUnreadCount,
        refetchInterval: 1000 * 60, // Poll every minute
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });
};

export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });
};
