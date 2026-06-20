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

function shortFocus(title = '') {
  const focus = focusFromTitle(title);
  return focus.length > 18 ? `${focus.slice(0, 18)}…` : focus;
}

function articleKind(post) {
  const text = `${post.title} ${post.category} ${(post.tags || []).join(' ')}`;
  if (/復合|挽回|前任|分手|斷聯|冷戰|冷淡|回頭|重新|抽離|Block|已讀不回/.test(text)) return 'reconnect';
  if (/曖昧|暗戀|桃花|單身|心動|炮友|喜歡|約會|新歡|第三者/.test(text)) return 'ambiguous';
  if (/控制|冷暴力|出軌|變心|恐怖|借錢|警號|PUA|貶低|操控|家暴|暴力|傷害|不改|原諒/.test(text)) return 'risk';
  if (/溝通|相處|吵架|需求|情緒|壓力|支援|報備|道歉|承諾|挑剔|勸|說話|回覆|訊息|message/.test(text)) return 'communication';
  if (/結婚|婚前|同居|家長|辦公室|長久|適合|條件|未來/.test(text)) return 'commitment';
  return 'mindset';
}

const kindMeta = {
  reconnect: {
    h2: (f) => `先看清「${f}」是真斷開，還是仍有修補空間`,
    next: (f) => `下一步：用低壓方式處理「${f}」`,
    pattern: (f) => `處理「${f}」時，最需要拆開的是對方退後的原因、你想靠近的方式，以及現在是否仍有安全的聯絡窗口。只要這三件事未分清，任何追問都可能令關係更緊。`,
    observe: (f) => `你可以先記低最近三次互動：對方是否仍會回應、回應時有沒有情緒、你一靠近時對方是放鬆還是更想逃。這些訊號比單純問「仲有冇機會」更能判斷「${f}」下一步點行。`,
    action: (f) => `先不要急著一次過解釋全部感受。可以用一句短而不施壓的訊息重新打開空間，再觀察對方是否願意接住。若對方仍抗拒，就要先停一停，避免把修補變成追逼。`
  },
  ambiguous: {
    h2: (f) => `「${f}」要看投入程度，不只看曖昧氣氛`,
    next: (f) => `下一步：讓「${f}」由感覺回到行動`,
    pattern: (f) => `面對「${f}」，真正要拆的是對方有沒有把心動落到現實行動。曖昧可以很甜，但如果永遠只有氣氛、沒有安排、沒有承擔，讀者就要小心自己只是被感覺牽住。`,
    observe: (f) => `你可以觀察對方會否主動安排時間、是否記得你講過的事、以及當你稍微後退時他會不會補上。這些行動會比一句甜言蜜語，更能反映「${f}」有沒有可能向前。`,
    action: (f) => `可以主動一次，但不要替對方推完整段關係。提出輕鬆邀約或清楚界線後，要留空間看對方會否接住；如果永遠都係你追住節奏，就要重新評估投入比例。`
  },
  risk: {
    h2: (f) => `「${f}」要分清磨合、警號同長期傷害`,
    next: (f) => `下一步：先保護自己，再判斷能否修補`,
    pattern: (f) => `「${f}」不能只靠一句道歉或一刻內疚判斷。真正要看的是同一種傷害有沒有重複發生、對方有沒有承認責任，以及你是否在關係中越來越不敢講真話。`,
    observe: (f) => `你可以把事件分成三欄：對方做了什麼、事後怎樣解釋、之後有沒有實際改變。如果每次都由你吞下委屈，這就不只是普通相處磨合。`,
    action: (f) => `先停一停，不要急著替對方找藉口。把底線寫清楚，再看對方有沒有用行動修正；如果只是不斷安撫你但沒有改變，就要優先保護自己的情緒和安全。`
  },
  communication: {
    h2: (f) => `「${f}」卡住時，問題通常不是有沒有愛，而是講法`,
    next: (f) => `下一步：把「${f}」變成對方聽得入耳的說法`,
    pattern: (f) => `「${f}」最常見的卡位，是你想表達需要，對方卻聽成指責。當對話一開始已經充滿防衛，就算內容有道理，對方也未必有能力接收。`,
    observe: (f) => `你可以回看最近一次爭執：你第一句是描述事件，還是已經否定對方？對方退縮時，你有沒有越追越急？這些細節會決定「${f}」是溝通，還是互相消耗。`,
    action: (f) => `先把一句責備改成具體需要。例如先講「剛才那件事令我不安」，再講「我希望下次可以提早講」。句子越清楚、越少攻擊，對方越有機會聽到你的真正意思。`
  },
  commitment: {
    h2: (f) => `「${f}」要看現實承托力，不只看心動`,
    next: (f) => `下一步：用生活細節檢查「${f}」能否走長遠`,
    pattern: (f) => `去到「${f}」這類長遠問題，真正要拆的是生活節奏、責任感和共同面對壓力的能力。愛情不只靠感覺，也要看雙方能不能在現實裡配合。`,
    observe: (f) => `你可以觀察對方在小事上的責任感：有沒有記得承諾、願不願意商量、遇到壓力時會一起處理還是逃避。這些比一句未來承諾更實際。`,
    action: (f) => `先把你最在意的現實問題列出來，再用溫和但清楚的方式提出。不要一開始就逼對方給終局答案，而是看他是否願意一起調整。`
  },
  mindset: {
    h2: (f) => `「${f}」要先分清事實、猜測同情緒`,
    next: (f) => `下一步：把「${f}」由腦內劇場拉回現實`,
    pattern: (f) => `處理「${f}」時，最容易被一刻情緒帶走。你可能不是沒有答案，而是把對方一個反應放大成整段關係的結論，令自己越想越亂。`,
    observe: (f) => `你可以先寫低：實際發生了什麼、自己腦中補了什麼意思、身體和情緒有什麼反應。分清三件事之後，「${f}」就不再只是一團混亂。`,
    action: (f) => `先不要即時用情緒做決定。給自己一段冷靜時間，再決定要溝通、觀察、修補還是抽離。當你不再急著證明自己被愛，下一步會清楚很多。`
  }
};

