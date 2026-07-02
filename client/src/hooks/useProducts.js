import { useQuery } from "@tanstack/react-query";
import { getProducts } from "#api/product.js";

export const useProducts = () => {
    return useQuery({
        queryKey: ['products'],
        queryFn: () => getProducts()
    });
};
