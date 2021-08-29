<template>
    <div class="flex flex-col gap-2 px-1 pb-2 h-full">
        <button class="t_button bg-primary-500 hover:bg-primary-600 text-white mb-2 w-max" @click="newDialogState = true">
            <i class="fas fa-plus"></i>
        </button>

        <ul class="flex flex-col justify-between gap-2 h-full">
            <li class="flex items-center justify-start flex-col md:flex-row gap-4" day="sat">
                <b class="schedule_title shadow-md p-2 px-4 rounded w-32 text-center">شنبه</b>
                <div class="flex items-center gap-2 overflow-x-auto flex-grow h-full max-w-full">
                    <div class="schedule_item" v-for="(item, i) in schedules.sat" :key="i">
                        <span class="flex justify-between gap-2">
                            <b>{{ item.startTime }}</b> - <b>{{ item.endTime }}</b>
                        </span>
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-sm p-1 rounded" v-if="item.type == 'online'">آنلاین</span>
                            <span class="text-sm p-1 rounded" v-if="item.type == 'in-person'">حضوری</span>
                            <button class="t_button border-rose-400 hover:bg-rose-500 hover:text-white p-1" @click="deleteSchedule(item._id)">
                                <i class="far fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </li>
            <hr class="border-solid border-secondary-500 border-opacity-10" />
            <li class="flex items-center justify-start flex-col md:flex-row gap-4" day="sun">
                <b class="schedule_title shadow-md p-2 px-4 rounded w-32 text-center">یکشنبه</b>
                <div class="flex items-center gap-2 overflow-x-auto flex-grow h-full max-w-full">
                    <div class="schedule_item" v-for="(item, i) in schedules.sun" :key="i">
                        <span class="flex justify-between gap-2">
                            <b>{{ item.startTime }}</b> - <b>{{ item.endTime }}</b>
                        </span>
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-sm p-1 rounded" v-if="item.type == 'online'">آنلاین</span>
                            <span class="text-sm p-1 rounded" v-if="item.type == 'in-person'">حضوری</span>
                            <button class="t_button border-rose-400 hover:bg-rose-500 hover:text-white p-1" @click="deleteSchedule(item._id)">
                                <i class="far fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </li>
            <hr class="border-solid border-secondary-500 border-opacity-10" />
            <li class="flex items-center justify-start flex-col md:flex-row gap-4" day="mon">
                <b class="schedule_title shadow-md p-2 px-4 rounded w-32 text-center">دوشنبه</b>
                <div class="flex items-center gap-2 overflow-x-auto flex-grow h-full max-w-full">
                    <div class="schedule_item" v-for="(item, i) in schedules.mon" :key="i">
                        <span class="flex justify-between gap-2">
                            <b>{{ item.startTime }}</b> - <b>{{ item.endTime }}</b>
                        </span>
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-sm p-1 rounded" v-if="item.type == 'online'">آنلاین</span>
                            <span class="text-sm p-1 rounded" v-if="item.type == 'in-person'">حضوری</span>
                            <button class="t_button border-rose-400 hover:bg-rose-500 hover:text-white p-1" @click="deleteSchedule(item._id)">
                                <i class="far fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </li>
            <hr class="border-solid border-secondary-500 border-opacity-10" />
            <li class="flex items-center justify-start flex-col md:flex-row gap-4" day="tue">
                <b class="schedule_title shadow-md p-2 px-4 rounded w-32 text-center">سه شنبه</b>
                <div class="flex items-center gap-2 overflow-x-auto flex-grow h-full max-w-full">
                    <div class="schedule_item" v-for="(item, i) in schedules.tue" :key="i">
                        <span class="flex justify-between gap-2">
                            <b>{{ item.startTime }}</b> - <b>{{ item.endTime }}</b>
                        </span>
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-sm p-1 rounded" v-if="item.type == 'online'">آنلاین</span>
                            <span class="text-sm p-1 rounded" v-if="item.type == 'in-person'">حضوری</span>
                            <button class="t_button border-rose-400 hover:bg-rose-500 hover:text-white p-1" @click="deleteSchedule(item._id)">
                                <i class="far fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </li>
            <hr class="border-solid border-secondary-500 border-opacity-10" />
            <li class="flex items-center justify-start flex-col md:flex-row gap-4" day="wed">
                <b class="schedule_title shadow-md p-2 px-4 rounded w-32 text-center">چهارشنبه</b>
                <div class="flex items-center gap-2 overflow-x-auto flex-grow h-full max-w-full">
                    <div class="schedule_item" v-for="(item, i) in schedules.wed" :key="i">
                        <span class="flex justify-between gap-2">
                            <b>{{ item.startTime }}</b> - <b>{{ item.endTime }}</b>
                        </span>
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-sm p-1 rounded" v-if="item.type == 'online'">آنلاین</span>
                            <span class="text-sm p-1 rounded" v-if="item.type == 'in-person'">حضوری</span>
                            <button class="t_button border-rose-400 hover:bg-rose-500 hover:text-white p-1" @click="deleteSchedule(item._id)">
                                <i class="far fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </li>
            <hr class="border-solid border-secondary-500 border-opacity-10" />
            <li class="flex items-center justify-start flex-col md:flex-row gap-4" day="thu">
                <b class="schedule_title shadow-md p-2 px-4 rounded w-32 text-center">پنجشنبه</b>
                <div class="flex items-center gap-2 overflow-x-auto flex-grow h-full max-w-full">
                    <div class="schedule_item" v-for="(item, i) in schedules.thu" :key="i">
                        <span class="flex justify-between gap-2">
                            <b>{{ item.startTime }}</b> - <b>{{ item.endTime }}</b>
                        </span>
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-sm p-1 rounded" v-if="item.type == 'online'">آنلاین</span>
                            <span class="text-sm p-1 rounded" v-if="item.type == 'in-person'">حضوری</span>
                            <button class="t_button border-rose-400 hover:bg-rose-500 hover:text-white p-1" @click="deleteSchedule(item._id)">
                                <i class="far fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </li>
            <hr class="border-solid border-secondary-500 border-opacity-10" />
            <li class="flex items-center justify-start flex-col md:flex-row gap-4" day="fri">
                <b class="schedule_title shadow-md p-2 px-4 rounded w-32 text-center">جمعه</b>
                <div class="flex items-center gap-2 overflow-x-auto flex-grow h-full max-w-full">
                    <div class="schedule_item" v-for="(item, i) in schedules.fri" :key="i">
                        <span class="flex justify-between gap-2">
                            <b>{{ item.startTime }}</b> - <b>{{ item.endTime }}</b>
                        </span>
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-sm p-1 rounded" v-if="item.type == 'online'">آنلاین</span>
                            <span class="text-sm p-1 rounded" v-if="item.type == 'in-person'">حضوری</span>
                            <button class="t_button border-rose-400 hover:bg-rose-500 hover:text-white p-1" @click="deleteSchedule(item._id)">
                                <i class="far fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </li>
        </ul>

        <t-dialog v-model:open="newDialogState" title="زمانبدی جدید">
            <template v-slot:body>
                <div class="flex flex-col items-start px-2 gap-6">
                    <div class="flex items-center gap-2">
                        <label class="w-full">از ساعت</label>
                        <t-input class="sideways max-w-screen-2xs" type="time" v-model:value="startTime" :error="startTimeError" />
                    </div>
                    <div class="flex items-center gap-2">
                        <label class="w-full">تا ساعت</label>
                        <t-input class="sideways max-w-screen-2xs" type="time" v-model:value="endTime" :error="endTimeError" />
                    </div>
                    <div class="flex items-center gap-6">
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
                    <hr class="border-solid border-secondary-500 border-opacity-20 w-full" />
                    <button class="t_button py-1 bg-primary-500 hover:bg-primary-600 text-white" @click="updateSchedules()">افزودن</button>
                </div>
            </template>
        </t-dialog>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import axios from "axios";

