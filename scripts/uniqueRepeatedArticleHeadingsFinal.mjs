import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const articlesFile = path.join(repoRoot, 'lib', 'articlesData.ts');
const source = fs.readFileSync(articlesFile, 'utf8');

function findPostsArrayBounds(text) {
  const marker = 'export const teachingPosts';
  const startMarker = text.indexOf(marker);
  const assignment = text.indexOf('=', startMarker);
  const arrayStart = text.indexOf('[', assignment);
  let depth = 0;
  let inString = false;
  let quote = '';
  let escaped = false;
  for (let i = arrayStart; i < text.length; i += 1) {
    const char = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) inString = false;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      inString = true;
      quote = char;
      continue;
    }
    if (char === '[') depth += 1;
    if (char === ']') depth -= 1;
    if (depth === 0) return [arrayStart, i + 1];
  }
  throw new Error('Cannot parse teachingPosts array.');
}

function focusFromTitle(title = '') {
  return title
    .replace(/[【】\[\]]/g, '')
    .replace(/[？?：:].*$/, '')
    .replace(/^\d+\s*[.、]\s*/, '')
    .replace(/[「」]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function shortFocus(post) {
  const focus = focusFromTitle(post.title);
  return focus.length > 18 ? `${focus.slice(0, 18)}…` : focus;
}

function articleKind(post) {
  const text = `${post.title} ${post.category} ${(post.tags || []).join(' ')}`;
  if (/復合|挽回|前任|分手|斷聯|冷戰|冷淡|回頭|重新|抽離|Block|已讀不回/.test(text)) return 'reconnect';
  if (/曖昧|暗戀|桃花|單身|心動|炮友|喜歡|約會|新歡|第三者/.test(text)) return 'ambiguous';
  if (/控制|冷暴力|出軌|變心|恐怖|借錢|警號|PUA|貶低|操控|家暴|暴力|傷害|不改|原諒|斯德哥爾摩/.test(text)) return 'risk';
  if (/溝通|相處|吵架|需求|情緒|壓力|支援|報備|道歉|承諾|挑剔|勸|說話|回覆|訊息|message/.test(text)) return 'communication';
  if (/結婚|婚前|同居|家長|辦公室|長久|適合|條件|未來/.test(text)) return 'commitment';
  return 'mindset';
}

function contextualHeading(post) {
  const focus = shortFocus(post);
  const headings = {
    reconnect: `把「${focus}」拉回可行下一步`,
    ambiguous: `用行動判斷「${focus}」`,
    risk: `為「${focus}」守住底線`,
    communication: `把「${focus}」講成可被接住的話`,
    commitment: `用現實細節檢查「${focus}」`,
    mindset: `把「${focus}」從情緒拉回事實`
  };
  return headings[articleKind(post)];
}

const [arrayStart, arrayEnd] = findPostsArrayBounds(source);
const posts = Function(`"use strict"; return (${source.slice(arrayStart, arrayEnd)});`)();
let changed = 0;

for (const post of posts) {
  const original = post.content;
  const focus = shortFocus(post);
  post.content = post.content
    .replace(/<h2>再整理多一步<\/h2>/g, `<h2>${contextualHeading(post)}</h2>`)
    .replace(/<h3>Asteria 可以點樣幫你整理這類情況？<\/h3>/g, `<h3>Asteria 可以點樣幫你整理「${focus}」？</h3>`)
    .replace(/<h3>Asteria 可以點幫？<\/h3>/g, `<h3>Asteria 可以點樣陪你處理「${focus}」？</h3>`)
    .replace(/<h3>塔羅可以睇到咩？<\/h3>/g, `<h3>塔羅可以點樣睇「${focus}」？</h3>`);
  if (post.content !== original) changed += 1;
}

const serialized = JSON.stringify(posts, null, 2)
  .replace(/"([^"]+)":/g, '$1:')
  .replace(/\\u003c/g, '<')
  .replace(/\\u003e/g, '>')
  .replace(/\\u0026/g, '&');

fs.writeFileSync(articlesFile, `${source.slice(0, arrayStart)}${serialized}${source.slice(arrayEnd)}`);
console.log(`made repeated article headings unique in ${changed} articles`);
