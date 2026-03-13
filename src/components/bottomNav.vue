<template>
  <nav
    class="d-block d-md-none"
    :class="isDarkMode ? 'bottom-nav' : 'bottom-nav-light bg-white'"
  >
    <div
      class="row centrify text-center"
      :class="isDarkMode ? 'bg-black text-white' : 'bg-white text-dark'"
    >
      <div class="col-2 mx-1" v-for="(nav, index) in navigations">
        <router-link
          :to="nav.routerPath"
          :class="
            isDarkMode
              ? 'nav-item bg-black text-white'
              : 'nav-item bg-white text-dark'
          "
        >
          <span :id="isDarkMode ? 'logo' : 'logo2'"
            ><i :class="`bi ${nav.icon}`"></i
          ></span>
          <br />
          <small
            ><span class="fw-lighter small-text">{{ nav.title }}</span></small
          >
        </router-link>
      </div>
    </div>
  </nav>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import { displayStore } from "../stores/displayStore.js";
import { storeToRefs } from "pinia";

const store = displayStore();
const { isDarkMode } = storeToRefs(store);

const navigations = ref([
  { id: "1", title: "Home", icon: "bi-house", routerPath: "/" },
  { id: "2", title: "Services", icon: "bi-tools", routerPath: "/services" },
  {
    id: "3",
    title: "Projects",
    icon: "bi-window-stack",
    routerPath: "/projects",
  },
  {
    id: "4",
    title: "History",
    icon: "bi-clock-history",
    routerPath: "/history",
  },
  {
    id: "4",
    title: "About",
    icon: "bi-person-square",
    routerPath: "/about",
  },
]);
</script>
<style>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 1.5rem 0;
  background: #212529;
  border-top: 1px solid #ccc;
}

.bottom-nav-light {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 1.5rem 0;
  border-top: 1px solid #ccc;
}

/* Light / Dark using CSS variables */
:root {
  --nav-bg: #eee;
  --nav-color: #444;
  --nav-active: #007bff;
}

.dark {
  --nav-bg: #000;
  --nav-color: #fff;
  --nav-active: #fff;
}

.nav-item {
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
}

/* Active route */
.router-link-exact-active {
  color: grey;
  font-weight: 700;
  /* border-bottom: 2px solid #ffffff; */
}

.router-link-exact-active > #logo {
  border-bottom: 2px solid #ffffff;
}

.router-link-exact-active > #logo2 {
  border-bottom: 2px solid black;
}

.router-link-exact-active > .black-dot {
  border-bottom: 2px solid black;
}

.centrify {
  width: 95%;
  margin-left: auto;
  margin-right: auto;
}

a:hover {
  color: #ffffff;
}

.small-text {
  font-size: 8pt;
  text-decoration: none;
}
</style>
