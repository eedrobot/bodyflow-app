<template>
    <div class = "social">
         <div class = "social-email">
        <a href="support@bodyflow.com.ua">support@bodyflow.com.ua</a>
        </div>
        <div class="social-links">
            <a class="social-link instagram" href="https://instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <!-- Instagram icon -->
                <svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm9 2h-9A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9A3.5 3.5 0 0 0 20 16.5v-9A3.5 3.5 0 0 0 16.5 4Z"/>
                    <path d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/>
                    <path d="M17.6 6.4a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8Z"/>
                </svg>
            </a>

            <a class="social-link facebook" href="https://facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <!-- Facebook icon -->
                <svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M13.5 22v-8h2.7l.4-3H13.5V9.3c0-.9.2-1.5 1.5-1.5h1.6V5.1c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V11H8v3h2.5v8h3Z"/>
                </svg>
            </a>
        </div>
    </div>
</template>
<script setup>

</script>

<style lang="scss" scoped>
    .social-email {
        margin-bottom: 1rem;
        a {
            color: $color-dg;
            &:hover {
                text-decoration: underline;
            }
        }
    }
    .social-links {
        @include flex(row, center, start);
        .social-link {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
             margin-right: 5px;
            .social-icon {
                    width: 22px;
                    height: 22px;
                    fill: currentColor;
                }
            &.facebook {
                background-color: #1877f2; // фирменный Facebook blue
                color: $color-white;
            }
            &.instagram {
                background: linear-gradient(
                    45deg,
                    #f58529,
                    #dd2a7b,
                    #8134af,
                    #515bd4
                );
                color: $color-white;
            }
        }
    }

    @media (max-width: 575.98px) {
        .social-links {
            justify-content: start;
        }
    }

</style>