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

const mechanicalPatterns = [
  /先唔好急住證明自己有道理/,
  /一開始似責備，後面幾合理都容易被擋住/,
  /一講就變爭執/,
  /可以將「你成日都係咁」改成/,
  /唔需要一次過拆晒所有舊帳/,
  /先處理最痛、最影響關係嗰一點/,
  /你可以講感受，但要配合一個清楚而可做到嘅要求/,
  /最後要觀察嘅唔係對方有冇即刻認輸/,
];

const cleanTitle = (title) =>
  title
    .replace(/[【】\[\]]/g, "")
    .replace(/\s+/g, " ")
    .replace(/[？?！!：:].*$/, "")
    .trim();

const paragraphFor = (post, heading, index) => {
  const title = cleanTitle(post.title);
  const h = heading || title;
  const scope = `${title} ${h} ${post.category}`;

  if (/太快發生關係|親密|酒肉|身體|曖昧升溫/.test(scope)) {
    if (/親密|發生關係|身體/.test(h)) return "親密可以令兩個人短時間內靠近，但不能直接等於承諾。真正要看的，是對方之後會不會持續關心、交代關係位置，以及願不願意為相處負責。";
    if (/確認|關係/.test(h)) return "在投入更多之前，先確認你們是否有清楚的關係共識。對方如果只享受親密、卻避開定位和責任，你就需要放慢節奏，避免把自己推到被動位置。";
    if (/行動|甜言|事後/.test(h)) return "甜言蜜語可以很好聽，但事後行動才反映真實態度。親密之後對方有沒有主動聯絡、安排見面、照顧你的感受，會比當下氣氛更重要。";
    if (/底線|投入/.test(h)) return "越是容易心軟的時候，越要記得自己的底線。你可以喜歡對方，但不需要用快速交出全部安全感，去換一段還未穩定的關係。";
    return "下一次互動可以看得更清楚：對方是只在需要時靠近，還是願意在日常裡穩定經營。把焦點放回持續行動，你就不會只被一刻親密牽住。";
  }

  if (/原諒|不改|傷害|操控|家暴|底線|PUA|冷暴力/.test(scope)) {
    if (/道歉|重犯/.test(h)) return "一句道歉只能代表當刻想安撫你，不能代表問題已經解決。你要看的是對方之後有沒有停止同一種傷害，願不願意把改變落到行動裡。";
    if (/界線|底線/.test(h)) return "界線要具體到對方聽得明，例如哪些說話不能接受、同樣情況再發生你會怎樣保護自己。模糊的底線，往往最容易被對方推開。";
    if (/安全|暴力|威脅/.test(h)) return "如果你已經害怕講真話，或擔心對方威脅、跟蹤、爆發，第一步不是修補關係，而是確保自己有人支援、有地方退開。";
    return "不要只用對方的難處去解釋所有傷害。理解可以存在，但你仍然有權判斷這段關係有沒有令你長期受壓、縮小自己。";
  }

  if (/分手|復合|挽回|斷聯|冷淡|回覆|失戀|冷戰|封鎖|unblock/i.test(scope)) {
    if (/窗口|聯絡|訊息|回覆/.test(h)) return "先看對方是否仍然留有聯絡窗口，例如會回覆、會看訊息、沒有完全封鎖你。只要窗口還在，重點就不是狂追，而是用低壓方式慢慢恢復安全感。";
    if (/冷淡|退開|距離/.test(h)) return "對方退開時，長篇解釋通常只會增加壓力。先縮短訊息、減少追問，讓互動重新變得舒服，才有機會慢慢拉近距離。";
    if (/下一步|修補|回溫/.test(h)) return "下一步可以先定一個很小的目標：正常回覆、願意聊天、願意見面。不要一開始就要求復合，因為關係要先回到可溝通的位置。";
    return "復合不是靠一刻衝動，而是看對方的防備有沒有慢慢下降。你越穩，對方越容易重新感受到這段關係仍然可以舒服相處。";
  }

  if (/溝通|說話|訊息|message|勸|講|吵|回應|相處教學/.test(scope)) {
    if (/訊息|message|回覆/.test(h)) return "訊息最重要不是寫得長，而是讓對方知道你真正想表達甚麼。先講一個重點，再留空間給對方回應，通常比一次過倒出所有情緒有效。";
    if (/勸|改|說服/.test(h)) return "想對方聽得入，不能一開始就站在審判位置。先講你觀察到的具體情況，再提出你希望下次怎樣做，對方會比較容易接收。";
    if (/情緒|感受/.test(h)) return "感受可以講，但要避免變成指控。用「我會覺得」開始，比「你成日都」更容易令對方留在對話裡，而不是即刻防衛。";
    return "每一次溝通都要先分清目的：你是想解釋、理解、提出要求，還是確認關係位置。目的清楚，說話才不會越講越亂。";
  }

  if (/第三者|新歡|前任|暗戀|桃花|單身|對象|朋友變戀人/.test(scope)) {
    if (/位置|定位|關係/.test(h)) return "先看你在對方心裡到底是朋友、曖昧對象，還是已經有更深的情緒位置。位置未清楚之前，不要太快把自己全部交出去。";
    if (/新歡|前任|第三者/.test(h)) return "遇到第三者或前任問題時，不要只看對方一句解釋。真正重要的是他有沒有劃清界線、有沒有照顧你的安全感。";
    return "曖昧最容易令人被甜蜜牽住，但你要看的是持續行動。對方是否主動安排、是否願意交代、是否把你放在特別位置，才是關鍵。";
  }

  if (/儀式|塔羅|占卜|能量|白魔法|牌/.test(scope)) {
    if (/方向|選擇|配搭/.test(h)) return "先確認你想推動的是復聯、升溫、清理阻礙，還是看清對方心態。方向不同，適合的塔羅分析、關係策略或儀式配搭也會不同。";
    if (/結果|觀察|變化/.test(h)) return "做完占卜或儀式之後，不要只看一日半日。可以觀察對方主動性、訊息頻率、態度柔軟度和相處氣氛，變化通常會逐步出現。";
    return "塔羅和儀式不是要你完全不行動，而是幫你看清方向，再配合日常相處。能量推動和現實互動要一齊走，效果才會穩。";
  }

  const fallbacks = [
    `講到「${h}」，先把焦點放回這段關係真正卡住的位置。不要只看一句說話，而要連同對方行動、相處節奏和你自己的感受一齊判斷。`,
    `「${title}」未必可以用單一答案處理。你可以先整理最近發生的事，再看哪一步最影響關係：是溝通、信任、距離，還是你自己的安全感。`,
    `如果這一點一直重複出現，就代表它不只是小插曲，而是關係裡的模式。看清模式之後，下一步才知道要修補、觀察還是拉開距離。`,
  ];
  return fallbacks[index % fallbacks.length];
};

let fixed = 0;

for (const post of teachingPosts) {
  let currentHeading = "";
  let index = 0;
  post.content = post.content.replace(/<h2>(.*?)<\/h2>|<p>(.*?)<\/p>/g, (match, heading, paragraph) => {
    if (heading) {
      currentHeading = stripHtml(heading);
      index = 0;
      return match;
    }
    const text = stripHtml(paragraph);
    if (!mechanicalPatterns.some((pattern) => pattern.test(text))) {
      index += 1;
      return match;
    }
    fixed += 1;
    const replacement = paragraphFor(post, currentHeading, index);
    index += 1;
    return `<p>${replacement}</p>`;
  });
}

const output = `${typeBlock}export const teachingPosts: TeachingPost[] = ${JSON.stringify(teachingPosts, null, 2)};\n`;
fs.writeFileSync(filePath, output);

console.log(JSON.stringify({ fixed }, null, 2));
