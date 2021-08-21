<template>
    <div class="dashboard_body">
        <h1 class="text-white text-5xl">
            <b>Welcome Home, {{ adminInfo.name }}</b>
        </h1>
        <br>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    name: "Home",
    components: {},
    data() {
        return {
            connection: "",
        };
    },
    created() {},
    mounted() {},
    computed: {
        ...mapGetters(["adminInfo"]),
    },
    methods: {},
};
</script>

<style></style>
