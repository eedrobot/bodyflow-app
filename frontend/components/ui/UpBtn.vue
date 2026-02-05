<template>
  <transition name="fade">
    <div class="upBtn" v-if="show" @click="moveUp">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
        <!-- Filled circle -->
        <circle cx="32" cy="32" r="32" fill="#4e7443"/>

        <!-- Upper arrow (smaller) -->
        <path
          d="M24 31 L32 23 L40 31"
          fill="none"
          stroke="#ffffff"
          stroke-width="3.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Lower arrow (smaller) -->
        <path
          d="M24 39 L32 31 L40 39"
          fill="none"
          stroke="#ffffff"
          stroke-width="3.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>



      <!-- <svg class="double-arrow" width="24" height="24" viewBox="0 0 24 24">
        <path d="M4 16 L12 8 L20 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4 12 L12 4 L20 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg> -->
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const show = ref(false)

const onScroll = () => {
  show.value = window.scrollY > window.innerHeight
}

const moveUp = () => {
  const header = document.querySelector('header')
  if (header) {
    header.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped lang="scss">
.upBtn {
  @include flex(row, center, center);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: $color-green;
  box-shadow: $b-sh;
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 9999;
  cursor: pointer;
  transition: ease-in-out 0.3s;

  .double-arrow {
    color: $color-white;
    transition: ease-in-out 0.3s;
  }

  &:hover {
    background: $color-orange;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  }
}

/* fade animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity .3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
