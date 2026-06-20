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

function cleanFocus(title = '') {
  return title
    .replace(/[【】\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[？?：:].*$/, '')
    .trim();
}

function ruleFor(post) {
  const text = `${post.category || ''} ${post.title || ''} ${post.summary || ''}`;
  const rules = [
    {
      test: /借錢|金錢|錢/,
      observe: '先分清這是一次臨時困難，還是對方習慣把責任推到你身上。感情可以有支援，但金錢一旦混在一起，最容易令你由伴侶變成救火隊。',
      steps: '第一，記低對方借錢的原因、次數和還款態度。第二，不要因為怕對方不開心就即刻答應，先問清楚實際安排。第三，守住自己的底線；幫忙不等於要承擔對方所有後果。',
      close: '如果你分不清這是信任還是消耗，可以先整理對方近來的行為，看看他是在共同面對問題，還是在把壓力轉移到你身上。'
    },
    {
      test: /交友 App|出軌|第三者|背叛|欺騙|桃花/,
      observe: '這類問題最重要不是急著問「你有冇愛過我」，而是看對方有沒有越過關係界線。只聽解釋很容易被帶走，真正要看的是行為是否一致。',
      steps: '第一，保留具體事件，不要只用感覺指控。第二，分清楚對方是願意停止、願意交代，還是只想你快點算數。第三，先想清楚你能接受的底線，不要在情緒最亂時被迫做決定。',
      close: '如果牽涉第三者、曖昧或隱瞞，Asteria 會先幫你拆對方心態和關係風險，再決定應該攤牌、觀察還是退後。'
    },
    {
      test: /冷暴力|冷戰|斷聯|少覆|不回|已讀不回|冷淡|抽離/,
      observe: '對方少覆或突然冷淡，不一定等於沒有機會，但一定代表互動節奏出了問題。你越急著追問，對方越容易退後，最後變成你追、他躲的循環。',
      steps: '第一，先記低冷淡是由哪件事之後開始，而不是只記低自己有多慌。第二，觀察對方是短暫需要空間，還是長期拒絕面對。第三，用一句低壓而清楚的訊息測試回應，不要一次過丟出所有情緒。',
      close: '如果你不知道應該主動、等待還是斷聯，可以把時間線和對話整理出來，再判斷下一步。'
    },
    {
      test: /復合|挽回|前任|分手|假性分手|放低/,
      observe: '復合最怕只靠衝動。你想拉近時，對方未必已經準備好面對，所以重點不是一直表白，而是找回對方仍願意接收你的窗口。',
      steps: '第一，先分清是真性切斷、假性分手，還是暫時情緒爆煲。第二，停止用長篇訊息證明自己，改為觀察對方仍否願意互動。第三，先處理令關係爆開的原因，再決定要不要推進復聯。',
      close: 'Asteria 會按你們的時間線、對方反應和分手原因，幫你判斷應該拉近、放慢還是先停手。'
    },
    {
      test: /原諒|不改|答應.*做不到|承諾|責任|卸膊|藉口/,
      observe: '一直原諒不等於關係會自然變好。如果對方每次只在你爆發時才答應，之後又回到原狀，問題就不是一句道歉，而是他有沒有真正承擔。',
      steps: '第一，把「他說過甚麼」和「他做到甚麼」分開看。第二，不要再用原諒換取短暫和平，要提出可觀察的改變。第三，給自己一條清楚底線，避免同一件事無限循環。',
      close: '如果你不知道要再給機會還是收手，先看對方有沒有持續行動，而不是只看他當下說得多可憐。'
    },
    {
      test: /發脾氣|情緒|不安|焦慮|壓力|內耗|委屈|心累/,
      observe: '情緒不是問題，問題是你用甚麼方式表達。當你用發脾氣、試探或冷處理換關注，對方可能只看見壓力，卻看不見你真正想被重視。',
      steps: '第一，先講出自己真正需要的是陪伴、肯定、回覆，還是安全感。第二，把責怪句改成具體請求。第三，等情緒降下來再溝通，避免一開口就變成攻防戰。',
      close: 'Asteria 可以幫你把一大團情緒拆成對方聽得明的說法，令你不是越講越嬲，而是越講越清楚。'
    },
    {
      test: /曖昧|暗戀|朋友|日久生情|炮友|親密|喜歡|心動/,
      observe: '曖昧最迷人的地方，是甚麼都像有可能；最危險的地方，也是甚麼都未被承諾。不要只看氣氛甜不甜，要看對方有沒有穩定投入。',
      steps: '第一，觀察對方有沒有主動安排、主動關心，而不只是偶爾撩你。第二，分清你想要的是被喜歡的感覺，還是真正關係。第三，適度推進一次，然後看對方有沒有接住。',
      close: '如果你卡在曖昧、朋友以上或親密後冷淡，Asteria 會幫你拆對方是否有心推進，還是只享受你的陪伴。'
    },
    {
      test: /取悅|壓抑|討好|自我|價值|創傷|迷戀|斯德哥爾摩/,
      observe: '有時候你以為自己很愛，其實是太怕失去。當你不敢表達、不敢有要求，甚至把所有委屈吞下去，關係已經開始令你縮小自己。',
      steps: '第一，寫低你最常忍住不說的事情。第二，分清楚哪些是包容，哪些其實是踩過底線。第三，先把注意力拉回自己身上，不要用對方反應決定你的價值。',
      close: '真正值得修補的關係，不會要求你一直消失自己。你可以想挽回，也要先保住自己的界線。'
    },
    {
      test: /道歉|溝通|相處|吵架|需求|報備|分享|同居|家長|見朋友|陪伴/,
      observe: '很多相處問題不是不愛，而是表達方式令人聽不進去。你想講需要，對方聽成責怪；你想靠近，對方感到被迫，於是小事慢慢變成大問題。',
      steps: '第一，先講具體事件，不要一開口就定性對方。第二，把「你永遠都」改成「我希望下次可以」。第三，一次只處理一件事，讓對方知道你想修補，不是想審判。',
      close: 'Asteria 的相處教學會幫你逐句 review，拆開邊句會令對方防衛，邊句可以令關係比較容易重新靠近。'
    },
    {
      test: /變淡|長久|熱戀|生活|新鮮感/,
      observe: '感情變淡不一定是愛消失，更多時候是日常互動變成例行公事。當關心、分享和期待慢慢減少，兩個人就會在不知不覺中變遠。',
      steps: '第一，找出最近哪一部分互動開始少了。第二，不要只要求對方變熱情，先重建輕鬆相處的時刻。第三，安排一個低壓的小互動，讓關係重新有正面經驗。',
      close: '如果你不知道是正常磨合還是對方真的抽離，可以從互動頻率、主動性和情緒回應三方面一起看。'
    }
  ];

  return rules.find((rule) => rule.test.test(text)) || {
    observe: '這個問題不能只看一句說話或一個反應，因為感情真正卡住的位置，通常藏在你們反覆出現的互動模式裡。',
    steps: '第一，記低具體事件，而不是只記低情緒。第二，觀察對方是短暫退後，還是長期不願面對。第三，先釐清你想要的是修補、答案，還是停止內耗。',
    close: '當方向未清楚時，可以先把對話和近況整理出來，再決定下一步，避免在最亂的時候越做越錯。'
  };
}

function polishBody(post) {
  const [rawBody = '', faq = ''] = post.content.split(/<h2[^>]*>\s*常見問題\s*<\/h2>/i);
  let body = rawBody
    .replace(/\s*<p>好多感情問題表面上係一句說話、一個行為、一段冷淡期，但背後可能係安全感、溝通方式、投入程度或者過往失望累積出嚟。你愈急住處理，愈容易用錯方法，令對方更防衛，自己亦更內耗。<\/p>\n<h2>為什麼會越處理越亂<\/h2>\n<p>最常見的情況，是你用自己的不安去追問，對方就用沉默、逃避或者敷衍去防衛。你以為自己只係想溝通，但對方感受到的可能係壓力；你以為對方冷淡代表不愛，但其實亦可能係佢唔識處理衝突。真正要拆的，不只是一句訊息，而是你哋互動入面重複出現的模式。<\/p>\n<h2>可以先做的三件事<\/h2>\n<p>第一，記低最近最令你不安的事件，而唔係只記低情緒。第二，觀察對方係短暫退後，定長期不願面對。第三，先諗清楚你想要的是答案、修補、復合，還是單純想停止痛苦。<\/p>\n<p>如果仍然想修補，就要由低壓、清楚、有界線的互動開始。不要一次過追問所有答案，也不要用長篇訊息迫對方即刻表態。先穩住自己的節奏，再按對方反應決定下一步。<\/p>\n<p>當方向未清楚時，可以先將對話同近況整理出嚟，再決定下一步。Asteria 會幫你拆對方心態、關係卡位同訊息策略，避免你喺最亂嘅時候越做越錯。<\/p>/g, '');

  if (body === rawBody) return post.content.replace(/ 這篇文重點會由「[^」]+」開始拆，幫你先抓住最容易做錯的位置。/g, '');

  const focus = cleanFocus(post.title);
  const rule = ruleFor(post);
  const tailored = [
    `<h2>先看清「${focus}」背後真正卡位</h2>`,
    `<p>${rule.observe}</p>`,
    '<h2>可以先做的三件事</h2>',
    `<p>${rule.steps}</p>`,
    `<p>${rule.close}</p>`
  ].join('\n');

  const nextFaq = faq
    ? `<h2>常見問題</h2>${faq}`.replace(/ 這篇文重點會由「[^」]+」開始拆，幫你先抓住最容易做錯的位置。/g, '')
    : '';
  return `${body.trim()}\n${tailored}\n${nextFaq}`.trim();
}

function cleanupRemainingTemplateNoise(content = '') {
  return content
    .replace(
      /<h2>先看清楚「<strong>[^<]+<\/strong>」真正卡住的位置<\/h2>\n<p>[\s\S]*?<\/p>\n(?=<h2>先看清「)/g,
      ''
    )
    .replace(
      /\s*這篇文重點會由「[\s\S]*?」開始拆，幫你先抓住最容易做錯的位置。/g,
      ''
    )
    .replace(/「\s+/g, '「')
    .replace(/\s+」/g, '」')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const [arrayStart, arrayEnd] = findPostsArrayBounds(source);
const posts = Function(`"use strict"; return (${source.slice(arrayStart, arrayEnd)});`)();

let updated = 0;
for (const post of posts) {
  const before = post.content;
  post.content = cleanupRemainingTemplateNoise(polishBody(post));
  if (post.content !== before) updated += 1;
}

const serialized = JSON.stringify(posts, null, 2)
  .replace(/"([^"]+)":/g, '$1:')
  .replace(/\\u003c/g, '<')
  .replace(/\\u003e/g, '>')
  .replace(/\\u0026/g, '&');

fs.writeFileSync(articlesFile, `${source.slice(0, arrayStart)}${serialized}${source.slice(arrayEnd)}`);
console.log(`polished template blocks in ${updated} articles`);
