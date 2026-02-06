export default defineNuxtConfig({
  rootDir: '.',
  srcDir: '.',

  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  // ✅ ДОБАВИТЬ ЭТО
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://nutrition-n.test/api',
    }
  },

  imports: {
    presets: [
      {
        from: 'vue-i18n',
        imports: ['useI18n'],
      },
    ],
  },

  modules: [
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],

  // -------------------------------
  //  ГЛОБАЛЬНЫЕ СТИЛИ
  // -------------------------------
  css: [
    '@/assets/css/main.scss'
  ],

  // -------------------------------
  //  VITE + SCSS
  // -------------------------------
  vite: {
    resolve: {
      alias: {
        '@': '/.'   // ← это фикс для Windows
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@/assets/css/core/_variables.scss" as *;
            @use "@/assets/css/core/_mixins.scss" as *;
          `
        }
      }
    }
  },

  // -------------------------------
  //  i18n
  // -------------------------------
  i18n: {
    strategy: 'prefix_except_default',
    customRoutes: 'config',
    langDir: 'locales/',
    defaultLocale: 'ru',
    vueI18n: './i18n.config',
    locales: [
      { code: 'ru', iso: 'ru-RU', file: 'ru.json' },
      { code: 'en', iso: 'en-US', file: 'en.json' },
      { code: 'uk', iso: 'uk-UA', file: 'uk.json' }
    ],
    pages: {
      products: {
        ru: '/produkty',
        uk: '/produkty',
        en: '/products'
      },

      'products-slug': {
        ru: '/produkty/[slug]',
        uk: '/produkty/[slug]',
        en: '/products/[slug]'
      },

      contact: {
        ru: '/kontakty',
        uk: '/kontakty',
        en: '/contacts'
      },

      'privacy-policy': {
        ru: '/politika-konfidencialnosti',
        uk: '/politika-konfidenciinosti',
        en: '/privacy-policy'
      }
    },
    ignoreRoutes: ['/api']
  },

  components: true
})
