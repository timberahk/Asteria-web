import fs from 'node:fs';
import path from 'node:path';

const articlesFile = path.join(process.cwd(), 'lib', 'articlesData.ts');
const source = fs.readFileSync(articlesFile, 'utf8');

function parseArrayBounds(text) {
  const marker = 'export const teachingPosts';
  const startMarker = text.indexOf(marker);
  if (startMarker === -1) throw new Error('Cannot find teachingPosts.');
  const assignment = text.indexOf('=', startMarker);
  const arrayStart = text.indexOf('[', assignment);
  let depth = 0;
  let inString = false;
  let quote = '';
  let escaped = false;

  for (let index = arrayStart; index < text.length; index += 1) {
    const char = text[index];
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
    if (depth === 0) return { arrayStart, arrayEnd: index };
  }
  throw new Error('Cannot parse teachingPosts array.');
}

const stripHtml = (html = '') => html
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();

const normalize = (value = '') => stripHtml(value)
  .replace(/[，。！？、：；「」『』（）\[\]\s]/g, '')
  .toLowerCase();

const titleCore = (title = '') => title
  .replace(/[【】\[\]]/g, '')
  .replace(/\s+/g, ' ')
  .replace(/：.*$/, '')
  .replace(/\?.*$/, '')
  .replace(/？.*$/, '')
  .trim();

function articleKind(post) {
  const haystack = `${post.title} ${post.summary} ${(post.tags || []).join(' ')}`;
  if (/冷暴力|控制|PUA|打壓|警號|傷害|底線|有毒|消耗/.test(haystack)) return 'boundary';
  if (/分手|復合|挽回|前任|失戀|斷聯|冷淡|回頭|不覆|少覆|不讀不回/.test(haystack)) return 'reconnect';
  if (/曖昧|暗戀|約會|新對象|桃花|單身|表白|追求/.test(haystack)) return 'dating';
  if (/妒忌|比較|缺口|暈船|戀愛腦|自我價值/.test(haystack)) return 'emotion';
  if (/結婚|婚前|長久|長遠|生活|辦公室戀情|適合|家庭|未來|責任|金錢|遠距離|Long D|穩定|維繫/.test(haystack)) return 'relationship';
  if (/溝通|勸|吵|訊息|說話|開口|表達|道歉|聽不懂|不懂你|承諾|答應/.test(haystack)) return 'communication';
  if (/安全感|情緒|焦慮|內耗|依附|不安|心動|愛情心理|迷思/.test(haystack)) return 'emotion';
  return 'relationship';
}

const chineseNumberMap = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10
};

function titleExpectedCount(title = '') {
  const digit = title.match(/([0-9]+)\s*(?:個|大|種|招|步|點|原因|誤區|方法|警號|重點)/)?.[1];
  if (digit) return Number(digit);
  const chinese = title.match(/([二三四五六七八九十])\s*(?:個|大|種|招|步|點|原因|誤區|方法|警號|重點)/)?.[1];
  return chinese ? chineseNumberMap[chinese] : 0;
}

function introFor(post) {
  const title = titleCore(post.title);
  const kind = articleKind(post);
  const intros = {
    reconnect: `遇到「${title}」時，最折磨人的通常不是一句有沒有機會，而是你不知道該主動、等待，還是先停下。先看清對方仍有沒有回應窗口、你們最近的互動是否變鬆，才不會把修補變成追逼。`,
    communication: `「${title}」很多時不是你沒有道理，而是表達方式令對方先聽到壓力。想令對方聽得入耳，要先把責備收窄成具體事件、真實感受和一個可以做到的小希望。`,
    dating: `面對「${title}」，不要只看一刻甜蜜或氣氛。真正值得觀察的是對方有沒有穩定投入、會不會安排時間，以及你退一步時對方是否願意補上。`,
    boundary: `遇到「${title}」時，不要只靠對方一句解釋安撫自己。你要看同類事情是否反覆出現、對方有沒有承認責任，以及你是否在關係裡越來越不敢講真話。`,
    emotion: `「${title}」會牽動很多不安，越亂越要先分清事實、猜測和感受。當你看清自己真正需要的是安慰、承諾、空間還是答案，下一步就不會只被情緒推著走。`,
    relationship: `處理「${title}」時，先不要急著用單一事件判斷整段關係。更重要是看重複模式、相處節奏和對方有沒有實際回應，才知道下一步應該靠近、溝通還是先守住自己。`
  };
  return `<p>${intros[kind]}</p>`;
}

