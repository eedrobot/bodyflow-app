<template>
  <div class="modal-overlay" @click="emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <div class="modal-title">
          <slot name="modal-title"></slot>
        </div>
      </div>

      <div class="modal-body">
        <slot name="modal-body"></slot>
      </div>

      <div class="modal-footer">
        <slot name="modal-footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['close'])

onMounted(() => {
  if (process.client) {
    document.body.classList.add('no-scroll')
  }
})

onUnmounted(() => {
  if (process.client) {
    document.body.classList.remove('no-scroll')
  }
})
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

.modal {
  width: 50%;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: $color-main;
  padding: 2rem;
  border-radius: $b-r;
  box-shadow: $b-sh;
  z-index: 10000;

  .modal-close {
    @include flex(row, center, flex-end);
    cursor: pointer;
  }

  .modal-header {
    @include flex(row, center, center);
    padding: 0.5rem 0;
    text-align: center;

    .modal-title {
      font-size: $fs-middle;
      font-weight: bold;
    }
  }

  .modal-body {
    background: $color-white;
    box-shadow: $b-sh;
    border-radius: $b-r;
    padding: 0.5rem 2rem;
    margin-bottom: 1rem;
  }

  .modal-footer {
    @include flex(row, center, center);
    padding: 0.5rem 0;
  }
}

@media (max-width: 991.98px) {
  .modal {
    width: 70%;
  }
}

@media (max-width: 575.98px) {
  .modal {
    width: 100%;
    padding: 1rem;
  }
}
</style>