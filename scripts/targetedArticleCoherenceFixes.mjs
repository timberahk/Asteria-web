import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "lib", "articlesData.ts");

function extractPosts(source) {
  const marker = "export const teachingPosts";
  const startMarker = source.indexOf(marker);
  if (startMarker === -1) throw new Error("Cannot find teachingPosts export.");
  const assignment = source.indexOf("=", startMarker);
  const arrayStart = source.indexOf("[", assignment);
  let depth = 0;
  let inString = false;
  let quote = "";
  let escaped = false;
  for (let i = arrayStart; i < source.length; i += 1) {
    const char = source[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        inString = false;
      }
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      inString = true;
      quote = char;
      continue;
    }
    if (char === "[") depth += 1;
    if (char === "]") depth -= 1;
    if (depth === 0) {
      return Function(`"use strict"; return (${source.slice(arrayStart, i + 1)});`)();
    }
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
const byId = new Map(posts.map((post) => [post.id, post]));

function replaceBlock(post, startHeading, endHeading, replacement) {
  const start = post.content.indexOf(startHeading);
  if (start === -1) return false;
  const end = post.content.indexOf(endHeading, start + startHeading.length);
  if (end === -1) return false;
  post.content = `${post.content.slice(0, start)}${replacement}${post.content.slice(end)}`;
  return true;
}

function replaceFirst(post, search, replacement) {
  if (!post.content.includes(search)) return false;
  post.content = post.content.replace(search, replacement);
  return true;
}

let changed = 0;

const p16 = byId.get(16);
if (p16) {
  if (replaceBlock(
    p16,
    "<h2>先穩住情緒，再決定要怎樣靠近</h2>",
    "<h2>真正要調整的，是「另一半受不了你的情緒」背後的說話方式</h2>",
    `<h2>真正的支援，不只是安慰，而是減輕對方負擔</h2>
<p>喺關係入面，支援感唔係代表你要對方無限量接住你所有情緒，也唔係你一直猜對方想要咩。更穩定的做法，是先問清楚：對方現在需要安慰、空間、實際幫忙，還是只想有人靜靜聽。</p>
<p>如果對方返工太忙、精神已經很繃緊，你可以先處理一件具體小事，例如分擔家務、準備膳食、安排時間，或者把自己的情緒先寫低再溝通。這些行動會比一味要求對方「理解我」更容易建立安全感。</p>
`
  )) changed += 1;
  if (replaceFirst(
    p16,
    `<h2>真正要調整的，是「另一半受不了你的情緒」背後的說話方式</h2>
<p>遇到「另一半受不了你的情緒」時，先不要急住證明自己有道理。你可以先拆清楚：你想對方明白的是感受、要求，還是底線。三樣混在一起講，對方多數只會聽到壓力。</p>
<p>比較穩陣的做法，是先用一兩句講清事件，再講自己的感受，最後只提出一個可以做到的小改變。對話變短、變清楚，關係才有機會慢慢鬆返。</p>`,
    `<h2>情緒修復要由「你哄我」變成「我們一起穩住」</h2>
<p>如果你每次不安都只想對方即時安撫，對方很快會覺得自己變成照顧者。更健康的做法，是先承認自己的情緒，再講清楚你需要的是陪伴、空間、實際幫忙，還是只是想被聽見。</p>
<p>真正的支援不是互相消耗，而是兩個人都知道自己可以怎樣出力。當你能把情緒和要求分開，對方比較容易靠近，你亦不會因為一次回應不夠好就全盤崩潰。</p>`
  )) changed += 1;
}

const p24 = byId.get(24);
if (p24) {
  if (replaceFirst(p24, "<h2>下一步：先保護自己，再判斷能否修補</h2>", "<h2>先停止替對方找藉口</h2>")) changed += 1;
  if (replaceFirst(p24, "<h2>先保護自己，再判斷能否修補</h2>", "<h2>不要把包容變成縱容</h2>")) changed += 1;
}

const p99 = byId.get(99);
if (p99) {
  if (replaceFirst(p99, "<h2>把重點收窄成對方聽得入耳的一句</h2>", "<h2>抱怨要講事件，不要攻擊人格</h2>")) changed += 1;
}

const p105 = byId.get(105);
if (p105) {
  if (replaceBlock(
    p105,
    "<h2>處理「朋友叫對方分手點算」前，先看對方仲有沒有回應窗口</h2>",
    "<h2>常見問題</h2>",
    `<h2>先處理伴侶立場，再處理朋友聲音</h2>
<p>朋友的意見只是一層外在壓力，真正要確認的是伴侶自己點諗。你可以問：「你朋友咁講，有冇講中你本身擔心的位置？」這樣比直接反駁朋友更容易聽到對方真心話。</p>
<p>如果對方其實仍想維持關係，就要一起建立界線，讓外界聲音不再每次都主導你們的決定；如果對方本身已經動搖，重點就要回到你們之間真正未解決的問題。</p>
`
  )) changed += 1;
}

const p127 = byId.get(127);
if (p127) {
  if (replaceFirst(p127, "<h2>但要記住</h2>", "<h2>基本禮貌只是合格，不是加分位</h2>")) changed += 1;
  if (replaceFirst(p127, "<p>二招：多啲配合、多啲尊重 ", "<p>")) changed += 1;
}

fs.writeFileSync(file, `${typeBlock}export const teachingPosts: TeachingPost[] = ${JSON.stringify(posts, null, 2)};\n`);
console.log(`targeted coherence fixes changed ${changed} sections`);
