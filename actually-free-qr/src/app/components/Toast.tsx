'use client';

type Props = { message: string | null };

export default function Toast({ message }: Props) {
  if (!message) return null;
  return <p style={{ fontSize: 12, color: '#065f46', marginTop: 6 }}>{message}</p>;
}
