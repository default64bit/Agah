<template>
    <div class="flex flex-col items-center justify-center gap-8 w-full h-full p-8">
        <img class="w-4/12 max-w-screen-sm min-w-min md:min-w-0" src="../../assets/images/404.svg" alt="404">
        <p class="text-white text-3xl text-center">The page you are looking for is not here!</p>
        <button @click="$router.go(-1)" class="t_button text-2xl px-8 text-white bg-violet-500 hover:bg-violet-600">Go Back</button>
    </div>
</template>

<script>
export default {};
</script>

<style></style>
