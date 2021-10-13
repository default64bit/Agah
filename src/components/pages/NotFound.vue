<template>
    <div class="main">
        <main-header></main-header>
        <div class="flex flex-col items-center justify-center gap-8 w-full p-4 py-32">
            <!-- <img class="w-3/12 max-w-screen-sm min-w-min md:min-w-0" src="../../assets/images/404.svg" alt="404" /> -->
            <h1 class="flex flex-wrap items-center gap-10 text-7xl md:text-9xl">
                <b style="transform:rotate(45deg);">4</b>
                <b>0</b>
                <b style="transform:rotate(-45deg);">4</b>
            </h1>
            <p class="text-xl md:text-3xl text-center font-bold text-primary-500">صفحه مورد نظر پیدا نشد!</p>
            <router-link to="/" class="btn text-xl px-8">بازگشت به صفحه نخست</router-link>
        </div>
        <main-footer></main-footer>
    </div>
</template>

<script>
import Header from "../templates/web/Header";
import Footer from "../templates/web/Footer";

export default {
    name: "Main",
    components: {
        "main-header": Header,
        "main-footer": Footer,
    },
    data() {
        return {};
    },
    created() {},
    mounted() {},
    methods: {},
};
</script>

<style></style>
