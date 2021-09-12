<template>
    <div class="t_input t_date_picker" :class="{ 'z-10': focus }">
        <label class="relative" v-if="label">
            <span>{{ label }}</span>
            <i class="absolute text-primary-400 fa-xs fas fa-star-christmas" v-if="required"></i>
        </label>
        <div class="flex flex-col flex-grow">
            <div class="input_group" :class="{ focus: focus, disabled: disabled }">
                <i class="text-gray-400" :class="icon" v-if="icon" @click="toggleMenu(true)"></i>
                <input type="text" :name="name" :placeholder="placeholder" :disabled="disabled" v-model="localValue" ref="input" @input="updateValue()" />
                <b v-if="value" @click="clearInput()" class="cursor-pointer text-primary-300 far fa-times fa-sm"></b>
            </div>
            <transition name="slidedown" mode="out-in" appear>
                <div class="picker max-w-screen-xs w-full" v-if="open">
                    <div class="flex items-center justify-between gap-6">
                        <span class="flex items-center justify-center gap-2">
                            <b class="t_button text-primary-500" @click="yearIncrease()"><i class="far fa-plus"></i></b>
                            <b class="text-lg flex-grow select-none">{{ year }}</b>
                            <b class="t_button text-primary-500" @click="yearDecrease()"><i class="far fa-minus"></i></b>
                        </span>
                        <b class="t_button text-lg" @click="page = 'monthsView'">{{ month }}</b>
                    </div>
                    <hr class="my-2 border-solid" />
                    <div ref="daysView" v-show="page == 'daysView'">
                        <div class="grid grid-cols-7 min-w-max mb-2 gap-2">
                            <b class="text-xs text-center">شنبه</b>
                            <b class="text-xs text-center">1شنبه</b>
                            <b class="text-xs text-center">2شنبه</b>
                            <b class="text-xs text-center">3شنبه</b>
                            <b class="text-xs text-center">4شنبه</b>
                            <b class="text-xs text-center">5شنبه</b>
                            <b class="text-xs text-center">جمعه</b>
                        </div>
                        <div class="grid grid-cols-7 min-w-max mb-2 gap-2">
                            <span class="flex justify-center text-sm" v-for="(dayNumber, i) in days" :key="i">
                                <span
                                    class="flex items-center justify-center rounded-full hover:shadow-md p-1 w-8 h-8 cursor-pointer"
                                    :selected="dayNumber == day"
                                    @click="selectDay(dayNumber)"
                                >
                                    {{ dayNumber }}
                                </span>
                            </span>
                        </div>
                        <div class="flex items-center gap-2">
                            <b class="t_button border-primary-400 hover:bg-primary-500 hover:text-white p-0 px-1 w-max text-sm" @click="setToday()">
                                Today
                            </b>
                            <b class="t_button p-0 px-1 w-max text-sm" @click="toggleMenu(false)">Close</b>
                        </div>
                    </div>
                    <div ref="monthsView" v-show="page == 'monthsView'">
                        <ul class="grid grid-cols-3 gap-4">
                            <li class="flex-grow" v-for="(monthName, i) in months" :key="i">
                                <span class="t_button p-1 w-full" :selected="monthName == month" @click="selectMonth(monthName)">
                                    {{ monthName }}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </transition>
            <div class="desc opacity-50 text-xs mt-2" v-if="desc">{{ desc }}</div>
            <div v-if="error" class="flex gap-1 items-center rounded bg-red-100 text-red-700 p-1 mt-1 text-xs">
                <i class="far fa-exclamation-circle"></i>
                <span>{{ error }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import IMask from "imask";
import Jmoment from "jalali-moment";

import Input from "./Input";

export default {
    name: "DatePicker",
    props: {
        name: { type: String },
        label: { type: String },
        value: {},
        placeholder: { type: String },
        icon: { type: String, default: "fad fa-calendar" },
        desc: { type: String },
        error: { type: String },
        required: { type: Boolean },
        disabled: { default: false },
    },
    components: {
        "t-input": Input,
    },
    data() {
        return {
            focus: false,
            open: false,
            maskPattern: "0000/00/00",
            page: "daysView",

            localValue: "",
            date: null,
            year: "1399",
            month: "فروردین",
            day: null,

            months: ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"],
            days: [],
        };
    },
    created() {},
    mounted() {
        if (this.value) this.date = Jmoment(this.value).locale("fa");
        else this.date = Jmoment(Date.now()).locale("fa");

        this.year = this.date.format("jYYYY");
        this.month = this.months[this.date.format("jM") - 1];
        this.day = this.date.format("jDD");

        this.updateDaysList();
        this.updateByCalendar();
    },
    watch: {
        value(value) {
            if (value && value !== "") {
                this.date = Jmoment(this.value).locale("fa");
                this.year = this.date.format("jYYYY");
                this.month = this.months[this.date.format("jM") - 1];
                this.day = this.date.format("jDD");
                this.updateDaysList();
                this.updateByCalendar();
            }
        },
    },
    methods: {
        updateValue() {
            if (!!this.maskPattern) {
                IMask(this.$refs.input, {
                    mask: this.maskPattern,
                    autofix: false,
                    validate: false,
                    overwrite: false,
                    format: false,
                    parse: false,
                });
            }

            if (/([12]\d{3}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01]))/.test(this.localValue)) {
                let rawDate = this.localValue.split("/");
                this.year = rawDate[0];
                this.month = this.months[rawDate[1] - 1];
                this.day = rawDate[2];
                this.updateByCalendar();
                this.updateDaysList();
            }
        },

        toggleMenu(state = null) {
            this.focus = this.open = state != null ? state : !this.open;
        },

        setToday() {
            this.date = Jmoment(Date.now()).locale("fa");
            this.updateDaysList();
            this.year = this.date.format("jYYYY");
            this.month = this.months[this.date.format("jM") - 1];
            this.day = this.date.format("jDD");
            this.updateByCalendar();
        },

        updateDaysList(month = "", year = "") {
            this.days = [];

            if (!month) month = this.date.format("MM");
            if (!year) year = this.date.format("YYYY");

            let date = Jmoment(`${year}/${month}/01`, "jYYYY/jMM/jDD").locale("fa");
            let firstWeekDayOfMonth = date.weekday();

            for (let i = 0; i < firstWeekDayOfMonth; i++) this.days.push("");
            for (let i = 1; i <= date.daysInMonth(); i++) this.days.push(String(i).padStart(2, "0"));
        },

        updateByCalendar() {
            let month = String(this.months.indexOf(this.month) + 1).padStart(2, "0");
            let date = Jmoment.from(`${this.year}/${month}/${this.day}`, "fa", "YYYY/MM/DD");

            this.localValue = date.format("jYYYY/jMM/jDD");
            this.date = Jmoment(date.toISOString()).locale("fa");
            this.$emit("update:value", date.toISOString());
        },

        selectDay(day) {
            if (!day) return;
            this.day = day;
            this.toggleMenu(false);

            this.updateByCalendar();
        },
        selectMonth(month) {
            if (!month) return;
            this.month = month;
            this.page = "daysView";

            this.day = "01";
            this.updateDaysList(String(this.months.indexOf(this.month) + 1).padStart(2, "0"));
            this.updateByCalendar();
        },
        yearIncrease() {
            this.year = parseInt(this.year);
            this.year += 1;

            this.updateDaysList(String(this.months.indexOf(this.month) + 1).padStart(2, "0"), this.year);
            this.updateByCalendar();
        },
        yearDecrease() {
            this.year = parseInt(this.year);
            this.year -= 1;

            this.updateDaysList(String(this.months.indexOf(this.month) + 1).padStart(2, "0"), this.year);
            this.updateByCalendar();
        },

        clearInput() {
            this.localValue = "";
            this.$emit("update:value", "");
        },
    },
};
</script>

<style scoped></style>
