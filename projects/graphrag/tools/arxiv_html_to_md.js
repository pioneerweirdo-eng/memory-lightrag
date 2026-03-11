#!/usr/bin/env node
/**
 * Fetch arXiv HTML and convert to Markdown.
 *
 * Why: this environment lacks PDF text extractors (no pdftotext, no python venv/ensurepip).
 * This is a pragmatic, low-risk path to get .md content for the sidecar index.
 */

const fs = require('fs/promises');
const path = require('path');

const TurndownService = require('turndown');

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  return await res.text();
}

function stripJunk(html) {
  // remove scripts/styles and some nav junk
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--([\s\S]*?)-->/g, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '');
}

function htmlToMd(html) {
  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
  });

  // Keep math-ish spans as text
  turndown.keep(['span', 'math', 'semantics', 'annotation', 'mjx-container', 'mjx-assistive-mml']);

  const cleaned = stripJunk(html);
  let md = turndown.turndown(cleaned);

  // Very light cleanup
  md = md
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+$/gm, '')
    .trim();

  return md;
}

function guessArxivId(url) {
  const m = url.match(/arxiv\.org\/(?:html|abs)\/(\d{4}\.\d{5})(?:v\d+)?/);
  return m ? m[1] : null;
}

async function main() {
  const args = process.argv.slice(2);
  const url = args[0];
  const outPath = args[1];
  if (!url || !outPath) {
    console.error('Usage: arxiv_html_to_md.js <arxiv_html_url> <out_md_path>');
    process.exit(2);
  }

  const html = await fetchText(url);
  const mdBody = htmlToMd(html);
  const arxivId = guessArxivId(url);

  const md = [
    `---`,
    `source: ${url}`,
    arxivId ? `arxiv: ${arxivId}` : null,
    `downloaded_at: ${new Date().toISOString()}`,
    `---`,
    '',
    mdBody,
    '',
  ].filter(Boolean).join('\n');

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, md, 'utf8');
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
