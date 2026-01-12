import { defineStore } from "pinia";

export const displayStore = defineStore("display", {
  state: () => ({
    isDarkMode: true,
  }),

  actions: {
    toggleLightMode() {
      this.isDarkMode = !this.isDarkMode;
    },

    setLightMode(value) {
      this.isDarkMode = value;
    },

    isAM() {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 18) {
        this.setLightMode(false);
      }
    },

    getLightMode() {
      return this.isDarkMode;
    },
  },
});
