<template>
  <div class="agreement-block">
    <label class="agreement-label">
      <input
        :checked="props.modelValue"
        type="checkbox"
        class="agreement-checkbox"
        @change="onChange"
      />

      <span class="agreement-text">
        {{ t('checkout.agreement') }}

        <NuxtLink class="agreement-link" :to="localePath({ name: 'offer' })">
          {{ t('checkout.offer') }}
        </NuxtLink>,

        <NuxtLink class="agreement-link" :to="localePath({ name: 'terms' })">
          {{ t('checkout.terms') }}
        </NuxtLink>,

        <NuxtLink class="agreement-link" :to="localePath({ name: 'privacy-policy' })">
          {{ t('checkout.privacy') }}
        </NuxtLink>.
      </span>
    </label>

    <p v-if="props.showError" class="agreement-error">
      {{ props.errorText || t('checkout.error_required') }}
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  showError: {
    type: Boolean,
    default: false
  },
  errorText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()
const localePath = useLocalePath()

function onChange(event) {
  const target = event.target
  emit('update:modelValue', target.checked)
}
</script>

<style scoped lang="scss">
.agreement-block {
  display: grid;
  gap: 8px;

  .agreement-label {
    @include flex(row, flex-start, flex-start);
    gap: 12px;
    cursor: pointer;

    .agreement-checkbox {
      margin-top: 3px;
      flex: 0 0 auto;
      width: 16px;
      height: 16px;
    }

    .agreement-text {
      font-size: $fs-small;
      line-height: 1.3rem;
      color: $color-dg;;

      .agreement-link {
        color: inherit;
        text-decoration: underline;
        text-underline-offset: 2px;
        transition: opacity 0.2s ease;

        &:hover {
          opacity: 0.75;
        }
      }
    }
  }

  .agreement-error {
    text-align:center;
    font-size: $fs-small;
    line-height: 1.3rem;
    color: $color-red;
    border-radius: $b-r;
    border: 1px solid $color-red;
    padding: 0.5rem 2rem;
  }
}
</style>