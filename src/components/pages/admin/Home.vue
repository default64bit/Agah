<template>
    <div class="dashboard_body">
        <h1 class="text-white text-5xl">
            <b>Welcome Home, {{ adminInfo.name }}</b>
        </h1>
        <br>
        <ul>
            <li>user's count (active, deactive and banned)</li>
            <li>organization count</li>
            <li>storage occupied (for each organization)</li>
            <li>logs (errors and warnings)</li>
            <li>licence near expiration</li>
            <li>new/unanswered tickets</li>
        </ul>
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
