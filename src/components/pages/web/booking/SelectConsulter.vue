<template>
    <section class="flex flex-wrap items-start justify-center gap-10 mb-8 mx-auto" name="booking-stage-1">
        <div class="consulter_card p-6 m-gradiant-btt" v-for="(consulter, i) in consulters" :key="i">
            <div class="flex items-start flex-wrap gap-4">
                <img class="object-cover rounded-full w-24 h-24" :src="consulter.image" :alt="`${consulter.name} ${consulter.family}`" />
                <div class="flex flex-col gap-2">
                    <h5 class="text-xl">{{ `${consulter.name} ${consulter.family}` }}</h5>
                    <p class="max-w-xs text-sm whitespace-pre-line opacity-80">{{ consulter.desc }}</p>
                </div>
            </div>

            <hr class="w-full border-solid opacity-80 mx-auto my-4" />

            <div class="flex items-center my-2 gap-2">
                <span class="far fa-map-marker-alt text-lg"></span>
                <address class="not-italic">میدان انقلاب، کارگر شمالی، کوچه جعفرزادگان، پلاک 10، طبقه دوم، واحد 5</address>
            </div>

            <hr class="w-full border-solid opacity-80 mx-auto my-4" />

            <div class="flex items-center gap-4 mt-8">
                <router-link
                    :to="`/consultation-time-booking/select-date/${consulter._id}`"
                    :title="`رزرو وقت مشاوره با ${consulter.name} ${consulter.family}`"
                    class="btn w-full"
                    >رزرو وقت مشاوره</router-link
                >
            </div>
        </div>
    </section>
</template>

<script>
import axios from "axios";

export default {
    name: "SelectConsulter",
    data() {
        return {
            consulters: [],
        };
    },
    async serverPrefetch() {
        await this.getConsulters();
    },
    async mounted() {
        await this.getConsulters();
    },
    methods: {
        async getConsulters() {
            await axios.get(`${this.getBaseUrl()}/api/v1/web/consulters`).then((response) => {
                this.consulters = response.data;
            });
        },
    },
};
</script>

<style></style>
