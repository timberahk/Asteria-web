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

const titleOverrides = new Map([
  [24, '愛情斯德哥爾摩症候群？一直原諒傷害你的人點算'],
  [27, '創傷迷戀是愛嗎？愛到失去自己的警號'],
  [40, '冷戰不等於迴避型人格？分清逃避與凍結反應'],
  [60, '關係不對等點算？你一直付出但對方不投入'],
  [65, '冷戰後如何重新開口？避免越追越遠的修復方法'],
  [84, '感情變淡點算？4 個令對方慢慢抽離的行為'],
  [88, '一吵架就提分手點算？先穩住情緒再修補'],
  [91, '感情變淡點算？日常相處習慣令對方抽離'],
  [101, '原諒很多次仍不改？別再替對方找藉口'],
  [102, '用發脾氣換關注有用嗎？先講需要別先攻擊'],
  [106, '親密後變冷淡點算？避免關係只停留在身體吸引'],
  [111, '忙到只剩責任？感情變淡後重新升溫的方法'],
  [112, '成日因小事發脾氣？看懂被忽略感背後的需要'],
  [116, '對方只想親密不想拍拖？分清性慾與愛情'],
  [118, '想結婚是因為愛，還是因為年齡壓力？婚前自問清單'],
  [119, '另一半太痴身點算？依附焦慮與安全感處理'],
  [121, '覺得對方唔夠愛你？用溝通拆開真正卡位'],
  [141, '媽寶男有咩徵兆？拍拖前看清責任感與家庭界線'],
  [144, '衝口而出講分手點算？假性分手後的收科方法']
]);

