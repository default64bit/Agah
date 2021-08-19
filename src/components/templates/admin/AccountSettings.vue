<template>
    <div class="dashboard_body max-w-screen-xl mx-auto bg-truegray-800 shadow-2xl">
        <h1 class="text-white text-4xl">
            <b>Account Settings</b>
        </h1>
        <ul class="t_tabs">
            <router-link to="/admin/account_settings/profile">
                <li>Profile</li>
            </router-link>
            <router-link to="/admin/account_settings/security">
                <li>Security And Privacy</li>
            </router-link>
            <router-link to="/admin/account_settings/notification">
                <li>Notification</li>
            </router-link>
        </ul>
        <div class="flex flex-col w-full h-full overflow-auto">
            <router-view v-slot="{ Component }">
                <transition name="fade" mode="out-in" appear="">
                    <component :is="Component" />
                </transition>
            </router-view>
        </div>
    </div>
</template>

<script>
// import { mapGetters } from "vuex";

export default {
    name: "Dashboard",
    components: {},
    data() {
        return {
            loading: true,
        };
    },
    serverPrefetch() {},
    created() {},
    mounted() {},
    computed: {
        // ...mapGetters(["adminInfo"]),
    },
    methods: {},
};
</script>

<style></style>
