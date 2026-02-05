<template>
    <div class="content-container contact-info">
        <h2>{{ t('contact.info') }}</h2>
       <div
            v-for="c in contactInfo"
            :key="c.id"
            class="info-card"
            >
            <div class="info-label">
                {{ t(c.labelKey) }}
            </div>

             <div class="info-name">
                <!-- EMAIL -->
                <a
                v-if="c.type === 'email'"
                :href="`mailto:${c.value}`"
                class="info-link"
                >
                {{ c.value }}
                </a>

                <!-- TEXT -->
                <span v-else>
                {{ c.valueKey ? t(c.valueKey) : c.value }}
                </span>
            </div>
        </div>

    </div>
</template>
  
  
<script setup>
const { t } = useI18n()

const contactInfo = [
  { id: 1, labelKey: 'contact.labels.fop', valueKey: 'contact.values.fop' },
  { id: 2, labelKey: 'contact.labels.country', valueKey: 'contact.values.country' },
  { id: 3, labelKey: 'contact.labels.city', valueKey: 'contact.values.city' },
  { id: 4, labelKey: 'contact.labels.email', value: 'support@bodyflow.com.ua', type: "email" },
]

</script>

  
  <style lang="scss" scoped>
    .contact-info {
        grid-area: info;
        width: 100%;
        h2 {
            font-weight: 700;
            color: $color-navy;
            margin-bottom: 1.5rem;
        }
        .info-card {
            @include flex(row, center, start);
            margin-bottom: 1rem;
            .info-label {
                flex: 0 0 35%;
                color: $color-navy;
                font-weight: 700;
            }
            .info-name {
                flex: 0 0 65%;
                .info-link {
                    color: $color-navy;
                    text-decoration: underline;
                    transition: color 0.2s ease;

                    &:hover {
                    color: $color-green;
                    text-decoration: none;
                    }
                }
            }
        }
    }

  </style>
  