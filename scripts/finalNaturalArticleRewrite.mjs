import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(__dirname, '../lib/articlesData.ts');
const source = fs.readFileSync(dataPath, 'utf8');
const match = source.match(/export const teachingPosts: TeachingPost\[\] = ([\s\S]*);\s*$/);

if (!match) {
  throw new Error('Cannot find teachingPosts array.');
}

const posts = Function(`return ${match[1]}`)();

const bannedFragments = [
  '如果還想修復關係，你可以先這樣做',
  '先守住不可退讓的位置',
  '記錄模式，而不是只靠當下感覺',
  '重點1',
  '重點2',
  '重點3',
  '重點 1',
  '重點 2',
  '重點 3',
  '可以點做',
  '先讓對方聽得入，而不是先講贏',
  '把責備改成具體感受',
  '一次只處理一個最痛的位置',
  '小承諾比大改造更有效',
  '分清不懂表達和不想改',
];

const categoryConfig = [
  {
    test: (post) => /第三者|新歡|前任|介入|對象|桃花/.test(`${post.title}${post.category}${post.tags.join('')}`),
    intent: '第三者、新歡或前任介入',
    keywords: ['第三者', '新歡', '前任', '感情占卜', '關係修補'],
    stance: '先分清對方係真心投入新關係，還是用新刺激逃避原本問題。',
    cta: '如果牽涉第三者、新歡或前任，最忌只靠情緒追問；可以 WhatsApp 我哋睇清對方心態同你下一步位置。',
    headings: [
      ['先判斷新對象係「選擇」定「逃避」', '留意對方係咪穩定投入新關係，定只係突然搵人填補空窗。前者要保留界線，後者就要睇佢對你仲有冇情緒牽連。'],
      ['唔好用比較逼自己輸一次', '你越急住問自己邊度輸俾人，越容易失去節奏。真正要睇嘅係你同對方之間仲有冇未處理嘅情感、責任同習慣。'],
      ['訊息要留出口，唔好變成審問', '如果一開口就追問「你係咪鍾意佢」，對方多數只會防守。可以先用短句確認界線，再觀察佢願唔願意交代。'],
      ['適合配合占卜睇清對方真實狀態', '第三者局面好多時表面好亂，塔羅可以先幫你拆開對方心態、新關係穩定度同你應該進攻定退守。'],
    ],
  },
  {
    test: (post) => /分手|復合|挽回|斷聯|回頭|前任|失戀|放低/.test(`${post.title}${post.category}${post.tags.join('')}`),
    intent: '分手、復合、挽回或斷聯',
    keywords: ['復合', '挽回', '分手後點算', '斷聯', '失戀'],
    stance: '先睇對方係冷靜期、逃避期，還是真正切斷關係。',
    cta: '如果你正卡在分手、斷聯或復合黃金期，可以 WhatsApp 我哋睇訊息同時間點，避免越追越遠。',
    headings: [
      ['先分清冷靜期同真正切斷', '少覆、沉默或者暫時避開，不一定等於關係完結。重點係對方有冇保留聯絡窗口，以及情緒降溫後會唔會再回應。'],
      ['挽回唔係不停證明你有幾愛', '對方離開時，最容易令人想長篇解釋。但太多情緒會令對方更有壓力，反而要用穩定、短而清楚嘅方式保留位置。'],
      ['復合之前要知道問題有冇被處理', '如果只係重新聯絡，但原本嘅安全感、信任或溝通模式無變，復合後都好易重複同一個循環。'],
      ['用時間線睇清楚下一步', '把分手前後嘅訊息、見面、冷淡轉折整理出嚟，會更容易判斷應該主動、等待、破冰定保持距離。'],
    ],
  },
  {
    test: (post) => /冷淡|少覆|訊息|message|已讀|不讀|失聯|消失|斷聯/.test(`${post.title}${post.category}${post.tags.join('')}`),
    intent: '訊息變少、冷淡或忽然失聯',
    keywords: ['少覆 message', '冷淡點算', '斷聯', '感情訊息', '相處教學'],
    stance: '先睇對方冷淡係生活壓力、情緒逃避，還是關係熱度下降。',
    cta: '如果你唔知訊息應唔應該覆、點覆、幾時覆，可以 WhatsApp 我哋逐句睇，幫你保留吸引力同界線。',
    headings: [
      ['少覆未必等於冇感覺，但一定係訊號', '有些人忙起來會縮回自己世界，有些人則係用冷淡拉開距離。你要睇嘅唔只係回覆速度，而係態度有冇持續下降。'],
      ['唔好用長訊息追答案', '越焦急越容易一次過丟出好多問題，對方就更難接。訊息要短、穩、留有空間，先有機會令對方回到互動。'],
      ['觀察佢有冇主動補償', '真正忙的人，通常事後會解釋或者補回互動；刻意疏離的人，會連補償都沒有。呢個分別比「幾耐先覆」更重要。'],
      ['回覆策略要跟返關係階段', '曖昧、拍拖、分手後、復聯期，適合用嘅語氣都唔同。照搬一句萬能回覆，好容易用錯力。'],
    ],
  },
  {
    test: (post) => /儀式|白魔法|能量|桃花|開路|斬斷|清理|塔羅|占卜|牌/.test(`${post.title}${post.category}${post.tags.join('')}`),
    intent: '感情占卜、塔羅或愛情儀式方向',
    keywords: ['感情占卜', '塔羅占卜', '愛情儀式', '白魔法', '復合儀式'],
    stance: '先用占卜拆清楚局面，再決定要調整溝通、能量、復聯還是關係阻礙。',
    cta: '如果你想知道自己適合塔羅分析、感情儀式定先做關係整理，可以 WhatsApp 我哋做免費初步評估。',
    headings: [
      ['占卜先幫你分清方向', '當你只憑感覺估對方，很容易忽冷忽熱。塔羅可以先睇對方心態、阻礙位置同短期走勢，令你唔使亂撞。'],
      ['儀式唔係代替相處，而係配合局面', '愛情儀式通常係輔助能量同方向，例如復聯、清理負面、推動關係或穩定情緒，但日常互動仍然要配合。'],
      ['唔同問題要用唔同方法', '冷淡、第三者、斷聯、曖昧卡住，背後原因未必一樣。先拆問題，再選塔羅、儀式或相處教學，先不會做錯方向。'],
      ['適合先做免費初步評估', '你可以簡單講低關係階段、對方最近反應同你想達成嘅方向，我哋再判斷應該先占卜定直接睇服務配搭。'],
    ],
  },
  {
    test: (post) => /情緒|焦慮|安全感|放低|自卑|內耗|失戀|心動|依附/.test(`${post.title}${post.category}${post.tags.join('')}`),
    intent: '失戀、焦慮、安全感或情緒內耗',
    keywords: ['失戀', '安全感', '情緒支援', '愛情焦慮', '放低'],
    stance: '先把情緒同事實分開，否則你會用最不安的一刻去判斷整段關係。',
    cta: '如果你正處於失戀、焦慮或情緒內耗，可以 WhatsApp 我哋陪你整理事件同下一步，唔需要自己硬撐。',
    headings: [
      ['先承認你辛苦，不等於你輸', '感情入面最消耗嘅，往往不是一件事，而係每日反覆猜對方點諗。先接住自己情緒，先有力氣處理關係。'],
      ['把感覺同證據分開看', '「我覺得佢唔愛我」同「佢最近少覆訊息」係兩件事。分清楚之後，你先知道要問、要等、還是要調整界線。'],
      ['唔好在最痛嗰刻做最大決定', '情緒最高位時，好容易衝動分手、長篇質問或封鎖對方。先把反應慢半拍，通常已經避免很多後悔。'],
      ['需要有人幫你整理並不丟臉', '有時你不是不清醒，而是身在局中太痛。有人陪你逐句、逐件事拆開，會比自己反覆想更快見到方向。'],
    ],
  },
  {
    test: () => true,
    intent: '相處教學、溝通方法或關係卡住',
    keywords: ['相處教學', '感情溝通', '關係卡住', '愛情教學', '香港塔羅'],
    stance: '先睇你哋卡住嘅真正位置，再決定要溝通、觀察、修補還是停一停。',
    cta: '如果你想有人幫你 review 每一句說話、每一步互動，可以 WhatsApp 我哋睇清楚點做先唔會越做越錯。',
    headings: [
      ['先看見你哋卡住的互動模式', '很多關係不是沒有感情，而是每次一碰到同一個位就失控。先找出重複模式，先知道應該改哪一步。'],
      ['講感受之前，要先留住對話空間', '如果對方一聽就防衛，未必係你無道理，而係入口太重。把句子變短、變具體，對方先有機會接得住。'],
      ['不要把所有問題擠在同一次談話', '越想一次過講清楚，越容易令對方逃走。先處理最影響你的一件事，關係先有機會慢慢回穩。'],
      ['用日常小動作累積安全感', '修補不是一日完成，而係靠幾次穩定反應重新建立信任。知道點回、點停、點推進，會比盲目忍耐有效。'],
    ],
  },
];

