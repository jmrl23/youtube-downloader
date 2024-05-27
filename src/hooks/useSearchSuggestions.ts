import { useToast } from '@/components/ui/use-toast';
import { request } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import qs from 'qs';

export default function useSearchSuggestions(q: string, limit?: number) {
  const { toast } = useToast();
  const query = useQuery({
    queryKey: ['search', 'suggestions', q],
    queryFn: () =>
      request<Data>(fetch(`/api/suggestions?${qs.stringify({ q, limit })}`)),
  });

  if (query.data instanceof Error) {
    toast({
      variant: 'destructive',
      title: 'API error',
      description: query.data.message,
    });
  }

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
