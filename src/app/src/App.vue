<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView, useRouter } from 'vue-router';
const router = useRouter();
onMounted(() => {
  router.push('/');
})
</script>

<template>
  <h1>YALPER</h1>
  <RouterView></RouterView>
</template>

<style>
html,
body {
  background-color: #fff;
}
</style>
