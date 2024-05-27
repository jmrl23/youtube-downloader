export interface Props {
  youtubeVideos: YoutubeVideo[];
}

export default function Main({ youtubeVideos }: Props) {
  return (
    <main className='p-4'>
      <div className='max-w-screen-lg mx-auto'>
        {youtubeVideos.map((video) => (
          <p key={video.videoId} className='mb-4'>
            {video.title}
          </p>
        ))}
      </div>
    </main>
  );
}
