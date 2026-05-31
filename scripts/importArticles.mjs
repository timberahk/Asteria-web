import fs from 'node:fs';
import path from 'node:path';

const sourceDir = '/Users/dorothy/Documents/asteria 所有教學文/backup/愛情拯救所 教學文/web_ready';
const repoRoot = path.resolve(import.meta.dirname, '..');
const outFile = path.join(repoRoot, 'lib', 'articlesData.ts');
const customImageDir = path.join(repoRoot, 'public', 'article-custom-images', 'by_article');
const promptsFile = path.join(repoRoot, 'scripts', 'article-image-prompts.jsonl');
const pexelsArticleImagesFile = path.join(repoRoot, 'scripts', 'pexels-article-images.json');
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

const localStockImage = (id) => `/article-custom-images/stock_local/pexels-${id}.jpg`;

const stockPhotos = {
  cafeTalk: {
    src: localStockImage('20804849'),
    credit: 'Photo by Tuba Nur Dogan on Pexels',
    creditUrl: 'https://www.pexels.com/photo/couple-sitting-at-cafe-20804849/'
  },
  warmCafe: {
    src: localStockImage('20479952'),
    credit: 'Photo by Alexander Mass on Pexels',
    creditUrl: 'https://www.pexels.com/photo/couple-sitting-at-cafe-and-drinking-coffee-20479952/'
  },
  outdoorCafe: {
    src: localStockImage('20045413'),
    credit: 'Photo by Mustafa Bodur on Pexels',
    creditUrl: 'https://www.pexels.com/photo/couple-sitting-at-cafe-20045413/'
  },
  cafeNight: {
    src: localStockImage('17637241'),
    credit: 'Photo by K on Pexels',
    creditUrl: 'https://www.pexels.com/photo/a-couple-in-a-restaurant-17637241/'
  },
  sofaArgument: {
    src: localStockImage('36812991'),
    credit: 'Photo by Vitaly Gariev on Pexels',
    creditUrl: 'https://www.pexels.com/photo/couple-arguing-in-living-room-on-sofa-36812991/'
  },
  sofaSilent: {
    src: localStockImage('8560663'),
    credit: 'Photo by Timur Weber on Pexels',
    creditUrl: 'https://www.pexels.com/photo/couple-after-argument-8560663/'
  },
  phoneBed: {
    src: localStockImage('8036689'),
    credit: 'Photo by SHVETS production on Pexels',
    creditUrl: 'https://www.pexels.com/photo/woman-lying-on-bed-while-using-a-cellphone-8036689/'
  },
  phoneWarm: {
    src: localStockImage('8070516'),
    credit: 'Photo by Ron Lach on Pexels',
    creditUrl: 'https://www.pexels.com/photo/a-woman-using-her-smartphone-while-in-bed-8070516/'
  },
  phonePartner: {
    src: localStockImage('8070513'),
    credit: 'Photo by Ron Lach on Pexels',
    creditUrl: 'https://www.pexels.com/photo/a-woman-lying-on-the-bed-while-using-her-mobile-phone-8070513/'
  },
  cafeDate: {
    src: localStockImage('8442219'),
    credit: 'Photo by Ron Lach on Pexels',
    creditUrl: 'https://www.pexels.com/photo/a-couple-having-a-date-in-a-cafe-8442219/'
  },
  streetCafe: {
    src: localStockImage('12944983'),
    credit: 'Photo by Atlantic Ambience on Pexels',
    creditUrl: 'https://www.pexels.com/photo/couple-sitting-by-a-cafe-and-talking-12944983/'
  }
};

const stockPhotoSetFor = (title, category) => {
  const text = `${title} ${category}`;
  if (/少覆|唔覆|不回|已讀|message|訊息|回覆|秒回|Long D|遠距|異地/.test(text)) {
    return [stockPhotos.phoneWarm, stockPhotos.phoneBed, stockPhotos.phonePartner, stockPhotos.cafeNight];
  }
  if (/第三者|新歡|出軌|偷食|變心|劈腿|外遇|PUA|控制|操控|打壓|冷暴力|渣男|紅旗|警號|危機/.test(text)) {
    return [stockPhotos.sofaSilent, stockPhotos.sofaArgument, stockPhotos.phoneBed, stockPhotos.cafeNight];
  }
  if (/分手|失戀|放低|前任|復合|挽回|斷聯|block|冷淡/.test(text)) {
    return [stockPhotos.sofaSilent, stockPhotos.phoneWarm, stockPhotos.cafeTalk, stockPhotos.outdoorCafe];
  }
  if (/曖昧|約會|單身|桃花|吸引|主動|追求/.test(text)) {
    return [stockPhotos.cafeDate, stockPhotos.outdoorCafe, stockPhotos.warmCafe, stockPhotos.streetCafe];
  }
  if (/道歉|吵架|嗌交|冷戰|誤會|修補|和好|爭執|溝通|說話|講嘢|勸/.test(text)) {
    return [stockPhotos.cafeTalk, stockPhotos.sofaArgument, stockPhotos.warmCafe, stockPhotos.sofaSilent];
  }
  if (/安全感|不安|焦慮|內耗|委屈|情緒|治癒|自信|低落/.test(text)) {
    return [stockPhotos.phoneWarm, stockPhotos.phoneBed, stockPhotos.cafeTalk, stockPhotos.sofaSilent];
  }
  return [stockPhotos.warmCafe, stockPhotos.cafeTalk, stockPhotos.outdoorCafe, stockPhotos.cafeDate];
};

const editorialImagesFor = ({ id, title, category }) => {
  const set = stockPhotoSetFor(title, category);
  return [0, 1, 2, 3].map((slot) => {
    const photo = set[(id + slot) % set.length];
    return {
      src: photo.src,
      caption: slot === 0 ? `封面圖：${title}` : `內文配圖：${title}`,
      credit: photo.credit,
      creditUrl: photo.creditUrl,
      prompt: ''
    };
  });
};

