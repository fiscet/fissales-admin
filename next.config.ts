import type { NextConfig } from 'next';
import { remoteImagePatterns } from '@/lib/images';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: remoteImagePatterns,
  },
  // Remove outputFileTracingRoot as it's causing deployment issues on Vercel
  // This setting is typically not needed for standard Next.js apps
};

export default nextConfig;
