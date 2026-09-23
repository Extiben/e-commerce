import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      { pathname: '/products/**', search: '' },
      { pathname: '/brand/**', search: '' },
      { pathname: '/media/**', search: '' },
    ],
    qualities: [75, 90],
  },
  // Permite abrir el servidor de desarrollo desde túneles / previews
  allowedDevOrigins: ['*.e2b.app'],
  experimental: {
    serverActions: { allowedOrigins: ['*.e2b.app'], bodySizeLimit: '8mb' },
  },
}

export default nextConfig
