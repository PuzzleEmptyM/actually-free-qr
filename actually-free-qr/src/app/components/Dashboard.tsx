'use client';

import { useEffect, useMemo, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

type Code = {
  id: string;
  label: string | null;
  destination_url: string;
  created_at: string;
  fg: string | null;
  bg: string | null;
  size: number | null;
  impression_count: number;
  view_count: number;
};

type Metrics = {
  impressions: number;
  views: number;
  dailyViews: { day: string; count: number }[];
  countriesImpr: { country: string; impressions: number }[];
  countriesViews: { country: string; views: number }[];
  devicesViews: { device: string; count: number }[];
};

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ??
  (typeof window !== 'undefined' ? window.location.origin : '');

type SortKey = 'label' | 'impressions' | 'views' | 'created';
type SortDir = 'asc' | 'desc';

function SortHeader({
  label,
  active,
  dir,
  onClick,
  align = 'left',
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: 'left' | 'right';
}) {
  return (
    <button
      onClick={onClick}
      className={`group inline-flex w-full items-center gap-1 whitespace-nowrap text-zinc-300 hover:text-zinc-100 ${
        align === 'right' ? 'justify-end text-right' : 'justify-start text-left'
      }`}
      title={`Sort by ${label}`}
    >
      <span>{label}</span>
      {active && (
        <span
          aria-hidden
          className="translate-y-[1px] text-xs text-zinc-400 group-hover:text-zinc-300"
        >
          {dir === 'asc' ? '▲' : '▼'}
        </span>
      )}
    </button>
  );
}

export default function Dashboard() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null); // inline details
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [busy, setBusy] = useState<string | null>(null);

  // table sort state
  const [sortKey, setSortKey] = useState<SortKey>('created');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // countries sort (metrics panel)
  const [countrySortKey, setCountrySortKey] =
    useState<'country' | 'impressions' | 'views'>('views');
  const [countrySortDir, setCountrySortDir] = useState<SortDir>('desc');

  // load codes
  useEffect(() => {
    (async () => {
      const r = await fetch('/api/qr/my');
      setCodes(r.ok ? await r.json() : []);
    })();
  }, []);

  // load metrics for expanded item
  useEffect(() => {
    if (!expandedId) { setMetrics(null); return; }
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/qr/metrics?id=${expandedId}`);
        setMetrics(r.ok ? await r.json() : null);
      } finally {
        setLoading(false);
      }
    })();
  }, [expandedId]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  // sort helpers
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sortedCodes = useMemo(() => {
    const arr = [...codes];
    arr.sort((a, b) => {
      let A: string | number, B: string | number;
      if (sortKey === 'label') {
        A = (a.label ?? '').toLowerCase();
        B = (b.label ?? '').toLowerCase();
      } else if (sortKey === 'impressions') {
        A = a.impression_count; B = b.impression_count;
      } else if (sortKey === 'views') {
        A = a.view_count; B = b.view_count;
      } else {
        A = new Date(a.created_at).getTime();
        B = new Date(b.created_at).getTime();
      }
      if (A < B) return sortDir === 'asc' ? -1 : 1;
      if (A > B) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [codes, sortKey, sortDir]);

  const toggleCountrySort = (key: 'country' | 'impressions' | 'views') => {
    if (countrySortKey === key) setCountrySortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setCountrySortKey(key); setCountrySortDir('asc'); }
  };

  const countriesMerged = useMemo(() => {
    if (!metrics) return [];
    const map = new Map<string, { country: string; impressions: number; views: number }>();
    for (const i of metrics.countriesImpr) {
      map.set(i.country, { country: i.country, impressions: i.impressions, views: 0 });
    }
    for (const v of metrics.countriesViews) {
      const prev = map.get(v.country);
      if (prev) prev.views = v.views;
      else map.set(v.country, { country: v.country, impressions: 0, views: v.views });
    }
    const arr = [...map.values()];
    arr.sort((a, b) => {
      let A: string | number, B: string | number;
      if (countrySortKey === 'country') { A = a.country; B = b.country; }
      else if (countrySortKey === 'impressions') { A = a.impressions; B = b.impressions; }
      else { A = a.views; B = b.views; }
      if (A < B) return countrySortDir === 'asc' ? -1 : 1;
      if (A > B) return countrySortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [metrics, countrySortKey, countrySortDir]);

  // actions
  const startEdit = (c: Code) => { setEditingId(c.id); setEditValue(c.label ?? ''); };
  const saveEdit = async (id: string) => {
    setBusy(id);
    try {
      const r = await fetch('/api/qr/label', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, label: editValue || null }),
      });
      if (r.ok) {
        setCodes((prev) => prev.map((c) => (c.id === id ? { ...c, label: editValue || null } : c)));
        setEditingId(null);
      } else alert('Rename failed.');
    } finally { setBusy(null); }
  };
  const deleteCode = async (id: string) => {
    if (!confirm('Delete this QR code and all its analytics?')) return;
    setBusy(id);
    try {
      const r = await fetch(`/api/qr/${id}`, { method: 'DELETE' });
      if (r.ok) {
        setCodes((prev) => prev.filter((c) => c.id !== id));
        if (expandedId === id) { setExpandedId(null); setMetrics(null); }
      } else alert('Delete failed.');
    } finally { setBusy(null); }
  };

  // ====== UI ======
  return (
    <section className="mx-auto mt-10 max-w-3xl px-4">
      <h2 className="mb-3 text-lg font-semibold text-zinc-100">Your tracked QR codes</h2>

      {/* Mobile cards (no horizontal scroll) */}
      <div className="grid gap-3 sm:hidden">
        {/* Mobile sort selector */}
        <div className="flex items-center gap-2">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
          >
            <option value="created">Created</option>
            <option value="label">Label</option>
            <option value="impressions">Impressions</option>
            <option value="views">Views</option>
          </select>
          <button
            onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
            title="Toggle sort direction"
          >
            {sortDir === 'asc' ? 'Asc ▲' : 'Desc ▼'}
          </button>
        </div>

        {sortedCodes.length === 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">
            No tracked codes yet.
          </div>
        )}

        {sortedCodes.map((c) => {
          const shortUrl = `${BASE_URL}/r/${c.id}`;
          const fg = c.fg || '#FFFFFF';
          const bg = c.bg || '#0b0b0f';
          const busyRow = busy === c.id;
          const isOpen = expandedId === c.id;

          return (
            <div key={c.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
              <div className="flex items-center gap-3">
                <div className="rounded-md border border-zinc-800 bg-zinc-950 p-1">
                  <QRCodeCanvas value={shortUrl} size={36} fgColor={fg} bgColor={bg} />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-zinc-100">{c.label || 'Untitled'}</div>
                  <a
                    className="truncate text-sm text-zinc-300 underline underline-offset-2 hover:text-zinc-100"
                    href={shortUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    /r/{c.id}
                  </a>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-300 tabular-nums">
                    {c.impression_count} imp
                  </span>
                  <span className="rounded-full bg-indigo-600 px-2 py-1 text-xs text-white tabular-nums">
                    {c.view_count} views
                  </span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {editingId !== c.id ? (
                  <button
                    onClick={() => { setEditingId(c.id); setEditValue(c.label ?? ''); }}
                    className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
                  >
                    Rename
                  </button>
                ) : (
                  <div className="col-span-2 flex items-center gap-2">
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-sm text-zinc-100 outline-none"
                      placeholder="Label"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(c.id)}
                      disabled={busyRow}
                      className="rounded-md bg-indigo-600 px-2 py-1 text-xs text-white disabled:opacity-60"
                    >Save</button>
                    <button
                      onClick={() => (setEditingId(null), setEditValue(''))}
                      className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
                    >Cancel</button>
                  </div>
                )}

                <button
                  onClick={() => navigator.clipboard.writeText(shortUrl)}
                  className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => toggleExpand(c.id)}
                  className={`rounded-md px-2 py-1 text-xs ${
                    isOpen
                      ? 'bg-indigo-600 text-white'
                      : 'border border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {isOpen ? 'Hide' : 'View'}
                </button>
                <button
                  onClick={() => deleteCode(c.id)}
                  disabled={busyRow}
                  className="rounded-md border border-red-900/50 bg-red-950/50 px-2 py-1 text-xs text-red-300 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>

              {/* Inline details inside the card */}
              {isOpen && (
                <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3 animate-[fadeIn_120ms_ease-out]">
                  <div className="grid gap-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg border border-zinc-800 p-2">
                        <div className="text-[11px] text-zinc-400">Imp</div>
                        <div className="tabular-nums text-lg font-semibold text-zinc-100">
                          {loading || !metrics ? '—' : metrics.impressions}
                        </div>
                      </div>
                      <div className="rounded-lg border border-zinc-800 p-2">
                        <div className="text-[11px] text-zinc-400">Views</div>
                        <div className="tabular-nums text-lg font-semibold text-zinc-100">
                          {loading || !metrics ? '—' : metrics.views}
                        </div>
                      </div>
                      <div className="rounded-lg border border-zinc-800 p-2">
                        <div className="text-[11px] text-zinc-400">Devices</div>
                        <div className="text-sm text-zinc-300">
                          {!metrics || metrics.devicesViews.length === 0
                            ? '—'
                            : metrics.devicesViews.map(d => `${d.device}:${d.count}`).join(' · ')}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-zinc-800 p-2">
                      <div className="mb-1 text-[11px] text-zinc-400">Top Countries</div>
                      <ul className="space-y-1 text-sm text-zinc-300">
                        {!metrics || countriesMerged.length === 0 ? (
                          <li className="text-zinc-500">No data</li>
                        ) : countriesMerged.slice(0, 6).map(row => (
                          <li key={row.country} className="flex justify-between">
                            <span>{row.country}</span>
                            <span className="tabular-nums">{row.impressions}/{row.views}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-lg border border-zinc-800 p-2">
                      <div className="mb-1 text-[11px] text-zinc-400">Views — 14d</div>
                      <div className="flex items-end gap-1">
                        {!metrics || metrics.dailyViews.length === 0 ? (
                          <div className="text-sm text-zinc-500">No data</div>
                        ) : metrics.dailyViews.map(d => (
                            <div key={d.day} className="bg-indigo-600"
                              style={{ height: Math.max(3, Math.min(36, d.count * 3)), width: 6, borderRadius: 2 }}
                              title={`${d.day}: ${d.count}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop / tablet table */}
      <div className="hidden sm:block">
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-12" />                 {/* QR */}
              <col className="w-[28%]" />              {/* Label */}
              <col className="w-[26%] md:w-[28%]" />   {/* Short link */}
              <col className="w-[12%]" />              {/* Impr */}
              <col className="w-[12%]" />              {/* Views */}
              <col className="hidden lg:table-column w-[12%]" /> {/* Created (lg+) */}
              <col className="w-[18%] md:w-[12%] lg:w-[12%]" />  {/* Actions */}
            </colgroup>

            <thead className="bg-zinc-900/60">
              <tr className="text-zinc-300">
                <th className="px-3 py-2 text-left">QR</th>
                <th className="px-3 py-2">
                  <SortHeader label="Label" active={sortKey === 'label'} dir={sortDir} onClick={() => toggleSort('label')} />
                </th>
                <th className="px-3 py-2 text-left">Short link</th>
                <th className="px-3 py-2">
                  <SortHeader label="Impressions" active={sortKey === 'impressions'} dir={sortDir} onClick={() => toggleSort('impressions')} align="right" />
                </th>
                <th className="px-3 py-2">
                  <SortHeader label="Views" active={sortKey === 'views'} dir={sortDir} onClick={() => toggleSort('views')} align="right" />
                </th>
                <th className="hidden px-3 py-2 lg:table-cell">
                  <SortHeader label="Created" active={sortKey === 'created'} dir={sortDir} onClick={() => toggleSort('created')} align="right" />
                </th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800">
              {sortedCodes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-zinc-400">No tracked codes yet.</td>
                </tr>
              )}

              {sortedCodes.map((c) => {
                const shortUrl = `${BASE_URL}/r/${c.id}`;
                const fg = c.fg || '#FFFFFF';
                const bg = c.bg || '#0b0b0f';
                const busyRow = busy === c.id;
                const isOpen = expandedId === c.id;

                return (
                  <>
                    <tr key={c.id} className="align-middle">
                      <td className="px-3 py-2">
                        <div className="rounded border border-zinc-800 bg-zinc-950 p-0.5">
                          <QRCodeCanvas value={shortUrl} size={28} fgColor={fg} bgColor={bg} />
                        </div>
                      </td>

                      <td className="px-3 py-2">
                        {editingId !== c.id ? (
                          <span className="block max-w-full truncate text-zinc-100">
                            {c.label || 'Untitled'}
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-44 truncate rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-zinc-100 outline-none"
                              placeholder="Label"
                              autoFocus
                            />
                            <button
                              onClick={() => saveEdit(c.id)}
                              disabled={busyRow}
                              className="rounded-md bg-indigo-600 px-2 py-1 text-xs text-white disabled:opacity-60"
                            >Save</button>
                            <button
                              onClick={() => (setEditingId(null), setEditValue(''))}
                              className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
                            >Cancel</button>
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-2">
                        <a
                          href={shortUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block max-w-full truncate text-zinc-300 underline underline-offset-2 hover:text-zinc-100"
                          title={shortUrl}
                        >
                          /r/{c.id}
                        </a>
                      </td>

                      <td className="px-3 py-2 text-right tabular-nums">{c.impression_count}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{c.view_count}</td>
                      <td className="hidden px-3 py-2 text-right text-zinc-400 lg:table-cell whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-3 py-2">
                        <div className="flex flex-wrap justify-end gap-1">
                          {editingId !== c.id && (
                            <button
                              onClick={() => { setEditingId(c.id); setEditValue(c.label ?? ''); }}
                              className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
                            >Rename</button>
                          )}
                          <button
                            onClick={() => navigator.clipboard.writeText(shortUrl)}
                            className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
                          >Copy Link</button>
                          <button
                            onClick={() => toggleExpand(c.id)}
                            className={`rounded-md px-2 py-1 text-xs ${
                              isOpen
                                ? 'bg-indigo-600 text-white'
                                : 'border border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800'
                            }`}
                          >{isOpen ? 'Hide' : 'View'}</button>
                          <button
                            onClick={() => deleteCode(c.id)}
                            disabled={busyRow}
                            className="rounded-md border border-red-900/50 bg-red-950/50 px-2 py-1 text-xs text-red-300 disabled:opacity-60"
                          >Delete</button>
                        </div>
                      </td>
                    </tr>

                    {/* Inline details row */}
                    {isOpen && (
                      <tr key={`${c.id}-details`} className="bg-zinc-950/40">
                        <td colSpan={7} className="px-3 pb-4">
                          <div className="mt-2 rounded-xl border border-zinc-800 bg-zinc-900 p-4 animate-[fadeIn_120ms_ease-out]">
                            <div className="mb-3 grid gap-3 sm:grid-cols-3">
                              <div className="rounded-lg border border-zinc-800 p-3">
                                <div className="text-xs text-zinc-400">Impressions</div>
                                <div className="tabular-nums text-2xl font-semibold text-zinc-100">
                                  {loading || !metrics ? '—' : metrics.impressions}
                                </div>
                              </div>
                              <div className="rounded-lg border border-zinc-800 p-3">
                                <div className="text-xs text-zinc-400">Views</div>
                                <div className="tabular-nums text-2xl font-semibold text-zinc-100">
                                  {loading || !metrics ? '—' : metrics.views}
                                </div>
                              </div>
                              <div className="rounded-lg border border-zinc-800 p-3">
                                <div className="text-xs text-zinc-400">Devices (views)</div>
                                <ul className="mt-1 space-y-1 text-sm text-zinc-300">
                                  {!metrics || metrics.devicesViews.length === 0
                                    ? <li className="text-zinc-500">—</li>
                                    : metrics.devicesViews.map(d => (
                                        <li key={d.device} className="flex justify-between">
                                          <span>{d.device}</span><span>{d.count}</span>
                                        </li>
                                      ))}
                                </ul>
                              </div>
                            </div>

                            <div className="overflow-hidden rounded-lg border border-zinc-800">
                              <table className="w-full table-fixed text-sm">
                                <colgroup>
                                  <col className="w-[60%]" />
                                  <col className="w-[20%]" />
                                  <col className="w-[20%]" />
                                </colgroup>
                                <thead className="bg-zinc-900/60">
                                  <tr className="text-zinc-300">
                                    <th className="px-3 py-2">
                                      <SortHeader
                                        label="Country"
                                        active={countrySortKey === 'country'}
                                        dir={countrySortDir}
                                        onClick={() => toggleCountrySort('country')}
                                      />
                                    </th>
                                    <th className="px-3 py-2">
                                      <SortHeader
                                        label="Impressions"
                                        active={countrySortKey === 'impressions'}
                                        dir={countrySortDir}
                                        onClick={() => toggleCountrySort('impressions')}
                                        align="right"
                                      />
                                    </th>
                                    <th className="px-3 py-2">
                                      <SortHeader
                                        label="Views"
                                        active={countrySortKey === 'views'}
                                        dir={countrySortDir}
                                        onClick={() => toggleCountrySort('views')}
                                        align="right"
                                      />
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                  {(!metrics || countriesMerged.length === 0) && (
                                    <tr><td colSpan={3} className="px-3 py-3 text-zinc-500">No data yet</td></tr>
                                  )}
                                  {metrics && countriesMerged.map(row => (
                                    <tr key={row.country}>
                                      <td className="px-3 py-2">{row.country}</td>
                                      <td className="px-3 py-2 text-right tabular-nums">{row.impressions}</td>
                                      <td className="px-3 py-2 text-right tabular-nums">{row.views}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <div className="mt-3 rounded-lg border border-zinc-800 p-3">
                              <div className="mb-1 text-xs text-zinc-400">Views — last 14 days</div>
                              <div className="flex items-end gap-1">
                                {!metrics || metrics.dailyViews.length === 0
                                  ? <div className="text-sm text-zinc-500">No data yet</div>
                                  : metrics.dailyViews.map(d => (
                                      <div key={d.day} className="bg-indigo-600"
                                        title={`${d.day}: ${d.count}`}
                                        style={{ height: Math.max(3, Math.min(40, d.count * 4)), width: 8, borderRadius: 2 }}
                                      />
                                    ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
