import fs from 'node:fs';
import path from 'node:path';

const sourceDir = '/Users/dorothy/Documents/asteria 所有教學文/愛情拯救所 教學文 - SEO AEO edited';
const webReadyDir = '/Users/dorothy/Documents/asteria 所有教學文/愛情拯救所 教學文 - Web ready';
const repoRoot = path.resolve(import.meta.dirname, '..');
const outFile = path.join(repoRoot, 'lib', 'articlesData.ts');
const customImageDir = path.join(repoRoot, 'public', 'article-custom-images', 'by_article');
const promptsFile = path.join(repoRoot, 'scripts', 'article-image-prompts.jsonl');
const pexelsArticleImagesFile = path.join(repoRoot, 'scripts', 'pexels-article-images.json');
const sitemapFile = path.join(repoRoot, 'public', 'sitemap.xml');
const syncWebReady = process.env.SYNC_WEB_READY === '1';

const colorThemes = [
  { bg: '#FFF3D6', accent: '#A65F2B', soft: '#F7D6A0', dark: '#4A2E20' },
  { bg: '#FDE7E2', accent: '#B75A52', soft: '#F8B9AC', dark: '#4A2E20' },
  { bg: '#E8F4F1', accent: '#3F817A', soft: '#BFE2DC', dark: '#263F42' },
  { bg: '#F6E7D8', accent: '#7B4A2D', soft: '#D9A77F', dark: '#3D2A20' },
  { bg: '#EDF0F7', accent: '#546C9E', soft: '#BFC9E5', dark: '#263047' },
  { bg: '#F8EAF1', accent: '#A95577', soft: '#E5B8CB', dark: '#452637' },
  { bg: '#EEF5DD', accent: '#6F8752', soft: '#C9DCA5', dark: '#354128' },
  { bg: '#FDF4EA', accent: '#C2733D', soft: '#F2C08F', dark: '#442C1E' }
];

const icons = [
  'fa-solid fa-heart',
  'fa-regular fa-comments',
  'fa-solid fa-heart-crack',
  'fa-solid fa-hand-holding-heart',
  'fa-solid fa-route',
  'fa-solid fa-compass',
  'fa-solid fa-magnifying-glass-heart',
  'fa-solid fa-shield-heart'
];

const colors = [
  'bg-asteria-yellow/50',
  'bg-[#FFE7DD]',
  'bg-asteria-pink/60',
  'bg-asteria-blue/60',
  'bg-[#E7F4F2]',
  'bg-[#F6E7D8]',
  'bg-[#EEF5DD]',
  'bg-[#EDF0F7]'
];

const localStockImage = (id) => `/article-custom-images/stock_local/pexels-${id}.jpg`;

const stockPhotos = {
  cafeTalk: {
    src: localStockImage('5225295'),
    credit: 'Photo by Samson Katt on Pexels',
    creditUrl: 'https://www.pexels.com/photo/happy-diverse-couple-having-breakfast-at-table-5225295/'
  },
  warmCafe: {
    src: localStockImage('5225281'),
    credit: 'Photo by Samson Katt on Pexels',
    creditUrl: 'https://www.pexels.com/photo/smiling-diverse-couple-standing-together-in-sunny-day-5225281/'
  },
  outdoorCafe: {
    src: localStockImage('27067373'),
    credit: 'Photo by Anastasia Nagibina on Pexels',
    creditUrl: 'https://www.pexels.com/photo/couple-sitting-on-couch-and-holding-hands-27067373/'
  },
  cafeNight: {
    src: localStockImage('8727461'),
    credit: 'Photo by Tima Miroshnichenko on Pexels',
    creditUrl: 'https://www.pexels.com/photo/a-sad-woman-wearing-red-long-sleeves-8727461/'
  },
  sofaArgument: {
    src: localStockImage('36812992'),
    credit: 'Photo by Vitaly Gariev on Pexels',
    creditUrl: 'https://www.pexels.com/photo/young-couple-engaged-in-serious-conversation-indoors-36812992/'
  },
  sofaSilent: {
    src: localStockImage('8560663'),
    credit: 'Photo by Timur Weber on Pexels',
    creditUrl: 'https://www.pexels.com/photo/couple-after-argument-8560663/'
  },
  phoneBed: {
    src: localStockImage('8055092'),
    credit: 'Photo by Annushka Ahuja on Pexels',
    creditUrl: 'https://www.pexels.com/photo/a-mature-couple-sitting-close-together-on-a-couch-8055092/'
  },
  phoneWarm: {
    src: localStockImage('8560383'),
    credit: 'Photo by Timur Weber on Pexels',
    creditUrl: 'https://www.pexels.com/photo/a-couple-talking-while-arguing-8560383/'
  },
  phonePartner: {
    src: localStockImage('8560354'),
    credit: 'Photo by Timur Weber on Pexels',
    creditUrl: 'https://www.pexels.com/photo/man-talking-to-his-girlfriend-8560354/'
  },
  cafeDate: {
    src: localStockImage('5225443'),
    credit: 'Photo by Samson Katt on Pexels',
    creditUrl: 'https://www.pexels.com/photo/happy-young-ethnic-couple-sitting-in-train-and-talking-5225443/'
  },
  streetCafe: {
    src: localStockImage('12944983'),
    credit: 'Photo by Atlantic Ambience on Pexels',
    creditUrl: 'https://www.pexels.com/photo/couple-sitting-by-a-cafe-and-talking-12944983/'
  }
};

const safeStockFallbacks = [
  stockPhotos.warmCafe,
  stockPhotos.cafeTalk,
  stockPhotos.sofaSilent,
  stockPhotos.phoneWarm,
  stockPhotos.cafeDate
];

const publicImageExists = (src = '') =>
  src.startsWith('/') && fs.existsSync(path.join(repoRoot, 'public', src.replace(/^\/+/, '')));

const ensureExistingImage = (image, slot = 0) => {
  if (image?.src && publicImageExists(image.src)) return image;
  const fallback = safeStockFallbacks[slot % safeStockFallbacks.length];
  return {
    ...fallback,
    caption: image?.caption || (slot === 0 ? 'Asteria 原創文章封面圖' : 'Asteria 原創文章配圖'),
    prompt: image?.prompt || ''
  };
};

const stockPhotoSetFor = (title, category) => {
  const text = `${title} ${category}`;
  if (/少覆|唔覆|不回|已讀|message|訊息|回覆|秒回|Long D|遠距|異地/.test(text)) {
    return [stockPhotos.phoneWarm, stockPhotos.phoneBed, stockPhotos.phonePartner, stockPhotos.cafeNight];
  }
  if (/第三者|新歡|出軌|偷食|變心|劈腿|外遇|PUA|控制|操控|打壓|冷暴力|渣男|紅旗|警號|危機/.test(text)) {
    return [stockPhotos.sofaSilent, stockPhotos.sofaArgument, stockPhotos.phoneBed, stockPhotos.cafeNight];
  }
  if (/分手|失戀|放低|前任|復合|挽回|斷聯|block|冷淡/.test(text)) {
    return [stockPhotos.sofaSilent, stockPhotos.phoneWarm, stockPhotos.cafeTalk, stockPhotos.outdoorCafe];
  }
  if (/曖昧|約會|單身|桃花|吸引|主動|追求/.test(text)) {
    return [stockPhotos.cafeDate, stockPhotos.outdoorCafe, stockPhotos.warmCafe, stockPhotos.streetCafe];
  }
  if (/道歉|吵架|嗌交|冷戰|誤會|修補|和好|爭執|溝通|說話|講嘢|勸/.test(text)) {
    return [stockPhotos.cafeTalk, stockPhotos.sofaArgument, stockPhotos.warmCafe, stockPhotos.sofaSilent];
  }
  if (/安全感|不安|焦慮|內耗|委屈|情緒|治癒|自信|低落/.test(text)) {
    return [stockPhotos.phoneWarm, stockPhotos.phoneBed, stockPhotos.cafeTalk, stockPhotos.sofaSilent];
  }
  return [stockPhotos.warmCafe, stockPhotos.cafeTalk, stockPhotos.outdoorCafe, stockPhotos.cafeDate];
};

const editorialImagesFor = ({ id, title, category }) => {
  const set = stockPhotoSetFor(title, category);
  return [0, 1, 2, 3].map((slot) => {
    const photo = ensureExistingImage(set[(id + slot) % set.length], slot);
    return {
      src: photo.src,
      caption: slot === 0 ? `封面圖：${title}` : `內文配圖：${title}`,
      credit: photo.credit,
      creditUrl: photo.creditUrl,
      prompt: ''
    };
  });
};

const getCustomImageMap = () => {
  const imageMap = new Map();
  if (!fs.existsSync(customImageDir)) return imageMap;

  for (const articleDir of fs.readdirSync(customImageDir, { withFileTypes: true })) {
    if (!articleDir.isDirectory()) continue;
    const dirPath = path.join(customImageDir, articleDir.name);
    const manifestPath = path.join(dirPath, 'manifest.md');
    if (!fs.existsSync(manifestPath)) continue;

    const manifest = fs.readFileSync(manifestPath, 'utf8');
    const articleMatch = manifest.match(/Article file:\s*\n`([^`]+)`/);
    if (!articleMatch) continue;
    const sourceFilename = path.basename(articleMatch[1]);
    const images = fs
      .readdirSync(dirPath)
      .filter((file) => /\.(png|jpe?g|webp)$/i.test(file))
      .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
      .map((file, index) => ({
        src: `/article-custom-images/by_article/${articleDir.name}/${file}`,
        caption: index === 0 ? 'Asteria 原創文章封面圖' : 'Asteria 原創文章配圖',
        credit: '',
        creditUrl: '',
        prompt: ''
      }));

    if (images.length) {
      imageMap.set(sourceFilename, images);
    }
  }

  return imageMap;
};

const getPexelsArticleImageMap = () => {
  if (!fs.existsSync(pexelsArticleImagesFile)) return new Map();
  const parsed = JSON.parse(fs.readFileSync(pexelsArticleImagesFile, 'utf8'));
  return new Map(Object.entries(parsed).map(([id, images]) => [Number(id), images]));
};

const escapeHtml = (value = '') => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const escapeAttr = escapeHtml;

const stripSeoSuffix = (title = '') => title
  .replace(/｜.*$/, '')
  .replace(/\s+\|\s+.*$/, '')
  .trim();

const cleanTitle = (title = '') => stripSeoSuffix(title)
  .replace(/^[\s【\[][^】\]]{1,18}[】\]]\s*/g, '')
  .replace(/\s*[【\[]\s*(AI\s*)?摘要.*?[】\]]\s*/gi, ' ')
  .replace(/^分手真相】/g, '【分手真相】')
  .replace(/【{2,}/g, '【')
  .replace(/突你破解/g, '教你破解')
  .replace(/無野/g, '無嘢')
  .replace(/\s+/g, ' ')
  .trim();

const cleanSeoDisplayTitle = (title = '') => stripSeoSuffix(title)
  .replace(/\s*[【\[]\s*(AI\s*)?摘要.*?[】\]]\s*/gi, ' ')
  .replace(/【{2,}/g, '【')
  .replace(/】{2,}/g, '】')
  .replace(/^分手真相】/g, '【分手真相】')
  .replace(/【{2,}/g, '【')
  .replace(/突你破解/g, '教你破解')
  .replace(/無野/g, '無嘢')
  .replace(/[\/]+/g, '／')
  .replace(/\s+/g, ' ')
  .trim();

const articleTitleOverrides = new Map([
  ['002', '【一見鍾情】初見心動可以變真愛嗎？由吸引到依戀的關鍵'],
  ['003', '【情侶溝通】點解對方總係唔明你？拆解「讀心術迷思」'],
  ['004', '【恐怖情人警號】大男人定控制狂？5 個徵兆教你分辨'],
  ['005', '【兩性心理】女人太強會令對方不安？拆解男人自卑心結'],
  ['006', '【分手前兆】感情亮紅燈的 4 個徵兆：冷淡、逃避與失望'],
  ['007', '【分手後聯絡】繼續搵前任會自斷復合機會嗎？'],
  ['008', '【分手復合】被分手後如何重新振作？3 個步驟找回吸引力'],
  ['009', '【復合判斷】分手後還有聯絡，是否代表仍有機會？'],
  ['010', '【親密關係】分享慾點樣影響感情？生活細節才是親密關鍵'],
  ['011', '【成年人愛情】年紀越大越難心動？拆解心動變少的真正原因'],
  ['012', '【委屈型戀愛】以為忍讓就是愛？你的犧牲可能正在白費'],
  ['013', '【婚後關係】生小朋友後感情變淡？重新拉近夫妻距離的方法'],
  ['014', '【情緒相處】用發脾氣換關注？點解只會令對方更想逃'],
  ['015', '【情侶吵架】成日嗌交就要分手嗎？先看修復能力'],
  ['016', '【情侶相處】成日對住另一半就燥底？5 個破壞關係的原因'],
  ['017', '【短戀原因】次次拍拖都好快散？破解拍短拖的感情模式'],
  ['018', '【情侶吵架】次次翻舊帳？為何你總是放不下以前的傷'],
  ['019', '【關係壓力】你以為幫緊對方，其實可能正在增加壓力'],
  ['020', '【創傷迷戀】為何你總是委屈自己？拆解怕失去背後的不安全感'],
  ['021', '【偽關心地雷】你用關心包住批評？3 句最傷人的說話'],
  ['022', '【磨合期心理】你哋唔適合定唔夠努力？思維決定關係走向'],
  ['023', '【愛與習慣】你唔捨得佢，是因為愛還是害怕失去熟悉感？'],
  ['024', '【愛情錯覺】你是真的喜歡他，還是享受被愛的感覺？'],
  ['025', '【關係界線】你愈原諒他愈不改？別再替對方找藉口'],
  ['026', '【冷暴力分手】佢唔係忙，只是在慢慢避開你？'],
  ['027', '【溝通障礙】佢唔識溝通定拒絕溝通？分辨關係卡位'],
  ['028', '【相處邊界】對方嫌你太黐身？學識親密關係界線感'],
  ['029', '【男人心理】佢對你不如從前？拆解男人愛情扣分法'],
  ['030', '【真愛判斷】佢對你真心定假意？5 招看清實際行動'],
  ['031', '【甜言蜜語】男人講好聽說話可信嗎？看清說話與行動'],
  ['032', '【比較心理】見朋友幸福就妒忌？其實你可能不滿意自己'],
  ['033', '【關係優先次序】他見朋友多過見你？判斷你在他心中的位置'],
  ['034', '【親密感不足】事事分享仍不親密？可能你分享錯方向'],
  ['035', '【感情變淡】拍拖耐咗無話題？別把冷淡誤當默契'],
  ['036', '【爛桃花心理】為何你總是遇到錯的人？拆解 4 個吸引渣男的相處模式'],
  ['037', '【情緒溝通】只是想呻兩句，為何他覺得你在吵架？'],
  ['038', '【交友 App 界線】拍拖後仍玩交友 App，代表變心嗎？'],
  ['039', '【患得患失】單身時自信，為何戀愛後反而不安？'],
  ['040', '【關係修復】一直原諒對方卻不改？別再替他找藉口'],
  ['041', '【媽寶男警號】長不大的男人比渣男更可怕？分辨媽寶男特徵'],
  ['043', '【性愛關係】約親都想上床？分辨他愛你還是只當你是床伴'],
  ['044', '【出軌跡象】另一半早有警號？6 個蛛絲馬跡要留意'],
  ['045', '【渣男技巧】從單身即地獄 3 看懂常見曖昧操控手法'],
  ['046', '【同居指南】情侶同居前要想清楚的甜蜜陷阱與現實問題'],
  ['047', '【放閃心理】情侶越放閃越幸福嗎？拆解社交平台背後的不安'],
  ['048', '【吵架地雷】情侶嗌交 5 大禁區：踩中容易傷感情'],
  ['049', '【吸引力法則】可以招來好愛情嗎？先避開常見誤區'],
  ['050', '【男人心理】如何讓男人離不開你？先懂他的情感需求'],
  ['051', '【第一次約會】初次 Dating 有咩禁忌？提高拍拖成功率'],
  ['052', '【出軌修復】貪玩出軌後想補救？4 招重建信任'],
  ['053', '【男人心底話】看懂他沒說出口的情感需求'],
  ['054', '【尊重界線】無阻止等於尊重嗎？你可能一直理解錯了'],
  ['055', '【婚姻心動】結婚後遇到心動對象？4 個問題看清內心'],
  ['056', '【結婚心理】結婚是愛情墳墓嗎？想同對方結婚要點做'],
  ['057', '【Ghosting 心理】傾傾吓突然消失？拆解對方不回的原因'],
  ['058', '【復合階段】想同前度重新開始？5 個必經階段要知道'],
  ['059', '【需求表達】想同對方講需要，但他總是不聽怎麼辦？'],
  ['060', '【溝通錯配】你愈想被理解，他為何愈退縮？'],
  ['061', '【報備與控制】想對方一直報備，是關心還是控制？'],
  ['062', '【愛得太用力】為何付出愈多反而推走對方？'],
  ['063', '【感情變淡】感情耐咗一定變淡嗎？4 個行為令他慢慢抽離'],
  ['065', '【道歉技巧】只說對不起不夠？真正平息伴侶情緒的方法'],
  ['066', '【戀愛白紙】對方母胎單身？教直男談戀愛的相處方法'],
  ['067', '【防禦性傾聽】對方成日一講就起鋼？溝通要先降防衛'],
  ['068', '【斷聯挽回】對方突然 Block 你？已讀不回時可以點做'],
  ['069', '【自我價值】對方唔夠愛你，問題可能出在你怎樣看自己'],
  ['070', '【復合機會】對方說不愛你就要死心嗎？先看真實狀態'],
  ['071', '【冷戰破解】對方嬲到黑面唔出聲？低壓打開溝通窗口'],
  ['072', '【玩笑式貶低】對方總用講笑傷害你？別再強裝無事'],
  ['073', '【家務分工】另一半叫極唔郁？令他主動分擔生活責任的方法'],
  ['074', '【忽冷忽熱】對你忽冷忽熱是變心嗎？拆解間歇性冷漠'],
  ['075', '【愛意消失】點解好好地突然無感覺？關係降溫原因'],
  ['076', '【擇偶條件】揀對象不能只靠感覺：真正重要的伴侶特質'],
  ['077', '【親密升溫】如何一步步建立親密感？關係升溫指南'],
  ['078', '【嫉妒不安】總擔心另一半有異性埋身？呷醋時點處理'],
  ['079', '【金錢界線】伴侶問你借錢點算？不傷感情的處理方法'],
  ['080', '【分手後界線】為何不應再和前任發生關係？復合前要避開'],
  ['081', '【分手療癒】點解分手特別難受？走入情感修復期的方法'],
  ['082', '【男女溝通】點解佢總係唔明白你？5 個常見溝通差異'],
  ['083', '【冷暴力心理】男人為什麼不溝通？沉默背後的真正原因'],
  ['084', '【冷淡期修復】關係進入冷淡期怎麼辦？重新拉近距離的方法'],
  ['085', '【情感忽略】他聽你講嘢不耐煩？關係疏離的警號'],
  ['086', '【T 型伴侶】連吵架都講道理？3 招扭轉溝通方式'],
  ['088', '【分手真相】分手原因未必係性格不合：揭開依戀創傷'],
  ['88', '【分手真相】分手原因未必係性格不合：揭開依戀創傷'],
  ['132', '【戀愛腦自救】3 個「戀愛腦」症狀及戒除方法'],
  ['107', '【情侶吵架】成日嗌交代表不適合嗎？看懂良性吵架與惡性消耗']
]);

const articleSummaryOverrides = new Map([
  ['067', '有些人一聽到意見就覺得被攻擊，不一定是不講理，而是進入了防禦性傾聽。想溝通有效，要先降低對方的防衛感。'],
  ['095', '空頭支票最傷人的地方，不是他講得好聽，而是承諾一次次落空。要分清他是逃避衝突、有心無力，還是根本沒有把你的需要放在心上。'],
  ['100', '好命不是靠等人寵出來，而是由自我價值、相處心態和感恩能力慢慢養成。愛情想長久，也要先把自己照顧好。'],
  ['105', '安全感填不滿，很多時候不是對方做得未夠多，而是你內心一直害怕被拋低。先看清自信、依戀創傷和過去陰影，才知道怎樣補回自己。'],
  ['111', '情緒勒索會把愛、犧牲和離開包裝成壓力，令你不敢拒絕。看清常見金句背後的操控，才能重新守住界線。'],
  ['126', '有些人用反話、冷淡或提分手來試探愛意，背後通常是不安全感。真正要處理的不是迎合測試，而是建立清楚界線。']
]);

const conciseArticleTitle = (title = '') => {
  const direct = [
    [/講心底話≠有效溝通/, '講心底話≠有效溝通'],
    [/未拍拖先上床.*點解佢之後無表示/, '未拍拖先上床，點解佢之後無表示？'],
    [/男朋友拖婚.*順其自然/, '男朋友拖婚，真係順其自然？'],
    [/感情出現裂痕注定分手/, '感情出現裂痕，注定分手？'],
    [/成日嗌交=不適合/, '成日嗌交，係咪不適合？'],
    [/朋友變情人.*Friend Zone/, '朋友變情人有可能嗎？'],
    [/太快發生關係.*酒肉情侶/, '太快發生關係有無將來？'],
    [/安全感總是填不滿/, '點解安全感總是填不滿？'],
    [/Deep Talk 點樣傾/, 'Deep Talk 點樣傾先安全？'],
    [/我討厭你就唔喺度啦/, '常見情緒勒索金句點拆？'],
    [/男朋友成日話「為你好」/, '男朋友成日話「為你好」係愛定控制？'],
    [/男朋友係大男人/, '男朋友係大男人點相處？'],
    [/男朋友對你事事挑剔/, '男朋友對你事事挑剔點算？'],
    [/覺得另一半唔夠好/, '覺得另一半唔夠好，係咪完美主義？'],
    [/覺得男朋友對 Ex 好過對自己/, '男朋友對 Ex 好過對自己點算？'],
    [/男朋友忘不了前度/, '男朋友忘不了前度點算？'],
    [/男人變心係天性/, '男人變心係天性？'],
    [/分手後如何走出傷痛/, '分手後如何走出傷痛？'],
    [/分手原因唔係性格不合/, '分手原因未必係性格不合'],
    [/女人太強 太出色/, '女人太強，對方反而不安？'],
    [/經常訊息轟炸/, '另一半訊息轟炸，點樣相處？'],
    [/有覆機有見面但覺得好空虛/, '有覆機有見面，點解仍然空虛？'],
    [/你是適合結婚嗎/, '點樣判斷對方適唔適合結婚？'],
    [/隱性家暴更可怕/, '隱性家暴有咩警號？'],
    [/控制型關愛/, '關心變成壓力，點樣分辨？'],
    [/辦公室戀情好唔好/, '辦公室戀情要注意咩？'],
    [/委屈大於愛/, '委屈大於愛，代表咩？'],
  ];
  for (const [pattern, replacement] of direct) {
    if (pattern.test(title)) return replacement;
  }

  const normalized = title.replace(/\s+/g, ' ').trim();
  if (normalized.length <= 24) return normalized;

  const questionParts = normalized.split(/([？?])/);
  if (questionParts.length >= 3) {
    const firstQuestion = `${questionParts[0].trim()}？`;
    if (firstQuestion.length >= 7 && firstQuestion.length <= 24) return firstQuestion;
    const secondQuestion = `${questionParts.slice(0, 3).join('').replace(/[?]/g, '？').trim()}`;
    if (secondQuestion.length <= 28) return secondQuestion;
  }

  const exclaimLead = normalized.split(/[！!]/)[0]?.trim();
  if (exclaimLead && exclaimLead.length >= 8 && exclaimLead.length <= 24) return `${exclaimLead}！`;

  const commaLead = normalized.split(/[，,、；;]/)[0]?.trim();
  if (commaLead && commaLead.length >= 8 && commaLead.length <= 24) return commaLead;

  return normalized;
};

const normalizeText = (value = '') => value
  .replace(/<[^>]+>/g, '')
  .replace(/[\uD800-\uDFFF]/g, '')
  .replace(/[，。！？、：；「」『』（）\[\]\s]/g, '')
  .toLowerCase();

const decorativeMarkerPattern = /(?:[✅✔☑⭕❌🚫🔎📌✉❤💔✨🈲‼❗🔺💬⭐🌟💫]+|[0-9]️⃣)/g;
const emojiPattern = /[\u{1f000}-\u{1faff}\u{2600}-\u{27bf}\ufe0f\u{1f3fb}-\u{1f3ff}\uD800-\uDFFF]/gu;

const normalizeArticleText = (value = '') => {
  let text = value
    .replace(/<aside>/gi, '')
    .replace(/<\/aside>/gi, '')
    .replace(/&lt;br\s*\/?&gt;|<br\s*\/?>/gi, ' ')
    .replace(/&lt;\/?(?:b|strong)&gt;|<\/?(?:b|strong)>/gi, '')
    .replace(/\uFFFD/g, '')
    .replace(/[\uD800-\uDFFF]/g, '')
    .replace(/^[\s　]*[\[【][^\]】]{1,24}[\]】]\s*/g, '')
    .replace(/❤️‍🩹|[0-9]️⃣/g, '、')
    .replace(decorativeMarkerPattern, '、')
    .replace(emojiPattern, '')
    .replace(/\bFollow我們的Instagram\b.*$/i, '')
    .replace(/\bFollow\s*Instagram\b.*$/i, '')
    .replace(/\badmin\b.*$/i, '')
    .replace(/\bremark\b.*$/i, '')
    .replace(/學習更多關於長期關係相處、溝通技巧、情感連結的小秘笈.*$/i, '')
    .replace(/\s*[\u200d\ufe0f]+\s*/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim();

  text = text
    .replace(/\s*([，。！？、：；])\s*/g, '$1')
    .replace(/([，。！？；：])+/g, (match) => match.at(-1) || match)
    .replace(/、{2,}/g, '、')
    .replace(/^、+|、+$/g, '')
    .replace(/([一-龥）」】）])\s+([一-龥「【（])/g, '$1，$2')
    .replace(/([一-龥])\s*=\s*([一-龥])/g, '$1等於$2')
    .replace(/：、/g, '：')
    .replace(/，([。！？；：])/g, '$1')
    .replace(/、([。！？；：，])/g, '$1')
    .replace(/([（「【])，/g, '$1')
    .replace(/，([）」】])/g, '$1')
    .replace(/，{2,}/g, '，')
    .replace(/。{2,}/g, '。')
    .replace(/([？！，；：])。/g, '$1')
    .replace(/\s+([。！？；：，、])/g, '$1')
    .replace(/([。！？；：，、])\s+/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length > 14 && /[\u4e00-\u9fff]$/.test(text) && !/[。！？]$/.test(text)) {
    text += '。';
  }
  return applyArticleTextCorrections(text);
};

const applyArticleTextCorrections = (value = '') => value
  .replace(/\beg\s*[:：]/gi, '例如：')
  .replace(/\be\.g\.\s*[:：]/gi, '例如：')
  .replace(/你，又者你嘅另一半/g, '你或者你嘅另一半，有冇試過咁諗？')
  .replace(/喺呢段親密關係入面，會唔會曾同講過以下類似嘅說話，你愛我，就應該知道我諗緊乜啦！/g, '喺親密關係入面，你或者對方有冇講過類似說話：「你愛我，就應該知道我諗緊乜啦！」')
  .replace(/你，有冇意識到/g, '你有冇意識到')
  .replace(/或又者/g, '或者')
  .replace(/令會呢段感情/g, '令呢段感情')
  .replace(/Check佢了唔了解你、估唔估得中/g, '測試佢了解唔了解你、估唔估得中')
  .replace(/慢慢句慢地/g, '慢慢地')
  .replace(/當然坦誠嘅時間耐咗了/g, '當然，坦誠需要時間累積')
  .replace(/轉彎末角/g, '轉彎抹角')
  .replace(/分辦/g, '分辨')
  .replace(/自為何乜/g, '自己為何')
  .replace(/為何乜/g, '為甚麼')
  .replace(/未得嫁出/g, '未嫁出')
  .replace(/世伯伯母/g, '伯父伯母')
  .replace(/要靚個種/g, '要靚嗰種')
  .replace(/You want to move in with me。?/g, '對方提出同居，或者你開始諗同另一半搬埋一齊。')
  .replace(/唔好令讓朋友/g, '唔好令朋友')
  .replace(/等自己機會走出/g, '等自己有機會走出')
  .replace(/就得稱讚下啲佢/g, '就可以稱讚下佢')
  .replace(/咁那樣/g, '咁樣')
  .replace(/突你破解/g, '教你破解')
  .replace(/無野/g, '無嘢')
  .replace(/面對「分手真相】/g, '面對「【分手真相】')
  .replace(/你 \/ 另一半/g, '你或者另一半')
  .replace(/Check List/g, '家務清單')
  .replace(/Checklist/g, '家務清單')
  .replace(/有啲人對家務毫無idea/g, '有啲人對家務完全冇概念')
  .replace(/要簡單直接地list出嚟/g, '要簡單直接地列出嚟')
  .replace(/個List/g, '呢張清單')
  .replace(/有張List/g, '有張清單')
  .replace(/你會唔會曾經有呢個迷思⋯⋯/g, '你有冇試過咁諗？')
  .replace(/啲野/g, '啲嘢')
  .replace(/的野/g, '的嘢')
  .replace(/嘅野/g, '嘅嘢')
  .replace(/咩野/g, '咩嘢')
  .replace(/乜野/g, '乜嘢')
  .replace(/做野/g, '做嘢')
  .replace(/講野/g, '講嘢')
  .replace(/野食/g, '嘢食')
  .replace(/食野/g, '食嘢')
  .replace(/煮野/g, '煮嘢')
  .replace(/其他野/g, '其他嘢')
  .replace(/所有野/g, '所有嘢')
  .replace(/呢件野/g, '呢件嘢')
  .replace(/依件野/g, '呢件嘢')
  .replace(/扮下野/g, '扮下嘢')
  .replace(/講左/g, '講咗')
  .replace(/比左/g, '畀咗')
  .replace(/人地/g, '人哋')
  .replace(/涷曬/g, '凍晒')
  .replace(/食嘢趙得/g, '食嘢咀嚼得')
  .replace(/黎埋/g, '嚟埋')
  .replace(/比空間/g, '畀空間')
  .replace(/比清晰/g, '畀清晰')
  .replace(/比機會/g, '畀機會')
  .replace(/想同另一半建立起更好嘅關係，就快啲。?/g, '想同另一半建立起更好嘅關係，可以先由日常分享開始。')
  .replace(/^係要通過重大事件嚟測試/g, '很多人以為信任一定要通過重大事件嚟測試')
  .replace(/可以反映到表一個人/g, '可以反映到一個人')
  .replace(/自己到慢慢/g, '自己慢慢')
  .replace(/世界未日/g, '世界末日')
  .replace(/長有承諾/g, '長期承諾')
  .replace(/不用夾急於/g, '不用急於')
  .replace(/也這這段關係/g, '也讓這段關係')
  .replace(/feel到到自己/g, 'feel到自己')
  .replace(/生活就越嚟越多采多姿/g, '生活就會越嚟越多姿多彩')
  .replace(/當佢他表達能力/g, '當佢表達能力')
  .replace(/最樂觀、最機會改善關係/g, '最樂觀、最有機會改善關係')
  .replace(/透露雙方有效嘅溝通/g, '透過雙方有效嘅溝通')
  .replace(/對持續缺乏耐性/g, '當對方持續缺乏耐性')
  .replace(/咁樣真係夠。$/g, '咁樣未必等於真正尊重。')
  .replace(/如果你也正在面對同類情況，$/g, '如果你也正在面對同類情況，可以先停低整理方向，再決定下一步。');

const cleanDescription = (value = '') => value
  .replace(/^[\s　]*[\[【][^\]】]{1,24}[\]】]\s*/g, '')
  .replace(/\uFFFD/g, '')
  .replace(/^[\s」』）\])，、。！？]+/u, '')
  .replace(/遇到「.*?」這種感情難題時，最怕急著用情緒做決定。\s*/g, '')
  .replace(/本文從.*?角度拆解關係訊號、應對方法與挽回前要留意的重點。?/g, '')
  .replace(/文中會拆解.*$/g, '')
  .split(/\r?\n/)
  .map(normalizeArticleText)
  .filter(Boolean)
  .join(' ')
  .trim();

const parseFrontmatter = (raw) => {
  if (!raw.startsWith('---')) return [{}, raw];
  const end = raw.indexOf('\n---', 3);
  if (end < 0) return [{}, raw];
  const block = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).trim();
  const data = {};
  let currentKey = null;
  for (const line of block.split(/\r?\n/)) {
    const keyMatch = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      const value = keyMatch[2].trim();
      if (!value) {
        data[currentKey] = [];
      } else {
        data[currentKey] = value.replace(/^['"]|['"]$/g, '');
      }
      continue;
    }
    const listMatch = line.match(/^\s*-\s*["']?(.*?)["']?\s*$/);
    if (listMatch && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(listMatch[1]);
    }
  }
  return [data, body];
};

const parseIndex = () => {
  const indexPath = path.join(sourceDir, '_INDEX.md');
  if (!fs.existsSync(indexPath)) {
    return { order: [], titles: new Map() };
  }
  const raw = fs.readFileSync(indexPath, 'utf8');
  const order = [];
  const titles = new Map();
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^- \[(.+?)\]\((.+?)\)/);
    if (!match) continue;
    const title = match[1].trim();
    const rawFilename = match[2].trim();
    let filename = rawFilename;
    try {
      filename = decodeURIComponent(rawFilename);
    } catch {
      filename = rawFilename;
    }
    order.push(filename);
    titles.set(filename, title);
  }
  return { order, titles };
};

const buildWebReadyTitleMap = () => {
  const titles = new Map();
  if (!fs.existsSync(webReadyDir)) return titles;
  for (const file of fs.readdirSync(webReadyDir).filter((name) => /\.md$/i.test(name))) {
    const id = file.match(/^(\d+)/)?.[1];
    if (!id) continue;
    const raw = fs.readFileSync(path.join(webReadyDir, file), 'utf8');
    const [frontmatter, body] = parseFrontmatter(raw);
    const h1 = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
    const title = frontmatter.seo_title || frontmatter.title || h1;
    if (title) titles.set(id, cleanSeoDisplayTitle(title));
  }
  return titles;
};

const buildWebReadyRawMap = () => {
  const articles = new Map();
  if (!fs.existsSync(webReadyDir)) return articles;
  for (const file of fs.readdirSync(webReadyDir).filter((name) => /\.md$/i.test(name))) {
    const id = file.match(/^(\d+)/)?.[1];
    if (!id) continue;
    const raw = fs.readFileSync(path.join(webReadyDir, file), 'utf8');
    articles.set(id, raw);
  }
  return articles;
};

const inferCategory = (title, frontmatterCategory = '') => {
  const text = `${title} ${frontmatterCategory}`;
  if (/出軌|第三者|變心|新歡|欺騙|冷暴力|家暴|操控|控制|PUA|渣男|紅旗|警號/.test(text)) return '關係危機';
  if (/復合|挽回|前任|分手後|斷聯|block|冷淡/.test(text)) return '復合挽回';
  if (/溝通|訊息|說話|講嘢|勸|道歉|冷戰|表達|分享/.test(text)) return '溝通相處';
  if (/家務|分擔|壞習慣|配合|日常主動|自動自覺/.test(text)) return '溝通相處';
  if (/安全感|不安|情緒|失戀|治癒|自信|焦慮|內心|委屈/.test(text)) return '情緒修復';
  if (/曖昧|約會|單身|桃花|吸引|主動|矜持|追求/.test(text)) return '曖昧桃花';
  if (/結婚|同居|見家長|辦公室|Long D|遠距/.test(text)) return '長期關係';
  return frontmatterCategory || '戀愛心理';
};

const imageLabelFor = (title, category) => {
  const map = {
    '復合挽回': '復合',
    '溝通相處': '溝通',
    '情緒修復': '療癒',
    '曖昧桃花': '曖昧',
    '關係危機': '警號',
    '長期關係': '長久',
    '戀愛心理': '心理'
  };
  if (map[category]) return map[category];
  return title.replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, '').slice(0, 4) || '愛情';
};

const formatInline = (text) => {
  let value = escapeHtml(normalizeArticleText(text));
  value = value.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  value = value.replace(/\[(.+?)\]\((.+?)\)/g, '<mark>$1</mark>');
  value = value.replace(/「([^」]{2,24})」/g, '「<strong>$1</strong>」');
  return value;
};

const formatHeadingInline = (text) => {
  const cleaned = normalizeArticleText(text).replace(/。+$/g, '');
  let value = escapeHtml(cleaned);
  value = value.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  value = value.replace(/\[(.+?)\]\((.+?)\)/g, '<mark>$1</mark>');
  value = value.replace(/「([^」]{2,24})」/g, '「<strong>$1</strong>」');
  return value;
};

const restoreLooseChinesePunctuation = (text = '') => {
  const value = normalizeArticleText(text);
  const hasChinese = /[\u4e00-\u9fff]/.test(value);
  const hasSpaces = /\s+/.test(value);
  if (!hasChinese || !hasSpaces || /^https?:\/\//i.test(value)) return value;

  let restored = value
    .replace(/([\u4e00-\u9fff）】」])\s+([\u4e00-\u9fff「（【])/g, '$1，$2')
    .replace(/，+/g, '，');

  if (restored.length > 14 && !/[。！？.!?」）】]$/.test(restored)) {
    restored += '。';
  }
  return restored;
};

const formatParagraph = (text) => {
  const value = restoreLooseChinesePunctuation(text);
  const factMatch = value.match(/^(真相[:：]?)(.+?)\s+Fact Check Point\s+(.+)$/i);
  if (factMatch) {
    return `<div class="article-insight">
      <div class="article-insight-label">真相</div>
      <p>${formatInline(factMatch[2])}</p>
      <div class="article-insight-label article-insight-label-soft">Fact Check Point</div>
      <p>${formatInline(factMatch[3])}</p>
    </div>`;
  }
  if (/^Fact Check Point\s+/i.test(value)) {
    return `<div class="article-insight article-insight-soft">
      <div class="article-insight-label">Fact Check Point</div>
      <p>${formatInline(value.replace(/^Fact Check Point\s+/i, ''))}</p>
    </div>`;
  }
  if (/^(重點|建議|小提醒|留意)[:：]/.test(value)) {
    return `<p class="article-keyline">${formatInline(value)}</p>`;
  }
  return `<p>${formatInline(value)}</p>`;
};

const removeDanglingCtaText = (text = '') => normalizeArticleText(text)
  .replace(/[，,、\s]*(?:如果你都有|如果你也有|如果你有)(?:類似)?(?:感情|愛情)?煩惱[。！!？?]*$/u, '')
  .replace(/[，,、\s]*如果你面對緊類似情況[，,、\s]*(?:即刻|立即)?聯絡我哋幫手[啦喇！!。]*$/u, '')
  .replace(/[，,、\s]*不如(?:試吓|搵吓|即刻|立即)?搵吓?我哋(?:研究吓|做吓儀式|幫手)?.*?[啦喇！!。]*$/u, '')
  .replace(/[，,、\s]*(?:即Check|即刻Check|立即Check)[^。！？!?]{2,80}[啦喇！!。]*$/iu, '')
  .replace(/[，,、\s]*不如\s*(?:即刻|立即)?\s*(?:Click|click|撳|按)\s*「?了解更多」?.*$/u, '')
  .replace(/[，,、\s]*想知(?:你嘅|你的)?.*?(?:點修補|下一步點行).*$/u, '')
  .replace(/(?:\s*[-—–]{2,}\s*)?(?:\(?還有[^。！？!?]{0,50}?\.\.\.\)?\s*)?(?:不想|唔想|受夠|想學|想學識|想知|想知道|懷疑自己|磨合定係|拍拖耐咗)[^。！？!?]{0,80}？$/u, '')
  .trim();

const shouldSkipLine = (line) => {
  const trimmed = normalizeArticleText(line.trim()).replace(/[*_`]/g, '');
  return (
    /^!\[.*?\]\(IMAGE_PLACEHOLDER/i.test(trimmed) ||
    /^-\s*\[.+?\]\(.+?\)\s*$/.test(trimmed) ||
    /^\[.+?\]\(.+?\)\s*$/.test(trimmed) ||
    /^https?:\/\//i.test(trimmed) ||
    /WHATSAPP_LINK_HERE/.test(trimmed) ||
    /^(admin|remark|remarks|內部備註|備註|後台)[:：]/i.test(trimmed) ||
    /^>\s*圖片建議/.test(trimmed) ||
    /^>\s*Credit/.test(trimmed) ||
    /^圖片｜/.test(trimmed) ||
    /(?:sticker|Visual|圖片|用文字\s*\+?\s*sticker|顯示出缺點)/i.test(trimmed) ||
    /^<!--.*-->$/.test(trimmed) ||
    /^同場加映[:：]?$/.test(trimmed) ||
    /^(一齊|一起)?繼續睇落去[啦喇！!。]*$/.test(trimmed) ||
    /^就等我哋話你知[啦喇！!。]*$/.test(trimmed) ||
    /^在關係裡，最令人痛苦的往往不是一件事本身/.test(trimmed) ||
    /^這篇文章會用\s*\*\*?.*?\*\*?\s*的角度/.test(trimmed) ||
    /^有些關係不是突然變壞/.test(trimmed) ||
    /^>\s*有些關係不是突然變壞/.test(trimmed) ||
    /^當你遇到「.*?」這種感情狀況/.test(trimmed) ||
    /^>\s*$/.test(trimmed) ||
    /^\[WhatsApp 聯絡我哋\]/.test(trimmed) ||
    /^所有感情問題/.test(trimmed) ||
    /^想知你嘅關係可以點修補/.test(trimmed) ||
    /^想知道呢段關係下一步/.test(trimmed) ||
    /^(?:即Check|即刻Check|立即Check)/i.test(trimmed) ||
    /^如果你面對緊類似情況[，,、\s]*(?:即刻|立即)?聯絡我哋幫手/.test(trimmed) ||
    /^不如(?:試吓|搵吓|即刻|立即)?搵吓?我哋(?:研究吓|做吓儀式|幫手)?/.test(trimmed) ||
    /^(?:不想|唔想|受夠|想學|想知|想知道|懷疑自己|磨合定係|拍拖耐咗).*？$/.test(trimmed) ||
    /^\(?還有.*?\.\.\.\)?\s*(?:不想|唔想|受夠|想學|想知|想知道).*？$/.test(trimmed) ||
    /^如果你(?:都|也)?有(?:類似)?(?:感情|愛情)?煩惱[。！!？?]*$/.test(trimmed) ||
    /^如果你(?:都|也)?有.*?煩惱[，,、\s]*(?:令你|等你|幫你|由我哋|我哋)/.test(trimmed) ||
    /^Asteria\s*提供了\s*\d+\s*條問題自測/.test(trimmed) ||
    /^本文屬感情心理/.test(trimmed) ||
    /Asteria\s*建議|非暴力溝通|邊界入侵|將「?建議」?轉化為「?支持」?|把選擇權交還|出發點是「?我覺得這對你好」?/i.test(trimmed)
  );
};

