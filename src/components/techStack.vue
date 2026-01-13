<template>
  <div class="rubiks-wrapper d-block d-sm-none scale-50">
    <TransitionGroup tag="div" class="cube" :name="currentAnimation">
      <div v-for="logo in logos" :key="logo.id" class="cell">
        <img :src="logo.src" alt="logo" />
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const animations = ["fade"];

const currentAnimation = ref("fade");

const logos = ref([
  {
    id: 1,
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg",
  },
  {
    id: 2,
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  },
  {
    id: 3,
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  },
  {
    id: 4,
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  },
  {
    id: 5,
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
  },
  {
    id: 6,
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  },
  {
    id: 7,
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  },
  {
    id: 8,
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  },
  {
    id: 9,
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
  },
]);

function shuffleLogos() {
  currentAnimation.value =
    animations[Math.floor(Math.random() * animations.length)];

  logos.value = [...logos.value].sort(() => Math.random() - 0.5);
}

onMounted(() => {
  setInterval(shuffleLogos, 2000);
});
</script>

<style scoped>
/* Layout */
.rubiks-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.cube {
  display: grid;
  grid-template-columns: repeat(3, 90px);
  grid-template-rows: repeat(3, 90px);
  gap: 6px;
  padding: 6px;
  /* background: #000; */
  border-radius: 12px;
}

.cell {
  /* background: #111; */
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell img {
  width: 45px;
  height: 45px;
}

/* ---------- Animations ---------- */

/* Fade */
.fade-move {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Dissolve */
.dissolve-move {
  transition: opacity 0.5s ease, filter 0.5s ease;
}
.dissolve-enter-from,
.dissolve-leave-to {
  opacity: 0;
  filter: blur(8px);
}

/* Scale */
.scale-move {
  transition: transform 0.4s ease, opacity 0.4s ease;
}
.scale-enter-from,
.scale-leave-to {
  transform: scale(0.3);
  opacity: 0;
}

/* Rotate */
.rotate-move {
  transition: transform 0.5s ease, opacity 0.5s ease;
}
.rotate-enter-from,
.rotate-leave-to {
  transform: rotate(180deg) scale(0.5);
  opacity: 0;
}

/* Slide */
.slide-move {
  transition: transform 0.4s ease, opacity 0.4s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateY(40px);
  opacity: 0;
}

img {
  filter: grayscale(100%);
}

.scale-50 {
  transform: scale(0.50);
}
</style>
