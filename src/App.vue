<template>
  <div :class="isDarkMode ? 'bg-dark text-white' : 'bg-white text-dark'">
    <Navbar />
    <Home />
    <BottomNav />
  </div>
</template>

<script setup>
import { watch } from "vue";
import Navbar from "./components/Navbar.vue";
import Home from "./components/Main.vue";
import BottomNav from "./components/bottomNav.vue";

import { displayStore } from "./stores/displayStore.js";
import { storeToRefs } from "pinia";
import { useDark } from "@vueuse/core";

const store = displayStore();
const { isDarkMode } = storeToRefs(store);

// VueUse handles attribute automatically
const isDark = useDark({
  selector: "#app",
  attribute: "color-scheme",
  valueDark: "dark",
  valueLight: "light",
});

// sync pinia → vueuse
watch(isDarkMode, (val) => {
  isDark.value = val;
});
</script>

<style>
#app {
  /* overflow: hidden; */
}

body {
  font-family: "Space Grotesk", sans-serif;
}
.text-white {
  color: #ffffff !important;
}

.text-dark {
  color: #212529 !important;
}

.bg-white {
  background-color: #ffffff !important;
}

.bg-dark {
  background-color: #212529 !important;
}

[color-scheme="dark"] {
  background-color: #212529 !important;
  color: #ffffff !important;
  height: 100vh;
}

[color-scheme="light"] {
  background-color: #ffffff !important;
  color: #212529 !important;
  height: 100vh;
}
</style>
