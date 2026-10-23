<template>
  <section class="hero" @pointermove="onMove" @pointerleave="resetMove">
    <ul class="stack-rail" aria-label="Tech stack">
      <li v-for="item in stack" :key="item.name" :title="item.name">
        <img :src="item.src" :alt="item.name" />
      </li>
      <li class="more" title="And more">+{{ extraCount }}</li>
    </ul>

    <!-- 3D toroidal spiral: a helix wound around a torus, rotated and projected -->
    <canvas ref="canvas" class="spiral" aria-hidden="true"></canvas>

    <div class="intro text-center">
      <h1 class="intro-name">Ajay Chitambaran</h1>
      <p class="intro-role">
        Full-stack developer · clean code, scalable systems
      </p>
      <div class="intro-links">
        <a href="https://www.linkedin.com/in/ajaychitambaran/" target="_blank" title="LinkedIn">
          <i class="bi bi-linkedin"></i>
        </a>
        <a href="https://github.com/Ajay-the-dev" target="_blank" title="GitHub">
          <i class="bi bi-github"></i>
        </a>
      </div>
    </div>
  </section>
</template>
<script setup>
import { onMounted, onUnmounted, ref } from "vue";

const devicon = (name) =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${name}/${name}-original.svg`;

const stack = [
  { name: "Vue.js", src: devicon("vuejs") },
  { name: "Laravel", src: devicon("laravel") },
  { name: "PHP", src: devicon("php") },
  { name: "Docker", src: devicon("docker") },
];
// JavaScript, HTML, CSS, MySQL, Node.js, GitHub, Jenkins, Pinia
const extraCount = 8;

// Hay-bale roll: a thick-walled tube viewed in perspective at an angle.
// Rings along z form the outer and inner walls; each end face is a spiral
// wound from the inner wall out to the outer wall, like rolled hay.
const RINGS = 26;
const TUBE_LENGTH = 2.6;
const OUTER = 1;
const INNER = 0.55;
const FACE_TURNS = 9;
const SEGMENTS = 96;
const LINE_WIDTH = 2; // thread thickness in CSS px
const CAMERA = 3;
const BASE_YAW = 0.3;
const BASE_PITCH = 0.02;
const RING_DELAY_MS = 55;
const RING_FADE_MS = 450;

const ring = (radius, z) =>
  Array.from({ length: SEGMENTS }, (_, s) => {
    const a = (s / SEGMENTS) * Math.PI * 2;
    return [radius * Math.cos(a), radius * Math.sin(a), z];
  });

const faceSpiral = (z) => {
  const steps = SEGMENTS * FACE_TURNS;
  return Array.from({ length: steps + 1 }, (_, s) => {
    const a = (s / SEGMENTS) * Math.PI * 2;
    const r = INNER + ((OUTER - INNER) * s) / steps;
    return [r * Math.cos(a), r * Math.sin(a), z];
  });
};

// t: 0 = front, 1 = back; drives draw order, depth fade and the fade-in stagger
const strands = [];
for (let i = 0; i < RINGS; i++) {
  const t = i / (RINGS - 1);
  const z = (t - 0.5) * TUBE_LENGTH;
  strands.push({ points: ring(OUTER, z), closed: true, t, weight: 1 });
  strands.push({ points: ring(INNER, z), closed: true, t, weight: 0.5 });
}
strands.push({ points: faceSpiral(-TUBE_LENGTH / 2), closed: false, t: 0, weight: 0.9 });
strands.push({ points: faceSpiral(TUBE_LENGTH / 2), closed: false, t: 1, weight: 0.9 });
strands.sort((a, b) => b.t - a.t);

const canvas = ref(null);
// pointer offset in [-0.5, 0.5]; eased toward the target each frame
const target = { x: 0, y: 0 };
const pointer = { x: 0, y: 0 };

const onMove = (e) => {
  const box = e.currentTarget.getBoundingClientRect();
  target.x = (e.clientX - box.left) / box.width - 0.5;
  target.y = (e.clientY - box.top) / box.height - 0.5;
};

const resetMove = () => {
  target.x = 0;
  target.y = 0;
};

let frame = 0;
let resizeObserver = null;

onMounted(() => {
  const el = canvas.value;
  const ctx = el.getContext("2d");
  const accent =
    getComputedStyle(el).getPropertyValue("--accent").trim() || "#ff3b3b";
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let width = 0;
  let height = 0;
  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    width = el.clientWidth;
    height = el.clientHeight;
    el.width = width * dpr;
    el.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // resizing clears the canvas, so make sure a frame is queued
    if (!frame) frame = requestAnimationFrame(draw);
  };

  const start = performance.now();

  const draw = (now) => {
    frame = 0;
    pointer.x += (target.x - pointer.x) * 0.06;
    pointer.y += (target.y - pointer.y) * 0.06;

    const elapsed = reduceMotion ? Infinity : now - start;
    // gentle idle sway plus pointer steering
    const sway = reduceMotion ? 0 : Math.sin(now * 0.0004) * 0.08;
    const yaw = BASE_YAW + sway + pointer.x * 0.6;
    const pitch = BASE_PITCH + sway * 0.4 + pointer.y * 0.5;

    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const cosX = Math.cos(pitch);
    const sinX = Math.sin(pitch);
    const scale = Math.min(width / 4.2, height / 3.6) * 0.95;

    // Project every strand, tracking the bounding box so the roll stays centred
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    const projected = strands.map((strand) =>
      strand.points.map(([x, y, z]) => {
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        const p = CAMERA / (CAMERA + z2);
        const px = x1 * p * scale;
        const py = y2 * p * scale;
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
        return [px, py];
      })
    );
    const ox = width / 2 - (minX + maxX) / 2;
    const oy = height / 2 - (minY + maxY) / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = accent;
    // thinner on small screens so the strands don't merge into a solid disc
    ctx.lineWidth = Math.max(1, LINE_WIDTH * Math.min(1, scale / 130));

    // Back to front; each strand fades in shortly after the one in front of it
    let settled = true;
    strands.forEach((strand, k) => {
      const delay = strand.t * (RINGS - 1) * RING_DELAY_MS;
      const appear = Math.min(Math.max((elapsed - delay) / RING_FADE_MS, 0), 1);
      if (appear < 1) settled = false;
      if (!appear) return;
      const depthFade = 1 - strand.t * 0.45;
      ctx.globalAlpha = appear * depthFade * strand.weight;
      ctx.beginPath();
      projected[k].forEach(([px, py], s) => {
        if (s === 0) ctx.moveTo(px + ox, py + oy);
        else ctx.lineTo(px + ox, py + oy);
      });
      if (strand.closed) ctx.closePath();
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    if (!reduceMotion || !settled) frame = requestAnimationFrame(draw);
  };

  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(el);
  resize();
});

onUnmounted(() => {
  cancelAnimationFrame(frame);
  resizeObserver?.disconnect();
});
</script>

<style>
.hero {
  position: relative;
  min-height: calc(100dvh - 2 * var(--pad) - 9rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.spiral {
  display: block;
  width: min(100%, 760px);
  aspect-ratio: 3 / 2;
  filter: drop-shadow(0 0 6px var(--accent-soft));
}

.stack-rail {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0.4rem;
  list-style: none;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--line);
}

.stack-rail li {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #1f1f1f;
}

.stack-rail img {
  width: 15px;
  height: 15px;
}

.stack-rail .more {
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--muted);
}

.intro-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text);
}

.intro-role {
  margin: 0.25rem 0 0.75rem;
  font-size: 0.85rem;
  color: var(--muted);
}

.intro-links {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.intro-links a {
  color: var(--muted);
  transition: color 0.2s ease;
}

.intro-links a:hover {
  color: var(--accent);
}

@media (max-width: 575.98px) {
  .stack-rail {
    position: static;
    transform: none;
    flex-direction: row;
  }
}
</style>
