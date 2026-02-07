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

 sitemap: {
  siteUrl: 'https://bodyflow.com.ua',
  autoLastmod: true,

  async urls() {
    // ---------- СТАТИЧЕСКИЕ СТРАНИЦЫ ----------
    const staticPages = [
      {
        loc: '/produkty',
        hreflang: [
          { lang: 'ru', url: '/produkty' },
          { lang: 'uk', url: '/produkty' },
          { lang: 'en', url: '/products' },
        ],
        priority: 0.9,
      },
      {
        loc: '/kontakty',
        hreflang: [
          { lang: 'ru', url: '/kontakty' },
          { lang: 'uk', url: '/kontakty' },
          { lang: 'en', url: '/contacts' },
        ],
        priority: 0.7,
      },
      {
        loc: '/politika-konfidenciinosti',
        hreflang: [
          { lang: 'ru', url: '/politika-konfidencialnosti' },
          { lang: 'uk', url: '/politika-konfidenciinosti' },
          { lang: 'en', url: '/privacy-policy' },
        ],
        priority: 0.4,
      },
    ]

    // ---------- ДИНАМИЧЕСКИЕ ПРОДУКТЫ ----------
    const res = await fetch('https://api.bodyflow.com.ua/products')
    const products = await res.json()

    const productPages = products.map((p: any) => ({
      loc: `/produkty/${p.slug.uk}`,
      hreflang: [
        { lang: 'ru', url: `/produkty/${p.slug.ru}` },
        { lang: 'uk', url: `/produkty/${p.slug.uk}` },
        { lang: 'en', url: `/products/${p.slug.en}` },
      ],
      priority: 0.8,
    }))

    return [...staticPages, ...productPages]
  }
},
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
