import { defineStore } from 'pinia'
import {
  getCategoriesDataFromApi,
  getProductsDataFromApi,
  getProductDataFromApi
} from '@/utils/api'

export const useNutritionData = defineStore('nutrition', {
  state: () => ({
    categoriesData: [],
    categoriesDataLoadedAt: null,

    productsByCategories: {},
    productsByCategoriesLoadedAt: {},

    productCache: {},
    productCacheLoadedAt: {},

    productData: null,

    expandedCategory: null,
    errorKey: '',
    lastLang: null,
    isLoading: false
  }),

  actions: {
    clearAllDataOnLangChange(newLang) {
      this.lastLang = newLang

      this.categoriesData = []
      this.categoriesDataLoadedAt = null

      this.productsByCategories = {}
      this.productsByCategoriesLoadedAt = {}

      this.productCache = {}
      this.productCacheLoadedAt = {}

      this.productData = null
      this.expandedCategory = null
    },

async getCategoriesData() {
  const { $i18n } = useNuxtApp()
  const lang = $i18n.locale.value

  const now = Date.now()
  const TTL = 24 * 60 * 60 * 1000

  if (this.lastLang !== lang) {
    this.clearAllDataOnLangChange(lang)
  }

  if (this.categoriesData.length && this.categoriesDataLoadedAt && (now - this.categoriesDataLoadedAt < TTL)) {
    return this.categoriesData
  }

  this.isLoading = true
  try {
    const data = await getCategoriesDataFromApi(lang)

    // ✅ ВСТАВИТЬ ВОТ ЭТО
    const parsed = typeof data === 'string' ? JSON.parse(data) : data
    this.categoriesData = parsed

    this.categoriesDataLoadedAt = now
    this.lastLang = lang
    this.errorKey = ''
    return parsed
  } catch (err) {
    this.errorKey = 'error.general'
    throw err
  } finally {
    this.isLoading = false
  }
},

    async getProductsData(category_id) {
  const { $i18n } = useNuxtApp()
  const lang = $i18n.locale.value

  const catId = Number(category_id)
  if (!catId) return []

  // ✅ кэш по категории + языку (но хранится внутри category_id, чтобы шаблон не трогать)
  if (this.productsByCategories[catId]?.[lang]) {
    return this.productsByCategories[catId][lang]
  }

  this.isLoading = true
  try {
    const data = await getProductsDataFromApi(catId, lang)

    if (!this.productsByCategories[catId] || typeof this.productsByCategories[catId] !== 'object') {
      this.productsByCategories[catId] = {}
    }
    this.productsByCategories[catId][lang] = data

    if (!this.productsByCategoriesLoadedAt || typeof this.productsByCategoriesLoadedAt !== 'object') {
      this.productsByCategoriesLoadedAt = {}
    }
    if (!this.productsByCategoriesLoadedAt[catId] || typeof this.productsByCategoriesLoadedAt[catId] !== 'object') {
      this.productsByCategoriesLoadedAt[catId] = {}
    }
    this.productsByCategoriesLoadedAt[catId][lang] = Date.now()

    return data
  } finally {
    this.isLoading = false
  }
},

    async toggleCategory(category_id) {
      if (!this.productsByCategories[category_id]) {
        await this.getProductsData(category_id)
      }
    },

    async getProductData({ slug, lang }) {
      const safeSlug = String(slug || '').trim()
      const safeLang = String(lang || 'ru').trim()

      if (!safeSlug) {
        const err = new Error('Missing slug')
        err.status = 400
        throw err
      }

      // ✅ ключ кэша: язык + slug
      const cacheKey = `${safeLang}:${safeSlug}`

      // ✅ кэш по продукту
      if (this.productCache[cacheKey]) {
        this.productData = this.productCache[cacheKey]
        return this.productCache[cacheKey]
      }

      this.isLoading = true
      try {
        // getProductDataFromApi должен уметь принимать {slug, lang}
        const data = await getProductDataFromApi({ slug: safeSlug, lang: safeLang })

        this.productCache[cacheKey] = data
        if (!this.productCacheLoadedAt || typeof this.productCacheLoadedAt !== 'object') {
          this.productCacheLoadedAt = {}
        }
        this.productCacheLoadedAt[cacheKey] = Date.now()

        this.productData = data
        return data
      } catch (err) {
        if (err?.status === 404) this.errorKey = 'error.notFound'
        else this.errorKey = 'error.general'
        throw err
      } finally {
        this.isLoading = false
      }
    }
  }
})
