<template>
    <div class="t_input">
        <label class="relative text-gray-100" v-if="label">
            <span>{{ label }}</span>
            <i class="absolute text-violet-400 fa-xs mx-1 fas fa-star-christmas" v-if="required"></i>
        </label>
        <div class="flex flex-col flex-grow">
            <div class="input_group bg-gray-600" :class="{ focus: focus, disabled: disabled }">
                <i class="text-gray-400" :class="icon" v-if="icon"></i>
                <input
                    dir="auto"
                    class="text-white"
                    :name="name"
                    :type="inputType"
                    :placeholder="placeholder"
                    :disabled="disabled"
                    v-model="value"
                    ref="input"
                    @input="updateValue()"
                    @focus="toggleFocus()"
                    @blur="toggleFocus()"
                    v-if="inputType != 'textarea'"
                />
                <textarea
                    dir="auto"
                    class="text-white"
                    :name="name"
                    :placeholder="placeholder"
                    :disabled="disabled"
                    v-model="value"
                    ref="input"
                    @input="updateValue()"
                    @focus="toggleFocus()"
                    @blur="toggleFocus()"
                    v-if="inputType == 'textarea'"
                ></textarea>
                <b
                    v-if="isPassword"
                    @click="passwordViewToggle()"
                    class="cursor-pointer text-gray-300 far fa-eye fa-sm"
                    :class="{ 'fa-eye-slash': inputType != 'password' }"
                ></b>
                <b v-if="isSearch && value" @click="clearInput()" class="cursor-pointer text-violet-300 far fa-times fa-sm"></b>
                <b v-if="!isPassword && !isSearch && postInputText" class="text-gray-300 text-sm">{{ postInputText }}</b>
            </div>
            <div class="desc text-gray-400 text-xs mt-2" v-if="desc">{{ desc }}</div>
            <div v-if="error" class="flex gap-1 items-center rounded bg-red-100 text-red-700 p-1 mt-1 text-xs">
                <i class="far fa-exclamation-circle"></i>
                <b>{{ error }}</b>
            </div>
        </div>
    </div>
</template>

<script>
import IMask from "imask";

export default {
    name: "Button",
    // props: ["type", "name", "label", "value", "placeholder", "icon", "desc", "error", "required", "maskPattern"],
    props: {
        type: { type: String },
        name: { type: String },
        label: { type: String },
        value: {},
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
            isPassword: this.type == "password",
            isSearch: this.type == "search",
            inputType: this.type,
        };
    },
    created() {},
    mounted() {},
    methods: {
        updateValue() {
            if (!!this.maskPattern) {
                IMask(this.$refs.input, { mask: this.maskPattern });
            }
            this.$emit("update:value", this.value);
        },
        toggleFocus() {
            this.focus = !this.focus;
        },

        passwordViewToggle() {
            this.inputType = this.inputType == "password" ? "text" : "password";
        },

        clearInput() {
            this.$emit("update:value", "");
        },
    },
};
</script>

<style scoped></style>
