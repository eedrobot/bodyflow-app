import { defineStore } from 'pinia'

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
      const config = useRuntimeConfig()

      const currentPage = Math.max(1, Number(page) || 1)
      const currentLimit = Math.max(1, Number(this.limit) || 6)

      this.isLoading = true
      this.error = null

      try {
        const res = await $fetch(`${config.public.apiBase}/blog/list.php`, {
          query: {
            lang,
            page: currentPage,
            limit: currentLimit
          }
        })

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
      const config = useRuntimeConfig()

      this.isLoading = true
      this.error = null
      this.post = null

      try {
        const data = await $fetch(`${config.public.apiBase}/blog/article.php`, {
          query: {
            slug,
            lang
          }
        })

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