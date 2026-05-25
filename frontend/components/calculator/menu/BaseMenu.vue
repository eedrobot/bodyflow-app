<template>
  <div class="menu-comp" id = "base-menu">
    <div class="wrapper">
      <div class="results"> 
        <div class="result-box">

          <!-- GOAL + TABS + MENU -->
          <div class="result-goals" ref="goalsRef" v-show="isMenuOpen">
            <GoalToggle :value="selectedGoal" @change="goalToggle" />

            <div class="base-menu">
              <Tabs
                ref="tabsRef"
                :active="activeTab"
                :tabs="tabs"
                :lockedTabs="[1, 2, 3, 4]"
                @change="changeTab"
                @locked-click="onLockedClick"
              />

              <transition name="fade">
                <div v-if="showLockedMessage" 
                     ref="lockedMessageRef" 
                    @pointerdown.stop 
                    class="menu-locked-message">
                  <NuxtLink :to="localePath({ name: 'advanced-calculate' })">
                    {{ t('menu.menu_locked') }}
                  </NuxtLink>
                </div>
              </transition>

              <div
                v-if="menu.days?.length"
                v-for="(day, dIndex) in menu.days"
                :key="dIndex"
                class="tab-content"
                v-show="activeTab === dIndex"
              >
                <MenuDaytime
                  v-for="(meal, mealKey) in day.meals"
                  :key="mealKey"
                  :meal="meal"
                  :mealKey="mealKey"
                  :mealImages="mealImages"
                  :mealColors="mealColors"
                  :mealShadowsColor="mealShadowsColor"
                  :nutrients="store.mainNutrients[mealKey]"
                  :smartRound="store.smartRound"
                />
                <MenuTotals :totals="dayTotals" />
                <MenuNotation />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

import breakfastImg from '@/public/img/breakfast.png'
import lunchImg from '@/public/img/lunch.png'
import dinnerImg from '@/public/img/dinner.png'

import Tabs from '@/components/ui/Tabs.vue'
import GoalToggle from '@/components/calculator/menu/GoalToggle.vue'
import MenuDaytime from '@/components/calculator/menu/MenuDaytime.vue'
import MenuTotals from '@/components/calculator/menu/MenuTotals.vue'
import SaveMenuBtn from '@/components/calculator/menu/SaveMenuBtn.vue'
import MenuNotation from '@/components/calculator/menu/MenuNotation.vue'

const { t } = useI18n()
const localePath = useLocalePath()
const store = useCalculatorStore()
const uiStore = useUiStore()

const selectedGoal = computed(() => store.selectedGoal)
const goalToggle = (g) => store.setGoal(g)

const goalsRef = ref(null)
const tabsRef = ref(null)
const lockedMessageRef = ref(null)
const isMenuOpen = computed(() => uiStore.isMenuOpen)

defineExpose({ goalsRef })

const mealImages = { breakfast: breakfastImg, lunch: lunchImg, dinner: dinnerImg }
const mealShadowsColor = {
  breakfast: 'RGBA(243, 145, 18, 0.1)',
  lunch: 'RGBA(78, 116, 67, 0.1)',
  dinner: 'RGBA(99, 87, 169, 0.1)'
}
const mealColors = { breakfast: '#f39112', lunch: '#4e7443', dinner: '#6357a9' }

const tabs = computed(() => [
  t('menu.day_1'),
  t('menu.day_2'),
  t('menu.day_3'),
  t('menu.day_4'),
  t('menu.day_5')
])

const activeTab = computed(() => uiStore.activeMenuDayTab)
const changeTab = (index) => uiStore.setActiveMenuDayTab(index)

const showLockedMessage = ref(false)

const onLockedClick = () => {
  showLockedMessage.value = !showLockedMessage.value
}

const handleClickOutside = (e) => {
  if (!showLockedMessage.value) return

  const clickedInsideMessage = lockedMessageRef.value?.contains(e.target)
  const clickedInsideTabs =
    tabsRef.value?.$el?.contains(e.target) ||
    tabsRef.value?.contains?.(e.target)

  if (clickedInsideMessage || clickedInsideTabs) return

  showLockedMessage.value = false
}

onMounted(() => {
  uiStore.setActiveMenuDayTab(0)
  document.addEventListener('pointerdown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleClickOutside)
})

const menu = computed(() => store.menuData ?? { days: [] })

const dayTotals = computed(() => {
  if (store.selectedGoal === 'loss') {
    return { kcal: store.TDEE_loss, p: store.protein_loss, f: store.fat_loss, c: store.crabs_loss }
  }
  if (store.selectedGoal === 'gain') {
    return { kcal: store.TDEE_gain, p: store.protein_gain, f: store.fat_gain, c: store.crabs_gain }
  }
  return { kcal: store.TDEE, p: store.protein, f: store.fat, c: store.crabs }
})
</script>

  <style lang="scss" scoped>

.menu-comp {
    background: $color-lgreen;
    background-size: 100% auto; 
    padding-bottom: 0;
  }
  .wrapper {
    padding: 0 2rem 1rem 2rem;
    grid-auto-rows: auto;
    grid-template-areas:
        "results";
    }
    .result-box {
      padding: 0;
      .result-goals {
        box-shadow: $b-sh;
        border-radius: $b-r;
        background: $color-white-tr;
          .base-menu {
            position: relative;
            width: 100%;
            margin: 0 auto;
            margin-top: 1.5rem;
            border-radius: 1rem;
            text-align: center;
          
            &__title {
              font-size: 1.4rem;
              font-weight: 700;
              margin-bottom: 1rem;
            }
            .tab-content {
              @include flex(row, stretch, space-between);
              flex-wrap: wrap;
              gap: 5px;
              border-radius: $b-r;
              padding: 1rem;
              min-height: 150px;
            }
            .menu-locked-message {
              position: absolute;
               z-index: 100;
              left: 50%;
              top: 5%;
              transform: translate(-50%);
              width: 20vw;
              background: $color-sb;
              color: $color-white;
              border-radius: $b-r;
              padding: 18px 18px 16px;
              box-shadow: $b-sh;
              cursor: pointer;
              transition: opacity 0.2s ease, transform 0.2s ease;
              a {
                color: $color-white;
              }
               &:before {
                  content: "";
                  position: absolute;
                  top: -10px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 18px;
                  height: 18px;
                  background: $color-beige-l;
                  @include border-sides(left, $color-white-tr);
                  @include border-sides(top, $color-white-tr);
                  transform: translateX(-50%) rotate(45deg);
              }
            }
          }
      }
    }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }

    @media (max-width: 991.98px) {
      .result-box {
        .result-goals {
          justify-content: center;
          .base-menu {
            .menu-locked-message {
                width: 100%;
                top: 3%;
              }
          }
        }
      }
    }
     @media (max-width: 575.98px) {
      .menu-comp {
          background: url('@/public/img/green-bg-mobile.png');
          background-repeat: no-repeat;
          background-size: 100% auto;
          background-position: top center;
          padding-top: 2rem;
          .wrapper {
            padding: 0 1rem 2rem 1rem;
            width: 100%;
          }
        }
        .result-box {
          .result-goals {
            .base-menu {
              .tab-content {
                padding: 0;
              }
              .menu-locked-message {
                width: 100%;
                top: 4%;
              }
            }
          }
        }
     }
  </style>
  
