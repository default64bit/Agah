<template>
    <div class="flex flex-col w-max max-w-full">
        <h3 class="text-xl">Reset Password</h3>
        <t-card class="" :loading="updatingPassword">
            <template v-slot:content>
                <div class="t_card_body flex flex-col items-center gap-6">
                    <t-input
                        class="sideway"
                        type="password"
                        label="Old Password"
                        v-model:value="oldPassword"
                        :error="oldPasswordError"
                        desc="Your current password that you want to change"
                    />
                    <t-input class="sideway" type="password" label="New Password" v-model:value="newPassword" :error="newPasswordError" />
                    <t-input
                        class="sideway"
                        type="password"
                        label="New Password Confirmation"
                        v-model:value="newPasswordConfirmation"
                        :error="newPasswordConfirmationError"
                    />
                </div>
                <div class="t_card_footer">
                    <button
                        class="t_button t_button_min bg-primary-500 hover:bg-primary-600 text-bluegray-50 disabled:opacity-50"
                        :disabled="updatingPassword"
                        @click="resetPassword()"
                    >
                        <b v-if="!updatingPassword">Confirm</b>
                        <b v-else class="fad fa-spinner fa-spin text-xl"></b>
                    </button>
                </div>
            </template>
        </t-card>

        <hr class="my-2" />

        <h3 class="text-xl">Device Login Sessions</h3>
        <t-card class="">
            <template v-slot:content>
                <div class="t_card_body flex flex-col items-center gap-6">
                    Coming soon...
                </div>
            </template>
        </t-card>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import axios from "axios";

import Input from "../../../templates/layouts/Input";
import Card from "../../../templates/layouts/Card";

export default {
    name: "Security",
    components: {
        "t-input": Input,
        "t-card": Card,
    },
    data() {
        return {
            updatingPassword: false,

            oldPassword: "",
            newPassword: "",
            newPasswordConfirmation: "",

            oldPasswordError: "",
            newPasswordError: "",
            newPasswordConfirmationError: "",
        };
    },
    created() {},
    mounted() {},
    methods: {
        ...mapActions(["makeToast"]),

        resetPassword() {
            if (this.updatingPassword) return;
            this.updatingPassword = true;

            this.oldPasswordError = this.newPasswordError = this.newPasswordConfirmationError = "";

            axios
                .post(
                    `${this.getBaseUrl()}/api/v1/user/change_password`,
                    {
                        oldPassword: this.oldPassword,
                        newPassword: this.newPassword,
                        newPasswordConfirmation: this.newPasswordConfirmation,
                    },
                    {
                        headers: {
                            "csrf-token": this.getCookie("XSRF-TOKEN"),
                            "content-type": "application/json",
                        },
                    }
                )
                .then((response) => {
                    this.makeToast({ message: "Your Password Updated Successfully", type: "success" });
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
                    this.updatingPassword = false;
                });
        },
    },
};
</script>

<style></style>
