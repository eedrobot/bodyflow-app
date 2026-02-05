<template>
  <div class="products-comp" ref="bgRef">
    <div class="wrapper">

      <h1 class="title">{{ t('nutrition.title') }}</h1>
      <div class="description">{{ t('nutrition.description') }}</div>

      <Loader :isLoading ="nutritionStore.isLoading" />

      <div v-if="categoriesData.length" class="content-container">
        <SearchProduct />
        <ProductsByCategories />
      </div>

    </div>

    <UpBtn />
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia"
import ProductsByCategories from '@/components/products/ProductsByCategories.vue'
import SearchProduct from '@/components/products/SearchProduct.vue'
import UpBtn from '@/components/ui/UpBtn.vue'
import Loader from '@/components/ui/Loader.vue'
import { useParallaxBackground } from '@/composables/useParallaxBackground'

const { t, locale } = useI18n()

const nutritionStore = useNutritionData()
const { categoriesData } = storeToRefs(nutritionStore)

useSeo({
  titleKey: 'seo.nutrition.title',
  descriptionKey: 'seo.nutrition.description',
  keywordsKey: 'seo.nutrition.keywords',
  image: '/seo/nutrition-og.png'
})

// Загружаем только категории
await nutritionStore.getCategoriesData(locale.value)
await nutritionStore.getProductsData(1)

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

</script>


<style scoped lang="scss">
.products-comp {
  grid-area: main;
  position: relative;
  min-height: 200vh;
  overflow: hidden;

  background-image:
    url('@/public/img/green-bg-1.png'),
    url('@/public/img/nutrition-page.png'), 
    url('@/public/img/circle-bg.png');

  background-repeat: no-repeat, no-repeat, no-repeat;
  background-position: center 100vh, top right, top 23% left 6%;
  background-size: 100% auto, 65% auto, 30% auto;

  .wrapper {
    grid-template-areas:
      "title"
      "description"
      "nutrition";

    grid-template-rows: min-content min-content auto;
    .title {
      width: 50vw;
    }
    .description {
      width: 50vw;
    }
    .content-container {
      grid-area: nutrition;
      width: 50vw;
    }
  }
}

@media (max-width: 991.98px) {
  .products-comp {
    background-position: bottom -3rem center, top right, top 185px left 6%;
    background-size: 100% auto, 70% auto, 30% auto;

    .wrapper {
      grid-template-areas:
      "title ."
      "description ."
      "nutrition nutrition";
      grid-template-columns: 1fr 1fr;
      .title {
        margin-left: 2rem;
        text-align: left;
        justify-self: left;
      }
      .description {
        margin-left: 2rem;
        width: 100%;
        text-align: left;
        justify-self: left;
      }
      .content-container { width: 100%; }
    }
  }
}

@media (max-width: 575.98px) {
  .products-comp {
    padding-bottom: 2rem;
    background-position: bottom -3rem center, top right, top 185px left 6%;
    background-size: 100% auto, 55% auto, 30% auto;
    .wrapper {
      grid-template-areas:
      "title ."
      "description description"
      "nutrition nutrition";
      gap: 1rem;
       .title {
        margin-top: 3rem;
        margin-left: 1rem;
      }
      .description {
        margin-left: 1rem;
      }
    }
  }
}
</style>
