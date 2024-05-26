import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState<number>(0);
  const handleClick = () => setCount((count) => count + 1);

  return (
    <div className='p-4 w-full h-screen grid place-items-center'>
      <Button type='button' variant={'outline'} onClick={handleClick}>
        Clicked: {count} times
      </Button>
    </div>
  );
}
