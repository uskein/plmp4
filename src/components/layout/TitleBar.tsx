import { getCurrentWindow } from "@tauri-apps/api/window";

export default function TitleBar() {
  const win = getCurrentWindow();

  return (
    <div
      data-tauri-drag-region
      className="h-10 flex items-center justify-between px-4 glass-heavy border-b border-imperial select-none shrink-0"
    >
      <div className="flex items-center gap-2" data-tauri-drag-region>
        <div className="w-3 h-3 rounded-full bg-imperial-gold/80" />
        <span className="font-serif text-sm text-imperial-gold tracking-wider">
          PLMP4
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => win.minimize()}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-imperial-slate transition-colors text-imperial-muted hover:text-imperial-cream"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <button
          onClick={() => win.toggleMaximize()}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-imperial-slate transition-colors text-imperial-muted hover:text-imperial-cream"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
        </button>
        <button
          onClick={() => win.close()}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-imperial-wine transition-colors text-imperial-muted hover:text-white"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
