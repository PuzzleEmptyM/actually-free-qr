'use client';

import { useMemo, useRef, useState } from 'react';
import Title from './components/Title';
import Controls from './components/Controls';
import QRPreview from './components/QRPreview';
import DownloadButton from './components/DownloadButton';
import Dashboard from './components/Dashboard';
import Toast from './components/Toast';
import AdBanner from './components/AdBanner';
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton, useUser } from '@clerk/nextjs';

export default function Home() {
  const [value, setValue] = useState('https://example.com');
  const [fg, setFg] = useState('#FFFFFF');
  const [bg, setBg] = useState('#0b0b0f');
  const [size, setSize] = useState(256);
  const [msg, setMsg] = useState<string | null>(null);
  const [lastLink, setLastLink] = useState<string | null>(null);

  async function createTracked(destination: string, fg: string, bg: string, size: number): Promise<string | null> {
    try {
      const res = await fetch('/api/qr/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination_url: destination, fg, bg, size }),
      });
      if (!res.ok) return null;
      const { id } = await res.json();
      return `${window.location.origin}/r/${id}`;
    } catch {
      return null;
    }
  }

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const safeValue = useMemo(() => value.trim() || ' ', [value]);

  const notify = (s: string) => { setMsg(s); setTimeout(() => setMsg(null), 2500); };
  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas || !safeValue.trim()) { notify('Enter text or a URL first.'); return; }
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url; a.download = `qr-${Date.now()}.png`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    notify('Downloaded QR as PNG.');
  };

  return (
    <main>
      <Title subtitle="100% client-side. No watermark. No login. Web-app/PWA." />
      <Controls value={value} setValue={setValue} fg={fg} setFg={setFg} bg={bg} setBg={setBg} size={size} setSize={setSize} />
      <QRPreview value={safeValue} size={size} fg={fg} bg={bg} canvasRef={canvasRef} />
      <DownloadButton disabled={!safeValue.trim()} onClick={downloadPng} />
      <div className="mx-auto max-w-3xl px-4">
        <SignedOut>
          <SignInButton mode="modal">
            <button
              className="mt-3 w-full rounded-xl bg-zinc-800 px-4 py-3 font-semibold text-zinc-100 ring-1 ring-white/10 transition hover:bg-zinc-700"
            >
              Create account to track scan analytics (optional)
            </button>
          </SignInButton>
          <p className="mx-auto mt-3 max-w-3xl px-4 text-xs text-zinc-400">
            Create a tracked short link (optional) to see scans by day, device, and country.
          </p>
        </SignedOut>

        <SignedIn>
          <button
            className="mt-3 w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white ring-1 ring-white/10 transition hover:bg-indigo-500"
            onClick={async () => {
              const link = await createTracked(safeValue.trim(), fg, bg, size);
              if (!link) { notify('Failed to create tracked link.'); return; }
              setLastLink(link);
              await navigator.clipboard.writeText(link);
              notify('Tracked link created and copied!');
            }}
          >
            Save & Track Analytics
          </button>
        </SignedIn>
      </div>
      {lastLink && (
        <div className="mx-auto mt-3 max-w-3xl px-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
            <div className="text-sm text-zinc-300 truncate">{lastLink}</div>
            <div className="mt-2 flex gap-2">
              <a
                href={lastLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-500"
              >
                Open
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(lastLink)}
                className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800"
              >
                Copy again
              </button>
            </div>
          </div>
        </div>
      )}
      <SignedIn>
        <Dashboard />
      </SignedIn>

      <Toast message={msg} />
      <AdBanner />
    </main>
  );
}
