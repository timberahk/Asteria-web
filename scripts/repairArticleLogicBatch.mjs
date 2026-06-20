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

const repairIds = new Set([
  1, 2, 6, 7, 8, 13, 15, 17, 20, 21, 23, 27, 28, 29, 30, 32, 36, 37, 38, 39,
  42, 43, 48, 50, 55, 57, 58, 59, 60, 61, 65, 73, 74, 76, 77, 78, 79, 83, 84,
  85, 87, 89, 91, 93, 96, 101, 102, 103, 104, 109, 112, 120, 121, 122, 123,
  126, 128, 129, 130, 131, 132, 133, 134, 135, 137, 138, 140, 142, 145, 146,
  147, 148, 150
]);

const titleOverrides = new Map([
  [17, '你以為在幫對方，其實正在增加壓力？3 個常見相處誤區'],
  [74, '太快發生關係會影響愛情嗎？避免變成酒肉關係']
]);

function cleanTitle(title = '') {
  return title
    .replace(/[【】\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function focusFromTitle(title = '') {
  return cleanTitle(title)
    .replace(/[？?：:].*$/, '')
    .replace(/[「」]/g, '')
    .trim();
}

function expectedCount(title = '') {
  const digit = title.match(/([0-9]+)\s*(?:個|大|種|招|步|點|原因|誤區|方法|警號|重點|階段|禁區|信號|細節)/)?.[1];
  if (digit) return Number(digit);
  const map = { 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };
  const chinese = title.match(/([二三四五六七八九十])\s*(?:個|大|種|招|步|點|原因|誤區|方法|警號|重點|階段|禁區|信號|細節)/)?.[1];
  return chinese ? map[chinese] : 0;
}

function articleKind(post) {
  const text = `${post.title} ${post.category}`;
  if (/復合|挽回|前任|分手|斷聯|冷戰|冷淡|重新|抽離/.test(text)) return 'reconnect';
  if (/曖昧|暗戀|桃花|單身|心動|炮友|喜歡|約會/.test(text)) return 'ambiguous';
  if (/控制|冷暴力|出軌|變心|恐怖|借錢|警號|App|原諒|傷害/.test(text)) return 'risk';
  if (/溝通|相處|吵架|需求|情緒|壓力|支援|報備|道歉|承諾|挑剔|勸/.test(text)) return 'communication';
  if (/結婚|婚前|同居|家長|辦公室|長久/.test(text)) return 'commitment';
  return 'mindset';
}

const labels = {
  reconnect: ['聯絡窗口是否仍然存在', '對方退後是情緒還是決定', '不要用追問代替修補', '重新建立安全感', '用低壓方式測試回應', '先穩住自己再看下一步'],
  ambiguous: ['甜蜜不等於承諾', '看行動多過看氣氛', '不要太快交出全部主導權', '用界線測試對方投入', '分清吸引與責任感', '避免被曖昧拖住情緒'],
  risk: ['警號不是用來自我安慰', '先分清偶發與長期模式', '不要替對方無限找藉口', '守住自己的底線', '記錄具體行為而非只靠感覺', '需要時先保護自己'],
  communication: ['先接住情緒，再處理事情', '不要把關心變成審問', '把要求縮小到對方做得到', '少一點指責，多一點具體描述', '留空間給對方回應', '用對方聽得入耳的方式說'],
  commitment: ['看長期行動，不只看一刻感覺', '生活節奏是否可以磨合', '責任感比浪漫更能反映未來', '家庭與界線要提早看清', '承諾要落到具體行動', '不要用焦慮逼自己決定'],
  mindset: ['先分開事實與想像', '看重複模式，不只看單一事件', '不要用情緒替關係下判決', '把注意力收回自己身上', '先整理需要，再決定行動', '讓自己在關係裡有選擇權']
};

const introByKind = {
  reconnect: '當一段關係變冷、斷聯、少覆或分開之後，最令人辛苦的不是單純失去，而是不知道自己還能不能做點什麼。這時候最怕用焦慮推動行動：不停追問、長篇解釋、逼對方表態，往往會令對方更加退後。',
  ambiguous: '曖昧、暗戀或剛開始互動時，最容易被氣氛牽住走。對方一句甜言蜜語、一個眼神、一段忽冷忽熱，都會令你反覆猜測到底有沒有機會。可是關係能不能向前，從來不只看心動，也要看對方是否願意投入。',
  risk: '關係出現警號時，人很容易一邊不安，一邊替對方找理由。你可能會說服自己「他只是忙」「他只是性格如此」，但如果同一種傷害重複發生，就需要停下來看清楚，這到底是偶然衝突，還是長期模式。',
  communication: '很多感情不是沒有愛，而是講出來的方式令彼此越來越防衛。你以為自己在溝通，對方卻感覺被批評；你以為自己在幫忙，對方卻感覺被控制。真正的相處教學，重點是令對方聽得入耳，而不是贏一場道理。',
  commitment: '去到比較長遠的關係，浪漫不是唯一答案。能不能一起生活、面對壓力、處理金錢家庭與未來安排，往往比一刻心動更重要。越想走得長遠，越要提早看清相處模式是否能承托現實。',
  mindset: '感情入面的痛苦，很多時來自一個未被整理清楚的念頭。你可能以為自己只是想要答案，其實背後是害怕失去、害怕不被選擇、害怕自己做錯。先把情緒拆開，才不會被一時反應帶住走。'
};

const practicalByKind = {
  reconnect: '如果你仍然想挽回或修補，第一步不是立即把所有感受倒出來，而是先判斷對方還有沒有聯絡窗口。只要仍有回應，就不要把每一次對話都變成壓力測試；相反，要用短、清楚、低壓的訊息，慢慢看對方是否願意重新接近。',
  ambiguous: '如果你想推進關係，可以主動，但不要一次過把所有底牌交出去。你可以提出一次輕鬆邀約，或用一句清楚但不施壓的說話測試對方反應。真正有心的人，會用行動慢慢補上，而不是只在氣氛好時靠近你。',
  risk: '面對警號時，不要只問「他還愛不愛我」，而要問「這件事會不會持續傷害我」。你可以把事件寫低：發生了什麼、對方之後有沒有承認、有沒有修正、有沒有把責任推回你身上。這些比一句道歉更重要。',
  communication: '想令對方聽得入耳，可以先把一句責備改成一個具體需要。例如不要一開始就說「你永遠都不理我」，而是說「我想我們今晚可以留十五分鐘講清楚這件事」。句子越具體，對方越不容易用逃避回應。',
  commitment: '想判斷是否適合走下去，可以先看三件事：遇到問題時是否願意一起處理、生活安排是否能互相體諒、雙方對未來是否有基本共識。如果每次談到現實就變成逃避，代表關係還未有足夠承托力。',
  mindset: '你可以先把問題分成三格：事實、猜測、感受。事實是對方做了什麼；猜測是你腦中補上的意思；感受是你因此受了什麼影響。分清楚之後，你會更容易知道下一步應該溝通、觀察，還是暫時收回注意力。'
};

function buildListSections(post, count) {
  const kind = articleKind(post);
  const base = labels[kind];
  const focus = focusFromTitle(post.title);
  const number = count || 4;
  const items = Array.from({ length: number }, (_, index) => base[index % base.length]);
  return items.map((label, index) => {
    const n = index + 1;
    return `<h3>${n}. ${label}</h3>\n<p>${sectionParagraph(kind, focus, label, n, number)}</p>`;
  }).join('\n');
}

function sectionParagraph(kind, focus, label, n, total) {
  const shared = {
    reconnect: [
      `處理「${focus}」時，${label}代表你要先看清對方是否仍願意接收你的訊息。若對方只是短暫退後，你可以保留溫和互動；若對方長期逃避，就要避免把自己推進更被動的位置。`,
      `第 ${n} 點最重要的是節奏。你不需要一次過證明自己有多在乎，而是要讓對方重新感覺同你互動不會被逼迫，這樣關係才有機會慢慢鬆動。`,
      `如果你一見到對方退後就急住補救，很容易令「${focus}」變成壓力循環。先分清楚對方是需要時間，還是真的想切斷，做法會完全不同。`,
      `這一步不是叫你扮冷淡，而是先收起過度用力。關係要重新靠近，通常需要一個安全、不被審問的空間。`,
      `你可以留意對方有沒有微小回應，例如願意覆一句、願意解釋近況、或者對你的低壓訊息沒有抗拒。這些都比你自己亂猜更有參考價值。`,
      `越想修補，越要避免把每次聊天都變成關係審判。先讓互動重新變得舒服，之後才有空間談真正問題。`
    ],
    ambiguous: [
      `在「${focus}」裡，${label}可以幫你分清對方是有心經營，還是只享受被喜歡。真正想靠近的人，會在時間、安排和態度上慢慢給你穩定感。`,
      `第 ${n} 點提醒你不要只靠情緒判斷。曖昧最迷人的地方，亦是最容易令人誤判的地方，所以要看對方是否願意把互動帶到現實層面。`,
      `如果對方只在氣氛好時靠近，卻從不交代方向，你就要留意自己是否正在用幻想補齊對方沒有給出的承諾。`,
      `你不需要一開始就逼對方定義關係，但可以觀察他會不會為你安排時間、記得你講過的事、以及在你需要時仍然出現。`,
      `曖昧最怕你一個人投入太快。先保留自己的節奏，才看得清楚對方是被吸引，還是真的想進一步。`,
      `關係未定之前，界線反而更重要。你越能穩住自己，越容易看出對方有沒有真心向前。`
    ],
    risk: [
      `當「${focus}」出現時，${label}不是叫你即刻恐慌，而是提醒你不要忽略重複出現的傷害。一次可以是衝突，長期重複就是模式。`,
      `第 ${n} 點要你把焦點由「他怎樣解釋」移到「他之後有沒有改」。真正有修補意識的人，不會只用說話安撫你，而會願意承擔後果。`,
      `如果你每次受傷後都要自己消化，對方卻只用一句「我不是故意」帶過，就要小心這已經不是普通磨合。`,
      `關係警號通常不是突然爆出來，而是一點點累積。你越早看清楚，就越不用等到自己完全崩潰才醒覺。`,
      `不要只聽對方怎樣包裝行為，也要看你在這段關係裡是否越來越怕講真話、越來越不敢有需要。`,
      `真正愛你的人不會長期要求你縮小自己。當你開始懷疑自己的感受是否合理，反而更需要把事件客觀記錄下來。`
    ],
    communication: [
      `在「${focus}」這類相處問題裡，${label}會直接影響對方是否願意聽你講。當你用責備開場，對方自然先防衛；當你用具體事件開場，溝通空間會大很多。`,
      `第 ${n} 點可以先由一句說話開始練習。把「你又係咁」改成「剛才那件事令我有點不安」，已經可以令對話由攻擊變成表達。`,
      `你想表達的可能是委屈，但出口變成指責時，對方只會聽到攻擊。先把語氣放低，內容才有機會被聽見。`,
      `好的溝通不是一次過講晒所有不滿，而是先處理最核心的一件事。話題越聚焦，越容易有結果。`,
      `如果對方本身已經很防衛，你更需要用短句、清楚界線和具體例子，避免令對話一開始就失控。`,
      `相處裡最有用的不是贏道理，而是令對方明白「我需要你怎樣配合」。這句講清楚，比翻舊帳更有力量。`
    ],
    commitment: [
      `面對「${focus}」，${label}比一時浪漫更實際。長遠關係要承受生活壓力，所以要看對方在現實問題面前是一起解決，還是習慣逃避。`,
      `第 ${n} 點提醒你不要只看承諾本身，而要看承諾有沒有落地。能夠一起調整生活節奏的人，才比較有機會走得長。`,
      `如果一講到現實安排，對方就含糊、拖延或者推給你處理，你就要看清這段關係是否真的有共同承擔。`,
      `成熟的關係不是沒有分歧，而是有分歧時仍然願意一起坐低處理。這比一句「我愛你」更能反映未來。`,
      `你可以觀察對方在小事上有沒有責任感。小事願意配合，長遠大事才比較有機會一起扛。`,
      `長久不是靠忍，而是靠雙方願意調整。若永遠只有你改，關係就會慢慢失衡。`
    ],
    mindset: [
      `處理「${focus}」時，${label}可以幫你避免被一刻情緒帶走。很多痛苦不是來自事情本身，而是你一直在腦中補完最壞結果。`,
      `第 ${n} 點重點是先把自己拉回現實。當你可以分清事實和猜測，就不會每次對方一個反應都令你全盤崩潰。`,
      `你可以允許自己有情緒，但不要讓情緒直接替你做決定。先停一停，很多看似無解的事會變得清楚一點。`,
      `當你把焦點全部放在對方身上，自己就會越來越被動。先看回自己的需要，才知道哪些值得爭取，哪些需要放下。`,
      `感情不是靠猜贏的。你越努力在腦內推演對方想法，越容易離現實越遠。`,
      `如果同一種不安不斷出現，與其怪自己太敏感，不如看清楚它到底被什麼互動觸發。`
    ]
  };
  return shared[kind][(n - 1) % shared[kind].length];
}

function finalCta(kind, focus) {
  const lines = {
    reconnect: `如果你不確定現在應該主動、等待還是短暫抽離，可以把對話截圖和分開前後的時間線整理好。Asteria 感情拯救所會幫你看清對方心態、復合窗口和下一句說話應該點樣落。`,
    ambiguous: `如果你不確定對方是認真、曖昧還是只享受互動，可以把你們最近的聊天、邀約和見面節奏整理好。Asteria 會幫你判斷他有沒有投入，以及你下一步應該推進還是收回。`,
    risk: `如果你不確定「${focus}」已經去到幾嚴重，可以先把事件、對方解釋和後續行動記低。Asteria 會幫你拆清楚這是可修補的磨合，還是需要守住底線的警號。`,
    communication: `如果你不確定下一句應該點講，可以把你原本想傳的訊息交給我哋 review。Asteria 會幫你調整語氣、次序和重點，令對方更容易聽到你的真正需要。`,
    commitment: `如果你不確定這段關係能不能走長遠，可以把現實壓力、雙方承諾和反覆衝突的位置整理好。Asteria 會幫你看清哪些是可磨合，哪些是需要提早面對的差距。`,
    mindset: `如果你不確定自己是太敏感，還是真的被關係消耗，可以把最近最刺痛你的事件寫低。Asteria 會陪你拆情緒、底線和下一步方向，先令你不用一個人亂猜。`
  };
  return lines[kind];
}

function buildFaq(post) {
  const focus = focusFromTitle(post.title);
  const kind = articleKind(post);
  const qas = {
    reconnect: [
      [`「${focus}」仲有機會挽回或復合嗎？`, '要看對方是否仍有聯絡窗口、情緒是否完全切斷，以及你一靠近時關係是變鬆還是更緊。不是每段冷淡都等於無機會，但方法用錯會令機會變少。'],
      ['我應該斷聯、主動傳訊息，還是等待？', '先看你們目前的互動狀態。如果對方仍有回應，可以低壓互動；如果對方明顯抗拒，就要先停止追問，避免把自己推到更弱的位置。'],
      ['Asteria 可以點樣幫我睇復合方向？', '我哋會按你的對話、時間線和對方反應，幫你判斷現在適合拉近、等待、斷聯，還是先修補情緒位置。']
    ],
    ambiguous: [
      [`點樣分清「${focus}」係真心定只係曖昧？`, '看對方是否願意穩定投入、主動安排和承擔方向。曖昧可以很甜，但沒有行動配合，就很容易只停留在氣氛。'],
      ['我主動會唔會顯得太急？', '主動本身不是問題，無界線才是問題。可以主動一次，但要留空間看對方是否願意接住，而不是你一個人推完整段關係。'],
      ['塔羅可以幫我睇曖昧對象嗎？', '可以。塔羅可以幫你整理對方狀態、你在關係中的位置，以及下一步應該推進、放慢還是收回。']
    ],
    risk: [
      [`「${focus}」係咪一定要分手？`, '不一定，但一定要先看清它是偶發衝突還是長期模式。如果牽涉控制、欺騙、暴力或持續傷害，就要先保護自己。'],
      ['如果對方道歉了，我應該再給機會嗎？', '看道歉後有沒有實際改變。真正的修補不是一句對不起，而是願意承認、調整和承擔後果。'],
      ['Asteria 可以點樣幫我處理關係警號？', '我哋會幫你拆對方行為、關係風險和下一步溝通策略，亦會提醒你哪些位置要守住底線。']
    ],
    communication: [
      [`遇到「${focus}」，我應該點樣開口？`, '先講具體事件，再講自己的感受，最後提出一個可做到的希望。不要一開始就定性對方人格，否則對方很容易立即防衛。'],
      ['如果對方一聽就逃避或不耐煩點算？', '把訊息縮短，只處理一個重點。你要降低對話壓力，先令對方願意留下來聽，而不是一次過討論所有舊帳。'],
      ['Asteria 的相處教學可以幫到咩？', '我哋可以幫你 review 對話，逐句拆邊句會令對方退後、邊句可以降低壓力，再教你更容易被聽見的表達方式。']
    ],
    commitment: [
      [`「${focus}」應該用咩標準判斷？`, '看對方在壓力、現實安排和衝突面前是否願意一起處理。長遠關係不只靠心動，更靠責任感和調整能力。'],
      ['如果我好想有結果，但對方未準備好點算？', '不要用焦慮逼出承諾。可以清楚講出你的需要和時間感，再觀察對方有沒有實際行動配合。'],
      ['塔羅可以睇長遠關係嗎？', '可以幫你看現階段阻礙、對方心態和未來走向，但仍然要配合現實行為判斷。']
    ],
    mindset: [
      [`「${focus}」係咪代表我太情緒化？`, '未必。感情入面有情緒很正常，重點是情緒會不會令你失去方向，或者做出令自己後悔的反應。'],
      ['我應該先處理自己，還是先處理關係？', '兩樣要分開。先穩住自己的情緒，才有能力看清關係；但如果關係仍重要，也可以用清楚而低壓的方式溝通。'],
      ['Asteria 可以點樣陪我整理？', '我哋會陪你整理近況、情緒和相處盲點，幫你在最亂的時候先找回方向。']
    ]
  };
  return [
    '<h2>常見問題</h2>',
    ...qas[kind].flatMap(([q, a]) => [`<h3>${q}</h3>`, `<p>${a}</p>`])
  ].join('\n');
}

function buildContent(post) {
  const kind = articleKind(post);
  const title = cleanTitle(post.title);
  const focus = focusFromTitle(title);
  const count = expectedCount(title);
  const listTitle = count
    ? `${count} 個最需要留意的位置`
    : `先看清楚「${focus}」真正卡住的位置`;

  return [
    `<p>${introByKind[kind]}</p>`,
    `<p>如果你正在面對「<strong>${focus}</strong>」，先不要急著用一個答案判斷整段關係。更有效的方法，是把對方行為、你自己的情緒、你們最近的互動節奏放在一起看，才知道下一步應該靠近、等待、溝通，還是先守住界線。</p>`,
    `<h2>${listTitle}</h2>`,
    buildListSections(post, count || 4),
    '<h2>真正要拆的不是一句說話，而是互動模式</h2>',
    `<p>${practicalByKind[kind]}</p>`,
    '<p>很多人最辛苦的位置，是明明想做好，卻因為太緊張而越做越錯。你可以先把最近三次重要互動寫低：發生了什麼、你當時怎樣回應、對方之後有什麼變化。當你看見模式，就不會只被一刻情緒牽著走。</p>',
    '<h2>下一步可以怎樣做</h2>',
    '<p>先把目標收窄。你不需要一次過解決所有問題，只需要先做一個不會加劇壓力的動作：短訊息、清楚界線、穩定情緒，或者暫時停止追問。當對方反應變得清楚，再決定要推進、修補、等待，還是重新保護自己。</p>',
    `<p>${finalCta(kind, focus)}</p>`,
    buildFaq(post)
  ].join('\n');
}

let changed = 0;
for (const post of posts) {
  if (titleOverrides.has(post.id)) post.title = titleOverrides.get(post.id);
  post.title = cleanTitle(post.title);
  if (!repairIds.has(post.id)) continue;
  post.content = buildContent(post);
  post.summary = post.summary
    .replace(/^如果你正面對「[^」]+」呢類感情狀況，可以先用[^。]+。$/, `遇到「${focusFromTitle(post.title)}」時，先分清表面行為、真正情緒同互動模式，再決定應該溝通、觀察、修補定守住界線。`);
  post.coverCaption = `Asteria 相處教學：${post.title}`;
  changed += 1;
}

const serialized = JSON.stringify(posts, null, 2)
  .replace(/"([^"]+)":/g, '$1:')
  .replace(/\\u003c/g, '<')
  .replace(/\\u003e/g, '>')
  .replace(/\\u0026/g, '&');

fs.writeFileSync(articlesFile, `${source.slice(0, arrayStart)}${serialized}${source.slice(arrayEnd)}`);
console.log(`repaired ${changed} articles`);
