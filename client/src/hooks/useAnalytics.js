import { useQuery } from "@tanstack/react-query";
import { getSummary, getTopProducts, getWeakProducts, getSalesByMonth } from "#api/analytics.js";

export const useAnalyticsSummary = (period) => {
    return useQuery({
        queryKey: ['analytics', 'summary', period],
        queryFn: () => getSummary(period)
    });
};

export const useTopProducts = () => {
    return useQuery({
        queryKey: ['analytics', 'top-products'],
        queryFn: () => getTopProducts()
    });
};

export const useWeakProducts = () => {
    return useQuery({
        queryKey: ['analytics', 'weak-products'],
        queryFn: () => getWeakProducts()
    });
};

export const useSalesByMonth = () => {
    return useQuery({
        queryKey: ['analytics', 'sales-by-month'],
        queryFn: () => getSalesByMonth()
    });
};
