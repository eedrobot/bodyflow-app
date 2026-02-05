<template>
  <UiDropdown
    v-model:open="isLangOpen"
    containerClass="langs-container"
    toggleClass="langs-toggle"
    contentClass="langs-content"
  >
    <template #drop-toggle>
      <img :src="currentFlag" class="lang-img" alt="flag" />
      <span>{{ currentName }}</span>
    </template>

    <template #drop-content>
      <ul class="langs-list">
        <li
          v-for="loc in locales"
          :key="loc.code"
          @click="selectLang(loc.code)"
        >
          <img :src="langFlag(loc.code)" class="lang-img" />
          <span>{{ langName(loc.code) }}</span>
        </li>
      </ul>
    </template>
  </UiDropdown>
</template>

<script setup>
import { computed, ref } from 'vue'
import UiDropdown from '@/components/ui/UiDropdown.vue'

const router = useRouter()
const route = useRoute()

const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const localePath = useLocalePath()

const languageStore = useLanguageStore()
const nutritionStore = useNutritionData()

const isLangOpen = ref(false)

const currentLang = computed(() => locale.value)

const currentName = computed(() =>
  languageStore.languages.find(l => l.code === currentLang.value)?.short
)

const currentFlag = computed(() =>
  languageStore.languages.find(l => l.code === currentLang.value)?.flag
)

const langName = (code) =>
  languageStore.languages.find(l => l.code === code)?.short || code

const langFlag = (code) =>
  languageStore.languages.find(l => l.code === code)?.flag || ''

function isProductPage() {
  // route.name в nuxt-i18n может быть типа: 'nutrition-slug___ru'
  const name = String(route.name || '')
  return name.startsWith('nutrition-slug')
}

async function selectLang(targetLang) {
  isLangOpen.value = false

  // если мы уже на нужном языке — ничего не делаем
  if (targetLang === currentLang.value) return

  // ✅ 1) Если это страница продукта — меняем slug на slug выбранного языка
  if (isProductPage()) {
    const data = nutritionStore.productData

    const targetSlug =
      data?.slug_translations?.[targetLang] ||
      data?.slug_translations?.ru ||
      ''

    if (targetSlug) {
      const path = localePath(
        { name: 'nutrition-slug', params: { slug: targetSlug } },
        targetLang
      )
      await router.push(path)
      return
    }

    // если productData ещё нет (вдруг) — просто переключим язык без смены slug
    // (API у тебя теперь не будет 404, потому что product.php ищет slug без lang_id)
  }

  // ✅ 2) Все остальные страницы — стандартно
  const path = switchLocalePath(targetLang)
  await router.push(path)
}
</script>


<style scoped lang="scss">
  :deep(.langs-toggle) {
    position: relative;
    z-index: 101;
    width: 45px;
    height: 45px;
    @include flex(row, center, center);
    background: $color-mg;
    color: $color-black;
    font-weight: 700;
    font-size: 14px;
    margin: 0 5px;
    cursor: pointer;
    border-radius: $b-r;
    transition: all ease-in-out 0.2s;

    &:hover {
      background: $color-navy-d;
      color: white;
      border: 1px solid $color-navy;
    }
  }
  :deep(.langs-content) {
    background: $color-navy-d;
    color: $color-white;
    border-radius: 0 0 2rem 2rem;
    width: 45px;
    top: 22px;
    left: 50%;
    transform: translateX(-50%);
    .langs-list {
      padding: 1rem 0;

      li {
        @include flex(row, center, center);
        font-size: 14px;
        padding: 10px 0;
        color: $color-white;
        cursor: pointer;
        transition: all ease-in-out 0.2s;

        &:hover {
          font-weight: 700;
        }
      }
    }
  }

  .lang-img {
    height: 15px;
    width: 15px;
    margin-right: 3px;
  }


@media (max-width: 991.98px) {
    .langs-list {
      li {
        font-size: $fs-small;
      }
    }
  }

</style>