const getCustomImageMap = () => {
  const imageMap = new Map();
  if (!fs.existsSync(customImageDir)) return imageMap;

  for (const articleDir of fs.readdirSync(customImageDir, { withFileTypes: true })) {
    if (!articleDir.isDirectory()) continue;
    const dirPath = path.join(customImageDir, articleDir.name);
    const manifestPath = path.join(dirPath, 'manifest.md');
    if (!fs.existsSync(manifestPath)) continue;

    const manifest = fs.readFileSync(manifestPath, 'utf8');
    const articleMatch = manifest.match(/Article file:\s*\n`([^`]+)`/);
    if (!articleMatch) continue;
    const sourceFilename = path.basename(articleMatch[1]);
    const images = fs
      .readdirSync(dirPath)
      .filter((file) => /\.(png|jpe?g|webp)$/i.test(file))
      .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
      .map((file, index) => ({
        src: `/article-custom-images/by_article/${articleDir.name}/${file}`,
        caption: index === 0 ? 'Asteria 原創文章封面圖' : 'Asteria 原創文章配圖',
        credit: '',
        creditUrl: '',
        prompt: ''
      }));

    if (images.length) {
      imageMap.set(sourceFilename, images);
    }
  }

  return imageMap;
};

const getPexelsArticleImageMap = () => {
  if (!fs.existsSync(pexelsArticleImagesFile)) return new Map();
  const parsed = JSON.parse(fs.readFileSync(pexelsArticleImagesFile, 'utf8'));
  return new Map(Object.entries(parsed).map(([id, images]) => [Number(id), images]));
};

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
  .replace(/[\uD800-\uDFFF]/g, '')
  .replace(/[，。！？、：；「」『』（）\[\]\s]/g, '')
  .toLowerCase();

const decorativeMarkerPattern = /(?:[✅✔☑⭕❌🚫🔎📌✉❤💔✨🈲‼❗🔺💬⭐🌟💫]+|[0-9]️⃣)/g;
const emojiPattern = /[\u{1f000}-\u{1faff}\u{2600}-\u{27bf}\ufe0f\u{1f3fb}-\u{1f3ff}\uD800-\uDFFF]/gu;

const normalizeArticleText = (value = '') => {
  let text = value
    .replace(/<aside>/gi, '')
    .replace(/<\/aside>/gi, '')
    .replace(/\uFFFD/g, '')
    .replace(/[\uD800-\uDFFF]/g, '')
    .replace(/^[\s　]*[\[【][^\]】]{1,24}[\]】]\s*/g, '')
    .replace(/❤️‍🩹|[0-9]️⃣/g, '、')
    .replace(decorativeMarkerPattern, '、')
    .replace(emojiPattern, '')
    .replace(/\bFollow我們的Instagram\b.*$/i, '')
    .replace(/\bFollow\s*Instagram\b.*$/i, '')
    .replace(/\badmin\b.*$/i, '')
    .replace(/\bremark\b.*$/i, '')
    .replace(/學習更多關於長期關係相處、溝通技巧、情感連結的小秘笈.*$/i, '')
    .replace(/\s*[\u200d\ufe0f]+\s*/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim();

  text = text
    .replace(/\s*([，。！？、：；])\s*/g, '$1')
    .replace(/([，。！？；：])+/g, (match) => match.at(-1) || match)
    .replace(/、{2,}/g, '、')
    .replace(/^、+|、+$/g, '')
    .replace(/([一-龥）」】）])\s+([一-龥「【（])/g, '$1，$2')
    .replace(/([一-龥])\s*=\s*([一-龥])/g, '$1等於$2')
    .replace(/：、/g, '：')
    .replace(/，([。！？；：])/g, '$1')
    .replace(/、([。！？；：，])/g, '$1')
    .replace(/([（「【])，/g, '$1')
    .replace(/，([）」】])/g, '$1')
    .replace(/，{2,}/g, '，')
    .replace(/。{2,}/g, '。')
    .replace(/([？！，；：])。/g, '$1')
    .replace(/\s+([。！？；：，、])/g, '$1')
    .replace(/([。！？；：，、])\s+/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length > 14 && /[\u4e00-\u9fff]$/.test(text) && !/[。！？]$/.test(text)) {
    text += '。';
  }
  return applyArticleTextCorrections(text);
};

const applyArticleTextCorrections = (value = '') => value
  .replace(/\beg\s*[:：]/gi, '例如：')
  .replace(/\be\.g\.\s*[:：]/gi, '例如：')
  .replace(/想同另一半建立起更好嘅關係，就快啲。?/g, '想同另一半建立起更好嘅關係，可以先由日常分享開始。')
  .replace(/^係要通過重大事件嚟測試/g, '很多人以為信任一定要通過重大事件嚟測試')
  .replace(/可以反映到表一個人/g, '可以反映到一個人')
  .replace(/自己到慢慢/g, '自己慢慢')
  .replace(/世界未日/g, '世界末日')
  .replace(/長有承諾/g, '長期承諾')
  .replace(/不用夾急於/g, '不用急於')
  .replace(/也這這段關係/g, '也讓這段關係')
  .replace(/feel到到自己/g, 'feel到自己')
  .replace(/生活就越嚟越多采多姿/g, '生活就會越嚟越多姿多彩')
  .replace(/當佢他表達能力/g, '當佢表達能力')
  .replace(/最樂觀、最機會改善關係/g, '最樂觀、最有機會改善關係')
  .replace(/透露雙方有效嘅溝通/g, '透過雙方有效嘅溝通')
  .replace(/對持續缺乏耐性/g, '當對方持續缺乏耐性')
  .replace(/咁樣真係夠。$/g, '咁樣未必等於真正尊重。')
  .replace(/如果你也正在面對同類情況，$/g, '如果你也正在面對同類情況，可以先停低整理方向，再決定下一步。');

const cleanDescription = (value = '') => value
  .replace(/^[\s　]*[\[【][^\]】]{1,24}[\]】]\s*/g, '')
  .replace(/\uFFFD/g, '')
  .replace(/遇到「.*?」這種感情難題時，最怕急著用情緒做決定。\s*/g, '')
  .replace(/本文從.*?角度拆解關係訊號、應對方法與挽回前要留意的重點。?/g, '')
  .split(/\r?\n/)
  .map(normalizeArticleText)
  .filter(Boolean)
  .join(' ')
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
  if (/出軌|第三者|變心|新歡|欺騙|冷暴力|家暴|操控|控制|PUA|渣男|紅旗|警號/.test(text)) return '關係危機';
  if (/復合|挽回|前任|分手後|斷聯|block|冷淡/.test(text)) return '復合挽回';
  if (/溝通|訊息|說話|講嘢|勸|道歉|冷戰|表達|分享/.test(text)) return '溝通相處';
  if (/安全感|不安|情緒|失戀|治癒|自信|焦慮|內心|委屈/.test(text)) return '情緒修復';
  if (/曖昧|約會|單身|桃花|吸引|主動|矜持|追求/.test(text)) return '曖昧桃花';
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
  let value = escapeHtml(normalizeArticleText(text));
  value = value.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  value = value.replace(/\[(.+?)\]\((.+?)\)/g, '<mark>$1</mark>');
  value = value.replace(/「([^」]{2,24})」/g, '「<strong>$1</strong>」');
  return value;
};

const formatHeadingInline = (text) => {
  const cleaned = normalizeArticleText(text).replace(/。+$/g, '');
  let value = escapeHtml(cleaned);
  value = value.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  value = value.replace(/\[(.+?)\]\((.+?)\)/g, '<mark>$1</mark>');
  value = value.replace(/「([^」]{2,24})」/g, '「<strong>$1</strong>」');
  return value;
};

const restoreLooseChinesePunctuation = (text = '') => {
  const value = normalizeArticleText(text);
  const hasChinese = /[\u4e00-\u9fff]/.test(value);
  const hasSpaces = /\s+/.test(value);
  if (!hasChinese || !hasSpaces || /^https?:\/\//i.test(value)) return value;

  let restored = value
    .replace(/([\u4e00-\u9fff）】」])\s+([\u4e00-\u9fff「（【])/g, '$1，$2')
    .replace(/，+/g, '，');

  if (restored.length > 14 && !/[。！？.!?」）】]$/.test(restored)) {
    restored += '。';
  }
  return restored;
};

const formatParagraph = (text) => {
  const value = restoreLooseChinesePunctuation(text);
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
  const trimmed = normalizeArticleText(line.trim());
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
    /^想知你嘅關係可以點修補/.test(trimmed) ||
    /^想知道呢段關係下一步/.test(trimmed) ||
    /^本文屬感情心理/.test(trimmed)
  );
};

const cleanMarkdown = (body, title) => {
  const lines = body.split(/\r?\n/);
  const out = [];
  let skipSection = null;
  let skipAside = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (/<aside>/i.test(trimmed)) {
      skipAside = true;
      continue;
    }
    if (/<\/aside>/i.test(trimmed)) {
      skipAside = false;
      continue;
    }
    if (skipAside) continue;
    const heading = trimmed.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      const headingText = heading[2].replace(/^#\s*/, '').trim();
      if (/^常見問題/.test(headingText)) {
        skipSection = heading[1].length;
        continue;
      }
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
      continue;
    }
    if (/^##\s+#/.test(trimmed)) continue;
    out.push(line.replace(/^(\s*#{1,6}\s+)(.+)$/u, (_, prefix, text) => `${prefix}${normalizeArticleText(text)}`));
  }
  return out.join('\n').trim();
};

const shortTopicFromTitle = (title = '') => {
  const cleaned = cleanTitle(title)
    .replace(/[!！?？]+$/g, '')
    .replace(/[：:｜|].*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const questionLead = cleaned.split(/[？?]/)[0]?.trim();
  if (questionLead && questionLead.length >= 8 && questionLead.length < cleaned.length) {
    return questionLead;
  }
  return cleaned.length > 26 ? cleaned.slice(0, 26) : cleaned;
};

const buildArticleFaqMarkdown = ({ title, category, summary }) => {
  const topic = shortTopicFromTitle(title) || '呢段關係';
  const text = `${title} ${category} ${summary}`;

  const questionSets = {
    reply: [
      [`「${topic}」入面，對方少覆或冷淡係咪代表冇機會？`, `唔一定。少覆可能係情緒退後、壓力、逃避衝突，亦可能係感情降溫。重點係觀察佢冷淡持續幾耐、會唔會主動補返，以及你每次追問後關係有冇更緊。`],
      [`遇到「${topic}」時，我應該繼續追問定暫停？`, `通常唔建議不停追問。可以先穩住情緒，用一兩句清楚表達感受，再留空間俾對方回應；如果對方長期避開，就要重新評估互動模式。`],
      [`Asteria 可以點幫我睇「${topic}」呢類情況？`, `我哋會幫你拆對方心態、關係卡位同訊息策略，睇下應該拉近、放慢、定先守住距離，避免越急越推遠。`]
    ],
    reunion: [
      [`「${topic}」仲有機會挽回或復合嗎？`, `要睇分開原因、對方而家抗拒程度、你哋仲有冇情緒連結。復合唔係只靠多傳幾句訊息，而係先判斷窗口位同重新建立安全感。`],
      [`想處理「${topic}」，第一步應該做咩？`, `第一步通常唔係即刻求答案，而係先停低整理情緒、分清假性分手定真性切斷，再決定係保持聯絡、短暫斷聯，定用較低壓方式重新開口。`],
      [`愛情塔羅或儀式可以點樣配合「${topic}」？`, `塔羅可以幫你睇清對方狀態、阻礙同下一步方向；儀式就要按個案判斷適唔適合配合，唔應該盲目亂做。`]
    ],
    communication: [
      [`「${topic}」其實係溝通問題定感情變淡？`, `兩者有時會重疊。要分清對方係聽唔明、唔想面對、情緒太滿，定已經對關係投入下降，先可以決定點講先有效。`],
      [`面對「${topic}」，我應該點講先唔會令對方防衛？`, `避免一開口就指責，可以先講具體事件、自己感受同希望對方做到的一件小事。訊息越短、越清楚，對方越容易聽得入耳。`],
      [`Asteria 會唔會教我點覆「${topic}」相關 message？`, `會。我哋其中一個重點就係幫你 review 對話，逐句睇邊句會推遠對方、邊句可以令互動舒服啲，再教你點樣回應。`]
    ],
    crisis: [
      [`「${topic}」係咪關係危機警號？`, `有機會係。尤其涉及第三者、控制、冷暴力、欺騙或長期失衡時，唔好只睇對方一句解釋，要睇佢行為有冇持續、係咪願意修補。`],
      [`遇到「${topic}」，我應該即刻攤牌嗎？`, `唔一定。未清楚對方心態前，太急攤牌可能令佢防衛或反咬。可以先收集訊號、穩住自己，再決定用柔和試探、直接溝通，定先保護自己。`],
      [`塔羅可以點樣睇「${topic}」背後狀態？`, `可以用嚟整理對方真實狀態、你哋關係阻礙同下一步風險，但重要決定仍然要配合現實行為一齊判斷。`]
    ],
    emotion: [
      [`「${topic}」係咪代表我太情緒化？`, `唔一定。感情入面會不安、委屈、放唔低都好正常，問題唔係有情緒，而係情緒會唔會令你失去方向、做出令自己後悔的反應。`],
      [`因為「${topic}」好辛苦時，可以點樣先穩住自己？`, `先唔好逼自己即刻放低。可以減少反覆翻睇對話、記低真正觸發位，再一步步整理你想要的是復合、答案，還是情緒出口。`],
      [`Asteria 可以點樣陪我處理「${topic}」？`, `可以。我哋唔係只做占卜或儀式，也會陪你整理近況、情緒同相處盲點，幫你喺最亂時先搵返方向。`]
    ],
    ambiguous: [
      [`「${topic}」入面，曖昧卡住或對方唔表態應該點判斷？`, `唔好只睇甜言蜜語，要睇對方有冇穩定投入、主動安排見面、願意推進關係。如果長期只享受曖昧但唔承擔，就要小心。`],
      [`「${topic}」入面，我主動少少會唔會好似低價值？`, `主動唔等於低價值，關鍵係有冇界線。你可以釋出機會，但唔需要追住對方跑；要令互動有來有往，先唔會失衡。`],
      [`塔羅可以睇「${topic}」對方係咪認真嗎？`, `可以。塔羅適合睇對方係認真、觀望、享受曖昧，還是另有顧慮，再幫你決定應該推進定慢慢觀察。`]
    ],
    longterm: [
      [`「${topic}」入面，長期關係變淡係咪代表唔愛？`, `唔一定。熱戀感下降係正常，但如果連溝通、關心、共同目標都慢慢消失，就需要重新整理相處模式，而唔係只怪自己想太多。`],
      [`「${topic}」可以點樣重新拉近距離？`, `可以先由細位開始，例如固定高質對話、少啲批判、多啲具體欣賞，再慢慢重建安全感同共同節奏。`],
      [`Asteria 可以點幫我處理「${topic}」？`, `我哋可以幫你睇關係卡住的位置、對方需要同你嘅表達方式，將問題拆細到日常一句說話、一次互動點處理。`]
    ],
    general: [
      [`「${topic}」可以點樣先睇清楚方向？`, `先唔好只靠一個行為下結論。可以將對方近排態度、聯絡頻率、衝突後反應同你自己感受放埋一齊睇，方向會清楚好多。`],
      [`面對「${topic}」，我應該主動處理定等對方先？`, `如果你仍然重視呢段關係，可以主動一次，但要用低壓、清楚、有界線的方式。最怕係一邊等、一邊內耗，最後失去判斷力。`],
      [`Asteria 感情拯救所可以點樣幫「${topic}」？`, `我哋會用塔羅分析、相處教學、對話 review 同個案經驗，幫你拆對方心態、訊息策略同下一步做法。`]
    ]
  };

  const key = /少覆|唔覆|不回|已讀|message|訊息|回覆|秒回|斷聯|冷淡|Long D|遠距|異地/.test(text)
    ? 'reply'
    : /復合|挽回|前任|分手後|分手|block/.test(text)
      ? 'reunion'
      : /第三者|新歡|出軌|偷食|變心|劈腿|外遇|PUA|控制|操控|打壓|冷暴力|渣男|紅旗|警號|危機/.test(text)
        ? 'crisis'
        : /溝通|說話|講嘢|道歉|冷戰|表達|分享|勸|嗌交|爭吵|誤會/.test(text)
          ? 'communication'
          : /安全感|不安|焦慮|內耗|委屈|情緒|治癒|自信|低落|放低|失戀/.test(text)
            ? 'emotion'
            : /曖昧|約會|單身|桃花|吸引|主動|矜持|追求/.test(text)
              ? 'ambiguous'
              : /結婚|同居|見家長|辦公室|長期|承諾|未來|穩定/.test(text)
                ? 'longterm'
                : 'general';

  const faqs = questionSets[key];
  return [
    '## 常見問題',
    ...faqs.flatMap(([question, answer]) => [`### ${question}`, answer])
  ].join('\n\n');
};

