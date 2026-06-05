import React, { useRef, useState } from "react";
import { Copy, Check, Download, Trash2, Keyboard, FileUp, Clipboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EmptyState } from "./EmptyState";
import { playClickSound } from "../utils/sound";

interface EditorProps {
  text: string;
  onChange: (val: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ text, onChange }) => {
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

  const handleDownloadTxt = () => {
    playClickSound();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "draft-document.txt";
    link.click();
    URL.revokeObjectURL(url);
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

              {/* Download TXT */}
              <button
                onClick={handleDownloadTxt}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-bold border-2 border-ink-border rounded-lg shadow-[2px_2px_0px_var(--shadow-color)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none bg-white text-ink-black cursor-pointer transition-all duration-100"
                title="Tải tệp văn bản thô"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sao lưu</span>
              </button>

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
        className="relative flex-1 bg-paper-yellow"
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
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập hoặc dán nội dung văn bản hoặc markdown vào đây..."
            className="w-full h-full p-8 text-ink-black placeholder-zinc-500 bg-transparent border-0 outline-hidden focus:ring-0 resize-none font-mono text-sm leading-[31px] bg-notebook-lines overflow-y-auto selection:bg-accent-yellow"
          />
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
