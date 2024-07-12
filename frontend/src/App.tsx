import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Header from '@/components/Header';
import Main from '@/components/Main';

const queryClient = new QueryClient();

export default function App() {
  const [youtubeVideos, setYoutubeVideos] = useState<YoutubeVideo[]>([]);

  return (
    <QueryClientProvider client={queryClient}>
      <Header setYoutubeVideos={setYoutubeVideos} />
      <Main youtubeVideos={youtubeVideos} />
    </QueryClientProvider>
  );
}
