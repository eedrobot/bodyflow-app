<template>
  <div class="nutrient-summary" style="margin-top:18px;">
    <!-- 💛 NUTRITIONAL VALUES -->
    <div class="nutrient-list">
      <h2>{{ t('product.nutritional_value') }}</h2>

      <div class="nutrient-calories" v-if="calories">
        <div class="label">{{ calories.name }}</div>
        <div class="value" id="calories">
          {{ calories.value }} {{ calories.unit }}
        </div>
      </div>

      <div class="nutrients-items-wrapper" v-if="items.length">
        <div class="nutrients-items">
          <div
            class="nutrient-list-item"
            v-for="(nutrient, index) in items"
            :key="nutrient.nutrient_id"
            :style="{ '--nutrient-color': colors[index] }"
          >
            <div class="nutrient-color"></div>
            <div class="nutrient-name">
              {{ nutrient.translations[currentLang] || nutrient.translations?.ru }}
            </div>
            <div class="nutrient-amount">{{ nutrient.value }} г</div>
          </div>
        </div>

        <!-- 🍩 PIE CHART -->
        <div class="nutrients-diagram">
          <div class="chart" :style="{ background: chartBackground }">
            <div class="center"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 📊 DAILY NORM -->
    <div class="nutrients-day-norm" v-if="sortedNutrients.length">
      <h2>{{ t('product.day_norm_percent') }}</h2>

      <div
        class="nutrient-progress"
        v-for="(nutrient, index) in sortedNutrients.slice(0, 3)"
        :key="nutrient.nutrient_id"
      >
        <div class="nutrient-name">
          {{ nutrient.translations[currentLang] || nutrient.translations?.ru }}
        </div>

        <div class="nutrient-bar-wrapper">
          <div
            class="nutrient-color"
            :style="{
              '--nutrient-color': colors[index],
              '--width': getPartPercent(nutrient) + '%'
            }"
          ></div>
        </div>

        <div class="nutrient-percent">
          {{ getPartPercent(nutrient).toFixed(2) }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const nutritionStore = useNutritionData()
const { locale, t } = useI18n()

const currentLang = computed(() => locale.value)

// -------------------------
// NUTRIENTS PROCESSING
// -------------------------
const sortedNutrients = computed(() => {
  const raw = nutritionStore.productData?.nutrients?.[0]?.nutrients || []
  const order = [2, 3, 4, 13, 1]

  return raw
    .filter(n => n && n.nutrient_id !== 14)
    .sort(
      (a, b) =>
        order.indexOf(a.nutrient_id) - order.indexOf(b.nutrient_id)
    )
})

const calories = computed(() =>
  nutritionStore.productData?.nutrients?.[0]?.nutrients?.find(
    n => n.nutrient_id == 14
  )
)

// -------------------------
// DAY NORM PERCENTAGE
// -------------------------
const getPartPercent = (nutrient) => {
  const norm = Number(nutrient?.day_norm) || 0
  const value = Number(nutrient?.value) || 0
  if (!norm) return 0
  return (value * 100) / norm
}

// -------------------------
// CHART COLORS
// -------------------------
const colors = ['#5a84fb', '#b34aa1', '#dc5f19', '#6ba166', '#c4bed1']

// -------------------------
// PIE CHART ITEMS
// -------------------------
const items = computed(() => {
  const nutrients = sortedNutrients.value
  const total = nutrients.reduce(
    (s, n) => s + Number(n?.value || 0),
    0
  )

  return nutrients.map((n, index) => ({
    ...n,
    value: Number(n.value) || 0,
    percent: total ? (Number(n.value) / total) * 100 : 0,
    color: colors[index]
  }))
})

// -------------------------
// CHART BACKGROUND
// -------------------------
const chartBackground = computed(() => {
  let start = 0
  const segments = items.value.map(item => {
    const end = start + item.percent
    const sector = `${item.color} ${start}% ${end}%`
    start = end
    return sector
  })

  return `conic-gradient(${segments.join(', ')})`
})
</script>
  
  <style lang="scss" scoped>
.nutrient-list {
    h2 {
      font-weight: 600;
      text-transform: none;
      margin-bottom: 20px;
    }
    .nutrient-calories {
      .label { font-weight:500; 
        font-size: $fs-one; 
        color:$color-dg; 
      }
      .value { 
        font-size: $fs-secondary; 
        font-weight:500; 
        margin: 20px 0;
      }
    }
  .nutrients-items-wrapper {
    display: grid;
    grid-template-columns: repeat(2, 50%);
    grid-template-rows: auto;
    .nutrient-list-item {
    @include flex(row, center, start);
    @include border-sides(bottom);
    padding: 10px;
      .nutrient-color {
          width: 14px;
          height: 14px;
          border-radius: 4px;
          background: var(--nutrient-color);
          margin-right: 5px;
        }
      .nutrient-name {
        width: 35%;
        min-width: 100px;
        font-weight: 500;
      }
      .nutrient-amount {
        font-weight: 500;
      }
      .nutrient-percent {
        color: $color-dg;
      }
      .nutrient-amount,
      .nutrient-percent {
        width: 25%;
        min-width: 70px;
      }
    }
    .nutrients-diagram {
      @include flex(row, center, center);
      .chart {
        width: 180px;
        height: 180px;
        border-radius: 50%;
        position: relative;
        margin: 0 auto 20px;
              
        .center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90px;
          height: 90px;
          background: #f9f5ee;
          border-radius: 50%;
        }
      }
    }
  }
}
.nutrients-day-norm {
  margin-top: 20px;
  .nutrient-progress {
    @include flex (row, center, flex-start);
    width: 100%;
    padding: 10px 0;
    .nutrient-name {
      width: 25%;
    }
    .nutrient-bar-wrapper {
      width: 200px;
      height: 15px;
      border-radius: 50px;
      overflow: hidden;
      background: $color-mg;
      .nutrient-color {
        background: var(--nutrient-color);
        width: var(--width);
        height: 100%;
      }
    }
    .nutrient-percent {
      width: 25%;
      margin-left: 15px;
    }
  }
}
@media (max-width: 575.98px) {
  .nutrient-list {
    .nutrients-items-wrapper {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
  }
  .nutrients-day-norm {
    .nutrient-progress{
      .nutrient-name {
        width: 50%;
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
  