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
    .replace(/[「」『』]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const cleanTitle = (value = '') =>
  strip(value)
    .replace(/[？?！!：:，,。；;、]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const trimHeading = (value) => {
  let text = cleanTitle(value)
    .replace(/^(如果|當你|當|有時|其實|很多時候|好多時候|真正|與其|不要|不是|可以|先|要|但|而是|而唔係|同時)/, '')
    .replace(/^(你|對方|關係|感情)(會|會否|是否|是不是|係咪)?/, '$1')
    .replace(/\bAsteria\b/gi, '')
    .replace(/\bWhatsApp\b/gi, '訊息')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length > 18) {
    const clauses = text.split(/[，,、：:]/).map((part) => part.trim()).filter(Boolean);
    text = clauses.find((part) => part.length >= 6 && part.length <= 18) || clauses[0] || text;
  }
  if (text.length > 18) text = text.slice(0, 18);
  if (text.length < 5) text = value.slice(0, 12);
  return text;
};

const topicFromTitle = (title = '') => {
  const readable = strip(title)
    .replace(/^【.*?】/, '')
    .replace(/\bAI 摘要.*$/i, '')
    .trim();

  const parts = readable
    .split(/[？?！!：:]/)
    .map((part) => part.trim())
    .filter(Boolean);
  let topic = parts.length > 1 ? parts[parts.length - 1] : parts[0] || readable;
  topic = topic
    .replace(/[「」『』]/g, '')
    .replace(/^\d+\s*個?/, '')
    .replace(/^(為什麼|點解|如何|怎樣|怎麼|咩係|什麼是)/, '')
    .replace(/^(教你|拆解|避免|小心|真正|原來|讓你|令你|別再|不要再)/, '')
    .replace(/^\d+\s*個?/, '')
    .replace(/常見的?/, '常見')
    .replace(/攻略$/, '')
    .replace(/方法$/, '')
    .replace(/原因$/, '原因')
    .replace(/[，,。；;、]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (topic.length > 14) {
    const clauses = topic.split(/[，,、與和同及\s]/).map((part) => part.trim()).filter(Boolean);
    topic = clauses.find((part) => part.length >= 4 && part.length <= 14) || topic.slice(0, 14);
  }

  return topic || cleanTitle(readable).slice(0, 12) || '這段關係';
};

const headingSetForPost = (post) => {
  const topic = topicFromTitle(post.title);
  const shortTopic = topic.length > 10 ? topic.slice(0, 10) : topic;
  const category = post.category || '感情';
  const templates = [
    `先分清「${topic}」的真正卡位`,
    `點解「${shortTopic}」會令你越處理越攰`,
    `處理「${shortTopic}」時最易踩中的地雷`,
    `把焦點放回「${shortTopic}」的下一句`,
    `用行動判斷「${shortTopic}」是否有轉機`,
    `讓「${shortTopic}」不再拖住整段關係`,
    `用${category}角度重新整理「${shortTopic}」`
  ];

  return templates.map((heading) => heading.replace(/\s+/g, ' ').trim());
};

const rewriteContent = (post) => {
  let sectionIndex = 0;
  const used = new Set();
  const headings = headingSetForPost(post);
  return post.content.replace(/<h2>(.*?)<\/h2>([\s\S]*?)(?=<h2>|$)/g, (match, rawHeading, body) => {
    const oldHeading = strip(rawHeading);
    if (oldHeading === '常見問題') return match;
    const nextHeading = headings[sectionIndex] || `整理「${topicFromTitle(post.title)}」的下一步`;
    used.add(nextHeading);
    sectionIndex += 1;
    return `<h2>${nextHeading}</h2>${body}`;
  });
};

for (const post of posts) {
  post.content = rewriteContent(post);
}

const nextSource = `${source.slice(0, start + prefix.length)}${JSON.stringify(posts, null, 2)}${source.slice(end + 2)}`;
fs.writeFileSync(dataPath, nextSource);

const repeated = new Map();
for (const post of posts) {
  const headings = [...post.content.matchAll(/<h2>(.*?)<\/h2>/g)].map((match) => strip(match[1]));
  for (const heading of headings) repeated.set(heading, (repeated.get(heading) || 0) + 1);
}

const top = [...repeated.entries()]
  .filter(([heading, count]) => heading !== '常見問題' && count >= 5)
  .sort((a, b) => b[1] - a[1]);

console.log(`Rewrote headings for ${posts.length} articles.`);
console.log(top.length ? top.slice(0, 20) : 'No non-FAQ h2 appears 5+ times.');
