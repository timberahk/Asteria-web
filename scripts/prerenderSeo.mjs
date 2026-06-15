import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const indexPath = path.join(distDir, 'index.html');
const articlesPath = path.join(rootDir, 'lib', 'articlesData.ts');
const siteUrl = 'https://asteria-tarot.com';
const logoUrl = `${siteUrl}/asteria-logo.jpg`;

function canonicalPath(route) {
  if (route === '/') return '/';
  return route.endsWith('/') ? route : `${route}/`;
}

const searchIntents = [
  '復合',
  '挽回',
  '挽回前任',
  '復合方法',
  '分手復合',
  '分手後點算',
  '失戀',
  '失戀挽回',
  '放唔低前任',
  '前任會回來嗎',
  '他會主動聯絡我嗎',
  '對方想法',
  '前任有新歡',
  '第三者',
  '斷聯',
  '冷淡期',
  '曖昧',
  '感情占卜',
  '愛情占卜',
  '塔羅分析',
  '愛情儀式',
  '感情儀式',
  '關係修復',
  '相處教學',
  '感情教學',
  '訊息點覆',
  '失戀陪伴',
  'Asteria 感情拯救所'
];

const staticPages = [
  {
    route: '/teaching/',
    title: '相處教學｜復合挽回・分手失戀・斷聯冷淡・曖昧相處｜Asteria 感情拯救所',
    description: 'Asteria 相處教學整理復合挽回、分手失戀、斷聯冷淡、曖昧第三者、感情占卜與日常相處方法，陪你拆解訊息、情緒同下一步。',
    keywords: '相處教學, 感情教學, 復合挽回, 分手失戀, 斷聯冷淡, 曖昧, 第三者, 訊息點覆, 感情占卜',
    image: logoUrl,
    schema: {
      '@type': 'CollectionPage',
      name: 'Asteria 相處教學',
      description: '復合挽回、分手失戀、斷聯冷淡、曖昧相處與感情占卜教學文章。',
      url: `${siteUrl}/teaching/`
    }
  },
  {
    route: '/services/',
    title: '服務項目｜感情占卜・塔羅分析・愛情儀式・相處指引｜Asteria 感情拯救所',
    description: 'Asteria 服務包括感情占卜、塔羅分析、復合挽回、愛情儀式、關係修復與相處教學，按個案方向整理下一步。',
    keywords: '感情占卜, 愛情占卜, 塔羅分析, 復合挽回, 愛情儀式, 感情儀式, 關係修復, 相處教學',
    image: logoUrl,
    schema: {
      '@type': 'Service',
      name: 'Asteria 感情占卜、復合挽回與愛情儀式',
      serviceType: ['感情占卜', '塔羅分析', '復合挽回', '愛情儀式', '相處教學'],
      provider: { '@type': 'LocalBusiness', name: 'Asteria Crystal Tarot', url: siteUrl },
      areaServed: ['Hong Kong', '香港']
    }
  },
  {
    route: '/about/',
    title: '關於我們｜Asteria 感情拯救所｜不只占卜，也陪你學識相處',
    description: 'Asteria 感情拯救所不只提供感情占卜與愛情儀式，亦會手把手教你訊息點覆、關係點修補、失戀情緒點穩住。',
    keywords: 'Asteria 感情拯救所, asteria.crystal.tarot, Asteria IG 香港, 感情指引, 情緒支援, 相處教學',
    image: logoUrl,
    schema: {
      '@type': 'AboutPage',
      name: '關於 Asteria 感情拯救所',
      description: 'Asteria 提供感情占卜、相處教學、訊息回覆指引與失戀情緒支援。',
      url: `${siteUrl}/about/`
    }
  },
  {
    route: '/cases/',
    title: '客人個案與好評見證｜復合・斷聯・冷淡・關係修復｜Asteria 感情拯救所',
    description: 'Asteria 客人個案與好評見證，整理復合挽回、斷聯冷淡、第三者、關係修復與愛情儀式後的真實回饋。',
    keywords: 'Asteria 好評, 客人見證, 復合成功, 關係修復, 斷聯復聯, 愛情儀式好評, 感情占卜好評',
    image: logoUrl,
    schema: {
      '@type': 'CollectionPage',
      name: 'Asteria 客人個案與好評見證',
      description: '復合、斷聯、冷淡、第三者與關係修復個案回饋。',
      url: `${siteUrl}/cases/`
    }
  },
  {
    route: '/reviews/',
    title: '客人真實好評庫｜感情占卜・愛情儀式・關係修復見證｜Asteria 感情拯救所',
    description: 'Asteria 客人真實好評庫，收錄感情占卜、塔羅分析、愛情儀式、復合挽回與關係修復後的客人回饋見證。',
    keywords: 'Asteria 好評, 客人真實好評, 感情占卜好評, 愛情儀式好評, 復合好評, 關係修復見證',
    image: logoUrl,
    schema: {
      '@type': 'CollectionPage',
      name: 'Asteria 客人真實好評庫',
      description: '感情占卜、塔羅分析、愛情儀式、復合挽回與關係修復客人回饋。',
      url: `${siteUrl}/reviews/`
    }
  },
  {
    route: '/oracle/',
    title: '每日感情指引｜愛情塔羅・復合挽回・對方想法｜Asteria 感情拯救所',
    description: 'Asteria 每日感情指引，用塔羅與感情問題方向，陪你整理復合挽回、對方想法、斷聯冷淡、曖昧相處同下一步。',
    keywords: '每日感情指引, 愛情塔羅, 感情占卜, 對方想法, 復合挽回, 斷聯冷淡, 曖昧相處, Asteria Tarot',
    image: logoUrl,
    schema: {
      '@type': 'WebPage',
      name: 'Asteria 每日感情指引',
      description: '用每日感情指引整理復合、挽回、斷聯、曖昧與對方想法。',
      url: `${siteUrl}/oracle/`
    }
  }
];

