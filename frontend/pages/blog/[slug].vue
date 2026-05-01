<template>
  <div class="article-comp" ref="bgRef">
    <article v-if = "post" class="wrapper">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <NuxtLink :to="localePath('/blog')" class="back">
          ← {{ t('general.back') }}
        </NuxtLink>
      </nav>
      <Loader :isLoading="blogStore.isLoading" />

        <h1 class="title" itemprop="headline">
        {{ post.title }}
        </h1>
        <div class="category-info" itemprop="articleSection">
        {{ t(`blog.categories.${post.category}`) }}
        </div>

        <p v-if="post.excerpt" class="description" itemprop="description">
            {{ post.excerpt }}
        </p>

        <div class = "content-container">
            <div class = "blog-article__wrapper">
                 <img
                    v-if="post.cover_image"
                    class="blog-article__cover"
                    :src="post.cover_image"
                    :alt="post.cover_alt || post.title"
                    itemprop="image"
                >

                <!-- <p v-if="post.excerpt" class="blog-article__excerpt" itemprop="description">
                    {{ post.excerpt }}
                </p> -->
            </div>
            <div
            class="blog-article__content"
            itemprop="articleBody"
            v-html="post.content_html"></div>
        </div>
          <!-- FAQ -->
            <div class="content-container faq" v-if="post.faq?.length">
                <h2 class="faq-title">{{ t('kbsu_page.faq.title') }}</h2>

                <Accordion :items="post.faq" variant = "accordion-faq">
                    <template #header="{ item }">
                        <h2>{{ item.question }}</h2>
                    </template>

                    <template #body="{ item }">
                        <p class="info-p">{{ item.answer }}</p>
                    </template>
                </Accordion>
            </div>
    </article>
    <UpBtn />
  </div>
</template>

<script setup>
import { useParallaxBackground } from '@/composables/useParallaxBackground'
import Accordion from '@/components/ui/Accordion.vue'
import Loader from '@/components/ui/Loader.vue'
import UpBtn from '@/components/ui/UpBtn.vue'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const setI18nParams = useSetI18nParams()

const blogStore = useBlogStore()

const slug = computed(() => String(route.params.slug || ''))

await blogStore.getPost(slug.value, locale.value)

const post = computed(() => blogStore.post)

if (!post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Article not found'
  })
}

const slugs = post.value.translations_slugs || {}

setI18nParams({
  uk: { slug: slugs.uk || slug.value },
  ru: { slug: slugs.ru || slug.value },
  en: { slug: slugs.en || slug.value }
})

const bgRef = ref(null)
useParallaxBackground({
  bgRef,
  desktopMin: 1199.98,
  getBgPosition: ({ y }) => {
    const base1 = window.innerHeight

    return `
      center ${(base1 - y * 0.35)}px,
      right ${(y) * 0.5}px,
      left 6% top ${(y + 850) * 0.35}px
    `
  }
})

const faq = Array.isArray(post.value?.faq) ? post.value.faq : []

const schemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.value.title,
    description: post.value.meta_description || post.value.excerpt || '',
    image: post.value.cover_image || 'https://bodyflow.com.ua/og/default.png',
    author: {
      '@type': 'Organization',
      name: 'BodyFlow'
    },
    publisher: {
      '@type': 'Organization',
      name: 'BodyFlow'
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://bodyflow.com.ua${route.fullPath}`
    }
  }
]

if (faq.length) {
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  })
}

useSeo({
  title: post.value?.meta_title || post.value?.title || 'BodyFlow Blog',
  description: post.value?.meta_description || post.value?.excerpt || '',
  image: post.value?.cover_image || '/og/default.png',
  schema: schemas
})
</script>

<style scoped lang="scss">
.article-comp {
  grid-area: main;
  position: relative;
  overflow: hidden;
  background-image:
    url('@/public/img/green-bg-1.png'),
    url('@/public/img/article_bg.png'),
    url('@/public/img/circle-bg.png');
  background-repeat: no-repeat, no-repeat, no-repeat;
  background-position: top 100vh center, top right -2vw, top 23% left 6%;
  background-size: 100% auto, 60% auto, 30% auto;

  .wrapper {
    grid-template-areas:
      ". breadcrumbs ."
      ". title ."
      ". category ." 
      ". description ."
      ". article ."
      ". faq .";
      grid-template-columns: 1fr 1fr 1fr;
      justify-items: start;
     gap: 0;

     .breadcrumbs {
        grid-area: breadcrumbs;
     }

    .category-info {
      grid-area: category;
      text-align: left;
      color: $color-green;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 2rem;
      margin-top: 2rem;
      padding: 5px 10px;
      border-radius: $b-r;
      background: $color-lgreen;
      font-size: $fs-small;
    }
    .title {
        width: 45vw;
        padding-top: 2rem;
        margin: 0 0;
    }
    .description {
      width: 45vw;
      span {
        text-transform: lowercase;
      }
    }
    .content-container {
      grid-area: article;
      width: 70vw;
      margin-bottom: 2rem;
      &.faq {
        grid-area: faq;
        .faq-title {
            text-align: center;
            font-weight: 700;
        }
      }
      .blog-article {

            &__excerpt {
                padding-top: 0!important;
                margin-bottom: 20px;
                font-size: $fs-middle;
                line-height: 1.5;
                color: $color-navy-d;
            }

            &__cover {
                width: 40%;
                max-height: 520px;
                object-fit: cover;
                border-radius: $b-r;
                margin-bottom: 10px;
                float: left;
                margin-right: 20px;
            }
            &__content {
                :deep(h2) {
                    margin: 20px 0;
                }
                :deep(p) {
                    padding: 0.5rem 0;
                    line-height: 1.5rem;
                    font-size: $fs-one;
                }
            }
        }
    }
  }
}

@media (max-width: 1199.98px) {
  .article-comp {
    height: auto;
    min-height: 100vh;
  }
}
@media (max-width: 991.98px) {
  .article-comp {
    background-position: top 100vh center, top -7px right, top 185px left 6%;
    background-size: 100% auto, 55% auto, 30% auto;

    .wrapper {
      grid-template-columns: 1fr;
      .title {
        width: 60vw;
      }
      .description {
        width: 100%;
      }
      .content-container {
        width: 100%;
      }
    }
  }
}
@media (max-width: 575.98px) { 
  .article-comp {
    background-position: bottom -3rem center, top 2vh right, top 185px left 6%;;
    background-size: 100% auto, 65% auto, 30% auto;

    .wrapper {
      .title {
        word-wrap: break-word;
      }
    }
  }
}

</style>