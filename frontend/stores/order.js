// stores/payment.js

import { defineStore } from 'pinia'
import { createPaymentFromApi } from '@/utils/api'

export const useOrderStore = defineStore('order', {
  state: () => ({
    isLoading: false,
    error: null,
  }),

  actions: {
    async createPayment(payload) {
      this.isLoading = true
      this.error = null

      try {
        const response = await createPaymentFromApi(payload)
        const res = await response.json()

        if (!response.ok || !res.success) {
          throw new Error(res.error || 'Payment failed')
        }

        this.submitWayForPayForm(
          res.payment_url,
          res.fields
        )

        return res

      } catch (e) {
        this.error = e.message
        throw e
      } finally {
        this.isLoading = false
      }
    },

    submitWayForPayForm(paymentUrl, fields) {
      const form = document.createElement('form')

      form.method = 'POST'
      form.action = paymentUrl
      form.style.display = 'none'

      Object.entries(fields).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            const input = document.createElement('input')

            input.type = 'hidden'
            input.name = `${key}[]`
            input.value = String(item)

            form.appendChild(input)
          })
        } else {
          const input = document.createElement('input')

          input.type = 'hidden'
          input.name = key
          input.value = String(value)

          form.appendChild(input)
        }
      })

      document.body.appendChild(form)
      form.submit()
    }
  }
})