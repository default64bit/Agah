<template>
    <auth>
        <template v-slot:links>
            <span>Already have an account?</span>
            <router-link to="/login" class="t_button t_button_min border-2 border-solid border-primary-400">Login</router-link>
        </template>
        <template v-slot:content>
            <div class="auth_box flex-row w-min p-0">
                <div class="flex flex-col items-center justify-center p-6" style="width:24rem;">
                    <h1 class="">Sign Up To Jasper</h1>

                    <a class="t_button text-black bg-gray-50 hover:bg-gray-100 w-full" href="/api/v1/user/auth/google">
                        <img src="../../../assets/images/icons/google.svg" alt="" />
                        <span>Continue With Google</span>
                    </a>

                    <t-spacer class="my-5" text="OR" />

                    <div class="flex flex-row items-start justify-center gap-2">
                        <t-input class="mb-4" name="name" type="text" icon="fad fa-user" label="First Name" v-model:value="name" />
                        <t-input class="mb-4" name="family" type="text" icon="fad fa-users" label="Last Name" v-model:value="family" />
                    </div>

                    <t-input class="mb-4" name="email" type="email" icon="fad fa-envelope" label="Email Address" v-model:value="email" />
                    <t-input
                        class="mb-4"
                        name="password"
                        type="password"
                        placeholder="must be atleast 8 characters"
                        icon="fad fa-lock-alt"
                        label="Password"
                        v-model:value="password"
                    />

                    <div class="w-full">
                        <t-checkbox name="term_check" v-model:value="termCheck">
                            <template v-slot:desc>
                                <span class="text-xs">
                                    By creating an account you agree to the <a class="text-primary-600" href="#terms-of-use">terms of use</a> and our
                                    <a class="text-primary-600" href="#privacy-policy">privacy policy</a>
                                </span>
                            </template>
                        </t-checkbox>
                    </div>

                    <div v-if="error" class="t_alert bg-red-100 text-red-700 text-sm">
                        <i class="far fa-exclamation-circle"></i>
                        <b>{{ error }}</b>
                    </div>

                    <button class="t_button mt-6 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 w-full" :disabled="submitingForm" @click="submit()">
                        <b v-if="!submitingForm">Register</b>
                        <b v-else class="fad fa-spinner fa-spin text-xl"></b>
                    </button>
                </div>
                <div class="auth_side hidden md:flex">
                    <div class="whiteback"></div>
                </div>
            </div>
        </template>
    </auth>
</template>

<script>
import axios from "axios";
import cookies from "js-cookie";

import Auth from "../../templates/user/Auth";
import Spacer from "../../templates/layouts/Spacer";
import Input from "../../templates/layouts/Input";
import Checkbox from "../../templates/layouts/Checkbox";

export default {
    name: "Register",
    components: {
        Auth,
        "t-spacer": Spacer,
        "t-input": Input,
        "t-checkbox": Checkbox,
    },
    data() {
        return {
            name: "",
            family: "",
            email: "",
            password: "",
            termCheck: "",

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
                .post(`${this.getBaseUrl()}/api/v1/user/auth/register`, {
                    name: this.name,
                    family: this.family,
                    email: this.email,
                    password: this.password,
                    termCheck: this.termCheck,
                })
                .then((response) => {
                    this.$router.push("/");
                })
                .catch((error) => {
                    if(error.response){
                        this.error = error.response.data.error;
                    }
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
