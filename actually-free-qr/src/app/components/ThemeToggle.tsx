'use client';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.dataset.theme === 'dark'), []);
  const toggle = () => {
    const isDark = document.documentElement.dataset.theme === 'dark';
    const next = isDark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
    setDark(next === 'dark');
  };
  return (
    <button
      onClick={toggle}
      className="rounded-xl border border-zinc-300/70 dark:border-zinc-700/60 px-3 py-1.5 text-sm
                 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {dark ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
