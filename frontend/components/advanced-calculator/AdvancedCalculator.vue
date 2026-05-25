<template>
  <form id="calc-adv-form" class="content-container content-form" @submit.prevent>
    <h2>{{ t('advanced-calculation.title_form') }}</h2>
    <p>{{ t('advanced-calculation.description_form') }}</p>

    <div class = "form-goals">
        <GoalToggle
          :value="store.selectedGoal"
          @change="store.setGoal"
        />
    </div>

    <!-- Желаемый вес -->
    <label v-if="store.selectedGoal !== 'maintenance'">
      {{ t('advanced-calculation.weight') }}
      <input
        type="number"
        v-model.number="store.desiredWeight"
        min="1"
        step="0.1"
      />
    </label>

    <!-- Замеры -->
    <label>
      {{ t('advanced-calculation.waist') }}
      <input
        type="number"
        v-model.number="store.waist"
        min="1"
        step="0.1"
      />
    </label>

    <label>
      {{ t('advanced-calculation.neck') }}
      <input
        type="number"
        v-model.number="store.neck"
        min="1"
        step="0.1"
      />
    </label>

    <label v-if="store.normalizeGender(store.gender) === 'female'">
      {{ t('advanced-calculation.hip') }}
      <input
        type="number"
        v-model.number="store.hip"
        min="1"
        step="0.1"
      />
    </label>

    <Button 
      id="calculate-adv"
      :label="isLoading ? 'Виконуємо розрахунок…' : t('calculation.calculate')"
      :disabled="isLoading"
      @toggle = "uiStore.openModal('confirm')"
    />

    <Notation>
      {{ t('advanced-calculation.note_form') }}
    </Notation>
  </form>

  <Modal v-if="uiStore.activeModal === 'confirm'" @close="uiStore.closeModal()">
    <template #modal-title>
      <div class = "confirm-title">
        {{ t('advanced-calculation.modal_title') }}
      </div>
      <div class = "confirm_descr">
         {{ t('advanced-calculation.modal_descr') }}
      </div>
    </template>
    <template #modal-body>
      <div class="confirm-body">
        <div v-for = "item in confirmItems" :key="item.id" class = "confirm-item">
          <div class = "confirm-item-name">{{ item.title }}</div>
          <div class = "confirm-item-descr">{{ item.descr }}</div>
        </div>
      </div>
    </template>
    <template #modal-footer>
      <Button 
        :label = "t('advanced-calculation.modal_close')"
        :disabled = "false"
        class = "back-btn grey"
        @toggle = "uiStore.closeModal()"/>
      <Button 
      :label = "t('advanced-calculation.modal_ok')"
      :disabled = "false"
      class = "confirm-btn"
      @toggle = "calculate()"/>
    </template>
  </Modal>
</template>

<script setup>
import Notation from '@/components/common/Notation.vue'
import GoalToggle from '@/components/calculator/menu/GoalToggle.vue'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import { useCalculatorStore } from '@/stores/calculator'

const { t } = useI18n()
const config = useRuntimeConfig()

const router = useRouter()
const localePath = useLocalePath()

const store = useCalculatorStore()

const isLoading = ref(false)

const uiStore = useUiStore()

const translatedActivity = computed(() => {
  const activityMap = {
    1.2: 'sedentary',
    1.375: 'light',
    1.55: 'moderate',
    1.725: 'active',
    1.9: 'extra_active',
  }

  const key = activityMap[store.activity]
  return key ? t(`calculation.${key}`) : store.activity
})

