<template>
    <div class="dashboard_body max-w-screen-xl mx-auto shadow-2xl">
        <div class="flex flex-wrap justify-between items-center gap-4">
            <h1 class="text-4xl"><b>Panel Settings</b></h1>
        </div>
        <hr class="my-4 border-solid" />

        <div class="flex flex-col h-full overflow-auto gap-2">
            <t-select
                class="max-w-screen-xs"
                placeholder="Language"
                label="Admin Panel Language"
                desc="This will change language of only admin panel"
                v-model:selectedOption="locale"
                :error="localeError"
                :options="localeOptions"
            >
                <template v-slot:option="{ option }">
                    <option :value="option.value">{{ option.name }}</option>
                </template>
            </t-select>

            <hr class="my-4 border-solid" />

            <t-select
                class="max-w-screen-xs"
                placeholder="Select a theme"
                label="Admin Panel Theme"
                v-model:selectedOption="theme"
                :error="themeError"
                :options="themeOptions"
                @update:selectedOption="changeTheme()"
            >
                <template v-slot:option="{ option }">
                    <option :value="option.value">{{ option.name }}</option>
                </template>
            </t-select>
        </div>

        <hr class="my-4 mt-auto border-solid" />
        <div class="flex flex-wrap items-center gap-4">
            <button
                class="t_button t_button_min bg-secondary-300 hover:bg-secondary-200 text-bluegray-700 text-bluegray-50 disabled:opacity-50"
                :disabled="savingChanges"
                @click="saveChanges()"
            >
                <b v-if="!savingChanges">Save Changes</b>
                <b v-else class="fad fa-spinner fa-spin text-xl"></b>
            </button>
        </div>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import axios from "axios";

import Input from "../../templates/layouts/Input";
import Card from "../../templates/layouts/Card";
import Select from "../../templates/layouts/Select";

export default {
    name: "PanelSettings",
    components: {
        "t-input": Input,
        "t-card": Card,
        "t-select": Select,
    },
    data() {
        return {
            savingChanges: false,

            locale: { name: "English", value: "en" },
            theme: { name: "Default Dark", value: "default_dark" },

            localeError: "",
            themeError: "",

            localeOptions: {
                fa: { name: "Farsi", value: "fa" },
                en: { name: "English", value: "en" },
            },
            themeOptions: {
                default_dark: { name: "Default Dark", value: "default_dark" },
                default_light: { name: "Default Light", value: "default_light" },
            },
        };
    },
    created() {},
    async mounted() {
        await this.getInfo();
    },
    computed: {
        // ...mapGetters(["adminInfo"]),
    },
    methods: {
        ...mapActions(["makeToast"]),

        saveChanges() {
            if (this.savingChanges) return;
            this.savingChanges = true;

            this.roleNameError = this.selectedPermissionsError = "";

            axios
                .post(`${this.getBaseUrl()}/api/v1/admin/panel_settings`, {
                    companyName: this.companyName,
                    locale: this.locale.value,
                    theme: this.theme.value,
                })
                .then((response) => {
                    this.makeToast({ title: "Update Panel Settings", message: "Panel Settings has been updated successfully", type: "info" });
                })
                .catch((error) => {
                    if (error.response.data) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                        if (error.response.data.field && typeof this[error.response.data.field + "Error"] !== "undefined") {
                            this[error.response.data.field + "Error"] = error.response.data.error;
                        }
                    }
                })
                .finally(() => {
                    this.savingChanges = false;
                });
        },

        async getInfo() {
            await axios
                .get(`${this.getBaseUrl()}/api/v1/admin/panel_settings`)
                .then((response) => {
                    if (response.data) {
                        this.companyName = response.data.companyName;
                        this.locale = this.localeOptions[response.data.locale];
                        this.theme = this.themeOptions[response.data.theme];
                    }
                })
                .catch((error) => {
                    if (error.response.data) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                        if (error.response.data.field && typeof this[error.response.data.field + "Error"] !== "undefined") {
                            this[error.response.data.field + "Error"] = error.response.data.error;
                        }
                    }
                    if (error.response.status == 404) {
                        this.$router.push("/admin/");
                    }
                });
        },

        // ========================================

        changeTheme() {
            window.document.querySelector("body").setAttribute("theme", this.theme.value);
            localStorage.setItem("adminPanelTheme", this.theme.value);
        },
    },
};
</script>

<style></style>
