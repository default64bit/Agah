<template>
    <section class="flex flex-wrap items-start justify-center gap-4 mb-8 mx-auto p-0" name="booking-stage-2">
        <div class="flex items-center justify-center gap-4 flex-row md:flex-col p-4 rounded-sm base_shadow md:max-w-xs">
            <img class="w-12 h-12 md:w-24 md:h-24 rounded-full object-cover" :src="consulter.image" :alt="`${consulter.name} ${consulter.family}`" />
            <strong class="text-lg">{{ `${consulter.name} ${consulter.family}` }}</strong>
            <router-link class="btn reverse text-sm w-max md:w-full py-1 md:mt-2" to="/consultation-time-booking" title="تغییر مشاور">
                <i class="fal fa-pen"></i>
                تغییر مشاور
            </router-link>
        </div>
        <div class="flex flex-col gap-6 p-4 w-full max-w-2xl rounded-sm base_shadow">
            <div class="select_consult_type flex items-center gap-4">
                <button class="btn w-full text-xs md:text-base" :class="{ active: type == 'in-person' }" @click="changeType('in-person')">
                    <i class="far fa-landmark"></i>
                    مشاوره حضوری
                </button>
                <button class="btn w-full text-xs md:text-base" :class="{ active: type == 'online' }" @click="changeType('online')">
                    <i class="far fa-comment-lines"></i>
                    مشاوره آنلاین
                </button>
            </div>
            <div class="flex items-start gap-1">
                <span class="fal fa-exclamation-circle text-primary-500 text-xl mt-1"></span>
                <transition name="fade" mode="out-in" appear="">
                    <p class="opacity-75" v-if="type == 'in-person'">
                        برای مشاوره حضوری، پس از رزرو وقت مشاوره در تاریخ و زمان تعیین شده به دفتر مشاور مراجع کنید.
                    </p>
                    <p class="opacity-75" v-else-if="type == 'online'">
                        برای مشاوره آنلاین، پس از رزرو وقت مشاوره در تاریخ و زمان تعیین شده میتوانید با ورود به حساب کاربری خود با مشاور به صورت تلفنی یا متنی
                        صحبت کنید.
                    </p>
                </transition>
            </div>
            <transition name="fade" mode="out-in" appear="">
                <div class="flex flex-col gap-6" v-if="!loading">
                    <hr class="border-solid border-t-2 border-primary-500 border-opacity-20 w-full" />
                    <div class="flex items-center justify-between gap-2">
                        <button
                            class="flex items-center gap-1 w-max bg-transparent p-1 px-3 base_shadow text-xl"
                            :class="{ 'opacity-40 cursor-not-allowed': selectedIndex == dates.length - 1 }"
                            @click="changeDate('next')"
                        >
                            <span class="fas fa-chevron-left text-sm"></span>
                            <small class="text-sm pb-1">روز بعد</small>
                        </button>
                        <b
                            class="flex items-center justify-center flex-grow p-2 bg-gray-300 bg-opacity-20 text-center md:text-xl rounded-sm"
                        >
                            {{ new Date(selectedDate.time).toLocaleDateString("fa", { weekday: "long" }) }}
                            {{ new Date(selectedDate.time).toLocaleDateString("fa", { day: "2-digit" }) }}
                            {{ new Date(selectedDate.time).toLocaleDateString("fa", { month: "long" }) }}
                            {{ new Date(selectedDate.time).toLocaleDateString("fa", { year: "numeric" }) }}
                        </b>
                        <button
                            class="flex items-center gap-1 w-max bg-transparent p-1 px-3 base_shadow text-xl"
                            :class="{ 'opacity-40 cursor-not-allowed': selectedIndex == 0 }"
                            @click="changeDate('prev')"
                        >
                            <small class="text-sm pb-1">روز قبل</small>
                            <span class="fas fa-chevron-right text-sm"></span>
                        </button>
                    </div>
                    <ul class="flex justify-center flex-wrap gap-3" v-if="!!selectedDate.info[type] && !selectedDate.info.isOffDay">
                        <li
                            class="flex items-center gap-3 bg-gray-300 bg-opacity-20 rounded-sm p-3 cursor-pointer"
                            v-for="(hour, i) in selectedDate.info[type]"
                            :key="i"
                            @click="selectedTime = hour"
                        >
                            <i class="text-primary-500 text-xl" :class="selectedTime == hour ? 'fad fa-square-full' : 'fal fa-square-full'"></i>
                            <b class=""><i class="fal fa-clock"></i> {{ hour }}</b>
                        </li>
                    </ul>
                    <div class="flex flex-col gap-2 justify-center items-center" v-if="selectedDate.info.isOffDay">
                        <div class="flex items-start gap-1 rounded-sm bg-rose-100 text-rose-800 w-max px-3 py-1">
                            <span class="fad fa-exclamation mt-1"></span>
                            <b class="opacity-75">روز تعطیل</b>
                        </div>
                        <button class="btn reverse text-sm" v-if="nextOpenDay != ''" @click="goToNextOpenDate()">
                            وقت آزاد بعدی،
                            {{ new Date(nextOpenDay).toLocaleDateString("fa", { weekday: "long" }) }}
                            {{ new Date(nextOpenDay).toLocaleDateString("fa", { day: "2-digit" }) }}
                            {{ new Date(nextOpenDay).toLocaleDateString("fa", { month: "long" }) }}
                            {{ new Date(nextOpenDay).toLocaleDateString("fa", { year: "numeric" }) }}
                        </button>
                    </div>
                    <hr class="border-solid border-t-2 border-primary-500 border-opacity-20 w-full" />
                    <button class="btn w-max py-1" @click="goToPayment()" v-show="selectedTime != ''">
                        <span>تایید و ادامه</span>
                        <i class="fas fa-arrow-right text-sm"></i>
                    </button>
                </div>
                <div class="flex justify-center items-center" v-else>
                    <span class="fal fa-spinner fa-pulse text-primary-500 pt-1 text-5xl"></span>
                </div>
            </transition>
        </div>
    </section>
