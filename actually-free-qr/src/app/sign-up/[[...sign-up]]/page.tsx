'use client';
import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <SignUp appearance={{ elements: { card: 'bg-zinc-900 text-zinc-100' } }} />
    </main>
  );
}
