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
  return focus.length > 18 ? `${focus.slice(0, 18)}…` : focus;
}

function articleKind(post) {
  const text = `${post.title} ${post.category} ${(post.tags || []).join(' ')}`;
  if (/復合|挽回|前任|分手|斷聯|冷戰|冷淡|回頭|重新|抽離|Block|已讀不回|失戀/.test(text)) return 'reconnect';
  if (/曖昧|暗戀|桃花|單身|心動|炮友|喜歡|約會|新歡|第三者/.test(text)) return 'ambiguous';
  if (/控制|冷暴力|出軌|變心|恐怖|借錢|警號|PUA|貶低|操控|家暴|暴力|傷害|不改|原諒|渣男/.test(text)) return 'risk';
  if (/溝通|相處|吵架|需求|情緒|壓力|支援|報備|道歉|承諾|挑剔|勸|說話|回覆|訊息|message|聽/.test(text)) return 'communication';
  if (/結婚|婚前|同居|家長|辦公室|長久|適合|條件|未來|伴侶/.test(text)) return 'commitment';
  return 'mindset';
}

const lineSets = {
  communication: [
    (f) => `處理「${f}」時，不要一次過講十件事。先選最影響你們互動的一個位，用短句講感受、影響和希望，對方才知道自己可以怎樣配合。`,
    (f) => `「${f}」最怕變成連環投訴。你可以先講一件具體事，再講你需要的是安撫、解釋還是改變，令對方不會只聽到自己被責怪。`,
    (f) => `如果「${f}」一講就爆，可以先把長篇訊息拆成三句：發生了什麼、你有什麼感受、希望下次怎樣做。越清楚，越容易被接住。`,
    (f) => `面對「${f}」，重點不是把道理講贏，而是讓對方知道下一步可以怎樣修補。先縮小議題，再看對方是否願意回應。`
  ],
  mindset: [
    (f) => `面對「${f}」，先把注意力收回自己身上。做一件能令情緒穩定的小事，再決定要不要回覆或攤牌，會比被不安推著走更穩。`,
    (f) => `「${f}」容易令人越想越亂。你可以先停一停，把最刺痛的一點寫低，等情緒降下來，再判斷這是事實、猜測還是恐懼。`,
    (f) => `如果「${f}」令你一直腦內重播，不要急著找對方求答案。先穩住自己的節奏，講出來的說話才不會變成試探或逼問。`,
    (f) => `處理「${f}」前，先問自己真正想要的是答案、安慰、界線還是離開。目標清楚之後，下一句說話先會有方向。`
  ],
  risk: [
    (f) => `處理「${f}」時，先不要用愛合理化傷害。你可以給一次清楚界線，但要看對方有沒有真實行動，否則只會重複同一種消耗。`,
    (f) => `「${f}」不能只靠對方一句道歉判斷。你要看他之後會否承認、調整和承擔，否則底線會一次比一次退後。`,
    (f) => `如果「${f}」令你越來越不敢講真話，先把安全感放回自己身上。清楚說出不能接受的位置，再觀察對方是否尊重。`,
    (f) => `面對「${f}」，先保護自己不是自私。只有你守住底線，才看得清對方到底想修補，還是只想你繼續忍。`
  ],
  reconnect: [
    (f) => `「${f}」不要急著一步到位。先把目標改成令下一次互動少一點壓力，對方重新覺得和你說話安全，關係才有機會慢慢鬆動。`,
    (f) => `處理「${f}」時，先停止用求答案的方式靠近。用一句短、輕、貼近當下的話重開互動，再看對方是否願意接住。`,
    (f) => `如果「${f}」已經令對方退後，先不要長篇解釋。保留一個低壓聯絡窗口，比逼對方即時表態更有修補空間。`,
    (f) => `面對「${f}」，先看對方是需要時間，還是已經想切斷。兩者做法不同，最怕一急就把原本仍有的窗口關上。`
  ],
  ambiguous: [
    (f) => `面對「${f}」，先保留自己的節奏。你可以表達興趣，但也要看對方會否付出時間和行動，不要只靠氣氛判斷。`,
    (f) => `「${f}」最怕你一個人推完整段關係。主動一次可以，但之後要看對方是否接住，而不是永遠由你追住節奏。`,
    (f) => `如果「${f}」令你心郁又不安，可以先退半步看對方反應。真正有心的人，不會只在你主動時才出現。`
  ],
  commitment: [
    (f) => `處理「${f}」時，先把抽象不安變成具體問題。時間安排、價值觀、承諾和壓力處理方式，會比一句我愛你更能反映長遠。`,
    (f) => `「${f}」要看生活裡能否磨合。你可以提出一個具體安排，再看對方是否願意一起調整，而不是只聽口頭承諾。`,
    (f) => `如果「${f}」牽涉未來方向，先不要逼終局答案。看對方願不願意面對現實問題，已經能反映很多。`
  ]
};

const repeated = [
  '不要一次過講十件事。先選最重要的一件，用短句講感受、影響和希望，讓對方知道他可以怎樣做，而不是只聽到自己被投訴。',
  '把注意力先收回自己身上。你可以先做一件令情緒穩定的小事，再決定要不要溝通；穩住之後講出來的話，通常更有力量。',
  '先把內容縮小成一個重點。用「剛才那件事令我不安，我希望下次可以提早講」代替「你永遠都係咁」，對方才有機會聽到你的真正需要。',
  '先不要急著用愛合理化傷害。你可以給一次清楚界線，但要看對方有沒有真實改變；若只得安撫沒有行動，就要優先保護自己。',
  '先接住情緒，再講事情。可以先說「我不是想吵，只是想講清楚剛才令我不舒服的位置」，比一開始質問更容易讓對方留下來聽。',
  '你可以先把目標改小：不是即刻復合，而是令下一次互動不再有壓迫感。當對方重新覺得和你說話是安全的，關係才有機會慢慢鬆動。',
  '先把底線寫清楚：你不能接受什麼、希望對方具體改什麼、需要觀察多久。真正的修補不是道歉，而是之後的行動是否穩定。',
  '先停止用「求答案」的方式靠近。你可以用一句輕、短、貼近當下的話重開互動，然後觀察對方是否願意接住，而不是逼他即時表態。',
  '先保留自己的節奏。你可以表達興趣，但同時留意對方是否願意付出時間和行動；如果永遠都是你推，他只享受被追，關係會很易失衡。'
];

let changed = 0;

for (const post of posts) {
  const original = post.content;
  const focus = shortFocus(post);
  const kind = articleKind(post);
  const set = lineSets[kind] || lineSets.mindset;
  let index = 0;
  let content = post.content;

  for (const text of repeated) {
    while (content.includes(`<p>${text}</p>`)) {
      const replacement = set[(post.id + index) % set.length](focus);
      content = content.replace(`<p>${text}</p>`, `<p>${replacement}</p>`);
      index += 1;
    }
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
console.log(`article audit repair pass 3 changed ${changed} articles`);
