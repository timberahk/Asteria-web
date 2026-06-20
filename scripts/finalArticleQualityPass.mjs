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

function stripHtml(html = '') {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalize(value = '') {
  return stripHtml(value)
    .replace(/[，。！？、：；「」『』（）\[\]\s,.!?;:'"“”]/g, '')
    .toLowerCase();
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
  return focus.length > 20 ? `${focus.slice(0, 20)}…` : focus;
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

function kindIntro(post) {
  const focus = shortFocus(post);
  const byKind = {
    reconnect: `面對「${focus}」，讀者最需要的不是一句「有冇機會」，而是知道現在仍有沒有聯絡窗口、對方退後的原因，以及自己下一步會不會越做越急。先看清這三點，才不會把復合變成追逼。`,
    ambiguous: `「${focus}」最容易令人上癮，因為甜的時候很甜，冷的時候又令人不甘心。真正要看的不是當下氣氛，而是對方有沒有穩定投入、願不願意安排時間，以及是否把你放進現實生活。`,
    risk: `遇到「${focus}」，不要急著說服自己沒事。真正需要判斷的是這件事有沒有反覆發生、對方有沒有承認責任，以及你在關係中是否越來越需要委屈自己。`,
    communication: `「${focus}」通常不是單純誰對誰錯，而是表達方式令對方進入防衛。你想講的是需要，對方聽到的可能是批評；要修補，就要先把說話變成對方聽得入耳的版本。`,
    commitment: `「${focus}」牽涉的不是一刻心動，而是兩個人能不能在現實生活裡互相承托。要看長遠，就要看責任感、生活節奏、衝突後修補能力，而不是只看浪漫感覺。`,
    mindset: `「${focus}」最容易令你在腦內不停推演，越想越亂。與其急著下結論，不如先把事實、猜測和感受分開，這樣才看得清楚自己真正想要什麼。`
  };
  return byKind[articleKind(post)];
}

function observeParagraph(post) {
  const focus = shortFocus(post);
  const byKind = {
    reconnect: `你可以先把「${focus}」拆成三個訊號：對方是否仍回應、回應時是否抗拒、你放慢之後互動有沒有變舒服。這些比不停追問答案更能判斷修補窗口。`,
    ambiguous: `你可以用「${focus}」去觀察三件事：對方會否主動安排、會否把你介紹進生活圈、會否在你稍微後退時補上。曖昧要看行動，不只看氣氛。`,
    risk: `你可以把「${focus}」寫成事件表：發生了什麼、對方怎樣解釋、之後有沒有行動修正。如果每次都只是你心軟，而對方沒有變，問題就不是你不夠包容。`,
    communication: `你可以回看「${focus}」最近一次對話：第一句是否已經帶責備、你有沒有一次講太多、對方防衛後你有沒有越追越急。找到卡位，才知道句子要怎樣改。`,
    commitment: `你可以用「${focus}」檢查對方三個現實反應：願不願意商量、會不會記得承諾、遇到壓力時是一起處理還是逃避。這些比口頭承諾更可靠。`,
    mindset: `你可以先把「${focus}」分成三欄：實際發生的事、你腦中補上的意思、你身體和情緒的反應。分開之後，你會更容易知道下一步要溝通還是先穩住自己。`
  };
  return byKind[articleKind(post)];
}

function actionParagraph(post) {
  const focus = shortFocus(post);
  const byKind = {
    reconnect: `處理「${focus}」時，先選一個低壓動作：短訊息、暫停追問、或者只回應當下話題。重點不是即刻拉近，而是先令對方不再一看到你就想退。`,
    ambiguous: `處理「${focus}」時，可以主動一次，但要讓對方也付出。你可以提出清楚邀約或界線，再觀察對方會否接住，而不是你一個人把關係推完整。`,
    risk: `處理「${focus}」時，先不要用愛去合理化傷害。你可以清楚講出底線，再看對方是否用行動修正；若只得安撫沒有改變，就要優先保護自己。`,
    communication: `處理「${focus}」時，先把句子縮短。由「你永遠都係咁」改成「剛才那件事令我不安，我想下次可以提早講」，對方會更容易接收到你的需要。`,
    commitment: `處理「${focus}」時，不需要一開始逼對方交終極答案。先提出一個具體現實安排，看對方願不願意一起調整，會比空泛承諾更能反映未來。`,
    mindset: `處理「${focus}」時，先不要即時回訊息或下決定。給自己一段冷靜時間，再用最少一句說話表達需要，會比被情緒推著走更有力量。`
  };
  return byKind[articleKind(post)];
}

function ctaParagraph(post) {
  const focus = shortFocus(post);
  const byKind = {
    reconnect: `如果你不確定「${focus}」仲有沒有修補空間，可以把時間線和最近對話整理好。Asteria 會幫你拆對方心態、復合窗口和下一句怎樣講比較穩。`,
    ambiguous: `如果你不確定「${focus}」係真心定只是曖昧，可以把你們互動節奏、見面安排和對方訊息交給 Asteria 拆，先判斷應該推進還是收回。`,
    risk: `如果「${focus}」令你開始懷疑自己是否太敏感，可以把事件和對方後續反應整理好。Asteria 會幫你分清磨合、警號和需要守住的底線。`,
    communication: `如果你不知「${focus}」下一句應該點講，可以把原本想傳的訊息給 Asteria review。我哋會幫你調整語氣、次序和重點，避免越講越遠。`,
    commitment: `如果你想知道「${focus}」是否值得繼續走下去，可以把雙方承諾、現實壓力和衝突模式整理好。Asteria 會幫你看清可磨合的位置。`,
    mindset: `如果「${focus}」令你反覆內耗，可以先把最刺痛你的事件寫低。Asteria 會陪你拆情緒、需要和下一步方向，令你不用一個人亂猜。`
  };
  return byKind[articleKind(post)];
}

const repeatedNeedles = [
  '很多感情不是沒有愛，而是講出來的方式令彼此越來越防衛。你以為自己在溝通，對方卻感覺被批評；你以為自己在幫忙，對方卻感覺被控制。真正的相處教學，重點是令對方聽得入耳，而不是贏一場道理。',
  '感情入面的痛苦，很多時來自一個未被整理清楚的念頭。你可能以為自己只是想要答案，其實背後是害怕失去、害怕不被選擇、害怕自己做錯。先把情緒拆開，才不會被一時反應帶住走。',
  '當一段關係變冷、斷聯、少覆或分開之後，最令人辛苦的不是單純失去，而是不知道自己還能不能做點什麼。這時候最怕用焦慮推動行動：不停追問、長篇解釋、逼對方表態，往往會令對方更加退後。',
  '關係出現警號時，人很容易一邊不安，一邊替對方找理由。你可能會說服自己「他只是忙」「他只是性格如此」，但如果同一種傷害重複發生，就需要停下來看清楚，這到底是偶然衝突，還是長期模式。',
  '曖昧、暗戀或剛開始互動時，最容易被氣氛牽住走。對方一句甜言蜜語、一個眼神、一段忽冷忽熱，都會令你反覆猜測到底有沒有機會。可是關係能不能向前，從來不只看心動，也要看對方是否願意投入。'
];

const paragraphReplacements = [
  [/你可以先觀察三個位置：對方最近有冇主動靠近、衝突後有冇修補、你表達需要時對方係願意理解，定只係想快點完結話題。這些細節會比一句「 ?愛不愛 ?」更能反映關係狀態。/g, observeParagraph],
  [/先把一句責備改成具體需要。例如先講「剛才那件事令我不安」，再講「我希望下次可以提早講」。句子越清楚、越少攻擊，對方越有機會聽到你的真正意思。/g, actionParagraph],
  [/你可以把事件分成三欄：對方做了什麼、事後怎樣解釋、之後有沒有實際改變。如果每次都由你吞下委屈，這就不只是普通相處磨合。/g, observeParagraph],
  [/先不要即時用情緒做決定。給自己一段冷靜時間，再決定要溝通、觀察、修補還是抽離。當你不再急著證明自己被愛，下一步會清楚很多。/g, actionParagraph],
  [/第 2 點可以先由一句說話開始練習。把「你又係咁」改成「剛才那件事令我有點不安」，已經可以令對話由攻擊變成表達。/g, actionParagraph],
  [/想令對方聽得入耳，可以先把一句責備改成一個具體需要。例如不要一開始就說「你永遠都不理我」，而是說「我想我們今晚可以留十五分鐘講清楚這件事」。句子越具體，對方越不容易用逃避回應。/g, actionParagraph],
  [/如果你不確定下一句應該點講，可以把你原本想傳的訊息交給我哋 review。Asteria 會幫你調整語氣、次序和重點，令對方更容易聽到你的真正需要。/g, ctaParagraph],
  [/先不要急著一次過解釋全部感受。可以用一句短而不施壓的訊息重新打開空間，再觀察對方是否願意接住。若對方仍抗拒，就要先停一停，避免把修補變成追逼。/g, actionParagraph],
  [/先停一停，不要急著替對方找藉口。把底線寫清楚，再看對方有沒有用行動修正；如果只是不斷安撫你但沒有改變，就要優先保護自己的情緒和安全。/g, actionParagraph],
  [/你可以先把問題分成三格：事實、猜測、感受。事實是對方做了什麼；猜測是你腦中補上的意思；感受是你因此受了什麼影響。分清楚之後，你會更容易知道下一步應該溝通、觀察，還是暫時收回注意力。/g, observeParagraph],
  [/如果你不確定自己是太敏感，還是真的被關係消耗，可以把最近最刺痛你的事件寫低。Asteria 會陪你拆情緒、底線和下一步方向，先令你不用一個人亂猜。/g, ctaParagraph],
  [/第 2 點最重要的是節奏。你不需要一次過證明自己有多在乎，而是要讓對方重新感覺同你互動不會被逼迫，這樣關係才有機會慢慢鬆動。/g, actionParagraph]
];

function removeDuplicateParagraphsInBody(content) {
  const parts = content.split(/(<h2[^>]*>\s*常見問題\s*<\/h2>[\s\S]*)/i);
  const body = parts[0] || '';
  const faq = parts[1] || '';
  const seen = new Set();
  const cleaned = body.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (match) => {
    const key = normalize(match);
    if (key.length > 45 && seen.has(key)) return '';
    if (key.length > 45) seen.add(key);
    return match;
  });
  return `${cleaned}${faq}`;
}

let changed = 0;

for (const post of posts) {
  const original = post.content;
  let content = post.content;

  content = content.replace(/：回到「[^」]+」本身/g, '');

  for (const needle of repeatedNeedles) {
    content = content.split(`<p>${needle}</p>`).join(`<p>${kindIntro(post)}</p>`);
  }

  for (const [pattern, replacer] of paragraphReplacements) {
    content = content.replace(pattern, () => replacer(post));
  }

  const bodyBeforeFaq = content.split(/<h2[^>]*>\s*常見問題\s*<\/h2>/i)[0] || '';
  if (stripHtml(bodyBeforeFaq).length < 900) {
    content = content.replace(/(<h2[^>]*>\s*常見問題\s*<\/h2>)/i, `<h2>再整理多一步</h2>\n<p>${observeParagraph(post)}</p>\n<p>${actionParagraph(post)}</p>\n$1`);
  }

  content = removeDuplicateParagraphsInBody(content);

  if (content !== original) {
    post.content = content;
    changed += 1;
  }
}

const serialized = JSON.stringify(posts, null, 2)
  .replace(/"([^"]+)":/g, '$1:')
  .replace(/\\u003c/g, '<')
  .replace(/\\u003e/g, '>')
  .replace(/\\u0026/g, '&');

fs.writeFileSync(articlesFile, `${source.slice(0, arrayStart)}${serialized}${source.slice(arrayEnd)}`);
console.log(`final quality pass changed ${changed} articles`);
