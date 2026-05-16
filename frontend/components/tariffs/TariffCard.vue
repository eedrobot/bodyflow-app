<template>
  <div class="content-container tariff-content" :class="cardClass">
    <h4>{{ title }}</h4>

    <p class="tariff-price">{{ price }}</p>

    <p v-if="description" class="tariff-p">{{ description }}</p>

    <ul v-if="items?.length">
      <li v-for="(it, idx) in items" :key="idx">{{ it }}</li>
    </ul>

    <form class="content-form" @submit.prevent="onSubmit">
      <label>
        <input 
          v-model.trim="nameValue"
          type="text"
          required
          autocomplete="name"
          :placeholder="namePlaceholder"
        />
      </label>

      <label>
        <input
          v-model.trim="emailValue"
          type="email"
          required
          autocomplete="email"
          inputmode="email"
          :placeholder="emailPlaceholder"
        />
      </label>

      <button
        v-if="buttonText"
        type="submit"
        class="btn bright"
        :disabled="disabled || !isEmailValid || !isNameValid"
      >
        {{ buttonText }}
      </button>

       <AgreementBlock
        v-model="acceptedDocs"
        :show-error="showAgreementError && !acceptedDocs"
      />
    </form>

    <slot />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import AgreementBlock from '@/components/common/AgreementBlock.vue'

const props = defineProps({
  title: { type: String, required: true },
  price: { type: String, required: true },
  description: { type: String, default: '' },
  items: { type: Array, default: () => [] },

  emailPlaceholder: { type: String, required: true },
  namePlaceholder: { type: String, default: '' },

  email: { type: String, default: '' },
  name: { type: String, default: '' },

  buttonText: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  cardClass: { type: [String, Array, Object], default: '' },
})

const emit = defineEmits([
  'submit',
  'update:email',
  'update:name'
])

const emailValue = ref(props.email || '')
const nameValue = ref(props.name || '')
const acceptedDocs = ref(false)
const showAgreementError = ref(false)

watch(() => props.email, (v) => {
  if (typeof v === 'string' && v !== emailValue.value) {
    emailValue.value = v
  }
})

watch(() => props.name, (v) => {
  if (typeof v === 'string' && v !== nameValue.value) {
    nameValue.value = v
  }
})

watch(emailValue, (v) => emit('update:email', v))
watch(nameValue, (v) => emit('update:name', v))

watch(acceptedDocs, (v) => {
  if (v) {
    showAgreementError.value = false
  }
})

const isEmailValid = computed(() => {
  const v = emailValue.value.trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
})

const isNameValid = computed(() => {
  return nameValue.value.trim().length >= 2
})

const onSubmit = () => {
  if (props.disabled) return
  if (!isEmailValid.value) return
  if (!isNameValid.value) return

  if (!acceptedDocs.value) {
    showAgreementError.value = true
    return
  }

  showAgreementError.value = false

  emit('submit', {
    email: emailValue.value.trim(),
    name: nameValue.value.trim(),
    acceptedDocs: acceptedDocs.value
  })
}
</script>

<style lang="scss" scoped>
.content-container {
  margin: 0 0;

  .tariff-price {
    margin: 1rem 0;
    text-align: center;
    font-size: $fs-primary;
    color: $color-navy;
    font-weight: 700;
  }

  .tariff-p {
    text-align: center;
    margin: 0 auto;
  }

  h4 {
    text-align: center;
  }

  ul {
    margin: 1rem auto;

    li {
      position: relative;
      padding: 0.5rem 0 0.5rem 1.5rem;
    }

    li:before {
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
  }

  .btn {
    display: block;
    margin: 0 auto;
  }

  &.tariff-content {
    width: 35%;
  }
}

 @media (max-width: 991.98px) {
  .content-container {
    &.tariff-content {
      width: 100%;
      max-width: 70vw;
      margin: 0 0 1rem 0!important;
    }
  }
 }

 @media (max-width: 575.98px) {
   .content-container {
    &.tariff-content {
      max-width: 100%;
    }
  }
 }
</style>