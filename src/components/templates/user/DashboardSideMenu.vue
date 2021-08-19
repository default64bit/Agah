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
                <router-link to="/organizations" title="Organizations">
                    <li class="nav_item" :class="{ nav_active: checkActive(['/organizations']) }">
                        <i class="fad fa-city"></i>
                        <span>Organizations</span>
                    </li>
                </router-link>

                <!-- ================================================================================== -->

                <hr class="nav_spacer" />
                <li class="nav_header">Organization</li>

                <router-link to="/calendar" title="Calendar View">
                    <li class="nav_item" :class="{ nav_active: checkActive(['/calendar']) }">
                        <i class="fad fa-calendar-alt"></i>
                        <span>Calendar View</span>
                    </li>
                </router-link>

                <router-link to="/work-orders" title="Work Orders">
                    <li class="nav_item" :class="{ nav_active: checkActive(['/work-orders']) }">
                        <i class="fad fa-toolbox"></i>
                        <span>Work Orders</span>
                        <span class="p-1 rounded bg-gray-700 text-indigo-200 text-xs">12</span>
                    </li>
                </router-link>

                <li
                    class="nav_group"
                    :class="{ open: openItem == 'MembersAndTeams' }"
                    @blur="navGroupBlur"
                    tabindex1="0"
                    v-if="checkPermissions(['user.roles.view', 'user.members.view', 'user.teams.view'], userPermissions)"
                >
                    <div
                        title="Members And Teams"
                        class="nav_item"
                        :class="{ nav_active: checkActive(['/members', '/teams', , '/roles']) }"
                        @click="openGroup('MembersAndTeams', $event)"
                    >
                        <i class="fad fa-users"></i>
                        <span>Members And Teams</span>
                    </div>
                    <ul ref="MembersAndTeams" for="MembersAndTeams">
                        <router-link to="/roles" title="Staff Roles" v-if="checkPermissions(['user.roles.view'], userPermissions)">
                            <li class="nav_item" :class="{ nav_active: checkActive(['/roles']) }">
                                <span>Staff Roles</span>
                            </li>
                        </router-link>
                        <router-link to="/members" title="Members" v-if="checkPermissions(['user.members.view'], userPermissions)">
                            <li class="nav_item" :class="{ nav_active: checkActive(['/members']) }">
                                <span>Members</span>
                                <span class="p-1 rounded bg-gray-700 text-indigo-200 text-xs">132</span>
                            </li>
                        </router-link>
                        <router-link to="/teams" title="Teams" v-if="checkPermissions(['user.teams.view'], userPermissions)">
                            <li class="nav_item" :class="{ nav_active: checkActive(['/teams']) }">
                                <span>Teams</span>
                            </li>
                        </router-link>
                    </ul>
                </li>

                <li
                    class="nav_group"
                    :class="{ open: openItem == 'StorageSystem' }"
                    @blur="navGroupBlur"
                    tabindex1="0"
                    v-if="checkPermissions(['user.parts.view', 'user.stores.view'], userPermissions)"
                >
                    <div
                        title="Members And Teams"
                        class="nav_item"
                        :class="{ nav_active: checkActive(['/stores', '/parts']) }"
                        @click="openGroup('StorageSystem', $event)"
                    >
                        <i class="fad fa-warehouse-alt"></i>
                        <span>Storage</span>
                    </div>
                    <ul ref="StorageSystem" for="StorageSystem">
                        <router-link to="/stores" title="Stores" v-if="checkPermissions(['user.stores.view'], userPermissions)">
                            <li class="nav_item" :class="{ nav_active: checkActive(['/stores']) }">
                                <span>Stores</span>
                            </li>
                        </router-link>
                        <router-link to="/parts" title="Parts" v-if="checkPermissions(['user.parts.view'], userPermissions)">
                            <li class="nav_item" :class="{ nav_active: checkActive(['/parts']) }">
                                <span>Parts</span>
                            </li>
                        </router-link>
                    </ul>
                </li>

                <router-link to="/locations" title="Locations" v-if="checkPermissions(['user.locations.view'], userPermissions)">
                    <li class="nav_item" :class="{ nav_active: checkActive(['/locations']) }">
                        <i class="fad fa-map-marker-alt"></i>
                        <span>Locations</span>
                    </li>
                </router-link>

                <router-link to="/document-files" title="Document Files">
                    <li class="nav_item" :class="{ nav_active: checkActive(['/document-files']) }">
                        <i class="fad fa-folders"></i>
                        <span>Document Files</span>
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
        selectedOrganization(newVal, oldVal) {
            // ... organization changed

            // collapse all groped items
            this.openGroup();
        },
    },
    computed: {
        ...mapGetters(["userInfo", "userPermissions", "selectedOrganization"]),
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
