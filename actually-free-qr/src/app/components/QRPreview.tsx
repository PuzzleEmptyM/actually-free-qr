'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { MutableRefObject } from 'react';

export default function QRPreview({
  value, size, fg, bg, canvasRef,
}: { value: string; size: number; fg: string; bg: string; canvasRef: MutableRefObject<HTMLCanvasElement | null>; }) {
  return (
    <section className="mx-auto mt-6 max-w-3xl px-4">
      <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-6 shadow-sm backdrop-blur
                      transition hover:shadow-md dark:border-zinc-800/60 dark:bg-zinc-900/60">
        <div className="flex justify-center">
          <div className="rounded-2xl p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_12px_35px_rgba(0,0,0,0.08)]"
               style={{ background: bg }}>
            <QRCodeCanvas
              value={value}
              size={size}
              fgColor={fg}
              bgColor={bg}
              level="M"
              includeMargin={false}
              ref={(node: HTMLCanvasElement | null) => { canvasRef.current = node; }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
