<template>
    <div class="notification_list" :class="{ open: isOpen }" ref="notification_list" tabindex="0" @blur="close()">
        <div class="flex flex-wrap items-center justify-between gap-2 p-4">
            <h2 class="text-2xl">Notifications</h2>
            <router-link class="t_button p-1" to="/account-settings/notification"><i class="fad fa-cogs"></i></router-link>
        </div>
        <hr class="mt-auto border-solid" />
        <ul ref="notif_ul">
            <transition-group name="slideright" appear>
                <li v-for="(notif, i) in notifications" :key="i">
                    <div class="notif_icon" :class="{ 'border-primary-500': !notif.readAt }"><i :class="notif.data.icon"></i></div>
                    <a class="notif_info flex flex-col" :href="notif.data.link">
                        <b class="text-xl">{{ notif.data.title }}</b>
                        <p class="text-sm text-gray-200">{{ notif.data.message }}</p>
                        <div class="mt-2 text-xs text-gray-400">{{ new Date(notif.createdAt).toLocaleString("en") }}</div>
                    </a>
                    <span class="t_button p-1 text-primary-400 rounded-full hover:bg-gray-600" @click="clear(notif._id, i)">
                        <i class="far fa-times"></i>
                    </span>
                </li>
            </transition-group>
            <i class="fad fa-spinner fa-spin my-4 text-primary-400 text-2xl" v-if="loading"></i>
        </ul>
        <hr class="mt-auto border-solid" />
        <div class="flex items-center justify-center">
            <button class="mx-auto text-sm py-1 text-gray-300" @click="clear()">Clear All</button>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import axios from "axios";

export default {
    name: "NotificationList",
    props: ["isOpen", "isThereNew"],
    components: {},
    data() {
        return {
            loading: false,

            ended: false,
            notifications: [],
            page: 1,
        };
    },
    created() {},
    async mounted() {
        await this.loadNotifList();

        this.$refs.notif_ul.addEventListener("scroll", this.onScroll);
    },
    beforeUnmount() {
        this.$refs.notif_ul.removeEventListener("scroll", this.onScroll);
    },
    computed: {
        ...mapGetters(["makeToast", "userInfo"]),
    },
    watch: {
        isOpen(newValue) {
            if (newValue) {
                this.$refs.notification_list.focus();
            } else {
                if (this.isThereNew) {
                    axios.post(`${this.getBaseUrl()}/api/v1/user/notifications/read`).finally(() => {
                        this.$emit("update:isThereNew", false);
                    });
                }
            }
        },
    },
    methods: {
        async loadNotifList() {
            if (this.loading || this.ended) return;
            this.loading = true;

            await axios
                .get(`${this.getBaseUrl()}/api/v1/user/notifications?page=${this.page}`)
                .then((response) => {
                    if (response.data.length == 0) {
                        this.ended = true;
                        return;
                    }
                    this.notifications = this.notifications.concat(response.data);
                    this.page++;

                    for (const notif of response.data) {
                        if (!notif.readAt) {
                            this.$emit("update:isThereNew", true);
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

        close() {
            this.$emit("update:isOpen", false);
        },
        onScroll(e) {
            if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) {
                this.loadNotifList();
            }
        },

        clear(id = "", index = null) {
            axios
                .delete(`${this.getBaseUrl()}/api/v1/user/notifications?id=${id}`, null, {
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
