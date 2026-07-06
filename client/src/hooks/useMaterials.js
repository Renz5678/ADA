import { useQuery } from "@tanstack/react-query";
import { getMaterials } from "#api/materials.js";

export const useMaterials = (page, limit) => {
    return useQuery({
        queryKey: ['materials', page, limit],
        queryFn: () => getMaterials(page, limit)
    });
};
