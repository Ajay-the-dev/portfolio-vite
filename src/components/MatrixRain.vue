<template>
  <canvas ref="canvas" class="matrix-rain" aria-hidden="true"></canvas>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { displayStore } from "../stores/displayStore.js";
import { storeToRefs } from "pinia";

const store = displayStore();
const { matrixRain } = storeToRefs(store);

const canvas = ref(null);
const glyphs =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789";
const fontSize = 16;
const frameInterval = 1000 / 30;

let ctx = null;
let drops = [];
let frameId = null;
let lastFrame = 0;

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const resize = () => {
  const el = canvas.value;
  el.width = window.innerWidth;
  el.height = window.innerHeight;
  const columns = Math.ceil(el.width / fontSize);
  drops = Array.from({ length: columns }, () =>
    Math.floor((Math.random() * -el.height) / fontSize)
  );
};

const draw = (time) => {
  frameId = requestAnimationFrame(draw);
  if (time - lastFrame < frameInterval) return;
  lastFrame = time;

  const el = canvas.value;
  ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
  ctx.fillRect(0, 0, el.width, el.height);
  ctx.font = `${fontSize}px monospace`;

  drops.forEach((y, i) => {
    const char = glyphs[Math.floor(Math.random() * glyphs.length)];
    // bright head, green trail
    ctx.fillStyle = Math.random() > 0.975 ? "#d6ffd6" : "#00ff41";
    ctx.fillText(char, i * fontSize, y * fontSize);

    if (y * fontSize > el.height && Math.random() > 0.975) {
      drops[i] = 0;
    } else {
      drops[i] = y + 1;
    }
  });
};

const start = () => {
  if (reducedMotion || frameId) return;
  frameId = requestAnimationFrame(draw);
};

const stop = () => {
  if (frameId) cancelAnimationFrame(frameId);
  frameId = null;
  ctx?.clearRect(0, 0, canvas.value.width, canvas.value.height);
};

onMounted(() => {
  ctx = canvas.value.getContext("2d");
  resize();
  window.addEventListener("resize", resize);
  if (matrixRain.value) start();
});

onBeforeUnmount(() => {
  stop();
  window.removeEventListener("resize", resize);
});

watch(matrixRain, (val) => (val ? start() : stop()));
</script>
<style>
.matrix-rain {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  opacity: 0.35;
  pointer-events: none;
}
</style>
