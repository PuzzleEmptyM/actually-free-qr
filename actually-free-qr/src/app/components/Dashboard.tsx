'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

type Code = {
  id: string;
  label: string | null;
  destination_url: string;
  created_at: string;
  scan_count: number;
  fg: string | null;
  bg: string | null;
  size: number | null;
};

type Metrics = {
  total: number;
  daily: { day: string; count: number }[];
  countries: { country: string; count: number }[];
  devices: { device: string; count: number }[];
};

// helper: downloads a fresh PNG using an offscreen canvas
function downloadQrPng(opts: { value: string; size: number; fg: string; bg: string }) {
  // create a temporary canvas via DOM, render QRCodeCanvas into it, then save
  const wrap = document.createElement('div');
  wrap.style.position = 'fixed';
  wrap.style.left = '-99999px';
  document.body.appendChild(wrap);

  const ref = { current: null as HTMLCanvasElement | null };

  // mount a temporary React root is overkill — instead we can use a vanilla QR lib,
  // but since the app already uses qrcode.react, we can quickly create a canvas element and draw to it via that component.
  // Simple approach: create a shadow canvas, draw with an inline QRCodeCanvas, then toDataURL.
  // We'll just create a canvas and use QRCodeCanvas imperatively via React APIs:
  // For simplicity and reliability, fallback to 2-step: render a small invisible QR in the DOM and read its toDataURL after a tick.

  const container = document.createElement('div');
  wrap.appendChild(container);

  const el = (
    <QRCodeCanvas
      value={opts.value}
      size={opts.size}
      fgColor={opts.fg}
      bgColor={opts.bg}
      level="M"
      includeMargin={false}
      ref={(node: HTMLCanvasElement | null) => { ref.current = node; }}
    />
  );

  // Minimal client-only render:
  // @ts-ignore
  import('react-dom').then(({ createRoot }) => {
    const root = createRoot(container);
    root.render(el);
    setTimeout(() => {
      try {
        const url = ref.current?.toDataURL('image/png');
        if (url) {
          const a = document.createElement('a');
          a.href = url;
          a.download = `qr-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } finally {
        // cleanup
        root.unmount();
        wrap.remove();
      }
    }, 20);
  });
}

export default function Dashboard() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [busy, setBusy] = useState<string | null>(null);

  const loadCodes = async () => {
    const res = await fetch('/api/qr/my');
    if (!res.ok) { setCodes([]); return; }
    const data = await res.json();
    setCodes(data);
  };
  useEffect(() => { loadCodes(); }, []);

  useEffect(() => {
    if (!selected) return setMetrics(null);
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/qr/metrics?id=${selected}`);
        setMetrics(r.ok ? await r.json() : null);
      } finally { setLoading(false); }
    })();
  }, [selected]);

  const selectedCode = useMemo(() => codes.find(c => c.id === selected) || null, [codes, selected]);

  const startEdit = (c: Code) => { setEditingId(c.id); setEditValue(c.label ?? ''); };
  const cancelEdit = () => { setEditingId(null); setEditValue(''); };
  const saveEdit = async (id: string) => {
    setBusy(id);
    try {
      const r = await fetch('/api/qr/label', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, label: editValue || null }),
      });
      if (r.ok) {
        setCodes(prev => prev.map(c => c.id === id ? { ...c, label: editValue || null } : c));
        setEditingId(null);
      } else {
        alert('Rename failed.');
      }
    } finally { setBusy(null); }
  };

  const deleteCode = async (id: string) => {
    if (!confirm('Delete this QR code and all its scan data? This cannot be undone.')) return;
    setBusy(id);
    try {
      const r = await fetch(`/api/qr/${id}`, { method: 'DELETE' });
      if (r.ok) {
        setCodes(prev => prev.filter(c => c.id !== id));
        if (selected === id) { setSelected(null); setMetrics(null); }
      } else {
        alert('Delete failed.');
      }
    } finally { setBusy(null); }
  };

  return (
    <section className="mx-auto mt-10 max-w-3xl px-4">
      <h2 className="mb-3 text-lg font-semibold text-zinc-100">Your tracked QR codes</h2>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900">
        {codes.length === 0 ? (
          <div className="p-4 text-sm text-zinc-400">No tracked codes yet. Create one with the button above.</div>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {codes.map((c) => {
              const shortUrl = `${window.location.origin}/r/${c.id}`;
              const isEditing = editingId === c.id;
              const isBusy = busy === c.id;

              const fg = c.fg || '#FFFFFF';
              const bg = c.bg || '#0b0b0f';
              const fullSize = Math.min(Math.max(c.size ?? 256, 128), 2048);

              return (
                <li key={c.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Thumbnail */}
                    <div className="rounded-md border border-zinc-800 bg-zinc-950 p-2">
                      <QRCodeCanvas value={shortUrl} size={64} fgColor={fg} bgColor={bg} level="M" includeMargin={false} />
                    </div>

                    {/* Title/URL */}
                    <div className="min-w-0">
                      {!isEditing ? (
                        <div className="truncate text-zinc-100">
                          {c.label || 'Untitled'} <span className="text-zinc-500">·</span>
                          <a
                            href={shortUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-zinc-300 underline underline-offset-2 hover:text-zinc-100"
                            title={shortUrl}
                          >
                            /r/{c.id}
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-48 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/40"
                            placeholder="Label"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEdit(c.id)}
                            disabled={isBusy}
                            className="rounded-md bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-500 disabled:opacity-60"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      <div className="truncate text-xs text-zinc-500">{c.destination_url}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-300">{c.scan_count} scans</span>

                    <button
                      onClick={() => navigator.clipboard.writeText(shortUrl)}
                      className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
                    >
                      Copy link
                    </button>

                    <button
                      onClick={() => downloadQrPng({ value: shortUrl, size: fullSize, fg, bg })}
                      className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
                    >
                      Download PNG
                    </button>

                    {!isEditing && (
                      <button
                        onClick={() => startEdit(c)}
                        className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
                      >
                        Rename
                      </button>
                    )}

                    <button
                      onClick={() => setSelected(c.id)}
                      className={`rounded-md px-2 py-1 text-xs ${
                        selected === c.id
                          ? 'bg-indigo-600 text-white'
                          : 'border border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      View
                    </button>

                    <button
                      onClick={() => deleteCode(c.id)}
                      disabled={isBusy}
                      className="rounded-md border border-red-900/50 bg-red-950/50 px-2 py-1 text-xs text-red-300 hover:bg-red-900/40 disabled:opacity-60"
                      title="Delete QR + all scans"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Metrics panel unchanged */}
      {selectedCode && (
        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="mb-2 text-sm text-zinc-300">
            Analytics for <span className="font-medium">{selectedCode.label || `/r/${selectedCode.id}`}</span>
          </div>
          {loading && <div className="text-sm text-zinc-400">Loading…</div>}
          {!loading && metrics && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-800 p-3">
                <div className="text-xs text-zinc-400">Total scans</div>
                <div className="text-2xl font-semibold text-zinc-100">{metrics.total}</div>
              </div>
              <div className="rounded-xl border border-zinc-800 p-3">
                <div className="text-xs text-zinc-400">Top countries</div>
                <ul className="mt-1 space-y-1 text-sm text-zinc-300">
                  {metrics.countries.length === 0 && <li className="text-zinc-500">—</li>}
                  {metrics.countries.map((c) => (
                    <li key={c.country} className="flex justify-between">
                      <span>{c.country}</span><span>{c.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-zinc-800 p-3">
                <div className="text-xs text-zinc-400">Devices</div>
                <ul className="mt-1 space-y-1 text-sm text-zinc-300">
                  {metrics.devices.length === 0 && <li className="text-zinc-500">—</li>}
                  {metrics.devices.map((d) => (
                    <li key={d.device} className="flex justify-between">
                      <span>{d.device}</span><span>{d.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
