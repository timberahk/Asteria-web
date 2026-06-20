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

function focusFromTitle(title = '') {
  return title
    .replace(/[【】\[\]]/g, '')
    .replace(/[？?：:].*$/, '')
    .replace(/^\d+\s*[.、]\s*/, '')
    .replace(/[「」]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function insertBeforeFaq(content, block) {
  if (content.includes(block.heading)) return content;
  const faqMatch = content.match(/<h2[^>]*>\s*常見問題\s*<\/h2>/i);
  const html = `<h2>${block.heading}</h2>\n${block.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('\n')}\n`;
  if (!faqMatch) return `${content}\n${html}`;
  return `${content.slice(0, faqMatch.index)}${html}${content.slice(faqMatch.index)}`;
}

const targetBlocks = {
  10: {
    heading: '裂痕能否修復，要看有沒有一起承擔',
    paragraphs: [
      '有裂痕不代表一定無得救，但如果每次都只有你一個人低頭、解釋、補救，裂痕就會越補越大。真正的修復要看對方願不願意面對問題，而不是只等你情緒自己過去。',
      '你可以先問自己三件事：對方是否知道你受傷的位置、他有沒有為行為負責、你們之後有沒有新的相處做法。如果三樣都沒有，就不是修復，而只是你繼續忍。'
    ]
  },
  22: {
    heading: '分清不捨、習慣同真正仍然相愛',
    paragraphs: [
      '分手前最容易混淆的是：你不捨得對方，還是不習慣生活突然少了一個人。不捨可以是真感情，但習慣會令人把痛苦誤認成愛。',
      '你可以把關係拆成三欄：對方仍然給你的支持、你一直承受的消耗、如果繼續下去需要改變什麼。寫出來之後，會比單靠情緒更容易判斷。'
    ]
  },
  40: {
    heading: '冷靜有期限，冷戰是用沉默懲罰',
    paragraphs: [
      '真正的冷靜會有交代，例如「我需要一晚時間，明天再講」。冷戰則是讓你猜、讓你怕、讓你先道歉。兩者表面都像不說話，但對關係的傷害完全不同。',
      '如果你們一吵架就冷戰，可以先建立一個規則：暫停可以，但要講清楚幾時再談。這樣既保留情緒空間，也不會把對方丟進不安裡。'
    ]
  },
  47: {
    heading: '不要一有不舒服就判定關係不適合',
    paragraphs: [
      '感情不是每次不舒服都代表要分開。有時只是你們未找到新的相處方法，有時才是真的價值觀不合。太快判死刑，會令你錯過本來可以調整的關係。',
      '判斷前可以先看：問題是否重複、雙方是否願意改、改完之後有沒有變好。如果只有情緒很大但沒有具體檢查，很容易把一時低潮當成結局。'
    ]
  },
  49: {
    heading: '卸膊心理 1：把責任交給你承擔',
    paragraphs: [
      '卸膊型伴侶最明顯的特徵，是表面上好像很無辜，但生活決定、情緒處理、關係修補，最後都變成你負責。久而久之，你會由伴侶變成照顧者。',
      '面對這種模式，不能只用提醒或抱怨。你要把責任放回對方身上，例如清楚問：「這件事你打算怎樣處理？」而不是每次都自動幫他想好答案。'
    ]
  },
  56: {
    heading: '強不是問題，令對方自卑後退才是卡位',
    paragraphs: [
      '女人能力強不會自然嚇走一個成熟的人。真正會出問題的，是對方把你的能力解讀成自己不被需要，於是用冷淡、比較或挑剔保護自尊。',
      '你不需要縮小自己去配合對方，但可以調整互動方式：欣賞他的付出、保留他可以參與的位置，同時不放棄自己的光。健康關係應該是互相托住，而不是其中一方變小。'
    ]
  },
  82: {
    heading: '第 4 步：把重心放回自己身上',
    paragraphs: [
      '愛得太用力時，你會不自覺把所有情緒交給對方決定。對方一句話、一次已讀不回，都足以令你整日崩潰，這其實代表你的重心已經離開自己。',
      '第四步不是叫你冷淡，而是重新安排自己的生活、朋友、目標和情緒出口。當你不再只靠對方給安全感，關係才有機會由追逐變回平衡。'
    ]
  },
  90: {
    heading: '順其自然有時是不想承擔未來',
    paragraphs: [
      '「順其自然」可以是放鬆，也可以是逃避。分別在於對方是否仍願意為關係做安排，例如見面、溝通、處理衝突和討論未來。',
      '如果每次講到未來他都用順其自然帶過，你可以不逼婚、不逼承諾，但要問具體一點：「你覺得我們下一步可以怎樣安排？」看他是願意一起想，還是只想把責任推開。'
    ]
  },
  97: {
    heading: '一直讓步不會換來珍惜，只會訓練對方加碼',
    paragraphs: [
      '如果你每次讓步後，對方不是更體諒，而是要求更多，這代表讓步已經變成他測試你底線的方法。你越怕失去，他越不需要顧及你的感受。',
      '真正要做的不是再退一步，而是停止用委屈換和平。清楚講出你能接受和不能接受的位置，再看對方是否願意尊重，才知道這段關係是否仍值得。'
    ]
  },
  106: {
    heading: '太快親密不是原罪，沒有界線才會失衡',
    paragraphs: [
      '太快發生關係不一定令愛情失敗，真正要看的是之後雙方有沒有更靠近、有沒有尊重、有沒有繼續投入。最怕是親密發生了，但關係定位仍然模糊。',
      '你可以觀察對方之後是否仍願意約你、關心你、計劃下一次見面，而不是只在需要親密時出現。身體靠近後，情感和責任也要跟得上。'
    ]
  },
  107: {
    heading: '吵架不等於不適合，重複同一種吵法才危險',
    paragraphs: [
      '每對情侶都會吵架，問題不是有沒有衝突，而是衝突後有沒有修補。如果每次都由同一件事開始、同一句話爆炸、同一個人道歉，關係就會越吵越累。',
      '你可以先找出你們吵架的循環：誰先情緒上來、誰開始防衛、誰選擇逃避。看到循環後，才可以改其中一步，而不是每次只靠忍。'
    ]
  },
  111: {
    heading: '第 4 個行為：只剩責任感，沒有情感交流',
    paragraphs: [
      '感情變淡很多時不是突然不愛，而是日常只剩交代行程、處理問題和完成責任。沒有情感交流，對方慢慢就會覺得關係像例行公事。',
      '你可以先恢復一點小連結，例如分享今天一件真實感受、安排一次不用解決問題的見面、或者重新問對方最近壓力在哪裡。親密感要靠日常慢慢補回來。'
    ]
  },
  113: {
    heading: '甜言蜜語要配合穩定行動先可信',
    paragraphs: [
      '好聽的說話本身不是問題，問題是它有沒有被行動承托。真正重視你的人，不會只在氣氛好時講愛你，卻在需要承擔時消失。',
      '你可以看三件事：他承諾後會不會記得、你需要支持時他是否出現、衝突後他有沒有修正。說話很甜但行動很空，就要小心自己被情緒餵飽，現實卻一直落空。'
    ]
  },
  144: {
    heading: '提分手如果變成習慣，關係會失去安全感',
    paragraphs: [
      '吵架時提分手，可能只是情緒爆發，但如果反覆出現，對方會慢慢覺得這段關係隨時會被丟掉。安全感一旦被破壞，之後再多道歉都很難完全補回。',
      '下次情緒上來時，可以先用暫停代替分手，例如：「我現在太激動，半小時後再講。」這樣既保留界線，也不會用最傷人的字眼破壞關係。'
    ]
  }
};

let changed = 0;

for (const post of posts) {
  const original = post.content;
  const focus = focusFromTitle(post.title);

  post.content = post.content
    .replace(/<h2>先別急著追問答案：真正要看的，是對方為何退後<\/h2>/g, `<h2>先看清楚「${focus}」真正要處理的位置</h2>`)
    .replace(/<h2>可以先這樣整理<\/h2>/g, `<h2>把「${focus}」整理成下一步</h2>`)
    .replace(/<h2>下一步：把「第一次見家長點準備」講成可被接住的需要<\/h2>/g, '<h2>第二招：多一點配合，多一點尊重</h2>')
    .replace(/<h2>下一步：把「女人太強會嚇走對方」講成可被接住的需要<\/h2>/g, '<h2>下一步：讓對方參與，但不縮小自己</h2>')
    .replace(/<h2>下一步：把「情侶成日嗌交係不適合嗎」講成可被接住的需要<\/h2>/g, '<h2>下一步：先改其中一個吵架循環</h2>')
    .replace(/<h2>下一步：把「你以為在幫對方，其實正在增加壓力」講成可被接住的需要<\/h2>/g, '<h2>下一步：先問對方需要安慰還是方法</h2>');

  if (targetBlocks[post.id]) {
    post.content = insertBeforeFaq(post.content, targetBlocks[post.id]);
  }

  post.content = post.content
    .replace(/<h2>卸膊心理2:<\/h2>/g, '<h2>卸膊心理 2：用無辜感逃避承擔</h2>')
    .replace(/\n{4,}/g, '\n\n');

  if (post.content !== original) changed += 1;
}

const serialized = JSON.stringify(posts, null, 2)
  .replace(/"([^"]+)":/g, '$1:')
  .replace(/\\u003c/g, '<')
  .replace(/\\u003e/g, '>')
  .replace(/\\u0026/g, '&');

fs.writeFileSync(articlesFile, `${source.slice(0, arrayStart)}${serialized}${source.slice(arrayEnd)}`);
console.log(`targeted completeness repair changed ${changed} articles`);
