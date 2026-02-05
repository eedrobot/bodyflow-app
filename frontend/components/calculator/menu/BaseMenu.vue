<template>
  <div class="menu-comp" id = "base-menu">
    <div class="wrapper">
      <div class="results"> 
        <div class="result-box">

          <!-- GOAL + TABS + MENU -->
          <div class="result-goals" ref="goalsRef" v-show="isMenuOpen">
            <GoalToggle :value="selectedGoal" @change="goalToggle" />

            <div class="base-menu">
              <Tabs :active="activeTab" :tabs="tabs" @change="changeTab" />

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
import { ref, computed } from 'vue'

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
const store = useCalculatorStore()
const uiStore = useUiStore()

const selectedGoal = computed(() => store.selectedGoal)
const goalToggle = (g) => store.setGoal(g)

const goalsRef = ref(null)
const isMenuOpen = computed(() => uiStore.isMenuOpen)

// ✅ отдаём родителю доступ к goalsRef
defineExpose({ goalsRef })

const mealImages = { breakfast: breakfastImg, lunch: lunchImg, dinner: dinnerImg }
const mealShadowsColor = {
  breakfast: 'RGBA(243, 145, 18, 0.1)',
  lunch: 'RGBA(78, 116, 67, 0.1)',
  dinner: 'RGBA(99, 87, 169, 0.1)'
}
const mealColors = { breakfast: '#f39112', lunch: '#4e7443', dinner: '#6357a9' }

const tabs = computed(() => [t('menu.day_1'), t('menu.day_2'), t('menu.day_3'), t('menu.day_4'), t('menu.day_5')])
const activeTab = computed(() => uiStore.activeMenuDayTab)
const changeTab = (index) => uiStore.setActiveMenuDayTab(index)

const menu = computed(() => store.menuData ?? { days: [] })

const dayTotals = computed(() => {
  if (store.selectedGoal === 'loss') return { kcal: store.TDEE_loss, p: store.protein_loss, f: store.fat_loss, c: store.crabs_loss }
  if (store.selectedGoal === 'gain') return { kcal: store.TDEE_gain, p: store.protein_gain, f: store.fat_gain, c: store.crabs_gain }
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
          }
      }
    }
    @media (max-width: 991.98px) {
      .result-box {
        .result-goals {
          justify-content: center;
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
        .result-goals {
          .base-menu {
            .tab-content {
              padding: 0;
            }
          }
        }
     }
  </style>
  