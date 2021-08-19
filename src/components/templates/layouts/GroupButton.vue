<template>
    <div class="t_group_button" :class="{'z-10':open}">
        <div class="flex" tabindex="0" @click="toggleMenu()" @blur="toggleMenu(false)">
            <slot name="button"></slot>
        </div>
        <transition name="slidedown" mode="out-in" appear>
            <ol class="list mt-1" v-if="open">
                <slot name="buttons"></slot>
            </ol>
        </transition>
    </div>
</template>

<script>
export default {
    name: "GroupButton",
    props: [],
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
    },
};
</script>

<style></style>
