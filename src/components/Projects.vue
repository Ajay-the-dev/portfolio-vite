<template>
  <div class="row">
    <div
      class="align-content-center border col-md-8 my-1 p-3 shadow-sm"
      :class="isNightMode ? 'heartbeat' : 'heartbeat-black'"
      v-for="project in projects"
      @click="showDiv(project)"
    >
      <span class="fs-5 fw-normal text-left">
        {{ project.name }}
      </span>
      <br />
      <span class="fs-6 fw-light" v-if="project.id === selectedId">{{
        project.desc
      }}</span>
      <br v-if="project.id === selectedId && project.link !== ''" />
      <span
        class="fs-6 fw-light fst-italic text-white"
        v-if="project.id === selectedId && project.link !== ''"
      >
        <a :href="project.link" target="_blank">View Project</a>
      </span>
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

const selectedId = ref(null);

const projects = ref([
  {
    id: 1,
    name: "Sword Mail",
    desc: "Spam Detection in Email using Content Analysis – A smart filtering system that identifies spam emails by scanning their content, including text patterns, embedded links, and images. This approach goes beyond traditional filters by analyzing the body of the email for hidden or deceptive content, ensuring more accurate detection and better email security.",
    link: "",
    show: false,
  },
  {
    id: 2,
    name: "Gluco",
    desc: "Gluco is a user-friendly mobile application designed to help individuals track and manage their blood glucose levels effectively. The app allows users to log their glucose readings and receive personalized health suggestions based on their data trends and lifestyle inputs",
    link: "",
    show: false,
  },
  {
    id: 3,
    name: "Linways AMS",
    desc: "Linways AMS is a cloud-based Academic Management System designed to streamline and automate the academic workflows of educational institutions. The platform enables administrators, faculty, and students to efficiently manage everything from curriculum planning and assessments to attendance tracking and reporting — all in one centralized system.",
    link: "",
    show: false,
  },
  {
    id: 4,
    name: "User Management System",
    desc: "A centralized system to manage users, roles, and permissions efficiently, ensuring secure access control and streamlined administration across the application",
    link: "https://github.com/Ajay-the-dev/user-management-by-laravel-vue",
    show: false,
  },
  {
    id: 5,
    name: "Olympics ODF XML Data Extraction System",
    desc: "A data extraction system designed to parse and process official Olympics Data Format (ODF) XML files, converting complex event, athlete, and results data into structured and analyzable datasets.",
    link: "https://github.com/Ajay-the-dev/olympics-data-viewer",
    show: false,
  },
  {
    id: 6,
    name: "Personal Portfolio Platform",
    desc: "Designed and developed a personal portfolio website showcasing full-stack projects, interactive UI components, 3D experiences, and optimized performance using Vue.js and modern web technologies",
    link: "https://github.com/Ajay-the-dev/portfolio",
    show: false,
  },
]);

onMounted(() => {
  isNightMode.value = store.getLightMode();
});

watch(isDarkMode, (newVal, oldVal) => {
  isNightMode.value = newVal;
});

const showDiv = (project) => {
  if (selectedId.value === project.id && selectedId.value !== null) {
    selectedId.value = null;
  } else {
    selectedId.value = project.id;
  }
};
</script>
<style>
.boxing {
}

.heartbeat:hover {
  animation: heartbeat 1.2s ease-in-out;
  box-shadow: 0 0 1px 1px rgba(255, 255, 255, 0.9);
  cursor: pointer;
}

.heartbeat-black:hover {
  animation: heartbeat 1.2s ease-in-out;
  box-shadow: 0 0 0.5px 0.5px rgba(0, 0, 0, 0.9);
  cursor: pointer;
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
