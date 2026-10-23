<template>
  <main class="px-3 px-md-5">
    <mainArea />
    <div v-if="route.path == '/'">
      <footerArea />
    </div>
  </main>
</template>
<script setup>
import mainArea from "./Navmain.vue";
import footerArea from "./footer.vue";
import { useRoute } from "vue-router";

const route = useRoute();
</script>
