import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getOrders, getOrderStats, getScheduledOrders } from "#api/orders.js";

export const useOrders = (page, limit = 10, status = '', search = '') => {
    return useQuery({
        queryKey: ['orders', page, limit, status, search],
        queryFn: () => getOrders(page, limit, status, search),
        placeholderData: keepPreviousData
    })
};

export const useOrderStats = () => {
    return useQuery({
        queryKey: ['orders', 'stats'],
        queryFn: () => getOrderStats()
    });
};

export const useScheduledOrders = () => {
    return useQuery({
        queryKey: ['orders', 'scheduled'],
        queryFn: () => getScheduledOrders()
    });
};