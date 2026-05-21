import fs from 'node:fs';
import path from 'node:path';

const sourceDir = '/Users/dorothy/Documents/asteria 所有教學文/backup/愛情拯救所 教學文/web_ready';
const repoRoot = path.resolve(import.meta.dirname, '..');
const outFile = path.join(repoRoot, 'lib', 'articlesData.ts');
const imageDir = path.join(repoRoot, 'public', 'article-photos');
const promptsFile = path.join(repoRoot, 'scripts', 'article-image-prompts.jsonl');
const sitemapFile = path.join(repoRoot, 'public', 'sitemap.xml');

const colorThemes = [
  { bg: '#FFF3D6', accent: '#A65F2B', soft: '#F7D6A0', dark: '#4A2E20' },
  { bg: '#FDE7E2', accent: '#B75A52', soft: '#F8B9AC', dark: '#4A2E20' },
  { bg: '#E8F4F1', accent: '#3F817A', soft: '#BFE2DC', dark: '#263F42' },
  { bg: '#F6E7D8', accent: '#7B4A2D', soft: '#D9A77F', dark: '#3D2A20' },
  { bg: '#EDF0F7', accent: '#546C9E', soft: '#BFC9E5', dark: '#263047' },
  { bg: '#F8EAF1', accent: '#A95577', soft: '#E5B8CB', dark: '#452637' },
  { bg: '#EEF5DD', accent: '#6F8752', soft: '#C9DCA5', dark: '#354128' },
  { bg: '#FDF4EA', accent: '#C2733D', soft: '#F2C08F', dark: '#442C1E' }
];

const icons = [
  'fa-solid fa-heart',
  'fa-regular fa-comments',
  'fa-solid fa-heart-crack',
  'fa-solid fa-hand-holding-heart',
  'fa-solid fa-route',
  'fa-solid fa-compass',
  'fa-solid fa-magnifying-glass-heart',
  'fa-solid fa-shield-heart'
];

const colors = [
  'bg-asteria-yellow/50',
  'bg-[#FFE7DD]',
  'bg-asteria-pink/60',
  'bg-asteria-blue/60',
  'bg-[#E7F4F2]',
  'bg-[#F6E7D8]',
  'bg-[#EEF5DD]',
  'bg-[#EDF0F7]'
];

const escapeHtml = (value = '') => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const escapeAttr = escapeHtml;

const stripSeoSuffix = (title = '') => title
  .replace(/｜.*$/, '')
  .replace(/\s+\|\s+.*$/, '')
  .trim();