function sectionPool(post) {
  const title = titleCore(post.title);
  const kind = articleKind(post);
  const sections = {
    reconnect: [
      [`有沒有回應窗口`, `如果對方仍然會回覆、會有情緒反應，代表「${title}」未必完全沒有轉圜，但方法要放輕。不要一開始就追問答案，先看對方是否仍願意保留最基本的互動。`],
      [`不要把修補變成追逼`, `越想挽回越容易急著解釋、道歉或交代所有委屈。可是對方退後時，長訊息通常只會加重壓力；先穩住節奏，才有機會令對方願意再聽。`],
      [`分清冷靜、逃避和切斷`, `冷靜通常仍有基本交代；逃避會避開核心問題；切斷則會連普通互動都拒絕。判斷清楚狀態，才知道應該等、慢慢靠近，還是先保護自己。`],
      [`把下一步縮細`, `你可以先整理最近三次互動：對方有沒有主動、回覆是否冷淡、你靠近時關係是變鬆還是更緊。這些線索會比一句「仲有冇機會」更準。`],
      [`看後續行動，不只看一句說話`, `一句想你、一次回覆或者一刻溫柔，都不等於關係已經修復。真正要看的是對方會不會持續回應、願不願意安排時間，以及有沒有避開同一個問題。`],
      [`保留自己的節奏`, `想修補不代表要放低全部界線。你可以釋出善意，但不要用失控的追問換安全感；越能穩住自己，越容易看清對方真正態度。`]
    ],
    communication: [
      [`先講事件，不要先判人格`, `對方最容易防衛的，往往不是你的需要，而是聽到自己被定性。把「你成日都係咁」改成一件具體事件，對話會比較容易繼續。`],
      [`把情緒翻譯成需要`, `你可以講出自己受傷的位置，但不要一次過倒出所有舊帳。先講感受，再講希望對方下一次可以怎樣做，對方才知道怎樣回應。`],
      [`一次只處理一個重點`, `很多關係不是無得傾，而是一開口就太大包圍。先處理最核心的一句說話或一個行為，比同時追究所有問題更有效。`],
      [`不要用反問測試對方`, `反問有時看似讓對方思考，實際上會令對方覺得被審問。想改善「${title}」，最好把問題收窄成一句清楚、可回答的表達。`],
      [`等對方有空間回應`, `說完重點後，不要立即補十句解釋。留一點空白，讓對方有機會消化和回應，對話才不會變成你一個人的情緒輸出。`],
      [`用後續行動驗證溝通成效`, `一次談話未必即刻改變關係。重點是之後同類情況再出現時，對方有沒有願意調整，你自己又有沒有守住更穩定的表達方式。`]
    ],
    dating: [
      [`看行動，不只看感覺`, `曖昧或新對象最容易令人被氣氛帶走。真正有心的人，不只會甜言蜜語，亦會在時間、安排和交代上慢慢給你穩定感。`],
      [`不要太快交出主導權`, `你可以主動，但不要變成永遠由你推住關係走。當你稍微放慢時，觀察對方會不會補上，會更看得出對方投入程度。`],
      [`用界線測試方向`, `如果對方只享受你的付出，卻不願意講清關係方向，你就要先守住界線。界線不是冷淡，而是避免自己一直用幻想補齊對方沒有給的承諾。`],
      [`留意對方是否穩定投入`, `真正想靠近的人，不會只在無聊時出現。你要看對方會不會安排下一次、記得你講過的事，以及有沒有把你放入生活節奏。`],
      [`不要用幻想補齊對方沒有說的承諾`, `「${title}」最容易令人把一點甜放大成希望。未有清楚行動前，先把期望放慢，才不會太早把自己放在被動位置。`],
      [`讓關係自然有來有往`, `好的曖昧不是你一直追，對方一直接收。你可以給機會，但也要讓對方付出一部分努力，這樣才看得出關係是否真的有發展。`]
    ],
    boundary: [
      [`分清磨合還是警號`, `磨合是雙方都願意調整；警號是你一直降低底線，對方卻沒有實際改變。不要只聽解釋，要看行動有沒有跟上。`],
      [`先守住不可退讓的位置`, `如果某些行為令你不敢表達、不敢拒絕，甚至開始懷疑自己感受是否合理，就要先保護自己，而不是急著證明你夠不夠愛。`],
      [`記錄模式，而不是只靠當下感覺`, `把事件、對方解釋和後續行動記低，你會更容易看出這是偶發衝突，還是長期消耗。清楚看見模式，才知道下一步要修補還是止損。`],
      [`不要把責任全部收回自己身上`, `對方做錯事後，如果最後變成你一直道歉、解釋和哄返對方，就要小心關係已經失衡。健康關係應該有雙方承擔。`],
      [`看你是否越來越不像自己`, `如果一段關係令你長期收聲、怕講錯、怕對方不高興，這已經不是普通磨合。你需要先把自己的感受放回合理位置。`],
      [`把界線說得清楚而不是說得狠`, `界線不一定要用狠話表達。你可以清楚講明甚麼行為你不能接受，以及如果再發生你會怎樣保護自己。`]
    ],
    emotion: [
      [`先分清事實、猜測和感受`, `很多不安不是來自事件本身，而是腦內補上的意思。把實際發生的事、你猜測的意思、你的感受分開，情緒會比較容易落地。`],
      [`不要用情緒逼對方證明愛`, `越不安越想要即時答案，但重話和追問只會令對方更想逃。先穩住自己，再用清楚句子講需要，通常比爆發更有力量。`],
      [`把焦點收回自己`, `你可以在乎對方反應，但不要把所有價值感交給對方決定。當你知道自己真正想要什麼，才不會每一次波動都被拉走。`],
      [`看清自己真正想要的是甚麼`, `有時你以為自己想要答案，其實是想要安全感；以為想復合，其實是不甘心。把需要講清楚，才不會用錯方法處理情緒。`],
      [`不要把一刻心動當成全部證據`, `心動、習慣和依賴很容易混在一起。處理「${title}」時，要看長期相處是否舒服，而不只是某一刻很想靠近。`],
      [`讓自己先回到穩定狀態`, `情緒最高漲時做的決定，通常最容易後悔。先睡一覺、寫低感受，或者找人整理，再決定要不要發訊息。`]
    ],
    relationship: [
      [`先看重複模式`, `一件事未必代表全部，但同類事情反覆出現，就值得認真整理。看清模式後，才知道要溝通、調整，還是先保留距離。`],
      [`不要一次過處理所有問題`, `關係卡住時，最怕同時翻舊帳、追答案和要求承諾。先選最重要的一個位置處理，對方也比較容易接住。`],
      [`把下一步變成可行的小行動`, `下一步不一定是大動作。可能只是一句低壓訊息、一個清楚界線，或者一次不急著追問的觀察。小步行，反而更容易看出方向。`],
      [`看雙方是否仍願意投入`, `關係能不能走下去，不只看你有多想修補，也要看對方是否願意回應。單方面用力太久，最後只會更消耗。`],
      [`把感受和要求分開講`, `你可以先講自己感受，再講希望對方怎樣配合。感受是讓對方理解你，要求是讓關係有下一步，兩者混在一起就容易變成指責。`],
      [`讓關係重新有秩序`, `混亂時不要急著證明誰對誰錯。先把相處節奏、訊息頻率和界線整理清楚，關係才有機會由失控慢慢回到穩定。`]
    ]
  };

  return sections[kind];
}

