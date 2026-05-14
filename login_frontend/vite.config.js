


import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const localBackendURL = env.VITE_BACKEND_URL || 'http://192.168.1.220:5002';
  const backendURL = new URL(localBackendURL);

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: { enabled: false }, // Disabled for local dev to avoid SW issues
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          skipWaiting: true,
          clientsClaim: true,
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
        },
        manifest: {
          name: 'Armtronix App',
          short_name: 'Armtronix',
          description: 'A Progressive Web App built with React and Vite',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' }
          ]
        }
      })
    ],
    server: {
      port: 5176,
      strictPort: true,
      host: '0.0.0.0',
      hmr: {
        overlay: false,
        protocol: "ws", // WebSocket for HMR
        host: backendURL.hostname, // ✅ e.g., "192.168.1.220"
        clientPort: 5176
      }
    },
    resolve: {
      alias: {
        'socket.io-client': '/src/api/localSocketMock.js'
      }
    }
  }
  })



// import { defineConfig, loadEnv } from 'vite'
// import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'

// export default defineConfig(({ mode }) => {
//   const env = loadEnv(mode, process.cwd(), '')

//   const localBackendURL = env.VITE_BACKEND_URL || 'http://192.168.1.220:5002';
//   const backendURL = new URL(localBackendURL);

//   return {
//     plugins: [
//       react(),
//       VitePWA({
//         registerType: 'autoUpdate',
//         devOptions: { enabled: true },
//         workbox: {
//           globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
//           skipWaiting: true,
//           clientsClaim: true,
//           maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
//         },
//         manifest: {
//           name: 'Armtronix App',
//           short_name: 'Armtronix',
//           description: 'A Progressive Web App built with React and Vite',
//           theme_color: '#ffffff',
//           background_color: '#ffffff',
//           display: 'standalone',
//           icons: [
//             { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
//             { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' }
//           ]
//         }
//       })
//     ],
//     server: {
//       port: 5176,
//       strictPort: true,
//       host: '0.0.0.0',
//       proxy: {
//         "/socket.io": {
//           target: localBackendURL,
//           ws: true,
//           secure: false,
//         }
//       },
//       hmr: {
//         protocol: "ws",
//         host: backendURL.hostname,
//         clientPort: 5176
//       },
//     },
//     optimizeDeps: {
//       include: ['react-calendar']
//     },
//     build: {
//       rollupOptions: {
//         external: ['react-calendar']
//       }
//     }
//   }
// })
