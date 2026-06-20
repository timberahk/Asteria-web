import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(process.cwd(), 'lib', 'articlesData.ts'), 'utf8');

function findPostsArrayBounds(text) {
  const marker = 'export const teachingPosts';
  const startMarker = text.indexOf(marker);
  const assignment = text.indexOf('=', startMarker);
  const arrayStart = text.indexOf('[', assignment);
  let depth = 0;
  let inString = false;
  let quote = '';
  let escaped = false;
  for (let i = arrayStart; i < text.length; i += 1) {
    const char = text[i];
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
    if (depth === 0) return [arrayStart, i + 1];
  }
  throw new Error('Cannot parse teachingPosts array.');
}

function stripHtml(html = '') {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

const [arrayStart, arrayEnd] = findPostsArrayBounds(source);
const posts = Function(`"use strict"; return (${source.slice(arrayStart, arrayEnd)});`)();
const counts = new Map();
const ids = new Map();

for (const post of posts) {
  for (const match of post.content.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/g)) {
    const heading = stripHtml(match[1]);
    counts.set(heading, (counts.get(heading) || 0) + 1);
    ids.set(heading, [...(ids.get(heading) || []), post.id]);
  }
}

const repeated = [...counts]
  .filter(([heading, count]) => count > 3 && heading !== '常見問題')
  .sort((a, b) => b[1] - a[1])
  .map(([heading, count]) => ({ count, heading, ids: ids.get(heading) }));

console.log(JSON.stringify(repeated, null, 2));
