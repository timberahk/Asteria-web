import { teachingPosts } from '../lib/articlesData.ts';

const stripHtml = (html = '') => html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

const textFromHtml = (html = '') => stripHtml(html)
  .replace(/\s+/g, ' ')
  .trim();

const extractBlocks = (html = '') => {
  const blocks = [];
  const regex = /<(h[123]|p|li)[^>]*>([\s\S]*?)<\/\1>/gi;
  for (const match of html.matchAll(regex)) {
    blocks.push({
      tag: match[1],
      text: stripHtml(match[2])
    });
  }
  return blocks.filter((block) => block.text);
};

const suspiciousPatterns = [
  [/�|\uFFFD/u, 'replacement character / mojibake'],
  [/[<>](?:br|aside|b|strong)\b|&lt;|&gt;/i, 'raw HTML fragment'],
  [/又者|或又者|又或者者|又或姐|又或着/u, '又者/或者 typo'],
  [/曾同講過|會唔會曾同|曾經有呢個迷思/u, 'unnatural 曾同/曾經 phrasing'],
  [/令會呢段|令會.+?(?:關係|感情)/u, '令會 typo'],
  [/Check佢了|了唔了解|句慢地|時間耐咗了/u, 'broken Cantonese particle'],
  [/自為何乜|為何乜|未得嫁出|世伯伯母|分辦|轉彎末角/u, 'known typo'],
  [/你同另[一半]*。|其實當。|但你真係。|Deep Ta。|喺戀愛初。|搵fr。/u, 'cut-off sentence'],
  [/文中會拆解.*?(?:分手後|溝通卡住|背後心理).*$/u, 'generic meta tail'],
  [/不要只看單一說話|重點是分清這是短暫情緒/u, 'generic generated intro'],
  [/常見問題：|延伸提醒|即刻Click|了解更多|WHATSAPP_LINK/u, 'CTA/internal residue'],
  [/圖片建議|Credit:|Photo by .*Pexels.*Photo by/u, 'image/admin residue'],
  [/（建議呢版|建議呢版|表列形式|Visual\)|Sorry to say/u, 'editorial note residue'],
  [/(.)\1{5,}/u, 'repeated character'],
  [/[A-Za-z]{2,}(?:\s+[A-Za-z]{2,}){5,}/u, 'long English residue'],
  [/^\d+[.．、]\s*.+[。！？]?\s*\d+[.．、]/u, 'multiple numbered points in one paragraph'],
  [/^[-*]\s*$/u, 'empty list item'],
];

const awkwardPatterns = [
  [/^你，/u, 'starts with odd comma after 你'],
  [/^但係，|^所以，|^而且，/u, 'sentence starts with formal comma'],
  [/，。|、。|：。|？。|！。/u, 'bad punctuation pair'],
  [/[。！？][^\S\r\n]*[，、]/u, 'punctuation order'],
  [/[一-龥] [一-龥]/u, 'space between Chinese characters'],
  [/我哋幫手做吓儀式|做吓儀式/u, 'hard-sell ritual phrasing'],
  [/close file|Must|Shopping|Checklist|Deep Talk|Fact Check Point|Deduct Marks/u, 'English term to review'],
  [/得稱讚|唔好令讓|機會走出|你條腰|咁那樣|為了快樂/u, 'awkward wording'],
];

const titlePatterns = [
  [/[?？!！]\s*[?？!！]/u, 'duplicated punctuation'],
  [/(?<!【)分手真相】/u, 'missing opening bracket'],
  [/突你破解/u, 'title typo'],
  [/野/u, 'title uses 野; review if should be 嘢'],
  [/\s{2,}/u, 'extra spaces'],
];

const issues = [];

for (const post of teachingPosts) {
  for (const [pattern, label] of titlePatterns) {
    if (pattern.test(post.title)) {
      issues.push({ id: post.id, title: post.title, area: 'title', label, text: post.title });
    }
  }

  for (const [pattern, label] of suspiciousPatterns) {
    if (pattern.test(post.summary)) {
      issues.push({ id: post.id, title: post.title, area: 'summary', label, text: post.summary });
    }
  }

  const blocks = extractBlocks(post.content);
  for (const block of blocks) {
    const patterns = block.tag.startsWith('h') ? [...suspiciousPatterns, ...awkwardPatterns] : suspiciousPatterns;
    for (const [pattern, label] of patterns) {
      if (pattern.test(block.text)) {
        issues.push({
          id: post.id,
          title: post.title,
          area: block.tag,
          label,
          text: block.text.slice(0, 260)
        });
      }
    }
  }

  const body = textFromHtml(post.content);
  const sentences = body.split(/(?<=[。！？!?])/u).map((part) => part.trim()).filter(Boolean);
  for (const sentence of sentences) {
    const tail = sentence.replace(/[。！？!?]+$/u, '').trim();
    if (tail.length > 0 && tail.length < 7 && !/^(常見問題|有冇試過|可以|唔一定|有機會係|會|小心|記住|錯了|清醒吧)$/u.test(tail)) {
      issues.push({ id: post.id, title: post.title, area: 'sentence', label: 'very short sentence to review', text: sentence });
    }
  }
}

const grouped = new Map();
for (const issue of issues) {
  if (!grouped.has(issue.id)) grouped.set(issue.id, []);
  grouped.get(issue.id).push(issue);
}

const sorted = [...grouped.entries()].sort((a, b) => a[0] - b[0]);
for (const [id, rows] of sorted) {
  const title = rows[0]?.title || '';
  console.log(`\n# ${id} ${title}`);
  for (const row of rows.slice(0, 20)) {
    console.log(`- ${row.area} | ${row.label} | ${row.text}`);
  }
  if (rows.length > 20) console.log(`- ... ${rows.length - 20} more`);
}

console.log(`\nTOTAL_ARTICLES_WITH_ISSUES=${sorted.length}`);
console.log(`TOTAL_ISSUES=${issues.length}`);