function bodySections(post) {
  const expected = titleExpectedCount(post.title);
  const targetCount = expected ? Math.min(Math.max(expected, 3), 8) : 4;
  const pool = sectionPool(post);
  const rotation = post.id % pool.length;
  const ordered = [...pool.slice(rotation), ...pool.slice(0, rotation)];
  while (ordered.length < targetCount) ordered.push(...pool);

  const sections = ordered
    .slice(0, targetCount)
    .map(([heading, paragraph], index) => `<h2>重點 ${index + 1}：${heading}</h2>\n<p>${paragraph} ${detailFor(post, index)}</p>`)
    .join('\n\n');

  return `${sections}\n\n${closingFor(post)}`;
}

function detailFor(post, index) {
  const kind = articleKind(post);
  const detail = {
    reconnect: [
      '你可以先把目標定為「令下一次對話不再繃緊」，而不是一次過要求復合、承諾或表態；關係重新有空間，對方才比較容易放下防衛。',
      '如果你不肯停一停，很容易把原本尚有的聯絡窗口逼到更窄；先留意對方對輕鬆訊息、日常分享和短句回應是否仍然接得住。',
      '這一步不是叫你放棄，而是避免用焦慮去推動關係。越能慢下來，你越容易分辨對方是真冷淡，還是暫時未準備好面對。',
      '真正有用的修補，通常不是講最多道理，而是令對方重新感覺跟你互動沒有壓力；當互動變穩，後面才有機會再談深一點。'
    ],
    communication: [
      '你可以先寫低原本想發的句子，再刪走「你一定」「你從來」「你根本」這類字眼，換成具體事件和一個清楚請求，對方會較容易聽入耳。',
      '好的溝通不是壓住自己，也不是一次過爆出所有委屈，而是讓對方知道你受傷的位置，同時知道下一次可以怎樣做得好一點。',
      '如果對方一聽就反駁，先不要急著加碼解釋。你可以暫停一下，等對方消化，再用更短的句子回到核心，避免對話變成互相防衛。',
      '真正改善關係的說話，要同時有溫度和界線：既不把對方逼到角落，也不把自己的需要全部收回去。'
    ],
    dating: [
      '你可以享受甜蜜，但不要太快把零碎好感當成承諾。真正適合發展的人，會在相處節奏、時間安排和主動程度上慢慢給你證據。',
      '如果一直只有你找話題、你安排、你遷就，關係很容易變成你一個人推進。稍微退一步，反而能看清對方會否自然靠近。',
      '曖昧最怕靠幻想續命。把對方講過的話、做過的事和實際投入分開看，你會更容易知道自己應該繼續觀察還是調整期待。',
      '一段有機會的關係，通常不是只有心動，而是有來有往、有交代、有下次。這些小細節比一句好聽說話更值得相信。'
    ],
    boundary: [
      '你不需要即時把關係判死刑，但一定要看對方之後有沒有修正。如果每次都只是道歉，之後又重複同一件事，問題就不是誤會咁簡單。',
      '界線不是用來懲罰對方，而是提醒自己甚麼不能再無限承受。你越清楚底線，越不容易在關係裡一直被對方情緒牽著走。',
      '如果你發現自己為了維持關係而長期收聲、道歉、解釋，甚至懷疑自己是否太敏感，就要先停一停，把感受放回合理位置。',
      '健康的修補需要雙方一起承擔。你可以給機會，但不要把所有責任都攬上身，否則關係只會越修越失衡。'
    ],
    emotion: [
      '你可以先把腦入面的劇情寫出來，再逐句問自己：這是事實、推測，還是我害怕發生的結果？分開之後，情緒會比較容易落地。',
      '情緒不是錯，但情緒最高漲時最容易講錯話。先讓自己回到穩定狀態，再決定要不要發訊息，通常會少很多後悔。',
      '如果你需要的是安全感，就不要只用質問去換答案；可以改成表達你希望對方怎樣回應，這樣對方比較知道如何接住你。',
      '當你不再把所有價值感交給對方反應決定，就會更容易看見這段關係是否真的適合，而不是只被一刻心動或不甘心帶走。'
    ],
    relationship: [
      '你可以先把問題由「我們是不是不適合」縮小成「最近哪一個互動開始失衡」。問題縮細後，才會知道是要溝通、調整節奏，還是重新定界線。',
      '不要把一刻情緒當成全部答案，也不要把一次甜蜜當成所有證據。穩定關係要看長期行動、責任感和雙方是否仍願意為彼此調整。',
      '如果你只靠自己硬撐，關係會越來越累。真正可持續的相處，應該讓兩個人都能被理解，也能一起面對現實問題。',
      '下一步可以很小：少一點追問、多一點觀察，或用一句清楚而溫和的說話打開對話。小步做對，比一次過用力更容易看見效果。'
    ]
  };
  const pool = detail[kind];
  return pool[(post.id + index) % pool.length];
}

