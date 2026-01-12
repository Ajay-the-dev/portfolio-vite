<template>
  <div class="container p-2">
    <div class="row">
      <div class="col-md-4 p-0 border-start py-5 d-none d-md-block">
        <item title="Home" :isActive="route.path === '/'" routeLink="/" />
        <item
          title="Services"
          :isActive="route.path === '/services'"
          routeLink="/services"
        />
        <item
          title="Projects"
          :isActive="route.path === '/projects'"
          routeLink="/projects"
        />
        <item
          title="History"
          :isActive="route.path === '/history'"
          routeLink="/history"
        />
        <item
          title="About"
          :isActive="route.path === '/about'"
          routeLink="/about"
        />
      </div>
      <div class="col-md my-3">
        <router-view />
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import item from "./navItem.vue";
import hero from "./Hero.vue";

import { useRoute } from "vue-router";

const route = useRoute();

const props = defineProps({
  isNightMode: {
    type: Boolean,
    default: true,
  },
});

onMounted(() => {
  console.log("navbar mounted");
});
</script>
