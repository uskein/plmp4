import { useState } from "react";
import { useThemeStore } from "@/stores/theme";
import ThemeModal from "./ThemeModal";

export default function ThemeSwitcher() {
  const { getActiveTheme } = useThemeStore();
  const [showModal, setShowModal] = useState(false);
  const activeTheme = getActiveTheme();

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-imperial-muted hover:text-imperial-cream glass-light transition-all duration-150"
        title="Cambiar tema"
      >
        <div
          className="w-[18px] h-[18px] rounded-full border-2 shrink-0"
          style={{
            backgroundColor: activeTheme.colors.accent,
            borderColor: activeTheme.colors.borderStrong,
          }}
        />
        <span className="font-medium truncate">{activeTheme.name}</span>
      </button>

      {showModal && <ThemeModal onClose={() => setShowModal(false)} />}
    </>
  );
}
