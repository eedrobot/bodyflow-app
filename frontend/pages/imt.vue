<template>
  <div class="imt-comp" ref="bgRef">
    <div class="wrapper">
      <h1 class="title">{{ t('imt_page.h1') }}</h1>

      <div class="description">
        <p class="info-p">{{ t('imt_page.intro_p1') }}</p>
        <p class="info-p">{{ t('imt_page.intro_p2') }}</p>
      </div>

      <div class="content-container info-card">
        <!-- WHAT -->
        <article class="info-content">
          <h2>{{ t('imt_page.sections.what.title') }}</h2>
          <p class="info-p">{{ t('imt_page.sections.what.p1') }}</p>

          <ul class="info-ul" v-if="whatList.length">
            <li v-for="(item, i) in whatList" :key="`what-${i}`">{{ item }}</li>
          </ul>

          <p class="note">{{ t('imt_page.sections.what.note') }}</p>
        </article>

        <!-- FORMULA -->
        <article class="info-content">
          <h2>{{ t('imt_page.sections.formula.title') }}</h2>
          <p class="info-p">{{ t('imt_page.sections.formula.p1') }}</p>
          <p class="info-p formula">{{ t('imt_page.sections.formula.p2') }}</p>
          <p class="info-p">{{ t('imt_page.sections.formula.p3') }}</p>
          <p class="info-p">{{ t('imt_page.sections.formula.p4') }}</p>
        </article>

        <!-- TABLE -->
        <article class="info-content">
          <h2>{{ t('imt_page.sections.table.title') }}</h2>
          <p class="info-p">{{ t('imt_page.sections.table.p1') }}</p>

          <ul class="info-ul" v-if="tableList.length">
            <li v-for="(item, i) in tableList" :key="`table-${i}`">{{ item }}</li>
          </ul>

          <p class="note">{{ t('imt_page.sections.table.note') }}</p>
        </article>

        <!-- RESULT -->
        <article class="info-content">
          <h2>{{ t('imt_page.sections.result.title') }}</h2>
          <p class="info-p">{{ t('imt_page.sections.result.p1') }}</p>
          <p class="info-p">{{ t('imt_page.sections.result.p2') }}</p>

          <ul class="info-ul" v-if="resultList.length">
            <li v-for="(item, i) in resultList" :key="`result-${i}`">{{ item }}</li>
          </ul>

          <p class="note">{{ t('imt_page.sections.result.note') }}</p>
        </article>

        <!-- LIMITS -->
        <article class="info-content">
          <h2>{{ t('imt_page.sections.limits.title') }}</h2>
          <p class="info-p">{{ t('imt_page.sections.limits.p1') }}</p>

          <ul class="info-ul" v-if="limitsList.length">
            <li v-for="(item, i) in limitsList" :key="`limits-${i}`">{{ item }}</li>
          </ul>

          <p class="note">{{ t('imt_page.sections.limits.note') }}</p>
        </article>

        <!-- NEXT -->
        <article class="info-content">
          <h2>{{ t('imt_page.sections.next.title') }}</h2>
          <p class="info-p">{{ t('imt_page.sections.next.p1') }}</p>
          <p class="info-p">{{ t('imt_page.sections.next.p2') }}</p>

          <ul class="info-ul" v-if="nextList.length">
            <li v-for="(item, i) in nextList" :key="`next-${i}`">{{ item }}</li>
          </ul>

          <p class="info-p">{{ t('imt_page.sections.next.p3') }}</p>

          <div class="note soft">
            <p class="info-p note-p">{{ t('imt_page.sections.next.p4') }}</p>
            <ul class="info-ul compact">
              <li>{{ t('imt_page.sections.next.p5') }}</li>
              <li>{{ t('imt_page.sections.next.p6') }}</li>
              <li>{{ t('imt_page.sections.next.p7') }}</li>
            </ul>
            <p class="info-p note-p">{{ t('imt_page.sections.next.p8') }}</p>
          </div>
        </article>
      </div>

      <!-- FAQ -->
    <div class="content-container faq" v-if="faqItems.length">
        <h2 class = "faq-title">{{ t('imt_page.faq.title') }}</h2>

        <Accordion :items="faqItems">
            <template #header="{ item }">
            <h2>{{ item.q }}</h2>
            </template>

            <template #body="{ item }">
                <p class="info-p">{{ item.a }}</p>
            </template>
        </Accordion>
    </div>


      <!-- CTA -->
      <div class="btn bright">
        <NuxtLink :to="localePath('index')">
          {{ t('imt_page.cta') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>


<script setup>
import { computed } from 'vue'
import Accordion from '@/components/ui/Accordion.vue' // путь поправь под себя

const { t, te } = useI18n()
const localePath = useLocalePath()

function listFromIndexedKeys(baseKey, max = 20) {
  const out = []
  for (let i = 1; i <= max; i++) {
    const key = `${baseKey}_${i}`
    if (!te(key)) break
    out.push(t(key))
  }
  return out
}

const whatList = computed(() => listFromIndexedKeys('imt_page.sections.what.list'))
const tableList = computed(() => listFromIndexedKeys('imt_page.sections.table.list'))
const resultList = computed(() => listFromIndexedKeys('imt_page.sections.result.list'))
const limitsList = computed(() => listFromIndexedKeys('imt_page.sections.limits.list'))
const nextList = computed(() => listFromIndexedKeys('imt_page.sections.next.list'))

// FAQ -> формат под Accordion (category_id + q + a)
const faqItems = computed(() => {
  const out = []
  for (let i = 1; i <= 30; i++) {
    const qKey = `imt_page.faq.item_${i}_q`
    const aKey = `imt_page.faq.item_${i}_a`
    if (!te(qKey) || !te(aKey)) break

    out.push({
      category_id: i,
      q: t(qKey),
      a: t(aKey)
    })
  }
  return out
})

/* ---------- ФОН + ПАРАЛЛАКС ----------- */
const bgRef = ref(null)

useParallaxBackground({
  bgRef,
  desktopMin: 1199.98,
  getBgPosition: ({ y }) => {
    const base1 = window.innerHeight  

    return `
    center ${(base1 - y * 0.35)}px,
    right ${(y + 10) * 0.5}px
  `
  }
})

useSeo({
  titleKey: 'imt_page.meta.title',
  descriptionKey: 'imt_page.meta.description',
})
</script>

<style scoped lang="scss">
.imt-comp {
  position: relative;
  z-index: 1;
  background-image: url('@/public/img/green-bg-1.png'), url('@/public/img/imt-page.png');
  background-repeat: no-repeat no-repeat;
  background-position: center 100vh, top right;
  background-size: 100% auto, 65% auto;

  .wrapper {
    grid-template-areas:
      "title ."
      "description ."
      "content content"
      "faq faq"
      "button button";
    grid-template-columns: 1fr 1fr;
    justify-items: start;
    padding: 1rem 2rem 4rem 4rem;
    gap: 1rem;

    .content-container {
      grid-area: content;
      width: 70vw;

      &.faq {
        grid-area: faq;
        .faq-title {
            font-weight: 700;
            text-align: center;
        }
      }
    }

    .btn {
      grid-area: button;
      justify-self: center;
      width: 30vw;
      margin-top: 2rem;
    }
  }
}

 @media (max-width: 991.98px) {
    .imt-comp {
        background-size: 100% auto, 70% auto;
        background-position: top 100vh center, top right -20%; 
        .wrapper {
            grid-template-areas:
                "title ."
                "description ."
                "content content"
                "faq faq"
                "button button";
            grid-template-columns: 55% 45%;
            h2 {
                font-weight: 700;
            }
            .content-container {
                width: 100%;
            }
            .btn {
                width: 50%;
            }
        }
    }
}

@media (max-width: 575.98px) {
  .imt-comp {
    background-size: 100% auto, 70% auto;
    background-position: bottom -3rem center, top 2vh right;
    .wrapper {
      grid-template-areas:
        "title ."
        "description description"
        "content content"
        "faq faq"
        "button button";
      padding: 0 1rem 2rem 1rem;
      .btn {
        width: 100%;
      }
    }
  }
}
</style>
