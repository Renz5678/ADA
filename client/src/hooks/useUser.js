import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, updateBusinessName, getProfile, updateProfile, uploadProfileImages } from "#api/user.js";

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

export function useProfile() {
    return useQuery({
        queryKey: ['profile'],
        queryFn: getProfile,
        staleTime: 5 * 60 * 1000
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        }
    });
}

export function useUploadProfileImages() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: uploadProfileImages,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        }
    });
}