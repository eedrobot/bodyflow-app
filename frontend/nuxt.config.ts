export default defineNuxtConfig({
  rootDir: '.',
  srcDir: '.',

  compatibilityDate: '2025-07-15',

  ssr: true,

  nitro: {
    preset: 'vercel',
  },

  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://nutrition-n.test/api',
    },
  },

  imports: {
    presets: [{ from: 'vue-i18n', imports: ['useI18n'] }],
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

  // -------------------------------
  // ✅ SITEMAP
  // -------------------------------
  sitemap: {
    siteUrl: 'https://bodyflow.com.ua',
    autoLastmod: true,
    index: true,

    async urls() {
      const apiBase =
        process.env.NUXT_PUBLIC_API_BASE?.trim() || 'https://api.bodyflow.com.ua'
      const base = apiBase.replace(/\/$/, '')

      // ✅ ВАЖНО: defaultLocale = uk, значит:
      // uk -> без префикса
      // ru -> /ru/...
      // en -> /en/...

      const staticPages = [
        // home
        { loc: '/', priority: 1.0 },      // uk default
        { loc: '/ru', priority: 1.0 },   // ru
        { loc: '/en', priority: 1.0 },   // en

        // products
        { loc: '/produkty', priority: 0.9 },      // uk default
        { loc: '/ru/produkty', priority: 0.9 },   // ru
        { loc: '/en/products', priority: 0.9 },   // en

        // contacts
        { loc: '/kontakty', priority: 0.7 },      // uk default
        { loc: '/ru/kontakty', priority: 0.7 },   // ru
        { loc: '/en/contacts', priority: 0.7 },   // en

        // privacy
        { loc: '/politika-konfidenciinosti', priority: 0.4 },        // uk default
        { loc: '/ru/politika-konfidencialnosti', priority: 0.4 },    // ru
        { loc: '/en/privacy-policy', priority: 0.4 },                // en

         // terms
        { loc: '/umovi-vikoristannya', priority: 0.4 },        // uk default
        { loc: '/ru/uslovia-ispolzovania', priority: 0.4 },    // ru
        { loc: '/en/terms-of-use', priority: 0.4 },                // en

        { loc: '/pro-nas', priority: 0.8 },        // uk default
        { loc: '/ru/o-nas', priority: 0.8 },    // ru
        { loc: '/en/about', priority: 0.8 },                // en
      ]

      try {
        // ✅ ТВОЙ API требует category_id
        const url = `${base}/products.php?category_id=1`

        const res = await fetch(url, {
          headers: { accept: 'application/json' },
        })

        if (!res.ok) {
          console.error('[sitemap] products fetch failed:', res.status, res.statusText, url)
          return staticPages
        }

        const json: any = await res.json()

        // ✅ Универсально: массив или объект с products/data
        const products = Array.isArray(json) ? json : (json?.products || json?.data || [])

        if (!Array.isArray(products) || products.length === 0) {
          console.error('[sitemap] products empty or invalid shape:', typeof json, url)
          return staticPages
        }

        // ✅ Поддержка разных форматов slug
        const getSlug = (p: any, lang: 'ru' | 'uk' | 'en') =>
          p?.slug?.[lang] ??
          p?.slug_translations?.[lang] ??
          p?.slugs?.[lang] ??
          null

        const productPages = products.flatMap((p: any) => {
          const uk = getSlug(p, 'uk')
          const ru = getSlug(p, 'ru')
          const en = getSlug(p, 'en')

          const out: any[] = []
          // ✅ uk default — без префикса
          if (uk) out.push({ loc: `/produkty/${uk}`, priority: 0.8 })
          // ✅ ru — с /ru
          if (ru) out.push({ loc: `/ru/produkty/${ru}`, priority: 0.8 })
          // ✅ en — с /en
          if (en) out.push({ loc: `/en/products/${en}`, priority: 0.8 })

          return out
        })

        console.log('[sitemap] urls generated:', staticPages.length + productPages.length)
        return [...staticPages, ...productPages]
      } catch (e: any) {
        console.error('[sitemap] exception:', e?.message || e)
        return staticPages
      }
    },
  },

  // -------------------------------
  //  ГЛОБАЛЬНЫЕ СТИЛИ
  // -------------------------------
  css: ['@/assets/css/main.scss'],

  // -------------------------------
  //  VITE + SCSS
  // -------------------------------
  vite: {
    resolve: {
      alias: {
        '@': '/.', // фикс для Windows
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@/assets/css/core/_variables.scss" as *;
            @use "@/assets/css/core/_mixins.scss" as *;
          `,
        },
      },
    },
  },

  // -------------------------------
  // ✅ I18N
  // -------------------------------
  i18n: {
    strategy: 'prefix_except_default',
    customRoutes: 'config',
    langDir: 'locales/',
    defaultLocale: 'uk',         // ✅ УКРАИНСКИЙ ПО УМОЛЧАНИЮ
    vueI18n: './i18n.config',

    locales: [
      { code: 'uk', iso: 'uk-UA', file: 'uk.json' },
      { code: 'ru', iso: 'ru-RU', file: 'ru.json' },
      { code: 'en', iso: 'en-US', file: 'en.json' },
    ],

    pages: {
      products: {
        uk: '/produkty',
        ru: '/produkty',
        en: '/products',
      },
      'products-slug': {
        uk: '/produkty/[slug]',
        ru: '/produkty/[slug]',
        en: '/products/[slug]',
      },
      contact: {
        uk: '/kontakty',
        ru: '/kontakty',
        en: '/contacts',
      },
      'privacy-policy': {
        uk: '/politika-konfidenciinosti',
        ru: '/politika-konfidencialnosti',
        en: '/privacy-policy',
      },
      terms: {
        uk: '/umovi-vikoristannya',
        ru: '/uslovia-ispolzovania',
        en: '/terms-of-use',
      },
      about: {
        uk: '/pro-nas',
        ru: '/o-nas',
        en: '/about',
      }
    },

    ignoreRoutes: [
      '/api',
      '/robots.txt',
      '/sitemap.xml',
      '/sitemap_index.xml',
      '/__sitemap__/**',
    ],
  },

  components: true,
})
