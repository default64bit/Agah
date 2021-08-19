<template>
    <transition name="slidedown" mode="out-in" appear>
        <div class="auth_template">
            <slot name="content"></slot>
        </div>
    </transition>
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
        ...mapGetters(["adminInfo"]),
    },
    methods: {
        ...mapActions(["getAdminInfo"]),

        async checkAuthentication() {
            await this.getAdminInfo({ BaseUrl: this.getBaseUrl(), csrfToken: this.getCookie("XSRF-TOKEN"), AdminAuthToken: this.getCookie("AdminAuthToken") })
                .then((response) => {
                    this.$router.push("/admin");
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
