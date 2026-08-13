import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";
import { usePlayerStore } from "@/stores";
import { formatTime } from "@/lib/utils";
import { assetUrl } from "@/lib/tauri";
import type { VideoAnnotation } from "@/types";

interface AnnotationPanelProps {
  onSeek: (timestamp: number) => void;
  onClose: () => void;
}

function MarkdownContent({ text }: { text: string }) {
  return (
    <div className="annotation-markdown text-xs text-imperial-cream/80 leading-relaxed">
      <ReactMarkdown
        components={{
          img: ({ src, alt }) => {
            if (!src) return null;
            let imgSrc: string;
            if (src.startsWith("asset://") || src.startsWith("http://") || src.startsWith("https://")) {
              imgSrc = src;
            } else {
              imgSrc = assetUrl(src);
            }
            return (
              <img
                src={imgSrc}
                alt={alt || ""}
                className="max-w-full rounded-lg mt-1 mb-1 border border-imperial/50 cursor-pointer hover:opacity-80 transition-opacity"
                style={{ maxHeight: 150, objectFit: "contain" }}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = "none";
                  const fallback = document.createElement("span");
                  fallback.className = "text-imperial-muted text-[10px] italic";
                  fallback.textContent = "[imagen no disponible]";
                  img.parentNode?.insertBefore(fallback, img);
                }}
              />
            );
          },
          p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="text-imperial-gold font-semibold">{children}</strong>,
          em: ({ children }) => <em className="text-imperial-cream/60">{children}</em>,
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            return isBlock ? (
              <code className="block bg-imperial-obsidian rounded p-2 my-1 text-[10px] font-mono overflow-x-auto whitespace-pre-wrap">
                {children}
              </code>
            ) : (
              <code className="bg-imperial-obsidian px-1 py-0.5 rounded text-[10px] font-mono">
                {children}
              </code>
            );
          },
          a: ({ href, children }) => (
            <a href={href} className="text-imperial-gold underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="list-disc list-inside ml-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside ml-1">{children}</ol>,
          li: ({ children }) => <li className="mb-0.5">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-imperial-gold pl-2 italic text-imperial-cream/60">
              {children}
            </blockquote>
          ),
          h1: ({ children }) => <h1 className="text-sm font-bold text-imperial-gold mt-1 mb-0.5">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xs font-bold text-imperial-gold mt-1 mb-0.5">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xs font-bold text-imperial-gold/80 mt-1 mb-0.5">{children}</h3>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export default function AnnotationPanel({ onSeek, onClose }: AnnotationPanelProps) {
  const { currentVideo, annotations, deleteAnnotation, updateAnnotation } = usePlayerStore();

  const [viewingAnnotation, setViewingAnnotation] = useState<VideoAnnotation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [editColor, setEditColor] = useState("#C9A84C");
  const [isSaving, setIsSaving] = useState(false);

  const openViewModal = (ann: VideoAnnotation) => {
    setViewingAnnotation(ann);
    setIsEditing(false);
    setEditText(ann.note_text);
    setEditColor(ann.highlight_color);
  };

  const closeViewModal = () => {
    setViewingAnnotation(null);
    setIsEditing(false);
    setEditText("");
  };

  const handleSave = async () => {
    if (!viewingAnnotation || !editText.trim()) return;
    setIsSaving(true);
    try {
      await updateAnnotation(viewingAnnotation.id, editText.trim(), editColor);
      setViewingAnnotation({ ...viewingAnnotation, note_text: editText.trim(), highlight_color: editColor });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update annotation:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = () => {
    if (!currentVideo || annotations.length === 0) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(201, 168, 76);
    const titleLines = doc.splitTextToSize(currentVideo.title, contentWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 8 + 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Anotaciones — ${annotations.length} nota${annotations.length !== 1 ? "s" : ""}`, margin, y);
    y += 6;
    doc.text(`Exportado: ${new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}`, margin, y);
    y += 10;

    doc.setDrawColor(201, 168, 76);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    const sorted = [...annotations].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds);

    for (const ann of sorted) {
      if (y > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        y = margin;
      }

      doc.setFont("courier", "bold");
      doc.setFontSize(11);
      doc.setTextColor(201, 168, 76);
      doc.text(formatTime(ann.timestamp_seconds), margin, y);
      y += 6;

      const hex = ann.highlight_color.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      doc.setFillColor(r, g, b);
      doc.circle(margin + doc.getTextWidth(formatTime(ann.timestamp_seconds)) + 4, y - 2, 1.5, "F");
      y += 4;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const cleanText = ann.note_text
        .replace(/!\[.*?\]\(.*?\)/g, "[imagen]")
        .replace(/\[([^\]]+)\]\(.*?\)/g, "$1")
        .replace(/#{1,6}\s/g, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/`{3}[\s\S]*?`{3}/g, "[código]")
        .replace(/`(.*?)`/g, "$1");
      const textLines = doc.splitTextToSize(cleanText, contentWidth);
      doc.text(textLines, margin, y);
      y += textLines.length * 5 + 2;

      doc.setFontSize(8);
      doc.setTextColor(130, 130, 130);
      doc.text(new Date(ann.created_at).toLocaleDateString("es-ES"), margin, y);
      y += 10;

      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.line(margin, y - 4, pageWidth - margin, y - 4);
    }

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(180, 180, 180);
      doc.text(`PLMP4 — Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
    }

    doc.save(`${currentVideo.title}_anotaciones.pdf`);
  };

  return (
    <>
      <div className="w-80 glass-heavy border-l border-imperial flex flex-col shrink-0 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-imperial">
          <h3 className="font-serif text-sm text-imperial-gold">Anotaciones</h3>
          <div className="flex items-center gap-2">
            {annotations.length > 0 && (
              <button
                onClick={handleExportPDF}
                className="text-imperial-muted hover:text-imperial-gold transition-colors"
                title="Exportar a PDF"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-imperial-muted hover:text-imperial-cream transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Video title */}
        {currentVideo && (
          <div className="px-4 py-2 border-b border-imperial/50">
            <p className="text-xs text-imperial-muted truncate">{currentVideo.title}</p>
          </div>
        )}

        {/* Annotations list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {annotations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-imperial-muted text-xs">Sin anotaciones aún</p>
              <p className="text-imperial-muted/60 text-xs mt-1">
                Haz clic en el botón + del reproductor para agregar una
              </p>
            </div>
          ) : (
            [...annotations]
              .sort((a, b) => a.timestamp_seconds - b.timestamp_seconds)
              .map((ann) => (
                <div
                  key={ann.id}
                  className="w-full text-left p-3 rounded-lg bg-imperial-carbon border border-imperial hover:border-imperial-strong transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <button
                      onClick={() => onSeek(ann.timestamp_seconds)}
                      className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: ann.highlight_color }}
                      />
                      <span className="font-mono text-xs text-imperial-gold">
                        {formatTime(ann.timestamp_seconds)}
                      </span>
                    </button>
                    <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openViewModal(ann)}
                        className="text-imperial-muted hover:text-imperial-gold transition-colors p-0.5"
                        title="Ver / Editar"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="3" strokeLinecap="round"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteAnnotation(ann.id)}
                        className="text-imperial-muted hover:text-imperial-wine-light transition-colors p-0.5"
                        title="Eliminar"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => onSeek(ann.timestamp_seconds)}
                    className="w-full text-left"
                  >
                    <MarkdownContent text={ann.note_text} />
                  </button>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Modal de vista/edición */}
      {viewingAnnotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-heavy rounded-2xl shadow-glass-lg w-[520px] max-h-[80vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-imperial">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: viewingAnnotation.highlight_color }}
                />
                <span className="font-mono text-sm text-imperial-gold">
                  {formatTime(viewingAnnotation.timestamp_seconds)}
                </span>
                <span className="text-xs text-imperial-muted">
                  {new Date(viewingAnnotation.created_at).toLocaleDateString("es-ES")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditText(viewingAnnotation.note_text);
                      setEditColor(viewingAnnotation.highlight_color);
                    }}
                    className="btn-imperial text-xs px-3 py-1.5 flex items-center gap-1.5"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Editar
                  </button>
                )}
                <button
                  onClick={closeViewModal}
                  className="text-imperial-muted hover:text-imperial-cream transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex gap-1.5">
                    {["#C9A84C", "#B08D57", "#6B2D3E", "#4A9B8F", "#8B7340"].map((c) => (
                      <button
                        key={c}
                        onClick={() => setEditColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          editColor === c ? "border-white scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="input-imperial w-full text-sm min-h-[160px] max-h-[400px] resize-y font-mono"
                    autoFocus
                  />
                  <p className="text-[10px] text-imperial-muted/50">Markdown soportado. Ctrl+Enter para guardar.</p>
                </div>
              ) : (
                <div className="min-h-[80px]">
                  <MarkdownContent text={viewingAnnotation.note_text} />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {isEditing && (
              <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-imperial">
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-imperial text-xs px-4 py-2"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !editText.trim()}
                  className="btn-gold text-xs px-4 py-2 disabled:opacity-40"
                >
                  {isSaving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
