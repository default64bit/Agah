<template>
    <div class="t_checkbox">
        <label class="" v-if="label">{{ label }}</label>
        <div class="flex flex-col flex-grow">
            <div class="input_group">
                <input class="text-white" :type="type" :name="name" v-model="value" />
                <div class="flex items-start gap-2 cursor-pointer select-none" @click="toggleCheck()">
                    <i class="text-primary-500 mt-1" :class="value == 'true' ? 'fas fa-check-square' : 'far fa-square'"></i>
                    <span class="text-sm">
                        <slot name="desc"></slot>
                    </span>
                </div>
            </div>
            <div v-if="error" class="flex gap-1 items-center rounded bg-red-100 text-red-700 p-1 mt-1 text-xs">
                <i class="far fa-exclamation-circle"></i>
                <span>{{ error }}</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Button",
    // props: ["name", "label", "value", "desc", "error"],
    props: {
        name: {},
        label: {},
        type: { default: "checkbox" },
        value: { default: "false" },
        desc: {},
        error: {},
    },
    data() {
        return {};
    },
    created() {},
    mounted() {},
    methods: {
        updateValue() {
            this.$emit("update:value", this.value);
        },
        toggleCheck() {
            if (this.value == "true") {
                this.$emit("update:value", "false");
            } else {
                this.$emit("update:value", "true");
            }
        },
    },
};
</script>

<style scoped></style>
