<template>
    <section class="flex flex-col items-center justify-center gap-8 my-4 mx-auto" name="blog">
        <header class="flex justify-center md:justify-between items-center flex-wrap px-4 gap-8 w-full">
            <span class="heading mb-4 w-max">
                <h1 class="f-nazanin font-bold text-4xl">وبلاگ مطالب حقوقی</h1>
                <small class="f-copgoth text-xs">Legal Content Blog</small>
            </span>
            <t-input
                class="max-w-screen-xs"
                type="search"
                icon="far fa-search"
                placeholder="جستجوی مطالب"
                v-model:value="search"
                @keydown="searchArticles($event)"
            />
        </header>

        <hr class="w-full border-solid opacity-60 mx-auto my-2" />

        <div class="flex flex-wrap items-start justify-center md:justify-between gap-4 w-full">
            <div class="flex flex-col gap-4 w-full max-w-screen-lg">
                <div class="flex flex-col gap-4 w-full" v-if="loadingArticles">
                    <div class="article_box_skeleton flex flex-col sm:flex-row gap-4 justify-center p-4" v-for="(article, i) in skeletonArticles" :key="i">
                        <div class="flex-shrink-0 rounded-sm h-48 sm:h-32 w-full sm:w-48 object-cover" name="skeleton"></div>
                        <div class="flex flex-col items-start gap-2 w-full">
                            <div class="w-10/12 h-8 mb-4" name="skeleton"></div>
                            <div class="w-full h-4" name="skeleton"></div>
                            <div class="w-full h-4" name="skeleton"></div>
                            <div class="w-7/12 h-4" name="skeleton"></div>
                        </div>
                    </div>
                </div>
                <div
                    class="article_box flex flex-col sm:flex-row gap-4 justify-center p-4 rounded-sm max-w-screen-lg"
                    v-for="(article, i) in articles"
                    :key="i"
                >
                    <router-link class="flex-shrink-0" :to="`/article/${article.url_code}/${article.title.replace(/ /g, '-')}`" :title="article.title">
                        <img
                            class="rounded-sm h-auto sm:h-28 w-full sm:w-auto object-cover"
                            width="200"
                            :src="article.metadata.thumbnail"
                            :alt="article.title"
                        />
                    </router-link>
                    <div class="flex flex-col items-start gap-2">
                        <small class="flex items-start gap-2 text-xs opacity-60">
                            <span>{{ `${article.author[0].name} ${article.author[0].family}` }}</span>
                            <span> | </span>
                            <span>{{ new Date(article.publishedAt).toLocaleDateString("fa") }}</span>
                        </small>
                        <h3 class="f-nazanin font-bold text-2xl opacity-90">
                            <router-link class="f-nazanin" :to="`/article/${article.url_code}/${article.title.replace(/ /g, '-')}`" :title="article.title">
                                {{ article.title }}
                            </router-link>
                        </h3>
                        <p class="text-sm opacity-90 hidden md:inline-block">{{ article.desc }}</p>
                    </div>
                </div>
                <ul class="flex items-center justify-center md:justify-start gap-2 mt-4 mb-12">
                    <li>
                        <router-link class="p-3 py-2 text-sm rounded-sm bg-gray-700 text-primary-100" :to="`/blog/${Math.max(1, parseInt(page) - 1)}`">
                            صفحه قبل
                        </router-link>
                    </li>
                    <li>
                        <span class="p-3 py-1 rounded-sm border-2 border-solid border-primary-500 border-opacity-50">{{ page }}</span>
                    </li>
                    <li>
                        <router-link
                            class="p-3 py-2 text-sm rounded-sm bg-gray-700 text-primary-100"
                            :to="`/blog/${Math.min(pageTotal, parseInt(page) - 1 + 2)}`"
                        >
                            صفحه بعد
                        </router-link>
                    </li>
                </ul>
            </div>
            <aside class="flex flex-col gap-4 px-4 border-r border-l border-solid border-gray-400 border-opacity-40">
                <div class="flex flex-col items-center justify-center gap-1">
                    <h4 class="f-nazanin font-bold text-2xl">پربازدیدترین مطالب</h4>
                    <small class="f-copgoth text-xs">Most Viewed Articles</small>
                </div>
                <hr class="w-full border-solid opacity-60 mx-auto" />
                <div class="flex flex-col md:flex-row xl:flex-col gap-4 pb-4 overflow-auto">
                    <div
                        class="article_box flex flex-col gap-2 items-start p-4 rounded-sm w-full md:max-w-screen-xs flex-shrink-0"
                        v-for="(article, i) in mostViewdArticles"
                        :key="i"
                    >
                        <h3 class="f-nazanin font-bold text-2xl opacity-90">
                            <router-link class="f-nazanin" :to="`/article/${article.url_code}/${article.title.replace(/ /g, '-')}`" :title="article.title">
                                {{ article.title }}
                            </router-link>
                        </h3>
                        <small class="text-sm opacity-75">{{ new Date(article.publishedAt).toLocaleDateString("fa") }}</small>
                    </div>
                </div>
            </aside>
        </div>
    </section>
</template>

<script>
import axios from "axios";

import Input from "../../templates/layouts/Input";

export default {
    name: "Blog",
    components: {
        "t-input": Input,
    },
    data() {
        return {
            mostViewdArticles: [],
            articles: [],
            skeletonArticles: ["", "", "", "", ""],

            loadingArticles: true,

            search: "",
            page: 1,
            total: 0,
            pageTotal: 1,
        };
    },
    async serverPrefetch() {
        this.search = this.$route.query.search ? this.$route.query.search : "";
        this.page = this.$route.params.page ? this.$route.params.page : 1;
        await Promise.all([this.getMostViewdArticles(), this.getArticles()]);
    },
    created() {},
    async mounted() {
        this.search = this.$route.query.search ? this.$route.query.search : "";
        this.page = this.$route.params.page ? this.$route.params.page : 1;
        await Promise.all([this.getMostViewdArticles(), this.getArticles()]);
    },
    async beforeRouteUpdate(to, from, next) {
        this.$route.params.page = to.params.page;
        this.page = this.$route.params.page ? this.$route.params.page : 1;
        await this.getArticles();
        document.querySelector("body").scrollTop = 0;
        next();
    },
    computed: {},
    methods: {
        async getMostViewdArticles() {
            await axios.get(`${this.getBaseUrl()}/api/v1/web/random_articles`).then((response) => {
                this.mostViewdArticles = response.data;
            });
        },

        async getArticles() {
            this.loadingArticles = true;

            let params = [`page=${this.page}`, `search=${this.search}`];
            params = params.join("&");

            await axios
                .get(`${this.getBaseUrl()}/api/v1/web/articles?${params}`)
                .then((response) => {
                    this.articles = response.data.records;
                    this.total = response.data.total;
                    this.pageTotal = response.data.pageTotal;
                })
                .catch((error) => {
                    if (error.response.data && error.response.data.error) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                    }
                })
                .finally(() => (this.loadingArticles = false));
        },
        searchArticles(e) {
            if (e.keyCode == 13) this.getArticles();
        },
    },
};
</script>

<style></style>
