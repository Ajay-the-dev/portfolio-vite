<template>
  <div class="w7-paint" tabindex="-1" @keydown.ctrl.z.prevent="undo">
    <!-- Ribbon tabs -->
    <div class="w7p-tabs">
      <div class="w7p-appmenu-wrap">
        <button class="w7p-appbtn" @click.stop="menuOpen = !menuOpen">
          <i class="bi bi-list"></i><i class="bi bi-caret-down-fill"></i>
        </button>
        <ul v-if="menuOpen" class="w7p-appmenu" @pointerdown.stop>
          <li @click="newImage"><i class="bi bi-file-earmark"></i>New</li>
          <li @click="save"><i class="bi bi-floppy"></i>Save as PNG</li>
        </ul>
      </div>
      <span class="w7p-tab w7p-tab-active">Home</span>
      <span class="w7p-tab">View</span>
      <button class="w7p-undo" title="Undo (Ctrl+Z)" :disabled="!history.length" @click="undo">
        <i class="bi bi-arrow-counterclockwise"></i>
      </button>
    </div>

    <!-- Ribbon -->
    <div class="w7p-ribbon">
      <div class="w7p-group">
        <div class="w7p-grid">
          <button
            v-for="t in TOOLS"
            :key="t.id"
            class="w7p-btn"
            :class="{ 'w7p-on': tool === t.id }"
            :title="t.name"
            @click="tool = t.id"
          >
            <i :class="`bi ${t.icon}`"></i>
          </button>
        </div>
        <span class="w7p-label">Tools</span>
      </div>

      <div class="w7p-group">
        <div class="w7p-grid">
          <button
            v-for="s in SHAPES"
            :key="s.id"
            class="w7p-btn"
            :class="{ 'w7p-on': tool === s.id }"
            :title="s.name"
            @click="tool = s.id"
          >
            <i :class="`bi ${s.icon}`"></i>
          </button>
          <label class="w7p-check" title="Fill shapes with Color 2">
            <input v-model="fillShapes" type="checkbox" /> Fill
          </label>
        </div>
        <span class="w7p-label">Shapes</span>
      </div>

      <div class="w7p-group">
        <div class="w7p-sizes">
          <button
            v-for="s in SIZES"
            :key="s"
            class="w7p-size"
            :class="{ 'w7p-on': size === s }"
            :title="`${s}px`"
            @click="size = s"
          >
            <span :style="{ height: `${s}px` }"></span>
          </button>
        </div>
        <span class="w7p-label">Size</span>
      </div>

      <div class="w7p-group w7p-colors-group">
        <div class="w7p-colors">
          <button
            class="w7p-current"
            :class="{ 'w7p-on': editing === 1 }"
            @click="editing = 1"
          >
            <span :style="{ background: color1 }"></span>Color 1
          </button>
          <button
            class="w7p-current"
            :class="{ 'w7p-on': editing === 2 }"
            @click="editing = 2"
          >
            <span :style="{ background: color2 }"></span>Color 2
          </button>
          <div class="w7p-palette">
            <button
              v-for="c in PALETTE"
              :key="c"
              :style="{ background: c }"
              :title="c"
              @click="pick(c)"
              @contextmenu.prevent="color2 = c"
            ></button>
          </div>
        </div>
        <span class="w7p-label">Colors</span>
      </div>
    </div>

    <!-- Workspace -->
    <div class="w7p-workspace">
      <canvas
        ref="canvasEl"
        :width="WIDTH"
        :height="HEIGHT"
        :style="{ cursor: tool === 'picker' || tool === 'fill' ? 'copy' : 'crosshair' }"
        @pointerdown="onDown"
        @pointermove="onMove"
        @pointerup="onUp"
        @pointerleave="pos = null"
        @contextmenu.prevent
      ></canvas>
    </div>

    <div class="w7p-status">
      <span><i class="bi bi-cursor"></i> {{ pos ? `${pos.x}, ${pos.y}px` : "" }}</span>
      <span><i class="bi bi-aspect-ratio"></i> {{ WIDTH }} × {{ HEIGHT }}px</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const WIDTH = 640;
