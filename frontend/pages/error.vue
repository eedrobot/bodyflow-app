<template>
  <div class="error-comp">
    <div class="wrapper">
      <BackBreadcrumb />

      <div class="error">
        <h1 class="title">{{ errorContent.title }}</h1>

        <div class="description">
          <p>{{ errorContent.description }}</p>

          <NuxtLink :to="localePath('/')">
            <button class="btn bright">
              {{ errorContent.button }}
            </button>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import BackBreadcrumb from '@/components/ui/BackBreadcrumb.vue'

const { t, te } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

useSeoMeta({
  robots: 'noindex, nofollow',
})

const allowedTypes = new Set([
  'payment_failed',
  'download_limit',
  'pdf_not_found',
  'order_not_paid',
  'payment_pending',
  'unknown',
])

const errorType = computed(() => {
  const type = String(route.query.type || 'unknown')
  return allowedTypes.has(type) ? type : 'unknown'
})

const errorContent = computed(() => {
  const baseKey = `app_error.${errorType.value}`
  const fallbackKey = 'app_error.unknown'
  const key = te(`${baseKey}.title`) ? baseKey : fallbackKey

  return {
    title: t(`${key}.title`),
    description: t(`${key}.description`),
    button: t(`${key}.button`),
  }
})
</script>

<style scoped lang="scss">
.error-comp {
  min-height: calc(100vh - 301.6px);
  padding: 4rem 1rem;
  text-align: center;

  .wrapper {
    grid-auto-rows: auto;
    grid-template-areas:
      "breadcrumbs"
      "title"
      "description";
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 1rem;

    .title {
      grid-area: title;
      justify-self: center;
      text-align: center;
    }

    .description {
      grid-area: description;
      text-align: center;

      p {
        margin-bottom: 2rem;
      }
    }
  }
}
</style>
