import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const file = path.resolve('lib/articlesData.ts');
let source = fs.readFileSync(file, 'utf8');

const startMarker = 'export const teachingPosts: TeachingPost[] = ';
const start = source.indexOf(startMarker);
const end = source.lastIndexOf('\n];');
if (start === -1 || end === -1 || end <= start) {
  throw new Error('teachingPosts array not found');
}

const mod = await import(pathToFileURL(file).href);
const posts = mod.teachingPosts;

const strip = (html = '') => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const topicFromTitle = (title) => {
  const clean = title.replace(/[【】\[\]]/g, '').replace(/\s+/g, ' ').trim();
  const beforeQuestion = clean.split(/[？?]/)[0];
  return beforeQuestion.length > 30 ? clean.slice(0, 30) : beforeQuestion || clean.slice(0, 30);
};

const groupFor = (post) => {
  const text = `${post.title} ${post.category} ${post.summary}`.toLowerCase();
  if (/第三者|新歡|曖昧對象|介入|桃花|背叛/.test(text)) return 'third';
  if (/斷聯|冷淡|少覆|不讀不回|已讀|失聯|封鎖|block/.test(text)) return 'cold';
  if (/分手|復合|挽回|回頭|前任|放低|失戀/.test(text)) return 'reconcile';
  if (/親密|曖昧|關係定位|承諾|界線|同居|身體/.test(text)) return 'intimacy';
  if (/情緒|內耗|焦慮|敏感|不安|心累|難受/.test(text)) return 'emotion';
  if (/溝通|說話|訊息|message|吵架|爭執|氹|哄|表達/.test(text)) return 'communication';
  if (/塔羅|占卜|儀式|白魔法|能量/.test(text)) return 'ritual';
  return 'general';
};

const variants = {
  objective: {
    reconcile: [
      (t) => `處理「${t}」時，第一步不是急著求答案，而是分清你想重開聯絡、修補誤會，還是確認對方仍否願意靠近。目的不同，訊息的力度也要不同。`,
      (t) => `如果你正在想「${t}」，先把目標縮到一個很小的下一步：讓對方願意回一句、願意聽你講，或願意重新建立低壓互動。`,
    ],
    cold: [
      (t) => `遇到「${t}」這類冷淡狀態，最怕一邊猜一邊追。先分清你要查明原因、降低壓力，還是重新建立舒服互動，才不會越問越遠。`,
      (t) => `對方少覆時，不要把每一句都當成審判。先整理你想確認的是忙、避開、情緒冷卻，還是關係真的退後。`,
    ],
    third: [
      (t) => `牽涉「${t}」時，訊息目的要更清楚：你不是要同第三方比較，而是要看對方有沒有處理關係、交代位置和尊重你。`,
      (t) => `有第三者或新歡影響時，先不要急著攤牌。你要先判斷對方的心態、你手上有多少事實，以及你想守住甚麼底線。`,
    ],
    intimacy: [
      (t) => `面對「${t}」，要先分清是情感靠近、身體吸引，還是對方真正願意承諾。三者看似相似，但下一步完全不同。`,
      (t) => `親密或曖昧之後，最重要不是立刻逼對方表態，而是觀察對方是否持續投入、主動交代和願意維持關係。`,
    ],
    emotion: [
      (t) => `在「${t}」這種情緒很滿的情況，先不要把不安直接丟給對方。先分清你需要安撫、答案，還是需要重新掌握自己的節奏。`,
      (t) => `情緒升起時，真正要處理的不只是對方一句話，而是這件事觸發了你哪一種害怕：失去、被忽略，還是再次受傷。`,
    ],
    communication: [
      (t) => `處理「${t}」時，先決定這次對話的任務：解釋、道歉、提出要求，還是讓對方重新願意聽你講。任務太多，對話就會散。`,
      (t) => `一段訊息最好只處理一個核心。你越想一次過講清所有委屈，對方越容易只聽到壓力而不是你的需要。`,
    ],
    ritual: [
      (t) => `如果你在看「${t}」，可以先把現實關係狀態整理清楚，再決定要用塔羅、儀式還是相處策略去配合。方向清楚，能量才不會亂放。`,
      (t) => `占卜或儀式不是用來代替判斷，而是幫你看清阻礙、對方狀態和下一步可行方向。`,
    ],
    general: [
      (t) => `看「${t}」時，先不要急著套答案。把近況、對方反應和你真正想要的結果放在一起看，方向會清楚很多。`,
      (t) => `每段關係卡住的點都不同。先把事件拆細，再決定要溝通、等待、拉近，還是先退一步保護自己。`,
    ],
  },
  feeling: {
    communication: [
      () => `感受要講得入耳，重點不是收起委屈，而是不要一開口就把對方推去被審判的位置。具體事件、你的感受、下一步希望，三樣分開講會穩得多。`,
      () => `用「我感受到」代替「你成日都」，不是為了委屈自己，而是讓對方比較有空間聽見真正問題。`,
    ],
    cold: [
      () => `對方冷淡時，質問通常只會令距離更遠。你可以先用低壓方式確認近況，再觀察他是否願意重新接住互動。`,
      () => `少覆訊息時，最需要避免的是連環追問。你要讓對方感到這段對話仍然舒服，而不是一打開就有壓迫感。`,
    ],
    emotion: [
      () => `情緒可以被看見，但不一定要用最激烈的方式表達。先把最痛的一句改成最清楚的一句，才有機會被接住。`,
      () => `不安不是錯，但如果每次不安都變成追問，關係會慢慢只剩壓力。先安頓自己，再決定要不要開口。`,
    ],
    general: [
      () => `講感受之前，先把責備拿走一半。對方聽到的是需要，而不是指控，對話才有機會繼續。`,
      () => `越在意的人，越容易講出帶刺的話。先把句子放慢，保留你的感受，也保留對方回應的空間。`,
    ],
  },
  action: {
    reconcile: [
      () => `如果仍想修補，可以先用一句低壓訊息試水溫；不要一開始就要承諾，先看對方願不願意重新回到對話。`,
      () => `復合不是靠一次長訊息完成，而是先讓對方重新感到安全，再慢慢修回互動節奏。`,
    ],
    cold: [
      () => `先不要加碼追問。隔一點時間，用一個自然、短而不逼迫的開口，看對方是否仍願意回應。`,
      () => `冷淡期最怕你越急他越退。把訊息縮短，把情緒收穩，先重建一點舒服感。`,
    ],
    communication: [
      () => `可以先刪走多餘解釋，只留一個重點。對方能聽完，才有機會處理下一層問題。`,
      () => `想講的東西太多時，先選最影響關係的一句。其他委屈可以之後再慢慢拆。`,
    ],
    general: [
      () => `下一步不需要很大。先做一個不會令自己後悔的動作，再用對方反應決定要不要繼續。`,
      () => `當你未肯定方向，先不要急著攤牌。用小步測試，比一次過爆發更容易保留局面。`,
    ],
  },
  asteria: {
    general: [
      () => `Asteria 可以幫你拆清對方心態、訊息語氣和關係位置，避免你在最亂的時候越做越錯。`,
      () => `如果你不確定下一句應該怎樣講，可以把近況和對話截圖交給我們，一起整理比較穩陣的方向。`,
    ],
    ritual: [
      () => `我們會先看清關係阻礙和對方狀態，再建議塔羅、儀式或相處策略，避免亂配方向。`,
      () => `塔羅和儀式要配合現實相處才會更完整，所以我們會同時看能量、心態和下一步行動。`,
    ],
  },
};

