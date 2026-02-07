export default defineNuxtConfig({
  rootDir: '.',
  srcDir: '.',

  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://nutrition-n.test/api',
    }
  },

  imports: {
    presets: [
      { from: 'vue-i18n', imports: ['useI18n'] },
    ],
  },

  modules: [
    '@nuxtjs/sitemap',
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
      // products
      { loc: '/produkty', priority: 0.9 },
      { loc: '/uk/produkty', priority: 0.9 },
      { loc: '/en/products', priority: 0.9 },

      // contact
      { loc: '/kontakty', priority: 0.7 },
      { loc: '/uk/kontakty', priority: 0.7 },
      { loc: '/en/contacts', priority: 0.7 },

      // privacy
      { loc: '/politika-konfidencialnosti', priority: 0.4 },
      { loc: '/uk/politika-konfidenciinosti', priority: 0.4 },
      { loc: '/en/privacy-policy', priority: 0.4 },
    ]

    // ---------- ДИНАМИЧЕСКИЕ ПРОДУКТЫ ----------
    try {
      const res = await fetch('https://api.bodyflow.com.ua/products')
      const products = await res.json()

      if (!Array.isArray(products)) return staticPages

      const productPages = products
        .filter((p: any) => p?.slug?.ru && p?.slug?.uk && p?.slug?.en)
        .flatMap((p: any) => ([
          { loc: `/produkty/${p.slug.ru}`, priority: 0.8 },
          { loc: `/uk/produkty/${p.slug.uk}`, priority: 0.8 },
          { loc: `/en/products/${p.slug.en}`, priority: 0.8 },
        ]))

      return [...staticPages, ...productPages]
    } catch {
      return staticPages
    }
  }
},

  css: [
    '@/assets/css/main.scss'
  ],

  vite: {
    resolve: {
      alias: {
        '@': '/.' // фикс для Windows
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
      products: { ru: '/produkty', uk: '/produkty', en: '/products' },
      'products-slug': { ru: '/produkty/[slug]', uk: '/produkty/[slug]', en: '/products/[slug]' },
      contact: { ru: '/kontakty', uk: '/kontakty', en: '/contacts' },
      'privacy-policy': { ru: '/politika-konfidencialnosti', uk: '/politika-konfidenciinosti', en: '/privacy-policy' }
    },
    ignoreRoutes: ['/api', '/sitemap.xml', '/robots.txt']
  },

  components: true
})
