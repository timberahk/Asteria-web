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
  if (/復合|挽回|前任|分手|斷聯|冷戰|冷淡|回頭|重新|抽離|Block|已讀不回|失戀/.test(text)) return 'reconnect';
  if (/曖昧|暗戀|桃花|單身|心動|炮友|喜歡|約會|新歡|第三者/.test(text)) return 'ambiguous';
  if (/控制|冷暴力|出軌|變心|恐怖|借錢|警號|PUA|貶低|操控|家暴|暴力|傷害|不改|原諒|渣男/.test(text)) return 'risk';
  if (/溝通|相處|吵架|需求|情緒|壓力|支援|報備|道歉|承諾|挑剔|勸|說話|回覆|訊息|message|聽/.test(text)) return 'communication';
  if (/結婚|婚前|同居|家長|辦公室|長久|適合|條件|未來|伴侶/.test(text)) return 'commitment';
  return 'mindset';
}

const variants = {
  reconnect: [
    {
      observe: (f) => `先不要只問「${f}」仲有沒有機會。更實際的是看三件事：對方是否仍願意接收訊息、你放慢後氣氛有沒有鬆一點、以及每次互動後關係是拉近還是更緊。`,
      action: (f) => `處理「${f}」時，第一步不是把所有委屈一次過倒出來，而是先保留一個不令人窒息的聯絡窗口。短、清楚、沒有追問感的訊息，通常比長篇解釋更有用。`,
      cta: (f) => `如果你不知道「${f}」應該主動還是等，可以整理最近時間線和對話截圖，先判斷對方退後是情緒、壓力，還是真的想切斷。`
    },
    {
      observe: (f) => `「${f}」要看的是窗口位，而不是一時冷淡。對方有沒有回應、回應會不會帶情緒、你停止追問後他會不會自己補上，這些都是判斷方向的訊號。`,
      action: (f) => `你可以先把目標改小：不是即刻復合，而是令下一次互動不再有壓迫感。當對方重新覺得和你說話是安全的，關係才有機會慢慢鬆動。`,
      cta: (f) => `如果「${f}」牽涉斷聯、冷淡或分手後反覆，可以先不要亂試方法，讓 Asteria 幫你拆清楚現時適合拉近、等待，還是先收回。`
    },
    {
      observe: (f) => `判斷「${f}」時，不要只看對方一句回覆，要看整體節奏。若對方仍保留回應、沒有完全封閉，通常代表仍有空間；但方法太急會把空間壓縮。`,
      action: (f) => `先停止用「求答案」的方式靠近。你可以用一句輕、短、貼近當下的話重開互動，然後觀察對方是否願意接住，而不是逼他即時表態。`,
      cta: (f) => `如果你卡在「${f}」不知下一句怎樣講，可以把想發的訊息交給 Asteria review，先避免一急就把對方推遠。`
    }
  ],
  ambiguous: [
    {
      observe: (f) => `「${f}」不能只看甜不甜，要看他有沒有把你放進現實安排。會不會約時間、會不會記得你的事、會不會在你後退時補上，比一句曖昧說話更可靠。`,
      action: (f) => `你可以主動一次，但不要替對方完成整段關係。提出一個清楚又不施壓的邀約，然後看他會不會接住，才知道「${f}」有沒有向前的可能。`,
      cta: (f) => `如果你分不清「${f}」是真心還是只享受互動，可以把聊天節奏和見面安排整理出來，先看投入度，不要單靠感覺猜。`
    },
    {
      observe: (f) => `面對「${f}」，最怕被一刻氣氛帶走。真正有心的人會逐步增加穩定感，不會只在心情好時靠近、需要承擔時就退後。`,
      action: (f) => `先保留自己的節奏。你可以表達興趣，但同時留意對方是否願意付出時間和行動；如果永遠都是你推，他只享受被追，關係會很易失衡。`,
      cta: (f) => `如果「${f}」令你反覆心郁又不安，Asteria 可以幫你拆對方訊號，判斷應該升溫、試探，還是先收手保護自己。`
    }
  ],
  risk: [
    {
      observe: (f) => `遇到「${f}」，不要只聽對方怎樣解釋，要看事情有沒有重複。一次衝突可以溝通，長期令你害怕表達需要，就已經不是普通磨合。`,
      action: (f) => `先把底線寫清楚：你不能接受什麼、希望對方具體改什麼、需要觀察多久。真正的修補不是道歉，而是之後的行動是否穩定。`,
      cta: (f) => `如果你不確定「${f}」是警號還是自己太敏感，可以把事件、對方反應和後續行動整理好，再一起判斷風險。`
    },
    {
      observe: (f) => `「${f}」要看的是權力是否失衡。你是否越來越不敢講真話、越來越怕惹怒對方、越來越需要替對方找藉口，這些都要認真處理。`,
      action: (f) => `先不要急著用愛合理化傷害。你可以給一次清楚界線，但要看對方有沒有真實改變；若只得安撫沒有行動，就要優先保護自己。`,
      cta: (f) => `如果「${f}」已經令你很內耗，Asteria 可以幫你拆清楚哪些位置可溝通、哪些位置要守住底線。`
    }
  ],
  communication: [
    {
      observe: (f) => `「${f}」通常不是沒有愛，而是講法令對方進入防衛。你可以回看第一句說話：是在描述事件，還是在否定對方？這一步已經決定對話會不會爆。`,
      action: (f) => `先把內容縮小成一個重點。用「剛才那件事令我不安，我希望下次可以提早講」代替「你永遠都係咁」，對方才有機會聽到你的真正需要。`,
      cta: (f) => `如果你不知道「${f}」下一句怎樣回，可以把原句給 Asteria review，逐句調整語氣、次序和界線。`
    },
    {
      observe: (f) => `處理「${f}」時，要分清你想表達的是需要，還是想證明對方錯。前者有機會拉近，後者通常只會令對方更想逃。`,
      action: (f) => `先接住情緒，再講事情。可以先說「我不是想吵，只是想講清楚剛才令我不舒服的位置」，比一開始質問更容易讓對方留下來聽。`,
      cta: (f) => `如果「${f}」已經重複很多次，Asteria 可以幫你找出固定卡位，教你用另一種說法打開對話。`
    },
    {
      observe: (f) => `你可以把「${f}」最近一次對話拆開：哪一句令對方防衛、哪一句令你更委屈、哪一刻雙方開始各講各話。找到轉折位，才知道要改哪一句。`,
      action: (f) => `不要一次過講十件事。先選最重要的一件，用短句講感受、影響和希望，讓對方知道他可以怎樣做，而不是只聽到自己被投訴。`,
      cta: (f) => `如果你想講清「${f}」但怕講錯，先讓 Asteria 幫你把長訊息改成對方聽得入耳的版本。`
    }
  ],
  commitment: [
    {
      observe: (f) => `「${f}」要看現實承托力。對方有沒有記得承諾、遇到壓力時會一起商量還是消失、生活節奏是否可以磨合，這些比口頭承諾更準。`,
      action: (f) => `先把抽象不安變成具體問題，例如時間安排、金錢觀、家人界線或未來計劃。越具體，越容易看出對方是否願意一起面對。`,
      cta: (f) => `如果你想知道「${f}」值不值得走長遠，可以整理你們的衝突模式和現實壓力，讓 Asteria 幫你看清可磨合的位置。`
    },
    {
      observe: (f) => `判斷「${f}」時，不要只看浪漫感覺。真正能走下去的人，會在日常小事裡願意調整、溝通和承擔。`,
      action: (f) => `你可以先提出一個具體安排，而不是要求一句永遠承諾。看對方是否願意參與調整，會比聽他說愛你更有參考價值。`,
      cta: (f) => `如果「${f}」牽涉未來方向、同居、結婚或價值觀，Asteria 可以幫你分清是可磨合，還是根本需求不一致。`
    }
  ],
  mindset: [
    {
      observe: (f) => `「${f}」最容易令你把一個反應放大成整段關係的結論。先分開事實、猜測和感受，你會發現很多痛苦其實來自腦內補戲。`,
      action: (f) => `先不要即時回覆或下決定。給自己一段冷靜時間，再用一句最清楚的話表達需要，會比被情緒推著走更穩。`,
      cta: (f) => `如果「${f}」令你不停內耗，可以把最刺痛你的事件寫低，Asteria 會陪你拆情緒、底線和下一步方向。`
    },
    {
      observe: (f) => `面對「${f}」，先問自己：我現在怕的是失去對方，還是怕自己不被選擇？分清恐懼來源，處理方法會完全不同。`,
      action: (f) => `把注意力先收回自己身上。你可以先做一件令情緒穩定的小事，再決定要不要溝通；穩住之後講出來的話，通常更有力量。`,
      cta: (f) => `如果你在「${f}」裡反覆想不通，可以讓 Asteria 幫你把情緒、現實訊號和選擇方向分開。`
    }
  ]
};

