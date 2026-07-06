import { useQuery } from "@tanstack/react-query";
import { getExpenses } from "#api/expenses.js";

export const useExpenses = (page, limit) => {
    return useQuery({
        queryKey: ['expenses', page, limit],
        queryFn: () => getExpenses(page, limit)
    });
};
