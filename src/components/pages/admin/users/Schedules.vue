<template>
    <div class="flex flex-col gap-4 w-full">
        <table class="w-full border-separate" style="border-spacing: .5rem 1.5rem;">
            <tbody class="p-2">
                <tr class="rounded-md shadow-md" v-for="(data, i) in schedules" :key="i">
                    <td class="p-4">
                        <span>{{ `${data.consulter[0].name} ${data.consulter[0].family}` }}</span>
                    </td>
                    <td class="p-4">
                        <span>{{ new Date(`${data.date} ${data.time}`).toLocaleString("fa") }}</span>
                    </td>
                    <td class="p-4">
                        <span class="p-1 px-2 rounded-sm bg-gray-700 text-primary-100" v-if="data.type == 'in-person'">حضوری</span>
                        <span class="p-1 px-2 rounded-sm bg-gray-700 text-primary-100" v-if="data.type == 'online'">آنلاین</span>
                    </td>
                    <td class="p-4">
                        <span class="p-1 px-2 text-sm rounded-md bg-indigo-100 text-indigo-700" v-if="data.status == 'waiting-for-payment'">منتظر پرداخت</span>
                        <span class="p-1 px-2 text-sm rounded-md bg-emerald-100 text-emerald-700" v-if="data.status == 'payed'">پرداخت شده</span>
                        <span class="p-1 px-2 text-sm rounded-md bg-red-100 text-red-700" v-if="data.status == 'finished'">انجام شده</span>
                        <span class="p-1 px-2 text-sm rounded-md bg-rose-100 text-rose-700" v-if="data.status == 'canceled'">لغو شده</span>
                    </td>
                    <td class="p-4">
                        <router-link
                            :to="`/admin/booked_schedules/${data._id}`"
                            class="t_button p-2 rounded-md hover:bg-blue-300 hover:text-black w-max"
                            title="Edit"
                            v-if="checkPermissions(['admin.booked_schedules.edit'], adminInfo.permissions)"
                        >
                            <i class="fal fa-pen"></i>
                        </router-link>
                    </td>
                </tr>
            </tbody>
        </table>
        <!-- <ul class="flex flex-col gap-4 w-full">
            <li class="flex items-center justify-between flex-wrap gap-4 p-4 rounded-md shadow-md mx-2" v-for="(data, i) in schedules" :key="i">
                <span>{{ `${data.consulter[0].name} ${data.consulter[0].family}` }}</span>

                <span>{{ new Date(`${data.date} ${data.time}`).toLocaleString("fa") }}</span>

                <span class="p-1 px-2 rounded-sm bg-gray-700 text-primary-100" v-if="data.type == 'in-person'">حضوری</span>
                <span class="p-1 px-2 rounded-sm bg-gray-700 text-primary-100" v-if="data.type == 'online'">آنلاین</span>

                <span class="p-1 px-2 text-sm rounded-md bg-indigo-100 text-indigo-700" v-if="data.status == 'waiting-for-payment'">منتظر پرداخت</span>
                <span class="p-1 px-2 text-sm rounded-md bg-emerald-100 text-emerald-700" v-if="data.status == 'payed'">پرداخت شده</span>
                <span class="p-1 px-2 text-sm rounded-md bg-red-100 text-red-700" v-if="data.status == 'finished'">انجام شده</span>
                <span class="p-1 px-2 text-sm rounded-md bg-rose-100 text-rose-700" v-if="data.status == 'canceled'">لغو شده</span>

                <router-link
                    :to="`/admin/booked_schedules/${data._id}`"
                    class="t_button p-2 rounded-md hover:bg-blue-300 hover:text-black"
                    title="Edit"
                    v-if="checkPermissions(['admin.booked_schedules.edit'], adminInfo.permissions)"
                >
                    <i class="fal fa-pen"></i>
                </router-link>
            </li>
        </ul> -->
        <button class="t_button" @click="getTableData()" v-if="page < pageTotal && !isDataLoading">Load More</button>
        <span class="far fa-spinner fa-spin text-xl mx-auto" v-if="isDataLoading"></span>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import axios from "axios";

export default {
    name: "Schedules",
    components: {},
    data() {
        return {
            isDataLoading: false,

            schedules: [],
            page: 1,
            pp: 25,
            total: 0,
            pageTotal: 1,
        };
    },
    created() {},
    async mounted() {
        await this.getSchedules();
    },
    async beforeRouteUpdate(to, from, next) {
        this.$route.params.id = to.params.id;
        this.schedules = [];
        this.page = 1;
        this.pp = 25;
        this.total = 0;
        this.pageTotal = 1;
        await this.getSchedules();
        next();
    },
    computed: {
        ...mapGetters(["adminInfo"]),
    },
    methods: {
        async getSchedules() {
            if (this.isDataLoading || this.page > this.pageTotal) return;
            this.isDataLoading = true;

            let params = [`page=${this.page}`, `pp=${this.pp}`, `user_id=${this.$route.params.id}`, `sort=زمان مشاوره`, `sort_type=desc`];
            params = params.join("&");

            await axios
                .get(`${this.getBaseUrl()}/api/v1/admin/booked_schedules?${params}`)
                .then((response) => {
                    this.schedules = [...this.schedules, ...response.data.records];
                    this.total = response.data.total;
                    this.pageTotal = response.data.pageTotal;

                    this.page++;
                })
                .catch((error) => {
                    if (error.response.data && error.response.data.error) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                    }
                })
                .finally(() => {
                    this.isDataLoading = false;
                });
        },
    },
};
</script>

<style></style>
