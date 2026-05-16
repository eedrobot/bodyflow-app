export const apiFetch = (path, options = {}) => {
  const config = useRuntimeConfig()

  const base = config.public.apiBase.replace(/\/$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${base}${cleanPath}`)
  const params = options.params || options.query

  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }

  const { params: _params, query: _query, ...fetchOptions } = options

  return fetch(url.toString(), fetchOptions)
}
