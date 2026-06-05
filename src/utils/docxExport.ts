import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  WidthType,
  PageOrientation,
  LevelFormat,
} from "docx";
import { saveAs } from "file-saver";
import type { Block } from "./parser";
import { marginPresets, pageDimensions } from "./styles";
import type { DocumentStyle, PageSettings } from "./styles";

interface InlineSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  size?: number;
}

function parseInlineMarkdown(text: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  let index = 0;
  
  while (index < text.length) {
    const sub = text.substring(index);
    
    // Underline
    const uMatch = sub.match(/^<u>([\s\S]*?)<\/u>/i);
    if (uMatch) {
      segments.push({
        text: uMatch[1],
        underline: true,
      });
      index += uMatch[0].length;
      continue;
    }
    
    // Font Size tag
    const fMatch = sub.match(/^<font\s+size="(\d+)"[^>]*>([\s\S]*?)<\/font>/i);
    if (fMatch) {
      const sizeValue = fMatch[1];
      let docxSize = 22; // Default 11pt
      if (sizeValue === "1") docxSize = 16;
      else if (sizeValue === "2") docxSize = 20;
      else if (sizeValue === "3") docxSize = 22;
      else if (sizeValue === "4") docxSize = 24;
      else if (sizeValue === "5") docxSize = 28;
      else if (sizeValue === "6") docxSize = 36;
      else if (sizeValue === "7") docxSize = 48;
      
      const innerSegments = parseInlineMarkdown(fMatch[2]);
      innerSegments.forEach(seg => {
        segments.push({
          ...seg,
          size: docxSize,
        });
      });
      index += fMatch[0].length;
      continue;
    }
    
    // Bold
    const bMatch = sub.match(/^(\*\*|__)([\s\S]*?)\1/);
    if (bMatch) {
      segments.push({
        text: bMatch[2],
        bold: true,
      });
      index += bMatch[0].length;
      continue;
    }
    
    // Italic
    const iMatch = sub.match(/^(\*|_)([\s\S]*?)\1/);
    if (iMatch) {
      segments.push({
        text: iMatch[2],
        italic: true,
      });
      index += iMatch[0].length;
      continue;
    }
    
    // Plain text
    const nextMarkerIdx = sub.search(/\*\*|__|__|\*|_|<u>|<font/);
    if (nextMarkerIdx === -1) {
      segments.push({ text: sub });
      break;
    } else if (nextMarkerIdx === 0) {
      segments.push({ text: sub.charAt(0) });
      index += 1;
    } else {
      segments.push({ text: sub.substring(0, nextMarkerIdx) });
      index += nextMarkerIdx;
    }
  }
  
  return segments;
}

/**
 * Transforms parsed document blocks into a beautiful native Word (.docx) file
 */
