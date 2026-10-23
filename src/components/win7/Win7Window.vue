<template>
  <div
    class="window glass w7-window"
    :class="{ active, 'w7-maximized': maximized }"
    :style="{
      left: `${x}px`,
      top: `${y}px`,
      zIndex: z,
      ...(width && { width: `${width}px` }),
      ...(height && { height: `${height}px` }),
    }"
    @pointerdown="emit('focus')"
  >
    <div class="title-bar" @pointerdown="startDrag" @dblclick="!fixedSize && emit('maximize')">
      <div class="title-bar-text">
        <template v-if="showTitle">
          <img :src="icon" alt="" class="w7-title-icon" draggable="false" />
          {{ title }}
        </template>
      </div>
      <div class="title-bar-controls">
        <button
          aria-label="Minimize"
          @pointerdown.stop
          @click.stop="emit('minimize')"
        ></button>
        <button
          :aria-label="maximized ? 'Restore' : 'Maximize'"
          class="d-none d-md-block"
          :disabled="fixedSize"
          @pointerdown.stop
          @click.stop="emit('maximize')"
        ></button>
        <button
          aria-label="Close"
          @pointerdown.stop
          @click.stop="emit('close')"
        ></button>
      </div>
    </div>

    <!-- Explorer-style address bar, sitting on the glass frame -->
    <div v-if="crumbs" class="w7-addressbar" @pointerdown.stop="emit('focus')">
      <span class="w7-nav" aria-hidden="true">
        <span class="w7-nav-btn"><i class="bi bi-arrow-left-short"></i></span>
        <span class="w7-nav-btn"><i class="bi bi-arrow-right-short"></i></span>
      </span>
      <div class="w7-crumbs">
        <img :src="icon" alt="" draggable="false" />
        <template v-for="c in crumbs" :key="c">
          <i class="bi bi-caret-right-fill"></i><span>{{ c }}</span>
        </template>
      </div>
      <div class="w7-search">
        <span>Search {{ crumbs[crumbs.length - 1] }}</span>
        <i class="bi bi-search"></i>
      </div>
    </div>

    <div class="window-body w7-body" :class="{ 'w7-body-bare': bare }">
      <div v-if="menus" class="w7-menubar">
        <span v-for="m in menus" :key="m">{{ m }}</span>
      </div>
      <div v-else-if="crumbs" class="w7-commandbar">
        <span>Organize <i class="bi bi-caret-down-fill"></i></span>
        <span>Share with <i class="bi bi-caret-down-fill"></i></span>
        <span class="d-none d-md-inline">New folder</span>
      </div>
      <div class="w7-content" :class="{ 'w7-content-flush': flush }">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import "7.css/dist/gui/window.css";

const props = defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: "" },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  z: { type: Number, default: 1 },
  active: { type: Boolean, default: false },
  maximized: { type: Boolean, default: false },
  // Explorer windows have an empty title bar; apps like Notepad show one
  showTitle: { type: Boolean, default: false },
  // breadcrumb for the Explorer address bar; omit for plain app windows
  crumbs: { type: Array, default: null },
  // a classic menu bar (Notepad) instead of the Explorer command bar
  menus: { type: Array, default: null },
  // no padding, for apps that fill the window (e.g. Notepad)
  flush: { type: Boolean, default: false },
  // no white body or border: the app draws on the glass itself (Chrome)
  bare: { type: Boolean, default: false },
  // fixed-size windows (Calculator): own size, Maximize disabled
  width: { type: Number, default: null },
  height: { type: Number, default: null },
  fixedSize: { type: Boolean, default: false },
});

const emit = defineEmits(["focus", "move", "minimize", "maximize", "close"]);

