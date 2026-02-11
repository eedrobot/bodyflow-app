export const apiFetch = (path, options = {}) => {
  const config = useRuntimeConfig()

  const base = config.public.apiBase.replace(/\/$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  return $fetch(`${base}${cleanPath}`, {
    ...options
  })
}