import Input from "../../../templates/layouts/Input";
import Select from "../../../templates/layouts/Select";
import Checkbox from "../../../templates/layouts/Checkbox";
import Dialog from "../../../templates/layouts/Dialog";

export default {
    name: "Schedules",
    components: {
        "t-input": Input,
        "t-select": Select,
        "t-checkbox": Checkbox,
        "t-dialog": Dialog,
    },
    data() {
        return {
            updatingSchedules: false,

            schedules: { sat: [], sun: [], mon: [], tue: [], wed: [], thu: [], fri: [] },
            newDialogState: false,

            startTime: "09:00",
            endTime: "12:00",
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
    },
    methods: {
        ...mapActions(["makeToast"]),

        updateSchedules() {
            if (this.updatingSchedules) return;
            this.updatingSchedules = true;

            this.startTimeError = this.endTimeError = this.dayError = "";

            axios
                .post(`${this.getBaseUrl()}/api/v1/admin/schedules`, {
                    admin: this.$route.params.id,
                    startTime: this.startTime,
                    endTime: this.endTime,
                    typeOnline: this.typeOnline,
                    typeInPerson: this.typeInPerson,
                    day: this.day.value,
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
            await axios.delete(`${this.getBaseUrl()}/api/v1/admin/schedules/${id}`).then((response) => {
                this.getSchedules();
            });
        },

        async getSchedules() {
            await axios
                .get(`${this.getBaseUrl()}/api/v1/admin/schedules/${this.$route.params.id}`)
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
