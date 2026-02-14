export default defineNuxtConfig({
  rootDir: '.',
  srcDir: '.',

  compatibilityDate: '2025-07-15',

  ssr: true,

    nitro: {
    preset: 'vercel'
  },

  devtools: { enabled: true },

runtimeConfig: {
  public: {
    apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://nutrition-n.test/api'
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

  index: true,

  async urls() {
    // ✅ В nuxt.config надёжнее брать env напрямую, а не useRuntimeConfig()
    const apiBase =
      process.env.NUXT_PUBLIC_API_BASE?.trim() || 'https://api.bodyflow.com.ua'

    const base = apiBase.replace(/\/$/, '')

    // ✅ Статические страницы
    const staticPages = [
      { loc: '/', priority: 1.0 },
      { loc: '/uk', priority: 1.0 },
      { loc: '/en', priority: 1.0 },

      { loc: '/produkty', priority: 0.9 },
      { loc: '/uk/produkty', priority: 0.9 },
      { loc: '/en/products', priority: 0.9 },

      { loc: '/kontakty', priority: 0.7 },
      { loc: '/uk/kontakty', priority: 0.7 },
      { loc: '/en/contacts', priority: 0.7 },

      { loc: '/politika-konfidencialnosti', priority: 0.4 },
      { loc: '/uk/politika-konfidenciinosti', priority: 0.4 },
      { loc: '/en/privacy-policy', priority: 0.4 },
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
        const ru = getSlug(p, 'ru')
        const uk = getSlug(p, 'uk')
        const en = getSlug(p, 'en')

        // если какого-то языка нет — просто не добавляем этот URL
        const out: any[] = []
        if (ru) out.push({ loc: `/produkty/${ru}`, priority: 0.8 })
        if (uk) out.push({ loc: `/uk/produkty/${uk}`, priority: 0.8 })
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
    ignoreRoutes: [
      '/api',
      '/robots.txt',
      '/sitemap.xml',
      '/sitemap_index.xml',
      '/__sitemap__/**'
    ]
  },

  components: true
})