export async function exportToDocx(
  blocks: Block[],
  style: DocumentStyle,
  settings: PageSettings
): Promise<void> {
  const isLandscape = settings.orientation === "landscape";
  const dimensions = pageDimensions[settings.pageSize];
  const margin = marginPresets[settings.margins];

  const width = isLandscape ? dimensions.height : dimensions.width;
  const height = isLandscape ? dimensions.width : dimensions.height;
  const orientation = isLandscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT;

  // 1. Gather all document body children from the blocks
  const children: (Paragraph | Table)[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    // Add extra spacing before block items unless it's the very first element
    const isFirst = i === 0;

    switch (block.type) {
      case "title":
        children.push(
          new Paragraph({
            alignment: style.id === "academic" ? AlignmentType.CENTER : AlignmentType.LEFT,
            spacing: {
              before: isFirst ? 0 : 400,
              after: 300,
            },
            children: parseInlineMarkdown(block.text).map(
              (seg) =>
                new TextRun({
                  text: seg.text,
                  font: style.docxFont,
                  size: 48, // 24pt
                  bold: seg.bold ?? true,
                  italics: seg.italic,
                  underline: seg.underline ? {} : undefined,
                  color: style.docxPrimaryColor,
                })
            ),
          })
        );
        break;

      case "heading1":
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: {
              before: isFirst ? 0 : 360,
              after: 120,
            },
            children: parseInlineMarkdown(block.text).map(
              (seg) =>
                new TextRun({
                  text: seg.text,
                  font: style.docxFont,
                  size: seg.size ?? 32, // 16pt
                  bold: seg.bold ?? true,
                  italics: seg.italic,
                  underline: seg.underline ? {} : undefined,
                  color: style.docxPrimaryColor,
                })
            ),
          })
        );
        break;

      case "heading2":
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: {
              before: isFirst ? 0 : 280,
              after: 100,
            },
            children: parseInlineMarkdown(block.text).map(
              (seg) =>
                new TextRun({
                  text: seg.text,
                  font: style.docxFont,
                  size: seg.size ?? 26, // 13pt
                  bold: seg.bold ?? true,
                  italics: seg.italic,
                  underline: seg.underline ? {} : undefined,
                  color: style.docxPrimaryColor,
                })
            ),
          })
        );
        break;

      case "heading3":
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            spacing: {
              before: isFirst ? 0 : 220,
              after: 80,
            },
            children: parseInlineMarkdown(block.text).map(
              (seg) =>
                new TextRun({
                  text: seg.text,
                  font: style.docxFont,
                  size: seg.size ?? 22, // 11pt
                  bold: seg.bold ?? true,
                  italics: seg.italic,
                  underline: seg.underline ? {} : undefined,
                  color: style.docxPrimaryColor,
                })
            ),
          })
        );
        break;

      case "paragraph":
        children.push(
          new Paragraph({
            alignment: style.justifyText ? AlignmentType.JUSTIFIED : AlignmentType.LEFT,
            spacing: {
              before: 0,
              after: style.docxParaSpacingAfter,
              line: style.docxLineSpacing,
            },
            children: parseInlineMarkdown(block.text).map(
              (seg) =>
                new TextRun({
                  text: seg.text,
                  font: style.docxFont,
                  size: seg.size ?? 22, // 11pt
                  bold: seg.bold,
                  italics: seg.italic,
                  underline: seg.underline ? {} : undefined,
                  color: style.docxTextColor,
                })
            ),
          })
        );
        break;

      case "bullet-list":
        block.items.forEach((item) => {
          children.push(
            new Paragraph({
              numbering: {
                reference: "bullet-list-ref",
                level: 0,
              },
              spacing: {
                before: 40,
                after: 40,
                line: style.docxLineSpacing,
              },
              children: parseInlineMarkdown(item).map(
                (seg) =>
                  new TextRun({
                    text: seg.text,
                    font: style.docxFont,
                    size: seg.size ?? 22, // 11pt
                    bold: seg.bold,
                    italics: seg.italic,
                    underline: seg.underline ? {} : undefined,
                    color: style.docxTextColor,
                  })
              ),
            })
          );
        });
        break;

      case "numbered-list":
        block.items.forEach((item) => {
          children.push(
            new Paragraph({
              numbering: {
                reference: "numbered-list-ref",
                level: 0,
              },
              spacing: {
                before: 40,
                after: 40,
                line: style.docxLineSpacing,
              },
              children: parseInlineMarkdown(item).map(
                (seg) =>
                  new TextRun({
                    text: seg.text,
                    font: style.docxFont,
                    size: seg.size ?? 22, // 11pt
                    bold: seg.bold,
                    italics: seg.italic,
                    underline: seg.underline ? {} : undefined,
                    color: style.docxTextColor,
                  })
              ),
            })
          );
        });
        break;

      case "quote":
        // Render blockquote as a beautifully formatted table cell with left border only
        children.push(
          new Paragraph({
            spacing: { before: 180, after: 0 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: style.quoteBgColor ? { fill: style.quoteBgColor } : undefined,
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: {
                        style: BorderStyle.SINGLE,
                        size: 24, // 3pt width
                        color: style.quoteBorderColor,
                      },
                      right: { style: BorderStyle.NONE },
                    },
                    margins: {
                      top: 140,
                      bottom: 140,
                      left: 240,
                      right: 180,
                    },
                    children: block.text.split("\n").map(
                      (line) =>
                        new Paragraph({
                          spacing: { before: 40, after: 40 },
                          children: parseInlineMarkdown(line).map(
                            (seg) =>
                              new TextRun({
                                text: seg.text,
                                font: style.docxFont,
                                size: seg.size ?? 22, // 11pt
                                italics: seg.italic ?? true, // Quote is italicized by default
                                bold: seg.bold,
                                underline: seg.underline ? {} : undefined,
                                color: style.docxTextColor,
                              })
                          ),
                        })
                    ),
                  }),
                ],
              }),
            ],
          })
        );
        break;

      case "code":
        // Render code block inside a single-cell table with a soft background fill and borders
        children.push(
          new Paragraph({
            spacing: { before: 180, after: 0 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: style.codeBgColor },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 4, color: style.codeBorderColor },
                      bottom: { style: BorderStyle.SINGLE, size: 4, color: style.codeBorderColor },
                      left: { style: BorderStyle.SINGLE, size: 4, color: style.codeBorderColor },
                      right: { style: BorderStyle.SINGLE, size: 4, color: style.codeBorderColor },
                    },
                    margins: {
                      top: 140,
                      bottom: 140,
                      left: 180,
                      right: 180,
                    },
                    children: block.code.split("\n").map(
                      (line) =>
                        new Paragraph({
                          spacing: { before: 0, after: 0 },
                          children: [
                            new TextRun({
                              text: line,
                              font: "Consolas", // Fixed monospace font
                              size: 20, // 10pt
                              color: "0F172A", // Dark charcoal
                            }),
                          ],
                        })
                    ),
                  }),
                ],
              }),
            ],
          })
        );
        break;

      case "table":
        children.push(
          new Paragraph({
            spacing: { before: 180, after: 0 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header row
              new TableRow({
                children: block.headers.map((header) => {
                  return new TableCell({
                    shading: { fill: style.tableHeaderBg },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 8, color: style.tableBorderColor },
                      bottom: { style: BorderStyle.SINGLE, size: 12, color: style.tableBorderColor },
                      left: { style: BorderStyle.SINGLE, size: 4, color: style.tableBorderColor },
                      right: { style: BorderStyle.SINGLE, size: 4, color: style.tableBorderColor },
                    },
                    margins: { top: 120, bottom: 120, left: 120, right: 120 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: parseInlineMarkdown(header).map(
                          (seg) =>
                            new TextRun({
                              text: seg.text,
                              font: style.docxFont,
                              size: seg.size ?? 22,
                              bold: seg.bold ?? true,
                              italics: seg.italic,
                              underline: seg.underline ? {} : undefined,
                              color: style.tableHeaderTextColor,
                            })
                        ),
                      }),
                    ],
                  });
                }),
              }),
              // Data rows
              ...block.rows.map((row, rowIndex) => {
                const isEven = rowIndex % 2 === 0;
                // Add soft zebra coloring for non-academic sheets
                const rowShading =
                  style.id !== "academic" && !isEven ? style.codeBgColor : "FFFFFF";

                return new TableRow({
                  children: row.map((cellText) => {
                    return new TableCell({
                      shading: { fill: rowShading },
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 4, color: style.tableBorderColor },
                        bottom: { style: BorderStyle.SINGLE, size: 4, color: style.tableBorderColor },
                        left: { style: BorderStyle.SINGLE, size: 4, color: style.tableBorderColor },
                        right: { style: BorderStyle.SINGLE, size: 4, color: style.tableBorderColor },
                      },
                      margins: { top: 100, bottom: 100, left: 120, right: 120 },
                      children: [
                        new Paragraph({
                          children: parseInlineMarkdown(cellText).map(
                            (seg) =>
                              new TextRun({
                                text: seg.text,
                                font: style.docxFont,
                                size: seg.size ?? 22,
                                bold: seg.bold,
                                italics: seg.italic,
                                underline: seg.underline ? {} : undefined,
                                color: style.docxTextColor,
                              })
                          ),
                        }),
                      ],
                    });
                  }),
                });
              }),
            ],
          })
        );
        break;
    }
  }

  // 2. Prepare Header and Footer details
  const header = settings.headerText.trim()
    ? new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: settings.headerText,
                font: style.docxFont,
                size: 18, // 9pt
                color: "94A3B8", // slate-400
              }),
            ],
          }),
        ],
      })
    : undefined;

  const footer = settings.includePageNumbers
    ? new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200 },
            children: [
              new TextRun({
                text: "Page ",
                font: style.docxFont,
                size: 18,
                color: "94A3B8",
              }),
              new TextRun({
                children: [PageNumber.CURRENT],
                font: style.docxFont,
                size: 18,
                color: "94A3B8",
              }),
              new TextRun({
                text: " of ",
                font: style.docxFont,
                size: 18,
                color: "94A3B8",
              }),
              new TextRun({
                children: [PageNumber.TOTAL_PAGES],
                font: style.docxFont,
                size: 18,
                color: "94A3B8",
              }),
            ],
          }),
        ],
      })
    : undefined;

  // 3. Construct the docx Document
  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "bullet-list-ref",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 432, hanging: 288 }, // Standard list indentation
                },
              },
            },
          ],
        },
        {
          reference: "numbered-list-ref",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 432, hanging: 288 },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width,
              height,
              orientation,
            },
            margin: {
              top: margin.top,
              bottom: margin.bottom,
              left: margin.left,
              right: margin.right,
            },
          },
        },
        headers: header ? { default: header } : undefined,
        footers: footer ? { default: footer } : undefined,
        children,
      },
    ],
  });

  // 4. Compile to blob and trigger download
  const blob = await Packer.toBlob(doc);
  
  // Extract title block for filename if it exists
  const titleBlock = blocks.find((b) => b.type === "title") || blocks.find((b) => b.type === "heading1");
  const baseName = titleBlock
    ? titleBlock.text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    : "formatted-document";

  saveAs(blob, `${baseName || "document"}.docx`);
}
