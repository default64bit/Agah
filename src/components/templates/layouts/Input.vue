<template>
    <div class="t_input">
        <div class="flex justify-between items-end" v-if="label">
            <label class="relative">
                <span>{{ label }}</span>
                <i class="absolute text-primary-400 fa-xs fas fa-star-christmas" v-if="required"></i>
            </label>
            <small v-if="!!maxCount">{{ `${count}/${maxCount}` }}</small>
        </div>
        <div class="flex flex-col flex-grow">
            <div class="input_group" :class="{ focus: focus, disabled: disabled }">
                <i class="text-gray-400" :class="icon" v-if="icon"></i>
                <input
                    dir="auto"
                    class=""
                    :name="name"
                    :type="inputType"
                    :placeholder="placeholder"
                    :disabled="disabled"
                    :value="value"
                    ref="input"
                    @input="updateValue()"
                    @focus="toggleFocus()"
                    @blur="toggleFocus()"
                    v-if="inputType != 'textarea'"
                />
                <textarea
                    dir="auto"
                    class=""
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
                    class="cursor-pointer opacity-30 far fa-eye fa-sm"
                    :class="{ 'fa-eye-slash': inputType != 'password' }"
                ></b>
                <b v-if="isSearch && value" @click="clearInput()" class="cursor-pointer text-primary-300 far fa-times fa-sm"></b>
                <b v-if="!isPassword && !isSearch && postInputText" class="opacity-30 text-sm">{{ postInputText }}</b>
            </div>
            <div class="desc opacity-50 text-xs mt-2" v-if="desc">{{ desc }}</div>
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
    name: "Input",
    props: {
        type: { type: String },
        name: { type: String },
        label: { type: String },
        maxCount: { type: String },
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
            count: 0,
        };
    },
    created() {},
    mounted() {},
    methods: {
        updateValue() {
            if (!!this.maskPattern) IMask(this.$refs.input, { mask: this.maskPattern });

            let localValue = this.$refs.input.value;

            if (!!this.maxCount && this.count >= this.maxCount) localValue = localValue.substr(0, this.count);
            this.count = localValue.length;

            this.$refs.input.value = localValue;
            this.$emit("update:value", localValue);
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
