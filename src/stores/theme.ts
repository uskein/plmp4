import { create } from "zustand";
import type { Theme, ThemeColors } from "@/types";
import { DEFAULT_THEMES } from "@/lib/themes";

const STORAGE_KEY_THEMES = "plpdf-themes";
const STORAGE_KEY_ACTIVE = "plpdf-active-theme";

function loadCustomThemes(): Theme[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_THEMES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustomThemes(themes: Theme[]) {
  localStorage.setItem(STORAGE_KEY_THEMES, JSON.stringify(themes));
}

function loadActiveThemeId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE) || "imperial-obsidian";
  } catch {
    return "imperial-obsidian";
  }
}

function saveActiveThemeId(id: string) {
  localStorage.setItem(STORAGE_KEY_ACTIVE, id);
}

function applyThemeToCSS(colors: ThemeColors) {
  const root = document.documentElement;
  root.style.setProperty("--theme-bg-primary", colors.bgPrimary);
  root.style.setProperty("--theme-bg-secondary", colors.bgSecondary);
  root.style.setProperty("--theme-bg-tertiary", colors.bgTertiary);
  root.style.setProperty("--theme-bg-elevated", colors.bgElevated);
  root.style.setProperty("--theme-text-primary", colors.textPrimary);
  root.style.setProperty("--theme-text-secondary", colors.textSecondary);
  root.style.setProperty("--theme-text-muted", colors.textMuted);
  root.style.setProperty("--theme-text-accent", colors.textAccent);
  root.style.setProperty("--theme-border-default", colors.borderDefault);
  root.style.setProperty("--theme-border-strong", colors.borderStrong);
  root.style.setProperty("--theme-accent", colors.accent);
  root.style.setProperty("--theme-accent-light", colors.accentLight);
  root.style.setProperty("--theme-accent-dark", colors.accentDark);
  root.style.setProperty("--theme-success", colors.success);
  root.style.setProperty("--theme-warning", colors.warning);
  root.style.setProperty("--theme-danger", colors.danger);
}

interface ThemeState {
  themes: Theme[];
  activeThemeId: string;
  getActiveTheme: () => Theme;
  setActiveTheme: (id: string) => void;
  addTheme: (theme: Omit<Theme, "id">) => Theme;
  updateTheme: (id: string, updates: Partial<Theme>) => void;
  deleteTheme: (id: string) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const customThemes = loadCustomThemes();
  const activeId = loadActiveThemeId();
  const allThemes = [...DEFAULT_THEMES, ...customThemes];
  const active = allThemes.find((t) => t.id === activeId) || DEFAULT_THEMES[0];

  // Apply theme on load
  setTimeout(() => applyThemeToCSS(active.colors), 0);

  return {
    themes: allThemes,
    activeThemeId: active.id,

    getActiveTheme: () => {
      const state = get();
      return state.themes.find((t) => t.id === state.activeThemeId) || DEFAULT_THEMES[0];
    },

    setActiveTheme: (id) => {
      const theme = get().themes.find((t) => t.id === id);
      if (!theme) return;
      saveActiveThemeId(id);
      applyThemeToCSS(theme.colors);
      set({ activeThemeId: id });
    },

    addTheme: (themeData) => {
      const newTheme: Theme = {
        ...themeData,
        id: `custom-${Date.now()}`,
      };
      const custom = [...loadCustomThemes(), newTheme];
      saveCustomThemes(custom);
      set({ themes: [...DEFAULT_THEMES, ...custom] });
      return newTheme;
    },

    updateTheme: (id, updates) => {
      const custom = loadCustomThemes();
      const idx = custom.findIndex((t) => t.id === id);
      if (idx === -1) return;
      custom[idx] = { ...custom[idx], ...updates };
      saveCustomThemes(custom);
      set({ themes: [...DEFAULT_THEMES, ...custom] });
      if (get().activeThemeId === id && updates.colors) {
        applyThemeToCSS(updates.colors);
      }
    },

    deleteTheme: (id) => {
      const custom = loadCustomThemes().filter((t) => t.id !== id);
      saveCustomThemes(custom);
      const newState = { themes: [...DEFAULT_THEMES, ...custom] };
      set(newState);
      if (get().activeThemeId === id) {
        get().setActiveTheme("imperial-obsidian");
      }
    },
  };
});
