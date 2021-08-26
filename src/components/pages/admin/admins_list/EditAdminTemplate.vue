<template>
    <div class="dashboard_body max-w-screen-xl mx-auto shadow-2xl">
        <div class="flex gap-2 items-baseline">
            <router-link to="/admin"><i class="fad fa-home text-lg"></i></router-link>
            <i class="fas fa-chevron-right text-sm text-secondary-400"></i>
            <router-link to="/admin/admins_list">ادمین ها</router-link>
            <i class="fas fa-chevron-right text-sm text-secondary-400"></i>
            <h1 class="text-2xl"><b>اطلاعات ادمین</b></h1>
        </div>

        <ul class="t_tabs">
            <router-link :to="`/admin/admins_list/admin/${$route.params.id}`">
                <li>مشخصات کلی</li>
            </router-link>
            <router-link :to="`/admin/admins_list/admin/${$route.params.id}/schedules`">
                <li>زمانبندی های مشاوره</li>
            </router-link>
            <router-link :to="`/admin/admins_list/admin/${$route.params.id}/timeoff-schedules`">
                <li>زمان های مرخصی</li>
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
import { mapActions } from "vuex";

export default {
    name: "UpdateAdminTemplate",
    components: {},
    data() {
        return {};
    },
    created() {},
    async mounted() {},
    methods: {
        ...mapActions(["makeToast"]),
    },
};
</script>

<style></style>
