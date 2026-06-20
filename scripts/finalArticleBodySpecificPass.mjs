import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const filePath = path.resolve("lib/articlesData.ts");
const { teachingPosts } = await import(pathToFileURL(filePath).href + `?v=${Date.now()}`);

const typeBlock = `export type TeachingPost = {
  id: number;
  title: string;
  category: string;
  color: string;
  icon: string;
  imageLabel: string;
  summary: string;
  content: string;
  sourceIg: string;
  date: string;
  tags: string[];
  coverImage: string;
  coverCredit: string;
  coverCreditUrl: string;
  coverPrompt: string;
  images: Array<{ src: string; caption: string; credit: string; creditUrl: string; prompt: string }>;
  coverCaption: string;
  inlineCaption: string;
};

`;

const stripHtml = (value) => value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

const shortTopic = (title) => {
  const clean = title
    .replace(/[【】\[\]]/g, "")
    .replace(/\s+/g, "")
    .replace(/^\d+個/, "")
    .replace(/AI摘要.*$/i, "")
    .split(/[：:？?！!]/)[0]
    .replace(/^(為什麼|點解|如何|怎樣|怎麼)/, "")
    .replace(/(點算|怎麼辦|嗎|呢|了)$/g, "")
    .trim();
  return (clean || title).slice(0, 16);
};

const kindOf = (post) => {
  const text = `${post.title} ${post.category} ${post.summary}`;
  if (/分手|復合|挽回|斷聯|冷戰|消失|回覆|覆|封鎖|unblock|Ghosting/i.test(text)) return "repair";
  if (/第三者|新歡|前任|曖昧|暗戀|桃花|單身|對象/.test(text)) return "triangle";
  if (/溝通|說|講|吵|勸|批評|挑剔|T人|讀懂|關心|回訊|message|訊息/.test(text)) return "communication";
  if (/付出|委屈|不珍惜|不對等|原諒|傷害|底線|操控|家暴|壓迫|PUA|冷暴力/.test(text)) return "boundary";
  if (/情緒|焦慮|失戀|放低|安全感|依附|壓力|自卑|內耗|心動|掛住/.test(text)) return "emotion";
  if (/儀式|塔羅|占卜|能量|白魔法|魔法|牌|復合牌陣/.test(text)) return "ritual";
  return "general";
};

const paragraphCounts = new Map();
for (const post of teachingPosts) {
  const main = post.content.split("<h2>常見問題</h2>")[0];
  for (const match of main.matchAll(/<p>(.*?)<\/p>/g)) {
    const text = stripHtml(match[1]);
    if (text.length >= 35) paragraphCounts.set(text, (paragraphCounts.get(text) || 0) + 1);
  }
}

const repeatedParagraphs = new Set(
  [...paragraphCounts.entries()]
    .filter(([, count]) => count >= 5)
    .map(([text]) => text),
);

