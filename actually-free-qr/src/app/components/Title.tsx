'use client';

type Props = { subtitle?: string };

export default function Title({ subtitle }: Props) {
  return (
    <>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>Actually Free QR</h1>
      {subtitle && <p style={{ color: 'var(--muted)', marginTop: 4 }}>{subtitle}</p>}
    </>
  );
}