function closingFor(post) {
  const title = titleCore(post.title);
  const kind = articleKind(post);
  const expected = titleExpectedCount(post.title);
  const closings = {
    reconnect: `如果你正面對「${title}」，可以先不要急著做最大動作。把最近的對話、對方回覆速度、主動程度和你每次靠近後的反應放在一起看，會比單靠一兩句說話更準。當你看清對方仍有沒有窗口，再決定要不要用低壓方式重新打開互動，或者先把自己從情緒追趕入面抽返出來。`,
    communication: `如果「${title}」已經反覆發生，重點不是贏一場道理，而是令下一次對話不再重演同一個模式。你可以先準備一句短而清楚的開場，再觀察對方是否願意接住；若對方有回應，再逐步講深一點。這樣既保留你的立場，也不會一開始就把對方推到防衛位置。`,
    dating: `如果你正在經歷「${title}」，先不要只問對方是否喜歡你，而是看你們之間有沒有穩定交換。真正有機會的關係，會在時間、行動和態度上慢慢變清楚。你可以保持善意，但也要把自己的節奏留住，讓對方用行動證明他是否值得你再投入。`,
    boundary: `如果「${title}」令你長期不舒服，就不要只靠忍耐換和平。你可以先整理哪些行為是偶發、哪些是重複出現，再決定要怎樣講界線。真正的修補不是你一個人退讓，而是對方願意看見問題、承擔責任，並在之後用行動令你重新感到安心。`,
    emotion: `如果你被「${title}」拉到很亂，先給自己一點時間回到穩定。你可以把感受寫低、分清事實和猜測，再決定要不要同對方談。當你不再被即時焦慮推著走，很多原本看似一定要立刻處理的事，會變得更清楚，也更容易選到不後悔的做法。`,
    relationship: `如果你在處理「${title}」，不要只用一件事判斷整段關係，也不要忽略重複出現的訊號。你可以先把問題拆成相處模式、溝通方式、投入程度和界線四部分，再看哪一部分最需要先處理。關係要走得長，不是靠一次爆發，而是靠每次都比上一次更清楚。`
  };

  const extra = expected === 3
    ? `<p>最後可以問自己一個簡單問題：如果今天不急著用情緒行動，下一個最穩陣的小步是甚麼？可能是先不發長訊息、先觀察一次對方反應，或者把想講的說話改成更短、更清楚。這樣做不是壓抑自己，而是令你有機會用較清醒的狀態處理關係。</p>`
    : '';

  return `<h2>可以先怎樣做？</h2>\n<p>${closings[kind]}</p>\n${extra}`;
}

