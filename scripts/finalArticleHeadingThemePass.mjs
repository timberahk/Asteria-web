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

const customHeadings = new Map([
  [1, [
    "迷思一：心動不等於適合長久相處",
    "迷思二：越掛住不一定越愛",
    "迷思三：愛你也未必會自動懂你",
    "迷思四：熱戀退下來不代表不愛",
    "迷思五：感覺重要，但不能只靠感覺",
  ]],
  [2, [
    "先讓對方聽得入，而不是先講贏",
    "把責備改成具體感受",
    "一次只處理一個最痛的位置",
    "小承諾比大改造更有效",
    "分清不懂表達和不想改",
  ]],
  [17, [
    "誤區一：急著替對方解決所有問題",
    "誤區二：把付出變成隱形交易",
    "誤區三：一次過倒出太多情緒",
    "先把目標縮小到下一句說話",
    "真正有用的支持，是令互動變輕",
  ]],
  [24, [
    "不要把傷害解讀成他只是壓力大",
    "道歉不是重點，停止重犯才是",
    "理解對方，不代表要合理化一切",
    "界線要講到對方知道後果",
    "原諒之前，先確認自己是否安全",
  ]],
  [28, [
    "地雷一：用關心包裝控制",
    "地雷二：一開口就否定對方做法",
    "地雷三：把擔心變成連續追問",
    "好的關心要讓對方感到被理解",
    "批評少一點，對方才願意靠近",
  ]],
  [31, [
    "先分清一次越界還是長期操控",
    "控制型說話會削弱你的底氣",
    "不要用縮小自己換一刻平靜",
    "界線要具體，才有保護作用",
    "遇到威脅或暴力，要先保護自己",
  ]],
  [74, [
    "親密不等於對方已經準備認真",
    "先確認關係，再交出全部情緒",
    "事後行動比事前甜言蜜語更重要",
    "太快投入時，更要守住底線",
    "下一次互動才看得出真正態度",
  ]],
  [104, [
    "朋友變戀人，多數先由依賴開始",
    "曖昧訊號要看持續，不看單次甜蜜",
    "不要太快逼對方表態",
    "先增加輕鬆的二人互動",
    "保留退路，關係才不會一下斷掉",
  ]],
  [135, [
    "穩定日常，比偶爾浪漫更重要",
    "不要把對方的付出當成理所當然",
    "吵架後要有修補，而不是冷處理",
    "保留各自生活，關係才有新鮮感",
    "定期確認彼此的需要",
    "把新鮮感放回日常互動",
  ]],
  [136, [
    "先分清一次錯誤還是長期背叛",
    "真正道歉要有透明行動",
    "信任需要時間，不是逼自己放低",
    "小承諾能持續，才有修補基礎",
    "界線清楚，修補才不會變成硬吞",
  ]],
  [137, [
    "職場戀情最先要守住公私界線",
    "低調不是否認關係，而是保護兩個人",
    "吵架不要帶入工作場景",
    "同事目光會放大每個反應",
    "感情和工作都要有各自節奏",
  ]],
]);

const cleanTopic = (title) => {
  let topic = title
    .replace(/[【】\[\]]/g, "")
    .replace(/\s+/g, "")
    .replace(/^\d+個/, "")
    .split(/[：:？?！!]/)[0]
    .replace(/^(為什麼|點解|如何|怎樣|怎麼|你會不會|你是不是|你是否|你|他|對方)/, "")
    .replace(/(點算|怎麼辦|嗎|呢|了)$/g, "")
    .trim();
  if (topic.length < 4) topic = title.replace(/[：:？?！!].*$/g, "").trim();
  return topic.slice(0, 14);
};

const templatesFor = (post) => {
  const topic = cleanTopic(post.title);
  const category = post.category || "";

  if (/分手|復合|挽回|斷聯|冷戰|消失|Ghosting/.test(post.title + category)) {
    return [
      `先看「${topic}」還有沒有溝通窗口`,
      `不要用追問令「${topic}」更遠`,
      `修補「${topic}」要分階段處理`,
      `主動靠近「${topic}」時要保留界線`,
      `按「${topic}」的反應決定下一步`,
    ];
  }

  if (/第三者|新歡|前任|曖昧/.test(post.title + category)) {
    return [
      `先分清「${topic}」的真正位置`,
      `不要把「${topic}」裡的一點甜蜜當成承諾`,
      `看「${topic}」有沒有持續投入`,
      `處理「${topic}」時要保留主導權`,
      `「${topic}」下一步要看行動，不只看說話`,
    ];
  }

  if (/溝通|說|講|吵|勸|批評|挑剔|T人|讀懂|關心/.test(post.title + category)) {
    return [
      `先讓「${topic}」變得可以談`,
      `把「${topic}」裡的責備換成感受`,
      `「${topic}」一次只處理一個核心問題`,
      `用小要求代替一次過改造「${topic}」`,
      `看對方願不願意為「${topic}」一起調整`,
    ];
  }

  if (/付出|委屈|不珍惜|不對等|原諒|傷害|底線|操控|家暴/.test(post.title + category)) {
    return [
      `先看「${topic}」有沒有傷害你`,
      `不要在「${topic}」裡把忍耐誤會成成熟`,
      `「${topic}」的界線要清楚才有安全感`,
      `看對方有沒有為「${topic}」停止重犯`,
      `處理「${topic}」時保護自己比表面和平重要`,
    ];
  }

  if (/情緒|焦慮|失戀|放低|安全感|依附|壓力/.test(post.title + category)) {
    return [
      `先接住「${topic}」背後的不安`,
      `不要用「${topic}」的最壞結果嚇自己`,
      `把「${topic}」裡的情緒和事實分開看`,
      `讓自己從「${topic}」回到可控制的節奏`,
      `穩定後再決定「${topic}」下一步`,
    ];
  }

  if (/儀式|塔羅|占卜|能量|白魔法/.test(post.title + category)) {
    return [
      `先確認「${topic}」想推動的方向`,
      `儀式之前要看清關係卡位`,
      `「${topic}」也需要配合日常行動`,
      `不要把「${topic}」所有希望壓在一次結果`,
      `用「${topic}」後續反應判斷是否要調整`,
    ];
  }

  return [
    `先拆清「${topic}」真正卡位`,
    `不要急著用舊方法處理「${topic}」`,
    `把「${topic}」最影響你的感受講清楚`,
    `用小步互動觀察「${topic}」的反應`,
    `「${topic}」下一步要同底線一齊看`,
  ];
};

let changed = 0;

for (const post of teachingPosts) {
  const headings = customHeadings.get(post.id) || templatesFor(post);
  let index = 0;
  const [main, faq] = post.content.split("<h2>常見問題</h2>");
  const updatedMain = main.replace(/<h2>(.*?)<\/h2>/g, (match) => {
    const next = headings[index] || headings[headings.length - 1];
    index += 1;
    changed += 1;
    return `<h2>${next}</h2>`;
  });
  post.content = faq ? `${updatedMain}<h2>常見問題</h2>${faq}` : updatedMain;
}

const output = `${typeBlock}export const teachingPosts: TeachingPost[] = ${JSON.stringify(teachingPosts, null, 2)};\n`;
fs.writeFileSync(filePath, output);
console.log(`Updated ${changed} headings.`);
