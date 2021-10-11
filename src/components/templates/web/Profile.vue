<template>
    <section class="flex flex-wrap items-start justify-center gap-8 my-4 mx-auto" v-if="!loading">
        <div class="flex flex-col justify-center items-center gap-6 p-4 py-6 base_shadow w-full lg:w-max md:max-w-xs lg:sticky lg:top-24">
            <header class="flex flex-wrap justify-between items-center gap-3 w-full cursor-pointer" @click="menuOpen = !menuOpen">
                <div class="flex flex-wrap items-center gap-3">
                    <img class="w-10 h-10 rounded-full object-cover" :src="userInfo.avatar" alt="" />
                    <div class="flex flex-col">
                        <strong>{{ `${userInfo.name} ${userInfo.family}` }}</strong>
                        <small class="opacity-60" v-show="menuOpen">{{ userInfo.email }}</small>
                    </div>
                </div>
                <span class="far fa-caret-down text-2xl" :class="menuOpen ? 'fa-caret-down' : 'fa-caret-left'"></span>
            </header>
            <hr class="w-10/12 border-solid border-gray-500 border-opacity-30" />
            <transition name="slidedown" mode="out-in" appear="">
                <ul class="profile_menu flex flex-col gap-2 w-full" v-show="menuOpen">
                    <li class="p-2 rounded-sm" :class="{ active: $route.name == 'booked-schedules' }">
                        <router-link to="/profile/booked-schedules" class="flex items-center gap-1 w-full">
                            <i class="far fa-clipboard"></i>
                            مشاوره های خریداری شده
                        </router-link>
                    </li>
                    <li class="p-2 rounded-sm" :class="{ active: $route.name == 'chats' }">
                        <router-link to="/profile/chat" class="flex items-center gap-1 w-full">
                            <i class="far fa-comments"></i>
                            تماس و پیام ها
                            <small
                                class="mr-auto p-1 px-2 rounded-sm bg-gray-700 text-primary-100 text-xs"
                                style="padding-bottom:2px"
                                v-show="userNewMessageCount > 0"
                            >
                                {{ userNewMessageCount }}
                            </small>
                        </router-link>
                    </li>
                    <li class="p-2 rounded-sm" :class="{ active: $route.name == 'notifications' }">
                        <router-link to="/profile/notifications" class="flex items-center gap-1 w-full">
                            <i class="far fa-bell"></i>
                            اعلانیه ها
                            <small
                                class="mr-auto p-1 px-2 rounded-sm bg-gray-700 text-primary-100 text-xs"
                                style="padding-bottom:2px"
                                v-show="userNewNotifCount > 0"
                            >
                                {{ userNewNotifCount }}
                            </small>
                        </router-link>
                    </li>
                    <hr class="w-10/12 border-solid border-gray-500 border-opacity-30 my-4 mx-auto" />
                    <li class="p-2 rounded-sm">
                        <button @click="logout()" class="flex items-center gap-1 w-full">
                            <i class="far fa-sign-out"></i>
                            خروج
                        </button>
                    </li>
                </ul>
            </transition>
        </div>
        <div class="max-w-4xl flex-grow">
            <router-view v-slot="{ Component }">
                <transition name="slideright" mode="out-in" appear="">
                    <component :is="Component" />
                </transition>
            </router-view>
        </div>
    </section>
    <section class="flex flex-wrap items-start justify-center gap-8 my-4 mx-auto" v-else>
        <div class="flex items-center justify-center py-48">
            <i class="fal fa-spinner fa-pulse text-primary-500 pt-2 text-8xl"></i>
        </div>
    </section>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import axios from "axios";

export default {
    name: "Profile",
    data() {
        return {
            loading: true,
            menuOpen: true,
        };
    },
    async mounted() {
        await this.getUserInfo({ BaseUrl: this.getBaseUrl() })
            .then((response) => (this.loading = false))
            .catch((e) => this.$router.push("/"));

        // TODO
        // get user's unread message count and notif count
    },
    computed: {
        ...mapGetters(["userInfo", "isUserLoggedIn", "userNewMessageCount", "userNewNotifCount"]),
    },
    methods: {
        ...mapActions(["getUserInfo"]),

        logout() {
            axios.post(`${this.getBaseUrl()}/api/v1/web/auth/logout`).then((response) => {
                // this.$router.push("/");
                window.location.reload();
            });
        },
    },
};
</script>

<style></style>
