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

function bodyBeforeFaq(html = '') {
  return html.split(/<h2[^>]*>\s*常見問題\s*<\/h2>/i)[0] || '';
}

function faqAndAfter(html = '') {
  const match = html.match(/<h2[^>]*>\s*常見問題\s*<\/h2>[\s\S]*$/i);
  return match?.[0] || '';
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

const generatedHeadingPatterns = [
  /先拆清楚：對話是在哪一步開始失控/,
  /再看深一層：對方聽到的是需要，還是責備/,
  /把說話收窄成對方聽得入耳的版本/,
  /可以立即試的溝通做法/,
  /先判斷：仍有聯絡窗口，還是真正斷開/,
  /再看深一層：對方退後的真正訊號/,
  /先令互動不再有壓迫感/,
  /可以立即做的復合整理/,
  /先分清：這是磨合，還是關係警號/,
  /再看深一層：你是否一直替傷害找理由/,
  /可以立即守住的底線/,
  /先整理：這是事實、猜測，還是恐懼/,
  /再看深一層：真正令你不安的位置/,
  /先穩住自己，再決定下一句說話/,
  /可以立即做的情緒整理/,
  /先看清：對方是有行動，還是只有氣氛/,
  /再看深一層：你是否一個人推完整段關係/,
  /主動可以，但不要失去自己的節奏/,
  /可以立即觀察的曖昧訊號/,
  /先看現實：感情能否落到日常生活/,
  /再看深一層：承諾是否有行動承托/,
  /把長遠不安變成具體問題/,
  /可以立即檢查的長遠條件/
];

function isGeneratedHeading(heading) {
  return generatedHeadingPatterns.some((pattern) => pattern.test(heading));
}

function splitSections(html) {
  const matches = [...html.matchAll(/<h2>([\s\S]*?)<\/h2>/g)];
  if (!matches.length) return [{ heading: '', html }];
  const sections = [];
  if (matches[0].index > 0) {
    sections.push({ heading: '', html: html.slice(0, matches[0].index) });
  }
  for (let i = 0; i < matches.length; i += 1) {
    const start = matches[i].index;
    const end = matches[i + 1]?.index ?? html.length;
    sections.push({ heading: stripHtml(matches[i][1]), html: html.slice(start, end) });
  }
  return sections;
}

function removeLowValueGeneratedSections(html) {
  const sections = splitSections(html);
  const kept = [];
  for (const section of sections) {
    const text = stripHtml(section.html);
    const hasSpecificOriginalSignal = /Gottman|Attachment|Bowlby|Future Projection|首因效應|斯德哥爾摩|具體例子|例如：|第一|第二|第三|Level|原因|誤區/.test(text);
    if (isGeneratedHeading(section.heading) && !hasSpecificOriginalSignal) continue;
    if (/如果你想把「[^」]+」處理得更穩，可以先不要追求一次過解決/.test(text)) continue;
    if (/最後要記住，「[^」]+」不需要即刻用一個動作解決/.test(text)) continue;
    kept.push(section.html);
  }
  return kept.join('\n').replace(/\n{4,}/g, '\n\n');
}

const targetedAdditions = {
  127: {
    heading: '真正加分位：自然、尊重、有眼力見',
    paragraphs: [
      '見家長最重要不是表演到好完美，而是讓對方父母感覺你穩定、有禮貌、懂得尊重他們的生活節奏。你可以主動，但不要搶著做；可以表達自己，但不要第一次見面就急住辯論。',
      '如果伴侶夾在你和家人中間，你亦要先和伴侶對齊界線：哪些話題先避開、禮物怎樣準備、飯局多久離開。準備得越清楚，見面時越不會慌。'
    ]
  },
  105: {
    heading: '重點不是贏過朋友，而是穩住你們之間的共識',
    paragraphs: [
      '朋友叫分手時，你越急住反駁，伴侶越容易覺得自己被迫站隊。更穩的做法，是先承認外界聲音令你不安，再問對方真正想法，而不是攻擊他的朋友。',
      '如果對方其實本身已經動搖，朋友只是放大了問題，你就要回到你們兩個人的相處核心：最近哪件事令他失望、你能否具體修正、他是否仍願意一起面對。'
    ]
  }
};

function ensureTargetedAddition(post, html) {
  const addition = targetedAdditions[post.id];
  if (!addition || html.includes(addition.heading)) return html;
  return `${html}\n<h2>${addition.heading}</h2>\n${addition.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('\n')}`;
}

function fallbackIfThin(post, html) {
  if (stripHtml(html).length >= 850) return html;
  const kind = articleKind(post);
  const focus = post.title.replace(/[？?：:].*$/, '').replace(/[【】\[\]]/g, '');
  const extra = {
    communication: [
      `處理「${focus}」時，最重要是把情緒和要求分開。你可以先講事件，再講感受，最後只提出一個希望，令對方知道下一步可以怎樣配合。`,
      '如果一開口就變成翻舊帳，對方通常只會防衛。先把對話縮短，集中在今次真正卡住的位置，才有機會令關係重新回到可溝通。'
    ],
    reconnect: [
      `面對「${focus}」，不要只問還有沒有機會。先看對方有沒有回應窗口、情緒是否仍有波動，以及你放慢之後互動會不會變舒服。`,
      '復合不是靠追問，而是先降低壓力，再慢慢建立安全感。當對方不再一看到你就想逃，才有下一步空間。'
    ],
    risk: [
      `遇到「${focus}」，要先把傷害和磨合分清楚。一次衝突可以溝通，但長期令你害怕表達需要，就要先守住底線。`,
      '真正值得修補的關係，會有承認、行動和穩定改變；如果每次都只是你心軟，問題就不是你不夠包容。'
    ],
    ambiguous: [
      `面對「${focus}」，不要只看曖昧氣氛。真正有心的人會有行動、有時間、有回應，而不是永遠等你主動推進。`,
      '你可以主動一次，但之後要看對方是否接住。保留自己的節奏，才不會在未確定關係前已經消耗太多。'
    ],
    commitment: [
      `處理「${focus}」時，要看現實生活能不能配合。價值觀、壓力處理、家庭界線和未來安排，比一句承諾更能反映長遠。`,
      '先提出一個具體安排，再看對方是否願意一起調整。真正適合的人，不只是條件好，而是遇到現實問題時仍願意同行。'
    ],
    mindset: [
      `面對「${focus}」，先分清事實、猜測和恐懼。很多時候最痛的不是事件本身，而是你在腦內補完了最壞結果。`,
      '當情緒太滿時，先不要急著傳訊息或下判斷。等自己穩一點，再決定下一步，通常會少很多後悔。'
    ]
  }[kind];
  return `${html}\n<h2>可以先這樣整理</h2>\n${extra.map((paragraph) => `<p>${paragraph}</p>`).join('\n')}`;
}

let changed = 0;

for (const post of posts) {
  const original = post.content;
  const body = bodyBeforeFaq(post.content);
  const faq = faqAndAfter(post.content);
  let cleaned = removeLowValueGeneratedSections(body);

  cleaned = ensureTargetedAddition(post, cleaned);
  cleaned = fallbackIfThin(post, cleaned);
  cleaned = cleaned
    .replace(/<h2>([^<]+)<\/h2>\s*(?=<h2>)/g, '')
    .replace(/\n{4,}/g, '\n\n');

  post.content = `${cleaned}\n${faq}`.trim();
  if (post.content !== original) changed += 1;
}

const serialized = JSON.stringify(posts, null, 2)
  .replace(/"([^"]+)":/g, '$1:')
  .replace(/\\u003c/g, '<')
  .replace(/\\u003e/g, '>')
  .replace(/\\u0026/g, '&');

fs.writeFileSync(articlesFile, `${source.slice(0, arrayStart)}${serialized}${source.slice(arrayEnd)}`);
console.log(`article audit repair pass 5 changed ${changed} articles`);