function stripHtml(html = '') {
  return String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function textOnlyTitle(title = '') {
  return title
    .replace(/[【】\[\]]/g, '')
    .replace(/[？?：:].*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstMeaningfulHeading(content = '') {
  const beforeFaq = content.split(/<h2[^>]*>\s*常見問題\s*<\/h2>/i)[0] || '';
  const headings = Array.from(beforeFaq.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi))
    .map((match) => stripHtml(match[1]))
    .filter((heading) => !/如果還想修復關係|逐點拆解/.test(heading));
  return headings[0] || '';
}

function removeGenericTail(content = '') {
  const [body = '', faq = ''] = content.split(/<h2[^>]*>\s*常見問題\s*<\/h2>/i);
  const cleanedBody = body
    .replace(/<h2>再看深一層：[\s\S]*?(?=<h2>|$)/g, '')
    .replace(/<h2>下一步不要急著做錯<\/h2>[\s\S]*?(?=<h2>|$)/g, '')
    .replace(/\n{3,}/g, '\n')
    .trim();
  return { body: cleanedBody, oldFaq: faq };
}

function categoryTone(category = '', title = '') {
  if (/復合|分手|斷聯|冷淡|前任|挽回/.test(category + title)) {
    return {
      q1: '如果我想處理「{focus}」，第一步應該做咩？',
      a1: '先不要急住長篇追問或逼對方表態。整理最近發生過的事、對方退後的時間點和你們仍然有沒有聯絡窗口，再用低壓方式測試對方是否願意重新互動。',
      q2: '對方少覆、冷淡或避開我，是否代表已經無機會？',
      a2: '不一定。要看冷淡是短期情緒、防衛反應，還是長期抽離。真正要觀察的是他有沒有主動補回、願不願意談清楚，以及你一靠近時關係是變鬆還是變更緊。',
      q3: 'Asteria 可以點樣幫我判斷復合方向？',
      a3: '我哋會按你的對話、時間線和對方反應，幫你分清現在適合拉近、等待、斷聯，還是先修補自己的情緒位置，避免越急越推遠。'
    };
  }
  if (/危機|出軌|渣|控制|冷暴力|暴力|操控|借錢|App/.test(category + title)) {
    return {
      q1: '「{focus}」係咪一定要即刻分手？',
      a1: '未必每個警號都等於即刻完結，但一定要先保護自己。你需要看清這是一次衝突、長期模式，還是已經涉及控制、欺騙或傷害底線。',
      q2: '我應該攤牌、收集證據，還是先觀察？',
      a2: '如果事情牽涉安全、暴力或重大欺騙，先以保護自己為先。若只是未確定的訊號，可以先記錄具體事件和對方反應，不要只靠情緒猜測。',
      q3: '塔羅或相處分析可以幫到呢類關係危機嗎？',
      a3: '可以幫你整理對方心態、關係風險和下一步策略，但重大決定仍然要配合現實行為判斷。Asteria 會提醒你哪些位置要守住底線。'
    };
  }
  if (/曖昧|暗戀|桃花|單身|心動|炮友|喜歡/.test(category + title)) {
    return {
      q1: '「{focus}」入面，點樣分清對方係認真定只係享受曖昧？',
      a1: '不要只看甜言蜜語或一時熱情，要看對方有沒有穩定投入、主動安排、願意公開或承擔關係方向。曖昧最容易令人誤判，所以要看行動多過氣氛。',
      q2: '我應該主動推進，還是保持距離？',
      a2: '可以主動一次，但要有界線。先用輕鬆方式測試對方反應，如果對方只享受互動卻不願向前，就要避免越陷越深。',
      q3: 'Asteria 可以點樣幫我拆曖昧或桃花方向？',
      a3: '我哋會幫你看對方真實投入程度、你在他心中的位置，以及下一句話應該推進、放慢還是收回，令你不會只靠感覺亂估。'
    };
  }
  if (/溝通|相處|吵架|需求|情緒|支援|分享|報備|同居|家長/.test(category + title)) {
    return {
      q1: '遇到「{focus}」，我應該先講感受定先講道理？',
      a1: '多數情況要先接住情緒，再講事情。先講具體事件和自己的感受，避免一開始就定性對方人格，對方才比較不會即刻防衛。',
      q2: '如果對方一聽就反駁、逃避或不耐煩點算？',
      a2: '把訊息縮短，只提出一個希望對方做到的小調整。不要一次過翻舊帳，也不要在情緒最高點逼對方即刻回答。',
      q3: 'Asteria 的相處教學會點樣幫我？',
      a3: '我哋會幫你 review 對話，逐句拆邊句會令對方退後、邊句可以降低壓力，再教你用更容易被聽見的方式表達需要。'
    };
  }
  return {
    q1: '「{focus}」可以點樣先睇清楚？',
    a1: '先把事件、對方反應和自己的感受分開，不要只靠一個訊號下結論。方向通常藏在重複出現的互動模式裡。',
    q2: '我應該主動處理，還是先等對方？',
    a2: '如果你仍然重視這段關係，可以主動一次，但要低壓、有界線。主動不是追住對方，而是清楚表達需要後，看對方有沒有願意回應。',
    q3: 'Asteria 可以點樣幫我拆這類感情問題？',
    a3: '我哋會結合塔羅分析、相處教學和對話 review，幫你整理對方心態、關係卡位和下一步做法。'
  };
}

function buildFaq(post) {
  const focus = textOnlyTitle(post.title);
  const firstHeading = firstMeaningfulHeading(post.content);
  const tone = categoryTone(post.category, post.title);
  const q1 = tone.q1.replace('{focus}', focus);
  const q2 = tone.q2.replace('{focus}', focus);
  const q3 = tone.q3.replace('{focus}', focus);
  const a1 = firstHeading
    ? `${tone.a1} 這篇文重點會由「${firstHeading}」開始拆，幫你先抓住最容易做錯的位置。`
    : tone.a1;
  return [
    '<h2>常見問題</h2>',
    `<h3>${q1}</h3>`,
    `<p>${a1}</p>`,
    `<h3>${q2}</h3>`,
    `<p>${tone.a2}</p>`,
    `<h3>${q3}</h3>`,
    `<p>${tone.a3}</p>`
  ].join('\n');
}

for (const post of posts) {
  if (titleOverrides.has(post.id)) post.title = titleOverrides.get(post.id);
  post.title = post.title.replace(/[【】\[\]]/g, '').replace(/\s+/g, ' ').trim();

  const { body } = removeGenericTail(post.content);
  post.content = `${body}\n${buildFaq(post)}`;
  post.coverCaption = `Asteria 相處教學：${post.title}`;
}

const serialized = JSON.stringify(posts, null, 2)
  .replace(/"([^"]+)":/g, '$1:')
  .replace(/\\u003c/g, '<')
  .replace(/\\u003e/g, '>')
  .replace(/\\u0026/g, '&');

const nextSource = `${source.slice(0, arrayStart)}${serialized}${source.slice(arrayEnd)}`;
fs.writeFileSync(articlesFile, nextSource);

console.log(`updated ${posts.length} articles`);
