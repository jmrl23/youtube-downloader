import { IframeHTMLAttributes } from 'react';

export default function YoutubeIframe({ youtubeVideo, ...props }: Props) {
  return (
    <iframe
      src={`https://www.youtube.com/embed/${youtubeVideo.videoId}?enablejsapi=1`}
      {...props}
    ></iframe>
  );
}

interface Props extends IframeHTMLAttributes<HTMLIFrameElement> {
  youtubeVideo: YoutubeVideo;
}