</template>

<script>
import { mapActions } from "vuex";
import axios from "axios";

export default {
    name: "SelectDate",
    data() {
        return {
            loading: false,
            consulter: {},
            dates: [],
            nextOpenDay: "",
            nextOpenDayIndex: 0,

            selectedIndex: 0,
            selectedDate: {
                time: Date.now(),
                info: {},
            },
            selectedTime: "",
            type: "in-person",
        };
    },
    async serverPrefetch() {
        await this.getConsulterSchedule();
    },
    async mounted() {
        await this.getConsulterSchedule();

        window.addEventListener("keydown", (e) => {
            switch (e.key) {
                case "ArrowLeft":
                    this.changeDate("prev");
                    break;
                case "ArrowRight":
                    this.changeDate("next");
                    break;
            }
        });
    },
    methods: {
        ...mapActions(["makeToast"]),

        async getConsulterSchedule() {
            this.loading = true;
            await axios
                .get(`${this.getBaseUrl()}/api/v1/web/consulter/${this.$route.params.consulter_id}/schedule`)
                .then((response) => {
                    this.consulter = response.data.consulter;
                    for (const key in response.data.dates) {
                        this.dates.push({
                            time: key,
                            info: response.data.dates[key],
                        });
                    }
                    this.selectedDate = this.dates[this.selectedIndex];

                    for (let i = 0; i < this.dates.length; i++) {
                        if (!this.dates[i].info.isOffDay) {
                            this.nextOpenDay = this.dates[i].time;
                            this.nextOpenDayIndex = i;
                            break;
                        }
                    }
                })
                .finally(() => (this.loading = false));
        },

        changeDate(dir) {
            if (dir == "next") this.selectedIndex = Math.min(this.dates.length - 1, this.selectedIndex + 1);
            else this.selectedIndex = Math.max(0, this.selectedIndex - 1);
            this.selectedDate = this.dates[this.selectedIndex];
            this.selectedTime = "";
        },

        goToNextOpenDate() {
            this.selectedIndex = this.nextOpenDayIndex;
            this.selectedDate = this.dates[this.selectedIndex];
            this.selectedTime = "";
        },

        changeType(newType) {
            this.selectedIndex = 0;
            this.selectedDate = this.dates[this.selectedIndex];
            this.selectedTime = "";
            this.type = newType;
        },

        goToPayment(consulter) {
            // set selected time and date and other info into localStorage and go to payment page
            if (!this.selectedTime) {
                this.makeToast({ message: "لطفا یک ساعت برای مشاوره انتخاب کنید", type: "danger" });
                return;
            }
            localStorage.setItem(
                "consultationBookingInfo",
                JSON.stringify({
                    consulter: this.consulter,
                    date: this.selectedDate.time,
                    time: this.selectedTime,
                    type: this.type,
                })
            );
            this.$router.push(`/consultation-time-booking/payment`);
        },
    },
};
</script>

<style></style>
