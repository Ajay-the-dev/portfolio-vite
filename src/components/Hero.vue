<template>
  <p class="fs-6 mb-4" aria-live="polite">
    {{ typed }}<span class="matrix-cursor">█</span>
  </p>
  <h1>
    <span class="fst-italic fw-light">I’m</span>
    <br />
    <span class="fw-normal"> <b>Ajay </b>Chitambaran</span>
    <br />
    <span class="fs-6 text-secondary">Web Developer</span>
  </h1>
  <p class="fw-light">
    Full-stack developer focused on clean code, scalable systems, and modern web
    technologies.
  </p>
  <!-- <br /> -->
  <a href="https://www.linkedin.com/in/ajaychitambaran/" target="_blank">
    <i class="bi bi-linkedin text-secondary"></i>
  </a>
  <a href="https://github.com/Ajay-the-dev" target="_blank">
    <i class="mx-2 bi bi-github text-secondary"></i>
  </a>
  <Cube />
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import Cube from "./techStack.vue";

const lines = [
  "Wake up, Neo...",
  "The Matrix has you...",
  "Follow the white rabbit.",
  "Knock, knock.",
];
const typed = ref("");
let timer = null;

const typeLine = (lineIndex = 0, charIndex = 0) => {
  const line = lines[lineIndex];
  if (charIndex <= line.length) {
    typed.value = line.slice(0, charIndex);
    timer = setTimeout(() => typeLine(lineIndex, charIndex + 1), 90);
  } else {
    timer = setTimeout(
      () => typeLine((lineIndex + 1) % lines.length, 0),
      2200
    );
  }
};

onMounted(() => typeLine());
onBeforeUnmount(() => clearTimeout(timer));
</script>
