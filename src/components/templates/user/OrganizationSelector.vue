<template>
    <div class="select_org">
        <div class="flex items-center gap-2">
            <button class="t_button t_button_min gap-2 bg-gray-700" @click="openOrganizationsList()">
                <i class="fal fa-city"></i>
                <b class="text-gray-400 text-sm" v-if="!selectedOrganization.name">Select Organization</b>
                <span class="text-sm" v-else>{{ selectedOrganization.name }}</span>
                <i class="far fa-sort-down text-violet-400 -mt-1"></i>
            </button>
            <small class="bg-bluegray-700 text-cyan-100 p-1 rounded text-xs">{{ userRole }}</small>
        </div>

        <t-dialog v-model:open="OrganizationSelectorDialogState" title="Select An Organization">
            <template v-slot:body>
                <div class="flex flex-col">
                    <t-card class="bg-truegray-700 overflow-auto" :loading="loadingOrganizations" style="max-height:80vh">
                        <template v-slot:content>
                            <div class="t_card_body flex flex-col items-center gap-3 p-2">
                                <ul class="flex flex-col gap-2" v-if="organizations.length">
                                    <li
                                        class="flex items-center justify-between gap-10 p-3 rounded bg-gray-600 hover:bg-warmgray-800 cursor-pointer"
                                        :class="{ 'opacity-50': org.licence.status != 'active' }"
                                        v-for="(org, i) in organizations"
                                        :key="i"
                                        @click="select(org, org.licence.status == 'active')"
                                    >
                                        <b class="text-xl text-indigo-100">{{ org.name }}</b>
                                        <span class="text-gray-300 text-sm">{{ org.businessType }}</span>
                                    </li>
                                </ul>
                                <div class="flex items-center flex-col gap-2" v-else>
                                    <span class="text-rose-300">No Organization To Select</span>
                                </div>
                            </div>
                        </template>
                    </t-card>
                </div>
                <hr class="border-warmgray-700 border-solid my-4" />
                <div class="flex gap-2">
                    <router-link
                        class="t_button t_button_min bg-violet-500 hover:bg-violet-600"
                        to="/organizations/new"
                        @click="OrganizationSelectorDialogState = false"
                    >
                        Create New Organization
                    </router-link>
                    <button class="t_button t_button_min border-gray-400 hover:bg-gray-500" @click="OrganizationSelectorDialogState = false">Cancel</button>
                </div>
            </template>
        </t-dialog>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import axios from "axios";
import cookies from "js-cookie";

import Select from "../layouts/Select";
import Dialog from "../layouts/Dialog";
import Card from "../layouts/Card";

export default {
    name: "OrganizationSelector",
    props: [],
    components: {
        "t-select": Select,
        "t-dialog": Dialog,
        "t-card": Card,
    },
    data() {
        return {
            loadingOrganizations: false,
            organizations: [],

            OrganizationSelectorDialogState: false,
        };
    },
    serverPrefetch() {},
    created() {},
    async mounted() {
        await this.loadOrganizations();

        let _SO = cookies.get("_S.O");
        if (_SO) {
            for (let i = 0; i < this.organizations.length; i++) {
                const org = this.organizations[i];
                if (org._id == _SO && org.licence.status == "active") {
                    await this.select(org, true);
                    break;
                }
            }
        }
        if (!this.selectedOrganization.id) {
            for (let i = 0; i < this.organizations.length; i++) {
                const org = this.organizations[i];
                if (org.licence.status == "active") {
                    await this.select(org, true);
                    break;
                }
            }
        }
    },
    computed: {
        ...mapGetters(["makeToast", "userInfo", "selectedOrganization", "userRole"]),
    },
    methods: {
        ...mapActions(["selectOrganization"]),

        openOrganizationsList() {
            this.OrganizationSelectorDialogState = true;
            this.loadOrganizations();
        },

        async loadOrganizations() {
            this.loadingOrganizations = true;

            await axios
                .get(`${this.getBaseUrl()}/api/v1/user/selectable_organizations`)
                .then((response) => {
                    this.organizations = response.data;
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
                    this.loadingOrganizations = false;
                });
        },

        async select(organization, canSelect = false) {
            if (!canSelect) {
                this.makeToast({
                    title: "Licence Expired",
                    message: "Organization licence has expired, please renew the licence to continue",
                    type: "warning",
                });
                return;
            }

            // set new org
            this.loadingOrganizations = true;
            await this.selectOrganization({
                BaseUrl: this.getBaseUrl(),
                Org: { id: organization._id, name: organization.name, costUnit: organization.costUnit },
            });
            this.loadingOrganizations = false;

            // set organization in cookie
            cookies.set("_S.O", organization._id);

            this.OrganizationSelectorDialogState = false;
        },
    },
};
</script>

<style></style>
