// /stores/contactForm.js
import { defineStore } from 'pinia'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i

export const useContactFormStore = defineStore('contactForm', {
  state: () => ({
    form: {
      name: '',
      email: '',
      subject: '',
      message: '',
      consent: false,
      company: '',     // honeypot
      ts: Date.now(),  // антиспам по времени (старт заполнения)
    },

    // храним КОДЫ ошибок для i18n
    errors: {
      name: '',
      email: '',
      subject: '',
      message: '',
      consent: '',
    },

    touched: {
      name: false,
      email: false,
      subject: false,
      message: false,
      consent: false,
    },

    isLoading: false,
    status: 'idle', // idle | success | error
    serverErrorCode: '',

    // чтобы success не "сбрасывался" моментально
    _successTimer: null,
  }),

  getters: {
    canSubmit(state) {
      return !state.isLoading && state.form.consent
    },
    hasErrors(state) {
      return Object.values(state.errors).some(Boolean)
    },
    hasServerError(state) {
      return !!state.serverErrorCode
    },
  },

  actions: {
    // --------------------------
    // helpers
    // --------------------------
    _clearSuccessTimer() {
      if (this._successTimer) {
        clearTimeout(this._successTimer)
        this._successTimer = null
      }
    },

    restartTimer() {
      // перезапуск антиспам-таймера при первом рендере или после reset
      this.form.ts = Date.now()
    },

    resetErrors() {
      Object.keys(this.errors).forEach((k) => (this.errors[k] = ''))
    },

    resetTouched() {
      Object.keys(this.touched).forEach((k) => (this.touched[k] = false))
    },

    resetForm() {
      this.form.name = ''
      this.form.email = ''
      this.form.subject = ''
      this.form.message = ''
      this.form.consent = false
      this.form.company = ''
      this.restartTimer()
    },

    resetAll() {
      this._clearSuccessTimer()
      this.status = 'idle'
      this.serverErrorCode = ''
      this.resetErrors()
      this.resetTouched()
      this.resetForm()
    },

    markAllTouched() {
      Object.keys(this.touched).forEach((k) => (this.touched[k] = true))
    },

    // --------------------------
    // validation (возвращаем codes)
    // --------------------------
    validateField(field) {
      const v = String(this.form[field] ?? '').trim()

      if (field === 'name') {
        if (!v) return (this.errors.name = 'required')
        if (v.length < 2) return (this.errors.name = 'name_min')
        if (v.length > 60) return (this.errors.name = 'name_max')
        this.errors.name = ''
      }

      if (field === 'email') {
        if (!v) return (this.errors.email = 'required')
        if (!emailRegex.test(v)) return (this.errors.email = 'email')
        if (v.length > 120) return (this.errors.email = 'email_max')
        this.errors.email = ''
      }

      if (field === 'subject') {
        if (v.length > 120) return (this.errors.subject = 'subject_max')
        this.errors.subject = ''
      }

      if (field === 'message') {
        if (!v) return (this.errors.message = 'required')
        if (v.length < 10) return (this.errors.message = 'message_min')
        if (v.length > 2000) return (this.errors.message = 'message_max')
        this.errors.message = ''
      }

      if (field === 'consent') {
        if (!this.form.consent) return (this.errors.consent = 'consent')
        this.errors.consent = ''
      }
    },

    validateAll() {
      this.resetErrors()
      this.validateField('name')
      this.validateField('email')
      this.validateField('subject')
      this.validateField('message')
      this.validateField('consent')
      return !this.hasErrors
    },

    normalizeServerError({ status, data }) {
      if (data?.error_code) return data.error_code

      if (status === 429) return 'too_many_requests'
      if (status === 400) return 'bad_request'
      if (status === 405) return 'method_not_allowed'
      if (status === 500) return 'mail_error'

      const msg = String(data?.error || '').toLowerCase()
      if (msg.includes('too many')) return 'too_many_requests'
      if (msg.includes('invalid json')) return 'invalid_json'
      if (msg.includes('spam')) return 'spam'
      if (msg.includes('invalid email')) return 'invalid_email'
      if (msg.includes('missing')) return 'missing_fields'

      return 'unknown'
    },

    // --------------------------
    // submit
    // --------------------------
    async submit() {
      const config = useRuntimeConfig()

      this._clearSuccessTimer()
      this.status = 'idle'
      this.serverErrorCode = ''

      // если форма открыта давно или store восстановился из persistedstate,
      // а ts по какой-то причине пустой — восстановим
      if (!this.form.ts) this.restartTimer()

      this.markAllTouched()
      if (!this.validateAll()) return { ok: false }

      this.isLoading = true

      try {
        const res = await fetch(`${config.public.apiBase}/contact.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: this.form.name.trim(),
            email: this.form.email.trim(),
            subject: this.form.subject.trim(),
            message: this.form.message.trim(),
            consent: this.form.consent,
            company: this.form.company, // honeypot
            ts: this.form.ts,           // тайминг
          }),
        })

        const data = await res.json().catch(() => ({}))

        if (!res.ok || !data.ok) {
          this.serverErrorCode = this.normalizeServerError({ status: res.status, data })
          this.status = 'error'
          return { ok: false, error_code: this.serverErrorCode }
        }

        // ✅ успех: очищаем форму, но даём UI показать success
        this.status = 'success'
        this.serverErrorCode = ''
        this.resetErrors()
        this.resetTouched()
        this.resetForm()

        // через 2.5 сек вернёмся в idle (можешь убрать, если не нужно)
        this._successTimer = setTimeout(() => {
          this.status = 'idle'
          this._successTimer = null
        }, 2500)

        return { ok: true }
      } catch (e) {
        this.serverErrorCode = 'network'
        this.status = 'error'
        return { ok: false, error_code: this.serverErrorCode }
      } finally {
        this.isLoading = false
      }
    },
  },
})
