import { useQuery } from "@tanstack/react-query";
import { getMaterialTransactions } from "#api/materialTransactions.js";

export const useMaterialTransactions = () => {
    return useQuery({
        queryKey: ['materialTransactions'],
        queryFn: () => getMaterialTransactions()
    });
};
