<template>
    <div class="flex flex-col gap-2 px-1 pb-2 h-full">
        <button class="t_button bg-primary-500 hover:bg-primary-600 text-white mb-2 w-max" @click="newDialogState = true">
            <i class="fas fa-plus"></i>
        </button>

        <ul class="flex flex-col gap-2 h-full">
            <li class="schedule_item w-max" v-for="(item, i) in schedules" :key="i">
                <span class="flex justify-between gap-2">
                    <b>{{ new Date(item.startDate).toLocaleDateString("fa") }}</b> - <b>{{ new Date(item.endDate).toLocaleDateString("fa") }}</b>
                </span>
                <div class="flex items-center justify-between gap-2">
                    <button class="t_button border-rose-400 hover:bg-rose-500 hover:text-white p-1" @click="deleteSchedule(item._id)">
                        <i class="far fa-trash"></i>
                    </button>
                </div>
            </li>
        </ul>

        <t-dialog v-model:open="newDialogState" title="زمانبدی جدید">
            <template v-slot:body>
                <div class="flex flex-col items-start px-2 gap-6">
                    <t-date-picker class="max-w-screen-xs" label="از تاریخ" type="date" v-model:value="startDate" :error="startDateError" />
                    <t-date-picker class="max-w-screen-xs" label="تا تاریخ" type="date" v-model:value="endDate" :error="endDateError" />
                    <hr class="border-solid border-secondary-500 border-opacity-20 w-full" />
                    <button class="t_button py-1 bg-primary-500 hover:bg-primary-600 text-white" @click="createNewSchedule()">افزودن</button>
                </div>
            </template>
        </t-dialog>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import axios from "axios";

import DatePicker from "../../../templates/layouts/DatePicker";
import Input from "../../../templates/layouts/Input";
import Dialog from "../../../templates/layouts/Dialog";

export default {
    name: "Schedules",
    components: {
        "t-date-picker": DatePicker,
        "t-input": Input,
        "t-dialog": Dialog,
    },
    data() {
        return {
            updatingSchedules: false,

            schedules: [],
            newDialogState: false,

            startDate: "",
            endDate: "",

            startDateError: "",
            endDateError: "",
        };
    },
    created() {},
    async mounted() {
        await this.getSchedules();
    },
    methods: {
        ...mapActions(["makeToast"]),

        createNewSchedule() {
            if (this.updatingSchedules) return;
            this.updatingSchedules = true;

            this.startDateError = this.endDateError = "";

            axios
                .post(`${this.getBaseUrl()}/api/v1/admin/timeoff_schedules`, {
                    admin: this.$route.params.id,
                    startDate: this.startDate,
                    endDate: this.endDate,
                })
                .then((response) => {
                    this.makeToast({ title: "Update Schedules", message: "Schedules has been updated successfully", type: "info" });
                    this.getSchedules();
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

        async deleteSchedule(id) {
            await axios.delete(`${this.getBaseUrl()}/api/v1/admin/timeoff_schedules/${id}`).then((response) => {
                this.getSchedules();
            });
        },

        async getSchedules() {
            await axios
                .get(`${this.getBaseUrl()}/api/v1/admin/timeoff_schedules/${this.$route.params.id}`)
                .then((response) => {
                    this.schedules = response.data;
                })
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
