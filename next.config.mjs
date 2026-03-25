export default {
  experimental: {
    appDir: true,
    runtime: 'nodejs',
    serverComponents: true,
  },
  future: {
    webpack5: true,
  },
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  reactStrictMode: true,
  swcMinify: true,
  compilerOptions: {
    // @ts-ignore
    react: {
      runtime: 'automatic',
      version: '18.2.0',
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // @ts-ignore
    ignoreBuildErrors: true,
  },
  tailwindcss: {},
  env: {
    NEXT_PUBLIC_APP_NAME: 'MoodWave',
    NEXT_PUBLIC_APP_DESCRIPTION: 'Personalized Mental Wellness',
    NEXT_PUBLIC_SEO_KEYWORDS: 'mental health apps, mood tracker, anxiety management, stress relief, self care',
  },
}