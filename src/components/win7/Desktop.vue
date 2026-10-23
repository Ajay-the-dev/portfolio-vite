<template>
  <div class="w7-desktop" @pointerdown="selectedId = null">
    <div class="w7-icons">
      <button
        v-for="app in desktopApps"
        :key="app.id"
        class="w7-icon"
        :class="{ 'w7-icon-selected': selectedId === app.id }"
        @pointerdown.stop="selectedId = app.id"
        @click="onIconClick(app)"
        @dblclick="openApp(app)"
        @keydown.enter="openApp(app)"
      >
        <img :src="app.icon" alt="" draggable="false" />
        <span>{{ app.label }}</span>
      </button>
    </div>

    <template v-for="w in appWindows" :key="w.app.id">
      <Win7Window
        v-show="!w.minimized"
        :title="w.app.title"
        :icon="w.app.icon"
        :x="w.x"
        :y="w.y"
        :z="w.z"
        :active="w.app.id === activeId"
        :maximized="w.maximized"
        :showTitle="w.app.showTitle"
        :crumbs="w.app.crumbs"
        :menus="w.app.menus"
        :flush="w.app.flush"
        :bare="w.app.bare"
        :width="w.app.width"
        :height="w.app.height"
        :fixedSize="w.app.fixedSize"
        @focus="focus(w)"
        @move="({ x, y }) => ((w.x = x), (w.y = y))"
        @minimize="minimize(w)"
        @maximize="w.maximized = !w.maximized"
        @close="close(w)"
      >
        <component
          :is="c"
          v-for="(c, i) in w.app.components"
          :key="i"
          v-bind="w.app.props"
        />
      </Win7Window>
    </template>

    <!-- Webamp empties the node it centres on, so give it its own -->
    <div ref="winampAnchor" class="w7-winamp-anchor"></div>

    <Taskbar
      :apps="apps"
      :windows="windows"
      :activeId="activeId"
      @toggle="toggleFromTaskbar"
      @open="openApp"
      @shutdown="shutdown"
      @showDesktop="showDesktop"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, markRaw, h, provide } from "vue";
import { useRoute, useRouter } from "vue-router";
import Win7Window from "./Win7Window.vue";
import Taskbar from "./Taskbar.vue";
import Notepad from "./Notepad.vue";
import Paint from "./Paint.vue";
import Chrome from "./Chrome.vue";
import Calculator from "./Calculator.vue";
import Hero from "../Hero.vue";
import Services from "../Services.vue";
import Projects from "../Projects.vue";
import About from "../About.vue";
import Footer from "../footer.vue";
import { displayStore } from "../../stores/displayStore.js";

// Windows 7 window bodies are white, so render the inner components in day mode
displayStore().setLightMode(false);

const route = useRoute();
const router = useRouter();

const RecycleBin = {
  render: () => h("p", { class: "m-0 text-muted" }, "This folder is empty."),
};

