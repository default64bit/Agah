<template>
    <div class="dashboard_body max-w-screen-xl mx-auto shadow-2xl">
        <div class="flex gap-2 items-baseline">
            <router-link to="/admin"><i class="fad fa-home text-lg"></i></router-link>
            <i class="fas fa-chevron-right text-sm text-secondary-400"></i>
            <router-link to="/admin/faqs">سوالات متداول</router-link>
            <i class="fas fa-chevron-right text-sm text-secondary-400"></i>
            <h1 class="text-2xl"><b>ویرایش سوال</b></h1>
        </div>
        <hr class="my-4 border-solid" />

        <div class="flex flex-col h-full overflow-auto gap-4 p-2">
            <t-input class="max-w-screen-md" type="text" maxCount="250" label="سوال" :required="true" v-model:value="question" :error="questionError" />

            <t-input class="max-w-screen-md" type="textarea" label="جواب" :required="true" v-model:value="answer" :error="answerError" />

            <t-select class="max-w-screen-xs" label="وضعیت" v-model:selectedOption="status" :options="statusOptions" :error="statusError">
                <template v-slot:option="{ option }">
                    <option :value="option.value">{{ option.name }}</option>
                </template>
            </t-select>
        </div>

        <hr class="my-4 mt-auto border-solid" />
        <div class="flex flex-wrap items-center gap-4">
            <button
                class="t_button t_button_min bg-primary-500 hover:bg-primary-600 text-bluegray-50 disabled:opacity-50"
                :disabled="editingFaq"
                @click="edit()"
            >
                <b v-if="!editingFaq">ثبت تغییرات</b>
                <b v-else class="fad fa-spinner fa-spin text-xl"></b>
            </button>
            <router-link class="t_button t_button_min border-rose-400 hover:bg-rose-500" to="/admin/faqs">بازگشت</router-link>
        </div>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import axios from "axios";

import Input from "../../../templates/layouts/Input";
import Select from "../../../templates/layouts/Select";

export default {
    name: "EditFaq",
    components: {
        "t-input": Input,
        "t-select": Select,
    },
    data() {
        return {
            editingFaq: false,

            question: "",
            answer: "",
            status: { name: "منتشر شده", value: "published" },

            questionError: "",
            answerError: "",
            statusError: "",

            statusOptions: {
                published: { name: "منتشر شده", value: "published" },
                pending: { name: "منتظر انتشار", value: "pending" },
            },
        };
    },
    created() {},
    async mounted() {
        await this.getFaq();
    },
    methods: {
        ...mapActions(["makeToast"]),

        async edit() {
            if (this.editingFaq) return;
            this.editingFaq = true;

            this.questionError = this.answerError = this.statusError = "";

            axios
                .put(`${this.getBaseUrl()}/api/v1/admin/faqs`, {
                    id: this.$route.params.id,
                    question: this.question,
                    answer: this.answer,
                    status: this.status.value,
                })
                .then((response) => {
                    this.makeToast({ title: "Update Faq", message: "Faq has been updated successfully", type: "info" });
                })
                .catch((error) => {
                    console.log(error);
                    if (error.response.data) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                        if (error.response.data.field && typeof this[error.response.data.field + "Error"] !== "undefined") {
                            this[error.response.data.field + "Error"] = error.response.data.error;
                        }
                    }
                })
                .finally(() => {
                    this.editingFaq = false;
                });
        },

        async getFaq() {
            await axios
                .get(`${this.getBaseUrl()}/api/v1/admin/faq/${this.$route.params.id}`)
                .then((response) => {
                    this.question = response.data.question;
                    this.answer = response.data.answer;
                    this.status = this.statusOptions[response.data.status];
                })
                .catch((error) => {
                    console.log(error);
                    if (error.response.data) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                        if (error.response.data.field && typeof this[error.response.data.field + "Error"] !== "undefined") {
                            this[error.response.data.field + "Error"] = error.response.data.error;
                        }
                    }
                    if (error.response.status == 404) {
                        this.$router.push("/admin/faqs");
                    }
                });
        },
    },
};
</script>

<style></style>
