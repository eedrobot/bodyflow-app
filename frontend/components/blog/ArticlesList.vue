<template>
     <div class="blog-grid">
        <article
            v-for="post in posts"
            :key="post.id || post.slug"
            class="blog-card"
        >
            <NuxtLink
            class="blog-card__image-link"
            :to="localePath({ name: 'blog-slug', params: { slug: post.slug } })">
            <img
                v-if="post.cover_image"
                class="blog-card__image"
                :src="post.cover_image"
                :alt="post.title"
            >
            </NuxtLink>

            <div class="blog-card__body">
            <span class="blog-card__category">
                {{ t(`blog.categories.${post.category}`) }}
            </span>

            <h2 class="blog-card__title">
                <NuxtLink :to="localePath({ name: 'blog-slug', params: { slug: post.slug } })">
                {{ post.title }}
                </NuxtLink>
            </h2>

            <p v-if="post.excerpt" class="blog-card__excerpt">
                {{ post.excerpt }}
            </p>

            <NuxtLink
                class="blog-card__more"
                :to="localePath({ name: 'blog-slug', params: { slug: post.slug } })">
                {{ t('blog.read_link') }}
            </NuxtLink>
            </div>
        </article>
    </div>
</template>
<script setup>
    const { t } = useI18n()
    const localePath = useLocalePath()

    const blogStore = useBlogStore()
    const posts = computed(() => blogStore.posts)

</script>
<style scoped lang="scss">
.blog-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
    .blog-card {
        @include flex (row, stretch, space-between);
        flex-wrap: wrap;
        overflow: hidden;
        background: $color-beige-l;
        border-radius: $b-r;
        box-shadow: $b-sh;

        &__image-link {
            width: 40%;
            display: block;
        }

        &__image {
            display: block;
            height: 100%;
            width: 100%;
            aspect-ratio: 4 / 3;
            object-fit: cover;
        }

        &__body {
            width: 60%;
            padding: 20px;
        }

        &__category {
            color: $color-green;
            font-size: $fs-small;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            background: $color-lgreen;
            padding: 5px 10px;
            border-radius: $b-r;
        }

        &__title {
            font-weight: 700;
            margin-top: 20px;

            a {
            color: $color-navy-d;
            text-decoration: none;
            }
        }

        &__excerpt {
            color: $color-dg;
            line-height: 1.5;
        }

        &__more {
            color: $color-navy;
            font-weight: 700;
            text-decoration: none;
            font-size: $fs-small;
            text-decoration: underline;
        }
    }
}

@media (min-width: 1919.98px) {
    .blog-grid {
        grid-template-columns: 1fr 1fr;
    }
}
@media (min-width: 1399.98px) {
    .blog-grid {
         .blog-card {
            &__image {
                aspect-ratio: 19 / 6;
            }
        }
    }
}
@media (max-width: 575.98px) {
    .blog-grid {
         .blog-card {
            @include flex (column, center, space-between);
            &__image-link {
                width: 100%;
                margin-right: 0;
            }

            &__body {
                width: 100%;
            }
        }
    }
}

</style>