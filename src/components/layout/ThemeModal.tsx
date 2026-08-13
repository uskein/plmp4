import { useState } from "react";
import { useThemeStore } from "@/stores/theme";
import ThemeEditor from "./ThemeEditor";
import type { Theme } from "@/types";

interface ThemeModalProps {
  onClose: () => void;
}

export default function ThemeModal({ onClose }: ThemeModalProps) {
  const { themes, activeThemeId, setActiveTheme, deleteTheme } = useThemeStore();
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const handleSelect = (id: string) => {
    setActiveTheme(id);
    onClose();
  };

  const handleEdit = (e: React.MouseEvent, theme: Theme) => {
    e.stopPropagation();
    setEditingTheme(theme);
    setShowEditor(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("¿Eliminar este tema personalizado?")) {
      deleteTheme(id);
    }
  };

  const handleCreate = () => {
    setEditingTheme(null);
    setShowEditor(true);
  };

  if (showEditor) {
    return <ThemeEditor theme={editingTheme} onClose={() => setShowEditor(false)} onBack={() => setShowEditor(false)} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-heavy rounded-2xl shadow-glass-lg w-[420px] max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-imperial">
          <h3 className="font-serif text-sm text-imperial-gold">Seleccionar Tema</h3>
          <button onClick={onClose} className="text-imperial-muted hover:text-imperial-cream transition-colors">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Theme list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleSelect(theme.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all group ${
                activeThemeId === theme.id
                  ? "border-imperial-strong bg-imperial-carbon"
                  : "border-imperial hover:border-imperial-strong hover:bg-imperial-carbon/50"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Color preview */}
                <div className="flex shrink-0">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white/10 first:rounded-r-none first:z-10"
                    style={{ backgroundColor: theme.colors.bgPrimary }}
                  />
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white/10 -ml-2 first:rounded-l-none"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                </div>
                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-imperial-cream truncate">{theme.name}</p>
                  {theme.isDefault ? (
                    <p className="text-[10px] text-imperial-muted/50">Predeterminado</p>
                  ) : (
                    <p className="text-[10px] text-imperial-muted/50">Personalizado</p>
                  )}
                </div>
                {/* Active indicator */}
                {activeThemeId === theme.id && (
                  <div className="w-2 h-2 rounded-full bg-imperial-gold shrink-0" />
                )}
                {/* Actions (hover) */}
                {!theme.isDefault && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEdit(e, theme)}
                      className="text-imperial-muted hover:text-imperial-gold p-1 rounded transition-colors"
                      title="Editar"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, theme.id)}
                      className="text-imperial-muted hover:text-imperial-wine-light p-1 rounded transition-colors"
                      title="Eliminar"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-imperial">
          <button onClick={handleCreate} className="btn-gold text-xs w-full">
            + Crear Tema Personalizado
          </button>
        </div>
      </div>
    </div>
  );
}
