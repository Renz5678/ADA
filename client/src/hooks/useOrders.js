import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getOrders } from "#api/orders.js";

export const useOrders = (page, limit = 10) => {
return useQuery({
    queryKey: ['orders', page, limit],
    queryFn: () => getOrders(page, limit),
    placeholderData: keepPreviousData
})
};