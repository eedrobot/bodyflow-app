<template>
  <div class="privacy-comp">
    <div class="wrapper">
      <h1 class="title">{{ t('privacy.title') }}</h1>

      <div class="privacy-card">
        <div class="privacy-content">
          <p class="privacy-p">{{ t('privacy.intro') }}</p>

          <h2 class="privacy-h2">1. {{ t('privacy.s1_title') }}</h2>

          <h3 p class="privacy-p">1.1. {{ t('privacy.s1_1_title') }}</h3>
          <p class="privacy-p">{{ t('privacy.s1_1_text') }}</p>
          <ul class="privacy-ul">
            <li>{{ t('privacy.s1_1_li1') }}</li>
            <li>{{ t('privacy.s1_1_li2') }}</li>
            <li>{{ t('privacy.s1_1_li3') }}</li>
            <li>{{ t('privacy.s1_1_li4') }}</li>
          </ul>

          <p class="privacy-p">1.2. {{ t('privacy.s1_2_title') }}</p>
          <p class="privacy-p">{{ t('privacy.s1_2_text') }}</p>
          <ul class="privacy-ul">
            <li>{{ t('privacy.s1_2_li1') }}</li>
            <li>{{ t('privacy.s1_2_li2') }}</li>
            <li>{{ t('privacy.s1_2_li3') }}</li>
          </ul>

          <h2 class="privacy-h2">2. {{ t('privacy.s2_title') }}</h2>

          <p class="privacy-p">2.1. {{ t('privacy.s2_1_title') }}</p>
          <ul class="privacy-ul">
            <li>{{ t('privacy.s2_1_li1') }}</li>
            <li>{{ t('privacy.s2_1_li2') }}</li>
            <li>{{ t('privacy.s2_1_li3') }}</li>
            <li>{{ t('privacy.s2_1_li4') }}</li>
          </ul>

          <p class="privacy-p">2.2.</p>
          <p class="privacy-p">{{ t('privacy.s2_2_text') }}</p>

          <h2 class="privacy-h2">3. {{ t('privacy.s3_title') }}</h2>

          <p class="privacy-p">3.1. {{ t('privacy.s3_1_title') }}</p>
          <p class="privacy-p">{{ t('privacy.s3_1_text') }}</p>

          <p class="privacy-p">3.2. {{ t('privacy.s3_2_title') }}</p>
          <p class="privacy-p">{{ t('privacy.s3_2_text') }}</p>

          <h2 class="privacy-h2">4. {{ t('privacy.s4_title') }}</h2>

          <p class="privacy-p">4.1. {{ t('privacy.s4_1_text') }}</p>

          <p class="privacy-p">4.2. {{ t('privacy.s4_2_title') }}</p>
          <ul class="privacy-ul">
            <li>{{ t('privacy.s4_2_li1') }}</li>
            <li>{{ t('privacy.s4_2_li2') }}</li>
          </ul>

          <h2 class="privacy-h2">5. {{ t('privacy.s5_title') }}</h2>

          <p class="privacy-p">5.1. {{ t('privacy.s5_1_title') }}</p>
          <p class="privacy-p">{{ t('privacy.s5_1_text') }}</p>

          <p class="privacy-p">5.2. {{ t('privacy.s5_2_title') }}</p>
          <p class="privacy-p">{{ t('privacy.s5_2_text') }}</p>

          <h2 class="privacy-h2">6. {{ t('privacy.s6_title') }}</h2>

          <p class="privacy-p">6.1. {{ t('privacy.s6_1_title') }}</p>
          <p class="privacy-p">{{ t('privacy.s6_1_text') }}</p>

          <p class="privacy-p">6.2. {{ t('privacy.s6_2_title') }}</p>
          <p class="privacy-p">
            {{ t('privacy.s6_2_text') }}
            <a class="privacy-link" href="mailto:support@bodyflow.com.ua">
                support@bodyflow.com.ua
            </a>     
          </p>

          <h2 class="privacy-h2">7. {{ t('privacy.s7_title') }}</h2>

          <p class="privacy-p">7.1. {{ t('privacy.s7_1_text') }}</p>
          <p class="privacy-p">{{ t('privacy.s7_2_text') }}</p>

          <h2 class="privacy-h2">8. {{ t('privacy.s8_title') }}</h2>

          <p class="privacy-p">{{ t('privacy.s8_text') }}</p>
          <p class="privacy-p">
            <strong>{{ t('privacy.s8_email_label') }}</strong>
            <a class="privacy-link" href="mailto:support@bodyflow.com.ua">
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
</script>

<style lang="scss" scoped>
    .wrapper {
        grid-template-areas: 
        "title"
        "content";
        .privacy-card {
            grid-area: content;
            .privacy-content {
                .privacy-p, 
                .privacy-ul {
                    line-height: 1.5rem;
                }
                .privacy-ul {
                    li {
                        list-style-type: disc;
                        margin-left: 2rem;
                    }
                }
                h2, h3 {
                    padding: 1rem;
                }
            }
        }
    }
</style>
