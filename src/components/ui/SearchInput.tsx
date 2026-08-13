import { useRef, useEffect } from "react";
import { clsx } from "clsx";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  return (
    <div className={clsx("relative", className)}>
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-imperial-muted"
      >
        <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-imperial pl-9 text-sm"
      />
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "default";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmar",
  variant = "default",
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-imperial-carbon border border-imperial-strong rounded-xl shadow-imperial-lg p-6 max-w-sm w-full mx-4 animate-slide-up">
        <h3 className="font-serif text-lg text-imperial-cream mb-2">{title}</h3>
        <p className="text-sm text-imperial-muted mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-imperial text-xs">
            Cancelar
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={clsx(
              "text-xs px-4 py-2 rounded-lg font-medium transition-all",
              variant === "danger"
                ? "bg-imperial-wine text-white hover:bg-imperial-wine-light"
                : "btn-gold"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: { label: string; onClick: () => void; danger?: boolean }[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener("click", handler);
    window.addEventListener("contextmenu", handler);
    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("contextmenu", handler);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-imperial-carbon border border-imperial-strong rounded-lg shadow-imperial-lg py-1 min-w-[140px] animate-fade-in"
      style={{ top: y, left: x }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            item.onClick();
            onClose();
          }}
          className={clsx(
            "w-full px-3 py-2 text-left text-xs transition-colors",
            item.danger
              ? "text-imperial-wine-light hover:bg-imperial-slate"
              : "text-imperial-cream hover:bg-imperial-slate"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
