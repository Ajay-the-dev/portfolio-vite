<template>
  <div class="w7c">
    <!-- Tabs sit on the glass frame, overlapping the title bar row -->
    <div class="w7c-tabs">
      <div
        v-for="t in tabs"
        :key="t.id"
        class="w7c-tab"
        :class="{ 'w7c-tab-active': t.id === activeId }"
        :title="tabTitle(t)"
        @click="activeId = t.id"
      >
        <img v-if="!t.url" src="/win7/icons/chrome.svg" alt="" />
        <i v-else-if="t.loading" class="bi bi-arrow-repeat w7c-spin"></i>
        <i v-else class="bi bi-globe2"></i>
        <span>{{ tabTitle(t) }}</span>
        <button class="w7c-tab-close" aria-label="Close tab" @click.stop="closeTab(t)">
          <i class="bi bi-x"></i>
        </button>
      </div>
      <button class="w7c-newtab" aria-label="New tab" title="New tab" @click="newTab()">
        <i class="bi bi-plus"></i>
      </button>
    </div>

    <!-- Toolbar -->
    <div class="w7c-toolbar">
      <button :disabled="active.index <= 0" title="Back" @click="go(-1)">
        <i class="bi bi-arrow-left"></i>
      </button>
      <button :disabled="active.index >= active.history.length - 1" title="Forward" @click="go(1)">
        <i class="bi bi-arrow-right"></i>
      </button>
      <button :title="active.loading ? 'Stop' : 'Reload'" @click="reload">
        <i :class="active.loading ? 'bi bi-x-lg' : 'bi bi-arrow-clockwise'"></i>
      </button>
      <form class="w7c-omnibox" @submit.prevent="submit">
        <i
          v-if="active.url"
          :class="active.url.startsWith('https:') ? 'bi bi-lock-fill w7c-secure' : 'bi bi-globe2'"
        ></i>
        <input
          v-model="active.input"
          type="text"
          spellcheck="false"
          placeholder="Search Google or type a URL"
          @focus="$event.target.select()"
        />
      </form>
      <button
        :disabled="!active.url"
        title="Open in a real browser tab"
        @click="openExternal(active.url)"
      >
        <i class="bi bi-box-arrow-up-right"></i>
      </button>
      <button title="Customize and control Google Chrome">
        <i class="bi bi-wrench"></i>
      </button>
    </div>

    <!-- Pages: every tab stays mounted so switching tabs keeps its page -->
    <div class="w7c-pages">
      <template v-for="t in tabs" :key="t.id">
        <div v-show="t.id === activeId" class="w7c-page">
          <div v-if="!t.url" class="w7c-ntp">
            <form class="w7c-ntp-search" @submit.prevent="submitNtp(t)">
              <i class="bi bi-search"></i>
              <input v-model="t.ntpQuery" type="text" placeholder="Search Google or type a URL" />
            </form>
            <h6>Most visited</h6>
            <div class="w7c-tiles">
              <button v-for="s in SHORTCUTS" :key="s.url" class="w7c-tile" @click="navigate(t, s.url)">
                <span class="w7c-tile-thumb" :style="{ background: s.color }">{{ s.letter }}</span>
                <span class="w7c-tile-name">{{ s.name }}</span>
              </button>
            </div>
          </div>

          <div v-else-if="isBlocked(t.url)" class="w7c-error">
            <i class="bi bi-file-earmark-x"></i>
            <h5>{{ hostOf(t.url) }} refused to connect.</h5>
            <p>This site doesn't allow itself to be shown inside another page.</p>
            <button @click="openExternal(t.url)">Open in new tab</button>
          </div>

          <iframe
            v-else
            :key="`${t.index}-${t.nonce}`"
            :src="t.url"
            title="Web page"
            referrerpolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            @load="t.loading = false"
          ></iframe>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, watch } from "vue";

// Sites that refuse to be framed (X-Frame-Options / frame-ancestors)
const BLOCKED = [
  "github.com",
  "linkedin.com",
  "bing.com",
  "duckduckgo.com",
  "facebook.com",
  "instagram.com",
  "x.com",
  "twitter.com",
  "reddit.com",
  "stackoverflow.com",
  "amazon.com",
  "netflix.com",
];

