<template>
  <textarea
    v-model="text"
    class="w7-notepad"
    spellcheck="false"
    aria-label="Notepad"
  ></textarea>
</template>

<script setup>
import { ref, watch } from "vue";

const STORAGE_KEY = "xp-notepad";

const DEFAULT_TEXT = `Hi, I'm Ajay Chitambaran - Full Stack Developer in Dubai.

Double-click the desktop icons to look around:
  Computer     - who I am
  Services     - what I do
  My Projects  - what I've built
  History      - how I got here
  Contact Me   - say hello

This notepad is yours - type anything, it's saved in your browser.
`;

const load = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_TEXT;
  } catch {
    return DEFAULT_TEXT;
  }
};

const text = ref(load());

watch(text, (val) => {
  try {
    localStorage.setItem(STORAGE_KEY, val);
  } catch {
    // storage blocked (private mode etc.) - keep the text in memory only
  }
});
</script>

<style>
.w7-notepad {
  display: block;
  width: 100%;
  height: 100%;
  padding: 2px 4px;
  border: none;
  outline: none;
  resize: none;
  background: #fff;
  color: #000;
  font: 13px Consolas, "Lucida Console", "Courier New", monospace;
  line-height: 1.25;
}
</style>
