<template>
  <div :class="wrapperClass">
    <table :class="tableClasses">
      <colgroup>
        <col class="col-name" />
        <col class="col-val" />
      </colgroup>

      <tbody>
        <slot />
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'products' }, // 'products' | 'kbju'
})

const wrapperClass = computed(() => {
  return props.variant === 'kbju' ? 'kbju-table-wrapper' : 'menu-table-wrapper'
})

const tableClasses = computed(() => [
  'menu-table',
  'table-2cols',
  props.variant === 'kbju' ? 'kbju-table' : 'products-list',
])
</script>

<style lang="scss">

/* --- wrappers --- */
.kbju-table-wrapper {
  position: relative;
  padding-top: 20px;
  background: $color-white;
  border-radius: 0 0 0.5rem 0.5rem;
   &:before {
    content: "...";
    display: block;
    text-align: center;
    letter-spacing: 10px;
    font-size: $fs-logo * 1.5;
    line-height: 2rem;
    color: $color-green;
    position: absolute;
    top: -20%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0.5;
  }
}

.menu-table-wrapper {
  position: relative;
  padding-bottom: 20px;
  background: $color-white;
  border-radius: 0.5rem 0.5rem 0 0; 
}
/* --- table styles --- */
.menu-table {
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
  overflow: hidden;
  background: $color-white;
   tr {
    @include border-sides(bottom);

    td,
    th {
      padding: 10px 12px;
      text-align: left;
    }
  }
  &.table-2cols {
    width: 100%;
    table-layout: fixed;
    .col-name {
        width: 70%;
    }
    .col-val {
        width: 30%;
        }
    }
  &.products-list {
    border-radius: 0.5rem;
    padding-bottom: 20px;
    tr {
      &:not(:last-child) {
         transition: all ease 0.3s; 
        cursor: pointer;
         &:hover {
          background: $color-sb;
          color: $color-white;
        }
      }
      &:last-child {
        border: none;
      }
    }
  }
  &.kbju-table {
    padding-top: 20px;
    border-radius: 0.5rem;
    tr {
      &:first-child { border-top: none; }
      &:last-child { border-bottom: none; }
    }
  }
}
</style>
