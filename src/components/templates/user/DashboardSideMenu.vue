<template>
    <div class="dashboard_sidemenu" :class="{ min: !sidemenuOpen }">
        <div class="head">
            <div class="flex flex-col-reverse md:flex-row justify-between items-center gap-2">
                <div class="flex items-center justify-start gap-1 w-full">
                    <img src="../../../assets/images/settings.png" alt="" />
                    <h2 class="text-2xl">
                        <b class="text-violet-400">J</b>
                        <b class="text-violet-100">asper</b>
                    </h2>
                </div>
                <button class="sidemenu_toggle t_button hover:bg-gray-700" @click="toggleSidemneu()">
                    <i class="fas" :class="sidemenuOpen ? 'fa-align-right' : 'fa-ellipsis-v'"></i>
                </button>
            </div>
        </div>
        <nav>
            <ul>
                <li class="nav_header">General</li>
                <router-link to="/" title="Dashbaord">
                    <li class="nav_item" :class="{ nav_active: checkActive(['/']) }">
                        <i class="fad fa-home-lg"></i>
                        <span>Dashbaord</span>
                    </li>
                </router-link>
            </ul>
        </nav>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    name: "DashboardSideMenu",
    props: ["loading"],
    components: {},
    data() {
        return {
            sidemenuOpen: true,
            openItem: "",
        };
    },
    created() {},
    mounted() {
        if (localStorage.getItem("sidemenuOpen") !== null) {
            this.sidemenuOpen = localStorage.getItem("sidemenuOpen") == "true" ? true : false;
        }
    },
    watch: {
        
    },
    computed: {
        ...mapGetters(["userInfo"]),
    },
    methods: {
        toggleSidemneu() {
            this.sidemenuOpen = !this.sidemenuOpen;
            localStorage.setItem("sidemenuOpen", this.sidemenuOpen);

            this.openGroup();
        },

        openGroup(name = null, event) {
            if (typeof document === "undefined") return;

            document.querySelectorAll(".dashboard_sidemenu nav .nav_group ul").forEach((elm) => {
                elm.style.height = "0px";
            });

            if (this.openItem != name && name != null) {
                let height = this.sidemenuOpen ? 8 : 24;

                let ul = event.currentTarget.nextSibling;
                let links = Array.from(ul.querySelectorAll("a")).filter((node) => node.parentElement === ul);

                links.forEach((element) => {
                    height += element.scrollHeight > 40 ? element.scrollHeight : 40;
                });
                this.$refs[name].style.height = `${height}px`;
                this.$refs[name].focus();
                this.openItem = name;
            } else {
                this.openItem = "";
            }
        },
        navGroupBlur(event) {
            if (!event.currentTarget.contains(event.relatedTarget)) {
                this.openGroup();
            } else {
                event.currentTarget.focus();
            }
        },

        checkActive(routes = [], openGroup = null) {
            let isActive = false;
            for (let i = 0; i < routes.length; i++) {
                if (this.$route.path == routes[i]) {
                    isActive = true;
                    break;
                }
            }
            if (isActive && openGroup != null) {
                this.openGroup(openGroup);
            }
            return isActive;
        },
    },
};
</script>

<style></style>
