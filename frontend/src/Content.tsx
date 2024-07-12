import Video from './Video';

export default function Content({ youtubeVideos }: Props) {
  return (
    <main className='p-4'>
      <div className='max-w-screen-lg mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {youtubeVideos.map((video) => (
          <Video key={video.videoId} youtubeVideo={video} />
        ))}
      </div>
    </main>
  );
}

export interface Props {
  youtubeVideos: YoutubeVideo[];
}
