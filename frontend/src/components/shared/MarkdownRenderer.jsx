import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Parses inline markdown:
 * - **bold** or __bold__
 * - *italic* or _italic_
 * - ***bold italic***
 * - `inline code`
 * - [link label](url)
 */
export function renderInline(text) {
  if (!text) return null;

  const parts = [];
  const codeRegex = /`([^`]+)`/g;
  let lastIndex = 0;
  let match;

  while ((match = codeRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(...parseFormattedText(text.slice(lastIndex, match.index)));
    }
    parts.push(
      <code
        key={`code-${match.index}`}
        className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-xs font-medium text-primary"
      >
        {match[1]}
      </code>
    );
    lastIndex = codeRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(...parseFormattedText(text.slice(lastIndex)));
  }

  return parts;
}

function parseFormattedText(str) {
  const regex = /(\[\s*([^\]]+)\s*\]\(([^)]+)\)|\*\*\*([^*]+)\*\*\*|\*\*([^*]+)\*\*|__([^_]+)__|^\*([^*]+)\*|\*([^*]+)\*|_([^_]+)_)/g;
  const elements = [];
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIdx) {
      elements.push(str.slice(lastIdx, match.index));
    }

    const linkText = match[2];
    const linkUrl = match[3];
    const boldItalicText = match[4];
    const boldText = match[5] || match[6];
    const italicText = match[7] || match[8] || match[9];

    if (linkText && linkUrl) {
      elements.push(
        <a
          key={`link-${match.index}`}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
        >
          {linkText}
        </a>
      );
    } else if (boldItalicText) {
      elements.push(
        <strong key={`bi-${match.index}`} className="font-bold italic text-foreground">
          {boldItalicText}
        </strong>
      );
    } else if (boldText) {
      elements.push(
        <strong key={`b-${match.index}`} className="font-semibold text-foreground">
          {boldText}
        </strong>
      );
    } else if (italicText) {
      elements.push(
        <em key={`i-${match.index}`} className="italic text-foreground/90">
          {italicText}
        </em>
      );
    }

    lastIdx = regex.lastIndex;
  }

  if (lastIdx < str.length) {
    elements.push(str.slice(lastIdx));
  }

  return elements;
}

/**
 * Parses markdown text into structured blocks
 */
function parseMarkdownBlocks(rawContent) {
  if (!rawContent) return [];
  const lines = rawContent.split(/\r?\n/);
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Fenced Code Block: ```lang
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && lines[i].trim().startsWith("```")) {
        i++;
      }
      blocks.push({
        type: "code",
        lang,
        content: codeLines.join("\n"),
      });
      continue;
    }

    // 2. Table Block: | col | col |
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length > 0) {
        const rows = tableLines.map((tl) =>
          tl
            .split("|")
            .slice(1, -1)
            .map((c) => c.trim())
        );

        // Separate headers and data (skip separator row if present)
        let headers = [];
        let dataRows = [];
        if (rows.length >= 2 && rows[1].every((c) => /^[-:\s]+$/.test(c))) {
          headers = rows[0];
          dataRows = rows.slice(2);
        } else if (rows.length >= 1) {
          headers = rows[0];
          dataRows = rows.slice(1);
        }

        blocks.push({
          type: "table",
          headers,
          rows: dataRows,
        });
      }
      continue;
    }

    // 3. Horizontal Separator: --- or ***
    if (/^([-*_]){3,}$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // 4. Headings: #, ##, ###, ####
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      blocks.push({ type: `h${level}`, text });
      i++;
      continue;
    }

    // 5. Blockquote: > quote
    if (trimmed.startsWith(">")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ""));
        i++;
      }
      blocks.push({ type: "blockquote", text: quoteLines.join("\n") });
      continue;
    }

    // 6. Unordered List: - item or * item
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        const indentMatch = lines[i].match(/^(\s*)[-*]\s+(.+)$/);
        if (indentMatch) {
          const indent = indentMatch[1].length;
          const text = indentMatch[2].trim();
          items.push({ indent, text });
        }
        i++;
      }
      blocks.push({ type: "unordered_list", items });
      continue;
    }

    // 7. Ordered List: 1. item
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        const match = lines[i].match(/^\s*(\d+)\.\s+(.+)$/);
        if (match) {
          items.push({ number: match[1], text: match[2].trim() });
        }
        i++;
      }
      blocks.push({ type: "ordered_list", items });
      continue;
    }

    // 8. Key-Value Card Paragraph (if multiple lines formatted like "Label: Value" or "**Label**: Value")
    const paragraphLines = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("```") &&
      !(lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) &&
      !/^([-*_]){3,}$/.test(lines[i].trim()) &&
      !/^#{1,4}\s+/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith(">") &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      paragraphLines.push(lines[i].trim());
      i++;
    }

    if (paragraphLines.length > 0) {
      const fullText = paragraphLines.join("\n");

      // Check if lines are key-value pairs
      const isKvBlock =
        paragraphLines.length >= 2 &&
        paragraphLines.every((l) => {
          const clean = l.replace(/^\*\*(.*?)\*\*:?/, "$1:");
          return clean.includes(":") && clean.indexOf(":") > 0;
        });

      if (isKvBlock) {
        const pairs = paragraphLines.map((l) => {
          const clean = l.replace(/^\*\*(.*?)\*\*:?/, "$1:");
          const colonIdx = clean.indexOf(":");
          return {
            key: clean.slice(0, colonIdx).trim(),
            value: clean.slice(colonIdx + 1).trim(),
          };
        });
        blocks.push({ type: "kv_card", pairs });
      } else {
        blocks.push({ type: "paragraph", text: fullText });
      }
    }
  }

  return blocks;
}

