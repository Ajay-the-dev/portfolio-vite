<template>
  <div class="row">
    <!-- Desktop view -->
    <div
      class="align-content-center border col-md-3 col-12 text-center boxing m-2 shadow d-none d-md-block"
      :class="isNightMode ? 'heartbeat' : 'heartbeat-black'"
      v-for="service in services"
    >
      <i :title="service.desc" :class="`bi bi-${service.logo}`"></i>
      <br />
      <span>{{ service.name }}</span>
    </div>

    <!-- mobile view -->
    <div
      class="align-content-center border col-md-3 col-12 m-2 text-center shadow row"
      :class="isNightMode ? 'heartbeat' : 'heartbeat-black'"
      v-for="service in services"
    >
      <div class="">
        <div class="col p-3">
          <i :title="service.desc" :class="`bi bi-${service.logo} p-2`"></i>
          <span>{{ service.name }}</span>
        </div>
      </div>
      <br />
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import { displayStore } from "../stores/displayStore.js";
import { storeToRefs } from "pinia";

const store = displayStore();
const { isDarkMode } = storeToRefs(store);
const isNightMode = ref(true);

const services = ref([
  {
    name: "Full-Stack Web Development",
    desc: "Developing and maintaining scalable web applications using Vue.js, PHP, and Laravel",
    logo: "layers",
  },
  {
    name: "Frontend Engineering",
    desc: "Building interactive user interfaces and state management systems using Vue.js, Vuex, and Pinia.",
    logo: "window",
  },
  {
    name: "API Development & Integration",
    desc: "Implementing secure RESTful APIs and optimizing backend database queries for high performance.",
    logo: "diagram-3",
  },
  {
    name: "Database Migration & Management",
    desc: "Migrating and populating data from legacy systems to new structures while ensuring data integrity and consistency.",
    logo: "database-check",
  },
  {
    name: "DevOps & Automation",
    desc: "Streamlining development with CI/CD pipelines in Jenkins and environment containerization using Docker.",
    logo: "gear-wide-connected",
  },
  {
    name: "Software Architecture",
    desc: "Designing comprehensive systems for academic management and infrastructure tracking.",
    logo: "cpu",
  },
]);

onMounted(() => {
  isNightMode.value = store.getLightMode();
});

watch(isDarkMode, (newVal, oldVal) => {
  isNightMode.value = newVal;
});
</script>
<style>
.boxing {
  aspect-ratio: 1/1;
}

.heartbeat:hover {
  animation: heartbeat 1.2s ease-in-out infinite;
  box-shadow: 0 0 1px 1px rgba(255, 255, 255, 0.9);
}

.heartbeat-black:hover {
  animation: heartbeat 1.2s ease-in-out infinite;
  box-shadow: 0 0 0.5px 0.5px rgba(0, 0, 0, 0.9);
}

@keyframes heartbeat {
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.01);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.01);
  }
  70% {
    transform: scale(1);
  }
}
</style>
