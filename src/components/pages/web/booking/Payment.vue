<template>
    <section class="flex flex-wrap items-center justify-center gap-4 mb-8 mx-auto" name="booking-stage-3">
        <div class="flex flex-col gap-2">
            <small class="p-1 px-2 bg-rose-100 text-rose-800 rounded-sm text-xs" v-if="error">{{ error }}</small>
            <small class="p-1 px-2 bg-gray-100 text-gray-700 rounded-sm text-xs">
                توجه داشته باشید فقط پس از پرداخت مبلغ، مشاوره برای شما رزرو خواهد شد.
            </small>

            <div class="flex flex-col gap-4 p-4 max-w-md flex-grow rounded-sm base_shadow">
                <div class="flex flex-wrap justify-between items-center gap-4" v-if="!!consulter.name">
                    <div class="flex items-center gap-2">
                        <img class="w-10 h-10 rounded-full object-cover" :src="consulter.image" :alt="`${consulter.name} ${consulter.family}`" />
                        <strong class="text-lg">{{ `${consulter.name} ${consulter.family}` }}</strong>
                    </div>
                    <router-link class="btn reverse text-sm w-max py-1" to="/consultation-time-booking" title="تغییر مشاور">
                        <i class="fal fa-pen"></i>
                        تغییر مشاور
                    </router-link>
                </div>
                <hr class="w-full border-solid border-gray-500 border-opacity-40" />
                <div class="flex flex-wrap justify-between items-start gap-4">
                    <div class="flex flex-col items-start gap-2">
                        <span class="text-lg">
                            {{ new Date(date).toLocaleDateString("fa", { weekday: "long" }) }}
                            {{ new Date(date).toLocaleDateString("fa", { day: "2-digit" }) }}
                            {{ new Date(date).toLocaleDateString("fa", { month: "long" }) }}
                            {{ new Date(date).toLocaleDateString("fa", { year: "numeric" }) }}
                        </span>
                        <span class="text-lg">ساعت {{ time }}</span>

                        <div class="flex flex-wrap gap-1">
                            <span class="py-1 px-2 rounded-sm bg-gray-200 text-black text-xs">به مدت 1 ساعت</span>
                            <span class="py-1 px-2 rounded-sm bg-gray-700 text-primary-100 text-xs" v-if="type == 'online'">آنلاین</span>
                            <span class="py-1 px-2 rounded-sm bg-gray-700 text-primary-100 text-xs" v-else>حضوری</span>
                        </div>
                    </div>
                    <router-link
                        class="btn reverse text-sm w-max py-1"
                        :to="`/consultation-time-booking/select-date/${consulter._id}`"
                        title="تغییر زمان و تاریخ"
                        v-if="!!consulter._id"
                    >
                        <i class="fal fa-pen"></i>
                        تغییر زمان و تاریخ
                    </router-link>
                </div>
            </div>
        </div>
        <div class="flex flex-col gap-6 p-4 w-max max-w-xs rounded-sm base_shadow">
            <b class="f-nazanin text-2xl">مبلغ قابل پرداخت :</b>
            <div class="flex items-center gap-1 px-10">
                <strong class="text-4xl">{{ new Intl.NumberFormat("fa").format(price) }}</strong>
                <small>تومان</small>
            </div>
            <button class="btn text-xl" @click="redirectToPaymentGateway()" style="background-color:#58c5aa;">
                <b class="font-normal text-xl" v-if="!redirectingToGateway">تایید و پرداخت</b>
                <b v-else class="fad fa-spinner fa-spin text-xl"></b>
            </button>
        </div>
    </section>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import axios from "axios";

export default {
    name: "SelectDate",
    data() {
        return {
            loading: false,
            redirectingToGateway: false,
            consultationBookingInfo: null,

            consulter: {},
            date: Date.now(),
            time: "00:00",
            price: 0,
            type: "",

            error: "",
        };
    },
    async mounted() {
        let consultationBookingInfo = localStorage.getItem("consultationBookingInfo");
        if (!!consultationBookingInfo) {
            consultationBookingInfo = JSON.parse(consultationBookingInfo);
            this.consulter = consultationBookingInfo.consulter;
            this.date = consultationBookingInfo.date;
            this.time = consultationBookingInfo.time;
            this.price = consultationBookingInfo.consulter.consultPricePerHour;
            this.type = consultationBookingInfo.type;
        }
    },
    computed: {
        ...mapGetters(["isUserLoggedIn"]),
    },
    methods: {
        ...mapActions(["makeToast", "changeLoginDialogState"]),

        async redirectToPaymentGateway() {
            // before redirecting to payment gateway check if user is logged in or not
            if (!this.isUserLoggedIn) {
                this.changeLoginDialogState(true);
                return;
            }

            if (this.redirectingToGateway) return;
            this.redirectingToGateway = true;

            await axios
                .post(`${this.getBaseUrl()}/api/v1/web/book`, {
                    consulter: this.consulter._id,
                    date: this.date,
                    time: this.time,
                    type: this.type,
                })
                .then((response) => {
                    // then rediect to gateway
                    window.location.href = `https://pay.ir/pg/${response.data.identifier}`;
                })
                .catch((error) => {
                    this.redirectingToGateway = false;
                    if (error.response.data) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                        this.error = error.response.data.error;
                    }
                });
        },
    },
};
</script>

<style></style>
