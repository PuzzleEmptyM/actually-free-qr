'use client';

import { useMemo, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function Home() {
  const [value, setValue] = useState('https://example.com');
  const [fg, setFg] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');
  const [size, setSize] = useState(256);
  const [msg, setMsg] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const safeValue = useMemo(() => value.trim() || ' ', [value]);

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas || !safeValue.trim()) {
      notify('Enter text or a URL first.');
      return;
    }
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    notify('Downloaded QR as PNG.');
  };

  const notify = (s: string) => {
    setMsg(s);
    setTimeout(() => setMsg(null), 2500);
  };

  return (
    <main className="container">
      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>Actually Free QR</h1>
      <p style={{ color: 'var(--muted)', marginTop: 4 }}>
        100% client-side. No watermark. No login. Web-app/PWA.
      </p>

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

      <section className="card" style={{ marginTop: 16, padding: 16, display: 'flex', justifyContent: 'center' }}>
        <div style={{ padding: 12, background: bg, borderRadius: 12 }}>
          {/* Note: QRCodeCanvas forwards ref to <canvas> */}
          <QRCodeCanvas
            value={safeValue}
            size={size}
            fgColor={fg}
            bgColor={bg}
            level="M"
            includeMargin={false}
            ref={(node: HTMLCanvasElement | null) => {
              canvasRef.current = node;
            }}
          />
        </div>
      </section>

      <button className="btn" onClick={downloadPng} disabled={!safeValue.trim()} style={{ width: '100%', marginTop: 16 }}>
        Save PNG
      </button>

      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
        Tracked links & analytics coming soon (edge redirect + tiny DB). Still 100% free to use.
      </p>

      {msg && <p style={{ fontSize: 12, color: '#065f46', marginTop: 6 }}>{msg}</p>}

      {/* Ad slot placeholder: mount AdSense here later */}
      {/* <AdBanner /> */}
    </main>
  );
}
