import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, updateBusinessName } from "#api/user.js";

export function useCurrentUser() {
    return useQuery({
        queryKey: ['currentUser'],
        queryFn: getMe,
        staleTime: 5 * 60 * 1000
    });
}

export function useUpdateBusinessName() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateBusinessName,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        }
    });
}