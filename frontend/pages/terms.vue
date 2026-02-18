<template>
  <div class="terms-comp">
    <div class="wrapper">
      <h1 class="page-title">
        {{ t('terms.title') }}
      </h1>

      <div class = "info-card">
        <div class = "info-content">
            <p class="info-p">
                {{ t('terms.intro') }}
            </p>

            <h2>{{ t('terms.s1_title') }}</h2>
            <p class = "info-p">{{ t('terms.s1_text') }}</p>

            <h2>{{ t('terms.s2_title') }}</h2>
            <ul class = "info-ul">
                <li>{{ t('terms.s2_li1') }}</li>
                <li>{{ t('terms.s2_li2') }}</li>
                <li>{{ t('terms.s2_li3') }}</li>
                <li>{{ t('terms.s2_li4') }}</li>
            </ul>

            <h2>{{ t('terms.s3_title') }}</h2>
            <p class = "info-p">{{ t('terms.s3_text') }}</p>

            <h2>{{ t('terms.s4_title') }}</h2>
            <p class = "info-p">{{ t('terms.s4_text') }}</p>

            <h2>{{ t('terms.s5_title') }}</h2>
            <ul class = "info-ul">
                <li>{{ t('terms.s5_li1') }}</li>
                <li>{{ t('terms.s5_li2') }}</li>
                <li>{{ t('terms.s5_li3') }}</li>
            </ul>

            <h2>{{ t('terms.s6_title') }}</h2>
            <p class = "info-p">{{ t('terms.s6_text') }}</p>

            <h2>{{ t('terms.s7_title') }}</h2>
            <p class = "info-p">{{ t('terms.s7_text') }}</p>

            <h2>{{ t('terms.s8_title') }}</h2>
            <p class = "info-p">{{ t('terms.s8_text') }}</p>

            <h2>{{ t('terms.s9_title') }}</h2>
            <p class = "info-p">
            {{ t('terms.s9_text') }}
            <br />
            <strong>{{ t('terms.s9_email_label') }}</strong>
            <a href="mailto:info@bodyflow.com.ua">
                info@bodyflow.com.ua
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
    }
</style>