// startLabel: shown in the right-hand column of the Start menu
const apps = [
  {
    id: "recycle",
    label: "Recycle Bin",
    title: "Recycle Bin",
    icon: "/win7/icons/recycle-bin.png",
    crumbs: ["Recycle Bin"],
    components: [markRaw(RecycleBin)],
  },
  {
    id: "home",
    label: "Computer",
    title: "Ajay Chitambaran",
    icon: "/win7/icons/computer.png",
    path: "/",
    crumbs: ["Computer", "Ajay Chitambaran"],
    startLabel: "Computer",
    components: [markRaw(Hero), markRaw(Footer)],
  },
  {
    id: "services",
    label: "Services",
    title: "Services",
    icon: "/win7/icons/control-panel.png",
    path: "/services",
    crumbs: ["Control Panel", "Services"],
    startLabel: "Control Panel",
    components: [markRaw(Services)],
  },
  {
    id: "projects",
    label: "My Projects",
    title: "My Projects",
    icon: "/win7/icons/documents.png",
    path: "/projects",
    crumbs: ["Libraries", "Documents", "My Projects"],
    startLabel: "Documents",
    components: [markRaw(Projects)],
  },
  {
    id: "history",
    label: "History",
    title: "History",
    icon: "/win7/icons/calendar.png",
    path: "/history",
    crumbs: ["Computer", "History"],
    startLabel: "Recent Items",
    components: [markRaw(About)],
    props: { section: "/history" },
  },
  {
    id: "about",
    label: "Contact Me",
    title: "Contact Me",
    icon: "/win7/icons/contacts.png",
    path: "/about",
    crumbs: ["Ajay Chitambaran", "Contacts"],
    startLabel: "Contacts",
    components: [markRaw(About)],
    props: { section: "/about" },
  },
  {
    id: "notepad",
    label: "Notepad",
    title: "Untitled - Notepad",
    icon: "/win7/icons/notepad.png",
    showTitle: true,
    components: [markRaw(Notepad)],
    menus: ["File", "Edit", "Format", "View", "Help"],
    flush: true,
  },
  {
    id: "portfolio",
    label: "Portfolio",
    title: "Portfolio",
    icon: "/win7/icons/chrome.svg",
    // a shortcut: opens this page in the Chrome app
    opensIn: "chrome",
    url: "https://ajay-the-dev.netlify.app/",
  },
  {
    id: "chrome",
    label: "Google Chrome",
    title: "Google Chrome",
    icon: "/win7/icons/chrome.svg",
    onDesktop: false,
    components: [markRaw(Chrome)],
    flush: true,
    bare: true,
  },
  {
    id: "paint",
    label: "Paint",
    title: "Untitled - Paint",
    icon: "/win7/icons/paint.png",
    // Start menu only, no desktop icon
    onDesktop: false,
    showTitle: true,
    components: [markRaw(Paint)],
    flush: true,
  },
  {
    id: "calculator",
    label: "Calculator",
    title: "Calculator",
    icon: "/win7/icons/calculator.svg",
    onDesktop: false,
    showTitle: true,
    components: [markRaw(Calculator)],
    menus: ["View", "Edit", "Help"],
    flush: true,
    fixedSize: true,
    width: 232,
    height: 340,
  },
  {
    id: "winamp",
    label: "Winamp",
    title: "Winamp",
    icon: "/win7/icons/winamp.png",
    // Webamp draws its own windows instead of living inside a Win7Window
    external: true,
  },
];

const desktopApps = apps.filter((a) => a.onDesktop !== false);

const MUSIC = [
  {
    metaData: { artist: "DJ Mike Llama", title: "Llama Whippin' Intro" },
    url: "/win7/music/llama-2.91.mp3",
    duration: 5.322,
  },
  // drop these files into public/win7/music/
  {
    metaData: { artist: "The Black Eyed Peas", title: "Boom Boom Pow" },
    url: "/win7/music/boom-boom-pow.mp3",
  },
  {
    metaData: { artist: "Kesha", title: "TiK ToK" },
    url: "/win7/music/tik-tok.mp3",
  },
];

const winampAnchor = ref(null);
const windows = ref([]);
const appWindows = computed(() => windows.value.filter((w) => !w.app.external));
const activeId = ref(null);
const selectedId = ref(null);
let zTop = 10;

const topWindow = () =>
  appWindows.value
    .filter((w) => !w.minimized)
    .sort((a, b) => b.z - a.z)[0] ?? null;

const syncRoute = () => {
  const path = windows.value.find((w) => w.app.id === activeId.value)?.app.path;
  if (path && route.path !== path) router.replace(path);
};

const focus = (w) => {
  w.minimized = false;
  if (activeId.value === w.app.id && w.z === zTop) return;
  w.z = ++zTop;
  activeId.value = w.app.id;
  syncRoute();
};

// ---------- Winamp (Webamp) ----------
// Webamp's windows sit above other windows (Winamp's "always on top") and
// below the taskbar.
const WINAMP_Z = 5000;
let webamp = null;
let webampLoading = null;
let webampClosed = false;

const winampEntry = () => windows.value.find((w) => w.app.id === "winamp");

const setWinampVisible = (visible) => {
  const el = document.getElementById("webamp");
  if (el) el.style.display = visible ? "" : "none";
};

const loadWinamp = async () => {
  const { default: Webamp } = await import("webamp");
  if (!Webamp.browserIsSupported()) {
    throw new Error("Winamp is not supported in this browser.");
  }
  webamp = new Webamp({ initialTracks: MUSIC, zIndex: WINAMP_Z });
  webamp.onClose(() => {
    webampClosed = true;
    windows.value = windows.value.filter((w) => w.app.id !== "winamp");
  });
  webamp.onMinimize(() => {
    setWinampVisible(false);
    const w = winampEntry();
    if (w) w.minimized = true;
  });
  await webamp.renderWhenReady(winampAnchor.value);
};