function splitFaq(content) {
  const match = content.match(/<h2[^>]*>\s*常見問題\s*<\/h2>/i);
  if (!match) return { body: content, faq: '' };
  const index = match.index || 0;
  return { body: content.slice(0, index), faq: content.slice(index) };
}

function removeTemplateBlocks(body) {
  let next = body;
  const blockPatterns = [
    /<p>如果你正在面對「<strong>[\s\S]*?<\/p>\n*/g,
    /<h2>圍繞「[\s\S]*?<\/h2>[\s\S]*?(?=<h2>|$)/g,
    /<h2>「[^<]+」要先分清事實、猜測同情緒<\/h2>[\s\S]*?(?=<h2>|$)/g,
    /<h2>下一步：把「[^<]+」由腦內劇場拉回現實<\/h2>[\s\S]*?(?=<h2>|$)/g,
    /<h2>處理「[^<]+」前，先把情緒和事實分開<\/h2>[\s\S]*?(?=<h2>|$)/g,
    /<h2>先穩住情緒，再講清「[^<]+」的需要<\/h2>[\s\S]*?(?=<h2>|$)/g,
    /<h2>先穩住情緒，再決定怎樣靠近「[^<]+」<\/h2>[\s\S]*?(?=<h2>|$)/g,
    /<h2>把「[^<]+」收窄成一句清楚表達<\/h2>\s*<p>如果你不知[\s\S]*?<\/p>\n*/g,
    /<h2>下一步：用低壓方式處理「[^<]+」<\/h2>\s*<p>如果「[^<]+」牽涉斷聯[\s\S]*?<\/p>\n*/g
  ];
  for (const pattern of blockPatterns) {
    next = next.replace(pattern, '');
  }
  return next;
}

