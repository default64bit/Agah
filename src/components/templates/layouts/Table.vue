<template>
    <div class="t_table">
        <div class="flex flex-wrap justify-between items-center">
            <small class="opacity-50">{{ `showing ${(page - 1) * pp + 1} - ${end} out of ${total} results` }}</small>
            <div class="flex items-center gap-2">
                <small class="opacity-50">results per page</small>
                <t-select
                    class="w-auto"
                    inputClass="text-sm py-1"
                    :options="ppOptions"
                    v-model:selectedOption="selectedPP"
                    @update:selectedOption="updatePerPage()"
                >
                    <template v-slot:option="{ option }">
                        <option :value="option.value">{{ option.name }}</option>
                    </template>
                </t-select>
            </div>
        </div>

        <div class="flex flex-col w-full h-full overflow-auto" v-if="!loading">
            <table :class="tableView">
                <thead>
                    <tr>
                        <th
                            v-for="(value, name) in heads"
                            :key="name"
                            class=""
                            :sortable="value.sortable"
                            @click="updateSort(value.sortable, name)"
                        >
                            <div class="flex items-center gap-4">
                                <span>{{ name }}</span>
                                <i
                                    class="text-primary-400 fad fa-sort"
                                    :class="{ 'fa-sort-up': sort.col == name && sort.type == 'asc', 'fa-sort-down': sort.col == name && sort.type == 'desc' }"
                                    v-if="value.sortable"
                                ></i>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <transition-group name="slideright" appear>
                        <tr v-for="(record, i) in records" :key="i">
                            <slot name="tbody" v-if="!isEmpty" :record="record" :index="i"></slot>
                        </tr>
                    </transition-group>
                </tbody>
            </table>
            <div class="flex justify-center items-center p-4 text-primary-400 text-lg" v-if="isEmpty">No Data Available</div>
        </div>
        <div class="t_card_loading" v-else>
            <i class="fad fa-spinner-third fa-spin fa-5x text-primary-400"></i>
        </div>

        <div class="t_table_pages flex items-center flex-wrap gap-4 mt-auto pt-2 border-t-2 border-solid">
            <button class="t_button py-1 hover:border-primary-500 border-warmgray-500 border-2 border-solid" :disabled="page == 1" @click="prev">
                <i class="fas fa-chevron-left text-primary-400"></i> <span>قبلی</span>
            </button>
            <div class="flex items-center justify-center gap-2" dir="auto">
                <t-input class="w-10 py-0" type="text" v-model:value="tempPage" @keyup="updatePage($event)"></t-input>
                <span>Of {{ pageTotal }}</span>
            </div>
            <button class="t_button py-1 hover:border-primary-500 border-warmgray-500 border-2 border-solid" :disabled="page == pageTotal" @click="next">
                <span>بعدی</span> <i class="fas fa-chevron-right text-primary-400"></i>
            </button>
        </div>
    </div>
</template>

<script>
import Input from "./Input";
import Select from "./Select";

export default {
    name: "Table",
    props: ["heads", "records", "sort", "page", "pp", "total", "pageTotal", "loading", "isEmpty", "view"],
    components: {
        "t-input": Input,
        "t-select": Select,
    },
    data() {
        return {
            tableView: "list",
            tempPage: 1,

            ppOptions: [
                { name: 25, value: 25 },
                { name: 50, value: 50 },
                { name: 100, value: 100 },
                { name: 200, value: 200 },
            ],
            selectedPP: { name: 25, value: 25 },
        };
    },
    created() {},
    mounted() {
        if (localStorage.getItem("tableView") !== null) {
            this.tableView = localStorage.getItem("tableView");
            this.$emit("update:view", this.tableView);
        }
    },
    watch: {
        view(newValue, oldValue) {
            this.tableView = newValue;
            localStorage.setItem("tableView", newValue);
        },
    },
    computed: {
        end() {
            let end = this.total < this.page * this.pp ? this.total : this.page * this.pp;
            return end;
        },
    },
    methods: {
        updatePerPage() {
            this.$emit("update:pp", this.selectedPP.value);
            this.$emit("update:table");
        },
        updatePage(e, force = false) {
            if (isNaN(this.tempPage)) return;

            if (0 < this.tempPage && this.tempPage <= this.pageTotal && this.tempPage != this.page) {
                if (e.keyCode == 13 || force) {
                    this.$emit("update:page", this.tempPage);
                    this.$emit("update:table");
                }
            }
        },
        updateSort(sortable, name) {
            if (!sortable) return;

            if (this.sort.col == name) {
                this.sort.type = this.sort.type == "asc" ? "desc" : "asc";
            }
            this.sort.col = name;

            this.$emit("update:sort", this.sort);
            this.$emit("update:table");
        },

        next(e) {
            this.tempPage += 1;
            this.updatePage(e, true);
        },
        prev(e) {
            this.tempPage -= 1;
            this.updatePage(e, true);
        },
    },
};
</script>

<style></style>
