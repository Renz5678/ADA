import { useQuery } from "@tanstack/react-query";
import { getAvailabilities } from "#api/schedule.js";

export const useAvailabilities = () => {
    return useQuery({
        queryKey: ['schedule'],
        queryFn: () => getAvailabilities()
    });
};
