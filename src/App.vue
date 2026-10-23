<template>
  <div class="stage">
    <div class="frame">
      <Navbar />
      <div class="frame-body">
        <Main />
      </div>
    </div>
  </div>
</template>

<script setup>
import "./theme.css";
import Navbar from "./components/Navbar.vue";
import Main from "./components/Main.vue";
</script>

<style>
.stage {
  --pad: 0px;
  min-height: 100dvh;
  background: var(--bg);
}

/* Full-screen black "screen" everything lives in; content scrolls inside it
   so the corner navigation stays put. */
.frame {
  position: relative;
  height: 100dvh;
  background: var(--bg);
  overflow: hidden;
  animation: power-on 0.7s ease-out both;
}

.frame-body {
  height: 100%;
  overflow-y: auto;
  padding: 4.5rem clamp(1.25rem, 4vw, 3.5rem);
  scrollbar-width: thin;
  scrollbar-color: var(--accent-soft) transparent;
}

/* Brief flicker on load, like a screen powering on */
@keyframes power-on {
  0% {
    opacity: 0;
    filter: brightness(3);
  }
  15% {
    opacity: 1;
  }
  25% {
    opacity: 0.35;
  }
  40% {
    opacity: 1;
    filter: brightness(1.6);
  }
  100% {
    opacity: 1;
    filter: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .frame {
    animation: none;
  }
}
</style>