function extractPosts() {
  const source = fs.readFileSync(articlesPath, 'utf8');
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
      const arrayText = source.slice(arrayStart, i + 1);
      return Function(`"use strict"; return (${arrayText});`)();
    }
  }
  throw new Error('Cannot parse teachingPosts array.');
}

function stripHtml(html = '') {
  return html
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
    .replace(/([「『（(])\s+/g, '$1')
    .replace(/\s+([」』）)、，。？！：；])/g, '$1')
    .trim();
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function absoluteUrl(url = '') {
  if (!url) return logoUrl;
  if (url.startsWith('http')) return url;
  return `${siteUrl}${url.startsWith('/') ? url : `/${url}`}`;
}

function cleanTitle(title = '') {
  return title.replace(/[\[\]【】]/g, '').replace(/\s+/g, ' ').trim();
}

function articleSearchPhrases(post) {
  const phrases = [];
  const add = (...items) => {
    for (const item of items) {
      if (item && !phrases.includes(item)) phrases.push(item);
    }
  };
  const haystack = `${post?.title || ''} ${post?.summary || ''} ${post?.category || ''} ${(post?.tags || []).join(' ')}`;

  if (/吸引力法則|顯化|許願/.test(haystack)) add('吸引力法則愛情', '顯化好愛情', '吸引正緣');
  if (/復合|挽回|前任|分手/.test(haystack)) add('分手後點算', '挽回前任', '復合機會');
  if (/斷聯|冷淡|少覆|失聯|不讀不回|已讀不回/.test(haystack)) add('對方冷淡', '少覆 message', '斷聯後如何開口');
  if (/曖昧|暗戀|桃花|單身|脫單/.test(haystack)) add('曖昧關係點推進', '對方有冇意思', '暗戀塔羅');
  if (/第三者|新歡|出軌|介入/.test(haystack)) add('第三者介入', '前任有新歡', '關係逆轉');
  if (/溝通|訊息|message|回覆|勸|說話|聊天/.test(haystack)) add('感情溝通', '訊息點覆', '相處教學');
  if (/儀式|能量|占卜|塔羅|牌/.test(haystack)) add('香港塔羅占卜', '愛情儀式', '感情能量調整');

  add('感情占卜', '香港塔羅', 'Asteria 感情拯救所');
  return phrases.slice(0, 7);
}

function articleSeoHook(post) {
  const haystack = `${post?.title || ''} ${post?.summary || ''} ${post?.category || ''} ${(post?.tags || []).join(' ')}`;
  if (/吸引力法則|顯化|許願/.test(haystack)) {
    return '吸引力法則不是單靠許願等愛情出現，而是幫你看清想要的關係、調整狀態、守住界線，再用行動吸引真正合適的人。';
  }
  if (/復合|挽回|前任|分手/.test(haystack)) {
    return '分手後放唔低、想知仲有冇復合機會，先睇清對方心態、分手原因同下一步應唔應該主動。';
  }
  if (/斷聯|冷淡|少覆|失聯|不讀不回|已讀不回/.test(haystack)) {
    return '對方突然冷淡、少覆 message、已讀不回或斷聯時，先整理壓力位，再決定點樣開口最穩陣。';
  }
  if (/曖昧|暗戀|桃花|單身|脫單/.test(haystack)) {
    return '曖昧卡住、暗戀唔知對方有冇意思，先分清楚吸引、互動節奏同可推進的時機。';
  }
  if (/第三者|新歡|出軌|介入/.test(haystack)) {
    return '遇到第三者、前任有新歡或關係被介入時，先睇清對方真實重心同你仲可以點穩住局面。';
  }
  if (/溝通|訊息|message|回覆|勸|說話|聊天/.test(haystack)) {
    return '唔知訊息點覆、怕講錯說話或越解釋越遠，可以先用相處教學整理語氣、界線同回覆策略。';
  }
  if (/儀式|能量|占卜|塔羅|牌/.test(haystack)) {
    return '想用香港塔羅占卜或愛情儀式睇清感情能量，先整理問題核心，再揀合適方向處理。';
  }
  return '如果你喺感情入面覺得迷惘，可以先由文章整理情緒、對方心態、相處模式同下一步方向。';
}

function buildDescription(post) {
  const title = cleanTitle(post.title || '');
  const phrases = articleSearchPhrases(post).slice(0, 3).join('、');
  const text = `${title}｜${articleSeoHook(post)} 搜尋${phrases}時，Asteria 會以相處教學、香港塔羅占卜與愛情儀式方向幫你拆解。`;
  return text.replace(/\s+/g, ' ').trim().slice(0, 155);
}

function buildKeywords(post) {
  return Array.from(new Set([
    cleanTitle(post.title),
    post.category,
    post.imageLabel,
    ...(post.tags || []),
    ...articleSearchPhrases(post),
    ...searchIntents
  ].filter(Boolean))).join(', ');
}

function replaceOrInsert(html, selectorPattern, replacement, before = '</head>') {
  if (selectorPattern.test(html)) return html.replace(selectorPattern, replacement);
  return html.replace(before, `${replacement}\n${before}`);
}

function removeDynamicSchema(html) {
  return html
    .replace(/\n?\s*<script[^>]*id=["']asteria-static-route-schema["'][\s\S]*?<\/script>/g, '')
    .replace(/\n?\s*<script type=["']application\/ld\+json["']>\s*([\s\S]*?)\s*<\/script>/g, (match, body) => {
      if (
        body.includes('"@type": "ItemList"') ||
        body.includes('"@type": "Service"') ||
        body.includes('"@type": "FAQPage"')
      ) {
        return '';
      }
      return match;
    });
}

function applyMeta(baseHtml, meta) {
  const canonical = `${siteUrl}${canonicalPath(meta.route)}`;
  const image = absoluteUrl(meta.image);
  let html = removeDynamicSchema(baseHtml);
  html = replaceOrInsert(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`);
  html = replaceOrInsert(html, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapeHtml(meta.description)}" />`);
  html = replaceOrInsert(html, /<meta name="keywords" content="[^"]*"\s*\/?>/, `<meta name="keywords" content="${escapeHtml(meta.keywords)}" />`);
  html = replaceOrInsert(html, /<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${canonical}" />`);
  html = replaceOrInsert(html, /<meta property="og:type" content="[^"]*"\s*\/?>/, `<meta property="og:type" content="${meta.ogType || 'website'}" />`);
  html = replaceOrInsert(html, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escapeHtml(meta.title)}" />`);
  html = replaceOrInsert(html, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escapeHtml(meta.description)}" />`);
  html = replaceOrInsert(html, /<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${canonical}" />`);
  html = replaceOrInsert(html, /<meta property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${image}" />`);
  html = replaceOrInsert(html, /<meta property="og:image:alt" content="[^"]*"\s*\/?>/, `<meta property="og:image:alt" content="${escapeHtml(meta.imageAlt || meta.title)}" />`);
  html = replaceOrInsert(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`);
  html = replaceOrInsert(html, /<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`);
  html = replaceOrInsert(html, /<meta name="twitter:image" content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${image}" />`);
  const schema = {
    '@context': 'https://schema.org',
    '@graph': meta.schemaGraph || [meta.schema]
  };
  const schemaScript = `  <script id="asteria-static-route-schema" type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n  </script>`;
  return html.replace('</head>', `${schemaScript}\n</head>`);
}

function writeRoute(route, html) {
  const routeDir = path.join(distDir, route.replace(/^\//, ''));
  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(path.join(routeDir, 'index.html'), html);
}

function articleMeta(post) {
  const route = `/articles/${post.id}/`;
  const canonical = `${siteUrl}${canonicalPath(route)}`;
  const title = `${cleanTitle(post.title)}｜Asteria 感情拯救所`;
  const description = buildDescription(post);
  const keywords = buildKeywords(post);
  const imageUrls = Array.from(new Set([
    absoluteUrl(post.coverImage),
    ...(post.images || []).map((image) => absoluteUrl(image.src))
  ]));
  const graph = [
    {
      '@type': 'Article',
      headline: cleanTitle(post.title),
      description,
      image: imageUrls,
      author: { '@type': 'Organization', name: 'Asteria Crystal Tarot' },
      publisher: {
        '@type': 'Organization',
        name: 'Asteria Crystal Tarot',
        logo: { '@type': 'ImageObject', url: logoUrl }
      },
      mainEntityOfPage: canonical,
      url: canonical,
      inLanguage: 'zh-HK',
      articleSection: post.category,
      datePublished: post.date,
      dateModified: post.date,
      keywords,
      about: [
        '復合挽回',
        '分手失戀',
        '斷聯冷淡',
        '曖昧關係',
        '感情占卜',
        '愛情塔羅',
        '相處教學',
        post.category
      ]
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首頁', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: '相處教學', item: `${siteUrl}/teaching/` },
        { '@type': 'ListItem', position: 3, name: cleanTitle(post.title), item: canonical }
      ]
    }
  ];
  return {
    route,
    title,
    description,
    keywords,
    image: post.coverImage,
    imageAlt: `${cleanTitle(post.title)}｜${post.category}｜Asteria 相處教學封面`,
    ogType: 'article',
    schemaGraph: graph
  };
}

function main() {
  if (!fs.existsSync(indexPath)) {
    throw new Error('dist/index.html not found. Run vite build first.');
  }
  const baseHtml = fs.readFileSync(indexPath, 'utf8');
  const posts = extractPosts();
  for (const page of staticPages) {
    writeRoute(page.route, applyMeta(baseHtml, page));
  }
  for (const post of posts) {
    writeRoute(`/articles/${post.id}/`, applyMeta(baseHtml, articleMeta(post)));
  }
  console.log(`Prerendered SEO HTML for ${staticPages.length} static routes and ${posts.length} articles.`);
}

main();
