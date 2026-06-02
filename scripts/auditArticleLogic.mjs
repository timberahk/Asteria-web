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

const posts = extractPosts();
const issues = [];

const chineseNumberMap = {
  一: 1,
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

const articleBodyBeforeFaq = (html = '') => html.split(/<h2[^>]*>\s*常見問題\s*<\/h2>/i)[0] || '';

const normalizeForCompare = (value = '') => stripHtml(value)
  .replace(/[，。！？、：；「」『』（）\[\]\s]/g, '')
  .toLowerCase();

const titleExpectedCount = (title = '') => {
  const digit = title.match(/([0-9]+)\s*(?:個|大|種|招|步|點|原因|誤區|方法|警號|重點)/)?.[1];
  if (digit) return Number(digit);
  // Avoid false positives such as 「一個人靜下」 or 「差一點」;
  // only audit explicit list wording like 「三個方法」.
  const chinese = title.match(/([二三四五六七八九十])\s*(?:個|大|種|招|步|點|原因|誤區|方法|警號|重點)/)?.[1];
  return chinese ? chineseNumberMap[chinese] : 0;
};

const numberedHeadingInfo = (heading = '') => {
  const cleaned = heading.replace(/\s+/g, '');
  const match = cleaned.match(/^(?:原因|誤區|方法|重點|警號|Level)([0-9一二三四五六七八九十]+)/i);
  if (!match) return null;
  const raw = match[1];
  return Number(raw) || chineseNumberMap[raw] || null;
};

for (const post of posts) {
  const expectedCount = titleExpectedCount(post.title);
  const hs = headings(post.content);
  const bodyHtml = articleBodyBeforeFaq(post.content);
  const bodyHeadings = headings(bodyHtml);
  const content = stripHtml(post.content);
  const bodyText = stripHtml(bodyHtml);
  const firstParagraph = post.content.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] || '';

  const numericParagraphs = Array.from(post.content.matchAll(/<p[^>]*>\s*([0-9]+)\s*[.．、]/g)).map((match) => Number(match[1]));
  const headingNumbers = bodyHeadings
    .map(numberedHeadingInfo)
    .filter(Boolean)
    .map(Number);
  const allNumbers = [...numericParagraphs, ...headingNumbers];

  if (expectedCount) {
    const maxNumber = allNumbers.length ? Math.max(...allNumbers) : 0;
    if (maxNumber && maxNumber !== expectedCount) {
      issues.push({
        id: post.id,
        title: post.title,
        issue: `標題寫 ${expectedCount} 個/招/步，但內文最大編號是 ${maxNumber}`,
        numbers: allNumbers
      });
    }
    if (!maxNumber && bodyHeadings.length && expectedCount <= 8 && bodyHeadings.length < expectedCount) {
      issues.push({
        id: post.id,
        title: post.title,
        issue: `標題承諾 ${expectedCount} 點，但正文小標題只有 ${bodyHeadings.length} 個`,
        headings: bodyHeadings.slice(0, 8)
      });
    }
  }

  if (/(原因|誤區|方法|重點)2/.test(content) && !/(原因|誤區|方法|重點)1/.test(content)) {
    issues.push({
      id: post.id,
      title: post.title,
      issue: '有「原因/誤區/方法/重點2」但找不到 1',
      headings: hs.slice(0, 6)
    });
  }

  if (/如果還想修復關係，你可以先這樣做/.test(post.content) && /(原因|誤區|Level)\s*2/.test(content)) {
    issues.push({
      id: post.id,
      title: post.title,
      issue: '中途用 generic 修復標題，可能打斷原文 list',
      headings: hs.slice(0, 6)
    });
  }

  if (bodyText.length < 450) {
    issues.push({
      id: post.id,
      title: post.title,
      issue: `正文太短，FAQ 前只有 ${bodyText.length} 字左右`,
      headings: bodyHeadings.slice(0, 6)
    });
  }

  const faqIndex = post.content.indexOf('<h2>常見問題</h2>');
  if (faqIndex !== -1 && stripHtml(post.content.slice(0, faqIndex)).length < 650) {
    issues.push({
      id: post.id,
      title: post.title,
      issue: '常見問題出現太早，正文可能未完整',
      headings: bodyHeadings.slice(0, 6)
    });
  }

  if (normalizeForCompare(post.summary).length > 40 && normalizeForCompare(firstParagraph).startsWith(normalizeForCompare(post.summary).slice(0, 40))) {
    issues.push({
      id: post.id,
      title: post.title,
      issue: '首段疑似直接重複 summary',
      firstParagraph: stripHtml(firstParagraph).slice(0, 120)
    });
  }
}

console.log(JSON.stringify(issues, null, 2));