const SHORTCUTS = [
  { name: "Feemo", url: "https://user-management-by-laravel-vue-production.up.railway.app/", letter: "F", color: "#3f48cc" },
  { name: "Google", url: "https://www.google.com/webhp?igu=1", letter: "G", color: "#4285f4" },
  { name: "Wikipedia", url: "https://en.wikipedia.org/wiki/Windows_7", letter: "W", color: "#555" },
  { name: "Boom Boom Pow", url: "https://www.youtube.com/watch?v=4m48GqaOz90", letter: "▶", color: "#e62117" },
  { name: "My GitHub", url: "https://github.com/Ajay-the-dev", letter: "GH", color: "#24292f" },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/ajaychitambaran/", letter: "in", color: "#0a66c2" },
];

let nextId = 1;
const makeTab = () => ({
  id: nextId++,
  url: "",
  input: "",
  ntpQuery: "",
  history: [""],
  index: 0,
  nonce: 0,
  loading: false,
});

const tabs = ref([makeTab()]);
const activeId = ref(tabs.value[0].id);
const active = computed(() => tabs.value.find((t) => t.id === activeId.value));

const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const isBlocked = (url) => {
  const host = hostOf(url);
  return BLOCKED.some((b) => host === b || host.endsWith(`.${b}`));
};

const tabTitle = (t) => {
  if (!t.url) return "New Tab";
  if (t.loading) return "Loading...";
  return hostOf(t.url);
};

// Turn omnibox text into a URL that can be framed
const resolve = (text) => {
  const q = text.trim();
  if (!q) return null;
  let url;
  if (/^https?:\/\//i.test(q)) url = q;
  else if (/^[^\s]+\.[a-z]{2,}(\/.*)?$/i.test(q)) url = `https://${q}`;
  else return `https://www.google.com/search?igu=1&q=${encodeURIComponent(q)}`;

  try {
    const u = new URL(url);
    // Google only allows framing with igu=1
    if (/(^|\.)google\.[a-z.]+$/.test(u.hostname)) u.searchParams.set("igu", "1");
    // YouTube watch pages can't be framed, but the embed player can
    const ytId =
      (u.hostname.endsWith("youtube.com") && u.pathname === "/watch" && u.searchParams.get("v")) ||
      (u.hostname === "youtu.be" && u.pathname.slice(1));
    if (ytId) return `https://www.youtube.com/embed/${ytId}?autoplay=1`;
    return u.toString();
  } catch {
    return `https://www.google.com/search?igu=1&q=${encodeURIComponent(q)}`;
  }
};

const show = (t) => {
  t.url = t.history[t.index];
  t.input = t.url;
  t.loading = Boolean(t.url) && !isBlocked(t.url);
};

const navigate = (t, text) => {
  const url = resolve(text);
  if (!url) return;
  t.history = [...t.history.slice(0, t.index + 1), url];
  t.index = t.history.length - 1;
  show(t);
};

const submit = () => navigate(active.value, active.value.input);
const submitNtp = (t) => navigate(t, t.ntpQuery);

const go = (delta) => {
  const t = active.value;
  t.index = Math.min(Math.max(t.index + delta, 0), t.history.length - 1);
  show(t);
};

const reload = () => {
  const t = active.value;
  if (!t.url) return;
  if (t.loading) {
    t.loading = false;
    return;
  }
  t.nonce++;
  t.loading = !isBlocked(t.url);
};

const newTab = () => {
  const t = makeTab();
  tabs.value.push(t);
  activeId.value = t.id;
};

const closeTab = (t) => {
  const i = tabs.value.indexOf(t);
  tabs.value.splice(i, 1);
  if (!tabs.value.length) tabs.value.push(makeTab());
  if (activeId.value === t.id) {
    activeId.value = tabs.value[Math.max(0, i - 1)].id;
  }
};

// URLs sent by desktop shortcuts (e.g. Portfolio): reuse a lone empty tab,
// otherwise open a new one
const bus = inject("chromeBus", null);
const openRequested = () => {
  const url = bus?.pending;
  if (!url) return;
  bus.pending = null;
  const blank = tabs.value.length === 1 && !tabs.value[0].url;
  if (!blank) newTab();
  activeId.value = blank ? tabs.value[0].id : activeId.value;
  navigate(active.value, url);
};
watch(() => bus?.pending, openRequested, { immediate: true });

const openExternal = (url) => {
  if (url) window.open(url, "_blank", "noopener");
};
</script>

<style>
.w7c {
  display: flex;
  flex-direction: column;
  height: 100%;
  font: 9pt "Segoe UI", SegoeUI, "Noto Sans", sans-serif;
}

/* ---------- Tabs ---------- */
.w7c-tabs {
  display: flex;
  align-items: flex-end;
  gap: 0;
  height: 28px;
  margin-top: -30px;
  padding: 0 110px 0 4px;
  /* let empty space fall through to the title bar so the window drags */
  pointer-events: none;
}

.w7c-tab,
.w7c-newtab {
  pointer-events: auto;
}

.w7c-tab {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 1 190px;
  min-width: 48px;
  height: 25px;
  margin-right: -6px;
  padding: 0 22px 0 14px;
  border: 1px solid rgba(0, 0, 0, 0.45);
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(220, 230, 245, 0.45));
  color: #222;
  cursor: default;
  clip-path: polygon(0 100%, 8px 0, calc(100% - 8px) 0, 100% 100%);
}

