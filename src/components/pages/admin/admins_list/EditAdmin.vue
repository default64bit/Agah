<template>
    <div class="dashboard_body max-w-screen-xl mx-auto bg-truegray-800 shadow-2xl">
        <div class="flex flex-wrap justify-between items-center gap-4">
            <h1 class="text-white text-4xl"><b>Update Admin</b></h1>
        </div>
        <hr class="my-4 border-gray-600 border-solid" />

        <div class="flex flex-col h-full overflow-auto gap-2">
            <h3 class="text-xl">Profile Picture</h3>
            <t-card class="bg-truegray-700 max-w-screen-sm">
                <template v-slot:content>
                    <div class="t_card_body flex flex-col md:flex-row md:items-center gap-4">
                        <div class="w-24 h-24 rounded-full shadow-lg">
                            <img class="w-full h-full rounded-full object-contain" :src="avatarFile" alt="" />
                        </div>
                        <div class="flex flex-col gap-4">
                            <div class="flex gap-4">
                                <input class="hidden" type="file" accept=".jpg,.png,.gif" ref="avatarFile" @change="avatarFileChange()" />
                                <button class="t_button t_button_min bg-gray-500 hover:bg-violet-400" @click="selectAvatar()">Update Picture</button>
                                <button
                                    class="t_button t_button_min bg-gray-500 hover:bg-gray-600"
                                    @click="avatarFileDelete()"
                                    v-if="!avatarFile.includes('admin.png')"
                                >
                                    <i class="text-red-400 text-lg fas fa-trash-alt"></i>
                                </button>
                            </div>
                            <span class="text-sm text-gray-300">Must be JPEG, PNG, or GIF and cannot exceed 2MB.</span>
                        </div>
                    </div>
                </template>
            </t-card>

            <hr class="my-4 border-gray-600 border-solid" />

            <div class="flex flex-col gap-4">
                <t-input class="sideway max-w-screen-sm" type="text" label="First Name" :required="true" v-model:value="name" :error="nameError" />
                <t-input class="sideway max-w-screen-sm" type="text" label="Last Name" :required="true" v-model:value="family" :error="familyError" />
            </div>

            <hr class="my-4 border-gray-600 border-solid" />

            <t-input
                class="sideway max-w-screen-sm"
                type="email"
                label="Email Address"
                desc="email address must be unique"
                :required="true"
                v-model:value="email"
                :error="emailError"
            />

            <hr class="my-4 border-gray-600 border-solid" />

            <t-select
                class="sideway"
                inputClass="bg-gray-600 max-h-10 w-64"
                placeholder="Admin Status"
                label="Admin Status"
                desc="select or change the status of admin. disabled admins can't access adminPanel"
                :required="true"
                v-model:selectedOption="status"
                :options="statusOptions"
                :error="statusError"
            >
                <template v-slot:option="{ option }">
                    <option :value="option.value">{{ option.name }}</option>
                </template>
            </t-select>

            <hr class="my-4 border-gray-600 border-solid" />

            <t-select
                class="sideway"
                inputClass="bg-gray-600 max-h-10 w-64"
                placeholder="Role"
                label="Admin Role"
                desc="admin role determine the permissions of admin and what admin can do or see in adminPanel"
                :required="true"
                v-model:selectedOption="role"
                :options="roles"
                :error="roleError"
            >
                <template v-slot:option="{ option }">
                    <option :value="option.value">{{ option.name }}</option>
                </template>
            </t-select>

            <hr class="my-4 border-gray-600 border-solid" />

            <t-input
                class="sideway max-w-screen-sm"
                type="password"
                label="Password"
                placeholder="admin's login password"
                desc="must be atleast 8 characters with symbols and numbers"
                :required="true"
                v-model:value="password"
                :error="passwordError"
            />
        </div>

        <hr class="my-4 mt-auto border-gray-600 border-solid" />
        <div class="flex flex-wrap items-center gap-4">
            <button class="t_button t_button_min bg-violet-500 hover:bg-violet-600 disabled:opacity-50" :disabled="updatingAdmin" @click="update()">
                <b v-if="!updatingAdmin">Save Changes</b>
                <b v-else class="fad fa-spinner fa-spin text-xl"></b>
            </button>
            <router-link class="t_button t_button_min border-rose-400 hover:bg-rose-500" to="/admin/admins_list">Go Back</router-link>
        </div>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import axios from "axios";

