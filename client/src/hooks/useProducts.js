import { useQuery } from "@tanstack/react-query";
import { getProducts } from "#api/product.js";

export const useProducts = (page, limit, search) => {
    return useQuery({
        queryKey: ['products', page, limit, search],
        queryFn: () => getProducts(page, limit, search)
    });
};
