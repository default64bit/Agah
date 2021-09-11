<template>
    <div class="main" v-show="!loading">
        <main-header></main-header>
        <router-view v-slot="{ Component }">
            <transition name="slidedown" mode="out-in" appear="">
                <component :is="Component" />
            </transition>
        </router-view>
        <main-footer></main-footer>
        <toast />
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import Header from "./Header";
import Footer from "./Footer";
import Toast from "./Toast";

export default {
    name: "Main",
    components: {
        "main-header": Header,
        "main-footer": Footer,
        toast: Toast,
    },
    data() {
        return {
            loading: true,
        };
    },
    async serverPrefetch() {
        // await this.checkAuthentication();
    },
    created() {
        // this.checkAuthentication();
        this.loading = false;
    },
    mounted() {
        // set theme
        if (localStorage.getItem("userTheme")) {
            let theme = localStorage.getItem("userTheme") == "default_dark" ? "default_dark" : "default_light";
            window.document.querySelector("body").setAttribute("theme", theme);
        }

        // TODO
        // get userAuthError from cookie
        // and if it is some error, show it via toast and then clear the error
    },
    computed: {
        ...mapGetters(["userInfo", "isLoggedIn"]),
    },
    methods: {
        ...mapActions(["getUserInfo"]),

        async checkAuthentication() {
            await this.getUserInfo({
                BaseUrl: this.getBaseUrl(),
                csrfToken: this.getCookie("XSRF-TOKEN"),
                UserAuthToken: this.getCookie("UserAuthToken"),
            })
                .then((response) => {})
                .finally(() => (this.loading = false));
        },
    },
};
</script>

<style></style>
