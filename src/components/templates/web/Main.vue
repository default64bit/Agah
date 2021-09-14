<template>
    <div class="main">
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
import cookies from "js-cookie";

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
        return {};
    },
    async serverPrefetch() {
        await this.checkAuthentication();
    },
    async created() {
        await this.checkAuthentication();
        this.loading = false;
    },
    mounted() {
        // set theme
        if (localStorage.getItem("userTheme")) {
            let theme = localStorage.getItem("userTheme") == "default_dark" ? "default_dark" : "default_light";
            window.document.querySelector("body").setAttribute("theme", theme);
        }

        // show errors if there's any
        if (cookies.get("userAuthError")) this.makeToast({ message: cookies.get("AdminAuthError"), type: "danger" });
    },
    computed: {
        ...mapGetters(["userInfo", "isUserLoggedIn"]),
    },
    methods: {
        ...mapActions(["getUserInfo", "makeToast"]),

        async checkAuthentication() {
            await this.getUserInfo({
                BaseUrl: this.getBaseUrl(),
                csrfToken: this.getCookie("XSRF-TOKEN"),
                UserAuthToken: this.getCookie("UserAuthToken"),
            })
                .then((response) => {})
                .catch((e) => {});
        },
    },
};
</script>

<style></style>
