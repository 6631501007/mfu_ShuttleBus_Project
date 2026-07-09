#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(process.argv[2] || ".");
const inputPath = path.join(root, "docs", "tasks", "tasklist-progress.md");
const outputPath = path.join(root, "docs", "tasks", "tasklist-progress.html");

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function renderMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let paragraph = [];
  let listOpen = false;

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };

  const closeList = () => {
    if (listOpen) {
      html.push("</ul>");
      listOpen = false;
    }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (!line.trim()) {
      flushParagraph();
      closeList();
      continue;
    }

    if (line.startsWith("# ")) {
      flushParagraph();
      closeList();
      html.push(`<h1>${inlineMarkdown(line.slice(2).trim())}</h1>`);
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      closeList();
      html.push(`<h2>${inlineMarkdown(line.slice(3).trim())}</h2>`);
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      html.push(`<li>${inlineMarkdown(line.slice(2).trim())}</li>`);
      continue;
    }

    if (line.startsWith("|") && lines[i + 1]?.startsWith("|")) {
      flushParagraph();
      closeList();

      const headers = line.split("|").slice(1, -1).map((cell) => cell.trim());
      i += 1;
      const rows = [];
      while (lines[i + 1]?.startsWith("|")) {
        i += 1;
        rows.push(lines[i].split("|").slice(1, -1).map((cell) => cell.trim()));
      }

      html.push("<table>");
      html.push(`<thead><tr>${headers.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("")}</tr></thead>`);
      html.push("<tbody>");
      for (const row of rows) {
        html.push(`<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`);
      }
      html.push("</tbody></table>");
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  closeList();
  return html.join("\n");
}

if (!fs.existsSync(inputPath)) {
  console.error(`Missing input: ${inputPath}`);
  process.exit(1);
}

const markdown = fs.readFileSync(inputPath, "utf8");
const body = renderMarkdown(markdown);
const document = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tasklist Progress</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.5; margin: 32px; color: #172033; }
    h1 { font-size: 28px; margin-bottom: 16px; }
    h2 { font-size: 20px; margin-top: 28px; border-bottom: 1px solid #d9e1ec; padding-bottom: 6px; }
    table { border-collapse: collapse; width: 100%; margin: 12px 0 20px; font-size: 14px; }
    th, td { border: 1px solid #d9e1ec; padding: 8px 10px; text-align: left; vertical-align: top; }
    th { background: #f5f7fb; }
    code { background: #eef2f7; padding: 1px 4px; border-radius: 4px; }
  </style>
</head>
<body>
${body}
</body>
</html>
`;

fs.writeFileSync(outputPath, document);
console.log(`Rendered ${path.relative(root, outputPath)}`);
