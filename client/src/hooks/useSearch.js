import { useQuery } from '@tanstack/react-query';
import { globalSearch } from '#api/search.js';

export const useGlobalSearch = (query) => {
    return useQuery({
        queryKey: ['globalSearch', query],
        queryFn: () => globalSearch(query),
        enabled: query.trim().length > 0
    });
};
