import fs from 'fs';
import path from 'path';
import vm from 'vm';

const projectRoot = process.cwd();
const articlesPath = path.join(projectRoot, 'lib', 'articlesData.ts');
const indexPath = '/Users/dorothy/Documents/asteria 所有教學文/backup/愛情拯救所 教學文/web_ready/_INDEX.md';

const source = fs.readFileSync(articlesPath, 'utf8');
const header = source.slice(0, source.indexOf('export const teachingPosts'));
const arraySource = source
  .slice(source.indexOf('export const teachingPosts'))
  .replace(/^export const teachingPosts: TeachingPost\[\] = /, '')
  .replace(/;\s*$/, '');

const teachingPosts = vm.runInNewContext(arraySource, {});

const indexLines = fs.readFileSync(indexPath, 'utf8').split('\n');
const indexedTitles = indexLines
  .map((line) => {
    const match = line.match(/^\d+\.\s+\[(.+?)\]\(/);
    return match ? cleanTitle(match[1]) : null;
  })
  .filter(Boolean);

function cleanTitle(title) {
  return title
    .replace(/\s+AI\s*摘要.*$/i, '')
    .replace(/[【】\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripHtml(text) {
  return String(text || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function classify(title, category = '') {
  const titleText = `${title}`;
  const haystack = `${title} ${category}`;
  if (/占卜|塔羅|儀式|白魔法|能量|水晶|月老/.test(titleText)) return 'spiritual';
  if (/迷思|心理|科學|依戀|安全感|內耗|心動|自卑|不安|焦慮|失戀|放下|心累|委屈/.test(haystack)) return 'emotion';
  if (/第三者|新歡|出軌|介入|小三|另一個/.test(haystack)) return 'thirdParty';
  if (/復合|挽回|前任|分手|假性分手|回頭|斷捨離/.test(haystack)) return 'reconnect';
  if (/斷聯|冷淡|少覆|已讀|不讀|失聯|訊息|message|覆|聊天|開口/.test(haystack)) return 'message';
  if (/曖昧|暗戀|桃花|單身|脫單|吸引|主動|追|表白/.test(haystack)) return 'ambiguous';
  if (/溝通|勸|講|吵架|爭執|道歉|氹|說話|情緒勒索/.test(haystack)) return 'communication';
  if (/控制|PUA|打壓|紅旗|界線|自私|冷暴力|逃避|迴避|有毒/.test(haystack)) return 'boundary';
  if (/結婚|同居|拍拖|長期|熱戀|穩定|金錢|AA|承諾/.test(haystack)) return 'longTerm';
  return 'general';
}

const sectionBank = {
  reconnect: [
    ['先分清「想念」同「適合追回」', '復合最容易令人急住行動，但真正要先看的，是分手原因有沒有改變、對方是否仍留有互動空間，以及你想追回的是這個人，還是想停止失去的痛。'],
    ['對方未回頭，不代表完全沒有窗口', '有些人分手後會用冷淡保護自己，有些人則仍在觀察你有沒有改變。不要只用一次回覆判斷結局，要看一段時間內的態度、主動性和語氣。'],
    ['不要用求證式訊息逼對方表態', '越想問清楚，越容易把對方推到要防守的位置。比較穩陣的做法，是先用低壓、清楚、有界線的方式重新建立安全感。'],
    ['修補要由改變互動開始', '如果舊問題仍然存在，即使重新聯絡也會很快回到同一個循環。你需要的不是更多訊息，而是新的相處節奏。']
  ],
  message: [
    ['少覆訊息背後，通常有一個壓力位', '對方少覆未必只有不愛一個答案。可能是忙、逃避衝突、怕被追問，亦可能是關係熱度下降。先拆清楚原因，才知道應該退一步還是調整說法。'],
    ['回覆頻率不是唯一指標', '更重要的是對方有沒有延續話題、願不願意交代近況、見面時是否仍投入。只看已讀不回，很容易令自己越想越亂。'],
    ['越追問，越容易令對方關機', '當你每次訊息都帶著焦慮，對方會慢慢把聊天等同壓力。先把問題縮細，只處理一個主題，反而更容易得到回應。'],
    ['把訊息變得容易回答', '與其問「你到底點諗」，可以改成具體而低壓的句子，讓對方不用立刻承擔整段關係的重量。']
  ],
  communication: [
    ['你講的不是錯，問題是對方接收不到', '很多關係不是輸在道理，而是輸在語氣、時機和壓力。你越想對方明白，越要先讓對方願意聽。'],
    ['勸導太密，會變成被控制的感覺', '即使出發點是為對方好，若每次對話都像糾正，對方自然會抗拒。先處理情緒，再談行為，效果會穩定得多。'],
    ['衝突時不要一次過翻舊帳', '一次對話只處理一件事，才有機會真的被聽見。把所有委屈一次過倒出來，通常只會令對方想逃。'],
    ['好的相處，是讓對方知道下一步可以怎樣做', '比起指責「你從來都不懂」，更有用的是講清楚你需要甚麼、希望對方下次怎樣配合。']
  ],
  ambiguous: [
    ['曖昧卡住，不一定是你不夠吸引', '有時對方有好感，但未準備承擔關係；有時他享受互動，卻不想表態。要分清曖昧的甜和真正推進的意願。'],
    ['太快逼答案，會令關係失去彈性', '曖昧期最怕把所有情緒都壓在一次表態上。先觀察對方是否願意投入時間、安排見面和主動延續關係。'],
    ['吸引力要配合界線', '你可以溫柔，但不需要無限等待。當你有節奏地回應、有底線地投入，對方反而更容易看見你的價值。'],
    ['推進關係要有台階', '由聊天、見面、共同經歷到確認關係，每一步都要有自然承接。跳太快，反而容易令對方退縮。']
  ],
  thirdParty: [
    ['先看對方真正的重心在哪裡', '第三者或新歡出現時，最痛的是不確定自己還有沒有位置。不要只看對方一刻的選擇，要看他是否仍然對你有牽掛、愧疚或未完結的情緒。'],
    ['比較只會令你更失控', '你越把自己放在比較裡，越容易失去判斷。真正要處理的是你和對方之間的連結、問題和可修復的位置。'],
    ['不要急著用情緒搶回注意力', '哭、鬧、追問可能短暫拉近距離，但也可能令對方更想逃。先穩住自己的位置，再決定要談清楚還是拉開距離。'],
    ['如果要挽回，方向要非常精準', '這類局面不能亂試訊息。要先判斷對方和第三者的穩定度、你們的舊問題，以及對方對你的餘溫。']
  ],
  boundary: [
    ['愛不是要你一直退讓', '當關係裡只有你在調整、你在道歉、你在理解，久了會把愛變成消耗。真正健康的關係，需要雙方都願意看見彼此。'],
    ['關心和控制，差別在於你有沒有選擇', '如果對方用愛的名義限制你、否定你、令你懷疑自己，就要慢慢分清這不是親密，而是壓力。'],
    ['不要把紅旗解釋成「他只是性格」', '一兩次失誤可以溝通，長期模式就需要認真看待。反覆被打壓、冷暴力或情緒勒索，不應該只靠你忍。'],
    ['界線不是冷漠，而是保護關係', '清楚講出底線，才能知道對方是否願意尊重你。沒有界線的付出，只會令你越來越委屈。']
  ],
  emotion: [
    ['先照顧你被拉扯的情緒', '當你很不安時，大腦會不停尋找證據證明自己會被拋低。先讓情緒降下來，才有能力看清對方真正的行為。'],
    ['痛苦不代表你做錯選擇', '失戀、焦慮和放不下，很多時候是因為你仍在適應失去。不要急著否定自己，也不要在最痛時做最大決定。'],
    ['把幻想和事實分開', '你可以想念對方，但也要看清他實際做了甚麼。情緒會放大希望，同時也會放大恐懼。'],
    ['慢慢把重心拉回自己身上', '關係重要，但你的生活、節奏和價值也重要。當你不再只圍著對方反應轉，才更容易做出清醒選擇。']
  ],
  longTerm: [
    ['長期關係最怕變成理所當然', '拍拖久了，問題未必是沒有愛，而是大家都習慣了少說、多忍、少欣賞。這些細節會慢慢累積成距離。'],
    ['穩定不等於不用經營', '越熟悉的人，越容易用最差語氣對待。真正的穩定，是仍然願意回頭修補、理解和調整。'],
    ['生活壓力會放大相處問題', '金錢、工作、家庭和未來計劃，都會影響感情。不要只怪對方變了，也要看清壓力從哪裡進入關係。'],
    ['承諾要落在日常行動裡', '講愛很重要，但真正令關係安心的，是對方有沒有在重要時刻站在你身邊。']
  ],
  spiritual: [
    ['先看清對方心態與阻礙', '當你只憑感覺估對方，很容易一時希望、一時崩潰。塔羅可以先整理對方心態、阻礙位置和短期走勢。'],
    ['能量方向要配合現實互動', '愛情儀式可以協助能量、復聯、清理負面或推動關係，但日常說話、時機和界線仍然要配合。'],
    ['不要只問結果，也要問原因', '比起單純問會不會復合，更值得看的是為何卡住、對方怕甚麼、你可以避開甚麼錯誤。'],
    ['方向清楚，行動才不會亂', '先知道局面屬於冷淡、斷聯、第三者還是情緒內耗，再配合塔羅、儀式或相處教學，會比亂試更穩。']
  ],
  general: [
    ['先看清這段關係卡在哪裡', '感情問題很少只有一個原因。你要先分清是溝通、信任、距離、壓力還是價值感出了問題。'],
    ['不要用單一反應判斷全部', '一句冷淡、一日少覆，未必等於結束；但如果反覆發生，就值得認真看清背後模式。'],
    ['你的感受需要被整理，不是被否定', '覺得辛苦不代表你太敏感，而是關係裡有些位置令你長期不安。先承認感受，才有力氣處理問題。'],
    ['下一步要小一點、清楚一點', '越混亂的局面，越不適合衝動攤牌。把問題縮細，先處理最影響關係的一步。']
  ]
};

function rotateSections(kind, id) {
  const sections = sectionBank[kind] || sectionBank.general;
  const shift = id % sections.length;
  return sections.slice(shift).concat(sections.slice(0, shift));
}

function makeIntro(title, kind) {
  const intros = {
    reconnect: `如果你正在想「${title}」，真正難受的通常不是單純想念，而是不知道對方心裡還有沒有你。這篇會先幫你拆清楚復合前要看的位置，避免因為太急而令關係更緊。`,
    message: `「${title}」這類問題最容易令人反覆看手機、反覆猜對方意思。與其只用回覆速度判斷愛不愛，不如先看清訊息背後的壓力、關係熱度和互動模式。`,
    communication: `關係裡最無力的時候，往往是你明明很努力解釋，對方卻好像聽不進去。圍繞「${title}」，重點不是講更多，而是令對方願意接收。`,
    ambiguous: `遇到「${title}」時，曖昧的甜和不確定會同時出現。你要看的不是一刻心動，而是對方有沒有穩定投入和願意推進。`,
    thirdParty: `當局面牽涉「${title}」，最容易令人失去安全感。先不要急著比較或搶答案，因為這種情況更需要看清對方重心和你們之間未完的位置。`,
    boundary: `如果「${title}」令你長期委屈，就要先停一停。愛不是要你無限合理化對方，真正要看的是這段關係有沒有尊重和回應。`,
    emotion: `「${title}」背後通常有很多不安、失望和反覆想法。這篇會先幫你把情緒和事實分開，讓你不需要靠衝動去止痛。`,
    longTerm: `長期相處最怕不是一次爭執，而是慢慢累積的失望。由「${title}」開始，可以先看清關係裡哪個位置正在被忽略。`,
    spiritual: `如果你正在搜尋「${title}」，代表你可能想知道對方心態、關係走勢或有沒有方法推動局面。占卜和儀式都要先建基於清楚判斷。`,
    general: `「${title}」不是一句答案就能解決的問題。先把情緒、對方反應和關係模式拆開，才會知道下一步應該靠近、等待還是調整。`
  };
  return intros[kind] || intros.general;
}

function makeClose(title, kind) {
  const closes = {
    reconnect: '如果你仍然想修補，不要急著逼答案。先整理分手原因、近期互動和對方反應，再決定用甚麼方式重新靠近。',
    message: '當你不知道訊息要怎樣回，可以先把最想問的問題縮成一句，不要一次過把所有不安丟給對方。',
    communication: '真正有效的溝通，是令對方聽得入，同時你也不需要委屈自己。先穩住語氣，再講清楚需要。',
    ambiguous: '曖昧期要保留吸引，也要保留底線。對方願不願意行下一步，不能只靠你單方面努力。',
    thirdParty: '這種局面要更慢、更準。先看清對方和第三者的狀態，再決定你要守住、修補還是抽離。',
    boundary: '如果一段關係一直令你懷疑自己，請先把感受放回自己身上。你需要的不是忍多一點，而是看清對方是否願意尊重你。',
    emotion: '情緒很滿的時候，不一定要即時做決定。先照顧自己，再看對方是否值得你繼續投入。',
    longTerm: '長期關係的修補，通常不是靠一次談判，而是靠一段時間內穩定地改變互動。',
    spiritual: '塔羅和儀式可以幫你整理方向，但最重要是知道自己正在處理哪一類問題，避免把力氣用錯地方。',
    general: '當方向未清楚時，先不要急著做大動作。把事情拆細，關係才有機會重新回到可處理的位置。'
  };
  return `${closes[kind] || closes.general} 如果你想我哋按《${title}》入面講到的情況幫你拆局，可以 WhatsApp 講低近況。`;
}

function makeSummary(title, kind) {
  const hooks = {
    reconnect: '復合前先拆清分手原因、對方心態同重新靠近的時機。',
    message: '對方少覆、冷淡或斷聯時，先看清訊息背後的壓力同回應窗口。',
    communication: '用更容易被聽見的方式表達需要，減少越講越遠的相處循環。',
    ambiguous: '曖昧、暗戀或桃花卡住時，分清吸引、投入同推進關係的節奏。',
    thirdParty: '第三者或新歡出現時，先看清對方重心、餘溫同可修補位置。',
    boundary: '遇到控制、打壓或長期委屈，先辨認界線同關係是否仍有尊重。',
    emotion: '失戀、焦慮或放不低時，把情緒同事實分開，先穩住自己。',
    longTerm: '拍拖、同居或長期關係卡住時，回到日常互動和承諾細節。',
    spiritual: '用塔羅、占卜或儀式前，先分清問題核心和適合的處理方向。',
    general: '把感情混亂拆成可理解的關係模式，再決定下一步。'
  };
  return `${title}：${hooks[kind] || hooks.general}`;
}

function makeTags(post, kind) {
  const base = new Set([post.category, post.imageLabel, ...(post.tags || [])].filter(Boolean));
  const spiritualOnly = new Set(['感情占卜', '塔羅', '白魔法儀式']);
  for (const tag of Array.from(base)) {
    if (kind !== 'spiritual' && spiritualOnly.has(tag)) base.delete(tag);
  }
  const extra = {
    reconnect: ['復合', '挽回前任', '分手後點算'],
    message: ['斷聯', '少覆 message', '訊息點覆'],
    communication: ['相處教學', '感情溝通', '關係修復'],
    ambiguous: ['曖昧', '暗戀', '桃花'],
    thirdParty: ['第三者', '新歡', '關係逆轉'],
    boundary: ['界線', '冷暴力', '關係紅旗'],
    emotion: ['失戀', '情緒支援', '安全感'],
    longTerm: ['長期關係', '拍拖相處', '承諾'],
    spiritual: ['感情占卜', '香港塔羅', '愛情儀式'],
    general: ['感情教學', 'Asteria 感情拯救所']
  };
  (extra[kind] || extra.general).forEach((tag) => base.add(tag));
  base.add('Asteria 感情拯救所');
  return Array.from(base).slice(0, 8);
}

function makeContent(title, kind, id) {
  const sections = rotateSections(kind, id);
  const html = [`<p>${escapeHtml(makeIntro(title, kind))}</p>`];
  sections.forEach(([heading, paragraph]) => {
    html.push(`<h2>${escapeHtml(heading)}</h2>`);
    html.push(`<p>${escapeHtml(paragraph)}</p>`);
  });
  html.push(`<h2>${escapeHtml(closeHeading(kind, id))}</h2>`);
  html.push(`<p>${escapeHtml(makeClose(title, kind))}</p>`);
  return html.join('\n');
}

function closeHeading(kind, id) {
  const options = {
    reconnect: ['先令關係有重新接近的空間', '復合要看時機，也要看改變', '不要急著把答案逼出來'],
    message: ['把一句訊息變成一個溫和入口', '先降低壓力，再等對方回應', '回覆之前先整理自己的目的'],
    communication: ['讓對話回到可被接收的位置', '用清楚需要代替反覆指責', '留一點空間，對方才有機會回應'],
    ambiguous: ['推進曖昧時，節奏比衝動重要', '保留吸引，也保留自己的位置', '不要用等待證明自己的價值'],
    thirdParty: ['先穩住自己，再處理局面', '不要讓比較偷走你的判斷', '越複雜的關係越需要慢慢拆'],
    boundary: ['界線清楚，才知道對方是否尊重你', '不要把長期委屈當成愛的證明', '你也需要被好好對待'],
    emotion: ['先把自己接回來，再看關係', '情緒降下來，答案才會清楚', '不要在最痛時做最大決定'],
    longTerm: ['把日常小事重新變成連結', '穩定關係也需要持續回應', '承諾要在行動裡被看見'],
    spiritual: ['先拆清問題，再選合適方向', '能量方向要配合現實互動', '看清局面，才不會用錯方法'],
    general: ['把下一步縮細，先做可處理的事', '先整理局面，再決定靠近或退後', '不要讓情緒替你做全部決定']
  };
  const list = options[kind] || options.general;
  return list[id % list.length];
}

const rebuilt = teachingPosts.map((post, index) => {
  const title = indexedTitles[index] || cleanTitle(post.title);
  const kind = classify(title, post.category);
  return {
    ...post,
    title,
    summary: makeSummary(title, kind),
    content: makeContent(title, kind, post.id),
    tags: makeTags(post, kind),
    coverCaption: `Asteria 相處教學：${title}`,
    inlineCaption: '關係不只是答案，還需要一步一步看清楚相處方法。'
  };
});

const output = `${header}export const teachingPosts: TeachingPost[] = ${JSON.stringify(rebuilt, null, 2)};\n`;
fs.writeFileSync(articlesPath, output);
console.log(`Rebuilt ${rebuilt.length} articles.`);