const HEIGHT = 400;
const MAX_UNDO = 20;

const TOOLS = [
  { id: "pencil", name: "Pencil", icon: "bi-pencil" },
  { id: "brush", name: "Brush", icon: "bi-brush" },
  { id: "eraser", name: "Eraser", icon: "bi-eraser" },
  { id: "fill", name: "Fill with color", icon: "bi-paint-bucket" },
  { id: "picker", name: "Color picker", icon: "bi-eyedropper" },
];

const SHAPES = [
  { id: "line", name: "Line", icon: "bi-slash-lg" },
  { id: "rect", name: "Rectangle", icon: "bi-square" },
  { id: "ellipse", name: "Oval", icon: "bi-circle" },
];

const SIZES = [1, 3, 5, 8];

// The default Windows 7 Paint palette
const PALETTE = [
  "#000000", "#7f7f7f", "#880015", "#ed1c24", "#ff7f27",
  "#fff200", "#22b14c", "#00a2e8", "#3f48cc", "#a349a4",
  "#ffffff", "#c3c3c3", "#b97a57", "#ffaec9", "#ffc90e",
  "#efe4b0", "#b5e61d", "#99d9ea", "#7092be", "#c8bfe7",
];

const canvasEl = ref(null);
const tool = ref("pencil");
const size = ref(3);
const color1 = ref("#000000");
const color2 = ref("#ffffff");
const editing = ref(1);
const fillShapes = ref(false);
const menuOpen = ref(false);
const pos = ref(null);
const history = ref([]);

let ctx = null;
let drawing = null; // { button, start, last, snapshot }

const pick = (c) => {
  if (editing.value === 1) color1.value = c;
  else color2.value = c;
};

const point = (e) => {
  const r = canvasEl.value.getBoundingClientRect();
  return {
    x: Math.floor(((e.clientX - r.left) * WIDTH) / r.width),
    y: Math.floor(((e.clientY - r.top) * HEIGHT) / r.height),
  };
};

const snapshot = () => ctx.getImageData(0, 0, WIDTH, HEIGHT);

const pushHistory = () => {
  history.value.push(snapshot());
  if (history.value.length > MAX_UNDO) history.value.shift();
};

const undo = () => {
  const img = history.value.pop();
  if (img) ctx.putImageData(img, 0, 0);
};

const clear = () => {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
};

const newImage = () => {
  pushHistory();
  clear();
  menuOpen.value = false;
};

const save = () => {
  const a = document.createElement("a");
  a.download = "untitled.png";
  a.href = canvasEl.value.toDataURL("image/png");
  a.click();
  menuOpen.value = false;
};

const strokeColor = (button) => (button === 2 ? color2.value : color1.value);

const stroke = (from, to, button) => {
  if (tool.value === "pencil") {
    // hard 1px line, like Paint's pencil
    ctx.fillStyle = strokeColor(button);
    const steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y), 1);
    for (let i = 0; i <= steps; i++) {
      const x = Math.round(from.x + ((to.x - from.x) * i) / steps);
      const y = Math.round(from.y + ((to.y - from.y) * i) / steps);
      ctx.fillRect(x, y, 1, 1);
    }
    return;
  }
  // the eraser paints with the background colour (Color 2)
  ctx.strokeStyle = tool.value === "eraser" ? color2.value : strokeColor(button);
  ctx.lineWidth = tool.value === "eraser" ? size.value * 3 : size.value;
  ctx.lineCap = tool.value === "eraser" ? "square" : "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(from.x + 0.5, from.y + 0.5);
  ctx.lineTo(to.x + 0.5, to.y + 0.5);
  ctx.stroke();
};

const drawShape = (start, end, button) => {
  ctx.lineWidth = size.value;
  ctx.strokeStyle = strokeColor(button);
  ctx.fillStyle = button === 2 ? color1.value : color2.value;
  ctx.lineCap = "round";
  ctx.beginPath();
  if (tool.value === "line") {
    ctx.moveTo(start.x + 0.5, start.y + 0.5);
    ctx.lineTo(end.x + 0.5, end.y + 0.5);
  } else if (tool.value === "rect") {
    ctx.rect(start.x + 0.5, start.y + 0.5, end.x - start.x, end.y - start.y);
  } else {
    ctx.ellipse(
      (start.x + end.x) / 2,
      (start.y + end.y) / 2,
      Math.abs(end.x - start.x) / 2,
      Math.abs(end.y - start.y) / 2,
      0,
      0,
      Math.PI * 2
    );
  }
  if (fillShapes.value && tool.value !== "line") ctx.fill();
  ctx.stroke();
};