function pick(post) {
  const pool = variants[articleKind(post)];
  return pool[post.id % pool.length];
}

function replaceRepeatedBlocks(content, post) {
  const f = shortFocus(post);
  const v = pick(post);
  const replacements = [
    [/<p>你可以先觀察三個位置：[\s\S]*?更能反映關係狀態。<\/p>/g, `<p>${v.observe(f)}</p>`],
    [/<p>如果你仍然想挽回或修補，[\s\S]*?慢慢看對方是否願意重新接近。<\/p>/g, `<p>${v.action(f)}</p>`],
    [/<p>如果你不確定現在應該主動、等待還是短暫抽離，[\s\S]*?下一句說話應該點樣落。<\/p>/g, `<p>${v.cta(f)}</p>`],
    [/<p>第 2 點要你把焦點由「他怎樣解釋」移到「他之後有沒有改」。[\s\S]*?而會願意承擔後果。<\/p>/g, `<p>${v.observe(f)}</p>`],
    [/<p>面對警號時，不要只問「他還愛不愛我」[\s\S]*?這些比一句道歉更重要。<\/p>/g, `<p>${v.observe(f)}</p>`],
    [/<p>可以主動一次，但不要替對方推完整段關係。[\s\S]*?就要重新評估投入比例。<\/p>/g, `<p>${v.action(f)}</p>`],
    [/<p>你可以觀察對方在小事上的責任感：[\s\S]*?更實際。<\/p>/g, `<p>${v.observe(f)}</p>`],
    [/<p>第 2 點提醒你不要只靠情緒判斷。[\s\S]*?是否願意把互動帶到現實層面。<\/p>/g, `<p>${v.observe(f)}</p>`],
    [/<p>如果你想推進關係，可以主動，[\s\S]*?而不是只在氣氛好時靠近你。<\/p>/g, `<p>${v.action(f)}</p>`],
    [/<p>如果你不確定對方是認真、曖昧還是只享受互動，[\s\S]*?你下一步應該推進還是收回。<\/p>/g, `<p>${v.cta(f)}</p>`],
    [/<p>你不需要一開始就逼對方定義關係，[\s\S]*?仍然出現。<\/p>/g, `<p>${v.observe(f)}</p>`]
  ];
  let next = content;
  for (const [pattern, value] of replacements) next = next.replace(pattern, value);
  return next;
}

