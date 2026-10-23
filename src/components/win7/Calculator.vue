<template>
  <div ref="rootEl" class="w7-calc" tabindex="-1" @keydown="onKey">
    <div class="w7k-display">
      <span v-if="memory !== 0" class="w7k-mem">M</span>
      <div class="w7k-expr">{{ expr }}</div>
      <div class="w7k-value" :class="{ 'w7k-small': display.length > 13 }">
        {{ display }}
      </div>
    </div>

    <div class="w7k-keys">
      <button
        v-for="k in KEYS"
        :key="k.label"
        class="w7k-key"
        :class="k.cls"
        :disabled="error && !k.clears"
        @click="press(k.action)"
      >
        {{ k.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

// Windows 7 Standard calculator layout; `cls` handles the tall = and wide 0
const KEYS = [
  { label: "MC", action: "mc", cls: "w7k-fn" },
  { label: "MR", action: "mr", cls: "w7k-fn" },
  { label: "MS", action: "ms", cls: "w7k-fn" },
  { label: "M+", action: "m+", cls: "w7k-fn" },
  { label: "M-", action: "m-", cls: "w7k-fn" },
  { label: "←", action: "back", cls: "w7k-fn" },
  { label: "CE", action: "ce", cls: "w7k-fn", clears: true },
  { label: "C", action: "c", cls: "w7k-fn", clears: true },
  { label: "±", action: "neg", cls: "w7k-fn" },
  { label: "√", action: "sqrt", cls: "w7k-fn" },
  { label: "7", action: "7" },
  { label: "8", action: "8" },
  { label: "9", action: "9" },
  { label: "/", action: "/", cls: "w7k-fn" },
  { label: "%", action: "%", cls: "w7k-fn" },
  { label: "4", action: "4" },
  { label: "5", action: "5" },
  { label: "6", action: "6" },
  { label: "*", action: "*", cls: "w7k-fn" },
  { label: "1/x", action: "inv", cls: "w7k-fn" },
  { label: "1", action: "1" },
  { label: "2", action: "2" },
  { label: "3", action: "3" },
  { label: "-", action: "-", cls: "w7k-fn" },
  { label: "=", action: "=", cls: "w7k-fn w7k-tall" },
  { label: "0", action: "0", cls: "w7k-wide" },
  { label: ".", action: "." },
  { label: "+", action: "+", cls: "w7k-fn" },
];

const rootEl = ref(null);
const display = ref("0");
const expr = ref("");
const memory = ref(0);
const error = ref(false);

let acc = null; // left-hand operand
let op = null; // pending operator
let fresh = true; // next digit starts a new number

const format = (n) => {
  if (!Number.isFinite(n)) return null;
  const s = String(Number(n.toPrecision(15)));
  return s.length > 17 ? n.toExponential(9).replace(/\.?0+e/, "e") : s;
};

const current = () => parseFloat(display.value);

const fail = (message) => {
  display.value = message;
  expr.value = "";
  error.value = true;
  acc = null;
  op = null;
  fresh = true;
};

const show = (n) => {
  const s = format(n);
  if (s === null) return fail("Invalid input"), false;
  display.value = s;
  return true;
};

const compute = (a, o, b) => {
  if (o === "+") return a + b;
  if (o === "-") return a - b;
  if (o === "*") return a * b;
  if (b === 0) return null;
  return a / b;
};

const clearAll = () => {
  display.value = "0";
  expr.value = "";
  error.value = false;
  acc = null;
  op = null;
  fresh = true;
};

const digit = (d) => {
  if (fresh) {
    display.value = d === "." ? "0." : d;
    fresh = false;
    return;
  }
  if (d === "." && display.value.includes(".")) return;
  if (display.value.replace(/[-.]/g, "").length >= 16) return;
  display.value = display.value === "0" && d !== "." ? d : display.value + d;
};

const operator = (o) => {
  if (op && !fresh) {
    const r = compute(acc, op, current());
    if (r === null) return fail("Cannot divide by zero");
    if (!show(r)) return;
  }
  acc = current();
  op = o;
  expr.value = `${format(acc)} ${o}`;
  fresh = true;
};

const equals = () => {
  if (!op) return;
  const r = compute(acc, op, current());
  if (r === null) return fail("Cannot divide by zero");
  expr.value = "";
  acc = null;
  op = null;
  fresh = true;
  show(r);
};

// unary operations replace the current number
const unary = (fn) => {
  const r = fn(current());
  if (r === null) return fail("Cannot divide by zero");
  if (Number.isNaN(r)) return fail("Invalid input");
  if (show(r)) fresh = true;
};

const press = (a) => {
  if (error.value && a !== "c" && a !== "ce") clearAll();

  if (/^[0-9.]$/.test(a)) return digit(a);
  switch (a) {
    case "+":
    case "-":
    case "*":
    case "/":
      return operator(a);
    case "=":
      return equals();
    case "c":
      return clearAll();
    case "ce":
      error.value = false;
      display.value = "0";
      fresh = true;
      return;
    case "back":
      if (fresh) return;
      display.value = display.value.slice(0, -1) || "0";
      if (display.value === "-") display.value = "0";
      return;
    case "neg":
      if (display.value === "0") return;
      display.value = display.value.startsWith("-")
        ? display.value.slice(1)
        : `-${display.value}`;
      return;
    case "sqrt":
      return unary((n) => (n < 0 ? NaN : Math.sqrt(n)));
    case "inv":
      return unary((n) => (n === 0 ? null : 1 / n));
    case "%":
      // like Windows: a percentage of the left-hand operand
      return unary((n) => ((acc ?? 0) * n) / 100);
    case "mc":
      memory.value = 0;
      return;
    case "mr":
      show(memory.value);
      fresh = true;
      return;
    case "ms":
      memory.value = current();
      fresh = true;
      return;
    case "m+":
      memory.value += current();
      fresh = true;
      return;
    case "m-":
      memory.value -= current();
      fresh = true;
      return;
  }
};

const KEYMAP = {
  Enter: "=",
  "=": "=",
  Backspace: "back",
  Escape: "c",
  Delete: "ce",
  "%": "%",
  ",": ".",
};

const onKey = (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const a = /^[0-9.+\-*/]$/.test(e.key) ? e.key : KEYMAP[e.key];
  if (!a) return;
  e.preventDefault();
  press(a);
};

onMounted(() => rootEl.value?.focus());
</script>

<style>
.w7-calc {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  padding: 10px 10px 12px;
  outline: none;
  background: linear-gradient(180deg, #dfe9f5 0%, #d3dfee 100%);
  font: 9pt "Segoe UI", SegoeUI, "Noto Sans", sans-serif;
  user-select: none;
}

.w7k-display {
  position: relative;
  height: 58px;
  padding: 4px 8px;
  border: 1px solid #8e9fb5;
  border-radius: 3px;
  background: linear-gradient(180deg, #ffffff 0%, #eef4fb 55%, #dde8f5 100%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.8);
  text-align: right;
  overflow: hidden;
}

.w7k-mem {
  position: absolute;
  left: 8px;
  bottom: 6px;
  color: #333;
  font-size: 9pt;
}

.w7k-expr {
  height: 16px;
  color: #555;
  font-size: 8pt;
  white-space: nowrap;
}

.w7k-value {
  color: #000;
  font-size: 20pt;
  line-height: 30px;
  white-space: nowrap;
}

.w7k-small {
  font-size: 13pt;
}

.w7k-keys {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-auto-rows: 1fr;
  gap: 5px;
}

.w7k-key {
  padding: 0;
  border: 1px solid #8a9bb3;
  border-radius: 3px;
  background: linear-gradient(180deg, #ffffff 0%, #f1f4f8 45%, #dfe5ec 50%, #e8edf2 100%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7);
  color: #000;
  font: 10pt "Segoe UI", SegoeUI, sans-serif;
}

.w7k-fn {
  background: linear-gradient(180deg, #f3f7fb 0%, #e3ebf4 45%, #d2dde9 50%, #dbe4ee 100%);
}

.w7k-key:hover:not(:disabled) {
  border-color: #3c7fb1;
  background: linear-gradient(180deg, #eaf6fd 0%, #d9f0fc 45%, #bee6fd 50%, #a7d9f5 100%);
}

.w7k-key:active:not(:disabled) {
  border-color: #2c628b;
  background: linear-gradient(180deg, #c4e5f6 0%, #98d1ef 45%, #6dbbe5 50%, #8acbef 100%);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.25);
}

.w7k-key:disabled {
  color: #9aa3ae;
}

.w7k-tall {
  grid-row: span 2;
}

.w7k-wide {
  grid-column: span 2;
}
</style>
