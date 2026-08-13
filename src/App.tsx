import { useState, useEffect } from "react";
import TitleBar from "./components/layout/TitleBar";
import Sidebar from "./components/layout/Sidebar";
import LibraryView from "./components/library/LibraryView";
import PlayerView from "./components/player/PlayerView";
import NotebooksView from "./components/notebooks/NotebooksView";
import { useThemeStore } from "./stores/theme";

export type View = "library" | "player" | "notebooks";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("library");
  const { getActiveTheme } = useThemeStore();

  // Initialize theme on mount
  useEffect(() => {
    getActiveTheme();
  }, [getActiveTheme]);

  const renderView = () => {
    switch (currentView) {
      case "library":
        return <LibraryView onNavigate={setCurrentView} />;
      case "player":
        return <PlayerView onNavigate={setCurrentView} />;
      case "notebooks":
        return <NotebooksView />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-imperial-black text-imperial-cream">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentView={currentView} onNavigate={setCurrentView} />
        <main className="flex-1 overflow-hidden">{renderView()}</main>
      </div>
    </div>
  );
}
