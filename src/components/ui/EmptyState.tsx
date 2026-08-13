import { clsx } from "clsx";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 animate-fade-in">
      <div className="w-16 h-16 mx-auto rounded-full bg-imperial-carbon border border-imperial flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="font-serif text-lg text-imperial-muted mb-2">{title}</p>
      <p className="text-xs text-imperial-muted/60 mb-4 max-w-xs mx-auto">{description}</p>
      {action}
    </div>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-imperial-carbon border border-imperial-strong rounded-xl shadow-imperial-lg p-6 max-w-md w-full mx-4 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg text-imperial-gold">{title}</h2>
          <button
            onClick={onClose}
            className="text-imperial-muted hover:text-imperial-cream transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  return (
    <div className={clsx("relative group/tip inline-flex", className)}>
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-imperial-carbon border border-imperial-strong rounded text-[10px] text-imperial-cream whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none shadow-imperial">
        {content}
      </div>
    </div>
  );
}
