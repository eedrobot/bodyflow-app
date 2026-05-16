<template>
    <div class="content-container content-cards">
        <h2>{{ t('advanced-calculation.title_1') }}</h2>
        <div class = "cards">
            <div v-for="(card, i) in cards" :key="i" class = "card">
                <img :src="card.icon" alt="card.text" class="card-icon" />
                <div class = "card-title">
                     {{ card.title }}
                </div>
                <div class = "card_txt">
                    {{ card.description }}
                </div>
            </div>
        </div>
    </div>
</template>
  
  
<script setup>
const { t, tm, rt } = useI18n()

const cardsTitle = computed(() => {
  const messages = tm('advanced-calculation.cards')
  return Array.isArray(messages) ? messages.map(m => rt(m)) : []
})

const cardsTxt = computed(() => {
  const messages = tm('advanced-calculation.cards_txt')
  return Array.isArray(messages) ? messages.map(m => rt(m)) : []
})


const icons = [
  '/icons/percent_icon.png',
  '/icons/kbju_icon.png',
  '/icons/progress_icon.png',
  '/icons/mail_icon.png'
]

const cards = computed(() =>
  cardsTitle.value.map((title, i) => ({
    title,
    description: cardsTxt.value[i] || '',
    icon: icons[i] || ''
  }))
)

</script>

  
  <style lang="scss" scoped>
    .content-cards {
        grid-area: cards;
        width: 100%;
        h2 {
            font-weight: 700;
            color: $color-navy;
            margin-bottom: 1.5rem;
            text-align: center;
        }
        .cards {
            @include flex(row, stretch, space-between);
            flex-wrap: wrap;
            .card {
                width: 23%;
                padding: 1rem 1rem 2rem 1rem;
                border-radius: $b-r;
                border: 1px solid $color-mg;
                background: $color-beige-l;
                box-shadow: $b-sh;
                .card-icon {
                    width: 100%;
                }
                .card-title {
                    height: 20%;
                    text-align: center;
                    font-weight: 700;
                    margin-bottom: 1rem;;
                }
                .card_txt {
                    text-align: center;
                }
            }
        }
    }

    
  @media (max-width: 991.98px) {
     .content-cards {
        .cards {
            .card {
                width: 47%;
                margin-bottom: 1rem;
                .card-title {
                        height: auto;
                    }
            }
        }
    }
  }

     @media (max-width: 575.98px) {
        .content-cards {
            .cards {
                .card {
                    width: 100%;
                }
            }
        }
    }

  </style>
  