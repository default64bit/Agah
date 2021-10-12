<template>
    <div class="flex flex-col items-center md:items-start gap-2 w-full">
        <span class="heading mb-4 w-max">
            <h4 class="f-nazanin font-bold text-3xl">اعلانیه ها</h4>
            <small class="f-copgoth text-xs">Notifications</small>
        </span>

        <ul class="flex flex-col gap-6 w-full" v-if="loadingNotifications">
            <li class="flex flex-col gap-4 p-4 rounded-sm w-full base_shadow" v-for="(notif, i) in notificationsSkeleton" :key="i">
                <div class="flex items-center gap-2">
                    <div class="skeleton w-10 h-10 rounded-full"></div>
                    <div class="skeleton w-4/12 h-4"></div>
                </div>
                <div class="skeleton w-full h-2 rounded-full"></div>
                <div class="skeleton w-7/12 h-2 rounded-full"></div>
            </li>
        </ul>
        <ul class="flex flex-col gap-6 w-full" v-else>
            <li class="flex gap-4 p-4 rounded-sm w-full base_shadow relative" v-for="(notif, i) in notifications" :key="i">
                <i class="flex w-4 h-4 rounded-full bg-primary-500 opacity-60 absolute -right-2 top-0" v-if="!notif.readAt"></i>
                <a :href="notif.data.link" class="flex flex-col gap-2 flex-grow" v-if="!!notif.data">
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="flex justify-center items-center rounded-full shadow w-10 h-10 p-2" v-if="!!notif.data.icon">
                                <i :class="notif.data.icon"></i>
                            </span>
                            <h5 class="font-bold" v-if="!!notif.data.title">{{ notif.data.title }}</h5>
                        </div>
                        <small class="opacity-75">{{ notif.createdAt }}</small>
                    </div>
                    <p class="text-sm opacity-90">{{ notif.data.message }}</p>
                </a>
                <div class="flex flex-wrap items-start gap-4">
                    <button class="btn text-sm p-2" @click="deleteNotification(i, notif)"><i class="far fa-trash-alt"></i></button>
                </div>
            </li>
        </ul>
        <div class="flex items-center justify-center mt-4 w-full">
            <small class="opacity-60" v-if="notifications.length == 0">اعلانیه ای وجود ندارد</small>
            <small class="opacity-60" v-else-if="page >= pageTotal">انتهای لیست</small>
            <button class="btn reverse w-max py-1" @click="loadMore()" v-else>اعلانیه های قدیمی تر</button>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "Notifications",
    components: {},
    data() {
        return {
            loadingNotifications: false,
            notificationsSkeleton: ["", "", "", "", "", ""],
            notifications: [],
            page: 1,
            total: 0,
            pageTotal: 1,
        };
    },
    async mounted() {
        // get the notifications for this user and show them from newest to last
        await this.getNotifications();

        // sned a read request
        setTimeout(() => this.readNotifications(), 5000);
    },
    computed: {},
    methods: {
        async getNotifications() {
            if (this.loadingNotifications) return;
            this.loadingNotifications = true;

            let params = [`page=${this.page}`];
            params = params.join("&");

            await axios
                .get(`${this.getBaseUrl()}/api/v1/web/notifications?${params}`)
                .then((response) => {
                    this.notifications = [...this.notifications, ...response.data.records];
                    this.total = response.data.total;
                    this.pageTotal = response.data.pageTotal;
                })
                .catch((error) => {
                    if (error.response.data && error.response.data.error) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                    }
                })
                .finally(() => (this.loadingNotifications = false));
        },

        loadMore() {
            if (this.page < this.pageTotal) {
                this.page = parseInt(this.page) + 1;
                this.getNotifications();
            }
        },

        async readNotifications() {
            await axios.post(`${this.getBaseUrl()}/api/v1/web/notifications/read`).then((response) => {});
        },

        async deleteNotification(index, notif) {
            await axios.delete(`${this.getBaseUrl()}/api/v1/web/notification/${notif._id}`).then((response) => {
                this.notifications.splice(index, 1);
            });
        },
    },
};
</script>

<style></style>