const hexToRgba = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
  255,
];

const floodFill = ({ x, y }, hex) => {
  const img = snapshot();
  const d = img.data;
  const at = (px, py) => (py * WIDTH + px) * 4;
  const target = d.slice(at(x, y), at(x, y) + 4);
  const fill = hexToRgba(hex);
  if (target.every((v, i) => v === fill[i])) return;

  const same = (i) =>
    d[i] === target[0] && d[i + 1] === target[1] && d[i + 2] === target[2] && d[i + 3] === target[3];
  const stack = [[x, y]];
  while (stack.length) {
    const [px, py] = stack.pop();
    let lx = px;
    while (lx > 0 && same(at(lx - 1, py))) lx--;
    let rx = px;
    while (rx < WIDTH - 1 && same(at(rx + 1, py))) rx++;
    for (let cx = lx; cx <= rx; cx++) {
      d.set(fill, at(cx, py));
      if (py > 0 && same(at(cx, py - 1))) stack.push([cx, py - 1]);
      if (py < HEIGHT - 1 && same(at(cx, py + 1))) stack.push([cx, py + 1]);
    }
  }
  ctx.putImageData(img, 0, 0);
};

const onDown = (e) => {
  if (e.button !== 0 && e.button !== 2) return;
  const button = e.button === 2 ? 2 : 1;
  const p = point(e);

  if (tool.value === "picker") {
    const [r, g, b] = ctx.getImageData(p.x, p.y, 1, 1).data;
    const hex = "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
    if (button === 2) color2.value = hex;
    else color1.value = hex;
    return;
  }

  pushHistory();
  if (tool.value === "fill") {
    floodFill(p, strokeColor(button));
    return;
  }

  canvasEl.value.setPointerCapture(e.pointerId);
  drawing = { button, start: p, last: p, snapshot: snapshot() };
  if (["pencil", "brush", "eraser"].includes(tool.value)) stroke(p, p, button);
};

const onMove = (e) => {
  const p = point(e);
  pos.value = {
    x: Math.min(Math.max(p.x, 0), WIDTH - 1),
    y: Math.min(Math.max(p.y, 0), HEIGHT - 1),
  };
  if (!drawing) return;
  if (["line", "rect", "ellipse"].includes(tool.value)) {
    // redraw the shape from the snapshot so it follows the pointer
    ctx.putImageData(drawing.snapshot, 0, 0);
    drawShape(drawing.start, p, drawing.button);
  } else {
    stroke(drawing.last, p, drawing.button);
  }
  drawing.last = p;
};

const onUp = () => {
  drawing = null;
};

const closeMenu = () => {
  menuOpen.value = false;
};

onMounted(() => {
  ctx = canvasEl.value.getContext("2d", { willReadFrequently: true });
  clear();
  window.addEventListener("pointerdown", closeMenu);
});

onBeforeUnmount(() => {
  window.removeEventListener("pointerdown", closeMenu);
});
</script>

<style>
.w7-paint {
  display: flex;
  flex-direction: column;
  height: 100%;
  outline: none;
  font: 9pt "Segoe UI", SegoeUI, "Noto Sans", sans-serif;
  color: #1e395b;
  user-select: none;
}

/* ---------- Tabs ---------- */
.w7p-tabs {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 24px;
  padding: 0 4px;
  background: #dfe9f5;
}

.w7p-appmenu-wrap {
  position: relative;
  align-self: stretch;
}

