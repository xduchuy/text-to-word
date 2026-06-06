import React, { useState, useEffect, useRef } from "react";
import type { Block } from "../utils/parser";
import { blocksToMarkdown, mdToHtmlInline, htmlToMdInline } from "../utils/parser";
import type { DocumentStyle, PageSettings } from "../utils/styles";
import { marginPresets } from "../utils/styles";
import {
  X, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Download, Search, HelpCircle, Check,
  Globe, Share2, Undo2, Redo2, Type, RefreshCw
} from "lucide-react";
import { playClickSound } from "../utils/sound";

interface EditableBlockProps {
  tagName: string;
  className: string;
  style?: React.CSSProperties;
  text: string;
  onSave: (newMd: string) => void;
  "data-block-idx": number;
  "data-item-idx"?: number;
  "data-row-idx"?: number;
  "data-cell-idx"?: number;
  "data-is-header"?: boolean;
  isCode?: boolean;
}

const EditableBlock: React.FC<EditableBlockProps> = ({
  tagName,
  className,
  style,
  text,
  onSave,
  "data-block-idx": blockIdx,
  "data-item-idx": itemIdx,
  "data-row-idx": rowIdx,
  "data-cell-idx": cellIdx,
  "data-is-header": isHeader,
  isCode = false,
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const lastHtmlRef = useRef<string>("");

  const html = isCode ? text : mdToHtmlInline(text);

  useEffect(() => {
    if (ref.current) {
      if (isCode) {
        if (ref.current.innerText !== text && lastHtmlRef.current !== text) {
          ref.current.innerText = text;
          lastHtmlRef.current = text;
        }
      } else {
        if (ref.current.innerHTML !== html && lastHtmlRef.current !== html) {
          ref.current.innerHTML = html;
          lastHtmlRef.current = html;
        }
      }
    }
  }, [html, text, isCode]);

  const handleBlur = () => {
    if (ref.current) {
      if (isCode) {
        const currentText = ref.current.innerText;
        if (currentText === lastHtmlRef.current) return;
        lastHtmlRef.current = currentText;
        onSave(currentText);
      } else {
        const currentHtml = ref.current.innerHTML;
        if (currentHtml === lastHtmlRef.current) return;
        lastHtmlRef.current = currentHtml;
        const md = htmlToMdInline(currentHtml);
        onSave(md);
      }
    }
  };

  const Tag = tagName as any;

  return (
    <Tag
      ref={ref}
      className={className}
      style={style}
      contentEditable
      suppressContentEditableWarning
      data-block-idx={blockIdx}
      data-item-idx={itemIdx}
      data-row-idx={rowIdx}
      data-cell-idx={cellIdx}
      data-is-header={isHeader}
      onBlur={handleBlur}
      dangerouslySetInnerHTML={isCode ? undefined : { __html: html }}
    >
      {isCode ? text : undefined}
    </Tag>
  );
};

interface WordSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: Block[];
  style: DocumentStyle;
  settings: PageSettings;
  onDownload: () => void;
  onChange: (val: string) => void;
  onStyleChange: (style: DocumentStyle) => void;
  onSettingsChange: (settings: PageSettings) => void;
}

