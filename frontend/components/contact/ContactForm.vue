<template>
  <form class="content-container content-form" @submit.prevent="onSubmit">

    <div class="back-img">
      <img src="/img/contact-page-tel.png" alt="contact-phone" />
    </div>

    <h2>{{ t('contact.feedback') }}</h2>

    <!-- NAME -->
    <label>
      {{ t('form.name') }}
      <input
        type="text"
        name="user-name"
        id="user-name"
        v-model.trim="contact.form.name"
        @blur="onBlur('name')"
        :aria-invalid="!!contact.errors.name"
        autocomplete="name"
      />
      <small v-if="contact.touched.name && contact.errors.name" class="field-error">
        {{ t(`form.errors.${contact.errors.name}`) }}
      </small>
    </label>

    <!-- EMAIL -->
    <label>
      {{ t('form.email') }}
      <input
        type="email"
        name="user-email"
        id="user-email"
        v-model.trim="contact.form.email"
        @blur="onBlur('email')"
        :aria-invalid="!!contact.errors.email"
        autocomplete="email"
      />
      <small v-if="contact.touched.email && contact.errors.email" class="field-error">
        {{ t(`form.errors.${contact.errors.email}`) }}
      </small>
    </label>

    <!-- SUBJECT -->
    <label>
      {{ t('form.theme') }}
      <input
        type="text"
        name="user-theme"
        id="user-theme"
        v-model.trim="contact.form.subject"
        @blur="onBlur('subject')"
        :aria-invalid="!!contact.errors.subject"
      />
      <small v-if="contact.touched.subject && contact.errors.subject" class="field-error">
        {{ t(`form.errors.${contact.errors.subject}`) }}
      </small>
    </label>

    <!-- MESSAGE -->
    <label>
      {{ t('form.message') }}
      <textarea
        name="user-message"
        id="user-message"
        v-model.trim="contact.form.message"
        @blur="onBlur('message')"
        :aria-invalid="!!contact.errors.message"
      />
      <small v-if="contact.touched.message && contact.errors.message" class="field-error">
        {{ t(`form.errors.${contact.errors.message}`) }}
      </small>
    </label>

    <!-- honeypot -->
    <input
      v-model="contact.form.company"
      class="hp"
      tabindex="-1"
      autocomplete="off"
      aria-hidden="true"
    />

    <!-- CONSENT -->
    <div class="form-input-inline">
      <input
        type="checkbox"
        name="agree-privacy"
        id="agree-privacy"
        v-model="contact.form.consent"
        @change="onChangeConsent"
      />
      <label for="agree-privacy" class="label-agree">
        <span>
          {{ t('form.privacy.text') }}
          <NuxtLink :to="localePath('privacy-policy')">
            {{ t('pages.title.privacy') }}
          </NuxtLink>
        </span>
      </label>
    </div>

    <small v-if="contact.touched.consent && contact.errors.consent" class="field-error">
      {{ t(`form.errors.${contact.errors.consent}`) }}
    </small>

    <!-- кнопка -->
    <button type="submit" class="btn" :disabled="!contact.canSubmit">
      <span v-if="!contact.isLoading">{{ t('form.send') }}</span>
      <span v-else>...</span>
    </button>

    <!-- статусы -->
    <p v-if="contact.status === 'success'" class="form-success">
      {{ t('form.success') || 'Сообщение отправлено' }}
    </p>

    <p v-else-if="contact.status === 'error'" class="form-error">
      <!-- ✅ серверные ошибки тоже переводим по коду -->
      {{ t(`form.serverErrors.${contact.serverErrorCode || 'unknown'}`) }}
    </p>

  </form>
</template>

<script setup>
const { t } = useI18n()
const contact = useContactFormStore()

const localePath = useLocalePath()

// ✅ тайминг: время старта заполнения формы
if (!contact.form.ts) contact.form.ts = Date.now()

function onBlur(field) {
  contact.touched[field] = true
  contact.validateField(field)
}

function onChangeConsent() {
  contact.touched.consent = true
  contact.validateField('consent')
}

async function onSubmit() {
  // ✅ если вдруг по какой-то причине ts слетел — восстановим
  if (!contact.form.ts) contact.form.ts = Date.now()
  await contact.submit()
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

.hp {
  position: absolute;
  left: -9999px;
  opacity: 0;
  height: 0;
  width: 0;
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
      background: linear-gradient(241deg, rgba(251, 164, 33, 1) 0%, rgba(232, 115, 9, 1) 100%);
      cursor: pointer;
      font-weight: 600;
      font-size: $fs-one;
      max-height: 40.4px;
    }
  }
}
</style>
