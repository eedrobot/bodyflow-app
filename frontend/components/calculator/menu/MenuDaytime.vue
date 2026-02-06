<template>
  <div class="menu-daytime">
    <div
      class="menu-item"
      :style="{ boxShadow: `inset 0 52px 1px ${mealShadowsColor[mealKey]}` }"
    >
      <!-- HEADER -->
      <div class="menu-item-head">
        <h2 :style="{ color: mealColors[mealKey] }">
          {{ t(`menu.${mealKey}`) }}
        </h2>
        <img :src="mealImages[mealKey]" alt="" />
      </div>

      <!-- BODY -->
      <div class="menu-item-body">
        <MenuTable variant="products">
          <tr
            v-for="product in visibleProducts"
            :key="product.product_id"
            role="button"
            tabindex="0"
            class = "clickable"
            @click="goToProduct(product)"
          >
            <td>{{ productName(product) }}</td>
            <td>
              <span>{{ smartRound(product.solvedGram) }} {{ t('menu.gram') }}</span>
            </td>
          </tr>
        </MenuTable>

        <MenuTable variant="kbju">
          <tr>
            <td>{{ t('menu.kcal') }}</td>
            <td>{{ nutrients.kcal }}</td>
          </tr>
          <tr>
            <td>{{ t('menu.protein') }}</td>
            <td>{{ nutrients.p }} {{ t('menu.gram') }}</td>
          </tr>
          <tr>
            <td>{{ t('menu.fat') }}</td>
            <td>{{ nutrients.f }} {{ t('menu.gram') }}</td>
          </tr>
          <tr>
            <td>{{ t('menu.carb') }}</td>
            <td>{{ nutrients.c }} {{ t('menu.gram') }}</td>
          </tr>
        </MenuTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MenuTable from '@/components/calculator/menu/MenuTable.vue'

const props = defineProps({
  meal: { type: Object, required: true },
  mealKey: { type: String, required: true },

  mealImages: { type: Object, required: true },
  mealColors: { type: Object, required: true },
  mealShadowsColor: { type: Object, required: true },

  nutrients: { type: Object, required: true },
  smartRound: { type: Function, required: true },
})

const { locale, t } = useI18n()
const router = useRouter()
const localePath = useLocalePath()

const visibleProducts = computed(() =>
  (props.meal?.products || []).filter(p => props.smartRound(p.solvedGram) > 0)
)

const productName = (product) => {
  const lang = locale.value
  return product?.product_name?.[lang]
    || product?.product_name?.ru
    || product?.product_name?.uk
    || product?.product_name?.en
    || ''
}

const goToProduct = (product) => {
  const lang = locale.value

  const slug =
    product?.slug_translations?.[lang]
    || product?.slug_translations?.uk
    || product?.slug_translations?.ru
    || product?.slug_translations?.en
    || product?.slug

  if (!slug) return

  const path = localePath({ name: 'nutrition-slug', params: { slug } })
  router.push(path)
}
</script>

<style lang="scss" scoped>
    .menu-daytime {
        flex: 1 1 30%;
        align-self: stretch;
        display: flex;
        width: 100%;
        border-radius: $b-r;
        box-shadow: $b-sh;
        .menu-item {
            width: 100%;
            height: 100%;  
            display: flex;
            flex-direction: column;
            background: $color-beige-l;
            border-radius: $b-r;
            padding: 1rem 0.5rem;
            .menu-item-head {
                img {
                width: 100px;
                height: auto;
                }
                h2 {
                margin: 0 0 20px 0;
                font-weight: 700;
                }
            }
            .menu-item-body {
                flex: 1 1 auto;         // тело занимает остаток высоты
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                overflow: hidden; 
                border-radius: 0.5rem;
                border: 1px solid $color-mg;
                background: $color-white;
                margin-top: 15px;
                // padding: 0.5rem;
            }
        }
    }
     @media (max-width: 991.98px) {
        .menu-daytime {
            flex: 0 0 100%;
            margin-bottom: 1rem;
            .menu-item {
                .menu-item-head {
                h2 {
                    font-size: $fs-middle;
                }
                img {
                    width: 60px;
                }
                }
            }
        }
    }
     @media (max-width: 575.98px) {
        .menu-daytime {
            flex: 0 0 100%;
            margin-bottom: 1rem;
            .menu-item {
                .menu-item-head {
                    h2 {
                        font-size: $fs-middle;
                    }
                    img {
                        width: 60px;
                    }
                }
            }
        }
    }
</style>