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

function stripHtml(html = '') {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function articleKind(post) {
  const text = `${post.title} ${post.category} ${(post.tags || []).join(' ')}`;
  if (/控制|冷暴力|出軌|變心|恐怖|借錢|警號|PUA|貶低|操控|家暴|暴力|傷害|不改|原諒|渣男|封鎖|黑店|錯人/.test(text)) return 'risk';
  if (/復合|挽回|前任|分手|斷聯|冷戰|冷淡|回頭|重新|抽離|Block|已讀不回|失戀|不覆|覆你/.test(text)) return 'reconnect';
  if (/曖昧|暗戀|桃花|單身|心動|炮友|喜歡|約會|新歡|第三者|主動|被選擇/.test(text)) return 'ambiguous';
  if (/結婚|婚前|同居|家長|辦公室|Long D|長久|適合|條件|未來|伴侶|距離|生活|見家長|旅行|生日/.test(text)) return 'commitment';
  if (/溝通|相處|吵架|需求|情緒|壓力|支援|報備|道歉|承諾|挑剔|勸|說話|回覆|訊息|message|聽|懂你|投訴/.test(text)) return 'communication';
  return 'mindset';
}

function splitFaq(content) {
  const match = content.match(/<h2[^>]*>\s*常見問題\s*<\/h2>/i);
  if (!match) return [content, ''];
  return [content.slice(0, match.index), content.slice(match.index)];
}

function removeGeneratedSections(html) {
  const marker = '%%ASTERIA_H2%%';
  const marked = html.replace(/<h2[^>]*>(.*?)<\/h2>/gs, `${marker}<h2>$1</h2>`);
  const pieces = marked.split(marker);
  const kept = [];
  for (const piece of pieces) {
    if (!piece.trim()) continue;
    const heading = (piece.match(/<h2[^>]*>(.*?)<\/h2>/s)?.[1] || '').replace(/<[^>]+>/g, '').trim();
    const remove =
      /整理成下一步/.test(heading) ||
      /再拆深一點/.test(heading) ||
      /再看深一層：對方聽到的是需要/.test(heading) ||
      /再看清楚：.*是否仍有修補窗口/.test(heading) ||
      /再落地看：.*能否承托日常生活/.test(heading) ||
      /再判斷：.*是偶發衝突還是長期模式/.test(heading) ||
      /再觀察：.*有沒有落到行動/.test(heading) ||
      /再整理：.*牽動的是哪一種不安/.test(heading) ||
      /真正卡住的，是表達方式/.test(heading) ||
      /把說話收窄成對方聽得入耳的版本/.test(heading);
    if (!remove) kept.push(piece);
  }
  return kept.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function tailoredClose(post) {
  const focus = focusFromTitle(post.title);
  const kind = articleKind(post);
  if (kind === 'communication') {
    return {
      heading: `真正要調整的，是「${focus}」背後的說話方式`,
      paragraphs: [
        `遇到「${focus}」時，先不要急住證明自己有道理。你可以先拆清楚：你想對方明白的是感受、要求，還是底線。三樣混在一起講，對方多數只會聽到壓力。`,
        '比較穩陣的做法，是先用一兩句講清事件，再講自己的感受，最後只提出一個可以做到的小改變。對話變短、變清楚，關係才有機會慢慢鬆返。'
      ]
    };
  }
  if (kind === 'reconnect') {
    return {
      heading: `處理「${focus}」前，先看對方仲有沒有回應窗口`,
      paragraphs: [
        `「${focus}」不應該只靠衝動去追。你要先看對方是否仍願意回應、情緒是否完全切斷，以及你每次靠近時，關係是變鬆還是變緊。`,
        '如果對方仍有反應，可以用低壓方式慢慢重建安全感；如果對方明顯抗拒，就要先停一停，避免把原本仍有的空間逼到更窄。'
      ]
    };
  }
  if (kind === 'risk') {
    return {
      heading: `判斷「${focus}」時，要看這是不是長期模式`,
      paragraphs: [
        `「${focus}」最怕不是一次衝突，而是同類事情不斷重複。你可以記低事件、對方解釋、之後有沒有修正，這會比單靠感覺更清楚。`,
        '如果每次都是你消化、你原諒、你降低要求，而對方沒有實際改變，下一步就不是再忍，而是先守住自己的底線。'
      ]
    };
  }
  if (kind === 'ambiguous') {
    return {
      heading: `「${focus}」不能只看甜不甜，要看有沒有行動`,
      paragraphs: [
        `曖昧、暗戀或新對象最容易令人腦內補戲。「${focus}」要看的是對方有沒有主動安排、有沒有穩定回應，而不是只在氣氛好時給你一點甜。`,
        '你可以主動一次，但之後要留意對方有沒有接住。保留自己的節奏，才不會在關係未清楚前已經先消耗自己。'
      ]
    };
  }
  if (kind === 'commitment') {
    return {
      heading: `「${focus}」最後要落回日常細節`,
      paragraphs: [
        `很多長遠問題不是靠一句承諾解決。「${focus}」要看時間安排、家庭界線、生活壓力和未來方向，因為真正能走下去的關係，要承托得到日常。`,
        '你可以先提出一個具體安排，再看對方是否願意一起調整。行動比說法更能反映對方是否真的想同行。'
      ]
    };
  }
  return {
    heading: `處理「${focus}」前，先把情緒和事實分開`,
    paragraphs: [
      `「${focus}」會牽動很多不安，但越不安越要慢一點。先把事實、猜測和感受分開，你會更容易看見自己真正想要的是答案、修補，還是暫時停止痛苦。`,
      '當方向未清楚時，不要急著用一個行動定生死。先穩住自己，再決定下一步，通常會少很多後悔。'
    ]
  };
}

function ensureClose(content, post) {
  const [body, faq] = splitFaq(content);
  const textLength = stripHtml(body).replace(/\s/g, '').length;
  if (textLength >= 800) return content;
  const block = tailoredClose(post);
  const html = `\n<h2>${block.heading}</h2>\n${block.paragraphs.map((p) => `<p>${p}</p>`).join('\n')}\n`;
  return `${body}${html}${faq}`;
}

function uniquifyFaq(content, post) {
  const focus = focusFromTitle(post.title);
  return content
    .replace(
      /<p>復合不是靠追問，而是先降低壓力，再慢慢建立安全感。當對方不再一看到你就想逃，才有下一步空間。<\/p>/g,
      `<p>處理「${focus}」時，重點不是不停追問，而是先降低壓力，保留對方願意回應的空間。當互動不再令人想逃，下一步才有機會出現。</p>`
    )
    .replace(
      /<p>你想表達的可能是委屈，但出口變成指責時，對方只會聽到攻擊。先把語氣放低，內容才有機會被聽見。<\/p>/g,
      `<p>面對「${focus}」時，你想講的可能是委屈，但如果出口變成指責，對方只會先防衛。先把語氣放低，內容才有機會被聽見。</p>`
    )
    .replace(
      /<p>先講具體事件，再講自己的感受，最後提出一個可做到的希望。不要一開始就定性對方人格，否則對方很容易立即防衛。<\/p>/g,
      `<p>遇到「${focus}」，可以先講具體事件，再講自己的感受，最後提出一個可做到的小希望。不要一開始就定性對方人格，否則對方很容易立即防衛。</p>`
    )
    .replace(
      /<p>把訊息縮短，只處理一個重點。你要降低對話壓力，先令對方願意留下來聽，而不是一次過討論所有舊帳。<\/p>/g,
      `<p>處理「${focus}」時，可以先把訊息縮短，只處理一個重點。對話壓力低一點，對方才較願意留下來聽。</p>`
    )
    .replace(
      /<p>我哋可以幫你 review 對話，逐句拆邊句會令對方退後、邊句可以降低壓力，再教你更容易被聽見的表達方式。<\/p>/g,
      `<p>Asteria 可以按「${focus}」的情況幫你 review 對話，逐句拆邊句會推遠對方、邊句可以降低壓力，再整理更容易被聽見的表達方式。</p>`
    );
}

const specificReplacements = new Map([
  [105, {
    remove: /<h2>把「朋友叫對方分手點算」整理成下一步<\/h2>[\s\S]*?(?=<h2>常見問題<\/h2>)/,
    add: `<h2>重點不是贏過朋友，而是穩住你們之間的共識</h2>
<p>朋友叫分手時，你越急住反駁，伴侶越容易覺得自己被迫站隊。更穩的做法，是先承認外界聲音令你不安，再問對方真正想法，而不是攻擊他的朋友。</p>
<p>如果對方其實本身已經動搖，朋友只是放大了問題，你就要回到你們兩個人的相處核心：最近哪件事令他失望、你能否具體修正、他是否仍願意一起面對。</p>
`
  }],
  [127, {
    remove: /<h2>再看深一層：對方聽到的是需要，還是責備<\/h2>[\s\S]*?(?=<h2>真正加分位|<h2>常見問題<\/h2>)/,
    add: ''
  }]
]);

let changed = 0;

for (const post of posts) {
  const original = post.content;
  const [body, faq] = splitFaq(post.content);
  let nextBody = removeGeneratedSections(body);
  post.content = `${nextBody}\n${faq}`.trim();

  const special = specificReplacements.get(post.id);
  if (special) {
    post.content = post.content.replace(special.remove, special.add);
  }

  post.content = ensureClose(post.content, post);
  post.content = uniquifyFaq(post.content, post);
  post.content = post.content.replace(/\n{3,}/g, '\n\n');

  if (post.content !== original) changed += 1;
}

const serialized = JSON.stringify(posts, null, 2)
  .replace(/"([^"]+)":/g, '$1:')
  .replace(/\\u003c/g, '<')
  .replace(/\\u003e/g, '>')
  .replace(/\\u0026/g, '&');

fs.writeFileSync(articlesFile, `${source.slice(0, arrayStart)}${serialized}${source.slice(arrayEnd)}`);
console.log(`clean generated article blocks changed ${changed} articles`);
