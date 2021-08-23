<template>
    <div class="t_spacer">
        <span class="bg-gray-500"></span>
        <p v-if="text">{{text}}</p>
        <span class="bg-gray-500"></span>
    </div>
</template>

<script>
export default {
    name: "Spacer",
    props: ['text'],
};
</script>

<style></style>
