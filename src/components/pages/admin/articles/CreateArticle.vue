<template>
    <div class="dashboard_body max-w-screen-xl mx-auto shadow-2xl">
        <div class="flex gap-2 items-baseline">
            <router-link to="/admin"><i class="fad fa-home text-lg"></i></router-link>
            <i class="fas fa-chevron-right text-sm text-secondary-400"></i>
            <router-link to="/admin/articles">مقالات</router-link>
            <i class="fas fa-chevron-right text-sm text-secondary-400"></i>
            <h1 class="text-2xl"><b>ایجاد مقاله جدید</b></h1>
        </div>
        <hr class="my-4 border-solid" />

        <div class="flex flex-col h-full overflow-auto gap-2 p-2">
            <t-card class="max-w-screen-sm">
                <template v-slot:content>
                    <div class="t_card_body flex flex-col md:flex-row md:items-center gap-4">
                        <div class="w-48 h-28 rounded shadow-lg">
                            <img class="w-full h-full rounded object-contain" :src="imageFile" alt="" />
                        </div>
                        <div class="flex flex-col gap-4">
                            <div class="flex gap-4">
                                <input class="hidden" type="file" accept=".jpg,.png,.gif" ref="imageFile" @change="imageFileChange()" />
                                <button class="t_button t_button_min border-primary-500 hover:bg-primary-400" @click="selectImage()">
                                    انتخاب عکس
                                </button>
                            </div>
                            <span class="text-sm">Must be JPEG, PNG, or GIF and cannot exceed 2MB.</span>
                        </div>
                    </div>
                </template>
            </t-card>

            <hr class="my-4 border-solid" />

            <div class="flex flex-col gap-4">
                <t-input class="max-w-screen-sm" type="text" maxCount="70" label="عنوان" :required="true" v-model:value="title" :error="titleError" />
                <t-input class="max-w-screen-sm" type="textarea" maxCount="250" label="خلاصه مطلب" :required="true" v-model:value="desc" :error="descError" />
                <t-select class="max-w-screen-xs" label="وضعیت" v-model:selectedOption="status" :options="statusOptions" :error="statusError">
                    <template v-slot:option="{ option }">
                        <option :value="option.value">{{ option.name }}</option>
                    </template>
                </t-select>
            </div>

            <hr class="my-4 border-solid" />

            <div class="flex flex-col gap-4">
                <t-tag-input class="max-w-screen-xs" type="text" label="تگ ها" desc="حداکثر 5 تگ" v-model:list="tags" :error="tagsError"></t-tag-input>
            </div>

            <hr class="my-4 border-solid" />

            <h3 class="text-xl">متادیتا</h3>
            <div class="flex flex-col gap-4">
                <t-input
                    class="max-w-screen-sm"
                    type="textarea"
                    maxCount="150"
                    label="توضیحات متادیتا"
                    :required="true"
                    v-model:value="metaDesc"
                    :error="metaDescError"
                />
                <t-tag-input
                    class="max-w-screen-xs"
                    type="text"
                    label="تگهای متادیتا"
                    desc="بهترین میزان تگ برای متادیتا 10 تگ"
                    v-model:list="metaTags"
                    :error="metaTagsError"
                ></t-tag-input>
            </div>

            <hr class="my-4 border-solid" />

            <t-rich-editor
                label="مطلب"
                :imageUploadUrl="`/api/v1/admin/articles/${tempAddr}/upload_image`"
                :text="text"
                v-model:temp="tempAddr"
                :error="textError"
            ></t-rich-editor>
        </div>

        <hr class="my-4 mt-auto border-solid" />
        <div class="flex flex-wrap items-center gap-4">
            <button
                class="t_button t_button_min bg-secondary-300 hover:bg-secondary-200 text-bluegray-700 disabled:opacity-50"
                :disabled="creatingArticle"
                @click="create()"
            >
                <b v-if="!creatingArticle">ثبت تغییرات</b>
                <b v-else class="fad fa-spinner fa-spin text-xl"></b>
            </button>
            <router-link class="t_button t_button_min border-rose-400 hover:bg-rose-500" to="/admin/articles">بازگشت</router-link>
        </div>
    </div>
</template>

<script>
import { mapActions } from "vuex";
import axios from "axios";

import Card from "../../../templates/layouts/Card";
import Input from "../../../templates/layouts/Input";
import Select from "../../../templates/layouts/Select";
import TagInput from "../../../templates/layouts/TagInput";
import RichEditor from "../../../templates/layouts/RichEditor";

export default {
    name: "CreateArticle",
    components: {
        "t-card": Card,
        "t-input": Input,
        "t-select": Select,
        "t-tag-input": TagInput,
        "t-rich-editor": RichEditor,
    },
    data() {
        return {
            creatingArticle: false,

            imageFile: "",
            title: "",
            desc: "",
            status: { name: "منتشر شده", value: "published" },
            tags: [],
            metaDesc: "",
            metaTags: [],
            text: "",

            titleError: "",
            descError: "",
            statusError: "",
            tagsError: "",
            metaDescError: "",
            metaTagsError: "",
            textError: "",

            tempAddr: "",
            statusOptions: {
                published: { name: "منتشر شده", value: "published" },
                pending: { name: "منتظر انتشار", value: "pending" },
            },
        };
    },
    created() {},
    async mounted() {
        setTimeout(() => {
            this.text = { time: 1596487133194, blocks: [{ type: "header", data: { text: "...", level: 4 } }] };
        }, 1000);
    },
    methods: {
        ...mapActions(["makeToast"]),

        async create() {
            if (this.creatingArticle) return;
            this.creatingArticle = true;

            this.titleError = this.descError = this.statusError = this.tagsError = this.metaDescError = this.metaTagsError = this.textError = "";

            await window.editor.save().then((savedContent) => (this.text = JSON.stringify(savedContent)));

            const formData = new FormData();
            formData.append("image", this.$refs.imageFile.files[0]);
            formData.append("title", this.title);
            formData.append("desc", this.desc);
            formData.append("status", this.status.value);
            formData.append("tags", JSON.stringify(this.tags));
            formData.append("metaDesc", this.metaDesc);
            formData.append("metaTags", this.metaTags.join(","));
            formData.append("text", this.text);
            formData.append("tempAddr", this.tempAddr);

            axios
                .post(`${this.getBaseUrl()}/api/v1/admin/articles`, formData)
                .then((response) => {
                    this.makeToast({ title: "Create New Article", message: "New article has been created successfully", type: "success" });
                    this.$router.push("/admin/articles");
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
                    this.creatingArticle = false;
                });
        },

        selectImage() {
            this.$refs.imageFile.click();
        },
        imageFileChange() {
            this.imageFile = this.$refs.imageFile.files[0] ? URL.createObjectURL(this.$refs.imageFile.files[0]) : "";
        },
    },
};
</script>

<style></style>