const cleanTitle = (title = '') => stripSeoSuffix(title)
  .replace(/^[\s【\[][^】\]]{1,18}[】\]]\s*/g, '')
  .replace(/\s*[【\[]\s*(AI\s*)?摘要.*?[】\]]\s*/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const normalizeText = (value = '') => value
  .replace(/<[^>]+>/g, '')
  .replace(/[，。！？、：；「」『』（）\[\]\s]/g, '')
  .toLowerCase();

const cleanDescription = (value = '') => value
  .replace(/遇到「.*?」這種感情難題時，最怕急著用情緒做決定。\s*/g, '')
  .replace(/本文從.*?角度拆解關係訊號、應對方法與挽回前要留意的重點。?/g, '')
  .replace(/\s+/g, ' ')
  .trim();

const parseFrontmatter = (raw) => {
  if (!raw.startsWith('---')) return [{}, raw];
  const end = raw.indexOf('\n---', 3);
  if (end < 0) return [{}, raw];
  const block = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).trim();
  const data = {};
  let currentKey = null;
  for (const line of block.split(/\r?\n/)) {
    const keyMatch = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      const value = keyMatch[2].trim();
      if (!value) {
        data[currentKey] = [];
      } else {
        data[currentKey] = value.replace(/^['"]|['"]$/g, '');
      }
      continue;
    }
    const listMatch = line.match(/^\s*-\s*["']?(.*?)["']?\s*$/);
    if (listMatch && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(listMatch[1]);
    }
  }
  return [data, body];
};

const parseIndex = () => {
  const indexPath = path.join(sourceDir, '_INDEX.md');
  const raw = fs.readFileSync(indexPath, 'utf8');
  const order = [];
  const titles = new Map();
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^- \[(.+?)\]\((.+?)\)/);
    if (!match) continue;
    const title = match[1].trim();
    const rawFilename = match[2].trim();
    let filename = rawFilename;
    try {
      filename = decodeURIComponent(rawFilename);
    } catch {
      filename = rawFilename;
    }
    order.push(filename);
    titles.set(filename, title);
  }
  return { order, titles };
};

const inferCategory = (title, frontmatterCategory = '') => {
  const text = `${title} ${frontmatterCategory}`;
  if (/復合|挽回|前任|分手後|斷聯|block|冷淡/.test(text)) return '復合挽回';
  if (/溝通|訊息|說話|講嘢|勸|道歉|冷戰|表達|分享/.test(text)) return '溝通相處';
  if (/安全感|不安|情緒|失戀|治癒|自信|焦慮|內心|委屈/.test(text)) return '情緒修復';
  if (/曖昧|約會|單身|桃花|吸引|主動|矜持|追求/.test(text)) return '曖昧桃花';
  if (/出軌|第三者|變心|新歡|欺騙|冷暴力|家暴|操控|PUA|渣男/.test(text)) return '關係危機';
  if (/結婚|同居|見家長|辦公室|Long D|遠距/.test(text)) return '長期關係';
  return frontmatterCategory || '戀愛心理';
};

const imageLabelFor = (title, category) => {
  const map = {
    '復合挽回': '復合',
    '溝通相處': '溝通',
    '情緒修復': '療癒',
    '曖昧桃花': '曖昧',
    '關係危機': '警號',
    '長期關係': '長久',
    '戀愛心理': '心理'
  };
  if (map[category]) return map[category];
  return title.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, '').slice(0, 4) || '愛情';
};

const formatInline = (text) => {
  let value = escapeHtml(text.trim());
  value = value.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  value = value.replace(/\[(.+?)\]\((.+?)\)/g, '<mark>$1</mark>');
  value = value.replace(/「([^」]{2,24})」/g, '「<strong>$1</strong>」');
  return value;
};

const formatParagraph = (text) => {
  const value = text.trim();
  const factMatch = value.match(/^(真相[:：]?)(.+?)\s+Fact Check Point\s+(.+)$/i);
  if (factMatch) {
    return `<div class="article-insight">
      <div class="article-insight-label">真相</div>
      <p>${formatInline(factMatch[2])}</p>
      <div class="article-insight-label article-insight-label-soft">Fact Check Point</div>
      <p>${formatInline(factMatch[3])}</p>
    </div>`;
  }
  if (/^Fact Check Point\s+/i.test(value)) {
    return `<div class="article-insight article-insight-soft">
      <div class="article-insight-label">Fact Check Point</div>
      <p>${formatInline(value.replace(/^Fact Check Point\s+/i, ''))}</p>
    </div>`;
  }
  if (/^(重點|建議|小提醒|留意)[:：]/.test(value)) {
    return `<p class="article-keyline">${formatInline(value)}</p>`;
  }
  return `<p>${formatInline(value)}</p>`;
};

