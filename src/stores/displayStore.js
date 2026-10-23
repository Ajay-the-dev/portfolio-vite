import { defineStore } from "pinia";
import { useDark, useToggle } from "@vueuse/core";

export const displayStore = defineStore("display", () => {
  // Single source of truth: persisted to localStorage and reflected on <html>
  // as data-bs-theme, so Bootstrap 5.3 components follow the theme too.
  const isDarkMode = useDark({
    selector: "html",
    attribute: "data-bs-theme",
    valueDark: "dark",
    valueLight: "light",
    initialValue: "dark",
  });

  const toggleLightMode = useToggle(isDarkMode);

  function setLightMode(value) {
    isDarkMode.value = value;
  }

  return { isDarkMode, toggleLightMode, setLightMode };
});
