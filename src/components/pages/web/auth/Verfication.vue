<template>
    <auth>
        <template v-slot:content>
            <div class="auth_box">
                <h1 class="">Forgot Password</h1>

                <span class="mb-6">
                    <div class="mb-3">
                        Enter the email address you used when you joined and we’ll send you instructions to reset your password.
                    </div>
                    <div class="text-xs">
                        <i class="fad fa-exclamation-circle text-yellow-200"></i>
                        For security reasons, we do NOT store your password. So rest assured that we will never send your password via email.
                    </div>
                </span>

                <t-input class="mb-4" name="username" type="text" icon="fad fa-envelope" label="Email Address" v-model:value="email" />

                <div v-if="error" class="t_alert bg-red-100 text-red-700 text-sm">
                    <i class="far fa-exclamation-circle"></i>
                    <b>{{ error }}</b>
                </div>

                <button class="t_button mt-6 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 w-full" :disabled="submitingForm" @click="submit()">
                    <b v-if="!submitingForm">Send Recovery Email</b>
                    <b v-else class="fad fa-spinner fa-spin text-xl"></b>
                </button>

                <router-link class="text-primary-600 text-sm mt-4" to="/login">Back To Login</router-link>
            </div>
        </template>
    </auth>
</template>

<script>
import axios from "axios";
import cookies from "js-cookie";

import Auth from "../../templates/web/Auth";
import Spacer from "../../templates/layouts/Spacer";
import Input from "../../templates/layouts/Input";

export default {
    name: "Verfication",
    components: {
        Auth,
        "t-spacer": Spacer,
        "t-input": Input,
    },
    data() {
        return {
            email: "",

            error: "",
            submitingForm: false,
        };
    },
    created() {},
    mounted() {
        this.checkErrorCookie();
    },
    methods: {
        submit() {
            if (this.submitingForm) return;

            this.submitingForm = true;
            axios
                .post(`${this.getBaseUrl()}/api/v1/user/auth/forgot-password`, {
                    email: this.email,
                })
                .then((response) => {
                    this.$router.push("/");
                })
                .catch((error) => {
                    this.error = error.response.data.error;
                })
                .finally(() => {
                    this.checkErrorCookie();
                    this.submitingForm = false;
                });
        },
        checkErrorCookie() {
            if (cookies.get("UserAuthError")) {
                this.error = "";
                this.error = cookies.get("UserAuthError");
            }
        },
    },
};
</script>

<style></style>
