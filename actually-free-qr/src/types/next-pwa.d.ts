declare module 'next-pwa' {
  import type { NextConfig } from 'next'
  type WithPWA = (opts?: any) => (config: NextConfig) => NextConfig
  const withPWA: WithPWA
  export default withPWA
}
