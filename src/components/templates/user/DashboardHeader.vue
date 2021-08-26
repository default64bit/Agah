<template>
    <div class="dashboard_header flex-wrap-reverse md:flex-nowrap h-auto md:h-16">
        <div class="header_info flex flex-wrap-reverse md:flex-nowrap items-end md:items-start gap-2">
            <div class="flex flex-wrap items-center gap-1">
                <div class="notifications">
                    <button class="icon_head notification_toggle relative hover:bg-gray-700 hover:text-bluegray-50 t_button" @click="notifToggleClick()">
                        <span class="bop bg-primary-400" v-if="newNotif"></span>
                        <i class="far fa-inbox text-lg"></i>
                        <span class="title_alt text-xs">Notifications</span>
                    </button>
                    <notification-list v-model:isOpen="isNotifListOpen" v-model:isThereNew="newNotif"></notification-list>
                </div>
            </div>
            <div class="profile" :class="{ open: isProfileOpen }" @click="toggleProfile(true)" @blur="profileBlur" tabindex="0">
                <div class="flex gap-2">
                    <span class="avatar">
                        <img :src="userInfo.avatar" alt="" />
                    </span>
                    <div class="text flex-col justify-center">
                        <h6 class="-mb-1 whitespace-normal">{{ `${userInfo.name} ${userInfo.family}` }}</h6>
                        <small class="text-xs text-gray-400">{{ userInfo.email }}</small>
                    </div>
                </div>
                <ul>
                    <router-link to="/account-settings/profile">
                        <li class="nav_item">
                            <i class="fad fa-user-cog"></i>
                            <span>Account Settings</span>
                        </li>
                    </router-link>
                    <router-link to="/panel-settings/language-and-region">
                        <li class="nav_item">
                            <i class="fad fa-cog"></i>
                            <span>Panel Settings</span>
                        </li>
                    </router-link>
                    <hr class="nav_spacer" />
                    <router-link to="/help-center">
                        <li class="nav_item">
                            <i class="fad fa-question-circle"></i>
                            <span>Help Center</span>
                        </li>
                    </router-link>
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
import { mapGetters } from "vuex";
import axios from "axios";

import NotificationList from "./NotificationList";
import Input from "../layouts/Input";

export default {
    name: "DashboardHeader",
    props: ["loading"],
    components: {
        "t-input": Input,
        "notification-list": NotificationList,
    },
    data() {
        return {
            search: "",

            adminFullName: "",
            adminEmail: "",
            isProfileOpen: false,

            isNotifListOpen: false,
            newNotif: false,
        };
    },
    serverPrefetch() {},
    created() {},
    mounted() {},
    computed: {
        ...mapGetters(["makeToast", "userInfo"]),
    },
    methods: {
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

        logout() {
            axios
                .post(`${this.getBaseUrl()}/api/v1/user/auth/logout`, null, {
                    headers: {
                        "csrf-token": this.getCookie("XSRF-TOKEN"),
                    },
                })
                .then((response) => {
                    this.$router.push("/login");
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
    },
};
</script>

<style></style>
