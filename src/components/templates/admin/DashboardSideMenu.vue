<template>
    <transition name="fade" mode="out-in" appear="">
        <div class="dashboard_sidemenu absolute md:relative flex-shrink-0" :class="{ min: !sideMenuOpen }" v-show="sideMenuOpen">
            <nav>
                <ul>
                    <router-link to="/admin/dashboard" title="داشبورد" v-if="checkPermissions(['admin.dashboard.view'], adminInfo.permissions)">
                        <li class="nav_item">
                            <i class="fad fa-home-lg"></i>
                            <span>داشبورد</span>
                        </li>
                    </router-link>

                    <li
                        class="nav_group"
                        :class="{ open: openItem == 'SystemAccess' }"
                        @blur="navGroupBlur"
                        tabindex1="0"
                        v-if="checkPermissions(['admin.admins.view', 'admin.admin_roles.view'], adminInfo.permissions)"
                    >
                        <div
                            title="ادمین ها"
                            class="nav_item"
                            :class="{ nav_active: checkActive(['/admin/admins_list', '/admin/role_manager']) }"
                            @click="openGroup('SystemAccess', $event)"
                        >
                            <i class="fad fa-shield-alt"></i>
                            <span>ادمین ها</span>
                        </div>
                        <ul ref="SystemAccess" for="SystemAccess">
                            <router-link to="/admin/admins_list" title="لیست ادمین ها" v-if="checkPermissions(['admin.admins.view'], adminInfo.permissions)">
                                <li class="nav_item">
                                    <span>لیست ادمین ها</span>
                                </li>
                            </router-link>
                            <router-link
                                to="/admin/role_manager"
                                title="مدیریت نقش ها"
                                v-if="checkPermissions(['admin.admin_roles.view'], adminInfo.permissions)"
                            >
                                <li class="nav_item">
                                    <span>مدیریت نقش ها</span>
                                </li>
                            </router-link>
                        </ul>
                    </li>

                    <router-link
                        to="/admin/users"
                        title="کاربران"
                        v-if="checkPermissions(['admin.users.view', 'admin.users.chat', 'admin.users.call'], adminInfo.permissions)"
                    >
                        <li class="nav_item" :class="{ nav_active: checkActive(['/admin/users']) }">
                            <i class="fad fa-users"></i>
                            <span>کاربران</span>
                        </li>
                    </router-link>

                    <router-link to="/admin/booked_schedules" title="مشاوره ها" v-if="checkPermissions(['admin.booked_schedules.view'], adminInfo.permissions)">
                        <li class="nav_item">
                            <i class="fad fa-calendar-alt"></i>
                            <span>مشاوره ها</span>
                        </li>
                    </router-link>

                    <hr class="nav_spacer" />

                    <li class="nav_header">گزارشات</li>
                    <router-link to="/admin/calls" title="ریزمکالمات" v-if="checkPermissions(['admin.calls.view'], adminInfo.permissions)">
                        <li class="nav_item">
                            <i class="fad fa-phone-volume"></i>
                            <span>ریزمکالمات</span>
                        </li>
                    </router-link>
                    <router-link to="/admin/transactions" title="تراکنش های مالی" v-if="checkPermissions(['admin.transactions.view'], adminInfo.permissions)">
                        <li class="nav_item">
                            <i class="fad fa-file-invoice-dollar"></i>
                            <span>تراکنش های مالی</span>
                        </li>
                    </router-link>

                    <hr class="nav_spacer" />

                    <li class="nav_header">مدیریت محتوا</li>
                    <router-link to="/admin/articles" title="مقاله ها" v-if="checkPermissions(['admin.articles.view'], adminInfo.permissions)">
                        <li class="nav_item">
                            <i class="fad fa-newspaper"></i>
                            <span>مقاله ها</span>
                        </li>
                    </router-link>
                    <router-link to="/admin/faqs" title="سوالات متداول" v-if="checkPermissions(['admin.faqs.view'], adminInfo.permissions)">
                        <li class="nav_item">
                            <i class="fad fa-question"></i>
                            <span>سوالات متداول</span>
                        </li>
                    </router-link>

                    <hr class="nav_spacer" />

                    <li class="nav_header">تنظیمات</li>
                    <router-link to="/admin/panel_settings" title="تنظیمات پنل">
                        <li class="nav_item">
                            <i class="fad fa-cog"></i>
                            <span>تنظیمات پنل</span>
                        </li>
                    </router-link>
                </ul>
            </nav>
        </div>
    </transition>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
    name: "DashboardSideMenu",
    props: ["loading"],
    components: {},
    data() {
        return {
            // sidemenuOpen: true,
            openItem: "",
        };
    },
    created() {},
    mounted() {
        if (localStorage.getItem("sideMenuOpen") !== null) {
            // this.sidemenuOpen = localStorage.getItem("sidemenuOpen") == "true" ? true : false;
            this.changeSideMenuOpen(localStorage.getItem("sideMenuOpen") == "true" ? true : false);
        }

        this.adjustSidemenu();
        window.addEventListener("resize", this.adjustSidemenu);
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.adjustSidemenu);
    },
    watch: {
        sideMenuOpen(newVal, oldVal) {
            if (newVal != oldVal) this.openGroup();
        },
    },
    computed: {
        ...mapGetters(["adminInfo", "sideMenuOpen"]),
    },
    methods: {
        ...mapActions(["changeSideMenuOpen"]),

        // toggleSidemneu() {
        //     // this.sidemenuOpen = !this.sidemenuOpen;
        //     this.changeSideMenuOpen(!this.sidemenuOpen);
        //     localStorage.setItem("sidemenuOpen", this.sidemenuOpen);
        //     this.openGroup();
        // },

        openGroup(name = null, event) {
            if (typeof document === "undefined") return;

            document.querySelectorAll(".dashboard_sidemenu nav .nav_group ul").forEach((elm) => {
                elm.style.height = "0px";
            });

            if (this.openItem != name && name != null) {
                let height = this.sideMenuOpen ? 8 : 24;

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
                if (this.$route.path.includes(routes[i])) {
                    isActive = true;
                    break;
                }
            }
            if (isActive && openGroup != null) {
                this.openGroup(openGroup);
            }
            return isActive;
        },

        adjustSidemenu() {
            if (window.innerWidth <= 640) {
                this.changeSideMenuOpen(false);
            }
        },
    },
};
</script>

<style></style>
