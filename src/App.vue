<template>
  <div class="app-shell">
    <Navbar />
    <Main />
    <BottomNav />
  </div>
</template>

<script setup>
import "./theme.css";
import Navbar from "./components/Navbar.vue";
import Main from "./components/Main.vue";
import BottomNav from "./components/BottomNav.vue";
</script>

<style>
.app-shell {
  min-height: 100dvh;
  background-color: var(--bg);
  /* faint concentric rings behind the hero, as in the reference */
  background-image: repeating-radial-gradient(
    circle at 50% 38%,
    transparent 0 120px,
    var(--ring) 120px 121px
  );
  background-attachment: fixed;
  color: var(--text);
  overflow-x: clip;
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>
