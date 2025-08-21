import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: 'Actually Free QR — Free QR Generator',
  description: '100% client-side QR generator. No watermark. No login.',
  manifest: '/manifest.json',
  themeColor: '#0b0b0f',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
        <head>
          {/* AdSense site verification */}
          <meta name="google-adsense-account" content="ca-pub-6089694234259763" />
        </head>
        <body className="bg-zinc-950 text-zinc-100 antialiased">
          <div className="min-h-dvh flex flex-col">
            {children}
            <footer className="mt-10 px-4 py-6 text-center text-sm text-zinc-400">
              <a href="/privacy" className="underline underline-offset-4 hover:text-zinc-200">
                Privacy
              </a>
              <span className="mx-2">•</span>
              <span>Supported by ads to keep it free</span>
            </footer>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
