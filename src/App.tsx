import { useState, useEffect, useMemo } from "react";
import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import { PreviewPanel } from "./components/PreviewPanel";
import { ThemeToggle } from "./components/ThemeToggle";
import { parseDocument } from "./utils/parser";
import { exportToDocx } from "./utils/docxExport";
import { documentStyles } from "./utils/styles";
import type { DocumentStyle, PageSettings } from "./utils/styles";
import { FileText, Settings, Eye } from "lucide-react";

import { playClickSound } from "./utils/sound";
import { WordSimulatorModal } from "./components/WordSimulatorModal";

const DEFAULT_SETTINGS: PageSettings = {
  pageSize: "letter",
  orientation: "portrait",
  margins: "normal",
  includePageNumbers: true,
  headerText: "",
};

export interface DocumentItem {
  id: string;
  title: string;
  text: string;
  style: DocumentStyle;
  settings: PageSettings;
  updatedAt: number;
}

function App() {
  // 1. Initial states with localStorage load & migration
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem("composer_documents_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse documents", e);
      }
    }
    
    // Migration fallback for existing users
    const oldText = localStorage.getItem("composer_text") || "# Tài liệu chính\n\nBắt đầu soạn thảo nội dung tại đây...";
    const oldStyleId = localStorage.getItem("composer_style_id");
    const oldStyle = documentStyles.find((s) => s.id === oldStyleId) || documentStyles[1];
    let oldSettings = DEFAULT_SETTINGS;
    const savedSettings = localStorage.getItem("composer_settings");
    if (savedSettings) {
      try {
        oldSettings = JSON.parse(savedSettings);
      } catch (e) {}
    }
    
    return [{
      id: "default-doc-id",
      title: "Tài liệu chính",
      text: oldText,
      style: oldStyle,
      settings: oldSettings,
      updatedAt: Date.now()
    }];
  });

  const [activeDocId, setActiveDocId] = useState<string>(() => {
    const savedActiveId = localStorage.getItem("composer_active_doc_id");
    return savedActiveId || "default-doc-id";
  });

  // Mobile navigation tab state
  const [mobileTab, setMobileTab] = useState<"write" | "preview" | "settings">("write");
  const [showWordSimulator, setShowWordSimulator] = useState(false);

  // 2. Computed active document properties
  const activeDoc = useMemo(() => {
    const doc = documents.find((d) => d.id === activeDocId);
    return doc || documents[0] || {
      id: "fallback-id",
      title: "Tài liệu trống",
      text: "",
      style: documentStyles[1],
      settings: DEFAULT_SETTINGS,
      updatedAt: Date.now()
    };
  }, [documents, activeDocId]);

  const blocks = useMemo(() => parseDocument(activeDoc.text), [activeDoc.text]);

  // 3. Document CRUD and Update handlers
  const updateActiveDocText = (newText: string) => {
    setDocuments((prev) => 
      prev.map((d) => d.id === activeDocId ? { ...d, text: newText, updatedAt: Date.now() } : d)
    );
  };

  const updateActiveDocStyle = (newStyle: DocumentStyle) => {
    setDocuments((prev) => 
      prev.map((d) => d.id === activeDocId ? { ...d, style: newStyle, updatedAt: Date.now() } : d)
    );
  };

  const updateActiveDocSettings = (newSettings: PageSettings) => {
    setDocuments((prev) => 
      prev.map((d) => d.id === activeDocId ? { ...d, settings: newSettings, updatedAt: Date.now() } : d)
    );
  };

  const createNewDoc = () => {
    playClickSound();
    const newId = Date.now().toString();
    const newDoc: DocumentItem = {
      id: newId,
      title: `Tài liệu mới ${documents.length + 1}`,
      text: `# Tài liệu mới ${documents.length + 1}\n\nBắt đầu soạn thảo nội dung tại đây...`,
      style: documentStyles[1],
      settings: DEFAULT_SETTINGS,
      updatedAt: Date.now()
    };
    setDocuments((prev) => [...prev, newDoc]);
    setActiveDocId(newId);
  };

  const deleteDoc = (id: string) => {
    playClickSound();
    if (documents.length <= 1) {
      alert("Bạn phải giữ lại ít nhất một tài liệu!");
      return;
    }
    const filtered = documents.filter((d) => d.id !== id);
    setDocuments(filtered);
    if (activeDocId === id) {
      setActiveDocId(filtered[0].id);
    }
  };

  const renameDoc = (id: string, newTitle: string) => {
    setDocuments((prev) =>
      prev.map((d) => d.id === id ? { ...d, title: newTitle || "Tài liệu chưa đặt tên", updatedAt: Date.now() } : d)
    );
  };

  // 4. LocalStorage Sync Effects
  useEffect(() => {
    localStorage.setItem("composer_documents_v2", JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem("composer_active_doc_id", activeDocId);
  }, [activeDocId]);

  // 5. Trigger Word Online simulation
  const handleExport = () => {
    if (blocks.length === 0) return;
    setShowWordSimulator(true);
  };

  const handleDownloadDocx = async () => {
    if (blocks.length === 0) return;
    await exportToDocx(blocks, activeDoc.style, activeDoc.settings);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-bg-paper text-ink-black overflow-hidden font-sans transition-colors duration-300">
      {/* Top Navbar */}
      <header className="h-16 shrink-0 flex items-center justify-between px-4 bg-white dark:bg-[#1B1B1E] border-b-4 border-ink-border dark:border-[#3F3F46] z-20 transition-colors">
        <div className="flex items-center gap-2 lg:hidden">
          <span className="font-heading font-black text-xs sm:text-sm bg-ink-black text-white px-2 py-0.5 rounded-sm -rotate-2 shadow-[2px_2px_0px_var(--accent-red)] tracking-wider">
            Wordify.
          </span>
        </div>
        
        {/* Desktop Title */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="font-heading font-black text-base bg-ink-black text-white px-3 py-1 rounded-sm -rotate-2 shadow-[2px_2px_0px_var(--accent-red)] tracking-wider mr-3">
            Wordify.
          </span>
          <span className="text-[10px] bg-accent-yellow text-ink-black px-2 py-0.5 rounded-xs border-2 border-ink-border font-mono font-bold uppercase tracking-wider -rotate-1">
            Không gian làm việc 📝
          </span>
        </div>

        {/* Mobile Tab Selectors */}
        <div className="flex lg:hidden items-center rounded-lg bg-[#F4F3ED] dark:bg-[#121214] border-2 border-ink-border dark:border-[#3F3F46] p-0.5 max-w-[320px] shadow-[2px_2px_0px_var(--shadow-color)] dark:shadow-[2px_2px_0px_#060608]">
          <button
            onClick={() => {
              playClickSound();
              setMobileTab("settings");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-mono font-bold cursor-pointer transition-colors ${
              mobileTab === "settings"
                ? "bg-accent-yellow text-ink-black border border-ink-border shadow-[1px_1px_0px_var(--shadow-color)]"
                : "text-ink-light dark:text-zinc-400 hover:text-ink-black dark:hover:text-zinc-100"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="hidden sm:inline ml-0.5">Thiết lập</span>
          </button>
          <button
            onClick={() => {
              playClickSound();
              setMobileTab("write");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-mono font-bold cursor-pointer transition-colors ${
              mobileTab === "write"
                ? "bg-accent-blue text-white border border-ink-border shadow-[1px_1px_0px_var(--shadow-color)]"
                : "text-ink-light dark:text-zinc-400 hover:text-ink-black dark:hover:text-zinc-100"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="hidden sm:inline ml-0.5">Soạn thảo</span>
          </button>
          <button
            onClick={() => {
              playClickSound();
              setMobileTab("preview");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-mono font-bold cursor-pointer transition-colors ${
              mobileTab === "preview"
                ? "bg-accent-green text-white border border-ink-border shadow-[1px_1px_0px_var(--shadow-color)]"
                : "text-ink-light dark:text-zinc-400 hover:text-ink-black dark:hover:text-zinc-100"
            }`}
          >
            <Eye className="w-5 h-5" />
            <span className="hidden sm:inline ml-0.5">Xem trước</span>
          </button>
        </div>

        {/* Global theme selector */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        
        {/* Desktop Layout - Side-by-Side Panel Structure */}
        <div className="hidden lg:flex w-full h-full overflow-hidden">
          {/* Left Config Panel */}
          <Sidebar
            selectedStyle={activeDoc.style}
            onStyleSelect={updateActiveDocStyle}
            settings={activeDoc.settings}
            onSettingsChange={updateActiveDocSettings}
            onExport={handleExport}
            disabled={blocks.length === 0}
            documents={documents}
            activeDocId={activeDocId}
            onCreateDoc={createNewDoc}
            onDeleteDoc={deleteDoc}
            onRenameDoc={renameDoc}
            onSwitchDoc={setActiveDocId}
          />
          
          {/* Middle Editor Panel */}
          <div className="flex-1 h-full p-4 flex flex-col min-w-0">
            <Editor text={activeDoc.text} onChange={updateActiveDocText} onExport={handleExport} />
          </div>

          {/* Right Live Preview Panel */}
          <div className="flex-1 h-full p-4 pl-0 flex flex-col min-w-0">
            <PreviewPanel
              blocks={blocks}
              style={activeDoc.style}
              settings={activeDoc.settings}
            />
          </div>
        </div>

        {/* Mobile/Tablet Layout - Single Panel Tab-Switched Structure */}
        <div className="lg:hidden w-full h-full p-0 flex flex-col overflow-hidden">
          {mobileTab === "settings" && (
            <div className="flex-1 h-full overflow-y-auto">
              <Sidebar
                selectedStyle={activeDoc.style}
                onStyleSelect={updateActiveDocStyle}
                settings={activeDoc.settings}
                onSettingsChange={updateActiveDocSettings}
                onExport={handleExport}
                disabled={blocks.length === 0}
                documents={documents}
                activeDocId={activeDocId}
                onCreateDoc={createNewDoc}
                onDeleteDoc={deleteDoc}
                onRenameDoc={renameDoc}
                onSwitchDoc={setActiveDocId}
              />
            </div>
          )}

          {mobileTab === "write" && (
            <div className="flex-1 h-full flex flex-col min-h-0">
              <Editor text={activeDoc.text} onChange={updateActiveDocText} onExport={handleExport} />
            </div>
          )}

          {mobileTab === "preview" && (
            <div className="flex-1 h-full flex flex-col min-h-0">
              <PreviewPanel
                blocks={blocks}
                style={activeDoc.style}
                settings={activeDoc.settings}
              />
            </div>
          )}
        </div>

      </div>

      {showWordSimulator && (
        <WordSimulatorModal
          isOpen={showWordSimulator}
          onClose={() => setShowWordSimulator(false)}
          blocks={blocks}
          style={activeDoc.style}
          settings={activeDoc.settings}
          onDownload={handleDownloadDocx}
          onChange={updateActiveDocText}
          onStyleChange={updateActiveDocStyle}
          onSettingsChange={updateActiveDocSettings}
        />
      )}
    </div>
  );
}

export default App;