const openWinamp = async (app) => {
  if (!winampEntry()) windows.value.push({ app, z: 0, minimized: false });
  winampEntry().minimized = false;
  try {
    if (!webamp) await (webampLoading ??= loadWinamp());
    else if (webampClosed) {
      webampClosed = false;
      webamp.reopen();
    }
    setWinampVisible(true);
  } catch (err) {
    webampLoading = null;
    windows.value = windows.value.filter((w) => w.app.id !== "winamp");
    alert(err.message);
  }
};

// Shortcuts hand Chrome a URL to open; Chrome picks it up from here
const chromeBus = reactive({ pending: null });
provide("chromeBus", chromeBus);

const openApp = (app) => {
  if (app.opensIn) {
    chromeBus.pending = app.url;
    return openApp(apps.find((a) => a.id === app.opensIn));
  }
  if (app.external) return openWinamp(app);
  let w = windows.value.find((win) => win.app.id === app.id);
  if (!w) {
    const n = appWindows.value.length;
    windows.value.push({
      app,
      x: 120 + n * 32,
      y: 30 + n * 28,
      z: 0,
      minimized: false,
      maximized: false,
    });
    w = windows.value[windows.value.length - 1];
  }
  focus(w);
};

const onIconClick = (app) => {
  // touch screens have no double-click, so open on a single tap
  if (window.matchMedia("(pointer: coarse)").matches) openApp(app);
};

const minimize = (w) => {
  w.minimized = true;
  activeId.value = topWindow()?.app.id ?? null;
  syncRoute();
};

const close = (w) => {
  windows.value = windows.value.filter((win) => win !== w);
  activeId.value = topWindow()?.app.id ?? null;
  syncRoute();
};

const toggleFromTaskbar = (w) => {
  if (w.app.external) {
    w.minimized = !w.minimized;
    setWinampVisible(!w.minimized);
    return;
  }
  if (w.app.id === activeId.value && !w.minimized) minimize(w);
  else focus(w);
};

const showDesktop = () => {
  windows.value.forEach((w) => (w.minimized = true));
  setWinampVisible(false);
  activeId.value = null;
};

const shutdown = () => {
  if (webamp && !webampClosed) webamp.close();
  windows.value = [];
  activeId.value = null;
  router.replace("/");
};

onMounted(async () => {
  await router.isReady();
  openApp(apps.find((a) => a.path === route.path) ?? apps.find((a) => a.id === "home"));
});
</script>

<style>
.w7-desktop {
  position: fixed;
  inset: 0;
  overflow: hidden;
  font-family: "Segoe UI", SegoeUI, "Noto Sans", sans-serif;
  background: #1c6fbf url("/win7/wallpaper.jpg") center / cover no-repeat;
  user-select: none;
}

.w7-winamp-anchor {
  position: absolute;
  inset: 0 0 40px 0;
  pointer-events: none;
}

.w7-icons {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(auto-fill, 92px);
  gap: 2px;
  height: calc(100% - 40px);
  padding: 4px;
  width: max-content;
}

.w7-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  width: 76px;
  padding: 3px 2px 4px;
  border: 1px solid transparent;
  border-radius: 3px;
  background: transparent;
  color: #fff;
  font: 9pt "Segoe UI", SegoeUI, sans-serif;
  line-height: 1.2;
}

.w7-icon img {
  width: 48px;
  height: 48px;
}

.w7-icon span {
  text-shadow: 0 1px 2px #000, 0 0 3px rgba(0, 0, 0, 0.8);
}

.w7-icon:hover {
  background: rgba(200, 225, 255, 0.18);
  border-color: rgba(220, 235, 255, 0.4);
}

.w7-icon-selected,
.w7-icon-selected:hover {
  background: rgba(170, 210, 255, 0.35);
  border-color: rgba(210, 232, 255, 0.7);
}

.w7-icon:focus-visible {
  outline: none;
  border-color: rgba(210, 232, 255, 0.9);
}

@media (max-width: 767px) {
  .w7-icons {
    grid-auto-flow: row;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: none;
    width: 100%;
  }
  .w7-icon {
    width: auto;
  }
}
</style>
