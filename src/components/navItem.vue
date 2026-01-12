<template>
  <router-link :to="props.routeLink" class="text-decoration-none text-reset">
    <div :class="getBootstrap()">
      <span class="px-2">{{ props.title }}</span>
    </div>
  </router-link>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";

import { displayStore } from "../stores/displayStore.js";
import { storeToRefs } from "pinia";

const store = displayStore();
const { isDarkMode } = storeToRefs(store);
const isNightMode = ref(true);

const props = defineProps({
  title: {
    type: String,
    default: "null",
  },
  isActive: {
    default: false,
  },
  routeLink: {
    default: "/",
  },
});

const getBootstrap = () => {
  let classes = "";
  if (props.isActive) {
    if (isDarkMode.value) {
      classes += " bg-white text-dark ";
    } else {
      classes += " bg-dark text-white ";
    }
  }

  if (isDarkMode.value) {
    classes += " my-1 mx-0 border p-2 w-50 spotter ";
  } else {
    classes += " my-1 mx-0 border p-2 w-50 n-spotter ";
  }
  // console.log("classes" + classes);
  return classes;
};
</script>
<style>
.spotter:hover {
  background-color: #eeeeee;
  color: black;
  cursor: pointer;
  transparency: 50%;
  transform: scale(1.02);
}

.n-spotter:hover {
  background-color: black;
  color: #eeeeee;
  cursor: pointer;
  transparency: 50%;
  transform: scale(1.02);
}
</style>