export const WordSimulatorModal: React.FC<WordSimulatorModalProps> = ({
  isOpen,
  onClose,
  blocks,
  style,
  settings,
  onDownload,
  onChange,
  onStyleChange,
  onSettingsChange,
}) => {
  const [activeTab, setActiveTab] = useState<"home" | "insert" | "layout" | "view">("home");
  const [zoom, setZoom] = useState<number>(100);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);

  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState("11");

  const savedRangeRef = useRef<Range | null>(null);
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      
      // Auto-detect font size at selection to update the displayed dropdown text
      let parentNode = sel.anchorNode;
      if (parentNode) {
        if (parentNode.nodeType !== Node.ELEMENT_NODE) {
          parentNode = parentNode.parentNode;
        }
        if (parentNode instanceof HTMLElement) {
          const fontEl = parentNode.closest("font");
          if (fontEl) {
            const sizeAttr = fontEl.getAttribute("size");
            if (sizeAttr) {
              const sizeMap: Record<string, string> = {
                "1": "10",
                "2": "10",
                "3": "11",
                "4": "12",
                "5": "14",
                "6": "18",
                "7": "24"
              };
              setCurrentFontSize(sizeMap[sizeAttr] || "11");
            }
          } else {
            setCurrentFontSize("11");
          }
        }
      }
    }
  };

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

  useEffect(() => {
    if (isOpen) {
      try {
        document.execCommand("styleWithCSS", false, "false");
      } catch (e) {
        console.warn("styleWithCSS not supported", e);
      }
    }
  }, [isOpen]);

  const syncActiveElement = () => {
    const activeEl = document.activeElement;
    if (!activeEl || !(activeEl instanceof HTMLElement)) return;

    // Check if the active element is contenteditable
    const editable = activeEl.closest('[contenteditable="true"]');
    if (!editable || !(editable instanceof HTMLElement)) return;

    const blockIdxAttr = editable.getAttribute("data-block-idx");
    if (blockIdxAttr === null) return;
    const blockIdx = parseInt(blockIdxAttr, 10);

    const html = editable.innerHTML;
    const md = htmlToMdInline(html);

    const itemIdxAttr = editable.getAttribute("data-item-idx");
    const rowIdxAttr = editable.getAttribute("data-row-idx");
    const cellIdxAttr = editable.getAttribute("data-cell-idx");
    const isHeader = editable.getAttribute("data-is-header") === "true";

    if (itemIdxAttr !== null) {
      const itemIdx = parseInt(itemIdxAttr, 10);
      updateListItemText(blockIdx, itemIdx, md);
    } else if (rowIdxAttr !== null && cellIdxAttr !== null) {
      const rowIdx = parseInt(rowIdxAttr, 10);
      const cellIdx = parseInt(cellIdxAttr, 10);
      updateTableCellText(blockIdx, rowIdx, cellIdx, md);
    } else if (isHeader && cellIdxAttr !== null) {
      const cellIdx = parseInt(cellIdxAttr, 10);
      updateTableHeaderText(blockIdx, cellIdx, md);
    } else {
      // Regular paragraph/heading/quote
      if (blocks[blockIdx]) {
        if (blocks[blockIdx].type === "code") {
          updateCodeBlockText(blockIdx, editable.innerText);
        } else {
          updateBlockText(blockIdx, md);
        }
      }
    }
  };

  if (!isOpen) return null;

  const marginPreset = marginPresets[settings.margins];
  const isLandscape = settings.orientation === "landscape";

  // Calculate word count
  const allText = blocks.map(b => "text" in b ? b.text : "code" in b ? b.code : "").join(" ");
  const wordCount = allText.trim() === "" ? 0 : allText.trim().split(/\s+/).length;

  const handleDownloadClick = () => {
    playClickSound();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
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
                if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
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
              <button 
                onClick={() => {
                  playClickSound();
                  document.execCommand("undo");
                }} 
                className="p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-[#3F3F46] text-zinc-500 dark:text-zinc-300 cursor-pointer"
                title="Hoàn tác (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => {
                  playClickSound();
                  document.execCommand("redo");
                }} 
                className="p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-[#3F3F46] text-zinc-500 dark:text-zinc-300 cursor-pointer"
                title="Làm lại (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tab-specific controls rendering */}
            {activeTab === "home" && (
              <>
                {/* Font Name Selector */}
                <div className="flex items-center gap-1 bg-zinc-50 dark:bg-[#1E1E21] border border-zinc-200 dark:border-[#3F3F46] rounded px-1.5 py-0.5 text-xs font-mono text-zinc-800 dark:text-zinc-100">
                  <Type className="w-3 h-3 text-zinc-400" />
                  <select
                    value={style.docxFont}
                    onChange={(e) => {
                      const selectedFont = e.target.value;
                      playClickSound();
                      let bodyFontFamily = "sans-serif";
                      let headerFontFamily = "sans-serif";
                      if (selectedFont === "Calibri") {
                        bodyFontFamily = "Calibri, Arial, sans-serif";
                        headerFontFamily = "Calibri, Arial, sans-serif";
                      } else if (selectedFont === "Times New Roman") {
                        bodyFontFamily = "'Times New Roman', Times, Georgia, serif";
                        headerFontFamily = "'Times New Roman', Times, Georgia, serif";
                      } else if (selectedFont === "Arial") {
                        bodyFontFamily = "Arial, sans-serif";
                        headerFontFamily = "Arial, sans-serif";
                      } else if (selectedFont === "Georgia") {
                        bodyFontFamily = "Georgia, serif";
                        headerFontFamily = "'Playfair Display', Georgia, serif";
                      } else if (selectedFont === "Consolas") {
                        bodyFontFamily = "'Fira Code', 'Courier New', Courier, monospace";
                        headerFontFamily = "'Fira Code', 'Courier New', Courier, monospace";
                      } else if (selectedFont === "Courier New") {
                        bodyFontFamily = "'Space Mono', monospace";
                        headerFontFamily = "Georgia, serif";
                      }
                      onStyleChange({
                        ...style,
                        docxFont: selectedFont,
                        bodyFontFamily,
                        headerFontFamily,
                      });
                    }}
                    className="bg-transparent font-bold border-none outline-none cursor-pointer pr-1"
                  >
                    <option value="Calibri" className="dark:bg-[#1E1E21]">Calibri</option>
                    <option value="Times New Roman" className="dark:bg-[#1E1E21]">Times New Roman</option>
                    <option value="Arial" className="dark:bg-[#1E1E21]">Arial</option>
                    <option value="Georgia" className="dark:bg-[#1E1E21]">Georgia</option>
                    <option value="Consolas" className="dark:bg-[#1E1E21]">Consolas</option>
                    <option value="Courier New" className="dark:bg-[#1E1E21]">Courier New</option>
                  </select>
                </div>
                
                {/* Font Size Selector (Custom Dropdown to prevent selection blur) */}
                <div className="relative">
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      playClickSound();
                      setShowFontSizeDropdown(!showFontSizeDropdown);
                    }}
                    className="flex items-center gap-1.5 bg-zinc-50 dark:bg-[#1E1E21] border border-zinc-200 dark:border-[#3F3F46] hover:bg-zinc-100 dark:hover:bg-[#2D2D30] rounded px-2 py-0.5 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-100 cursor-pointer min-w-[42px] justify-between h-[26px]"
                    title="Cỡ chữ"
                  >
                    <span>{currentFontSize}</span>
                    <span className="text-[9px] text-zinc-400 select-none">▼</span>
                  </button>
                  
                  {showFontSizeDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-30" 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowFontSizeDropdown(false)}
                      />
                      <div className="absolute left-0 mt-1 w-20 bg-white dark:bg-[#27272A] border border-zinc-200 dark:border-[#3F3F46] rounded shadow-lg z-40 py-1 max-h-48 overflow-y-auto">
                        {[
                          { label: "10", value: "2" },
                          { label: "11", value: "3" },
                          { label: "12", value: "4" },
                          { label: "14", value: "5" },
                          { label: "18", value: "6" },
                          { label: "24", value: "7" }
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onMouseDown={(e) => {
                              e.preventDefault(); // Prevents losing focus from the contentEditable element!
                            }}
                            onClick={() => {
                              playClickSound();
                              
                              if (savedRangeRef.current) {
                                const sel = window.getSelection();
                                if (sel) {
                                  sel.removeAllRanges();
                                  sel.addRange(savedRangeRef.current);
                                }
                              }
                              
                              // Apply the format
                              document.execCommand("fontSize", false, opt.value);
                              
                              // Manually save the DOM edits back to the React state immediately,
                              // BEFORE setting the states that trigger a re-render.
                              syncActiveElement();
                              
                              setCurrentFontSize(opt.label);
                              setShowFontSizeDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-1 text-xs hover:bg-[#185abd] hover:text-white cursor-pointer font-mono ${
                              currentFontSize === opt.label 
                                ? "bg-zinc-100 dark:bg-[#3F3F46] font-bold text-[#185abd] dark:text-blue-300" 
                                : "text-zinc-800 dark:text-zinc-100"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <span className="w-px h-5 bg-zinc-200 dark:bg-[#3F3F46]" />

                {/* Bold, Italic, Underline */}
                <div className="flex items-center gap-0.5">
                  <button 
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      playClickSound();
                      document.execCommand("bold");
                    }} 
                    className="p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-[#3F3F46] text-zinc-700 dark:text-zinc-200 font-black cursor-pointer"
                    title="Chữ đậm (Ctrl+B)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      playClickSound();
                      document.execCommand("italic");
                    }} 
                    className="p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-[#3F3F46] text-zinc-700 dark:text-zinc-200 italic cursor-pointer"
                    title="Chữ nghiêng (Ctrl+I)"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      playClickSound();
                      document.execCommand("underline");
                    }} 
                    className="p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-[#3F3F46] text-zinc-700 dark:text-zinc-200 underline cursor-pointer"
                    title="Gạch chân (Ctrl+U)"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="w-px h-5 bg-zinc-200 dark:bg-[#3F3F46]" />

                {/* Lists & Alignment */}
                <div className="flex items-center gap-0.5">
                  <button 
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      playClickSound();
                      document.execCommand("insertUnorderedList");
                    }} 
                    className="p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-[#3F3F46] text-zinc-500 dark:text-zinc-300 cursor-pointer"
                    title="Danh sách dấu đầu dòng"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      playClickSound();
                      document.execCommand("insertOrderedList");
                    }} 
                    className="p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-[#3F3F46] text-zinc-500 dark:text-zinc-300 cursor-pointer"
                    title="Danh sách số"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-px h-4 bg-zinc-100 dark:bg-[#3F3F46] mx-1" />
                  <button 
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      playClickSound();
                      onStyleChange({ ...style, justifyText: false });
                      document.execCommand("justifyLeft");
                    }} 
                    className={`p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-[#3F3F46] cursor-pointer ${!style.justifyText ? "bg-zinc-100 dark:bg-[#3F3F46] text-[#185abd]" : "text-zinc-500 dark:text-zinc-300"}`}
                    title="Canh trái"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      playClickSound();
                      document.execCommand("justifyCenter");
                    }} 
                    className="p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-[#3F3F46] text-zinc-500 dark:text-zinc-300 cursor-pointer"
                    title="Canh giữa"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      playClickSound();
                      document.execCommand("justifyRight");
                    }} 
                    className="p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-[#3F3F46] text-zinc-500 dark:text-zinc-300 cursor-pointer"
                    title="Canh phải"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      playClickSound();
                      onStyleChange({ ...style, justifyText: true });
                      document.execCommand("justifyFull");
                    }} 
                    className={`p-1 rounded-xs hover:bg-zinc-100 dark:hover:bg-[#3F3F46] cursor-pointer ${style.justifyText ? "bg-zinc-100 dark:bg-[#3F3F46] text-[#185abd]" : "text-zinc-500 dark:text-zinc-300"}`}
                    title="Canh đều hai bên"
                  >
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
                  <select
                    value={settings.pageSize}
                    onChange={(e) => {
                      playClickSound();
                      onSettingsChange({
                        ...settings,
                        pageSize: e.target.value as "letter" | "a4",
                      });
                    }}
                    className="bg-zinc-100 dark:bg-[#3E3E42] px-2 py-0.5 border border-zinc-200 dark:border-[#3F3F46] font-mono rounded font-bold uppercase cursor-pointer outline-none text-zinc-800 dark:text-zinc-100"
                  >
                    <option value="letter">LETTER</option>
                    <option value="a4">A4</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-zinc-500">Hướng:</span>
                  <select
                    value={settings.orientation}
                    onChange={(e) => {
                      playClickSound();
                      onSettingsChange({
                        ...settings,
                        orientation: e.target.value as "portrait" | "landscape",
                      });
                    }}
                    className="bg-zinc-100 dark:bg-[#3E3E42] px-2 py-0.5 border border-zinc-200 dark:border-[#3F3F46] font-mono rounded font-bold cursor-pointer outline-none text-zinc-800 dark:text-zinc-100"
                  >
                    <option value="portrait">Dọc</option>
                    <option value="landscape">Ngang</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-zinc-500">Lề:</span>
                  <select
                    value={settings.margins}
                    onChange={(e) => {
                      playClickSound();
                      onSettingsChange({
                        ...settings,
                        margins: e.target.value as "normal" | "narrow" | "wide",
                      });
                    }}
                    className="bg-zinc-100 dark:bg-[#3E3E42] px-2 py-0.5 border border-zinc-200 dark:border-[#3F3F46] font-mono rounded font-bold uppercase cursor-pointer outline-none text-zinc-800 dark:text-zinc-100"
                  >
                    <option value="normal">Normal</option>
                    <option value="narrow">Narrow</option>
                    <option value="wide">Wide</option>
                  </select>
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
                onMouseUp={saveSelection}
                onKeyUp={saveSelection}
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
                          <EditableBlock
                            tagName="h1"
                            className={`text-3xl font-extrabold tracking-tight pb-3 mb-6 border-b border-zinc-200 dark:border-[#3F3F46] outline-none hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded p-1 -m-1 cursor-text focus:ring-2 focus:ring-[#185abd]/30 focus:bg-white dark:focus:bg-zinc-800/70 transition-colors duration-100 ${
                              style.id === "academic" ? "text-center" : "text-left"
                            } ${style.headerFontClass}`}
                            style={{ color: `#${style.docxPrimaryColor}`, fontFamily: style.headerFontFamily }}
                            text={block.text}
                            onSave={(newMd) => updateBlockText(idx, newMd)}
                            data-block-idx={idx}
                          />
                        );

                      case "heading1":
                        return (
                          <EditableBlock
                            tagName="h2"
                            className={`text-2xl font-bold tracking-tight mt-8 mb-3 outline-none hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded p-1 -m-1 cursor-text focus:ring-2 focus:ring-[#185abd]/30 focus:bg-white dark:focus:bg-zinc-800/70 transition-colors duration-100 ${style.headerFontClass}`}
                            style={{ color: `#${style.docxPrimaryColor}`, fontFamily: style.headerFontFamily }}
                            text={block.text}
                            onSave={(newMd) => updateBlockText(idx, newMd)}
                            data-block-idx={idx}
                          />
                        );

                      case "heading2":
                        return (
                          <EditableBlock
                            tagName="h3"
                            className={`text-xl font-bold tracking-tight mt-6 mb-2.5 outline-none hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded p-1 -m-1 cursor-text focus:ring-2 focus:ring-[#185abd]/30 focus:bg-white dark:focus:bg-zinc-800/70 transition-colors duration-100 ${style.headerFontClass}`}
                            style={{ color: `#${style.docxPrimaryColor}`, fontFamily: style.headerFontFamily }}
                            text={block.text}
                            onSave={(newMd) => updateBlockText(idx, newMd)}
                            data-block-idx={idx}
                          />
                        );

                      case "heading3":
                        return (
                          <EditableBlock
                            tagName="h4"
                            className={`text-lg font-semibold mt-5 mb-2 outline-none hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded p-1 -m-1 cursor-text focus:ring-2 focus:ring-[#185abd]/30 focus:bg-white dark:focus:bg-zinc-800/70 transition-colors duration-100 ${style.headerFontClass}`}
                            style={{ color: `#${style.docxPrimaryColor}`, fontFamily: style.headerFontFamily }}
                            text={block.text}
                            onSave={(newMd) => updateBlockText(idx, newMd)}
                            data-block-idx={idx}
                          />
                        );

                      case "paragraph":
                        return (
                          <EditableBlock
                            tagName="p"
                            className={`${style.bodyFontClass} text-[14px] leading-relaxed mb-4 outline-none hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded p-1 -m-1 cursor-text focus:ring-2 focus:ring-[#185abd]/30 focus:bg-white dark:focus:bg-zinc-800/70 transition-colors duration-100 ${
                              style.justifyText ? "text-justify" : "text-left"
                            } ${style.textClass}`}
                            text={block.text}
                            onSave={(newMd) => updateBlockText(idx, newMd)}
                            data-block-idx={idx}
                          />
                        );

                      case "bullet-list":
                        return (
                          <ul
                            key={idx}
                            className={`list-disc pl-6 mb-4 space-y-1.5 text-[14px] ${style.bodyFontClass} ${style.textClass}`}
                          >
                            {block.items.map((item, itemIdx) => (
                              <EditableBlock
                                key={itemIdx}
                                tagName="li"
                                className="outline-none hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded p-0.5 -m-0.5 cursor-text focus:ring-2 focus:ring-[#185abd]/30 focus:bg-white dark:focus:bg-zinc-800/70 transition-colors duration-100"
                                text={item}
                                onSave={(newMd) => updateListItemText(idx, itemIdx, newMd)}
                                data-block-idx={idx}
                                data-item-idx={itemIdx}
                              />
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
                              <EditableBlock
                                key={itemIdx}
                                tagName="li"
                                className="outline-none hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded p-0.5 -m-0.5 cursor-text focus:ring-2 focus:ring-[#185abd]/30 focus:bg-white dark:focus:bg-zinc-800/70 transition-colors duration-100"
                                text={item}
                                onSave={(newMd) => updateListItemText(idx, itemIdx, newMd)}
                                data-block-idx={idx}
                                data-item-idx={itemIdx}
                              />
                            ))}
                          </ol>
                        );

                      case "quote":
                        return (
                          <EditableBlock
                            tagName="div"
                            className="border-l-4 pl-4 py-2 my-4 italic text-[14px] leading-relaxed transition-all outline-none hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded p-1 -m-1 cursor-text focus:ring-2 focus:ring-[#185abd]/30 focus:bg-white dark:focus:bg-zinc-800/70"
                            style={{
                              borderColor: `#${style.quoteBorderColor}`,
                              backgroundColor: style.quoteBgColor ? `#${style.quoteBgColor}` : "transparent",
                              color: `#${style.docxTextColor}`,
                              whiteSpace: "pre-wrap",
                            }}
                            text={block.text}
                            onSave={(newMd) => updateBlockText(idx, newMd)}
                            data-block-idx={idx}
                          />
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
                              <EditableBlock
                                tagName="code"
                                className="outline-none block hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded p-1 -m-1 cursor-text focus:ring-2 focus:ring-[#185abd]/30 focus:bg-white dark:focus:bg-zinc-800/70 transition-colors duration-100"
                                text={block.code}
                                isCode={true}
                                onSave={(newText) => updateCodeBlockText(idx, newText)}
                                data-block-idx={idx}
                              />
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
                                     <EditableBlock
                                       key={hIdx}
                                       tagName="th"
                                       className="p-3 font-semibold text-zinc-800 dark:text-zinc-200 outline-none hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-text focus:ring-2 focus:ring-[#185abd]/30 focus:bg-white dark:focus:bg-zinc-800/70 transition-colors duration-100"
                                       style={{ color: style.tableHeaderTextColor }}
                                       text={header}
                                       onSave={(newMd) => updateTableHeaderText(idx, hIdx, newMd)}
                                       data-block-idx={idx}
                                       data-cell-idx={hIdx}
                                       data-is-header={true}
                                     />
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
                                        <EditableBlock
                                          key={cIdx}
                                          tagName="td"
                                          className="p-3 text-zinc-600 dark:text-zinc-300 outline-none hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-text focus:ring-2 focus:ring-[#185abd]/30 focus:bg-white dark:focus:bg-zinc-800/70 transition-colors duration-100"
                                          text={cell}
                                          onSave={(newMd) => updateTableCellText(idx, rIdx, cIdx, newMd)}
                                          data-block-idx={idx}
                                          data-row-idx={rIdx}
                                          data-cell-idx={cIdx}
                                        />
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