const openingTemplates = [
  ({ title, cfg }) => `如果你會搜尋「${title}」，多數唔係純粹想睇一篇大道理，而係你已經在感情入面卡住：想靠近又怕逼走對方，想停低又唔甘心。呢篇會先幫你由「${cfg.intent}」拆返清楚，讓你知道下一步應該觀察、溝通、調整還是暫時收手。`,
  ({ title, cfg }) => `「${title}」背後通常有一個共同情緒：你想知道自己仲有冇機會，同時又怕做多一步就錯多一步。感情唔係單靠忍或追就會變好，先分清局面，再選擇行動，才不會把關係推得更亂。`,
  ({ title, cfg }) => `遇到「${title}」呢類情況，最難不是不知道自己在意，而是不知道應該點做先唔會失控。以下會用相處教學、感情分析同實際溝通角度，幫你把混亂拆成幾個可以處理的位置。`,
  ({ title, cfg }) => `你可能已經問過自己好多次：「係咪我太敏感？係咪對方已經唔在乎？」但「${title}」通常不能只看一個反應。要判斷關係仲有冇空間，需要同時看時間線、對方態度、你哋的互動習慣同你真正想要的結果。`,
];

const finalTemplates = [
  ({ cfg }) => `真正要做的，不是立即逼自己有答案，而是先把事件、對方反應和你自己的底線分開。當你知道問題屬於${cfg.intent}，下一步就可以更精準：該主動時主動，該觀察時觀察，該守界線時就不要再把自己推到最痛的位置。${cfg.cta}`,
  ({ cfg }) => `如果你讀到這裡仍然覺得心亂，代表你需要的未必是一句「放下」或「追回」，而是一個清楚判斷。先整理近況，再按${cfg.intent}的方向處理，通常比即時衝動發訊息更有用。${cfg.cta}`,
  ({ cfg }) => `感情最怕在情緒最高位做決定。你可以先記低最近最關鍵的訊息、見面和冷淡轉折，再回頭看對方是否仍有回應空間。${cfg.cta}`,
];

