<template>
    <div class="t_input">
        <label class="relative" v-if="label">
            <span>{{ label }}</span>
            <i class="absolute text-primary-400 fa-xs mx-1 fas fa-star-christmas" v-if="required"></i>
        </label>
        <ul class="flex flex-wrap gap-2 mb-2" v-if="list.length">
            <li class="flex items-center gap-1 p-1 rounded bg-warmgray-700 text-white" v-for="(item, i) in list" :key="i">
                <span class="text-sm">{{ item }}</span>
                <b class="fas fa-times text-xs text-rose-200 cursor-pointer" @click="removeTag(i)"></b>
            </li>
        </ul>
        <div class="flex flex-col flex-grow">
            <div class="input_group" :class="{ focus: focus, disabled: disabled }">
                <i class="text-gray-400" :class="icon" v-if="icon"></i>
                <input
                    dir="auto"
                    type="text"
                    :name="name"
                    :placeholder="placeholder"
                    :disabled="disabled"
                    v-model="value"
                    ref="input"
                    @keydown="updateList($event)"
                    @focus="toggleFocus()"
                    @blur="toggleFocus()"
                />
                <b v-if="postInputText" class="opacity-30 text-sm">{{ postInputText }}</b>
            </div>
            <div class="desc opacity-50 text-xs mt-2" v-if="desc">{{ desc }}</div>
            <div v-if="error" class="flex gap-1 items-center rounded bg-red-100 text-red-700 p-1 mt-1 text-xs">
                <i class="far fa-exclamation-circle"></i>
                <span>{{ error }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import IMask from "imask";

export default {
    name: "TagInput",
    props: {
        name: { type: String },
        label: { type: String },
        list: {},
        postInputText: { type: String },
        placeholder: { type: String },
        icon: { type: String },
        desc: { type: String },
        error: { type: String },
        required: { type: Boolean },
        maskPattern: { type: String },
        disabled: { default: false },
    },
    data() {
        return {
            focus: false,
            value: "",
        };
    },
    created() {},
    mounted() {},
    methods: {
        updateList(e) {
            if (!!this.maskPattern) {
                IMask(this.$refs.input, { mask: this.maskPattern });
            }
            if (e.keyCode == 13) {
                let list = this.list;
                if (list.indexOf(this.value) === -1) {
                    list.push(this.value);
                    this.$emit("update:list", list);
                }
                this.value = "";
            }
        },
        toggleFocus() {
            this.focus = !this.focus;
        },
        removeTag(index) {
            let list = this.list;
            list.splice(index, 1);
            this.$emit("update:list", list);
        },
    },
};
</script>

<style scoped></style>
