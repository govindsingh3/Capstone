import { create } from "zustand";

const getInitialTheme = () => {
  const saved = localStorage.getItem("dpres_theme");
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
};

export const useUIStore = create((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  theme: getInitialTheme(),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  openMobileSidebar: () => set({ mobileSidebarOpen: true }),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("dpres_theme", theme);
      return { theme };
    }),
}));