const startDrag = (e) => {
  if (e.button !== 0 || props.maximized) return;
  if (window.matchMedia("(max-width: 767px)").matches) return;

  const offsetX = e.clientX - props.x;
  const offsetY = e.clientY - props.y;

  const onMove = (ev) => {
    const x = Math.min(
      Math.max(ev.clientX - offsetX, -200),
      window.innerWidth - 120
    );
    const y = Math.min(Math.max(ev.clientY - offsetY, 0), window.innerHeight - 80);
    emit("move", { x, y });
  };
  const onUp = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
};
</script>

<style>
.w7-window {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: min(780px, calc(100vw - 40px));
  height: min(540px, calc(100vh - 90px));
  font: 9pt "Segoe UI", SegoeUI, "Noto Sans", sans-serif;
}

.w7-maximized {
  left: 0 !important;
  top: 0 !important;
  width: 100%;
  height: calc(100% - 40px);
  border-radius: 0;
}

.w7-window .title-bar {
  min-height: 30px;
  cursor: default;
  user-select: none;
  touch-action: none;
}

.w7-title-icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
  vertical-align: -3px;
}

/* ---------- Explorer address bar ---------- */
.w7-addressbar {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: -2px 6px 4px;
}

.w7-nav {
  display: flex;
  gap: 1px;
}

.w7-nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  border: 1px solid rgba(0, 0, 0, 0.45);
  border-radius: 50%;
  background: linear-gradient(180deg, #e6ebf2 0%, #b9c4d3 50%, #9fadbf 51%, #c6d0dc 100%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
  color: #fff;
  font-size: 20px;
  opacity: 0.75;
}

.w7-crumbs,
.w7-search {
  display: flex;
  align-items: center;
  height: 24px;
  border: 1px solid rgba(0, 0, 0, 0.45);
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
}

.w7-crumbs {
  flex: 1;
  min-width: 0;
  gap: 5px;
  padding: 0 6px;
  overflow: hidden;
  white-space: nowrap;
  color: #000;
}

.w7-crumbs img {
  width: 16px;
  height: 16px;
}

.w7-crumbs .bi {
  font-size: 7px;
  color: #444;
}

.w7-search {
  justify-content: space-between;
  width: 200px;
  padding: 0 6px;
  color: #6d6d6d;
  font-style: italic;
}

.w7-search .bi {
  font-style: normal;
  color: #3a5f8a;
}

/* ---------- Body ---------- */
.w7-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #fff;
}

.w7-body-bare {
  background: transparent;
  border: none;
  box-shadow: none;
}

/* bare apps reach up into the title bar row (Chrome's tabs) */
.w7-body-bare .w7-content {
  overflow: visible;
}

.w7-commandbar,
.w7-menubar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 10px;
  color: #1e395b;
  white-space: nowrap;
  overflow: hidden;
}

.w7-commandbar {
  height: 32px;
  background: linear-gradient(180deg, #f5f9fd 0%, #eaf1f9 50%, #dce7f5 51%, #dfe9f5 100%);
  border-bottom: 1px solid #a0afc3;
}

.w7-commandbar .bi {
  font-size: 7px;
  margin-left: 2px;
}

.w7-menubar {
  height: 20px;
  gap: 12px;
  padding: 0 6px;
  background: #f5f6f7;
  border-bottom: 1px solid #e3e6ea;
  color: #000;
}

.w7-content {
  flex: 1;
  overflow: auto;
  padding: 1rem 1.25rem;
  color: #212529;
  font-size: 1rem;
  text-align: left;
}

.w7-content-flush {
  padding: 0;
  overflow: hidden;
}

/* Webamp also uses .window / .title-bar; undo 7.css's glass on it */
#webamp .window,
#webamp .title-bar {
  border: 0;
  border-radius: 0;
  box-shadow: none;
  background-color: transparent;
  font: inherit;
}
#webamp .window::before,
#webamp .window::after {
  content: none;
}
#webamp .title-bar {
  display: block;
  padding: 0;
}

@media (max-width: 767px) {
  .w7-window {
    left: 0 !important;
    top: 0 !important;
    width: 100%;
    height: calc(100% - 40px);
  }
  .w7-search {
    display: none;
  }
}
</style>