.w7c-tab-active {
  z-index: 1;
  background: linear-gradient(180deg, #fff 0%, #f1f5fb 100%);
}

.w7c-tab img,
.w7c-tab .bi {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  font-size: 14px;
  line-height: 16px;
  color: #5f6f86;
}

.w7c-tab span {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.w7c-tab-close {
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: none;
  color: #555;
}

.w7c-tab-close:hover {
  background: #d9534f;
  color: #fff;
}

.w7c-newtab {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 18px;
  margin: 0 0 3px 10px;
  padding: 0;
  border: 1px solid rgba(0, 0, 0, 0.4);
  border-radius: 3px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.6), rgba(220, 230, 245, 0.4));
  color: #333;
  transform: skewX(20deg);
}

.w7c-newtab .bi {
  transform: skewX(-20deg);
}

.w7c-spin {
  animation: w7c-spin 0.9s linear infinite;
}

@keyframes w7c-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ---------- Toolbar ---------- */
.w7c-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 34px;
  padding: 0 6px;
  background: linear-gradient(180deg, #f1f5fb 0%, #e3eaf4 100%);
  border: 1px solid rgba(0, 0, 0, 0.45);
  border-bottom-color: #a6b3c4;
}

.w7c-toolbar > button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 26px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 3px;
  background: none;
  color: #3c4b61;
  font-size: 15px;
}

.w7c-toolbar > button:hover:not(:disabled) {
  border-color: #a6b3c4;
  background: linear-gradient(180deg, #fff, #e6edf6);
}

.w7c-toolbar > button:disabled {
  opacity: 0.35;
}

.w7c-omnibox {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  margin: 0 4px;
  padding: 0 8px;
  border: 1px solid #a6b3c4;
  border-radius: 3px;
  background: #fff;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.w7c-omnibox .bi {
  color: #777;
}

.w7c-omnibox .w7c-secure {
  color: #1a9c3f;
}

.w7c-omnibox input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  font: 10pt "Segoe UI", SegoeUI, sans-serif;
}

/* ---------- Pages ---------- */
.w7c-pages {
  flex: 1;
  min-height: 0;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.45);
  border-top: none;
}

.w7c-page,
.w7c-page iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.w7c-page iframe {
  display: block;
}

.w7c-ntp {
  height: 100%;
  overflow: auto;
  padding: 40px 24px;
  background: #f2f2f2;
  text-align: center;
}

.w7c-ntp-search {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 460px;
  height: 36px;
  margin: 0 auto 32px;
  padding: 0 12px;
  border: 1px solid #c8c8c8;
  border-radius: 2px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  color: #888;
}

.w7c-ntp-search input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 11pt;
}

.w7c-ntp h6 {
  max-width: 560px;
  margin: 0 auto 10px;
  color: #777;
  font-size: 9pt;
  font-weight: 600;
  text-align: left;
}

.w7c-tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, 172px);
  justify-content: center;
  gap: 14px;
  max-width: 560px;
  margin: 0 auto;
}

.w7c-tile {
  padding: 0;
  border: 1px solid #ccc;
  border-radius: 2px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  text-align: left;
}

.w7c-tile:hover {
  border-color: #8fb3e6;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.25);
}

.w7c-tile-thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 86px;
  color: #fff;
  font-size: 30px;
  font-weight: 600;
}

.w7c-tile-name {
  display: block;
  padding: 5px 8px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #333;
}

.w7c-error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  height: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 24px;
  color: #555;
}

.w7c-error > .bi {
  font-size: 56px;
  color: #9aa0a6;
}

.w7c-error h5 {
  margin: 14px 0 6px;
  color: #202124;
  font-size: 15pt;
  font-weight: 400;
}

.w7c-error button {
  margin-top: 10px;
  padding: 6px 16px;
  border: 1px solid #2f6bd1;
  border-radius: 3px;
  background: linear-gradient(180deg, #5a95f5, #3c7be6);
  color: #fff;
}

@media (max-width: 767px) {
  .w7c-tabs {
    padding-right: 80px;
  }
}
</style>