const commonExact = new Map([
  ['每一次溝通都要先分清目的：你是想解釋、理解、提出要求，還是確認關係位置。目的清楚，說話才不會越講越亂。', 'objective'],
  ['感受可以講，但要避免變成指控。用「我會覺得」開始，比「你成日都」更容易令對方留在對話裡，而不是即刻防衛。', 'feeling'],
  ['先講具體事件，再講自己的感受，最後提出一個小而清楚的希望。不要一開始就定性對方，否則對話很快變成防衛。', 'feeling'],
  ['先不要加碼解釋。可以把句子縮短，回到最核心的一點，等對方有空間接收。', 'action'],
  ['想對方聽得入，不能一開始就站在審判位置。先講你觀察到的具體情況，再提出你希望下次怎樣做，對方會比較容易接收。', 'feeling'],
  ['如果仍有基本窗口，可以主動一次，但訊息要短、低壓、有重點。不要一開口就要求復合，先讓對方願意接住對話。', 'action'],
  ['如果情緒太高，先觀察和整理；如果已有清楚事件，可以低壓溝通一次，再看對方回應。', 'action'],
  ['要看對方是否仍有回應、是否保留聯絡窗口，以及分開原因能否被處理。只看一刻冷淡或一句狠話，未必足夠判斷結局。', 'objective'],
  ['親密可以令兩個人短時間內靠近，但不能直接等於承諾。真正要看的，是對方之後會不會持續關心、交代關係位置，以及願不願意為相處負責。', 'objective'],
  ['我哋可以幫你拆對方心態、分手原因和訊息策略，睇下下一步應該靠近、放慢，還是先守住界線。', 'asteria'],
  ['我哋可以幫你整理近況、訊息和對方心態，再建議相處策略、占卜或儀式方向。', 'asteria'],
  ['我哋會幫你整理情緒、對方心態和下一步，讓你在最混亂的時候有方向感。', 'asteria'],
  ['我哋可以幫你拆對方事後行動、訊息和關係位置，睇下這段親密到底代表機會，還是又一次消耗。', 'asteria'],
  ['我哋會幫你拆對方心態、第三方影響和你下一步的說話策略，避免被情緒推住亂做。', 'asteria'],
  ['會。我哋可以逐句睇你想發的訊息，幫你改成更容易被聽見、又不失界線的講法。', 'asteria'],
]);

let replaced = 0;
for (const post of posts) {
  const group = groupFor(post);
  const topic = topicFromTitle(post.title);
  let content = post.content;

  for (const [exact, type] of commonExact) {
    if (!content.includes(exact)) continue;
    const bank = variants[type]?.[group] || variants[type]?.general || variants.asteria.general;
    const index = (post.id + exact.length + type.length) % bank.length;
    const replacement = bank[index](topic);
    content = content.split(exact).join(escapeHtml(replacement));
    replaced += 1;
  }

  post.content = content;
}

const serialized = JSON.stringify(posts, null, 2);
source = `${source.slice(0, start + startMarker.length)}${serialized}${source.slice(end + 2)}`;
fs.writeFileSync(file, source);

console.log({ replaced });
