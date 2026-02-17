<template>
  <div class="product-comp" ref="bgRef">
    <div class="wrapper">
      <h1 class="title">
        <ClientOnly>
          <Loader :isLoading="nutritionStore.isLoading" />
        </ClientOnly>
        {{ productName }} <br> <span>{{t('product.title')}}</span>
      </h1>

      <div class="category-info" v-if="categoryName">
        {{ categoryName }}
        <span v-if="subCategoryName"> / {{ subCategoryName }}</span>
      </div>

      <div class = "description">
        {{t('product.description_1')}}<span>{{ productName }}</span>, {{t('product.description_2')}}
      </div>

      <div class="content-container" v-if="nutritionStore.productData">
        <ProductMainInfo />
        <ProductOtherInfo />
      </div>
    </div>

    <UpBtn />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import ProductMainInfo from '@/components/product/ProductMainInfo.vue'
import ProductOtherInfo from '@/components/product/ProductOtherInfo.vue'
import Loader from '@/components/ui/Loader.vue'
import UpBtn from '@/components/ui/UpBtn.vue'
import { useParallaxBackground } from '@/composables/useParallaxBackground'

// ✅ добавили для микроразметки
import { useHead } from '#imports'

// --------- ROUTE + LOCALE ----------
const route = useRoute()
const { t, locale } = useI18n()
const currentLang = computed(() => locale.value)

// --------- STORE ----------
const nutritionStore = useNutritionData()
const productSlug = computed(() => String(route.params.slug || ''))

// --------- SSR ЗАГРУЗКА ПРОДУКТА ----------
await useAsyncData(
  () => `product-${currentLang.value}-${productSlug.value}`,
  () => nutritionStore.getProductData({ slug: productSlug.value, lang: currentLang.value })
)

// --------- ИМЯ ПРОДУКТА / КАТЕГОРИИ ----------
const productName = computed(() =>
  nutritionStore.productData?.translations?.[currentLang.value] || ''
)

const categoryName = computed(() =>
  nutritionStore.productData?.categories?.[0]?.translations?.[currentLang.value] || ''
)

const subCategoryName = computed(() =>
  nutritionStore.productData?.categories?.[0]?.children?.[0]?.translations?.[currentLang.value] || ''
)

// ✅ --------- МИКРОРАЗМЕТКА (JSON-LD) ----------
const nutrientsFlat = computed(() =>
  nutritionStore.productData?.nutrients?.[0]?.nutrients || []
)

const byId = (id) => nutrientsFlat.value.find(n => Number(n?.nutrient_id) === id)

// ⚠️ ids взяты из твоей логики: 14 = calories, 2/3/4 = БЖУ (если у тебя иначе — поменяй)
const caloriesVal = computed(() => Number(byId(14)?.value) || 0)
const proteinVal = computed(() => Number(byId(2)?.value) || 0)
const fatVal = computed(() => Number(byId(3)?.value) || 0)
const carbsVal = computed(() => Number(byId(4)?.value) || 0)

const categoryLabel = computed(() => {
  const c = categoryName.value
  const s = subCategoryName.value
  return s ? `${c} / ${s}` : c
})

const jsonLd = computed(() => {
  if (!productName.value) return null

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productName.value,
    "category": categoryLabel.value || undefined,
    "nutrition": {
      "@type": "NutritionInformation",
      "calories": caloriesVal.value ? `${caloriesVal.value} kcal` : undefined,
      "proteinContent": proteinVal.value ? `${proteinVal.value} g` : undefined,
      "fatContent": fatVal.value ? `${fatVal.value} g` : undefined,
      "carbohydrateContent": carbsVal.value ? `${carbsVal.value} g` : undefined
    }
  }
})

useHead(() => {
  if (!jsonLd.value) return {}
  return {
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(jsonLd.value)
      }
    ]
  }
})

// --------- ПАРАЛЛАКС, ui(только клиент) ----------
definePageMeta({
  footerTheme: 'navy'
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

useSeo({
  title: computed(() =>
    productName.value
      ? t('seo.product.title', { name: productName.value })
      : ''
  ),

  description: computed(() =>
    productName.value
      ? t('seo.product.description', { name: productName.value })
      : ''
  ),

  image: '/seo/product-og.png',
})
</script>

<style lang="scss" scoped>
.product-comp {
  grid-area: main;
  position: relative;
  overflow: hidden;
  background-image:
    url('@/public/img/green-bg-1.png'),
    url('@/public/img/product-bg.png'),
    url('@/public/img/circle-bg.png');
  background-repeat: no-repeat, no-repeat, no-repeat;
  background-position: top 100vh center, top right -2vw, top 23% left 6%;
  background-size: 100% auto, 50% auto, 30% auto;

  .wrapper {
    grid-template-areas:
      ". title ."
      ". category ." 
      ". description ."
      ". nutrition .";
      grid-template-columns: 1fr 1fr 1fr;
      justify-items: start;
    gap: 0;

    .category-info {
      grid-area: category;
      text-align: left;
      color: $color-dg;
      margin-bottom: 4rem;
      margin-top: 2rem;
    }
    .title {
      grid-area: title;
      padding-top: 2rem;
      margin: 0 0;
    }
    .description {
      grid-area: description;
      width: 30vw;
      margin-bottom: 2rem;
      span {
        text-transform: lowercase;
      }
    }
    .content-container {
      grid-area: nutrition;
      width: 50vw;
      margin-bottom: 2rem;
    }
  }
}

@media (max-width: 1199.98px) {
  .product-comp {
    height: auto;
    min-height: 100vh;
  }
}
@media (max-width: 991.98px) {
  .product-comp {
    background-position: top 100vh center, top -7px right, top 185px left 6%;
    background-size: 100% auto, 55% auto, 30% auto;

    .wrapper {
       grid-template-areas:
      "title ."
      "category category" 
      "description description"
      "nutrition nutrition";
      grid-template-columns: 1fr 1fr;
      .title {
        justify-self: start;
        margin-left: 1rem;
      }
      .category-info {
        justify-self: start;
        margin-left: 1rem;
      }
      .description {
        width: 100%;
        padding: 0 1rem;
      }
      .content-container {
        width: 100%;
      }
    }
  }
}
@media (max-width: 575.98px) {
  .product-comp {
    background-position: bottom -3rem center, top 2vh right, top 185px left 6%;;
    background-size: 100% auto, 55% auto, 30% auto;

    .wrapper {
      .title {
        word-wrap: break-word;
      }
    }
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}
</style>
