<template>
    <div class="dashboard_body max-w-screen-xl mx-auto shadow-2xl">
        <h1 class="text-4xl">
            <b>Panel Settings</b>
        </h1>
        <ul class="t_tabs">
            <router-link to="/panel-settings/language-and-region">
                <li>Language & region</li>
            </router-link>
            <router-link to="/panel-settings/theme">
                <li>Theme</li>
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
    name: "PanelSettings",
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
