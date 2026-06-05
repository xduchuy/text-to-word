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

const DEFAULT_SETTINGS: PageSettings = {
  pageSize: "letter",
  orientation: "portrait",
  margins: "normal",
  includePageNumbers: true,
  headerText: "",
};

function App() {
  // 1. Initial states from localStorage
  const [text, setText] = useState<string>(() => {
    return localStorage.getItem("composer_text") || "";
  });

  const [selectedStyle, setSelectedStyle] = useState<DocumentStyle>(() => {
    const savedId = localStorage.getItem("composer_style_id");
    const style = documentStyles.find((s) => s.id === savedId);
    return style || documentStyles[1]; // Default to Minimal Modern
  });

  const [settings, setSettings] = useState<PageSettings>(() => {
    const savedSettings = localStorage.getItem("composer_settings");
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Mobile navigation tab state
  const [mobileTab, setMobileTab] = useState<"write" | "preview" | "settings">("write");

  // 2. Parsed blocks computed from raw editor text
  const blocks = useMemo(() => parseDocument(text), [text]);

  // 3. LocalStorage sync effects
  useEffect(() => {
    localStorage.setItem("composer_text", text);
  }, [text]);

  useEffect(() => {
    localStorage.setItem("composer_style_id", selectedStyle.id);
  }, [selectedStyle]);

  useEffect(() => {
    localStorage.setItem("composer_settings", JSON.stringify(settings));
  }, [settings]);

  // 4. Trigger Word compilation and export download
  const handleExport = async () => {
    if (blocks.length === 0) return;
    await exportToDocx(blocks, selectedStyle, settings);
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
            onClick={() => setMobileTab("settings")}
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
            onClick={() => setMobileTab("write")}
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
            onClick={() => setMobileTab("preview")}
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
            selectedStyle={selectedStyle}
            onStyleSelect={setSelectedStyle}
            settings={settings}
            onSettingsChange={setSettings}
            onExport={handleExport}
            disabled={blocks.length === 0}
          />
          
          {/* Middle Editor Panel */}
          <div className="flex-1 h-full p-4 flex flex-col min-w-0">
            <Editor text={text} onChange={setText} />
          </div>

          {/* Right Live Preview Panel */}
          <div className="flex-1 h-full p-4 pl-0 flex flex-col min-w-0">
            <PreviewPanel
              blocks={blocks}
              style={selectedStyle}
              settings={settings}
            />
          </div>
        </div>

        {/* Mobile/Tablet Layout - Single Panel Tab-Switched Structure */}
        <div className="lg:hidden w-full h-full p-0 flex flex-col overflow-hidden">
          {mobileTab === "settings" && (
            <div className="flex-1 h-full overflow-y-auto">
              <Sidebar
                selectedStyle={selectedStyle}
                onStyleSelect={setSelectedStyle}
                settings={settings}
                onSettingsChange={setSettings}
                onExport={handleExport}
                disabled={blocks.length === 0}
              />
            </div>
          )}

          {mobileTab === "write" && (
            <div className="flex-1 h-full flex flex-col min-h-0">
              <Editor text={text} onChange={setText} />
            </div>
          )}

          {mobileTab === "preview" && (
            <div className="flex-1 h-full flex flex-col min-h-0">
              <PreviewPanel
                blocks={blocks}
                style={selectedStyle}
                settings={settings}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;
