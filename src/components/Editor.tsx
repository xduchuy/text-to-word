import React, { useRef, useState } from "react";
import { Copy, Check, Trash2, Keyboard, FileUp, Clipboard, FileText, Bold, Italic, Underline, Link, Image, Table, Scissors, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EmptyState } from "./EmptyState";
import { playClickSound } from "../utils/sound";

interface EditorProps {
  text: string;
  onChange: (val: string) => void;
  onExport?: () => void;
}

export const Editor: React.FC<EditorProps> = ({ text, onChange, onExport }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate statistics
  const charCount = text.length;
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 225); // Average reading speed ~ 225 wpm

  // Keyboard Shortcuts handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.altKey && !e.ctrlKey) {
      if (e.key === "1") {
        e.preventDefault();
        insertAtCursor("# ");
      } else if (e.key === "2") {
        e.preventDefault();
        insertAtCursor("## ");
      } else if (e.key === "3") {
        e.preventDefault();
        insertAtCursor("### ");
      } else if (e.key === "b" || e.key === "l") {
        e.preventDefault();
        insertAtCursor("- ");
      } else if (e.key === "n") {
        e.preventDefault();
        insertAtCursor("1. ");
      } else if (e.key === "q") {
        e.preventDefault();
        insertAtCursor("> ");
      } else if (e.key === "c") {
        e.preventDefault();
        insertAtCursor("```\n\n```", 4);
      }
    }
  };

  const insertAtCursor = (markup: string, cursorOffset?: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;

    const before = currentText.substring(0, start);
    const after = currentText.substring(end);

    const newText = before + markup + after;
    onChange(newText);

    // Reposition cursor after inserting
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = cursorOffset !== undefined ? start + cursorOffset : start + markup.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const handleToolbarAction = (action: string) => {
    playClickSound();
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selected = currentText.substring(start, end);

    let prefix = "";
    let suffix = "";
    let placeholder = "";

    switch (action) {
      case "bold":
        prefix = "**";
        suffix = "**";
        placeholder = "chữ đậm";
        break;
      case "italic":
        prefix = "*";
        suffix = "*";
        placeholder = "chữ nghiêng";
        break;
      case "underline":
        prefix = "<u>";
        suffix = "</u>";
        placeholder = "gạch chân";
        break;
      case "link":
        prefix = "[";
        suffix = "](https://)";
        placeholder = "Tiêu đề liên kết";
        break;
      case "image":
        prefix = "![";
        suffix = "](https://images.unsplash.com/photo-1579546929518-9e396f3cc809)";
        placeholder = "Mô tả ảnh";
        break;
      case "table":
        prefix = "\n| Tiêu đề 1 | Tiêu đề 2 |\n|---|---|\n| Nội dung A | Nội dung B |\n";
        break;
      case "pagebreak":
        prefix = "\n---pagebreak---\n";
        break;
      case "toc":
        prefix = "\n[TOC]\n";
        break;
      default:
        break;
    }

    const replacement = prefix + (selected || placeholder) + suffix;
    const before = currentText.substring(0, start);
    const after = currentText.substring(end);
    
    onChange(before + replacement + after);

    setTimeout(() => {
      textarea.focus();
      if (selected) {
        textarea.setSelectionRange(start, start + replacement.length);
      } else {
        const placeholderStart = start + prefix.length;
        const placeholderEnd = placeholderStart + placeholder.length;
        textarea.setSelectionRange(placeholderStart, placeholderEnd);
      }
    }, 50);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "text/plain" || file.name.endsWith(".md") || file.name.endsWith(".txt"))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCopy = async () => {
    playClickSound();
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handlePaste = async () => {
    playClickSound();
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        onChange(clipboardText);
      }
    } catch (err) {
      console.error("Failed to paste", err);
      alert(
        "Không thể tự động đọc từ bộ nhớ tạm. Hãy nhấp chuột vào ô soạn thảo và dùng phím tắt Ctrl+V (hoặc chạm đè và chọn Dán) để nhập văn bản."
      );
    }
  };



  return (
    <div className="flex flex-col h-full bg-white border-t-0 lg:border-t-4 border-b-2 lg:border-b-4 border-x-0 lg:border-x-4 border-ink-border lg:rounded-lg shadow-none lg:shadow-[4px_4px_0px_var(--shadow-color)] overflow-hidden transition-all duration-300">
      {/* Editor Header Actions */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#FAF9F5] border-b-2 border-ink-border">
        <div className="flex items-center gap-3">
          {/* macOS window dots */}
          <div className="flex gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-ink-border" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-ink-border" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-ink-border" />
          </div>
          
          {text.length > 0 && (
            <span className="text-[10px] font-mono bg-accent-yellow text-ink-black px-1.5 py-0.5 border border-ink-border font-bold rotate-1">
              Định dạng tức thời
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Paste Button */}
          <button
            onClick={handlePaste}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-bold border-2 border-ink-border rounded-lg bg-accent-yellow text-ink-black shadow-[2px_2px_0px_var(--shadow-color)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer transition-all duration-100"
            title="Dán từ bộ nhớ tạm"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Dán</span>
          </button>

          {text.length > 0 && (
            <>
              {/* Keyboard Shortcuts Trigger */}
              <button
                onClick={() => {
                  playClickSound();
                  setShowShortcuts(!showShortcuts);
                }}
                className="p-1.5 border-2 border-ink-border rounded-lg shadow-[2px_2px_0px_var(--shadow-color)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none bg-white text-ink-black cursor-pointer transition-all duration-100"
                title="Phím tắt soạn thảo"
              >
                <Keyboard className="w-4 h-4" />
              </button>

              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-bold border-2 border-ink-border rounded-lg shadow-[2px_2px_0px_var(--shadow-color)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none bg-white text-ink-black cursor-pointer transition-all duration-100"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>



              {/* Export DOCX */}
              {onExport && (
                <button
                  onClick={onExport}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-bold border-2 border-ink-border rounded-lg bg-accent-green text-white shadow-[2px_2px_0px_var(--shadow-color)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer transition-all duration-100"
                  title="Xuất bản tài liệu Word (.docx)"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Xuất .DOCX</span>
                </button>
              )}

              {/* Clear Button */}
              <button
                onClick={() => {
                  playClickSound();
                  if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ văn bản?")) {
                    onChange("");
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-bold border-2 border-ink-border rounded-lg shadow-[2px_2px_0px_var(--shadow-color)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none bg-accent-red text-white cursor-pointer transition-all duration-100"
                title="Xóa màn hình soạn thảo"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xóa</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts List Overlay */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#FEF9C3]/50 border-b-2 border-ink-border overflow-hidden text-xs text-ink-black"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 font-mono font-semibold">
              <div><kbd className="px-1.5 py-0.5 border-2 border-ink-border bg-white rounded shadow-[1px_1px_0px_var(--shadow-color)] mr-1.5">Alt + 1</kbd> H1</div>
              <div><kbd className="px-1.5 py-0.5 border-2 border-ink-border bg-white rounded shadow-[1px_1px_0px_var(--shadow-color)] mr-1.5">Alt + 2</kbd> H2</div>
              <div><kbd className="px-1.5 py-0.5 border-2 border-ink-border bg-white rounded shadow-[1px_1px_0px_var(--shadow-color)] mr-1.5">Alt + 3</kbd> H3</div>
              <div><kbd className="px-1.5 py-0.5 border-2 border-ink-border bg-white rounded shadow-[1px_1px_0px_var(--shadow-color)] mr-1.5">Alt + Q</kbd> Quote</div>
              <div><kbd className="px-1.5 py-0.5 border-2 border-ink-border bg-white rounded shadow-[1px_1px_0px_var(--shadow-color)] mr-1.5">Alt + B</kbd> Bullets</div>
              <div><kbd className="px-1.5 py-0.5 border-2 border-ink-border bg-white rounded shadow-[1px_1px_0px_var(--shadow-color)] mr-1.5">Alt + N</kbd> Numbers</div>
              <div><kbd className="px-1.5 py-0.5 border-2 border-ink-border bg-white rounded shadow-[1px_1px_0px_var(--shadow-color)] mr-1.5">Alt + C</kbd> Code Block</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Body */}
      <div
        className="relative flex-1 bg-paper-yellow flex flex-col"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-accent-blue/10 border-4 border-dashed border-accent-blue rounded-b-lg z-50 flex flex-col items-center justify-center pointer-events-none"
            >
              <div className="flex flex-col items-center bg-white p-6 border-4 border-ink-border shadow-[4px_4px_0px_var(--shadow-color)] scale-105">
                <FileUp className="w-10 h-10 text-accent-blue mb-3 animate-bounce" />
                <p className="font-mono font-bold text-ink-black text-sm">
                  Thả tệp tin vào đây để nhập (.txt, .md)
                </p>
                <p className="text-xs font-mono text-ink-light mt-1">
                  Hệ thống sẽ ghi đè lên văn bản hiện tại
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {text.length === 0 ? (
          <div className="h-full overflow-y-auto py-8">
            <EmptyState onSelectTemplate={onChange} />
          </div>
        ) : (
          <>
            {/* Quick Markdown Formatting Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-[#FAF9F5] border-b-2 border-ink-border shrink-0 select-none">
              <button
                onClick={() => handleToolbarAction("bold")}
                className="p-1.5 hover:bg-zinc-200 rounded text-ink-black cursor-pointer transition-colors"
                title="Chữ đậm"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleToolbarAction("italic")}
                className="p-1.5 hover:bg-zinc-200 rounded text-ink-black cursor-pointer transition-colors"
                title="Chữ nghiêng"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleToolbarAction("underline")}
                className="p-1.5 hover:bg-zinc-200 rounded text-ink-black cursor-pointer transition-colors"
                title="Gạch chân HTML"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              
              <span className="w-px h-4 bg-zinc-300 mx-1" />
              
              <button
                onClick={() => handleToolbarAction("link")}
                className="p-1.5 hover:bg-zinc-200 rounded text-ink-black cursor-pointer transition-colors"
                title="Chèn liên kết"
              >
                <Link className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleToolbarAction("image")}
                className="p-1.5 hover:bg-zinc-200 rounded text-ink-black cursor-pointer transition-colors"
                title="Chèn ảnh"
              >
                <Image className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleToolbarAction("table")}
                className="p-1.5 hover:bg-zinc-200 rounded text-ink-black cursor-pointer transition-colors"
                title="Chèn bảng"
              >
                <Table className="w-3.5 h-3.5" />
              </button>
              
              <span className="w-px h-4 bg-zinc-300 mx-1" />

              <button
                onClick={() => handleToolbarAction("pagebreak")}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono font-bold bg-[#FAF9F5] border border-ink-border hover:bg-zinc-200 rounded text-ink-black cursor-pointer transition-colors"
                title="Chèn điểm Ngắt trang (Page Break)"
              >
                <Scissors className="w-3 h-3 text-accent-red" />
                <span>Ngắt trang</span>
              </button>
              <button
                onClick={() => handleToolbarAction("toc")}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono font-bold bg-[#FAF9F5] border border-ink-border hover:bg-zinc-200 rounded text-ink-black cursor-pointer transition-colors"
                title="Chèn Mục lục tự động (TOC)"
              >
                <List className="w-3 h-3 text-accent-blue" />
                <span>Mục lục [TOC]</span>
              </button>
            </div>
            
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập hoặc dán nội dung văn bản hoặc markdown vào đây..."
              className="flex-1 w-full p-8 text-ink-black placeholder-zinc-500 bg-transparent border-0 outline-hidden focus:ring-0 resize-none font-mono text-sm leading-[31px] bg-notebook-lines overflow-y-auto selection:bg-accent-yellow"
            />
          </>
        )}
      </div>

      {/* Editor Footer / Info stats */}
      {text.length > 0 && (
        <div className="flex justify-between items-center px-4 py-2.5 bg-[#FAF9F5] border-t-2 border-ink-border text-[11px] font-mono font-bold text-ink-black">
          <div className="flex items-center gap-3">
            <span>{charCount} ký tự</span>
            <span className="w-1.5 h-1.5 bg-ink-black" />
            <span>{wordCount} từ</span>
          </div>
          <div className="flex items-center gap-1">
            <span>~{readingTime} phút đọc ⏱️</span>
          </div>
        </div>
      )}
    </div>
  );
};
export default Editor;
