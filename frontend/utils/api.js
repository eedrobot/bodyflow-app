import { apiFetch } from '@/utils/apiFetch'
import { wgerFetch } from '@/utils/wgerFetch'

/* ======================================================
   WGER API (внешний)
====================================================== */

export function getExerciseImages() {
  return wgerFetch('/exerciseimage/', {
    params: { limit: 300 }
  })
}

/* ======================================================
   PHP BACKEND — EXERCISES
====================================================== */

export function getExercisesDataFromApi(params = {}, lang) {
  return apiFetch('/exercises-extended.php', {
    params: {
      ...params,
      lang
    }
  })
}

export function getExerciseDataFromApi(id, lang) {
  return apiFetch('/exercise.php', {
    params: { id, lang }
  })
}

/* ======================================================
   PHP BACKEND — NUTRITION
====================================================== */

export function getCategoriesDataFromApi(lang) {
  return apiFetch('/categories.php', {
    params: { lang }
  })
}

export function getProductsDataFromApi(category_id, lang) {
  return apiFetch('/products.php', {
    params: { category_id, lang }
  })
}

export function getProductDataFromApi({ slug, lang = 'ru' }) {
  return apiFetch('/product.php', {
    params: { slug, lang }
  })
}

export function getMenuDataFromApi(days = 5, lang) {
  return apiFetch('/menu.php', {
    params: { days, lang }
  })
}
