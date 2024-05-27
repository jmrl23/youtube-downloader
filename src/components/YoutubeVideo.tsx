import { useState } from 'react';
import { Img } from 'react-image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MusicIcon, PauseIcon, PlayIcon, VideoIcon } from 'lucide-react';
import { useToast } from './ui/use-toast';
import sanitize from 'sanitize-filename';
import YoutubeIframe from '@/components/YoutubeIframe';

export default function YoutubeVideo({ youtubeVideo }: Props) {
  const { thumbnail, title, duration, author } = youtubeVideo;
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const { toast } = useToast();
  const notifyDownload = (title: string, format: string) => {
    toast({
      title: 'Preparing your download',
      description: `Download for "${title.slice(
        0,
        10,
      )}..." as ${format} will begin shortly, kindly wait.`,
    });
  };

  return (
    <div className='p-4 bg-white rounded shadow'>
      <header className='relative'>
        {isPreview ? (
          <YoutubeIframe
            className='rounded aspect-video'
            width={'100%'}
            youtubeVideo={youtubeVideo}
          />
        ) : (
          <>
            <Badge
              variant={'secondary'}
              className='absolute right-2 top-2 shadow-sm border border-gray-100'
            >
              {duration.timestamp}
            </Badge>
            <Img src={thumbnail} className='rounded aspect-video' />
          </>
        )}
        <p className='text-slate-800 font-extrabold text-xs mt-4 border-l-4 border-slate-800 pl-4'>
          {author.name}
        </p>
      </header>
      <div className='mt-2 flex space-y-2 flex-col'>
        <h1 className='line-clamp-2 h-12' title={title}>
          {title}
        </h1>
        <div className='flex justify-end'>
          <Button
            onClick={() => setIsPreview((value) => !value)}
            type='button'
            title='preview'
            className='mr-auto pl-2'
          >
            {isPreview ? <PauseIcon /> : <PlayIcon />}
            <span className='ml-2'>Preview</span>
          </Button>
          <a
            href={`/api/download/${youtubeVideo.videoId}?format=mp4`}
            target='_blank'
            download={sanitize(`${youtubeVideo.title}.mp4`)}
          >
            <Button
              variant={'secondary'}
              type='button'
              title='Download MP4'
              className='rounded-full rounded-r-none border-r pl-6'
              onClick={() => notifyDownload(youtubeVideo.title, 'MP4')}
            >
              <VideoIcon />
            </Button>
          </a>
          <a
            href={`/api/download/${youtubeVideo.videoId}?format=mp3`}
            target='_blank'
            download={sanitize(`${youtubeVideo.title}.mp3`)}
          >
            <Button
              variant={'secondary'}
              type='button'
              title='Download MP3'
              className='rounded-full rounded-l-none border-l pr-6'
              onClick={() => notifyDownload(youtubeVideo.title, 'MP3')}
            >
              <MusicIcon />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

interface Props {
  youtubeVideo: YoutubeVideo;
}
