import { apiFetch } from '@/utils/apiFetch'

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

export function solveMenuDataFromApi(payload) {
  return apiFetch('/solve-menu.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  })
} 

export function createPaymentFromApi(payload) {
  return apiFetch('/payments/create.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  })
}
