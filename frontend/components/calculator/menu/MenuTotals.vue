<template>
  <div class="menu-totals">
    <div class="menu-totals-nutrient">
      <div class="totals-nutrient-info">
        <img :src="icons.kcal" alt="" />
        <span class="totals-nutrient-name">
          {{ t('menu.kcal') }}
        </span>
      </div>
      <div class="totals-nutrient-value nutrient-calories">
        {{ totals.kcal }}
      </div>
    </div>

    <div class="menu-totals-nutrient">
      <div class="totals-nutrient-info">
        <img :src="icons.protein" alt="" />
        <span class="totals-nutrient-name">
          {{ t('menu.protein') }}
        </span>
      </div>
      <div class="totals-nutrient-value nutrient-protein">
        {{ totals.p }} {{ t('menu.gram') }}
      </div>
    </div>

    <div class="menu-totals-nutrient">
      <div class="totals-nutrient-info">
        <img :src="icons.fat" alt="" />
        <span class="totals-nutrient-name">
          {{ t('menu.fat') }}
        </span>
      </div>
      <div class="totals-nutrient-value nutrient-fat">
        {{ totals.f }} {{ t('menu.gram') }}
      </div>
    </div>

    <div class="menu-totals-nutrient">
      <div class="totals-nutrient-info">
        <img :src="icons.carb" alt="" />
        <span class="totals-nutrient-name">
          {{ t('menu.carb') }}
        </span>
      </div>
      <div class="totals-nutrient-value nutrient-carb">
        {{ totals.c }} {{ t('menu.gram') }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  totals: {
    type: Object,
    required: true, // { kcal, p, f, c }
  },
})

const { t } = useI18n()

// В Nuxt /public доступен по пути "/..."
const icons = {
  kcal: '/fire.svg',
  protein: '/img/protein.png',
  fat: '/img/fat.svg',
  carb: '/img/carb.png',
}
</script>
<style lang="scss" scoped>
    .menu-totals {
        @include flex(row, center, space-around);
        flex: 0 0 100%; 
        margin-top: 1rem;
        border-radius: $b-r;
        box-shadow: $b-sh;
        background: $color-beige-l;
        padding: 1rem 0.5rem;
        .menu-totals-nutrient {
            @include border-sides(right);
            width: 100%;
            &:last-child {
            border:none;
            }
            .totals-nutrient-info {
                @include flex(row, center, center);
                margin-bottom: 1rem;
                img {
                    width: auto;
                    height: 30px;
                    margin-right: 5px;
                }
                .totals-nutrient-name {
                    font-size: $fs-secondary;
                    color: $color-dg;
                    font-weight: 700;
                }
            }
            .totals-nutrient-value {
                font-size: $fs-primary;
                font-weight: 700;
                &.nutrient-calories {
                    color: $color-sb;
                }
                &.nutrient-protein {
                    color: $color-orange;
                }
                &.nutrient-fat {
                    color: $color-green;
                    opacity: 0.7;
                }
                &.nutrient-carb {
                    color: $color-db;
                }
            }
        }
    }
     @media (max-width: 575.98px) {
         .menu-totals {
            .menu-totals-nutrient {
                .totals-nutrient-info {
                    img {
                        display: none;
                    }
                    .totals-nutrient-name {
                        font-size: $fs-small;
                    }
                }
                .totals-nutrient-value {
                    font-size: $fs-middle;
                }
            }
        }
     }
</style>