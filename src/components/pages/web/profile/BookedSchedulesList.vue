<template>
    <div class="flex flex-col items-center md:items-start gap-2 w-full">
        <span class="heading mb-4 w-max">
            <h4 class="f-nazanin font-bold text-3xl">مشاوره های ثبت شده</h4>
            <small class="f-copgoth text-xs">Booked Consultation Sessions</small>
        </span>

        <ul class="flex flex-col gap-6 w-full" v-if="loadingSchedules">
            <li class="flex flex-col gap-4 p-4 rounded-sm w-full base_shadow" v-for="(schedule, i) in bookedSchedulesSkeleton" :key="i">
                <div class="flex items-center gap-2">
                    <div class="skeleton w-10 h-10 rounded-full"></div>
                    <div class="skeleton w-4/12 h-4"></div>
                </div>
                <div class="skeleton w-full h-2 rounded-full"></div>
                <div class="skeleton w-7/12 h-2 rounded-full"></div>
            </li>
        </ul>
        <ul class="flex flex-col gap-6 w-full" v-else>
            <li class="flex flex-col gap-3 p-4 rounded-sm w-full base_shadow" v-for="(schedule, i) in bookedSchedules" :key="i">
                <div class="flex flex-wrap items-center gap-4">
                    <div class="flex items-center gap-2">
                        <img class="w-10 h-10 rounded-full object-cover" :src="schedule.consulter[0].image" alt="" />
                        <strong>{{ `${schedule.consulter[0].name} ${schedule.consulter[0].family}` }}</strong>
                    </div>
                    <small class="py-1 px-2 rounded-sm bg-gray-200 text-black text-xs">{{ `به مدت ${schedule.duration} ساعت` }}</small>
                    <small class="py-1 px-2 rounded-sm bg-gray-700 text-primary-100 text-xs" v-if="schedule.type == 'online'">آنلاین</small>
                    <small class="py-1 px-2 rounded-sm bg-gray-700 text-primary-100 text-xs" v-else>حضوری</small>
                    <hr class="flex-grow border-solid border-gray-500 border-opacity-50" />
                    <span class="text-sm rounded-sm p-1 px-2 text-white bg-amber-500" v-if="schedule.status == 'waiting-for-payment'">رزرو نشده</span>
                    <span class="text-sm rounded-sm p-1 px-2 text-white bg-emerald-500" v-if="schedule.status == 'payed'">رزرو شده</span>
                    <span class="text-sm rounded-sm p-1 px-2 text-white bg-indigo-500" v-if="schedule.status == 'finished'">انجام شده</span>
                    <span class="text-sm rounded-sm p-1 px-2 text-white bg-rose-500" v-if="schedule.status == 'canceled'">لغو شده</span>
                </div>
                <div class="flex flex-wrap justify-between gap-4">
                    <div class="flex items-center gap-1">
                        <span class="text-lg">
                            {{ new Date(schedule.date).toLocaleDateString("fa", { weekday: "long" }) }}
                            {{ new Date(schedule.date).toLocaleDateString("fa", { day: "2-digit" }) }}
                            {{ new Date(schedule.date).toLocaleDateString("fa", { month: "long" }) }}
                            {{ new Date(schedule.date).toLocaleDateString("fa", { year: "numeric" }) }}
                        </span>
                        <span>-</span>
                        <span class="text-lg">ساعت {{ schedule.time }}</span>
                    </div>
                    <button class="btn reverse text-sm py-1" @click="showDetails(schedule)">اطلاعت سفارش</button>
                </div>
            </li>
        </ul>
        <div class="flex items-center justify-center mt-4 w-full">
            <small class="opacity-60" v-if="page >= pageTotal">انتهای لیست</small>
            <button class="btn reverse w-max py-1" @click="loadMore()" v-else>مشاوره های قدیمی تر</button>
        </div>

        <t-dialog v-model:open="bookingDetailsDialogState">
            <template v-slot:body> </template>
        </t-dialog>

        <t-dialog v-model:open="paymentResultsDialogState">
            <template v-slot:body>
                <div class="flex flex-col items-center justify-center gap-4 max-w-lg">
                    <span class="fal fa-check-circle text-emerald-500 text-7xl" v-if="paymentResultStatus == 1"></span>
                    <span class="fal fa-exclamation-triangle text-rose-500 text-7xl" v-else></span>

                    <h3 class="text-4xl font-bold text-emerald-500 opacity-80 w-max p-2 pb-3 rounded-sm" v-if="paymentResultStatus == 1">پرداخت موفق</h3>
                    <h3 class="text-4xl font-bold text-rose-500 opacity-80 w-max p-2 pb-3 rounded-sm" v-else-if="paymentResultStatus == -1">تراکنش تکراری</h3>
                    <h3 class="text-4xl font-bold text-rose-500 opacity-80 w-max p-2 pb-3 rounded-sm" v-else-if="paymentResultStatus == -2">پرداخت ناموفق</h3>
                    <h3 class="text-4xl font-bold text-rose-500 opacity-80 w-max p-2 pb-3 rounded-sm" v-else-if="paymentResultStatus == -3">پرداخت ناموفق</h3>

                    <div class="flex flex-col justify-center items-center gap-2 p-8">
                        <p>{{ paymentResultMessage }}</p>
                        <small class="opacity-75 text-sm" v-if="paymentResultStatus == 1">
                            لطفا در تاریخ و ساعت مورد نظر با توجه به نوع مشاوره رزرو شده در دفتر مشاور و یا بخش تماس و پیام ها در حساب کاربری خود، جهت دریافت
                            مشاوره حضور داشته باشید.
                        </small>
                    </div>
                </div>
            </template>
        </t-dialog>
    </div>
