export function useSeo(options: Record<string, any> = {}) {
  const route = useRoute()
  const { t, locale } = useI18n()
  const switchLocalePath = useSwitchLocalePath()
  const config = useRuntimeConfig()

  const baseUrl = String(config.public.siteUrl || 'http://localhost:3000').replace(/\/$/, '')
  const locales = ['ru', 'en', 'uk']

  const title = computed(() => {
    if (options.title) return unref(options.title)
    if (options.titleKey) return t(options.titleKey)
    return ''
  })

  const description = computed(() => {
    if (options.description) return unref(options.description)
    if (options.descriptionKey) return t(options.descriptionKey)
    return ''
  })

  const keywords = computed(() => {
    if (options.keywords) return unref(options.keywords)
    if (options.keywordsKey) return t(options.keywordsKey)
    return ''
  })

  const image = computed(() => {
    const v = options.image ? unref(options.image) : ''
    const src = v || '/seo/main-og.png'
    if (/^https?:\/\//i.test(src)) return src
    return baseUrl + (src.startsWith('/') ? src : `/${src}`)
  })

  const canonical = computed(() => {
    const path = options.canonicalPath ? unref(options.canonicalPath) : route.path
    if (/^https?:\/\//i.test(path)) return path
    return baseUrl + (path.startsWith('/') ? path : `/${path}`)
  })
  const currentLang = computed(() => locale.value)
  const type = computed(() => options.type ? unref(options.type) : 'website')

  const schema = computed(() => (options.schema ? unref(options.schema) : null))
  const alternatePaths = computed(() => (options.alternatePaths ? unref(options.alternatePaths) : null))
  const xDefaultLocale = computed(() => (options.xDefaultLocale ? unref(options.xDefaultLocale) : 'uk'))

  const absoluteUrl = (path: string) => {
    if (/^https?:\/\//i.test(path)) return path
    return baseUrl + (path.startsWith('/') ? path : `/${path}`)
  }

  useHead({
    title,

    htmlAttrs: { lang: currentLang },

    link: computed(() => [
      { rel: 'canonical', href: canonical.value },

      ...locales.map(code => ({
        rel: 'alternate',
        hreflang: code,
        href: absoluteUrl(alternatePaths.value?.[code] || switchLocalePath(code))
      })),

      {
        rel: 'alternate',
        hreflang: 'x-default',
        href: absoluteUrl(alternatePaths.value?.[xDefaultLocale.value] || switchLocalePath(xDefaultLocale.value))
      }
    ]),

    meta: [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },

      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: type },
      { property: 'og:url', content: canonical },
      { property: 'og:image', content: image },

      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ],

    script: computed(() =>
      schema.value
        ? [{ type: 'application/ld+json', children: JSON.stringify(schema.value) }]
        : []
    ),
  })
}
