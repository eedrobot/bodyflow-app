<template>
  <!-- BLUR OVERLAY -->
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="mobile-menu-overlay"
      @click="closeMenu"
    />
  </Teleport>

  <UiDropdown
    v-model:open="isOpen"
    containerClass="mobile-nav-header"
    toggleClass="mobile-nav-toggle"
    contentClass="mobile-menu-wrapper"
  >
    <template #drop-toggle>
      <div class="toggle-item" />
    </template>

    <template #drop-content>
      <ul class="mobile-menu">
        <li v-for="page in menuPages" :key="page.key">
          <img :src = "page.icon" :alt="$t(page.titleKey)">
          <NuxtLink
            :to="localePath(page.routeName)"
            @click="closeMenu"
          >
            {{ $t(page.titleKey) }}
          </NuxtLink>
        </li>
      </ul>
    </template>
  </UiDropdown>
</template>


<script setup>
import { ref, watch } from 'vue'
import { menuPages } from '@/utils/menuPages.js'

const localePath = useLocalePath()

const isOpen = ref(false)

const closeMenu = () => {
  isOpen.value = false
}

// 🔒 блокируем скролл body
watch(isOpen, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})
</script>


<style lang="scss">
.mobile-nav-header {
  display: none;
  margin-right: 10px;

  .mobile-nav-toggle {
    .toggle-item {
      position: relative;
      transition: background 0.2s ease;

      &,
      &::before,
      &::after {
        width: 25px;
        height: 2px;
        border-radius: 2px;
        background: $color-navy;
        transition: transform 0.25s ease, opacity 0.2s ease;
      }

      &::before,
      &::after {
        content: '';
        display: block;
        position: absolute;
      }

      &::before {
        top: -6px;
      }

      &::after {
        top: 6px;
      }
    }

    &.is-active {
      .toggle-item {
        background: transparent;

        &::before {
          transform: translateY(6px) rotate(45deg);
        }

        &::after {
          transform: translateY(-6px) rotate(-45deg);
        }
      }
    }
  }

  .mobile-menu-wrapper {
    position: fixed !important;
    left: 0;
    top: 65px;
    height: 100vh;
    color: $color-navy;
    background: $color-beige-l;
    border-radius: 0 2rem 2rem 2rem;
    padding: 1rem 0;

    .mobile-menu {
      margin-bottom: 10px;
      padding: 0 10px;

      li {
        @include flex(row, center, start);
        width: 100%;
        padding: 10px 15px;
        background: $color-white;
        border-radius: $b-r;
        padding: 10px;
        box-shadow: $b-sh;
        margin: 10px 0;
        height: 47px;
        img {
          width: 20px;
          margin-right: 10px;
        }

        a {
          font-size: $fs-middle;
        }
      }
    }
  }
}

.mobile-menu-overlay {
  position: fixed;
  left: 0;
  right: 0;
  top: 65px;
  height: calc(100vh - 65px);
  z-index: 90;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(8px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0 }
  to { opacity: 1 }
}


@media (max-width: 991.98px) {
  .mobile-nav-header {
    display: block;
    margin-right: 15px;

    .mobile-menu-wrapper {
      width: 50%;
    }
  }
}

@media (max-width: 575.98px) {
  .mobile-nav-header {
      .mobile-menu-wrapper {
      width: 70%;
    }
  }
}
</style>
