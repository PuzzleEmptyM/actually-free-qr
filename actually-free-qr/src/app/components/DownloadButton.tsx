'use client';

export default function DownloadButton({ disabled, onClick }: { disabled?: boolean; onClick: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4">
      <button
        onClick={onClick}
        disabled={disabled}
        className="mt-6 w-full rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-800 py-3.5
                   font-semibold text-white shadow-sm ring-1 ring-black/5 transition
                   hover:opacity-95 disabled:from-zinc-400 disabled:to-zinc-400
                   dark:from-white dark:to-zinc-200 dark:text-zinc-900"
      >
        Save PNG
      </button>
    </div>
  );
}
