import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export async function request<T>(
  promise: Promise<Response>,
): Promise<T | Error> {
  try {
    const response = await promise;
    const data = await response.json();

    if ('error' in data) throw new Error(data.message);

    return data as T;
  } catch (error) {
    if (error instanceof Error) return error;
    return new Error('An error occurs');
  }
}