const shouldSkipLine = (line) => {
  const trimmed = line.trim();
  return (
    /^!\[.*?\]\(IMAGE_PLACEHOLDER/i.test(trimmed) ||
    /^-\s*\[.+?\]\(.+?\)\s*$/.test(trimmed) ||
    /^\[.+?\]\(.+?\)\s*$/.test(trimmed) ||
    /^https?:\/\//i.test(trimmed) ||
    /WHATSAPP_LINK_HERE/.test(trimmed) ||
    /^(admin|remark|remarks|內部備註|備註|後台)[:：]/i.test(trimmed) ||
    /^>\s*圖片建議/.test(trimmed) ||
    /^>\s*Credit/.test(trimmed) ||
    /^圖片｜/.test(trimmed) ||
    /^<!--.*-->$/.test(trimmed) ||
    /^同場加映[:：]?$/.test(trimmed) ||
    /^在關係裡，最令人痛苦的往往不是一件事本身/.test(trimmed) ||
    /^這篇文章會用\s*\*\*?.*?\*\*?\s*的角度/.test(trimmed) ||
    /^有些關係不是突然變壞/.test(trimmed) ||
    /^>\s*有些關係不是突然變壞/.test(trimmed) ||
    /^當你遇到「.*?」這種感情狀況/.test(trimmed) ||
    /^>\s*$/.test(trimmed) ||
    /^\[WhatsApp 聯絡我哋\]/.test(trimmed) ||
    /^所有感情問題/.test(trimmed) ||
    /^本文屬感情心理/.test(trimmed)
  );
};

const cleanMarkdown = (body, title) => {
  const lines = body.split(/\r?\n/);
  const out = [];
  let skipSection = null;
  for (const line of lines) {
    const trimmed = line.trim();
    const heading = trimmed.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      const headingText = heading[2].replace(/^#\s*/, '').trim();
      if (/^(你以為只是小事，其實是關係正在發出的訊號|關係卡住時，問題通常不只是一句說話)$/.test(headingText)) {
        continue;
      }
      if (/^(相關延伸閱讀|相關文章|延伸閱讀|你可能還想看|想知道這段關係下一步點行|如果你想挽回，先讓自己停一停)/.test(headingText)) {
        skipSection = heading[1].length;
        continue;
      }
      if (skipSection && heading[1].length <= skipSection) {
        skipSection = null;
      }
    }
    if (skipSection) continue;
    if (shouldSkipLine(line)) continue;
    if (/^#\s+/.test(trimmed)) {
      const h1 = trimmed.replace(/^#\s+/, '').trim();
      if (stripSeoSuffix(h1) === stripSeoSuffix(title) || h1.length < 24) continue;
    }
    if (/^##\s+#/.test(trimmed)) continue;
    out.push(line);
  }
  return out.join('\n').trim();
};

const removeDuplicateIntro = (markdown, summary) => {
  if (!summary) return markdown;
  const summaryKey = normalizeText(summary).slice(0, 56);
  if (summaryKey.length < 18) return markdown;
  const lines = markdown.split(/\r?\n/);
  const out = [];
  let removed = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!removed && trimmed && !/^#{2,4}\s+/.test(trimmed) && normalizeText(trimmed).includes(summaryKey)) {
      removed = true;
      continue;
    }
    out.push(line);
  }
  return out.join('\n').replace(/^\s+/, '').trim();
};

const markdownToHtml = (markdown) => {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let paragraph = [];
  let list = [];

  const flushParagraph = () => {
    const text = paragraph.join('<br />').trim();
    if (text) html.push(formatParagraph(text));
    paragraph = [];
  };

  const flushList = () => {
    if (list.length) {
      html.push(`<ul>${list.map((item) => `<li>${formatInline(item)}</li>`).join('')}</ul>`);
      list = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const text = heading[2].replace(/^#\s*/, '').trim();
      if (level <= 2) {
        html.push(`<h2>${formatInline(text)}</h2>`);
      } else {
        html.push(`<h3>${formatInline(text)}</h3>`);
      }
      continue;
    }
    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      continue;
    }
    if (/^>\s+/.test(line)) {
      flushParagraph();
      flushList();
      html.push(`<blockquote>${formatInline(line.replace(/^>\s+/, ''))}</blockquote>`);
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return html.join('\n');
};

const stripFaqForSummary = (html = '') => html
  .replace(/<h2>常見問題<\/h2>[\s\S]*$/g, '')
  .replace(/<h3>這種感情狀況是不是代表關係快完結？<\/h3>[\s\S]*$/g, '')
  .trim();

const isFaqLikeSummary = (value = '') => (
  /^常見問題\b/.test(value) ||
  /這種感情狀況是不是代表關係快完結/.test(value) ||
  /我應該主動修補/.test(value) ||
  /什麼時候適合做愛情占卜/.test(value)
);

const excerptFrom = (html, fallback) => {
  const plain = stripFaqForSummary(html)
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return (plain || fallback).slice(0, 130);
};

const buildFallbackSummary = (title, category) => {
  const topic = title.replace(/[？?].*$/, '').trim() || title;
  const categoryText = category || '感情相處';
  return `如果你正面對「${topic}」呢類感情狀況，可以先用${categoryText}角度整理對方心態、關係卡位同下一步做法。`;
};

const makeSummary = ({ frontmatter, preliminaryContent, title, category }) => {
  const fromDescription = cleanDescription(frontmatter.description || '');
  const candidate = fromDescription || excerptFrom(preliminaryContent, title);
  const normalized = candidate.replace(/\s+/g, ' ').trim();
  if (!normalized || isFaqLikeSummary(normalized) || normalizeText(normalized) === normalizeText(title)) {
    return buildFallbackSummary(title, category).slice(0, 150);
  }
  return normalized.slice(0, 150);
};

const wrapSvgText = (text, maxChars = 12, maxLines = 4) => {
  const chars = [...text.replace(/\s+/g, '')];
  const lines = [];
  while (chars.length && lines.length < maxLines) {
    lines.push(chars.splice(0, maxChars).join(''));
  }
  return lines;
};

const photoScenarioFor = (title, category, slot) => {
  const text = `${title} ${category}`;
  if (/分手|失戀|放低|前任|復合|挽回|斷聯|block|冷淡/.test(text)) {
    return [
      'a cinematic photorealistic couple standing apart on a quiet city street at dusk, emotional distance, warm film grain',
      'a young woman alone by a window holding a phone, late night heartbreak mood, soft warm interior light',
      'a couple sitting across a cafe table after a difficult conversation, subtle tension, natural documentary style'
    ][slot % 3];
  }
  if (/溝通|訊息|說話|講嘢|道歉|冷戰|分享|勸/.test(text)) {
    return [
      'a couple having a sincere conversation at a small cafe table, hands near cups, gentle daylight, photorealistic',
      'close-up of a phone on a bed with an unread message, soft bedroom light, relationship communication mood',
      'a couple sitting on a sofa talking calmly after an argument, warm home atmosphere, realistic lifestyle photo'
    ][slot % 3];
  }
  if (/曖昧|約會|單身|桃花|吸引|主動|追求/.test(text)) {
    return [
      'a couple on an early date walking through a softly lit city street, shy romantic tension, realistic photo',
      'two people sitting side by side at a coffee shop, almost touching hands, ambiguous relationship mood',
      'a woman getting ready before a date, mirror reflection, soft warm light, confident romantic mood'
    ][slot % 3];
  }
  if (/出軌|第三者|變心|新歡|欺騙|操控|PUA|渣男|危機/.test(text)) {
    return [
      'a tense couple in a dim apartment, one person looking away while the other holds a phone, realistic cinematic photo',
      'a woman sitting alone on a bed after discovering a painful message, moody soft light, documentary style',
      'a couple walking in opposite directions under street lights, emotional distance, photorealistic'
    ][slot % 3];
  }
  return [
    'a warm photorealistic couple portrait during golden hour, intimate but tasteful, natural lifestyle photography',
    'a couple sitting together quietly near a window, peaceful relationship reflection, soft film photography',
    'two people walking side by side in a park at sunset, gentle romantic relationship mood, realistic photo'
  ][slot % 3];
};

const buildImagePrompt = (article, slot, kind) => {
  const scene = photoScenarioFor(article.title, article.category, slot);
  return [
    'Use case: editorial article image',
    `Asset type: ${kind === 'cover' ? 'article listing cover and article hero image' : 'inline editorial article image'}`,
    `Primary request: ${scene}`,
    'Style/medium: photorealistic lifestyle photography, like a modern relationship magazine, not illustration, not vector, not cartoon',
    'Composition/framing: horizontal 16:9, natural negative space, no overlaid text, no watermark, no logo',
    'Lighting/mood: warm, emotional, cinematic but realistic, Hong Kong / Asian editorial sensibility without showing identifiable public figures',
    `Article topic: ${article.title}`,
    `Category: ${article.category}`,
    'Avoid: text in image, typography, fake UI, hands with distorted fingers, overly stock-photo smiles, explicit sexual content'
  ].join('\\n');
};

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.mkdirSync(imageDir, { recursive: true });
const imagePromptRows = [];

const { order, titles } = parseIndex();
const excludedFiles = new Set([
  'When Love Feels Like Control How to Care Without P 2995833d12b680b7a886e7bc5dc9d891.md'
]);
const allMdFiles = fs
  .readdirSync(sourceDir)
  .filter((file) => file.endsWith('.md') && file !== '_INDEX.md' && !excludedFiles.has(file));
const orderedFiles = [...order.filter((file) => allMdFiles.includes(file)), ...allMdFiles.filter((file) => !order.includes(file)).sort()];

const articles = orderedFiles.map((file, index) => {
  const raw = fs.readFileSync(path.join(sourceDir, file), 'utf8');
  const [frontmatter, body] = parseFrontmatter(raw);
  const h1 = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const title = cleanTitle(titles.get(file) || h1 || frontmatter.title || file.replace(/\.md$/, ''));
  const category = inferCategory(title, frontmatter.category);
  const cleaned = cleanMarkdown(body, title);
  const preliminaryContent = markdownToHtml(cleaned);
  const summary = makeSummary({ frontmatter, preliminaryContent, title, category });
  const content = markdownToHtml(removeDuplicateIntro(cleaned, summary));
  const id = index + 1;
  const imageLabel = imageLabelFor(title, category);
  const imageBase = `/article-photos/article-${id}`;
  const imagePrompts = [
    { kind: 'cover', file: `${imageBase}-cover.png`, prompt: '' },
    { kind: 'inline-1', file: `${imageBase}-inline-1.png`, prompt: '' },
    { kind: 'inline-2', file: `${imageBase}-inline-2.png`, prompt: '' },
    { kind: 'inline-3', file: `${imageBase}-inline-3.png`, prompt: '' }
  ];
  const article = {
    id,
    title,
    category,
    color: colors[index % colors.length],
    icon: icons[index % icons.length],
    imageLabel,
    summary,
    content,
    sourceIg: frontmatter.source_ig || '',
    date: frontmatter.date || '',
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    coverImage: imagePrompts[0].file,
    images: imagePrompts.map((image, slot) => ({
      src: image.file,
      caption: slot === 0 ? `封面圖：${title}` : `內文配圖：${title}`,
      prompt: buildImagePrompt({ id, title, category }, slot, image.kind === 'cover' ? 'cover' : 'inline')
    })),
    coverCaption: `Asteria 相處教學：${title}`,
    inlineCaption: `關係不只是答案，還需要一步一步看清楚相處方法。`
  };
  article.images.forEach((image, slot) => {
    imagePromptRows.push(JSON.stringify({
      articleId: id,
      slot,
      title,
      category,
      output: image.src,
      prompt: image.prompt
    }));
  });
  return article;
});

const ts = `export type TeachingPost = {
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
  images: Array<{ src: string; caption: string; prompt: string }>;
  coverCaption: string;
  inlineCaption: string;
};

export const teachingPosts: TeachingPost[] = ${JSON.stringify(articles, null, 2)};
`;

fs.writeFileSync(outFile, ts);
fs.writeFileSync(promptsFile, `${imagePromptRows.join('\n')}\n`);

const baseUrls = [
  '/',
  '/teaching',
  '/services',
  '/about',
  '/cases',
  ...articles.map((article) => `/articles/${article.id}`)
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${baseUrls.map((url) => `  <url>
    <loc>https://asteria-tarot.com${url}</loc>
    <changefreq>${url.startsWith('/articles/') ? 'monthly' : 'weekly'}</changefreq>
    <priority>${url === '/' ? '1.0' : url.startsWith('/articles/') ? '0.7' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(sitemapFile, sitemap);

console.log(`Imported ${articles.length} articles.`);
