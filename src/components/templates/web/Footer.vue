<template>
    <div class="footer_wrapper">
        <footer class="flex flex-col justify-center gap-8">
            <nav>
                <ul class="flex flex-wrap items-center justify-center gap-6">
                    <li>
                        <router-link to="/consultation-time-booking">رزرو وقت مشاوره</router-link>
                    </li>
                    <li>
                        <router-link to="/blog">وبلاگ</router-link>
                    </li>
                    <li>
                        <router-link to="/frequently-asked-legal-questions">سوالات پرتکرار حقوقی</router-link>
                    </li>
                    <li>
                        <router-link to="/terms-and-conditions">قوانین و مقررات</router-link>
                    </li>
                </ul>
            </nav>
            <hr class="opacity-60 border-solid w-full" />
            <section class="flex w-full justify-center md:justify-between flex-wrap gap-8">
                <div class="flex flex-col items-center justify-center md:items-start md:justify-start gap-4">
                    <router-link class="logo" to="/">
                        <img src="../../../assets/images/logo2.png" alt="گروه آگه" />
                        <span class="text-2xl">گروه آگه</span>
                    </router-link>
                    <address class="not-italic">میدان انقلاب، کارگر شمالی، کوچه جعفرزادگان، پلاک 10، طبقه دوم، واحد 5</address>
                </div>
                <div class="flex flex-col items-center justify-center md:items-end md:justify-end gap-4">
                    <a href="tel:02166908026" dir="ltr"><span class="far fa-phone-rotary"></span> 021 66908026-27</a>
                    <a href="mailto:contact@agah-lawyers.com" dir="ltr"><span class="far fa-envelope"></span> Contact@Agah-Lawyers.com</a>
                </div>
            </section>
            <small align="center">کلیه حقوق این وبسایت متعلق به گروه وکلای آگه می باشد <span class="fal fa-copyright"></span> {{ year }}</small>
        </footer>
    </div>
</template>

<script>
export default {
    name: "Footer",
    components: {},
    data() {
        return {
            year: "",
        };
    },
    serverPrefetch() {},
    created() {},
    mounted() {
        this.year = new Date().getFullYear();
    },
    computed: {},
    methods: {},
};
</script>

<style></style>
