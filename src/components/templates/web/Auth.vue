<template>
    <div class="auth_header justify-center md:justify-between">
        <div class="flex gap-2 items-center">
            <img src="/img/icons/android-chrome-192x192.png" alt="JasperFix" />
            <h1>Jasper Fix</h1>
        </div>
        <div class="flex gap-2 items-center">
            <slot name="links"></slot>
        </div>
    </div>

    <transition name="slidedown" mode="out-in" appear>
        <div class="auth_template my-16">
            <slot name="content"></slot>
        </div>
    </transition>

    <hr class="mt-auto mb-0 mx-auto w-11/12 border-solid" />
    <div class="auth_footer justify-center md:justify-between">
        <div class="copyright flex gap-1">
            <i class="fal fa-copyright"></i>
            <span>2021 Jasper Fix</span>
        </div>
        <div class="flex flex-wrap items-center gap-6">
            <a class="hover:text-primary-300" href="#terms-and-conditions">Terms</a>
            <a class="hover:text-primary-300" href="#privacy-policy">Privacy Policy</a>
            <a class="hover:text-primary-300" href="#support">Support</a>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
    name: "Auth",
    data() {
        return {
            loading: true,
        };
    },
    async serverPrefetch() {
        await this.checkAuthentication();
    },
    async created() {},
    async mounted() {
        await this.checkAuthentication();
    },
    computed: {
        ...mapGetters(["userInfo"]),
    },
    methods: {
        ...mapActions(["getUserInfo"]),

        async checkAuthentication() {
            await this.getUserInfo({ BaseUrl: this.getBaseUrl(), csrfToken: this.getCookie("XSRF-TOKEN"), UserAuthToken: this.getCookie("UserAuthToken") })
                .then((response) => {
                    this.$router.push("/");
                    this.loading = false;
                })
                .catch((e) => {
                    this.loading = false;
                });
        },
    },
};
</script>

<style></style>
