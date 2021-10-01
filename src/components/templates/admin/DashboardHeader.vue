<template>
    <div class="dashboard_header h-auto md:max-h-20 flex-shrink-0">
        <header class="flex items-center">
            <div class="flex justify-between items-center gap-2">
                <button class="sidemenu_toggle t_button hover:bg-gray-700 hover:text-bluegray-50" @click="toggleSidemneu()">
                    <i class="fas" :class="sideMenuOpen ? 'fa-align-right' : 'fa-ellipsis-v'"></i>
                </button>
                <div class="flex items-center justify-start gap-1 w-full">
                    <img src="../../../assets/images/settings.png" alt="" />
                    <h2 class="text-2xl">
                        <b class="text-primary-400">A</b>
                        <b class="">gah</b>
                    </h2>
                </div>
            </div>
        </header>
        <div class="flex flex-wrap-reverse md:flex-nowrap items-end md:items-start gap-2">
            <div class="flex flex-wrap items-center gap-1">
                <div class="messages">
                    <button class="icon_head messages_toggle relative hover:bg-gray-700 hover:text-bluegray-50 t_button" @click="msgToggleClick()">
                        <span class="bop bg-primary-400" v-if="newMsg"></span>
                        <i class="far fa-comments-alt text-lg"></i>
                        <span class="title_alt text-xs">پیام ها</span>
                    </button>
                    <message-board v-model:isOpen="isMsgBoardOpen" v-model:isThereNew="newMsg"></message-board>
                </div>
                <div class="notifications">
                    <!-- <button class="notification_toggle relative hover:bg-gray-700 hover:text-bluegray-50 t_button" @click="notifToggleClick()">
                        <span class="bop bg-primary-400" v-if="newNotif"></span>
                        <i class="far fa-inbox text-lg"></i>
                    </button>
                    <notification-list v-model:isOpen="isNotifListOpen" v-model:isThereNew="newNotif"></notification-list> -->
                    <notification-list></notification-list>
                </div>
            </div>
            <div class="profile" :class="{ open: isProfileOpen }" @click="toggleProfile(true)" @blur="profileBlur" tabindex="0">
                <div class="flex items-center gap-2">
                    <span class="avatar">
                        <img class="object-cover" :src="adminInfo.avatar" alt="" />
                    </span>
                    <div class="text flex-col justify-center">
                        <h6 class="-mb-1 whitespace-normal">{{ `${adminInfo.name} ${adminInfo.family}` }}</h6>
                        <small class="text-xs text-gray-400 hidden md:inline-block">{{ adminInfo.email }}</small>
                    </div>
                </div>
                <ul>
                    <router-link to="/admin/account_settings/profile">
                        <li class="nav_item">
                            <i class="fad fa-user-cog"></i>
                            <span>Account Settings</span>
                        </li>
                    </router-link>
                    <hr class="nav_spacer" />
                    <a href="/" title="Back To Website">
                        <li class="nav_item">
                            <i class="fad fa-desktop-alt"></i>
                            <span>Back To Website</span>
                        </li>
                    </a>
                    <li class="nav_item" @click="logout()">
                        <i class="fad fa-sign-out text-red-500"></i>
                        <span class="text-red-400">Log Out</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import axios from "axios";

import NotificationList from "./NotificationList2";
import MessageBoard from "./MessageBoard";
import Input from "../layouts/Input";

export default {
    name: "DashboardHeader",
    props: ["loading"],
    components: {
        "t-input": Input,
        "notification-list": NotificationList,
        "message-board": MessageBoard,
    },
    data() {
        return {
            search: "",

            adminFullName: "",
            adminEmail: "",
            isProfileOpen: false,

            isNotifListOpen: false,
            newNotif: false,

            isMsgBoardOpen: false,
            newMsg: false,
        };
    },
    serverPrefetch() {},
    created() {},
    mounted() {},
    computed: {
        ...mapGetters(["makeToast", "adminInfo", "sideMenuOpen"]),
    },
    methods: {
        ...mapActions(["changeSideMenuOpen"]),

        toggleProfile(state) {
            this.isProfileOpen = state;
        },
        profileBlur(event) {
            if (!event.currentTarget.contains(event.relatedTarget)) {
                this.toggleProfile(false);
            } else {
                event.currentTarget.focus();
            }
        },

        toggleSidemneu() {
            this.changeSideMenuOpen(!this.sideMenuOpen);
            localStorage.setItem("sideMenuOpen", this.sideMenuOpen);
        },

        logout() {
            axios
                .post(`${this.getBaseUrl()}/api/v1/admin/auth/logout`, null, {
                    headers: {
                        "csrf-token": this.getCookie("XSRF-TOKEN"),
                    },
                })
                .then((response) => {
                    this.$router.push("/admin/login");
                })
                .catch((error) => {
                    if (error.response.data && error.response.data.error) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                    }
                });
        },

        notifToggleClick() {
            this.isNotifListOpen = !this.isNotifListOpen;
        },
        msgToggleClick() {
            this.isMsgBoardOpen = !this.isMsgBoardOpen;
        },
    },
};
</script>

<style></style>