function pointHeading(post, index, current) {
  const focus = shortFocus(post.title);
  const kind = articleKind(post);
  const sets = {
    reconnect: ['保留聯絡窗口', '分清退後原因', '停止用追問補救', '重建舒服互動', '用小回應判斷機會', '不要把復合變成壓力'],
    ambiguous: ['看行動多過看氣氛', '不要太快交出主導權', '用界線測試投入', '分清心動同承擔', '保留自己的節奏', '讓對方也需要付出'],
    risk: ['先承認這是警號', '看傷害有沒有重複', '不要替對方合理化', '守住自己的底線', '用行動判斷道歉', '必要時先抽離保護自己'],
    communication: ['先接住情緒', '把審問改成需要', '一次只講一個重點', '用具體例子代替批評', '讓對方有空間回應', '把下一步講清楚'],
    commitment: ['看責任感', '看生活能否磨合', '看壓力下的反應', '把承諾落到行動', '提早講清界線', '不要只靠浪漫支撐'],
    mindset: ['分清事實與猜測', '看重複模式', '不要用情緒下判決', '把注意力收回自己', '先整理真正需要', '保留選擇權']
  };
  const base = sets[kind][(index - 1) % sets[kind].length] || current;
  return `${base}：回到「${focus}」本身`;
}

function enrichBlock(post) {
  const focus = shortFocus(post.title);
  const meta = kindMeta[articleKind(post)];
  return [
    `<h2>讀完之後，可以先做一個小整理</h2>`,
    `<p>${meta.observe(focus)}</p>`,
    `<p>如果你想把「${focus}」處理得更穩，可以先不要追求一次過解決。先找出最影響你情緒的一個位，再決定是要調整說話、拉開距離、要求回應，還是需要更深入拆對方心態。</p>`
  ].join('\n');
}

const exactParagraphReplacements = [
  [
    '<p>很多人最辛苦的位置，是明明想做好，卻因為太緊張而越做越錯。你可以先把最近三次重要互動寫低：發生了什麼、你當時怎樣回應、對方之後有什麼變化。當你看見模式，就不會只被一刻情緒牽著走。</p>',
    (post) => `<p>${kindMeta[articleKind(post)].observe(shortFocus(post.title))}</p>`
  ],
  [
    '<p>先把目標收窄。你不需要一次過解決所有問題，只需要先做一個不會加劇壓力的動作：短訊息、清楚界線、穩定情緒，或者暫時停止追問。當對方反應變得清楚，再決定要推進、修補、等待，還是重新保護自己。</p>',
    (post) => `<p>${kindMeta[articleKind(post)].action(shortFocus(post.title))}</p>`
  ],
  [
    '<p>你可以先觀察三個位置：對方最近有冇主動靠近、衝突後有冇修補、你表達需要時對方係願意理解，定只係想快點完結話題。這些細節會比一句「 愛不愛 」更能反映關係狀態。</p>',
    (post) => `<p>${kindMeta[articleKind(post)].observe(shortFocus(post.title))}</p>`
  ],
  [
    '<p>如果你一邊很想修補，一邊又很怕失去，就更加要先整理好說話次序。先講具體事件，再講自己的感受，最後只提出一個清楚而可做到的希望。這樣比長篇控訴更容易令對方聽得入耳，也更方便判斷對方是否仍願意為關係付出。</p>',
    (post) => `<p>${kindMeta[articleKind(post)].action(shortFocus(post.title))}</p>`
  ]
];

let changed = 0;

for (const post of posts) {
  const original = post.content;
  const meta = kindMeta[articleKind(post)];
  const focus = shortFocus(post.title);
  let content = post.content;

  content = content
    .replace(/<h2>真正要拆的不是一句說話，而是互動模式<\/h2>/g, `<h2>${meta.h2(focus)}</h2>`)
    .replace(/<h2>下一步可以怎樣做<\/h2>/g, `<h2>${meta.next(focus)}</h2>`)
    .replace(/<h2>下一步不要急著做錯<\/h2>/g, `<h2>${meta.next(focus)}</h2>`)
    .replace(/<h2>如果還想修復關係，你可以先這樣做<\/h2>/g, `<h2>${meta.next(focus)}</h2>`);

  for (const [needle, replacer] of exactParagraphReplacements) {
    content = content.split(needle).join(replacer(post));
  }

  let numericIndex = 0;
  content = content.replace(/<h3>(\d+)\.\s*([^<]+)<\/h3>/g, (match, rawNumber, heading) => {
    numericIndex += 1;
    const normalized = heading.replace(/：回到「[^」]+」本身$/, '');
    const veryGeneric = /^(先接住情緒|不要把關心|把要求縮小|少一點指責|先分開事實|看重複模式|不要用情緒|把注意力收回|聯絡窗口|對方退後|不要用追問|警號不是|先分清偶發|不要替對方)/.test(normalized);
    if (!veryGeneric) return match;
    return `<h3>${rawNumber}. ${pointHeading(post, numericIndex, normalized)}</h3>`;
  });

  const [beforeFaq, faqRest = ''] = content.split(/(<h2[^>]*>\s*常見問題\s*<\/h2>[\s\S]*)/i);
  if (stripHtml(beforeFaq).length < 920) {
    content = `${beforeFaq}\n${enrichBlock(post)}${faqRest ? `\n${faqRest}` : ''}`;
  }

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
console.log(`polished ${changed} articles`);
