'use client';
import { useEffect } from 'react';

const C = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const S = process.env.NEXT_PUBLIC_ADSENSE_SLOT;

export default function AdBanner() {
  if (!C || !S) return null;
  useEffect(() => {
    const id = 'adsbygoogle-js';
    if (!document.getElementById(id)) {
      const s = document.createElement('script');
      s.id = id; s.async = true;
      s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      s.setAttribute('data-ad-client', C);
      document.head.appendChild(s);
    }
    try { (window as any).adsbygoogle = (window as any).adsbygoogle || []; (window as any).adsbygoogle.push({}); } catch {}
  }, []);
  return (
    <div className="mx-auto max-w-3xl px-4">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: 90, marginTop: 16 }}
        data-ad-client={C}
        data-ad-slot={S}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
