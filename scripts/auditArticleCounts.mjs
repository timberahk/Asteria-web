import fs from 'node:fs';
import path from 'node:path';

const articlesFile = path.join(process.cwd(), 'lib', 'articlesData.ts');
const source = fs.readFileSync(articlesFile, 'utf8');

function extractPosts() {
  const marker = 'export const teachingPosts';
  const startMarker = source.indexOf(marker);
  const assignment = source.indexOf('=', startMarker);
  const arrayStart = source.indexOf('[', assignment);
  let depth = 0;
  let inString = false;
  let quote = '';
  let escaped = false;

  for (let index = arrayStart; index < source.length; index += 1) {
    const char = source[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        inString = false;
      }
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
      return Function(`"use strict"; return (${source.slice(arrayStart, index + 1)});`)();
    }
  }
  throw new Error('Cannot parse teachingPosts array.');
}

const chineseNumberMap = {
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10
};

const stripHtml = (html = '') => html
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();

const titleExpectedCount = (title = '') => {
  const digit = title.match(/([0-9]+)\s*(?:個|大|種|招|步|點|原因|誤區|方法|警號|重點)/)?.[1];
  if (digit) return Number(digit);
  const chinese = title.match(/([二三四五六七八九十])\s*(?:個|大|種|招|步|點|原因|誤區|方法|警號|重點)/)?.[1];
  return chinese ? chineseNumberMap[chinese] : 0;
};

const articleBodyBeforeFaq = (html = '') => html.split(/<h2[^>]*>\s*常見問題\s*<\/h2>/i)[0] || '';

const numberedHeadingInfo = (heading = '') => {
  const cleaned = heading.replace(/\s+/g, '');
  const match = cleaned.match(/^(?:原因|誤區|方法|重點|警號|Level|階段|Step)([0-9一二三四五六七八九十]+)/i);
  if (!match) return null;
  const raw = match[1];
  return Number(raw) || chineseNumberMap[raw] || null;
};

const issues = extractPosts().flatMap((post) => {
  const expectedCount = titleExpectedCount(post.title);
  if (!expectedCount) return [];

  const bodyHtml = articleBodyBeforeFaq(post.content);
  const bodyHeadings = Array.from(bodyHtml.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi))
    .map((match) => stripHtml(match[1]));
  const headingNumbers = bodyHeadings.map(numberedHeadingInfo).filter(Boolean);
  const maxNumber = headingNumbers.length ? Math.max(...headingNumbers) : 0;

  if (maxNumber && maxNumber !== expectedCount) {
    return [{
      id: post.id,
      title: post.title,
      expectedCount,
      headingNumbers,
      issue: `標題承諾 ${expectedCount} 點，但內文最大編號是 ${maxNumber}`
    }];
  }

  return [];
});

console.log(JSON.stringify(issues, null, 2));
console.log(`numeric title mismatch count: ${issues.length}`);
