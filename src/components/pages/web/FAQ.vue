<template>
    <section class="flex flex-col items-center justify-center gap-8 my-4 mx-auto" name="faq">
        <header class="flex justify-center md:justify-between items-center flex-wrap px-4 gap-8 w-full">
            <span class="heading mb-4 w-max">
                <h1 class="f-nazanin font-bold text-4xl">سوالات متداول حقوقی</h1>
                <small class="f-copgoth text-xs">Frequently Asked Legal Questions</small>
            </span>
            <t-input
                class="max-w-screen-xs"
                type="search"
                icon="far fa-search"
                placeholder="جستجوی سوالات"
                v-model:value="search"
                @keydown="searchFaqs($event)"
            />
        </header>

        <hr class="w-full border-solid opacity-60 mx-auto my-2" />

        <div class="flex flex-col items-center justify-center gap-4 w-full" v-if="loadingFaqs">
            <div class="faq_box flex flex-col gap-1 max-w-screen-md w-full" v-for="(faq, i) in skeletonFaqs" :key="i">
                <div class="skeleton h-8 w-9/12 mb-8"></div>
                <div class="skeleton h-4 w-full"></div>
                <div class="skeleton h-4 w-full"></div>
                <div class="skeleton h-4 w-full"></div>
                <div class="skeleton h-4 w-full"></div>
                <div class="skeleton h-4 w-7/12"></div>
            </div>
        </div>
        <div class="flex flex-col items-center justify-center gap-4 w-full" v-if="!loadingFaqs">
            <div class="faq_box flex flex-col gap-2 max-w-screen-md w-full" v-for="(faq, i) in faqs" :key="i">
                <header class="flex items-start gap-4 cursor-pointer" @click="faq.open = !faq.open">
                    <h3 class="f-nazanin font-bold text-2xl">{{ faq.question }}</h3>
                    <transition name="fade" mode="out-in">
                        <span class="far fa-caret-down text-2xl p-1 px-3 text-primary-500 opacity-60" v-if="!faq.open"></span>
                        <span class="fal fa-minus text-xl p-1 px-3 text-primary-500 opacity-60" v-else></span>
                    </transition>
                </header>
                <transition name="slidedown" mode="out-in">
                    <p class="text-sm" v-show="faq.open">{{ faq.answer }}</p>
                </transition>
            </div>
            <ul class="flex items-center justify-center md:justify-start gap-2 mt-4 mb-12">
                <li>
                    <router-link
                        class="p-3 py-2 text-sm rounded-sm bg-gray-700 text-primary-100"
                        :to="`/frequently-asked-legal-questions/${Math.max(1, parseInt(page) - 1)}`"
                    >
                        صفحه قبل
                    </router-link>
                </li>
                <li>
                    <span class="p-3 py-1 rounded-sm border-2 border-solid border-primary-500 border-opacity-50">{{ page }}</span>
                </li>
                <li>
                    <router-link
                        class="p-3 py-2 text-sm rounded-sm bg-gray-700 text-primary-100"
                        :to="`/frequently-asked-legal-questions/${Math.min(pageTotal, parseInt(page) - 1 + 2)}`"
                    >
                        صفحه بعد
                    </router-link>
                </li>
            </ul>
        </div>
    </section>
</template>

<script>
import axios from "axios";

import Input from "../../templates/layouts/Input";

export default {
    name: "Faqs",
    components: {
        "t-input": Input,
    },
    data() {
        return {
            faqs: [],
            skeletonFaqs: ["", "", "", "", ""],

            loadingFaqs: true,

            search: "",
            page: 1,
            total: 0,
            pageTotal: 1,
        };
    },
    async serverPrefetch() {
        this.search = this.$route.query.search ? this.$route.query.search : "";
        this.page = this.$route.params.page ? this.$route.params.page : 1;
        await this.getFaqs();
    },
    created() {},
    async mounted() {
        this.search = this.$route.query.search ? this.$route.query.search : "";
        this.page = this.$route.params.page ? this.$route.params.page : 1;
        await this.getFaqs();
    },
    async beforeRouteUpdate(to, from, next) {
        this.$route.params.page = to.params.page;
        this.page = this.$route.params.page ? this.$route.params.page : 1;
        await this.getFaqs();
        document.querySelector("body").scrollTop = 0;
        next();
    },
    computed: {},
    methods: {
        async getFaqs() {
            this.loadingFaqs = true;

            let params = [`page=${this.page}`, `search=${this.search}`];
            params = params.join("&");

            await axios
                .get(`${this.getBaseUrl()}/api/v1/web/faqs?${params}`)
                .then((response) => {
                    this.faqs = [];
                    response.data.records.forEach((faq) => {
                        this.faqs.push({ ...faq, open: false });
                    });
                    this.total = response.data.total;
                    this.pageTotal = response.data.pageTotal;
                })
                .catch((error) => {
                    if (error.response.data && error.response.data.error) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                    }
                })
                .finally(() => (this.loadingFaqs = false));
        },
        searchFaqs(e) {
            if (e.keyCode == 13) this.getFaqs();
        },
    },
};
</script>

<style></style>
