<template>
    <div class="header_wrapper">
        <header class="flex items-center justify-between md:justify-start gap-8">
            <router-link class="logo" to="/">
                <img src="../../../assets/images/logo.png" alt="گروه آگه" />
                <span class="text-2xl">گروه آگه</span>
            </router-link>

            <button class="nav_toggle md:hidden" @click="open = !open">
                <span class="far fa-bars text-2xl" :class="open ? 'fa-times' : 'fa-bars'"></span>
            </button>

            <transition name="slidedown" mode="out-in" appear="">
                <div class="menu flex items-start flex-col-reverse md:items-center md:flex-row md:justify-between gap-8" v-show="open">
                    <nav>
                        <ul class="flex items-start flex-col md:flex-row md:items-center gap-6">
                            <li>
                                <router-link class="text-lg" to="/consultation-time-booking" @click="open = false">مشاوره حقوقی</router-link>
                            </li>
                            <li>
                                <router-link class="text-lg" to="/frequently-asked-legal-questions" @click="open = false">سوالات پرتکرار حقوقی</router-link>
                            </li>
                            <li>
                                <router-link class="text-lg" to="/blog" @click="open = false">وبلاگ</router-link>
                            </li>
                        </ul>
                    </nav>
                    <nav class="flex items-center justify-between flex-row-reverse md:flex-row gap-6 md:gap-4 w-full md:w-auto">
                        <button class="theme_toggle text-xs" @click="changeTheme()">
                            <span class="fad" :class="currentTheme == 'default_light' ? 'fa-moon' : 'fa-sun-haze'"></span>
                        </button>
                        <button class="btn" v-if="!isUserLoggedIn" @click="loginDialogState = true">ورود / ثبت‌نام</button>
                        <router-link
                            to="/user/chats"
                            class="avatar flex items-center gap-2 p-2 py-1 rounded-full border border-solid border-primary-400 border-opacity-40"
                            v-else
                        >
                            <img class="h-8 w-8 rounded-full" :src="userInfo.avatar" alt="" />
                            <span>{{ `${userInfo.name} ${userInfo.family}` }}</span>
                            <i class="fal fa-caret-circle-right opacity-60"></i>
                        </router-link>
                    </nav>
                </div>
            </transition>
        </header>

        <t-dialog v-model:open="loginDialogState" v-if="!isUserLoggedIn">
            <template v-slot:body>
                <login></login>
            </template>
        </t-dialog>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

import Dialog from "../layouts/Dialog";
import Login from "./Login";

export default {
    name: "Header",
    components: {
        "t-dialog": Dialog,
        login: Login,
    },
    data() {
        return {
            open: false,
            loginDialogState: false,

            currentTheme: "",
        };
    },
    serverPrefetch() {},
    created() {},
    mounted() {
        this.currentTheme = localStorage.getItem("userTheme") ? localStorage.getItem("userTheme") : "default_light";
    },
    computed: {
        ...mapGetters(["userInfo", "isUserLoggedIn"]),
    },
    methods: {
        changeTheme() {
            let newTheme = this.currentTheme == "default_dark" ? "default_light" : "default_dark";
            window.document.querySelector("body").setAttribute("theme", newTheme);
            localStorage.setItem("userTheme", newTheme);
            this.currentTheme = window.document.querySelector("body").getAttribute("theme");
        },
    },
};
</script>

<style></style>
