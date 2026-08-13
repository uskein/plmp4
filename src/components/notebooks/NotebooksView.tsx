import { useEffect, useState } from "react";
import { useNotebooksStore } from "@/stores";
import NotebookEditor from "./NotebookEditor";

export default function NotebooksView() {
  const {
    notebooks,
    currentNotebook,
    loadNotebooks,
    createNotebook,
    selectNotebook,
  } = useNotebooksStore();

  const [showNewNotebook, setShowNewNotebook] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    loadNotebooks();
  }, [loadNotebooks]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const nb = await createNotebook(newTitle.trim());
    setNewTitle("");
    setShowNewNotebook(false);
    selectNotebook(nb);
  };

  if (currentNotebook) {
    return <NotebookEditor />;
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-imperial-gold">Cuadernos Virtuales</h1>
          <p className="text-xs text-imperial-muted mt-1">
            {notebooks.length} cuaderno{notebooks.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowNewNotebook(true)}
          className="btn-gold text-xs flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          New Notebook
        </button>
      </div>

      {/* New notebook input */}
      {showNewNotebook && (
        <div className="animate-slide-down">
          <div className="flex items-center gap-2 max-w-sm">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Título del cuaderno..."
              className="input-imperial text-sm"
              autoFocus
            />
            <button onClick={handleCreate} className="btn-gold text-xs px-3 py-2">
              Crear
            </button>
            <button
              onClick={() => { setShowNewNotebook(false); setNewTitle(""); }}
              className="btn-imperial text-xs px-3 py-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Notebooks list */}
      {notebooks.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-imperial-carbon border border-imperial flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-imperial-muted">
              <path d="M4 4.5C4 3.67 4.67 3 5.5 3H11l1.5 1.5H18.5c.83 0 1.5.67 1.5 1.5V18c0 .83-.67 1.5-1.5 1.5h-13C4.67 19.5 4 18.83 4 18V4.5z" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M8 9h8M8 12h6M8 15h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="font-serif text-imperial-muted mb-2">No notebooks yet</p>
          <p className="text-xs text-imperial-muted/60 mb-4">
            Create your first notebook to start writing
          </p>
          <button onClick={() => setShowNewNotebook(true)} className="btn-gold text-xs">
          Nuevo Cuaderno
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notebooks.map((nb) => (
            <button
              key={nb.id}
              onClick={() => selectNotebook(nb)}
              className="card-imperial p-5 text-left group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-14 rounded bg-imperial-carbon border border-imperial flex items-center justify-center shrink-0 group-hover:border-imperial-strong transition-colors">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-imperial-gold">
                    <path d="M3 2.5h12a.5.5 0 01.5.5v12a.5.5 0 01-.5.5H3a.5.5 0 01-.5-.5V3a.5.5 0 01.5-.5z" stroke="currentColor" strokeWidth="1"/>
                    <path d="M6 2v14" stroke="currentColor" strokeWidth="1"/>
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-imperial-cream font-medium truncate">{nb.title}</p>
                  <p className="text-[10px] text-imperial-muted mt-1">
                    Actualizado {new Date(nb.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
