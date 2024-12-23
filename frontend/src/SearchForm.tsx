import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon } from 'lucide-react';
import useSearchSuggestions from '@/hooks/useSearchSuggestions';
import { useDebounce } from '@uidotdev/usehooks';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { cn, request } from '@/lib/utils';
import qs from 'qs';
import { useToast } from '@/components/ui/use-toast';

export interface Props {
  setYoutubeVideos: (youtubeVideos: YoutubeVideo[]) => void;
}

export default function Search({ setYoutubeVideos }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      q: '',
    },
  });
  const searchQuery = form.getValues('q');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const {
    data: { suggestions },
  } = useSearchSuggestions(debouncedSearchQuery, 6);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const { toast } = useToast();
  const onSubmit = async ({ q }: z.infer<typeof formSchema>) => {
    if (suggestionIndex > -1 && suggestionIndex < suggestions.length + 1) {
      form.setValue('q', suggestions[suggestionIndex]);
    }

    const data = await request<{ videos: YoutubeVideo[] }>(
      fetch(
        `/api/youtube/videos?${qs.stringify({
          q,
        })}`,
      ),
    );

    if (data instanceof Error) {
      toast({
        variant: 'destructive',
        title: 'API error',
        description: data.message,
      });

      return;
    }

    setYoutubeVideos(data.videos);
  };

  const [suggestionIndex, setSuggestionIndex] = useState<number>(-1);

  function handleKeyInput(e: KeyboardEvent<HTMLInputElement>) {
    const capturedKeys = ['ArrowUp', 'ArrowDown'] as const;

    if (capturedKeys.includes(e.key as (typeof capturedKeys)[number])) {
      e.preventDefault();
    }

    switch (e.key) {
      case 'ArrowUp':
        if (suggestionIndex <= -1) return;
        setSuggestionIndex((value) => value - 1);
        break;
      case 'ArrowDown':
        if (suggestionIndex >= suggestions.length) return;
        setSuggestionIndex((value) => value + 1);
        break;
    }
  }

  useEffect(() => {
    setSuggestionIndex(-1);
  }, [suggestions]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='w-full md:w-[300px] lg:w-[400px] mt-4 md:mt-0 relative'
      >
        <FormField
          control={form.control}
          name={'q'}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className='flex items-center'>
                  <Input
                    {...field}
                    placeholder={'Search'}
                    className='rounded-r-none'
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(setIsFocused, 100, false)}
                    onKeyDown={handleKeyInput}
                  />
                  <Button
                    variant={'default'}
                    type='submit'
                    className='rounded-l-none'
                    ref={submitButtonRef}
                  >
                    <SearchIcon />
                  </Button>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
        {isFocused && suggestions.length > 0 && (
          <div className='bg-white fixed mt-2 rounded-sm shadow p-4 w-[calc(100%-2rem)] md:w-[300px] lg:w-[400px] flex flex-col space-y-2 z-50'>
            {suggestions.map((suggestion, idx) => (
              <p
                key={suggestion}
                className={cn(
                  'cursor-pointer hover:underline underline-offset-8',
                  idx === suggestionIndex && 'underline',
                )}
                onClick={() => {
                  form.setValue('q', suggestion);
                  submitButtonRef.current?.click();
                }}
              >
                {suggestion}
              </p>
            ))}
          </div>
        )}
      </form>
    </Form>
  );
}

const formSchema = z.object({
  q: z.string(),
});
