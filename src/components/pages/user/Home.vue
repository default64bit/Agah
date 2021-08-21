<template>
    <div class="dashboard_body">
        <div class="mb-8">
            <h2 class="text-white text-4xl">
                <b>Welcome, {{ `${userInfo.name} ${userInfo.family}` }}</b>
            </h2>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    name: "Home",
    data() {
        return {};
    },
    created() {
        // this.$router.push("/login");
    },
    mounted() {},
    watch: {},
    computed: {
        ...mapGetters(["userInfo"]),
    },
    methods: {},
};
</script>

<style></style>
