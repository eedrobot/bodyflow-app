// stores/workout.js
import { defineStore } from 'pinia'
import { getExercisesDataFromApi, getExerciseImages, getExerciseDataFromApi } from '@/utils/api'
import { useApiCacheFetch } from '@/composables/useApiCacheFetch'

const WGER_LANG_MAP = { en: 2, ru: 5, uk: 15 }

export const useWorkoutData = defineStore('workout', {
  state: () => ({
    // raw + normalized
    workoutRaw: [],
    workoutData: [],

    exerciseData: null,
    isExerciseLoading: false,
    exerciseErrorKey: '',


    // cache: exercises (by queryKey)
    cacheExercises: {},        // { [queryKey]: { list, total } }
    lastLoadedExercises: {},   // { [queryKey]: timestamp }

    // cache: images (exercise_id -> images[])
    cacheImages: {},           // { [exerciseId]: [img] }
    lastLoadedImages: null,

    // list meta
    totalCount: 0,
    page: 1,
    limit: 9,
    filters: {
      category: null,
      muscle: null,
      equipment: null
    },

    // ui state
    isLoading: false,
    errorKey: '',

    // anti-race (SSR hydration / fast clicks)
    requestId: 0,
    activeLang: 'en'
  }),

  actions: {
    // ---------------------------------
    // helpers
    // ---------------------------------
    getQueryKey (lang) {
      return JSON.stringify({
        page: this.page,
        limit: this.limit,
        filters: this.filters,
        lang
      })
    },

    // ---------------------------------
    // 1) Images (WGER exerciseimage)
    //    грузим один раз, потом используем cacheImages
    // ---------------------------------
    async loadImages () {
      // ✅ не дергаем сеть, если уже есть мапа
      if (this.cacheImages && Object.keys(this.cacheImages).length) {
        return this.cacheImages
      }

      return await useApiCacheFetch({
        apiFn: getExerciseImages,
        store: this,
        cacheKey: 'cacheImages',
        lastLoadedKey: 'lastLoadedImages',
        setter: (json) => {
          const list = Array.isArray(json?.results) ? json.results : []
          const map = list.reduce((acc, img) => {
            const id = img?.exercise
            if (!id) return acc
            if (!acc[id]) acc[id] = []
            acc[id].push(img)
            return acc
          }, {})
          this.cacheImages = map
          return map
        }
      })
    },

    // ---------------------------------
    // 2) Exercises (backend aggregated)
    // ---------------------------------
    async loadExercises (lang) {
      const queryKey = this.getQueryKey(lang)

      // ✅ если уже в кэше — берем без сети
      if (this.cacheExercises?.[queryKey]) {
        const payload = this.cacheExercises[queryKey]
        this.workoutRaw = payload.list || []
        this.totalCount = payload.total || 0
        return payload
      }

      const offset = (this.page - 1) * this.limit
      const params = { limit: this.limit, offset }
      if (this.filters.category !== null) params.category = this.filters.category
      if (this.filters.muscle !== null) params.muscles = this.filters.muscle
      if (this.filters.equipment !== null) params.equipment = this.filters.equipment

      // ⚠️ важно: если backend вернул HTML (ошибка PHP), useApiCacheFetch может упасть на JSON.parse
      const data = await useApiCacheFetch({
        apiFn: (p) => getExercisesDataFromApi(p, lang),
        params,
        store: this,
        cacheKey: `cacheExercises.${queryKey}`,
        lastLoadedKey: `lastLoadedExercises.${queryKey}`,
        setter: (json) => {
          const list = Array.isArray(json?.results) ? json.results : []
          const total = Number(json?.count || 0)
          const payload = { list, total }
          this.cacheExercises[queryKey] = payload
          return payload
        },
        customCheck: () => this.cacheExercises?.[queryKey]
      })

      if (!data || !Array.isArray(data.list)) {
        this.workoutRaw = []
        this.totalCount = 0
        return null
      }

      this.workoutRaw = data.list
      this.totalCount = data.total
      return data
    },

    // ---------------------------------
    // 3) Normalize:
    //    priority for image:
    //      ex.images (from exercises-extended.php) ->
    //      cacheImages (exerciseimage endpoint) ->
    //      ex.local_images ->
    //      null
    // ---------------------------------
    normalize (lang) {
      if (lang !== this.activeLang) return

      const langId = WGER_LANG_MAP[lang] ?? 2
      const raw = Array.isArray(this.workoutRaw) ? this.workoutRaw : []

      this.workoutData = raw.map((ex) => {
        const tr =
          ex?.translations?.find(t => t?.language === langId) ||
          ex?.translations?.find(t => t?.language === 2) ||
          ex?.translations?.[0] ||
          {}

        const name = ex?.local_name || tr?.name || 'No name'
        const description = tr?.description || ''

        // images from exerciseinfo itself (лучше, чем отдельный exerciseimage)
        const exImages = Array.isArray(ex?.images) ? ex.images : []
        const mainExImg = exImages.find(i => i?.is_main) || exImages[0]

        // images from /exerciseimage cache
        const wgerImgs = this.cacheImages?.[ex?.id] || []
        const mainWgerImg = wgerImgs.find(i => i?.is_main) || wgerImgs[0]

        // local fallback
        const localImgs = Array.isArray(ex?.local_images) ? ex.local_images : []

        const image = mainExImg?.image || mainWgerImg?.image || localImgs[0] || null

        // normalize images list for UI
        const images =
          exImages.length
            ? exImages
            : (wgerImgs.length
                ? wgerImgs
                : localImgs.map((url, idx) => ({
                    image: url,
                    is_main: idx === 0,
                    source: 'local'
                  })))

        return {
          id: ex?.id,
          name,
          description,

          category_id: ex?.category?.id ?? null,
          muscles: ex?.muscles?.map(m => m?.id).filter(Boolean) || [],
          muscles_secondary: ex?.muscles_secondary?.map(m => m?.id).filter(Boolean) || [],
          equipment: ex?.equipment?.map(e => e?.id).filter(Boolean) || [],

          image,
          images,

          videos: Array.isArray(ex?.videos) ? ex.videos : [],
          local_videos: Array.isArray(ex?.local_videos) ? ex.local_videos : []
        }
      })
      console.log(this.workoutData)
    },

    // ---------------------------------
    // init (anti-race, loading, errors)
    // ---------------------------------
    async initWorkout (lang) { 
      const rid = ++this.requestId
      this.activeLang = lang
      this.isLoading = true
      this.errorKey = ''

      try {
        await this.loadExercises(lang)
        await this.loadImages()

        if (rid !== this.requestId) return
        this.normalize(lang)
      } catch (e) {
        if (rid !== this.requestId) return
        this.workoutRaw = []
        this.workoutData = []
        this.totalCount = 0
        this.errorKey = 'error.general'
        // console.warn('[workout] init failed', e)
      } finally {
        if (rid === this.requestId) this.isLoading = false
      }
    },

    // ---------------------------------
    // pagination / filters
    // ---------------------------------
    async setPage (page, lang) {
      if (!Number.isFinite(page) || page < 1) return
      this.page = page
      await this.initWorkout(lang)
    },

    async setFilters (filters, lang) {
      this.filters = { ...this.filters, ...filters }
      this.page = 1
      await this.initWorkout(lang)
    },

    reset () {
      this.workoutRaw = []
      this.workoutData = []
      this.totalCount = 0
      this.page = 1
      this.filters = { category: null, muscle: null, equipment: null }
      this.errorKey = ''
    },

    async getExerciseData(id, lang) {
      this.isExerciseLoading = true
      this.exerciseErrorKey = ''
      try {
        const res = await getExerciseDataFromApi(id, lang)
        if (!res.ok) {
          this.exerciseData = null
          this.exerciseErrorKey = res.status === 404 ? 'error.notFound' : 'error.general'
          return null
        }
        this.exerciseData = await res.json()
        return this.exerciseData
      } catch (e) {
        this.exerciseData = null
        this.exerciseErrorKey = 'error.general'
        return null
      } finally {
        this.isExerciseLoading = false
      }
    }

  }
})
