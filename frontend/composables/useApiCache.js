const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 дней

/**
 * Универсальная обёртка для API-запросов с TTL-кэшированием
 * @param {Function} apiFn - функция, которая делает запрос (например getProductsDataFromApi)
 * @param {Object} params - параметры запроса
 * @param {Object} cacheObj - объект, куда сохраняем результат (Pinia state)
 * @param {string} cacheKey - ключ внутри cacheObj
 * @param {Function|null} setter - функция записи результата (если Pinia хранит в отдельных полях)
 * @returns {Promise<any>}
 */

export async function useApiCache({
  apiFn,
  params = {},
  store,
  cacheKey,
  ttl = DEFAULT_TTL,
  setter = null,
  customError = null,
  customCheck = null,
  lastLoadedKey = null
}) {
  const now = Date.now()

  const cachedData = customCheck ? customCheck() : store[cacheKey]
  const lastLoaded = lastLoadedKey ? store[lastLoadedKey] : null

  // ---- используем кеш ----
  if (ttl !== false && cachedData && lastLoaded && now - lastLoaded < ttl) {
    return cachedData
  }

  store.isLoading = true
  store.errorKey = ''

  try {
    const result = await apiFn(...Object.values(params))
    const data = result instanceof Response ? await result.json() : result

    if (setter) setter(data)
    else store[cacheKey] = data

    if (lastLoadedKey) store[lastLoadedKey] = now

    return data
  } catch (err) {
    console.error(err)
    if (customError) customError(err)
    else store.errorKey = 'error.general'
    return null
  } finally {
    store.isLoading = false
  }
}