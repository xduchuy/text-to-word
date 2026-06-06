export type Block =
  | { type: "title"; text: string }
  | { type: "heading1"; text: string }
  | { type: "heading2"; text: string }
  | { type: "heading3"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bullet-list"; items: string[] }
  | { type: "numbered-list"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "code"; code: string; language: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "image"; alt: string; url: string }
  | { type: "pagebreak" }
  | { type: "toc" };

/**
 * Checks if a line is a markdown table divider, e.g., |---|---| or | :--- | ---: |
 */
function isTableDivider(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return false;
  
  // Remove outer pipes and check if inner segments consist only of dashes, colons, and whitespace
  const inner = trimmed.slice(1, -1);
  const segments = inner.split("|");
  return segments.every(seg => /^\s*:?-+:?\s*$/.test(seg));
}

/**
 * Parses a line as a table row, returning cells
 */
function parseTableRow(line: string): string[] {
  const trimmed = line.trim();
  // Split by | and strip the empty first/last elements if they result from outer pipes
  const cells = trimmed.split("|").map(c => c.trim());
  if (trimmed.startsWith("|")) cells.shift();
  if (trimmed.endsWith("|")) cells.pop();
  return cells;
}

export function parseDocument(text: string): Block[] {
  const lines = text.split(/\r?\n/);
  const blocks: Block[] = [];
  
  let inCodeBlock = false;
  let codeContent: string[] = [];
  let codeLanguage = "";
  
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];
  let pendingTableHeader: string[] | null = null;
  
  let currentListType: "bullet" | "numbered" | null = null;
  let currentListItems: string[] = [];
  
  let currentQuoteLines: string[] = [];
  let inQuote = false;

  let hasDetectedTitle = false;

  let currentParagraphLines: string[] = [];

  const commitParagraph = () => {
    if (currentParagraphLines.length > 0) {
      const pText = currentParagraphLines.join("\n");
      if (!hasDetectedTitle && blocks.length === 0) {
        blocks.push({
          type: "title",
          text: pText,
        });
        hasDetectedTitle = true;
      } else {
        blocks.push({
          type: "paragraph",
          text: pText,
        });
      }
      currentParagraphLines = [];
    }
  };

  // Helper to commit accumulated lists, quotes, or tables before starting a new block
  const commitPendingBlocks = () => {
    if (currentListType && currentListItems.length > 0) {
      blocks.push({
        type: currentListType === "bullet" ? "bullet-list" : "numbered-list",
        items: [...currentListItems],
      });
      currentListItems = [];
      currentListType = null;
    }
    if (inQuote && currentQuoteLines.length > 0) {
      blocks.push({
        type: "quote",
        text: currentQuoteLines.join("\n"),
      });
      currentQuoteLines = [];
      inQuote = false;
    }
    if (inTable) {
      // If we finished a table and have a header, push it
      blocks.push({
        type: "table",
        headers: tableHeaders.length > 0 ? tableHeaders : (pendingTableHeader || []),
        rows: [...tableRows],
      });
      tableHeaders = [];
      tableRows = [];
      pendingTableHeader = null;
      inTable = false;
    } else if (pendingTableHeader) {
      // If we had a table row that wasn't followed by a divider or turned into a table,
      // commit it as a regular paragraph or handle it
      blocks.push({
        type: "paragraph",
        text: "|" + pendingTableHeader.join("|") + "|",
      });
      pendingTableHeader = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Handle Code Blocks
    if (inCodeBlock) {
      if (trimmed.startsWith("```")) {
        blocks.push({
          type: "code",
          code: codeContent.join("\n"),
          language: codeLanguage,
        });
        codeContent = [];
        codeLanguage = "";
        inCodeBlock = false;
      } else {
        codeContent.push(line);
      }
      continue;
    }

    if (trimmed.startsWith("```")) {
      commitPendingBlocks();
      commitParagraph();
      inCodeBlock = true;
      codeLanguage = trimmed.slice(3).trim();
      continue;
    }
    // 2. Handle Quotes
    if (trimmed.startsWith(">")) {
      if (!inQuote) {
        commitPendingBlocks();
        commitParagraph();
        inQuote = true;
      }
      const quoteText = line.substring(line.indexOf(">") + 1).trim();
      currentQuoteLines.push(quoteText);
      // Look ahead to see if next line is also a quote. If not, we will commit it in next iterations.
      continue;
    } else if (inQuote) {
      // Quote finished unless empty line, but let's commit it if this line doesn't start with '>'
      commitPendingBlocks();
    }

    // 3. Handle Tables
    const isRow = trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.length > 1;
    if (isRow) {
      if (isTableDivider(line)) {
        if (pendingTableHeader && !inTable) {
          tableHeaders = pendingTableHeader;
          pendingTableHeader = null;
          inTable = true;
        }
        continue;
      }

      const cells = parseTableRow(line);
      if (inTable) {
        tableRows.push(cells);
        continue;
      } else {
        // We see a table row, but don't know if it's a table yet (needs a divider next, or we treat it as header anyway)
        commitPendingBlocks();
        commitParagraph();
        pendingTableHeader = cells;
        // Check if next line is a table divider to confirm it's a table
        const nextLine = lines[i + 1];
        if (nextLine && isTableDivider(nextLine)) {
          // Yes, it will be a table. We keep pendingTableHeader.
        } else {
          // Not a table, just a single line containing pipes. Accumulate in currentParagraphLines.
          currentParagraphLines.push(line);
          pendingTableHeader = null;
        }
        continue;
      }
    } else if (inTable || pendingTableHeader) {
      commitPendingBlocks();
    }

    // 4. Handle Lists
    const bulletMatch = line.match(/^(\s*)[-*+]\s+(.*)/);
    const numberedMatch = line.match(/^(\s*)\d+\.\s+(.*)/);

    if (bulletMatch) {
      const itemText = bulletMatch[2].trim();
      if (currentListType === "numbered") {
        commitPendingBlocks();
      }
      commitParagraph();
      currentListType = "bullet";
      currentListItems.push(itemText);
      continue;
    } else if (numberedMatch) {
      const itemText = numberedMatch[2].trim();
      if (currentListType === "bullet") {
        commitPendingBlocks();
      }
      commitParagraph();
      currentListType = "numbered";
      currentListItems.push(itemText);
      continue;
    } else if (currentListType) {
      // List ended
      commitPendingBlocks();
    }

    // 4.5 Handle Page Break
    if (trimmed === "---pagebreak---" || trimmed === "<!-- pagebreak -->") {
      commitPendingBlocks();
      commitParagraph();
      blocks.push({ type: "pagebreak" });
      continue;
    }

    // 4.6 Handle TOC
    if (trimmed.toUpperCase() === "[TOC]") {
      commitPendingBlocks();
      commitParagraph();
      blocks.push({ type: "toc" });
      continue;
    }

    // 4.7 Handle Images
    const imageMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)/);
    if (imageMatch) {
      commitPendingBlocks();
      commitParagraph();
      blocks.push({
        type: "image",
        alt: imageMatch[1].trim(),
        url: imageMatch[2].trim(),
      });
      continue;
    }

    // 5. Handle Headings
    if (trimmed.startsWith("# ")) {
      commitPendingBlocks();
      commitParagraph();
      blocks.push({
        type: "heading1",
        text: trimmed.slice(2).trim(),
      });
      continue;
    }

    if (trimmed.startsWith("## ")) {
      commitPendingBlocks();
      commitParagraph();
      blocks.push({
        type: "heading2",
        text: trimmed.slice(3).trim(),
      });
      continue;
    }

    if (trimmed.startsWith("### ")) {
      commitPendingBlocks();
      commitParagraph();
      blocks.push({
        type: "heading3",
        text: trimmed.slice(4).trim(),
      });
      continue;
    }

    // 6. Empty Lines
    if (trimmed === "") {
      commitPendingBlocks();
      commitParagraph();
      continue;
    }

    // 7. Auto-detect Title or Paragraph - accumulate in paragraph lines buffer
    currentParagraphLines.push(line);
  }

  // Final commits
  commitPendingBlocks();
  commitParagraph();

  // If we ended while inside a code block, close it
  if (inCodeBlock && codeContent.length > 0) {
    blocks.push({
      type: "code",
      code: codeContent.join("\n"),
      language: codeLanguage,
    });
  }

  return blocks;
}

