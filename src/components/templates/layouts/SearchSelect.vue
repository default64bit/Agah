<template>
    <div class="t_select t_search_select" :class="{ open: open }">
        <label class="relative" v-if="label">
            <span>{{ label }}</span>
            <i class="absolute text-primary-400 fa-xs mx-1 fas fa-star-christmas" v-if="required"></i>
        </label>
        <div class="flex flex-col flex-grow">
            <div class="t_select_input" :class="inputClass">
                <div class="box">
                    <!-- <span name="placeholder" class="opacity-50" v-if="placeholder && !selectedOption.value">{{ placeholder }}</span> -->
                    <!-- <span name="value" v-if="selectedOption.name">{{ selectedOption.name }}</span> -->
                    <input
                        dir="auto"
                        autocomplete="new-password"
                        name="search"
                        class="text-white"
                        type="text"
                        :placeholder="placeholder"
                        v-model="searchValue"
                        @input="search()"
                        @focus="toggleMenu()"
                        @blur="toggleMenu(false)"
                    />
                </div>
                <transition name="slidedown" mode="out-in" appear>
                    <ul class="list" v-if="open">
                        <li
                            v-for="(option, i) in options"
                            :key="i"
                            :class="{ selected: option.value == selectedOption.value }"
                            @mousedown="selectOption(option)"
                        >
                            <slot name="option" :option="option"></slot>
                        </li>
                        <li class="text-sm text-rose-300" v-if="noResult">no results</li>
                    </ul>
                </transition>
            </div>
            <div class="desc text-gray-400 text-xs mt-2" v-if="desc">{{ desc }}</div>
            <div v-if="error" class="flex gap-1 items-center w-max rounded bg-red-100 text-red-700 p-1 mt-1 text-xs">
                <i class="far fa-exclamation-circle"></i>
                <b>{{ error }}</b>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Select",
    props: ["selectedOption", "placeholder", "label", "options", "desc", "error", "inputClass", "required", "noResult"],
    data() {
        return {
            open: false,
            searchValue: "",
            searchTimer: null,
        };
    },
    created() {},
    mounted() {},
    watch: {
        selectedOption(newVlue, oldValue) {
            this.searchValue = newVlue.name;
        },
    },
    methods: {
        toggleMenu(state = null) {
            this.open = state != null ? state : !this.open;
        },

        selectOption(option) {
            this.$emit("update:selectedOption", option);
            this.toggleMenu(false);
            this.searchValue = option.name;
        },

        search() {
            clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => {
                this.$emit("search", this.searchValue);
            }, 2000);
        },
    },
};
</script>

<style></style>
