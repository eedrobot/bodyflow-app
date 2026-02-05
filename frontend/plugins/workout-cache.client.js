import { useWorkoutData } from '@/stores/workout'

export default defineNuxtPlugin((nuxtApp) => {
  const store = useWorkoutData()

  nuxtApp.hook('app:mounted', () => {
    // ✅ RESTORE AFTER HYDRATION (важно для SSR)
    try {
      const raw = localStorage.getItem('workout-cache-v1')
      if (raw) {
        const saved = JSON.parse(raw)

        // ❗ патчим только кэши, не workoutRaw/workoutData/page/filters
        store.$patch({
          cacheExercises: saved.cacheExercises || store.cacheExercises,
          lastLoadedExercises: saved.lastLoadedExercises || store.lastLoadedExercises,
          cacheImages: saved.cacheImages || store.cacheImages,
          lastLoadedImages: saved.lastLoadedImages || store.lastLoadedImages
        })
      }
    } catch (e) {
      console.warn('[workout-cache] restore failed', e)
    }

    // ✅ SAVE ON CHANGES
    store.$subscribe((_mutation, state) => {
      try {
        localStorage.setItem(
          'workout-cache-v1',
          JSON.stringify({
            cacheExercises: state.cacheExercises,
            lastLoadedExercises: state.lastLoadedExercises,
            cacheImages: state.cacheImages,
            lastLoadedImages: state.lastLoadedImages
          })
        )
      } catch (e) {
        console.warn('[workout-cache] save failed', e)
      }
    })
  })
})
