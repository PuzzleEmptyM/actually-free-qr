'use client';

type Props = {
  value: string; setValue: (v: string) => void;
  fg: string; setFg: (v: string) => void;
  bg: string; setBg: (v: string) => void;
  size: number; setSize: (n: number) => void;
};

const sizes = [256, 384, 512, 768];
const swatches = ['#000000','#111827','#3b82f6','#10b981','#ef4444','#f59e0b','#ffffff'];

export default function Controls({ value, setValue, fg, setFg, bg, setBg, size, setSize }: Props) {
  return (
    <section className="mx-auto mt-3 grid max-w-3xl gap-3 px-4">
      <input
        className="w-full rounded-xl border border-zinc-300/70 bg-white/60 px-4 py-3 outline-none
                   focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-700/60 dark:bg-zinc-900/60"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Text or URL"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <label className="w-8 text-sm text-zinc-500">FG</label>
          <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-10 w-10 rounded" />
          <input
            className="flex-1 rounded-xl border border-zinc-300/70 bg-white/60 px-3 py-2 outline-none
                       focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-700/60 dark:bg-zinc-900/60"
            value={fg}
            onChange={(e) => setFg(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="w-8 text-sm text-zinc-500">BG</label>
          <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-10 w-10 rounded" />
          <input
            className="flex-1 rounded-xl border border-zinc-300/70 bg-white/60 px-3 py-2 outline-none
                       focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-700/60 dark:bg-zinc-900/60"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-zinc-500">Size</label>
        <input
          className="w-28 rounded-xl border border-zinc-300/70 bg-white/60 px-3 py-2 outline-none
                     focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-700/60 dark:bg-zinc-900/60"
          type="number" min={128} max={2048} value={size}
          onChange={(e) => {
            const n = parseInt(e.target.value || '256', 10);
            setSize(Number.isFinite(n) ? Math.min(Math.max(n, 128), 2048) : 256);
          }}
        />
        <div className="flex gap-2">
          {sizes.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`rounded-full border px-3 py-1 text-sm transition
                ${size === s
                  ? 'border-indigo-500 bg-indigo-500 text-white'
                  : 'border-zinc-300/70 bg-white/60 hover:bg-zinc-100 dark:border-zinc-700/60 dark:bg-zinc-900/60 dark:hover:bg-zinc-800'}`}
            >
              {s}px
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-zinc-500">Presets</span>
        <div className="flex flex-wrap gap-2">
          {swatches.map(hex => (
            <button
              key={'fg-'+hex}
              type="button"
              onClick={() => setFg(hex)}
              className="size-7 rounded-full ring-1 ring-black/10"
              style={{ background: hex }}
              aria-label={`FG ${hex}`}
              title={`Set FG ${hex}`}
            />
          ))}
          <span className="mx-1 text-zinc-400">/</span>
          {swatches.map(hex => (
            <button
              key={'bg-'+hex}
              type="button"
              onClick={() => setBg(hex)}
              className="size-7 rounded-full ring-1 ring-black/10"
              style={{ background: hex }}
              aria-label={`BG ${hex}`}
              title={`Set BG ${hex}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
