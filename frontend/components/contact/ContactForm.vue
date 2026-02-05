<template>
  <!-- ⚠️ добавили @submit.prevent -->
  <form class="content-container content-form" @submit.prevent="submit">

    <div class="back-img">
      <img src="/public/img/contact-page-tel.png" alt="contact-phone" />
    </div>

    <h2>{{ t('contact.feedback') }}</h2>

    <label>
      {{ t('form.name') }}
      <!-- v-model -->
      <input
        type="text"
        name="user-name"
        id="user-name"
        v-model.trim="form.name"
        required
      />
    </label>

    <label>
      {{ t('form.email') }}
      <input
        type="email"
        name="user-email"
        id="user-email"
        v-model.trim="form.email"
        required
      />
    </label>

    <label>
      {{ t('form.theme') }}
      <input
        type="text"
        name="user-theme"
        id="user-theme"
        v-model.trim="form.subject"
      />
    </label>

    <label>
      {{ t('form.message') }}
      <textarea
        name="user-message"
        id="user-message"
        v-model.trim="form.message"
        required
      />
    </label>

    <div class="form-input-inline">
      <input
        type="checkbox"
        name="agree-privacy"
        id="agree-privacy"
        v-model="form.consent"
        required
      />
      <label for="agree-privacy" class="label-agree">
        <span>
          {{ t('form.privacy.text') }}
          <a href="#">{{ t('form.privacy.link') }}</a>
        </span>
      </label>
    </div>

    <!-- кнопка с состояниями -->
    <button type="submit" class="btn" :disabled="isLoading || !form.consent">
      <span v-if="!isLoading">{{ t('form.send') }}</span>
      <span v-else>...</span>
    </button>

    <!-- статусы -->
    <p v-if="status === 'success'" class="form-success">
      {{ t('form.success') || 'Сообщение отправлено' }}
    </p>
    <p v-else-if="status === 'error'" class="form-error">
      {{ errorText || t('form.error') || 'Ошибка отправки' }}
    </p>

  </form>
</template>
  
<script setup>
import { reactive, ref } from 'vue'
const { t } = useI18n()

const isLoading = ref(false)
const status = ref('idle') // idle | success | error
const errorText = ref('')

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
  consent: true, // у тебя чекбокс checked
})

async function submit() {
  status.value = 'idle'
  errorText.value = ''

  if (!form.consent) return

  isLoading.value = true

  try {
    const res = await fetch('http://nutrition.test/api/contact.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok || !data.ok) {
      throw new Error(data?.error || 'Send failed')
    }

    status.value = 'success'

    // очистка формы
    form.name = ''
    form.email = ''
    form.subject = ''
    form.message = ''
    form.consent = false

  } catch (e) {
    status.value = 'error'
    errorText.value = e?.message || 'Ошибка отправки'
  } finally {
    isLoading.value = false
  }
}
</script>

  <style lang="scss" scoped>
    .content-form {
        grid-area: form;
        position: relative;
        width: 100%;
        h2 {
            font-weight: 700;
            color: $color-navy;
            margin-bottom: 1.5rem;
        }
        .btn {
            display: block;
            margin: 0 auto;
        }
        .back-img {
          position: absolute;
          top: 45px;
          left: -175px;
          img {
            width: 250px;
            height: auto;
          }
        }
    }
    @media (max-width: 991.98px) {
      .content-form {
        .back-img {
          display: none;
        }
      }
    }

    @media (max-width: 575.98px) {
    .content-form {
        h2 {
            @include flex(row, center, center);
            width: 100%;
            color: $color-white;
            text-transform: none;
            text-align: center;
            padding: 0.7rem;
            border: none;
            border-radius: $b-r;
            background: linear-gradient(241deg,rgba(251, 164, 33, 1) 0%, rgba(232, 115, 9, 1) 100%);
            cursor: pointer;
            font-weight: 600;
            font-size: $fs-one;
            max-height: 40.4px;
            }
        }
    }
  </style>
  