<template>
    <div class="invitations">
        <button class="icon_head invitations_toggle relative hover:bg-gray-700 t_button" @click="openInviteList()">
            <span class="bop bg-violet-400" v-if="invites.length"></span>
            <i class="far fa-envelope-open-text text-lg"></i>
            <span class="title_alt text-xs">Invitations</span>
        </button>

        <t-dialog v-model:open="InvitesListDialogState" title="Invitations Requests">
            <template v-slot:body>
                <ul ref="invite_list" class="flex flex-col gap-4 overflow-auto" style="max-height:80vh;">
                    <transition-group name="slideright" appear>
                        <li class="flex flex-wrap items-center gap-4 bg-truegray-700 p-4 rounded shadow" v-for="(invite, i) in invites" :key="i">
                            <div class="flex items-start gap-2">
                                <img class="w-12 rounded-full shadow" :src="invite.sender.image" alt="" />
                                <div class="flex flex-col">
                                    <div>
                                        <b class="text-lg">{{ `${invite.sender.name} ${invite.sender.family}` }}</b>
                                        <i class="text-gray-400 text-sm"> ({{ invite.senderRole }}) </i>
                                    </div>
                                    <div>
                                        <span>Invites you to join </span>
                                        <b class="text-indigo-200"> {{ invite.organization.name }} </b>
                                        <span> as </span>
                                        <b class="text-indigo-200"> {{ invite.receiverRole.name }} </b>
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <button class="t_button t_button_min bg-violet-500 hover:bg-violet-600" @click="accept(invite, i)">Accept</button>
                                <button class="t_button t_button_min border-solid border-gray-500 hover:bg-gray-600" @click="reject(invite, i)">Reject</button>
                            </div>
                        </li>
                    </transition-group>
                    <li class="flex flex-col gap-4 justify-center items-center p-8" v-if="!invites.length">
                        <div class="w-32">
                            <img src="../../../assets/images/icons/invitation.svg" alt="" />
                        </div>
                        <span class="text-violet-300 text-xl">No Invitation Request!</span>
                    </li>
                    <div class="flex items-center justify-center" v-if="loadingInvites">
                        <i class="fad fa-spinner fa-spin my-4 text-violet-400 text-2xl"></i>
                    </div>
                </ul>
            </template>
        </t-dialog>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import axios from "axios";

import Dialog from "../layouts/Dialog";

export default {
    name: "OrganizationSelector",
    props: [],
    components: {
        "t-dialog": Dialog,
    },
    data() {
        return {
            loadingInvites: false,
            invitesEnded: false,
            invitesPageNumber: 1,

            invites: [],

            InvitesListDialogState: false,
        };
    },
    serverPrefetch() {},
    created() {},
    async mounted() {
        this.loadInvites();

        this.$refs.invite_list.addEventListener("scroll", this.onInviteListScroll);
    },
    beforeUnmount() {
        this.$refs.invite_list.removeEventListener("scroll", this.onInviteListScroll);
    },
    computed: {
        ...mapGetters(["makeToast","userInfo"]),
    },
    methods: {
        openInviteList() {
            this.InvitesListDialogState = true;
            this.loadInvites();
        },

        async loadInvites() {
            if (this.loadingInvites || this.invitesEnded) return;
            this.loadingInvites = true;

            await axios
                .get(`${this.getBaseUrl()}/api/v1/user/invites?page=${this.invitesPageNumber}`)
                .then((response) => {
                    if (response.data.length == 0) {
                        this.invitesEnded = true;
                        return;
                    }

                    this.invites = this.invites.concat(response.data);

                    this.invitesPageNumber++;
                })
                .catch((error) => {
                    if (error.response.data && error.response.data.error) {
                        this.makeToast({
                            message: error.response.data.error,
                            type: "danger",
                        });
                    }
                })
                .finally(() => {
                    this.loadingInvites = false;
                });
        },

        async accept(invite, index) {
            this.invites.splice(index, 1);
            await axios
                .post(`${this.getBaseUrl()}/api/v1/user/invite/accept`, { id: invite._id })
                .then((response) => {})
                .catch((error) => {
                    if (error.response.data && error.response.data.error) {
                        this.makeToast({
                            message: error.response.data.error,
                            type: "danger",
                        });
                    }
                    this.invites.push(invite);
                });
        },
        async reject(invite, index) {
            this.invites.splice(index, 1);
            await axios
                .post(`${this.getBaseUrl()}/api/v1/user/invite/reject`, { id: invite._id })
                .then((response) => {})
                .catch((error) => {
                    if (error.response.data && error.response.data.error) {
                        this.makeToast({
                            message: error.response.data.error,
                            type: "danger",
                        });
                    }
                    this.invites.push(invite);
                });
        },

        onInviteListScroll(e) {
            if (e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 5) {
                this.loadInvites();
            }
        },
    },
};
</script>

<style></style>
