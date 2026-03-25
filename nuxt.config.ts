// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '~/modules/lucide.ts'
  ],
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  },
  typescript: {
    strict: true
  },
  runtimeConfig: {
    apiBase: 'http://localhost:5001/api', // Server-side base URL (overridden by NUXT_API_BASE)
    public: {
      apiBase: 'http://localhost:5001/api', // Client-side base URL (overridden by NUXT_PUBLIC_API_BASE)
    }
  }

})
