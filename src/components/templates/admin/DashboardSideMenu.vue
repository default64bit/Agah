<template>
    <div class="dashboard_sidemenu" :class="{ min: !sidemenuOpen }">
        <div class="head">
            <div class="flex flex-col-reverse md:flex-row justify-between items-center gap-2">
                <div class="flex items-center justify-start gap-1 w-full">
                    <img src="../../../assets/images/settings.png" alt="" />
                    <h2 class="text-2xl">
                        <b class="text-violet-400">A</b>
                        <b class="text-violet-100">gah</b>
                    </h2>
                </div>
                <button class="sidemenu_toggle t_button hover:bg-gray-700" @click="toggleSidemneu()">
                    <i class="fas" :class="sidemenuOpen ? 'fa-align-right' : 'fa-ellipsis-v'"></i>
                </button>
            </div>
        </div>
        <nav>
            <ul>
                <router-link to="/admin" title="Dashbaord" v-if="checkPermissions(['admin.dashboard.view'], adminInfo.permissions)">
                    <li class="nav_item" :class="{ nav_active: checkActive(['/admin']) }">
                        <i class="fad fa-home-lg"></i>
                        <span>Dashbaord</span>
                    </li>
                </router-link>

                <hr class="nav_spacer" />

                <li class="nav_header" v-if="checkPermissions(['admin.admins.view', 'admin.admin_roles.view'], adminInfo.permissions)">System</li>
                <li
                    class="nav_group"
                    :class="{ open: openItem == 'SystemAccess' }"
                    @blur="navGroupBlur"
                    tabindex1="0"
                    v-if="checkPermissions(['admin.admins.view', 'admin.admin_roles.view'], adminInfo.permissions)"
                >
                    <div
                        title="System Access"
                        class="nav_item"
                        :class="{ nav_active: checkActive(['/admin/admins_list', '/admin/role_manager']) }"
                        @click="openGroup('SystemAccess', $event)"
                    >
                        <i class="fad fa-shield-alt"></i>
                        <span>System Access</span>
                    </div>
                    <ul ref="SystemAccess" for="SystemAccess">
                        <router-link to="/admin/admins_list" title="Admins List" v-if="checkPermissions(['admin.admins.view'], adminInfo.permissions)">
                            <li class="nav_item" :class="{ nav_active: checkActive(['/admin/admins_list']) }">
                                <span>Admins List</span>
                            </li>
                        </router-link>
                        <router-link to="/admin/role_manager" title="Role Manager" v-if="checkPermissions(['admin.admin_roles.view'], adminInfo.permissions)">
                            <li class="nav_item" :class="{ nav_active: checkActive(['/admin/role_manager']) }">
                                <span>Role Manager</span>
                                <router-link
                                    class="t_button p-1 text-violet-400 hover:bg-gray-800"
                                    to="/admin/role_manager/add_role"
                                    v-if="checkPermissions(['admin.admin_roles.add'], adminInfo.permissions)"
                                >
                                    <i class="fas fa-plus"></i>
                                </router-link>
                            </li>
                        </router-link>
                    </ul>
                </li>

                <router-link to="/admin/panel_settings" title="Panel Settings">
                    <li class="nav_item" :class="{ nav_active: checkActive(['/admin/panel_settings']) }">
                        <i class="fad fa-cog"></i>
                        <span>کاربران</span>
                    </li>
                </router-link>
                <router-link to="/admin/panel_settings" title="Panel Settings">
                    <li class="nav_item" :class="{ nav_active: checkActive(['/admin/panel_settings']) }">
                        <i class="fad fa-cog"></i>
                        <span>مشاورین</span>
                    </li>
                </router-link>
                <router-link to="/admin/panel_settings" title="Panel Settings">
                    <li class="nav_item" :class="{ nav_active: checkActive(['/admin/panel_settings']) }">
                        <i class="fad fa-cog"></i>
                        <span>مقاله ها</span>
                    </li>
                </router-link>
                <router-link to="/admin/panel_settings" title="Panel Settings">
                    <li class="nav_item" :class="{ nav_active: checkActive(['/admin/panel_settings']) }">
                        <i class="fad fa-cog"></i>
                        <span>سوالات متداول</span>
                    </li>
                </router-link>
                <router-link to="/admin/panel_settings" title="Panel Settings">
                    <li class="nav_item" :class="{ nav_active: checkActive(['/admin/panel_settings']) }">
                        <i class="fad fa-cog"></i>
                        <span>تراکنش های مالی</span>
                    </li>
                </router-link>

                <hr class="nav_spacer" />

                <li class="nav_header">Settings</li>
                <router-link to="/admin/panel_settings" title="Panel Settings">
                    <li class="nav_item" :class="{ nav_active: checkActive(['/admin/panel_settings']) }">
                        <i class="fad fa-cog"></i>
                        <span>Panel Settings</span>
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
    mounted() {},
    computed: {
        ...mapGetters(["adminInfo"]),
    },
    methods: {
        toggleSidemneu() {
            this.sidemenuOpen = !this.sidemenuOpen;
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
