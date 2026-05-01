<template>
  <div class="pagination" v-if="totalPages > 1">
    <button @click="prev" :disabled="modelValue === 1">«</button>

    <button
      v-for="p in pages"
      :key="p"
      :class="{ active: p === modelValue, dots: p === '...' }"
      :disabled="p === '...'"
      @click="select(p)"
    >
      {{ p }}
    </button>

    <button @click="next" :disabled="modelValue === totalPages">»</button>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Number, required: true }, // текущая страница
  totalPages: { type: Number, required: true }
})

const emit = defineEmits(['update:modelValue'])

const pages = computed(() => {
  const current = props.modelValue
  const total = props.totalPages
  const result = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) result.push(i)
    return result
  }

  result.push(1)

  if (current > 3) result.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    result.push(i)
  }

  if (current < total - 2) result.push('...')

  result.push(total)

  return result
})

function select(p) {
  if (p === '...' || p === props.modelValue) return
  emit('update:modelValue', p)
}

function prev() {
  if (props.modelValue > 1) {
    emit('update:modelValue', props.modelValue - 1)
  }
}

function next() {
  if (props.modelValue < props.totalPages) {
    emit('update:modelValue', props.modelValue + 1)
  }
}
</script>

<style scoped lang="scss">
.pagination { 
        display: flex; 
        gap: .5rem; 
        margin: 2rem auto 0 auto; 
        button { 
          @include flex(row, center, center); 
          min-width: 30px; 
          width: 30px; 
          height: 25px; 
          padding: .4rem .8rem; 
          border-radius: 50%; 
          border: none; 
          background: transparent; 
          cursor: pointer; 
          font-weight: 600; 
          transition: 0.2s; 
          color: $color-navy;
          &:hover:not(.active):not(.dots) { 
            background: $color-navy; 
            color: $color-white; 
          } 
            &.active { 
              background: $color-sb; 
              color: white; 
            } 
            &.dots { 
              pointer-events: none; 
              background: transparent; 
              cursor: default; 
            } 
          } 
          button:disabled { 
            opacity: 0.4; 
            pointer-events: none; 
          } 
        } 
</style>
 