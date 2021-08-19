<template>
    <div class="dashboard_template" v-if="!loading">
        <dashboard-side-menu :loading="loading"></dashboard-side-menu>
        <div class="dashboard_bh flex flex-col h-full">
            <dashboard-header :loading="loading"></dashboard-header>
            <router-view v-slot="{ Component }">
                <transition name="slidedown" mode="out-in" appear="">
                    <component :is="Component" />
                </transition>
            </router-view>
        </div>

        <dashboard-toast />
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import DashboardHeader from "./DashboardHeader";
import DashboardSideMenu from "./DashboardSideMenu";
import DashboardToast from "./DashboardToast";

export default {
    name: "Dashboard",
    components: {
        "dashboard-header": DashboardHeader,
        "dashboard-side-menu": DashboardSideMenu,
        "dashboard-toast": DashboardToast,
    },
    data() {
        return {
            loading: true,
        };
    },
    async serverPrefetch() {
        await this.checkAuthentication();
    },
    created() {},
    mounted() {
        this.checkAuthentication();
    },
    beforeRouteEnter(to, from, next) {
        // TOOD
        // check admin permissions
        next();
    },
    beforeRouteUpdate(to, from, next) {
        // TOOD
        // check admin permissions
        next();
    },
    computed: {
        ...mapGetters(["adminInfo"]),
    },
    methods: {
        ...mapActions(["getAdminInfo"]),

        async checkAuthentication() {
            await this.getAdminInfo({ BaseUrl: this.getBaseUrl(), csrfToken: this.getCookie("XSRF-TOKEN"), AdminAuthToken: this.getCookie("AdminAuthToken") })
                .then((response) => {
                    this.loading = false;
                })
                .catch((e) => {
                    if (typeof window === "undefined") {
                        this.$router.push("/admin/login");
                    } else {
                        window.location.href = "/admin/login";
                    }
                });
        },
    },
};
</script>

<style></style>