const sentenceSets = {
  repair: [
    (topic, heading) => `講到「${heading}」，重點係先判斷對方而家仍然留低幾多互動空間。${topic}唔係靠一段長訊息即刻扭轉，而係要先降低壓力，令對方願意重新接收你。`,
    (topic, heading) => `${heading}最易出事嘅位，是你越急，對方越退。與其追問結果，不如先用短、清楚、低壓嘅方式重開連結，等關係有機會慢慢回溫。`,
    (topic, heading) => `處理${topic}時，唔好一次過要求對方解釋、承諾、見面同復合。先做到一個小目標，例如願意回覆、願意正常聊天，下一步先會有根基。`,
    (topic, heading) => `${heading}唔等於要你無限忍耐。你可以主動修補，但同時要睇對方有冇回應、有冇尊重你，而唔係一直由你單方面承受。`,
    (topic, heading) => `真正有效嘅轉機，通常係對方喺互動入面重新覺得舒服，而唔係被迫表態。當你嘅節奏穩返，${topic}先有機會由緊張變成可談。`,
  ],
  communication: [
    (topic, heading) => `${heading}時，先唔好急住證明自己有道理。對方聽得入，關鍵往往係語氣同切入點；一開始似責備，後面幾合理都容易被擋住。`,
    (topic, heading) => `如果${topic}一講就變爭執，可以將「你成日都係咁」改成某一件具體事件。越具體，對方越難逃入防衛，亦越知道要改邊一步。`,
    (topic, heading) => `${heading}唔需要一次過拆晒所有舊帳。先處理最痛、最影響關係嗰一點，談話先有焦點，對方亦比較容易真正回應。`,
    (topic, heading) => `你可以講感受，但要配合一個清楚而可做到嘅要求。譬如希望對方下次先交代一句、唔好突然消失，會比「你要改晒」更有行動力。`,
    (topic, heading) => `最後要觀察嘅唔係對方有冇即刻認輸，而係下一次同類情況有冇微調。${topic}真正改善，通常係由細位開始穩定落嚟。`,
  ],
  triangle: [
    (topic, heading) => `${heading}入面，最重要係分清楚你而家喺對方心入面係咩位置。唔好只因一兩句甜言蜜語就當成承諾，要睇持續行動同選擇。`,
    (topic, heading) => `面對${topic}，越急住迫對方表態，越容易令自己被放到被動位置。先睇對方有冇主動靠近、有冇交代、有冇願意為關係負責。`,
    (topic, heading) => `${heading}唔係叫你扮冷淡，而係要保留自己嘅價值感。你可以給機會，但唔需要用委屈自己去換對方一時靠近。`,
    (topic, heading) => `如果對方一直享受曖昧、又避開承諾，就要重新睇清楚互動模式。${topic}真正有希望，通常會慢慢變得更清晰，而唔係越來越模糊。`,
    (topic, heading) => `下一步要以行動為準。對方有冇安排見面、有冇穩定聯絡、有冇處理其他關係，會比一句「我都掛住你」更能反映真實態度。`,
  ],
  boundary: [
    (topic, heading) => `${heading}時，要先問自己：呢件事係偶發衝突，定係長期消耗你？如果你越來越唔敢講感受，關係就唔只係小問題。`,
    (topic, heading) => `${topic}最容易令人誤會為「我再忍耐多啲就會好」。但健康關係唔應該靠你不斷縮細自己去維持，界線清楚先有安全感。`,
    (topic, heading) => `你可以理解對方背景同壓力，但理解唔等於合理化傷害。${heading}要睇對方有冇停止重犯，而唔係只聽一刻道歉。`,
    (topic, heading) => `當你開始建立界線，對方可能會唔習慣，甚至反過來怪你變咗。呢個時候更要穩住，因為你守住自己，唔代表你唔愛。`,
    (topic, heading) => `如果${topic}牽涉威脅、控制或暴力，第一步永遠係保護自己同尋求可靠支援。修補關係之前，你要先確保自己安全。`,
  ],
  emotion: [
    (topic, heading) => `${heading}好多時唔係你太敏感，而係你嘅安全感被觸發。先承認自己難受，然後再分清楚眼前係事實、推測，定係過往經驗被翻起。`,
    (topic, heading) => `處理${topic}時，最怕喺情緒最高點做決定。先俾自己降溫，等身體同腦袋回到比較穩嘅狀態，先判斷對方真正意思。`,
    (topic, heading) => `${heading}唔代表要壓住情緒。你可以寫低事件、感受同想問嘅問題，先把混亂整理成清楚句子，再決定要唔要同對方講。`,
    (topic, heading) => `當你越想即刻得到答案，越容易做出令自己後悔嘅反應。${topic}需要嘅可能唔係更用力追，而係先把自己拉回生活節奏。`,
    (topic, heading) => `等情緒穩返後，你會更容易睇到：呢段關係係有得修補，定係你一直喺一個令自己不安嘅循環入面打轉。`,
  ],
  ritual: [
    (topic, heading) => `${heading}之前，要先搞清楚你真正想推動嘅方向。係復聯、升溫、清理負能量，定係想睇對方心態？方向清楚，配搭先準。`,
    (topic, heading) => `${topic}唔係叫你乜都唔做等結果。儀式或占卜可以幫你整理能量同方向，但日常互動仍然要配合合適節奏。`,
    (topic, heading) => `如果關係本身卡住，先睇卡位係冷淡、誤會、第三者、壓力，定係你哋溝通方式失衡。唔同問題，需要嘅處理方式唔同。`,
    (topic, heading) => `${heading}之後，唔好用一日半日判斷全部。留意對方態度、訊息頻率、主動性同相處氣氛，會比死盯單一反應更準。`,
    (topic, heading) => `當你唔肯定下一步，先唔好亂試。可以把近況、對話截圖同想達成嘅方向整理好，再判斷${topic}適合用邊種方式推進。`,
  ],
  general: [
    (topic, heading) => `${heading}通常唔係單一事件造成，而係一段時間累積出嚟嘅互動模式。先拆清楚真正卡位，先唔會一直用錯方法。`,
    (topic, heading) => `面對${topic}，最重要係唔好只睇對方一句說話。你要連同行動、頻率、態度同之前嘅相處脈絡一齊看，判斷先會準。`,
    (topic, heading) => `${heading}可以先由一個小步開始，唔需要即刻逼出答案。當你嘅反應穩定，對方亦比較容易露出真實態度。`,
    (topic, heading) => `如果你已經試過好多方法都無效，可能問題唔係你做得唔夠，而係方向未對。${topic}需要先整理策略，再決定要靠近、觀察定抽離。`,
    (topic, heading) => `下一步要同你嘅底線一齊看。關係可以修補，但唔應該令你一路失去自己；看清楚之後，行動先會有力量。`,
  ],
};

