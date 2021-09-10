<template>
    <div class="flex flex-col h-full overflow-auto">
        <div class="flex flex-col h-full overflow-auto gap-2 p-2">
            <h3 class="text-xl">عکس پروفایل</h3>
            <t-card class="max-w-screen-sm">
                <template v-slot:content>
                    <div class="t_card_body flex flex-wrap items-center gap-4">
                        <div class="w-24 h-24 rounded-full shadow-lg">
                            <img class="w-full h-full rounded-full object-cover" :src="avatarFile" alt="" />
                        </div>
                        <div class="flex flex-col gap-4">
                            <div class="flex gap-4">
                                <input class="hidden" type="file" accept=".jpg,.png,.gif" ref="avatarFile" @change="avatarFileChange()" />
                                <button class="t_button t_button_min text-white bg-gray-500 hover:bg-primary-400" @click="selectAvatar()">تغغیر عکس</button>
                                <button
                                    class="t_button t_button_min bg-gray-500 hover:bg-gray-600"
                                    @click="avatarFileDelete()"
                                    v-if="!avatarFile.includes('admin.png')"
                                >
                                    <i class="text-red-400 text-lg fas fa-trash-alt"></i>
                                </button>
                            </div>
                            <span class="text-sm">Must be JPEG, PNG, or GIF and cannot exceed 2MB.</span>
                        </div>
                    </div>
                </template>
            </t-card>

            <hr class="my-4 border-solid" />

            <div class="flex flex-col gap-4">
                <t-input class="max-w-screen-sm" type="text" label="نام" :required="true" v-model:value="name" :error="nameError" />
                <t-input class="max-w-screen-sm" type="text" label="نام خانوادگی" :required="true" v-model:value="family" :error="familyError" />
            </div>

            <hr class="my-4 border-solid" />

            <div class="flex flex-col gap-4">
                <t-input class="max-w-screen-sm" type="email" label="آدرس ایمیل" :required="true" v-model:value="email" :error="emailError" />
                <t-input class="max-w-screen-sm" type="textarea" label="درباره من" :required="true" v-model:value="desc" :error="descError" />
            </div>

            <hr class="my-4 border-solid" />

            <t-select
                class="max-w-screen-xs"
                placeholder="Admin Status"
                label="وضعیت ادمین"
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

            <hr class="my-4 border-solid" />

            <t-select
                class="max-w-screen-xs"
                placeholder="Role"
                label="نقش ادمین"
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

            <hr class="my-4 border-solid" />

            <t-input
                class="max-w-screen-sm"
                type="password"
                label="رمزعبور"
                placeholder="admin's login password"
                desc="must be atleast 8 characters with symbols and numbers"
                :required="true"
                v-model:value="password"
                :error="passwordError"
            />

            <hr class="my-4 border-solid" />

            <t-complex title="شبکه های اجتماعی" v-model:items="socialMedias" :error="socialMediasError">
                <template v-slot:item="{ item, i }">
                    <t-select class="max-w-screen-xs" label="شبکه اجتماعی" v-model:selectedOption="item.name" :options="socialMediaOptions">
                        <template v-slot:option="{ option }">
                            <span :value="option.value"> <i :class="option.icon"></i> {{ option.name }} </span>
                        </template>
                    </t-select>
                    <t-input class="max-w-screen-xs" type="text" :name="`social_${i}_value`" label="لینک" v-model:value="item.value" />
                </template>
            </t-complex>
        </div>

        <hr class="my-4 mt-auto border-solid" />
        <div class="flex flex-wrap items-center gap-4">
            <button
                class="t_button t_button_min bg-primary-500 hover:bg-primary-600 text-bluegray-50 disabled:opacity-50"
                :disabled="updatingAdmin"
                @click="update()"
            >
                <b v-if="!updatingAdmin">ثبت تغییرات</b>
                <b v-else class="fad fa-spinner fa-spin text-xl"></b>
            </button>
            <router-link class="t_button t_button_min border-rose-400 hover:bg-rose-500" to="/admin/admins_list">بازگشت</router-link>
        </div>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import axios from "axios";

import Input from "../../../templates/layouts/Input";
import Card from "../../../templates/layouts/Card";
import Select from "../../../templates/layouts/Select";
import Complex from "../../../templates/layouts/Complex";

export default {
    name: "UpdateAdmin",
    components: {
        "t-input": Input,
        "t-card": Card,
        "t-select": Select,
        "t-complex": Complex,
    },
    data() {
        return {
            avatarFile: "http://localhost:3000/img/avatars/admin.png",
            updatingAdmin: false,

            name: "",
            family: "",
            email: "",
            desc: "",
            status: { name: "Active", value: "active" },
            role: { name: "", value: "" },
            password: "",
            socialMedias: [],

            nameError: "",
            familyError: "",
            emailError: "",
            descError: "",
            statusError: "",
            roleError: "",
            passwordError: "",
            socialMediasError: "",

            roles: {},
            statusOptions: {
                active: { name: "Active", value: "active" },
                deactive: { name: "Deactive", value: "deactive" },
            },
            socialMediaOptions: {
                facebook: { name: "facebook", icon: "fab fa-facebook", value: "facebook" },
                instagram: { name: "instagram", icon: "fab fa-instagram", value: "instagram" },
                twitter: { name: "twitter", icon: "fab fa-twitter", value: "twitter" },
                telegram: { name: "telegram", icon: "fab fa-telegram", value: "telegram" },
                skype: { name: "skype", icon: "fab fa-skype", value: "skype" },
                linkedin: { name: "linkedin", icon: "fab fa-linkedin", value: "linkedin" },
                youtube: { name: "youtube", icon: "fab fa-youtube", value: "youtube" },
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
            formData.append("desc", this.desc);
            formData.append("status", this.status.value);
            formData.append("role", this.role.value);
            formData.append("password", this.password);
            if (this.socialMedias) formData.append("socialMedias", JSON.stringify(this.socialMedias));

            axios
                .put(`${this.getBaseUrl()}/api/v1/admin/admins`, formData)
                .then((response) => {
                    this.makeToast({ title: "Update Admin", message: "Admin has been updated successfully", type: "info" });
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
                    this.desc = response.data.desc;
                    this.status = this.statusOptions[response.data.status];
                    this.role = this.roles[response.data.role._id];
                    if (response.data.socialMedias) {
                        response.data.socialMedias.forEach((socialMedia) => {
                            this.socialMedias.push({
                                name: this.socialMediaOptions[socialMedia.name],
                                value: socialMedia.link,
                            });
                        });
                    }
                })
                .catch((error) => {
                    if (error.response.data) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                        if (error.response.data.field && typeof this[error.response.data.field + "Error"] !== "undefined") {
                            this[error.response.data.field + "Error"] = error.response.data.error;
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
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                    }
                });
        },
    },
};
</script>

<style></style>
