<template>
   <div class="success-comp" ref="bgRef">
      <div class="wrapper">

        <div v-if="loading" class="loading">
            <h1 class = "title">{{ t('payment_success.title_1') }}</h1> 
            <div class="description">
                <p>{{ t('payment_success.descr_1') }}</p>
            </div>

        </div>

        <div v-else-if="pdfUrl" class="ready">
            <h1 class = "title">{{ t('payment_success.title_2') }}</h1>

            <div class = "description">
                <button
                  class="btn bright"
                  type="button"
                  :disabled="downloading"
                  @click="downloadPdf"
                >
                  {{ t('payment_success.descr_2') }}
                </button>
            </div>
        </div>

        <div v-else class="error">
            <h1 class = "title">{{ t('payment_success.title_3') }}</h1>
            <div class="description">
                 <p>{{ error }}</p>
            </div>
        </div>

    </div>
</div>
</template>

<script setup>
import { useCalculatorStore } from '@/stores/calculator'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const store = useCalculatorStore()
const localePath = useLocalePath()

useSeoMeta({
  robots: 'noindex, nofollow',
})

const loading = ref(true)
const downloading = ref(false)
const pdfUrl = ref('')
const error = ref('')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function readOrderStatus(apiBase, orderToken) {
  const url = new URL(`${apiBase}/orders/get.php`)
  url.searchParams.set('order_token', orderToken)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok || !data?.data) {
    throw new Error(data.error || 'Order status check failed')
  }

  return data.data.status
}

async function waitForPaidOrder(apiBase, orderToken) {
  const maxAttempts = 20
  const delayMs = 3000

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const status = await readOrderStatus(apiBase, orderToken)

    if (status === 'paid') return
    if (['failed', 'declined', 'canceled', 'cancelled'].includes(status)) {
      throw new Error('Order payment was not completed')
    }

    if (attempt < maxAttempts) {
      await sleep(delayMs)
    }
  }

  throw new Error('Payment confirmation is still pending. Please refresh the page in a minute.')
}

function clearCalculatorStorage() {
  store.clearPersistedCalculatorData()
}

function errorTypeFromMessage(message, status = 0) {
  const normalized = String(message || '').toLowerCase()

  if (status === 403 && normalized.includes('download limit')) return 'download_limit'
  if (normalized.includes('download limit')) return 'download_limit'
  if (normalized.includes('pdf not found')) return 'pdf_not_found'
  if (normalized.includes('order is not paid')) return 'order_not_paid'
  if (normalized.includes('payment confirmation is still pending')) return 'payment_pending'
  if (normalized.includes('payment was not completed')) return 'payment_failed'

  return 'unknown'
}

function goToError(type) {
  return router.push(localePath({
    name: 'error',
    query: { type },
  }))
}

async function downloadPdf() {
  if (!pdfUrl.value || downloading.value) return

  downloading.value = true

  try {
    const response = await fetch(pdfUrl.value, {
      method: 'GET',
      headers: { 'Accept': 'application/pdf, application/json' },
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      await goToError(errorTypeFromMessage(data.error || response.statusText, response.status))
      return
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'bodyflow_report.pdf'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)

    clearCalculatorStorage()
  } catch (e) {
    await goToError(errorTypeFromMessage(e?.message))
  } finally {
    downloading.value = false
  }
}

onMounted(async () => {
  try {
    const orderToken = String(route.query.order_token || '')

    if (!orderToken) {
      await goToError('unknown')
      return
    }

    const apiBase = config.public.apiBase.replace(/\/$/, '')
    await waitForPaidOrder(apiBase, orderToken)

    const response = await fetch(`${apiBase}/orders/generate_pdf.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        order_token: orderToken,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'PDF generation failed')
    }

    pdfUrl.value = data.pdf_url
  } catch (e) {
    await goToError(errorTypeFromMessage(e?.message))
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.success-comp {
  min-height: calc(100vh - 301.6px);
  padding: 4rem 1rem;
  text-align: center;
  .wrapper {
     grid-auto-rows: auto;
      grid-template-areas:
        "title"
        "description";
      grid-template-columns: 1fr;
      justify-items: center;
      gap: 1rem;
       .title {
        grid-area: title;
        justify-self: center;
        text-align: center;
      }
      .description {
          grid-area: description;
          text-align: center;
      }
  }
}

</style>
