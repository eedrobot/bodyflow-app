<template>
  <div class = "adv-calc-comp">
     <div class = "wrapper">
        <div class = "content-container">
          <h2>{{ t('advanced-calculation.adv_block_title') }}</h2>
          <p>{{ t('advanced-calculation.adv_block_descr') }}</p>
          <NuxtLink :to="localePath({ name: 'advanced-calculate' })">
            <Button
              :label="t('calculation.extra_block_open')"
              :disabled="isBtnLoading"
              class = "menu-btn"
            />
          </NuxtLink>
        </div>
      </div>
  </div>
</template>

<script setup>
import Button from '@/components/ui/Button.vue' 

const { t } = useI18n()
const localePath = useLocalePath()

const isBtnLoading = ref(false)

</script>

  
<style lang="scss" scoped>
.adv-calc-comp {
    background: $color-lgreen;
    background-size: 100% auto; 
    padding-bottom: 0;
      .wrapper {
        padding: 0 2rem 1rem 2rem;
        grid-auto-rows: auto;
        grid-template-columns: 1fr;
        .content-container {
          width: 80%;
          h2, p {
            text-align: center;
            margin: 1rem 0;
          }
          h2 {
            color: $color-green;
            font-weight: 700;
          }
          p {
            color: #2a2a67;
            font-size: 1.1rem;
            line-height: 1.5rem;
          }
        }
      }
  }

   @media (max-width: 575.98px) {
    .adv-calc-comp {
      background: $color-beige-l;
      .wrapper {
        padding: 0 1rem 2rem 1rem; 
        .content-container {
          width: 100%;
          h2 {
            font-size: $fs-middle;
          }
        }
      }
    }
  }

  </style>
  
