<template>
    <div class="dashboard_body">
        <h1 class="text-5xl">
            <b>Welcome Home, {{ adminInfo.name }}</b>
        </h1>
        <br />
        <ol>
            <li>admin basic TODO items : localization & timezone & panel-settings</li>
            <li>db design</li>
            <li>site homepage</li>
            <li>user login & register & panel</li>
            <li>consulter login & register-request & panel</li>
        </ol>
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
