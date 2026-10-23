<template>
  <div class="w7-taskbar" @pointerdown.stop>
    <button
      class="w7-orb"
      :class="{ 'w7-orb-open': menuOpen }"
      aria-label="Start"
      @click="toggleMenu"
    ></button>

    <div class="w7-tasks">
      <button
        v-for="w in windows"
        :key="w.app.id"
        class="w7-task"
        :class="{ 'w7-task-active': w.app.id === activeId && !w.minimized }"
        :title="w.app.title"
        @click="emit('toggle', w)"
      >
        <img :src="w.app.icon" alt="" draggable="false" />
      </button>
    </div>

    <div class="w7-tray">
      <a href="https://www.linkedin.com/in/ajaychitambaran/" target="_blank" title="LinkedIn">
        <i class="bi bi-linkedin"></i>
      </a>
      <a href="https://github.com/Ajay-the-dev" target="_blank" title="GitHub">
        <i class="bi bi-github"></i>
      </a>
      <div class="w7-clock">
        <span>{{ time }}</span>
        <span>{{ date }}</span>
      </div>
    </div>
    <button
      class="w7-show-desktop"
      title="Show desktop"
      aria-label="Show desktop"
      @click="emit('showDesktop')"
    ></button>

    <div v-if="menuOpen" class="w7-startmenu">
      <div class="w7-sm-left">
        <ul class="w7-sm-programs">
          <li v-for="app in matches" :key="app.id" @click="launch(app)">
            <img :src="app.icon" alt="" draggable="false" />
            <span>{{ app.label }}</span>
          </li>
          <li v-if="!matches.length" class="w7-sm-empty">
            No items match your search.
          </li>
        </ul>
        <input
          ref="searchEl"
          v-model="query"
          class="w7-sm-search"
          type="search"
          placeholder="Search programs and files"
          @keydown.enter="matches[0] && launch(matches[0])"
          @keydown.esc="closeMenu"
        />
      </div>
      <div class="w7-sm-right">
        <img class="w7-sm-user" src="/win7/icons/user.png" alt="" />
        <ul>
          <li class="w7-sm-name">Ajay Chitambaran</li>
          <li v-for="app in rightLinks" :key="app.id" @click="launch(app)">
            {{ app.startLabel }}
          </li>
          <li class="w7-sm-sep"></li>
          <li>
            <a href="https://www.linkedin.com/in/ajaychitambaran/" target="_blank">LinkedIn</a>
          </li>
          <li>
            <a href="https://github.com/Ajay-the-dev" target="_blank">GitHub</a>
          </li>
          <li>
            <a href="mailto:ajaychitambaran@gmail.com">E-mail</a>
          </li>
        </ul>
        <div class="w7-sm-shutdown">
          <button @click="shutdown">Shut down</button>
          <button aria-label="Shut down options" @click="shutdown">
            <i class="bi bi-caret-right-fill"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  apps: { type: Array, required: true },
  windows: { type: Array, required: true },
  activeId: { type: String, default: null },
});

const emit = defineEmits(["toggle", "open", "shutdown", "showDesktop"]);

const menuOpen = ref(false);
const query = ref("");
const searchEl = ref(null);
const time = ref("");
const date = ref("");
let timer = null;

const matches = computed(() => {
  const q = query.value.trim().toLowerCase();
  return props.apps.filter((a) => a.label.toLowerCase().includes(q));
});

const rightLinks = computed(() => props.apps.filter((a) => a.startLabel));

const tick = () => {
  const now = new Date();
  time.value = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  date.value = now.toLocaleDateString();
};

const closeMenu = () => {
  menuOpen.value = false;
  query.value = "";
};

const toggleMenu = async () => {
  if (menuOpen.value) return closeMenu();
  menuOpen.value = true;
  await nextTick();
  searchEl.value?.focus();
};

const launch = (app) => {
  emit("open", app);
  closeMenu();
};

const shutdown = () => {
  emit("shutdown");
  closeMenu();
};

onMounted(() => {
  tick();
  timer = setInterval(tick, 15000);
  window.addEventListener("pointerdown", closeMenu);
});

onBeforeUnmount(() => {
  clearInterval(timer);
  window.removeEventListener("pointerdown", closeMenu);
});
</script>

<style>
.w7-taskbar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  display: flex;
  align-items: stretch;
  height: 40px;
  background: linear-gradient(180deg, rgba(40, 60, 90, 0.55) 0%, rgba(20, 35, 60, 0.7) 50%, rgba(10, 20, 40, 0.78) 100%);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.6);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
  font: 9pt "Segoe UI", SegoeUI, "Noto Sans", sans-serif;
}

/* Sprite: normal / hover / pressed, 54px each */
.w7-orb {
  position: relative;
  top: -7px;
  flex: 0 0 54px;
  width: 54px;
  height: 54px;
  margin: 0 4px 0 2px;
  padding: 0;
  border: none;
  background: url("/win7/icons/start-orb.png") 0 0 / 54px 162px no-repeat;
}

.w7-orb:hover {
  background-position: 0 -54px;
}

