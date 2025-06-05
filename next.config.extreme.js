
  /** @type {import('next').NextConfig} */
  module.exports = {
    reactStrictMode: false,
    swcMinify: false, // Minification lente, désactiver en dev
    compiler: {
      removeConsole: process.env.NODE_ENV === 'production',
    },
    transpilePackages: ['@chakra-ui/react', 'next-auth'],
    experimental: {
      turbotrace: false,
      forceSwcTransforms: true,
      serverActions: {
        bodySizeLimit: '2mb',
      },
      optimizeCss: false,
      webpackBuildWorker: false,
      serverComponentsExternalPackages: [],
    },
    webpack: (config, { dev, isServer }) => {
      // Pour dev seulement, sans minification
      if (dev) {
        config.optimization.minimize = false;
        config.optimization.minimizer = [];
      }
      
      // Ignorer les styles en dev pour SQLite
      config.resolve.alias = {
        ...config.resolve.alias,
        'next/font/google': require.resolve('./src/mocks/next-font.js'),
      };
      
      return config;
    },
    onDemandEntries: {
      // Garder les pages en mémoire longtemps
      maxInactiveAge: 1000 * 60 * 60,
      pagesBufferLength: 5,
    },
  };
  