</template>

<script>
import axios from "axios";
import cookies from "js-cookie";

import Dialog from "../../../templates/layouts/Dialog";

export default {
    name: "BookedSchedules",
    components: {
        "t-dialog": Dialog,
    },
    data() {
        return {
            paymentResultsDialogState: false,
            paymentResultStatus: 0,
            paymentResultMessage: "",

            bookingDetailsDialogState: false,
            loadingSchedules: false,
            bookedSchedulesSkeleton: ["", "", "", "", "", ""],
            bookedSchedules: [],
            page: 1,
            total: 0,
            pageTotal: 1,
        };
    },
    async mounted() {
        // check if there is any "PaymentResults" cookie
        if (!!cookies.get("PaymentResults")) {
            // if so then base on its status show a dialog and inform the user
            const PaymentResults = JSON.parse(cookies.get("PaymentResults"));
            this.paymentResultStatus = PaymentResults.status;
            this.paymentResultMessage = PaymentResults.message;
            this.paymentResultsDialogState = true;
            cookies.remove("PaymentResults");
        }

        // get the booked schedules for this user and show them from newest to last
        await this.getBookedSchedules();
    },
    computed: {},
    methods: {
        async getBookedSchedules() {
            if (this.loadingSchedules) return;
            this.loadingSchedules = true;

            let params = [`page=${this.page}`];
            params = params.join("&");

            await axios
                .get(`${this.getBaseUrl()}/api/v1/web/booked_schedules?${params}`)
                .then((response) => {
                    this.bookedSchedules = [...this.bookedSchedules, ...response.data.records];
                    this.total = response.data.total;
                    this.pageTotal = response.data.pageTotal;
                })
                .catch((error) => {
                    if (error.response.data && error.response.data.error) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                    }
                })
                .finally(() => (this.loadingSchedules = false));
        },

        loadMore() {
            console.log(this.page, this.pageTotal);
            if (this.page < this.pageTotal) {
                this.page = parseInt(this.page) + 1;
                this.getBookedSchedules();
            }
        },

        showDetails(schedule) {
            // TODO
            this.bookingDetailsDialogState = true;
        },
    },
};
</script>

<style></style>
