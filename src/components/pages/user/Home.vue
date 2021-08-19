<template>
    <div class="dashboard_body">
        <div class="mb-8">
            <h2 class="text-white text-4xl">
                <b>Welcome, {{ `${userInfo.name} ${userInfo.family}` }}</b>
            </h2>
        </div>

        <div class="flex justify-center gap-8 flex-wrap">
            <div class="welcome_card gap-8 p-8 bg-gray-700">
                <div class="image">
                    <img src="../../../assets/images/icons/crane.svg" alt="" />
                </div>
                <h3 class="text-2xl">Creating An Organization</h3>
                <span class="text-sm text-gray-300 max-w-sm">
                    If you are an organization owner or manager you can start by creating an organization. <br />
                    <br />
                    For creating an organization you need a licence key. If you don't have a licence key, you can purchase one from link below.
                </span>
                <div class="flex flex-wrap items-center gap-2 mt-auto">
                    <router-link class="t_button t_button_min bg-violet-500 hover:bg-violet-600" to="/licence-keys">Purchase Licence Key</router-link>
                    <router-link class="t_button t_button_min border-2 border-solid border-violet-400 hover:bg-violet-500" to="/organizations/new">
                        Create Organization
                    </router-link>
                </div>
            </div>
            <div class="welcome_card gap-8 p-8 bg-gray-700">
                <div class="image">
                    <img src="../../../assets/images/icons/production.svg" alt="" />
                </div>
                <h3 class="text-2xl">Joining An Organization</h3>
                <span class="text-sm text-gray-300 max-w-sm">
                    You can join an organization by accepting the invitation request from an organization. <br />
                    <br />
                    In order for an organization owner or manager to send you an invitation, you need to provide them with your user-id
                </span>
                <div class="flex flex-wrap items-center gap-2 mt-auto">
                    <router-link class="t_button t_button_min bg-violet-500 hover:bg-violet-600" to="/account-settings/profile">Get User-ID</router-link>
                    <router-link class="t_button t_button_min border-2 border-solid border-violet-400 hover:bg-violet-500" to="/invitations">
                        View Invitation Requests
                    </router-link>
                </div>
            </div>
        </div>

        <!-- <ul>
            ######<li>create account settings page</li>
            ######<li>create panel setting page with timezone and lang and theme</li>

            ######<li>create licence purchase page</li>
            ######<li>create organization page</li>
            ######<li>create add organization page</li>
            ######<li>create view/edit organization page</li>
            ######<li>user permission handle in vue</li>
            ######<li>create invitation drop-down and page</li>
            ######<li>select an organization functionality</li>

            <li>dashboard view with what permissions</li>
            <li>create roles page</li>
            <li>create members page</li>
            <li>create teams page</li>
            <li>create work order page</li>
        </ul> -->
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
    mounted() {
        // TODO
        // check if user has any organizations or not
        // if no organization: show the welcome thingy
    },
    watch: {
        selectedOrganization(newVal,oldVal){
            // update the page if org changes
        },
    },
    computed: {
        ...mapGetters(["userInfo", "selectedOrganization"]),
    },
    methods: {},
};
</script>

<style></style>
