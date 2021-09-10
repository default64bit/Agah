<template>
    <div class="flex items-center justify-center flex-col gap-2 px-4 pb-4">
        <span class="heading w-max mb-4">
            <h5 class="f-nazanin font-bold text-4xl">ورود | ثبت‌نام</h5>
            <small class="f-copgoth text-xs">Login Or Register</small>
        </span>

        <p class="max-w-xs text-sm mb-4">
            برای استفاده از امکان رزرو وقت مشاوره و دریافت مشاوره به صورت آنلاین، ابتدا باید ثبت نام کنید یا وارد حساب کاربری خود شوید
        </p>

        <a class="t_button text-black bg-white hover:bg-gray-50 w-full" href="/api/v1/user/auth/google">
            <img src="../../../assets/images/icons/google.svg" alt="" />
            <span>ورود با حساب Google</span>
        </a>

        <t-spacer class="my-2 opacity-50" text="OR" />

        <t-input class="mb-4" name="username" type="text" label="پست الکترونیک خود را وارد کنید" v-model:value="username" />

        <div v-if="error" class="t_alert bg-red-100 text-red-700 text-sm">
            <i class="far fa-exclamation-circle"></i>
            <b>{{ error }}</b>
        </div>

        <button class="btn bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 w-full" :disabled="submitingLoginForm" @click="login()">
            <b v-if="!submitingLoginForm">ادامه</b>
            <b v-else class="fad fa-spinner fa-spin text-xl"></b>
        </button>
    </div>
</template>

<script>
import axios from "axios";
import cookies from "js-cookie";

import Spacer from "../../templates/layouts/Spacer";
import Input from "../../templates/layouts/Input";

export default {
    name: "Login",
    components: {
        "t-spacer": Spacer,
        "t-input": Input,
    },
    data() {
        return {
            username: "",

            error: "",
            submitingLoginForm: false,
        };
    },
    created() {},
    mounted() {
        this.checkErrorCookie();
    },
    methods: {
        login() {
            if (this.submitingLoginForm) return;
            this.submitingLoginForm = true;

            this.error = "";

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
                    this.submitingLoginForm = false;
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
