'use client';
import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <SignIn appearance={{ elements: { card: 'bg-zinc-900 text-zinc-100' } }} />
    </main>
  );
}
