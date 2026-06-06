import React, { useMemo } from "react";
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
    return `${style.bodyFontClass} leading-relaxed mb-4 ${
      style.justifyText ? "text-justify" : "text-left"
    } ${style.textClass}`;
  };

  const isLandscape = settings.orientation === "landscape";

  // Segment blocks into page lists on "pagebreak" block
  const pages = useMemo(() => {
    const pagesList: Block[][] = [[]];
    blocks.forEach((block) => {
      if (block.type === "pagebreak") {
        pagesList.push([]);
      } else {
        pagesList[pagesList.length - 1].push(block);
      }
    });
    return pagesList;
  }, [blocks]);

  // Compute all headings for Table of Contents outline
  const documentHeadings = useMemo(() => {
    return blocks.filter(
      (b) => b.type === "heading1" || b.type === "heading2" || b.type === "heading3"
    ) as { type: "heading1" | "heading2" | "heading3"; text: string }[];
  }, [blocks]);

  return (
    <div className="preview-panel-container flex flex-col h-full bg-white border-t-0 lg:border-t-4 border-b-2 lg:border-b-4 border-x-0 lg:border-x-4 border-ink-border lg:rounded-lg shadow-none lg:shadow-[4px_4px_0px_var(--shadow-color)] overflow-hidden transition-all duration-300">
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
      <div className="flex-1 overflow-auto p-2 sm:p-6 md:p-8 flex justify-center bg-[#E5E5DE] dark:bg-[#161618] bg-[radial-gradient(var(--dot-color)_1px,transparent_1px)] bg-[size:16px_16px] bg-[-8px_-8px]">
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-ink-light gap-3 py-16">
            <FileText className="w-12 h-12 stroke-[1.2] opacity-80" />
            <p className="text-xs font-mono font-bold">Bản xem trước định dạng sẽ hiển thị ở đây</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8 w-full items-center">
            {pages.map((pageBlocks, pageIdx) => (
              <div
                key={pageIdx}
                id={pageIdx === 0 ? "preview-sheet" : undefined}
                style={{ fontFamily: style.bodyFontFamily }}
                className={`word-sheet shadow-[8px_8px_0px_rgba(0,0,0,0.15)] border-2 lg:border-4 border-ink-border transition-all duration-300 relative flex flex-col justify-between ${
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
                  {pageBlocks.map((block) => {
                    const idx = blocks.indexOf(block);
                    switch (block.type) {
                      case "title":
                        return (
                          <h1
                            key={idx}
                            id={`heading-${block.text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
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
                            id={`heading-${block.text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                            className={getHeadingStyle("heading1")}
                            style={{ color: `#${style.docxPrimaryColor}`, fontFamily: style.headerFontFamily }}
                            dangerouslySetInnerHTML={{ __html: mdToHtmlInline(block.text) }}
                          />
                        );

                      case "heading2":
                        return (
                          <h3
                            key={idx}
                            id={`heading-${block.text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                            className={getHeadingStyle("heading2")}
                            style={{ color: `#${style.docxPrimaryColor}`, fontFamily: style.headerFontFamily }}
                            dangerouslySetInnerHTML={{ __html: mdToHtmlInline(block.text) }}
                          />
                        );

                      case "heading3":
                        return (
                          <h4
                            key={idx}
                            id={`heading-${block.text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
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
                            style={{ fontSize: `${style.docxFontSize / 2}pt` }}
                            dangerouslySetInnerHTML={{ __html: mdToHtmlInline(block.text) }}
                          />
                        );

                      case "bullet-list":
                        return (
                          <ul
                            key={idx}
                            className={`list-disc pl-6 mb-4 space-y-1.5 ${style.bodyFontClass} ${style.textClass}`}
                            style={{ fontSize: `${style.docxFontSize / 2}pt` }}
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
                            className={`list-decimal pl-6 mb-4 space-y-1.5 ${style.bodyFontClass} ${style.textClass}`}
                            style={{ fontSize: `${style.docxFontSize / 2}pt` }}
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
                            className="border-l-4 pl-4 py-2 my-4 italic leading-relaxed transition-all"
                            style={{
                              borderColor: `#${style.quoteBorderColor}`,
                              backgroundColor: style.quoteBgColor ? `#${style.quoteBgColor}` : "transparent",
                              color: `#${style.docxTextColor}`,
                              fontSize: `${style.docxFontSize / 2}pt`
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
                                          style={{ fontSize: `${style.docxFontSize / 2}pt` }}
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

                      case "image":
                        return (
                          <div key={idx} className="my-6 text-center select-none">
                            <img
                              src={block.url}
                              alt={block.alt}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=500&auto=format&fit=crop";
                              }}
                              className="max-w-full max-h-[300px] object-contain rounded-lg border-2 border-ink-border dark:border-[#3F3F46] shadow-md mx-auto block"
                            />
                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 italic mt-2 font-mono">
                              ▲ Hình: {block.alt || "Mô tả ảnh chưa đặt"}
                            </p>
                          </div>
                        );

                      case "toc":
                        return (
                          <div
                            key={idx}
                            className="my-6 p-5 border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/20 rounded font-sans"
                            style={{ fontSize: `${style.docxFontSize / 2}pt` }}
                          >
                            <h3 className="font-bold text-center mb-4 text-zinc-800 dark:text-zinc-100 font-heading">
                              MỤC LỤC TÀI LIỆU
                            </h3>
                            {documentHeadings.length === 0 ? (
                              <p className="text-xs text-zinc-400 italic text-center">
                                (Không có tiêu đề nào để hiển thị trong mục lục. Thêm tiêu đề #, ##, ### để cập nhật)
                              </p>
                            ) : (
                              <div className="space-y-2.5">
                                {documentHeadings.map((heading, hIdx) => {
                                  const indentClass =
                                    heading.type === "heading2"
                                      ? "pl-4"
                                      : heading.type === "heading3"
                                      ? "pl-8"
                                      : "font-bold";
                                  const textId = heading.text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                                  return (
                                    <div
                                      key={hIdx}
                                      onClick={() => {
                                        const el = document.getElementById(`heading-${textId}`);
                                        if (el) {
                                          el.scrollIntoView({ behavior: "smooth", block: "center" });
                                        }
                                      }}
                                      className={`flex items-center justify-between text-zinc-700 dark:text-zinc-300 hover:text-accent-blue cursor-pointer transition-colors group ${indentClass}`}
                                    >
                                      <span className="truncate group-hover:underline">{heading.text}</span>
                                      <span className="flex-1 border-b border-dotted border-zinc-300 dark:border-[#3F3F46] mx-2 h-3" />
                                      <span className="text-xs font-mono select-none">Trang 1</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
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
                    <span>Trang {pageIdx + 1} trên {pages.length}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
