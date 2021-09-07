<template>
    <div class="header_wrapper">
        <header class="flex items-center justify-between md:justify-start">
            <router-link class="logo" to="/">
                <img src="../../../assets/images/logo.png" alt="گروه آگه" />
                <strong class="text-2xl">گروه آگه</strong>
            </router-link>
            <button class="nav_toggle" v-if="false"><span class="fas fa-align-left"></span></button>
            <div class="menu">
                <nav class="main_nav">
                    <ul>
                        <li>
                            <router-link to="/consultation-time-booking">مشاوره حقوقی</router-link>
                        </li>
                        <li>
                            <router-link to="/frequently-asked-legal-questions">سوالات پرتکرار حقوقی</router-link>
                        </li>
                        <li>
                            <router-link to="/blog">وبلاگ</router-link>
                        </li>
                    </ul>
                </nav>
                <nav class="secondary_nav">
                    <button>ورود و ثبت نام</button>
                    <button><span class="fas fa-moon"></span></button>
                </nav>
            </div>
        </header>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import axios from "axios";

export default {
    name: "Header",
    components: {},
    data() {
        return {};
    },
    serverPrefetch() {},
    created() {},
    mounted() {},
    computed: {
        ...mapGetters(["makeToast", "userInfo"]),
    },
    methods: {},
};
</script>

<style></style>