.w7p-appbtn {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 100%;
  padding: 0 10px;
  border: 1px solid #2a5a9b;
  border-bottom: none;
  border-radius: 3px 3px 0 0;
  background: linear-gradient(180deg, #5c9ae0 0%, #3a7bd5 50%, #1f5fbf 51%, #3576d0 100%);
  color: #fff;
  font-size: 13px;
}

.w7p-appbtn .bi-caret-down-fill {
  font-size: 7px;
}

.w7p-appmenu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 5;
  min-width: 150px;
  margin: 0;
  padding: 3px;
  list-style: none;
  background: #fff;
  border: 1px solid #8ba0bc;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.3);
}

.w7p-appmenu li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border: 1px solid transparent;
  border-radius: 2px;
  color: #000;
}

.w7p-appmenu li:hover {
  background: linear-gradient(180deg, #fdf4d9, #fce7b1);
  border-color: #e5c365;
}

.w7p-tab {
  padding: 3px 14px;
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: 3px 3px 0 0;
}

.w7p-tab-active {
  background: #f5f9fd;
  border-color: #b6c5da;
}

.w7p-undo {
  margin-left: auto;
  align-self: center;
  padding: 0 6px;
  border: 1px solid transparent;
  border-radius: 2px;
  background: none;
  color: #1e395b;
}

.w7p-undo:hover:not(:disabled) {
  border-color: #e5c365;
  background: #fce7b1;
}

.w7p-undo:disabled {
  opacity: 0.4;
}

/* ---------- Ribbon ---------- */
.w7p-ribbon {
  display: flex;
  height: 92px;
  padding: 3px 2px;
  overflow-x: auto;
  background: linear-gradient(180deg, #f5f9fd 0%, #e9f0f8 60%, #dce7f5 100%);
  border-top: 1px solid #b6c5da;
  border-bottom: 1px solid #a0afc3;
}

.w7p-group {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
  border-right: 1px solid #c5d2e3;
}

.w7p-label {
  color: #5b6f8c;
  font-size: 8pt;
}

.w7p-grid {
  display: grid;
  grid-template-columns: repeat(3, 24px);
  gap: 2px;
}

.w7p-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 22px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 2px;
  background: none;
  color: #1e395b;
  font-size: 13px;
}

.w7p-btn:hover,
.w7p-size:hover,
.w7p-current:hover {
  border-color: #e5c365;
  background: linear-gradient(180deg, #fdf4d9, #fce7b1);
}

.w7p-on,
.w7p-on:hover {
  border-color: #c2a14a;
  background: linear-gradient(180deg, #fce3a1, #f9cf6e);
}

.w7p-check {
  grid-column: span 3;
  display: flex;
  align-items: center;
  gap: 4px;
}

.w7p-sizes {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 64px;
}

.w7p-size {
  display: flex;
  align-items: center;
  height: 15px;
  padding: 0 6px;
  border: 1px solid transparent;
  border-radius: 2px;
  background: none;
}

.w7p-size span {
  flex: 1;
  background: #000;
}

.w7p-colors {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.w7p-current {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 44px;
  padding: 3px 2px;
  border: 1px solid transparent;
  border-radius: 2px;
  background: none;
  color: #1e395b;
  font-size: 8pt;
  line-height: 1.1;
}

.w7p-current span {
  width: 26px;
  height: 26px;
  border: 1px solid #7a8aa1;
  box-shadow: inset 0 0 0 1px #fff;
}

.w7p-palette {
  display: grid;
  grid-template-columns: repeat(10, 18px);
  gap: 2px;
  padding-top: 4px;
}

.w7p-palette button {
  width: 18px;
  height: 18px;
  padding: 0;
  border: 1px solid #a0a0a0;
  box-shadow: inset 0 0 0 1px #fff;
}

.w7p-palette button:hover {
  border-color: #e5c365;
}

/* ---------- Workspace ---------- */
.w7p-workspace {
  flex: 1;
  min-height: 0;
  padding: 5px;
  overflow: auto;
  background: #c8d1e0;
}

.w7p-workspace canvas {
  display: block;
  background: #fff;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.35);
  touch-action: none;
}

.w7p-status {
  display: flex;
  gap: 40px;
  height: 22px;
  align-items: center;
  padding: 0 8px;
  background: #f0f0f0;
  border-top: 1px solid #c5ccd6;
  color: #000;
}
</style>
