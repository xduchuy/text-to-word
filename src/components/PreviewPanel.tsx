import type { Block } from "../utils/parser";
import { mdToHtmlInline } from "../utils/parser";
import { marginPresets } from "../utils/styles";
import type { DocumentStyle, PageSettings } from "../utils/styles";
import { FileText } from "lucide-react";

interface PreviewPanelProps {
  blocks: Block[];
  style: DocumentStyle;
  settings: PageSettings;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ blocks, style, settings }) => {
  const marginPreset = marginPresets[settings.margins];

  const getHeadingStyle = (type: string) => {
    switch (type) {
      case "heading1":
        return `text-2xl font-bold tracking-tight mt-8 mb-3 ${style.headerFontClass}`;
      case "heading2":
        return `text-xl font-bold tracking-tight mt-6 mb-2.5 ${style.headerFontClass}`;
      case "heading3":
        return `text-lg font-semibold mt-5 mb-2 ${style.headerFontClass}`;
      default:
        return "";
    }
  };

  const getParagraphStyle = () => {
    return `${style.bodyFontClass} text-[14px] leading-relaxed mb-4 ${
      style.justifyText ? "text-justify" : "text-left"
    } ${style.textClass}`;
  };

  const isLandscape = settings.orientation === "landscape";

  return (
    <div className="flex flex-col h-full bg-white border-t-0 lg:border-t-4 border-b-2 lg:border-b-4 border-x-0 lg:border-x-4 border-ink-border lg:rounded-lg shadow-none lg:shadow-[4px_4px_0px_var(--shadow-color)] overflow-hidden transition-all duration-300">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#FAF9F5] border-b-2 border-ink-border">
        <div className="flex items-center gap-3">
          {/* macOS window dots */}
          <div className="flex gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-ink-border" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-ink-border" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-ink-border" />
          </div>
          
          <span className="text-[10px] font-mono bg-accent-yellow text-ink-black px-1.5 py-0.5 border border-ink-border font-bold rotate-1">
            Bản in trực quan
          </span>
        </div>
        <div className="text-[10px] font-mono font-bold text-ink-black">
          {settings.pageSize.toUpperCase()} • {settings.orientation === "portrait" ? "Khổ dọc" : "Khổ ngang"}
        </div>
      </div>

      {/* Preview Scroll Container */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-6 md:p-8 flex justify-center bg-[#E5E5DE] dark:bg-[#161618] bg-[radial-gradient(var(--dot-color)_1px,transparent_1px)] bg-[size:16px_16px] bg-[-8px_-8px]">
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-ink-light gap-3 py-16">
            <FileText className="w-12 h-12 stroke-[1.2] opacity-80" />
            <p className="text-xs font-mono font-bold">Bản xem trước định dạng sẽ hiển thị ở đây</p>
          </div>
        ) : (
          /* Simulated Page */
          <div
            style={{ fontFamily: style.bodyFontFamily }}
            className={`shadow-[8px_8px_0px_rgba(0,0,0,0.15)] border-2 lg:border-4 border-ink-border transition-all duration-300 relative flex flex-col justify-between max-w-full ${
              style.pageBgClass
            } ${marginPreset.css} ${
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
              <div className="absolute top-4 left-6 right-6 flex justify-between items-center border-b border-zinc-200 pb-1 text-[10px] font-sans text-zinc-400 uppercase tracking-widest">
                <span>{style.name}</span>
                <span>{settings.headerText}</span>
              </div>
            )}

            {/* Main content body */}
            <div className="flex-1 w-full text-slate-800 mt-2">
              {blocks.map((block, idx) => {
                switch (block.type) {
                  case "title":
                    return (
                      <h1
                        key={idx}
                        className={`text-3xl font-extrabold tracking-tight pb-3 mb-6 border-b border-zinc-200 ${
                          style.id === "academic" ? "text-center" : "text-left"
                        } ${style.headerFontClass}`}
                        style={{ color: `#${style.docxPrimaryColor}`, fontFamily: style.headerFontFamily }}
                        dangerouslySetInnerHTML={{ __html: mdToHtmlInline(block.text) }}
                      />
                    );

                  case "heading1":
                    return (
                      <h2
                        key={idx}
                        className={getHeadingStyle("heading1")}
                        style={{ color: `#${style.docxPrimaryColor}`, fontFamily: style.headerFontFamily }}
                        dangerouslySetInnerHTML={{ __html: mdToHtmlInline(block.text) }}
                      />
                    );

                  case "heading2":
                    return (
                      <h3
                        key={idx}
                        className={getHeadingStyle("heading2")}
                        style={{ color: `#${style.docxPrimaryColor}`, fontFamily: style.headerFontFamily }}
                        dangerouslySetInnerHTML={{ __html: mdToHtmlInline(block.text) }}
                      />
                    );

                  case "heading3":
                    return (
                      <h4
                        key={idx}
                        className={getHeadingStyle("heading3")}
                        style={{ color: `#${style.docxPrimaryColor}`, fontFamily: style.headerFontFamily }}
                        dangerouslySetInnerHTML={{ __html: mdToHtmlInline(block.text) }}
                      />
                    );

                  case "paragraph":
                    return (
                      <p
                        key={idx}
                        className={getParagraphStyle()}
                        dangerouslySetInnerHTML={{ __html: mdToHtmlInline(block.text) }}
                      />
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
                            dangerouslySetInnerHTML={{ __html: mdToHtmlInline(item) }}
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
                          <li
                            key={itemIdx}
                            dangerouslySetInnerHTML={{ __html: mdToHtmlInline(item) }}
                          />
                        ))}
                      </ol>
                    );

                  case "quote":
                    return (
                      <div
                        key={idx}
                        className="border-l-4 pl-4 py-2 my-4 italic text-[14px] leading-relaxed transition-all"
                        style={{
                          borderColor: `#${style.quoteBorderColor}`,
                          backgroundColor: style.quoteBgColor ? `#${style.quoteBgColor}` : "transparent",
                          color: `#${style.docxTextColor}`,
                        }}
                      >
                        {block.text.split("\n").map((line, lIdx) => (
                          <p
                            key={lIdx}
                            className="mb-1 last:mb-0"
                            dangerouslySetInnerHTML={{ __html: mdToHtmlInline(line) }}
                          />
                        ))}
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
                        <pre className="text-zinc-800">
                          <code>{block.code}</code>
                        </pre>
                      </div>
                    );

                  case "table":
                    return (
                      <div key={idx} className="overflow-x-auto my-6 border rounded border-zinc-200">
                        <table
                          className="w-full text-left text-xs border-collapse font-sans"
                          style={{ borderColor: `#${style.tableBorderColor}` }}
                        >
                          <thead>
                            <tr
                               className="border-b"
                               style={{
                                 backgroundColor: `#${style.tableHeaderBg}`,
                                 borderColor: `#${style.tableBorderColor}`,
                               }}
                             >
                               {block.headers.map((header, hIdx) => (
                                 <th
                                   key={hIdx}
                                   className="p-3 font-semibold text-zinc-800"
                                   style={{ color: style.tableHeaderTextColor }}
                                   dangerouslySetInnerHTML={{ __html: mdToHtmlInline(header) }}
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
                                   className="border-b last:border-b-0"
                                   style={{
                                     backgroundColor: zebraBg,
                                     borderColor: `#${style.tableBorderColor}`,
                                   }}
                                 >
                                   {row.map((cell, cIdx) => (
                                     <td
                                       key={cIdx}
                                       className="p-3 text-zinc-600"
                                       dangerouslySetInnerHTML={{ __html: mdToHtmlInline(cell) }}
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
              <div className="border-t border-zinc-200 mt-8 pt-2 flex justify-between items-center text-[10px] font-sans text-zinc-400 tracking-wider">
                <span>Wordify - Công cụ xuất bản</span>
                <span>Trang 1 trên 1</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default PreviewPanel;
