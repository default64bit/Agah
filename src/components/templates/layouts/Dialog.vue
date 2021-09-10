<template>
    <teleport to="body">
        <transition name="fade" appear>
            <div class="t_dialog" :class="{ open: open }" v-show="open">
                <div class="backdrop" @click="close()"></div>
                <transition name="slidedown" appear>
                    <div class="box" :class="boxClass" v-show="open">
                        <div class="flex justify-between items-center gap-4 mb-4">
                            <h2 class="text-lg">
                                <b>{{ title }}</b>
                            </h2>
                            <button class="t_button p-1 hover:bg-gray-600 hover:text-bluegray-50" @click="close()">
                                <i class="far fa-times h-4 text-primary-400 text-xl"></i>
                            </button>
                        </div>
                        <slot name="body"></slot>
                    </div>
                </transition>
            </div>
        </transition>
    </teleport>
</template>

<script>
export default {
    name: "Dialog",
    props: ["open", "title","boxClass"],
    data() {
        return {};
    },
    created() {},
    mounted() {},
    methods: {
        close() {
            this.$emit("update:open", false);
        },
    },
};
</script>

<style></style>
