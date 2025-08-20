import type { NextConfig } from 'next'
import withPWA from 'next-pwa'

const base: NextConfig = {
  reactStrictMode: true,
  experimental: { optimizeCss: true },
}

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})(base)