const introFor = (post, kind, topic) => {
  const introMap = {
    repair: `遇到「${post.title}」時，最辛苦通常係你仲想靠近，但又怕每一步都做錯。與其被焦慮推住追答案，不如先拆清楚對方目前的距離、情緒同回應空間，再決定下一步。`,
    communication: `「${post.title}」表面是說話問題，實際多數關乎安全感、語氣同彼此接收方式。講得啱不等於對方聽得入，懂得換一個入口，關係先有機會鬆動。`,
    triangle: `當關係牽涉「${topic}」，人最容易被一點甜蜜、一點冷淡牽住情緒。這篇會先幫你分清位置、投入度同對方真正選擇，避免你一直被模糊感拖住。`,
    boundary: `「${post.title}」最需要留意的，不只是對方有沒有愛你，而是這段關係有沒有令你越來越不安、委屈或失去自己。先守住界線，才有資格談修補。`,
    emotion: `面對「${post.title}」，你可能會反覆想、反覆猜，甚至一邊想放低，一邊又忍不住期待。先把情緒同事實分開看，你會更容易找到真正適合自己的下一步。`,
    ritual: `「${post.title}」不是只靠感覺亂選方向。先看清關係卡位、對方狀態和你想推動的結果，再配合塔羅、儀式或日常相處策略，效果會清晰得多。`,
    general: `遇到「${post.title}」時，先不要急著判斷是誰對誰錯。關係問題通常有表面事件，也有背後模式；看清楚模式，才知道下一步應該修補、觀察還是拉開距離。`,
  };
  return introMap[kind];
};

let replaced = 0;
let introReplaced = 0;

for (const post of teachingPosts) {
  const kind = kindOf(post);
  const topic = shortTopic(post.title);
  const sentenceSet = sentenceSets[kind];
  let currentHeading = "";
  let paragraphIndex = 0;

  const [main, faq = ""] = post.content.split("<h2>常見問題</h2>");
  const updatedMain = main.replace(/<h2>(.*?)<\/h2>|<p>(.*?)<\/p>/g, (match, heading, paragraph) => {
    if (heading) {
      currentHeading = stripHtml(heading);
      return match;
    }

    const text = stripHtml(paragraph);
    if (!repeatedParagraphs.has(text)) return match;

    if (!currentHeading && paragraphIndex === 0) {
      introReplaced += 1;
      paragraphIndex += 1;
      return `<p>${introFor(post, kind, topic)}</p>`;
    }

    const generator = sentenceSet[Math.max(0, paragraphIndex - 1) % sentenceSet.length];
    replaced += 1;
    paragraphIndex += 1;
    return `<p>${generator(topic, currentHeading || topic)}</p>`;
  });

  post.content = faq ? `${updatedMain}<h2>常見問題</h2>${faq}` : updatedMain;
}

const output = `${typeBlock}export const teachingPosts: TeachingPost[] = ${JSON.stringify(teachingPosts, null, 2)};\n`;
fs.writeFileSync(filePath, output);

console.log(JSON.stringify({
  repeatedParagraphPatterns: repeatedParagraphs.size,
  replaced,
  introReplaced,
}, null, 2));
