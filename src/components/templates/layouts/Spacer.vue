<template>
    <div class="t_spacer">
        <span class="bg-gray-100"></span>
        <p class="text-white" v-if="text">{{text}}</p>
        <span class="bg-gray-100"></span>
    </div>
</template>

<script>
export default {
    name: "Spacer",
    props: ['text'],
};
</script>

<style></style>
