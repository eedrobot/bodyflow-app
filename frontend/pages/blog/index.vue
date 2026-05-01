<template>
  <div class="blog-comp" ref="bgRef">
    <div class="wrapper">
      <h1 class="title info-pages">
        {{ t('blog.title') }}
      </h1>

      <div class="description">
        {{ t('blog.description') }}
      </div>

      <Loader :isLoading="blogStore.isLoading" />

      <div class="content-container">
        <ArticlesList />
      </div>

      <Pagination
        v-model="page"
        :total-pages="totalPages"
      />
    </div>

    <UpBtn />
  </div>
</template>

<script setup>
import Loader from '@/components/ui/Loader.vue'
import { useParallaxBackground } from '@/composables/useParallaxBackground'
import UpBtn from '@/components/ui/UpBtn.vue'
import ArticlesList from '@/components/blog/ArticlesList.vue'
import Pagination from '@/components/ui/Pagination.vue'
import { useBlogStore } from '~/stores/blog'

const blogStore = useBlogStore()

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const page = computed({
  get: () => Math.max(1, Number(route.query.page || 1)),
  set: (val) => {
    router.push({
      path: route.path,
      query: {
        ...route.query,
        page: Number(val)
      }
    })
  }
})

const totalPages = computed(() => blogStore.totalPages || 1)

await blogStore.getPosts(locale.value, page.value)

watch(
  () => [route.query.page, locale.value],
  async () => {
    await blogStore.getPosts(locale.value, page.value)

    if (import.meta.client) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
)

const bgRef = ref(null)

useParallaxBackground({
  bgRef,
  desktopMin: 1199.98,
  getBgPosition: ({ y }) => {
    const base1 = window.innerHeight

    return `
      center ${base1 - y * 0.35}px,
      right ${y * 0.5}px,
      left 6% top ${(y + 850) * 0.35}px
    `
  }
})

useSeo({
  titleKey: 'seo.blog.title',
  descriptionKey: 'seo.blog.description',
  keywordsKey: 'seo.blog.keywords',
  image: '/seo/blog-og.png'
})
</script>

<style scoped lang="scss">
.blog-comp {
  grid-area: main;
  position: relative;
  min-height: 200vh;
  overflow: hidden;

  background-image:
    url('@/public/img/green-bg-1.png'),
    url('@/public/img/blog_bg.png'), 
    url('@/public/img/circle-bg.png');

  background-repeat: no-repeat, no-repeat, no-repeat;
  background-position: center 100vh, top right, top 23% left 6%;
  background-size: 100% auto, 65% auto, 30% auto;

  .wrapper {
    grid-template-areas:
      ". title ."
      ". description ."
      ". articles ."
      ". pagination .";
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: min-content min-content auto;
    justify-items: start;
    .title {
      width: 45vw;
    }
    .description {
      width: 45vw;
    }
    .content-container {
      grid-area: articles;
      width: 70vw;
    }
    .pagination {
      grid-area: pagination;
    }
  }
}

@media (max-width: 991.98px) {
  .blog-comp {
    background-position: bottom -3rem center, top right, top 185px left 6%;
    background-size: 100% auto, 70% auto, 30% auto;

    .wrapper {
      grid-template-areas:
      "title ."
      "description ."
      "articles articles"
      "pagination pagination";
      grid-template-columns: 1fr 1fr;
      .content-container { width: 100%; }
    }
  }
}

@media (max-width: 575.98px) {
  .blog-comp {
    padding-bottom: 2rem;
    background-position: bottom -3rem center, top right, top 185px left 6%;
    background-size: 100% auto, 65% auto, 30% auto;
    .wrapper {
      grid-template-areas:
      "title ."
      "description description"
      "articles articles"
      "pagination pagination";
      gap: 1rem;
      .title {
        width: 60vw;
      }
      .description {
        width: 100%;
      }
    }
  }
}

</style>