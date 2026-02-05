import { useNutritionData } from '@/stores/nutrition'

export default defineNuxtPlugin((nuxtApp) => {
  const store = useNutritionData()
  const KEY = 'nutrition-cache-v2'

  nuxtApp.hook('app:mounted', () => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const saved = JSON.parse(raw)

        // текущий язык после гидрации
        const currentLang = nuxtApp.$i18n?.locale?.value

        // ✅ restore ТОЛЬКО если язык совпадает
        if (saved?.lastLang && currentLang && saved.lastLang === currentLang) {
          store.$patch({
            // ❗ патчим только кэш-данные (те, что переживают F5)
            categoriesData: saved.categoriesData || store.categoriesData,
            categoriesDataLoadedAt: saved.categoriesDataLoadedAt || store.categoriesDataLoadedAt,

            productsByCategories: saved.productsByCategories || store.productsByCategories,
            productsByCategoriesLoadedAt: saved.productsByCategoriesLoadedAt || store.productsByCategoriesLoadedAt,

            productCache: saved.productCache || store.productCache,
            productCacheLoadedAt: saved.productCacheLoadedAt || store.productCacheLoadedAt,

            expandedCategory: saved.expandedCategory ?? store.expandedCategory,
            lastLang: saved.lastLang || store.lastLang
          })
        }
      }
    } catch (e) {
      console.warn('[nutrition-cache] restore failed', e)
    }

    // ✅ сохраняем кэш при изменениях
    store.$subscribe((_mutation, state) => {
      try {
        localStorage.setItem(
          KEY,
          JSON.stringify({
            categoriesData: state.categoriesData,
            categoriesDataLoadedAt: state.categoriesDataLoadedAt,

            productsByCategories: state.productsByCategories,
            productsByCategoriesLoadedAt: state.productsByCategoriesLoadedAt,

            productCache: state.productCache,
            productCacheLoadedAt: state.productCacheLoadedAt,

            expandedCategory: state.expandedCategory,
            lastLang: state.lastLang
          })
        )
      } catch (e) {
        console.warn('[nutrition-cache] save failed', e)
      }
    })
  })
})
