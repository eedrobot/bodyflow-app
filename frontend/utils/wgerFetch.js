const WGER_BASE = 'https://wger.de/api/v2'

export const wgerFetch = (path, options = {}) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  return fetch(`${WGER_BASE}${cleanPath}`, {
    method: 'GET',
    ...options
  }).then(res => {
    if (!res.ok) {
      throw new Error(`WGER API error: ${res.status}`)
    }
    return res.json()
  })
}