const markdownPlainLength = (markdown = '') => normalizeText(markdown
  .replace(/^#{1,6}\s+/gm, '')
  .replace(/!\[.*?\]\(.*?\)/g, '')
  .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  .replace(/[*_`>#-]/g, ' ')
).length;

const buildFallbackBodyMarkdown = ({ title, category, summary }) => {
  const topic = shortTopicFromTitle(title) || '呢段關係';
  const categoryLead = {
    '復合挽回': `如果你正卡喺「${topic}」，最重要唔係即刻逼對方表態，而係先分清楚對方係真心想切斷，定只係情緒退後、需要空間。`,
    '溝通相處': `如果你正卡喺「${topic}」，問題好多時唔係你講得唔夠多，而係對方聽到嘅感覺同你想表達嘅意思出現落差。`,
    '情緒修復': `如果你正因為「${topic}」而好辛苦，先唔好急住否定自己。感情入面最耗人嘅位，往往係你一邊想理性，一邊又停唔到猜測。`,
    '曖昧桃花': `如果你正遇到「${topic}」，唔好只睇一兩句甜言蜜語，要睇對方有冇穩定投入、會唔會主動推進，以及你哋互動係舒服定長期失衡。`,
    '關係危機': `如果你正面對「${topic}」，要先停低觀察訊號，而唔係急住幫對方搵藉口。關係危機最怕拖到自己失去底線。`,
    '長期關係': `如果你正處理「${topic}」，關係變淡未必等於唔愛，但一定代表相處模式需要重新整理。長期關係最怕只靠習慣維持。`,
    '戀愛心理': `如果你正思考「${topic}」，可以先由對方行為、你自己的感受、同你哋互動後的狀態一齊判斷，而唔係只靠一個答案定生死。`
  };
  const lead = categoryLead[category] || categoryLead['戀愛心理'];

  return [
    `## 先看清楚「${topic}」真正卡住的位置`,
    lead,
    `好多感情問題表面上係一句說話、一個行為、一段冷淡期，但背後可能係安全感、溝通方式、投入程度或者過往失望累積出嚟。你愈急住處理，愈容易用錯方法，令對方更防衛，自己亦更內耗。`,
    `## 為什麼會越處理越亂`,
    `最常見的情況，是你用自己的不安去追問，對方就用沉默、逃避或者敷衍去防衛。你以為自己只係想溝通，但對方感受到的可能係壓力；你以為對方冷淡代表不愛，但其實亦可能係佢唔識處理衝突。真正要拆的，不只是一句訊息，而是你哋互動入面重複出現的模式。`,
    `## 可以先做的三件事`,
    `第一，記低最近最令你不安的事件，而唔係只記低情緒。第二，觀察對方係短暫退後，定長期不願面對。第三，先諗清楚你想要的是答案、修補、復合，還是單純想停止痛苦。`,
    `如果仍然想修補，就要由低壓、清楚、有界線的互動開始。不要一次過追問所有答案，也不要用長篇訊息迫對方即刻表態。先穩住自己的節奏，再按對方反應決定下一步。`,
    `當方向未清楚時，可以先將對話同近況整理出嚟，再決定下一步。Asteria 會幫你拆對方心態、關係卡位同訊息策略，避免你喺最亂嘅時候越做越錯。`
  ].join('\n\n');
};

const buildShortArticleExpansionMarkdown = ({ title, category }) => {
  const topic = shortTopicFromTitle(title) || '呢段關係';
  const angle = {
    '復合挽回': '對方退後未必等於完全無機會，但要先判斷仲有冇聯絡窗口、情緒連結同重新接近的空間。',
    '溝通相處': '好多相處問題不是一句說話造成，而是同一種表達方式重複太多次，令對方開始防衛或者麻木。',
    '情緒修復': '最辛苦的地方通常不是事情本身，而是你一直在腦內重播，令自己無法分清直覺、恐懼同事實。',
    '曖昧桃花': '曖昧最容易令人誤判，因為甜言蜜語、偶爾主動同真正投入，其實是三件不同的事。',
    '關係危機': '危機出現時，最重要是先守住底線，再分清對方是一時情緒爆發，還是長期逃避責任。',
    '長期關係': '長期關係需要的不只是愛，還有穩定溝通、共同節奏同願意修正相處模式的能力。',
    '戀愛心理': '感情裡的很多反應，都同安全感、自我價值同依附模式有關；只看表面行為，很容易判斷錯方向。'
  };

  return [
    `## 再看深一層：${topic}的真正訊號`,
    angle[category] || angle['戀愛心理'],
    `你可以先觀察三個位置：對方最近有冇主動靠近、衝突後有冇修補、你表達需要時對方係願意理解，定只係想快點完結話題。這些細節會比一句「愛不愛」更能反映關係狀態。`,
    `## 下一步不要急著做錯`,
    `如果你一邊很想修補，一邊又很怕失去，就更加要先整理好說話次序。先講具體事件，再講自己的感受，最後只提出一個清楚而可做到的希望。這樣比長篇控訴更容易令對方聽得入耳，也更方便判斷對方是否仍願意為關係付出。`
  ].join('\n\n');
};

const titlePromiseSections = [
  {
    match: /感情操控\s*5\s*個警號|為你好.*控制/,
    heading: '5 個感情操控警號',
    items: [
      ['用「為你好」包裝控制', '對方表面上話係關心你，其實係逐步限制你嘅選擇，令你開始懷疑自己判斷。'],
      ['限制你同朋友、家人或異性來往', '健康關係唔會要求你切斷所有支援系統；如果對方成日要你報備、審查你同邊個見面，就要留意。'],
      ['令你覺得所有問題都係你錯', '每次衝突最後都變成你道歉、你反省、你改變，對方完全唔需要負責，呢個就係關係失衡。'],
      ['用冷淡或情緒懲罰你', '當你唔順佢意，佢就冷暴力、消失、黑面，逼你為咗和好而放低自己底線。'],
      ['慢慢令你唔敢表達自己', '最明顯嘅警號，係你開始講句說話都要諗好耐，怕對方嬲、怕對方誤會、怕又被責怪。']
    ]
  },
  {
    match: /3\s*個偽關心地雷|關心.*批評/,
    heading: '3 個偽關心地雷',
    items: [
      ['用忠告包住否定', '例如「我係為你好」之後接住一堆批評，聽落似建議，實際係令對方覺得自己唔夠好。'],
      ['未理解就急住糾正', '對方想被聽見，你卻即刻教佢應該點做，會令佢覺得你只想改造佢。'],
      ['將自己標準當成唯一答案', '真正關心會留空間俾對方選擇，而唔係用愛之名要求對方照你方法生活。']
    ]
  },
  {
    match: /3\s*個判斷方法|享受被愛/,
    heading: '3 個判斷方法',
    items: [
      ['你係想了解佢，定只想被佢需要', '真心喜歡會想知道對方世界；只享受被愛，通常更在意對方有冇圍住你轉。'],
      ['你能否接受佢不完美的一面', '如果只愛被追捧嘅感覺，一見到對方缺點就會快速扣分或失去興趣。'],
      ['你有冇願意為關係付出行動', '喜歡唔只係心動，亦包括願意溝通、調整同承擔相處裡的不方便。']
    ]
  },
  {
    match: /感情扣分.*5\s*個細節|不像以前.*5\s*個細節/,
    heading: '男人開始扣分的 5 個細節',
    items: [
      ['開始嫌三嫌四', '以前會欣賞你的小習慣，後來卻經常挑你語氣、打扮、生活方式，代表佢開始用挑剔眼光看你。'],
      ['放大你的缺點', '小事變成大問題，一次失誤會被佢記好耐，甚至用嚟證明「你原來唔係佢想像中咁好」。'],
      ['熱情陪伴變少', '以前你唔開心會陪你傾，後來變得不耐煩、敷衍、甚至覺得你麻煩。'],
      ['將你同想像中的伴侶比較', '佢唔係只看眼前的你，而係不停用心中標準扣你分，令你點做都好似唔夠。'],
      ['不再主動修補問題', '真正危險唔係佢有失望，而係佢失望後選擇收埋、冷淡，最後先一次過講分手。']
    ]
  },
  {
    match: /真心還是假意.*5\s*個細節|真心定假意.*5/,
    heading: '5 個細節看出佢有冇認真愛你',
    items: [
      ['有冇穩定投入時間', '真心唔一定日日黐住，但會穩定安排見面、回覆同維持聯絡。'],
      ['會唔會記得你的需要', '佢唔只聽你講過，仲會喺日常行動入面照顧你介意同重視嘅事。'],
      ['衝突後有冇修補', '只講甜言蜜語唔夠，真正認真係吵架後願意理解、道歉同調整。'],
      ['會唔會將你放入未來計劃', '認真嘅人會自然提到之後、安排、生活節奏，而唔係永遠只停留喺當下。'],
      ['有冇尊重你的界線', '愛你唔係控制你，而係即使有不同想法，都願意尊重你嘅感受同選擇。']
    ]
  },
  {
    match: /4\s*個感情亮紅燈|分手前.*徵兆/,
    heading: '4 個感情亮紅燈信號',
    items: [
      ['開始排斥溝通', '一講問題就逃避、轉移話題、話你煩，代表佢未必想再處理關係。'],
      ['見面或聯絡變成例行公事', '有聯絡不等於有心，如果每次互動都冇溫度，關係可能已經慢慢空心。'],
      ['不再在意你的感受', '你難過、失望或提出需要時，對方只覺得麻煩，呢個係很重要的退場訊號。'],
      ['未來計劃裡慢慢冇你', '佢開始避談未來、減少承諾，甚至所有安排都只以自己為中心。']
    ]
  },
  {
    match: /4\s*個方法|重新站起來|情傷變成成長/,
    heading: '4 個重新站起來的方法',
    items: [
      ['先承認自己真的受傷', '唔需要急住扮無事，接受自己痛苦，先有空間慢慢復原。'],
      ['暫停反覆翻睇對話', '不停重播只會令傷口更深，可以先限制自己翻睇、追蹤同猜測的時間。'],
      ['整理這段關係教會你的事', '分手唔代表全盤否定自己，重點係分清自己下次想保留同改變咩。'],
      ['重新建立生活節奏', '由睡眠、工作、朋友、興趣開始，令自己慢慢唔再只圍住一個人轉。']
    ]
  },
  {
    match: /6\s*個.*變心信號|出軌前.*跡象/,
    heading: '6 個容易忽略的變心信號',
    items: [
      ['手機突然變得很敏感', '以前自然放低手機，後來開始反轉屏幕、改密碼、避開你回覆訊息。'],
      ['前言不對後語', '行程、時間、解釋開始有出入，而且被問起時容易不耐煩。'],
      ['對你的關心變少', '唔再留意你近況、情緒同需要，整個人好似抽離咗。'],
      ['突然注重外表或社交', '改變本身唔一定有問題，但如果同時伴隨隱瞞同冷淡，就要留意。'],
      ['親密接觸明顯下降', '身體距離、眼神、語氣都變得疏離，甚至抗拒被你靠近。'],
      ['開始將問題推到你身上', '明明係佢退後，最後卻變成你太敏感、太多疑、太難相處。']
    ]
  },
  {
    match: /大男人定恐怖情人|5\s*個控制慾警號/,
    heading: '5 個控制慾警號',
    items: [
      ['要求你事事報備', '關心同監控只有一線之差，如果你唔報備就被懲罰，就唔係健康界線。'],
      ['限制你的社交圈', '佢唔喜歡你見某些人，甚至想你遠離朋友家人，係控制關係常見開始。'],
      ['用愛情要求你順從', '例如「你愛我就應該聽我講」，將愛變成服從測試。'],
      ['不接受你有不同意見', '只要你反對，佢就發脾氣、冷暴力或貶低你，令你慢慢唔敢講真話。'],
      ['令你愈來愈不像自己', '最終你為咗避免衝突，放棄喜好、朋友、想法，呢個已經係危險訊號。']
    ]
  },
  {
    match: /5\s*個常見自毀行為|無意識破壞感情/,
    heading: '5 個常見自毀行為',
    items: [
      ['用試探代替表達', '明明想被重視，卻用冷淡、鬧脾氣、假裝無所謂去測試對方。'],
      ['過度索取安全感', '安全感需要建立，但如果每次不安都變成追問，對方會愈來愈有壓力。'],
      ['把過去傷口投射到現在', '以前被傷害過，不代表眼前的人一定會一樣，但你可能會先用防衛推開佢。'],
      ['不斷翻舊帳', '每次吵架都搬返舊事，會令對方覺得永遠無法重新開始。'],
      ['只看對方有冇錯，忘記看互動模式', '關係通常係雙向累積，單純追究輸贏會令問題愈拆愈亂。']
    ]
  },
  {
    match: /吵架\s*5\s*大禁區|嗌交5大禁區/,
    heading: '情侶吵架 5 大禁區',
    items: [
      ['人身攻擊', '針對人格、外貌、家庭或能力，只會令對方記住傷害，而唔係記住問題本身。'],
      ['死要面子', '明知自己都有責任，仍然堅持唔認錯，會令修補機會愈來愈細。'],
      ['翻舊帳', '每次都將以前所有錯一次過攤出來，對方會覺得永遠清算唔完。'],
      ['威脅分手', '用分手逼對方讓步，短期可能有效，長期會消耗安全感。'],
      ['冷暴力懲罰', '需要冷靜可以講清楚，但長時間失蹤、唔回應，只會令問題發酵。']
    ]
  },
  {
    match: /復合前必經.*5\s*個階段|重新開始.*5\s*個/,
    heading: '復合前必經的 5 個階段',
    items: [
      ['情緒降溫期', '分開初期最容易衝動，先讓雙方情緒冷卻，避免講出更傷人的說話。'],
      ['嘗試獨立期', '你要先重新穩住自己，唔好將所有生活重心都放在等對方回頭。'],
      ['重新接觸期', '用低壓方式恢復互動，不是一開口就求復合，而係先建立舒服感。'],
      ['信任修補期', '如果之前有傷害或失望，就要用行動慢慢證明，而唔係只靠承諾。'],
      ['重新定義關係期', '復合唔係回到舊模式，而係要講清楚之後點相處、點避免重複問題。']
    ]
  },
  {
    match: /4\s*個令對方慢慢抽離|感情變淡點算/,
    heading: '4 個令對方慢慢抽離的行為',
    items: [
      ['過度依賴對方', '所有情緒都要對方負責，會令關係由親密變成壓力。'],
      ['長期只講問題，少了欣賞', '如果對方每次靠近都只聽到批評，久而久之會自然退後。'],
      ['失去自己的生活', '當你愈來愈沒有自己，對方反而可能感到沉重，吸引力亦會下降。'],
      ['忽略日常小互動', '感情變淡多數唔係一件大事，而係每日少一句關心、少一次分享慢慢累積。']
    ]
  },
  {
    match: /5\s*個正在破壞關係的原因|一面對伴侶就燥底/,
    heading: '5 個正在破壞關係的原因',
    items: [
      ['爭執太多，身體先有防衛反應', '當你一見到對方就緊張或燥底，可能係長期衝突令你進入防衛狀態。'],
      ['未處理的委屈累積太久', '你以為自己放下了，但其實每次小事都會觸發以前的失望。'],
      ['溝通只剩指責', '如果每次開口都係追究對錯，關係就會愈傾愈遠。'],
      ['缺少正面互動', '只靠解決問題維持關係是不夠的，也需要輕鬆、欣賞和被喜歡的感覺。'],
      ['把對方當成壓力來源', '當你一想到佢就覺得累，代表關係需要重新整理，而唔係再硬撐。']
    ]
  },
  {
    match: /建立親密感.*5\s*個日常方法|讓關係升溫/,
    heading: '5 個建立親密感的日常方法',
    items: [
      ['漸進式分享', '由小事開始講起，慢慢增加真實感受，令對方更容易靠近你。'],
      ['固定高質對話時間', '不一定要傾好耐，但要有一段時間專心聽對方，而唔係邊玩電話邊應。'],
      ['具體欣賞對方', '不要只講「你好好」，可以講清楚佢邊個行為令你感到被照顧。'],
      ['共同完成小任務', '一齊煮飯、計劃行程、整理生活，會比空泛談情更容易建立默契。'],
      ['衝突後主動修補', '親密感唔係永遠唔吵架，而係吵完之後仍然願意回來理解對方。']
    ]
  },
  {
    match: /5\s*個最常見溝通盲點|心底話.*有效溝通/,
    heading: '5 個最常見溝通盲點',
    items: [
      ['以為講晒心底話就等於溝通', '真實表達很重要，但如果只倒情緒，對方未必知道可以點回應。'],
      ['一開口就批評', '你想講需要，但出口變成指責，對方自然會防衛。'],
      ['一次過講太多問題', '問題太多會令對方腦袋關機，最好先集中處理一件最重要的事。'],
      ['用暗示期待對方明白', '暗示好容易誤會，清楚講出需要反而更成熟。'],
      ['只追求對方認錯', '有效溝通唔係分輸贏，而係令雙方知道之後可以點做。']
    ]
  }
];

const headingCountBeforeFaq = (markdown = '') => {
  const beforeFaq = markdown.split(/^##\s+常見問題/m)[0] || markdown;
  return (beforeFaq.match(/^#{2,4}\s+/gm) || []).length;
};

const applyTitlePromiseSections = (markdown, { title }) => {
  const section = titlePromiseSections.find((entry) => entry.match.test(title));
  if (!section) return markdown;
  const alreadyHasEnough = headingCountBeforeFaq(markdown) >= section.items.length;
  if (alreadyHasEnough && section.items.every(([label]) => markdown.includes(label))) return markdown;

  const block = [
    `## ${section.heading}`,
    ...section.items.flatMap(([label, body], index) => [
      `### ${index + 1}. ${label}`,
      body
    ])
  ].join('\n\n');

  const marker = /\n## 如果還想修復關係，你可以先這樣做/;
  if (marker.test(markdown)) {
    return markdown.replace(marker, `\n${block}\n\n## 如果還想修復關係，你可以先這樣做`);
  }
  return `${markdown.trim()}\n\n${block}`;
};

const removeDuplicateIntro = (markdown, summary) => {
  if (!summary) return markdown;
  const summaryKey = normalizeText(summary).slice(0, 56);
  if (summaryKey.length < 18) return markdown;
  const lines = markdown.split(/\r?\n/);
  const firstContentIndex = lines.findIndex((line) => {
    const trimmed = line.trim();
    return trimmed && !/^#{2,4}\s+/.test(trimmed);
  });
  if (firstContentIndex < 0) return markdown;

  let buffer = '';
  let endIndex = firstContentIndex - 1;
  for (let index = firstContentIndex; index < Math.min(lines.length, firstContentIndex + 4); index += 1) {
    const trimmed = lines[index].trim();
    if (!trimmed || /^#{2,4}\s+/.test(trimmed)) break;
    buffer += normalizeText(trimmed);
    endIndex = index;
    if (
      buffer.includes(summaryKey) ||
      summaryKey.includes(buffer.slice(0, Math.min(buffer.length, summaryKey.length))) ||
      normalizeText(trimmed).includes(summaryKey)
    ) {
      return [
        ...lines.slice(0, firstContentIndex),
        ...lines.slice(endIndex + 1)
      ].join('\n').replace(/^\s+/, '').trim();
    }
    if (buffer.length > summaryKey.length + 80) break;
  }

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
      html.push(`<ul>${list.map((item) => `<li>${formatInline(restoreLooseChinesePunctuation(item))}</li>`).join('')}</ul>`);
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
        html.push(`<h2>${formatHeadingInline(text)}</h2>`);
      } else {
        html.push(`<h3>${formatHeadingInline(text)}</h3>`);
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

const stripHtml = (html = '') => html
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

const removeDuplicateSummaryHtml = (html, summary) => {
  const summaryKey = normalizeText(summary).slice(0, 60);
  if (summaryKey.length < 24) return html;
  return html.replace(/^<p>([\s\S]*?)<\/p>\n?/, (match, firstParagraph) => {
    const paragraphKey = normalizeText(stripHtml(firstParagraph));
    if (paragraphKey.includes(summaryKey) || summaryKey.includes(paragraphKey.slice(0, summaryKey.length))) {
      return '';
    }
    return match;
  });
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
  const cleaned = normalizeArticleText(normalized);
  if (!cleaned || isFaqLikeSummary(cleaned) || normalizeText(cleaned) === normalizeText(title)) {
    return buildFallbackSummary(title, category).slice(0, 150);
  }
  return cleaned.slice(0, 150);
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
  if (/Long D|遠距|異地/.test(text)) {
    return [
      'a real candid photo of one partner smiling softly during a late-night video call in a cozy room, city lights outside the window',
      'a close-up real photo of a phone glowing with an unread message on a warm bed beside a notebook and bedside lamp, no readable text',
      'a real photo of two coffee cups, a blank calendar, and a laptop video call glow on a small table, intimate long-distance relationship mood',
      'a real candid photo of a couple reuniting in a quiet station waiting area, one small suitcase, gentle side hug, blurred warm background'
    ][slot % 4];
  }
  if (/少覆|唔覆|不回|已讀|message|訊息|回覆|秒回|覆訊息/.test(text)) {
    return [
      'a real close-up photo of a phone beside a half-finished cup of tea at night, unread message glow, no readable text',
      'a real candid photo of a young woman sitting on a sofa waiting for a reply, phone in hand, soft anxious mood',
      'a real photo of a couple texting from different rooms at night, emotional distance, warm cinematic light',
      'a real photo of a quiet bedroom desk with a phone, notebook, and dim lamp, waiting-for-message relationship mood, no readable text'
    ][slot % 4];
  }
  if (/第三者|新歡|出軌|偷食|變心|劈腿|外遇/.test(text)) {
    return [
      'a real photo of a phone face down between two silent people at a dining table, trust crisis mood, no readable text',
      'a real candid photo of a woman standing alone under city lights after a painful relationship discovery, cinematic but subtle',
      'a real photo of a tense couple in a dim living room, one person looking away while the other holds a phone',
      'a real photo of two people walking in opposite directions on a quiet street at night, relationship betrayal mood'
    ][slot % 4];
  }
  if (/PUA|控制|操控|打壓|冷暴力|渣男|紅旗|警號/.test(text)) {
    return [
      'a real photo of a person sitting at the edge of a bed holding a phone, uneasy relationship boundary mood, soft shadow',
      'a real photo of a couple in a quiet kitchen after a tense conversation, one person withdrawn, documentary style',
      'a real photo of a woman looking thoughtful in a cafe window reflection, self-protection and relationship red flag mood',
      'a real photo of two people sitting apart on a sofa with emotional distance, warm but heavy atmosphere'
    ][slot % 4];
  }
  if (/安全感|不安|焦慮|內耗|委屈|情緒|治癒|自信|放低|低落/.test(text)) {
    return [
      'a real photo of a woman journaling by a window in warm morning light, emotional healing after relationship stress',
      'a real photo of someone holding a warm mug beside a phone, calm self-reflection mood, no readable text',
      'a real candid photo of a person walking alone by the harbour at dusk, healing and emotional clarity mood',
      'a real photo of a quiet bedroom with a notebook, blanket, and soft lamp, relationship recovery mood'
    ][slot % 4];
  }
  if (/道歉|吵架|嗌交|冷戰|誤會|修補|和好|爭執/.test(text)) {
    return [
      'a real candid photo of a couple talking softly across a small cafe table after an argument, hands near cups',
      'a real photo of two people sitting on a sofa after a difficult conversation, one gently reaching out',
      'a real photo of a dining table after dinner with two people having a calm reconciliation talk, warm home light',
      'a real photo of a couple walking slowly together after resolving tension, evening street light'
    ][slot % 4];
  }
  if (/結婚|同居|見家長|長期|承諾|未來|穩定/.test(text)) {
    return [
      'a real photo of a couple cooking together in a small warm kitchen, long-term relationship everyday intimacy',
      'a real candid photo of two people organizing a cozy home shelf together, stable partnership mood',
      'a real photo of a couple sitting at a dining table with family dinner atmosphere, no identifiable faces in background',
      'a real photo of two hands placing keys beside a small plant on a home table, commitment and shared life mood'
    ][slot % 4];
  }
  if (/分手|失戀|放低|前任|復合|挽回|斷聯|block|冷淡/.test(text)) {
    return [
      'a real candid photo of a couple standing apart on a quiet city street at dusk, emotional distance, warm film grain',
      'a real photo of a young woman alone by a window holding a phone, late night heartbreak mood, soft warm interior light',
      'a real photo of a couple sitting across a cafe table after a difficult conversation, subtle tension, natural documentary style',
      'a real photo of an unsent message on a phone beside old instant photos, breakup and reconciliation mood, no readable text'
    ][slot % 4];
  }
  if (/溝通|訊息|說話|講嘢|道歉|冷戰|分享|勸/.test(text)) {
    return [
      'a real candid photo of a couple having a sincere conversation at a small cafe table, hands near cups, gentle daylight',
      'a real close-up photo of a phone on a bed with a blurred unread message glow, soft bedroom light, no readable text',
      'a real photo of a couple sitting on a sofa talking calmly after an argument, warm home atmosphere',
      'a real photo of two people sitting quietly at a dining table after a disagreement, one reaching gently toward the other'
    ][slot % 4];
  }
  if (/曖昧|約會|單身|桃花|吸引|主動|追求/.test(text)) {
    return [
      'a real candid photo of two people on an early date walking through a softly lit city street, shy romantic tension',
      'a real photo of two people sitting side by side at a coffee shop, almost touching hands, ambiguous relationship mood',
      'a real photo of a woman getting ready before a date, mirror reflection, soft warm light, confident romantic mood',
      'a real photo of a quiet first-date table with two drinks and hands near each other, gentle anticipation'
    ][slot % 4];
  }
  if (/出軌|第三者|變心|新歡|欺騙|操控|PUA|渣男|危機/.test(text)) {
    return [
      'a real photo of a tense couple in a dim apartment, one person looking away while the other holds a phone',
      'a real photo of a woman sitting alone on a bed after discovering a painful message, moody soft light, documentary style',
      'a real photo of a couple walking in opposite directions under street lights, emotional distance',
      'a real photo of a phone face down on a table between two silent people, trust crisis mood, no readable text'
    ][slot % 4];
  }
  return [
    'a real warm couple portrait during golden hour, intimate but tasteful, natural lifestyle photography',
    'a real photo of a couple sitting together quietly near a window, peaceful relationship reflection, soft film photography',
    'a real photo of two people walking side by side in a park at sunset, gentle romantic relationship mood',
    'a real photo of a couple sharing a quiet moment at home, warm light, thoughtful relationship mood'
  ][slot % 4];
};

const buildImagePrompt = (article, slot, kind) => {
  const scene = photoScenarioFor(article.title, article.category, slot);
  return [
    'Use case: photorealistic relationship website photo',
    `Asset type: ${kind === 'cover' ? 'website listing cover photo and hero photo' : 'inline website photo'}`,
    `Primary request: ${scene}`,
    'Style/medium: single photorealistic lifestyle camera photo, modern relationship magazine mood, not illustration, not vector, not cartoon',
    'Composition/framing: horizontal 16:9, natural negative space, one continuous camera scene only',
    'Lighting/mood: warm, emotional, cinematic but realistic, Hong Kong / Asian editorial sensibility without showing identifiable public figures',
    `Relationship theme to match: ${article.title}`,
    `Mood category: ${article.category}`,
    'Hard constraints: no text, no typography, no poster, no infographic, no chart, no diagram, no panels, no UI mockup, no captions, no logo, no watermark',
    'Avoid: readable words, educational graphics, school or grammar content, daily routine schedules, parent-child family scenes, children, father routine, hands with distorted fingers, overly stock-photo smiles, explicit sexual content'
  ].join('\\n');
};

fs.mkdirSync(path.dirname(outFile), { recursive: true });
const imagePromptRows = [];
const customImageMap = getCustomImageMap();
const pexelsArticleImageMap = getPexelsArticleImageMap();

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
  const bodyMarkdown = removeDuplicateIntro(cleaned, summary);
  const bodyLength = markdownPlainLength(bodyMarkdown);
  const safeBodyMarkdown = bodyLength < 90
    ? buildFallbackBodyMarkdown({ title, category, summary })
    : bodyLength < 520
      ? [bodyMarkdown, buildShortArticleExpansionMarkdown({ title, category })].join('\n\n')
      : bodyMarkdown;
  const articleMarkdown = [
    safeBodyMarkdown,
    buildArticleFaqMarkdown({ title, category, summary })
  ].filter(Boolean).join('\n\n');
  const content = removeDuplicateSummaryHtml(markdownToHtml(articleMarkdown), summary);
  const id = index + 1;
  const imageLabel = imageLabelFor(title, category);
  const fallbackImages = editorialImagesFor({ id, title, category });
  const customImages = customImageMap.get(file) || [];
  const pexelsArticleImages = pexelsArticleImageMap.get(id) || [];
  const editorialImages = customImages.length
    ? [0, 1, 2, 3].map((slot) => customImages[slot] || fallbackImages[slot])
    : pexelsArticleImages.length
      ? [0, 1, 2, 3].map((slot) => pexelsArticleImages[slot] || fallbackImages[slot])
    : fallbackImages;
  const coverImage = editorialImages[0];
  const inlineImages = editorialImages.slice(1);
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
    coverImage: coverImage.src,
    coverCredit: coverImage.credit,
    coverCreditUrl: coverImage.creditUrl,
    coverPrompt: coverImage.prompt,
    images: inlineImages,
    coverCaption: `Asteria 相處教學：${title}`,
    inlineCaption: `關係不只是答案，還需要一步一步看清楚相處方法。`
  };
  [coverImage, ...inlineImages].forEach((image, slot) => {
    imagePromptRows.push(JSON.stringify({
      articleId: id,
      slot,
      title,
      category,
      output: image.src,
      credit: image.credit,
      creditUrl: image.creditUrl,
      prompt: buildImagePrompt({ id, title, category }, slot, slot === 0 ? 'cover' : 'inline')
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
  coverCredit: string;
  coverCreditUrl: string;
  coverPrompt: string;
  images: Array<{ src: string; caption: string; credit: string; creditUrl: string; prompt: string }>;
  coverCaption: string;
  inlineCaption: string;
};

export const teachingPosts: TeachingPost[] = ${JSON.stringify(articles, null, 2)};
`;

fs.writeFileSync(outFile, ts);
fs.writeFileSync(promptsFile, `${imagePromptRows.join('\n')}\n`);

const baseUrls = [
  '/',
  '/teaching/',
  '/services/',
  '/about/',
  '/cases/',
  '/reviews/',
  ...articles.map((article) => `/articles/${article.id}/`)
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
