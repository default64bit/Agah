<template>
    <auth>
        <template v-slot:links>
            <span>Need an account?</span>
            <router-link to="/register" class="t_button t_button_min border-2 border-solid border-primary-400">Create Account</router-link>
        </template>
        <template v-slot:content>
            <div class="auth_box">
                <h1 class="">Login To Jasper</h1>

                <a class="t_button text-black bg-gray-50 hover:bg-gray-100 w-full" href="/api/v1/user/auth/google">
                    <img src="../../../assets/images/icons/google.svg" alt="" />
                    <span>Continue With Google</span>
                </a>

                <t-spacer class="my-5" text="OR" />

                <t-input class="mb-4" name="username" type="text" icon="fad fa-envelope" label="Email Address" v-model:value="username" />
                <t-input class="mb-4" name="password" type="password" icon="fad fa-lock-alt" label="Password" v-model:value="password" />
                <div class="w-full">
                    <router-link class="text-primary-500 text-sm" to="/forgot-password">Forgot Password?</router-link>
                </div>

                <div v-if="error" class="t_alert bg-red-100 text-red-700 text-sm">
                    <i class="far fa-exclamation-circle"></i>
                    <b>{{ error }}</b>
                </div>

                <button class="t_button mt-6 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 w-full" :disabled="submitingForm" @click="submit()">
                    <b v-if="!submitingForm">Login</b>
                    <b v-else class="fad fa-spinner fa-spin text-xl"></b>
                </button>
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
    name: "Login",
    components: {
        Auth,
        "t-spacer": Spacer,
        "t-input": Input,
    },
    data() {
        return {
            username: "",
            password: "",

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
                .post(`${this.getBaseUrl()}/api/v1/user/auth/login`, {
                    username: this.username,
                    password: this.password,
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
