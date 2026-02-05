<template>
  <div class="result-comp" id="results">
    <div class="wrapper">
      <div class="results hidden">
        <h2 class = "result-title">{{ t('result.title') }}</h2>
        <div class = "result-description">
          {{ t('result.description') }}
        </div>

        <!-- BLOCK 1 — AGE + BMI -->
        <div class="result-box box-flex">

          <div class="result-box-item">
            <div class="result-box-txt">
              <h3>{{ t('result.age') }}</h3>
              <p>
                {{ store.age }}
                <span>{{ t('result.age_txt') }}</span>
              </p>
            </div>
            <div class="result-box-img">
              <img src="@/public/user.svg" alt="user-age" />
            </div>
          </div>

          <div class="result-box-item">
            <div class="result-box-txt">
              <h3>{{ t('result.bmi') }}</h3>
              <p>{{ store.BMI }}</p>
            </div>

            <BmiDonut
              :bmi="Number(store.BMI)"
              :status-text="store.BMIStatus ? t('bmiStatus.' + store.BMIStatus) : ''"
            />

          </div>
        </div>

        <!-- BLOCK 2 — BMR + WATER -->
        <div class="result-box box-flex">

          <div class="result-box-item">
            <div class="result-box-txt">
              <h3>{{ t('result.bmr') }}</h3>
              <p>{{ store.BMR }}</p>
              <span>{{ t('result.cal_day') }}</span>
            </div>
            <div class="result-box-img">
              <img src="@/public/fire.svg" alt="burn" />
            </div>
          </div>

          <div class="result-box-item">
            <div class="result-box-txt">
              <h3>{{ t('result.water') }}</h3>
              <p>{{ store.water_norm }}</p>
              <span>{{ t('result.water_txt') }}</span>
            </div>
            <div class="result-box-img">
              <img src="@/public/img/water.png" alt="water" />
            </div>
          </div>
        </div>

        <!-- BLOCK 3 — CALORIES TABLE -->
        <div class="result-box result-calories">
          <div class="result-calories-container result-title">
            <div>{{ t('result.cal') }}</div>
            <div>{{ t('result.cal_day') }}</div>
            <div>{{ t('result.protein') }}</div>
            <div>{{ t('result.fat') }}</div>
            <div>{{ t('result.crabs') }}</div>
          </div>

          <div class="result-calories-container">
            <div>{{ t('result.loss') }}</div>
            <div>{{ store.TDEE_loss }}</div>
            <div>{{ store.protein_loss }}</div>
            <div>{{ store.fat_loss }}</div>
            <div>{{ store.crabs_loss }}</div>
          </div>

          <div class="result-calories-container">
            <div>{{ t('result.maintenance') }}</div>
            <div>{{ store.TDEE }}</div>
            <div>{{ store.protein }}</div>
            <div>{{ store.fat }}</div>
            <div>{{ store.crabs }}</div>
          </div>

          <div class="result-calories-container">
            <div>{{ t('result.gain') }}</div>
            <div>{{ store.TDEE_gain }}</div>
            <div>{{ store.protein_gain }}</div>
            <div>{{ store.fat_gain }}</div>
            <div>{{ store.crabs_gain }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

  
  <script setup>
import BmiDonut from './BmiDonut.vue'

const { t } = useI18n()
const store = useCalculatorStore()

</script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
  <style lang="scss" scoped>
  .result-comp {
    position: relative; 
    z-index: 5;

    margin-top: -70px;
    padding-top: 70px;
    background-image: url('@/public/img/green-bg-1.png');
    background-repeat: no-repeat;
    background-size: 100% auto;
    background-position: top center;
  }
  .wrapper {
    grid-auto-rows: auto;
    grid-template-areas:
        "results";
    padding: 4rem 2rem 1rem 2rem;
    }
    // .calc-loading {
    //   .calc-loading__text {
    //     color: $color-navy;
    //     font-size: $fs-middle;
    //   }


     /* ИМТ диаграмма */
     @media (max-width: 991.98px) {
        .result-comp {
            height: auto;
        }    
    }
    @media (max-width: 575.98px) {
        .result-comp {
            padding: 4rem 0 2rem 0;
            background-position: top 10% center;
            .wrapper {
              width: 100%;
              padding: 0 1rem 2rem 1rem;
            }
        }  
    }   
    
  
  </style>
  