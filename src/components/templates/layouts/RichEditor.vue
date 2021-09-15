<template>
    <div class="t_rich_editor">
        <label class="relative" v-if="label">
            <span>{{ label }}</span>
            <i class="absolute text-primary-400 fa-xs mx-1 fas fa-star-christmas" v-if="required"></i>
        </label>
        <div class="flex flex-col flex-grow relative">
            <div class="box" v-show="!loading">
                <div class="w-full" ref="editor" id="codex-editor" />
            </div>
            <div class="t_card_loading" v-if="loading">
                <i class="fad fa-spinner-third fa-spin fa-5x text-primary-400"></i>
            </div>

            <div v-if="error" class="flex gap-1 items-center rounded bg-red-100 text-red-700 p-1 mt-1 text-xs">
                <i class="far fa-exclamation-circle"></i>
                <span>{{ error }}</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "RichEditor",
    props: {
        label: { type: String },
        required: {},
        text: {},
        temp: { type: String },
        imageUploadUrl: { type: String },
        error: { type: String },
    },
    data() {
        return {
            loading: true,
            isEditorSet: false,
        };
    },
    created() {},
    async mounted() {
        await this.setEditor().then(() => (this.loading = false));

        this.$emit("update:temp", this.getRandomName());
    },
    watch: {
        async text(value) {
            if (typeof window.editor !== "undefined") {
                this.loading = true;
                this.setEditor().then(() => (this.loading = false));
            }
        },
    },
    methods: {
        async setEditor() {
            if(this.isEditorSet) return;

            console.log(1);
            const EditorJS = await import("@editorjs/editorjs");
            const EditorHeader = await import("@editorjs/header");
            const EditorList = await import("@editorjs/list");
            const EditorLink = await import("@editorjs/link");
            const EditorImageTool = await import("@editorjs/image");
            const EditorChecklist = await import("@editorjs/checklist");
            const EditorTable = await import("@editorjs/table");
            const EditorMarker = await import("@editorjs/marker");
            const EditorDelimiter = await import("@editorjs/delimiter");

            window.editor = new EditorJS.default({
                logLevel: "ERROR",
                holder: "codex-editor",
                data: this.text,
                tools: {
                    header: {
                        class: EditorHeader.default,
                        inlineToolbar: true,
                    },
                    list: {
                        class: EditorList.default,
                        inlineToolbar: true,
                    },
                    linkTool: {
                        class: EditorLink.default,
                        inlineToolbar: true,
                        config: {
                            endpoint: "/api/v1/fetcher",
                        },
                    },
                    imageTool: {
                        class: EditorImageTool.default,
                        config: {
                            endpoints: {
                                byFile: this.imageUploadUrl,
                            },
                            field: "image",
                            additionalRequestHeaders: {},
                        },
                    },
                    checklist: {
                        class: EditorChecklist.default,
                        inlineToolbar: true,
                    },
                    table: {
                        class: EditorTable.default,
                        inlineToolbar: true,
                    },
                    marker: {
                        class: EditorMarker.default,
                        inlineToolbar: true,
                    },
                    delimiter: {
                        class: EditorDelimiter.default,
                        inlineToolbar: true,
                    },
                },
            });

            this.isEditorSet = true;
        },

        focus() {
            window.editor.focus();
        },

        getRandomName(length = 12) {
            let result = "";
            let characters = "abcdefghijklmnopqrstuvwxyz0123456789";
            for (let i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * characters.length));
            return result;
        },
    },
};
</script>

<style scoped></style>
