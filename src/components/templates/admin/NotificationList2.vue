<template>
    <div>
        <button class="icon_head notification_toggle relative hover:bg-gray-700 hover:text-bluegray-50 t_button" @click="openNotifList()">
            <span class="bop bg-primary-400" v-if="isThereNew"></span>
            <i class="far fa-inbox text-lg"></i>
            <span class="title_alt text-xs">اعلانیه ها</span>
        </button>
        <t-dialog v-model:open="NotifListDialogState" title="اعلانیه ها">
            <template v-slot:body>
                <ul class="notification_list" ref="notif_ul">
                    <transition-group name="slideright" appear>
                        <li v-for="(notif, i) in notifications" :key="i">
                            <div class="notif_icon" :class="{ 'border-primary-500': !notif.readAt }"><i :class="notif.data.icon"></i></div>
                            <a class="notif_info flex flex-col" :href="notif.data.link">
                                <b class="text-xl">{{ notif.data.title }}</b>
                                <p class="text-sm">{{ notif.data.message }}</p>
                                <div class="mt-2 text-xs opacity-50">{{ new Date(notif.createdAt).toLocaleString("en") }}</div>
                            </a>
                            <span class="t_button p-1 text-primary-400 rounded-full hover:bg-gray-600" @click="clear(notif._id, i)">
                                <i class="far fa-trash"></i>
                            </span>
                        </li>
                    </transition-group>
                    <div class="w-72" v-if="!notifications.length">
                        <img src="../../../assets/images/no_notification.png" alt="" />
                    </div>
                    <i class="fad fa-spinner fa-spin my-4 text-primary-400 text-2xl" v-if="loading"></i>
                </ul>
                <hr class="my-4 border-solid" />
                <div class="flex items-center justify-between flex-wrap gap-2">
                    <button class="t_button text-xs p-1" @click="clear()">حذف همه</button>
                    <router-link class="t_button p-1" to="/admin/account_settings/notification"><i class="fad fa-cog"></i></router-link>
                </div>
            </template>
        </t-dialog>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import axios from "axios";

import Dialog from "../layouts/Dialog";

export default {
    name: "NotificationList",
    components: {
        "t-dialog": Dialog,
    },
    data() {
        return {
            loading: false,

            notifications: [],
            isThereNew: false,
            ended: false,
            page: 1,

            NotifListDialogState: false,
        };
    },
    created() {},
    async mounted() {
        await this.loadNotifList(true);

        this.$refs.notif_ul.addEventListener("scroll", this.onScroll);
    },
    beforeUnmount() {
        this.$refs.notif_ul.removeEventListener("scroll", this.onScroll);
    },
    computed: {
        ...mapGetters(["makeToast", "adminInfo"]),
    },
    methods: {
        openNotifList() {
            this.NotifListDialogState = true;
            this.loadNotifList(true);

            if (this.isThereNew) {
                axios.post(`${this.getBaseUrl()}/api/v1/admin/notifications/read`).finally(() => (this.isThereNew = false));
            }
        },

        async loadNotifList(reload = false) {
            if (this.loading || this.ended) return;
            this.loading = true;

            if (reload) {
                this.notifications = [];
                this.ended = false;
                this.page = 1;
            }

            await axios
                .get(`${this.getBaseUrl()}/api/v1/admin/notifications?page=${this.page}`)
                .then((response) => {
                    if (response.data.length == 0) {
                        this.ended = true;
                        return;
                    }
                    this.notifications = this.notifications.concat(response.data);
                    this.page++;

                    for (const notif of response.data) {
                        if (!notif.readAt) {
                            this.isThereNew = true;
                            break;
                        }
                    }
                })
                .catch((error) => {
                    if (error.response.data && error.response.data.error) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                    }
                })
                .finally(() => {
                    this.loading = false;
                });
        },

        onScroll(e) {
            if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) {
                this.loadNotifList();
            }
        },

        clear(id = "", index = null) {
            axios
                .delete(`${this.getBaseUrl()}/api/v1/admin/notifications?id=${id}`, null, {
                    headers: {
                        "csrf-token": this.getCookie("XSRF-TOKEN"),
                    },
                })
                .then((response) => {
                    if (id == "") {
                        this.notifications = [];
                        return;
                    }
                    this.notifications.splice(index, 1);
                })
                .catch((error) => {
                    if (error.response.data && error.response.data.error) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                    }
                });
        },
    },
};
</script>

<style></style>
