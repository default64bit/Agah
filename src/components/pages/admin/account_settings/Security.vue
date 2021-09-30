<template>
    <div class="flex flex-col w-max max-w-full">
        <h3 class="text-xl">تغییر رمزعبور</h3>
        <t-card class="" :loading="updatingPassword">
            <template v-slot:content>
                <div class="t_card_body flex flex-col items-center gap-6">
                    <t-input
                        type="password"
                        label="رمزعبور قدیمی"
                        v-model:value="oldPassword"
                        :error="oldPasswordError"
                        desc="رمزعبور که هم اکنون استفاده میکنید"
                    />
                    <div class="flex items-center gap-2">
                        <t-input class="" type="password" label="رمزعبور جدید" v-model:value="newPassword" :error="newPasswordError" />
                        <t-input type="password" label="تکرار رمزعبور جدید" v-model:value="newPasswordConfirmation" :error="newPasswordConfirmationError" />
                    </div>
                </div>
                <div class="t_card_footer">
                    <button
                        class="t_button t_button_min bg-secondary-300 hover:bg-secondary-200 text-bluegray-700 disabled:opacity-50"
                        :disabled="updatingPassword"
                        @click="resetPassword()"
                    >
                        <b v-if="!updatingPassword">تایید</b>
                        <b v-else class="fad fa-spinner fa-spin text-xl"></b>
                    </button>
                </div>
            </template>
        </t-card>

        <hr class="my-2" />

        <h3 class="text-xl">Login Device Sessions</h3>
        <t-card class="">
            <template v-slot:content>
                <div class="t_card_body flex flex-col items-center gap-6"></div>
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
                    `${this.getBaseUrl()}/api/v1/admin/change_password`,
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
