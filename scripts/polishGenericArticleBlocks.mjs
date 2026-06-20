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

function stripHtml(html = '') {
  return String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanTitle(title = '') {
  return title
    .replace(/[【】\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function focusTitle(title = '') {
  return cleanTitle(title)
    .replace(/[？?：:].*$/, '')
    .replace(/點算$/, '')
    .trim();
}

function splitFaq(content = '') {
  const [body = '', faq = ''] = content.split(/<h2[^>]*>\s*常見問題\s*<\/h2>/i);
  return { body: body.trim(), faq };
}

function headings(html = '') {
  return Array.from(html.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi)).map((match) => stripHtml(match[1]));
}

function kindFor(post) {
  const text = `${post.category || ''} ${post.title || ''} ${post.summary || ''}`;
  if (/借錢|金錢|錢/.test(text)) return 'money';
  if (/交友 App|出軌|第三者|背叛|欺騙|桃花|曖昧對象/.test(text)) return 'trust';
  if (/冷暴力|冷戰|斷聯|少覆|不回|已讀不回|冷淡|抽離|失聯/.test(text)) return 'distance';
  if (/復合|挽回|前任|分手|假性分手|放低|復聯/.test(text)) return 'recovery';
  if (/原諒|不改|答應|承諾|責任|卸膊|藉口|道歉/.test(text)) return 'accountability';
  if (/發脾氣|情緒|不安|焦慮|壓力|內耗|委屈|心累|安全感/.test(text)) return 'emotion';
  if (/曖昧|暗戀|朋友|日久生情|炮友|親密|喜歡|心動/.test(text)) return 'ambiguous';
  if (/取悅|壓抑|討好|自我|價值|創傷|迷戀|斯德哥爾摩|Pick Me/.test(text)) return 'self';
  if (/變淡|長久|熱戀|生活|新鮮感|升溫/.test(text)) return 'warmth';
  return 'communication';
}

const profiles = {
  money: {
    summary: (focus) => `${focus} 最重要不是即刻答應或拒絕，而是分清信任、責任和金錢界線，避免由伴侶變成替對方收拾後果的人。`,
    intro: (focus) => `${focus} 的關鍵，不只是金額大小，而是對方有沒有把責任推到你身上。感情可以互相扶持，但一旦用愛情包裝金錢壓力，就很容易令你不敢拒絕、不敢問清楚。`,
    h1: '先分清是困難，還是習慣依賴',
    p1: '一次臨時困難和長期把問題丟給你，是兩回事。你要看的不是對方講得多可憐，而是他有沒有交代原因、還款安排和自己的承擔。',
    h2: '最容易做錯：用心軟代替界線',
    p2: '如果你每次都怕對方不開心而即刻讓步，對方會慢慢習慣把你的包容當成理所當然。關心不等於無條件承擔，幫忙之前一定要先保護自己。',
    h3: '可以怎樣開口比較穩',
    p3: '先問清楚實際需要、期限和對方打算點處理，再決定自己能否承受。你可以溫柔，但答案要清楚，避免模糊承諾令自己之後更難收回。'
  },
  trust: {
    summary: (focus) => `${focus} 牽涉信任和界線，不要只聽解釋，要看對方有沒有停止、交代和修補行動。`,
    intro: (focus) => `${focus} 最令人不安，是你不知道對方只是無心，還是已經越過關係界線。這時候不要只追著一句解釋，要把事件、反應和後續行動分開看。`,
    h1: '先看行為，不要只聽說法',
    p1: '對方可以講很多理由，但真正反映態度的是他之後有沒有避嫌、有沒有主動交代、有沒有願意令你安心。只有說法沒有行動，信任很難重建。',
    h2: '最容易做錯：一邊質問一邊求安慰',
    p2: '當你很不安，會想立刻逼對方承認或保證。但如果你未整理好證據和底線，對話很容易變成爭吵，反而令真正重點被帶走。',
    h3: '可以先守住三個位置',
    p3: '第一，保留具體事件。第二，講清楚你介意的是界線被越過，不是單純呷醋。第三，觀察對方是否願意用行動修補，而不是只想你快點算數。'
  },
  distance: {
    summary: (focus) => `${focus} 不一定等於無機會，但代表互動節奏出了問題；先分清對方是冷靜、防衛，還是長期抽離。`,
    intro: (focus) => `${focus} 最容易令你慌，因為你越想拉近，對方可能越退後。要先看清他是短暫需要空間，還是已經長期不願面對關係。`,
    h1: '先找出冷淡由哪裡開始',
    p1: '不要只記得自己等訊息等到幾辛苦，要回頭看冷淡前發生過甚麼。是吵架後退後、工作壓力，還是對方一直避免承諾？原因不同，做法也不同。',
    h2: '最容易做錯：用長篇訊息追答案',
    p2: '你越急著問「你到底想點」，對方越容易覺得有壓力。尤其對方本身已經退後時，長篇訊息通常只會令他更想逃。',
    h3: '比較穩的下一步',
    p3: '先用一句低壓而清楚的訊息測試對方是否願意回應，再按反應決定拉近、等待或暫停。重點是不要讓自己在恐慌裡連續出錯。'
  },
  recovery: {
    summary: (focus) => `${focus} 不能只靠衝動挽回，要先判斷分手原因、對方是否仍有接收窗口，再決定復聯節奏。`,
    intro: (focus) => `${focus} 的重點不是一直證明自己有多愛，而是先看清對方為甚麼退後，以及現在還有沒有可以重新溝通的窗口。`,
    h1: '先分清是真切斷，還是假性分手',
    p1: '如果只是情緒爆煲，處理方法和真性切斷完全不同。你要看對方是否仍願意回應、是否仍在乎你的狀態，以及分手原因是否有機會被修補。',
    h2: '最容易做錯：急住表白和道歉',
    p2: '很多人一分手就連續發長文、保證會改、求對方回頭。但如果對方仍然高壓，這些說話只會變成負擔，令對方更想保持距離。',
    h3: '復合前要先重整節奏',
    p3: '先停低最混亂的追問，把時間線、衝突點和對方反應整理清楚。真正有用的復聯，是讓對方感到壓力下降，而不是被你逼著即刻決定。'
  },
  accountability: {
    summary: (focus) => `${focus} 要看對方有沒有持續行動，而不是只看當下道歉或承諾。一次心軟，可能會令同一個問題不停重演。`,
    intro: (focus) => `${focus} 最容易令人心軟，因為對方可能每次都講得很後悔。但關係不是靠一句「我會改」變好，而是靠之後有沒有真的做到。`,
    h1: '先把說過的話和做到的事分開',
    p1: '有些人很會道歉，但不一定會承擔。你要看的不是他當下語氣有多誠懇，而是同一件事之後有沒有明顯減少，有沒有主動補救。',
    h2: '最容易做錯：用原諒換短暫和平',
    p2: '你怕吵架、怕失去，所以一次又一次算數。但如果沒有清楚界線，原諒會變成對方不用改的證明，最後辛苦的是你。',
    h3: '可以先提出可觀察的改變',
    p3: '不要只說「你要改」，而是講清楚下次希望他做到甚麼，例如主動交代、準時回覆、停止某個行為。能不能做到，比承諾本身更重要。'
  },
  emotion: {
    summary: (focus) => `${focus} 背後通常不是單純脾氣，而是安全感、被重視和表達方式卡住；先拆需要，再決定怎樣溝通。`,
    intro: (focus) => `${focus} 很多時候不是你太麻煩，而是你真正的需要沒有被好好講出來。當情緒一爆，對方只會看見壓力，未必看見你其實想被重視。`,
    h1: '先拆開情緒背後的需要',
    p1: '你嬲、你委屈、你不安，背後可能是想要陪伴、肯定、回覆或安全感。先知道自己想要甚麼，才不會一開口就變成攻擊。',
    h2: '最容易做錯：用試探換關注',
    p2: '冷處理、發脾氣、反話，短時間可能令對方注意你，但長期會令對方覺得相處很累。真正有效的是把需要講清楚，而不是要對方猜。',
    h3: '把責怪句改成請求句',
    p3: '與其說「你都唔理我」，可以改成「我今日有點不安，想你陪我傾一陣」。清楚而不攻擊，對方才比較有機會接住你。'
  },
  ambiguous: {
    summary: (focus) => `${focus} 不能只看氣氛甜不甜，要看對方有沒有穩定投入、願意推進和承擔關係位置。`,
    intro: (focus) => `${focus} 最迷人的地方，是甚麼都像有可能；最消耗的地方，也是甚麼都未被承諾。你要看清對方是在慢慢靠近，還是只享受你的陪伴。`,
    h1: '親密感不等於承諾',
    p1: '對方會找你、會撩你、會偶爾很甜，不代表他已經準備好成為伴侶。真正要看的是他有沒有主動安排、穩定投入和願意講清關係方向。',
    h2: '最容易做錯：自己腦補太快',
    p2: '曖昧裡一點點甜，很容易被你解讀成希望。但如果對方一直不推進、不承擔、不公開，你就要停一停，不要用幻想填補對方沒有做的事。',
    h3: '可以輕輕推進一次',
    p3: '你可以用低壓方式測試對方，例如提出一次明確見面或關係方向的話題。重點不是逼對方答應，而是看他有沒有接住你的推進。'
  },
  self: {
    summary: (focus) => `${focus} 不是愛得深就要委屈自己；先看清你有沒有失去界線，把對方反應當成自我價值。`,
    intro: (focus) => `${focus} 很多時候不是你不夠好，而是你太習慣用討好換安全感。當你不敢有要求、不敢表達，關係就開始慢慢吞掉你。`,
    h1: '先分清愛和害怕失去',
    p1: '真正的愛會令你更完整，不會令你一直縮小自己。如果你每次都先想對方會不會嬲，而不是自己是否舒服，就要重新看清界線。',
    h2: '最容易做錯：把委屈當成付出',
    p2: '你以為忍耐可以換來關係穩定，但沒有被看見的委屈只會累積成怨氣。越不敢講需要，越容易在關係裡失去自己。',
    h3: '先把注意力拉回自己',
    p3: '寫低你最常忍住不說的事情，分清哪些是包容，哪些已經踩過底線。你可以想修補關係，但也要保住自己的價值感。'
  },
  warmth: {
    summary: (focus) => `${focus} 不一定代表愛消失，更多時候是日常互動、期待感和情感交流慢慢變少。`,
    intro: (focus) => `${focus} 最常見不是突然不愛，而是相處變成習慣，分享減少、期待減少，兩個人不知不覺像室友多過戀人。`,
    h1: '先看關係在哪裡變成例行公事',
    p1: '你們是否只剩日常交代？有沒有分享心情、安排共同期待、為對方製造小小正面經驗？感情變淡通常是很多細節慢慢累積。',
    h2: '最容易做錯：只要求對方變熱情',
    p2: '如果你只是不斷問「你係咪唔愛我」，對方會覺得壓力更大。升溫不是逼出熱情，而是重新建立舒服、輕鬆、有回應的互動。',
    h3: '可以先重建一個小連結',
    p3: '不用一開始就談很重的問題，可以先安排一次低壓見面、一次認真聊天，或一個共同小計劃。讓關係重新有正面經驗，才有力往前行。'
  },
  communication: {
    summary: (focus) => `${focus} 多數不是一句說話的問題，而是表達方式、情緒節奏和對方防衛感一起卡住。`,
    intro: (focus) => `${focus} 表面上像是溝通不順，其實通常是兩個人都聽不到對方真正想講甚麼。你想修補，對方聽成責怪；你想靠近，對方感到壓力。`,
    h1: '先把事件和人格分開',
    p1: '很多對話一開始就變差，是因為你講的不是事件，而是判斷對方這個人。先講具體發生了甚麼，再講你的感受，對方才比較不會即刻防衛。',
    h2: '最容易做錯：一次過翻舊帳',
    p2: '當你把太多問題一次過倒出來，對方會只想逃。真正有效的溝通，是一次處理一件事，先讓對方聽得明白，再慢慢推進下一步。',
    h3: '把「你永遠都」改成「我希望下次」',
    p3: '用清楚請求代替責怪，會令對方比較知道可以怎樣做。你不是要降低標準，而是用對方聽得入耳的方式表達需要。'
  }
};

function buildFaq(post, kind, body) {
  const focus = focusTitle(post.title);
  const hs = headings(body).filter((heading) => !/常見問題/.test(heading));
  const first = hs[0] || `先看清「${focus}」真正卡位`;
  const second = hs[1] || '最容易做錯的位置';

  const q2ByKind = {
    money: `如果對方用感情壓力令我幫忙，應該點守界線？`,
    trust: `對方一直解釋但我仍然不安，應該信佢嗎？`,
    distance: `對方冷淡時，我應該主動找他還是等？`,
    recovery: `想挽回時，幾時主動比較好？`,
    accountability: `對方道歉很多次但仍然不改，是否要再給機會？`,
    emotion: `我明明只是想被重視，點解一講就變吵架？`,
    ambiguous: `曖昧對象不推進，我應該繼續等嗎？`,
    self: `如果我已經很委屈，是否代表要放手？`,
    warmth: `感情變淡後，是否一定代表不愛？`,
    communication: `對方一聽就防衛，應該點開口？`
  };

  const a2ByKind = {
    money: '先不要即刻答應，亦不要用愧疚感做決定。講清楚你能承受的範圍、需要的交代和底線，才不會令自己之後更難抽身。',
    trust: '信任不是靠一句解釋恢復，而是靠之後的透明度和行動。如果對方只想你快點不追究，卻不願改變令你不安的行為，問題仍然存在。',
    distance: '可以主動一次，但要低壓、短句、清楚。主動不是追著對方要答案，而是測試對方是否仍願意回應和修補。',
    recovery: '先看對方是否仍有接收窗口。如果對方情緒很高壓，急著長篇道歉反而會推遠。等節奏穩一點，再用低壓方式重開對話。',
    accountability: '不是看他當下講得多真誠，而是看之後有沒有可觀察的改變。如果同一件事一直重複，你需要的是界線，不是再一次心軟。',
    emotion: '因為真正需要沒有被講清楚時，情緒會變成攻擊。先把「你都唔理我」改成「我需要你聽我講一陣」，對方才比較接得住。',
    ambiguous: '不要只靠感覺等。你可以輕輕推進一次，看對方有沒有實際接住；如果對方一直迴避關係方向，就要保護自己不要越陷越深。',
    self: '不一定要即刻放手，但一定要先停低討好模式。你需要看清自己是否還能表達、拒絕和保留底線。',
    warmth: '不一定。要看對方是否仍願意互動、分享和安排時間。若只是生活節奏變淡，可以重建連結；若長期抽離，就要再判斷關係方向。',
    communication: '先降低指責感。用具體事件、感受和下一次希望怎樣做去開口，比直接定性對方「你永遠都係咁」更容易被聽見。'
  };

  const serviceByKind = {
    recovery: '我哋會按時間線、分手原因和對方反應，幫你判斷現在適合復聯、等待、拉近還是先停止追問。',
    trust: '我哋會幫你整理事件、對方心態和風險位置，分清是誤會、界線問題，還是需要認真處理的信任危機。',
    ambiguous: '我哋會幫你拆對方投入程度、曖昧節奏和下一句說話，避免你只靠感覺估錯方向。',
    communication: '我哋可以逐句 review 你們的對話，拆開邊句會令對方防衛，邊句可以更清楚表達需要。',
    emotion: '我哋會幫你把一大團情緒整理成對方聽得明的訊息，令你不用靠發脾氣或試探去換關注。'
  };

  return [
    '<h2>常見問題</h2>',
    `<h3>${focus} 應該先由邊一步開始？</h3>`,
    `<p>先由「${first}」開始，不要急住用情緒做決定。把事件、對方反應和自己的需要分開，你會更容易看清下一步。</p>`,
    `<h3>${q2ByKind[kind]}</h3>`,
    `<p>${a2ByKind[kind]}</p>`,
    `<h3>Asteria 可以點樣幫我處理「${focus}」？</h3>`,
    `<p>${serviceByKind[kind] || `我哋會幫你整理「${second}」背後的關係卡位，配合塔羅分析和相處教學，判斷下一步應該拉近、放慢還是先守住界線。`}</p>`
  ].join('\n');
}

function buildShortBody(post, kind) {
  const profile = profiles[kind];
  const focus = focusTitle(post.title);
  return [
    `<p>${profile.intro(focus)}</p>`,
    `<h2>${profile.h1}</h2>`,
    `<p>${profile.p1}</p>`,
    `<h2>${profile.h2}</h2>`,
    `<p>${profile.p2}</p>`,
    `<h2>${profile.h3}</h2>`,
    `<p>${profile.p3}</p>`
  ].join('\n');
}

function shouldReplaceBody(body) {
  const plain = stripHtml(body);
  const hs = headings(body);
  return (
    /<h2>先看清「/.test(body) ||
    /<h2>可以先做的三件事<\/h2>/.test(body) ||
    plain.length < 520 ||
    (hs.length <= 2 && /如果你正面對/.test(plain))
  );
}

const [arrayStart, arrayEnd] = findPostsArrayBounds(source);
const posts = Function(`"use strict"; return (${source.slice(arrayStart, arrayEnd)});`)();
let summaries = 0;
let bodies = 0;
let faqs = 0;

for (const post of posts) {
  post.title = cleanTitle(post.title);
  const kind = kindFor(post);
  const profile = profiles[kind];
  const focus = focusTitle(post.title);
  const { body } = splitFaq(post.content);
  const nextBody = shouldReplaceBody(body) ? buildShortBody(post, kind) : body;

  if (nextBody !== body) bodies += 1;
  if (/^如果你正面對/.test(post.summary || '') || !post.summary || post.summary.length < 20) {
    post.summary = profile.summary(focus);
    summaries += 1;
  }

  const nextFaq = buildFaq(post, kind, nextBody);
  if (!post.content.includes(nextFaq)) faqs += 1;
  post.content = `${nextBody}\n${nextFaq}`.trim();
  post.coverCaption = `Asteria 相處教學：${post.title}`;
}

const serialized = JSON.stringify(posts, null, 2)
  .replace(/"([^"]+)":/g, '$1:')
  .replace(/\\u003c/g, '<')
  .replace(/\\u003e/g, '>')
  .replace(/\\u0026/g, '&');

fs.writeFileSync(articlesFile, `${source.slice(0, arrayStart)}${serialized}${source.slice(arrayEnd)}`);
console.log(`updated summaries: ${summaries}`);
console.log(`rewrote short bodies: ${bodies}`);
console.log(`rewrote faqs: ${faqs}`);
