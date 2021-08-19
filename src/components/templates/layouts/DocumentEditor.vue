<template>
    <div class="t_document_editor flex flex-col gap-2">
        <div class="bg-gray-700 text-cyan-100 py-1 px-2 rounded w-max text-xs">{{ storageUsed }} MB of {{ storageTotal }} Mb Used</div>
        <ul class="flex flex-wrap gap-3 my-2">
            <li class="bg-warmgray-100 text-black w-max" v-for="(file, i) in files" :key="i">
                <b>{{ file.name }}</b>
                <span v-if="file.size">{{ file.size }}MB</span>
                <i class="far fa-trash-alt text-lg text-rose-800 cursor-pointer" tabindex="0" @click="deleteConfirm(i, true)" v-if="!file.deleteConfirm"></i>
                <i
                    class="fad fa-exclamation-triangle text-lg text-amber-700 cursor-pointer"
                    v-if="file.deleteConfirm"
                    @click="deleteFile(i)"
                    title="click again to confirm"
                ></i>
            </li>
        </ul>
        <div class="file_select max-w-screen-sm w-max h-40 px-8 bg-warmgray-900 border-violet-500">
            <input type="file" multiple="true" ref="file" @change="selectDocument()" />
            <span class="text-violet-200">Select Files Or Drag And Drop</span>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import axios from "axios";

export default {
    name: "DocumentEditor",
    props: {
        files: {},
    },
    data() {
        return {
            loading: true,

            storageTotal: 0,
            storageUsed: 0,

            totalUploadedSize: 0,
        };
    },
    async created() {},
    async mounted() {
        this.getOrganizationStorageLimit();

        setInterval(() => {
            const filesLocal = this.files;
            filesLocal.forEach((file) => {
                if (file.deleteConfirm) {
                    file.deleteConfirm = false;
                    this.$emit("update:files", filesLocal);
                }
            });
        }, 3000);
    },
    watch: {
        selectedOrganization() {
            this.getOrganizationStorageLimit();
        },
    },
    computed: {
        ...mapGetters(["selectedOrganization"]),
    },
    methods: {
        ...mapActions(["makeToast"]),

        async getOrganizationStorageLimit() {
            this.loading = true;
            await axios
                .get(`${this.getBaseUrl()}/api/v1/user/organization/${this.selectedOrganization.id}/storage_info`)
                .then((response) => {
                    this.storageTotal = response.data.total;
                    this.storageUsed = parseFloat(response.data.used).toFixed(2);
                })
                .finally(() => {
                    this.loading = false;
                });
        },

        selectDocument() {
            const filesLocal = this.files;

            for (let i = 0; i < this.$refs.file.files.length; i++) {
                const size = parseFloat(this.$refs.file.files[i].size / 1048576).toFixed(2);
                // sum up the size and check it with total
                if (this.totalUploadedSize + this.storageUsed + size > this.storageTotal) {
                    this.makeToast({
                        title: "Storage Limit",
                        message: "Reached storage limit, can't upload anymore files. upgrade for more data storage space",
                        type: "warning",
                    });
                    return;
                }

                let duplicate = false;
                for (let j = 0; j < filesLocal.length; j++) {
                    if (filesLocal[j].name == this.$refs.file.files[i].name && filesLocal[j].size == size) {
                        duplicate = true;
                        break;
                    }
                }
                if (duplicate) continue;

                filesLocal.push({
                    id: null,
                    name: this.$refs.file.files[i].name,
                    size: size,
                    file: this.$refs.file.files[i],
                });
                this.totalUploadedSize += size;
            }

            this.$emit("update:files", filesLocal);

            this.$refs.file.value = null;
        },

        async deleteFile(index) {
            const filesLocal = this.files;

            if (filesLocal[index].file && !filesLocal[index].id) {
                this.totalUploadedSize -= filesLocal[index].file.size;
            } else {
                // send delete request then delete from list
                await axios
                    .delete(`${this.getBaseUrl()}/api/v1/user/file/${filesLocal[index].link}`)
                    .then((response) => {
                        // update the used space
                        this.getOrganizationStorageLimit();
                    });
            }

            filesLocal.splice(index, 1);
            this.$emit("update:files", filesLocal);
        },

        deleteConfirm(index, status) {
            const filesLocal = this.files;

            filesLocal[index].deleteConfirm = status;
            this.$emit("update:files", filesLocal);
        },
    },
};
</script>

<style></style>
