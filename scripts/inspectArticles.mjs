import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const articlesFile = path.join(repoRoot, 'lib', 'articlesData.ts');

function extractPosts() {
  const source = fs.readFileSync(articlesFile, 'utf8');
  const marker = 'export const teachingPosts';
  const startMarker = source.indexOf(marker);
  if (startMarker === -1) throw new Error('Cannot find teachingPosts export.');
  const assignment = source.indexOf('=', startMarker);
  const arrayStart = source.indexOf('[', assignment);
  let depth = 0;
  let inString = false;
  let quote = '';
  let escaped = false;
  for (let i = arrayStart; i < source.length; i += 1) {
    const char = source[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) inString = false;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      inString = true;
      quote = char;
      continue;
    }
    if (char === '[') depth += 1;
    if (char === ']') depth -= 1;
    if (depth === 0) {
      return Function(`"use strict"; return (${source.slice(arrayStart, i + 1)});`)();
    }
  }
  throw new Error('Cannot parse teachingPosts array.');
}

function stripHtml(html = '') {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function headings(html = '') {
  return Array.from(html.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi)).map((match) => stripHtml(match[1]));
}

const ids = process.argv.slice(2).map(Number).filter(Boolean);
const posts = extractPosts().filter((post) => !ids.length || ids.includes(post.id));

for (const post of posts) {
  const beforeFaq = post.content.split(/<h2[^>]*>\s*常見問題\s*<\/h2>/i)[0] || '';
  console.log(`\n#${post.id} ${post.title}`);
  console.log(`summary: ${post.summary}`);
  console.log(`headings: ${headings(beforeFaq).join(' | ')}`);
  console.log(`body: ${stripHtml(beforeFaq).slice(0, 1200)}`);
}
