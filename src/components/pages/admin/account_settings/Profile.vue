<template>
    <div class="flex flex-col w-max max-w-full">
        <h3 class="text-xl">عکس پروفایل</h3>
        <t-card class="" :loading="uploadingAvatar">
            <template v-slot:content>
                <div class="t_card_body flex items-center gap-4">
                    <div class="w-24 h-24 rounded-full shadow-lg">
                        <img class="w-full h-full rounded-full" :src="adminInfo.avatar" alt="" />
                    </div>
                    <div class="flex flex-col gap-4">
                        <div class="flex gap-4">
                            <input class="hidden" type="file" accept=".jpg,.png,.gif" ref="avatarFile" @change="uploadAvatar()" />
                            <button class="t_button t_button_min text-white bg-gray-500 hover:bg-primary-400" @click="selectAvatar()">تغییر عکس</button>
                            <button
                                class="t_button t_button_min bg-gray-500 hover:bg-gray-600"
                                @click="deleteAvatar()"
                                v-if="!adminInfo.avatar.includes('admin.png')"
                            >
                                <i class="text-red-400 text-lg fas fa-trash-alt"></i>
                            </button>
                        </div>
                        <span class="text-sm">Must be JPEG, PNG, or GIF and cannot exceed 2MB.</span>
                    </div>
                </div>
            </template>
        </t-card>

        <hr class="my-2" />

        <h3 class="text-xl">اطلاعات عمومی</h3>
        <t-card class="" :loading="editingProfile">
            <template v-slot:content>
                <div class="t_card_body flex items-center gap-6">
                    <t-input class="" type="text" label="نام" v-model:value="firstName" :error="firstNameError" />
                    <t-input class="" type="text" label="نام خانوادگی" v-model:value="lastName" :error="lastNameError" />
                </div>
                <div class="t_card_footer">
                    <button
                        class="t_button t_button_min bg-primary-500 hover:bg-primary-600 text-bluegray-50 disabled:opacity-50"
                        :disabled="editingProfile"
                        @click="editProfile()"
                    >
                        <b v-if="!editingProfile">ثبت تغییرات</b>
                        <b v-else class="fad fa-spinner fa-spin text-xl"></b>
                    </button>
                </div>
            </template>
        </t-card>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import Input from "../../../templates/layouts/Input";
import Card from "../../../templates/layouts/Card";

export default {
    name: "Profile",
    components: {
        "t-input": Input,
        "t-card": Card,
    },
    data() {
        return {
            uploadingAvatar: false,
            editingProfile: false,

            firstName: "",
            lastName: "",

            firstNameError: "",
            lastNameError: "",
        };
    },
    created() {},
    mounted() {
        this.firstName = this.adminInfo.name;
        this.lastName = this.adminInfo.family;
    },
    computed: {
        ...mapGetters(["adminInfo"]),
    },
    methods: {
        ...mapActions(["updateAdminAvatar", "deleteAdminAvatar", "updateAdminInfo", "makeToast"]),

        selectAvatar() {
            this.$refs.avatarFile.click();
        },
        uploadAvatar() {
            if (this.uploadingAvatar) return;
            this.uploadingAvatar = true;

            const formData = new FormData();
            formData.append("avatar", this.$refs.avatarFile.files[0]);

            this.updateAdminAvatar({
                BaseUrl: this.getBaseUrl(),
                csrfToken: this.getCookie("XSRF-TOKEN"),
                data: formData,
            })
                .then(() => {
                    this.makeToast({
                        message: "Profile Picture Updated Successfully",
                        type: "success",
                    });
                })
                .catch((error) => {
                    if (error.response.data) {
                        if (error.response.data.field) {
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
                    this.uploadingAvatar = false;
                });
        },
        deleteAvatar() {
            if (this.uploadingAvatar) return;
            this.uploadingAvatar = true;
            this.deleteAdminAvatar({
                BaseUrl: this.getBaseUrl(),
                csrfToken: this.getCookie("XSRF-TOKEN"),
            })
                .then(() => {
                    this.makeToast({
                        message: "Profile Picture Deleted Successfully",
                        type: "success",
                    });
                })
                .catch(() => {})
                .finally(() => {
                    this.uploadingAvatar = false;
                });
        },

        editProfile() {
            if (this.editingProfile) return;
            this.editingProfile = true;

            this.firstNameError = this.lastNameError = "";

            this.updateAdminInfo({
                BaseUrl: this.getBaseUrl(),
                csrfToken: this.getCookie("XSRF-TOKEN"),
                data: {
                    firstName: this.firstName,
                    lastName: this.lastName,
                },
            })
                .then(() => {
                    this.makeToast({
                        message: "Profile Info Updated Successfully",
                        type: "info",
                    });
                })
                .catch((error) => {
                    if (error.response.data) {
                        if (error.response.data.field) {
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
                    this.editingProfile = false;
                });
        },
    },
};
</script>

<style></style>
