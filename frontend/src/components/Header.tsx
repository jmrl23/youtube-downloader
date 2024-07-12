import Search from '@/components/form/Search';

export default function Header({ setYoutubeVideos }: Props) {
  return (
    <header className='bg-slate-700 p-4'>
      <div className='max-w-screen-lg mx-auto flex flex-col md:flex-row items-center justify-between'>
        <h1 className='font-extrabold text-xl text-white text-center md:text-left'>
          Youtube downloader
        </h1>
        <Search setYoutubeVideos={setYoutubeVideos} />
      </div>
    </header>
  );
}

export interface Props {
  setYoutubeVideos: (youtubeVideos: YoutubeVideo[]) => void;
}
