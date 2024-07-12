import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Header from './Header';
import Content from './Content';

const queryClient = new QueryClient();

export default function App() {
  const [youtubeVideos, setYoutubeVideos] = useState<YoutubeVideo[]>([]);

  return (
    <QueryClientProvider client={queryClient}>
      <Header setYoutubeVideos={setYoutubeVideos} />
      <Content youtubeVideos={youtubeVideos} />
    </QueryClientProvider>
  );
}
