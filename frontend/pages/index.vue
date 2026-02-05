<template>
  <div class="page-container">
    <Calculate />

    <div v-if="calculator.isLoading" class="global-loading">
      <p>{{ t('result.loading') }}</p>
      <Loader :isLoading="true" />
    </div>

    <template v-else-if="showOutputResult">
      <Transition name="slide-up" appear @after-enter="scrollToResults">
        <Result />
      </Transition>

      <Transition name="slide-up" appear>
        <GetMenuBtn
          :label="buttonLabel"
          :disabled="isBtnLoading"
          @toggle="toggleShowMenu"
        />
      </Transition>

      <Transition name="slide-up" appear @after-enter="scrollToMenu">
        <div v-if="showOutputMenu && uiStore.isMenuOpen" id="base-menu">
          <BaseMenu />
        </div>
      </Transition>
    </template>

    <UpBtn />
  </div>
</template>


<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

import Calculate from '@/components/calculator/Calculate.vue'
import Result from '@/components/calculator/result/Result.vue'
import GetMenuBtn from '@/components/calculator/menu/GetMenuBtn.vue'
import BaseMenu from '@/components/calculator/menu/BaseMenu.vue'
import UpBtn from '@/components/ui/UpBtn.vue'
import Loader from '@/components/ui/Loader.vue'

const { t } = useI18n()

const calculator = useCalculatorStore()
const uiStore = useUiStore()

const showOutputResult = computed(() =>
  calculator.resultVisible && !calculator.isLoading
)

const showOutputMenu = computed(() =>
  calculator.resultVisible &&
  calculator.solvedAllGoalsReady &&
  !calculator.isLoading
)

// ---- scroll helpers (без watch) ----
const scrollToResults = async () => {
  await nextTick()
  requestAnimationFrame(() => {
    document.getElementById('results')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  })
}

const scrollToMenu = async () => {
  await nextTick()
  requestAnimationFrame(() => {
    document.getElementById('base-menu')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  })
}

// ---- кнопка меню ----
const isBtnLoading = ref(false)
const menuWasOpenedOnce = ref(false)

const buttonLabel = computed(() => {
  if (isBtnLoading.value) return t('menu.btn_loading')
  if (uiStore.isMenuOpen) return t('menu.btn_close')
  return menuWasOpenedOnce.value ? t('menu.btn_open') : t('menu.btn_default')
})

const openMenuIfReady = () => {
  if (calculator.solvedAllGoalsReady) {
    uiStore.openMenu()
    menuWasOpenedOnce.value = true
    isBtnLoading.value = false
  } else {
    isBtnLoading.value = true
  }
}

const toggleShowMenu = () => {
  if (isBtnLoading.value) return

  if (uiStore.isMenuOpen) {
    uiStore.closeMenu()
    return
  }

  if (menuWasOpenedOnce.value) {
    uiStore.openMenu()
    return
  }

  openMenuIfReady()
}

// ✅ единственный нужный watch
watch(
  () => calculator.solvedAllGoalsReady,
  (ready) => {
    if (!ready) return
    if (!isBtnLoading.value) return
    uiStore.openMenu()
    menuWasOpenedOnce.value = true
    isBtnLoading.value = false
  }
)

useSeo({
  titleKey: 'seo.home.title',
  descriptionKey: 'seo.home.description',
  keywordsKey: 'seo.home.keywords',
  image: '/seo/home-og.png'
})
</script>

<style scoped lang="scss">
.page-container {
  display: block;
}
.global-loading {
  color: $color-navy;
  font-size: $fs-middle;
  margin: 0 auto;

  p {
    text-align: center;
  }
}

:deep(.slide-up-enter-active),
:deep(.slide-up-leave-active) {
  transition: transform 0.35s ease, opacity 0.35s ease;
  will-change: transform, opacity;
}

:deep(.slide-up-enter-from),
:deep(.slide-up-leave-to) {
  transform: translateY(24px);
  opacity: 0;
}

:deep(.slide-up-enter-to),
:deep(.slide-up-leave-from) {
  transform: translateY(0);
  opacity: 1;
}
</style>
