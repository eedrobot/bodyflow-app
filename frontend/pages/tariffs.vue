<template>
  <div class="adv-result-comp" ref="bgRef">
    <div class="wrapper">
      <BackBreadcrumb />
      <h1 class="title">{{ t('adv_result.title') }}</h1>

      <div class="description">
        <p>{{ t('adv_result.description') }}</p>
      </div>

      <div class="content-wrapper">
        <TariffCard
            :title="tariff1.title"
            :price="tariff1.price"
            :description="tariff1.description"
            :items="tariff1.items"
            :email-placeholder="tariff1.emailPlaceholder"
            :name-placeholder="tariff1.namePlaceholder"
            v-model:email="userEmail"
            v-model:name="userName"
            :button-text="tariff1.buttonText"
            :disabled="isPdfLoading"
            @submit="buyTariff"
        />

        <TariffDescription :title="tariffContentTitle" :items="tariffItems" />

        <div class="content-container faq" v-if="faqItems.length">
          <h2 class="faq-title">{{ t('adv_result.faq.title') }}</h2>

          <Accordion :items="faqItems" variant="accordion-faq">
            <template #header="{ item }">
              <h2>{{ item.q }}</h2>
            </template>

            <template #body="{ item }">
              <p class="info-p">{{ item.a }}</p>
            </template>
          </Accordion>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useParallaxBackground } from '@/composables/useParallaxBackground'
import Accordion from '@/components/ui/Accordion.vue'
import TariffCard from '@/components/tariffs/TariffCard.vue'
import TariffDescription from '@/components/tariffs/TariffDescription.vue'
import BackBreadcrumb from '@/components/ui/BackBreadcrumb.vue'
import { useCalculatorStore } from '@/stores/calculator'

const { t, te, locale } = useI18n()
const store = useCalculatorStore()
const route = useRoute()
const config = useRuntimeConfig()

const orderStore = useOrderStore()

/* ---------- UI state ----------- */
const userEmail = ref('')
const userName = ref('')
const isPdfLoading = ref(false)

/* ---------- order restore (SSR-safe) ----------- */
const orderToken = computed(() => route.query.order_token)

await useAsyncData('order-restore', async () => {
  const token = orderToken.value
    ? String(orderToken.value)
    : String(store.orderToken || '')

  if (!token) return null

  const url = new URL(`${config.public.apiBase.replace(/\/$/, '')}/orders/get.php`)
  url.searchParams.set('order_token', token)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  })
  const res = await response.json().catch(() => ({}))
  if (!response.ok) return null

  const data = res?.data
  if (!data) return null

  store.orderId = data.order_id
  store.orderToken = data.order_token || token
  store.calculationId = data.calculation_id
  store.selectedGoal = data.selected_goal || store.selectedGoal
  store.calcPreview = data.metrics_json || null

  userEmail.value = data.email || ''
  userName.value = data.customer_name || ''

  return data
})

/* ---------- tariff ----------- */
const tariff1 = computed(() => ({
  title: t('adv_result.tariff_1.title'),
  price: '20 грн.',
  description: t('adv_result.tariff_1.description'),
  items: [
    t('adv_result.tariff_1.item_1'),
    t('adv_result.tariff_1.item_2'),
    t('adv_result.tariff_1.item_3'),
    t('adv_result.tariff_1.item_4'),
  ],
  emailPlaceholder: t('adv_result.tariff_1.email_title'),
  namePlaceholder: t('adv_result.tariff_1.name_title'),
  buttonText: t('adv_result.tariff_1.btn'),
}))

/* ---------- download pdf ----------- */

async function buyTariff({ email, name }) {
  const token =
    orderToken.value
      ? String(orderToken.value)
      : String(store.orderToken || '')

  if (!token) return

  await orderStore.createPayment({
    order_token: token,
    locale: locale.value || 'uk',
    user_name: name,
    user_email: email
  })
}

/* ---------- tariff content ----------- */
const tariffContentTitle = computed(() => t('adv_result.tariff_content.title'))

const tariffItems = computed(() => ([
  {
    key: 'body',
    icon: '/icons/icon-body-analys.png',
    title: t('adv_result.tariff_content.title_1'),
    descr: t('adv_result.tariff_content.descr_1'),
  },
  {
    key: 'metabolism',
    icon: '/icons/icon-matabolism.png',
    title: t('adv_result.tariff_content.title_2'),
    descr: t('adv_result.tariff_content.descr_2'),
  },
  {
    key: 'menu',
    icon: '/icons/icon-menu.png',
    title: t('adv_result.tariff_content.title_3'),
    descr: t('adv_result.tariff_content.descr_3'),
  },
  {
    key: 'forecast',
    icon: '/icons/icon-forecast.png',
    title: t('adv_result.tariff_content.title_4'),
    descr: t('adv_result.tariff_content.descr_4'),
  },
]))

/* ---------- FAQ ----------- */
const faqItems = computed(() => {
  const out = []
  for (let i = 1; i <= 30; i++) {
    const qKey = `adv_result.faq.item_${i}_q`
    const aKey = `adv_result.faq.item_${i}_a`
    if (!te(qKey) || !te(aKey)) break

    out.push({
      category_id: i,
      q: t(qKey),
      a: t(aKey),
    })
  }
  return out
})

/* ---------- ФОН + ПАРАЛЛАКС ----------- */
const bgRef = ref(null)

useParallaxBackground({
  bgRef,
  getBgPosition: ({ w, y }) => {
    if (w > 575.98 && w <= 1199.98) return `right -10% top`
    if (w <= 575.98) return `right -10% top 20px`
    return `right ${(y + 10) * 0.5}px`
  },
})
</script>

<style lang="scss" scoped>
.adv-result-comp {
  position: relative;
  z-index: 1;
  background-image: url('/img/calculate_ad_page.png');
  background-repeat: no-repeat;
  background-position: top right;
  background-size: 55% auto;

  .wrapper {
    grid-auto-rows: auto;
    grid-template-areas:
      "breadcrumbs ."
      "title ."
      "description ."
      "tariff tariff";
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
        li {
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

    .content-wrapper {
      grid-area: tariff;
      @include flex(row, flex-end, space-between);
      flex-wrap: wrap;

      .content-container {
        margin: 0 0;

        &.faq {
          width: 100%;
          max-width: 70vw;
          margin: 1rem auto;

          .faq-title {
            text-align: center;
            font-weight: 700;
          }
        }
      }
    }
  }
}

@media (max-width: 1199.98px) {
  .adv-result-comp {
    height: auto;
  }
}

@media (max-width: 991.98px) {
  .adv-result-comp {
    background-size: 70% auto, 0;

    .wrapper {
      .content-wrapper {
        justify-content: center;
      }
    }
  }
}

@media (max-width: 575.98px) {
  .adv-result-comp {
    background-size: 60% auto, 0;

    .wrapper {
      grid-template-areas:
        "breadcrumbs ."
        "title ."
        "description description"
        "tariff tariff";
      padding: 0 1rem 2rem 1rem;

      .title {
        margin: 1rem 0 0 0;

        span {
          font-size: $fs-middle;
        }
      }

      .content-wrapper {
        .content-container {
          &.faq {
            max-width: 100%;
          }
        }
      }
    }
  }
}
</style>
