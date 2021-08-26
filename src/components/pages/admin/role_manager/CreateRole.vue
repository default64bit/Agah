<template>
    <div class="dashboard_body max-w-screen-xl mx-auto shadow-2xl">
        <div class="flex flex-wrap justify-between items-center gap-4">
            <h1 class="text-4xl"><b>Create New Role</b></h1>
        </div>
        <hr class="my-4 border-solid" />

        <div class="flex flex-col h-full overflow-auto gap-2 p-2">
            <t-input class="max-w-screen-sm" type="text" label="Role Name" desc="Role name must be unique" v-model:value="roleName" :error="roleNameError" />
            <hr class="my-4 border-solid" />
            <h3 class="text-xl">Permissions</h3>
            <small class="text-gray-400">Select permissions that you want this role to have</small>
            <div v-if="selectedPermissionsError" class="flex gap-1 items-center rounded bg-red-100 text-red-700 p-1 mt-1 text-xs">
                <i class="far fa-exclamation-circle"></i>
                <b>{{ selectedPermissionsError }}</b>
            </div>
            <ul class="mt-4">
                <li class="mb-4" v-for="(group, groupName) in permissions" :key="groupName">
                    <div class="flex items-center mb-2 gap-2 cursor-pointer select-none" @click="addPermission(group)">
                        <i class="text-primary-400" :class="checkPermission(group) ? 'fas fa-check-square' : 'far fa-square'"></i>
                        <b>{{ groupName.toUpperCase() }}</b>
                    </div>
                    <ul class="px-6">
                        <li class="mb-2" v-for="(item, i) in group" :key="i">
                            <div class="flex items-center gap-2 cursor-pointer select-none" @click="addPermission([item])">
                                <i class="text-primary-400" :class="checkPermission([item]) ? 'fas fa-check-square' : 'far fa-square'"></i>
                                <span class="text-sm opacity-50">{{ item.label }}</span>
                            </div>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>

        <hr class="my-4 mt-auto border-solid" />
        <div class="flex flex-wrap items-center gap-4">
            <button
                class="t_button t_button_min bg-primary-500 hover:bg-primary-600 text-bluegray-50 disabled:opacity-50"
                :disabled="creatingRole"
                @click="create()"
            >
                <b v-if="!creatingRole">Save Changes</b>
                <b v-else class="fad fa-spinner fa-spin text-xl"></b>
            </button>
            <router-link class="t_button t_button_min border-rose-400 hover:bg-rose-500" to="/admin/role_manager">Go Back</router-link>
        </div>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import axios from "axios";

import Input from "../../../templates/layouts/Input";

export default {
    name: "CreateRole",
    components: {
        "t-input": Input,
    },
    data() {
        return {
            creatingRole: false,

            selectedPermissions: [],
            selectedPermissionsError: "",
            roleName: "",
            roleNameError: "",

            permissions: {},
        };
    },
    created() {},
    async mounted() {
        await this.getPermissions();
    },
    methods: {
        ...mapActions(["makeToast"]),

        create() {
            if (this.creatingRole) return;
            this.creatingRole = true;

            this.roleNameError = this.selectedPermissionsError = "";

            axios
                .post(`${this.getBaseUrl()}/api/v1/admin/admin_roles`, {
                    roleName: this.roleName,
                    selectedPermissions: this.selectedPermissions,
                })
                .then((response) => {
                    this.makeToast({ title: "Create New Role", message: "New role has been created successfully", type: "success" });
                })
                .catch((error) => {
                    if (error.response.data) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                        if (error.response.data.field && typeof this[error.response.data.field + "Error"] !== "undefined") {
                            this[error.response.data.field + "Error"] = error.response.data.error;
                        }
                    }
                })
                .finally(() => {
                    this.creatingRole = false;
                });
        },

        addPermission(items) {
            let state = "";
            if (items.length > 1) state = this.checkPermission(items) ? "1" : "0";

            for (let i = 0; i < items.length; i++) {
                const index = this.selectedPermissions.indexOf(items[i]._id);
                if (index === -1) {
                    if (state == "1") continue;
                    this.selectedPermissions.push(items[i]._id);
                } else {
                    if (state == "0") continue;
                    this.selectedPermissions.splice(index, 1);
                }
            }
        },
        checkPermission(items) {
            let checked = true;
            for (let i = 0; i < items.length; i++) {
                if (this.selectedPermissions.indexOf(items[i]._id) === -1) {
                    checked = false;
                    break;
                }
            }
            return checked;
        },

        async getPermissions() {
            await axios
                .get(`${this.getBaseUrl()}/api/v1/admin/permissions?type=AdminOnly,All`)
                .then((response) => {
                    const records = response.data.records;
                    for (let i = 0; i < records.length; i++) {
                        if (!this.permissions.hasOwnProperty(records[i].group)) this.permissions[records[i].group] = [];
                        this.permissions[records[i].group].push({
                            _id: records[i]._id,
                            label: records[i].label,
                        });
                    }
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