const confirmItems = computed(() => {
  const items = [
    {
      id: 0,
      icon: '/icons/icon-body-analys.png',
      title: t('calculation.gender'),
      descr: t(`calculation.${store.gender}`),
    },
    {
      id: 1,
      icon: '/icons/icon-matabolism.png',
      title: t('result.age'),
      descr: store.age,
    },
    {
      id: 2,
      icon: '/icons/icon-menu.png',
      title: t('calculation.height'),
      descr: store.height,
    },
    {
      id: 3,
      icon: '/icons/icon-forecast.png',
      title: t('calculation.weight'),
      descr: store.weight,
    },
    {
      id: 4,
      icon: '/icons/icon-forecast.png',
      title: t('advanced-calculation.waist'),
      descr: store.waist,
    },
    {
      id: 5,
      icon: '/icons/icon-forecast.png',
      title: t('advanced-calculation.neck'),
      descr: store.neck,
    },
  ]

  if (store.normalizeGender(store.gender) === 'female') {
    items.push({
      id: 6,
      icon: '/icons/icon-forecast.png',
      title: t('advanced-calculation.hip'),
      descr: store.hip,
    })
  }

  items.push(
    {
      id: 7,
      icon: '/icons/icon-forecast.png',
      title: t('calculation.activity'),
      descr: translatedActivity.value,
    },
    {
      id: 8,
      icon: '/icons/icon-forecast.png',
      title: t('calculation.goal'),
      descr: t(`result.${store.selectedGoal}`),
    }
  )

  if (store.selectedGoal !== 'maintenance') {
    items.push({
      id: 9,
      icon: '/icons/icon-forecast.png',
      title: t('advanced-calculation.weight'),
      descr: store.desiredWeight,
    })
  }

  return items
})


const calculate = async () => {
  try {
    store.setGender(store.gender)

    // просто применяем выбранную цель
    store.applySolvedGoal(store.selectedGoal)

    if (!store.menuData?.days?.length) {
      isLoading.value = false
      return
    }

    const response = await fetch(`${config.public.apiBase}/calc/create.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        gender: store.gender,
        age: store.age,
        height: store.height,
        weight: store.weight,
        activity: store.activity,

        selectedGoal: store.selectedGoal,
        menuData: store.menuData,

        desiredWeight: store.desiredWeight,
        waist: store.waist,
        neck: store.neck,
        hip: store.hip,
      }),
    })

    const res = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw Object.assign(new Error(res?.error || res?.message || `HTTP ${response.status}`), {
        status: response.status,
        data: res
      })
    }

    store.orderId = res.order_id
    store.orderToken = res.order_token || ''
    store.calculationId = res.calculation_id
    store.calcPreview = res.preview ?? null

    uiStore.closeModal()

    loadingOnButton()

  } catch (e) {
    console.error('create.php request failed:', e)
  } 

  async function loadingOnButton () {
    isLoading.value = true

    setTimeout(() => {
      isLoading.value = false
    }, 3000)
     await router.push({
      path: localePath('tariffs'),
      query: { order_token: store.orderToken },
    })
  }
}
</script>

<style lang="scss" scoped>
.content-form {
  grid-area: form;
  margin: 0 auto;
  width: auto;
  max-width: 61%;

  h2 {
    font-weight: 700;
    color: $color-navy;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  p {
    margin-bottom: 1rem;
  }
  .form-goals {
    @include flex(row, center, space-between);
  }

  #calculate-adv {
    display: block;
    margin: 0 auto;
  }
}

.confirm-title {
  color: $color-navy-d;
  text-align: center;
}
.confirm_descr {
  color: $color-dg;
  font-size: $fs-small;
  font-weight: 400;
  text-align: center;
  margin: 1rem 0;
}
.confirm-body {
  .confirm-item {
    @include border-sides(bottom);
    @include flex(row, center, space-between);
    padding: 0.15rem 0;
    &:last-child {
      border-bottom: none!important;
    }
    .confirm-item-name {
      width: 60%;
      position: relative;
      padding: 0.5rem 0 0.5rem 1.5rem;
    }
    .confirm-item-name:before {
        content: " ";
        background: url('/icons/galka.svg') no-repeat center center;
        background-size: contain;
        width: 20px;
        height: 20px;
        display: block;
        position: absolute;
        left: 0;
        top: 0.65rem;
    }
    .confirm-item-descr {
        width: 40%;
    }
  }
}

.back-btn {
  margin-right: 15px;
}
.back-btn, .confirm-btn {
  max-width: 220px;
}

@media (max-width: 991.98px) {
  .content-form {
    .form-goals {
      @include flex(column, center, center);
    }
    max-width: 80%;
  }
}

@media (max-width: 575.98px) {
   .content-form {
    max-width: 100%;
  }
}

</style>
