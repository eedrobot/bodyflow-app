<template>
  <div
    ref="root"
    class="drop"
    :class="[containerClass, { 'is-open': show }]"
    @click.stop
  >
    <div
      class="drop-toggle"
      :class="[toggleClass, { 'is-active': show }]"
      @click.stop="toggle"
    >
      <slot name="drop-toggle"></slot>
    </div>

    <transition name="slide">
      <div
        class="drop-content"
        :class="[contentClass, { 'is-open': show }]"
        v-show="show"
        @click.stop
      >
        <slot name="drop-content"></slot>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  containerClass: { type: [String, Array, Object], default: '' },
  toggleClass: { type: [String, Array, Object], default: '' },
  contentClass: { type: [String, Array, Object], default: '' },

  // v-model
  open: { type: Boolean, default: false }
})

const emit = defineEmits(['update:open'])

const show = ref(props.open)
const root = ref(null)

// sync: parent -> local
watch(
  () => props.open,
  (val) => {
    show.value = val
  }
)

// sync: local -> parent
watch(show, (val) => {
  emit('update:open', val)
})

const toggle = () => {
  show.value = !show.value
}

const handleClickOutside = (e) => {
  if (!show.value) return
  if (root.value && root.value.contains(e.target)) return
  show.value = false
}

// лучше pointerdown (быстрее и надежнее на мобилках)
onMounted(() => document.addEventListener('pointerdown', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('pointerdown', handleClickOutside))
</script>

<style lang="scss" scoped>
.drop {
  position: relative;

  .drop-toggle {
    cursor: pointer;
  }

  .drop-content {
    position: absolute;
    z-index: 100;
    box-shadow: $b-sh;
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 500px;
  opacity: 1;
}
</style>
