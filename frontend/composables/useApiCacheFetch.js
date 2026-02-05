const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000 // 7 дней

/**
 * Универсальный кеш + fetch (SSR-safe)
 *
 * ❗ apiFn ОБЯЗАН вернуть fetch Response
 * ❗ setter ОБЯЗАН положить данные в стор
 * ❗ функция НИЧЕГО не "угадывает" (no results || json)
 */
export async function useApiCacheFetch({
  apiFn,
  params = {},
  store,
  cacheKey,
  ttl = DEFAULT_TTL,
  setter,
  customCheck,
  lastLoadedKey,
  customError
}) {
  const now = Date.now()

  /* --------------------------------------------------
   * 1. Проверка кеша
   * -------------------------------------------------- */
  const cachedData = customCheck
    ? customCheck()
    : cacheKey && store?.[cacheKey]

  const lastLoaded = lastLoadedKey
    ? store?.[lastLoadedKey]
    : null

  if (
    ttl !== false &&
    cachedData !== undefined &&
    lastLoaded &&
    now - lastLoaded < ttl
  ) {
    return cachedData
  }

  /* --------------------------------------------------
   * 2. Fetch
   * -------------------------------------------------- */
  store.isLoading = true
  store.errorKey = ''

  try {
    const response = await apiFn(params)

    if (!(response instanceof Response)) {
      throw new Error('apiFn must return fetch Response')
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const json = await response.json()

    /* --------------------------------------------------
     * 3. Сохранение (ТОЛЬКО через setter)
     * -------------------------------------------------- */
    if (typeof setter !== 'function') {
      throw new Error('useApiCacheFetch requires setter(data)')
    }

    const result = setter(json)

    if (lastLoadedKey) {
      store[lastLoadedKey] = now
    }

    return result ?? json
  }

  catch (err) {
    console.error('[useApiCacheFetch]', err)

    if (typeof customError === 'function') {
      customError(err)
    } else {
      store.errorKey = 'error.general'
    }

    return null
  }

  finally {
    store.isLoading = false
  }
}
