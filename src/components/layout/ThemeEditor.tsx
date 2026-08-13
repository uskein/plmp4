import { useState } from "react";
import { useThemeStore } from "@/stores/theme";
import type { Theme, ThemeColors } from "@/types";

interface ThemeEditorProps {
  theme: Theme | null;
  onClose: () => void;
  onBack: () => void;
}

const COLOR_FIELDS: { key: keyof ThemeColors; label: string; category: string }[] = [
  { key: "bgPrimary", label: "Fondo Principal", category: "Fondos" },
  { key: "bgSecondary", label: "Fondo Secundario", category: "Fondos" },
  { key: "bgTertiary", label: "Fondo Terciario", category: "Fondos" },
  { key: "bgElevated", label: "Fondo Elevado", category: "Fondos" },
  { key: "textPrimary", label: "Texto Principal", category: "Texto" },
  { key: "textSecondary", label: "Texto Secundario", category: "Texto" },
  { key: "textMuted", label: "Texto Atenuado", category: "Texto" },
  { key: "textAccent", label: "Texto Acento", category: "Texto" },
  { key: "borderDefault", label: "Borde Normal", category: "Bordes" },
  { key: "borderStrong", label: "Borde Fuerte", category: "Bordes" },
  { key: "accent", label: "Acento", category: "Acentos" },
  { key: "accentLight", label: "Acento Claro", category: "Acentos" },
  { key: "accentDark", label: "Acento Oscuro", category: "Acentos" },
  { key: "success", label: "Éxito", category: "Semántico" },
  { key: "warning", label: "Advertencia", category: "Semántico" },
  { key: "danger", label: "Peligro", category: "Semántico" },
];

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const hexMatch = value.match(/#([0-9a-fA-F]{6})/);
  const hexValue = hexMatch ? `#${hexMatch[1]}` : value;

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={hexValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-7 h-7 rounded border border-imperial cursor-pointer shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-imperial-muted truncate">{label}</p>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-imperial-carbon border border-imperial rounded px-2 py-0.5 text-[10px] text-imperial-cream font-mono"
        />
      </div>
    </div>
  );
}

function ThemePreview({ colors, name }: { colors: ThemeColors; name: string }) {
  return (
    <div
      className="rounded-xl border border-imperial overflow-hidden"
      style={{ backgroundColor: colors.bgPrimary }}
    >
      <div className="p-3 border-b" style={{ borderColor: colors.borderDefault }}>
        <p className="text-xs font-semibold" style={{ color: colors.textAccent }}>{name}</p>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex gap-2">
          <div className="px-2 py-1 rounded text-[10px]" style={{ backgroundColor: colors.bgTertiary, color: colors.textPrimary }}>
            Botón
          </div>
          <div className="px-2 py-1 rounded text-[10px]" style={{ backgroundColor: colors.accent, color: colors.bgPrimary }}>
            Acento
          </div>
        </div>
        <p className="text-[10px]" style={{ color: colors.textSecondary }}>Texto de ejemplo</p>
        <p className="text-[10px]" style={{ color: colors.textMuted }}>Texto atenuado</p>
      </div>
    </div>
  );
}

export default function ThemeEditor({ theme, onClose, onBack }: ThemeEditorProps) {
  const { addTheme, updateTheme } = useThemeStore();
  const [name, setName] = useState(theme?.name || "");
  const [colors, setColors] = useState<ThemeColors>(
    theme?.colors || {
      bgPrimary: "#0A0A0A",
      bgSecondary: "#121214",
      bgTertiary: "#1A1A1F",
      bgElevated: "#242429",
      textPrimary: "#F5F0E8",
      textSecondary: "#EDE8DA",
      textMuted: "#6B6B76",
      textAccent: "#C9A84C",
      borderDefault: "rgba(201, 168, 76, 0.2)",
      borderStrong: "rgba(201, 168, 76, 0.4)",
      accent: "#C9A84C",
      accentLight: "#D4B96A",
      accentDark: "#A8893D",
      success: "#4A9B8F",
      warning: "#B08D57",
      danger: "#6B2D3E",
    }
  );
  const [activeCategory, setActiveCategory] = useState("Fondos");

  const categories = ["Fondos", "Texto", "Bordes", "Acentos", "Semántico"];
  const filteredFields = COLOR_FIELDS.filter((f) => f.category === activeCategory);

  const handleSave = () => {
    if (!name.trim()) return;
    if (theme) {
      updateTheme(theme.id, { name: name.trim(), colors });
    } else {
      addTheme({ name: name.trim(), colors });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-heavy rounded-2xl shadow-glass-lg w-[560px] max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-imperial">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-imperial-muted hover:text-imperial-cream transition-colors">
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h3 className="font-serif text-sm text-imperial-gold">
              {theme ? "Editar Tema" : "Crear Tema"}
            </h3>
          </div>
          <button onClick={onClose} className="text-imperial-muted hover:text-imperial-cream transition-colors">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs text-imperial-muted mb-1 block">Nombre del tema</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-imperial text-sm"
              placeholder="Mi tema personalizado..."
            />
          </div>

          {/* Preview */}
          <ThemePreview colors={colors} name={name || "Vista previa"} />

          {/* Category tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-imperial-gold text-imperial-black font-medium"
                    : "bg-imperial-carbon text-imperial-muted hover:text-imperial-cream"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Color inputs */}
          <div className="grid grid-cols-2 gap-3">
            {filteredFields.map((field) => (
              <ColorInput
                key={field.key}
                label={field.label}
                value={colors[field.key]}
                onChange={(v) => setColors({ ...colors, [field.key]: v })}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-imperial">
          <button onClick={onClose} className="btn-imperial text-xs px-4 py-2">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="btn-gold text-xs px-4 py-2 disabled:opacity-40"
          >
            {theme ? "Guardar Cambios" : "Crear Tema"}
          </button>
        </div>
      </div>
    </div>
  );
}
