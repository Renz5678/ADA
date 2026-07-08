import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBusinesses, getClientOrders, createClientOrder } from "#api/clientEndpoints.js";

export function useBusinesses() {
    return useQuery({
        queryKey: ['businesses'],
        queryFn: getBusinesses,
        staleTime: 5 * 60 * 1000
    });
}

export function useClientOrders() {
    return useQuery({
        queryKey: ['clientOrders'],
        queryFn: getClientOrders,
        staleTime: 5 * 60 * 1000
    });
}

export function useCreateClientOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createClientOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientOrders'] });
        }
    });
}
