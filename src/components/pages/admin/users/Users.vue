<template>
    <div class="dashboard_body bg-transparent">
        <div class="flex flex-wrap lg:flex-nowrap justify-between h-full gap-7 relative">
            <div class="dashboard_body max-w-screen-2sm shadow-md">
                <t-input type="search" icon="fad fa-search" placeholder="جستجو..." v-model:value="search" @keydown="searchUsers($event)" />
                <hr class="my-4 border-solid" />
                <ul ref="users_ul" name="users_ul">
                    <transition-group name="slideright" appear>
                        <li
                            class="flex items-center flex-wrap gap-2 py-3 px-1 cursor-pointer hover:shadow-lg rounded"
                            v-for="(user, i) in users"
                            :key="i"
                            @click="selecteUser(user)"
                        >
                            <div class="w-12 h-12 rounded-full shadow-md">
                                <img class="w-12 h-12 rounded-full" :src="user.image" alt="" />
                            </div>
                            <div class="chat_info flex flex-col">
                                <b class="flex-grow text-lg overflow-hidden">{{ `${user.name} ${user.family}` }}</b>
                                <small class="text-xs text-gray-400">{{ user.email }}</small>
                            </div>
                        </li>
                    </transition-group>
                </ul>
            </div>
            <div class="dashboard_body min-h-screen md:min-h-full shadow-md flex-grow absolute lg:relative lg:flex" :class="{ hidden: !viewInfo }">
                <button class="t_button p-1 mb-4 w-max text-rose-500 opacity-60 lg:hidden" @click="viewInfo = false"><i class="fas fa-times"></i></button>
                <div class="flex items-center justify-between flex-wrap gap-4 mb-4" v-if="selected_user.name">
                    <div class="flex items-center flex-wrap gap-2">
                        <div class="w-14 h-14 rounded-full shadow-md">
                            <img class="w-14 h-14 rounded-full" :src="selected_user.image" alt="" />
                        </div>
                        <div class="chat_info flex flex-col">
                            <b class="flex-grow text-xl overflow-hidden">{{ `${selected_user.name} ${selected_user.family}` }}</b>
                            <small class="text-xs text-gray-400">{{ selected_user.email }}</small>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <call-controller>
                            <template v-slot:callBtn="{ call }">
                                <button class="t_button text-white bg-emerald-400 hover:bg-emerald-500" @click="call">
                                    <i class="fas fa-phone-alt"></i>
                                </button>
                            </template>
                        </call-controller>
                    </div>
                </div>
                <ul class="t_tabs flex-shrink-0 mt-0">
                    <router-link :to="`/admin/users/info/${selected_user._id}`" v-if="checkPermissions(['admin.users.view'], adminInfo.permissions)">
                        <li>مشخصات</li>
                    </router-link>
                    <router-link :to="`/admin/users/chat/${selected_user._id}`" v-if="checkPermissions(['admin.users.chat'], adminInfo.permissions)">
                        <li>پیام ها</li>
                    </router-link>
                    <router-link :to="`/admin/users/schedules/${selected_user._id}`">
                        <li>مشاوره ها</li>
                    </router-link>
                    <router-link :to="`/admin/users/transactions/${selected_user._id}`">
                        <li>تراکنش ها</li>
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
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import axios from "axios";

import Input from "../../../templates/layouts/Input";
import CallController from "../../../templates/layouts/CallController";

export default {
    name: "Users",
    components: {
        "t-input": Input,
        "call-controller": CallController,
    },
    data() {
        return {
            viewInfo: false,
            loading: true,

            search: "",
            users: [],
            usersEnded: false,
            loadingUser: false,
            userPageNumber: 1,

            selected_user: { _id: "", image: "", name: "", family: "", email: "" },
        };
    },
    serverPrefetch() {},
    created() {},
    async mounted() {
        if (this.$route.params.id) {
            this.selected_user._id = this.$route.params.id;
            // request and get user to fill up this.selected_user
            axios.get(`${this.getBaseUrl()}/api/v1/admin/user/${this.selected_user._id}/info`).then((response) => {
                this.selected_user = response.data;
                this.viewInfo = true;
            });
        }

        await this.loadUsers();
        this.$refs.users_ul.addEventListener("scroll", this.onUsersListScroll);
    },
    beforeUnmount() {
        this.$refs.users_ul.removeEventListener("scroll", this.onUsersListScroll);
    },
    computed: {
        ...mapGetters(["adminInfo"]),
    },
    methods: {
        ...mapActions(["makeToast"]),

        selecteUser(user) {
            this.selected_user = user;
            this.viewInfo = true;
            if (this.$route.path.split("/")[3]) {
                this.$router.replace(`/admin/users/${this.$route.path.split("/")[3]}/${user._id}`);
            } else this.$router.replace(`/admin/users/info/${user._id}`);
        },

        async loadUsers(reload = false) {
            if (this.loadingUser) return;
            this.loadingUser = true;

            if (reload) {
                this.users = [];
                this.usersEnded = false;
                this.userPageNumber = 1;
            }

            await axios
                .get(`${this.getBaseUrl()}/api/v1/admin/users?page=${this.userPageNumber}&search=${this.search}`)
                .then((response) => {
                    if (response.data.records.length == 0) {
                        this.usersEnded = true;
                        return;
                    }
                    this.users = this.users.concat(response.data.records);
                    this.userPageNumber++;
                })
                .catch((error) => {
                    if (error.response.data && error.response.data.error) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                    }
                })
                .finally(() => {
                    this.loadingUser = false;
                });
        },
        searchUsers(e) {
            if (e.keyCode == 13) this.loadUsers(true);
        },
        onUsersListScroll(e) {
            if (e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight - 10) {
                this.loadUsers();
            }
        },
    },
};
</script>

<style></style>
