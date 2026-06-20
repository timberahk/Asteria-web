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
const focus = (post) => post.title.split(/[？?：:]/)[0].replace(/[「」『』]/g, "").trim();

const replacements = [
  ["我應該先處理自己，還是先處理關係？", (f) => `面對「${f}」，應該先處理自己還是關係？`],
  ["Asteria 可以點樣陪我整理？", (f) => `Asteria 可以點樣陪我整理「${f}」？`],
  ["如果對方一聽就逃避或不耐煩點算？", (f) => `處理「${f}」時，對方一聽就逃避點算？`],
  ["Asteria 的相處教學可以幫到咩？", (f) => `Asteria 的相處教學可以點樣幫到「${f}」？`],
  ["如果對方道歉了，我應該再給機會嗎？", (f) => `面對「${f}」，對方道歉後應該再給機會嗎？`],
  ["Asteria 可以點樣幫我處理關係警號？", (f) => `Asteria 可以點樣幫我判斷「${f}」？`],
  ["我應該斷聯、主動傳訊息，還是等待？", (f) => `面對「${f}」，應該斷聯、主動還是等待？`],
  ["Asteria 可以點樣幫我睇復合方向？", (f) => `Asteria 可以點樣幫我睇「${f}」的方向？`]
];

let changed = 0;
for (const post of posts) {
  const f = focus(post);
  for (const [oldQuestion, makeQuestion] of replacements) {
    const oldHeading = `<h3>${oldQuestion}</h3>`;
    if (post.content.includes(oldHeading)) {
      post.content = post.content.replaceAll(oldHeading, `<h3>${makeQuestion(f)}</h3>`);
      changed += 1;
    }
  }
}

fs.writeFileSync(file, `${typeBlock}export const teachingPosts: TeachingPost[] = ${JSON.stringify(posts, null, 2)};\n`);
console.log(`polished repeated FAQ headings in ${changed} places`);
