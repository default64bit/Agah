<template>
    <div class="article_body" itemprop="articleBody">
        <div v-for="(block, i) in data.blocks" :key="i" :type="block.type">
            <div v-if="block.type == 'header'">
                <h1 class="f-nazanin text-4xl" v-if="block.data.level == 1" v-html="block.data.text"></h1>
                <h2 class="f-nazanin text-3xl" v-if="block.data.level == 2" v-html="block.data.text"></h2>
                <h3 class="f-nazanin text-2xl" v-if="block.data.level == 3" v-html="block.data.text"></h3>
                <h4 class="f-nazanin text-xl" v-if="block.data.level == 4" v-html="block.data.text"></h4>
                <h5 class="f-nazanin text-lg" v-if="block.data.level == 5" v-html="block.data.text"></h5>
                <h6 class="f-nazanin" v-if="block.data.level == 6" v-html="block.data.text"></h6>
            </div>

            <p class="my-2 opacity-75" v-if="block.type == 'paragraph'" v-html="block.data.text"></p>

            <hr class="border-dashed border-2 border-primary-400 border-opacity-50 w-8/12 my-6 mx-auto" v-if="block.type == 'delimiter'" />

            <div v-if="block.type == 'list'">
                <ul v-if="block.data.style == 'unordered'">
                    <li v-for="(item, i) in block.data.items" :key="i" v-html="item"></li>
                </ul>
                <ol v-if="block.data.style == 'ordered'">
                    <li v-for="(item, i) in block.data.items" :key="i" v-html="item"></li>
                </ol>
            </div>

            <table v-if="block.type == 'table'">
                <tbody>
                    <tr v-for="(tr, i) in block.data.content" :key="i">
                        <td v-for="(td, j) in tr" :key="j" v-html="td"></td>
                    </tr>
                </tbody>
            </table>

            <ul v-if="block.type == 'checklist'" type="checklist">
                <li v-for="(item, i) in block.data.items" :key="i">
                    <i :class="{ 'fad fa-check-circle': item.checked == true, 'fal fa-circle': item.checked == false }"></i>
                    <span v-html="item.text"></span>
                </li>
            </ul>

            <div v-if="block.type == 'imageTool'" class="max-w-screen-md w-full" type="image">
                <div
                    class="flex flex-col items-center justify-center gap-2 px-2"
                    :class="{ with_background: block.data.withBackground, with_border: block.data.withBorder, stretched: block.data.stretched }"
                >
                    <img class="max-w-screen-md w-full" :src="block.data.file.url" :alt="block.data.caption" />
                    <span
                        class="text-xs p-2 rounded-sm border border-solid border-primary-500"
                        v-if="block.data.caption != ''"
                        v-html="block.data.caption"
                    ></span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ["data"],
};
</script>

<style></style>
