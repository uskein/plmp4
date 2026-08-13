import { clsx } from "clsx";
import ThemeSwitcher from "./ThemeSwitcher";

type View = "library" | "player" | "notebooks";

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const navItems: { id: View; label: string; icon: JSX.Element }[] = [
  {
    id: "library",
    label: "Biblioteca",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="10.5" y="2" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="2" y="10.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    id: "player",
    label: "Reproductor",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M7.5 6l4.5 3-4.5 3V6z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: "notebooks",
    label: "Cuadernos",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 2.5h12a.5.5 0 01.5.5v12a.5.5 0 01-.5.5H3a.5.5 0 01-.5-.5V3a.5.5 0 01.5-.5z" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M6 2v14" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M8.5 6h5M8.5 9h5M8.5 12h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function Sidebar({ currentView, onNavigate }: SidebarProps) {
  return (
    <aside className="w-56 glass-heavy border-r border-imperial flex flex-col shrink-0">
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={clsx(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
              currentView === item.id
                ? "glass text-imperial-gold border border-imperial-strong"
                : "text-imperial-muted hover:text-imperial-cream hover:bg-imperial-carbon/30"
            )}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-imperial space-y-1">
        <ThemeSwitcher />
        <div className="px-3 py-2 text-xs text-imperial-muted">
          v0.3.0
        </div>
      </div>
    </aside>
  );
}