.w7-orb:active,
.w7-orb-open {
  background-position: 0 -108px;
}

.w7-tasks {
  flex: 1;
  display: flex;
  gap: 2px;
  padding: 0 2px;
  overflow: hidden;
}

.w7-task {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 60px;
  height: 100%;
  padding: 0;
  border: 1px solid rgba(0, 0, 0, 0.5);
  border-radius: 3px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.02) 51%, rgba(255, 255, 255, 0.1) 100%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
}

.w7-task:hover {
  background: linear-gradient(180deg, rgba(160, 210, 255, 0.45) 0%, rgba(90, 160, 230, 0.3) 50%, rgba(60, 130, 210, 0.25) 51%, rgba(120, 190, 255, 0.4) 100%);
}

.w7-task-active {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 51%, rgba(255, 255, 255, 0.25) 100%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45), inset 0 0 8px rgba(255, 255, 255, 0.3);
}

.w7-task img {
  width: 32px;
  height: 32px;
}

.w7-tray {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px 0 10px;
  color: #fff;
}

.w7-tray a {
  color: rgba(255, 255, 255, 0.9);
}

.w7-clock {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 15px;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.6);
}

.w7-show-desktop {
  flex: 0 0 15px;
  padding: 0;
  border: none;
  border-left: 1px solid rgba(0, 0, 0, 0.5);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.08));
  box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.3);
}

.w7-show-desktop:hover {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.2));
}

/* ---------- Start menu ---------- */
.w7-startmenu {
  position: absolute;
  left: 0;
  bottom: 40px;
  display: flex;
  gap: 6px;
  width: min(400px, 100vw);
  height: min(520px, calc(100vh - 50px));
  padding: 8px 8px 10px;
  border: 1px solid rgba(0, 0, 0, 0.65);
  border-radius: 7px 7px 0 0;
  background: linear-gradient(180deg, rgba(60, 100, 150, 0.6), rgba(25, 50, 85, 0.75));
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35), 2px -2px 12px rgba(0, 0, 0, 0.45);
}

.w7-sm-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 0 0 245px;
  min-width: 0;
}

.w7-sm-programs {
  flex: 1;
  margin: 0;
  padding: 6px;
  list-style: none;
  overflow: auto;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.6);
  border-radius: 4px;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.4);
}

.w7-sm-programs li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 6px;
  border: 1px solid transparent;
  border-radius: 3px;
  color: #000;
  cursor: default;
}

.w7-sm-programs li img {
  width: 32px;
  height: 32px;
}

.w7-sm-programs li:not(.w7-sm-empty):hover {
  background: linear-gradient(180deg, #eaf4fd 0%, #d9ebfc 100%);
  border-color: #a8d1f5;
}

.w7-sm-empty {
  color: #6d6d6d !important;
  font-style: italic;
}

.w7-sm-search {
  height: 24px;
  padding: 0 8px;
  border: 1px solid rgba(0, 0, 0, 0.5);
  border-radius: 3px;
  background: #fff;
  font: italic 9pt "Segoe UI", SegoeUI, sans-serif;
  outline: none;
}

.w7-sm-right {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 52px;
  color: #fff;
}

.w7-sm-user {
  position: absolute;
  top: -40px;
  left: 50%;
  width: 64px;
  height: 64px;
  transform: translateX(-50%);
}

.w7-sm-right ul {
  flex: 1;
  margin: 0;
  padding: 0;
  list-style: none;
}

.w7-sm-right li {
  padding: 5px 8px;
  border: 1px solid transparent;
  border-radius: 3px;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.7);
  cursor: default;
}

.w7-sm-right li a {
  color: #fff;
  text-decoration: none;
}

.w7-sm-right li:not(.w7-sm-sep):not(.w7-sm-name):hover {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.12));
  border-color: rgba(255, 255, 255, 0.5);
}

.w7-sm-name {
  font-weight: 600;
}

.w7-sm-sep {
  height: 1px;
  margin: 4px 8px;
  padding: 0 !important;
  background: rgba(255, 255, 255, 0.25);
}

.w7-sm-shutdown {
  display: flex;
  align-self: flex-start;
  margin-left: 6px;
}

.w7-sm-shutdown button {
  height: 24px;
  padding: 0 12px;
  border: 1px solid rgba(0, 0, 0, 0.6);
  background: linear-gradient(180deg, #d9805a 0%, #c55a32 50%, #b0401a 51%, #c96a40 100%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
  color: #fff;
  font: 9pt "Segoe UI", SegoeUI, sans-serif;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.6);
}

.w7-sm-shutdown button:first-child {
  border-radius: 3px 0 0 3px;
}

.w7-sm-shutdown button:last-child {
  padding: 0 6px;
  border-left: none;
  border-radius: 0 3px 3px 0;
  font-size: 8px;
}

.w7-sm-shutdown button:hover {
  filter: brightness(1.12);
}

@media (max-width: 767px) {
  .w7-task {
    flex-basis: 48px;
  }
  .w7-sm-left {
    flex-basis: 58%;
  }
}
</style>
