<template>
    <div class="dashboard_body">
        <div class="flex flex-wrap justify-between items-center gap-4">
            <h1 class="text-4xl"><b>Admins List</b></h1>
            <div class="flex items-center gap-2">
                <button class="t_button t_button_min bg-gray-200 hover:bg-gray-300 text-black"><i class="fas fa-print"></i> Export</button>
                <router-link
                    to="/admin/admins_list/create_admin"
                    class="t_button t_button_min bg-secondary-300 hover:bg-secondary-200 text-bluegray-700"
                    v-if="checkPermissions(['admin.admins.add'], adminInfo.permissions)"
                >
                    <i class="fal fa-plus"></i> <b>New Admin</b>
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
            <template v-slot:tbody="{ record, index }">
                <td>
                    <div class="flex items-center gap-2">
                        <img class="avatar" :src="record.image" v-if="record.image" alt="" />
                        <img class="avatar" src="http://localhost:3000/img/avatars/admin.png" v-else alt="" />
                        <span>{{ `${record.name} ${record.family}` }}</span>
                    </div>
                </td>
                <td>{{ record.email }}</td>
                <td>{{ record.role.name }}</td>
                <td>
                    <span class="p-1 px-2 text-sm rounded-md bg-emerald-100 text-emerald-700" v-if="record.status == 'active'"><b>Active</b></span>
                    <span class="p-1 px-2 text-sm rounded-md bg-rose-100 text-rose-700" v-if="record.status == 'deactive'"><b>Deactive</b></span>
                </td>
                <td>{{ new Date(record.createdAt).toLocaleString("en") }}</td>
                <td>
                    <div class="flex items-center gap-1">
                        <router-link
                            :to="`/admin/admins_list/admin/${record._id}`"
                            class="t_button p-2 rounded-md hover:bg-blue-300 hover:text-black"
                            title="Edit"
                            v-if="checkPermissions(['admin.admins.edit'], adminInfo.permissions)"
                        >
                            <i class="fal fa-pen"></i>
                        </router-link>
                        <button
                            class="t_button p-2 rounded-md hover:bg-red-300 hover:text-black"
                            title="Delete"
                            @click="askToDelete(record._id, `${record.name} ${record.family}`, index)"
                            v-if="checkPermissions(['admin.admins.delete'], adminInfo.permissions)"
                        >
                            <i class="fal fa-trash"></i>
                        </button>
                    </div>
                </td>
            </template>
        </t-table>

        <t-dialog v-model:open="filterDialogState" title="Filters">
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
                <hr class="border border-solid my-4" />
                <div class="flex flex-col">
                    <label class="mb-2">Status</label>
                    <ul class="flex flex-wrap gap-2 select-none">
                        <li class="t_button py-0 gap-2 rounded-full bg-gray-700 hover:bg-gray-800" @click="filterStatus('active')">
                            <i class="fal fa-check text-primary-100" v-if="filters.status.indexOf('active') != -1"></i>
                            <span class="text-lime-200">Active</span>
                        </li>
                        <li class="t_button py-0 gap-2 rounded-full bg-gray-700 hover:bg-gray-800" @click="filterStatus('deactive')">
                            <i class="fal fa-check text-primary-100" v-if="filters.status.indexOf('deactive') != -1"></i>
                            <span class="text-rose-200">Deactive</span>
                        </li>
                    </ul>
                </div>
                <hr class="border border-solid my-4" />
                <button class="t_button py-1 bg-primary-500 hover:bg-primary-600 text-bluegray-50" @click="filter()">Filter</button>
            </template>
        </t-dialog>

        <t-dialog v-model:open="deleteDialogState" title="Delete">
            <template v-slot:body>
                <div class="flex flex-col">
                    <i class="fad fa-exclamation-triangle text-red-500 my-4 mx-auto text-6xl"></i>
                    <span class="text-lg">Do you want to <b class="text-rose-300">DELETE</b> record "{{ deletingRecordName }}" هستید؟</span>
                    <small class="opacity-50">This action is permanent and can't be undone</small>
                </div>
                <hr class="border-solid my-4" />
                <div class="flex gap-2">
                    <button class="t_button py-1 bg-rose-400 hover:bg-rose-500" :disabled="deletingRecord" @click="deleteRecord()">
                        <b v-if="!deletingRecord">Delete</b>
                        <b v-else class="fad fa-spinner fa-spin text-xl"></b>
                    </button>
                    <button class="t_button py-1 border-primary-400 hover:bg-primary-500" @click="deleteDialogState = false">Cancel</button>
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
    name: "AdminsList",
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
            sort: { col: "Name", type: "asc" },
            page: 1,
            pp: 25,
            total: 0,
            pageTotal: 0,

            tableHeads: {
                Name: { sortable: true },
                Email: { sortable: true },
                Role: { sortable: true },
                Status: { sortable: true },
                "Register Date": { sortable: true },
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
                .get(`${this.getBaseUrl()}/api/v1/admin/admins?${params}`)
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
                .delete(`${this.getBaseUrl()}/api/v1/admin/admins/${this.deletingRecordId}`)
                .then((response) => {
                    this.makeToast({ title: "Delete Admin", message: `Admin ${this.deletingRecordName} has been deleted successfully`, type: "success" });
                    this.tableData.splice(this.deletingRecordIndex, 1);
                })
                .catch((error) => {
                    if (error.response.data) {
                        this.makeToast({ title: "Delete Admin", message: error.response.data.error, type: "danger" });
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
        filterStatus(status) {
            if (this.filters.status.indexOf(status) != -1) {
                this.filters.status.splice(this.filters.status.indexOf(status), 1);
            } else {
                this.filters.status.push(status);
            }
        },
    },
};
</script>

<style></style>
