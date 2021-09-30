<template>
    <div class="dashboard_body">
        <div class="flex flex-wrap justify-between items-center gap-4">
            <h1 class="text-4xl"><b>مشاوره ها</b></h1>
            <div class="flex items-center gap-2"></div>
        </div>

        <hr class="my-4 border-solid" />

        <div class="flex flex-wrap justify-between items-center gap-4">
            <div class="flex flex-wrap md:flex-nowrap items-center gap-2">
                <t-input type="search" icon="fad fa-search" placeholder="Search..." v-model:value="search" @keydown="searchTable($event)" />
                <button class="t_button t_button_min" @click="filterDialogState = true"><i class="far fa-sliders-h"></i> Filters</button>
                <t-groupbutton>
                    <template v-slot:button>
                        <span class="t_button t_button_min"><i class="fas fa-sort-amount-up"></i> Sort</span>
                    </template>
                    <template v-slot:buttons>
                        <span
                            class="flex justify-between items-center gap-4 rounded p-2"
                            v-for="(item, name) in sortOptions"
                            :key="name"
                            @click="updateSort(name)"
                        >
                            <span> {{ name }} </span>
                            <i
                                class="text-primary-400 fad fa-sort"
                                :class="{ 'fa-sort-up': sort.col == name && sort.type == 'asc', 'fa-sort-down': sort.col == name && sort.type == 'desc' }"
                            ></i>
                        </span>
                    </template>
                </t-groupbutton>
            </div>
            <div class="flex justify-center items-center gap-1">
                <button class="t_button p-2 text-sm" :class="tableView == 'list' ? 'text-primary-500' : 'text-gray-300'" @click="tableView = 'list'">
                    <i class="fas fa-th-list fa-lg"></i>
                </button>
                <button class="t_button p-2 text-sm" :class="tableView == 'card' ? 'text-primary-500' : 'text-gray-300'" @click="tableView = 'card'">
                    <i class="fas fa-th-large fa-lg"></i>
                </button>
            </div>
        </div>

        <t-table
            class="mt-4"
            :heads="tableHeads"
            :records="tableData"
            v-model:view="tableView"
            v-model:sort="sort"
            v-model:page="page"
            v-model:pp="pp"
            :loading="isDataLoading"
            :isEmpty="!tableData.length"
            :total="total"
            :pageTotal="pageTotal"
            @update:table="getTableData()"
        >
            <template v-slot:tbody="{ record, index }" :index="index">
                <td>
                    <span class="title">کاربر:</span>
                    <span>{{ `${record.user[0].name} ${record.user[0].family}` }}</span>
                </td>
                <td>
                    <span class="title">مشاور:</span>
                    <span>{{ `${record.consulter[0].name} ${record.consulter[0].family}` }}</span>
                </td>
                <td>
                    <span class="title">زمان مشاوره:</span>
                    <!-- <span>{{ `${record.date} ${record.time}` }}</span> -->
                    <span>{{ new Date(`${record.date} ${record.time}`).toLocaleString("fa") }}</span>
                </td>
                <td>
                    <span class="title">نوع:</span>
                    <span v-if="record.type == 'in-person'">حضوری</span>
                    <span v-if="record.type == 'online'">آنلاین</span>
                </td>
                <td>
                    <span class="title">وضعیت:</span>
                    <span class="p-1 px-2 text-sm rounded-md bg-indigo-100 text-indigo-700" v-if="record.status == 'waiting-for-payment'">منتظر پرداخت</span>
                    <span class="p-1 px-2 text-sm rounded-md bg-emerald-100 text-emerald-700" v-if="record.status == 'payed'">پرداخت شده</span>
                    <span class="p-1 px-2 text-sm rounded-md bg-red-100 text-red-700" v-if="record.status == 'finished'">انجام شده</span>
                    <span class="p-1 px-2 text-sm rounded-md bg-rose-100 text-rose-700" v-if="record.status == 'canceled'">لغو شده</span>
                </td>
                <td>
                    <span>{{ new Date(record.createdAt).toLocaleString("fa") }}</span>
                </td>
                <td>
                    <div class="flex items-center gap-1">
                        <router-link
                            :to="`/admin/booked_schedules/${record._id}`"
                            class="t_button p-2 rounded-md hover:bg-blue-300 hover:text-black"
                            title="Edit"
                            v-if="checkPermissions(['admin.booked_schedules.edit'], adminInfo.permissions)"
                        >
                            <i class="fal fa-pen"></i>
                        </router-link>
                    </div>
                </td>
            </template>
        </t-table>

        <t-dialog v-model:open="filterDialogState" title="فیلترها">
            <template v-slot:body>
                <div class="flex flex-col">
                    <div class="flex items-center gap-4">
                        <t-input
                            type="text"
                            icon="fad fa-calendar-alt"
                            label="از تاریخ"
                            desc="yyyy/mm/dd"
                            maskPattern="0000/00/00"
                            v-model:value="filters.fromRegisterDate"
                        />
                        <t-input
                            type="text"
                            icon="fad fa-calendar-alt"
                            label="تا تاریخ"
                            desc="yyyy/mm/dd"
                            maskPattern="0000/00/00"
                            v-model:value="filters.toRegisterDate"
                        />
                    </div>
                </div>
                <hr class="border border-solid my-4" />
                <button class="t_button py-1 bg-primary-500 hover:bg-primary-600 text-bluegray-50" @click="filter()">فیلتر</button>
            </template>
        </t-dialog>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import axios from "axios";

