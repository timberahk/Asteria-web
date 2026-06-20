import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const articlesFile = path.join(repoRoot, 'lib', 'articlesData.ts');
const source = fs.readFileSync(articlesFile, 'utf8');

function findPostsArrayBounds(text) {
  const marker = 'export const teachingPosts';
  const startMarker = text.indexOf(marker);
  if (startMarker === -1) throw new Error('Cannot find teachingPosts export.');
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

const [arrayStart, arrayEnd] = findPostsArrayBounds(source);
const posts = Function(`"use strict"; return (${source.slice(arrayStart, arrayEnd)});`)();

const replacements = {
  148: {
    summary: '分手後再和前任發生關係，最危險不是身體親密本身，而是會令界線、期待和復合判斷全部混亂。復合前要先看清對方是否真的想修補關係，而不是只在寂寞或習慣時回來靠近你。',
    content: `<p>分手後仍和前任發生關係，很多人一開始會覺得只是一次心軟、一次懷念，甚至覺得這代表對方還有感覺。但真正麻煩的地方，是身體靠近會令你更難分清：他是想復合，還是只是想保留熟悉的親密。</p>
<h2>身體親密會放大復合幻想</h2>
<p>分手後你本來已經很容易掛住對方，如果再發生關係，大腦會重新連結以前的甜蜜、依賴和安全感。你會更容易把一刻溫柔解讀成「我們還有機會」。</p>
<p>但親密感不等於承諾。對方願意靠近你的身體，不代表他願意面對分手原因、修補問題，或者重新承擔一段關係。</p>
<h2>最怕變成沒有身份的伴侶</h2>
<p>分手後仍保持親密，很容易令你停留在一個尷尬位置：名義上已經分開，但情緒和身體上仍像伴侶。你會繼續期待、照顧、等待，但對方未必需要給你任何交代。</p>
<p>這種狀態最消耗，因為你不是完全失去，也不是正式擁有。你越想靠親密留住對方，越容易把自己的界線交出去。</p>
<h2>復合要看問題有沒有被處理</h2>
<p>如果你們分手是因為冷淡、欺騙、價值觀不合或長期衝突，那一次親密不會自動解決問題。真正的復合要看對方是否願意談清楚原因，承認責任，並提出之後怎樣相處。</p>
<p>如果對方只在寂寞時找你，事後又回到模糊、逃避和不交代，那這不是復合前奏，而是把你困在更難離開的位置。</p>
<h2>你可以先訂清楚界線</h2>
<p>如果你心裡其實想復合，可以先不要用身體親密去換答案。你可以清楚講：「如果我們要重新靠近，我想先談清楚關係方向，而不是只維持曖昧親密。」</p>
<p>界線不是懲罰對方，而是保護你自己不要在最脆弱的時候，又跌回一段沒有承諾的互動裡。</p>
<h2>真正值得回頭的人，會願意先修補</h2>
<p>一個真的想復合的人，不會只想要親密和陪伴，卻避開責任。他會願意回到問題本身，聽你受傷的位置，也願意用行動令你重新安心。</p>
<p>所以分手後是否要再靠近，不應該只問「我仲愛唔愛佢」，而要問「這次靠近會令關係更清楚，還是令我更混亂」。</p>
<h2>常見問題</h2>
<h3>分手後和前任發生關係，是否代表仍有機會復合？</h3>
<p>不一定。它可能代表仍有吸引和習慣，但復合要看對方是否願意處理分手原因、給出關係方向和實際改變。</p>
<h3>如果已經發生了，應該點做？</h3>
<p>先不要責怪自己，但要盡快把界線講清楚。你可以問對方對關係有甚麼打算，再看他是否願意正面回應，而不是繼續模糊。</p>
<h3>Asteria 可以點樣幫我處理這種前任關係？</h3>
<p>我哋可以幫你拆清楚對方是想復合、留後路，還是只想維持親密；再整理你下一步應該靠近、設界線，還是先抽離。</p>`
  },
  149: {
    content: `<p>分手之所以痛，不只是因為少了一個人，而是你的生活節奏、期待、身份感和安全感突然被抽走。你可能明知關係有問題，仍然會掛住對方，甚至懷疑自己是不是太脆弱；但其實這種痛感很真實，也需要時間修復。</p>
<h2>分手痛感像一種戒斷反應</h2>
<p>拍拖時，大腦會習慣對方的訊息、陪伴、身體接觸和日常存在。分手後這些刺激突然消失，身體和情緒會出現落差，所以你會反覆想看對方近況、翻舊對話，甚至很想立刻找他。</p>
<p>這不代表你一定要回頭，而是你的大腦還在適應失去熟悉連結。先理解這一點，你就不會因為自己痛而責怪自己。</p>
<h2>你痛的可能是失去，也可能是不甘心</h2>
<p>有些痛來自愛，有些痛來自不甘心：不甘心自己付出那麼多、不甘心對方說走就走、不甘心沒有一個清楚答案。兩種痛都會令人想追問，但處理方法不同。</p>
<p>如果是失去，需要時間哀悼；如果是不甘心，需要整理事件和界線。分清痛的來源，才不會把所有情緒都變成「我要不要復合」。</p>
<h2>不要用反覆確認延長傷口</h2>
<p>分手初期最容易做的事，是不停看對方有沒有上線、追蹤他社交平台、重讀舊訊息。這些動作短暫好像有安全感，但其實會一次次把傷口打開。</p>
<p>你不需要一下子完全放下，但可以先減少觸發源，例如暫時不翻舊相、不反覆問共同朋友、不在深夜傳訊息。情緒要慢慢退潮，才有空間修復。</p>
<h2>情感修復不是逼自己沒事</h2>
<p>真正的修復，不是叫自己不要想，也不是用新對象立刻填補空位。你可以允許自己難過，同時建立一點日常秩序：吃飯、睡覺、工作、見朋友，先把生活穩住。</p>
<p>當生活慢慢有支撐，你就會比較能分清：我是真的想復合，還是只是受不了空洞感。這個分別很重要，因為前者需要判斷關係，後者需要照顧自己。</p>
<h2>走過修復期，要把注意力帶回自己</h2>
<p>分手後最難的，是你的注意力仍然全部在對方身上：他怎樣想、會不會後悔、是否有新對象。但你越把自己交給對方反應，越難真正復原。</p>
<p>可以由很小的事開始，把注意力收回來：整理房間、恢復運動、寫低每天情緒、找人陪你講一次完整故事。你不是要即刻變好，而是每天讓自己少一點被分手拉走。</p>
<h2>常見問題</h2>
<h3>分手後一直很痛，是不是代表我還很愛他？</h3>
<p>可能仍然有愛，也可能是依賴、習慣、不甘心和失落混在一起。痛感本身不能直接等於適合復合，需要再看分手原因和雙方是否有修補能力。</p>
<h3>走過情感修復期，第一步應該做咩？</h3>
<p>第一步不是逼自己放下，而是減少反覆刺激傷口的行為，先穩住生活節奏，再慢慢整理你真正失去的是甚麼。</p>
<h3>Asteria 可以點樣陪我處理分手痛感？</h3>
<p>我哋可以陪你整理分手時間線、對方狀態、你內心真正卡住的位置，再判斷下一步是修復自己、保持距離，還是評估復合可能。</p>`
  }
};

let changed = 0;
for (const post of posts) {
  if (post.id === 134) {
    post.content = post.content.replace(/<h2>原因2\s*過於缺乏安全感<\/h2>/g, '<h2>原因二：過於缺乏安全感</h2>');
    changed += 1;
  }
  if (replacements[post.id]) {
    Object.assign(post, replacements[post.id]);
    changed += 1;
  }
}

const serialized = JSON.stringify(posts, null, 2)
  .replace(/"([^"]+)":/g, '$1:')
  .replace(/\\u003c/g, '<')
  .replace(/\\u003e/g, '>')
  .replace(/\\u0026/g, '&');

fs.writeFileSync(articlesFile, `${source.slice(0, arrayStart)}${serialized}${source.slice(arrayEnd)}`);
console.log(`fixed specific residual articles: ${changed}`);
