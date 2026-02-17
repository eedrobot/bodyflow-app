<template>
  <section class="info-comp">
    <div class="wrapper">
      <h1 class="title">{{ t('privacy.title') }}</h1>

      <div class="info-card">
        <div class="info-content">
          <!-- Intro -->
          <p class="info-p">{{ t('privacy.intro') }}</p>

          <!-- 1 -->
          <h2 class="info-h2">{{ t('privacy.s1_title') }}</h2>

          <h3 class="info-h3">{{ t('privacy.s1_1_title') }}</h3>
          <ul class="info-ul">
            <li>{{ t('privacy.s1_1_li1') }}</li>
            <li>{{ t('privacy.s1_1_li2') }}</li>
            <li>{{ t('privacy.s1_1_li3') }}</li>
          </ul>

          <h3 class="info-h3">{{ t('privacy.s1_2_title') }}</h3>
          <ul class="info-ul">
            <li>{{ t('privacy.s1_2_li1') }}</li>
            <li>{{ t('privacy.s1_2_li2') }}</li>
            <li>{{ t('privacy.s1_2_li3') }}</li>
            <li>{{ t('privacy.s1_2_li4') }}</li>
          </ul>

          <!-- 2 -->
          <h2 class="info-h2">{{ t('privacy.s2_title') }}</h2>
          <ul class="info-ul">
            <li>{{ t('privacy.s2_1_li1') }}</li>
            <li>{{ t('privacy.s2_1_li2') }}</li>
            <li>{{ t('privacy.s2_1_li3') }}</li>
            <li>{{ t('privacy.s2_1_li4') }}</li>
            <li>{{ t('privacy.s2_1_li5') }}</li>
          </ul>

          <!-- 3 -->
          <h2 class="info-h2">{{ t('privacy.s3_title') }}</h2>

          <p class="info-p">{{ t('privacy.s3_1_text') }}</p>

          <h3 class="info-h3">{{ t('privacy.s3_2_title') }}</h3>
          <p class="info-p">{{ t('privacy.s3_2_text') }}</p>
          <ul class="info-ul">
            <li>{{ t('privacy.s3_2_li1') }}</li>
            <li>{{ t('privacy.s3_2_li2') }}</li>
            <li>{{ t('privacy.s3_2_li3') }}</li>
          </ul>

          <p class="info-p">{{ t('privacy.s3_3_text') }}</p>

          <!-- 4 -->
          <h2 class="info-h2">{{ t('privacy.s4_title') }}</h2>

          <p class="info-p">{{ t('privacy.s4_1_text') }}</p>
          <ul class="info-ul">
            <li>{{ t('privacy.s4_1_li1') }}</li>
            <li>{{ t('privacy.s4_1_li2') }}</li>
            <li>{{ t('privacy.s4_1_li3') }}</li>
          </ul>

          <!-- 5 -->
          <h2 class="info-h2">{{ t('privacy.s5_title') }}</h2>

          <p class="info-p">{{ t('privacy.s5_1_text') }}</p>
          <p class="info-p">{{ t('privacy.s5_2_text') }}</p>

          <!-- 6 -->
          <h2 class="info-h2">{{ t('privacy.s6_title') }}</h2>
          <ul class="info-ul">
            <li>{{ t('privacy.s6_1_li1') }}</li>
            <li>{{ t('privacy.s6_1_li2') }}</li>
            <li>{{ t('privacy.s6_1_li3') }}</li>
          </ul>

          <!-- 7 -->
          <h2 class="info-h2">{{ t('privacy.s7_title') }}</h2>
          <p class="info-p">{{ t('privacy.s7_text') }}</p>

          <!-- 8 -->
          <h2 class="info-h2">{{ t('privacy.s8_title') }}</h2>
          <p class="info-p">{{ t('privacy.s8_text') }}</p>

          <!-- 9 -->
          <h2 class="info-h2">{{ t('privacy.s9_title') }}</h2>
          <p class="info-p">{{ t('privacy.s9_text') }}</p>

          <p class="info-p">
            <strong>{{ t('privacy.s9_email_label') }}</strong>
            <a class="info-link" href="mailto:support@bodyflow.com.ua">
              support@bodyflow.com.ua
            </a>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
    const { t } = useI18n()
</script>

<style lang="scss" scoped>
    .wrapper {
        grid-template-areas: 
        "title"
        "content";
    }
</style>
