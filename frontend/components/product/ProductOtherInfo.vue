<template>
  <Accordion
    v-if="filteredCategories.length"
    :items="filteredCategories"
  >
    <!-- HEADER -->
    <template #header="{ item: category }">
        <img
          v-if="category.img"
          class = "nutrient-img"
          :src="category.img"
          :alt="category.translations?.[currentLang] || category.name || ''"
        />

        <h2>
          {{ category.translations?.[currentLang] 
            || category.translations?.ru
            || category.name
            || '' }}
        </h2>
    </template>

    <!-- BODY -->
    <template #body="{ item: category }">
      <div
        v-for="cat in (category.children?.length ? category.children : [category])"
        :key="cat.category_id"
        class="subcategory"
      >
        <h3>{{ cat.translations?.[currentLang] || cat.translations?.ru }}</h3>

        <!-- есть нутриенты -->
        <template v-if="visibleNutrients(category).length">
          <table>
            <thead>
              <tr>
                <th>{{ t('product.nutrient') }}</th>
                <th>{{ t('product.amount') }}</th>
                <th>{{ t('product.daily_norm') }}</th>
                <th>{{ t('product.day_norm_percent') }}</th>
              </tr>
            </thead>

            <tbody>
              <tr 
                v-for="nutrient in visibleNutrients(category)" 
                :key="nutrient.nutrient_id"
              >
                <td :data-label = "$t('product.nutrient')">{{ nutrient.translations?.[currentLang] || '' }}</td>
                  <td :data-label = "$t('product.amount')">{{ nutrient.value }} {{ nutrient.unit || '' }}</td>
                  <td :data-label = "$t('product.daily')">{{ nutrient.day_norm }} {{ nutrient.unit || '' }}</td>
                  <td :data-label = "$t('product.day_norm_percent')">{{ dailyPercent(nutrient) }}</td>
              </tr>
            </tbody>
          </table>
        </template>

        <p v-else>{{ t('product.no_data') }}</p>
      </div>
    </template>
  </Accordion>
</template>

<script setup>
import { computed } from 'vue'
import Accordion from '@/components/ui/Accordion.vue'

const nutritionStore = useNutritionData()
const { t, locale } = useI18n()
const currentLang = computed(() => locale.value)

//
// ---------- HELPERS ----------
//

// значимое число
const hasValue = (v) => {
  if (v === null || v === undefined || v === '') return false
  const num = Number(v)
  return !Number.isNaN(num) && num !== 0
}

// отфильтрованные нутриенты категории
const visibleNutrients = (cat) => {
  if (!cat?.nutrients) return []
  return cat.nutrients.filter(n =>
    n &&
    (hasValue(n.value) || hasValue(n.day_norm))
  )
}

// процент дневной нормы
const dailyPercent = (n) => {
  const norm = Number(n?.day_norm)
  const val = Number(n?.value)
  if (!norm || Number.isNaN(val)) return '-'
  return ((val * 100) / norm).toFixed(2)
}

//
// ---------- CATEGORIES FOR ACCORDION ----------
//
const filteredCategories = computed(() => {
  const cats = nutritionStore.productData?.nutrients || []

  return cats
    .filter(cat =>
      cat &&
      cat.category_id !== 1 &&
      (visibleNutrients(cat).length ||
        (cat.children?.some(ch => visibleNutrients(ch).length)))
    )
})
</script>

<style lang="scss" scoped>
.nutrient-img {
    width: 30px;
    height: auto;
    margin-right: 10px;
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
.arrow-down {
  transition: transform 0.3s;
}
.arrow-down.rotated {
  transform: rotate(180deg);
}
</style>
