/* ============================================================
   MARKDOWN

   Content bodies are authored in markdown and rendered server-side.

   The `sanitize-html` step is not optional. Case-study bodies can
   contain raw HTML (an author pasting an embed), and markdown
   permits inline script. This content is trusted-ish — only the
   owner can write it — but "trusted-ish" is how stored XSS gets
   into a site that then has to explain itself.

   Allowed tags are a deliberate allow-list: enough for articles,
   nothing that can execute.
   ============================================================ */

import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

marked.setOptions({
  gfm: true,
  breaks: false,      // Blank-line paragraphs only; single newlines are soft wraps.
  headerIds: false,   // We generate our own anchor ids where needed.
  mangle: false,
});

const ALLOWED = {
  allowedTags: [
    'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr', 'strong', 'em', 'del', 's', 'sup', 'sub',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
    'a', 'img', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    code: ['class'],
    pre: ['class'],
    div: ['class'],
    span: ['class'],
    td: ['colspan', 'rowspan', 'align'],
    th: ['colspan', 'rowspan', 'align', 'scope'],
  },
  /* Only same-origin and https image sources. Blocks `javascript:`
     and data-URI payloads. */
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: { img: ['http', 'https'] },
  transformTags: {
    /* Any external link gets the rel it should always have had.
       Doing it here means an author cannot forget. */
    a: (tagName, attribs) => {
      const href = attribs.href || '';
      if (/^https?:\/\//i.test(href)) {
        return {
          tagName,
          attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer' },
        };
      }
      return { tagName, attribs };
    },
  },
};

/* Markdown → safe HTML. Returns '' for nullish input so templates
   can call it unconditionally. */
export function renderMarkdown(input) {
  if (!input) return '';
  const html = marked.parse(String(input));
  return sanitizeHtml(html, ALLOWED);
}

/* Markdown → plain text. Used for meta descriptions and RSS, where
   tags would be noise. */
export function markdownToText(input, limit = 0) {
  if (!input) return '';
  const html = marked.parse(String(input));
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim();
  if (limit > 0 && text.length > limit) {
    /* Cut at a word boundary — a description truncated mid-word
       looks broken in search results. */
    return text.slice(0, text.lastIndexOf(' ', limit)) + '…';
  }
  return text;
}

/* Rough reading time. 200 wpm is the conventional figure; we round
   up so nothing ever reads as "0 min read". */
export function readingTime(input) {
  const text = markdownToText(input);
  if (!text) return 1;
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/* First paragraph only — useful for auto-generating an excerpt
   when the author did not write one. */
export function firstParagraph(input) {
  const html = renderMarkdown(input);
  const match = html.match(/<p>(.*?)<\/p>/s);
  if (!match) return '';
  return sanitizeHtml(match[1], { allowedTags: [], allowedAttributes: {} });
}