function removeDuplicateParagraphs(content) {
  const [body, faq = ''] = content.split(/(<h2[^>]*>\s*常見問題\s*<\/h2>[\s\S]*)/i);
  const seen = new Set();
  const cleaned = (body || '').replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (match) => {
    const key = stripHtml(match)
      .replace(/[，。！？、：；「」『』（）\\[\\]\\s,.!?;:'"“”]/g, '')
      .toLowerCase();
    if (key.length > 40 && seen.has(key)) return '';
    if (key.length > 40) seen.add(key);
    return match;
  });
  return `${cleaned}${faq}`;
}

function enrichThinArticle(content, post) {
  const [body, faq = ''] = content.split(/(<h2[^>]*>\s*常見問題\s*<\/h2>[\s\S]*)/i);
  const bodyText = stripHtml(body || '');
  if (bodyText.length >= 980) return content;
  const f = shortFocus(post);
  const v = pick(post);
  const supplement = [
    '<h2>讀者可以即刻拎走的做法</h2>',
    `<p>${v.observe(f)}</p>`,
    `<p>${v.action(f)}</p>`,
    `<p>最後要記住，${f}不是靠一句說話就完全解決，而是要看你之後能否用更穩的節奏處理。先減少追問、減少試探，再把真正需要講清楚，關係先有機會重新回到可溝通的位置。</p>`
  ].join('\n');
  return `${body}\n${supplement}${faq ? `\n${faq}` : ''}`;
}

let changed = 0;

for (const post of posts) {
  const original = post.content;
  let content = post.content;

  content = replaceRepeatedBlocks(content, post);
  content = content
    .replace(/<h2>再看深一層：([^<]+)的真正訊號<\/h2>/g, '<h2>再看深一層：真正卡住的位置</h2>')
    .replace(/<h2>讀完之後，可以先做一個小整理<\/h2>\s*\n\s*(?=<h2>常見問題<\/h2>)/g, '');

  content = enrichThinArticle(content, post);
  content = removeDuplicateParagraphs(content);

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
console.log(`article audit repair pass 2 changed ${changed} articles`);
