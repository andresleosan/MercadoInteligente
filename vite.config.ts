import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(async () => {
  const plugins: any[] = [react()]

  // Try to load vite-plugin-pwa if available (build environments may not install it)
  try {
    // dynamic import so installation is optional
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = await import('vite-plugin-pwa')
    const VitePWA = mod.VitePWA || mod.default
    plugins.push(
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Mercado Inteligente',
          short_name: 'Mercado',
          description: 'Controlá tus gastos de mercado y registra compras con OCR',
          theme_color: '#10B981',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: '/icons/icon-192.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
            {
              src: '/icons/icon-512.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
      }),
    )
  } catch (e) {
    // plugin not installed in this environment; continue without PWA
    // console.info('vite-plugin-pwa not available, skipping PWA plugin')
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
  }
})
