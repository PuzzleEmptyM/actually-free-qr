import './globals.css';

export const metadata = {
  title: 'Actually Free QR — Free QR Generator',
  description: '100% client-side QR generator. No watermark. No login.',
  manifest: '/manifest.json',
  themeColor: '#111827',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons: [{ rel: 'icon', url: '/favicon.ico' }]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-6089694234259763" />
      </head>
      <body className="bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased">
        <div className="min-h-dvh flex flex-col">
          {children}
          <footer className="mt-10 px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            <a href="/privacy" className="underline underline-offset-4 hover:text-zinc-700 dark:hover:text-zinc-200">
              Privacy
            </a>
            <span className="mx-2">•</span>
            <span>Supported by ads to keep it free</span>
          </footer>
        </div>

        {/* Dark mode bootstrap (system + saved pref) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    const pref = localStorage.getItem('theme');
    const sys = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (pref === 'dark' || (!pref && sys)) document.documentElement.dataset.theme = 'dark';
  } catch (e) {}
})();`
          }}
        />
      </body>
    </html>
  );
}
