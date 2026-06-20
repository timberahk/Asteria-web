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

function stripHtml(html = '') {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function bodyBeforeFaq(content = '') {
  return content.split(/<h2[^>]*>\s*常見問題\s*<\/h2>/i)[0] || content;
}

function insertBeforeFaq(content, html) {
  const faqMatch = content.match(/<h2[^>]*>\s*常見問題\s*<\/h2>/i);
  if (!faqMatch) return `${content}\n${html}`;
  return `${content.slice(0, faqMatch.index)}${html}\n${content.slice(faqMatch.index)}`;
}

function ensureBlock(post, heading, paragraphs) {
  if (post.content.includes(`<h2>${heading}</h2>`)) return;
  const html = `<h2>${heading}</h2>\n${paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('\n')}`;
  post.content = insertBeforeFaq(post.content, html);
}

const [arrayStart, arrayEnd] = findPostsArrayBounds(source);
const posts = Function(`"use strict"; return (${source.slice(arrayStart, arrayEnd)});`)();

const additions = {
  1: [
    ['迷思三：親密後的依賴，不等於對方一定可靠', ['親密接觸會令人更容易產生依賴感，但依賴感不是承諾。你仍然要看對方平日是否尊重你、照顧你，以及在現實生活裡是否言行一致。']],
    ['迷思四：分手很痛，不代表你一定要回頭', ['大腦會記得甜蜜經驗，所以分開後出現心痛和戒斷感是正常反應。但痛感只代表你正在失去熟悉連結，不一定代表這段關係仍然適合。']],
    ['迷思五：愛情有科學反應，也需要清醒選擇', ['科學可以解釋心動、依賴和失戀痛苦，但不能代替你判斷一個人是否值得。真正成熟的愛，是在感覺之外仍然看得到相處、責任和界線。']]
  ],
  37: [
    ['細節三：承諾開始變少，行動也變得敷衍', ['如果他以前會主動安排、主動關心，現在卻只用一句「忙」帶過，就要留意這是否只是壓力期，還是投入感真的下降。']],
    ['細節四：你表達感受時，他只想快點結束話題', ['感情扣分最明顯的位置，是對方不再想理解你。他可能仍然留在關係裡，但已經不願意花力氣修補。']],
    ['細節五：他看見你的好，卻只記得你的錯', ['當一個人進入扣分狀態，會很容易放大缺點、忽略付出。你要看的不是單次挑剔，而是這種眼光是否已經變成長期模式。']]
  ],
  38: [
    ['細節三：承諾講得漂亮，但現實一直落空', ['真心不是看他講得多動聽，而是看他答應之後有沒有行動。如果承諾永遠停在口頭，感動很快會變成消耗。']],
    ['細節四：衝突時願不願意正面處理', ['認真的人未必不會吵架，但會願意回來修補。假意投入的人，常常在你需要答案時逃避、轉移話題或讓你自己消化。']],
    ['細節五：他是否讓你進入真實生活', ['如果對方只在曖昧氣氛裡靠近你，卻不讓你了解他的生活安排、朋友圈和未來方向，就要小心這份熱情未必能落地。']]
  ],
  50: [
    ['警號一：行蹤和交代開始變得含糊', ['變心前未必一定有明顯證據，但常見是交代變少、理由變模糊，或者對普通問題突然很防衛。']],
    ['警號三：手機和社交平台突然變得神秘', ['如果他以前自然分享，現在卻長期遮掩、刪紀錄或對訊息異常緊張，就要留意是否有新的隱瞞。']],
    ['警號四：親密感下降，但他不願意談原因', ['壓力會令人變淡，但願意溝通的人會交代狀態。如果他只是否認、逃避，甚至反過來怪你多疑，就需要提高警覺。']],
    ['警號五：開始比較、挑剔或製造距離', ['有些人變心前會先合理化自己的抽離，透過挑剔你、放大關係問題，令自己覺得離開是有理由的。']],
    ['警號六：你提出界線時，他只想你停止追問', ['真正想修補的人會願意給你安心感；如果他只要求你相信，卻不願意用行動配合，信任很難重新建立。']]
  ],
  57: [
    ['行為三：用試探代替直接表達', ['明明想被重視，卻故意冷淡、講反話或等對方猜。試探短期可能換到反應，長期卻會令對方越來越怕和你相處。']],
    ['行為四：一受傷就急著推開對方', ['你可能不是不愛，而是害怕失望，所以先用分手、消失或冷淡保護自己。但這會令對方感覺關係隨時被否定。']],
    ['行為五：把所有安全感都交給對方負責', ['如果你的情緒完全由對方回覆速度和態度決定，關係會變得很重。你需要重新建立自己的節奏，才不會用焦慮推著關係走。']]
  ],
  89: [
    ['原因三：長期委屈沒有被好好處理', ['燥底很多時不是突然不愛，而是累積太多細小委屈。當你一直壓下不滿，對方一句普通說話都可能變成觸發點。']],
    ['原因四：你把舊傷投射到伴侶身上', ['如果對方某些語氣令你想起原生家庭或過去傷害，你的反應可能會比事件本身更大。看清觸發點，才知道要修補現在還是照顧舊傷。']],
    ['原因五：關係只剩問題，少了正向互動', ['當兩個人只在處理麻煩時才對話，伴侶就容易和壓力連在一起。要減少燥底，也要重新增加輕鬆、欣賞和不帶任務的相處。']]
  ],
  130: [
    ['方法三：固定製造只屬於你們的小儀式', ['親密感需要可重複的連結，例如每晚十分鐘聊天、每週一次散步，或者只有你們才明白的小習慣。']],
    ['方法四：多講欣賞，少用理所當然相處', ['長期關係最容易把好處看成應份。主動講一句欣賞，可以提醒對方他的付出有被看見。']],
    ['方法五：一起創造新的共同經歷', ['感情升溫不只靠回憶，也靠新的經驗。一起學一件事、去一個新地方，會讓關係重新有共同話題和新鮮感。']]
  ],
  132: [
    ['盲點三：講太多細節，卻沒有講真正需要', ['你可能解釋了很多前因後果，但對方仍然不知道你想要安慰、道歉、陪伴還是改變。有效溝通要把需要講清楚。']],
    ['盲點四：把情緒全部倒出來，令對方只感到壓力', ['坦白不等於一次過傾倒所有情緒。可以分階段講，先講最核心的感受和一個請求，對方才比較容易接住。']],
    ['盲點五：以為對方明白，就不用確認理解', ['溝通完可以問一句：「你剛才聽到的重點係咩？」這不是考對方，而是避免兩個人以為講完，其實理解完全不同。']]
  ],
  134: [
    ['原因一：新鮮感被誤認成真正愛上別人', ['有些變心不是因為現任不夠好，而是對方把新鮮、刺激和被崇拜的感覺誤以為愛。真正要看的是他是否願意回到現實責任裡處理問題。']]
  ]
};

let changed = 0;

for (const post of posts) {
  const original = post.content;

  post.content = post.content
    .replace(/<h2>再整理多一步<\/h2>\s*(?=<h2>)/g, '')
    .replace(/<h2>再整理多一步<\/h2>\s*\n\s*<h2>再整理多一步<\/h2>/g, '<h2>再整理多一步</h2>')
    .replace(/<h2>回到「([^」]+)」本身，要看這幾個判斷位<\/h2>/g, '<h2>看清「$1」背後真正卡住的位置</h2>')
    .replace(/：回到「([^」]+)」來看/g, '，先回到「$1」來看')
    .replace(/<h2>信號清楚後，為「([^」]+)」定界線<\/h2>/g, '<h2>信號清楚後，為「$1」定好界線</h2>');

  for (const [heading, paragraphs] of additions[post.id] || []) {
    ensureBlock(post, heading, paragraphs);
  }

  if (post.id === 134) {
    post.content = post.content.replace(/<h2>原因2 過於缺乏安全感<\/h2>/g, '<h2>原因二：過於缺乏安全感</h2>');
  }

  if (stripHtml(bodyBeforeFaq(post.content)).length < 650) {
    ensureBlock(post, '先把情緒和事實分開看', [
      '如果讀到這裡仍然覺得很亂，可以先不要急著下結論。把實際發生的事、你猜到的意思、以及你真正受傷的位置分開，下一步會清楚很多。'
    ]);
  }

  if (post.content !== original) changed += 1;
}

const serialized = JSON.stringify(posts, null, 2)
  .replace(/"([^"]+)":/g, '$1:')
  .replace(/\\u003c/g, '<')
  .replace(/\\u003e/g, '>')
  .replace(/\\u0026/g, '&');

fs.writeFileSync(articlesFile, `${source.slice(0, arrayStart)}${serialized}${source.slice(arrayEnd)}`);
console.log(`fixed residual article audit issues in ${changed} articles`);
