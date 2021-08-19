<template>
    <transition name="slidedown" mode="out-in" appear="">
        <div class="dashboard_toast" :class="borderColor" v-if="show">
            <button class="dashboard_toast_close t_button text-violet-500 hover:bg-gray-800" @click="close()" v-if="toastOptions.dismissible">
                <i class="fas fa-times"></i>
            </button>

            <i v-if="toastOptions.icon" :class="toastOptions.icon" class="text-lg"></i>
            <div class="flex flex-col gap-1">
                <h4 v-if="toastOptions.title" class="text-xl max-w-xs text-gray-200">
                    <b>{{ toastOptions.title }}</b>
                </h4>
                <p v-if="toastOptions.message" class="text-sm max-w-xs text-gray-300">{{ toastOptions.message }}</p>
            </div>
        </div>
    </transition>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    name: "DashboardToast",
    data() {
        return {
            show: false,
            borderColor: "border-white",
        };
    },
    mounted() {},
    watch: {
        toastOptions: function(newOptions, oldOptions) {
            switch (newOptions.type) {
                case "info":
                    this.borderColor = "border-cyan-500";
                    break;
                case "success":
                    this.borderColor = "border-lime-500";
                    break;
                case "warning":
                    this.borderColor = "border-amber-500";
                    break;
                case "danger":
                    this.borderColor = "border-rose-500";
                    break;
                case "default":
                    this.borderColor = "border-violet-500";
                    break;
            }

            this.show = true;

            setTimeout(() => {
                this.show = false;
            }, newOptions.delay);
        },
    },
    computed: {
        ...mapGetters(["toastOptions"]),
    },
    methods: {
        close() {
            this.show = false;
        },
    },
};
</script>

<style></style>
