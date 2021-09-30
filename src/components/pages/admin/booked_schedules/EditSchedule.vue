<template>
    <div class="dashboard_body max-w-screen-xl mx-auto shadow-2xl">
        <div class="flex gap-2 items-baseline">
            <router-link to="/admin"><i class="fad fa-home text-lg"></i></router-link>
            <i class="fas fa-chevron-right text-sm text-secondary-400"></i>
            <router-link to="/admin/booked_schedules">مشاوره ها</router-link>
            <i class="fas fa-chevron-right text-sm text-secondary-400"></i>
            <h1 class="text-2xl"><b>ویرایش رزرو مشاوره</b></h1>
        </div>
        <hr class="my-4 border-solid" />

        <div class="flex flex-col h-full overflow-auto gap-4 p-2">
            <div class="flex items-center gap-2 max-w-screen-md" v-if="!!user.name && !!consulter.name">
                <t-input class="max-w-screen-xs" type="text" label="کاربر" :value="`${user.name} ${user.family}`" :disabled="true" />
                <t-input class="max-w-screen-xs" type="text" label="مشاور" :value="`${consulter.name} ${consulter.family}`" :disabled="true" />
            </div>

            <hr class="my-4 border-solid" />

            <div class="flex items-center flex-wrap gap-2">
                <t-date-picker class="max-w-screen-xs" label="تاریخ مشاوره" type="date" v-model:value="dateRaw" :error="dateRawError" />
                <t-input class="max-w-screen-2xs" type="time" label="ساعت" v-model:value="time" :error="timeError" />
                <t-input class="w-max" type="number" label="مدت (به ساعت)" v-model:value="duration" :error="durationError" />
            </div>

            <hr class="my-4 border-solid" />

            <div class="flex items-center flex-wrap gap-2">
                <t-select class="max-w-screen-xs" label="نوع" v-model:selectedOption="type" :options="typeOptions" :error="typeError">
                    <template v-slot:option="{ option }">
                        <option :value="option.value">{{ option.name }}</option>
                    </template>
                </t-select>

                <t-select class="max-w-screen-xs" label="وضعیت" v-model:selectedOption="status" :options="statusOptions" :error="statusError">
                    <template v-slot:option="{ option }">
                        <option :value="option.value">{{ option.name }}</option>
                    </template>
                </t-select>
            </div>

            <hr class="my-4 border-solid" />
            <h3 class="text-xl">مشخصات تراکنش</h3>
            <div class="flex items-center gap-2 max-w-screen-md">
                <t-input class="w-max" label="مبلغ" v-if="!!transaction.amount" :value="`${transaction.amount}`" :disabled="true" />
                <t-input class="w-max" label="مبلغ پرداختی" v-if="!!transaction.payedAmount" :value="`${transaction.payedAmount}`" :disabled="true" />
            </div>
            <div class="flex items-center gap-2 max-w-screen-md">
                <t-input class="w-max" label="کد تراکنش" v-if="!!transaction.transactionCode" :value="`${transaction.transactionCode}`" :disabled="true" />
                <t-input class="w-max" label="وضعیت تراکنش" v-if="!!transaction.status" :value="`${transaction.status}`" :disabled="true" />
            </div>
            <div class="flex items-center gap-2 max-w-screen-md">
                <t-input class="w-max" label="متن خطا" v-if="!!transaction.error" :value="`${transaction.error}`" :disabled="true" />
                <t-input class="w-max" label="IP" v-if="!!transaction.ip" :value="`${transaction.ip}`" :disabled="true" />
            </div>
        </div>

        <hr class="my-4 mt-auto border-solid" />
        <div class="flex flex-wrap items-center gap-4">
            <button
                class="t_button t_button_min bg-secondary-300 hover:bg-secondary-200 text-bluegray-700 disabled:opacity-50"
                :disabled="editingSchedule"
                @click="edit()"
            >
                <b v-if="!editingSchedule">ثبت تغییرات</b>
                <b v-else class="fad fa-spinner fa-spin text-xl"></b>
            </button>
            <router-link class="t_button t_button_min border-rose-400 hover:bg-rose-500" to="/admin/booked_schedules">بازگشت</router-link>
        </div>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import axios from "axios";

import Input from "../../../templates/layouts/Input";
import Select from "../../../templates/layouts/Select";
import DatePicker from "../../../templates/layouts/DatePicker";

export default {
    name: "EditSchedule",
    components: {
        "t-input": Input,
        "t-select": Select,
        "t-date-picker": DatePicker,
    },
    data() {
        return {
            editingSchedule: false,

            transaction: {},

            user: {},
            consulter: {},
            dateRaw: new Date(Date.now()),
            time: "",
            duration: "",
            type: { name: "منتشر شده", value: "published" },
            status: { name: "منتشر شده", value: "published" },

            consulterError: "",
            dateRawError: "",
            timeError: "",
            durationError: "",
            typeError: "",
            statusError: "",

            typeOptions: {
                online: { name: "آنلاین", value: "online" },
                "in-person": { name: "حضوری", value: "in-person" },
            },
            statusOptions: {
                "waiting-for-payment": { name: "منتظر پرداخت", value: "waiting-for-payment" },
                payed: { name: "پرداخت شده", value: "payed" },
                finished: { name: "انجام شده", value: "finished" },
                canceled: { name: "لغو شده", value: "canceled" },
            },
        };
    },
    created() {},
    async mounted() {
        await this.getBooked_schedules();
    },
    methods: {
        ...mapActions(["makeToast"]),

        async edit() {
            if (this.editingSchedule) return;
            this.editingSchedule = true;

            this.dateRawError = this.timeError = this.durationError = this.typeError = this.statusError = "";

            axios
                .put(`${this.getBaseUrl()}/api/v1/admin/booked_schedule`, {
                    id: this.$route.params.id,
                    dateRaw: this.dateRaw,
                    time: this.time,
                    duration: this.duration,
                    type: this.type.value,
                    status: this.status.value,
                })
                .then((response) => {
                    this.makeToast({ title: "Update Booked Schedule", message: "Booked Schedule has been updated successfully", type: "info" });
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
                    this.editingSchedule = false;
                });
        },

        async getBooked_schedules() {
            await axios
                .get(`${this.getBaseUrl()}/api/v1/admin/booked_schedule/${this.$route.params.id}`)
                .then((response) => {
                    this.transaction = response.data.transaction;
                    this.user = response.data.user;
                    this.consulter = response.data.consulter;
                    this.dateRaw = response.data.dateRaw;
                    this.time = response.data.time;
                    this.duration = response.data.duration;
                    this.type = this.typeOptions[response.data.type];
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
                        this.$router.push("/admin/booked_schedules");
                    }
                });
        },
    },
};
</script>

<style></style>
