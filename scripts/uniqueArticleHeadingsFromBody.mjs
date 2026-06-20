import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const filePath = path.resolve("lib/articlesData.ts");
const { teachingPosts } = await import(pathToFileURL(filePath).href + `?v=${Date.now()}`);

const typeBlock = `export type TeachingPost = {
  id: number;
  title: string;
  category: string;
  color: string;
  icon: string;
  imageLabel: string;
  summary: string;
  content: string;
  sourceIg: string;
  date: string;
  tags: string[];
  coverImage: string;
  coverCredit: string;
  coverCreditUrl: string;
  coverPrompt: string;
  images: Array<{ src: string; caption: string; credit: string; creditUrl: string; prompt: string }>;
  coverCaption: string;
  inlineCaption: string;
};

`;

const hardBanned = [
  "重點",
  "可以點做",
  "如果還想修復關係",
  "先守住不可退讓的位置",
  "記錄模式，而不是只靠當下感覺",
];

const stripHtml = (value = "") =>
  value
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const cleanHeading = (value) =>
  value
    .replace(/^[「『"'“”]+|[」』"'“”]+$/g, "")
    .replace(/^(如果|當|但|而|其實|真正|不要|別急著|先|可以|你可以|很多時候|很多時|有時|對方|你)\s*/g, "")
    .replace(/[：:，,；;。！？!?].*$/g, "")
    .replace(/\s+/g, "")
    .trim();

const topicFromTitle = (title) => {
  const cleaned = title
    .replace(/[【】\[\]]/g, "")
    .replace(/[:：？?！!].*$/g, "")
    .replace(/^\d+\s*個?/, "")
    .trim();
  return cleaned.slice(0, 10);
};

const shortText = (text, max = 18) => {
  if (text.length <= max) return text;
  return text.slice(0, max);
};

const keywordHeading = (paragraph, title, index) => {
  const text = stripHtml(paragraph);
  const topic = topicFromTitle(title);
  const sentence = text.split(/[。！？!?]/).find((part) => stripHtml(part).length >= 8) || text;
  const clause = sentence.split(/[，,；;]/).find((part) => stripHtml(part).length >= 8) || sentence;
  let base = cleanHeading(clause);

  if (base.length < 6) {
    base = cleanHeading(sentence);
  }

  if (base.length >= 8) {
    return shortText(base, 20);
  }

  if (/訊息|覆|已讀|冷淡|斷聯|聯絡/.test(text)) {
    return shortText(`${topic}先看訊息背後的狀態`, 22);
  }
  if (/第三者|新歡|曖昧|前任/.test(text)) {
    return shortText(`${topic}要先分清關係位置`, 22);
  }
  if (/情緒|焦慮|不安|失控|委屈|受傷/.test(text)) {
    return shortText(`${topic}先處理最痛的感受`, 22);
  }
  if (/界線|底線|原諒|傷害/.test(text)) {
    return shortText(`${topic}要看底線有沒有被尊重`, 22);
  }
  if (/溝通|說話|表達|語氣/.test(text)) {
    return shortText(`${topic}要換一種對方聽得入的講法`, 22);
  }
  if (/儀式|塔羅|占卜|能量/.test(text)) {
    return shortText(`${topic}先確認真正想推動的方向`, 22);
  }
  return shortText(`${topic}第${index + 1}個需要看清的位置`, 22);
};

const countHeadings = (posts) => {
  const counts = new Map();
  posts.forEach((post) => {
    for (const match of post.content.matchAll(/<h2>(.*?)<\/h2>/g)) {
      const heading = stripHtml(match[1]);
      if (heading === "常見問題") continue;
      counts.set(heading, (counts.get(heading) || 0) + 1);
    }
  });
  return counts;
};

let counts = countHeadings(teachingPosts);
const overused = new Set(
  [...counts.entries()]
    .filter(([heading, count]) => count >= 5 || hardBanned.some((term) => heading.includes(term)))
    .map(([heading]) => heading)
);

const used = new Set();
let changed = 0;

for (const post of teachingPosts) {
  let blockIndex = 0;
  const beforeFaq = post.content.split("<h2>常見問題</h2>")[0];
  const localHeadings = [];

  post.content = post.content.replace(/<h2>(.*?)<\/h2>\s*<p>([\s\S]*?)<\/p>/g, (match, rawHeading, paragraph) => {
    const heading = stripHtml(rawHeading);
    if (heading === "常見問題") return match;

    const shouldReplace =
      overused.has(heading) ||
      hardBanned.some((term) => heading.includes(term)) ||
      localHeadings.includes(heading);

    localHeadings.push(heading);

    if (!beforeFaq.includes(match) || !shouldReplace) {
      blockIndex += 1;
      used.add(heading);
      return match;
    }

    let nextHeading = keywordHeading(paragraph, post.title, blockIndex);
    if (used.has(nextHeading) || localHeadings.includes(nextHeading)) {
      const topic = topicFromTitle(post.title);
      const bodyBit = cleanHeading(stripHtml(paragraph).split(/[。！？!?]/)[0] || "");
      nextHeading = shortText(`${topic}：${bodyBit || `第${blockIndex + 1}個關鍵`}`, 24);
    }
    if (used.has(nextHeading)) {
      nextHeading = shortText(`${nextHeading}${blockIndex + 1}`, 24);
    }

    used.add(nextHeading);
    changed += 1;
    blockIndex += 1;
    return `<h2>${nextHeading}</h2>\n<p>${paragraph}</p>`;
  });
}

for (const post of teachingPosts) {
  if (post.id === 135 && stripHtml(post.content).length < 560) {
    post.content = post.content.replace(
      "<h2>常見問題</h2>",
      `<h2>把新鮮感放回日常互動</h2>
<p>愛情長久不一定靠很大的驚喜，而是靠兩個人願意持續更新相處方式。偶爾換一種約會、換一種稱讚、重新留意對方最近的壓力，都可以令關係少一點麻木，多一點被看見的感覺。</p>
<h2>常見問題</h2>`
    );
    changed += 1;
  }
}

const output = `${typeBlock}export const teachingPosts: TeachingPost[] = ${JSON.stringify(teachingPosts, null, 2)};\n`;
fs.writeFileSync(filePath, output);
console.log(`Updated ${changed} article headings/sections.`);