function dedupeParagraphs(html) {
  const seen = new Set();
  return html.replace(/<p>([\s\S]*?)<\/p>/g, (full, inner) => {
    const key = normalize(inner);
    if (key.length > 30 && seen.has(key)) return '';
    if (key.length > 30) seen.add(key);
    return full;
  });
}

function cleanArticle(post) {
  const { body, faq } = splitFaq(post.content || '');
  let nextBody = body
    .replace(/\uFFFD/g, '')
    .replace(/<h3>\s*([0-9]+)\.\s*/g, '<h3>$1. ')
    .replace(/<h2>先看清楚「[^<]+」真正卡住的位置<\/h2>/g, '<h2>先看清問題真正卡住的位置</h2>');

  nextBody = removeTemplateBlocks(nextBody);
  nextBody = dedupeParagraphs(nextBody);
  nextBody = nextBody
    .replace(/\n{3,}/g, '\n\n')
    .replace(/(?:<h2>[^<]+<\/h2>\s*){2,}/g, (match) => match.split(/(?=<h2>)/).filter(Boolean).slice(-1)[0])
    .trim();

  const bodyText = stripHtml(nextBody);
  const firstParagraph = nextBody.match(/<p>([\s\S]*?)<\/p>/)?.[1] || '';
  const expected = titleExpectedCount(post.title);
  const bodyHeadingCount = Array.from(nextBody.matchAll(/<h[23][^>]*>/gi)).length;
  const hasEnoughNumberedContent = !expected || bodyHeadingCount >= expected;
  const hasTemplateNoise = /先看清問題真正卡住的位置|先看清楚「|真正要處理的位置|下一步：|如果你也正在面對|Asteria 可以幫你拆|Asteria 會幫你|用低壓方式處理「/.test(nextBody);
  const isOverStacked = bodyHeadingCount > 8;
  if (!nextBody || bodyText.length < 760 || !hasEnoughNumberedContent || hasTemplateNoise || isOverStacked || normalize(firstParagraph).startsWith(normalize(post.summary).slice(0, 45))) {
    nextBody = `${introFor(post)}\n\n${bodySections(post)}`;
  }

  return `${nextBody.trim()}\n${faq.trim()}`.trim();
}

const { arrayStart, arrayEnd } = parseArrayBounds(source);
const posts = Function(`"use strict"; return (${source.slice(arrayStart, arrayEnd + 1)});`)();

let changed = 0;
for (const post of posts) {
  const before = post.content;
  post.content = cleanArticle(post);
  if (post.content !== before) changed += 1;
}

const nextSource = `${source.slice(0, arrayStart)}${JSON.stringify(posts, null, 2)}${source.slice(arrayEnd + 1)}`;
fs.writeFileSync(articlesFile, nextSource);

console.log(`Polished article content: ${changed} changed / ${posts.length} total.`);
