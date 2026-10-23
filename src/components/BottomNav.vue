<template>
  <nav class="bottom-nav d-flex d-md-none">
    <router-link
      v-for="nav in navigations"
      :key="nav.routerPath"
      :to="nav.routerPath"
      class="bottom-link"
    >
      <i :class="`bi ${nav.icon}`"></i>
      <span class="font-mono small-text">{{ nav.title }}</span>
    </router-link>
  </nav>
</template>
<script setup>
const navigations = [
  { title: "Home", icon: "bi-house", routerPath: "/" },
  { title: "Services", icon: "bi-tools", routerPath: "/services" },
  { title: "Projects", icon: "bi-window-stack", routerPath: "/projects" },
  { title: "History", icon: "bi-clock-history", routerPath: "/history" },
  { title: "About", icon: "bi-person-square", routerPath: "/about" },
];
</script>
<style>
.bottom-nav {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  z-index: 10;
  justify-content: space-around;
  padding: 0.4rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface) 85%, transparent);
  border: 1px solid var(--line);
  backdrop-filter: blur(10px);
}

.bottom-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  flex: 1;
  padding: 0.45rem 0;
  border-radius: 999px;
  color: var(--muted);
  text-decoration: none;
}

.bottom-link:hover {
  color: var(--text);
}

.bottom-link.router-link-exact-active {
  color: var(--text);
  background: var(--surface-2);
}

.bottom-link.router-link-exact-active i {
  color: var(--accent);
}

.small-text {
  font-size: 8pt;
  text-decoration: none;
}
</style>
