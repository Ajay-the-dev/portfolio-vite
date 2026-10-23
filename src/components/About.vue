<template>
  <div class="row last-space">
    <div class="col-md-6 col-12" v-if="router.path === '/history'">
      <div class="mb-3"><span class="fs-2 fw-bold">History</span></div>
      <section>
        <ul class="timeline">
          <li class="timeline-item" v-for="step in steps">
            <h5 class="fw-normal">{{ step.title }}</h5>
            <p class="text-muted fs-small fw-light">
              {{ step.description }}
            </p>
          </li>
        </ul>
      </section>
    </div>
    <div class="col-md-6 col-12" v-if="router.path === '/about'">
      <div
        class="border card rounded-4 shadow-sm"
      >
        <div class="card-body">
          <span class="card-title fw-bold mb-1 fs-3">Ajay Chitambaran</span>
          <p class="text-muted mb-3">
            Software Engineer · Full Stack Developer
          </p>

          <ul class="list-unstyled mb-3">
            <li class="mb-2">
              <i class="bi bi-geo-alt me-2"></i>
              Dubai, UAE
            </li>
            <li class="mb-2">
              <i class="bi bi-telephone me-2"></i>
              +971 562948474
            </li>
            <li class="mb-2">
              <i class="bi bi-envelope me-2"></i>
              <a
                href="mailto:ajaychitambaran@gmail.com"
                class="text-decoration-none fw-lighter"
                :class="isNightMode ? 'text-white' : 'text-dark'"
              >
                ajaychitambaran@gmail.com
              </a>
            </li>
            <li class="mb-2">
              <i class="bi bi-linkedin me-2"></i>
              <a
                href="https://www.linkedin.com/in/ajaychitambaran/"
                target="_blank"
                class="text-decoration-none fw-lighter"
                :class="isNightMode ? 'text-white' : 'text-dark'"
              >
                Ajay Chitambaran
              </a>
            </li>
          </ul>
          <div class="d-flex gap-2 my-5">
            <span class="badge about-tag small-text">Vue.js</span>
            <span class="badge about-tag small-text">PHP</span>
            <span class="badge about-tag small-text">Full Stack</span>
            <span class="badge about-tag small-text">DevOps</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import { displayStore } from "../stores/displayStore.js";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";

const store = displayStore();
const { isDarkMode } = storeToRefs(store);
const router = useRoute();
const isNightMode = ref(true);

const currentStep = ref(0);

const steps = ref([
  {
    title: "Education",
    description: "B.Tech in Information Technology, Kerala, India",
  },
  {
    title: "First Job",
    description: "Started career as a PHP Developer",
  },
  {
    title: "Full Stack Growth",
    description: "Worked with Vue, Node, APIs, and databases",
  },
  {
    title: "Advanced Projects",
    description: "3D websites, SaaS platforms, automation",
  },
  {
    title: "Present",
    description: "Building scalable full-stack systems",
  },
]);

// const nextStep = () => {
//   if (currentStep.value < steps.value.length - 1) {
//     currentStep.value++;
//   }
// };

// const prevStep = () => {
//   if (currentStep.value > 0) {
//     currentStep.value--;
//   }
// };

onMounted(() => {
  isNightMode.value = store.isDarkMode;
});

watch(isDarkMode, (newVal, oldVal) => {
  isNightMode.value = newVal;
});
</script>
<style>
.timeline {
  border-left: 1px solid var(--line);
  position: relative;
  list-style: none;
}

.timeline .timeline-item {
  position: relative;
}

.timeline .timeline-item:after {
  position: absolute;
  display: block;
  top: 0;
}

.timeline .timeline-item:after {
  background-color: var(--accent);
  left: -38px;
  border-radius: 50%;
  height: 11px;
  width: 11px;
  content: "";
}

.about-tag {
  background: transparent;
  color: var(--accent);
  border: 1px solid var(--accent);
  font-weight: 500;
}

.last-space {
  margin-bottom: 7rem !important;
}
</style>