export function blocksToMarkdown(blocks: Block[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "title":
          return `# ${block.text}`;
        case "heading1":
          return `# ${block.text}`;
        case "heading2":
          return `## ${block.text}`;
        case "heading3":
          return `### ${block.text}`;
        case "paragraph":
          return block.text;
        case "bullet-list":
          return block.items.map((item) => `- ${item}`).join("\n");
        case "numbered-list":
          return block.items.map((item, idx) => `${idx + 1}. ${item}`).join("\n");
        case "quote":
          return block.text
            .split("\n")
            .map((line) => `> ${line}`)
            .join("\n");
        case "code":
          return `\`\`\`${block.language || ""}\n${block.code}\n\`\`\``;
        case "table": {
          const headerRow = `| ${block.headers.join(" | ")} |`;
          const dividerRow = `| ${block.headers.map(() => "---").join(" | ")} |`;
          const dataRows = block.rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
          return `${headerRow}\n${dividerRow}\n${dataRows}`;
        }
        case "image":
          return `![${block.alt}](${block.url})`;
        case "pagebreak":
          return `---pagebreak---`;
        case "toc":
          return `[TOC]`;
        default:
          return "";
      }
    })
    .join("\n\n");
}

export function mdToHtmlInline(text: string): string {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  html = html.replace(/\r?\n/g, "<br />");
  html = html.replace(/&lt;u&gt;([\s\S]*?)&lt;\/u&gt;/gi, "<u>$1</u>");
  html = html.replace(/&lt;font size="(\d+)"&gt;([\s\S]*?)&lt;\/font&gt;/gi, '<font size="$1">$2</font>');
  html = html.replace(/\*\*([\s\S]*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__([\s\S]*?)__/g, "<strong>$1</strong>");
  html = html.replace(/\*([\s\S]*?)\*/g, "<em>$1</em>");
  html = html.replace(/_([\s\S]*?)_/g, "<em>$1</em>");
  return html;
}

export function htmlToMdInline(html: string): string {
  let text = html;
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n");
  text = text.replace(/<p[^>]*>/gi, "");
  
  // Protect bold, italic, underline
  text = text.replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, "**$2**");
  text = text.replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, "*$2*");
  text = text.replace(/<u>([\s\S]*?)<\/u>/gi, "<u>$2</u>");
  
  // Protect font size tags: <font size="X"> -> [[FONT_X]] and </font> -> [[/FONT]]
  text = text.replace(/<font\s+[^>]*size="(\d+)"[^>]*>([\s\S]*?)<\/font>/gi, "[[FONT_$1]]$2[[/FONT]]");
  
  // Strip all other HTML tags
  text = text.replace(/<[^>]+>/g, "");
  
  // Restore font size tags
  text = text.replace(/\[\[FONT_(\d+)\]\]([\s\S]*?)\[\[\/FONT\]\]/g, '<font size="$1">$2</font>');
  
  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
    
  return text;
}
