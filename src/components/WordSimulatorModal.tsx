import React, { useState } from "react";
import type { Block } from "../utils/parser";
import { blocksToMarkdown } from "../utils/parser";
import type { DocumentStyle, PageSettings } from "../utils/styles";
import { marginPresets } from "../utils/styles";
import {
  X, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Download, Search, HelpCircle, Check, ChevronDown,
  Globe, Share2, Undo2, Redo2, Type, RefreshCw
} from "lucide-react";
import { playClickSound } from "../utils/sound";

interface WordSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: Block[];
  style: DocumentStyle;
  settings: PageSettings;
  onDownload: () => void;
  onChange: (val: string) => void;
}

export const WordSimulatorModal: React.FC<WordSimulatorModalProps> = ({
  isOpen,
  onClose,
  blocks,
  style,
  settings,
  onDownload,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<"home" | "insert" | "layout" | "view">("home");
  const [zoom, setZoom] = useState<number>(100);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);

  const updateBlocksState = (updatedBlocks: Block[]) => {
    const markdown = blocksToMarkdown(updatedBlocks);
    onChange(markdown);
  };

  const updateBlockText = (blockIdx: number, newText: string) => {
    const updated = blocks.map((block, idx) => {
      if (idx === blockIdx) {
        if (block.type === "title" || block.type === "heading1" || block.type === "heading2" || block.type === "heading3" || block.type === "paragraph" || block.type === "quote") {
          return { ...block, text: newText };
        }
      }
      return block;
    });
    updateBlocksState(updated);
  };

  const updateListItemText = (blockIdx: number, itemIdx: number, newText: string) => {
    const updated = blocks.map((block, idx) => {
      if (idx === blockIdx) {
        if (block.type === "bullet-list" || block.type === "numbered-list") {
          const newItems = block.items.map((item, iIdx) => iIdx === itemIdx ? newText : item);
          return { ...block, items: newItems };
        }
      }
      return block;
    });
    updateBlocksState(updated);
  };

  const updateCodeBlockText = (blockIdx: number, newText: string) => {
    const updated = blocks.map((block, idx) => {
      if (idx === blockIdx) {
        if (block.type === "code") {
          return { ...block, code: newText };
        }
      }
      return block;
    });
    updateBlocksState(updated);
  };

  const updateTableHeaderText = (blockIdx: number, headerIdx: number, newText: string) => {
    const updated = blocks.map((block, idx) => {
      if (idx === blockIdx) {
        if (block.type === "table") {
          const newHeaders = block.headers.map((h, i) => i === headerIdx ? newText : h);
          return { ...block, headers: newHeaders };
        }
      }
      return block;
    });
    updateBlocksState(updated);
  };

  const updateTableCellText = (blockIdx: number, rowIdx: number, cellIdx: number, newText: string) => {
    const updated = blocks.map((block, idx) => {
      if (idx === blockIdx) {
        if (block.type === "table") {
          const newRows = block.rows.map((row, r) => 
            r === rowIdx ? row.map((cell, c) => c === cellIdx ? newText : cell) : row
          );
          return { ...block, rows: newRows };
        }
      }
      return block;
    });
    updateBlocksState(updated);
  };

  if (!isOpen) return null;

  const marginPreset = marginPresets[settings.margins];
  const isLandscape = settings.orientation === "landscape";

  // Calculate word count
  const allText = blocks.map(b => "text" in b ? b.text : "code" in b ? b.code : "").join(" ");
  const wordCount = allText.trim() === "" ? 0 : allText.trim().split(/\s+/).length;

  const handleDownloadClick = () => {
    playClickSound();
    setIsDownloading(true);
    setTimeout(() => {
      onDownload();
      setIsDownloading(false);
      setShowDownloadSuccess(true);
      setTimeout(() => setShowDownloadSuccess(false), 3000);
    }, 1200); // 1.2s simulated compilation & packaging
  };

  const selectTab = (tab: "home" | "insert" | "layout" | "view") => {
    playClickSound();
    setActiveTab(tab);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-0 md:p-4 animate-fade-in backdrop-blur-xs">
      {/* Word Window Simulation */}
      <div className="bg-[#F3F2F1] dark:bg-[#1B1B1D] w-full h-full md:h-[95vh] md:max-w-6xl md:rounded-lg border-2 border-ink-border dark:border-[#3F3F46] flex flex-col overflow-hidden shadow-2xl relative font-sans text-sm text-zinc-700">
        
        {/* 1. Word Title Bar / App Header */}
        <header className="bg-[#185abd] text-white h-11 shrink-0 flex items-center justify-between px-3 relative select-none">
          {/* Left: App launcher & Name */}
          <div className="flex items-center gap-3">
            {/* Simulated Word Logo Icon */}
            <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center shadow-xs shrink-0 select-none">
              <span className="text-[#185abd] font-black text-xs font-heading">W</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-xs md:text-sm">
              <span className="hidden sm:inline">Word</span>
              <span className="opacity-60 hidden sm:inline">|</span>
              <span className="truncate max-w-[150px] md:max-w-[300px]">
                {blocks.find(b => b.type === "title")?.text || blocks.find(b => b.type === "heading1")?.text || "tai-lieu"}.docx
              </span>
              <span className="bg-[#106ebe] text-[9px] px-1.5 py-0.5 rounded-xs font-mono font-bold tracking-wider uppercase ml-1.5 text-blue-100">
                Đã Lưu
              </span>
            </div>
          </div>

          {/* Center: Search / Commands bar */}
          <div className="hidden md:flex items-center bg-white/10 hover:bg-white/15 transition-colors px-3 py-1 rounded-md w-72 mx-auto gap-2 text-white/70 select-none">
            <Search className="w-3.5 h-3.5" />
            <span className="text-xs">Tìm kiếm tính năng...</span>
          </div>

          {/* Right: Window control icons & profile */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { playClickSound(); }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-sm bg-white/10 hover:bg-white/20 text-xs font-semibold select-none cursor-pointer transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chia sẻ</span>
            </button>
            <span className="w-px h-5 bg-white/20 hidden sm:block" />
            {/* Close Button */}
            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="p-1.5 rounded-md hover:bg-red-500 hover:text-white transition-colors cursor-pointer text-white/80"
              title="Đóng trình giả lập"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </header>

        {/* 2. Ribbon Tabs */}
        <div className="bg-[#FAF9F6] dark:bg-[#202023] border-b border-zinc-200 dark:border-[#3F3F46] shrink-0 flex items-center justify-between px-3 h-8 select-none">
          <div className="flex items-center h-full text-xs font-medium">
            <button
              onClick={() => selectTab("home")}
              className={`px-3 h-full cursor-pointer flex items-center border-b-2 transition-all ${
                activeTab === "home"
                  ? "border-[#185abd] text-[#185abd] font-bold"
                  : "border-transparent text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-[#2D2D30]"
              }`}
            >
              Trang chủ
            </button>
            <button
              onClick={() => selectTab("insert")}
              className={`px-3 h-full cursor-pointer flex items-center border-b-2 transition-all ${
                activeTab === "insert"
                  ? "border-[#185abd] text-[#185abd] font-bold"
                  : "border-transparent text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-[#2D2D30]"
              }`}
            >
              Chèn
            </button>
            <button
              onClick={() => selectTab("layout")}
              className={`px-3 h-full cursor-pointer flex items-center border-b-2 transition-all ${
                activeTab === "layout"
                  ? "border-[#185abd] text-[#185abd] font-bold"
                  : "border-transparent text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-[#2D2D30]"
              }`}
            >
              Bố trí
            </button>
            <button
              onClick={() => selectTab("view")}
              className={`px-3 h-full cursor-pointer flex items-center border-b-2 transition-all ${
                activeTab === "view"
                  ? "border-[#185abd] text-[#185abd] font-bold"
                  : "border-transparent text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-[#2D2D30]"
              }`}
            >
              Xem
            </button>
          </div>
          
          <div className="flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-400 cursor-help" />
          </div>
        </div>

        {/* 3. Ribbon Toolbar Panel */}
        <div className="bg-white dark:bg-[#27272A] border-b border-zinc-200 dark:border-[#3F3F46] shrink-0 p-1.5 md:p-2.5 flex flex-wrap items-center justify-between gap-2 md:gap-4 select-none">
          {/* Main Controls group */}
          <div className="flex flex-wrap items-center gap-1.5 md:gap-3 shrink-0">
            {/* Undo / Redo */}
            <div className="flex items-center border-r border-zinc-200 dark:border-[#3F3F46] pr-1.5 md:pr-2.5 gap-0.5">
              <button onClick={() => playClickSound()} className="p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-[#3F3F46] text-zinc-500 dark:text-zinc-300 cursor-pointer">
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => playClickSound()} className="p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-[#3F3F46] text-zinc-500 dark:text-zinc-300 cursor-pointer">
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tab-specific controls rendering */}
            {activeTab === "home" && (
              <>
                {/* Font Name & Size */}
                <div className="flex items-center gap-1 bg-zinc-50 dark:bg-[#1E1E21] border border-zinc-200 dark:border-[#3F3F46] rounded px-1.5 py-0.5 text-xs font-mono">
                  <Type className="w-3 h-3 text-zinc-400" />
                  <span className="font-bold text-zinc-800 dark:text-zinc-100 truncate max-w-[90px]">
                    {style.docxFont}
                  </span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </div>
                <div className="flex items-center gap-1 bg-zinc-50 dark:bg-[#1E1E21] border border-zinc-200 dark:border-[#3F3F46] rounded px-1.5 py-0.5 text-xs font-mono">
                  <span className="font-bold text-zinc-800 dark:text-zinc-100">11</span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </div>

                <span className="w-px h-5 bg-zinc-200 dark:bg-[#3F3F46]" />

                {/* Bold, Italic, Underline */}
                <div className="flex items-center gap-0.5">
                  <button onClick={() => playClickSound()} className="p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-[#3F3F46] text-zinc-700 dark:text-zinc-200 font-black cursor-pointer">
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => playClickSound()} className="p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-[#3F3F46] text-zinc-700 dark:text-zinc-200 italic cursor-pointer">
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => playClickSound()} className="p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-[#3F3F46] text-zinc-700 dark:text-zinc-200 underline cursor-pointer">
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="w-px h-5 bg-zinc-200 dark:bg-[#3F3F46]" />

                {/* Lists & Alignment */}
                <div className="flex items-center gap-0.5">
                  <button onClick={() => playClickSound()} className="p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-[#3F3F46] text-zinc-500 dark:text-zinc-300 cursor-pointer">
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => playClickSound()} className="p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-[#3F3F46] text-zinc-500 dark:text-zinc-300 cursor-pointer">
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-px h-4 bg-zinc-100 dark:bg-[#3F3F46] mx-1" />
                  <button onClick={() => playClickSound()} className={`p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-[#3F3F46] cursor-pointer ${!style.justifyText ? "bg-zinc-100 dark:bg-[#3F3F46] text-[#185abd]" : "text-zinc-500 dark:text-zinc-300"}`}>
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => playClickSound()} className="p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-[#3F3F46] text-zinc-500 dark:text-zinc-300 cursor-pointer">
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => playClickSound()} className="p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-[#3F3F46] text-zinc-500 dark:text-zinc-300 cursor-pointer">
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => playClickSound()} className={`p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-[#3F3F46] cursor-pointer ${style.justifyText ? "bg-zinc-100 dark:bg-[#3F3F46] text-[#185abd]" : "text-zinc-500 dark:text-zinc-300"}`}>
                    <AlignJustify className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}

            {activeTab === "insert" && (
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono italic">
                <span>Chèn bảng, Hình ảnh, Tiêu đề trang, Header/Footer...</span>
              </div>
            )}

            {activeTab === "layout" && (
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-zinc-500">Khổ giấy:</span>
                  <span className="bg-zinc-100 dark:bg-[#3E3E42] px-2 py-0.5 border border-zinc-200 dark:border-[#3F3F46] font-mono rounded font-bold uppercase">{settings.pageSize}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-zinc-500">Hướng:</span>
                  <span className="bg-zinc-100 dark:bg-[#3E3E42] px-2 py-0.5 border border-zinc-200 dark:border-[#3F3F46] font-mono rounded font-bold">{settings.orientation === "portrait" ? "Dọc" : "Ngang"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-zinc-500">Lề:</span>
                  <span className="bg-zinc-100 dark:bg-[#3E3E42] px-2 py-0.5 border border-zinc-200 dark:border-[#3F3F46] font-mono rounded font-bold uppercase">{settings.margins}</span>
                </div>
              </div>
            )}

            {activeTab === "view" && (
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono italic">
                <span>Xem bố cục in, Xem dàn bài, Xem thước kẻ căn chỉnh...</span>
              </div>
            )}
          </div>

          {/* Action Export / Download Button */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {showDownloadSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded animate-bounce">
                <Check className="w-4 h-4" />
                <span className="font-bold font-mono">Đã tải tệp xuống!</span>
              </div>
            )}
            
            <button
              onClick={handleDownloadClick}
              disabled={isDownloading}
              className={`flex items-center gap-2 py-1.5 px-4 rounded-md border-2 border-ink-border dark:border-[#3F3F46] font-mono font-bold text-xs shadow-[2px_2px_0px_rgba(0,0,0,0.15)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,0.15)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-100 cursor-pointer ${
                isDownloading 
                  ? "bg-zinc-100 text-zinc-400 cursor-wait" 
                  : "bg-accent-green text-white hover:bg-emerald-600"
              }`}
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang tải...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải tệp .DOCX thật</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4. Rulers & Document Workspace Container */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#E5E5DE] dark:bg-[#111112]">
          
          {/* Horizontal Ruler simulation */}
          <div className="h-6 bg-[#FAF9F6] dark:bg-[#202023] border-b border-zinc-200 dark:border-[#3F3F46] flex items-center relative select-none pl-6 text-[9px] font-mono text-zinc-400">
            {/* Zero point margin indicators */}
            <div className="absolute left-6 w-3 h-full border-r border-[#185abd]/30 flex items-center justify-end pr-0.5">
              <span>L</span>
            </div>
            <div className="flex w-full justify-between px-8 text-center">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
              <span>9</span>
              <span>10</span>
              <span>11</span>
              <span>12</span>
            </div>
            <div className="absolute right-6 w-3 h-full border-l border-[#185abd]/30 flex items-center pl-0.5">
              <span>R</span>
            </div>
          </div>

          {/* Main workspace scroll area */}
          <div className="flex-1 flex overflow-hidden relative">
            
            {/* Vertical Ruler simulation on the left */}
            <div className="w-6 bg-[#FAF9F6] dark:bg-[#202023] border-r border-zinc-200 dark:border-[#3F3F46] flex flex-col items-center justify-between py-8 select-none text-[8px] font-mono text-zinc-400 shrink-0">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
              <span>9</span>
              <span>10</span>
            </div>

            {/* Document sheet view */}
            <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start">
              
              <div 
                style={{ 
                  transform: `scale(${zoom / 100})`, 
                  transformOrigin: "top center",
                  fontFamily: style.bodyFontFamily
                }}
                className={`shadow-2xl border border-zinc-300 dark:border-[#3F3F46] transition-all duration-300 relative flex flex-col justify-between max-w-full origin-top shrink-0 bg-white dark:bg-[#1E1E20] ${
                  marginPreset.css
                } ${
                  isLandscape
                    ? settings.pageSize === "letter"
                      ? "w-[11in] min-h-[8.5in]"
                      : "w-[11.69in] min-h-[8.27in]"
                    : settings.pageSize === "letter"
                      ? "w-[8.5in] min-h-[11in]"
                      : "w-[8.27in] min-h-[11.69in]"
                }`}
              >
                {/* Header simulation */}
                {settings.headerText.trim() && (
                  <div className="absolute top-4 left-6 right-6 flex justify-between items-center border-b border-zinc-200 dark:border-[#3F3F46] pb-1 text-[9px] font-sans text-zinc-400 uppercase tracking-widest">
                    <span>Microsoft Word Simulator</span>
                    <span>{settings.headerText}</span>
                  </div>
                )}

                {/* Content body */}
                <div className="flex-1 w-full text-slate-800 dark:text-zinc-200 mt-2">
                  {blocks.map((block, idx) => {
                    switch (block.type) {
                      case "title":
                        return (
                          <h1
                            key={idx}
                            className={`text-3xl font-extrabold tracking-tight pb-3 mb-6 border-b border-zinc-200 dark:border-[#3F3F46] outline-none hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded p-1 -m-1 cursor-text focus:ring-2 focus:ring-[#185abd]/30 focus:bg-white dark:focus:bg-zinc-800/70 transition-colors duration-100 ${
                              style.id === "academic" ? "text-center" : "text-left"
                            } ${style.headerFontClass}`}
                            style={{ color: `#${style.docxPrimaryColor}`, fontFamily: style.headerFontFamily }}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateBlockText(idx, e.currentTarget.innerText)}
                          >
                            {block.text}
                          </h1>
                        );

                      case "heading1":
                        return (
                          <h2
                            key={idx}
                            className={`text-2xl font-bold tracking-tight mt-8 mb-3 outline-none hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded p-1 -m-1 cursor-text focus:ring-2 focus:ring-[#185abd]/30 focus:bg-white dark:focus:bg-zinc-800/70 transition-colors duration-100 ${style.headerFontClass}`}
                            style={{ color: `#${style.docxPrimaryColor}`, fontFamily: style.headerFontFamily }}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateBlockText(idx, e.currentTarget.innerText)}
                          >
                            {block.text}
                          </h2>
                        );

                      case "heading2":
                        return (
                          <h3
                            key={idx}
                            className={`text-xl font-bold tracking-tight mt-6 mb-2.5 outline-none hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded p-1 -m-1 cursor-text focus:ring-2 focus:ring-[#185abd]/30 focus:bg-white dark:focus:bg-zinc-800/70 transition-colors duration-100 ${style.headerFontClass}`}
                            style={{ color: `#${style.docxPrimaryColor}`, fontFamily: style.headerFontFamily }}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateBlockText(idx, e.currentTarget.innerText)}
                          >
                            {block.text}
                          </h3>
                        );

                      case "heading3":
                        return (
                          <h4
                            key={idx}
                            className={`text-lg font-semibold mt-5 mb-2 outline-none hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded p-1 -m-1 cursor-text focus:ring-2 focus:ring-[#185abd]/30 focus:bg-white dark:focus:bg-zinc-800/70 transition-colors duration-100 ${style.headerFontClass}`}
                            style={{ color: `#${style.docxPrimaryColor}`, fontFamily: style.headerFontFamily }}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateBlockText(idx, e.currentTarget.innerText)}
                          >
                            {block.text}
                          </h4>
                        );

                      case "paragraph":
                        return (
                          <p 
                            key={idx} 
                            className={`${style.bodyFontClass} text-[14px] leading-relaxed mb-4 outline-none hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded p-1 -m-1 cursor-text focus:ring-2 focus:ring-[#185abd]/30 focus:bg-white dark:focus:bg-zinc-800/70 transition-colors duration-100 ${
                              style.justifyText ? "text-justify" : "text-left"
                            } ${style.textClass}`}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateBlockText(idx, e.currentTarget.innerText)}
                          >
                            {block.text}
                          </p>
                        );

                      case "bullet-list":
                        return (
                          <ul
                            key={idx}
                            className={`list-disc pl-6 mb-4 space-y-1.5 text-[14px] ${style.bodyFontClass} ${style.textClass}`}
                          >
                            {block.items.map((item, itemIdx) => (
                              <li
                                key={itemIdx}
                                className="outline-none hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded p-0.5 -m-0.5 cursor-text focus:ring-2 focus:ring-[#185abd]/30 focus:bg-white dark:focus:bg-zinc-800/70 transition-colors duration-100"
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => updateListItemText(idx, itemIdx, e.currentTarget.innerText)}
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        );

                      case "numbered-list":
                        return (
                          <ol
                            key={idx}
                            className={`list-decimal pl-6 mb-4 space-y-1.5 text-[14px] ${style.bodyFontClass} ${style.textClass}`}
                          >
                            {block.items.map((item, itemIdx) => (
                              <li
                                key={itemIdx}
                                className="outline-none hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded p-0.5 -m-0.5 cursor-text focus:ring-2 focus:ring-[#185abd]/30 focus:bg-white dark:focus:bg-zinc-800/70 transition-colors duration-100"
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => updateListItemText(idx, itemIdx, e.currentTarget.innerText)}
                              >
                                {item}
                              </li>
                            ))}
                          </ol>
                        );

                      case "quote":
                        return (
                          <div
                            key={idx}
                            className="border-l-4 pl-4 py-2 my-4 italic text-[14px] leading-relaxed transition-all outline-none hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded p-1 -m-1 cursor-text focus:ring-2 focus:ring-[#185abd]/30 focus:bg-white dark:focus:bg-zinc-800/70"
                            style={{
                              borderColor: `#${style.quoteBorderColor}`,
                              backgroundColor: style.quoteBgColor ? `#${style.quoteBgColor}` : "transparent",
                              color: `#${style.docxTextColor}`,
                              whiteSpace: "pre-wrap",
                            }}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateBlockText(idx, e.currentTarget.innerText)}
                          >
                            {block.text}
                          </div>
                        );

                      case "code":
                        return (
                          <div
                            key={idx}
                            className="p-4 my-4 font-mono text-xs rounded border overflow-x-auto leading-relaxed shadow-xs"
                            style={{
                              backgroundColor: `#${style.codeBgColor}`,
                              borderColor: `#${style.codeBorderColor}`,
                            }}
                          >
                            <pre className="text-zinc-800 dark:text-zinc-200">
                              <code
                                className="outline-none block hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded p-1 -m-1 cursor-text focus:ring-2 focus:ring-[#185abd]/30 focus:bg-white dark:focus:bg-zinc-800/70 transition-colors duration-100"
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => updateCodeBlockText(idx, e.currentTarget.innerText)}
                              >
                                {block.code}
                              </code>
                            </pre>
                          </div>
                        );

                      case "table":
                        return (
                          <div key={idx} className="overflow-x-auto my-6 border rounded border-zinc-200 dark:border-[#3F3F46]">
                            <table
                              className="w-full text-left text-xs border-collapse font-sans"
                              style={{ borderColor: `#${style.tableBorderColor}` }}
                            >
                              <thead>
                                <tr
                                  className="border-b dark:border-[#3F3F46]"
                                  style={{
                                    backgroundColor: `#${style.tableHeaderBg}`,
                                    borderColor: `#${style.tableBorderColor}`,
                                  }}
                                >
                                  {block.headers.map((header, hIdx) => (
                                    <th
                                      key={hIdx}
                                      className="p-3 font-semibold text-zinc-800 dark:text-zinc-200 outline-none hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-text focus:ring-2 focus:ring-[#185abd]/30 focus:bg-white dark:focus:bg-zinc-800/70 transition-colors duration-100"
                                      style={{ color: style.tableHeaderTextColor }}
                                      contentEditable
                                      suppressContentEditableWarning
                                      onBlur={(e) => updateTableHeaderText(idx, hIdx, e.currentTarget.innerText)}
                                    >
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {block.rows.map((row, rIdx) => {
                                  const isEven = rIdx % 2 === 0;
                                  const zebraBg =
                                    style.id !== "academic" && !isEven
                                      ? `#${style.codeBgColor}`
                                      : "transparent";
                                  return (
                                    <tr
                                      key={rIdx}
                                      className="border-b last:border-b-0 dark:border-[#3F3F46]"
                                      style={{
                                        backgroundColor: zebraBg,
                                        borderColor: `#${style.tableBorderColor}`,
                                      }}
                                    >
                                      {row.map((cell, cIdx) => (
                                        <td
                                          key={cIdx}
                                          className="p-3 text-zinc-600 dark:text-zinc-300 outline-none hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-text focus:ring-2 focus:ring-[#185abd]/30 focus:bg-white dark:focus:bg-zinc-800/70 transition-colors duration-100"
                                          contentEditable
                                          suppressContentEditableWarning
                                          onBlur={(e) => updateTableCellText(idx, rIdx, cIdx, e.currentTarget.innerText)}
                                        >
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );

                      default:
                        return null;
                    }
                  })}
                </div>

                {/* Footer simulation */}
                {settings.includePageNumbers && (
                  <div className="border-t border-zinc-200 dark:border-[#3F3F46] mt-8 pt-2 flex justify-between items-center text-[9px] font-sans text-zinc-400 tracking-wider">
                    <span>Wordify - Công cụ xuất bản</span>
                    <span>Trang 1 trên 1</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* 5. Word Blue Status Bar (Bottom) */}
        <footer className="bg-[#185abd] text-white h-7 shrink-0 flex items-center justify-between px-3 text-[11px] font-medium select-none z-10">
          <div className="flex items-center gap-3">
            <span className="hover:bg-white/10 px-2 py-0.5 rounded-xs cursor-default">
              Trang 1 trên 1
            </span>
            <span className="opacity-40">|</span>
            <span className="hover:bg-white/10 px-2 py-0.5 rounded-xs cursor-default">
              Số từ: {wordCount}
            </span>
            <span className="opacity-40 hidden sm:inline">|</span>
            <span className="hover:bg-white/10 px-2 py-0.5 rounded-xs cursor-default hidden sm:flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Tiếng Việt
            </span>
            <span className="opacity-40">|</span>
            <span className="text-blue-200">Giả lập Word Online</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="opacity-40">|</span>
            {/* Zoom slider control */}
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="50"
                max="150"
                value={zoom}
                onChange={(e) => {
                  setZoom(Number(e.target.value));
                }}
                className="w-16 md:w-24 accent-white bg-white/20 hover:bg-white/30 h-1 rounded-lg cursor-pointer"
              />
              <span className="w-8 text-right font-mono">{zoom}%</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};
export default WordSimulatorModal;