const faqQuestionTemplates = [
  ({ title, cfg }) => [`遇到「${title}」應該先主動嗎？`, `未必。先看對方是否仍保留互動窗口，以及你主動後會不會令壓力升高。如果局面屬於${cfg.intent}，主動方式和時間點都要更小心。`],
  ({ cfg }) => [`這種情況適合做感情占卜嗎？`, `適合用來拆清楚對方心態、關係阻礙和短期走勢。占卜不是叫你盲目等，而是幫你判斷下一步比較適合溝通、等待、修補還是抽離。`],
  ({ cfg }) => [`我可以直接 WhatsApp 問 Asteria 嗎？`, `可以。你可以簡單講低關係階段、最近發生的事和你最想知道的問題，我哋會先幫你做初步方向整理，再判斷需要塔羅、相處教學還是儀式方向。`],
  ({ title }) => [`文章講的情況和我有少少不同，仲有用嗎？`, `有用。文章是幫你先整理方向，但每段關係都有細節。如果你嘅情況比「${title}」更複雜，可以再提供時間線俾我哋逐步分析。`],
];

const escapeHtml = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const cleanTitle = (title) =>
  title
    .replace(/[【】\[\]]/g, '')
    .replace(/\s*AI\s*摘要.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

const pickConfig = (post) => categoryConfig.find((cfg) => cfg.test(post));

const rotate = (items, offset) => items.slice(offset).concat(items.slice(0, offset));

const buildContent = (post) => {
  const title = cleanTitle(post.title);
  const cfg = pickConfig({ ...post, title });
  const offset = post.id % cfg.headings.length;
  const headings = rotate(cfg.headings, offset);
  const opening = openingTemplates[post.id % openingTemplates.length]({ title, cfg });
  const finalText = finalTemplates[post.id % finalTemplates.length]({ cfg });
  const faqs = rotate(faqQuestionTemplates, post.id % faqQuestionTemplates.length).slice(0, 3).map((fn) => fn({ title, cfg }));

  const body = [
    `<p>${escapeHtml(opening)}</p>`,
    ...headings.map(([heading, paragraph], index) => {
      const keyword = cfg.keywords[index % cfg.keywords.length];
      const extra = index === 1
        ? `如果你本身正在搜尋「${keyword}」或者類似問題，最重要係先不要用單一訊息判斷整段關係。`
        : '';
      return `<h2>${escapeHtml(heading)}</h2>\n<p>${escapeHtml(paragraph)}${extra ? ` ${escapeHtml(extra)}` : ''}</p>`;
    }),
    `<h2>${escapeHtml(post.id % 2 === 0 ? '把下一步縮細，關係先有空間回穩' : '下一步先不要急，先看清局面')}</h2>\n<p>${escapeHtml(finalText)}</p>`,
    `<h2>常見問題</h2>`,
    ...faqs.map(([q, a]) => `<h3>${escapeHtml(q)}</h3>\n<p>${escapeHtml(a)}</p>`),
  ].join('\n');

  return body;
};

let changed = 0;

const updated = posts.map((post) => {
  const title = cleanTitle(post.title);
  const content = buildContent({ ...post, title });
  const summary = post.summary && !bannedFragments.some((fragment) => post.summary.includes(fragment))
    ? post.summary
    : `針對「${title}」整理感情狀態、對方反應同下一步方向，幫你由混亂入面先睇清楚應該點處理。`;

  changed += 1;
  return {
    ...post,
    title,
    summary,
    content,
  };
});

const serialized = JSON.stringify(updated, null, 2).replace(/"([^"]+)":/g, '$1:');
const next = source.slice(0, match.index) + `export const teachingPosts: TeachingPost[] = ${serialized};\n`;

fs.writeFileSync(dataPath, next);
console.log(`Rewrote ${changed} articles with natural, topic-specific copy.`);
