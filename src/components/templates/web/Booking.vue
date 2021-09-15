<template>
    <section class="flex flex-col items-center justify-center gap-8 my-4 mx-auto" name="booking">
        <header class="flex flex-col items-center justify-center gap-6">
            <span class="heading mb-4 w-max gap-1">
                <h1 class="f-nazanin font-bold text-4xl">رزرو وقت مشاوره</h1>
                <small class="f-copgoth text-xs">Book Consultation Session</small>
            </span>
            <ul class="flex items-center gap-4 md:gap-8">
                <li
                    class="flex flex-col md:flex-row items-center justify-center gap-2 text-lg md:text-3xl"
                    :class="{ 'opacity-30': $route.path != '/consultation-time-booking' }"
                >
                    <div class="f-copgoth flex items-center justify-center text-3xl w-10 h-10 p-1 rounded-full bg-gray-700 text-primary-100">1</div>
                    <span class="f-nazanin text-center font-bold">انتخاب مشاور</span>
                </li>
                <span class="fal fa-minus text-xl"></span>
                <li
                    class="flex flex-col md:flex-row items-center justify-center gap-2 text-lg md:text-3xl"
                    :class="{ 'opacity-30': $route.path != '/consultation-time-booking/set-date' }"
                >
                    <div class="f-copgoth flex items-center justify-center text-3xl w-10 h-10 p-1 rounded-full bg-gray-700 text-primary-100">2</div>
                    <span class="f-nazanin text-center font-bold">تعیین زمان تاریخ</span>
                </li>
                <span class="fal fa-minus text-xl"></span>
                <li
                    class="flex flex-col md:flex-row items-center justify-center gap-2 text-lg md:text-3xl"
                    :class="{ 'opacity-30': $route.path != '/consultation-time-booking/payment' }"
                >
                    <div class="f-copgoth flex items-center justify-center text-3xl w-10 h-10 p-1 rounded-full bg-gray-700 text-primary-100">3</div>
                    <span class="f-nazanin text-center font-bold">تایید و پرداخت</span>
                </li>
            </ul>
        </header>

        <hr class="max-w-screen-xl w-10/12 border-2 border-solid opacity-80 mx-auto my-8" />

        <div class="flex flex-col w-full">
            <router-view v-slot="{ Component }">
                <transition name="slideright" mode="out-in" appear="">
                    <component :is="Component" />
                </transition>
            </router-view>
        </div>
    </section>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
    name: "Booking",
    components: {},
    data() {
        return {};
    },
    async serverPrefetch() {},
    async created() {},
    mounted() {},
    computed: {
        ...mapGetters(["userInfo"]),
    },
    methods: {
        ...mapActions(["makeToast"]),
    },
};
</script>

<style></style>
