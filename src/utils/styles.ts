export interface DocumentStyle {
  id: string;
  name: string;
  description: string;
  
  // Preview Styling (CSS / Typography)
  bodyFontFamily: string;   // Google Fonts or system font family for body
  headerFontFamily: string; // Google Fonts or system font family for headers
  bodyFontClass: string;
  headerFontClass: string;
  primaryColorClass: string;
  accentColorClass: string;
  pageBgClass: string;
  textClass: string;
  justifyText: boolean;
  
  // Word Document XML Export Styling
  docxFont: string;
  docxPrimaryColor: string; // Hex color code
  docxTextColor: string;    // Hex color code
  docxLineSpacing: number;  // Twips (240 twips = 1.0, 360 twips = 1.5, 480 twips = 2.0)
  docxParaSpacingBefore: number; // Twips
  docxParaSpacingAfter: number;  // Twips
  
  // Special blocks
  quoteBorderColor: string; // Hex color code
  quoteBgColor: string;     // Hex color code (or empty if no shading)
  codeBgColor: string;      // Hex color code
  codeBorderColor: string;  // Hex color code
  
  // Tables
  tableHeaderBg: string;    // Hex color code
  tableHeaderTextColor: string; // Hex color code
  tableBorderColor: string; // Hex color code
}

export const documentStyles: DocumentStyle[] = [
  {
    id: "blank",
    name: "Tài liệu trống",
    description: "Trang tài liệu trắng tiêu chuẩn, không có phong cách thiết kế định sẵn, sử dụng phông chữ văn phòng phổ thông.",
    bodyFontFamily: "Calibri, Arial, sans-serif",
    headerFontFamily: "Calibri, Arial, sans-serif",
    bodyFontClass: "tracking-normal leading-normal antialiased",
    headerFontClass: "font-bold text-black",
    primaryColorClass: "text-black",
    accentColorClass: "text-slate-600",
    pageBgClass: "bg-white",
    textClass: "text-black",
    justifyText: false,
    docxFont: "Calibri",
    docxPrimaryColor: "000000", // Standard Black
    docxTextColor: "000000",
    docxLineSpacing: 276, // 1.15 Line Spacing
    docxParaSpacingBefore: 0,
    docxParaSpacingAfter: 120,
    quoteBorderColor: "CCCCCC", // Muted Gray
    quoteBgColor: "F9F9F9",     // Soft White-Gray
    codeBgColor: "F5F5F5",      // Light Gray
    codeBorderColor: "E0E0E0",  // Border Gray
    tableHeaderBg: "F2F2F2",    // Neutral Gray Header
    tableHeaderTextColor: "000000",
    tableBorderColor: "D3D3D3", // Light Gray Border
  },
  {
    id: "academic",
    name: "Báo cáo học thuật",
    description: "Kiểu tài liệu chính thức với giãn dòng 1.5, phông chữ có chân (serif), canh lề đều hai bên và đánh số tiêu đề.",
    bodyFontFamily: "'Times New Roman', Times, Georgia, serif",
    headerFontFamily: "'Times New Roman', Times, Georgia, serif",
    bodyFontClass: "",
    headerFontClass: "font-bold text-slate-900",
    primaryColorClass: "text-slate-900",
    accentColorClass: "text-blue-900",
    pageBgClass: "bg-white",
    textClass: "text-slate-900",
    justifyText: true,
    docxFont: "Times New Roman",
    docxPrimaryColor: "1E3A8A", // Deep Navy
    docxTextColor: "000000",
    docxLineSpacing: 360, // 1.5 Line Spacing (equivalent to 18pt in Word)
    docxParaSpacingBefore: 0,
    docxParaSpacingAfter: 200,
    quoteBorderColor: "94A3B8", // Slate 400
    quoteBgColor: "F8FAFC",     // Slate 50
    codeBgColor: "F1F5F9",      // Slate 100
    codeBorderColor: "CBD5E1",  // Slate 300
    tableHeaderBg: "E2E8F0",    // Slate 200
    tableHeaderTextColor: "0F172A", // Slate 900
    tableBorderColor: "94A3B8", // Slate 400
  },
  {
    id: "minimal",
    name: "Hiện đại tối giản",
    description: "Giao diện thoáng đãng, hiện đại với phông chữ không chân (sans-serif), đường kẻ phân chia tinh tế và tông màu ấm.",
    bodyFontFamily: "Inter, system-ui, -apple-system, sans-serif",
    headerFontFamily: "Inter, system-ui, -apple-system, sans-serif",
    bodyFontClass: "tracking-wide leading-relaxed antialiased",
    headerFontClass: "font-semibold text-zinc-900 tracking-tight",
    primaryColorClass: "text-zinc-900",
    accentColorClass: "text-zinc-600",
    pageBgClass: "bg-[#FCFAF7]", // Soft warm cream
    textClass: "text-zinc-800",
    justifyText: false,
    docxFont: "Arial",
    docxPrimaryColor: "3F3F46", // Zinc 600
    docxTextColor: "18181B",    // Zinc 900
    docxLineSpacing: 288, // 1.2 Line Spacing
    docxParaSpacingBefore: 0,
    docxParaSpacingAfter: 160,
    quoteBorderColor: "A1A1AA", // Zinc 400
    quoteBgColor: "FAF9F6",     // Slightly lighter warm cream
    codeBgColor: "F4F4F5",      // Zinc 100
    codeBorderColor: "E4E4E7",  // Zinc 200
    tableHeaderBg: "FAF9F6",    // Off-white header
    tableHeaderTextColor: "18181B",
    tableBorderColor: "D4D4D8", // Zinc 300
  },
  {
    id: "business",
    name: "Đề xuất kinh doanh",
    description: "Định dạng chuyên nghiệp nổi bật với tiêu đề xanh Indigo, điểm nhấn màu hổ phách và bảng dữ liệu gọn gàng.",
    bodyFontFamily: "Inter, system-ui, sans-serif",
    headerFontFamily: "Outfit, Inter, system-ui, sans-serif",
    bodyFontClass: "tracking-normal leading-normal antialiased",
    headerFontClass: "font-bold text-slate-900 tracking-tight",
    primaryColorClass: "text-slate-900",
    accentColorClass: "text-indigo-600",
    pageBgClass: "bg-white",
    textClass: "text-slate-700",
    justifyText: false,
    docxFont: "Calibri",
    docxPrimaryColor: "4F46E5", // Indigo 600
    docxTextColor: "1E293B",    // Slate 800
    docxLineSpacing: 276, // 1.15 Line Spacing
    docxParaSpacingBefore: 0,
    docxParaSpacingAfter: 140,
    quoteBorderColor: "4F46E5", // Indigo 600
    quoteBgColor: "F5F3FF",     // Indigo 50
    codeBgColor: "F8FAFC",      // Slate 50
    codeBorderColor: "E2E8F0",  // Slate 200
    tableHeaderBg: "4F46E5",    // Indigo Header
    tableHeaderTextColor: "FFFFFF",
    tableBorderColor: "CBD5E1",  // Slate 300
  },
  {
    id: "portfolio",
    name: "Hồ sơ năng lực (Portfolio)",
    description: "Phong cách nghệ thuật kết hợp tiêu đề Serif bay bổng, nội dung phông Lora mềm mại trên nền giấy kem ấm áp.",
    bodyFontFamily: "Lora, Georgia, serif",
    headerFontFamily: "'Playfair Display', Georgia, serif",
    bodyFontClass: "tracking-normal leading-relaxed antialiased",
    headerFontClass: "italic font-semibold text-stone-900",
    primaryColorClass: "text-stone-900",
    accentColorClass: "text-orange-800",
    pageBgClass: "bg-[#F5F2EB]", // Warm stone cream
    textClass: "text-stone-800",
    justifyText: false,
    docxFont: "Georgia",
    docxPrimaryColor: "9A3412", // Rust / Orange 800
    docxTextColor: "1C1917",    // Stone 900
    docxLineSpacing: 312, // 1.3 Line Spacing
    docxParaSpacingBefore: 0,
    docxParaSpacingAfter: 180,
    quoteBorderColor: "9A3412", // Rust
    quoteBgColor: "FFF7ED",     // Orange 50
    codeBgColor: "FAFAF9",      // Stone 50
    codeBorderColor: "E7E5E4",  // Stone 200
    tableHeaderBg: "EA580C",    // Orange 600 header
    tableHeaderTextColor: "FFFFFF",
    tableBorderColor: "D6D3D1", // Stone 300
  },
  {
    id: "notes",
    name: "Ghi chú sạch sẽ",
    description: "Bố cục dạng sổ tay lập trình viên sử dụng phông chữ đơn trị (monospace), lưới ô li nhẹ và màu xanh ngọc lục bảo.",
    bodyFontFamily: "'Fira Code', 'Courier New', Courier, monospace",
    headerFontFamily: "'Fira Code', 'Courier New', Courier, monospace",
    bodyFontClass: "tracking-tight leading-relaxed text-sm antialiased",
    headerFontClass: "font-bold text-emerald-950",
    primaryColorClass: "text-emerald-950",
    accentColorClass: "text-emerald-600",
    pageBgClass: "bg-[#F8FAFC]", // Slate 50
    textClass: "text-slate-900",
    justifyText: false,
    docxFont: "Consolas",
    docxPrimaryColor: "059669", // Emerald 600
    docxTextColor: "0F172A",    // Slate 900
    docxLineSpacing: 288, // 1.2 Line Spacing
    docxParaSpacingBefore: 0,
    docxParaSpacingAfter: 120,
    quoteBorderColor: "059669", // Emerald 600
    quoteBgColor: "ECFDF5",     // Emerald 50
    codeBgColor: "F0FDF4",      // Emerald 50 code highlight
    codeBorderColor: "A7F3D0",  // Emerald 200
    tableHeaderBg: "D1FAE5",    // Emerald 100 header
    tableHeaderTextColor: "064E3B", // Emerald 900
    tableBorderColor: "A7F3D0",  // Emerald 200
  },
  {
    id: "notebook",
    name: "Sổ tay Sáng tạo",
    description: "Phong cách phác thảo thô với phông đơn trị (Space Mono), tiêu đề Georgia gạch dưới màu dạ quang, và khung trích dẫn viết tay.",
    bodyFontFamily: "'Space Mono', monospace",
    headerFontFamily: "Georgia, serif",
    bodyFontClass: "tracking-tight leading-relaxed antialiased",
    headerFontClass: "font-bold text-zinc-900 border-b-2 border-dashed border-zinc-400 pb-1",
    primaryColorClass: "text-zinc-900",
    accentColorClass: "text-red-600",
    pageBgClass: "bg-[#FDFBF7]", // Warm paper white
    textClass: "text-zinc-900",
    justifyText: false,
    docxFont: "Courier New",
    docxPrimaryColor: "E24A32", // Accent Red
    docxTextColor: "1A1A1A",    // Ink Black
    docxLineSpacing: 360, // 1.5 spacing
    docxParaSpacingBefore: 120,
    docxParaSpacingAfter: 240,
    quoteBorderColor: "E24A32", // Accent Red
    quoteBgColor: "FEF9C3",     // Yellow highlighter tone
    codeBgColor: "F4F3ED",      // Paper shade
    codeBorderColor: "1A1A1A",  // Ink border
    tableHeaderBg: "FDE047",    // Yellow highlighter header
    tableHeaderTextColor: "1A1A1A",
    tableBorderColor: "1A1A1A", // Solid border
  }
];

export interface PageSettings {
  pageSize: "letter" | "a4";
  orientation: "portrait" | "landscape";
  margins: "normal" | "narrow" | "wide";
  includePageNumbers: boolean;
  headerText: string;
}

export const marginPresets = {
  normal: { top: 1440, bottom: 1440, left: 1440, right: 1440, css: "p-8 md:p-12" }, // 1 inch
  narrow: { top: 720, bottom: 720, left: 720, right: 720, css: "p-4 md:p-6" },       // 0.5 inch
  wide: { top: 2160, bottom: 2160, left: 2160, right: 2160, css: "p-12 md:p-16" }   // 1.5 inches
};

export const pageDimensions = {
  letter: {
    width: 12240, // 8.5 x 1440
    height: 15840, // 11 x 1440
    widthCss: "w-[8.5in]",
    heightCss: "min-h-[11in]",
  },
  a4: {
    width: 11907, // 8.27 x 1440
    height: 16839, // 11.69 x 1440
    widthCss: "w-[8.27in]",
    heightCss: "min-h-[11.69in]",
  }
};