import Input from "../../../templates/layouts/Input";
import GroupButton from "../../../templates/layouts/GroupButton";
import Table from "../../../templates/layouts/Table";
import Dialog from "../../../templates/layouts/Dialog";

export default {
    name: "BookedSchedules",
    components: {
        "t-input": Input,
        "t-groupbutton": GroupButton,
        "t-table": Table,
        "t-dialog": Dialog,
    },
    data() {
        return {
            isDataLoading: false,

            search: "",
            filters: {
                fromRegisterDate: "",
                toRegisterDate: "",
                status: [],
            },
            sort: { col: "زمان مشاوره", type: "desc" },
            page: 1,
            pp: 25,
            total: 0,
            pageTotal: 0,

            tableHeads: {
                کاربر: { sortable: true },
                مشاور: { sortable: true },
                "زمان مشاوره": { sortable: true },
                نوع: { sortable: true },
                وضعیت: { sortable: true },
                "تاریخ ثبت": { sortable: true },
                عملیات: { sortable: false },
            },
            tableData: [],
            tableView: "list",

            deletingRecord: false,
            deletingRecordId: "",
            deletingRecordName: "",
            deletingRecordIndex: "",

            filterDialogState: false,
            deleteDialogState: false,
        };
    },
    created() {},
    mounted() {
        this.getTableData();
    },
    computed: {
        ...mapGetters(["adminInfo"]),

        sortOptions() {
            let sortOptions = {};
            for (let item in this.tableHeads) {
                if (this.tableHeads[item].sortable) sortOptions[item] = this.tableHeads[item];
            }
            return sortOptions;
        },
    },
    methods: {
        ...mapActions(["makeToast"]),

        getTableData() {
            this.isDataLoading = true;

            let params = [`page=${this.page}`, `pp=${this.pp}`, `sort=${this.sort.col}`, `sort_type=${this.sort.type}`, `search=${this.search}`];
            for (let item in this.filters) {
                if (this.filters[item]) {
                    let filterName = item
                        .replace(/\.?([A-Z])/g, function(x, y) {
                            return "_" + y.toLowerCase();
                        })
                        .replace(/^_/, "");
                    let value = this.filters[item];
                    if (typeof value === "object") value = value.toString();
                    params.push(`${filterName}=${this.filters[item]}`);
                }
            }
            params = params.join("&");

            axios
                .get(`${this.getBaseUrl()}/api/v1/admin/booked_schedules?${params}`)
                .then((response) => {
                    this.tableData = response.data.records;
                    this.total = response.data.total;
                    this.pageTotal = response.data.pageTotal;
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

        searchTable(e) {
            if (e.keyCode == 13) this.getTableData();
        },

        updateSort(col) {
            let newSort = { col: col, type: "asc" };
            if (this.sort.col == col) {
                newSort.type = this.sort.type == "asc" ? "desc" : "asc";
            }
            this.sort = newSort;
            this.getTableData();
        },

        filter() {
            this.filterDialogState = false;
            this.getTableData();
        },
    },
};
</script>

<style></style>
