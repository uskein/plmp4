import { useEffect, useState, useCallback, useRef } from "react";
import { useNotebooksStore } from "@/stores";
import { debounce } from "@/lib/tauri";

export default function NotebookEditor() {
  const {
    currentNotebook,
    notes,
    loadNotes,
    createNote,
    updateNote,
    selectNotebook,
  } = useNotebooksStore();

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [isParchment, setIsParchment] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (currentNotebook) {
      loadNotes(currentNotebook.id);
    }
  }, [currentNotebook, loadNotes]);

  useEffect(() => {
    if (notes.length > 0 && !activeNoteId) {
      setActiveNoteId(notes[0].id);
      setEditorContent(notes[0].content);
    }
  }, [notes, activeNoteId]);

  const debouncedUpdate = useCallback(
    debounce((noteId: string, content: string) => {
      updateNote(noteId, content);
    }, 500),
    [updateNote]
  );

  const handleContentChange = (value: string) => {
    setEditorContent(value);
    if (activeNoteId) {
      debouncedUpdate(activeNoteId, value);
    }
  };

  const handleSelectNote = (noteId: string) => {
    // Save current note before switching
    if (activeNoteId && editorContent !== notes.find((n) => n.id === activeNoteId)?.content) {
      updateNote(activeNoteId, editorContent);
    }
    const note = notes.find((n) => n.id === noteId);
    setActiveNoteId(noteId);
    setEditorContent(note?.content ?? "");
  };

  const handleNewNote = async () => {
    if (!currentNotebook) return;
    const note = await createNote(currentNotebook.id);
    setActiveNoteId(note.id);
    setEditorContent("");
    textareaRef.current?.focus();
  };

  const handleExportPDF = async () => {
    if (!currentNotebook) return;
    setShowExportMenu(false);

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = margin;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(10, 10, 10);
    const titleLines = doc.splitTextToSize(currentNotebook.title, maxWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 10 + 5;

    // Date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Exportado: ${new Date().toLocaleDateString()}`, margin, y);
    y += 10;

    // Separator
    doc.setDrawColor(201, 168, 76);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Notes content
    for (const note of notes) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);

      const lines = doc.splitTextToSize(note.content || "(nota vacía)", maxWidth);
      for (const line of lines) {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 5;
      }
      y += 8;
    }

    doc.save(`${currentNotebook.title}.pdf`);
  };

  const handleExportMarkdown = () => {
    if (!currentNotebook) return;
    setShowExportMenu(false);

    let md = `# ${currentNotebook.title}\n\n`;
    notes.forEach((note, i) => {
      md += `---\n\n## Nota ${i + 1}\n\n${note.content}\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentNotebook.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!currentNotebook) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-imperial-obsidian border-b border-imperial shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => selectNotebook(null as any)}
            className="text-imperial-muted hover:text-imperial-gold transition-colors flex items-center gap-2 text-xs"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Cuadernos
          </button>
          <span className="text-xs text-imperial-cream">{currentNotebook.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Parchment toggle */}
          <button
            onClick={() => setIsParchment(!isParchment)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              isParchment
                ? "bg-imperial-parchment text-imperial-black"
                : "text-imperial-muted hover:text-imperial-cream"
            }`}
            title="Alternar modo pergamino"
          >
            {isParchment ? "Oscuro" : "Pergamino"}
          </button>

          {/* Export */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="btn-imperial text-xs flex items-center gap-1"
            >
              Exportar
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 bg-imperial-carbon border border-imperial-strong rounded-lg shadow-imperial-lg py-1 min-w-[140px] z-50 animate-slide-down">
                <button
                  onClick={handleExportPDF}
                  className="w-full px-3 py-2 text-left text-xs text-imperial-cream hover:bg-imperial-slate transition-colors"
                >
                  Exportar como PDF
                </button>
                <button
                  onClick={handleExportMarkdown}
                  className="w-full px-3 py-2 text-left text-xs text-imperial-cream hover:bg-imperial-slate transition-colors"
                >
                  Exportar como Markdown
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Notes sidebar */}
        <div className="w-56 bg-imperial-obsidian border-r border-imperial flex flex-col shrink-0">
          <div className="p-3 border-b border-imperial/50">
            <button
              onClick={handleNewNote}
              className="w-full btn-imperial text-xs flex items-center justify-center gap-2"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Nueva Nota
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {notes.map((note, i) => (
              <button
                key={note.id}
                onClick={() => handleSelectNote(note.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                  activeNoteId === note.id
                    ? "bg-imperial-carbon border border-imperial-strong text-imperial-cream"
                    : "text-imperial-muted hover:bg-imperial-carbon/50 hover:text-imperial-cream"
                }`}
              >
                <span className="text-imperial-gold/60 font-mono text-[10px] mr-2">{i + 1}</span>
                {note.content ? note.content.slice(0, 30) : "(Nota vacía)"}
              </button>
            ))}
          </div>
        </div>

        {/* Main editor */}
        <div
          className={`flex-1 flex flex-col transition-colors duration-300 ${
            isParchment ? "bg-imperial-parchment" : "bg-imperial-black"
          }`}
        >
          <textarea
            ref={textareaRef}
            value={editorContent}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Empezar a escribir..."
            className={`flex-1 resize-none p-8 focus:outline-none font-sans text-base leading-relaxed ${
              isParchment
                ? "bg-transparent text-imperial-black placeholder-imperial-black/30"
                : "bg-transparent text-imperial-cream placeholder-imperial-muted/40"
            }`}
            style={{
              backgroundImage: isParchment
                ? "url(\"data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")"
                : undefined,
            }}
          />
          {/* Word count */}
          <div className={`px-8 py-2 text-[10px] border-t ${
            isParchment
              ? "border-imperial-bone text-imperial-black/40"
              : "border-imperial text-imperial-muted/40"
          }`}>
            {editorContent.split(/\s+/).filter(Boolean).length} palabras · {editorContent.length} caracteres
          </div>
        </div>
      </div>
    </div>
  );
}
