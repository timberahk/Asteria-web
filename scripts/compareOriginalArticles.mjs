import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const articlesFile = path.join(repoRoot, 'lib', 'articlesData.ts');
const originalsRoot = '/Users/dorothy/Documents/asteria 所有教學文/愛情拯救所 教學文';

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

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (!entry.isFile() || !/\.md$/i.test(entry.name)) return [];
    return [fullPath];
  });
}

function stripHtml(html = '') {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalize(text = '') {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[a-z0-9_]+/g, ' ')
    .replace(/[【】\[\]（）()「」『』：:？?！!，,。.、／/\\|＋+＊*#~\-—–_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(text = '') {
  const clean = normalize(text);
  const words = clean.match(/[\u4e00-\u9fff]{2}|[\u4e00-\u9fff]{3}|[a-z]+/gi) || [];
  return new Set(words.filter((word) => word.length > 1));
}

function score(a, b) {
  const aTokens = tokens(a);
  const bTokens = tokens(b);
  if (!aTokens.size || !bTokens.size) return 0;
  let overlap = 0;
  for (const token of aTokens) if (bTokens.has(token)) overlap += 1;
  return overlap / Math.sqrt(aTokens.size * bTokens.size);
}

function titleFromFile(filePath, body) {
  const nameTitle = path.basename(filePath, '.md')
    .replace(/\s+[0-9a-f]{16,}$/i, '')
    .replace(/\s+AI 摘要.*$/i, '')
    .replace(/\s+用途：.*$/i, '')
    .trim();
  const heading = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return heading || nameTitle;
}

const posts = extractPosts();
const originals = walk(originalsRoot).map((filePath) => {
  const raw = fs.readFileSync(filePath, 'utf8');
  return {
    filePath,
    title: titleFromFile(filePath, raw),
    text: normalize(raw),
  };
});

const rows = posts.map((post) => {
  const body = stripHtml(post.content || '');
  const matchCandidates = originals
    .map((original) => ({
      original,
      titleScore: score(post.title, original.title),
      bodyScore: score(`${post.title} ${post.summary} ${body}`, `${original.title} ${original.text}`),
    }))
    .sort((a, b) => (b.titleScore * 2 + b.bodyScore) - (a.titleScore * 2 + a.bodyScore));
  const best = matchCandidates[0];
  const titleNumbers = [...post.title.matchAll(/\d+/g)].map((m) => m[0]).join(',');
  const headingNumbers = [...body.matchAll(/(?:^|\s)(\d+)\s*[個大]?/g)].map((m) => m[1]).join(',');
  return {
    id: post.id,
    title: post.title,
    bodyLength: body.length,
    matchedTitle: best?.original.title || '',
    titleScore: Number(best?.titleScore.toFixed(2) || 0),
    bodyScore: Number(best?.bodyScore.toFixed(2) || 0),
    originalFile: best?.original.filePath || '',
    titleNumbers,
    headingNumbers,
  };
});

const suspicious = rows.filter((row) =>
  row.bodyLength < 900 ||
  row.bodyScore < 0.28 ||
  (row.titleNumbers && row.headingNumbers && !row.headingNumbers.includes(row.titleNumbers.split(',')[0]))
);

console.log(JSON.stringify({
  siteArticles: posts.length,
  originalFiles: originals.length,
  suspiciousCount: suspicious.length,
  suspicious: suspicious.slice(0, 80),
}, null, 2));
