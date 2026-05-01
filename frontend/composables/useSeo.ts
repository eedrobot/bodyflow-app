export function useSeo(options = {}) {
  const route = useRoute()
  const { t, locale } = useI18n()
  const switchLocalePath = useSwitchLocalePath()

  const baseUrl = 'https://bodyflow.com.ua'
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
    return v || '/og/default.png'
  })

  const canonical = computed(() => baseUrl + route.path)
  const currentLang = computed(() => locale.value)

  const schema = computed(() => (options.schema ? unref(options.schema) : null))

  useHead({
    title,

    htmlAttrs: { lang: currentLang },

    link: computed(() => [
      { rel: 'canonical', href: canonical.value },

      ...locales.map(code => ({
        rel: 'alternate',
        hreflang: code,
        href: baseUrl + switchLocalePath(code)
      })),

      {
        rel: 'alternate',
        hreflang: 'x-default',
        href: baseUrl + switchLocalePath('en')
      }
    ]),

    meta: [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },

      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'article' },
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