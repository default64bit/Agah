<template>
    <div class="flex flex-col w-full h-full max-w-full">
        <div class="flex items-center justify-center h-full" v-if="!user_id">
            <small class="opacity-50">برای مشاهده اطلاعات یک کاربر را انتخاب کنید</small>
        </div>
        <div class="flex flex-col h-full" v-else>
            <div class="flex flex-col h-full overflow-auto gap-2 p-2">
                <h3 class="text-xl">عکس پروفایل</h3>
                <t-card class="max-w-screen-sm">
                    <template v-slot:content>
                        <div class="t_card_body flex flex-col md:flex-row md:items-center gap-4">
                            <div class="w-24 h-24 rounded-full shadow-lg">
                                <img class="w-full h-full rounded-full object-contain" :src="avatarFile" alt="" />
                            </div>
                            <div class="flex flex-col gap-4">
                                <div class="flex gap-4">
                                    <input class="hidden" type="file" accept=".jpg,.png,.gif" ref="avatarFile" @change="avatarFileChange()" />
                                    <button class="t_button t_button_min text-white bg-gray-500 hover:bg-primary-400" @click="selectAvatar()">
                                        تغییر عکس
                                    </button>
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

                <div class="flex flex-col md:flex-row max-w-screen-sm gap-4">
                    <t-input class="" type="text" label="نام" :required="true" v-model:value="name" :error="nameError" />
                    <t-input class="" type="text" label="نام خانوادگی" :required="true" v-model:value="family" :error="familyError" />
                </div>

                <hr class="my-4 border-solid" />

                <div class="flex items-start flex-col md:flex-row md:items-end max-w-screen-sm gap-4">
                    <t-input class="max-w-screen-xs" type="email" label="آدرس ایمیل" :required="true" v-model:value="email" :error="emailError" />
                    <t-checkbox name="emailVerfication" v-model:value="emailVerified">
                        <template v-slot:desc><span> وضعیت تایید ایمیل </span> </template>
                    </t-checkbox>
                </div>

                <hr class="my-4 border-solid" />

                <div class="flex items-start flex-col md:flex-row md:items-end max-w-screen-sm gap-4">
                    <t-input class="max-w-screen-xs" type="email" label="شماره موبایل" :required="true" v-model:value="mobile" :error="mobileError" />
                    <t-checkbox name="emailVerfication" v-model:value="mobileVerified">
                        <template v-slot:desc><span> وضعیت تایید موبایل </span> </template>
                    </t-checkbox>
                </div>

                <hr class="my-4 border-solid" />

                <t-select
                    class="max-w-screen-2xs"
                    inputClass="max-h-10 w-64"
                    placeholder="Admin Status"
                    label="وضعیت کاربر"
                    desc="تغییر وضعیت کاربر. کاربران غیرفعال نمیتوانند وارد حساب خود شوند"
                    v-model:selectedOption="status"
                    :options="statusOptions"
                    :error="statusError"
                >
                    <template v-slot:option="{ option }">
                        <option :value="option.value">{{ option.name }}</option>
                    </template>
                </t-select>

                <hr class="my-4 border-solid" />

                <t-input
                    class="max-w-screen-xs"
                    type="password"
                    label="رمزعبور"
                    placeholder="رمزعبور کاربر"
                    desc="برای تغییر رمزعبور کاربر"
                    v-model:value="password"
                    :error="passwordError"
                />
            </div>
            <hr class="my-4 mt-auto border-solid" />
            <div class="flex flex-wrap items-center gap-4">
                <button
                    class="t_button t_button_min bg-primary-500 hover:bg-primary-600 text-bluegray-50 disabled:opacity-50"
                    :disabled="updatingUser"
                    @click="update()"
                >
                    <b v-if="!updatingUser">ثبت تغییرات</b>
                    <b v-else class="fad fa-spinner fa-spin text-xl"></b>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import axios from "axios";

import Input from "../../../templates/layouts/Input";
import Checkbox from "../../../templates/layouts/Checkbox";
import Card from "../../../templates/layouts/Card";
import Select from "../../../templates/layouts/Select";

export default {
    name: "UserInfo",
    components: {
        "t-input": Input,
        "t-checkbox": Checkbox,
        "t-card": Card,
        "t-select": Select,
    },
    data() {
        return {
            loading: false,
            updatingUser: false,
            user_id: "",

            avatarFile: "http://localhost:3000/img/avatars/admin.png",
            name: "",
            family: "",
            email: "",
            emailVerified: false,
            mobile: "",
            mobileVerified: false,
            status: { name: "Active", value: "active" },
            password: "",

            nameError: "",
            familyError: "",
            emailError: "",
            mobileError: "",
            statusError: "",
            passwordError: "",

            statusOptions: {
                active: { name: "Active", value: "active" },
                deactive: { name: "Deactive", value: "deactive" },
            },
        };
    },
    created() {},
    async mounted() {
        if (this.$route.params.id) this.user_id = this.$route.params.id;
        await this.getUserInfo();
    },
    async beforeRouteUpdate(to, from, next) {
        this.user_id = this.$route.params.id = to.params.id;
        await this.getUserInfo();
        next();
    },
    methods: {
        ...mapActions(["makeToast"]),

        update() {
            if (this.updatingUser) return;
            this.updatingUser = true;

            this.nameError = this.familyError = this.emailError = this.mobileError = this.statusError = this.passwordError = "";

            const formData = new FormData();
            formData.append("id", this.$route.params.id);
            formData.append("avatar", this.$refs.avatarFile.files[0]);
            formData.append("avatarFile", this.avatarFile);
            formData.append("name", this.name);
            formData.append("family", this.family);
            formData.append("email", this.email);
            formData.append("emailVerified", this.emailVerified);
            formData.append("mobile", this.mobile);
            formData.append("mobileVerified", this.mobileVerified);
            formData.append("status", this.status.value);
            if (this.password) formData.append("password", this.password);

            axios
                .put(`${this.getBaseUrl()}/api/v1/admin/user/${this.$route.params.id}`, formData)
                .then((response) => {
                    this.makeToast({ title: "Update User", message: "User has been updated successfully", type: "info" });
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
                    this.updatingUser = false;
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

        async getUserInfo() {
            if (!this.user_id) return;

            if (this.loading) return;
            this.loading = true;

            await axios
                .get(`${this.getBaseUrl()}/api/v1/admin/user/${this.user_id}/info`)
                .then((response) => {
                    this.avatarFile = response.data.image;
                    this.name = response.data.name;
                    this.family = response.data.family;
                    this.email = response.data.email;
                    this.emailVerified = !!response.data.emailVerifiedAt;
                    this.mobile = response.data.mobile;
                    this.mobileVerified = !!response.data.mobileVerifiedAt;
                    this.status = this.statusOptions[response.data.status];
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
    },
};
</script>

<style></style>
