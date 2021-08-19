<template>
    <div class="t_card">
        <slot name="content"></slot>
        <div class="t_card_loading" v-if="loading">
            <i class="fad fa-spinner-third fa-spin fa-5x text-violet-400"></i>
        </div>
    </div>
</template>

<script>
export default {
    name: "Card",
    props: ["loading"],
    mounted() {
        
    },
};
</script>

<style></style>
