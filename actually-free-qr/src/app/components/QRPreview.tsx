'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { MutableRefObject } from 'react';

type Props = {
  value: string;
  size: number;
  fg: string;
  bg: string;
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
};

export default function QRPreview({ value, size, fg, bg, canvasRef }: Props) {
  return (
    <section className="card" style={{ marginTop: 16, padding: 16, display: 'flex', justifyContent: 'center' }}>
      <div style={{ padding: 12, background: bg, borderRadius: 12 }}>
        {/* QRCodeCanvas forwards ref to the <canvas>. Use a callback to satisfy TS/ESLint */}
        <QRCodeCanvas
          value={value}
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
  );
}
