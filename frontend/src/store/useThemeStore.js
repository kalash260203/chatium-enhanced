import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("Chatium-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("Chatium-theme", theme);
    set({ theme });
  },
}));
