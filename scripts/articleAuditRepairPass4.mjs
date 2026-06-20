import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const articlesFile = path.join(repoRoot, 'lib', 'articlesData.ts');
const source = fs.readFileSync(articlesFile, 'utf8');

function findPostsArrayBounds(text) {
  const marker = 'export const teachingPosts';
  const startMarker = text.indexOf(marker);
  if (startMarker === -1) throw new Error('Cannot find teachingPosts export.');
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

const [arrayStart, arrayEnd] = findPostsArrayBounds(source);
const posts = Function(`"use strict"; return (${source.slice(arrayStart, arrayEnd)});`)();

function stripHtml(html = '') {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function focusFromTitle(title = '') {
  return title
    .replace(/[【】\[\]]/g, '')
    .replace(/[？?：:].*$/, '')
    .replace(/^\d+\s*[.、]\s*/, '')
    .replace(/[「」]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function shortFocus(post) {
  const focus = focusFromTitle(post.title);
  return focus.length > 22 ? `${focus.slice(0, 22)}…` : focus;
}

function articleKind(post) {
  const text = `${post.title} ${post.category} ${(post.tags || []).join(' ')}`;
  if (/控制|冷暴力|出軌|變心|恐怖|借錢|警號|PUA|貶低|操控|家暴|暴力|傷害|不改|原諒|渣男|封鎖|黑店|錯人/.test(text)) return 'risk';
  if (/復合|挽回|前任|分手|斷聯|冷戰|冷淡|回頭|重新|抽離|Block|已讀不回|失戀|不覆|覆你/.test(text)) return 'reconnect';
  if (/曖昧|暗戀|桃花|單身|心動|炮友|喜歡|約會|新歡|第三者|主動|被選擇/.test(text)) return 'ambiguous';
  if (/溝通|相處|吵架|需求|情緒|壓力|支援|報備|道歉|承諾|挑剔|勸|說話|回覆|訊息|message|聽|懂你|投訴/.test(text)) return 'communication';
  if (/結婚|婚前|同居|家長|辦公室|Long D|長久|適合|條件|未來|伴侶|距離|生活/.test(text)) return 'commitment';
  return 'mindset';
}

const profiles = {
  communication: {
    small: '先拆清楚：對話是在哪一步開始失控',
    deeper: '再看深一層：對方聽到的是需要，還是責備',
    action: '把說話收窄成對方聽得入耳的版本',
    takeaway: '可以立即試的溝通做法',
    next: (focus) => `下一步：把「${focus}」講成可被接住的需要`
  },
  reconnect: {
    small: '先判斷：仍有聯絡窗口，還是真正斷開',
    deeper: '再看深一層：對方退後的真正訊號',
    action: '先令互動不再有壓迫感',
    takeaway: '可以立即做的復合整理',
    next: (focus) => `下一步：用低壓方式處理「${focus}」`
  },
  risk: {
    small: '先分清：這是磨合，還是關係警號',
    deeper: '再看深一層：你是否一直替傷害找理由',
    action: '先保護自己，再判斷能否修補',
    takeaway: '可以立即守住的底線',
    next: (focus) => `下一步：先守住底線再處理「${focus}」`
  },
  ambiguous: {
    small: '先看清：對方是有行動，還是只有氣氛',
    deeper: '再看深一層：你是否一個人推完整段關係',
    action: '主動可以，但不要失去自己的節奏',
    takeaway: '可以立即觀察的曖昧訊號',
    next: (focus) => `下一步：用有界線的方式處理「${focus}」`
  },
  commitment: {
    small: '先看現實：感情能否落到日常生活',
    deeper: '再看深一層：承諾是否有行動承托',
    action: '把長遠不安變成具體問題',
    takeaway: '可以立即檢查的長遠條件',
    next: (focus) => `下一步：用現實細節檢查「${focus}」`
  },
  mindset: {
    small: '先整理：這是事實、猜測，還是恐懼',
    deeper: '再看深一層：真正令你不安的位置',
    action: '先穩住自己，再決定下一句說話',
    takeaway: '可以立即做的情緒整理',
    next: (focus) => `下一步：把「${focus}」由腦內劇場拉回現實`
  }
};

function titleSpecificNext(post, profile) {
  const title = post.title;
  const focus = shortFocus(post);
  if (/Long D|距離/.test(title)) return '下一步：讓距離變成可以一起管理的安排';
  if (/T 人|講道理|理性/.test(title)) return '下一步：先講感受，再講解法';
  if (/條件完美|不合適/.test(title)) return '下一步：用生活細節檢查是否真的適合';
  if (/分手.*痛|失戀/.test(title)) return '下一步：先接住失重感，再決定要不要修復';
  return profile.next(focus);
}

function cleanDuplicateHeadings(content, profile) {
  const used = new Map();
  const alternatives = [profile.deeper, profile.action, profile.takeaway, profile.small];

  return content.replace(/<h2>([^<]+)<\/h2>/g, (match, heading) => {
    const normalized = stripHtml(heading).replace(/\s+/g, '');
    const count = used.get(normalized) || 0;
    used.set(normalized, count + 1);
    if (count === 0) return match;
    const replacement = alternatives[count % alternatives.length];
    return `<h2>${replacement}</h2>`;
  });
}

let changed = 0;

for (const post of posts) {
  const original = post.content;
  const kind = articleKind(post);
  const profile = profiles[kind] || profiles.mindset;
  const focus = shortFocus(post);
  let content = post.content;

  content = content
    .replace(/<h2>讀完之後，可以先做一個小整理<\/h2>/g, `<h2>${profile.small}</h2>`)
    .replace(/<h2>讀者可以即刻拎走的做法<\/h2>/g, `<h2>${profile.takeaway}</h2>`)
    .replace(/<h2>再整理多一步<\/h2>/g, `<h2>${profile.action}</h2>`)
    .replace(/<h2>再看深一層：真正卡住的位置<\/h2>/g, `<h2>${profile.deeper}</h2>`)
    .replace(/<h2>其實可能係你嘅錯覺<\/h2>/g, '<h2>別把傷害誤認成愛</h2>')
    .replace(/<h2>如果你嘅伴侶習慣將日常嘅小磨擦同抱怨放大，<\/h2>/g, '<h2>外來聲音會放大伴侶的不安</h2>')
    .replace(/<h2>"([^"]+)"卡住時，問題通常不是有沒有愛，而是講法<\/h2>/g, '<h2>「$1」真正卡住的，是表達方式</h2>')
    .replace(/<h2>「([^」]+)」卡住時，問題通常不是有沒有愛，而是講法<\/h2>/g, '<h2>「$1」真正卡住的，是表達方式</h2>')
    .replace(/<h2>下一步：把「[^」]+」變成對方聽得入耳的說法<\/h2>/g, `<h2>${titleSpecificNext(post, profile)}</h2>`)
    .replace(/<h2>下一步可以怎樣做<\/h2>/g, `<h2>${titleSpecificNext(post, profile)}</h2>`)
    .replace(/<h2>如果還想修復關係，你可以先這樣做<\/h2>/g, `<h2>${titleSpecificNext(post, profile)}</h2>`);

  content = content
    .replace(/<h2>([^<]+)<\/h2>\s*(?=<h2>)/g, '')
    .replace(/<h2>([^<]+)<\/h2>\s*(?=<h3>)/g, '<h2>$1</h2>\n')
    .replace(/\n{4,}/g, '\n\n');

  content = cleanDuplicateHeadings(content, profile);

  // If a generated final section still contains a title-only generic line, make it read like a real conclusion.
  content = content.replace(
    new RegExp(`<p>最後要記住，${focus.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}不是靠一句說話就完全解決，而是要看你之後能否用更穩的節奏處理。先減少追問、減少試探，再把真正需要講清楚，關係先有機會重新回到可溝通的位置。</p>`, 'g'),
    `<p>最後要記住，「${focus}」不需要即刻用一個動作解決。先看清真正卡住的位置，再用更穩、更有界線的方式處理，才不會越做越亂。</p>`
  );

  if (content !== original) {
    post.content = content;
    changed += 1;
  }
}

const serialized = JSON.stringify(posts, null, 2)
  .replace(/"([^"]+)":/g, '$1:')
  .replace(/\\u003c/g, '<')
  .replace(/\\u003e/g, '>')
  .replace(/\\u0026/g, '&');

fs.writeFileSync(articlesFile, `${source.slice(0, arrayStart)}${serialized}${source.slice(arrayEnd)}`);
console.log(`article audit repair pass 4 changed ${changed} articles`);
