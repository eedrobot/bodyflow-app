
<template>
  <div class="calculate-comp" ref="bgRef">
    <div class="wrapper">

      <h1 class="title">{{ t('calculation.title_calc.title_1') }}<br /><span>{{ t('calculation.title_calc.title_2') }}</span></h1>

      <!-- DESKTOP CIRCLE DESCRIPTION -->
      <div class="description">
        <p>{{ $t('general.description.desc_1')}}
            <NuxtLink :to="localePath('menu')">
                {{ t('general.description.desc_1_link') }}
            </NuxtLink>
           {{ $t('general.description.desc_2')}}</p>
        <p>{{ $t('general.description_1.desc_1')}}</p>
          <ul>
            <li>
              <NuxtLink :to="localePath('imt')">{{ $t('general.description_1.desc_1_link')}}</NuxtLink>
              {{ $t('general.description_1.desc_1_1')}}</li>
            <li>
              <NuxtLink :to = "localePath('kbju')">{{ $t('general.description_1.desc_2_link')}}</NuxtLink>
              {{ $t('general.description_1.desc_2_1')}}</li>
          </ul>
          
      </div>

      <!-- FORM -->
      <form id="calc-form" class="content-container content-form">
        
        <div class="gender-toggle">
          <button
            type="button"
            class="btn"
            @click="genderToggle('male')"
            :class="{ active: selectedGender === 'male' }"
          >
            {{ t('calculation.male') }}
          </button>

          <button
            type="button"
            class="btn"
            @click="genderToggle('female')"
            :class="{ active: selectedGender === 'female' }"
          >
            {{ t('calculation.female') }}
          </button>
        </div>

        <label>
          {{ t('calculation.birth') }}
          <input v-model="store.birthDate" type="date" required />
        </label>

        <label>
          {{ t('calculation.height') }}
          <input v-model="store.height" type="number" required />
        </label>

        <label>
          {{ t('calculation.weight') }}
          <input v-model="store.weight" type="number" required />
        </label>

        <label>
          {{ t('calculation.activity') }}
          <select v-model="store.activity">
            <option :value="1.2">{{ t('calculation.sedentary') }}</option>
            <option :value="1.375">{{ t('calculation.light') }}</option>
            <option :value="1.55">{{ t('calculation.moderate') }}</option>
            <option :value="1.725">{{ t('calculation.active') }}</option>
            <option :value="1.9">{{ t('calculation.extra_active') }}</option>
          </select>
        </label>

        <button type="button" id="calculate" @click="calculate" class = "btn bright">
          {{ t('calculation.calculate') }}
        </button>

        <Notation>
          {{ t('calculation.notation') }}
        </Notation>

      </form>

    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { useParallaxBackground } from '@/composables/useParallaxBackground'
import Notation from '@/components/common/Notation.vue'

const { t } = useI18n()
const localePath = useLocalePath()

const store = useCalculatorStore()
const selectedGender = ref('male')

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
const genderToggle = g => {
  selectedGender.value = g
  store.gender = g
}


const calculate = () => {
  store.runAllCalculations()
}

</script>


 <style lang="scss" scoped>
  .calculate-comp {
    position: relative;
    z-index: 1;
    background-image: url('@/public/img/home_bg-1.png');
    background-repeat: no-repeat;
    background-position: top right;
    background-size: 65% auto;

    .wrapper {
        grid-auto-rows: auto;
        grid-template-areas:
        "title ."
        "description ."
        "form .";
        grid-template-columns: 1fr 1fr;
        justify-items: start;
        padding: 1rem 2rem 4rem 4rem;
        gap: 0;
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
  .calculate-comp {
    height: auto;
  }
}
  /* ИМТ диаграмма */
  @media (max-width: 991.98px) {
    .calculate-comp {
        background-size: 70% auto, 0;
        .wrapper {
            grid-template-areas: 
            "title"
            "description"
            "form";
            grid-template-columns: 100%;
            grid-template-rows: auto;
            .title {
              margin: 1rem 350px 2rem 0;
            }
        }
    }
  }
    @media (max-width: 575.98px) {
        .calculate-comp {
            background-size: 60% auto, 0;
            .wrapper {
              padding: 0 1rem 2rem 1rem; 
                .title {
                  width: 50%;
                  margin: 1rem 0 0 1rem;
                  span {
                    font-size: $fs-middle;
                  }
                }
            }
        }
    }
  </style>
  