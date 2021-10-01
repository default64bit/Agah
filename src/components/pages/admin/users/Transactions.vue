<template>
    <div class="flex flex-col gap-4 w-full">
        <table class="w-full border-separate" style="border-spacing: .5rem 1.5rem;">
            <tbody class="p-2">
                <tr class="rounded-md shadow-md" v-for="(data, i) in transactions" :key="i">
                    <td class="p-4">
                        <span>{{ data.transaction.ip }}</span>
                    </td>
                    <td class="p-4">
                        <span>{{ new Intl.NumberFormat("fa").format(data.transaction.amount * 10) }} <small>ریال</small></span>
                    </td>
                    <td class="p-4">
                        <span class="text-emerald-500">{{ new Intl.NumberFormat("fa").format(data.transaction.payedAmount) }} <small>ریال</small></span>
                    </td>
                    <td class="p-4">
                        <span v-if="data.transaction.transactionCode">{{ data.transaction.transactionCode }}</span>
                        <span v-else>----</span>
                    </td>
                    <td class="p-4">
                        <span class="p-1 px-2 text-sm rounded-md bg-indigo-100 text-indigo-700" v-if="data.transaction.status == 'pending'">درحال پرداخت</span>
                        <span class="p-1 px-2 text-sm rounded-md bg-emerald-100 text-emerald-700" v-if="data.transaction.status == 'ok'">پرداخت شده</span>
                        <span class="p-1 px-2 text-sm rounded-md bg-red-100 text-red-700" v-if="data.transaction.status == 'failed'">خطا</span>
                        <span class="p-1 px-2 text-sm rounded-md bg-rose-100 text-rose-700" v-if="data.transaction.status == 'canceled'">لغو شده</span>
                    </td>
                    <td class="p-4">
                        <span dir="ltr">{{ new Date(data.createdAt).toLocaleString("fa") }}</span>
                    </td>
                </tr>
            </tbody>
        </table>
        <button class="t_button" @click="getTableData()" v-if="page < pageTotal && !isDataLoading">Load More</button>
        <span class="far fa-spinner fa-spin text-xl mx-auto" v-if="isDataLoading"></span>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "Transactions",
    components: {},
    data() {
        return {
            isDataLoading: false,

            transactions: [],
            page: 1,
            pp: 25,
            total: 0,
            pageTotal: 1,
        };
    },
    created() {},
    async mounted() {
        await this.getTransactions();
    },
    async beforeRouteUpdate(to, from, next) {
        this.$route.params.id = to.params.id;
        this.transactions = [];
        this.page = 1;
        this.pp = 25;
        this.total = 0;
        this.pageTotal = 1;
        await this.getTransactions();
        next();
    },
    methods: {
        async getTransactions() {
            if (this.isDataLoading || this.page > this.pageTotal) return;
            this.isDataLoading = true;

            let params = [`page=${this.page}`, `pp=${this.pp}`, `user_id=${this.$route.params.id}`, `sort=تاریخ`, `sort_type=desc`];
            params = params.join("&");

            await axios
                .get(`${this.getBaseUrl()}/api/v1/admin/transactions?${params}`)
                .then((response) => {
                    this.transactions = [...this.transactions, ...response.data.records];
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
