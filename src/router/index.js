import { createRouter, createWebHistory } from "vue-router";
import Home from "../components/Hero.vue";
import Services from "../components/Services.vue";
import Projects from "../components/Projects.vue";
import About from "../components/About.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/services", component: Services },
  { path: "/projects", component: Projects },
  { path: "/about", component: About },
  { path: "/history", component: About },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
