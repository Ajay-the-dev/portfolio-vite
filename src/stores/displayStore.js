import { defineStore } from "pinia";

// The site is dark-only; components still read isDarkMode for their styling.
export const displayStore = defineStore("display", {
  state: () => ({
    isDarkMode: true,
  }),
});
