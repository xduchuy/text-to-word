import React, { useState } from "react";
import { documentStyles } from "../utils/styles";
import type { DocumentStyle, PageSettings } from "../utils/styles";
import { FileOutput, Settings, Compass, Info } from "lucide-react";
import { playClickSound } from "../utils/sound";

interface SidebarProps {
  selectedStyle: DocumentStyle;
  onStyleSelect: (style: DocumentStyle) => void;
  settings: PageSettings;
  onSettingsChange: (settings: PageSettings) => void;
  onExport: () => void;
  disabled: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedStyle,
  onStyleSelect,
  settings,
  onSettingsChange,
  onExport,
  disabled,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

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

  const updateSetting = <K extends keyof PageSettings>(key: K, value: PageSettings[K]) => {
    if (key !== "headerText") {
      playClickSound();
    }
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <aside className="w-full lg:w-80 flex flex-col h-full bg-[#FAF9F5] border-r-0 lg:border-r-4 border-ink-border overflow-y-auto p-5 transition-colors shrink-0">
      {/* Brand Logo & Title */}
      <div className="hidden lg:flex items-center gap-2.5 mb-7 pb-4 border-b-2 border-dashed border-ink-border/25">
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

      {/* Preset Style Selector */}
      <div className="mb-6 flex-1">
        <h2 className="text-xs font-mono font-bold text-ink-black tracking-wider uppercase mb-3 pl-1">
          Kiểu tài liệu 🎨
        </h2>
        <div className="grid gap-2.5">
          {documentStyles.map((styleItem) => {
            const isSelected = styleItem.id === selectedStyle.id;
            return (
              <button
                key={styleItem.id}
                onClick={() => {
                  playClickSound();
                  onStyleSelect(styleItem);
                }}
                className={`group flex flex-col items-start p-3 border-2 text-left cursor-pointer transition-all duration-100 ${
                  isSelected
                    ? "bg-accent-yellow/15 border-ink-border shadow-[3px_3px_0px_var(--shadow-color)] translate-x-[-1px] translate-y-[-1px]"
                    : "bg-white border-ink-border/40 hover:border-ink-border hover:shadow-[3px_3px_0px_var(--shadow-color)] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`font-mono font-bold text-xs transition-colors ${
                    isSelected 
                      ? "text-ink-black bg-accent-yellow px-1 py-0.5" 
                      : "text-ink-black"
                  }`}>
                    {styleItem.name}
                  </span>
                  
                  {isSelected && (
                    <span className="text-[10px] font-mono font-bold text-accent-red">✓ DÙNG</span>
                  )}
                </div>
                <p className="text-[10px] font-mono text-ink-light mt-1 leading-normal line-clamp-2">
                  {styleItem.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Document Properties & Settings */}
      <div className="border-t-2 border-dashed border-ink-border/25 pt-5 mt-auto">
        <h2 className="text-xs font-mono font-bold text-ink-black tracking-wider uppercase mb-4 flex items-center gap-1.5 pl-1">
          <Settings className="w-3.5 h-3.5" />
          <span>Thiết lập trang</span>
        </h2>

        <div className="space-y-4 text-xs">
          {/* Header Text Input */}
          <div>
            <label className="block text-ink-black font-mono font-bold mb-1.5">
              Văn bản Header tùy chỉnh
            </label>
            <input
              type="text"
              value={settings.headerText}
              onChange={(e) => updateSetting("headerText", e.target.value)}
              placeholder="Ví dụ: Đề xuất dự án, Bản thảo V1"
              className="w-full px-3 py-2 text-ink-black bg-white border-2 border-ink-border rounded-none focus:outline-hidden focus:bg-accent-yellow/5 font-mono text-xs shadow-[1px_1px_0px_var(--shadow-color)] placeholder:text-zinc-400"
            />
          </div>

          {/* Paper Size & Orientation Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-ink-black font-mono font-bold mb-1.5">
                Khổ giấy
              </label>
              <div className="grid grid-cols-2 border-2 border-ink-border bg-white p-0.5 shadow-[1px_1px_0px_var(--shadow-color)]">
                {(["letter", "a4"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSetting("pageSize", size)}
                    className={`py-1 text-[10px] font-mono font-bold uppercase tracking-wide cursor-pointer transition-colors ${
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
              <label className="block text-ink-black font-mono font-bold mb-1.5">
                Chiều giấy
              </label>
              <div className="grid grid-cols-2 border-2 border-ink-border bg-white p-0.5 shadow-[1px_1px_0px_var(--shadow-color)]">
                {(["portrait", "landscape"] as const).map((orient) => (
                  <button
                    key={orient}
                    onClick={() => updateSetting("orientation", orient)}
                    className={`py-1 text-[10px] font-mono font-bold cursor-pointer transition-colors ${
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
            <label className="block text-ink-black font-mono font-bold mb-1.5">
              Căn lề (Margins)
            </label>
            <div className="grid grid-cols-3 border-2 border-ink-border bg-white p-0.5 shadow-[1px_1px_0px_var(--shadow-color)]">
              {(["normal", "narrow", "wide"] as const).map((margin) => (
                <button
                  key={margin}
                  onClick={() => updateSetting("margins", margin)}
                  className={`py-1 text-[10px] font-mono font-bold cursor-pointer transition-colors ${
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
              Đánh số thứ tự trang
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
      </div>

      {/* Export Action Button */}
      <div className="mt-6 pt-4 border-t-2 border-dashed border-ink-border/25">
        <button
          onClick={handleExport}
          disabled={disabled || isExporting}
          className={`relative w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-ink-border font-mono font-bold text-sm select-none transition-all duration-100 cursor-pointer ${
            disabled
              ? "bg-zinc-200 text-zinc-400 border-zinc-300 cursor-not-allowed shadow-none"
              : "bg-accent-green text-white shadow-[4px_4px_0px_var(--shadow-color)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_var(--shadow-color)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          }`}
        >
          {isExporting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Đang xuất Word...</span>
            </>
          ) : (
            <>
              <FileOutput className="w-4 h-4" />
              <span>Xuất file Word</span>
            </>
          )}
        </button>

        {/* Small tips section */}
        <div className="flex gap-2 p-3 mt-4 border-2 border-ink-border bg-[#FEF9C3] text-[10px] font-mono text-ink-black leading-normal shadow-[2px_2px_0px_var(--shadow-color)]">
          <Info className="w-4 h-4 shrink-0 text-accent-red" />
          <p>
            Các tài liệu được xuất có định dạng chuẩn tương thích tốt với Microsoft Word, Google Docs và Apple Pages.
          </p>
        </div>

        {/* iOS PWA Installation Guide */}
        <div className="mt-4 border-2 border-ink-border bg-white shadow-[2px_2px_0px_var(--shadow-color)] overflow-hidden">
          <button
            onClick={() => {
              playClickSound();
              setShowIosGuide(!showIosGuide);
            }}
            className="w-full flex items-center justify-between p-2.5 text-[10px] font-mono font-bold text-ink-black hover:bg-accent-yellow/10 transition-colors text-left select-none cursor-pointer"
          >
            <span>CÀI ĐẶT TRÊN IPHONE 📱</span>
            <span className="text-xs">{showIosGuide ? "▲" : "▼"}</span>
          </button>
          
          {showIosGuide && (
            <div className="p-3 border-t-2 border-dashed border-ink-border/20 text-[10px] font-mono text-ink-black leading-normal space-y-2 bg-[#FAF9F5]">
              <p>Để thêm **Wordify** vào màn hình chính iPhone:</p>
              <ol className="list-decimal pl-4 space-y-1.5 font-bold">
                <li>Mở trang này bằng trình duyệt <strong className="text-accent-blue">Safari</strong>.</li>
                <li>Nhấn vào biểu tượng **Chia sẻ** (Share) 📤 ở thanh công cụ dưới cùng.</li>
                <li>Cuộn xuống dưới và chọn **"Thêm vào MH chính"** (Add to Home Screen) 📲.</li>
                <li>Nhấn **"Thêm"** (Add) ở góc trên bên phải để hoàn tất.</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
