<template>
    <div>
        
    </div>
</template>

<script>
import { mapActions } from "vuex";
import axios from "axios";

import Input from "../../../templates/layouts/Input";
import Select from "../../../templates/layouts/Select";

export default {
    name: "Schedules",
    components: {
        "t-input": Input,
        "t-select": Select,
    },
    data() {
        return {
            updatingTimeOffSchedules: false,

        };
    },
    created() {},
    async mounted() {
        await this.getSchedules();
        await this.getTimeOffSchedules();
    },
    methods: {
        ...mapActions(["makeToast"]),

        updateTimeOffSchedules() {
            if (this.updatingTimeOffSchedules) return;
            this.updatingTimeOffSchedules = true;

            axios
                .put(`${this.getBaseUrl()}/api/v1/admin/admins/time_off_schedules`, formData)
                .then((response) => {
                    this.makeToast({ title: "Update Schedules", message: "Admin Schedules has been updated successfully", type: "info" });
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
                    this.updatingTimeOffSchedules = false;
                });
        },
        deleteTimeOffSchedules(){},

        async getTimeOffSchedules() {
            await axios
                .get(`${this.getBaseUrl()}/api/v1/admin/admins/${this.$route.params.id}/time_off_schedules`)
                .then((response) => {})
                .catch((error) => {
                    if (error.response.data) {
                        this.makeToast({ message: error.response.data.error, type: "danger" });
                        if (error.response.data.field && typeof this[error.response.data.field + "Error"] !== "undefined") {
                            this[error.response.data.field + "Error"] = error.response.data.error;
                        }
                    }
                });
        },
    },
};
</script>

<style></style>
