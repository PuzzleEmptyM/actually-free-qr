'use client';

type Props = {
  value: string;
  setValue: (v: string) => void;
  fg: string;
  setFg: (v: string) => void;
  bg: string;
  setBg: (v: string) => void;
  size: number;
  setSize: (n: number) => void;
};

export default function Controls({ value, setValue, fg, setFg, bg, setBg, size, setSize }: Props) {
  return (
    <section style={{ display: 'grid', gap: 12, marginTop: 16 }}>
      <input
        className="input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Text or URL"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />

      <div className="row">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ minWidth: 26 }}>FG</label>
          <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} />
          <input className="input" value={fg} onChange={(e) => setFg(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ minWidth: 26 }}>BG</label>
          <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
          <input className="input" value={bg} onChange={(e) => setBg(e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <label>Size</label>
        <input
          className="input"
          style={{ width: 110 }}
          type="number"
          min={128}
          max={2048}
          value={size}
          onChange={(e) => {
            const n = parseInt(e.target.value || '256', 10);
            setSize(Number.isFinite(n) ? Math.min(Math.max(n, 128), 2048) : 256);
          }}
        />
        <span style={{ color: 'var(--muted)', fontSize: 12 }}>px</span>
      </div>
    </section>
  );
}
