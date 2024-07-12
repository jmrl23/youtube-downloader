import { request } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import qs from 'qs';

export default function useSearchSuggestions(q: string, limit?: number) {
  const query = useQuery({
    queryKey: ['search', 'suggestions', q],
    queryFn: () =>
      request<Data>(
        fetch(`/api/youtube/suggestions?${qs.stringify({ q, limit })}`),
      ),
  });

  const data: Data =
    query.data instanceof Error || !query.data
      ? { suggestions: [] }
      : query.data;

  return {
    ...query,
    data,
  };
}

interface Data {
  suggestions: string[];
}
