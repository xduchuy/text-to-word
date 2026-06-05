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
  | { type: "table"; headers: string[]; rows: string[][] };

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
      inCodeBlock = true;
      codeLanguage = trimmed.slice(3).trim();
      continue;
    }
    // 2. Handle Quotes
    if (trimmed.startsWith(">")) {
      if (!inQuote) {
        commitPendingBlocks();
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
        pendingTableHeader = cells;
        // Check if next line is a table divider to confirm it's a table
        const nextLine = lines[i + 1];
        if (nextLine && isTableDivider(nextLine)) {
          // Yes, it will be a table. We keep pendingTableHeader.
        } else {
          // Not a table, just a single line containing pipes. Parse as regular paragraph immediately.
          blocks.push({
            type: "paragraph",
            text: line,
          });
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
      currentListType = "bullet";
      currentListItems.push(itemText);
      continue;
    } else if (numberedMatch) {
      const itemText = numberedMatch[2].trim();
      if (currentListType === "bullet") {
        commitPendingBlocks();
      }
      currentListType = "numbered";
      currentListItems.push(itemText);
      continue;
    } else if (currentListType) {
      // List ended
      commitPendingBlocks();
    }

    // 5. Handle Headings
    if (trimmed.startsWith("# ")) {
      commitPendingBlocks();
      blocks.push({
        type: "heading1",
        text: trimmed.slice(2).trim(),
      });
      continue;
    }

    if (trimmed.startsWith("## ")) {
      commitPendingBlocks();
      blocks.push({
        type: "heading2",
        text: trimmed.slice(3).trim(),
      });
      continue;
    }

    if (trimmed.startsWith("### ")) {
      commitPendingBlocks();
      blocks.push({
        type: "heading3",
        text: trimmed.slice(4).trim(),
      });
      continue;
    }

    // 6. Empty Lines
    if (trimmed === "") {
      commitPendingBlocks();
      continue;
    }

    // 7. Auto-detect Title or Paragraph
    commitPendingBlocks();
    
    // First non-empty line of the document becomes the title automatically, unless already detected
    if (!hasDetectedTitle && blocks.length === 0) {
      blocks.push({
        type: "title",
        text: trimmed,
      });
      hasDetectedTitle = true;
    } else {
      // Regular paragraph
      blocks.push({
        type: "paragraph",
        text: line,
      });
    }
  }

  // Final commits
  commitPendingBlocks();

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
        case "table":
          const headerRow = `| ${block.headers.join(" | ")} |`;
          const dividerRow = `| ${block.headers.map(() => "---").join(" | ")} |`;
          const dataRows = block.rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
          return `${headerRow}\n${dividerRow}\n${dataRows}`;
        default:
          return "";
      }
    })
    .join("\n\n");
}
