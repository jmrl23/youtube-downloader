export declare global {
  declare interface YoutubeVideo {
    type: string;
    videoId: string;
    url: string;
    title: string;
    description: string;
    image: string;
    thumbnail: string;
    seconds: number;
    timestamp: string;
    duration: {
      seconds: number;
      timestamp: string;
    };
    ago: string;
    views: number;
    author: {
      name: string;
      url: string;
    };
  }
}
