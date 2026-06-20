import fs from 'node:fs';

const dataPath = new URL('../lib/articlesData.ts', import.meta.url);
const source = fs.readFileSync(dataPath, 'utf8');
const prefix = 'export const teachingPosts: TeachingPost[] = ';
const start = source.indexOf(prefix);
const end = source.lastIndexOf('\n];');

if (start === -1 || end === -1) {
  throw new Error('Could not locate teachingPosts array.');
}

const posts = JSON.parse(source.slice(start + prefix.length, end + 2));

const strip = (value = '') =>
  value
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

const titleTopic = (post) =>
  strip(post.title)
    .replace(/^【.*?】/, '')
    .replace(/\bAI 摘要.*$/i, '')
    .replace(/[？?！!：:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 18);

const rules = [
  [/恐嚇|威脅|羞辱|貶低|冷暴力|家暴|控制|安全感/, [
    '普通爭執不會令你長期害怕',
    '控制型說話會慢慢削弱你的底氣',
    '感到不安全時，先把自己放在前面',
    '界線不是吵架，而是保護自己',
    '看對方會理解你，還是怪你太敏感'
  ]],
  [/更乖|更忍|縮細|退讓|討好|無限/, [
    '越忍讓，對方越未必懂珍惜',
    '不要用縮細自己換一刻平靜',
    '你要守住的不是脾氣，是底線',
    '關係不是靠一個人無限配合維持'
  ]],
  [/界線不是|不能接受|保護自己|界線清楚|再發生|底線/, [
    '界線要講到具體，對方才知道位置',
    '底線不是威脅，而是你能承受的範圍',
    '先講清楚後果，再觀察對方行動',
    '真正尊重你的人，會願意調整'
  ]],
  [/具體事件|大帽子|指責|翻舊帳|舊事|感受/, [
    '把指責改成具體事件',
    '一次只處理一個最痛的位置',
    '不要把舊傷全部倒進同一場對話',
    '講感受之前，先講清楚發生了甚麼',
    '對話越具體，對方越難逃避'
  ]],
  [/小要求|交代一句|做到|大承諾|保證永遠/, [
    '先看小承諾能不能持續',
    '要求越細，越容易看出誠意',
    '不要急著要永遠，先看他今日做不做到',
    '穩定是由一件件小事累積出來'
  ]],
  [/不懂表達|願意學|不想改|不會氹|直男|氹人/, [
    '不懂表達和不想改是兩回事',
    '真正願意學的人，會慢慢有行動',
    '你要看的不是甜言蜜語，是回應能力',
    '教對方之前，先看他願不願意聽'
  ]],
  [/聯絡窗口|互動降到最低|短暫退後|不願面對|斷聯|冷淡|少覆|已讀/, [
    '先看對方是否仍保留聯絡窗口',
    '少覆不一定是完結，但要看退後多久',
    '冷淡期最忌一口氣追問到底',
    '先降低壓力，再慢慢拉近距離',
    '訊息變少時，更要看互動質素'
  ]],
  [/分手原因|假性分手|真性切斷|保留聯絡|復合|挽回/, [
    '先分清是真斷，還是情緒退開',
    '復合不是靠求，而是重建舒服感',
    '太急著解釋，反而會推遠對方',
    '把復合拆成可以前進的小步',
    '不要一個人承包整段修補'
  ]],
  [/普通聊天|重新見面|低壓互動|舒服|安全|見面/, [
    '重新靠近要由舒服互動開始',
    '先讓對方不抗拒，再談深入問題',
    '見面不是終點，是觀察互動的開始',
    '低壓相處，比長篇解釋更有效'
  ]],
  [/新歡|第三者|比較|替代|出軌|背叛/, [
    '不要把自己放進比較賽',
    '第三者只是表面，真正要看關係空洞',
    '新歡出現時，更要穩住你的節奏',
    '背叛後要看的不是承諾，是透明行動',
    '信任要靠時間和一致行為重建'
  ]],
  [/曖昧|忽冷忽熱|不確認|不承諾|暗戀/, [
    '曖昧卡住時，先看投入是否對等',
    '忽冷忽熱最消耗的是你的判斷力',
    '沒有確認前，不要急著交出全部情緒',
    '對方享受曖昧，不代表他準備承擔'
  ]],
  [/主動|追問|壓力|攬|靠近/, [
    '主動之前先降低壓力感',
    '你可以靠近，但不要變成追趕',
    '對方退一步時，你更要穩住節奏',
    '真正有效的主動，是讓互動變輕'
  ]],
  [/道歉|對不起|重犯|交代|透明|原諒/, [
    '一句道歉不等於真正承擔',
    '透明交代比口頭保證更重要',
    '你可以慢慢觀察，不用急著原諒',
    '重犯才是關鍵，不是道歉講得多動聽',
    '修補需要對方願意配合你的不安'
  ]],
  [/付出|假性努力|不領情|越做越委屈|努力/, [
    '付出之前先看對方真正需要甚麼',
    '你以為在努力，對方可能感到壓力',
    '委屈感太重時，付出會變成扣分',
    '好的付出應該令關係更輕，不是更累'
  ]],
  [/勸導|改變|說服|反駁|溝通失敗/, [
    '不要用說服代替溝通',
    '對方聽不入，不代表你要講更多',
    '先讓他感覺被理解，再談改變',
    '勸導太重，容易變成壓迫'
  ]],
  [/情緒|焦慮|失戀|痛苦|放低|內耗|崩潰/, [
    '痛苦先被接住，人才有力氣判斷',
    '失戀最難捱的是反覆想像',
    '放低不是逼自己無感覺',
    '先穩住情緒，先不急著做決定',
    '內耗太多時，答案會被恐懼蓋住'
  ]],
  [/牌面|塔羅|占卜|答案|方向|預測/, [
    '牌面先幫你整理方向',
    '占卜不是逼你即刻做決定',
    '真正要看的，是對方狀態和你的位置',
    '知道趨勢後，下一步要回到行動'
  ]],
  [/儀式|能量|開路|清理|白魔法|黑魔法|斬斷|復合儀式/, [
    '儀式要配合現實互動才有方向',
    '能量調整不是代替你處理關係',
    '先看阻礙在哪裡，再配合適合方向',
    '關係要推動，也要留意對方狀態'
  ]],
  [/工作|事業|財運|貴人|運氣|金錢/, [
    '把阻礙拆開，先找最能推動的位置',
    '運氣要配合選擇和行動才會放大',
    '事業卡住時，先看人際和方向',
    '財運不是只求快，也要看穩定度'
  ]],
  [/家庭|生活|壓力|時間|工作|忙/, [
    '生活壓力會改變相處節奏',
    '忙不是問題，完全不安排才是問題',
    '先分清是壓力大，還是心不在',
    '關係要留位置，不是靠有空才維持'
  ]],
  [/溝通|訊息|說話|語氣|一句|message|WhatsApp/, [
    '一句說話的重點是讓對方聽得入',
    '訊息不是越長越有誠意',
    '語氣一變，對方反應也會變',
    '先想清楚目的，再決定怎樣開口',
    '文字溝通最怕情緒走得太前'
  ]],
  [/等待|冷靜|時間|耐性|觀察/, [
    '等待不是停住，而是保留空間',
    '冷靜期要看變化，不是只數日子',
    '耐性不是忍，而是有節奏地觀察',
    '時間可以淡化衝突，也可能暴露答案'
  ]],
  [/選擇|決定|目標|想要|下一步/, [
    '先弄清自己想守住甚麼',
    '你要的答案，未必是同一種方向',
    '下一步要細到你真的做得到',
    '不要把所有答案迫在同一刻'
  ]]
];

const fallbackByIndex = [
  '這段關係真正卡住的位置',
  '先整理情緒，再看對方行動',
  '不要把所有答案迫在同一刻',
  '下一步要細到你真的做得到',
  '用互動反應判斷還值不值得等',
  '你要守住的底線和節奏'
];

const normalizeHeading = (heading) =>
  heading
    .replace(/\s+/g, ' ')
    .replace(/[「」]{2,}/g, '')
    .trim();

const globalUsage = new Map();

const chooseHeading = (candidates, used) => {
  const normalized = candidates.map(normalizeHeading).filter(Boolean);
  const available = normalized
    .filter((heading) => !used.has(heading))
    .sort((a, b) => (globalUsage.get(a) || 0) - (globalUsage.get(b) || 0));
  const selected = available[0] || normalized.sort((a, b) => (globalUsage.get(a) || 0) - (globalUsage.get(b) || 0))[0];
  globalUsage.set(selected, (globalUsage.get(selected) || 0) + 1);
  return selected;
};

const headingForSection = ({ body, index, used }) => {
  const text = strip(body);
  let candidates = null;
  for (const [pattern, options] of rules) {
    if (pattern.test(text)) {
      candidates = options;
      break;
    }
  }
  if (!candidates) candidates = fallbackByIndex;

  let heading = chooseHeading(candidates, used);
  if (!heading || used.has(heading)) heading = fallbackByIndex[index % fallbackByIndex.length];
  used.add(heading);
  return heading;
};

for (const post of posts) {
  let sectionIndex = 0;
  const used = new Set();
  post.content = post.content.replace(/<h2>(.*?)<\/h2>([\s\S]*?)(?=<h2>|$)/g, (match, rawHeading, body) => {
    const oldHeading = strip(rawHeading);
    if (oldHeading === '常見問題') return match;
    const nextHeading = headingForSection({ body, index: sectionIndex, used });
    sectionIndex += 1;
    return `<h2>${nextHeading}</h2>${body}`;
  });
}

const nextSource = `${source.slice(0, start + prefix.length)}${JSON.stringify(posts, null, 2)}${source.slice(end + 2)}`;
fs.writeFileSync(dataPath, nextSource);

const repeated = new Map();
for (const post of posts) {
  const headings = [...post.content.matchAll(/<h2>(.*?)<\/h2>/g)]
    .map((match) => strip(match[1]))
    .filter((heading) => heading && heading !== '常見問題');
  for (const heading of headings) repeated.set(heading, (repeated.get(heading) || 0) + 1);
}

const top = [...repeated.entries()]
  .filter(([, count]) => count >= 5)
  .sort((a, b) => b[1] - a[1]);

console.log(`Contextual headings updated for ${posts.length} articles.`);
console.log(top.length ? top.slice(0, 25) : 'No non-FAQ h2 appears 5+ times.');
