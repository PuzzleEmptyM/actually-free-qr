'use client';
export default function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="mx-auto mt-3 max-w-3xl px-4 text-sm text-emerald-600 dark:text-emerald-400">{message}</p>;
}
