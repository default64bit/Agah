<template>
    <div class="t_complex">
        <div class="flex items-center flex-wrap gap-4">
            <h3 class="text-xl">{{ title }}</h3>
            <button class="t_button p-1 border-lime-500 hover:bg-lime-600 w-max text-sm" @click="addItem()">Add Item</button>
        </div>
        <div class="flex flex-col items-start">
            <div class="flex flex-col md:flex-row items-end w-full gap-4 p-2" v-for="(item, i) in items" :key="i">
                <slot name="item" :item="item" :i="i"></slot>
                <button class="t_button border-rose-400 hover:bg-rose-500 rounded mb-1" @click="removeItem(i)">
                    <i class="far fa-trash-alt"></i>
                </button>
            </div>
        </div>
        <div v-if="error" class="flex gap-1 items-center rounded bg-red-100 text-red-700 p-1 mt-1 text-xs">
            <i class="far fa-exclamation-circle"></i>
            <b>{{ error }}</b>
        </div>
    </div>
</template>

<script>
export default {
    name: "Complex",
    props: ["title", "items", "error"],
    data() {
        return {};
    },
    mounted() {},
    methods: {
        addItem() {
            const itemsLocal = this.items;
            itemsLocal.push({ name: "", value: "" });
            this.updateItems(itemsLocal);
        },

        removeItem(index) {
            const itemsLocal = this.items;
            itemsLocal.splice(index, 1);
            this.updateItems(itemsLocal);
        },

        updateItems(items) {
            this.$emit("update:items", items);
        },
    },
};
</script>

<style></style>
