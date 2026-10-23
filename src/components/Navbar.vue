<template>
  <header class="container py-4">
    <div class="d-flex align-items-center justify-content-between gap-3">
      <router-link to="/" class="brand font-display text-decoration-none">
        AJAY<span class="brand-dot">.</span>DEV
      </router-link>

      <nav class="pill-nav d-none d-md-flex">
        <router-link
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="pill-link font-mono"
          :class="{ active: route.path === link.to }"
        >
          {{ link.title }}
        </router-link>
      </nav>

      <button
        class="theme-btn"
        @click="toggleDays"
        :title="isNightMode ? 'Turn on Day mode' : 'Turn on Night mode'"
      >
        <i class="bi bi-sun" v-if="isNightMode"></i>
        <i class="bi bi-moon" v-else></i>
      </button>
    </div>
  </header>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { displayStore } from "../stores/displayStore.js";

const store = displayStore();
const route = useRoute();

const isNightMode = ref(true);

const links = [
  { title: "Home", to: "/" },
  { title: "Services", to: "/services" },
  { title: "Projects", to: "/projects" },
  { title: "History", to: "/history" },
  { title: "About", to: "/about" },
];

onMounted(() => {
  isNightMode.value = store.isDarkMode;
  setTimeout(() => {
    toggleDays(); // Switch it ON
    setTimeout(() => {
      toggleDays(); // Switch it OFF after another 100ms
    }, 100);
  }, 100);
});

const toggleDays = () => {
  isNightMode.value = !isNightMode.value;
  store.toggleLightMode();
};
</script>

<style>
.brand {
  font-size: 2rem;
  color: var(--text);
}

.brand:hover {
  color: var(--text);
}

.brand-dot {
  color: var(--accent);
}

.pill-nav {
  gap: 0.25rem;
  padding: 0.35rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface) 80%, transparent);
  border: 1px solid var(--line);
  backdrop-filter: blur(8px);
}

.pill-link {
  padding: 0.45rem 0.95rem;
  border-radius: 999px;
  font-size: 0.75rem;
  color: var(--muted);
  text-decoration: none;
  transition: color 0.2s ease, background 0.2s ease;
}

.pill-link:hover {
  color: var(--text);
}

.pill-link.active {
  color: var(--text);
  background: var(--surface-2);
}

.theme-btn {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--text);
  transition: border-color 0.2s ease;
}

.theme-btn:hover {
  border-color: var(--accent);
}
</style>
