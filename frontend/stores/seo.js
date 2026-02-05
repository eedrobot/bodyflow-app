import { defineStore } from 'pinia';
import { useHead } from '@vueuse/head';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

export const useSeoStore = defineStore('seo', () => {
    const route = useRoute();
    const { locale, t } = useI18n();

    function setSEO(options) {
        const {
            title,
            description,
            keywords = '',
            image = '/default-og.png',
            schema = null
        } = options;

        const url = `${window.location.origin}${route.fullPath}`;
        const lang = locale.value;

        useHead({
            title,
            htmlAttrs: {
                lang,
            },

            link: [
                {  key: 'canonical', rel: 'canonical', href: url },

                // hreflangs
                { key: 'alt-en', rel: 'alternate', hreflang: 'en', href: url.replace(`/${lang}`, '/en') },
                { key: 'alt-ru', rel: 'alternate', hreflang: 'ru', href: url.replace(`/${lang}`, '/ru') },
                { key: 'alt-uk', rel: 'alternate', hreflang: 'uk', href: url.replace(`/${lang}`, '/uk') },
            ],

            meta: [
                { name: 'description', content: description },
                { name: 'keywords', content: keywords },

                // OpenGraph
                { property: 'og:title', content: title },
                { property: 'og:description', content: description },
                { property: 'og:type', content: 'website' },
                { property: 'og:url', content: url },
                { property: 'og:image', content: image },

                // Twitter
                { name: 'twitter:card', content: 'summary_large_image' },
                { name: 'twitter:title', content: title },
                { name: 'twitter:description', content: description },
                { name: 'twitter:image', content: image },
            ],

            script: schema
                ? [{
                    type: 'application/ld+json',
                    children: JSON.stringify(schema),
                }]
                : [],
        },
        { key: 'seo' });
    }

    return { setSEO }
});
