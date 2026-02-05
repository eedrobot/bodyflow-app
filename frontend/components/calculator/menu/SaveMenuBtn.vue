<template>
  <div
    data-save-menu-root
    class="save-menu"
    @mouseenter="showPopover"
    @mouseleave="hidePopoverSoon"
  >
    <!-- КНОПКА -->
    <button
      class="save-menu__btn"
      type="button"
      :aria-describedby="isGuest ? popoverId : undefined"
      :aria-expanded="isGuest ? open : undefined"
      @click.stop="handleClick"
    >
      <span class="save-menu__icon" aria-hidden="true">
        <!-- floppy icon -->
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            fill="currentColor"
            d="M5 3h11l3 3v15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2 2v6h10V5H7zm0 10v6h10v-6H7zm2-9h6v3H9V6z"
          />
        </svg>
      </span>

      <span class="save-menu__label">{{ t('menu.save_menu') }}</span>
    </button>

    <!-- POPOVER -->
    <transition name="fadeUp">
      <div
        v-if="isGuest && open"
        :id="popoverId"
        class="save-menu__popover"
        role="dialog"
        aria-live="polite"
        @mouseenter="showPopover"
        @mouseleave="hidePopoverSoon"
        @click.stop
      >
        <div class="save-menu__popover-top">
          <div class="save-menu__badge" aria-hidden="true">!</div>
          <div class="save-menu__popover-title">
            {{ t('menu.save_menu_title')}}
          </div>
        </div>

        <div class="save-menu__popover-text">
          {{ t('menu.save_menu_descr')}}
        </div>

        <div class="save-menu__actions">
          <button class="btn save-menu__cta save-menu__cta--primary" type="button" @click="$emit('register')">
            {{ t('auth.register')}}
          </button>
          <button class="btn save-menu__cta" type="button" @click="$emit('login')">
            {{ t('auth.login')}}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'

const props = defineProps({
  // если пользователь не залогинен — false
  isAuth: { type: Boolean, default: false }
})

const emit = defineEmits([
  // для авторизованного
  'save',
  // для гостя: клики по CTA
  'register',
  'login',
])

const { t } = useI18n()

const open = ref(false)
const popoverId = `save-menu-popover-${Math.random().toString(16).slice(2)}`
let closeTimer = null

const isGuest = computed(() => !props.isAuth)

function clearCloseTimer() {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

function showPopover() {
  if (!isGuest.value) return
  clearCloseTimer()
  open.value = true
}

function hidePopoverSoon() {
  if (!isGuest.value) return
  clearCloseTimer()
  closeTimer = setTimeout(() => (open.value = false), 180)
}

function handleClick() {
  if (isGuest.value) {
    // кликом тоже показываем
    open.value = true
    return
  }
  emit('save')
}

function onKeydown(e) {
  if (e.key === 'Escape') open.value = false
}

function onDocClick(e) {
  // закрыть, если клик вне компонента
  const root = e.target?.closest?.('[data-save-menu-root]')
  if (!root) open.value = false
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', onKeydown)
  document.addEventListener('click', onDocClick)
}

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', onKeydown)
    document.removeEventListener('click', onDocClick)
  }
  clearCloseTimer()
})
</script>

<style lang="scss" scoped>
.save-menu {
    @include flex(column, center, center);
    position: relative;
    gap: 10px;
    width: 100%;
    margin-top: 1rem;
  .save-menu__btn {
    @include flex(row, center, center);
    width: 37vw;
    border: 0;
    border-radius: $b-r;
    cursor: pointer;
    gap: 14px;
    padding: 0.7rem;

    /* визуально disabled */
    opacity: 0.3;
    filter: saturate(0);
    user-select: none;

    color: $color-white;
    background: $color-orange-gr;
    box-shadow: $b-sh;
    transition: transform .12s ease, opacity .12s ease, box-shadow .12s ease;
    &:global(.save-menu--auth) .save-menu__btn {
        opacity: 1;
        filter: none;
    }
    .save-menu__icon {
        display: inline-flex;
        opacity: 0.95;
    }
    .save-menu__label {
        font-weight: 700;
        font-size: $fs-one;
    }
    .save-menu__hint {
        font-size: $fs-one;
        opacity: 0.7;
        color: v-bind(text);
        text-align: center;
    }
  }
  .save-menu__popover {
    position: absolute;
    left: 50%;
    bottom: -12px;
    transform: translate(-50%, 100%);
    width: 40vw;
    background: $color-beige-l;
    border-radius: $b-r;
    padding: 18px 18px 16px;
    box-shadow: $b-sh;
    &:before {
        content: "";
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 18px;
        height: 18px;
        background: $color-beige-l;
        @include border-sides(left, $color-white);
        @include border-sides(top, $color-white);
        transform: translateX(-50%) rotate(45deg);
    }
    .save-menu__popover-top {
        @include flex(row, center, start);
        gap: 12px;
    }
    .save-menu__badge {
        @include flex(row, center, center);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-weight: 700;
        color: $color-white;
        background: $color-orange-gr;
    }
    .save-menu__popover-title {
        width: 80%;
        font-weight: 700;
        font-size: $fs-one;
        text-align: left;
        line-height: 1.35;
    }

    .save-menu__popover-text {
        margin-top: 8px;
        margin-left: 50px;
        font-size: $fs-small;
        opacity: 0.78;
        line-height: 1.35;
        text-align: left;
    }
    .save-menu__actions {
        @include flex (row, center, center);
        margin-top: 1rem;
        gap: 12px;
        flex-wrap: wrap;
        .save-menu__cta {
            border-radius: $b-r;
            background: $color-mg;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2 ease-in-out;
            &:hover {
                background: $color-sb;
                color: $color-white;
            }
            &.save-menu__cta--primary{
                border: 0;
                color: $color-white;
                background: $color-orange-gr;
                box-shadow: $b-sh;
                transition: all 0.2 ease-in-out;
                &:hover {
                    background: $color-sb;
                }
            }
        }
    }
  }
}

/* Анимация */
.fadeUp-enter-active, .fadeUp-leave-active {
  transition: opacity .14s ease, transform .14s ease;
}
.fadeUp-enter-from, .fadeUp-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(100% + 10px));
}
.fadeUp-enter-to, .fadeUp-leave-from {
  opacity: 1;
  transform: translate(-50%, 100%);
}

/* Мобилка: поповер снизу — ок, но увеличим отступ */
@media (max-width: 575.98px) {
    .save-menu {
        .save-menu__btn {
            width: 100%;
        }
        .save-menu__popover {
            width: 100%;
            .save-menu__actions {
                .save-menu__cta {
                    width: 100%;
                }
            }
        }
    }

}
</style>