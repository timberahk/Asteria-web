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

function articleKind(post) {
  const text = `${post.title} ${post.category} ${(post.tags || []).join(' ')}`;
  if (/控制|冷暴力|出軌|變心|恐怖|借錢|警號|PUA|貶低|操控|家暴|暴力|傷害|不改|原諒|渣男|封鎖|黑店|錯人/.test(text)) return 'risk';
  if (/復合|挽回|前任|分手|斷聯|冷戰|冷淡|回頭|重新|抽離|Block|已讀不回|失戀|不覆|覆你/.test(text)) return 'reconnect';
  if (/曖昧|暗戀|桃花|單身|心動|炮友|喜歡|約會|新歡|第三者|主動|被選擇/.test(text)) return 'ambiguous';
  if (/結婚|婚前|同居|家長|辦公室|Long D|長久|適合|條件|未來|伴侶|距離|生活/.test(text)) return 'commitment';
  if (/溝通|相處|吵架|需求|情緒|壓力|支援|報備|道歉|承諾|挑剔|勸|說話|回覆|訊息|message|聽|懂你|投訴/.test(text)) return 'communication';
  return 'mindset';
}

function bodyBeforeFaq(html = '') {
  return html.split(/<h2[^>]*>\s*常見問題\s*<\/h2>/i)[0] || '';
}

function insertBeforeFaq(content, heading, paragraphs) {
  if (content.includes(heading)) return content;
  const faqMatch = content.match(/<h2[^>]*>\s*常見問題\s*<\/h2>/i);
  const block = `<h2>${heading}</h2>\n${paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('\n')}\n`;
  if (!faqMatch) return `${content}\n${block}`;
  return `${content.slice(0, faqMatch.index)}${block}${content.slice(faqMatch.index)}`;
}

const additions = {
  communication: (focus) => ({
    heading: `再拆深一點：${focus}背後的溝通卡位`,
    paragraphs: [
      `「${focus}」最值得留意的，不是誰比較有道理，而是雙方有沒有聽到彼此真正的需要。當你只想被理解，卻用責備開場，對方自然會先保護自己。`,
      `你可以先把想講的話改成三層：發生了什麼、我有什麼感受、我希望下次可以怎樣。這樣處理「${focus}」，會比一口氣講晒委屈更容易有回應。`
    ]
  }),
  reconnect: (focus) => ({
    heading: `再看清楚：${focus}是否仍有修補窗口`,
    paragraphs: [
      `「${focus}」最重要是看對方是否仍願意接收你的訊息，而不是只看他一時冷淡。有人是需要時間，有人是想避開壓力，兩者做法完全不同。`,
      `你可以先放慢一步，用低壓方式觀察對方反應。處理「${focus}」時，少一點追問，多一點穩定，反而更容易保留下一次互動的空間。`
    ]
  }),
  risk: (focus) => ({
    heading: `再判斷：${focus}是偶發衝突還是長期模式`,
    paragraphs: [
      `「${focus}」不能只用一次道歉來判斷。真正要看的是同類事情會不會重複、對方是否承認責任，以及之後有沒有行動修正。`,
      `如果你每次都要說服自己不要介意，這已經是一個訊號。處理「${focus}」時，先守住底線，才看得清這段關係是否仍值得修補。`
    ]
  }),
  ambiguous: (focus) => ({
    heading: `再觀察：${focus}有沒有落到行動`,
    paragraphs: [
      `「${focus}」不能只靠感覺判斷。曖昧可以很甜，但真正有心的人會有時間、有安排、有回應，而不是只在你主動時才出現。`,
      `你可以主動一次，但之後要留意對方有沒有接住。處理「${focus}」時，保留自己的節奏，才不會在關係未清楚前已經先消耗自己。`
    ]
  }),
  commitment: (focus) => ({
    heading: `再落地看：${focus}能否承托日常生活`,
    paragraphs: [
      `「${focus}」不能只看感覺，也要看現實細節。時間安排、壓力處理、家庭界線和未來方向，全部都會影響一段關係能不能走長。`,
      `你可以提出一個很具體的小安排，再看對方是否願意一起調整。處理「${focus}」時，行動比承諾更能反映對方是否真的想同行。`
    ]
  }),
  mindset: (focus) => ({
    heading: `再整理：${focus}牽動的是哪一種不安`,
    paragraphs: [
      `「${focus}」很多時會令人忍不住腦內補戲，但真正需要處理的，可能是害怕被放低、害怕不被選擇，或者害怕自己再次做錯。`,
      `你可以先把情緒寫低，再把事實和猜測分開。處理「${focus}」時，先穩住自己，下一步才不會被一刻不安推著走。`
    ]
  })
};

let changed = 0;

for (const post of posts) {
  const original = post.content;
  const focus = focusFromTitle(post.title);
  const kind = articleKind(post);

  post.content = post.content
    .replace(
      /<p>如果一開口就變成翻舊帳，對方通常只會防衛。先把對話縮短，集中在今次真正卡住的位置，才有機會令關係重新回到可溝通。<\/p>/g,
      `<p>處理「${focus}」時，如果一開口就變成翻舊帳，對方通常只會防衛。先把對話縮短，集中在今次真正卡住的位置，才有機會令關係重新回到可溝通。</p>`
    )
    .replace(
      /<p>先提出一個具體安排，再看對方是否願意一起調整。真正適合的人，不只是條件好，而是遇到現實問題時仍願意同行。<\/p>/g,
      `<p>面對「${focus}」，先提出一個具體安排，再看對方是否願意一起調整。真正適合的人，不只是條件好，而是遇到現實問題時仍願意同行。</p>`
    );

  const bodyText = stripHtml(bodyBeforeFaq(post.content));
  if (bodyText.length < 900) {
    const addition = additions[kind](focus);
    post.content = insertBeforeFaq(post.content, addition.heading, addition.paragraphs);
  }

  if (post.content !== original) changed += 1;
}

const serialized = JSON.stringify(posts, null, 2)
  .replace(/"([^"]+)":/g, '$1:')
  .replace(/\\u003c/g, '<')
  .replace(/\\u003e/g, '>')
  .replace(/\\u0026/g, '&');

fs.writeFileSync(articlesFile, `${source.slice(0, arrayStart)}${serialized}${source.slice(arrayEnd)}`);
console.log(`thin article unique repair changed ${changed} articles`);