export function MarkdownRenderer({ content, className = "" }) {
  if (!content || typeof content !== "string") return null;

  const blocks = parseMarkdownBlocks(content);

  return (
    <div className={cn("space-y-4 text-sm leading-relaxed text-foreground/90", className)}>
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-3 overflow-hidden rounded-xl border border-border/60 bg-slate-950 font-mono text-xs shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-2 text-slate-400">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
          {lang || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] hover:text-white transition-colors"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderBlock(block, index) {
  switch (block.type) {
    case "h1":
      return (
        <h1 key={index} className="mt-6 mb-3 border-b border-border/60 pb-2 text-xl font-bold tracking-tight text-foreground">
          {renderInline(block.text)}
        </h1>
      );
    case "h2":
      return (
        <h2 key={index} className="mt-5 mb-2.5 text-base font-semibold tracking-wide text-primary flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          {renderInline(block.text)}
        </h2>
      );
    case "h3":
      return (
        <h3 key={index} className="mt-4 mb-2 text-sm font-semibold text-foreground/95">
          {renderInline(block.text)}
        </h3>
      );
    case "h4":
      return (
        <h4 key={index} className="mt-3 mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {renderInline(block.text)}
        </h4>
      );
    case "hr":
      return <hr key={index} className="my-5 border-t border-border/60" />;
    case "code":
      return <CodeBlock key={index} code={block.content} lang={block.lang} />;
    case "table":
      return (
        <div key={index} className="my-4 overflow-x-auto rounded-xl border border-border/60 bg-muted/20 shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i} className="px-4 py-3">
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {block.rows.map((row, rIdx) => (
                <tr key={rIdx} className="transition-colors hover:bg-muted/30">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-2.5 text-foreground/90">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "blockquote":
      return (
        <blockquote key={index} className="my-3.5 rounded-r-xl border-l-4 border-primary/70 bg-primary/10 px-4 py-3 italic text-foreground/90">
          {block.text.split("\n").map((l, i) => (
            <p key={i}>{renderInline(l)}</p>
          ))}
        </blockquote>
      );
    case "unordered_list":
      return (
        <ul key={index} className="my-2.5 space-y-2 pl-1">
          {block.items.map((item, i) => (
            <li
              key={i}
              className={cn(
                "flex items-start gap-2.5 text-sm leading-7 text-foreground/90",
                item.indent > 0 && "ml-5 text-xs leading-6 text-foreground/80"
              )}
            >
              <span
                className={cn(
                  "shrink-0 rounded-full bg-primary/70",
                  item.indent > 0 ? "mt-2 h-1 w-1 bg-primary/50" : "mt-2.5 h-1.5 w-1.5"
                )}
              />
              <div className="flex-1">{renderInline(item.text)}</div>
            </li>
          ))}
        </ul>
      );
    case "ordered_list":
      return (
        <ol key={index} className="my-2.5 space-y-2 pl-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm leading-7 text-foreground/90">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[11px] font-semibold text-primary">
                {item.number}
              </span>
              <div className="flex-1">{renderInline(item.text)}</div>
            </li>
          ))}
        </ol>
      );
    case "kv_card":
      return (
        <div key={index} className="my-3 grid gap-2 rounded-xl border border-border/50 bg-muted/20 p-4 shadow-sm">
          {block.pairs.map((pair, i) => (
            <div key={i} className="flex flex-wrap items-baseline gap-2 text-sm">
              <span className="min-w-[140px] font-semibold text-foreground/80">{renderInline(pair.key)}:</span>
              <span className="flex-1 text-foreground/90">{renderInline(pair.value)}</span>
            </div>
          ))}
        </div>
      );
    case "paragraph":
    default:
      return (
        <p key={index} className="leading-7 text-foreground/90">
          {renderInline(block.text)}
        </p>
      );
  }
}

export default MarkdownRenderer;
