<template>
  <div class="nutrition-search" ref="searchWrapper">
    <input
      v-model="query"
      :placeholder="t('nutrition.search')"
      @focus="isOpen = true"
      @input="isOpen = true"
    />

    <ul v-if="isOpen && filteredSuggestions.length" class="suggestions-list">
      <li
        v-for="item in filteredSuggestions"
        :key="item.product_id"
        @click="selectSuggestion(item)"
      >
        {{ getLocalizedName(item) }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { storeToRefs } from 'pinia'

const nutritionStore = useNutritionData()
const { productsByCategories } = storeToRefs(nutritionStore)

const { t, locale } = useI18n()
const router = useRouter()
const localePath = useLocalePath()

const isOpen = ref(false)
const searchWrapper = ref(null)
const query = ref('')

// ✅ массив продуктов (категория 1) с учётом новой структуры catId -> lang -> []
const allProducts = computed(() => {
  const cat = productsByCategories.value?.[1]
  const lang = locale.value
  return cat?.[lang] || cat?.ru || cat?.en || cat?.uk || []
})

const getLocalizedName = (p) => {
  const lang = locale.value
  return (
    p.product_name?.[lang] ||
    p.product_name?.ru ||
    p.product_name?.en ||
    p.product_name?.uk ||
    p.translations?.[lang] ||
    p.translations?.ru ||
    p.translations?.en ||
    p.translations?.uk ||
    p.name ||
    ''
  )
}

const filteredSuggestions = computed(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) return []
  return allProducts.value.filter(p =>
    getLocalizedName(p).toLowerCase().includes(q)
  )
})

onMounted(async () => {
  // если для текущего языка ещё не загружено — грузим
  if (!allProducts.value.length) {
    await nutritionStore.getProductsData(1)
  }
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(query, (v) => {
  isOpen.value = !!v.trim()
})

// ✅ если язык поменяли — и списка нет, догружаем
watch(locale, async () => {
  if (!allProducts.value.length) {
    await nutritionStore.getProductsData(1)
  }
})

async function selectSuggestion(item) {
  query.value = getLocalizedName(item)
  isOpen.value = false

  const lang = locale.value

  const slug =
    item?.slug ||
    item?.slug_translations?.[lang] ||
    item?.slug_translations?.ru ||
    ''

  if (!slug) {
    // если в списке нет slug — см. вариант №2 ниже
    console.warn('No slug in search item', item)
    return
  }

  router.push(localePath({ name: 'nutrition-slug', params: { slug } }))
}

function handleClickOutside(event) {
  if (searchWrapper.value && !searchWrapper.value.contains(event.target)) {
    isOpen.value = false
  }
}
</script>

<style lang="scss" scoped>
.nutrition-search {
  position: relative;

  input {
    width: 100%;
    border-radius: 0.5rem;
    @include border-sides(top bottom left right);
    padding: 20px;
    background: $color-beige-l;
    font-size: $fs-middle;

    &::placeholder {
      font-family: inherit;
      line-height: inherit;
      font-size: $fs-middle;
    }
  }

  .suggestions-list {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: $color-beige-l;
    border: 1px solid $color-mg;
    border-top: none;
    max-height: 50vh;
    overflow-y: auto;
    z-index: 10;
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      padding: 10px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: $color-sb;
        color: $color-white;
      }
    }
  }
}
</style>
