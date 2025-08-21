'use client';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
} from '@clerk/nextjs';

export default function Title({ subtitle }: { subtitle?: string }) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        {/* Logo / Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Actually{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
              Free
            </span>{' '}
            QR
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
          )}
        </div>

        {/* Auth controls */}
        <div className="flex items-center gap-3">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
            <SignOutButton>
              <button className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm text-zinc-200 hover:bg-zinc-800">
                Sign out
              </button>
            </SignOutButton>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-md border border-indigo-500 bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-500 transition">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
