import React, { useState } from "react";
import { documentStyles } from "../utils/styles";
import type { DocumentStyle, PageSettings } from "../utils/styles";
import { 
  FileOutput, Compass, Info, Plus, Trash2, Edit3, FileText, Printer 
} from "lucide-react";
import { playClickSound } from "../utils/sound";
import type { DocumentItem } from "../App";

interface SidebarProps {
  selectedStyle: DocumentStyle;
  onStyleSelect: (style: DocumentStyle) => void;
  settings: PageSettings;
  onSettingsChange: (settings: PageSettings) => void;
  onExport: () => void;
  disabled: boolean;
  
  // Document Management Props
  documents: DocumentItem[];
  activeDocId: string;
  onCreateDoc: () => void;
  onDeleteDoc: (id: string) => void;
  onRenameDoc: (id: string, newTitle: string) => void;
  onSwitchDoc: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedStyle,
  onStyleSelect,
  settings,
  onSettingsChange,
  onExport,
  disabled,
  documents,
  activeDocId,
  onCreateDoc,
  onDeleteDoc,
  onRenameDoc,
  onSwitchDoc,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<"docs" | "styles" | "settings">("docs");
  
  // Local renaming state
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const handleExport = async () => {
    playClickSound();
    setIsExporting(true);
    try {
      await onExport();
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    playClickSound();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    // Simple setTimeout to allow dropdown blur to render before triggering print
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const updateSetting = <K extends keyof PageSettings>(key: K, value: PageSettings[K]) => {
    if (key !== "headerText") {
      playClickSound();
    }
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  const startRenaming = (docId: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    setEditingDocId(docId);
    setEditingTitle(currentTitle);
  };

  const finishRenaming = (docId: string) => {
    onRenameDoc(docId, editingTitle);
    setEditingDocId(null);
  };

  const handleCustomStyleChange = <K extends keyof DocumentStyle>(key: K, value: DocumentStyle[K]) => {
    let bodyFontFamily = selectedStyle.bodyFontFamily;
    let headerFontFamily = selectedStyle.headerFontFamily;
    
    if (key === "docxFont") {
      const font = value as string;
      if (font === "Calibri") {
        bodyFontFamily = "Calibri, Arial, sans-serif";
        headerFontFamily = "Calibri, Arial, sans-serif";
      } else if (font === "Times New Roman") {
        bodyFontFamily = "'Times New Roman', Times, Georgia, serif";
        headerFontFamily = "'Times New Roman', Times, Georgia, serif";
      } else if (font === "Arial") {
        bodyFontFamily = "Arial, sans-serif";
        headerFontFamily = "Arial, sans-serif";
      } else if (font === "Georgia") {
        bodyFontFamily = "Georgia, serif";
        headerFontFamily = "'Playfair Display', Georgia, serif";
      } else if (font === "Consolas") {
        bodyFontFamily = "'Fira Code', 'Courier New', Courier, monospace";
        headerFontFamily = "'Fira Code', 'Courier New', Courier, monospace";
      } else if (font === "Courier New") {
        bodyFontFamily = "'Space Mono', monospace";
        headerFontFamily = "Georgia, serif";
      }
    }
    
    onStyleSelect({
      ...selectedStyle,
      id: "custom",
      name: "Tự thiết kế 🛠️",
      description: "Phong cách tài liệu tùy biến tự chọn phông chữ, giãn dòng và phối màu của riêng bạn.",
      [key]: value,
      ...(key === "docxFont" ? { bodyFontFamily, headerFontFamily } : {})
    });
  };

  return (
    <aside className="w-full lg:w-80 flex flex-col h-full bg-[#FAF9F5] border-r-0 lg:border-r-4 border-ink-border overflow-hidden p-5 transition-colors shrink-0 print:hidden">
      {/* Brand Logo & Title */}
      <div className="hidden lg:flex items-center gap-2.5 mb-5 pb-3 border-b-2 border-dashed border-ink-border/25">
        <div className="w-10 h-10 border-2 border-ink-border rounded-lg bg-[#1A1A1A] flex items-center justify-center shadow-[2px_2px_0px_var(--shadow-color)] text-white">
          <Compass className="w-5 h-5 animate-spin-slow" />
        </div>
        <div>
          <h1 className="font-heading font-black text-ink-black text-sm tracking-tight leading-none">
            Wordify.
          </h1>
          <span className="text-[10px] font-mono text-ink-light mt-1 block">
            Định dạng tài liệu tự động
          </span>
        </div>
      </div>

      {/* Brutalist Sidebar Tabs */}
      <div className="grid grid-cols-3 border-2 border-ink-border bg-white p-0.5 shadow-[2px_2px_0px_var(--shadow-color)] mb-5 select-none shrink-0">
        {(["docs", "styles", "settings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              playClickSound();
              setActiveTab(tab);
            }}
            className={`py-1.5 text-[9px] font-mono font-bold uppercase tracking-wide cursor-pointer transition-colors ${
              activeTab === tab
                ? "bg-ink-black text-white"
                : "text-ink-light hover:text-ink-black"
            }`}
          >
            {tab === "docs" ? "Tài liệu" : tab === "styles" ? "Giao diện" : "Thiết lập"}
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}
      <div className="flex-1 flex flex-col min-h-0">
        
        {/* Tab 1: Documents Manager */}
        {activeTab === "docs" && (
          <div className="flex flex-col h-full min-h-0">
            {/* Create Doc Button */}
            <button
              onClick={onCreateDoc}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 border-2 border-ink-border bg-accent-blue text-white font-mono font-bold text-xs shadow-[2px_2px_0px_var(--shadow-color)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer mb-4 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo tài liệu mới</span>
            </button>

            {/* Documents List */}
            <div className="space-y-2 overflow-y-auto flex-1 pr-1 select-none">
              {documents.map((doc) => {
                const isActive = doc.id === activeDocId;
                const isEditing = editingDocId === doc.id;

                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      if (!isActive && !isEditing) {
                        playClickSound();
                        onSwitchDoc(doc.id);
                      }
                    }}
                    className={`group flex items-center justify-between p-2.5 border-2 text-left transition-all duration-100 ${
                      isActive
                        ? "bg-white border-ink-border shadow-[2px_2px_0px_var(--shadow-color)]"
                        : "bg-[#F3F2EA] border-ink-border/30 hover:border-ink-border hover:bg-white cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0 pr-1">
                      <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-accent-blue" : "text-zinc-400"}`} />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() => finishRenaming(doc.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") finishRenaming(doc.id);
                          }}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-1 border border-ink-border font-mono text-xs focus:outline-hidden"
                        />
                      ) : (
                        <span className="font-mono text-xs text-ink-black font-bold truncate">
                          {doc.title}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    {!isEditing && (
                      <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => startRenaming(doc.id, doc.title, e)}
                          className="p-0.5 rounded-sm hover:bg-zinc-200 text-zinc-500 hover:text-ink-black cursor-pointer"
                          title="Đổi tên"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        {documents.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Bạn chắc chắn muốn xóa tài liệu "${doc.title}"?`)) {
                                onDeleteDoc(doc.id);
                              }
                            }}
                            className="p-0.5 rounded-sm hover:bg-red-100 text-zinc-500 hover:text-accent-red cursor-pointer"
                            title="Xóa tài liệu"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Style Selector & Creator */}
        {activeTab === "styles" && (
          <div className="space-y-5 overflow-y-auto pr-1 flex-1 min-h-0">
            {/* Presets List */}
            <div>
              <h3 className="text-[10px] font-mono font-bold text-ink-black tracking-wider uppercase mb-2 pl-1">
                Bộ mẫu định dạng sẵn
              </h3>
              <div className="grid gap-2 max-h-48 overflow-y-auto pr-1">
                {documentStyles.map((styleItem) => {
                  const isSelected = styleItem.id === selectedStyle.id;
                  return (
                    <button
                      key={styleItem.id}
                      onClick={() => {
                        playClickSound();
                        onStyleSelect(styleItem);
                      }}
                      className={`group flex items-center justify-between p-2 border-2 text-left cursor-pointer transition-all duration-100 ${
                        isSelected
                          ? "bg-accent-yellow/15 border-ink-border shadow-[2px_2px_0px_var(--shadow-color)]"
                          : "bg-white border-ink-border/30 hover:border-ink-border hover:shadow-[2px_2px_0px_var(--shadow-color)]"
                      }`}
                    >
                      <span className="font-mono font-bold text-xs text-ink-black">
                        {styleItem.name}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] font-mono font-bold text-accent-red">✓ DÙNG</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customizer Panel */}
            <div className="border-t-2 border-dashed border-ink-border/25 pt-4">
              <h3 className="text-[10px] font-mono font-bold text-ink-black tracking-wider uppercase mb-3 pl-1 flex items-center justify-between">
                <span>Tùy chỉnh Style 🛠️</span>
                {selectedStyle.id === "custom" && (
                  <span className="text-[8px] bg-emerald-500 text-white px-1 py-0.5 rounded font-mono uppercase tracking-wider">Đang chỉnh</span>
                )}
              </h3>
              
              <div className="space-y-3.5 text-xs">
                {/* Font Selector */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-ink-light mb-1">Font chữ tài liệu</label>
                  <select
                    value={selectedStyle.docxFont}
                    onChange={(e) => handleCustomStyleChange("docxFont", e.target.value)}
                    className="w-full px-2 py-1.5 border-2 border-ink-border font-mono text-xs bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="Calibri">Calibri</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Consolas">Consolas</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                </div>

                {/* Font Size Selector */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-ink-light mb-1">Cỡ chữ tài liệu</label>
                  <select
                    value={selectedStyle.docxFontSize}
                    onChange={(e) => handleCustomStyleChange("docxFontSize", parseInt(e.target.value, 10))}
                    className="w-full px-2 py-1.5 border-2 border-ink-border font-mono text-xs bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="20">10 pt (Nhỏ)</option>
                    <option value="22">11 pt (Mặc định)</option>
                    <option value="24">12 pt (Học thuật)</option>
                    <option value="28">14 pt (Lớn)</option>
                    <option value="32">16 pt (Rất lớn)</option>
                  </select>
                </div>

                {/* Primary Color Selector */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-ink-light mb-1">Màu chủ đạo (Tiêu đề)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { hex: "000000", label: "Đen" },
                      { hex: "1E3A8A", label: "Lam" },
                      { hex: "E24A32", label: "Đỏ" },
                      { hex: "059669", label: "Lục" },
                      { hex: "4F46E5", label: "Tím" },
                      { hex: "D97706", label: "Cam" }
                    ].map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => handleCustomStyleChange("docxPrimaryColor", col.hex)}
                        style={{ backgroundColor: `#${col.hex}` }}
                        className={`w-6 h-6 border-2 border-ink-border rounded-xs cursor-pointer hover:scale-110 transition-transform ${
                          selectedStyle.docxPrimaryColor === col.hex ? "ring-2 ring-accent-yellow scale-110" : ""
                        }`}
                        title={col.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Line Spacing */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-ink-light mb-1">Giãn dòng (Line spacing)</label>
                  <select
                    value={selectedStyle.docxLineSpacing}
                    onChange={(e) => handleCustomStyleChange("docxLineSpacing", parseInt(e.target.value, 10))}
                    className="w-full px-2 py-1.5 border-2 border-ink-border font-mono text-xs bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="240">1.0 (Single)</option>
                    <option value="276">1.15 (Default)</option>
                    <option value="288">1.2 (Sổ tay)</option>
                    <option value="360">1.5 (Học thuật)</option>
                    <option value="480">2.0 (Double)</option>
                  </select>
                </div>

                {/* Spacing After */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-ink-light mb-1">Khoảng cách đoạn (Spacing After)</label>
                  <select
                    value={selectedStyle.docxParaSpacingAfter}
                    onChange={(e) => handleCustomStyleChange("docxParaSpacingAfter", parseInt(e.target.value, 10))}
                    className="w-full px-2 py-1.5 border-2 border-ink-border font-mono text-xs bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="60">Hẹp (60 twips)</option>
                    <option value="120">Vừa phải (120 twips)</option>
                    <option value="180">Thoáng (180 twips)</option>
                    <option value="240">Rộng (240 twips)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Page Settings & Exporters */}
        {activeTab === "settings" && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1 min-h-0">
            <div className="space-y-3.5 text-xs">
              {/* Header Text Input */}
              <div>
                <label className="block text-ink-black font-mono font-bold mb-1">
                  Văn bản Header tùy chỉnh
                </label>
                <input
                  type="text"
                  value={settings.headerText}
                  onChange={(e) => updateSetting("headerText", e.target.value)}
                  placeholder="Ví dụ: Đề xuất dự án, Bản thảo V1"
                  className="w-full px-3 py-1.5 text-ink-black bg-white border-2 border-ink-border rounded-none focus:outline-hidden focus:bg-accent-yellow/5 font-mono text-xs shadow-[1px_1px_0px_var(--shadow-color)] placeholder:text-zinc-400"
                />
              </div>

              {/* Paper Size & Orientation Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-black font-mono font-bold mb-1">
                    Khổ giấy
                  </label>
                  <div className="grid grid-cols-2 border-2 border-ink-border bg-white p-0.5 shadow-[1px_1px_0px_var(--shadow-color)]">
                    {(["letter", "a4"] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => updateSetting("pageSize", size)}
                        className={`py-1 text-[9px] font-mono font-bold uppercase tracking-wide cursor-pointer transition-colors ${
                          settings.pageSize === size
                            ? "bg-ink-black text-white"
                            : "text-ink-light hover:text-ink-black"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-ink-black font-mono font-bold mb-1">
                    Chiều giấy
                  </label>
                  <div className="grid grid-cols-2 border-2 border-ink-border bg-white p-0.5 shadow-[1px_1px_0px_var(--shadow-color)]">
                    {(["portrait", "landscape"] as const).map((orient) => (
                      <button
                        key={orient}
                        onClick={() => updateSetting("orientation", orient)}
                        className={`py-1 text-[9px] font-mono font-bold cursor-pointer transition-colors ${
                          settings.orientation === orient
                            ? "bg-ink-black text-white"
                            : "text-ink-light hover:text-ink-black"
                        }`}
                      >
                        {orient === "portrait" ? "Dọc" : "Ngang"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Margins Selection */}
              <div>
                <label className="block text-ink-black font-mono font-bold mb-1">
                  Căn lề (Margins)
                </label>
                <div className="grid grid-cols-3 border-2 border-ink-border bg-white p-0.5 shadow-[1px_1px_0px_var(--shadow-color)]">
                  {(["normal", "narrow", "wide"] as const).map((margin) => (
                    <button
                      key={margin}
                      onClick={() => updateSetting("margins", margin)}
                      className={`py-1 text-[9px] font-mono font-bold cursor-pointer transition-colors ${
                        settings.margins === margin
                          ? "bg-ink-black text-white"
                          : "text-ink-light hover:text-ink-black"
                      }`}
                    >
                      {margin === "normal" ? "Thường" : margin === "narrow" ? "Hẹp" : "Rộng"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Include Page Numbers Switch */}
              <div className="flex items-center justify-between py-1">
                <span className="text-ink-black font-mono font-bold">
                  Đánh số trang
                </span>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.includePageNumbers}
                    onChange={(e) => updateSetting("includePageNumbers", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white border-2 border-ink-border rounded-none peer-focus:outline-hidden peer peer-checked:after:translate-x-full peer-checked:after:bg-accent-green after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-ink-black after:rounded-none after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-accent-green/20"></div>
                </label>
              </div>
            </div>

            {/* Action Buttons Group */}
            <div className="mt-4 pt-4 border-t-2 border-dashed border-ink-border/25 space-y-2">
              {/* Word Export Button */}
              <button
                onClick={handleExport}
                disabled={disabled || isExporting}
                className={`relative w-full flex items-center justify-center gap-2 py-2.5 px-4 border-2 border-ink-border font-mono font-bold text-xs select-none transition-all duration-100 cursor-pointer ${
                  disabled
                    ? "bg-zinc-200 text-zinc-400 border-zinc-300 cursor-not-allowed shadow-none"
                    : "bg-accent-green text-white shadow-[2px_2px_0px_var(--shadow-color)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                }`}
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Đang xuất...</span>
                  </>
                ) : (
                  <>
                    <FileOutput className="w-4 h-4" />
                    <span>Xuất file Word</span>
                  </>
                )}
              </button>

              {/* PDF & Print Button */}
              <button
                onClick={handlePrint}
                disabled={disabled}
                className={`relative w-full flex items-center justify-center gap-2 py-2.5 px-4 border-2 border-ink-border bg-white text-ink-black font-mono font-bold text-xs select-none transition-all duration-100 cursor-pointer ${
                  disabled
                    ? "opacity-50 cursor-not-allowed shadow-none"
                    : "shadow-[2px_2px_0px_var(--shadow-color)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                }`}
              >
                <Printer className="w-4 h-4 text-accent-red" />
                <span>In / Xuất PDF</span>
              </button>
            </div>

            {/* Small tips section */}
            <div className="flex gap-2 p-2.5 border-2 border-ink-border bg-[#FEF9C3] text-[9px] font-mono text-ink-black leading-normal shadow-[2px_2px_0px_var(--shadow-color)]">
              <Info className="w-4 h-4 shrink-0 text-accent-red" />
              <p>
                In/Xuất PDF sẽ kích hoạt hộp thoại In của hệ thống. Vui lòng chọn "Lưu dưới dạng PDF" (Save to PDF) để xuất tệp PDF hoàn chỉnh.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Footer / Guide Section at bottom */}
      <div className="mt-4 pt-4 border-t-2 border-dashed border-ink-border/25 shrink-0">
        {/* iOS PWA Installation Guide */}
        <div className="border-2 border-ink-border bg-white shadow-[2px_2px_0px_var(--shadow-color)] overflow-hidden">
          <button
            onClick={() => {
              playClickSound();
              setShowIosGuide(!showIosGuide);
            }}
            className="w-full flex items-center justify-between p-2 text-[9px] font-mono font-bold text-ink-black hover:bg-accent-yellow/10 transition-colors text-left select-none cursor-pointer"
          >
            <span>CÀI ĐẶT TRÊN IPHONE 📱</span>
            <span className="text-[10px]">{showIosGuide ? "▲" : "▼"}</span>
          </button>
          
          {showIosGuide && (
            <div className="p-2.5 border-t-2 border-dashed border-ink-border/20 text-[9px] font-mono text-ink-black leading-normal space-y-1.5 bg-[#FAF9F5]">
              <p>Để thêm **Wordify** vào màn hình chính iPhone:</p>
              <ol className="list-decimal pl-4 space-y-1 font-bold">
                <li>Mở trang này bằng <strong className="text-accent-blue">Safari</strong>.</li>
                <li>Nhấn biểu tượng **Chia sẻ** (Share) 📤 dưới cùng.</li>
                <li>Chọn **"Thêm vào MH chính"** (Add to Home Screen) 📲.</li>
                <li>Nhấn **"Thêm"** (Add) để hoàn tất.</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
