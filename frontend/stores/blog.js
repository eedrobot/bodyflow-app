import { defineStore } from 'pinia'

function buildApiUrl(path, query = {}) {
  const config = useRuntimeConfig()
  const base = config.public.apiBase.replace(/\/$/, '')
  const url = new URL(`${base}${path}`)

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  return url.toString()
}

async function readApiJson(response) {
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(data?.error || data?.message || `HTTP ${response.status}`)
    error.status = response.status
    error.data = data
    throw error
  }
  return data
}

export const useBlogStore = defineStore('blog', {
  state: () => ({
    posts: [],
    post: null,

    isLoading: false,
    error: null,

    page: 1,
    limit: 4,
    total: 0,
    totalPages: 1
  }),

  actions: {
    async getPosts(lang = 'uk', page = 1) {
      const currentPage = Math.max(1, Number(page) || 1)
      const currentLimit = Math.max(1, Number(this.limit) || 6)

      this.isLoading = true
      this.error = null

      try {
        const response = await fetch(buildApiUrl('/blog/list.php', {
          lang,
          page: currentPage,
          limit: currentLimit
        }))
        const res = await readApiJson(response)

        // если API уже новый
        if (res && Array.isArray(res.posts)) {
          this.posts = res.posts
          this.page = Number(res.page || currentPage)
          this.limit = Number(res.limit || currentLimit)
          this.total = Number(res.total || 0)
          this.totalPages = Number(res.totalPages || 1)
          return res
        }

        // если API вдруг ещё старый и вернул просто массив
        if (Array.isArray(res)) {
          this.posts = res
          this.page = currentPage
          this.limit = currentLimit
          this.total = res.length
          this.totalPages = 1
          return res
        }

        this.posts = []
        this.page = currentPage
        this.limit = currentLimit
        this.total = 0
        this.totalPages = 1

        return res
      } catch (error) {
        this.error = error
        this.posts = []
        this.page = currentPage
        this.total = 0
        this.totalPages = 1

        return null
      } finally {
        this.isLoading = false
      }
    },

    async getPost(slug, lang = 'uk') {
      this.isLoading = true
      this.error = null
      this.post = null

      try {
        const response = await fetch(buildApiUrl('/blog/article.php', { slug, lang }))
        const data = await readApiJson(response)

        this.post = data
        return data
      } catch (error) {
        this.error = error
        this.post = null
        return null
      } finally {
        this.isLoading = false
      }
    },

    resetPosts() {
      this.posts = []
      this.page = 1
      this.total = 0
      this.totalPages = 1
      this.error = null
    },

    resetPost() {
      this.post = null
      this.error = null
    }
  }
})
