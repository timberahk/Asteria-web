import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "lib", "articlesData.ts");

function extractPosts(source) {
  const marker = "export const teachingPosts";
  const startMarker = source.indexOf(marker);
  const assignment = source.indexOf("=", startMarker);
  const arrayStart = source.indexOf("[", assignment);
  let depth = 0;
  let inString = false;
  let quote = "";
  let escaped = false;
  for (let i = arrayStart; i < source.length; i += 1) {
    const char = source[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) inString = false;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      inString = true;
      quote = char;
      continue;
    }
    if (char === "[") depth += 1;
    if (char === "]") depth -= 1;
    if (depth === 0) return Function(`"use strict"; return (${source.slice(arrayStart, i + 1)});`)();
  }
  throw new Error("Cannot parse teachingPosts array.");
}

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

const posts = extractPosts(fs.readFileSync(file, "utf8"));
const repeatedParagraph = "比較穩陣的做法，是先用一兩句講清事件，再講自己的感受，最後只提出一個可以做到的小改變。對話變短、變清楚，關係才有機會慢慢鬆返。";

function focus(post) {
  return post.title.split(/[？?：:]/)[0].replace(/[「」『』]/g, "").trim();
}

function replacementParagraph(post) {
  const f = focus(post);
  if (/情傷|情緒|患得患失|安全感|妒忌|呷醋|佔有/.test(f)) {
    return `處理「${f}」時，先不要急住把情緒丟給對方證明。你可以先寫低最刺痛的一件事，再決定要安撫自己、開口溝通，還是暫時拉開距離。情緒被整理過，關係才不會被一刻反應帶走。`;
  }
  if (/男人|離不開|重視|寵壞|心底話/.test(f)) {
    return `面對「${f}」時，重點不是猜贏對方心理，而是看他在行動上是否願意投入。你可以觀察他有沒有主動安排、回應需要、修正相處，而不是只靠一句甜言蜜語判斷。`;
  }
  if (/孤獨|親密|分享|升溫|長久|唔上心|陪你/.test(f)) {
    return `「${f}」通常要落回日常細節：有沒有主動分享、有沒有記得你的需要、有沒有願意一起安排時間。親密感不是靠一次深夜長談，而是靠很多小回應慢慢累積。`;
  }
  return `處理「${f}」時，可以先把對話收窄成一個重點：發生了什麼、你感到什麼、下次希望怎樣。當句子少一點攻擊、多一點具體，對方才比較容易聽到你的真正需要。`;
}

function crisisHeading(post) {
  const f = focus(post);
  if (/出軌|變心|交友 App|愛上別人/.test(f)) return "先分清證據、感覺和對方行動";
  if (/控制|操控|家暴|恐怖情人|報備|冷暴力/.test(f)) return "先守住界線，再判斷對方會否修正";
  if (/借錢|錢/.test(f)) return "先講清責任和底線，再談感情";
  if (/委屈|不對等|原諒|不改/.test(f)) return "先停止合理化，再看對方有沒有行動";
  if (/忽冷忽熱|不耐煩|貶低|提前責備/.test(f)) return "先看重複模式，不要只聽一刻解釋";
  return "先把危險訊號和可修補問題分開";
}

let changed = 0;
for (const post of posts) {
  if (post.content.includes(repeatedParagraph)) {
    post.content = post.content.replaceAll(repeatedParagraph, replacementParagraph(post));
    changed += 1;
  }
  if (post.content.includes("<h2>下一步：先保護自己，再判斷能否修補</h2>")) {
    post.content = post.content.replaceAll("<h2>下一步：先保護自己，再判斷能否修補</h2>", `<h2>${crisisHeading(post)}</h2>`);
    changed += 1;
  }
}

fs.writeFileSync(file, `${typeBlock}export const teachingPosts: TeachingPost[] = ${JSON.stringify(posts, null, 2)};\n`);
console.log(`polished repeated body phrases in ${changed} places`);
