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
      {/* Text/URL */}
      <input
        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500/40"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Text or URL"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />

      {/* FG / BG pickers */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <label className="w-8 text-sm text-zinc-400">FG</label>
          <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-10 w-10 rounded" />
          <input
            className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500/40"
            value={fg}
            onChange={(e) => setFg(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="w-8 text-sm text-zinc-400">BG</label>
          <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-10 w-10 rounded" />
          <input
            className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500/40"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
          />
        </div>
      </div>

      {/* Size row: label + input + quick chips all inline */}
      <div className="flex items-center gap-3 overflow-x-auto flex-nowrap">
        <label className="shrink-0 text-sm text-zinc-400">Size</label>

        <input
          className="shrink-0 w-28 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/40"
          type="number"
          min={128}
          max={2048}
          value={size}
          onChange={(e) => {
            const n = parseInt(e.target.value || '256', 10);
            setSize(Number.isFinite(n) ? Math.min(Math.max(n, 128), 2048) : 256);
          }}
        />

        <div className="flex gap-2 flex-nowrap">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`shrink-0 rounded-full border px-3 py-1 text-sm transition ${
                size === s
                  ? 'border-indigo-500 bg-indigo-600 text-white'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {s}px
            </button>
          ))}
        </div>
      </div>

      {/* Presets: FG row + BG row as atomic blocks */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
        <span className="text-sm text-zinc-400">Presets</span>

        {/* container switches: side-by-side on md+, stacked on small */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
          {/* FG swatches (no wrap; scroll if needed) */}
          <div className="flex gap-2 flex-nowrap overflow-x-auto">
            {swatches.map(hex => (
              <button
                key={'fg-'+hex}
                type="button"
                onClick={() => setFg(hex)}
                className="size-7 shrink-0 rounded-full ring-1 ring-white/10"
                style={{ background: hex }}
                aria-label={`FG ${hex}`}
                title={`Set FG ${hex}`}
              />
            ))}
          </div>

          {/* Separator only when rows are side-by-side */}
          <span className="hidden md:inline mx-1 text-zinc-500">/</span>

          {/* BG swatches (no wrap; scroll if needed) */}
          <div className="flex gap-2 flex-nowrap overflow-x-auto">
            {swatches.map(hex => (
              <button
                key={'bg-'+hex}
                type="button"
                onClick={() => setBg(hex)}
                className="size-7 shrink-0 rounded-full ring-1 ring-white/10"
                style={{ background: hex }}
                aria-label={`BG ${hex}`}
                title={`Set BG ${hex}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
