<template>
    <div class="flex flex-col gap-2 h-full">
        <div class="flex items-center justify-between flex-wrap px-2 gap-4">
            <div class="flex items-center gap-2">
                <label class="w-full">از ساعت</label>
                <t-input class="sideways max-w-screen-2xs" type="time" v-model:value="startTime" :error="startTimeError" />
            </div>
            <div class="flex items-center gap-2">
                <label class="w-full">تا ساعت</label>
                <t-input class="sideways max-w-screen-2xs" type="time" v-model:value="endTime" :error="endTimeError" />
            </div>
            <div class="flex items-center gap-2">
                <label>به صورت:</label>
                <t-checkbox name="typeOnline" v-model:value="typeOnline">
                    <template v-slot:desc><span class="text-sm">آنلاین</span> </template>
                </t-checkbox>
                <t-checkbox name="typeInPerson" v-model:value="typeInPerson">
                    <template v-slot:desc><span class="text-sm">حضوری</span> </template>
                </t-checkbox>
            </div>
            <div class="flex items-center gap-2">
                <label class="w-full">در روز:</label>
                <t-select class="max-w-screen-2xs" v-model:selectedOption="day" :options="dayOptions" :error="dayError">
                    <template v-slot:option="{ option }">
                        <option :value="option.value">{{ option.name }}</option>
                    </template>
                </t-select>
            </div>
            <button class="t_button py-1 bg-primary-500 hover:bg-primary-600 text-white">افزودن</button>
        </div>
        <hr class="my-2 border-solid border-secondary-500 border-opacity-50" />
        <ul class="flex flex-col justify-between gap-2 p-2 h-full">
            <li class="flex items-center justify-start" day="sat">
                <b class="p-2 px-4 shadow-lg rounded w-32 text-center">شنبه</b>
                <div class="flex-grow h-full px-2"></div>
            </li>
            <hr class="border-solid border-secondary-500 border-opacity-10" />
            <li class="flex items-center justify-start" day="sun">
                <b class="p-2 px-4 shadow-lg rounded w-32 text-center">یکشنبه</b>
                <div class="flex-grow h-full px-2"></div>
            </li>
            <hr class="border-solid border-secondary-500 border-opacity-10" />
            <li class="flex items-center justify-start" day="mon">
                <b class="p-2 px-4 shadow-lg rounded w-32 text-center">دوشنبه</b>
                <div class="flex-grow h-full px-2"></div>
            </li>
            <hr class="border-solid border-secondary-500 border-opacity-10" />
            <li class="flex items-center justify-start" day="tue">
                <b class="p-2 px-4 shadow-lg rounded w-32 text-center">سه شنبه</b>
                <div class="flex-grow h-full px-2"></div>
            </li>
            <hr class="border-solid border-secondary-500 border-opacity-10" />
            <li class="flex items-center justify-start" day="wed">
                <b class="p-2 px-4 shadow-lg rounded w-32 text-center">چهارشنبه</b>
                <div class="flex-grow h-full px-2"></div>
            </li>
            <hr class="border-solid border-secondary-500 border-opacity-10" />
            <li class="flex items-center justify-start" day="thu">
                <b class="p-2 px-4 shadow-lg rounded w-32 text-center">پنجشنبه</b>
                <div class="flex-grow h-full px-2"></div>
            </li>
            <hr class="border-solid border-secondary-500 border-opacity-10" />
            <li class="flex items-center justify-start" day="fri">
                <b class="p-2 px-4 shadow-lg rounded w-32 text-center">جمعه</b>
                <div class="flex-grow h-full px-2"></div>
            </li>
        </ul>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import axios from "axios";

import Input from "../../../templates/layouts/Input";
import Select from "../../../templates/layouts/Select";
import Checkbox from "../../../templates/layouts/Checkbox";

export default {
    name: "Schedules",
    components: {
        "t-input": Input,
        "t-select": Select,
        "t-checkbox": Checkbox,
    },
    data() {
        return {
            updatingSchedules: false,

            startTime: "",
            endTime: "",
            typeOnline: false,
            typeInPerson: false,
            day: { name: "شنبه", value: "sat" },

            startTimeError: "",
            endTimeError: "",
            dayError: "",
            dayOptions: [
                { name: "شنبه", value: "sat" },
                { name: "یکشنبه", value: "sun" },
                { name: "دوشنبه", value: "mon" },
                { name: "سه شنبه", value: "tue" },
                { name: "چهارشنبه", value: "wed" },
                { name: "پنجشنبه", value: "thu" },
                { name: "جمعه", value: "fri" },
            ],
        };
    },
    created() {},
    async mounted() {
        await this.getSchedules();
        await this.getTimeOffSchedules();
    },
    methods: {
        ...mapActions(["makeToast"]),

        updateSchedules() {
            if (this.updatingSchedules) return;
            this.updatingSchedules = true;

            axios
                .put(`${this.getBaseUrl()}/api/v1/admin/admins/schedules`, formData)
                .then((response) => {
                    this.makeToast({ title: "Update Schedules", message: "Admin Schedules has been updated successfully", type: "info" });
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
                    this.updatingSchedules = false;
                });
        },
        deleteSchedules() {},

        updateTimeOffSchedules() {
            if (this.updatingTimeOffSchedules) return;
            this.updatingTimeOffSchedules = true;

            axios
                .put(`${this.getBaseUrl()}/api/v1/admin/admins/time_off_schedules`, formData)
                .then((response) => {
                    this.makeToast({ title: "Update Schedules", message: "Admin Schedules has been updated successfully", type: "info" });
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
                    this.updatingTimeOffSchedules = false;
                });
        },
        deleteTimeOffSchedules() {},

        async getSchedules() {
            await axios
                .get(`${this.getBaseUrl()}/api/v1/admin/admins/${this.$route.params.id}/schedules`)
                .then((response) => {})
                .catch((error) => {
                    if (error.response.data) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                        if (error.response.data.field && typeof this[error.response.data.field + "Error"] !== "undefined") {
                            this[error.response.data.field + "Error"] = error.response.data.error;
                        }
                    }
                });
        },

        async getTimeOffSchedules() {
            await axios
                .get(`${this.getBaseUrl()}/api/v1/admin/admins/${this.$route.params.id}/time_off_schedules`)
                .then((response) => {})
                .catch((error) => {
                    if (error.response.data) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                        if (error.response.data.field && typeof this[error.response.data.field + "Error"] !== "undefined") {
                            this[error.response.data.field + "Error"] = error.response.data.error;
                        }
                    }
                });
        },
    },
};
</script>

<style></style>