const cleanMarkdown = (body, title) => {
  const lines = body.split(/\r?\n/);
  const out = [];
  let skipSection = null;
  let skipAside = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (/<aside>/i.test(trimmed)) {
      skipAside = true;
      continue;
    }
    if (/<\/aside>/i.test(trimmed)) {
      skipAside = false;
      continue;
    }
    if (skipAside) continue;
    const heading = trimmed.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      const headingText = heading[2].replace(/^#\s*/, '').trim();
      if (/^(文章正文|內文\s*\(Web)/.test(headingText)) {
        skipSection = null;
        continue;
      }
      if (/^(AEO 快速解答|文章摘要|重點速讀|Asteria 小提醒|建議內部連結|常見問題)/.test(headingText)) {
        skipSection = heading[1].length;
        continue;
      }
      if (/^(你以為只是小事，其實是關係正在發出的訊號|關係卡住時，問題通常不只是一句說話)$/.test(headingText)) {
        continue;
      }
      if (/^(相關延伸閱讀|相關文章|延伸閱讀|你可能還想看|想知道這段關係下一步點行|如果你想挽回，先讓自己停一停)/.test(headingText)) {
        skipSection = heading[1].length;
        continue;
      }
      if (skipSection && heading[1].length <= skipSection) {
        skipSection = null;
      }
    }
    if (skipSection) continue;
    if (!trimmed) {
      if (out.length && out[out.length - 1] !== '') out.push('');
      continue;
    }
    let cleanedLine = removeDanglingCtaText(line);
    cleanedLine = cleanedLine
      .replace(/^\s*內文\s*\(Web(?:\s*[-－]\s*[^)]*)?\)[：:]\s*/u, '')
      .replace(/^\s*引言[：:]\s*/u, '');
    const isMarkdownHeading = /^\s*#{1,6}\s+/.test(cleanedLine);
    if (!cleanedLine || (!isMarkdownHeading && shouldSkipLine(cleanedLine))) continue;
    if (/^#\s+/.test(trimmed)) {
      continue;
    }
    if (/^##\s+#/.test(cleanedLine.trim())) continue;
    out.push(cleanedLine.replace(/^(\s*#{1,6}\s+)(.+)$/u, (_, prefix, text) => `${prefix}${normalizeArticleText(text)}`));
  }
  return out.join('\n')
    .replace(/讀到這[裏裡][，,][\s\S]{0,120}?設下界線。/g, '')
    .trim();
};

const isGeneratedIntroLine = (line = '') => /^面對「.*?」，不要只看單一說話或一刻感覺.*?重點是分清這是短暫情緒、長期相處模式/.test(
  normalizeArticleText(line)
) || /^面對「.*?」，不要只看單一說話或一刻感覺.*?(?:先分清|重點是分清)這是短暫情緒/.test(
  normalizeArticleText(line)
);

const stripGeneratedIntro = (markdown = '') => {
  const lines = markdown.split(/\r?\n/);
  const out = [];
  let removed = false;
  for (const line of lines) {
    if (!removed && isGeneratedIntroLine(line)) {
      removed = true;
      continue;
    }
    out.push(line);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
};

const plainMarkdownText = (value = '') => normalizeArticleText(value
  .replace(/^[-*]\s+/u, '')
  .replace(/^#{1,6}\s+/u, '')
  .replace(/\*\*/g, '')
  .replace(/__+/g, '')
  .replace(/`/g, '')
);

const removeMarkdownSection = (markdown = '', headingPattern) => {
  const lines = markdown.split(/\r?\n/);
  const out = [];
  let skipping = false;
  for (const line of lines) {
    const heading = line.match(/^(#{2})\s+(.+)$/);
    if (heading && headingPattern.test(plainMarkdownText(heading[2]))) {
      skipping = true;
      continue;
    }
    if (skipping && /^##\s+/.test(line)) {
      skipping = false;
    }
    if (!skipping) out.push(line);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
};

const balancedQuotes = (value = '') => (
  (value.match(/[「『]/g) || []).length === (value.match(/[」』]/g) || []).length
);

const shortenAtNaturalBreak = (value = '', max = 86) => {
  const clean = normalizeArticleText(value);
  if (clean.length <= max) return clean;
  const parts = clean.split(/(?<=[，,、；;：:])/u)
    .map((part) => part.trim())
    .filter(Boolean);
  let out = '';
  for (const part of parts) {
    if ((out + part).length > max) break;
    out += part;
  }
  if (!out || !balancedQuotes(out)) return '';
  return out.replace(/[，,、；;：:]+$/u, '。');
};

const firstCompleteSentence = (value = '', { min = 24, max = 96 } = {}) => {
  const sentences = splitCompleteSentences(value);
  let output = '';
  for (const sentence of sentences) {
    if (!balancedQuotes(sentence)) continue;
    if (sentence.length > max) {
      const shortened = shortenAtNaturalBreak(sentence, max);
      if (shortened.length >= min) return shortened;
      continue;
    }
    if (!output) {
      output = sentence;
      if (output.length >= min) break;
      continue;
    }
    if ((output + sentence).length > max) break;
    output += sentence;
    if (output.length >= min) break;
  }
  return output && balancedQuotes(output) ? output : '';
};

const isGenericHighlightHeading = (heading = '') => /^(先看常見情境|例子|感情拯救所話你知|Asteria 小提醒|常見問題)$/u.test(
  normalizeArticleText(heading)
);

const conciseHighlightText = (heading = '', text = '') => {
  const cleanHeading = normalizeArticleText(heading)
    .replace(/[：:]+$/u, '')
    .replace(/^迷思\s*[0-9一二三四五六七八九十]+[:：]\s*/u, '')
    .replace(/\s+/g, ' ')
    .trim();
  const cleanText = normalizeArticleText(text)
    .replace(new RegExp(`^${cleanHeading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[：:]?\\s*`, 'u'), '')
    .replace(/\s+/g, ' ')
    .trim();

  const sentence = firstCompleteSentence(cleanText, { min: 12, max: 34 }) || shortenAtNaturalBreak(cleanText, 34);
  if (sentence && sentence.length <= 38) return sentence;

  const fallback = cleanText
    .split(/[，,。！？!?；;]/u)[0]
    ?.replace(/[「」『』]/g, '')
    .trim();
  if (fallback && fallback.length >= 8) {
    return `${fallback.slice(0, 34)}${fallback.length > 34 ? '' : '。'}`;
  }
  return '';
};

const buildHighlightMarkdown = (markdown = '') => {
  const sections = [];
  let current = null;
  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      const title = plainMarkdownText(heading[1]);
      if (/^(重點速讀|Asteria 小提醒|常見問題)$/.test(title)) {
        current = null;
      } else {
        current = { heading: title, text: '' };
        sections.push(current);
      }
      continue;
    }
    if (!current || /^#{1,6}\s+/.test(line)) continue;
    if (!current.text && !/^[-*]\s+/.test(line)) {
      current.text = plainMarkdownText(line);
    }
  }

  const bullets = sections
    .filter((section) => section.heading.length >= 3 && section.text.length >= 12 && !isGenericHighlightHeading(section.heading))
    .map((section) => {
      const heading = normalizeArticleText(section.heading)
        .replace(/[「」『』]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      const sentence = conciseHighlightText(heading, section.text);
      return sentence ? `- ${sentence}` : '';
    })
    .filter(Boolean)
    .slice(0, 4);

  if (bullets.length < 2) return '';
  return ['## 重點速讀', '', ...bullets].join('\n');
};

const repairGeneratedArticleMarkdown = (markdown = '') => {
  const withoutIntro = stripGeneratedIntro(markdown);
  const withoutGeneratedDepth = [
    /^再看深一層[:：]/,
    /^再看清楚[:：]/,
    /^再落地看[:：]/,
    /^下一步不要急著做錯$/,
    /^你可以先觀察三個位置$/,
    /^再觀察[:：]/,
    /^再整理[:：]/,
    /^再判斷[:：]/,
    /^再拆深一點[:：]/
  ].reduce((current, pattern) => removeMarkdownSection(current, pattern), withoutIntro);
  const withoutHighlights = removeMarkdownSection(withoutGeneratedDepth, /^重點速讀$/);
  const highlight = buildHighlightMarkdown(withoutHighlights);
  if (!highlight) return withoutHighlights;

  if (/^##\s+Asteria 小提醒/m.test(withoutHighlights)) {
    return withoutHighlights.replace(/^##\s+Asteria 小提醒/m, `${highlight}\n\n## Asteria 小提醒`);
  }
  return `${withoutHighlights}\n\n${highlight}`;
};

const polishSpecificArticleMarkdown = (title, markdown) => {
  if (/^036\b|拒做渣男磁石|爛桃花/.test(title)) {
    return [
      '如果你總是遇到爛桃花，問題未必只是運氣不好。有些人會被不穩定、不負責任、只講不做的人吸引，並不是因為自己想受傷，而是內心某些相處模式，會令你比較容易心軟、比較容易替對方找藉口，也比較難在早期抽身。',
      '',
      '這篇不是要你責怪自己，而是幫你看清楚：為甚麼明知對方不適合，你仍然會被牽住走；為甚麼對方給少少甜頭，你就會忍不住再給機會；又為甚麼有些人一靠近你，就很容易佔你便宜。',
      '',
      '## 共依附會令你明知不適合，仍然捨不得離開',
      '',
      '所謂共依附，不是單純太愛一個人，而是你很容易把自己的價值感，綁在一段關係有沒有被需要、被選擇、被挽留上。當你心裡很怕失去，就算遇到爛桃花，也可能會覺得「有總好過無」。',
      '',
      '於是即使對方忽冷忽熱、承諾很多但行動很少，或者你其實沒有那麼喜歡他，你仍然會因為不想孤單、不想被放棄，而繼續給對方機會。這樣不是你傻，而是你太習慣用關係證明自己值得被愛。',
      '',
      '## 自信不足，會令你過度包容錯的人',
      '',
      '如果你常常覺得自己不夠好，很容易會把對方的少少關心放大成愛。你會擔心一旦拒絕、離開、設界線，就再沒有人願意要你，所以即使對方表現很差，你都會不停幫他解釋。',
      '',
      '但真正健康的感情，不需要你靠委屈自己去換。你可以體諒一個人，但不代表要長期容忍失望；你可以給機會，但不代表要把自己的底線一再降低。',
      '',
      '## 太心軟，容易令爛桃花誤會自己有機會',
      '',
      '有些人不是刻意曖昧，而是太不懂拒絕。對方約你，你不好意思推；對方訴苦，你忍不住安慰；對方越界，你怕尷尬所以笑一笑帶過。這些反應在你心裡只是禮貌，但在某些人眼中，可能會被解讀成有機會。',
      '',
      '所以面對你不想發展的人，溫柔不代表要含糊。越早講清楚，越能避免對方繼續試探，也越能保護自己不被拖進不必要的情感糾纏。',
      '',
      '## 不要迷信爛桃花面相，真正要看你的界線',
      '',
      '坊間會講爛桃花面相，但感情裡真正重要的，通常不是外貌，而是你的界線是否清楚。容易吸引爛桃花的人，往往不是因為長相有問題，而是太容易被甜言蜜語打動、太怕拒絕人、太快相信對方已經改變。',
      '',
      '如果你想減少爛桃花，第一步不是改變外表，而是改變篩選方式。不要只看對方有沒有追你、會不會講好聽說話，而要看他是否尊重你、是否言行一致、是否願意在你拒絕時仍然保持分寸。',
      '',
      '## 感情拯救所話你知',
      '',
      '爛桃花不一定是無緣無故靠近你。有時候，是你太容易被需要感打動，太容易在早期放低界線，才令不適合的人一直留在你身邊。',
      '',
      '真正要改的，不是令自己變冷漠，而是學會在心軟之前先問自己：我是真的喜歡這個人，還是只是害怕失去一個選擇？當你開始懂得篩選、拒絕和保護自己，爛桃花自然會少很多。'
    ].join('\n');
  }
  if (/關係進入冷淡期怎麼辦|重新拉近距離的方法/.test(title)) {
    return [
      '關係進入冷淡期，不一定代表你們已經不愛。很多感情去到穩定階段，都會由一開始的高熱度，慢慢變成日常陪伴。以前一有空就想見面、訊息秒回、甚麼小事都想分享；後來大家開始忙、開始累、開始覺得相處變得平淡，你自然會擔心：這段關係是不是正在變淡？',
      '',
      '真正需要分辨的，不是激情有沒有下降，而是你們還有沒有願意靠近對方。如果只是少了新鮮感，但仍然關心、仍然願意安排時間、仍然想解決問題，這段關係仍然有調整空間。但如果冷淡背後是長期忽視、逃避溝通、對你的感受完全沒有反應，就不能只用「冷淡期」三個字安慰自己。',
      '',
      '## 冷淡期不是無愛，而是關係進入穩定期',
      '',
      '熱戀期的心動很強，因為大腦會被新鮮感和期待感推動。可是沒有人可以永遠停留在熱戀最高點。當關係穩定下來，激情自然會回落，取而代之的是習慣、安全感和生活節奏。',
      '',
      '這個階段最容易誤會對方不再愛自己，因為感覺不像以前那麼濃烈。但成熟的愛情不是永遠刺激，而是在平淡裡仍然願意選擇對方。你要看的，是對方是否還願意回應你、理解你，以及一起為關係做一點調整。',
      '',
      '## 先不要用焦慮逼對方證明愛你',
      '',
      '一覺得對方冷淡，很多人會忍不住追問：「你係咪唔愛我？」、「你係咪變咗？」這些問題背後其實是想要安全感，但對方聽起來很容易變成壓力，最後越問越冷。',
      '',
      '比較好的做法，是先把情緒放慢一點，用具體感受代替指控。例如你可以說：「我最近覺得我哋少咗好好相處嘅時間，我有啲唔安。今個星期可唔可以留一晚一齊食飯？」這樣講，對方比較容易知道可以怎樣回應，而不是只感覺被審問。',
      '',
      '## 重新拉近距離，要由小互動開始',
      '',
      '冷淡期不一定要靠很大的行動修補。很多時候，一段關係是由小互動慢慢回溫：一起吃一餐不看電話的飯、睡前講幾句真心話、每星期安排一個固定相處時間，或者重新分享日常裡的小事。',
      '',
      '重點不是活動有多浪漫，而是讓大家重新感覺到「我仍然在你生活裡」。如果你們已經很久沒有真正聊天，不需要一開口就談很深的問題，可以先由輕鬆、低壓、容易回應的互動開始。',
      '',
      '## 要分清冷淡期，還是對方已經停止投入',
      '',
      '如果你放慢之後，對方仍然願意回應、願意見面、願意一起改善，那多數只是關係需要重新經營。但如果你每次提出感受，對方都避開、敷衍、甚至怪你太煩，而他自己完全沒有任何行動，這就不只是普通冷淡期。',
      '',
      '一段關係可以平淡，但不能長期只有你一個人努力。你可以主動一次、溫柔表達一次、給對方一點空間，但也要看清楚他有沒有接住你的善意。',
      '',
      '## 感情拯救所話你知',
      '',
      '冷淡期不可怕，可怕的是兩個人都假裝沒事，然後讓距離越拉越遠。真正值得修補的關係，不是永遠熱烈，而是兩個人都願意在平淡裡重新靠近、重新更新相處方式。',
      '',
      '如果你已經試過表達、放慢、創造相處時間，但對方仍然完全沒有回應，就要認真想清楚：這段關係是需要經營，還是你正在一個人硬撐。'
    ].join('\n');
  }
  if (/男人為什麼常用冷暴力|點解男人成日冷暴力|唔肯溝通/.test(title)) {
    return [
      '男人用冷暴力，不一定代表他真的冷靜。有些人一遇到衝突，就會選擇沉默、失蹤、已讀不回，或者用很冷淡的態度避開問題。表面上好像只是想安靜，其實對另一半來說，這種不回應會令人很不安，也會令關係慢慢變得更疏離。',
      '',
      '冷暴力最辛苦的地方，是它不一定有大聲爭吵，卻會讓你一直猜：他是不是嬲？是不是不愛了？是不是想分手？如果每次問題一出現，對方都用沉默令你自己消化，這就不只是溝通風格不同，而是關係裡的壓力被丟回你一個人身上。',
      '',
      '## 冷暴力不是冷靜，而是逃避溝通',
      '',
      '真正的冷靜，是大家先停一停，等情緒降溫之後再回來處理問題。冷暴力不同，它是把對話中斷，讓另一半沒有機會理解發生甚麼事，也沒有機會一起修補。',
      '',
      '如果對方只是說「我想靜一靜」，但之後願意回來講清楚，這未必是冷暴力。真正要小心的是，他每次都用沉默令你道歉、令你不敢再提需要，甚至令你開始懷疑是不是自己太煩。',
      '',
      '## 為甚麼有些男人會用沉默處理衝突',
      '',
      '有些男人不擅長表達情緒，一吵架就覺得講多錯多，所以乾脆收聲。有些人則是怕面對責任，知道自己一開口就要解釋、道歉或承擔，於是用沉默拖過去。',
      '',
      '也有人從小就習慣把情緒收起來，遇到壓力時第一反應不是溝通，而是逃開。這些原因可以幫你理解他的反應，但不等於你要無限包容。理解原因，不代表合理化傷害。',
      '',
      '## 你要看他沉默之後有沒有回來修補',
      '',
      '判斷冷暴力嚴不嚴重，不是只看他沉默了多久，而是看沉默之後有沒有回來處理。健康的做法，是他冷靜後願意講清楚自己剛才發生甚麼事、願意聽你感受，也願意一起調整下次怎樣溝通。',
      '',
      '如果每次都是你主動找他、你低頭、你哄返他，而真正問題完全沒有被處理，這段關係就會慢慢變成你一個人維持。久而久之，你會越來越不敢講真話，因為你知道一講，他又會消失。',
      '',
      '## 面對冷暴力，先不要追到自己失控',
      '',
      '當對方突然不說話，你很自然會想追問、解釋、傳很多訊息，希望快點得到答案。但如果對方正在用沉默掌控節奏，你越追，他越容易退；你越慌，他越不用面對問題。',
      '',
      '比較好的做法，是先用一句低壓但清楚的說話留窗口，例如：「我知道你而家未必想講，但我唔想用消失處理問題。你冷靜後，我希望今晚或聽日可以講清楚。」這樣既沒有追逼，也沒有放棄自己的需要。',
      '',
      '## 不是所有沉默都值得等',
      '',
      '如果對方只是一時情緒太滿，冷靜後會回來修補，這段關係仍然有調整空間。但如果他長期用冷暴力懲罰你、控制你，或者令你每次都要放低底線先可以和好，你就要認真保護自己。',
      '',
      '你可以給對方機會學習溝通，但不要把所有責任攬上身。愛情不是一個人不停猜、等、忍，而是兩個人都願意面對問題。',
      '',
      '感情拯救所話你知：面對冷暴力，最重要不是即刻判斷分不分手，而是看清它是不是反覆出現的相處模式。你可以表達需要，也可以給對方冷靜時間，但你不需要長期活在不被回應的關係裡。'
    ].join('\n');
  }
  if (/分手後還有聯絡\s*就代表有復合機會/.test(title)) {
    return [
      '分手後還有聯絡，確實可能代表你們之間仍有情緒連結，但它不等於一定有復合機會。很多人會把「仲有聯絡」、「仲會關心」、「偶爾曖昧」理解成對方未放低，於是開始期待關係會自然回到以前。但真正要判斷的，不是你們有沒有聊天，而是這些聯絡有沒有方向、有沒有修補、有沒有雙方都願意面對問題。',
      '',
      '和平分手後繼續 keep 住曖昧，最令人辛苦的地方，是它不像徹底斷聯那樣清楚。你會忍不住想：如果對方完全冇意思，點解仲要覆我？點解仲會問候我？但有時對方聯絡你，可能只是習慣、愧疚、孤單，或者不想一下子失去熟悉的人，未必等於他已經準備好重新開始。',
      '',
      '## 有聯絡，不等於有復合方向',
      '',
      '如果分手後仍然每日聯絡、間中講笑、甚至有少少曖昧，這代表你們之間未必完全斷開。但「未斷開」和「想復合」是兩回事。前者只是情緒和習慣仍在，後者需要對方願意重新投入、重新承擔，並且願意處理當初分開的原因。',
      '',
      '所以不要只看對方有沒有回覆，而要看對方回覆之後有沒有推進。只是閒聊、關心近況、偶爾講曖昧說話，通常只代表關係還有餘溫；如果對方開始主動談到過去問題、問你近況背後的感受，或者願意安排認真見面溝通，復合可能性才比較值得觀察。',
      '',
      '## 你們有沒有認真談過分開原因？',
      '',
      '分手後最重要的一個判斷位，是你們有沒有重新談過當初為甚麼分開。如果只是用關心包裝聯絡，卻一直避開真正問題，那段互動很容易停留在互相陪伴、互相留戀，而不是修補。',
      '',
      '真正有意義的溝通，通常會觸及幾件事：當初大家受傷的位置、可以怎樣避免重複、如果重新開始要怎樣相處。這些話題未必浪漫，甚至有點沉重，但它們才是復合能不能走得長的關鍵。',
      '',
      '如果你們只是一直講近況、講笑、講掛住，但一提到關係問題對方就避開，這不一定是沒有感情，而是對方未必有準備面對復合需要付出的責任。',
      '',
      '## 主動是否雙向，而不是你一個人撐住',
      '',
      '另一個很重要的訊號，是聯絡是否雙向。如果每次都是你開話題、你約見面、你試探對方心意，而對方只是有空就回、無聊就聊，這更像是你在維持連結，而不是兩個人一起走近。',
      '',
      '真正有復合空間的聯絡，通常不會長期只有一方出力。對方可能未必很快講明想復合，但他會有行動：主動找你、記得你講過的事、願意解釋近況、在你退後時仍然想保持連結。這些穩定行動，比一句「我都有掛住你」更有參考價值。',
      '',
      '如果你發現自己一停下來，整段聯絡就停了，那就要小心：你維持的可能不是復合機會，而是自己不捨得放手的希望。',
      '',
      '## 根源問題沒有處理，復合也容易再分開',
      '',
      '有些情侶分手後仍然有感情，所以很容易因為一時不捨得而重新走近。但如果當初令你們分開的問題沒有改變，復合之後很大機會只是重複同一個循環。',
      '',
      '例如以前是溝通方式出問題，復合前就要看大家是否願意學會好好講；以前是安全感和信任出問題，就要看對方是否願意用行動慢慢重建；以前是其中一方不想承擔，就要看這次是否真的有承擔的意願。',
      '',
      '復合不是回到以前，而是用新的相處方式重新開始。如果你們只是因為掛住對方而靠近，卻沒有任何實際調整，那段關係很可能只是短暫回溫，之後又再痛一次。',
      '',
      '## 可以期待，但不要急住把聯絡當承諾',
      '',
      '分手後還有聯絡，可以是一個觀察窗口，但不應該太快被你當成承諾。你可以留意對方，也可以保持溫和互動，但同時要守住自己的節奏，不要因為一兩句關心就重新把所有希望放回對方身上。',
      '',
      '比較成熟的做法，是先觀察一段時間：對方有沒有穩定主動、是否願意談真正問題、你們互動後是更清楚還是更混亂。如果聯絡令你長期內耗、反覆猜測、情緒被拉扯，那就算有聯絡，也未必是一個健康的復合訊號。',
      '',
      '感情拯救所告訴你：有聯絡不等於有未來，持續曖昧也不代表一定要復合。但如果你們雙方心裡仍然不捨得，又願意面對問題、解決問題，這段關係仍然可以有重新整理的空間。',
      '',
      '## 重點速讀',
      '',
      '- 分手後還有聯絡，只能代表仍有連結，不等於一定想復合。',
      '- 真正的復合訊號，要看對方有沒有願意談分開原因和修補方法。',
      '- 如果一直只有你主動，這可能只是你未放低，不一定是雙方都有機會。',
      '- 根源問題沒有處理，就算復合也很容易重複同一個分手循環。',
      '',
      '## Asteria 小提醒',
      '',
      '讀到這裏，最重要不是急著用「有聯絡」去證明自己仍有機會。你可以先把互動放慢一點，看清楚對方是習慣性靠近，還是真的願意為復合做出修補和承擔。'
    ].join('\n');
  }
  if (/你以為幫緊對方\s*但其實增加緊佢壓力/.test(title)) {
    return [
      '都市人壓力大，久唔久都會心情差、情緒低落，甚至憂鬱。當你愛的人長期陷入低潮，你自然會想幫他快點好起來。但在親密關係裡，幫助不一定等於即刻解決問題；有時你越急住分析、追問、給建議，對方反而會感到更大壓力。',
      '',
      '這篇想拆解的，不是叫你完全不理對方，而是幫你分清：甚麼時候需要陪伴、甚麼時候要給空間、甚麼時候你也要保護自己。',
      '',
      '## 對方情緒低落時，先不要急著解決',
      '',
      '當另一半愁眉苦臉，你可能會很自然地想問：「發生咩事？」、「你講出嚟啦」、「不如你試下咁做」。這些說話背後通常是關心，但對一個正在低潮的人來說，太快被追問或被分析，可能會變成另一種壓力。',
      '',
      '心理學上很多伴侶互動研究都指出，人在情緒低落時，最先需要的往往不是解決方案，而是被接住。擁抱、安靜陪伴、簡單一句「我喺度」有時比一大堆建議更有用，因為對方當下不是未必知道道理，而是暫時沒有力氣面對道理。',
      '',
      '## 允許對方有負面情緒',
      '',
      '如果你一見到對方不開心，就急住叫他正面一點、想開一點、不要再沉落去，對方可能會覺得自己的情緒不被接受。久而久之，他甚至會更不想在你面前表達真實感受。',
      '',
      '健康關係不是永遠正能量，而是容得下正面和負面情緒。你可以提醒對方你願意陪他，但不需要立刻把低潮清走。很多時候，讓對方知道「你可以不開心，我不會因此否定你」，本身已經是一種很重要的支持。',
      '',
      '## 保持沉默，不等於不愛',
      '',
      '有些低潮時刻，不需要一直說話。沉默不一定是冷漠，也可以是一種尊重。尤其當對方很累、很混亂、暫時不想解釋時，你的安靜陪伴可能比不停追問更安全。',
      '',
      '當然，沉默不是完全消失，而是用低壓方式在場。你可以簡單講：「你想講我會聽，你想靜一靜我都喺度。」這類回應不會逼對方交代，同時又讓他知道自己不是孤單一個人。',
      '',
      '## 給對方空間，也要保留溝通窗口',
      '',
      '有些人情緒低潮時會回訊息很慢，甚至已讀不回。這不一定代表他不在乎你，而可能是他暫時沒有力氣即時回應。對於有焦慮、抑鬱或創傷經驗的人來說，即時訊息本身也可能帶來壓力。',
      '',
      '你可以體諒對方需要空間，但也不代表你要無限度忍受不清不楚。比較成熟的做法，是先約定一個低壓溝通方式，例如：「你需要靜可以同我講一聲，我不會逼你即刻傾，但我也需要知道你不是突然消失。」這樣既照顧對方，也照顧自己。',
      '',
      '## 長期陪伴時，你也要守住自己',
      '',
      '陪伴一個情緒長期低落的人，最難的是你很容易把對方的快樂變成自己的責任。當你覺得「如果他不好，就是我做得不夠」，你會慢慢被拉進對方的低潮裡。',
      '',
      '所以你需要分清界線：你可以陪伴、理解、提供支援，但你不能代替對方復原。如果對方情緒嚴重影響生活，或出現明顯抑鬱、創傷、失控狀態，真正有幫助的可能是陪他尋找可信賴的專業支援，而不是只靠你一個人硬撐。',
      '',
      '## 小心同理心變成自我消耗',
      '',
      '同理心很珍貴，但沒有界線的同理心會令人受傷。你可以感受對方痛苦，但不需要把那份痛苦全部放到自己身上。當你發現自己因為對方低潮而長期失眠、焦慮、失去生活節奏，就代表你也需要停一停。',
      '',
      '真正長久的陪伴，不是你燃燒自己去照亮對方，而是你在能力範圍內穩定地存在。你照顧好自己，才有力氣用更溫柔、更清醒的方法陪對方走過低潮。',
      '',
      '感情拯救所話你知：當另一半的情緒問題成為日常，你要做的不是把自己變成治療師，而是學會陪伴、保持界線、適時溝通，並在需要時尋求專業協助。你願意和對方一起承擔，已經很重要；但你也不需要因為對方低潮，就放棄自己的快樂和安全感。',
      '',
      '## 重點速讀',
      '',
      '- 對方情緒低落時，最先需要的未必是建議，而是被理解和陪伴。',
      '- 允許負面情緒存在，比急住叫對方正面更容易令關係安全。',
      '- 給對方空間之餘，也要保留基本溝通窗口，避免自己長期不安。',
      '- 長期陪伴要有界線，你可以支持對方，但不能代替對方復原。',
      '',
      '## Asteria 小提醒',
      '',
      '如果你發現自己每次都想救對方、替對方解決所有情緒，反而可以先問自己：我是在陪伴，還是在用焦慮控制局面？分清這一點，才不會把好意變成壓力。'
    ].join('\n');
  }
  if (/熱戀期過後無野講|冷淡期.*重燃愛火|關係轉淡不要怕/.test(title)) {
    return [
      '熱戀期過後無話題、少了心跳、相處變得平淡，不一定代表你們已經不愛。很多關係去到穩定期，都會由一開始的高刺激，慢慢變成日常陪伴。真正需要判斷的，不是激情有沒有下降，而是你們還願不願意為關係注入新的互動。',
      '',
      '初初一齊時，兩個人可能日日傾電話、見面不捨得走，連小事都想分享。去到後來，食飯各自看電話，放工回家只想休息，你自然會驚：「我哋係咪已經無愛？」但冷淡期未必是分手訊號，它也可以是一個提醒：關係需要由熱戀，轉入更成熟的經營方式。',
      '',
      '## 冷淡期不是無愛，而是激情回落',
      '',
      '熱戀期的強烈感覺，和大腦入面的多巴胺、苯乙胺等化學反應有關。這些反應會令人覺得對方特別吸引，訊息一來就開心，見不到面就掛住。',
      '',
      '但大腦不可能長期維持最高刺激狀態。當關係穩定下來，激情自然會回落，取而代之的是習慣、安全感和生活節奏。這不是壞事，只是你們不再靠「新鮮」維持關係，而要開始靠「選擇」和「經營」維持親密。',
      '',
      '## 第一件事：接受平淡，不要急著製造危機',
      '',
      '很多人一感覺關係變淡，就會很焦慮，甚至用吵架、試探、冷淡去確認對方還在不在乎自己。但這樣做只會令原本可以修補的冷淡期，變成真正的關係壓力。',
      '',
      '平淡不一定等於無聊，它有時代表你們已經有一定安全感。你要做的不是否定平淡，而是分清：這是正常穩定期，還是大家真的停止投入。如果只是少了刺激，可以慢慢加回互動；如果是長期忽視、逃避、沒有關心，就需要認真溝通。',
      '',
      '## 第二件事：創造新的共同經歷',
      '',
      '大腦喜歡新鮮感。關係進入冷淡期時，不一定要靠大旅行或昂貴禮物才能回溫，反而可以由一些「未試過的小事」開始。',
      '',
      '例如每個月一起做一件新的事：去一間未去過的餐廳、學一個小手作、行一條新的路線、一起做運動、一起完成一個小挑戰。重點不是活動有幾特別，而是你們重新有「一起經歷」的感覺。',
      '',
      '新鮮感最有用的地方，是令你重新看見對方不同的一面。當你們只剩下返工、食飯、睡覺，關係自然會變成例行公事；但當你們一起經歷新場景，互動就會重新有活力。',
      '',
      '## 第三件事：重啟細小儀式感',
      '',
      '儀式感不是浮誇，也不是一定要紀念日大餐。真正有用的儀式感，是一些穩定、細小、但能提醒彼此「我們仍然重視這段關係」的動作。',
      '',
      '例如出門前抱一抱、睡前講一句晚安、每星期留一餐不看電話的飯、紀念日寫幾句真心話。這些小事看似普通，但長期累積，就像感情保溫瓶，令關係不會因為日常忙碌而慢慢變冷。',
      '',
      '## 第四件事：重新練習分享生活',
      '',
      '冷淡期最常見的變化，是分享慾下降。以前看到一件小事都想講給對方聽，後來覺得講了也沒反應，於是慢慢收起自己。當兩個人都不再分享，關係就會變得像室友。',
      '',
      '想重新拉近距離，可以由很小的分享開始，不需要一開口就談很深的關係問題。可以講今天發生的小事、看到的笑話、心情一點點變化。重點是讓對方重新進入你的日常，而不是等到爆發時才一次過傾全部問題。',
      '',
      '## 第五件事：把冷淡講出來，但不要用指責開場',
      '',
      '如果你真的覺得關係越來越淡，可以講，但不要一開口就說「你變咗」、「你唔愛我」。這些句子會令對方防衛，最後討論不成，變成吵架。',
      '',
      '可以改成：「我最近覺得我哋少咗好好相處嘅時間，我有啲唔安。可唔可以今個星期留一晚一齊食飯，不看電話？」這樣講，焦點會由責備變成具體修補，對方也比較容易知道可以怎樣做。',
      '',
      '感情拯救所話你知：冷淡期不可怕，可怕的是兩個人都假裝沒事，然後讓距離越拉越遠。真正成熟的關係，不是永遠熱烈，而是在平淡裡仍然願意選擇對方、靠近對方、一起更新相處方式。',
      '',
      '## 重點速讀',
      '',
      '- 冷淡期不一定代表無愛，很多時候只是熱戀激情自然回落。',
      '- 不要用吵架或試探製造刺激，先分清是正常平淡還是真正忽視。',
      '- 新的共同經歷可以重新製造連結，讓你們不只活在例行日常裡。',
      '- 細小儀式感和生活分享，比一次大動作更能長期保溫關係。',
      '',
      '## Asteria 小提醒',
      '',
      '如果你覺得關係變淡，先不要急著判定感情完結。可以先看你們是否仍願意安排時間、回應彼此需要，以及一起嘗試新的相處方式。願意一起調整，往往比激情本身更能反映關係是否還有生命力。'
    ].join('\n');
  }
  return markdown;
};

const shortTopicFromTitle = (title = '') => {
  const cleaned = cleanTitle(title)
    .replace(/[!！?？]+$/g, '')
    .replace(/[：:｜|].*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const questionLead = cleaned.split(/[？?！!]/)[0]?.trim();
  if (questionLead && questionLead.length >= 8 && questionLead.length < cleaned.length) {
    return questionLead;
  }
  if (cleaned.length > 32) {
    const phraseLead = cleaned.split(/[，,、；;]/)[0]?.trim();
    if (phraseLead && phraseLead.length >= 8 && phraseLead.length < cleaned.length) return phraseLead;
  }
  return cleaned;
};

const buildArticleFaqMarkdown = ({ title, category, summary }) => {
  const topic = shortTopicFromTitle(title) || '呢段關係';
  const text = `${title} ${category} ${summary}`;

  const questionSets = {
    reply: [
      ['對方少覆或冷淡係咪代表冇機會？', `唔一定。少覆可能係情緒退後、壓力、逃避衝突，亦可能係感情降溫。重點係觀察佢冷淡持續幾耐、會唔會主動補返，以及你每次追問後關係有冇更緊。`],
      ['我應該繼續追問定暫停？', `通常唔建議不停追問。可以先穩住情緒，用一兩句清楚表達感受，再留空間俾對方回應；如果對方長期避開，就要重新評估互動模式。`],
      ['Asteria 可以點幫我判斷？', `我哋會幫你拆對方心態、關係卡位同訊息策略，睇下應該拉近、放慢、定先守住距離，避免越急越推遠。`]
    ],
    reunion: [
      ['仲有機會挽回或復合嗎？', `要睇分開原因、對方而家抗拒程度、你哋仲有冇情緒連結。復合唔係只靠多傳幾句訊息，而係先判斷窗口位同重新建立安全感。`],
      ['第一步應該做咩？', `第一步通常唔係即刻求答案，而係先停低整理情緒、分清假性分手定真性切斷，再決定係保持聯絡、短暫斷聯，定用較低壓方式重新開口。`],
      ['塔羅或儀式可以點樣配合？', `塔羅可以幫你睇清對方狀態、阻礙同下一步方向；儀式就要按個案判斷適唔適合配合，唔應該盲目亂做。`]
    ],
    communication: [
      ['這算溝通問題定感情變淡？', `兩者有時會重疊。要分清對方係聽唔明、唔想面對、情緒太滿，定已經對關係投入下降，先可以決定點講先有效。`],
      ['我應該點講先唔會令對方防衛？', `避免一開口就指責，可以先講具體事件、自己感受同希望對方做到的一件小事。訊息越短、越清楚，對方越容易聽得入耳。`],
      ['Asteria 可以幫我改訊息嗎？', `會。我哋其中一個重點就係幫你 review 對話，逐句睇邊句會推遠對方、邊句可以令互動舒服啲，再教你點樣回應。`]
    ],
    crisis: [
      ['這算關係危機警號嗎？', `有機會係。尤其涉及第三者、控制、冷暴力、欺騙或長期失衡時，唔好只睇對方一句解釋，要睇佢行為有冇持續、係咪願意修補。`],
      ['我應該即刻攤牌嗎？', `唔一定。未清楚對方心態前，太急攤牌可能令佢防衛或反咬。可以先收集訊號、穩住自己，再決定用柔和試探、直接溝通，定先保護自己。`],
      ['塔羅可以點樣睇背後狀態？', `可以用嚟整理對方真實狀態、你哋關係阻礙同下一步風險，但重要決定仍然要配合現實行為一齊判斷。`]
    ],
    emotion: [
      ['這代表我太情緒化嗎？', `唔一定。感情入面會不安、委屈、放唔低都好正常，問題唔係有情緒，而係情緒會唔會令你失去方向、做出令自己後悔的反應。`],
      ['好辛苦時可以點穩住自己？', `先唔好逼自己即刻放低。可以減少反覆翻睇對話、記低真正觸發位，再一步步整理你想要的是復合、答案，還是情緒出口。`],
      ['Asteria 可以點樣陪我處理？', `可以。我哋唔係只做占卜或儀式，也會陪你整理近況、情緒同相處盲點，幫你喺最亂時先搵返方向。`]
    ],
    ambiguous: [
      ['曖昧卡住時應該點判斷？', `唔好只睇甜言蜜語，要睇對方有冇穩定投入、主動安排見面、願意推進關係。如果長期只享受曖昧但唔承擔，就要小心。`],
      ['主動少少會唔會好似低價值？', `主動唔等於低價值，關鍵係有冇界線。你可以釋出機會，但唔需要追住對方跑；要令互動有來有往，先唔會失衡。`],
      ['塔羅可以睇對方係咪認真嗎？', `可以。塔羅適合睇對方係認真、觀望、享受曖昧，還是另有顧慮，再幫你決定應該推進定慢慢觀察。`]
    ],
    longterm: [
      ['關係變淡係咪代表唔愛？', `唔一定。熱戀感下降係正常，但如果連溝通、關心、共同目標都慢慢消失，就需要重新整理相處模式，而唔係只怪自己想太多。`],
      ['可以點樣重新拉近距離？', `可以先由細位開始，例如固定高質對話、少啲批判、多啲具體欣賞，再慢慢重建安全感同共同節奏。`],
      ['Asteria 可以點幫我處理？', `我哋可以幫你睇關係卡住的位置、對方需要同你嘅表達方式，將問題拆細到日常一句說話、一次互動點處理。`]
    ],
    general: [
      ['可以點樣先睇清楚方向？', `先唔好只靠一個行為下結論。可以將對方近排態度、聯絡頻率、衝突後反應同你自己感受放埋一齊睇，方向會清楚好多。`],
      ['我應該主動處理定等對方先？', `如果你仍然重視呢段關係，可以主動一次，但要用低壓、清楚、有界線的方式。最怕係一邊等、一邊內耗，最後失去判斷力。`],
      ['Asteria 可以點樣幫我？', `我哋會用塔羅分析、相處教學、對話 review 同個案經驗，幫你拆對方心態、訊息策略同下一步做法。`]
    ]
  };

  const key = /少覆|唔覆|不回|已讀|message|訊息|回覆|秒回|斷聯|冷淡|Long D|遠距|異地/.test(text)
    ? 'reply'
    : /復合|挽回|前任|分手後|分手|block/.test(text)
      ? 'reunion'
      : /第三者|新歡|出軌|偷食|變心|劈腿|外遇|PUA|控制|操控|打壓|冷暴力|渣男|紅旗|警號|危機/.test(text)
        ? 'crisis'
        : /溝通|說話|講嘢|道歉|冷戰|表達|分享|勸|嗌交|爭吵|誤會/.test(text)
          ? 'communication'
          : /安全感|不安|焦慮|內耗|委屈|情緒|治癒|自信|低落|放低|失戀/.test(text)
            ? 'emotion'
            : /曖昧|約會|單身|桃花|吸引|主動|矜持|追求/.test(text)
              ? 'ambiguous'
              : /結婚|同居|見家長|辦公室|長期|承諾|未來|穩定/.test(text)
                ? 'longterm'
                : 'general';

  const faqs = questionSets[key];
  return [
    '## 常見問題',
    ...faqs.flatMap(([question, answer]) => [`### ${question}`, answer])
  ].join('\n\n');
};

const markdownPlainLength = (markdown = '') => normalizeText(markdown
  .replace(/^#{1,6}\s+/gm, '')
  .replace(/!\[.*?\]\(.*?\)/g, '')
  .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  .replace(/[*_`>#-]/g, ' ')
).length;

const buildFallbackBodyMarkdown = ({ title, category, summary }) => {
  const topic = shortTopicFromTitle(title) || '呢段關係';
  const categoryLead = {
    '復合挽回': `如果你正卡喺「${topic}」，最重要唔係即刻逼對方表態，而係先分清楚對方係真心想切斷，定只係情緒退後、需要空間。`,
    '溝通相處': `如果你正卡喺「${topic}」，問題好多時唔係你講得唔夠多，而係對方聽到嘅感覺同你想表達嘅意思出現落差。`,
    '情緒修復': `如果你正因為「${topic}」而好辛苦，先唔好急住否定自己。感情入面最耗人嘅位，往往係你一邊想理性，一邊又停唔到猜測。`,
    '曖昧桃花': `如果你正遇到「${topic}」，唔好只睇一兩句甜言蜜語，要睇對方有冇穩定投入、會唔會主動推進，以及你哋互動係舒服定長期失衡。`,
    '關係危機': `如果你正面對「${topic}」，要先停低觀察訊號，而唔係急住幫對方搵藉口。關係危機最怕拖到自己失去底線。`,
    '長期關係': `如果你正處理「${topic}」，關係變淡未必等於唔愛，但一定代表相處模式需要重新整理。長期關係最怕只靠習慣維持。`,
    '戀愛心理': `如果你正思考「${topic}」，可以先由對方行為、你自己的感受、同你哋互動後的狀態一齊判斷，而唔係只靠一個答案定生死。`
  };
  const lead = categoryLead[category] || categoryLead['戀愛心理'];

  return [
    `## 先看清楚「${topic}」真正卡住的位置`,
    lead,
    `好多感情問題表面上係一句說話、一個行為、一段冷淡期，但背後可能係安全感、溝通方式、投入程度或者過往失望累積出嚟。你愈急住處理，愈容易用錯方法，令對方更防衛，自己亦更內耗。`,
    `## 為什麼會越處理越亂`,
    `最常見的情況，是你用自己的不安去追問，對方就用沉默、逃避或者敷衍去防衛。你以為自己只係想溝通，但對方感受到的可能係壓力；你以為對方冷淡代表不愛，但其實亦可能係佢唔識處理衝突。真正要拆的，不只是一句訊息，而是你哋互動入面重複出現的模式。`,
    `## 可以先做的三件事`,
    `第一，記低最近最令你不安的事件，而唔係只記低情緒。第二，觀察對方係短暫退後，定長期不願面對。第三，先諗清楚你想要的是答案、修補、復合，還是單純想停止痛苦。`,
    `如果仍然想修補，就要由低壓、清楚、有界線的互動開始。不要一次過追問所有答案，也不要用長篇訊息迫對方即刻表態。先穩住自己的節奏，再按對方反應決定下一步。`,
    `當方向未清楚時，可以先將對話同近況整理出嚟，再決定下一步。Asteria 會幫你拆對方心態、關係卡位同訊息策略，避免你喺最亂嘅時候越做越錯。`
  ].join('\n\n');
};

const buildShortArticleExpansionMarkdown = ({ title, category }) => {
  const topic = shortTopicFromTitle(title) || '呢段關係';
  if (/情緒價值/.test(title)) {
    return [
      `## 再看深一層：情緒價值不是討好`,
      `真正的情緒價值，不是叫你永遠溫柔、永遠配合，也不是把自己放到很低去成全對方。它更像是一種相處能力：你能不能在對方開心時接住他的分享，在他失意時看見他的努力，在衝突時仍然保持基本尊重。`,
      `如果你只是一直哄、一直忍、一直迎合，短期可能會令對方舒服，但長期會令你失去自己。高情緒價值應該是雙向的，你可以給予支持，也需要被珍惜、被回應。`,
      `## 可以先做的三件事`,
      `第一，少一點用否定句回應對方的分享，先接住感受，再表達自己的看法。第二，讚賞要具體，例如看見對方做了甚麼努力，而不是空泛地說「你好叻」。第三，當你自己情緒很滿時，先停一停，不要把不安變成責備。`,
      `當男人在你面前感到放鬆、被理解、被尊重，他自然會更願意靠近你。但你也要記住，情緒價值不是單方面服務，而是兩個人都願意令彼此相處得更安心。`
    ].join('\n\n');
  }
  const angle = {
    '復合挽回': '對方退後未必等於完全無機會，但要先判斷仲有冇聯絡窗口、情緒連結同重新接近的空間。',
    '溝通相處': '好多相處問題不是一句說話造成，而是同一種表達方式重複太多次，令對方開始防衛或者麻木。',
    '情緒修復': '最辛苦的地方通常不是事情本身，而是你一直在腦內重播，令自己無法分清直覺、恐懼同事實。',
    '曖昧桃花': '曖昧最容易令人誤判，因為甜言蜜語、偶爾主動同真正投入，其實是三件不同的事。',
    '關係危機': '危機出現時，最重要是先守住底線，再分清對方是一時情緒爆發，還是長期逃避責任。',
    '長期關係': '長期關係需要的不只是愛，還有穩定溝通、共同節奏同願意修正相處模式的能力。',
    '戀愛心理': '感情裡的很多反應，都同安全感、自我價值同依附模式有關；只看表面行為，很容易判斷錯方向。'
  };

  return [
    `## 再看深一層：${topic}的真正訊號`,
    angle[category] || angle['戀愛心理'],
    `你可以先觀察三個位置：對方最近有冇主動靠近、衝突後有冇修補、你表達需要時對方係願意理解，定只係想快點完結話題。這些細節會比一句「愛不愛」更能反映關係狀態。`,
    `## 下一步不要急著做錯`,
    `如果你一邊很想修補，一邊又很怕失去，就更加要先整理好說話次序。先講具體事件，再講自己的感受，最後只提出一個清楚而可做到的希望。這樣比長篇控訴更容易令對方聽得入耳，也更方便判斷對方是否仍願意為關係付出。`,
    `同時，你亦要留意自己有冇因為太想要答案，而忽略咗現實行動。真正值得繼續投入的關係，不會只靠一刻感動或者一句承諾，而是會在之後的相處入面慢慢見到改變。`,
    `如果對方仍然願意回應、願意調整，這段關係就值得用更成熟的方法處理；但如果你每次提出需要都只換來逃避、指責或者冷淡，就要重新保護自己的界線。`
  ].join('\n\n');
};

const titlePromiseSections = [
  {
    match: /感情操控\s*5\s*個警號|為你好.*控制/,
    heading: '5 個感情操控警號',
    items: [
      ['用「為你好」包裝控制', '對方表面上話係關心你，其實係逐步限制你嘅選擇，令你開始懷疑自己判斷。'],
      ['限制你同朋友、家人或異性來往', '健康關係唔會要求你切斷所有支援系統；如果對方成日要你報備、審查你同邊個見面，就要留意。'],
      ['令你覺得所有問題都係你錯', '每次衝突最後都變成你道歉、你反省、你改變，對方完全唔需要負責，呢個就係關係失衡。'],
      ['用冷淡或情緒懲罰你', '當你唔順佢意，佢就冷暴力、消失、黑面，逼你為咗和好而放低自己底線。'],
      ['慢慢令你唔敢表達自己', '最明顯嘅警號，係你開始講句說話都要諗好耐，怕對方嬲、怕對方誤會、怕又被責怪。']
    ]
  },
  {
    match: /3\s*個偽關心地雷|關心.*批評/,
    heading: '3 個偽關心地雷',
    items: [
      ['用忠告包住否定', '例如「我係為你好」之後接住一堆批評，聽落似建議，實際係令對方覺得自己唔夠好。'],
      ['未理解就急住糾正', '對方想被聽見，你卻即刻教佢應該點做，會令佢覺得你只想改造佢。'],
      ['將自己標準當成唯一答案', '真正關心會留空間俾對方選擇，而唔係用愛之名要求對方照你方法生活。']
    ]
  },
  {
    match: /3\s*個判斷方法|享受被愛/,
    heading: '3 個判斷方法',
    items: [
      ['你係想了解佢，定只想被佢需要', '真心喜歡會想知道對方世界；只享受被愛，通常更在意對方有冇圍住你轉。'],
      ['你能否接受佢不完美的一面', '如果只愛被追捧嘅感覺，一見到對方缺點就會快速扣分或失去興趣。'],
      ['你有冇願意為關係付出行動', '喜歡唔只係心動，亦包括願意溝通、調整同承擔相處裡的不方便。']
    ]
  },
  {
    match: /感情扣分.*5\s*個細節|不像以前.*5\s*個細節/,
    heading: '男人開始扣分的 5 個細節',
    items: [
      ['開始嫌三嫌四', '以前會欣賞你的小習慣，後來卻經常挑你語氣、打扮、生活方式，代表佢開始用挑剔眼光看你。'],
      ['放大你的缺點', '小事變成大問題，一次失誤會被佢記好耐，甚至用嚟證明「你原來唔係佢想像中咁好」。'],
      ['熱情陪伴變少', '以前你唔開心會陪你傾，後來變得不耐煩、敷衍、甚至覺得你麻煩。'],
      ['將你同想像中的伴侶比較', '佢唔係只看眼前的你，而係不停用心中標準扣你分，令你點做都好似唔夠。'],
      ['不再主動修補問題', '真正危險唔係佢有失望，而係佢失望後選擇收埋、冷淡，最後先一次過講分手。']
    ]
  },
  {
    match: /真心還是假意.*5\s*個細節|真心定假意.*5/,
    heading: '5 個細節看出佢有冇認真愛你',
    items: [
      ['有冇穩定投入時間', '真心唔一定日日黐住，但會穩定安排見面、回覆同維持聯絡。'],
      ['會唔會記得你的需要', '佢唔只聽你講過，仲會喺日常行動入面照顧你介意同重視嘅事。'],
      ['衝突後有冇修補', '只講甜言蜜語唔夠，真正認真係吵架後願意理解、道歉同調整。'],
      ['會唔會將你放入未來計劃', '認真嘅人會自然提到之後、安排、生活節奏，而唔係永遠只停留喺當下。'],
      ['有冇尊重你的界線', '愛你唔係控制你，而係即使有不同想法，都願意尊重你嘅感受同選擇。']
    ]
  },
  {
    match: /4\s*個感情亮紅燈|分手前.*徵兆/,
    heading: '4 個感情亮紅燈信號',
    items: [
      ['開始排斥溝通', '一講問題就逃避、轉移話題、話你煩，代表佢未必想再處理關係。'],
      ['見面或聯絡變成例行公事', '有聯絡不等於有心，如果每次互動都冇溫度，關係可能已經慢慢空心。'],
      ['不再在意你的感受', '你難過、失望或提出需要時，對方只覺得麻煩，呢個係很重要的退場訊號。'],
      ['未來計劃裡慢慢冇你', '佢開始避談未來、減少承諾，甚至所有安排都只以自己為中心。']
    ]
  },
  {
    match: /4\s*個方法|重新站起來|情傷變成成長/,
    heading: '4 個重新站起來的方法',
    items: [
      ['先承認自己真的受傷', '唔需要急住扮無事，接受自己痛苦，先有空間慢慢復原。'],
      ['暫停反覆翻睇對話', '不停重播只會令傷口更深，可以先限制自己翻睇、追蹤同猜測的時間。'],
      ['整理這段關係教會你的事', '分手唔代表全盤否定自己，重點係分清自己下次想保留同改變咩。'],
      ['重新建立生活節奏', '由睡眠、工作、朋友、興趣開始，令自己慢慢唔再只圍住一個人轉。']
    ]
  },
  {
    match: /6\s*個.*變心信號|出軌前.*跡象/,
    heading: '6 個容易忽略的變心信號',
    items: [
      ['手機突然變得很敏感', '以前自然放低手機，後來開始反轉屏幕、改密碼、避開你回覆訊息。'],
      ['前言不對後語', '行程、時間、解釋開始有出入，而且被問起時容易不耐煩。'],
      ['對你的關心變少', '唔再留意你近況、情緒同需要，整個人好似抽離咗。'],
      ['突然注重外表或社交', '改變本身唔一定有問題，但如果同時伴隨隱瞞同冷淡，就要留意。'],
      ['親密接觸明顯下降', '身體距離、眼神、語氣都變得疏離，甚至抗拒被你靠近。'],
      ['開始將問題推到你身上', '明明係佢退後，最後卻變成你太敏感、太多疑、太難相處。']
    ]
  },
  {
    match: /大男人定恐怖情人|5\s*個控制慾警號/,
    heading: '5 個控制慾警號',
    items: [
      ['要求你事事報備', '關心同監控只有一線之差，如果你唔報備就被懲罰，就唔係健康界線。'],
      ['限制你的社交圈', '佢唔喜歡你見某些人，甚至想你遠離朋友家人，係控制關係常見開始。'],
      ['用愛情要求你順從', '例如「你愛我就應該聽我講」，將愛變成服從測試。'],
      ['不接受你有不同意見', '只要你反對，佢就發脾氣、冷暴力或貶低你，令你慢慢唔敢講真話。'],
      ['令你愈來愈不像自己', '最終你為咗避免衝突，放棄喜好、朋友、想法，呢個已經係危險訊號。']
    ]
  },
  {
    match: /5\s*個常見自毀行為|無意識破壞感情/,
    heading: '5 個常見自毀行為',
    items: [
      ['用試探代替表達', '明明想被重視，卻用冷淡、鬧脾氣、假裝無所謂去測試對方。'],
      ['過度索取安全感', '安全感需要建立，但如果每次不安都變成追問，對方會愈來愈有壓力。'],
      ['把過去傷口投射到現在', '以前被傷害過，不代表眼前的人一定會一樣，但你可能會先用防衛推開佢。'],
      ['不斷翻舊帳', '每次吵架都搬返舊事，會令對方覺得永遠無法重新開始。'],
      ['只看對方有冇錯，忘記看互動模式', '關係通常係雙向累積，單純追究輸贏會令問題愈拆愈亂。']
    ]
  },
  {
    match: /吵架\s*5\s*大禁區|嗌交5大禁區/,
    heading: '情侶吵架 5 大禁區',
    items: [
      ['人身攻擊', '針對人格、外貌、家庭或能力，只會令對方記住傷害，而唔係記住問題本身。'],
      ['死要面子', '明知自己都有責任，仍然堅持唔認錯，會令修補機會愈來愈細。'],
      ['翻舊帳', '每次都將以前所有錯一次過攤出來，對方會覺得永遠清算唔完。'],
      ['威脅分手', '用分手逼對方讓步，短期可能有效，長期會消耗安全感。'],
      ['冷暴力懲罰', '需要冷靜可以講清楚，但長時間失蹤、唔回應，只會令問題發酵。']
    ]
  },
  {
    match: /復合前必經.*5\s*個階段|重新開始.*5\s*個/,
    heading: '復合前必經的 5 個階段',
    items: [
      ['情緒降溫期', '分開初期最容易衝動，先讓雙方情緒冷卻，避免講出更傷人的說話。'],
      ['嘗試獨立期', '你要先重新穩住自己，唔好將所有生活重心都放在等對方回頭。'],
      ['重新接觸期', '用低壓方式恢復互動，不是一開口就求復合，而係先建立舒服感。'],
      ['信任修補期', '如果之前有傷害或失望，就要用行動慢慢證明，而唔係只靠承諾。'],
      ['重新定義關係期', '復合唔係回到舊模式，而係要講清楚之後點相處、點避免重複問題。']
    ]
  },
  {
    match: /4\s*個令對方慢慢抽離|感情變淡點算/,
    heading: '4 個令對方慢慢抽離的行為',
    items: [
      ['過度依賴對方', '所有情緒都要對方負責，會令關係由親密變成壓力。'],
      ['長期只講問題，少了欣賞', '如果對方每次靠近都只聽到批評，久而久之會自然退後。'],
      ['失去自己的生活', '當你愈來愈沒有自己，對方反而可能感到沉重，吸引力亦會下降。'],
      ['忽略日常小互動', '感情變淡多數唔係一件大事，而係每日少一句關心、少一次分享慢慢累積。']
    ]
  },
  {
    match: /5\s*個正在破壞關係的原因|一面對伴侶就燥底/,
    heading: '5 個正在破壞關係的原因',
    items: [
      ['爭執太多，身體先有防衛反應', '當你一見到對方就緊張或燥底，可能係長期衝突令你進入防衛狀態。'],
      ['未處理的委屈累積太久', '你以為自己放下了，但其實每次小事都會觸發以前的失望。'],
      ['溝通只剩指責', '如果每次開口都係追究對錯，關係就會愈傾愈遠。'],
      ['缺少正面互動', '只靠解決問題維持關係是不夠的，也需要輕鬆、欣賞和被喜歡的感覺。'],
      ['把對方當成壓力來源', '當你一想到佢就覺得累，代表關係需要重新整理，而唔係再硬撐。']
    ]
  },
  {
    match: /建立親密感.*5\s*個日常方法|讓關係升溫/,
    heading: '5 個建立親密感的日常方法',
    items: [
      ['漸進式分享', '由小事開始講起，慢慢增加真實感受，令對方更容易靠近你。'],
      ['固定高質對話時間', '不一定要傾好耐，但要有一段時間專心聽對方，而唔係邊玩電話邊應。'],
      ['具體欣賞對方', '不要只講「你好好」，可以講清楚佢邊個行為令你感到被照顧。'],
      ['共同完成小任務', '一齊煮飯、計劃行程、整理生活，會比空泛談情更容易建立默契。'],
      ['衝突後主動修補', '親密感唔係永遠唔吵架，而係吵完之後仍然願意回來理解對方。']
    ]
  },
  {
    match: /5\s*個最常見溝通盲點|心底話.*有效溝通/,
    heading: '5 個最常見溝通盲點',
    items: [
      ['以為講晒心底話就等於溝通', '真實表達很重要，但如果只倒情緒，對方未必知道可以點回應。'],
      ['一開口就批評', '你想講需要，但出口變成指責，對方自然會防衛。'],
      ['一次過講太多問題', '問題太多會令對方腦袋關機，最好先集中處理一件最重要的事。'],
      ['用暗示期待對方明白', '暗示好容易誤會，清楚講出需要反而更成熟。'],
      ['只追求對方認錯', '有效溝通唔係分輸贏，而係令雙方知道之後可以點做。']
    ]
  }
];

const headingCountBeforeFaq = (markdown = '') => {
  const beforeFaq = markdown.split(/^##\s+常見問題/m)[0] || markdown;
  return (beforeFaq.match(/^#{2,4}\s+/gm) || []).length;
};

const applyTitlePromiseSections = (markdown, { title }) => {
  const section = titlePromiseSections.find((entry) => entry.match.test(title));
  if (!section) return markdown;
  const alreadyHasEnough = headingCountBeforeFaq(markdown) >= section.items.length;
  if (alreadyHasEnough && section.items.every(([label]) => markdown.includes(label))) return markdown;

  const block = [
    `## ${section.heading}`,
    ...section.items.flatMap(([label, body], index) => [
      `### ${index + 1}. ${label}`,
      body
    ])
  ].join('\n\n');

  const marker = /\n## 如果還想修復關係，你可以先這樣做/;
  if (marker.test(markdown)) {
    return markdown.replace(marker, `\n${block}\n\n## 如果還想修復關係，你可以先這樣做`);
  }
  return `${markdown.trim()}\n\n${block}`;
};

const removeDuplicateIntro = (markdown, summary) => {
  if (!summary) return markdown;
  const summaryKey = normalizeText(summary).slice(0, 56);
  if (summaryKey.length < 18) return markdown;
  const lines = markdown.split(/\r?\n/);
  const firstContentIndex = lines.findIndex((line) => {
    const trimmed = line.trim();
    return trimmed && !/^#{2,4}\s+/.test(trimmed);
  });
  if (firstContentIndex < 0) return markdown;

  let buffer = '';
  let endIndex = firstContentIndex - 1;
  for (let index = firstContentIndex; index < Math.min(lines.length, firstContentIndex + 4); index += 1) {
    const trimmed = lines[index].trim();
    if (!trimmed || /^#{2,4}\s+/.test(trimmed)) break;
    buffer += normalizeText(trimmed);
    endIndex = index;
    if (
      buffer.includes(summaryKey) ||
      summaryKey.includes(buffer.slice(0, Math.min(buffer.length, summaryKey.length))) ||
      normalizeText(trimmed).includes(summaryKey)
    ) {
      return [
        ...lines.slice(0, firstContentIndex),
        ...lines.slice(endIndex + 1)
      ].join('\n').replace(/^\s+/, '').trim();
    }
    if (buffer.length > summaryKey.length + 80) break;
  }

  const out = [];
  let removed = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!removed && trimmed && !/^#{2,4}\s+/.test(trimmed) && normalizeText(trimmed).includes(summaryKey)) {
      removed = true;
      continue;
    }
    out.push(line);
  }
  return out.join('\n').replace(/^\s+/, '').trim();
};

const numberedHeadingData = (text = '') => {
  const clean = normalizeArticleText(text)
    .replace(/[「」『』]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const patterns = [
    [/^Step\s*([0-9]+)\s*[:：.-]?\s*(.+)$/i, (match) => ({ badge: `Step ${match[1]}`, label: match[2] })],
    [/^Stage\s*([0-9]+)\s*[:：.-]?\s*(.+)$/i, (match) => ({ badge: `Stage ${match[1]}`, label: match[2] })],
    [/^因素\s*([0-9]+)\s*[:：.-]?\s*(.+)$/u, (match) => ({ badge: `因素 ${match[1]}`, label: match[2] })],
    [/^迷思\s*([0-9一二三四五六七八九十]+)\s*[:：.-]?\s*(.+)$/u, (match) => ({ badge: /^[一二三四五六七八九十]$/u.test(match[1]) ? `迷思${match[1]}` : `迷思 ${match[1]}`, label: match[2] })],
    [/^誤區\s*([0-9一二三四五六七八九十]+)\s*[:：.-]?\s*(.+)$/u, (match) => ({ badge: /^[一二三四五六七八九十]$/u.test(match[1]) ? `誤區${match[1]}` : `誤區 ${match[1]}`, label: match[2] })],
    [/^徵兆\s*([0-9一二三四五六七八九十]+)\s*[:：.-]?\s*(.+)$/u, (match) => ({ badge: `徵兆 ${match[1]}`, label: match[2] })],
    [/^階段\s*([0-9一二三四五六七八九十]+)\s*[:：.-]?\s*(.+)$/u, (match) => ({ badge: /^[一二三四五六七八九十]$/u.test(match[1]) ? `階段${match[1]}` : `階段 ${match[1]}`, label: match[2] })],
    [/^禁忌\s*([0-9]+)\s*[:：.-]?\s*(.+)$/u, (match) => ({ badge: `禁忌 ${match[1]}`, label: match[2] })],
    [/^警號\s*([0-9]+)\s*[:：.-]?\s*(.+)$/u, (match) => ({ badge: `警號 ${match[1]}`, label: match[2] })],
    [/^跡象\s*([0-9]+)\s*[:：.-]?\s*(.+)$/u, (match) => ({ badge: `跡象 ${match[1]}`, label: match[2] })],
    [/^原因\s*([0-9]+)\s*[:：.-]?\s*(.+)$/u, (match) => ({ badge: `原因 ${match[1]}`, label: match[2] })],
    [/^防伏行為\s*([0-9]+)\s*[:：.-]?\s*(.+)$/u, (match) => ({ badge: `防伏 ${match[1]}`, label: match[2] })],
    [/^真相\s*([0-9]+)\s*[:：.-]?\s*(.*)$/u, (match) => ({ badge: `真相 ${match[1]}`, label: match[2] || '關鍵判斷' })],
    [/^男人嘅諗法\s*([0-9]+)[）)]?\s*(.*)$/u, (match) => ({ badge: `想法 ${match[1]}`, label: match[2] || '男人嘅常見心態' })],
    [/^第\s*([0-9]+)\s*點\s*[:：.-]?\s*(.+)$/u, (match) => ({ badge: `第 ${match[1]} 點`, label: match[2] })],
    [/^([0-9]+)[.。]\s*(.+)$/u, (match) => ({ badge: `第 ${match[1]} 點`, label: match[2] })],
    [/^([0-9]+)[）)]\s*(.+)$/u, (match) => ({ badge: `第 ${match[1]} 點`, label: match[2] })]
  ];
  for (const [pattern, build] of patterns) {
    const match = clean.match(pattern);
    if (!match) continue;
    const data = build(match);
    const label = normalizeArticleText(data.label || '').replace(/[，,：:。]+$/u, '').trim();
    if (label.length < 2) continue;
    return {
      badge: String(data.badge || '').replace(/\s+/g, ' ').trim(),
      label
    };
  }
  return null;
};

const formatNumberedHeadingHtml = (text, level) => {
  const numbered = numberedHeadingData(text);
  if (!numbered) return null;
  const tag = level <= 2 ? 'h2' : 'h3';
  const sizeClass = level <= 2 ? '' : ' article-numbered-heading--small';
  return `<${tag} class="article-numbered-heading${sizeClass}"><span class="article-numbered-heading__badge">${escapeHtml(numbered.badge)}</span><span>${formatHeadingInline(numbered.label)}</span></${tag}>`;
};

const markdownToHtml = (markdown) => {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let paragraph = [];
  let list = [];
  let highlightList = false;

  const flushParagraph = () => {
    const text = paragraph.join(' ').trim();
    if (text) html.push(formatParagraph(text));
    paragraph = [];
  };

  const flushList = () => {
    if (list.length) {
      const className = highlightList ? ' class="article-highlight-list"' : '';
      html.push(`<ul${className}>${list.map((item) => `<li>${formatInline(restoreLooseChinesePunctuation(item))}</li>`).join('')}</ul>`);
      list = [];
      highlightList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const text = heading[2].replace(/^#\s*/, '').trim();
      if (level <= 2) {
        if (text === '重點速讀') {
          html.push('<h2 class="article-highlight-title">重點速讀</h2>');
          highlightList = true;
        } else {
          html.push(formatNumberedHeadingHtml(text, level) || `<h2>${formatHeadingInline(text)}</h2>`);
        }
      } else {
        html.push(formatNumberedHeadingHtml(text, level) || `<h3>${formatHeadingInline(text)}</h3>`);
      }
      continue;
    }
    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      continue;
    }
    if (/^>\s+/.test(line)) {
      flushParagraph();
      flushList();
      html.push(`<blockquote>${formatInline(line.replace(/^>\s+/, ''))}</blockquote>`);
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return html.join('\n');
};

const stripFaqForSummary = (html = '') => html
  .replace(/<h2>常見問題<\/h2>[\s\S]*$/g, '')
  .replace(/<h3>這種感情狀況是不是代表關係快完結？<\/h3>[\s\S]*$/g, '')
  .trim();

const isFaqLikeSummary = (value = '') => (
  /^常見問題\b/.test(value) ||
  /這種感情狀況是不是代表關係快完結/.test(value) ||
  /我應該主動修補/.test(value) ||
  /什麼時候適合做愛情占卜/.test(value)
);

const stripHtml = (html = '') => html
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

const decodeHtmlEntities = (value = '') => value
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'");

const repairGenericNumberedHeadingsHtml = (html = '') => html.replace(
  /<h([23]) class="article-numbered-heading([^"]*)"><span class="article-numbered-heading__badge">([\s\S]*?)<\/span><span>(男人嘅常見心態|關鍵判斷)<\/span><\/h\1>\s*<p>([\s\S]*?)<\/p>/g,
  (match, level, classSuffix, badge, _label, paragraph) => {
    const firstPhrase = decodeHtmlEntities(stripHtml(paragraph))
      .split(/[，,。！？!?；;：:]/u)[0]
      ?.replace(/[「」『』]/g, '')
      .trim();
    if (!firstPhrase || firstPhrase.length < 2 || firstPhrase.length > 28) return match;
    const tag = `h${level}`;
    return `<${tag} class="article-numbered-heading${classSuffix}"><span class="article-numbered-heading__badge">${badge}</span><span>${escapeHtml(firstPhrase)}</span></${tag}>\n<p>${paragraph}</p>`;
  }
);

const repairBareNumberedHeadingsHtml = (html = '') => html.replace(
  /<h([23]) class="article-numbered-heading([^"]*)">([^<]*?)<\/h\1>/g,
  (match, level, classSuffix, rawText) => {
    const data = numberedHeadingData(decodeHtmlEntities(rawText));
    if (!data) return match;
    const tag = `h${level}`;
    return `<${tag} class="article-numbered-heading${classSuffix}"><span class="article-numbered-heading__badge">${escapeHtml(data.badge)}</span><span>${formatHeadingInline(data.label)}</span></${tag}>`;
  }
);

const splitChecklistItems = (html = '') => {
  const text = normalizeArticleText(stripHtml(html));
  const protectedText = text
    .replace(/，而/g, '，__KEEP_而')
    .replace(/，但/g, '，__KEEP_但')
    .replace(/，所以/g, '，__KEEP_所以');
  const parts = protectedText
    .split(/，(?=(?:有|願意|會|主動|好|發生|完事|每次|唔|不|冇|沒有|喺|過份|對方|你|佢))/u)
    .map((item) => item.replace(/__KEEP_/g, '').replace(/[。；;，,]+$/u, '').trim())
    .filter((item) => item.length >= 7);
  return parts.length >= 3 ? parts : [text].filter(Boolean);
};

const checklistPanelHtml = (heading = '', paragraphs = '', mode = 'positive') => {
  const items = [...paragraphs.matchAll(/<p>([\s\S]*?)<\/p>/g)]
    .flatMap((paragraph) => splitChecklistItems(paragraph[1]))
    .map((item) => item.replace(/^[❎✅✓!]\s*/u, '').replace(/佢他/g, '佢').trim())
    .filter(Boolean)
    .slice(0, 8);
  if (items.length < 2) return '';
  const icon = mode === 'warning' ? '!' : '✓';
  return [
    `<div class="article-check-panel article-check-panel--${mode}">`,
    `<h3>${formatHeadingInline(heading)}</h3>`,
    ...items.map((item) => `<div class="article-checklist__item"><span>${icon}</span><p>${escapeHtml(item)}</p></div>`),
    '</div>'
  ].join('\n');
};

const repairPairedChecklistSectionsHtml = (html = '') => html.replace(
  /<h2>(即\s*Check[\s\S]*?唔只[\s\S]*?)<\/h2>\s*((?:<p>[\s\S]*?<\/p>\s*){1,10})<h2>(即\s*Check[\s\S]*?(?:只係|只想)[\s\S]*?)<\/h2>\s*((?:<p>[\s\S]*?<\/p>\s*){1,10})(?=<h2|$)/g,
  (match, headingA, paragraphsA, headingB, paragraphsB) => {
    const positive = checklistPanelHtml(headingA, paragraphsA, 'positive');
    const warning = checklistPanelHtml(headingB, paragraphsB, 'warning');
    if (!positive || !warning) return match;
    return [
      '<div class="article-check-compare">',
      positive,
      warning,
      '</div>'
    ].join('\n');
  }
);

const repairChecklistSectionsHtml = (html = '') => html.replace(
  /<h2>(即\s*Check[\s\S]*?)<\/h2>\s*((?:<p>[\s\S]*?<\/p>\s*){1,5})(?=<h2|$)/g,
  (match, heading, paragraphs) => {
    const mode = /只係|只想|SP|危險|唔只/.test(heading) && !/唔只/.test(heading) ? 'warning' : 'positive';
    const panel = checklistPanelHtml(heading, paragraphs, mode);
    if (!panel) return match;
    const items = [...panel.matchAll(/article-checklist__item/g)];
    if (items.length < 2) return match;
    return [
      `<h2>${formatHeadingInline(heading)}</h2>`,
      `<div class="article-checklist article-checklist--${mode}">`,
      panel.replace(/^<div class="article-check-panel article-check-panel--[^"]*">\n<h3>[\s\S]*?<\/h3>\n/, '').replace(/\n<\/div>$/u, ''),
      '</div>'
    ].join('\n');
  }
);

const repairInlineChecklistCueHtml = (html = '') => html.replace(
  /<p>(即\s*Check[^<]{4,90})<\/p>\s*((?:<p>(?!即\s*Check)[\s\S]*?<\/p>\s*){2,6})(?=<h2|$)/g,
  (match, heading, paragraphs) => {
    const headingText = normalizeArticleText(stripHtml(heading));
    if (!/技巧|方法|清單|相處/.test(headingText) || /禁忌/.test(headingText)) return match;
    const panel = checklistPanelHtml(heading, paragraphs, 'positive');
    if (!panel) return match;
    return [
      `<h2>${formatHeadingInline(heading)}</h2>`,
      `<div class="article-checklist article-checklist--positive">`,
      panel.replace(/^<div class="article-check-panel article-check-panel--[^"]*">\n<h3>[\s\S]*?<\/h3>\n/, '').replace(/\n<\/div>$/u, ''),
      '</div>'
    ].join('\n');
  }
);

const repeatedHeadingLabel = (heading = '', paragraph = '', index = 1) => {
  const firstPhrase = decodeHtmlEntities(stripHtml(paragraph))
    .split(/[，,。！？!?；;：:]/u)[0]
    ?.replace(/[「」『』]/g, '')
    .trim();
  if (/恐怖情人有樣睇/.test(heading)) {
    return { badge: `特徵 ${index}`, label: firstPhrase || '恐怖情人警號' };
  }
  return null;
};

const repairRepeatedHeadingSectionsHtml = (html = '') => {
  const headingPattern = /<h2>([\s\S]*?)<\/h2>\s*<p>([\s\S]*?)<\/p>/g;
  const counts = new Map();
  for (const match of html.matchAll(headingPattern)) {
    const key = normalizeArticleText(stripHtml(match[1]));
    if (key.length < 4) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const seen = new Map();
  return html.replace(headingPattern, (match, heading, paragraph) => {
    const key = normalizeArticleText(stripHtml(heading));
    if ((counts.get(key) || 0) < 2) return match;
    const next = (seen.get(key) || 0) + 1;
    seen.set(key, next);
    const data = repeatedHeadingLabel(key, paragraph, next);
    if (!data) return match;
    const label = normalizeArticleText(data.label).replace(/[，,：:。]+$/u, '').trim();
    if (label.length < 2) return match;
    return `<h2 class="article-numbered-heading"><span class="article-numbered-heading__badge">${escapeHtml(data.badge)}</span><span>${formatHeadingInline(label)}</span></h2>\n<p>${paragraph}</p>`;
  });
};

const factCheckLeadLine = (paragraphs = []) => {
  const paragraphTexts = paragraphs
    .map((paragraph) => normalizeArticleText(stripHtml(paragraph)))
    .filter(Boolean);
  for (let index = paragraphTexts.length - 2; index >= 0; index -= 1) {
    const first = paragraphTexts[index].replace(/[。！？!?]+$/u, '').trim();
    const second = paragraphTexts[index + 1].replace(/[。！？!?]+$/u, '').trim();
    if (/^與其/.test(first) && /^不如/.test(second) && `${first}：${second}`.length <= 110) {
      return `${first}：${second}`;
    }
  }
  const pairedLead = [...paragraphTexts]
    .reverse()
    .find((item) => item.length <= 110 && /與其[\s\S]{1,50}[：:，,。]?不如/.test(item));
  if (pairedLead) return pairedLead.replace(/[。！？!?]+$/u, '').trim();
  const shortParagraphLead = [...paragraphTexts]
    .reverse()
    .find((item) => item.length >= 8 && item.length <= 80 && /與其|不如|所以|重點|記住|真正|一定要|唔一定/.test(item));
  if (shortParagraphLead) return shortParagraphLead.replace(/[。！？!?]+$/u, '').trim();
  const candidates = paragraphTexts
    .flatMap((paragraph) => paragraph.split(/(?<=[。！？!?])/u))
    .map((item) => item.replace(/[。！？!?]+$/u, '').trim())
    .filter((item) => item.length >= 8 && item.length <= 72);
  const picked = [...candidates].reverse().find((item) => /與其|不如|所以|重點|記住|真正|一定要|唔一定/.test(item)) || candidates.at(-1) || '';
  if (/^不如/.test(picked)) {
    const fullPair = paragraphTexts.find((paragraph) => paragraph.includes(picked) && /與其/.test(paragraph) && paragraph.length <= 90);
    if (fullPair) return fullPair.replace(/[。！？!?]+$/u, '').trim();
  }
  return picked;
};

const removeFactCheckLead = (paragraph = '', lead = '') => {
  if (!lead) return paragraph;
  const text = normalizeArticleText(stripHtml(paragraph));
  const sameLead = text.replace(/[。！？!?]+$/u, '').trim() === lead.replace(/[。！？!?]+$/u, '').trim();
  if (sameLead) return '';
  const strippedText = text.replace(/[。！？!?]+$/u, '').trim();
  const strippedLead = lead.replace(/[。！？!?]+$/u, '').trim();
  if (strippedText && strippedLead.includes(strippedText) && /與其/.test(strippedLead) && /不如/.test(strippedLead)) return '';
  if (!text.includes(lead)) return paragraph;
  const cleaned = text
    .replace(lead, '')
    .replace(/^[。！？!?，,；;：:\s]+|[。！？!?，,；;：:\s]+$/gu, '')
    .trim();
  return cleaned.length >= 4 ? `<p>${escapeHtml(cleaned)}</p>` : '';
};

const expandFactCheckLead = (lead = '', paragraphs = []) => {
  if (!/^不如/.test(lead)) return lead;
  const fullPair = paragraphs
    .map((paragraph) => normalizeArticleText(stripHtml(paragraph)))
    .find((text) => text.includes(lead) && /與其/.test(text) && text.length <= 100);
  return fullPair ? fullPair.replace(/[。！？!?]+$/u, '').trim() : lead;
};

const punctuateLead = (lead = '') => /[。！？!?]$/u.test(lead) ? lead : `${lead}。`;

const repairFactCheckSectionsHtml = (html = '') => html.replace(
  /<h2>Fact Check<\/h2>\s*((?:<p>[\s\S]*?<\/p>\s*){1,5})(?=<h2|$)/g,
  (_match, paragraphs) => {
    const paragraphList = [...paragraphs.matchAll(/<p>[\s\S]*?<\/p>/g)].map((item) => item[0]);
    const lead = expandFactCheckLead(factCheckLeadLine(paragraphList), paragraphList);
    const body = paragraphList.map((paragraph) => removeFactCheckLead(paragraph, lead)).filter(Boolean).join('\n');
    return [
      '<div class="article-fact-card">',
      '<span class="article-fact-card__label">Fact Check</span>',
      lead ? `<p class="article-fact-card__lead">${escapeHtml(punctuateLead(lead))}</p>` : '',
      body,
      '</div>'
    ].filter(Boolean).join('\n');
  }
);

const repairTipsSectionsHtml = (html = '') => html.replace(
  /<h2>(小\s*TIPS|小\s*Tips|小提示)<\/h2>\s*((?:<p>[\s\S]*?<\/p>\s*){1,5})(?=<h2|$)/g,
  (_match, heading, paragraphs) => {
    const firstText = normalizeArticleText(stripHtml(paragraphs));
    const number = firstText.match(/^([0-9]+)[）)]/)?.[1];
    const label = number ? `Tips ${number}` : normalizeArticleText(heading).replace(/\s+/g, ' ');
    return [
      '<div class="article-tip-card">',
      `<span class="article-tip-card__label">${escapeHtml(label)}</span>`,
      paragraphs.trim(),
      '</div>'
    ].join('\n');
  }
);

const splitResultItems = (text = '') => normalizeArticleText(text)
  .replace(/^結果分析[，,：:]?\s*/u, '')
  .split(/(?=中\s*[0-9]+(?:[-至到][0-9]+)?\s*個[：:])/u)
  .map((item) => item.replace(/[。；;]+$/u, '').trim())
  .filter((item) => item.length >= 6);

const repairSelfTestSectionsHtml = (html = '') => html.replace(
  /<p>([^<]*(?:自測|你中咗幾多個)[^<]*[？?])<\/p>\s*((?:<p>(?!結果分析)[\s\S]*?<\/p>\s*){3,8})<p>(結果分析[\s\S]*?)<\/p>/g,
  (match, heading, itemParagraphs, resultParagraph) => {
    const items = [...itemParagraphs.matchAll(/<p>([\s\S]*?)<\/p>/g)]
      .map((item) => normalizeArticleText(stripHtml(item[1])).replace(/[。]+$/u, '').trim())
      .filter((item) => item.length >= 6)
      .slice(0, 8);
    const results = splitResultItems(stripHtml(resultParagraph)).slice(0, 5);
    if (items.length < 3 || results.length < 2) return match;
    return [
      '<div class="article-quiz-card">',
      `<h2>${formatHeadingInline(heading)}</h2>`,
      '<div class="article-quiz-card__items">',
      ...items.map((item) => `<div class="article-quiz-card__item"><span></span><p>${escapeHtml(item)}</p></div>`),
      '</div>',
      '<div class="article-quiz-card__result">',
      '<strong>結果分析</strong>',
      ...results.map((item) => `<p>${escapeHtml(item)}</p>`),
      '</div>',
      '</div>'
    ].join('\n');
  }
);

const isDialogueParagraph = (paragraph = '') => {
  const text = normalizeArticleText(stripHtml(paragraph));
  if (text.length < 4 || text.length > 90) return false;
  return /^(A|B|你|佢|男方|女方|對方|我|##?)\s*[：:]/u.test(text) || /^：/u.test(text);
};

const cleanDialogueParagraphHtml = (paragraph = '') => paragraph
  .replace(/<p>\s*#{1,4}\s*([：:])/u, '<p>$1')
  .replace(/<p>\s*([：:])/u, '<p>');

const repairDialogueRunsHtml = (html = '') => {
  const blocks = html.split(/(\n+)/);
  const out = [];
  let buffer = [];
  const flush = () => {
    if (buffer.length >= 2) {
      out.push(
        '<div class="article-dialogue">',
        ...buffer.map((paragraph) => `<div class="article-dialogue__bubble">${paragraph}</div>`),
        '</div>'
      );
    } else {
      out.push(...buffer);
    }
    buffer = [];
  };

  for (const block of blocks) {
    if (/^\n+$/.test(block)) {
      if (buffer.length) continue;
      out.push(block);
      continue;
    }
    if (/^<p>[\s\S]*<\/p>$/.test(block.trim()) && isDialogueParagraph(block)) {
      buffer.push(cleanDialogueParagraphHtml(block.trim()));
      continue;
    }
    flush();
    out.push(block);
  }
  flush();
  return out.join('');
};

const htmlInlineToMarkdown = (value = '') => decodeHtmlEntities(value)
  .replace(/<strong>([\s\S]*?)<\/strong>/g, '**$1**')
  .replace(/<mark>([\s\S]*?)<\/mark>/g, '**$1**')
  .replace(/<[^>]+>/g, '')
  .replace(/\s+/g, ' ')
  .trim();

const htmlToMarkdown = (html = '') => {
  const blocks = [];
  const tokenPattern = /<(h2|h3|p|blockquote)(?:\s[^>]*)?>([\s\S]*?)<\/\1>|<ul[^>]*>([\s\S]*?)<\/ul>/g;
  for (const match of html.matchAll(tokenPattern)) {
    if (match[1] === 'h2') {
      blocks.push(`## ${htmlInlineToMarkdown(match[2])}`);
      continue;
    }
    if (match[1] === 'h3') {
      blocks.push(`### ${htmlInlineToMarkdown(match[2])}`);
      continue;
    }
    if (match[1] === 'blockquote') {
      blocks.push(`> ${htmlInlineToMarkdown(match[2])}`);
      continue;
    }
    if (match[1] === 'p') {
      const text = htmlInlineToMarkdown(match[2]);
      if (text) blocks.push(text);
      continue;
    }
    const items = [...match[3].matchAll(/<li>([\s\S]*?)<\/li>/g)]
      .map((item) => htmlInlineToMarkdown(item[1]))
      .filter(Boolean)
      .map((item) => `- ${item}`);
    if (items.length) blocks.push(items.join('\n'));
  }
  return blocks.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
};

const rawFrontmatterBlock = (raw = '') => {
  if (!raw.startsWith('---')) return '';
  const end = raw.indexOf('\n---', 3);
  if (end < 0) return '';
  return raw.slice(0, end + 4).trim();
};

const buildSyncedWebReadyMarkdown = ({ raw, title, content }) => {
  const frontmatterBlock = rawFrontmatterBlock(raw);
  return [
    frontmatterBlock,
    `# ${title}`,
    htmlToMarkdown(content)
  ].filter(Boolean).join('\n\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
};

const removeDuplicateSummaryHtml = (html, summary) => {
  const summaryKey = normalizeText(summary).slice(0, 60);
  if (summaryKey.length < 24) return html;
  return html.replace(/^<p>([\s\S]*?)<\/p>\n?/, (match, firstParagraph) => {
    const paragraphKey = normalizeText(stripHtml(firstParagraph));
    if (paragraphKey.includes(summaryKey) || summaryKey.includes(paragraphKey.slice(0, summaryKey.length))) {
      return '';
    }
    return match;
  });
};

const cleanHighlightItemText = (html = '') => {
  let text = normalizeArticleText(stripHtml(html));
  if (/^讀到這[裏裡]/.test(text)) return '';
  if (/建議呢版用表列形式出/.test(text)) return '';
  text = text.replace(/[「」『』]/g, '');
  const [heading, ...bodyParts] = text.split(/[：:]/u);
  const body = bodyParts.join('：');
  const concise = conciseHighlightText(heading, body || text);
  if (concise) {
    const cleanHeading = normalizeArticleText(heading)
      .replace(/[「」『』]/g, '')
      .replace(/[。！？!?？]+$/u, '')
      .trim();
    const cleanConcise = concise
      .replace(/[「」『』]/g, '')
      .replace(/^[:：\s]+/u, '')
      .replace(/([。！？!?？])[:：]+/u, '$1')
      .trim();
    if (body && cleanHeading.length >= 3 && !isGenericHighlightHeading(cleanHeading)) {
      return `${cleanHeading}：${cleanConcise}`;
    }
    return cleanConcise;
  }
  if (text.length <= 38) return text.replace(/[「」『』]/g, '');
  const shortened = shortenAtNaturalBreak(text, 38);
  if (shortened) return shortened.replace(/[「」『』]/g, '');
  return '';
};

const repairHighlightListsHtml = (html = '') => html.replace(/<ul class="article-highlight-list">([\s\S]*?)<\/ul>/g, (match, inner) => {
  const items = [...inner.matchAll(/<li>([\s\S]*?)<\/li>/g)]
    .map((itemMatch) => cleanHighlightItemText(itemMatch[1]))
    .map((item) => item.replace(/[「」『』]/g, '').replace(/\s+/g, ' ').trim())
    .filter((item) => item.length >= 12 && item.length <= 92)
    .slice(0, 4);
  if (items.length < 2) return '';
  return `<ul class="article-highlight-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
});

const repairClosingSectionsHtml = (html = '') => html.replace(
  /<p>(感情拯救所(?:話你知|告訴你|，告訴你))[:：]?\s*(?:感情拯救所(?:話你知|告訴你|，告訴你)[:：，,]?\s*)?([\s\S]*?)<\/p>/g,
  (_, _label, body) => {
    const text = normalizeArticleText(stripHtml(body));
    if (!text) return '<h2>感情拯救所話你知</h2>';
    return `<h2>感情拯救所話你知</h2>\n<p>${escapeHtml(text)}</p>`;
  }
);

const repairInlineNumberedSectionsHtml = (html = '') => html.replace(
  /<p>(迷思\s*[一二三四五六七八九十0-9]+[:：][\s\S]*?)科學真相[:：]([\s\S]*?)<\/p>/g,
  (_, rawTitle, rawBody) => {
    const title = normalizeArticleText(stripHtml(rawTitle)).replace(/[。！!？?]+$/u, '');
    const body = normalizeArticleText(stripHtml(rawBody));
    return `<h2>${escapeHtml(title)}</h2>\n<p>科學真相：${escapeHtml(body)}</p>`;
  }
);

const splitInlineNumberedSegment = (segment = '') => {
  const text = normalizeArticleText(segment)
    .replace(/^[-–—]+/u, '')
    .trim();
  if (!text) return null;

  const colon = text.match(/^([^：:]{2,42})[:：]\s*([\s\S]{12,})$/u);
  if (colon) return { label: colon[1].trim(), body: colon[2].trim() };

  const parenthesized = text.match(/^(.{2,36}?\([^)）]{2,40}[)）])\s+([\s\S]{12,})$/u);
  if (parenthesized) return { label: parenthesized[1].trim(), body: parenthesized[2].trim() };

  const commaLabel = text.match(/^([^，,。！？!?]{2,24})[，,]\s*([\s\S]{12,})$/u);
  if (commaLabel) return { label: commaLabel[1].trim(), body: commaLabel[2].trim() };

  const bodyStarters = '(?:當|這|呢|佢|他|如果|唔|有時|在|一開始|不准|最後|你|人|男人|女人|科學|表面|公司|除非|明明|改變|吵架|小三|家裡|正向|久而久之|所謂|喺|以|將|用|令|不要|大家|雄性|可能|真正|好多|感情|拍拖|只要|因為|但|而|其實)';
  const starter = text.match(new RegExp(`^(.{2,34}?)\\s+(${bodyStarters}[\\s\\S]{12,})$`, 'u'));
  if (starter) return { label: starter[1].trim(), body: starter[2].trim() };

  const sentence = text.match(/^([^。！？!?]{4,32})[。！？!?]\s*([\s\S]{12,})$/u);
  if (sentence) return { label: sentence[1].trim(), body: sentence[2].trim() };

  return null;
};

const repairInlineNumberedListHtml = (html = '') => html.replace(/<p>([\s\S]*?)<\/p>/g, (match, raw) => {
  const text = normalizeArticleText(stripHtml(raw));
  const markers = [...text.matchAll(/(?<!\d)([1-6])[.。]\s*/g)];
  if (!markers.length || markers[0][1] !== '1') return match;
  if (markers.length === 1 && markers[0].index === 0) return match;

  const sections = [];
  for (let index = 0; index < markers.length; index += 1) {
    const marker = markers[index];
    const start = marker.index + marker[0].length;
    const end = index + 1 < markers.length ? markers[index + 1].index : text.length;
    const parsed = splitInlineNumberedSegment(text.slice(start, end));
    if (!parsed || parsed.label.length < 2 || parsed.label.length > 44 || parsed.body.length < 10) return match;
    sections.push({ number: marker[1], ...parsed });
  }

  const prefix = text.slice(0, markers[0].index).trim();
  const blocks = [];
  if (prefix.length >= 8) blocks.push(`<p>${formatInline(prefix)}</p>`);
  for (const section of sections) {
    blocks.push(`<h2 class="article-numbered-heading"><span class="article-numbered-heading__badge">第 ${escapeHtml(section.number)} 點</span><span>${formatHeadingInline(section.label)}</span></h2>`);
    blocks.push(`<p>${formatInline(section.body)}</p>`);
  }
  return blocks.join('\n');
});

const numberedParagraphHeadingPattern = new RegExp(
  '^(\\d+[.)、]?|(?:原因|徵兆|警號|禁忌|Step|Stage|階段|方法|迷思)\\s*[0-9一二三四五六七八九十]+)\\s*([^：:。！？!?]{2,42})[:：]\\s*([\\s\\S]{18,})$',
  'u'
);

const repairNumberedParagraphHeadingsHtml = (html = '') => html.replace(/<p>([\s\S]*?)<\/p>/g, (match, raw) => {
  const text = normalizeArticleText(stripHtml(raw));
  const leadingNumber = text.match(/^([1-6])[.。]\s+([\s\S]{12,})$/u);
  if (leadingNumber) {
    const parsed = splitInlineNumberedSegment(leadingNumber[2]);
    if (parsed && parsed.label.length >= 2 && parsed.label.length <= 44 && parsed.body.length >= 10) {
      return `<h2 class="article-numbered-heading"><span class="article-numbered-heading__badge">第 ${escapeHtml(leadingNumber[1])} 點</span><span>${formatHeadingInline(parsed.label)}</span></h2>\n<p>${formatInline(parsed.body)}</p>`;
    }
  }
  const numbered = text.match(numberedParagraphHeadingPattern);
  if (!numbered) return match;
  const title = `${numbered[1]} ${numbered[2]}`.replace(/\s+/g, ' ').trim();
  const body = numbered[3].trim();
  if (title.length < 5 || title.length > 54 || !body) return match;
  return `<h2>${escapeHtml(title)}</h2>\n<p>${escapeHtml(body)}</p>`;
});

const stripGeneratedDepthSectionsHtml = (html = '') => html
  .replace(/<h2[^>]*>(?:再整理|再看深一層|再看清楚|再判斷|再觀察|再落地看|再拆深一點|下一步不要急著做錯|你可以先觀察三個位置)[\s\S]*?<\/h2>[\s\S]*?(?=<h2|$)/g, '')
  .replace(/<h2[^>]*>先看清楚「[\s\S]*?真正卡住的位置<\/h2>[\s\S]*?(?=<h2|$)/g, '')
  .replace(/<h2[^>]*>為什麼會越處理越亂<\/h2>[\s\S]*?(?=<h2|$)/g, '')
  .replace(/<h2[^>]*>可以先做的三件事<\/h2>[\s\S]*?(?=<h2|$)/g, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

const repairHiddenNumberedPointsHtml = (html = '') => html
  .replace(
    /(<h2 class="article-numbered-heading"><span class="article-numbered-heading__badge">第 1 點<\/span><span>不掃興<\/span><\/h2>\s*)<p>當他分享開心事，你會陪他一起開心[：，,]而不是潑冷水（「<strong>車，有咩咁巴閉<\/strong>」）。在他失意時，你能看到他的付出，給予肯定。你能處理好自己的情緒[：，,]而不是要他時刻為你的心情負責。([\s\S]*?)<\/p>/g,
    '$1<p>當他分享開心事，你會陪他一起開心，而不是潑冷水（「<strong>車，有咩咁巴閉</strong>」）。</p>\n<h2 class="article-numbered-heading"><span class="article-numbered-heading__badge">第 2 點</span><span>提供認同</span></h2>\n<p>在他失意時，你能看到他的付出，給予肯定。</p>\n<h2 class="article-numbered-heading"><span class="article-numbered-heading__badge">第 3 點</span><span>情緒穩定</span></h2>\n<p>你能處理好自己的情緒，而不是要他時刻為你的心情負責。</p>'
  )
  .replace(/<p>([\s\S]*?)\s*(?:2[.。]\s*)([^：:。！？!?]{2,32})[:：]\s*([\s\S]*?)<\/p>/g, (match, before, label, after) => {
    const beforeText = normalizeArticleText(stripHtml(before)).trim();
    const labelText = normalizeArticleText(stripHtml(label)).trim();
    const afterText = normalizeArticleText(stripHtml(after)).trim();
    if (!beforeText || !labelText || !afterText || labelText.length > 32) return match;
    const next = afterText.match(/^([\s\S]*?)(?:3[.。]\s*([^：:。！？!?]{2,32})[:：]\s*([\s\S]*))$/u);
    if (!next) {
      return `<p>${formatInline(beforeText)}</p>\n<h2 class="article-numbered-heading"><span class="article-numbered-heading__badge">第 2 點</span><span>${formatHeadingInline(labelText)}</span></h2>\n<p>${formatInline(afterText)}</p>`;
    }
    const secondBody = normalizeArticleText(next[1]).trim();
    const thirdLabel = normalizeArticleText(next[2]).trim();
    const thirdBody = normalizeArticleText(next[3]).trim();
    if (!secondBody || !thirdLabel || !thirdBody) return match;
    return `<p>${formatInline(beforeText)}</p>\n<h2 class="article-numbered-heading"><span class="article-numbered-heading__badge">第 2 點</span><span>${formatHeadingInline(labelText)}</span></h2>\n<p>${formatInline(secondBody)}</p>\n<h2 class="article-numbered-heading"><span class="article-numbered-heading__badge">第 3 點</span><span>${formatHeadingInline(thirdLabel)}</span></h2>\n<p>${formatInline(thirdBody)}</p>`;
  });

const contentHeadingCount = (html = '') => [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)]
  .map((match) => stripHtml(match[1]))
  .filter((title) => !/^(重點速讀|Asteria 小提醒|常見問題|感情拯救所話你知)$/.test(title))
  .length;

const repairSparseArticleSectionsHtml = (html = '') => {
  if (contentHeadingCount(html) >= 2) return html;
  const splitAt = html.search(/<h2(?: class="article-highlight-title")?>重點速讀<\/h2>|<h2>Asteria 小提醒<\/h2>|<h2>感情拯救所話你知<\/h2>|<h2>常見問題<\/h2>/);
  const main = splitAt >= 0 ? html.slice(0, splitAt) : html;
  const rest = splitAt >= 0 ? html.slice(splitAt) : '';
  const repairedMain = main.replace(/<p>([\s\S]*?)<\/p>/g, (match, raw) => {
    const text = normalizeArticleText(stripHtml(raw));
    const questionParts = text.match(/^([^。！!？?]{4,36}[？?])\s*([\s\S]{24,})$/u);
    if (questionParts) {
      return `<h2>${escapeHtml(questionParts[1].trim())}</h2>\n<p>${escapeHtml(questionParts[2].trim())}</p>`;
    }
    const parts = text.match(/^([^：:。！？!?]{2,36})[:：]\s*([\s\S]{24,})$/u);
    if (!parts) return match;
    const label = parts[1].trim();
    const body = parts[2].trim();
    if (/^(如果|例如|讀到這裏|不過|但其實|所以|而且|因為|當你|你可以)$/.test(label)) return match;
    return `<h2>${escapeHtml(label)}</h2>\n<p>${escapeHtml(body)}</p>`;
  });
  return `${repairedMain}${rest}`;
};

const shouldPromoteLabelHeading = (label = '', body = '') => {
  const cleanLabel = normalizeArticleText(label).replace(/[：:。！？!?]+$/u, '').trim();
  const cleanBody = normalizeArticleText(body);
  if (cleanLabel.length < 2 || cleanLabel.length > 36 || cleanBody.length < 30) return false;
  if (/^(如果|例如|讀到這裏|讀到這裡|不過|但其實|所以|而且|因為|當你|你可以|結果|最後|總結|重點|建議|小提醒)$/.test(cleanLabel)) return false;
  if (/^(Asteria|WhatsApp|Instagram|Facebook|Telegram|Click|FAQ|Q&A)$/i.test(cleanLabel)) return false;
  if (/[,，。！？!?]/u.test(cleanLabel)) return false;
  return true;
};

const repairLabelParagraphHeadingsHtml = (html = '') => {
  const splitAt = html.search(/<h2(?: class="article-highlight-title")?>重點速讀<\/h2>|<h2>Asteria 小提醒<\/h2>|<h2>感情拯救所話你知<\/h2>|<h2>常見問題<\/h2>/);
  const main = splitAt >= 0 ? html.slice(0, splitAt) : html;
  const rest = splitAt >= 0 ? html.slice(splitAt) : '';
  const repairedMain = main.replace(/<p>([\s\S]*?)<\/p>/g, (match, raw) => {
    const text = normalizeArticleText(stripHtml(raw));
    const parts = text.match(/^([^：:。！？!?]{2,36})[:：]\s*([\s\S]{30,})$/u);
    if (!parts) return match;
    const label = parts[1].trim();
    const body = parts[2].trim();
    if (!shouldPromoteLabelHeading(label, body)) return match;
    return `<h2>${escapeHtml(label)}</h2>\n<p>${escapeHtml(body)}</p>`;
  });
  return `${repairedMain}${rest}`;
};

const repairWeakHeadingsHtml = (html = '') => html.replace(
  /<h2>(例如[^<]{2,34}|可以改成|可以這樣講|可以咁講)<\/h2>\n<p>([\s\S]*?)<\/p>/g,
  (_, heading, body) => `<p>${escapeHtml(normalizeArticleText(`${heading}：${stripHtml(body)}`))}</p>`
);

const mergeHeadingTextIntoParagraph = (heading = '', body = '') => {
  const title = normalizeArticleText(stripHtml(heading)).replace(/[。！？]+$/u, '');
  const text = normalizeArticleText(stripHtml(body));
  if (!title) return text;
  if (!text) return title;
  if (text.startsWith(title)) return text;
  return normalizeArticleText(`${title}：${text}`);
};

const repairAdjacentEmptyHeadingsHtml = (html = '') => {
  let out = html
    .replace(/<h2>感情拯救所，告訴你<\/h2>\n(?=<h2>感情拯救所話你知<\/h2>)/g, '')
    .replace(
      /<h2>呢兩種唔同嘅諗法正正係代表緊唔同嘅感情心態\s*A<\/h2>\n<h2>定型心態（fixed mindset）\s*B<\/h2>\n<p>成長心態（growth mindset），([\s\S]*?)<\/p>/g,
      '<h2>兩種感情心態：定型心態 vs 成長心態</h2>\n<p>A：定型心態（fixed mindset），會傾向覺得大家唔夾就等於改變唔到；B：成長心態（growth mindset），會相信關係可以透過溝通、學習同磨合慢慢改善。$1</p>'
    );

  for (let pass = 0; pass < 4; pass += 1) {
    const next = out.replace(
      /<h2(?![^>]*article-highlight-title)([^>]*)>((?:(?!<\/h2>).)*)<\/h2>\s*<h[23](?![^>]*article-highlight-title)([^>]*)>((?:(?!<\/h[23]>).)*)<\/h[23]>\s*<p>([\s\S]*?)<\/p>/g,
      (match, attrs1, heading1, attrs2, heading2, paragraph) => {
        const first = normalizeArticleText(stripHtml(heading1));
        const second = normalizeArticleText(stripHtml(heading2));
        if (/^(重點速讀|Asteria 小提醒|常見問題|感情拯救所話你知)$/.test(first)) return match;
        if (/^(重點速讀|Asteria 小提醒|常見問題|感情拯救所話你知)$/.test(second)) return match;
        if (!first || !second || first.length > 70 || second.length > 120) return match;
        const mergedParagraph = mergeHeadingTextIntoParagraph(second, paragraph);
        return `<h2${attrs1}>${escapeHtml(first)}</h2>\n<p>${escapeHtml(mergedParagraph)}</p>`;
      }
    );
    if (next === out) break;
    out = next;
  }
  return out;
};

const repairOverlongHeadingsHtml = (html = '') => html.replace(
  /<h2(?![^>]*article-highlight-title)([^>]*)>([\s\S]*?)<\/h2>/g,
  (match, attrs, heading) => {
    const text = normalizeArticleText(stripHtml(heading));
    if (text.length <= 80 || /^(重點速讀|Asteria 小提醒|常見問題)$/.test(text)) return match;
    return `<p>${escapeHtml(text)}</p>`;
  }
);

const repairRemainingAdjacentHeadingsHtml = (html = '') => {
  let out = html;
  for (let pass = 0; pass < 6; pass += 1) {
    const next = out.replace(
      /<h2(?![^>]*article-highlight-title)([^>]*)>((?:(?!<\/h2>).)*)<\/h2>\s*<h[23](?![^>]*article-highlight-title)([^>]*)>((?:(?!<\/h[23]>).)*)<\/h[23]>\s*<p>([\s\S]*?)<\/p>/g,
      (match, attrs1, heading1, _attrs2, heading2, paragraph) => {
        const first = normalizeArticleText(stripHtml(heading1));
        const second = normalizeArticleText(stripHtml(heading2));
        if (/^(重點速讀|Asteria 小提醒|常見問題|感情拯救所話你知)$/.test(first)) return match;
        if (/^(重點速讀|Asteria 小提醒|常見問題|感情拯救所話你知)$/.test(second)) return match;
        if (!first || !second || first.length > 70 || second.length > 120) return match;
        const mergedParagraph = mergeHeadingTextIntoParagraph(second, paragraph);
        return `<h2${attrs1}>${escapeHtml(first)}</h2>\n<p>${escapeHtml(mergedParagraph)}</p>`;
      }
    );
    if (next === out) break;
    out = next;
  }
  return out;
};

const repairResidualTinyParagraphsHtml = (html = '') => html
  .replace(/<p>\s*[A-Za-z]\s*<\/p>/g, '')
  .replace(/<p>\s*[，,、。；;：:！？!?]+\s*<\/p>/g, '')
  .replace(/<p>\s*(?:A|B|C|D)\s*[：:]\s*<\/p>/g, '');

const isFragmentParagraphText = (text = '') => {
  const clean = normalizeArticleText(text);
  if (!clean || clean.length > 36) return false;
  if (/^[A-D][：:；;]/.test(clean)) return false;
  if (/^(Whatsapp|WhatsApp|Facebook|Telegram|Instagram|Asteria Space)$/i.test(clean)) return false;
  if (/[。！？!?？]$/u.test(clean)) return false;
  return true;
};

const mergeFragmentTexts = (texts = []) => {
  const clean = texts.map((text) => normalizeArticleText(text)).filter(Boolean);
  if (!clean.length) return '';
  if (clean.length === 1) return clean[0];
  const startsLikeSentence = /^(但|而|如果|當|就|唔|要|可以|所以|然後|例如|可能|你|佢|大家|有啲|成日|每次|因為|或者|又或者|只要|即使|無論|喺|從|想|會)/.test(clean[0]);
  const firstLooksLikeLabel = clean[0].length <= 10 && !startsLikeSentence && !/[，,。！？!?？：:]/u.test(clean[0]);
  if (firstLooksLikeLabel) {
    const body = clean.slice(1).join('，').replace(/，([。！？!?？])/g, '$1');
    return normalizeArticleText(`${clean[0]}：${body}`)
      .replace(/([「『（(])\s+/g, '$1')
      .replace(/\s+([」』）)])/g, '$1')
      .replace(/([\u4e00-\u9fff])\s+([\u4e00-\u9fff])/g, '$1$2')
      .replace(/[，,、；;：:]+$/u, '。')
      .replace(/([^。！？!?？])$/u, '$1。');
  }
  return clean.join('，')
    .replace(/，([。！？!?？])/g, '$1')
    .replace(/([「『（(])\s+/g, '$1')
    .replace(/\s+([」』）)])/g, '$1')
    .replace(/([\u4e00-\u9fff])\s+([\u4e00-\u9fff])/g, '$1$2')
    .replace(/[，,、；;：:]+$/u, '。')
    .replace(/([^。！？!?？])$/u, '$1。');
};

const repairFragmentParagraphRunsHtml = (html = '') => {
  const blockPattern = /<(h2|h3|p|ul)(?: [^>]*)?>[\s\S]*?<\/\1>/g;
  const output = [];
  let cursor = 0;
  let buffer = [];

  const flush = () => {
    if (!buffer.length) return;
    if (buffer.length >= 2) {
      output.push(`<p>${escapeHtml(mergeFragmentTexts(buffer.map((item) => item.text)))}</p>\n`);
    } else {
      const text = normalizeArticleText(buffer[0].text);
      output.push(isFragmentParagraphText(text) ? `<p>${escapeHtml(text).replace(/([^。！？!?？])$/u, '$1。')}</p>\n` : buffer[0].html);
    }
    buffer = [];
  };

  for (const match of html.matchAll(blockPattern)) {
    if (match.index > cursor) {
      const gap = html.slice(cursor, match.index);
      if (gap.trim()) {
        flush();
        output.push(gap);
      } else if (!buffer.length) {
        output.push(gap);
      }
    }
    const block = match[0];
    const tag = match[1];
    cursor = match.index + block.length;

    if (tag !== 'p') {
      flush();
      output.push(block);
      continue;
    }

    const text = normalizeArticleText(stripHtml(block));
    const fragment = isFragmentParagraphText(text);
    if (fragment || buffer.length) {
      buffer.push({ html: block, text });
      if (!fragment && /[。！？!?？）」]$/u.test(text)) flush();
      continue;
    }
    output.push(block);
  }

  if (cursor < html.length) {
    flush();
    output.push(html.slice(cursor));
  } else {
    flush();
  }

  return output.join('');
};

const repairCompareBlocksHtml = (html = '') => {
  const normalizePrefix = (prefix) => prefix === 'B；' ? 'B：' : prefix;
  const comparePairLabels = [
    ['真愛', '習慣'],
    ['大男人', '恐怖情人'],
    ['定型心態', '成長心態'],
    ['抱怨嘅人', '被抱怨嘅人'],
    ['指責嘅人', '被指責嘅人'],
    ['自我辯護', '反將對方一軍'],
    ['固定回應', '建立好預期及適應習慣'],
    ['被肯定、被崇拜', '關懷體貼']
  ];
  const compareGrid = (labelA, bodyA, labelB, bodyB) => (
    `<div class="article-compare-grid article-compare-grid-labelled"><div class="article-compare-card"><span>${escapeHtml(labelA)}</span><p>${escapeHtml(normalizeArticleText(bodyA))}</p></div><div class="article-compare-card"><span>${escapeHtml(labelB)}</span><p>${escapeHtml(normalizeArticleText(bodyB))}</p></div></div>`
  );
  let out = html;
  for (const [labelA, labelB] of comparePairLabels) {
    const safeA = labelA.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const safeB = labelB.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out
      .replace(
        new RegExp(`<p>${safeA}[：:]((?:(?!<\\/p>|<h2|<h3).){12,260}?)<\\/p>\\s*<p>${safeB}[：:]((?:(?!<\\/p>|<h2|<h3).){12,260}?)<\\/p>`, 'g'),
        (_, bodyA, bodyB) => compareGrid(labelA, stripHtml(bodyA), labelB, stripHtml(bodyB))
      )
      .replace(
        new RegExp(`<p>${safeA}[：:]((?:(?!<\\/p>|<h2|<h3).){12,260}?)[，,]\\s*${safeB}[，:：]((?:(?!<\\/p>|<h2|<h3).){12,260}?)<\\/p>`, 'g'),
        (_, bodyA, bodyB) => compareGrid(labelA, stripHtml(bodyA), labelB, stripHtml(bodyB))
      );
  }
  return out
    .replace(
      /<p>(A[：:；][\s\S]*?)<\/p>\s*<p>(B[：:；][\s\S]*?)<\/p>/g,
      (match, first, second) => {
        const a = normalizeArticleText(stripHtml(first));
        const b = normalizeArticleText(stripHtml(second));
        if (a.length > 140 || b.length > 140) return match;
        return `<div class="article-compare-grid"><div class="article-compare-card"><span>${escapeHtml(normalizePrefix(a.slice(0, 2)))}</span><p>${escapeHtml(a.slice(2).trim())}</p></div><div class="article-compare-card"><span>${escapeHtml(normalizePrefix(b.slice(0, 2)))}</span><p>${escapeHtml(b.slice(2).trim())}</p></div></div>`;
      }
    )
    .replace(
      /<p>(定型心態|成長心態)<\/p>\s*<p>([\s\S]*?)<\/p>/g,
      (match, label, body) => {
        const text = normalizeArticleText(stripHtml(body));
        if (text.length > 180) return match;
        return `<div class="article-definition-card"><span>${escapeHtml(label)}</span><p>${escapeHtml(text)}</p></div>`;
      }
    );
};

const splitChoiceTraits = (text = '') => {
  const labels = ['嗌交後', '你做錯事', '佢做錯事', '對你嘅信任度', '對未來嘅諗法'];
  const normalized = normalizeArticleText(text)
    .replace(/^A型人[，,：:]?\s*/u, '')
    .replace(/^B型人[，,：:]?\s*/u, '');
  const rows = [];
  for (let index = 0; index < labels.length; index += 1) {
    const label = labels[index];
    const nextLabels = labels.slice(index + 1).map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const pattern = nextLabels
      ? new RegExp(`${label}[：:]([\\s\\S]*?)(?=(?:${nextLabels})[：:]|$)`, 'u')
      : new RegExp(`${label}[：:]([\\s\\S]*)$`, 'u');
    const match = normalized.match(pattern);
    if (match?.[1]) {
      rows.push({ label, body: match[1].replace(/[，,、；;]+$/u, '').trim() });
    }
  }
  return rows.filter((row) => row.body);
};

const choiceTableHtml = (leftTitle = '', leftRows = [], rightTitle = '', rightRows = []) => {
  const rightMap = new Map(rightRows.map((row) => [row.label, row.body]));
  const labels = leftRows.map((row) => row.label).filter((label) => rightMap.has(label));
  if (labels.length < 2) return '';
  return `<div class="article-choice-compare article-choice-table"><div class="article-choice-head"><span>比較位</span><span>${escapeHtml(leftTitle)}</span><span>${escapeHtml(rightTitle)}</span></div>${labels.map((label) => {
    const left = leftRows.find((row) => row.label === label)?.body || '';
    const right = rightMap.get(label) || '';
    return `<div class="article-choice-row"><span>${escapeHtml(label)}</span><p>${escapeHtml(left)}</p><p>${escapeHtml(right)}</p></div>`;
  }).join('')}</div>`;
};

const repairChoiceComparisonHtml = (html = '') => html.replace(
  /(<h2>呢兩種人，你會揀一個？<\/h2>\s*)([\s\S]*?)(?=<h2>年紀仲細嘅時候<\/h2>)/g,
  (match, heading, block) => {
    const paragraphs = [...block.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((item) => normalizeArticleText(stripHtml(item[1]))).filter(Boolean);
    const bIndex = paragraphs.findIndex((text) => /^B型人[，,：:]/u.test(text));
    if (bIndex < 0) return match;
    const aText = paragraphs.slice(0, bIndex).join('，');
    const bText = paragraphs.slice(bIndex).join('，');
    const aRows = splitChoiceTraits(aText);
    const bRows = splitChoiceTraits(bText);
    if (aRows.length < 3 || bRows.length < 3) return match;
    const table = choiceTableHtml('A型人', aRows, 'B型人', bRows);
    if (!table) return match;
    return `${heading}${table}\n`;
  }
);

const repairBigManComparisonHtml = (html = '') => html.replace(
  /(<h2>大男人 vs 恐怖情人<\/h2>\s*)([\s\S]*?)(?=<h2>面對恐怖情人)/g,
  (match, heading, block) => {
    const paragraphs = [...block.matchAll(/<p>([\s\S]*?)<\/p>/g)]
      .map((item) => normalizeArticleText(stripHtml(item[1])))
      .filter((text) => text && !/^（?建議呢版用表列形式/.test(text) && !/^性格、行為表現/.test(text));
    const rows = [];
    for (let index = 0; index < paragraphs.length; index += 1) {
      const first = paragraphs[index];
      const second = paragraphs[index + 1] || '';
      const firstMatch = first.match(/^([^：:]{2,16})[：:]\s*大男人[：:]\s*([\s\S]+)$/u);
      const secondMatch = second.match(/^恐怖情人[：:]\s*([\s\S]+)$/u);
      if (!firstMatch || !secondMatch) continue;
      rows.push({ label: firstMatch[1].trim(), left: firstMatch[2].trim(), right: secondMatch[1].trim() });
      index += 1;
    }
    if (/情緒表現/.test(block) && !rows.some((row) => row.label === '情緒表現')) {
      rows.splice(1, 0, {
        label: '情緒表現',
        left: '有控制慾、情緒狀態、對另一半體貼。',
        right: '控制慾好強、自信不足、情緒反覆起伏大、會威脅你。'
      });
    }
    if (rows.length < 2) return match;
    const table = `<div class="article-choice-compare article-choice-table"><div class="article-choice-head"><span>比較位</span><span>大男人</span><span>恐怖情人</span></div>${rows.map((row) => `<div class="article-choice-row"><span>${escapeHtml(row.label)}</span><p>${escapeHtml(row.left)}</p><p>${escapeHtml(row.right)}</p></div>`).join('')}</div>`;
    return `${heading}${table}\n`;
  }
);

const repairPhaseCardsHtml = (html = '') => html.replace(
  /<p>(初期[：:][\s\S]*?中期[：:][\s\S]*?最後期[：:][\s\S]*?)<\/p>/g,
  (match, raw) => {
    const text = normalizeArticleText(stripHtml(raw));
    const labels = ['初期', '中期', '最後期'];
    const rows = [];
    for (let index = 0; index < labels.length; index += 1) {
      const label = labels[index];
      const later = labels.slice(index + 1).filter((item) => text.includes(`${item}：`) || text.includes(`${item}:`));
      const pattern = later.length
        ? new RegExp(`${label}[：:]\\s*([\\s\\S]*?)(?=${later.map((item) => `${item}[：:]`).join('|')})`, 'u')
        : new RegExp(`${label}[：:]\\s*([\\s\\S]*)$`, 'u');
      const found = text.match(pattern);
      if (found?.[1]) rows.push({ label, body: found[1].replace(/[，,、；;]+$/u, '').trim() });
    }
    if (rows.length < 3) return match;
    return `<div class="article-step-grid article-phase-grid">${rows.map((row) => `<div class="article-step-card"><span>${escapeHtml(row.label)}</span><p>${escapeHtml(row.body)}</p></div>`).join('')}</div>`;
  }
);

const scienceCardLabel = (heading = '') => {
  const text = normalizeArticleText(stripHtml(heading));
  if (/費洛蒙|氣味/.test(text)) return '身體吸引';
  if (/科學|心理|大腦|研究/.test(text)) return '心理學解釋';
  if (/一見鍾情.*真愛|真愛/.test(text)) return '關鍵判斷';
  return '';
};

const repairScienceCardsHtml = (html = '') => html.replace(
  /<h2>(科學點解釋？|費洛蒙令你覺得你鍾意佢！|一見鍾情，有機會變成真愛？)<\/h2>\s*((?:<p>[\s\S]*?<\/p>\s*){2,7})(?=<h2|$)/g,
  (match, heading, body) => {
    const paragraphs = [...body.matchAll(/<p>([\s\S]*?)<\/p>/g)]
      .map((item) => normalizeArticleText(stripHtml(item[1])))
      .filter(Boolean);
    if (paragraphs.length < 2) return match;
    const label = scienceCardLabel(heading) || '重點拆解';
    return [
      `<h2>${heading}</h2>`,
      '<div class="article-science-grid">',
      `<div class="article-science-card"><span>${escapeHtml(label)}</span><p>${escapeHtml(paragraphs.join(' '))}</p></div>`,
      '</div>'
    ].join('\n');
  }
);

const repairLoveStageTimelineHtml = (html = '') => html.replace(
  /<h2>心理學家將愛情分為三個階段<\/h2>\s*<p>慾望[，,（(]*Lust[）)]?[，,、\s]*吸引[（(]*Attraction[）)]?[，,、\s]*依戀[（(]*Attachment[）)]?[\s\S]*?<\/p>\s*((?:<p>[\s\S]*?<\/p>\s*){1,4})(?=<h2|$)/g,
  (_match, tail) => {
    const bodyText = [...tail.matchAll(/<p>([\s\S]*?)<\/p>/g)]
      .map((item) => normalizeArticleText(stripHtml(item[1])))
      .filter(Boolean)
      .join(' ');
    return [
      '<h2>心理學家將愛情分為三個階段</h2>',
      '<div class="article-stage-timeline">',
      '<div class="article-stage-card"><span>1</span><strong>慾望 Lust</strong><p>最初的身體吸引和好奇，令你想靠近對方。</p></div>',
      '<div class="article-stage-card"><span>2</span><strong>吸引 Attraction</strong><p>開始被對方特質牽動，想了解更多，也容易出現心動感。</p></div>',
      '<div class="article-stage-card"><span>3</span><strong>依戀 Attachment</strong><p>由短暫吸引走向信任、親密感和穩定連結。</p></div>',
      '</div>',
      bodyText ? `<p>${escapeHtml(bodyText)}</p>` : ''
    ].filter(Boolean).join('\n');
  }
);

const repairAttachmentActionCardsHtml = (html = '') => html.replace(
  /<h2>點樣由吸引變依戀？<\/h2>\s*((?:<p>[\s\S]*?<\/p>\s*){2,5})(?=<h2|$)/g,
  (match, body) => {
    const text = [...body.matchAll(/<p>([\s\S]*?)<\/p>/g)]
      .map((item) => normalizeArticleText(stripHtml(item[1])))
      .filter(Boolean)
      .join(' ');
    const rows = [];
    const link = text.match(/強化心靈連結[：:]\s*([\s\S]*?)(?=建立信任[：:]|$)/u)?.[1]?.trim();
    const trust = text.match(/建立信任[：:]\s*([\s\S]*)$/u)?.[1]?.trim();
    if (link) rows.push({ label: '強化心靈連結', body: link });
    if (trust) rows.push({ label: '建立信任', body: trust });
    if (rows.length < 2) return match;
    return `<h2>點樣由吸引變依戀？</h2>\n<div class="article-step-grid">${rows.map((row) => `<div class="article-step-card"><span>${escapeHtml(row.label)}</span><p>${escapeHtml(row.body)}</p></div>`).join('')}</div>`;
  }
);

const sectionCardHeadingPattern = /原因|方法|徵兆|警號|真相|心態|階段|禁忌|地雷|判斷|分辨|做法|應對|處理|點樣|如何|為什麼|為甚麼|點解|唔好|記住|關鍵|特徵|秘訣|指南|攻略|修復|重建|建立|表達|溝通|界線|自我反思|改變思維|培養信任|展示真實|創造情感|累積信任|分享細節|自我保護|幻想破滅|逃避型依附/u;
const excludedSectionCardHeading = /^(感情拯救所話你知|感情拯救所，告訴你|重點速讀|Asteria 小提醒|常見問題|建議內部連結|科學點解釋|心理學家將愛情分為三個階段|點樣由吸引變依戀|那到底要怎樣分辨|你可以先觀察三個位置|冷暴力|為甚麼有些男人會用沉默|面對冷暴力|不是所有沉默|再看深一層|下一步不要急著做錯|再觀察|再整理|再判斷|再拆深一點)/u;

const repairSectionCardsHtml = (html = '') => html.replace(
  /<h2(?![^>]*article-highlight-title)([^>]*)>([\s\S]*?)<\/h2>\s*((?:<p>[\s\S]*?<\/p>\s*){1,3})(?=<h2|$)/g,
  (match, attrs, headingHtml, body) => {
    const heading = normalizeArticleText(stripHtml(headingHtml));
    if (!sectionCardHeadingPattern.test(heading) || excludedSectionCardHeading.test(heading)) return match;
    if (/article-numbered-heading/.test(attrs)) return match;
    if (/class=/.test(attrs) && !/article-numbered-heading/.test(attrs)) return match;
    if (/article-(?:section|science|stage|step|point|compare|choice|check|fact|tip|quiz|dialogue|definition)/.test(body)) return match;
    const paragraphs = [...body.matchAll(/<p>[\s\S]*?<\/p>/g)].map((item) => item[0]);
    if (!paragraphs.length) return match;
    const textLength = normalizeArticleText(stripHtml(body)).length;
    if (paragraphs.length > 2 || textLength < 32 || textLength > 360) return match;
    return `<h2${attrs}>${headingHtml}</h2>\n<div class="article-section-card">${paragraphs.join('')}</div>`;
  }
);

const repairConceptCardsHtml = (html = '') => html.replace(
  /<p>(一段健康嘅戀愛關係[：:][\s\S]*?報備\s*=\s*\/=\s*請求批准[\s\S]*?)<\/p>/g,
  (match, raw) => {
    const text = normalizeArticleText(stripHtml(raw));
    return `<div class="article-point-grid"><div class="article-point-card"><span>健康報備</span><p>${escapeHtml(text.replace(/^一段健康嘅戀愛關係[：:]\s*/u, ''))}</p></div></div>`;
  }
);

const stepLabels = ['第一', '第二', '第三', '第四', '第五'];

const repairInlineStepCardsHtml = (html = '') => html.replace(
  /<p>(第一[，,][\s\S]*?第二[，,][\s\S]*?第三[，,][\s\S]*?)<\/p>/g,
  (match, raw) => {
    const text = normalizeArticleText(stripHtml(raw));
    const rows = [];
    for (let index = 0; index < stepLabels.length; index += 1) {
      const label = stepLabels[index];
      const laterLabels = stepLabels.slice(index + 1).filter((item) => text.includes(`${item}，`) || text.includes(`${item},`));
      const pattern = laterLabels.length
        ? new RegExp(`${label}[，,]\\s*([\\s\\S]*?)(?=${laterLabels.map((item) => `${item}[，,]`).join('|')})`, 'u')
        : new RegExp(`${label}[，,]\\s*([\\s\\S]*)$`, 'u');
      const found = text.match(pattern);
      if (found?.[1]) rows.push({ label, body: found[1].trim().replace(/[。；;，,]+$/u, '。') });
    }
    if (rows.length < 3) return match;
    return `<div class="article-step-grid">${rows.map((row) => `<div class="article-step-card"><span>${escapeHtml(row.label)}</span><p>${escapeHtml(row.body)}</p></div>`).join('')}</div>`;
  }
);

const labelCardCandidate = (text = '') => {
  const clean = normalizeArticleText(text);
  const match = clean.match(/^([^：:。！？!?？]{2,16})[：:]\s*([\s\S]{18,220})$/u);
  if (!match) return null;
  const label = match[1].trim();
  const body = match[2].trim();
  if (/^(例如|但|但係|不過|所以|如果|因為|當你|好多人|好多時候|其實|簡單來說|最後|總結|請記住|溫馨提示|先問下自己|你可以|我哋|呢類情況|好老土咁講)$/.test(label)) return null;
  if (/^\d+[）.)]/.test(label)) return null;
  if (/[，,、；;]/u.test(label)) return null;
  if ((body.match(/[：:]/g) || []).length > 1) return null;
  return { label, body };
};

const repairLabelCardRunsHtml = (html = '') => {
  const blockPattern = /<(h2|h3|p|ul|div)(?: [^>]*)?>[\s\S]*?<\/\1>/g;
  const output = [];
  let cursor = 0;
  let run = [];

  const flush = () => {
    if (run.length >= 2) {
      output.push(`<div class="article-point-grid">${run.map(({ label, body }) => `<div class="article-point-card"><span>${escapeHtml(label)}</span><p>${escapeHtml(body)}</p></div>`).join('')}</div>\n`);
    } else {
      output.push(...run.map((item) => item.html));
    }
    run = [];
  };

  for (const match of html.matchAll(blockPattern)) {
    if (match.index > cursor) {
      const gap = html.slice(cursor, match.index);
      if (gap.trim()) {
        flush();
        output.push(gap);
      } else if (!run.length) {
        output.push(gap);
      }
    }
    const block = match[0];
    const tag = match[1];
    cursor = match.index + block.length;

    if (tag !== 'p') {
      flush();
      output.push(block);
      continue;
    }

    const candidate = labelCardCandidate(stripHtml(block));
    if (!candidate) {
      flush();
      output.push(block);
      continue;
    }
    run.push({ html: block, ...candidate });
  }

  if (cursor < html.length) {
    flush();
    output.push(html.slice(cursor));
  } else {
    flush();
  }

  return output.join('');
};

const repairFinalTypographyHtml = (html = '') => html
  .replace(/想了解更多/g, '想知道更多')
  .replace(/([「『（(])\s+/g, '$1')
  .replace(/\s+([」』）)])/g, '$1')
  .replace(/([\u4e00-\u9fff])\s+([\u4e00-\u9fff])/g, '$1$2')
  .replace(/，{2,}/g, '，')
  .replace(/：，/g, '：')
  .replace(/，。/g, '。');

const repairHighlightAgainstUiHtml = (html = '') => {
  const excluded = new Set(
    [...html.matchAll(/<(h3|dt|span)[^>]*>([\s\S]*?)<\/\1>/g)]
      .map((match) => normalizeArticleText(stripHtml(match[2])).replace(/[「」『』。！？!?？]+/g, '').trim())
      .filter((text) => text.length >= 2)
  );
  const normalizeKey = (text = '') => normalizeArticleText(text)
    .replace(/[「」『』。！？!?？]+/g, '')
    .replace(/\s+/g, '')
    .trim();

  let out = html.replace(/<ul class="article-highlight-list">([\s\S]*?)<\/ul>/g, (match, inner) => {
    const items = [...inner.matchAll(/<li>([\s\S]*?)<\/li>/g)]
      .map((item) => normalizeArticleText(stripHtml(item[1])).trim())
      .filter((item) => {
        const key = normalizeKey(item);
        if (!key) return false;
        if (item.length > 72) return false;
        if (/^(先看|有睇過|這就是典型|防伏行為\d+|第\s*\d+\s*點)/.test(item)) return false;
        if (/不想.*？$|受夠.*？$|想學.*？$/.test(item)) return false;
        if (/^(第一|第二|第三|第四|第五)[，,：:]/.test(item)) return false;
        if (/建議呢版用表列形式出/.test(item)) return false;
        if (/^(嗌交後|你做錯事|佢做錯事|對你嘅信任度|對未來嘅諗法)[：:]/.test(item)) return false;
        for (const text of excluded) {
          const exKey = normalizeKey(text);
          if (!exKey) continue;
          if (key === exKey || exKey.startsWith(key)) return false;
        }
        return true;
      })
      .slice(0, 4);
    if (items.length < 2) return '';
    return `<ul class="article-highlight-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  });
  out = out
    .replace(/<h2 class="article-highlight-title">重點速讀<\/h2>\s*(?=<h2>|$)/g, '')
    .replace(/<h2 class="article-highlight-title">重點速讀<\/h2>\s*(?=<h2>Asteria 小提醒<\/h2>)/g, '');
  if (!/article-highlight-list/.test(out)) return buildFallbackHighlightHtml(out);
  return out;
};

const repairEditorialArtifactsHtml = (html = '') => html
  .replace(/<p>愛情不只是感覺，更是化學反應。例如「<strong>一見鍾情<\/strong>」其實是大腦在。<\/p>/g, '<p>愛情不只是感覺，更是大腦和身體一齊參與的化學反應。例如「<strong>一見鍾情</strong>」不一定只是浪漫幻想，也可能同吸引、投射和多巴胺反應有關。</p>')
  .replace(/<h2>內文 \(Web - 深度分析版\)<\/h2>\n?<p>引言：/g, '<p>')
  .replace(/內文 \(Web - 深度分析版\)：?引言：?/g, '')
  .replace(/<li>內文 \(Web - 深度分析版\)：/g, '<li>');

const buildFallbackHighlightHtml = (html = '') => {
  const contentBeforeFaq = stripFaqForSummary(html).split(/<h2>Asteria 小提醒<\/h2>/)[0] || stripFaqForSummary(html);
  const bullets = [];
  for (const section of contentBeforeFaq.matchAll(/<h2(?![^>]*article-highlight-title)[^>]*>(.*?)<\/h2>([\s\S]*?)(?=<h2|$)/g)) {
    const heading = stripHtml(section[1]);
    if (/^(重點速讀|Asteria 小提醒|常見問題|感情拯救所話你知|感情拯救所，告訴你)$/.test(heading)) continue;
    if (isGenericHighlightHeading(heading)) continue;
    const paragraph = section[2].match(/<p>([\s\S]*?)<\/p>/)?.[1] || '';
    const bullet = conciseHighlightText('', stripHtml(paragraph));
    if (bullet && bullet.length >= 8 && bullet.length <= 42) bullets.push(bullet);
    if (bullets.length >= 4) break;
  }

  if (bullets.length < 2) {
    for (const paragraph of contentBeforeFaq.matchAll(/<p>([\s\S]*?)<\/p>/g)) {
      const sentence = conciseHighlightText('', stripHtml(paragraph[1]));
      if (sentence && sentence.length >= 8 && sentence.length <= 42 && !bullets.includes(sentence)) bullets.push(sentence);
      if (bullets.length >= 4) break;
    }
  }

  if (bullets.length < 2) {
    bullets.push('先分清感覺、事實同界線。', '不要只聽說話，要看持續行動。');
  }

  if (bullets.length < 2) return html;
  const highlight = `<h2 class="article-highlight-title">重點速讀</h2>\n<ul class="article-highlight-list">${bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  if (/<h2>Asteria 小提醒<\/h2>/.test(html)) return html.replace(/<h2>Asteria 小提醒<\/h2>/, `${highlight}\n<h2>Asteria 小提醒</h2>`);
  if (/<h2>常見問題<\/h2>/.test(html)) return html.replace(/<h2>常見問題<\/h2>/, `${highlight}\n<h2>常見問題</h2>`);
  return `${html}\n${highlight}`;
};

const headingTextFromHtml = (headingHtml = '') => normalizeArticleText(stripHtml(
  headingHtml
    .replace(/<span class="article-numbered-heading__badge">[\s\S]*?<\/span>/g, '')
    .replace(/<span>([\s\S]*?)<\/span>/g, '$1')
)).replace(/[「」『』]/g, '').trim();

const makeInsightHighlightSentence = (heading = '', paragraph = '') => {
  const cleanHeading = normalizeArticleText(heading)
    .replace(/[「」『』]/g, '')
    .replace(/[。！？!?？]+$/u, '')
    .trim();
  const cleanText = normalizeArticleText(stripHtml(paragraph)).replace(/[「」『』]/g, '').trim();
  if (!cleanHeading || !cleanText) return '';
  if (/^(先看|例子|真相|後果|感情拯救所話你知)$/u.test(cleanHeading)) return '';
  let sentence = firstCompleteSentence(cleanText, { min: 18, max: 58 }) || shortenAtNaturalBreak(cleanText, 58);
  sentence = sentence
    .replace(new RegExp(`^${cleanHeading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[：:]?\\s*`, 'u'), '')
    .replace(/^(科學真相|特徵|原因|做法|重點)[：:]\s*/u, '')
    .replace(/[「」『』]/g, '')
    .trim();
  if (!sentence || sentence.length < 12) return '';
  if (sentence.length > 46) sentence = shortenAtNaturalBreak(sentence, 46) || sentence.slice(0, 46);
  if (!/[。！？!?？]$/u.test(sentence)) sentence += '。';
  if (cleanHeading.length >= 4 && cleanHeading.length <= 24 && !sentence.includes(cleanHeading)) {
    return `${cleanHeading}：${sentence}`;
  }
  return sentence;
};

const rebuildHighlightFromArticleHtml = (html = '') => {
  const splitMatch = html.match(/<h2 class="article-highlight-title">重點速讀<\/h2>\s*<ul class="article-highlight-list">[\s\S]*?<\/ul>/);
  if (!splitMatch) return html;
  const beforeHighlight = html.slice(0, splitMatch.index);
  const afterHighlight = html.slice(splitMatch.index + splitMatch[0].length);
  const sectionHtml = beforeHighlight.split(/<h2>Asteria 小提醒<\/h2>|<h2>常見問題<\/h2>/)[0] || beforeHighlight;
  const bullets = [];
  for (const section of sectionHtml.matchAll(/<h2(?![^>]*article-highlight-title)([^>]*)>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2|$)/g)) {
    const heading = headingTextFromHtml(section[2]);
    if (!heading || isGenericHighlightHeading(heading)) continue;
    const paragraph = section[3].match(/<p>([\s\S]*?)<\/p>/)?.[1] || '';
    const item = makeInsightHighlightSentence(heading, paragraph);
    if (item && item.length >= 14 && item.length <= 92 && !bullets.includes(item)) bullets.push(item);
    if (bullets.length >= 4) break;
  }
  if (bullets.length < 1) return html;
  const highlight = `<h2 class="article-highlight-title">重點速讀</h2>\n<ul class="article-highlight-list">${bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  return `${beforeHighlight}${highlight}${afterHighlight}`;
};

const ensureHighlightHtml = (html = '') => /article-highlight-list/.test(html)
  ? html
  : buildFallbackHighlightHtml(html);

const stripEmptyHighlightTitleHtml = (html = '') => html
  .replace(/<h2 class="article-highlight-title">重點速讀<\/h2>\s*(?=<h2>)/g, '')
  .replace(/<h2>重點速讀<\/h2>\s*(?=<h2>)/g, '');

const repairHtmlNoise = (html = '') => {
  let out = html;
  for (let i = 0; i < 4; i += 1) {
    out = out
      .replace(/<strong>\s*<strong>/g, '<strong>')
      .replace(/<\/strong>\s*<\/strong>/g, '</strong>');
  }
  out = out
    .replace(/<p>最辛苦的地方通常不是事情本身，而是你一直在腦內重播，令自己無法分清直覺、恐懼同事實。你可以先觀察三個位置：對方最近有冇主動靠近、衝突後有冇修補、你表達需要時對方係願意理解，定只係想快點完結話題。這些細節會比一句「<strong>愛不愛<\/strong>」更能反映關係狀態。<\/p>\s*(?=<h2>再看深一層)/g, '')
    .replace(/(<\/p>)\s*最辛苦的地方通常不是事情本身，而是你一直在腦內重播，令自己無法分清直覺、恐懼同事實。你可以先觀察三個位置：對方最近有冇主動靠近、衝突後有冇修補、你表達需要時對方係願意理解，定只係想快點完結話題。這些細節會比一句「<strong>愛不愛<\/strong>」更能反映關係狀態。\s*(?=<h2>再看深一層)/g, '$1\n')
    .replace(/<h2 class="article-highlight-title">重點速讀<\/h2>\s*<h2 class="article-highlight-title">重點速讀<\/h2>/g, '<h2 class="article-highlight-title">重點速讀</h2>')
    .replace(/<h2>asteria感情拯救所<\/h2>/gi, '<h2>Asteria感情拯救所</h2>')
    .replace(/>asteria感情拯救所</gi, '>Asteria感情拯救所<');
  return out;
};

const repairCaptionCtaHtml = (html = '') => html
  .replace(
    /(<h2 class="article-numbered-heading"><span class="article-numbered-heading__badge">第 1 點<\/span><span>不掃興<\/span><\/h2>\s*)<p>當他分享開心事，你會陪他一起開心[：，,]而不是潑冷水（「<strong>車，有咩咁巴閉<\/strong>」）。在他失意時，你能看到他的付出，給予肯定。你能處理好自己的情緒[：，,]而不是要他時刻為你的心情負責。([\s\S]*?)<\/p>/g,
    '$1<p>當他分享開心事，你會陪他一起開心，而不是潑冷水（「<strong>車，有咩咁巴閉</strong>」）。</p>\n<h2 class="article-numbered-heading"><span class="article-numbered-heading__badge">第 2 點</span><span>提供認同</span></h2>\n<p>在他失意時，你能看到他的付出，給予肯定。</p>\n<h2 class="article-numbered-heading"><span class="article-numbered-heading__badge">第 3 點</span><span>情緒穩定</span></h2>\n<p>你能處理好自己的情緒，而不是要他時刻為你的心情負責。</p>'
  )
  .replace(/[，,、\s]*如果你面對緊類似情況[，,、\s]*(?:即刻|立即)?聯絡我哋幫手[啦喇！!。]*/g, '')
  .replace(/<p>\s*如果你面對緊類似情況[，,、\s]*(?:即刻|立即)?聯絡我哋幫手[啦喇！!。]*\s*<\/p>/g, '')
  .replace(/<p>\s*不如(?:試吓|搵吓|即刻|立即)?搵吓?我哋(?:研究吓|做吓儀式|幫手)?[^<]{0,80}?[啦喇！!。]*\s*<\/p>/g, '')
  .replace(/<p>\s*睇吓結果會唔會有唔同[！!。]*\s*<\/p>/g, '')
  .replace(/<p>\s*適度的佔有慾是愛，過度的佔有慾是控制。Asteria\s*提供了\s*\d+\s*條問題自測佔有慾等級。如果你發現自己經常 check 對方電話、限制對方社交，這源於內心的「<strong>低自尊<\/strong>」與「<strong>缺乏安全感<\/strong>」。\s*<\/p>/giu, '<p>適度的佔有慾可以來自重視，但過度佔有就會變成控制。當你經常想 check 對方電話、限制對方社交，背後很多時不是愛得深，而是低自尊和缺乏安全感正在放大你的不安。</p>')
  .replace(/[，,、\s]*(?:即Check|即刻Check|立即Check)[^<。！？!?]{2,80}[啦喇！!。]*/giu, '')
  .replace(/<p>\s*（?用文字\s*\+?\s*sticker[^<]*?）?\s*<\/p>/giu, '')
  .replace(/（?用文字\s*\+?\s*sticker[^，,。！？!?<]*?[，,、]?\s*/giu, '')
  .replace(/<p>\s*Asteria\s*提供了\s*\d+\s*條問題自測[^<]*?<\/p>/giu, '')
  .replace(/<div class="article-check-panel article-check-panel--positive">\s*<h3>？<\/h3>/g, '<div class="article-check-panel article-check-panel--positive">\n<h3>唔只係床伴的訊號</h3>')
  .replace(/<div class="article-check-panel article-check-panel--warning">\s*<h3>？<\/h3>/g, '<div class="article-check-panel article-check-panel--warning">\n<h3>只想親密接觸的警號</h3>')
  .replace(/<ul class="article-highlight-list">\s*<li>記住<\/li>\s*<\/ul>/g, '<ul class="article-highlight-list"><li>抓得越緊，關係越容易失衡</li><li>安全感要由自我穩定開始建立</li></ul>')
  .replace(/<ul class="article-highlight-list">\s*<li>你好愛佢<\/li>\s*<li>試諗吓<\/li>\s*<li>但係<\/li>\s*<li>委屈 vs\. 包容，你分清楚未。<\/li>\s*<\/ul>/g, '<ul class="article-highlight-list"><li>長期委屈不是健康包容</li><li>愛情不應只靠一方犧牲維持</li><li>要分清你是幸福，還是在忍耐</li></ul>')
  .replace(/<p>\s*<\/p>/g, '')
  .replace(/<p>\s*([。！？!?，,、；;：:]+)\s*<\/p>/g, '');

const removeAdjacentDuplicateParagraphsHtml = (html = '') => {
  let out = html
    .replace(/<h2>你可以先觀察三個位置：對方最近有冇主動靠近、衝突後有冇修補、你表達需要<\/h2>\s*<p>對方最近有冇主動靠近、衝突後有冇修補、你表達需要時對方係願意理解，定只係想快點完結話題。這些細節會比一句「<strong>愛不愛<\/strong>」更能反映關係狀態。<\/p>\s*/g, '')
    .replace(/<p>最辛苦的地方通常不是事情本身，而是你一直在腦內重播，令自己無法分清直覺、恐懼同事實。你可以先觀察三個位置：對方最近有冇主動靠近、衝突後有冇修補、你表達需要時對方係願意理解，定只係想快點完結話題。這些細節會比一句「<strong>愛不愛<\/strong>」更能反映關係狀態。<\/p>\s*(?=<h2>再看深一層)/g, '');
  for (let i = 0; i < 4; i += 1) {
    out = out.replace(/<p>([\s\S]*?)<\/p>\s*<p>\1<\/p>/g, '<p>$1</p>');
  }
  return out;
};

const contextualDepthHtmlForArticle = ({ title = '', category = '' }) => {
  const text = `${title} ${category}`;
  const section = (heading, paragraphs) => `<h2>${escapeHtml(heading)}</h2>\n${paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n')}`;

  if (/前度陰影|Ex|比較心態/.test(text)) {
    return section('不要用他的過去懲罰現在的自己', [
      '你真正需要看的，不是他以前對前度做過幾多，而是他現在有沒有把你放進生活、有沒有尊重你的感受，以及願不願意和你建立新的相處方式。',
      '如果你一直翻查過去，只會令自己停留在比較裡。可以把焦點拉回現在：他最近有沒有穩定陪伴、有沒有主動回應、有沒有在你不安時願意解釋，而不是只叫你不要想太多。'
    ]);
  }
  if (/FWB|SP|床伴|性.*依賴/.test(text)) {
    return section('要由床上關係拉回日常關係', [
      '如果你想知道對方有沒有機會認真發展，不能只看親密時有多投入，而要看他願不願意在日間見你、安排正常約會、了解你的生活，以及承擔關係推進的責任。',
      '真正能轉正的關係，通常會慢慢增加生活感和情感交流；如果對方只在想親密時出現，避開承諾和日常陪伴，就要小心你只是被放在方便的位置。'
    ]);
  }
  if (/珍惜|人性本賤|沉沒成本|越好/.test(text)) {
    return section('不要把照顧變成單方面供應', [
      '你可以對一個人好，但不需要把所有付出都包辦到對方不用努力。當對方完全沒有投入成本，他就更容易把你的照顧視為理所當然。',
      '健康的做法，是保留自己的界線，也讓對方有機會為關係付出。愛不是你一個人做晒，而是兩個人都願意用行動證明這段關係值得珍惜。'
    ]);
  }
  if (/情緒勒索/.test(text)) {
    return section('先辨認勒索句式，不要急著自責', [
      '情緒勒索最麻煩的地方，是它會把你的拒絕包裝成不夠愛、不懂感恩或傷害對方。當你一聽到就內疚，就很容易放棄自己的界線。',
      '你可以先停一停，問自己：對方是在表達感受，還是在迫你順從？健康的愛可以討論需要，但不應用罪惡感控制你。',
      '真正的界線不是冷漠，而是讓對方知道：你願意理解他的情緒，但不會因為害怕失去，就答應所有令自己難受的要求。'
    ]);
  }
  if (/發脾氣|親密關係暴力|情緒管理/.test(text)) {
    return section('把憤怒還原成真正感受', [
      '在親密關係裡發脾氣，很多時不是單純脾氣差，而是背後有委屈、害怕被忽略，或者覺得自己不被重視。問題是，如果只用憤怒表達，對方聽到的只會是攻擊。',
      '下次爆發前，可以先問自己：我真正想要的是被理解、被重視，還是希望對方改一個具體行為？把真正需要講清楚，才有機會修補。'
    ]);
  }
  if (/委屈|權力不對等/.test(text)) {
    return section('留意你是不是一直把自己放低', [
      '關係不對等時，最明顯的訊號不是一次爭執，而是你長期不敢提出需要、不敢拒絕、不敢表達不滿，最後連自己都習慣排在對方後面。',
      '愛一個人不代表要取消自己。你可以照顧對方感受，但同時也要看你的時間、情緒和界線有沒有被同樣尊重。',
      '如果你每次都要先猜對方心情，才敢決定自己可不可以開口，這段關係已經需要重新調整。真正平等的相處，是兩個人都可以被聽見，也可以在不傷害彼此的情況下提出需要。'
    ]);
  }
  if (/試探|測試/.test(text)) {
    return section('不要配合測試循環', [
      '面對試探型伴侶，最重要不是每次都急著證明自己愛他，而是看清楚這個測試會不會不斷升級。你越焦慮、越追著解釋，對方越容易用同一招確認安全感。',
      '比較成熟的做法，是溫柔但清楚地指出界線：你願意溝通，但不接受反覆用分手、冷淡或假想敵來測試關係。',
      '如果對方願意承認自己不安，這段關係仍然有機會慢慢調整；但如果每次都把你的反應當成考試，感情就會變成長期壓力。'
    ]);
  }
  if (/安全感|不安|缺乏安全感/.test(text)) {
    return section('先分清安全感來自哪裡', [
      '安全感不足時，最容易把每個小動作都解讀成不愛。你可以先分清楚：這份不安是來自對方真的冷淡，還是來自過去受傷經驗、依戀模式或自我價值感不足。',
      '真正有用的處理，不是反覆追問對方愛不愛，而是看對方有沒有穩定行動，同時也學會安撫自己的焦慮，不讓恐懼帶住整段關係走。',
      '你可以把不安寫成具體事件：例如遲覆、語氣冷淡、少見面。當問題變得具體，你才知道要溝通的是對方行為，還是自己內在的恐懼，而不是一直在腦內反覆猜測。'
    ]);
  }
  return '';
};

const replaceGenericDepthHtml = (html = '', article = {}) => {
  const depth = '';
  let out = html;
  if (depth) {
    out = out
      .replace(/最辛苦的地方通常不是事情本身，而是你一直在腦內重播，令自己無法分清直覺、恐懼同事實。/g, '')
      .replace(/你可以先觀察三個位置[：:]?對方最近有冇主動靠近、衝突後有冇修補、你表達需要時對方係願意理解，定只係想快點完結話題。這些細節會比一句「(?:<strong>)?愛不愛(?:<\/strong>)?」更能反映關係狀態。/g, '')
      .replace(/如果你一邊很想修補，一邊又很怕失去，就更加要先整理好說話次序。先講具體事件，再講自己的感受，最後只提出一個清楚而可做到的希望。這樣比長篇控訴更容易令對方聽得入耳，也更方便判斷對方是否仍願意為關係付出。/g, '')
      .replace(/同時，你亦要留意自己有冇因為太想要答案，而忽略咗現實行動。真正值得繼續投入的關係，不會只靠一刻感動或者一句承諾，而是會在之後的相處入面慢慢見到改變。/g, '')
      .replace(/如果對方仍然願意回應、願意調整，這段關係就值得用更成熟的方法處理；但如果你每次提出需要都只換來逃避、指責或者冷淡，就要重新保護自己的界線。/g, '')
      .replace(/<h2>再看深一層：[\s\S]*?的真正訊號<\/h2>\s*(?=<h2>)/g, '')
      .replace(/<h2>你可以先觀察三個位置<\/h2>\s*/g, '')
      .replace(/<h2>下一步不要急著做錯<\/h2>\s*/g, '')
      .replace(/最辛苦的地方通常不是事情本身，而是你一直在腦內重播，令自己無法分清直覺、恐懼同事實。你可以先觀察三個位置：對方最近有冇主動靠近、衝突後有冇修補、你表達需要時對方係願意理解，定只係想快點完結話題。這些細節會比一句「<strong>愛不愛<\/strong>」更能反映關係狀態。/g, '')
      .replace(/<h2>再看深一層：[\s\S]*?的真正訊號<\/h2>\s*<p>最辛苦的地方通常不是事情本身，而是你一直在腦內重播，令自己無法分清直覺、恐懼同事實。<\/p>\s*<h2>你可以先觀察三個位置<\/h2>\s*<p>對方最近有冇主動靠近、衝突後有冇修補、你表達需要時對方係願意理解，定只係想快點完結話題。這些細節會比一句「愛不愛」更能反映關係狀態。<\/p>\s*<h2>下一步不要急著做錯<\/h2>\s*<p>如果你一邊很想修補，一邊又很怕失去，就更加要先整理好說話次序。先講具體事件，再講自己的感受，最後只提出一個清楚而可做到的希望。這樣比長篇控訴更容易令對方聽得入耳，也更方便判斷對方是否仍願意為關係付出。<\/p>\s*<p>同時，你亦要留意自己有冇因為太想要答案，而忽略咗現實行動。真正值得繼續投入的關係，不會只靠一刻感動或者一句承諾，而是會在之後的相處入面慢慢見到改變。<\/p>\s*<p>如果對方仍然願意回應、願意調整，這段關係就值得用更成熟的方法處理；但如果你每次提出需要都只換來逃避、指責或者冷淡，就要重新保護自己的界線。<\/p>/g, depth)
      .replace(/<p>最辛苦的地方通常不是事情本身，而是你一直在腦內重播，令自己無法分清直覺、恐懼同事實。你可以先觀察三個位置：對方最近有冇主動靠近、衝突後有冇修補、你表達需要時對方係願意理解，定只係想快點完結話題。這些細節會比一句「<strong>愛不愛<\/strong>」更能反映關係狀態。<\/p>/g, '')
      .replace(/<p>最辛苦的地方通常不是事情本身，而是你一直在腦內重播，令自己無法分清直覺、恐懼同事實。<\/p>\s*<h2>你可以先觀察三個位置<\/h2>\s*<p>對方最近有冇主動靠近、衝突後有冇修補、你表達需要時對方係願意理解，定只係想快點完結話題。這些細節會比一句「愛不愛」更能反映關係狀態。<\/p>\s*<h2>下一步不要急著做錯<\/h2>\s*<p>如果你一邊很想修補，一邊又很怕失去，就更加要先整理好說話次序。先講具體事件，再講自己的感受，最後只提出一個清楚而可做到的希望。這樣比長篇控訴更容易令對方聽得入耳，也更方便判斷對方是否仍願意為關係付出。<\/p>\s*<p>同時，你亦要留意自己有冇因為太想要答案，而忽略咗現實行動。真正值得繼續投入的關係，不會只靠一刻感動或者一句承諾，而是會在之後的相處入面慢慢見到改變。<\/p>\s*<p>如果對方仍然願意回應、願意調整，這段關係就值得用更成熟的方法處理；但如果你每次提出需要都只換來逃避、指責或者冷淡，就要重新保護自己的界線。<\/p>/g, depth);
  }
  out = out
    .replace(/(<div class="article-section-card"><p>少一點用否定句回應對方的分享，先接住感受，再表達自己的看法。讚賞要具體，例如看見對方做了甚麼努力，而不是空泛地說「<strong>你好叻<\/strong>」。當你自己情緒很滿時，先停一停，不要把不安變成責備。當男人在你面前感到放鬆、被理解、被尊重，他自然會更願意靠近你。但你也要記住，情緒價值不是單方面服務，而是兩個人都願意令彼此相處得更安心。<\/p><\/div>)\s*<h2>可以先做的三件事：少一點用否定句回應對方的分享<\/h2>\s*<p>少一點用否定句回應對方的分享，先接住感受，再表達自己的看法。讚賞要具體，例如看見對方做了甚麼努力，而不是空泛地說「<strong>你好叻<\/strong>」。當你自己情緒很滿時，先停一停，不要把不安變成責備。當男人在你面前感到放鬆、被理解、被尊重，他自然會更願意靠近你。但你也要記住，情緒價值不是單方面服務，而是兩個人都願意令彼此相處得更安心。<\/p>/g, '$1')
    .replace(/<h2>可以先做的三件事：少一點用否定句回應對方的分享<\/h2>\s*<p>少一點用否定句回應對方的分享，先接住感受，再表達自己的看法。讚賞要具體，例如看見對方做了甚麼努力，而不是空泛地說「<strong>你好叻<\/strong>」。當你自己情緒很滿時，先停一停，不要把不安變成責備。當男人在你面前感到放鬆、被理解、被尊重，他自然會更願意靠近你。但你也要記住，情緒價值不是單方面服務，而是兩個人都願意令彼此相處得更安心。<\/p>/g, '');
  if (/拆解 4 大情緒勒索金句/.test(out)) {
    out = out
      .replace(/<div class="article-section-card"><p>(正常情緒表達[\s\S]*?你唔咁做就係唔愛我<\/strong>」。)<\/p><\/div>/g, '<p>$1</p>')
      .replace(/<ul class="article-highlight-list">[\s\S]*?<\/ul>/, '<ul class="article-highlight-list"><li>情緒勒索會用愛、內疚或離開威脅你順從</li><li>愛一個人不等於每件事都要答應</li><li>真正健康的關係會尊重你的拒絕和界線</li></ul>')
      .replace(/<p>第一句：「我咁做都係因為太愛你」：([\s\S]*?)<\/p>/, '<h3>第一句：「<strong>我咁做都係因為太愛你</strong>」</h3>\n<p>$1</p>');
  }
  const core = stripHtml(out.split(/<h2 class="article-highlight-title">重點速讀<\/h2>|<h2>Asteria 小提醒<\/h2>|<h2>常見問題<\/h2>/)[0] || '').replace(/\s+/g, '').trim();
  if (depth && core.length < 520 && !out.includes(depth)) {
    out = out.replace(/(<h2 class="article-highlight-title">重點速讀<\/h2>|<h2>Asteria 小提醒<\/h2>|<h2>常見問題<\/h2>)/, `${depth}\n$1`);
  }
  return out;
};

const removeRepeatedParagraphsHtml = (html = '') => {
  const seen = new Set();
  return html.replace(/<p>([\s\S]*?)<\/p>/g, (match, body) => {
    const key = normalizeArticleText(stripHtml(body))
      .replace(/[「」『』“”"'（）()【】\[\]：:，,。！？!?；;、.\s]+/g, '')
      .trim();
    if (key.length > 28 && seen.has(key)) return '';
    if (key.length > 28) seen.add(key);
    return match;
  });
};

const specificArticleMarkdown = (idKey) => {
  if (idKey === '004') {
    return [
      '有些人只是性格比較大男人，喜歡主導、愛面子，未必一定是危險關係。但如果對方的強勢變成控制、監控、貶低和威脅，這就不是普通大男人，而可能是恐怖情人的警號。',
      '判斷重點不是他平時有幾霸道，而是他有沒有尊重你的界線、情緒是否穩定，以及你在這段關係入面是否越來越窒息。',
      '## 徵兆 1：控制慾強烈',
      '恐怖情人會以你為生活中心，同時要求你把他放在第一順位。戀愛初期，你可能會以為這是很愛你的表現，但相處久了，會發現他的控制範圍越來越大，甚至變得蠻橫無理。',
      '例如你見朋友、回訊息、穿甚麼衣服、幾點回家，他都想插手。如果你不照他的意思做，他就生氣、冷暴力，甚至用分手或傷害自己來威脅你。',
      '## 徵兆 2：慣性貶低另一半',
      '恐怖情人內心通常缺乏安全感和自尊，所以很容易用貶低另一半來維持自己的優越感。他可能會言語侮辱你、公開羞辱你，或者不斷暗示你不夠好。',
      '這類說話聽多了，你會慢慢懷疑自己，覺得是不是自己真的太差、太敏感、太難相處。當你的自信被削弱，你就更容易被他操控。',
      '## 徵兆 3：永遠覺得自己是受害者',
      '一旦出現爭執，他很少真正反省自己的行為，反而會覺得自己才是被傷害的人。即使問題由他的控制、脾氣或威脅開始，他都可以把責任轉回你身上。',
      '他可能會說你不體諒他、不夠愛他、故意刺激他，甚至覺得身邊所有人都在攻擊他。這種受害者姿態會令你每次溝通都變成道歉，問題卻從來沒有被處理。',
      '## 徵兆 4：監控交友和私人空間',
      '普通大男人可能只是建議你不要經常和異性單獨出街，但恐怖情人會想監控你有沒有和誰聯絡、見面、吃飯，甚至要求你交代每一個行蹤。',
      '如果他要查你電話、限制你社交、要求你刪除朋友，或者把正常交友說成背叛，這已經不是吃醋，而是把你的私人空間收窄。',
      '## 徵兆 5：要求絕對服從，情緒反覆甚至威脅',
      '大男人可能希望另一半在人前給他面子，但恐怖情人會要求你不論人前人後都要服從。他的情緒亦可能反覆起伏大，一不順心就發脾氣、威脅你，甚至把你嚇到不敢表達自己。',
      '當你發現自己很多時候不是因為想配合，而是因為害怕他的反應才妥協，這段關係就已經出現危險訊號。',
      '## 大男人 vs 恐怖情人',
      '### 干涉交友',
      '大男人通常只是建議你不要經常和異性單獨出街；恐怖情人會監控你有沒有和異性出街，甚至一次都不容許。',
      '### 情緒表現',
      '大男人可能有控制慾，但仍然會體貼另一半；恐怖情人通常控制慾很強、自信不足、情緒反覆起伏大，甚至會威脅你。',
      '### 強勢特徵',
      '大男人可能希望另一半在人前順從他、給他面子；恐怖情人會要求另一半不論人前人後都要絕對服從。',
      '## 面對恐怖情人，但自己唔捨得分手？',
      '大家可以靜落嚟，認真想一想：拍拖本來是為了尋求幸福和安全感，不是為了長期生活在恐懼、妥協和自我懷疑之中。',
      '如果另一半不但給不到你快樂，還令你不斷違背自己意願、角色變得不對等，甚至每次爭執都用威脅來達到目的，你就要認真問自己：這段關係是否仍然值得繼續？',
      '## Asteria 感情拯救所話你知',
      '面對大男人情人，你也許可以用柔和方式溝通，讓對方知道你的感受和界線。但面對恐怖情人，問題不是嗲一嗲、讚一讚就能解決。',
      '如果對方持續貶低、控制、威脅你，請先把自己的安全和情緒穩定放在第一位。愛情不應該令你越來越害怕，也不應該要求你用自尊去換一段關係。'
    ].join('\n\n');
  }
  if (idKey === '073') {
    return [
      '兩個人一齊生活，最消耗感情的往往不是大事，而是每日重複出現的小事：家務沒有人做、壞習慣講極唔改、你覺得自己一直在提點，對方卻覺得你一直在嫌棄。',
      '如果你想另一半更主動分擔生活責任，重點未必是再鬧多幾次，而是把需要講得更清楚，亦讓對方有機會感受到自己做得到、做完會被看見。',
      '## 先不要把家務變成審判',
      '很多人叫另一半做家務時，語氣已經累積了很多不滿。一開口就變成：「你又唔做」、「你永遠都咁懶」、「點解次次都係我？」對方聽到的未必是家務需要，而是自己被否定。',
      '你可以把指責換成具體請求，例如：「今晚可唔可以你洗碗，我去晾衫？」具體分工比情緒控訴更容易執行。',
      '## 一齊做，先建立參與感',
      '如果對方一直沒有家務習慣，可以先由一起做開始。例如一齊煮飯、一齊執屋、一齊買日用品。這不只是分工，也是在建立共同生活的節奏。',
      '當兩個人一起完成一件小事，對方會更容易感受到自己不是被命令，而是在參與你們的生活。',
      '## 做得好時要被看見',
      '如果你總是只看到對方做得不夠好，他很容易覺得自己做也錯、不做也錯，最後乾脆放棄。這不是叫你假裝滿意，而是當對方真的有做到一點點時，可以先肯定那部分。',
      '例如他有主動倒垃圾、幫你準備熱水、改掉一個小壞習慣，你可以直接講：「你今日有記得做，我其實有輕鬆到。」被看見的行為，才比較有機會重複出現。',
      '## 用家務清單代替靠自覺',
      '有些人不是故意不做，而是真的對家務沒有概念。你叫他洗衫，他可能以為只要按洗衣機就完成，卻沒有想過晾衫、摺衫、收衫都是同一件事的一部分。',
      '與其每次臨時追，不如列一個簡單清單，把任務寫到具體：洗碗、倒垃圾、買紙巾、洗衫連晾衫。清單不是控制，而是讓責任有終點，也減少你每次都要開口催。',
      '## 不要用瑣碎事否定整段感情',
      '對方不夠主動分擔家務，的確會令人委屈，但也不一定等於他不愛你。很多伴侶衝突都是生活細節引起，問題在於兩個人的習慣和責任感未磨合好。',
      '你可以重視自己的辛苦，也可以要求對方改變；但不要每次都直接上升到「你是不是不愛我」。這樣只會令對方防衛，真正要處理的生活分工反而被情緒蓋過。',
      '## Asteria 感情拯救所話你知',
      '想另一半主動，不是靠一直催逼，也不是靠自己默默做完再委屈。最有效的方法，是把需要講清楚、把責任拆細、看對方有沒有持續配合。',
      '如果你已經講得很清楚，對方仍然長期逃避、不願承擔，那就不是家務小事，而是關係責任是否失衡的問題。'
    ].join('\n\n');
  }
  if (idKey === '044') {
    return [
      '出軌通常不是一朝一夕發生，而是由很多細微改變慢慢累積。當你覺得另一半有點不對勁，先不要急著崩潰，也不要即刻攤牌，最重要是分清楚哪些是情緒猜測，哪些是可以觀察的實際警號。',
      '以下 6 個出軌跡象，不是用來叫你疑神疑鬼，而是幫你用更清醒的方式看清關係狀態。',
      '## 警號 1：手機突然變得好神秘',
      '以前電話可以隨手放，現在卻長期跟身、螢幕反轉、改密碼，甚至用電話時特別避開你。手機本身不是問題，突然變得過度保護才是值得留意的變化。',
      '如果他同時開始刪對話、避開通知，或者你一靠近就緊張，這代表他可能有一些不想讓你知道的互動。',
      '## 警號 2：前言不對後語',
      '他昨天說約了大學同學食飯，轉頭又說是同事聚會；你多問兩句，他就怪你太多疑。出軌的人最容易記錯自己講過甚麼，因為要維持不同版本的故事。',
      '一次記錯未必代表出軌，但如果同類矛盾反覆出現，就要小心他是否正在隱瞞行蹤。',
      '## 警號 3：突然送不合你喜好的禮物',
      '如果他無緣無故送你禮物，但那份禮物明顯不適合你，款式、顏色、喜好都對不上，可能代表他只是順手買了兩份，或者根本沒有真正按你的喜好挑選。',
      '禮物不是罪證，但當它配合其他異常行為出現，就可以成為一個觀察點。',
      '## 警號 4：身邊出現不屬於你的物件',
      '例如袋上突然多了可愛吊飾、車裡有你未見過的 hand cream、房間出現不像他會買的東西。他可能會說是朋友送的、同事留下的，但你心裡知道這不太合理。',
      '這類小物件最容易被忽略，卻往往反映他生活裡出現了新的親密接觸。',
      '## 警號 5：無啦啦開始特別打扮',
      '以前他對外表很隨意，最近突然研究護膚、香水、穿搭，甚至每次出門都比以前仔細很多。變靚本身當然不是問題，但如果他只在某些行程前特別打扮，就值得留意。',
      '你要看的不是他有沒有打扮，而是這個改變是否和行蹤、情緒距離、手機保密同時出現。',
      '## 警號 6：身邊人講出你不知道的故事',
      '如果他家人、朋友無意中提到一些你完全不知道的聚會、行程或人物，而他之前從未向你交代，這可能代表他已經開始把你排除在某部分生活之外。',
      '當伴侶的生活出現越來越多你不知道的空白位，關係透明度就正在下降。',
      '## Asteria 感情拯救所話你知',
      '出軌跡象要一組一組看，不要只靠一個小細節就定罪。真正值得警惕的是：他行蹤變模糊、態度變防衛、生活突然多了你不知道的人和事，而且不願意坦白解釋。',
      '如果你發現多個警號同時出現，先穩住自己，整理事實，再決定要溝通、觀察，還是保護自己。'
    ].join('\n\n');
  }
  if (idKey === '045') {
    return [
      '《單身即地獄 3》之所以引起熱話，不只是因為節目夠戲劇性，而是有些相處模式其實很常見：高姿態、測試對方、忽冷忽熱、用不安全感牽住別人。',
      '如果你不想在現實感情裡中伏，可以從這幾個曖昧操控訊號開始觀察。',
      '## 防伏 1：留意過度自信的高姿態',
      '自信本身有吸引力，但過度自信很容易變成自大。當一個人習慣用居高臨下的方式對待別人，不叫對方名字、不尊重對方感受、把多人同時放在選項裡比較，這不是魅力，而是缺乏基本尊重。',
      '真正成熟的吸引，不需要靠貶低別人來抬高自己。如果他一開始就讓你覺得自己像被挑選的選項，你要先停一停，看清楚他是否真的把你當成一個人，而不是戰利品。',
      '## 防伏 2：小心不停考驗你的 If Boy',
      '有些人會不斷問如果題、設情境、測試你會不會主動、會不會吃醋、會不會為他改變。表面看似想了解你，實際上可能是在控制關係節奏，讓你一直證明自己。',
      '認識初期想了解價值觀是正常的，但無止境測試會消耗信任。與其讓你不停交功課，一段健康關係更應該讓雙方有空間自然靠近。',
      '## 防伏 3：佔有慾和冷處理一起出現',
      '如果他一方面限制你的選擇、希望你按他的期望回應；另一方面，當你不照做就冷淡、黑面、不溝通，這已經不是在乎，而是用情緒懲罰你。',
      '佔有慾不是愛的證明。真正重視你的人，就算有不安，也會願意溝通，而不是用冷暴力逼你就範。',
      '## Asteria 感情拯救所話你知',
      '曖昧最容易令人上癮，因為對方偶爾給你一點甜，你就會想證明自己可以得到更多。但真正值得發展的關係，不會讓你長期處於考試狀態。',
      '如果你發現自己一直在猜、一直在等、一直怕做錯，先不要急著投入更多。看清楚對方是否尊重你，比追求一時心動更重要。'
    ].join('\n\n');
  }
  if (idKey === '097') {
    return [
      '「我嬲咗成晚，佢竟然走去瞓覺！」好多女生都遇過這種情況：你以為對方愛你，就應該自然知道點樣氹你；但現實是，很多男人不是不在乎，而是不知道情緒當下應該做甚麼。',
      '男人常用解決問題的方式面對情緒，女人更需要先被理解和安撫。當你黑面，他可能解讀成「我講多錯多」，於是退開；但你感受到的，卻是他冷淡、逃避、甚至不愛你。',
      '## 第 1 招：把需要講到具體',
      '不要只說「你都唔識氹我」，因為對方未必知道要做甚麼。你可以直接講：「我而家唔開心，我需要你抱住我五分鐘，先唔好講道理。」',
      '具體要求比情緒控訴更容易被執行。當對方知道你要的是擁抱、陪伴、道歉，還是安靜聽你講，他才有機會做對。',
      '## 第 2 招：做對時即時給正向回饋',
      '如果他第一次嘗試安撫你，你不要急著嫌他做得不夠好。可以告訴他：「你剛才肯停低聽我講，我其實有安心一點。」',
      '正向回饋不是討好，而是讓對方知道甚麼行為對關係有幫助。男人很多時候需要清楚路線圖，才會慢慢學識用你需要的方式靠近你。',
      '## 第 3 招：不要在情緒最高點考驗他',
      '情緒最滿的時候，雙方都很容易講錯說話。你可以先停一停，等自己由爆炸狀態回到可以表達，再用一句清楚說話開場。',
      '例如：「我不是想鬧你，我只是想你知道，剛才我很需要你陪我。」這樣比生悶氣、冷戰、等他猜，更容易令關係有改善。',
      '## Asteria 感情拯救所話你知',
      '男朋友唔識氹人，不一定代表無愛，但如果你已經清楚表達需要，他仍然長期無視，就要重新評估他願不願意為關係學習。真正好的相處，是你願意講清楚，他也願意慢慢做得更好。'
    ].join('\n\n');
  }
  if (idKey === '109') {
    return [
      '很多人以為坦白講出心底話，就是有效溝通。但如果說話方式錯了，心底話很容易變成利劍，最後不是更親近，而是令對方更防衛。',
      '有效溝通不是把所有情緒一次過倒出來，而是讓對方聽得明、接得住，也知道下一步可以怎樣修補。',
      '## 第 1 點：預設對方會讀心',
      '「我唔講佢都應該知」是很多爭執的開始。對方未必真的不在乎，他可能只是沒有讀懂你的暗示。',
      '把「你應該知道」改成「我希望你可以怎樣做」，會比考驗對方更有效。例如將「我覺得冷」講成「可唔可以幫我拎件衫？」',
      '## 第 2 點：在情緒高漲時溝通',
      '大家最嬲、最委屈的時候，通常最難講出真正需要。這時候講的說話，很容易變成攻擊、翻舊帳或悔氣說話。',
      '可以先定一個冷靜機制，例如暫停三十分鐘，等心跳和語氣降下來，再回到同一個問題。暫停不是逃避，而是避免把關係推向更傷。',
      '## 第 3 點：用「你」字開頭指責',
      '「你成日都遲到」、「你根本唔在乎我」這類句式會令對方即刻防衛，因為他聽到的是審判，不是需要。',
      '試著改用「我」字開頭，例如「你遲到時，我會覺得自己不被重視」。這樣不代表你認輸，而是把焦點由對錯拉回感受和需要。',
      '## 第 4 點：一開口就翻舊帳',
      '如果每次溝通都把幾年前的事重新拿出來，對方會覺得自己永遠不能被原諒，你也會越講越委屈。',
      '真正有效的做法，是一次只處理一件事。先講今次發生了甚麼，再講它勾起你甚麼感受，不要把所有舊傷一次過倒出來。',
      '## 第 5 點：只顧輸出，沒有聽回應',
      '溝通不是演講。如果你只想把所有委屈講完，卻沒有留空間聽對方回應，對話很容易變成單向控訴。',
      '可以在講完一段後停一停，問對方：「你聽到的是甚麼？」這個小停頓，能幫你確認對方有沒有理解，也避免大家各自腦補。',
      '## Asteria 感情拯救所話你知',
      '講心底話不是錯，錯的是用令對方防衛的方式講。真正成熟的溝通，是既保留真實感受，也讓對方知道可以怎樣回應你。'
    ].join('\n\n');
  }
  if (idKey === '112') {
    return [
      '越親密的人，越容易成為情緒出口。你不是一定脾氣差，而是可能在關係入面累積了委屈、恐懼和不安，最後用發脾氣的方式爆出來。',
      '但如果每次都靠憤怒表達需要，關係會慢慢由親密變成壓力。你要看的不是「我點解咁嬲」，而是憤怒下面真正受傷的位置。',
      '## 第 1 點：安全感悖論',
      '你不會隨便對老闆發脾氣，因為知道後果嚴重；但你可能會對伴侶失控，因為潛意識覺得他愛你、會包容你。',
      '這種安全感有時會變成恃寵生驕。你不是故意傷害對方，但當你把最差的情緒長期留給他，對方也會慢慢退後。',
      '## 第 2 點：憤怒其實是第二情緒',
      '心理學常說，憤怒很多時只是表層。真正藏在下面的，可能是委屈、害怕、不被重視，或者覺得自己又一次被忽略。',
      '例如你鬧他遲到，表面是生氣，內心可能是害怕：「你是不是不重視我？」當你能講出真正感受，衝突就比較有機會被理解。',
      '## 第 3 點：用攻擊保護脆弱',
      '有些人不習慣示弱，所以一受傷就先攻擊。這樣看似保護自己，其實會令伴侶只聽到責備，聽不到你真正需要安撫。',
      '下次想爆發前，可以先用一句話暫停：「我而家好嬲，我需要冷靜十分鐘再講。」這不是壓抑情緒，而是保護關係不要被一刻失控破壞。',
      '## Asteria 感情拯救所話你知',
      '情緒管理不是叫你永遠不要嬲，而是學會在憤怒出現時，看清它真正想保護甚麼。當你能把攻擊改成表達需要，關係才有修復空間。'
    ].join('\n\n');
  }
  if (idKey === '115') {
    return [
      'FWB 或 SP 想轉正，最難的地方不是你不夠好，而是對方可能已經把你放在「短期伴侶」的位置。你們可以很合拍，但如果互動只停留在床上，就很難自然變成正式關係。',
      '想令對方對你產生性以外的依賴，重點不是更迎合，而是重新改變你們的相處場景和互動規則。',
      '## 第 1 招：拒絕外賣式見面',
      '如果他每次都是深夜才找你，上你屋企，做完就睡或離開，這不是約會，而是 Sex Call。你要開始拒絕只剩親密接觸的安排。',
      '可以改成：「今晚唔得，不過星期六下午可以飲咖啡。」如果他完全拒絕日間見面，你就能看清他想要的是你，還是只是方便。',
      '## 第 2 招：把關係拉回日常生活',
      '在床上，你可能是可替代的；但在生活和情緒連結裡，你才有機會變得不可替代。日間約會、吃飯、散步、一起處理小事，都是讓關係離開單一性吸引的方法。',
      '你要觀察他是否願意在沒有親密接觸的情況下仍然見你、聽你講生活、了解你的價值觀。',
      '## 第 3 招：設界線，觀察他是否願意承擔',
      '如果你想轉正，就不能一直用無名無份的方式滿足對方所有需要。你可以清楚講出自己想要的關係方向，再看他是否願意回應。',
      '真正有機會轉正的人，會願意調整相處模式；只想享受福利的人，會在你設界線時退縮或消失。這個反應本身，就是答案。',
      '## Asteria 感情拯救所話你知',
      'FWB 轉情侶不是完全不可能，但不能靠更乖、更配合去換。你要把相處從床上拉回生活，把需要講清楚，也把選擇權拿回自己手上。'
    ].join('\n\n');
  }
  if (idKey === '116') {
    return [
      '太快發生關係不一定代表沒有將來，但如果你們的相處只剩食飯、飲酒、Staycation 和親密接觸，就要小心變成酒肉情侶。',
      '酒肉情侶最迷惑人的地方，是一開始很開心、很刺激，但當激情退下來，才發現彼此其實不太了解，也沒有能力一起面對現實問題。',
      '## 第 1 招：看約會是否只剩娛樂和身體吸引',
      '如果每次見面都離不開飲酒、過夜、去酒店，卻很少有正常日間約會，這段關係可能根基很薄。',
      '真正有發展的關係，不會只在刺激場景裡存在，也應該能在普通日常裡舒服相處。',
      '## 第 2 招：看你們有沒有深層對話',
      '可以開心玩，不代表適合長久。你們有沒有談過價值觀、未來、家庭、工作壓力，或者真正害怕的事？',
      '如果對話永遠停留在八卦、玩笑和曖昧，關係很容易只靠新鮮感維持。一旦新鮮感下降，就會變得空洞。',
      '## 第 3 招：看困難出現時對方會不會留下',
      '激情時人人都可以很投入，但真正判斷一段關係有沒有將來，要看遇到壓力、病痛、失業或情緒低潮時，對方是否仍願意面對。',
      '如果他只想享受開心時刻，卻不願意承擔任何現實重量，這段關係就未必適合投放太多期待。',
      '## Asteria 感情拯救所話你知',
      '身體吸引可以是開始，但不能成為全部。你要分清楚，這段關係是正在建立親密，還是只是在消耗新鮮感。'
    ].join('\n\n');
  }
  if (idKey === '119') {
    return [
      '感情出現裂痕，不一定代表注定分手。很多長久關係都曾經受傷，分別在於兩個人是逃避裂痕，還是願意一起修補。',
      '裂痕其實是相處模式發出的更新通知。你們不能只想回到過去，而是要用更成熟的方法重新開始。',
      '## 1. 正視問題，不要當無事發生',
      '如果裂痕出現後，大家只是假裝和平，問題通常會在下一次衝突重新爆出來。真正修復，要先承認發生過甚麼、傷害在哪裡。',
      '正視問題不是翻舊帳，而是讓彼此知道，這件事需要被理解和處理。',
      '## 2. 停止互相指責',
      '修復最怕變成審判大會。當每句說話都在追究誰錯，對方只會防衛，真正需要就會被蓋過。',
      '可以把焦點放在：「我們以後可以怎樣避免同一件事再發生？」這樣比一直重播錯誤更有用。',
      '## 3. 用新行動重建信任',
      '信任不是一句對不起就回來，而是靠之後一段時間的穩定行動慢慢修補。承諾要具體，改變也要看得到。',
      '如果雙方都願意重新學習相處，裂痕反而可以成為關係升級的位置。',
      '## Asteria 感情拯救所話你知',
      '不要只問可不可以回到以前。真正值得修補的關係，是可以在裂痕之後變得更清楚、更真實，也更懂得珍惜彼此。'
    ].join('\n\n');
  }
  if (idKey === '123') {
    return [
      '天天 message、會講早晨早抖、甚至偶爾講掛住你，不一定代表對方想認真發展。有些曖昧只是低成本陪伴，給你一點甜，但從來不真正前進。',
      '如果你想分清楚他是真心喜歡你，還是只是在享受被你陪伴，可以先看以下 3 種「假性喜歡」訊號。',
      '## 第 1 種：深夜出沒',
      '日間很少主動找你，一到夜晚寂寞、無聊、失眠才突然變得熱情。這種聯絡未必是深情，更多時候只是他需要有人陪。',
      '真正認真想了解你的人，不會只在自己空虛時出現，也會在日常生活裡穩定關心你。',
      '## 第 2 種：只講不做',
      '他可能講很多未來畫面，例如下次帶你去邊、想同你做甚麼，但從來沒有落實時間和行動。說話越甜，越要看他有沒有真的安排。',
      '曖昧最容易令人沉迷，就是因為它有想像空間。但沒有行動的想像，最後只會令你一直等。',
      '## 第 3 種：忽冷忽熱',
      '你熱情時他退後，你想放棄時他又突然靠近。這種節奏會令你一直猜測，甚至更想證明自己值得被選擇。',
      '如果一段關係長期靠不穩定來維持心動，你要問的不是他有沒有感覺，而是他有沒有意願認真建立關係。',
      '## 如何分辨真心？',
      '真心不是看他講得幾好聽，而是看他願不願意花時間、落實約見、在普通日子也保持穩定互動。',
      '如果他只在需要情緒價值時出現，卻從不讓你進入他的生活，那就未必是喜歡，而是享受你的陪伴。',
      '## Asteria 感情拯救所話你知',
      '曖昧可以甜，但不能長期無方向。你可以享受心動，但也要保護自己，不要把一個沒有承諾的人，放到正式伴侶的位置。'
    ].join('\n\n');
  }
  if (idKey === '126') {
    return [
      '有些伴侶不是直接講需要，而是用反話、冷淡、假設題，甚至提分手來測試你。你一緊張、一追問，他就短暫安心；但下一次不安出現時，同一套測試又會重來。',
      '男朋友成日試探你，未必代表他真的想分開，很多時候是因為他很怕自己不值得被愛。但如果你每次都被拉入情緒考試，關係只會越來越累。',
      '## 第 1 種測試：故意冷淡，看你會不會追上來',
      '他可能突然少回訊息、語氣變淡，或者明明在線都不回你。目的未必是想離開，而是想看你會不會著急、會不會主動哄他。',
      '問題是，這種測試會令你長期處於不安，亦會令他習慣用冷淡換安全感。你可以關心一次，但不需要不斷追住對方跑。',
      '## 第 2 種測試：把分手掛嘴邊，想聽你挽留',
      '有些人一吵架就說「不如分手」、「你都唔愛我」，其實內心想聽的是你挽留他、證明你不會走。',
      '但分手不應該成為每次衝突的武器。你可以回應他的不安，但也要清楚講明：如果每次都用分手威脅，關係會失去安全感。',
      '## 第 3 種測試：提起異性，觀察你會不會吃醋',
      '他可能刻意提某個異性、講別人對他有好感，甚至用曖昧故事刺激你，想確認你是否在乎。',
      '適度吃醋可以是情緒反應，但如果對方不斷用第三者話題試探你，這就會變成操控。真正成熟的伴侶，不需要靠令你不安來證明自己被愛。',
      '## 面對測試，你可以點回應？',
      '第一，先不要立刻被情緒牽走。第二，指出你看見的模式，例如：「你每次不安就講分手，我會很難受。」第三，提出清楚界線：「你可以講你需要我安撫，但不要用分手測試我。」',
      '你要讓對方知道，你願意理解他的不安，但不會配合一再被考驗。',
      '## Asteria 感情拯救所話你知',
      '測試者最需要的其實是安全感，但安全感不能靠不停考驗伴侶來建立。真正穩定的關係，是可以直接講需要，而不是用反話、冷淡和威脅逼對方證明愛。'
    ].join('\n\n');
  }
  if (idKey === '124') {
    return [
      '辦公室戀情不是一定不好，但它最容易出事的地方，是公私不分。你們既是同事，又是情侶，一旦界線模糊，工作、人際和感情都會互相影響。',
      '如果想令職場戀愛走得穩，就要先講清楚相處規則，而不是靠熱戀感硬撐。',
      '## 第 1 點：保持低調，避免八卦影響工作',
      '除非你們已經有穩定未來規劃，否則不一定要太快公開。公開後，同事可能會用有色眼鏡看你們，甚至覺得你們偏私。',
      '低調不是見不得光，而是保護關係和工作環境，避免感情變成辦公室話題。',
      '## 第 2 點：上班時間保持專業',
      '在公司範圍內，盡量避免親密行為和情緒化互動。用 Email、Slack 或工作對話時，語氣也要保持專業。',
      '你們可以相愛，但同事不需要承受你們的曖昧、冷戰或私事。',
      '## 第 3 點：不要在公司吵架',
      '如果你們同一個 Team，很容易因為工作意見延伸到感情爭執。最重要是不要在公司即場爆發，也不要讓同事被迫站隊。',
      '有情緒可以約定下班後再談，工作時間先把工作處理好。',
      '## 第 4 點：設立下班切換儀式',
      '離開公司後，可以約定一個切換位，例如走出公司門口後先不談公事，或者回家前用十分鐘整理今日情緒。',
      '這個儀式可以避免工作壓力直接帶入感情，也讓你們重新由同事身份回到伴侶身份。',
      '## Asteria 感情拯救所話你知',
      '職場戀愛最需要的不是刺激，而是界線。公事歸公事，感情歸感情，才不會令兩邊都失控。'
    ].join('\n\n');
  }
  if (idKey === '125') {
    return [
      '一段關係入面，最令人委屈的不是付出，而是你慢慢發現，所有主動、等待、道歉和修補都落在你身上。這就是權力不對等的開始。',
      '當一方投入較少，反而掌握更多主導權，另一方就容易越愛越卑微。',
      '## 第 1 點：永遠由你主動發起交流',
      '如果每次都是你開話題、你約見面、你追問近況，而對方只是有空才回應，你們的投入已經不平衡。',
      '健康關係不一定要五五平分，但至少應該有來有往。長期單方面主動，會令你越來越像在求一段關係。',
      '## 第 2 點：他的時間比你矜貴',
      '他約你就可以，你約他就要看他心情；他最後一刻取消，你也不敢表達不滿，只能說「唔緊要」。',
      '這代表你可能已經把他的時間放得比自己的時間更重要。愛一個人，不應該愛到連自己的感受都不敢佔位置。',
      '## 第 3 點：總是你在道歉',
      '明明是他遲到、冷淡或失約，最後卻變成你道歉，因為你怕他不開心、怕關係變差。',
      '如果每次衝突都由你收拾殘局，對方就不需要真正面對責任，關係也會越來越失衡。',
      '## Asteria 感情拯救所話你知',
      '委屈不等於愛。當你發現自己長期用退讓換和平，就要停一停，看清楚這段關係到底是互相靠近，還是你一個人在撐。'
    ].join('\n\n');
  }
  if (idKey === '130') {
    return [
      '如果男朋友好霸道、好固執、又好要面，硬碰硬通常只會令大家更僵。大男人表面強勢，內心很多時其實很需要被認同、被尊重和被看見。',
      '以柔制剛不是叫你無底線忍讓，而是先理解他的心理死穴，再用更聰明的方式溝通。',
      '## 第 1 點：他很需要面子',
      '大男人自尊心通常很強。如果你當眾落他面、否定他的決定，他很容易視為人格攻擊，然後用更強硬的方式反擊。',
      '有些話可以私下講，有些提醒可以換一種語氣。給面子不是縱容，而是降低他的防衛，讓對話有機會繼續。',
      '## 第 2 點：他吃軟不吃硬',
      '如果你表現得很強勢，他可能會把你當成競爭對手；但如果你用示弱、請求、肯定的方式表達，他反而比較容易放下戒備。',
      '例如先肯定他的努力，再講你需要甚麼，比一開口批評更容易令他聽入耳。',
      '## 第 3 點：控制慾常來自不安全感',
      '他管你穿甚麼、幾點回家，表面像霸道，背後可能是害怕失去掌控。這不代表你要接受控制，但你可以看清楚問題核心。',
      '真正成熟的處理，是一邊安撫不安，一邊清楚設界線：「我明白你擔心，但我的自由和社交也需要被尊重。」',
      '## Asteria 感情拯救所話你知',
      '和大男人相處，最重要是分清「需要被尊重」和「想控制你」。前者可以溝通，後者就要設界線。溫柔可以是一種方法，但不能變成失去自己。'
    ].join('\n\n');
  }
  if (idKey === '079') {
    return [
      '## 伴侶問你借錢，先不要急著用愛作答',
      '感情入面可以互相扶持，但金錢不應該變成愛的考試。如果對方只說「幫幫我」，卻講不清用途、金額和還款日期，你就不應該因為心軟而即刻答應。',
      '真正負責任的人，會願意把事情交代清楚，而不是用情緒逼你即刻幫。你可以關心對方，也可以同時保護自己；這兩件事並不衝突。',
      '## 第一件事：問清楚用途、金額和還款時間',
      '借錢之前，要先知道對方為甚麼需要這筆錢、實際金額是多少、打算甚麼時候還、用甚麼方式還。如果對方連這些基本資料都不願意講清楚，問題就不只是錢，而是責任感和尊重。',
      '如果只是短期小額周轉，你可以按自己能力決定；但涉及較大金額，就要清楚寫低借款日期、金額、還款方式和時間。講清楚不是不信任，而是保護雙方關係。',
      '## 第二件事：分清幫忙和被情緒勒索',
      '有些人會用「你愛我就應該幫我」這類說法，令你覺得不借就是無情。但愛一個人，不代表要無條件承擔對方所有財務後果。',
      '如果你心底其實很不安，卻因為怕失去對方而勉強借出，之後很容易由幫忙變成怨氣。真正健康的關係，應該容許你講出界線，而不是要求你用錢證明愛。',
      '## 第三件事：借錢後看對方態度',
      '有些人借錢前很溫柔，借完之後就迴避、拖延、發脾氣，甚至反過來指責你計較。這種態度比借錢本身更值得留意，因為它反映對方有沒有責任感。',
      '很多感情入面的金錢矛盾，都是因為一開始不好意思講清楚。你怕講得太實際會傷感情，對方可能也覺得伴侶之間不需要計較；但越含糊，日後越容易變成怨氣、誤會，甚至權力不平衡。',
      '## Asteria 感情拯救所話你知',
      '講錢時可以保持溫柔，但內容要具體。你可以同時表達關心和界線：「我明白你有困難，我願意陪你想辦法，但這筆錢我最多能承擔多少、希望怎樣還、如果還不到會怎樣處理。」',
      '清楚不是無情，而是讓感情不用被金錢拖垮。真正重視你的人，會明白你設界線不是不愛，而是想把關係放在更穩的位置。'
    ].join('\n\n');
  }
  if (idKey === '128') {
    return [
      '## 你係咪成日覺得另一半「差咁啲」？',
      '如果你經常挑剔另一半，例如覺得佢食嘢聲音大、著衫無品味、講嘢唔夠幽默，明明佢對你不差，但你總係覺得還有更好的人，這就可能是感情完美主義。',
      '感情完美主義不是單純有要求，而是你腦海中有一個理想劇本。當現實伴侶同劇本有出入，你就會覺得這段關係出錯，甚至想改造對方。',
      '## 特徵一：放大缺點，忽略真實付出',
      '你可能會一直看見對方的小瑕疵，卻看不見他平日的照顧和付出。久而久之，你不是在理解一個真實的人，而是在拿他和想像中的完美伴侶比較。',
      '這種比較會令你越來越不滿，也會令對方覺得自己永遠不夠好。關係最消耗的地方，不一定是對方真的很差，而是你一直用不存在的標準去評分。',
      '## 特徵二：把靈魂伴侶想得太理所當然',
      '有些人會覺得真正適合的人應該不用講都懂，應該每一個反應都剛好合你心意。但親密關係不是讀心術，就算再相愛，兩個人都需要溝通和磨合。',
      '如果你把「不用教、不用講、自然完美」當成真愛標準，你很容易錯過願意學、願意調整、願意陪你走下去的人。',
      '## 特徵三：成日羨慕別人的伴侶',
      '看到別人的男朋友浪漫、會送禮、會安排約會，你可能會忍不住覺得自己的另一半很普通。但你看到的通常只是別人關係的一小部分，不是完整日常。',
      '比較可以提醒你想要甚麼，但如果比較變成習慣，就會令你永遠不滿意。世界上沒有完美的人，只有願不願意一起修正、一起成長的人。',
      '## Asteria 感情拯救所話你知',
      '你可以有標準，也可以有期待，但要分清楚：這是核心價值不合，還是你正在追求一個不存在的完美伴侶？如果對方願意回應、願意調整，這段關係值得用更成熟的方法處理。',
      '如果你每次提出需要都只換來逃避、指責或者冷淡，那就要保護自己；但如果對方一直有實際付出，只是未必完全符合你的劇本，也許你要先學會看見真實的好。'
    ].join('\n\n');
  }
  if (idKey === '132') {
    return [
      '## 愛情可以很重要，但不應該吞掉你整個人生',
      '愛情會令生活添上色彩，但如果你一拍拖就將所有時間、情緒和決定都交給另一半，事事以對方為先，你可能已經陷入戀愛腦。',
      '戀愛腦不是只有女生才會出現，不論男女都有機會因為太怕失去、太想被愛，而把伴侶變成生活唯一重心。問題是，當愛情變成你的全部，你反而更容易失去安全感。',
      '## 症狀一：有異性無人性',
      '一拍拖就人間蒸發，朋友約極都不出，生活所有安排都圍住另一半轉。短期看似很投入，但長期會令你失去自己的生活支撐。',
      '一段健康關係，不應該要求你放棄朋友、興趣和個人成長。你越沒有自己的生活，越容易把所有情緒壓在對方身上。',
      '## 症狀二：電話不離手，情緒被訊息牽住',
      '你可能會一直等對方回覆，對方遲覆少少就開始焦慮，甚至不停猜他是不是不愛你。這種狀態會令你很難專心生活，也會令對方感到壓力。',
      '真正的安全感，不是對方每分鐘都回覆，而是你知道自己即使暫時沒有被回應，也不等於被拋低。',
      '## 症狀三：底線一退再退',
      '如果對方做錯事、傷害你，甚至出軌，你都無限原諒，只因為怕他分手，這就不是包容，而是你正在用犧牲自己去換關係繼續。',
      '愛一個人可以心軟，但不應該失去底線。當你連自己受傷都不敢承認，關係就會慢慢變成單方面消耗。',
      '## 點樣戒走戀愛腦？',
      '第一，重新安排自己的生活，不要把所有時間留給對方。第二，練習把焦慮寫低，分清事實和想像。第三，當對方做錯事時，先問自己真正需要的是道歉、改變，還是界線。',
      '你不需要一下子變得很冷淡，只需要一步步把自己拿回來。當你有自己的節奏，感情反而會更健康，因為你不是靠抓緊對方來證明自己值得被愛。',
      '## Asteria 感情拯救所話你知',
      '戀愛腦最辛苦的地方，是你以為自己很愛，其實你只是很怕失去。真正穩定的愛，不會令你失去朋友、生活和底線。',
      '如果你發現自己一拍拖就不像自己，先不要責怪自己。你可以慢慢重建安全感，學會在愛一個人的同時，也保留自己的世界。'
    ].join('\n\n');
  }
  if (idKey !== '111') return '';
  return [
    '## 你有冇試過喺戀愛入面覺得心很累？',
    '明明單身時，你可以好清醒、好有自信；但一進入關係，就開始變得畏首畏尾。你怕自己講錯一句、拒絕一次，對方就會生氣、冷淡，甚至話你不夠愛。',
    '如果伴侶經常用愛、犧牲、失望或者離開來令你順從，這未必只是普通情緒化，而可能是情緒勒索。情緒勒索最可怕的地方，是它表面看似深情，實際上卻慢慢令你失去界線。',
    '## 拆解 4 大情緒勒索金句',
    '### 第一句：「我咁做都係因為太愛你」',
    '這句說話聽落好似深情，但潛台詞可能是：如果你拒絕我，就是拒絕我的愛。對方將自己的控制包裝成愛，令你覺得不順從就是不知好歹。',
    '真正健康的愛，不需要用愛做理由去壓迫你。愛可以表達需要，但不應該要求你犧牲感受、自由或者底線去證明自己。',
    '### 第二句：「你真心愛我就要咁做」',
    '這句是很典型的愛意綁架。它將一個具體要求變成感情考試，好像你只要不照做，就代表你不愛、不夠投入、不值得被信任。',
    '你要分清楚，愛一個人不等於每件事都要答應。你可以重視對方，也可以有自己的節奏、選擇和拒絕權。',
    '### 第三句：「我放棄一切只為永遠同你一齊」',
    '表面上這句像是很大的付出，但如果對方用自己的犧牲來令你內疚，就會變成另一種壓力。潛台詞是：我為你做了這麼多，所以你欠我。',
    '感情入面可以有付出，但付出不應變成債務。真正成熟的關係，是雙方自願選擇靠近，而不是一方用犧牲逼另一方償還。',
    '### 第四句：「如果我討厭你，早就走咗啦」',
    '這句說話會令人覺得，對方願意留下已經是一種恩賜，你應該感恩，不應再要求更多。但其實，留在關係入面不等於有好好愛你，也不等於可以貶低你。',
    '如果一段關係要靠「我都未走」來證明愛，代表真正的尊重和照顧可能已經不足。你值得的是被珍惜，而不是被提醒自己很幸運才沒有被拋低。',
    '## 怎樣分辨情緒表達同情緒勒索？',
    '正常情緒表達，會講自己的感受和需要，例如「我聽到你咁講會難過」。情緒勒索則會令你覺得自己有罪，迫你用順從去安撫對方，例如「你唔咁做就係唔愛我」。',
    '你可以問自己三個問題：對方有沒有容許你拒絕？有沒有尊重你的界線？每次溝通後，你是更清楚彼此需要，還是更害怕做錯？答案會幫你看清這段互動是否健康。',
    '## Asteria 感情拯救所話你知',
    '情緒勒索是一種慢性消耗，會慢慢蠶食你的自信。你不需要即刻反擊，但要開始建立心理邊界：先停低、看清對方真正要求，再用溫柔但堅定的方式回應。',
    '如果你長期被這類說話困住，不妨先整理最近幾次對話，分清哪些是感受表達，哪些是勒索句式。當你看得清模式，就比較容易重新拿回關係入面的主導權。'
  ].join('\n\n');
};

const joinParagraphSentences = (parts = []) => {
  const cleaned = parts
    .map((part) => normalizeArticleText(stripHtml(part))
      .replace(/\s+([。！？？，、；：])/g, '$1')
      .replace(/([「『（(])\s+/g, '$1')
      .replace(/\s+([」』）)])/g, '$1')
      .trim())
    .filter(Boolean);
  if (!cleaned.length) return '';
  return cleaned.reduce((out, part) => {
    if (!out) return part;
    if (/[。！？!?；;：:]$/.test(out)) return `${out}${part}`;
    if (/^[，,、；;：:。！？!?]/.test(part)) return `${out}${part}`;
    return `${out}，${part}`;
  }, '');
};

const shouldKeepParagraphRunSeparate = (items = []) => {
  if (items.length < 2) return true;
  const texts = items.map((item) => normalizeArticleText(stripHtml(item)).trim()).filter(Boolean);
  if (texts.length < 2) return true;
  if (texts.some((text) => /^(中\s*\d|[✓!]|Q[:：]|A[:：])/.test(text))) return true;
  if (texts.every((text) => text.length <= 32 && /[？?]$/.test(text))) return true;
  return false;
};

const mergeParagraphRun = (items = []) => {
  if (shouldKeepParagraphRunSeparate(items)) return items.join('');
  const groups = [];
  let current = [];
  let currentLength = 0;
  for (const item of items) {
    const text = normalizeArticleText(stripHtml(item)).trim();
    if (!text) continue;
    const isVeryShort = text.length < 28;
    const target = isVeryShort ? 190 : 230;
    if (current.length && currentLength + text.length > target) {
      groups.push(current);
      current = [];
      currentLength = 0;
    }
    current.push(item);
    currentLength += text.length;
  }
  if (current.length) groups.push(current);
  return groups
    .map((group) => `<p>${formatInline(joinParagraphSentences(group))}</p>`)
    .join('\n');
};

const repairCaptionParagraphRunsHtml = (html = '') => {
  const protectedBlocks = [];
  let out = html.replace(
    /<(div|ul) class="article-(?:highlight-list|check|check-compare|choice|point-grid|step-grid|comparison|tip-card|section-card|dialogue|insight|stage-timeline)[\s\S]*?<\/\1>/g,
    (match) => {
      const token = `%%ASTERIA_PROTECTED_BLOCK_${protectedBlocks.length}%%`;
      protectedBlocks.push(match);
      return token;
    }
  );
  out = out.replace(/(?:<p(?: [^>]*)?>[\s\S]*?<\/p>\s*){2,}/g, (match) => {
    const items = [...match.matchAll(/<p(?: [^>]*)?>([\s\S]*?)<\/p>/g)]
      .map((item) => `<p>${item[1]}</p>`);
    const plain = items.map((item) => normalizeArticleText(stripHtml(item)).trim()).filter(Boolean);
    if (plain.length < 2) return match;
    const shortCount = plain.filter((text) => text.length < 56).length;
    const questionCount = plain.filter((text) => /[？?]$/.test(text)).length;
    const captionish = shortCount >= 2 || questionCount >= 2 || plain.some((text) => /^(有冇試過|你有冇|放心|記住|但係|到底|咁到底|唔通|係咪|不如|所以|其實)/.test(text));
    if (!captionish) return match;
    return mergeParagraphRun(items);
  });
  protectedBlocks.forEach((block, index) => {
    out = out.replace(`%%ASTERIA_PROTECTED_BLOCK_${index}%%`, block);
  });
  return out;
};

const repairPossessivenessSelfTestHtml = (html = '') => html.replace(
  /<p>對方唔聽電話，你會奪命連環 Call \(超過 5 次\)。<\/p>\s*<p>你會偷偷 Check 佢電話 \/ Social Media 的 Follow List。<\/p>\s*<p>唔鍾意佢同異性朋友單獨食飯 \(就算係公事\)。<\/p>\s*<p>如果你唔知佢行蹤，你會焦慮到做唔到野。<\/p>\s*<p>你會要求佢刪除前度嘅所有聯絡方式。<\/p>\s*<p>中 0-1 個：佛系戀人。小心對方覺得你唔在乎佢。<\/p>\s*<p>中 2-3 個：正常範圍。你只係緊張佢。<\/p>\s*<p>中 4-5 個：危險警號！你可能已經有控制狂傾向。佔有慾太強點算？<\/p>/g,
  () => [
    '<div class="article-checklist article-checklist--warning">',
    '<div class="article-checklist__item"><span>!</span><p>對方唔聽電話，你會奪命連環 Call（超過 5 次）。</p></div>',
    '<div class="article-checklist__item"><span>!</span><p>你會偷偷 Check 佢電話或 Social Media 的 Follow List。</p></div>',
    '<div class="article-checklist__item"><span>!</span><p>唔鍾意佢同異性朋友單獨食飯，就算係公事都會介意。</p></div>',
    '<div class="article-checklist__item"><span>!</span><p>如果你唔知佢行蹤，你會焦慮到做唔到嘢。</p></div>',
    '<div class="article-checklist__item"><span>!</span><p>你會要求佢刪除前度嘅所有聯絡方式。</p></div>',
    '</div>',
    '<div class="article-step-grid">',
    '<div class="article-step-card"><span>0-1 個</span><p>佛系戀人，小心對方覺得你唔在乎佢。</p></div>',
    '<div class="article-step-card"><span>2-3 個</span><p>正常範圍，你只係比較緊張呢段關係。</p></div>',
    '<div class="article-step-card"><span>4-5 個</span><p>危險警號，你可能已經有控制傾向，要先處理安全感。</p></div>',
    '</div>'
  ].join('\n')
);

const compactHighlightItemsHtml = (html = '') => html.replace(
  /<ul class="article-highlight-list">([\s\S]*?)<\/ul>/g,
  (_, inner) => {
    const items = [...inner.matchAll(/<li>([\s\S]*?)<\/li>/g)]
      .map((match) => normalizeArticleText(stripHtml(match[1]))
        .replace(/[「」『』]/g, '')
        .replace(/^[，,、：:。！？!?？\s]+/u, '')
        .trim())
      .map((item) => {
        if (item.length <= 64) return item;
        const shortened = shortenAtNaturalBreak(item, 64);
        return shortened || item.slice(0, 64).replace(/[，,、：:；;]+$/u, '');
      })
      .map((item) => ({
        '依賴': '分清真愛與習慣性依賴',
        '你好愛佢': '愛得深不等於要長期委屈',
        '試諗吓': '先問自己在關係裡是否仍然幸福',
        '曖昧期': '真心要看不同階段的行動',
        '熱戀期': '熱情之外要看穩定投入',
        '相處時': '日常相處最能反映真心',
        '分享': '親密感不是分享越多越好',
        '當然': '分享前要分清對方能否承接',
        '拖手影相': '放閃不等於關係穩定',
        '恩愛人設': '形象越完美，越要看私下相處',
        '但係': '不安需要回到關係真實狀態',
        '被需要': '男人也需要被肯定和需要',
        '噴香水': '第一次約會重點是舒服得體',
        '贖金': '出軌修復不能只靠補償',
        '信任': '信任要靠持續行動重建',
        '溝通': '修復要講清責任與界線',
        '依戀': '親密連結要慢慢修補',
        '記住': '尊重不是不表態，而是守住界線',
        '睇開啲': '對方不主動時要先講清需要',
        '特徵': '依戀創傷會影響分手判斷',
        '現實係': '直男式相處需要具體教法',
        '提分手': '試探不是愛，是不安全感',
        '不掃興': '情緒價值來自接住對方感受',
      }[item] || item))
      .map((item) => /[。！？!?？]$/u.test(item) ? item : `${item}。`)
      .filter((item, index, arr) => item.length >= 12 && arr.indexOf(item) === index)
      .slice(0, 4);
    if (!items.length) return '';
    return `<ul class="article-highlight-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  }
);

const repairFinalArticleHtml = (html = '') => {
  let out = repairClosingSectionsHtml(html);
  out = repairEditorialArtifactsHtml(out);
  out = repairInlineNumberedSectionsHtml(out);
  out = repairInlineNumberedListHtml(out);
  out = repairNumberedParagraphHeadingsHtml(out);
  out = repairSparseArticleSectionsHtml(out);
  out = repairLabelParagraphHeadingsHtml(out);
  out = repairWeakHeadingsHtml(out);
  out = repairAdjacentEmptyHeadingsHtml(out);
  out = repairOverlongHeadingsHtml(out);
  out = stripEmptyHighlightTitleHtml(out);
  out = ensureHighlightHtml(out);
  return out
    .replace(/<ul class="article-highlight-list">([\s\S]*?)<\/ul>/g, (match) => repairHighlightListsHtml(match))
    .replace(/(<\/p>)\s*(<ul class="article-highlight-list">)/g, '$1\n<h2 class="article-highlight-title">重點速讀</h2>\n$2')
    .replace(/<p>讀到這[裏裡][，,][\s\S]{0,120}?設下界線。<\/p>/g, '')
    .replace(/<p>（建議呢版用表列形式出），性格、行為表現有咩分別？<\/p>/g, '<p>大男人和恐怖情人的分別，關鍵在於控制程度、情緒穩定度，以及對方是否尊重你的界線。</p>')
    .replace(/（建議呢版用表列形式出），性格、行為表現有咩分別？/g, '大男人和恐怖情人的分別，關鍵在於控制程度、情緒穩定度，以及對方是否尊重你的界線。')
    .replace(
      /(<p>修復最怕變成審判大會。[\s\S]*?這樣比一直重播錯誤更有用。)\s*(信任不是一句對不起就回來[\s\S]*?裂痕反而可以成為關係升級的位置。<\/p>)/g,
      '$1</p>\n<h2 class="article-numbered-heading"><span class="article-numbered-heading__badge">第 3 點</span><span>用新行動重建信任</span></h2>\n<p>$2'
    )
    .replace(/<p>1\. 穿搭指南 \(Visual\)：/g, '<p>1. 穿搭指南：')
    .replace(/ \(Sorry to say\)/g, '')
    .replace(/你，又者你嘅另一半/g, '你或者你嘅另一半，有冇試過咁諗？')
    .replace(/喺呢段親密關係入面，會唔會曾同講過以下類似嘅說話，你愛我，就應該知道我諗緊乜啦！/g, '喺親密關係入面，你或者對方有冇講過類似說話：「你愛我，就應該知道我諗緊乜啦！」')
    .replace(/你，有冇意識到/g, '你有冇意識到')
    .replace(/或又者/g, '或者')
    .replace(/令會呢段感情/g, '令呢段感情')
    .replace(/Check佢了唔了解你、估唔估得中/g, '測試佢了解唔了解你、估唔估得中')
    .replace(/慢慢句慢地/g, '慢慢地')
    .replace(/當然坦誠嘅時間耐咗了/g, '當然，坦誠需要時間累積')
    .replace(/轉彎末角/g, '轉彎抹角')
    .replace(/分辦/g, '分辨')
    .replace(/自為何乜/g, '自己為何')
    .replace(/為何乜/g, '為甚麼')
    .replace(/未得嫁出/g, '未嫁出')
    .replace(/世伯伯母/g, '伯父伯母')
    .replace(/要靚個種/g, '要靚嗰種')
    .replace(/You want to move in with me。?/g, '對方提出同居，或者你開始諗同另一半搬埋一齊。')
    .replace(/唔好令讓朋友/g, '唔好令朋友')
    .replace(/等自己機會走出/g, '等自己有機會走出')
    .replace(/就得稱讚下啲佢/g, '就可以稱讚下佢')
    .replace(/咁那樣/g, '咁樣')
    .replace(/突你破解/g, '教你破解')
    .replace(/無野/g, '無嘢')
    .replace(/你 \/ 另一半/g, '你或者另一半')
    .replace(/Check List/g, '家務清單')
    .replace(/Checklist/g, '家務清單')
    .replace(/有啲人對家務毫無idea/g, '有啲人對家務完全冇概念')
    .replace(/要簡單直接地list出嚟/g, '要簡單直接地列出嚟')
    .replace(/個List/g, '呢張清單')
    .replace(/有張List/g, '有張清單')
    .replace(/你會唔會曾經有呢個迷思⋯⋯/g, '你有冇試過咁諗？')
    .replace(/啲野/g, '啲嘢')
    .replace(/的野/g, '的嘢')
    .replace(/嘅野/g, '嘅嘢')
    .replace(/咩野/g, '咩嘢')
    .replace(/乜野/g, '乜嘢')
    .replace(/做野/g, '做嘢')
    .replace(/講野/g, '講嘢')
    .replace(/野食/g, '嘢食')
    .replace(/食野/g, '食嘢')
    .replace(/煮野/g, '煮嘢')
    .replace(/其他野/g, '其他嘢')
    .replace(/所有野/g, '所有嘢')
    .replace(/呢件野/g, '呢件嘢')
    .replace(/依件野/g, '呢件嘢')
    .replace(/扮下野/g, '扮下嘢')
    .replace(/講左/g, '講咗')
    .replace(/比左/g, '畀咗')
    .replace(/人地/g, '人哋')
    .replace(/涷曬/g, '凍晒')
    .replace(/食嘢趙得/g, '食嘢咀嚼得')
    .replace(/黎埋/g, '嚟埋')
    .replace(/比空間/g, '畀空間')
    .replace(/比清晰/g, '畀清晰')
    .replace(/比機會/g, '畀機會');
};

const guaranteeHighlightHtml = (html = '') => {
  let out = stripEmptyHighlightTitleHtml(html)
    .replace(/<ul class="article-highlight-list">([\s\S]*?)<\/ul>/g, (match) => repairHighlightListsHtml(match));
  if (!/article-highlight-list/.test(out)) {
    out = buildFallbackHighlightHtml(out);
  }
  if (!/article-highlight-list/.test(out)) {
    const fallback = '<h2 class="article-highlight-title">重點速讀</h2>\n<ul class="article-highlight-list"><li>先分清感覺、事實同界線。</li><li>不要只聽說話，要看持續行動。</li></ul>';
    if (/<h2>Asteria 小提醒<\/h2>/.test(out)) {
      out = out.replace(/<h2>Asteria 小提醒<\/h2>/, `${fallback}\n<h2>Asteria 小提醒</h2>`);
    } else if (/<h2>常見問題<\/h2>/.test(out)) {
      out = out.replace(/<h2>常見問題<\/h2>/, `${fallback}\n<h2>常見問題</h2>`);
    } else {
      out = `${out}\n${fallback}`;
    }
  }
  return out.replace(/(<\/p>)\s*(<ul class="article-highlight-list">)/g, '$1\n<h2 class="article-highlight-title">重點速讀</h2>\n$2');
};

const stripHighlightQuoteMarksHtml = (html = '') => html.replace(
  /<ul class="article-highlight-list">([\s\S]*?)<\/ul>/g,
  (_, inner) => {
    const items = [...inner.matchAll(/<li>([\s\S]*?)<\/li>/g)]
      .map((item) => normalizeArticleText(stripHtml(item[1])).replace(/[「」『』]/g, ''))
      .map((item) => item
        .replace(/\s+([。！？？，、；：])/g, '$1')
        .replace(/([（(])\s+/g, '$1')
        .replace(/\s+([）)])/g, '$1')
        .replace(/([\u4e00-\u9fff])\s+([\u4e00-\u9fff])/g, '$1$2')
        .replace(/([！？!?])。$/g, '$1')
        .replace(/。{2,}$/g, '。')
        .trim())
      .filter(Boolean);
    return `<ul class="article-highlight-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  }
);

const reminderForArticle = ({ title, category }) => {
  const text = `${title} ${category}`;
  if (/情緒勒索|勒索金句/.test(text)) {
    return '如果對方用愛、內疚或離開來令你順從，先不要急著自責。真正健康的關係，應該容許你表達拒絕、保留界線，也容許雙方用更清楚的方式講需要。';
  }
  if (/氹人|安慰/.test(text)) {
    return '如果你正面對另一半唔識氹人，重點不是逼對方即刻變浪漫，而是把你真正需要的安撫方式講清楚，讓對方知道可以怎樣靠近你。';
  }
  if (/冷淡期|熱戀期|關係變淡|無嘢講|無話題|重燃愛火/.test(text)) {
    return '如果你覺得關係變淡，先不要急著判定感情完結。可以先看你們是否仍願意安排時間、回應彼此需要，以及一起嘗試新的相處方式。';
  }
  if (/冷戰|黑面|唔出聲|沉默/.test(text)) {
    return '如果對方用沉默或冷戰表達不滿，先不要用追問逼答案。可以等情緒降溫後，用一句清楚又低壓的說話打開溝通窗口。';
  }
  if (/Block|已讀|斷聯|冷戰|冷淡|少覆|唔覆|不回/.test(text)) {
    return '如果對方突然 Block 或已讀不回，先不要直接當成無得救。更重要是分清他是在逃避壓力、保護自己，還是真的想切斷關係，再決定下一步。';
  }
  if (/家務|分擔|壞習慣|配合|日常主動|自動自覺/.test(text)) {
    return '如果問題來自日常分工或生活習慣，重點不是逼對方即刻變成你想像中的樣子，而是把需要講清楚、一起定出可做到的小改變，再看對方有沒有持續配合。';
  }
  if (/溝通|講|道歉|嗌交|吵架|爭執/.test(text)) {
    return '如果問題卡在溝通，先把事件、感受和希望對方做到的一件事分開講。少一點指責，多一點具體請求，對方才較容易聽入耳。';
  }
  if (/復合|分手|前度|挽回/.test(text)) {
    return '如果你仍然想挽回，先不要急著用訊息追答案。看清分開原因、對方抗拒程度和可重新開口的窗口，會比衝動求和更有用。';
  }
  if (/安全感|不安|焦慮|委屈|內耗/.test(text)) {
    return '如果你一直很不安，先不要只怪自己想太多。真正要看的是對方行動能否給你穩定感，以及你有沒有為自己保留界線。';
  }
  if (/曖昧|桃花|約會|單身|追|表白|吸引/.test(text)) {
    return '如果關係仍在曖昧階段，甜言蜜語不是唯一判斷。要看對方有沒有穩定投入、願意推進，以及你是否仍然有自己的節奏。';
  }
  if (/結婚|同居|長期|家長|辦公室|未來|承諾/.test(text)) {
    return '如果問題關乎長期安排，重點不是逼對方即刻承諾，而是看你們能否坦白談未來、責任和現實限制。';
  }
  if (/控制|PUA|冷暴力|家暴|出軌|渣男|警號|紅旗/.test(text)) {
    return '如果你看到控制、冷暴力或傷害性行為，先不要急著替對方合理化。保護自己、看行動是否持續，比聽一句解釋更重要。';
  }
  if (/付出|珍惜|價值|情緒價值|好命|自我|壓抑|取悅/.test(text)) {
    return '如果你正在關係入面不斷付出，記得先看自己有沒有被好好對待。真正穩定的感情，不需要靠壓低自己去換取對方重視。';
  }
  if (/男人|男朋友|大男人|試探|空頭支票|心底話/.test(text)) {
    return '看男人心態時，不要只聽他一刻怎樣講，也要看他之後有沒有做到、願不願意承擔，以及你在相處裡是否感到安心。';
  }
  if (/心動|變淡|親密|依賴|習慣|真愛|戀愛腦|磨合|相處/.test(text)) {
    return '感情變化不一定代表關係完結，但你需要看清楚這是正常磨合、短暫情緒，還是長期忽略彼此需要。';
  }
  return '先把事件、感受和需要分開看，再決定要溝通、觀察還是設界線。越混亂的時候，越要回到具體行動，而不是靠猜測消耗自己。';
};

const articleDepthKind = ({ title, category }) => {
  const text = `${title} ${category}`;
  if (/控制|冷暴力|出軌|變心|恐怖|借錢|警號|PUA|貶低|操控|家暴|暴力|傷害|渣男|封鎖/.test(text)) return 'risk';
  if (/復合|挽回|前度|分手|斷聯|冷戰|冷淡|回頭|失戀|不覆|Block|已讀/.test(text)) return 'reconnect';
  if (/曖昧|桃花|單身|心動|炮友|SP|FWB|約會|主動|表白|吸引/.test(text)) return 'ambiguous';
  if (/結婚|婚前|同居|家長|辦公室|Long D|長久|適合|條件|未來|伴侶|距離|生活/.test(text)) return 'commitment';
  if (/溝通|相處|吵架|需求|情緒|壓力|支援|報備|道歉|承諾|挑剔|說話|回覆|訊息|聽|懂你/.test(text)) return 'communication';
  return 'mindset';
};

const depthSectionForArticle = (article) => {
  const topic = shortTopicFromTitle(article.title) || '這段關係';
  const sections = {
    communication: [
      `再拆深一點：${topic}背後的溝通卡位`,
      `處理「${topic}」時，最重要不是一次過講晒所有委屈，而是先找出對方最容易防衛的位置。你可以回看最近一次對話：第一句是否已經帶責備、你有沒有同時講太多問題、對方退後後你有沒有越追越急。`,
      `真正有效的做法，是先把句子縮短成一件事、一個感受、一個希望。這樣不是把自己放低，而是令對方更容易知道可以怎樣回應，你亦更容易判斷他是否真的願意調整。`
    ],
    reconnect: [
      `再看清楚：${topic}是否仍有修補窗口`,
      `面對「${topic}」時，不要只看對方一刻冷淡，還要看他是否仍保留基本回應、會不會避開所有重點，以及你一靠近時關係是變鬆還是變更緊。這些訊號，比你腦內反覆猜測更可靠。`,
      `如果仍有窗口，下一步要低壓、短句、清楚；如果對方長期拒絕面對，就要先停一停，避免把修補變成追逼。挽回不是不停證明自己有幾愛，而是判斷對方還接不接得住。`
    ],
    risk: [
      `再判斷：${topic}是偶發衝突還是長期模式`,
      `「${topic}」不能只靠一次道歉或一句解釋判斷。真正要看的是同類事情會不會重複、對方有沒有承認責任，以及之後有沒有用行動修正，而不是只在你想走時才緊張。`,
      `如果你每次都要說服自己不要介意，這已經是一個訊號。先守住底線，再看對方是否願意尊重你的感受；否則你只會在同一個模式裡反覆受傷。`
    ],
    ambiguous: [
      `再觀察：${topic}有沒有落到行動`,
      `「${topic}」不能只靠感覺判斷。曖昧可以很甜，身體親密可以很近，但真正有心的人會在日常裡投入時間、安排見面、交代位置，而不是只在方便時出現。`,
      `你可以主動一次，但之後要留意對方有沒有接住。保留自己的節奏，不等於玩手段，而是避免在關係未清楚前，已經先把安全感和界線全部交出去。`
    ],
    commitment: [
      `再落地看：${topic}能否承托日常生活`,
      `「${topic}」不能只看感覺，也要看現實細節。時間安排、金錢觀、家庭界線、壓力處理和未來方向，全部都會影響一段關係能不能走長。`,
      `你可以提出一個很具體的小安排，再看對方是否願意一起調整。真正適合的人，不只是嘴上說愛你，而是在現實問題出現時仍願意同行。`
    ],
    mindset: [
      `再整理：${topic}牽動的是哪一種不安`,
      `「${topic}」很多時會令人忍不住腦內補戲，但真正需要處理的，可能是害怕被放低、害怕不被選擇，或者害怕自己再次做錯。先分清事實和想像，情緒才不會推著你走。`,
      `你可以把最困擾你的事件寫低，再問自己：我需要的是答案、安撫、界線，還是實際改變？當需要變清楚，下一步就不會只是反覆內耗。`
    ]
  };
  return sections[articleDepthKind(article)];
};

const repairThinArticleDepthHtml = (html = '', article) => {
  return html;
  if (/感情完美主義|覺得另一半唔夠好/.test(article.title)) return html;
  const body = stripHtml(html.split(/<h2(?: class="article-highlight-title")?>重點速讀<\/h2>|<h2>Asteria 小提醒<\/h2>|<h2>常見問題<\/h2>/)[0] || '');
  if (body.length >= 760) return html;
  const [heading, ...paragraphs] = depthSectionForArticle(article);
  if (html.includes(heading)) return html;
  const block = `<h2>${escapeHtml(heading)}</h2>\n${paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n')}`;
  if (/<h2 class="article-highlight-title">重點速讀<\/h2>/.test(html)) {
    return html.replace(/<h2 class="article-highlight-title">重點速讀<\/h2>/, `${block}\n<h2 class="article-highlight-title">重點速讀</h2>`);
  }
  if (/<h2>Asteria 小提醒<\/h2>/.test(html)) {
    return html.replace(/<h2>Asteria 小提醒<\/h2>/, `${block}\n<h2>Asteria 小提醒</h2>`);
  }
  if (/<h2>常見問題<\/h2>/.test(html)) {
    return html.replace(/<h2>常見問題<\/h2>/, `${block}\n<h2>常見問題</h2>`);
  }
  return `${html}\n${block}`;
};

const headingLabelFromSection = (sectionHtml = '') => {
  const paragraph = sectionHtml.match(/<p>([\s\S]*?)<\/p>/)?.[1] || '';
  const text = normalizeArticleText(stripHtml(paragraph))
    .replace(/^例如[：:]/u, '')
    .replace(/[「」『』]/g, '')
    .trim();
  const label = text
    .split(/[。！？!?，,；;：:]/u)[0]
    ?.replace(/^(如果|當|但|其實|例如)\s*/u, '')
    .trim();
  if (!label || (label.length < 4 && !/正常|非正常|真愛|習慣/.test(label))) return '';
  return label.length > 24 ? label.slice(0, 24) : label;
};

const repairDuplicateSectionHeadingsHtml = (html = '') => {
  const headings = [...html.matchAll(/<h2(?![^>]*article-highlight-title)([^>]*)>([\s\S]*?)<\/h2>/g)]
    .map((match) => normalizeArticleText(stripHtml(match[2])));
  const counts = headings.reduce((map, heading) => map.set(heading, (map.get(heading) || 0) + 1), new Map());
  if (![...counts.values()].some((count) => count > 1)) return html;

  return html.replace(
    /<h2(?![^>]*article-highlight-title)([^>]*)>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2|$)/g,
    (match, attrs, headingHtml, sectionHtml) => {
      const heading = normalizeArticleText(stripHtml(headingHtml));
      if ((counts.get(heading) || 0) < 2) return match;
      const label = headingLabelFromSection(sectionHtml);
      if (!label) return match;
      const base = heading.replace(/[？?]+$/u, '').replace(/[：:]+$/u, '').trim();
      if (base.includes(label) || label.includes(base)) return match;
      return `<h2${attrs}>${escapeHtml(`${base}：${label}`)}</h2>${sectionHtml}`;
    }
  );
};

const repairNormalAbnormalGivingHtml = (html = '') => html
  .replace(
    /<h2>那到底要怎樣分辨「(?:<strong>)*\s*正常\s*(?:<\/strong>)*」(?:&amp;|&|和|同)「(?:<strong>)*\s*非正常\s*(?:<\/strong>)*」付出？<\/h2>\s*<p>正常[：:，,]\s*/g,
    '<h2>正常付出：有互動、有回饋、不會長期消耗自己</h2>\n<p>'
  )
  .replace(
    /<h2>那到底要怎樣分辨「(?:<strong>)*\s*正常\s*(?:<\/strong>)*」(?:&amp;|&|和|同)「(?:<strong>)*\s*非正常\s*(?:<\/strong>)*」付出？<\/h2>\s*<p>非正常[：:，,]\s*/g,
    '<h2>非正常付出：因為害怕失去而犧牲自己</h2>\n<p>'
  );

const splitCardCenterThought = (text = '') => {
  const clean = normalizeArticleText(text);
  const dashMatch = clean.match(/^(.{2,36}?\s*[—-]{1,2}\s*「[^」]{2,40}」)([\s\S]*)$/u);
  if (dashMatch && dashMatch[2].trim().length >= 12) {
    return { highlight: dashMatch[1].trim(), rest: dashMatch[2].trim() };
  }
  const colonMatch = clean.match(/^([^：:。！？]{2,30})[：:]\s*([\s\S]{16,})$/u);
  if (colonMatch) {
    return { highlight: colonMatch[1].trim(), rest: colonMatch[2].trim() };
  }
  const sentenceMatch = clean.match(/^(.{18,92}?[。！？])([\s\S]{16,})$/u);
  if (sentenceMatch) {
    return { highlight: sentenceMatch[1].trim(), rest: sentenceMatch[2].trim() };
  }
  const commaMatch = clean.match(/^(.{18,72}?[，,])([\s\S]{24,})$/u);
  if (commaMatch) {
    return { highlight: commaMatch[1].replace(/[，,]$/u, '').trim(), rest: commaMatch[2].trim() };
  }
  return { highlight: clean, rest: '' };
};

const reduceLongSectionCardsHtml = (html = '') => html.replace(
  /<div class="article-section-card">([\s\S]*?)<\/div>/g,
  (match, inner) => {
    const paragraphs = [...inner.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((item) => normalizeArticleText(stripHtml(item[1])));
    const totalText = normalizeArticleText(paragraphs.join(' '));
    if (!totalText || (paragraphs.length <= 1 && totalText.length <= 96)) return match;
    const { highlight, rest } = splitCardCenterThought(paragraphs[0] || totalText);
    if (!highlight || normalizeText(highlight) === normalizeText(totalText)) return match;
    const restParts = [rest, ...paragraphs.slice(1)]
      .map((part) => normalizeArticleText(part).replace(/^[，,、。；;：:\s]+/u, ''))
      .filter((part) => part && normalizeText(part) !== normalizeText(highlight));
    const restHtml = restParts.map((part) => `<p>${formatInline(part)}</p>`).join('\n');
    return `<div class="article-section-card"><p>${formatInline(highlight)}</p></div>${restHtml ? `\n${restHtml}` : ''}`;
  }
);

const moveHighlightBeforeReminderHtml = (html = '') => {
  const match = html.match(/<h2 class="article-highlight-title">重點速讀<\/h2>\s*<ul class="article-highlight-list">[\s\S]*?<\/ul>/);
  if (!match) return html;
  const block = match[0];
  let out = html.slice(0, match.index) + html.slice(match.index + block.length);
  if (/<h2>Asteria 小提醒<\/h2>/.test(out)) {
    return out.replace(/<h2>Asteria 小提醒<\/h2>/, `${block}\n<h2>Asteria 小提醒</h2>`);
  }
  if (/<h2>常見問題<\/h2>/.test(out)) {
    return out.replace(/<h2>常見問題<\/h2>/, `${block}\n<h2>常見問題</h2>`);
  }
  return `${out}\n${block}`;
};

const personalizeReminderHtml = (html = '', article) => {
  const reminder = `<h2>Asteria 小提醒</h2>\n<p>${escapeHtml(reminderForArticle(article))}</p>`;
  if (/<h2>Asteria 小提醒<\/h2>\s*<p>[\s\S]*?<\/p>/.test(html)) {
    return html.replace(/<h2>Asteria 小提醒<\/h2>\s*<p>[\s\S]*?<\/p>/, reminder);
  }
  if (/<h2>Asteria 小提醒<\/h2>/.test(html)) {
    return html.replace(/<h2>Asteria 小提醒<\/h2>\s*/, `${reminder}\n`);
  }
  if (/<h2>常見問題<\/h2>/.test(html)) {
    return html.replace(/<h2>常見問題<\/h2>/, `${reminder}\n<h2>常見問題</h2>`);
  }
  return `${html}\n${reminder}`;
};

const buildFallbackSummary = (title, category) => {
  const topic = title.replace(/[？?].*$/, '').trim() || title;
  const categoryText = category || '感情相處';
  return `如果你正面對「${topic}」呢類感情狀況，可以先用${categoryText}角度整理對方心態、關係卡位同下一步做法。`;
};

const plainTextFromHtml = (html = '') => stripFaqForSummary(html)
  .replace(/<h[1-6][^>]*>/gi, '。')
  .replace(/<\/h[1-6]>/gi, '。')
  .replace(/<\/p>|<\/li>/gi, '。')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

const splitCompleteSentences = (value = '') => normalizeArticleText(value)
  .replace(/\s+/g, ' ')
  .match(/[^。！？!?]+[。！？!?][」』）)]?/gu)
  ?.map((sentence) => sentence.trim())
  .filter((sentence) => sentence.length > 1 && /[。！？!?][」』）)]?$/.test(sentence)) || [];

const sentenceSafeSummary = (value = '', fallback = '', { min = 70, max = 170 } = {}) => {
  const sentences = splitCompleteSentences(value)
    .filter((sentence) => !isFaqLikeSummary(sentence) && !/^[」』）\])，、。！？]/u.test(sentence));
  let output = '';
  for (const sentence of sentences) {
    if (!output) {
      output = sentence;
      if (output.length >= min) break;
      continue;
    }
    if ((output + sentence).length > max) break;
    output += sentence;
    if (output.length >= min) break;
  }
  if (output) return output;

  const cleaned = normalizeArticleText(value || fallback);
  if (/^[」』）\])，、。！？]/u.test(cleaned)) return normalizeArticleText(fallback || '');
  const boundary = Math.max(
    cleaned.lastIndexOf('。', max),
    cleaned.lastIndexOf('！', max),
    cleaned.lastIndexOf('？', max)
  );
  if (boundary >= 40) return cleaned.slice(0, boundary + 1);
  return normalizeArticleText(fallback || cleaned);
};

const makeSummary = ({ frontmatter, preliminaryContent, title, category }) => {
  const fromDescription = cleanDescription(
    frontmatter.description || frontmatter.meta_description || frontmatter.excerpt || ''
  );
  const candidate = fromDescription || plainTextFromHtml(preliminaryContent);
  const cleaned = sentenceSafeSummary(candidate, title);
  if (!cleaned || isFaqLikeSummary(cleaned) || normalizeText(cleaned) === normalizeText(title)) {
    return sentenceSafeSummary(buildFallbackSummary(title, category), title);
  }
  return cleaned;
};

const wrapSvgText = (text, maxChars = 12, maxLines = 4) => {
  const chars = [...text.replace(/\s+/g, '')];
  const lines = [];
  while (chars.length && lines.length < maxLines) {
    lines.push(chars.splice(0, maxChars).join(''));
  }
  return lines;
};

const photoScenarioFor = (title, category, slot) => {
  const text = `${title} ${category}`;
  if (/Long D|遠距|異地/.test(text)) {
    return [
      'a real candid photo of one partner smiling softly during a late-night video call in a cozy room, city lights outside the window',
      'a close-up real photo of a phone glowing with an unread message on a warm bed beside a notebook and bedside lamp, no readable text',
      'a real photo of two coffee cups, a blank calendar, and a laptop video call glow on a small table, intimate long-distance relationship mood',
      'a real candid photo of a couple reuniting in a quiet station waiting area, one small suitcase, gentle side hug, blurred warm background'
    ][slot % 4];
  }
  if (/少覆|唔覆|不回|已讀|message|訊息|回覆|秒回|覆訊息/.test(text)) {
    return [
      'a real close-up photo of a phone beside a half-finished cup of tea at night, unread message glow, no readable text',
      'a real candid photo of a young woman sitting on a sofa waiting for a reply, phone in hand, soft anxious mood',
      'a real photo of a couple texting from different rooms at night, emotional distance, warm cinematic light',
      'a real photo of a quiet bedroom desk with a phone, notebook, and dim lamp, waiting-for-message relationship mood, no readable text'
    ][slot % 4];
  }
  if (/第三者|新歡|出軌|偷食|變心|劈腿|外遇/.test(text)) {
    return [
      'a real photo of a phone face down between two silent people at a dining table, trust crisis mood, no readable text',
      'a real candid photo of a woman standing alone under city lights after a painful relationship discovery, cinematic but subtle',
      'a real photo of a tense couple in a dim living room, one person looking away while the other holds a phone',
      'a real photo of two people walking in opposite directions on a quiet street at night, relationship betrayal mood'
    ][slot % 4];
  }
  if (/PUA|控制|操控|打壓|冷暴力|渣男|紅旗|警號/.test(text)) {
    return [
      'a real photo of a person sitting at the edge of a bed holding a phone, uneasy relationship boundary mood, soft shadow',
      'a real photo of a couple in a quiet kitchen after a tense conversation, one person withdrawn, documentary style',
      'a real photo of a woman looking thoughtful in a cafe window reflection, self-protection and relationship red flag mood',
      'a real photo of two people sitting apart on a sofa with emotional distance, warm but heavy atmosphere'
    ][slot % 4];
  }
  if (/安全感|不安|焦慮|內耗|委屈|情緒|治癒|自信|放低|低落/.test(text)) {
    return [
      'a real photo of a woman journaling by a window in warm morning light, emotional healing after relationship stress',
      'a real photo of someone holding a warm mug beside a phone, calm self-reflection mood, no readable text',
      'a real candid photo of a person walking alone by the harbour at dusk, healing and emotional clarity mood',
      'a real photo of a quiet bedroom with a notebook, blanket, and soft lamp, relationship recovery mood'
    ][slot % 4];
  }
  if (/道歉|吵架|嗌交|冷戰|誤會|修補|和好|爭執/.test(text)) {
    return [
      'a real candid photo of a couple talking softly across a small cafe table after an argument, hands near cups',
      'a real photo of two people sitting on a sofa after a difficult conversation, one gently reaching out',
      'a real photo of a dining table after dinner with two people having a calm reconciliation talk, warm home light',
      'a real photo of a couple walking slowly together after resolving tension, evening street light'
    ][slot % 4];
  }
  if (/結婚|同居|見家長|長期|承諾|未來|穩定/.test(text)) {
    return [
      'a real photo of a couple cooking together in a small warm kitchen, long-term relationship everyday intimacy',
      'a real candid photo of two people organizing a cozy home shelf together, stable partnership mood',
      'a real photo of a couple sitting at a dining table with family dinner atmosphere, no identifiable faces in background',
      'a real photo of two hands placing keys beside a small plant on a home table, commitment and shared life mood'
    ][slot % 4];
  }
  if (/分手|失戀|放低|前任|復合|挽回|斷聯|block|冷淡/.test(text)) {
    return [
      'a real candid photo of a couple standing apart on a quiet city street at dusk, emotional distance, warm film grain',
      'a real photo of a young woman alone by a window holding a phone, late night heartbreak mood, soft warm interior light',
      'a real photo of a couple sitting across a cafe table after a difficult conversation, subtle tension, natural documentary style',
      'a real photo of an unsent message on a phone beside old instant photos, breakup and reconciliation mood, no readable text'
    ][slot % 4];
  }
  if (/溝通|訊息|說話|講嘢|道歉|冷戰|分享|勸/.test(text)) {
    return [
      'a real candid photo of a couple having a sincere conversation at a small cafe table, hands near cups, gentle daylight',
      'a real close-up photo of a phone on a bed with a blurred unread message glow, soft bedroom light, no readable text',
      'a real photo of a couple sitting on a sofa talking calmly after an argument, warm home atmosphere',
      'a real photo of two people sitting quietly at a dining table after a disagreement, one reaching gently toward the other'
    ][slot % 4];
  }
  if (/曖昧|約會|單身|桃花|吸引|主動|追求/.test(text)) {
    return [
      'a real candid photo of two people on an early date walking through a softly lit city street, shy romantic tension',
      'a real photo of two people sitting side by side at a coffee shop, almost touching hands, ambiguous relationship mood',
      'a real photo of a woman getting ready before a date, mirror reflection, soft warm light, confident romantic mood',
      'a real photo of a quiet first-date table with two drinks and hands near each other, gentle anticipation'
    ][slot % 4];
  }
  if (/出軌|第三者|變心|新歡|欺騙|操控|PUA|渣男|危機/.test(text)) {
    return [
      'a real photo of a tense couple in a dim apartment, one person looking away while the other holds a phone',
      'a real photo of a woman sitting alone on a bed after discovering a painful message, moody soft light, documentary style',
      'a real photo of a couple walking in opposite directions under street lights, emotional distance',
      'a real photo of a phone face down on a table between two silent people, trust crisis mood, no readable text'
    ][slot % 4];
  }
  return [
    'a real warm couple portrait during golden hour, intimate but tasteful, natural lifestyle photography',
    'a real photo of a couple sitting together quietly near a window, peaceful relationship reflection, soft film photography',
    'a real photo of two people walking side by side in a park at sunset, gentle romantic relationship mood',
    'a real photo of a couple sharing a quiet moment at home, warm light, thoughtful relationship mood'
  ][slot % 4];
};

const buildImagePrompt = (article, slot, kind) => {
  const scene = photoScenarioFor(article.title, article.category, slot);
  return [
    'Use case: photorealistic relationship website photo',
    `Asset type: ${kind === 'cover' ? 'website listing cover photo and hero photo' : 'inline website photo'}`,
    `Primary request: ${scene}`,
    'Style/medium: single photorealistic lifestyle camera photo, modern relationship magazine mood, not illustration, not vector, not cartoon',
    'Composition/framing: horizontal 16:9, natural negative space, one continuous camera scene only',
    'Lighting/mood: warm, emotional, cinematic but realistic, Hong Kong / Asian editorial sensibility without showing identifiable public figures',
    `Relationship theme to match: ${article.title}`,
    `Mood category: ${article.category}`,
    'Hard constraints: no text, no typography, no poster, no infographic, no chart, no diagram, no panels, no UI mockup, no captions, no logo, no watermark',
    'Avoid: readable words, educational graphics, school or grammar content, daily routine schedules, parent-child family scenes, children, father routine, hands with distorted fingers, overly stock-photo smiles, explicit sexual content'
  ].join('\\n');
};

fs.mkdirSync(path.dirname(outFile), { recursive: true });
const imagePromptRows = [];
const customImageMap = getCustomImageMap();
const pexelsArticleImageMap = getPexelsArticleImageMap();

const { order, titles } = parseIndex();
const webReadyTitleMap = buildWebReadyTitleMap();
const webReadyRawMap = buildWebReadyRawMap();
const excludedFiles = new Set([
  'When Love Feels Like Control How to Care Without P 2995833d12b680b7a886e7bc5dc9d891.md'
]);
const allMdFiles = fs
  .readdirSync(sourceDir)
  .filter((file) => file.endsWith('.md') && file !== '_INDEX.md' && !excludedFiles.has(file));
const orderedFiles = [...order.filter((file) => allMdFiles.includes(file)), ...allMdFiles.filter((file) => !order.includes(file)).sort()];

const articles = orderedFiles.map((file, index) => {
  const raw = fs.readFileSync(path.join(sourceDir, file), 'utf8');
  const idKey = file.match(/^(\d+)/)?.[1] || String(index + 1).padStart(3, '0');
  const rawForContent = raw;
  const [frontmatter, body] = parseFrontmatter(rawForContent);
  const h1 = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const titleSource = articleTitleOverrides.get(idKey) || webReadyTitleMap.get(idKey) || frontmatter.seo_title || frontmatter.title || titles.get(file) || h1 || file.replace(/\.md$/, '');
  const title = cleanSeoDisplayTitle(titleSource);
  const category = inferCategory(title, frontmatter.category);
  const cleaned = specificArticleMarkdown(idKey) || repairGeneratedArticleMarkdown(polishSpecificArticleMarkdown(`${idKey} ${title}`, cleanMarkdown(body, title)));
  const preliminaryContent = markdownToHtml(cleaned);
  const summary = articleSummaryOverrides.get(idKey) || makeSummary({ frontmatter, preliminaryContent, title, category });
  const bodyMarkdown = removeDuplicateIntro(cleaned, summary);
  const bodyLength = markdownPlainLength(bodyMarkdown);
  const safeBodyMarkdown = bodyLength < 40
    ? buildFallbackBodyMarkdown({ title, category, summary })
    : bodyLength < 520
      ? bodyMarkdown
      : bodyMarkdown;
  const articleMarkdown = [
    safeBodyMarkdown,
    buildArticleFaqMarkdown({ title, category, summary })
  ].filter(Boolean).join('\n\n');
  const baseHtml = removeDuplicateSummaryHtml(markdownToHtml(articleMarkdown), summary);
  const repairedHtml = repairDialogueRunsHtml(
    repairTipsSectionsHtml(
      repairFactCheckSectionsHtml(
        repairSelfTestSectionsHtml(
          repairInlineChecklistCueHtml(
            repairChecklistSectionsHtml(
              repairPairedChecklistSectionsHtml(
                repairRepeatedHeadingSectionsHtml(
                  repairBareNumberedHeadingsHtml(
                    repairGenericNumberedHeadingsHtml(repairFinalArticleHtml(baseHtml))
                  )
                )
              )
            )
          )
        )
      )
    )
  );
  let transformedHtml = guaranteeHighlightHtml(repairedHtml);
  transformedHtml = repairRemainingAdjacentHeadingsHtml(transformedHtml);
  transformedHtml = stripHighlightQuoteMarksHtml(transformedHtml);
  transformedHtml = repairFragmentParagraphRunsHtml(transformedHtml);
  transformedHtml = repairResidualTinyParagraphsHtml(transformedHtml);
  transformedHtml = repairHiddenNumberedPointsHtml(transformedHtml);
  transformedHtml = repairCompareBlocksHtml(transformedHtml);
  transformedHtml = repairLabelCardRunsHtml(transformedHtml);
  transformedHtml = repairChoiceComparisonHtml(transformedHtml);
  transformedHtml = repairBigManComparisonHtml(transformedHtml);
  transformedHtml = repairPhaseCardsHtml(transformedHtml);
  transformedHtml = repairConceptCardsHtml(transformedHtml);
  transformedHtml = repairInlineStepCardsHtml(transformedHtml);
  transformedHtml = repairSectionCardsHtml(transformedHtml);
  transformedHtml = repairLoveStageTimelineHtml(transformedHtml);
  transformedHtml = repairAttachmentActionCardsHtml(transformedHtml);
  transformedHtml = repairFinalTypographyHtml(transformedHtml);
  transformedHtml = repairNormalAbnormalGivingHtml(transformedHtml);
  transformedHtml = reduceLongSectionCardsHtml(transformedHtml);
  transformedHtml = repairDuplicateSectionHeadingsHtml(transformedHtml);
  transformedHtml = repairThinArticleDepthHtml(transformedHtml, { title, category });
  transformedHtml = repairHighlightAgainstUiHtml(transformedHtml);
  transformedHtml = rebuildHighlightFromArticleHtml(transformedHtml);
  let content = removeRepeatedParagraphsHtml(stripGeneratedDepthSectionsHtml(replaceGenericDepthHtml(removeAdjacentDuplicateParagraphsHtml(repairCaptionCtaHtml(repairCaptionParagraphRunsHtml(repairPossessivenessSelfTestHtml(compactHighlightItemsHtml(repairCaptionCtaHtml(repairHtmlNoise(personalizeReminderHtml(
    moveHighlightBeforeReminderHtml(
      transformedHtml
    ),
    { title, category }
  )))))))), { title, category })));
  content = moveHighlightBeforeReminderHtml(guaranteeHighlightHtml(rebuildHighlightFromArticleHtml(content)));
  if (/拆解 4 大情緒勒索金句/.test(content)) {
    content = content.replace(
      /<ul class="article-highlight-list">[\s\S]*?<\/ul>/,
      '<ul class="article-highlight-list"><li>情緒勒索會用愛、內疚或離開威脅你順從。</li><li>愛一個人不等於每件事都要答應，你仍然可以保留界線。</li><li>真正健康的關係會尊重你的拒絕和界線。</li></ul>'
    );
  }
  if (idKey === '004') {
    content = content.replace(
      /<h2>大男人 vs 恐怖情人<\/h2>[\s\S]*?(?=<h2>Asteria 感情拯救所話你知<\/h2>)/,
      `<h2>大男人 vs 恐怖情人</h2>
<div class="article-choice-compare article-choice-table"><div class="article-choice-head"><span>比較位</span><span>大男人</span><span>恐怖情人</span></div><div class="article-choice-row"><span>干涉交友</span><p>建議你不要經常和異性單獨出街。</p><p>監控你有沒有和異性出街，甚至一次都不容許。</p></div><div class="article-choice-row"><span>情緒表現</span><p>可能有控制慾，但仍然會體貼另一半。</p><p>控制慾很強、自信不足、情緒反覆起伏大，甚至會威脅你。</p></div><div class="article-choice-row"><span>強勢特徵</span><p>希望另一半在人前順從他、給他面子。</p><p>要求另一半不論人前人後都要絕對服從。</p></div></div>
<h2>面對恐怖情人，但自己唔捨得分手？</h2>
<p>大家可以靜落嚟，認真想一想：拍拖本來是為了尋求幸福和安全感，不是為了長期生活在恐懼、妥協和自我懷疑之中。</p>
<p>如果另一半不但給不到你快樂，還令你不斷違背自己意願、角色變得不對等，甚至每次爭執都用威脅來達到目的，你就要認真問自己：這段關係是否仍然值得繼續？</p>`
    );
    content = content.replace(
      /<h2 class="article-highlight-title">重點速讀<\/h2>\s*<ul class="article-highlight-list">[\s\S]*?<\/ul>/,
      '<h2 class="article-highlight-title">重點速讀</h2>\n<ul class="article-highlight-list"><li>控制慾強烈：由愛變成監控，會令你的私人空間越來越少。</li><li>慣性貶低另一半：長期羞辱和否定，會削弱你的自信和界線。</li><li>永遠覺得自己是受害者：每次爭執都把責任推回你身上，問題永遠無法處理。</li><li>監控交友和私人空間：限制正常社交，不是吃醋，而是控制。</li><li>要求絕對服從：如果你因為害怕對方反應而妥協，關係已經出現危險訊號。</li></ul>'
    );
  }
  content = content
    .replace(/<h2 class="article-highlight-title">重點速讀<\/h2>\s*(?=<h2 class="article-highlight-title">重點速讀<\/h2>)/g, '')
    .replace(/<h2 class="article-highlight-title">重點速讀<\/h2>\s*(?=<h2>Asteria 小提醒<\/h2>)/g, '');
  if (idKey === '119') {
    content = content.replace(
      /(<p>修復最怕變成審判大會。[\s\S]*?這樣比一直重播錯誤更有用。)\s*(信任不是一句對不起就回來[\s\S]*?裂痕反而可以成為關係升級的位置。<\/p>)/,
      '$1</p>\n<h2 class="article-numbered-heading"><span class="article-numbered-heading__badge">第 3 點</span><span>用新行動重建信任</span></h2>\n<p>$2'
    );
  }
  if (syncWebReady) {
    const webReadyFile = file.replace(/-SEO-AEO\.md$/i, '-WEB-READY.md');
    fs.writeFileSync(
      path.join(webReadyDir, webReadyFile),
      buildSyncedWebReadyMarkdown({ raw, title, content })
    );
  }
  const id = index + 1;
  const imageLabel = imageLabelFor(title, category);
  const fallbackImages = editorialImagesFor({ id, title, category });
  const pexelsArticleImages = pexelsArticleImageMap.get(id) || [];
  const editorialImages = pexelsArticleImages.length
    ? [0, 1, 2, 3].map((slot) => ensureExistingImage(pexelsArticleImages[slot] || fallbackImages[slot], slot))
    : fallbackImages.map((image, slot) => ensureExistingImage(image, slot));
  const coverImage = editorialImages[0];
  const inlineImages = editorialImages.slice(1);
  const article = {
    id,
    title,
    category,
    color: colors[index % colors.length],
    icon: icons[index % icons.length],
    imageLabel,
    summary,
    content,
    sourceIg: frontmatter.source_ig || '',
    date: frontmatter.date || '',
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    coverImage: coverImage.src,
    coverCredit: coverImage.credit,
    coverCreditUrl: coverImage.creditUrl,
    coverPrompt: coverImage.prompt,
    images: inlineImages,
    coverCaption: `Asteria 相處教學：${title}`,
    inlineCaption: `關係不只是答案，還需要一步一步看清楚相處方法。`
  };
  [coverImage, ...inlineImages].forEach((image, slot) => {
    imagePromptRows.push(JSON.stringify({
      articleId: id,
      slot,
      title,
      category,
      output: image.src,
      credit: image.credit,
      creditUrl: image.creditUrl,
      prompt: buildImagePrompt({ id, title, category }, slot, slot === 0 ? 'cover' : 'inline')
    }));
  });
  return article;
});

const ts = `export type TeachingPost = {
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

export const teachingPosts: TeachingPost[] = ${JSON.stringify(articles, null, 2)};
`;

fs.writeFileSync(outFile, ts);
fs.writeFileSync(promptsFile, `${imagePromptRows.join('\n')}\n`);

const baseUrls = [
  '/',
  '/teaching/',
  '/services/',
  '/about/',
  '/cases/',
  '/reviews/',
  ...articles.map((article) => `/articles/${article.id}/`)
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${baseUrls.map((url) => `  <url>
    <loc>https://asteria-tarot.com${url}</loc>
    <changefreq>${url.startsWith('/articles/') ? 'monthly' : 'weekly'}</changefreq>
    <priority>${url === '/' ? '1.0' : url.startsWith('/articles/') ? '0.7' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(sitemapFile, sitemap);

console.log(`Imported ${articles.length} articles.`);
