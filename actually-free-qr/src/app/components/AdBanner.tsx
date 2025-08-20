'use client';

import { useEffect } from 'react';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const ADSENSE_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT;

export default function AdBanner() {
  // Render nothing if IDs aren’t set
  if (!ADSENSE_CLIENT || !ADSENSE_SLOT) return null;

  useEffect(() => {
    // Load AdSense once
    const id = 'adsbygoogle-js';
    if (!document.getElementById(id)) {
      const s = document.createElement('script');
      s.id = id;
      s.async = true;
      s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      s.setAttribute('data-ad-client', ADSENSE_CLIENT);
      document.head.appendChild(s);
    }

    // Try to render the ad unit
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch {}
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', width: '100%', minHeight: 90, marginTop: 12 }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={ADSENSE_SLOT}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
