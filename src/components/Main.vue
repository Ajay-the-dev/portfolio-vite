<template>
  <div :class="isNightMode ? 'bg-dark text-white px-5' : 'px-5'">
    <div class="align-content-md-center">
      <mainArea />
    </div>
    <div v-if="route.path == '/'">
      <footerArea />
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from "vue";
import navbar from "./Navbar.vue";
import mainArea from "./Navmain.vue";
import footerArea from "./footer.vue";
import { useRoute } from "vue-router";

import { displayStore } from "../stores/displayStore.js";
import { storeToRefs } from "pinia";

const store = displayStore();
const { isDarkMode } = storeToRefs(store);
const isNightMode = ref(true);
const route = useRoute();

onMounted(() => {
  isNightMode.value = store.getLightMode();
});

const toggleNightmode = (payload) => {
  isNightMode.value = payload;
};

watch(isDarkMode, (newVal, oldVal) => {
  isNightMode.value = newVal;
});
</script>
