import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "*.jpg", "offline.html"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,svg,woff,woff2}"],
        navigateFallback: "/offline.html",
        navigateFallbackDenylist: [/^\/api/, /^\/ws/],
        runtimeCaching: [
          {
            // Cache PUBLIC API calls only (safe to cache; avoids stale private data).
            // Do NOT cache authenticated endpoints like /api/auth, /api/user, /api/bookings, /api/customer, /api/chef, /api/admin.
            urlPattern: /^https?:\/\/.*\/api\/(chefs|menu-items)(\/.*)?(\?.*)?$/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "public-api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
              networkTimeoutSeconds: 3,
              cacheableResponse: {
                // Only cache successful responses to avoid caching "offline/failed" responses.
                statuses: [200],
              },
            },
          },
          {
            // Cache images with CacheFirst strategy
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            // Cache Google Fonts with StaleWhileRevalidate
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            // Cache Google Fonts static resources
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-static",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        // Enable navigation preload for faster page loads
        navigationPreload: true,
        // Automatically reload pages when service worker updates
        disableDevLogs: false,
      },
      manifest: {
        name: "Dine Maison - Private Chef Experiences",
        short_name: "Dine Maison",
        description: "Book professional private chefs for unforgettable intimate dining experiences in your home or venue",
        start_url: "/dashboard",
        scope: "/",
        id: "/?source=pwa",
        display: "standalone",
        background_color: "#1e3a5f",
        theme_color: "#1e3a5f",
        orientation: "portrait",
        lang: "en-US",
        dir: "ltr",
        categories: ["food", "lifestyle", "business"],
        display_override: ["window-controls-overlay", "standalone", "minimal-ui", "browser"] as any,
        icons: [
          {
            src: "/pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-256x256.png",
            sizes: "256x256",
            type: "image/png",
          },
          {
            src: "/pwa-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/screenshot-mobile.png",
            sizes: "390x844",
            type: "image/png",
            form_factor: "narrow",
          },
          {
            src: "/screenshot-desktop.png",
            sizes: "1920x1080",
            type: "image/png",
            form_factor: "wide",
          },
        ],
        shortcuts: [
          {
            name: "Book a Chef",
            short_name: "Book",
            description: "Book a private chef for your event",
            url: "/chefs",
            icons: [{ src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" }],
          },
          {
            name: "View Menu",
            short_name: "Menu",
            description: "Browse available menus",
            url: "/menu",
            icons: [{ src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" }],
          },
          {
            name: "My Reservations",
            short_name: "Bookings",
            description: "View your bookings",
            url: "/bookings",
            icons: [{ src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" }],
          },
          {
            name: "Messages",
            short_name: "Chat",
            description: "View your messages",
            url: "/messages",
            icons: [{ src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" }],
          },
        ] as any,
        share_target: {
          action: "/share",
          method: "POST",
          enctype: "multipart/form-data",
          params: {
            title: "title",
            text: "text",
            url: "url",
            files: [
              {
                name: "images",
                accept: ["image/*"],
              },
            ],
          },
        } as any,
        launch_handler: {
          client_mode: ["navigate-existing", "auto"],
        } as any,
        protocol_handlers: [
          {
            protocol: "web+dinemaison",
            url: "/?action=%s",
          },
        ] as any,
        // Store readiness features
        // Note: Add your actual app store IDs when you have native apps
        related_applications: [
          // Example structure - update with actual app IDs when available
          // {
          //   platform: "play",
          //   url: "https://play.google.com/store/apps/details?id=com.dinemaison.app",
          //   id: "com.dinemaison.app",
          // },
          // {
          //   platform: "itunes",
          //   url: "https://apps.apple.com/app/dine-maison/id123456789",
          //   id: "123456789",
          // },
        ],
        // Set to false to prefer PWA installation
        // Set to true if you want users to prefer native app
        prefer_related_applications: false,
        // IARC rating - obtain from https://www.globalratings.com/
        // Add your IARC rating ID here when you get one for app store submissions
        // iarc_rating_id: "your-iarc-rating-id",
      },
      devOptions: {
        // Keep service worker OFF in dev by default.
        // It can cause confusing "You're Offline" pages during local development,
        // especially when the dev server restarts or the user opens localhost vs 127.0.0.1.
        // Enable manually with: PWA_DEV=true
        enabled: process.env.PWA_DEV === "true",
        type: "module",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3456",
        changeOrigin: true,
      },
      "/ws": {
        target: "ws://127.0.0.1:3456",
        ws: true,
      },
    },
  },
});
