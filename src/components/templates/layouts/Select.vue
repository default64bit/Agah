<template>
    <div class="t_select" :class="{ open: open }">
        <label class="relative" v-if="label">
            <span>{{ label }}</span>
            <i class="absolute text-primary-400 fa-xs mx-1 fas fa-star-christmas" v-if="required"></i>
        </label>
        <div class="flex flex-col flex-grow">
            <div class="t_select_input" :class="inputClass">
                <div class="box" tabindex="0" @click="toggleMenu()" @blur="toggleMenu(false)">
                    <span name="placeholder" class="opacity-50" v-if="placeholder && !selectedOption.value">{{ placeholder }}</span>
                    <span name="value" v-if="selectedOption.name">{{ selectedOption.name }}</span>
                </div>
                <transition name="slidedown" mode="out-in" appear>
                    <ol class="list" v-if="open">
                        <li
                            v-for="(option, i) in options"
                            :key="i"
                            :class="{ selected: option.value == selectedOption.value }"
                            @mousedown="selectOption(option)"
                        >
                            <slot name="option" :option="option"></slot>
                        </li>
                    </ol>
                </transition>
            </div>
            <div class="desc opacity-50 text-xs mt-2" v-if="desc">{{ desc }}</div>
            <div v-if="error" class="flex gap-1 items-center w-max rounded bg-red-100 text-red-700 p-1 mt-1 text-xs">
                <i class="far fa-exclamation-circle"></i>
                <span>{{ error }}</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Select",
    props: ["selectedOption", "placeholder", "label", "options", "desc", "error", "inputClass", "required"],
    data() {
        return {
            open: false,
        };
    },
    created() {},
    mounted() {},
    methods: {
        toggleMenu(state = null) {
            this.open = state != null ? state : !this.open;
        },

        selectOption(option) {
            this.$emit("update:selectedOption", option);
            this.toggleMenu(false);
        },
    },
};
</script>

<style></style>
