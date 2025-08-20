'use client';

import { useMemo, useRef, useState } from 'react';
import Title from './components/Title';
import Controls from './components/Controls';
import QRPreview from './components/QRPreview';
import DownloadButton from './components/DownloadButton';
import Toast from './components/Toast';
import AdBanner from './components/AdBanner';

export default function Home() {
  const [value, setValue] = useState('https://example.com');
  const [fg, setFg] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');
  const [size, setSize] = useState(256);
  const [msg, setMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const safeValue = useMemo(() => value.trim() || ' ', [value]);

  const notify = (s: string) => {
    setMsg(s);
    setTimeout(() => setMsg(null), 2500);
  };

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

  return (
    <main className="container">
      <Title subtitle="100% client-side. No watermark. No login. Web-app/PWA." />

      <Controls
        value={value} setValue={setValue}
        fg={fg} setFg={setFg}
        bg={bg} setBg={setBg}
        size={size} setSize={setSize}
      />

      <QRPreview value={safeValue} size={size} fg={fg} bg={bg} canvasRef={canvasRef} />

      <DownloadButton disabled={!safeValue.trim()} onClick={downloadPng} />

      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
        Tracked links & analytics coming soon (edge redirect + tiny DB). Still 100% free to use.
      </p>

      <Toast message={msg} />

      {/* Ad slot placeholder: mount AdSense component later */}
      <AdBanner />
    </main>
  );
}
