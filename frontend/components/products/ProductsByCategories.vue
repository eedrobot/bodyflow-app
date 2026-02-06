<template>
  <Accordion :items="categoriesData" @toggle="toggleCategory">
    <template #header="{ item }">
      <img
        v-if="item.category_img"
        :src="item.category_img"
        class="category-img"
        :alt="item?.translations?.[langKey]"
      />
      <h2>{{ item?.translations?.[langKey] }}</h2>
    </template>

    <template #body="{ item }">
      <div
        v-for="cat in (item.children?.length ? item.children : [item])"
        :key="cat.category_id"
        class="subcategory"
      >
        <h3 v-if="item.children?.length">
          {{ cat?.translations?.[langKey] }}
        </h3>

        <!-- ✅ 1) Загружено и есть продукты -->
        <template v-if="hasProducts(cat.category_id)">
          <table>
            <thead>
              <tr>
                <th>{{ $t('nutrition.product') }}</th>
                <th>{{ $t('nutrition.proteins') }}</th>
                <th>{{ $t('nutrition.fats') }}</th>
                <th>{{ $t('nutrition.carbs') }}</th>
                <th>{{ $t('nutrition.calories') }}</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="product in productsByCategories[cat.category_id][langKey]"
                :key="product.product_id"
                @click="goToProduct(product)"
                class = "clickable"
              >
                <td :data-label="$t('nutrition.product')">
                  {{ product.translations?.[langKey] || product.translations?.ru || '' }}
                </td>
                <td :data-label="$t('result.protein')">{{ round(product.proteins) }}</td>
                <td :data-label="$t('result.fat')">{{ round(product.fats) }}</td>
                <td :data-label="$t('result.crabs')">{{ round(product.carbs) }}</td>
                <td :data-label="$t('result.cal_day')">{{ round(product.calories) }}</td>
              </tr>
            </tbody>
          </table>
        </template>

        <!-- ✅ 2) Загружено, но пусто -->
        <template v-else-if="isLoaded(cat.category_id)">
          <div class="empty">
            {{ $t('nutrition.noProducts') || 'Нет продуктов в этой категории' }}
          </div>
        </template>

        <!-- ✅ 3) Ещё не загружено -->
        <template v-else>
          <Loader :isLoading="true" />
        </template>
      </div>
    </template>
  </Accordion>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import Accordion from '@/components/ui/Accordion.vue'
import Loader from '@/components/ui/Loader.vue'

const { locale } = useI18n()
const localePath = useLocalePath()
const router = useRouter()

const nutritionStore = useNutritionData()
const { categoriesData, productsByCategories, productsByCategoriesLoadedAt } = storeToRefs(nutritionStore)

// ✅ строковый ключ языка для шаблона
const langKey = computed(() => locale.value)

const isLoaded = (category_id) => {
  const lang = langKey.value
  const catId = Number(category_id)
  return Boolean(productsByCategoriesLoadedAt.value?.[catId]?.[lang])
}

const hasProducts = (category_id) => {
  const lang = langKey.value
  const catId = Number(category_id)
  const arr = productsByCategories.value?.[catId]?.[lang]
  return Array.isArray(arr) && arr.length > 0
}

const toggleCategory = async (category_id) => {
  const lang = langKey.value
  const parentId = Number(category_id)
  if (!parentId) return

  // ✅ найти категорию и её детей
  const parent = categoriesData.value?.find(c => Number(c.category_id) === parentId)

  const idsToLoad = parent?.children?.length
    ? parent.children.map(ch => Number(ch.category_id)).filter(Boolean)
    : [parentId]

  // ✅ загрузить продукты для всех нужных категорий
  // (если уже загружено для языка — пропускаем)
  for (const id of idsToLoad) {
    if (!productsByCategories.value?.[id]?.[lang] && !productsByCategoriesLoadedAt.value?.[id]?.[lang]) {
      await nutritionStore.getProductsData(id)
    }
  }
}

const round = (value, digits = 2) =>
  value == null || value === '' ? '0.00' : Number(value).toFixed(digits)

const goToProduct = (product) => {
  const lang = langKey.value

  const slug =
    product?.slug ||
    product?.slug_translations?.[lang] ||
    product?.slug_translations?.ru ||
    ''

  if (!slug) return

  const path = localePath({ name: 'products-slug', params: { slug } })
  router.push(path)
}
</script>

<style scoped lang="scss">
.category-img {
  width: 30px;
  height: auto;
  margin-right: 10px;
}

.empty {
  padding: 12px 0;
  opacity: 0.8;
}
</style>
