export const metadata = {
  title: 'Actually Free QR',
  description: '100% free QR generator',
  manifest: '/manifest.json',
  themeColor: '#111827',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons: [{ rel: 'icon', url: '/favicon.ico' }]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* AdSense site verification */}
        <meta name="google-adsense-account" content="ca-pub-6089694234259763" />
      </head>
      <body>
        {children}
        <footer>…</footer>
      </body>
    </html>
  );
}
