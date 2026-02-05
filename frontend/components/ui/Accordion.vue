<template>
  <div class="accordion">
    <div
      v-for="item in props.items"
      :key="item.category_id"
      class="accordion-content"
    >
      <!-- header -->
      <div class="accordion-header" @click="toggle(item.category_id)">
        <div class="accordion-header-info">
           <slot name="header" :item="item">
              <h2>Без названия</h2>
          </slot>
        </div>

        <img
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAdklEQVR4nO2SOw6AIBAF5xJL5P430cpfI4XH0ZhQGEKQRcqdhITi/YoFwzBSRmADHHocsANTSbQAFxCUJS56Hu9cEgpwROEJ+Irw1DNoDb5nuKZEWsNrSuRveKlEeoXnLiQk/5ZzziKv1d2Wpzhgja/bcsPgkxv9gTARDNSfPAAAAABJRU5ErkJggg=="
          alt="expand-arrow"
          class="arrow-down"
          :class="{ rotated: activeIndex === item.category_id }"
        />
      </div>

      <!-- body -->
      <Transition name="slide">
        <div
          v-if="activeIndex === item.category_id"
          class="accordion-body active"
        >
          <slot name="body" :item="item">
            <p>Нет данных</p>
          </slot>
        </div>
      </Transition>

    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  items: { type: Array, required: true },
})

const emit = defineEmits(['toggle'])

const activeIndex = ref(null)

const toggle = (id) => {
  const next = activeIndex.value === id ? null : id
  activeIndex.value = next
  if (next !== null) emit('toggle', id)
}

</script>


<style scoped lang="scss">
.accordion {
		background: $color-beige-l;
		border-radius: $b-r;
		overflow: hidden;
		margin: 30px 0;
		@include border-sides(top bottom);
		
		.accordion-content {
			&:not(:first-child) .accordion-header {
			@include border-sides(top);
			}
		
			.accordion-header {
        @include flex(row, center, space-between);
        padding: 12px 15px;
        cursor: pointer;
        @include border-sides(left right);
        background: $color-beige-l;
        transition: background 0.3s;
      
        &:hover {
          background: $color-sb;
          color: $color-white;
        }
		
        .accordion-header-info {
          @include flex(row, center, flex-start);
        }

        .arrow-down {
          opacity: 0.4;
          width: 15px;
          transition: transform 0.3s ease;
          &.rotated {
            transform: rotate(180deg);
          }
        }
		  }
		
		.accordion-body {
          max-height: 0;
          overflow: hidden;
          &.active {
            max-height: 100%;
          }
            a {
                color: $color-black;
            }
        }
		}
	}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}
</style>
