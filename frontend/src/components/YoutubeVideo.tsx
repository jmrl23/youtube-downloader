import { useState } from 'react';
import { Img } from 'react-image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MusicIcon, PauseIcon, PlayIcon, VideoIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { saveFile } from '@/lib/utils';
import YoutubeIframe from '@/components/YoutubeIframe';
import sanitize from 'sanitize-filename';

export default function YoutubeVideo({ youtubeVideo }: Props) {
  const { thumbnail, title, duration, author } = youtubeVideo;
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const { toast } = useToast();
  const beginDownload = async (url: string, title: string, format: string) => {
    toast({
      title: 'Download',
      description: `Your ${format.toUpperCase()} download of "${title.substring(
        0,
        16,
      )}..." is underway in the background. File will be saved automatically once it's done.`,
    });

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();

        if ('error' in error) throw new Error(error.message);

        throw new Error('An error occurs');
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const filename = sanitize(`${title}.${format.toLowerCase()}`);

      saveFile(blobUrl, filename);

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      const description =
        error instanceof Error ? error.message : 'An error occurs';

      toast({
        title: 'Download failed',
        description,
        variant: 'destructive',
      });
    }
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

          <Button
            variant={'secondary'}
            type='button'
            title='Download MP4'
            className='rounded-full rounded-r-none border-r pl-6'
            onClick={() =>
              beginDownload(
                `/api/youtube/${youtubeVideo.videoId}/download?format=mp4`,
                youtubeVideo.title,
                'MP4',
              )
            }
          >
            <VideoIcon />
          </Button>

          <Button
            variant={'secondary'}
            type='button'
            title='Download MP3'
            className='rounded-full rounded-l-none border-l pr-6'
            onClick={() =>
              beginDownload(
                `/api/youtube/${youtubeVideo.videoId}/download?format=mp3`,
                youtubeVideo.title,
                'MP3',
              )
            }
          >
            <MusicIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  youtubeVideo: YoutubeVideo;
}
