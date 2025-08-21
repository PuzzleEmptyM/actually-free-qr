'use client';

export default function DownloadButton({ disabled, onClick }: { disabled?: boolean; onClick: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4">
      <button
        onClick={onClick}
        disabled={disabled}
        className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5
                   font-semibold text-white shadow-sm ring-1 ring-white/10 transition
                   hover:opacity-95 disabled:from-zinc-600 disabled:to-zinc-600 disabled:opacity-70"
      >
        Save PNG
      </button>
    </div>
  );
}