import Input from "../../../templates/layouts/Input";
import Card from "../../../templates/layouts/Card";
import Select from "../../../templates/layouts/Select";

export default {
    name: "UpdateAdmin",
    components: {
        "t-input": Input,
        "t-card": Card,
        "t-select": Select,
    },
    data() {
        return {
            avatarFile: "http://localhost:3000/img/avatars/admin.png",
            updatingAdmin: false,

            name: "",
            family: "",
            email: "",
            status: { name: "Active", value: "active" },
            role: { name: "", value: "" },
            password: "",

            nameError: "",
            familyError: "",
            emailError: "",
            statusError: "",
            roleError: "",
            passwordError: "",

            roles: {},
            statusOptions: {
                active: { name: "Active", value: "active" },
                deactive: { name: "Deactive", value: "deactive" },
            },
        };
    },
    created() {},
    async mounted() {
        await this.getRoles();
        await this.getAdmin();
    },
    methods: {
        ...mapActions(["makeToast"]),

        update() {
            if (this.updatingAdmin) return;
            this.updatingAdmin = true;

            this.nameError = this.familyError = this.emailError = this.statusError = this.roleError = this.passwordError = "";

            const formData = new FormData();
            formData.append("id", this.$route.params.id);
            formData.append("avatar", this.$refs.avatarFile.files[0]);
            formData.append("avatarFile", this.avatarFile);
            formData.append("name", this.name);
            formData.append("family", this.family);
            formData.append("email", this.email);
            formData.append("status", this.status.value);
            formData.append("role", this.role.value);
            formData.append("password", this.password);

            axios
                .put(`${this.getBaseUrl()}/api/v1/admin/admins`, formData)
                .then((response) => {
                    this.makeToast({
                        title: "Update Admin",
                        message: "Admin has been updated successfully",
                        type: "info",
                    });
                })
                .catch((error) => {
                    if (error.response.data) {
                        if (error.response.data.field && typeof this[error.response.data.field + "Error"] !== "undefined") {
                            this[error.response.data.field + "Error"] = error.response.data.error;
                        } else {
                            this.makeToast({
                                message: error.response.data.error,
                                type: "danger",
                            });
                        }
                    }
                })
                .finally(() => {
                    this.updatingAdmin = false;
                });
        },

        selectAvatar() {
            this.$refs.avatarFile.click();
        },
        avatarFileChange() {
            this.avatarFile = this.$refs.avatarFile.files[0] ? URL.createObjectURL(this.$refs.avatarFile.files[0]) : "";
        },
        avatarFileDelete() {
            this.avatarFile = "http://localhost:3000/img/avatars/admin.png";
            this.$refs.avatarFile.files = [];
        },

        async getAdmin() {
            await axios
                .get(`${this.getBaseUrl()}/api/v1/admin/admins/${this.$route.params.id}`)
                .then((response) => {
                    this.avatarFile = response.data.image;
                    this.name = response.data.name;
                    this.family = response.data.family;
                    this.email = response.data.email;
                    this.status = this.statusOptions[response.data.status];
                    this.role = this.roles[response.data.role._id];
                })
                .catch((error) => {
                    if (error.response.data) {
                        if (error.response.data.field && typeof this[error.response.data.field + "Error"] !== "undefined") {
                            this[error.response.data.field + "Error"] = error.response.data.error;
                        } else {
                            this.makeToast({
                                message: error.response.data.error,
                                type: "danger",
                            });
                        }
                    }
                    if (error.response.status == 404) {
                        this.$router.push("/admin/admins_list");
                    }
                });
        },

        async getRoles() {
            await axios
                .get(`${this.getBaseUrl()}/api/v1/admin/admin_roles?pp=250`)
                .then((response) => {
                    for (let i = 0; i < response.data.records.length; i++) {
                        this.roles[response.data.records[i]._id] = {
                            name: response.data.records[i].name,
                            value: response.data.records[i]._id,
                        };
                    }
                })
                .catch((error) => {
                    if (error.response.data && error.response.data.error) {
                        this.makeToast({
                            message: error.response.data.error,
                            type: "danger",
                        });
                    }
                });
        },
    },
};
</script>

<style></style>
