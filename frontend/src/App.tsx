import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import Content from './Content';
import Header from './Header';

const queryClient = new QueryClient();

export default function App() {
  const [youtubeVideos, setYoutubeVideos] = useState<YoutubeVideo[]>([]);

  return (
    <QueryClientProvider client={queryClient}>
      <Header setYoutubeVideos={setYoutubeVideos} />
      <Content youtubeVideos={youtubeVideos} />
      <Toaster />
    </QueryClientProvider>
  );
}
