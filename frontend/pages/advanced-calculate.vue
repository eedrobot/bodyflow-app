
<template>
  <div class="advanced-comp" ref="bgRef">
    <div class="wrapper">

      <BackBreadcrumb />
      <h1 class="title">{{ t('advanced-calculation.title') }}</h1>

      <!-- DESKTOP CIRCLE DESCRIPTION -->
      <div class="description">
        <p>{{ t('advanced-calculation.description')}}</p>
        <p>{{ t('advanced-calculation.note')}}</p>
      </div>

      <Adventages />
      <AdvancedCalculator />

      

    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { useParallaxBackground } from '@/composables/useParallaxBackground'
import Adventages from '@/components/advanced-calculator/Adventages.vue'
import AdvancedCalculator from '@/components/advanced-calculator/AdvancedCalculator.vue'
import BackBreadcrumb from '@/components/ui/BackBreadcrumb.vue'

const { t } = useI18n()
const localePath = useLocalePath()
/* ---------- ФОН + ПАРАЛЛАКС ----------- */
const bgRef = ref(null)

useParallaxBackground({
  bgRef,
  getBgPosition: ({ w, y }) => {
    if (w > 575.98 && w <= 1199.98) {
      return `right -10% top`
    }
    if (w <= 575.98) {
      return `right -10% top 20px`
    }
    return `right ${(y + 10) * 0.5}px`
  },
})

/* ---------- ФОРМА ----------- */
</script>


 <style lang="scss" scoped>
  .advanced-comp {
    position: relative;
    z-index: 1;
    background-image: url('@/public/img/advanced_analysis.png');
    background-repeat: no-repeat;
    background-position: top right;
    background-size: 65% auto;

    .wrapper {
        grid-auto-rows: auto;
        grid-template-areas:
        "breadcrumbs ."
        "title ."
        "description ."
        "cards cards"
        "form form";
        grid-template-columns: 1fr 1fr;
        justify-items: start;
        padding: 1rem 2rem 4rem 4rem;
        gap: 1rem;
        .title {
            grid-area: title;
            justify-self: start;
            text-align: left;
        }
        .description {
          grid-area: description;
          text-align: left;
          p:not(:first-child) {
            font-size: $fs-small;
          }
           ul {
              li{
                list-style-type: disc;
                margin: 0 1rem;
                padding: 0;
                font-size: $fs-small;
                a {
                  color: inherit;
                  text-decoration: underline;
                }
              }
            }
        }
        .gender-toggle {
            @include flex(row, stretch, center);
            flex-wrap: wrap;
            gap: 0.5rem;
        }
      }
    }

@media (max-width: 1199.98px) {
  .advanced-comp {
    height: auto;
  }
}
  /* ИМТ диаграмма */
  @media (max-width: 991.98px) {
    .advanced-comp {
        background-size: 70% auto, 0;
    }
  }
    @media (max-width: 575.98px) {
        .advanced-comp {
            background-size: 60% auto, 0;
            .wrapper {
               grid-template-areas:
               "breadcrumbs ."
                "title ."
                "description description"
                "cards cards"
                "form form";
              padding: 0 1rem 2rem 1rem; 
                .title {
                  margin: 1rem 0 0 0;
                  span {
                    font-size: $fs-middle;
                  }
                }
                .content-form {
                  width: 100%;
                  max-width: 100%;
                }
            }
        }
    }
  </style>
  
