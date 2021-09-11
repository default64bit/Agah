<template>
    <div class="flex flex-col items-center justify-center">
        <span class="heading w-max mb-4">
            <h5 class="f-nazanin font-bold text-4xl">ورود | ثبت‌نام</h5>
            <small class="f-copgoth text-xs">Login Or Register</small>
        </span>
        <transition name="slideright" mode="out-in">
            <div ref="stage1" key="stage1" v-if="page == 'stage1'" class="flex items-center justify-center flex-col gap-2 px-4 pb-4">
                <p class="max-w-xs text-sm my-4">
                    برای استفاده از امکان رزرو وقت مشاوره و دریافت مشاوره به صورت آنلاین، ابتدا باید ثبت نام کنید یا وارد حساب کاربری خود شوید
                </p>
                <a class="t_button text-black bg-white hover:bg-gray-50 w-full" href="/api/v1/web/auth/google">
                    <img src="../../../assets/images/icons/google.svg" alt="" />
                    <span>ورود با حساب Google</span>
                </a>
                <t-spacer class="my-2 opacity-50" text="OR" />
                <t-input class="mb-4" name="username" type="text" label="پست الکترونیک خود را وارد کنید" v-model:value="username" :error="usernameError" />
                <button class="btn bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 w-full" :disabled="submitingLoginForm" @click="login()">
                    <b class="font-normal text-xl" v-if="!submitingLoginForm">ادامه</b>
                    <b v-else class="fad fa-spinner fa-spin text-xl"></b>
                </button>
            </div>
            <div ref="stage2" key="stage2" v-else-if="page == 'stage2'" class="flex items-center justify-center flex-col gap-2 px-4 pb-4">
                <p class="max-w-xs text-sm my-4">کد ارسال شده برای ایمیل '{{ username }}' را وارد کنید</p>
                <div ref="code" class="flex flex-row-reverse items-center gap-1 my-4">
                    <input
                        class="w-10 h-10 p-2 text-center text-3xl bg-transparent border-b-2 border-solid border-gold-500"
                        type="number"
                        v-for="(input, i) in codeInputs"
                        :key="i"
                        :ref="`code_${i}`"
                        @keydown="codeKeydown($event, i)"
                        @input="codeInput($event, i)"
                        @focus="codeFocus($event, i)"
                    />
                </div>
                <div v-if="codeError" class="flex gap-1 items-center rounded bg-red-100 text-red-700 p-1 mb-1 text-xs">
                    <i class="far fa-exclamation-circle"></i> <b>{{ codeError }}</b>
                </div>
                <div class="flex justify-between items-center gap-4 w-full my-4">
                    <button class="text-sm text-primary-600 opacity-75 hover:underline">ارسال دوباره کد</button>
                    <button class="text-sm text-primary-600 opacity-75 hover:underline" @click="page = 'stage1'">ورود با ایمیل دیگر</button>
                </div>
                <button
                    class="btn bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 w-full"
                    :disabled="submitingVerficationForm"
                    @click="verify()"
                >
                    <b class="font-normal text-xl" v-if="!submitingVerficationForm">ادامه</b>
                    <b v-else class="fad fa-spinner fa-spin text-xl"></b>
                </button>
            </div>
            <div ref="stage3" key="stage3" v-else-if="page == 'stage3'" class="flex items-center justify-center flex-col gap-2 px-4 pb-4">
                <p class="max-w-xs text-sm my-4">اطلاعات حساب کاربری خود را تکمیل کنید</p>

                <div class="flex items-center gap-2">
                    <t-input class="mb-4" name="username" type="text" label="نام" v-model:value="name" :error="nameError" />
                    <t-input class="mb-4" name="username" type="text" label="نام خانوادگی" v-model:value="family" :error="familyError" />
                </div>
                <t-input
                    class="mb-4"
                    name="username"
                    type="text"
                    label="شماره موبایل"
                    placeholder="0912 325 9078"
                    maskPattern="{09}00 000 0000"
                    v-model:value="mobile"
                    :error="mobileError"
                />

                <button
                    class="btn bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 w-full"
                    :disabled="submitingRegisterForm"
                    @click="register()"
                >
                    <b class="font-normal text-xl" v-if="!submitingRegisterForm">تایید</b>
                    <b v-else class="fad fa-spinner fa-spin text-xl"></b>
                </button>
            </div>
        </transition>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import axios from "axios";

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
            page: "stage1",

            username: "",
            codeInputs: ["", "", "", "", "", ""],
            name: "",
            family: "",
            mobile: "",

            usernameError: "",
            codeError: "",
            nameError: "",
            familyError: "",
            mobileError: "",

            submitingLoginForm: false,
            submitingVerficationForm: false,
            submitingRegisterForm: false,
        };
    },
    created() {},
    mounted() {},
    methods: {
        ...mapActions(["makeToast"]),

        login() {
            if (this.submitingLoginForm) return;
            this.submitingLoginForm = true;

            this.usernameError = this.codeError = this.nameError = this.familyError = this.mobileError = "";

            axios
                .post(`${this.getBaseUrl()}/api/v1/web/auth/login`, {
                    username: this.username,
                })
                .then((response) => {
                    this.page = "stage2";
                })
                .catch((error) => {
                    if (error.response.data) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                        if (error.response.data.field && typeof this[error.response.data.field + "Error"] !== "undefined") {
                            this[error.response.data.field + "Error"] = error.response.data.error;
                        }
                    }
                })
                .finally(() => (this.submitingLoginForm = false));
        },
        verify() {
            if (this.submitingVerficationForm) return;
            this.submitingVerficationForm = true;

            this.usernameError = this.codeError = this.nameError = this.familyError = this.mobileError = "";

            let code = "";
            this.codeInputs.forEach((item, index) => (code += this.$refs[`code_${index}`].value));

            axios
                .post(`${this.getBaseUrl()}/api/v1/web/auth/verfication`, {
                    username: this.username,
                    code: code,
                })
                .then((response) => {
                    // TODO
                    // check response to ether refresh page or go to stage3
                    this.page = "stage3";
                })
                .catch((error) => {
                    if (error.response.data) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                        if (error.response.data.field && typeof this[error.response.data.field + "Error"] !== "undefined") {
                            this[error.response.data.field + "Error"] = error.response.data.error;
                        }
                    }
                })
                .finally(() => (this.submitingVerficationForm = false));
        },
        register(){
            if (this.submitingRegisterForm) return;
            this.submitingRegisterForm = true;

            this.usernameError = this.codeError = this.nameError = this.familyError = this.mobileError = "";

            let code = "";
            this.codeInputs.forEach((item, index) => (code += this.$refs[`code_${index}`].value));

            axios
                .post(`${this.getBaseUrl()}/api/v1/web/auth/verfication`, {
                    username: this.username,
                    code: code,
                    name: this.name,
                    family: this.family,
                    mobile: this.mobile,
                })
                .then((response) => {
                    // reload page
                    window.location.reload();
                })
                .catch((error) => {
                    if (error.response.data) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                        if (error.response.data.field && typeof this[error.response.data.field + "Error"] !== "undefined") {
                            this[error.response.data.field + "Error"] = error.response.data.error;
                        }
                    }
                })
                .finally(() => (this.submitingRegisterForm = false));
        },

        codeKeydown(event, index) {
            if (event.keyCode === 8 && event.target.value === "") this.$refs[`code_${Math.max(0, index - 1)}`].focus();
        },
        codeInput(event, index) {
            const [first, ...rest] = event.target.value;
            event.target.value = first ? first : "";
            if (parseInt(index) !== this.codeInputs.length - 1 && first !== undefined) {
                if (!this.$refs[`code_${parseInt(index) + 1}`]) return;
                this.$refs[`code_${parseInt(index) + 1}`].focus();
                this.$refs[`code_${parseInt(index) + 1}`].dispatchEvent(new Event("input"));
            }
        },
        codeFocus(event, index) {
            event.target.select();
        },
    },
};
</script>

<style></style>
