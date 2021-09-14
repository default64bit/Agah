<template>
    <div>
        <section class="flex flex-col items-center justify-center gap-8 my-4 mx-auto" name="article">
            <article class="flex flex-col gap-8 w-full max-w-screen-lg" v-if="article.title">
                <header class="flex flex-col gap-8">
                    <h1 class="f-nazanin font-bold text-5xl" itemprop="headline">{{ article.title }}</h1>
                    <meta itemprop="description" :content="article.metadata.description" />
                    <div class="flex items-center justify-between flex-wrap gap-6">
                        <div class="flex items-center gap-2">
                            <img
                                class="w-8 h-8 object-cover rounded-full"
                                :src="article.author.image"
                                :alt="`${article.author.name} ${article.author.family}`"
                                width="32"
                            />
                            <div itemprop="author" itemtype="https://schema.org/Person">
                                <span class="text-sm opacity-75" itemprop="name">{{ `${article.author.name} ${article.author.family}` }}</span>
                            </div>
                            <span> | </span>
                            <span class="text-sm opacity-75">
                                {{ new Date(article.publishedAt).toLocaleDateString("fa", { year: "numeric", month: "long", day: "2-digit" }) }}
                            </span>
                            <meta itemprop="datePublished" :content="article.publishedAt" />
                        </div>
                        <div class="flex items-center gap-4 text-lg">
                            <a
                                href="https://twitter.com/share?text=ورود به عنف&url=https://agah-lawyers.com/article/44/ورود به عنف"
                                :title="article.title"
                                rel="nofollow"
                                target="_blank"
                            >
                                <span class="fab fa-twitter"></span>
                            </a>
                            <a
                                href="whatsapp://send?text=https://agah-lawyers.com/article/44/ورود به عنف"
                                :title="article.title"
                                rel="nofollow"
                                target="_blank"
                            >
                                <span class="fab fa-whatsapp"></span>
                            </a>
                            <a
                                href="https://telegram.me/share/url?text=ورود به عنف&url=https://agah-lawyers.com/article/44/ورود به عنف"
                                :title="article.title"
                                rel="nofollow"
                                target="_blank"
                            >
                                <span class="fab fa-telegram"></span>
                            </a>
                        </div>
                    </div>
                </header>
                <div itemprop="image" itemtype="https://schema.org/ImageObject">
                    <img class="w-full rounded-md" :src="article.image" :alt="article.title" width="1024" />
                    <meta itemprop="url" :content="article.image" />
                </div>

                <article-render :data="JSON.parse(article.text)" />

                <ul class="flex items-center flex-wrap gap-4" itemprop="tags">
                    <li class="py-2 px-4 text-sm bg-truegray-200 text-gray-900 rounded-sm" v-for="(tag, i) in article.tags" :key="i">{{ tag }}</li>
                </ul>
            </article>
        </section>

        <hr class="max-w-screen-xl w-full border-solid opacity-60 mx-auto my-8" />

        <section class="flex flex-col items-center justify-center gap-4 mb-8 mx-auto" name="home-5" v-if="!!similarArticles.length">
            <span class="heading gap-0">
                <h4 class="f-nazanin font-bold text-2xl">بیشتر بخوانید</h4>
                <small class="f-copgoth text-xs">Also Read</small>
            </span>
            <div class="flex items-center flex-wrap gap-4">
                <div class="article_box" v-for="(article, i) in similarArticles" :key="i">
                    <router-link :to="`/article/${article.url_code}/${article.title.replace(/ /g, '-')}`" :title="article.title">
                        <img :src="article.metadata.thumbnail" :alt="article.title" />
                    </router-link>
                    <router-link :to="`/article/${article.url_code}/${article.title.replace(/ /g, '-')}`" :title="article.title">
                        <h4 class="f-nazanin text-2xl font-bold">{{ article.title }}</h4>
                    </router-link>
                    <small class="flex justify-between w-full relative">
                        <span>{{ `${article.author.name} ${article.author.family}` }}</span>
                        <span>{{ new Date(article.publishedAt).toLocaleDateString("fa", { year: "numeric", month: "long", day: "2-digit" }) }}</span>
                    </small>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import axios from "axios";

import ArticleRender from "../../templates/web/ArticleRender";

export default {
    name: "Blog",
    components: {
        "article-render": ArticleRender,
    },
    data() {
        return {
            article: {},
            similarArticles: [],
        };
    },
    async serverPrefetch() {
        await this.getArticle();
    },
    created() {},
    async mounted() {
        await this.getArticle();
    },
    async beforeRouteUpdate(to, from, next) {
        this.$route.params.url_code = to.params.url_code;
        await this.getArticle();
        document.querySelector("body").scrollTop = 0;
        next();
    },
    computed: {},
    methods: {
        async getArticle() {
            await axios
                .get(`${this.getBaseUrl()}/api/v1/web/article?url_code=${this.$route.params.url_code}`)
                .then((response) => {
                    this.article = response.data.article;
                    this.similarArticles = response.data.similarArticles;
                })
                .catch((error) => {
                    if (error.response.data && error.response.data.error) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                    }
                    if (error.response.status == 404) {
                        // send request to get some random articles and show it in also read
                    }
                });
        },
    },
};
</script>

<style></style>
