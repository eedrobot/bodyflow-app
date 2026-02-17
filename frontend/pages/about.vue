<template>
    <div class="about-comp" ref="bgRef">
        <div class="wrapper">
            <h1 class="title">
                {{ t('about.title') }}
            </h1>
            <div class="description">
                {{ t('about.intro') }}
            </div>

            <div class = "content-container info-card">
                <div class = "info-content">
                    <!-- Section 1 -->
                    <h2 class="info-h2">
                        {{ t('about.s1_title') }}
                    </h2>
                    <p class="info-p">
                        {{ t('about.s1_text') }}
                    </p>

                    <!-- Section 2 -->
                    <h2 class="info-h2">
                        {{ t('about.s2_title') }}
                    </h2>

                    <ul class="info-ul">
                        <li>
                        <strong>{{ t('about.s2_li1_b') }}</strong>
                        — {{ t('about.s2_li1') }}
                        </li>
                        <li>
                        <strong>{{ t('about.s2_li2_b') }}</strong>
                        — {{ t('about.s2_li2') }}
                        </li>
                        <li>
                        <strong>{{ t('about.s2_li3_b') }}</strong>
                        — {{ t('about.s2_li3') }}
                        </li>
                    </ul>

                    <!-- Section 3 -->
                    <h2 class="info-h2">
                        {{ t('about.s3_title') }}
                    </h2>

                    <ul class="info-ul">
                        <li>{{ t('about.s3_li1') }}</li>
                        <li>{{ t('about.s3_li2') }}</li>
                        <li>{{ t('about.s3_li3') }}</li>
                        <li>{{ t('about.s3_li4') }}</li>
                    </ul>

                    <!-- Section 4 -->
                    <h2 class="info-h2">
                        {{ t('about.s4_title') }}
                    </h2>
                    <p class="info-p">
                        {{ t('about.s4_text') }}
                    </p>

                    <!-- Section 5 -->
                    <h2 class="info-h2">
                        {{ t('about.s5_title') }}
                    </h2>
                    <p class="info-p">
                        {{ t('about.s5_text') }}
                    </p>

                    <!-- Section 6 -->
                    <h2 class="info-h2">
                        {{ t('about.s6_title') }}
                    </h2>
                    <p class="info-p">
                        {{ t('about.s6_text') }}
                    </p>

                    <p class="info-p">
                        <strong>{{ t('about.email_label') }}</strong>
                        <a
                        class="info-link"
                        href="mailto:support@bodyflow.com.ua"
                        >
                        support@bodyflow.com.ua
                        </a>
                    </p>

                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
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
  titleKey: 'about.seo_title',
  descriptionKey: 'about.seo_description',
  keywordsKey: 'about.seo_keywords',
  image: '/og/about-og.png'
})
</script>
<style lang="scss" scoped>
    .about-comp {
        position: relative;
        z-index: 1;
        background-image: 
        url('@/public/img/green-bg-1.png'),
        url('@/public/img/about_bg.png'); 
        background-repeat: no-repeat no-repeat;
        background-position: center 100vh, top right;
        background-size: 100% auto, 65% auto;
        .wrapper {
            grid-template-areas: 
            "title ."
            "description ."
            "content .";
            grid-template-columns: 1fr 1fr;
            justify-items: start;
            padding: 1rem 2rem 4rem 4rem;
            gap: 1rem;
            .title {
                grid-area: title;
                justify-self: start;
                text-align: left;
            }
            .description {
                grid-area: description;
                text-align: left;
            }
            .content-container {
                grid-area: content;
            }

        }
     }

     @media (max-width: 991.98px) {
        .about-comp {
            background-size: 100% auto, 70% auto;
            background-position: top 100vh center, top right -20%; 
            .wrapper {
                grid-template-areas:
                    "title ."
                    "description ."
                    "content content";
                    .info-h2 {
                        font-weight: 700;
                    }
            }
    }
}

@media (max-width: 575.98px) {
  .about-comp {
    background-size: 100% auto, 50% auto;
    background-position: bottom -3rem center, top 2vh right;
    .wrapper {
      grid-template-areas:
        "title ."
        "description description"
        "content content";
      padding: 0 1rem 2rem 1rem;
      .title {
        margin-top: 3rem;
      }
      .description {
        width: 100%;
        margin-left: 0;
      }
      .content-container {
        .info-content {
          max-width: 100%;
        }
      }
    }
  }
}
</style>
