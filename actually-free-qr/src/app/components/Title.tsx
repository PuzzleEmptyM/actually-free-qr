'use client';
import ThemeToggle from './ThemeToggle';

export default function Title({ subtitle }: { subtitle?: string }) {
  return (
    <header className="mx-auto max-w-3xl px-4 pt-8 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Actually <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Free</span> QR
        </h1>
        <ThemeToggle />
      </div>
      {subtitle && <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>}
    </header>
  );
}
