import { useQuery } from "@tanstack/react-query";
import { getMaterials } from "#api/materials.js";

export const useMaterials = () => {
    return useQuery({
        queryKey: ['materials'],
        queryFn: () => getMaterials()
    });
};
