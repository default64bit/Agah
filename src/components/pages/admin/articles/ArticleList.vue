<template>
    <div class="dashboard_body">
        <div class="flex flex-wrap justify-between items-center gap-4">
            <h1 class="text-4xl"><b>مقالات</b></h1>
            <div class="flex items-center gap-2">
                <router-link
                    to="/admin/articles/new"
                    class="t_button t_button_min bg-secondary-300 hover:bg-secondary-200 text-bluegray-700"
                    v-if="checkPermissions(['admin.articles.add'], adminInfo.permissions)"
                >
                    <i class="fal fa-plus"></i> <b>مقاله جدید</b>
                </router-link>
            </div>
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
                    <i class="far fa-th-list fa-lg"></i>
                </button>
                <button class="t_button p-2 text-sm" :class="tableView == 'card' ? 'text-primary-500' : 'text-gray-300'" @click="tableView = 'card'">
                    <i class="far fa-th-large fa-lg"></i>
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
            <template v-slot:tbody="{ record, index }">
                <td>
                    <div class="flex items-center gap-2">
                        <img class="h-10 max-w-xs object-contain" :src="record.metadata.thumbnail" alt="" />
                        <span>{{ record.title }}</span>
                    </div>
                </td>
                <td>
                    <div class="flex items-center gap-2">
                        <img class="avatar" :src="record.author[0].image" v-if="record.author[0].image" alt="" />
                        <img class="avatar" src="http://localhost:3000/img/avatars/admin.png" v-else alt="" />
                        <span>{{ `${record.author[0].name} ${record.author[0].family}` }}</span>
                    </div>
                </td>
                <td>
                    <span class="title">بازدیدها:</span>
                    <span>{{ record.views }}</span>
                </td>
                <td>
                    <span class="p-1 px-2 text-xs rounded-md bg-emerald-100 text-emerald-700" v-if="record.status == 'published'">منتشر شده</span>
                    <span class="p-1 px-2 text-xs rounded-md bg-indigo-100 text-indigo-700" v-if="record.status == 'pending'">منتظر انتشار</span>
                </td>
                <td>{{ new Date(record.publishedAt).toLocaleString("fa") }}</td>
                <td>{{ new Date(record.createdAt).toLocaleString("fa") }}</td>
                <td>
                    <div class="flex items-center gap-1">
                        <router-link
                            :to="`/admin/articles/${record._id}`"
                            class="t_button p-2 rounded-md hover:bg-blue-300 hover:text-black"
                            title="Edit"
                            v-if="checkPermissions(['admin.articles.edit'], adminInfo.permissions)"
                        >
                            <i class="fal fa-pen"></i>
                        </router-link>
                        <button
                            class="t_button p-2 rounded-md hover:bg-red-300 hover:text-black"
                            title="Delete"
                            @click="askToDelete(record._id, record.title, index)"
                            v-if="checkPermissions(['admin.articles.delete'], adminInfo.permissions)"
                        >
                            <i class="fal fa-trash"></i>
                        </button>
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
                            label="From Register Date"
                            desc="yyyy/mm/dd"
                            maskPattern="0000/00/00"
                            v-model:value="filters.fromRegisterDate"
                        />
                        <t-input
                            type="text"
                            icon="fad fa-calendar-alt"
                            label="To Register Date"
                            desc="yyyy/mm/dd"
                            maskPattern="0000/00/00"
                            v-model:value="filters.toRegisterDate"
                        />
                    </div>
                </div>
                <hr class="border-solid my-4" />
                <button class="t_button py-1 bg-primary-500 hover:bg-primary-600 text-bluegray-50" @click="filter()">فیلتر</button>
            </template>
        </t-dialog>

        <t-dialog v-model:open="deleteDialogState" title="حذف">
            <template v-slot:body>
                <div class="flex flex-col">
                    <i class="fad fa-exclamation-triangle text-red-500 my-4 mx-auto text-6xl"></i>
                    <span class="text-lg">آیا مطمئن به <b class="text-rose-300">حذف</b> رکورد "{{ deletingRecordName }}" هستید؟</span>
                    <small class="opacity-50">این عملیات غیرقبل بازگشت است</small>
                </div>
                <hr class="border-solid my-4" />
                <div class="flex gap-2">
                    <button class="t_button py-1 bg-rose-400 hover:bg-rose-500" :disabled="deletingRecord" @click="deleteRecord()">
                        <b v-if="!deletingRecord">حذف</b>
                        <b v-else class="fad fa-spinner fa-spin text-xl"></b>
                    </button>
                    <button class="t_button py-1 border-primary-400 hover:bg-primary-500" @click="deleteDialogState = false">لغو</button>
                </div>
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
    name: "ArticleList",
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
            sort: { col: "تاریخ انتشار", type: "desc" },
            page: 1,
            pp: 25,
            total: 0,
            pageTotal: 0,

            tableHeads: {
                عنوان: { sortable: true },
                نویسنده: { sortable: true },
                بازدیدها: { sortable: true },
                وضعیت: { sortable: true },
                "تاریخ انتشار": { sortable: true },
                "تاریخ ثبت": { sortable: true },
                Actions: { sortable: false },
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
                .get(`${this.getBaseUrl()}/api/v1/admin/articles?${params}`)
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

        askToDelete(id, name, index) {
            this.deletingRecordId = id;
            this.deletingRecordName = name;
            this.deletingRecordIndex = index;
            this.deleteDialogState = true;
        },
        deleteRecord() {
            this.deletingRecord = true;
            axios
                .delete(`${this.getBaseUrl()}/api/v1/admin/article/${this.deletingRecordId}`)
                .then((response) => {
                    this.makeToast({ title: "Delete Article", message: `Article ${this.deletingRecordName} has been deleted successfully`, type: "success" });
                    this.tableData.splice(this.deletingRecordIndex, 1);
                })
                .catch((error) => {
                    if (error.response.data) {
                        this.makeToast({ title: "Delete Article", message: error.response.data.error, type: "danger" });
                    }
                })
                .finally(() => {
                    this.deletingRecordId = "";
                    this.deletingRecordName = "";
                    this.deletingRecordIndex = "";
                    this.deletingRecord = false;
                    this.deleteDialogState = false;
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
