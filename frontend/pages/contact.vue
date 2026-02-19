<template>
    <div class="contact-comp" ref="bgRef">
        <div class="wrapper">
             <h1 class="title">{{ t('contact.title') }}</h1>
            <div class="description">{{ t('contact.description') }}</div>
            <div class = "contact-container">
              <ContactInfo />
              <ContactForm />
            </div>
        </div>
    </div>
</template>

<script setup>
import ContactInfo from '@/components/contact/ContactInfo.vue'
import ContactForm from '@/components/contact/ContactForm.vue'

import { ref } from 'vue'
import { useParallaxBackground } from '@/composables/useParallaxBackground'

const { t } = useI18n()

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
  titleKey: 'seo.contact.title',
  descriptionKey: 'seo.contact.description',
  keywordsKey: 'seo.contact.keywords',
  image: '/seo/contact-og.png'
});


</script>

<style scoped lang="scss">
.contact-comp {
    position: relative;
    z-index: 1;
    // background-image: url('@/public/img/37575428_8549525.svg'), url('@/public/img/line-bg1.png');
    background-image: 
    url('@/public/img/green-bg-1.png'),
    url('@/public/img/contact-page.png'); 
    // background-repeat: no-repeat, no-repeat;
    // background-position: top right;
    // background-size: 60% auto, 35% auto;
    background-repeat: no-repeat no-repeat;
    background-position: center 100vh, top right;
    background-size: 100% auto, 65% auto;

    .wrapper {
        grid-auto-rows: auto;
        grid-template-areas:
        "title ."
        "description ."
        "contact contact";
        grid-template-columns: 1fr 1fr;
        justify-items: start;
        padding: 1rem 4rem 4rem 4rem;
        gap: 1rem;
        .contact-container {
          width: 100%;
          grid-area: contact;
          display: grid;
          grid-template-areas:
            "info info . ."
            ". form form .";
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 1rem;
          justify-content: start;
        }
    }
}

@media (max-width: 991.98px) {
  .contact-comp {
    background-size: 100% auto, 70% auto;
    background-position: top 100vh center, top right; 
    .wrapper {
      .contact-container {
        grid-template-areas:
          "info"
          "form";
        grid-template-columns: 1fr;
        .contact-info {
          max-width: 80%;
        }
      }
    }
  }
}

@media (max-width: 575.98px) {
  .contact-comp {
    background-size: 100% auto, 55% auto;
    background-position: bottom -3rem center, top 2vh right;
    .wrapper {
      grid-template-areas:
        "title ."
        "description description"
        "contact contact";
      padding: 0 1rem 2rem 1rem;
    }
  }
}
</style>
