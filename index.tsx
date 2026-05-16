import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  getCurrentAccount,
  getMySpace,
  getSignedImageMap,
  isBackendConfigured,
  listStaffInbox,
  loginWithUsername,
  sendMyMessage,
  signOutSpace,
  staffCreateAccount,
  staffDeleteAccount,
  staffSendMessage,
  staffResetPassword,
  upsertMyProfile,
  uploadSpaceImages
} from './lib/asteriaSpaceClient';

// --- Components ---

const LOGO_SRC = "/asteria-logo.jpg";
const WHATSAPP_URL = "https://wa.me/85259413688";
const TELEGRAM_URL = "";
const FACEBOOK_URL = "https://www.facebook.com/share/p/1aAk2CJBt8/";

const clearSpaceSession = async () => {
  await signOutSpace();
  window.localStorage.removeItem('asteriaCurrentRole');
  window.localStorage.removeItem('asteriaCurrentUsername');
  window.localStorage.removeItem('asteriaCurrentEmail');
  window.localStorage.removeItem('asteriaCurrentCustomerId');
  window.location.hash = '#register';
  window.dispatchEvent(new Event('asteria-session-change'));
};

const Navbar = () => {
  const role = window.localStorage.getItem('asteriaCurrentRole') as 'customer' | 'staff' | null;
  const spaceHref = role === 'staff' ? '#inbox' : role === 'customer' ? '#portal' : '#register';
  const spaceLabel = role === 'staff' ? 'Staff Inbox' : role === 'customer' ? '我的 Space' : 'Asteria Space';

  return (
    <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-asteria-cream/30 shadow-sm transition-all">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <a href="#home" className="flex items-center gap-2">
          <img src={LOGO_SRC} className="w-12 h-12 rounded-full shadow-sm border border-asteria-cream/20 logo-img bg-white p-0.5" alt="Asteria logo" />
          <div className="text-lg md:text-xl font-bold text-gray-700 tracking-wide font-eng">
            ASTERIA <span className="text-asteria-primary text-sm hidden md:inline">感情拯救所</span>
          </div>
        </a>
        <div className="flex gap-2 md:gap-5 text-sm md:text-base font-medium text-gray-600 items-center">
          <a href="#oracle" className="hover:text-asteria-primary transition-colors hidden md:inline-block"><i className="fa-solid fa-star text-xs"></i> 每日指引</a>
          <a href="#teaching" className="hover:text-asteria-primary transition-colors hidden md:inline-block">相處教學</a>
          <a href="#services" className="hover:text-asteria-primary transition-colors hidden md:inline-block">服務</a>
          <a href="#reviews" className="hover:text-asteria-primary transition-colors hidden lg:inline-block">好評</a>
          <a href={spaceHref} className="border border-asteria-cream bg-white text-asteria-primary px-3 py-1.5 rounded-full text-sm font-bold hover:border-asteria-primary transition-all flex items-center gap-1">
            <i className="fa-regular fa-user"></i> <span>{spaceLabel}</span>
          </a>
          {role && (
            <button onClick={clearSpaceSession} className="border border-red-100 bg-white text-red-500 px-3 py-1.5 rounded-full text-sm font-bold hover:bg-red-50 transition-all">
              登出
            </button>
          )}
          <a href={WHATSAPP_URL} target="_blank" className="bg-gradient-to-r from-green-400 to-green-500 text-white px-4 py-1.5 rounded-full text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all hidden sm:flex items-center gap-1">
            <i className="fa-brands fa-whatsapp"></i> <span className="hidden md:inline">預約</span>
          </a>
        </div>
      </div>
      <div className="bg-asteria-dark text-white">
        <div className="container mx-auto px-4 py-2 flex flex-col md:flex-row md:items-center md:justify-center gap-2 md:gap-4 text-xs md:text-sm text-center">
          <span className="font-bold">IG帳號暫停通知</span>
          <span className="text-white/80">請用 WhatsApp / Facebook / Telegram 聯絡我地：</span>
          <a href={WHATSAPP_URL} target="_blank" className="inline-flex items-center justify-center gap-1 bg-[#25D366] text-white px-3 py-1 rounded-full font-bold">
            <i className="fa-brands fa-whatsapp"></i> WhatsApp 5941 3688
          </a>
          <a href={FACEBOOK_URL} target="_blank" className="inline-flex items-center justify-center gap-1 bg-[#1877F2] text-white px-3 py-1 rounded-full font-bold">
            <i className="fa-brands fa-facebook-f"></i> Facebook
          </a>
          <span className="inline-flex items-center justify-center gap-1 bg-white/12 border border-white/20 px-3 py-1 rounded-full font-bold">
            <i className="fa-brands fa-telegram"></i> Telegram 待公布
          </span>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => (
  <section className="relative pt-56 md:pt-40 pb-16 overflow-hidden bg-[#FFF7EA] border-b border-asteria-cream/70">
    <div className="absolute inset-0 pointer-events-none opacity-70 bg-[linear-gradient(90deg,rgba(248,222,154,0.26)_1px,transparent_1px),linear-gradient(rgba(248,222,154,0.22)_1px,transparent_1px)] bg-[size:34px_34px]"></div>

    <div className="container mx-auto px-6 relative z-10">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr] items-center gap-10 lg:gap-16">
        <div className="text-center lg:text-left animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/80 border border-asteria-yellow/70 px-4 py-2 rounded-full text-asteria-primary text-sm font-bold mb-6 shadow-sm">
            <i className="fa-solid fa-star text-amber-500 text-xs"></i>
            Since 2019 · 西班牙儀式與塔羅分析
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-asteria-dark leading-tight tracking-tight">
            Asteria
            <span className="block text-2xl md:text-4xl mt-3 text-asteria-primary">
              你的感情由你話事！
            </span>
          </h1>

          <p className="text-lg text-stone-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
            所有感情煩惱一律建議搵我地。復合、斷聯、曖昧、第三者與關係卡住的個案，
            我們會配合塔羅分析與儀式方向，幫你看清下一步。
          </p>

          <div className="bg-white border border-asteria-yellow/70 rounded-2xl p-5 mb-8 shadow-sm max-w-xl mx-auto lg:mx-0 text-left">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-asteria-yellow/35 text-asteria-primary flex items-center justify-center shrink-0">
                <i className="fa-solid fa-bullhorn"></i>
              </div>
              <div>
                <div className="font-bold text-asteria-dark mb-1">IG帳號暫停通知</div>
                <p className="text-sm text-stone-500 leading-relaxed mb-4">
                  我地 Instagram 主帳及 backup 帳號暫時未能使用。如你之前只係用 IG 搵我地，請即刻用以下方法重新聯絡，避免之後失聯。
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href={WHATSAPP_URL} target="_blank" className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-xl font-bold hover:brightness-95 transition-all">
                    <i className="fa-brands fa-whatsapp"></i> WhatsApp 5941 3688
                  </a>
                  <a href={FACEBOOK_URL} target="_blank" className="inline-flex items-center justify-center gap-2 bg-[#1877F2] text-white px-5 py-3 rounded-xl font-bold hover:brightness-95 transition-all">
                    <i className="fa-brands fa-facebook-f"></i> Facebook
                  </a>
                  <span className="inline-flex items-center justify-center gap-2 bg-asteria-blue/40 text-asteria-dark border border-asteria-blue px-5 py-3 rounded-xl font-bold">
                    <i className="fa-brands fa-telegram"></i> Telegram 待公布
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#FFF8EC] border border-asteria-cream rounded-2xl p-5 mb-8 shadow-sm max-w-xl mx-auto lg:mx-0 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div>
                <div className="font-bold text-asteria-dark mb-1">請留低你的聯絡資料</div>
                <p className="text-sm text-stone-500 leading-relaxed">
                  WhatsApp 照樣即時傾；Asteria Space 用嚟保存重要訊息、截圖同後備聯絡方法。
                </p>
              </div>
              <a href="#register" className="bg-asteria-dark text-white px-5 py-3 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all shrink-0">
                <i className="fa-regular fa-user"></i> 登入 Space
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <a href="#register" className="bg-asteria-dark text-white px-8 py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all">
              <i className="fa-regular fa-address-card"></i> 留資料 / 登入 Space
            </a>
            <a href="#services" className="btn-primary px-8 py-4 rounded-xl font-bold shadow-lg shadow-amber-200 flex items-center justify-center gap-2 group">
              <i className="fa-solid fa-wand-magic-sparkles group-hover:rotate-12 transition-transform"></i> 查看儀式分類
            </a>
            <a href="#oracle" className="bg-white text-asteria-primary border-2 border-asteria-yellow/70 px-8 py-4 rounded-xl font-bold hover:bg-asteria-yellow/20 transition-all flex items-center justify-center gap-2">
              <i className="fa-solid fa-star"></i> 今日指引
            </a>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto lg:mx-0 text-left">
            {[
              ["11,000+", "累積個案"],
              ["私隱", "一對一跟進"],
              ["分類", "快速找方向"]
            ].map(([num, label]) => (
              <div key={label} className="bg-white/75 border border-asteria-cream/70 rounded-xl px-4 py-3 shadow-sm">
                <div className="text-asteria-primary font-bold text-lg">{num}</div>
                <div className="text-stone-500 text-xs">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-md bg-white border border-asteria-cream rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex items-center gap-4 border-b border-asteria-cream/70 pb-5 mb-5">
              <img src={LOGO_SRC} className="w-24 h-24 rounded-2xl border border-asteria-yellow/70 bg-white object-contain shadow-sm" alt="Asteria logo" />
              <div>
                <div className="font-eng text-2xl font-bold text-asteria-dark">Asteria</div>
                <div className="text-sm text-stone-500 tracking-wide">Crystal Tarot</div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-full">
                  <i className="fa-solid fa-heart text-rose-400"></i> warm magic, soft guidance
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-[#FFF8EC] border border-asteria-cream/70 rounded-xl p-4 text-sm text-stone-600 leading-relaxed">
                「你而家最需要未必係追問答案，而係知道下一步點樣做先唔會再消耗自己。」
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-asteria-primary">
                <div className="bg-asteria-yellow/35 rounded-xl py-3">復合</div>
                <div className="bg-asteria-pink/35 rounded-xl py-3">破冰</div>
                <div className="bg-asteria-blue/35 rounded-xl py-3">清理</div>
              </div>
              <a href={WHATSAPP_URL} target="_blank" className="w-full bg-[#25D366] text-white py-3 rounded-xl font-bold hover:brightness-95 transition-all flex items-center justify-center gap-2">
                <i className="fa-brands fa-whatsapp"></i> WhatsApp 查詢
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Oracle = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'topic' | 'drawing' | 'result'>('topic');
  const [topic, setTopic] = useState('');
  const [reading, setReading] = useState<{ 
    type: string; 
    card_name: string; 
    keywords: string[];
    analysis: string;
    advice: string;
    icon: string 
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const topics = [
    { id: 'love_conflict', label: '💔 伴侶冷淡/爭吵', icon: 'fa-regular fa-snowflake' },
    { id: 'breakup', label: '🥀 分手/想復合', icon: 'fa-solid fa-heart-crack' },
    { id: 'crush', label: '💌 暗戀/曖昧中', icon: 'fa-regular fa-paper-plane' },
    { id: 'self', label: '🌱 個人成長/迷惘', icon: 'fa-solid fa-seedling' },
  ];

  // Vastly expanded fallback readings to ensure variety (78 cards simulation)
  const fallbackReadings = [
    {
        type: "Tarot", card_name: "The Fool 愚者", keywords: ["新開始", "冒險", "天真"],
        analysis: "一段全新的旅程即將展開，你需要放下過去的包袱。", advice: "勇敢踏出第一步，別想太多。", icon: "fa-solid fa-child-reaching"
    },
    {
        type: "Tarot", card_name: "The Magician 魔術師", keywords: ["創造", "主動", "溝通"],
        analysis: "你擁有改變現狀所需的所有資源和能力。", advice: "主動出擊，現在是展現魅力的好時機。", icon: "fa-solid fa-wand-sparkles"
    },
    {
        type: "Tarot", card_name: "High Priestess 女祭司", keywords: ["直覺", "等待", "神秘"],
        analysis: "表面平靜，但內心波濤洶湧，這件事不能只看表面。", advice: "相信你的第六感，答案在你的夢境或直覺中。", icon: "fa-solid fa-moon"
    },
    {
        type: "Tarot", card_name: "The Empress 皇后", keywords: ["豐盛", "魅力", "母性"],
        analysis: "你正散發著迷人的魅力，這是一段充滿愛與美的時期。", advice: "對自己好一點，自信就是最強的吸引力。", icon: "fa-solid fa-crown"
    },
    {
        type: "Tarot", card_name: "The Emperor 皇帝", keywords: ["穩定", "控制", "責任"],
        analysis: "這段關係或情況需要更多的穩定性與承諾。", advice: "設定界線，展現你成熟理性的一面。", icon: "fa-solid fa-chess-king"
    },
    {
        type: "Tarot", card_name: "The Lovers 戀人", keywords: ["選擇", "結合", "熱情"],
        analysis: "一個關於愛的重要決定出現在你面前，吸引力極強。", advice: "跟隨你的心，但不要忽略現實的溝通。", icon: "fa-solid fa-heart"
    },
    {
        type: "Tarot", card_name: "Strength 力量", keywords: ["勇氣", "包容", "以柔克剛"],
        analysis: "真正的力量不是強硬，而是溫柔的堅持。", advice: "用耐心和愛去化解這場矛盾。", icon: "fa-solid fa-hand-holding-heart"
    },
    {
        type: "Tarot", card_name: "The Hermit 隱士", keywords: ["反省", "獨處", "尋找"],
        analysis: "暫時的獨處不是壞事，你需要時間釐清內心想法。", advice: "與其向外求，不如向內看。", icon: "fa-solid fa-lantern"
    },
    {
        type: "Tarot", card_name: "Wheel of Fortune 命運之輪", keywords: ["轉機", "宿命", "改變"],
        analysis: "命運的齒輪開始轉動，不可抗拒的改變即將到來。", advice: "順勢而為，不要抗拒改變。", icon: "fa-solid fa-spin fa-circle-notch"
    },
    {
        type: "Tarot", card_name: "Justice 正義", keywords: ["公平", "因果", "真相"],
        analysis: "種什麼因得什麼果，這件事會得到公正的裁決。", advice: "保持誠實和理性，真相會浮出水面。", icon: "fa-solid fa-scale-balanced"
    },
    {
        type: "Tarot", card_name: "The Hanged Man 倒吊人", keywords: ["犧牲", "換位思考", "停滯"],
        analysis: "現在不是行動的時機，事情似乎陷入了膠著。", advice: "換個角度看世界，有時候退一步海闊天空。", icon: "fa-solid fa-person-falling"
    },
    {
        type: "Tarot", card_name: "Death 死神", keywords: ["結束", "重生", "斷捨離"],
        analysis: "舊的模式必須結束，新的機會才能進來。", advice: "不要害怕放手，這是一個重生的機會。", icon: "fa-solid fa-skull"
    },
    {
        type: "Tarot", card_name: "Temperance 節制", keywords: ["平衡", "溝通", "療癒"],
        analysis: "需要耐心調和的一段時期，不要操之過急。", advice: "尋找雙方的平衡點，過與不及都不好。", icon: "fa-solid fa-glass-water"
    },
    {
        type: "Tarot", card_name: "The Devil 惡魔", keywords: ["執著", "誘惑", "束縛"],
        analysis: "你可能太過執著於某人或某種感覺，讓你失去了自由。", advice: "問問自己，這份執著是愛還是恐懼？", icon: "fa-solid fa-link"
    },
    {
        type: "Tarot", card_name: "The Tower 高塔", keywords: ["突變", "覺醒", "衝擊"],
        analysis: "突如其來的改變可能會讓你措手不及，但這是為了打破虛假。", advice: "接受混亂，這是重建地基的開始。", icon: "fa-solid fa-bolt"
    },
    {
        type: "Tarot", card_name: "The Star 星星", keywords: ["希望", "療癒", "願景"],
        analysis: "黑暗之後總有星光，這是一張充滿希望的牌。", advice: "保持信念，宇宙正在回應你的願望。", icon: "fa-solid fa-star"
    },
    {
        type: "Tarot", card_name: "The Moon 月亮", keywords: ["不安", "潛意識", "模糊"],
        analysis: "事情還有隱藏的一面未被看清，讓你感到不安。", advice: "不要在情緒激動時做決定，等待迷霧散去。", icon: "fa-solid fa-cloud-moon"
    },
    {
        type: "Tarot", card_name: "The Sun 太陽", keywords: ["成功", "快樂", "明朗"],
        analysis: "陰霾散去，這是一張象徵快樂和成功的超級吉牌。", advice: "展現你陽光的一面，好運自然來。", icon: "fa-regular fa-sun"
    },
    {
        type: "Tarot", card_name: "Judgement 審判", keywords: ["召喚", "復合", "覺醒"],
        analysis: "過去的人事物可能會回歸，或者你會收到重要的消息。", advice: "這是一個第二次機會，請慎重把握。", icon: "fa-solid fa-bullhorn"
    },
    {
        type: "Tarot", card_name: "The World 世界", keywords: ["圓滿", "達成", "旅行"],
        analysis: "一個階段的完美結束，你已經學會了該學的課題。", advice: "享受當下，你值得擁有這份圓滿。", icon: "fa-solid fa-earth-asia"
    },
    {
        type: "Tarot", card_name: "Ace of Cups 聖杯一", keywords: ["新戀情", "情感滿溢", "直覺"],
        analysis: "新的情感機會正在萌芽，你的心將再次被填滿。", advice: "打開心扉，接受愛的流動。", icon: "fa-solid fa-wine-glass"
    },
    {
        type: "Tarot", card_name: "Two of Cups 聖杯二", keywords: ["靈魂伴侶", "合作", "平等"],
        analysis: "這是一段互相吸引、心靈相通的關係。", advice: "真誠地交流，你們是平等的夥伴。", icon: "fa-solid fa-handshake"
    },
    {
        type: "Tarot", card_name: "Three of Swords 寶劍三", keywords: ["心碎", "悲傷", "釋放"],
        analysis: "有些話傷了你的心，痛苦需要被釋放而不是壓抑。", advice: "哭出來沒關係，這是療癒必經的過程。", icon: "fa-solid fa-heart-crack"
    },
    {
        type: "Tarot", card_name: "Six of Wands 權杖六", keywords: ["勝利", "自信", "認同"],
        analysis: "你將獲得勝利和他人的認同，自信回歸。", advice: "相信自己的價值，你是值得被看見的。", icon: "fa-solid fa-trophy"
    },
    {
        type: "Tarot", card_name: "Ace of Pentacles 錢幣一", keywords: ["承諾", "禮物", "實際"],
        analysis: "一個實際的機會或禮物即將到來，基礎穩固。", advice: "腳踏實地，把愛落實到生活中。", icon: "fa-solid fa-coins"
    }
  ];

  const handleTopicSelect = (selectedTopic: string) => {
    setTopic(selectedTopic);
    setStep('drawing');
    setLoading(true);
    setError(null);
    setReading(null);

    // Keep this public page self-contained. AI summaries for members should run server-side.
    setTimeout(() => {
        getReading(selectedTopic);
    }, 1500);
  };

  const getReading = (_selectedTopic: string) => {
    try {
      useFallback();
    } catch (err) {
      console.error("Oracle error:", err);
      useFallback();
    } finally {
      setLoading(false);
    }
  };

  const useFallback = () => {
      // Improved randomness for fallback
      const randomIndex = Math.floor(Math.random() * fallbackReadings.length);
      const random = fallbackReadings[randomIndex];
      console.log("Using Fallback Card:", random.card_name);
      setReading(random);
      setStep('result');
  };

  const resetOracle = () => {
    setStep('topic');
    setReading(null);
    setTopic('');
    setError(null);
  };

  return (
    <section id="oracle" className="py-20 bg-gradient-to-b from-white via-asteria-cream/10 to-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none"></div>
      
      <div className="container mx-auto px-6 text-center max-w-4xl relative z-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🔮 宇宙解憂信箱</h2>
        <p className="text-gray-500 mb-10">心裡想著那個讓你困擾的人或事，領取今天的宇宙暗示...</p>

        <div className="glass-card rounded-3xl p-8 md:p-12 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 shadow-2xl bg-white/50">
          
          {error && (
            <div className="absolute top-4 left-0 w-full px-4 z-50 animate-fade-in-up">
                <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm shadow-sm inline-block">
                    <i className="fa-solid fa-circle-exclamation mr-1"></i> {error}
                </div>
            </div>
          )}

          {/* Step 1: Select Topic */}
          {step === 'topic' && (
            <div className="w-full animate-fade-in">
              <h3 className="text-xl font-bold text-gray-700 mb-8">你現在最煩惱的是什麼？</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {topics.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTopicSelect(t.id)}
                    disabled={loading}
                    className="group flex items-center p-4 bg-white/60 border border-white hover:border-asteria-primary/50 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-12 h-12 bg-asteria-cream/20 text-asteria-primary rounded-full flex items-center justify-center text-xl mr-4 group-hover:scale-110 transition-transform">
                      <i className={t.icon}></i>
                    </div>
                    <span className="font-bold text-gray-700 group-hover:text-asteria-primary transition-colors">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Drawing Animation */}
          {step === 'drawing' && (
            <div className="flex flex-col items-center justify-center animate-fade-in py-10">
              <div className="relative w-32 h-48 mb-8">
                <div className="absolute inset-0 bg-gradient-to-tr from-asteria-primary to-asteria-yellow rounded-xl border-4 border-white shadow-xl animate-ping opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-asteria-primary to-asteria-yellow rounded-xl border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                   <i className="fa-solid fa-star-of-david text-4xl text-white animate-spin-slow"></i>
                </div>
              </div>
              <p className="text-asteria-primary font-bold animate-pulse text-lg">Asteria 正在連結你的能量...</p>
              <p className="text-gray-400 text-sm mt-2">請保持深呼吸，專注你的問題</p>
            </div>
          )}

          {/* Step 3: Result (Short & Teaser Style) */}
          {step === 'result' && reading && (
            <div className="w-full text-center animate-fade-in max-w-lg mx-auto flex flex-col items-center">
                {/* Card Visual - Centered */}
                <div className="w-32 h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-[4px] border-double border-yellow-200 shadow-2xl flex items-center justify-center relative overflow-hidden mb-6 group transform hover:scale-105 transition-transform duration-500">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                    <i className={`${reading.icon} text-5xl text-yellow-100 drop-shadow-[0_0_15px_rgba(253,224,71,0.6)]`}></i>
                </div>

                <h3 className="text-2xl font-bold text-gray-800 mb-2">{reading.card_name}</h3>
                
                <div className="flex gap-2 justify-center mb-6">
                     {reading.keywords.map((k, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full border border-gray-200">#{k}</span>
                    ))}
                </div>

                <div className="bg-white/80 p-6 rounded-2xl border border-asteria-cream/20 shadow-sm w-full mb-6">
                    <p className="text-lg text-gray-700 font-medium leading-relaxed mb-4">
                        <i className="fa-solid fa-quote-left text-asteria-primary/30 mr-2 text-xl"></i>
                        {reading.analysis}
                        <i className="fa-solid fa-quote-right text-asteria-primary/30 ml-2 text-xl"></i>
                    </p>
                     <p className="text-asteria-primary text-sm font-bold border-t border-dashed border-gray-200 pt-4">
                        {reading.advice}
                    </p>
                </div>

                <a href={WHATSAPP_URL} target="_blank" className="btn-primary w-full py-4 rounded-xl font-bold shadow-lg shadow-amber-200 flex items-center justify-center gap-2 text-lg animate-pulse hover:animate-none">
                    <i className="fa-brands fa-whatsapp"></i> 解鎖詳細占卜結果 (付費)
                </a>
                
                <button 
                    onClick={resetOracle}
                    className="text-gray-400 hover:text-asteria-primary text-sm mt-4 transition-colors underline decoration-dotted"
                >
                    再抽一張
                </button>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};

// --- Blog Component (New) ---
const Blog = ({ fullPage = false }: { fullPage?: boolean }) => {
    const [selectedPost, setSelectedPost] = useState<any>(null);
  
    const posts = [
      {
        id: 1,
        title: "明明只係小事，點解成日變嗌交？",
        category: "相處溝通",
        color: "bg-asteria-blue/60",
        icon: "fa-regular fa-comments",
        imageLabel: "溝通",
        summary: "拆解「情緒勒索」與「無效溝通」的惡性循環。學識這一招，讓爭吵變成了解。",
        content: `
          <h3 class="text-xl font-bold mb-4">為什麼我們總是為了小事吵架？</h3>
          <p class="mb-4">很多客人都會問我：「明明只係佢唔記得倒垃圾/遲到/講野大聲左，點解最後會搞到分手咁嚴重？」</p>
          <p class="mb-4">其實，**我們吵的往往不是事情本身，而是「態度」與「被忽視感」。**</p>
          
          <h4 class="font-bold text-lg mb-2 text-asteria-primary">1. 把「你」變成「我」</h4>
          <p class="mb-4">當對方做錯事，我們習慣說：「**你**又唔記得！**你**好自私！」這在對方聽來是攻擊。</p>
          <p class="mb-4">試著改用「我訊息」：「當我看見垃圾還在，**我**覺得好累，覺得家務都落在我身上。」</p>
          <p class="mb-4">表達你的感受，而不是審判他的人格。</p>
          
          <h4 class="font-bold text-lg mb-2 text-asteria-primary">2. 暫停鍵的重要性</h4>
          <p class="mb-4">情緒上頭時，智商為零。約定一個「暫停手勢」，當雙方都激動時，停戰 30 分鐘，各自冷靜，回來再談。</p>
          
          <p class="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
            如果你們的溝通已經去到無法對話的地步，可能是有負能量阻礙了你們的磁場。可以考慮做一個 <span class="text-asteria-primary font-bold">甜蜜升溫儀式</span> 來化解怨氣。
          </p>
        `
      },
      {
        id: 2,
        title: "對方事事挑剔，令你唔敢再表達自己？",
        category: "自我價值",
        color: "bg-asteria-yellow/50",
        icon: "fa-solid fa-person-rays",
        imageLabel: "自信",
        summary: "如何面對「挑剔型」伴侶，重建自信。你不需要變得完美才值得被愛。",
        content: `
          <h3 class="text-xl font-bold mb-4">你是女朋友，不是他的員工</h3>
          <p class="mb-4">「你著得咁醜架」、「你煮野食好難食」、「你講野好無腦」... 這些說話聽多了，你會開始懷疑自己：係咪我真係咁差？</p>
          
          <h4 class="font-bold text-lg mb-2 text-asteria-primary">挑剔背後的心理</h4>
          <p class="mb-4">挑剔往往源於對方內心的**不安全感**或**控制慾**。通過貶低你，他能獲得一種優越感和掌控感。</p>
          <p class="mb-4">記住：**他對你的批評，反映的是他的修養，而不是你的價值。**</p>
          
          <h4 class="font-bold text-lg mb-2 text-asteria-primary">溫柔而堅定地設限</h4>
          <p class="mb-4">下次他再無理挑剔，試著平靜地看著他說：「親愛的，我可以接受建議，但我不接受這種語氣。這讓我很受傷。」</p>
          <p class="mb-4">如果他愛你，他會反思。如果他變本加厲，這段關係或許需要重新審視。</p>
          
          <p class="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
            缺乏自信會讓你的氣場變弱，更容易吸引到打壓你的人。推薦佩戴 <span class="text-asteria-primary font-bold">草莓晶或粉晶</span>，或者進行 <span class="text-asteria-primary font-bold">個人魅力儀式</span> 來增強自信光環。
          </p>
        `
      },
      {
        id: 3,
        title: "點解講極分手，佢都唔驚失去我？",
        category: "挽回攻略",
        color: "bg-asteria-pink/60",
        icon: "fa-solid fa-heart-circle-exclamation",
        imageLabel: "底線",
        summary: "破解「假性分手」與「狼來了」效應。要讓對方學會珍惜，你需要的是底線。",
        content: `
          <h3 class="text-xl font-bold mb-4">別讓「分手」變成口頭禪</h3>
          <p class="mb-4">很多女生說分手，其實是想被挽留。第一次他說對不起，第二次他哄你，第十次... 他就累了，直接答應你。</p>
          
          <h4 class="font-bold text-lg mb-2 text-asteria-primary">狼來了效應</h4>
          <p class="mb-4">當你沒有真的想走，卻用離開來威脅對方，你在他潛意識裡就變得「廉價」了。他知道你離不開他，所以有恃無恐。</p>
          
          <h4 class="font-bold text-lg mb-2 text-asteria-primary">真正的底線</h4>
          <p class="mb-4">要讓他害怕失去你，不是靠嘴巴說，而是靠**行為**。專注在自己的生活，打扮得漂漂亮亮，有自己的社交圈。</p>
          <p class="mb-4">當你把注意力從他身上收回來，他才會感到慌張：「咦？她是不是不愛我了？」這時候，他的征服慾才會回來。</p>
          
           <p class="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
            如果你已經「弄假成真」被分手了，千萬不要死纏爛打。這時候最有效的是 <span class="text-asteria-primary font-bold">西班牙鎖心復合儀式</span>，在能量層面讓他主動想起你的好，消除負面印象。
          </p>
        `
      },
      {
        id: 4,
        title: "曖昧期必看！如何判斷佢係咪認真？",
        category: "脫單指南",
        color: "bg-[#FFE7DD]",
        icon: "fa-regular fa-face-kiss-wink-heart",
        imageLabel: "曖昧",
        summary: "區分「暖男」與「中央空調」。秒回不代表喜歡，細節見真章。",
        content: `
          <h3 class="text-xl font-bold mb-4">他對我是喜歡，還是釣魚？</h3>
          <p class="mb-4">曖昧讓人受盡委屈。他每天跟你早安晚安，但從來不約你見面？或者見面很親密，回家就失蹤？</p>
          
          <h4 class="font-bold text-lg mb-2 text-asteria-primary">稀缺資源法則</h4>
          <p class="mb-4">看一個男人是否認真，不要看他擁有很多的東西（例如時間多的男人秒回你不稀奇，有錢的男人請食飯不稀奇）。</p>
          <p class="mb-4">要看他願意為你付出什麼**稀缺資源**。</p>
          <ul class="list-disc pl-5 mb-4 text-gray-700">
            <li>大忙人願意抽空陪你 = 真心</li>
            <li>木訥男願意為你製造驚喜 = 真心</li>
            <li>未來規劃裡有你 = 真心</li>
          </ul>
          
          <p class="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
            想突破曖昧期，讓對方主動表白？可以嘗試 <span class="text-asteria-primary font-bold">加速顯化儀式</span>，推動緣分發展。
          </p>
        `
      }
    ];
  
    if (fullPage) {
      return (
        <main className="pt-56 md:pt-40 pb-20 bg-[#FFFDF8] min-h-screen">
          <div className="container mx-auto px-6 max-w-6xl">
            <a href="#home" className="inline-flex items-center gap-2 text-asteria-primary font-bold mb-8">
              <i className="fa-solid fa-arrow-left"></i> 返回首頁
            </a>
            <div className="mb-10 grid lg:grid-cols-[1fr_auto] gap-6 items-end">
              <div>
                <div className="text-sm font-bold text-asteria-primary mb-2">asteria感情拯救所</div>
                <h1 className="text-4xl font-bold text-asteria-dark mb-3">相處教學</h1>
                <p className="text-stone-500 max-w-2xl">用 IG 圖文感覺慢慢睇，將感情相處、復合心態、曖昧判斷整理成一篇篇短教學。</p>
              </div>
              <a href="https://www.instagram.com/asteria.CRYSTAL.TAROT" target="_blank" className="inline-flex items-center gap-2 bg-white border border-asteria-cream text-asteria-primary px-5 py-3 rounded-xl font-bold shadow-sm hover:shadow-md transition-all">
                <i className="fa-brands fa-instagram"></i> Instagram
              </a>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {posts.map((post) => {
                const isActive = selectedPost?.id === post.id;

                return (
                  <article
                    key={post.id}
                    className={`bg-white border rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${isActive ? 'border-asteria-primary shadow-lg' : 'border-asteria-cream/70'}`}
                  >
                    <button
                      onClick={() => setSelectedPost(isActive ? null : post)}
                      className="group text-left w-full"
                    >
                      <div className={`${post.color} aspect-square relative overflow-hidden flex items-center justify-center`}>
                        <div className="absolute inset-5 border border-white/70 rounded-2xl"></div>
                        <div className="absolute top-4 left-4 bg-white/90 text-asteria-primary px-3 py-1 rounded-full text-xs font-bold shadow-sm">{post.category}</div>
                        <div className="text-center px-8 relative z-10">
                          <i className={`${post.icon} text-5xl text-white drop-shadow-md mb-5 block group-hover:scale-110 transition-transform duration-500`}></i>
                          <div className="font-eng text-sm tracking-[0.2em] text-white/90 mb-2">ASTERIA</div>
                          <div className="text-3xl font-bold text-asteria-dark">{post.imageLabel}</div>
                        </div>
                      </div>
                      <div className="p-5">
                        <h2 className="text-lg font-bold text-asteria-dark mb-2 leading-snug">{post.title}</h2>
                        <p className="text-sm text-stone-500 leading-relaxed">{post.summary}</p>
                        <div className="mt-4 inline-flex items-center gap-2 text-asteria-primary text-sm font-bold">
                          {isActive ? '收起文字' : '展開文字'} <i className={`fa-solid fa-chevron-down transition-transform ${isActive ? 'rotate-180' : ''}`}></i>
                        </div>
                      </div>
                    </button>
                    {isActive && (
                      <div className="px-5 pb-5">
                        <div className="border-t border-asteria-cream/70 pt-5 text-sm text-stone-600 leading-loose" dangerouslySetInnerHTML={{ __html: post.content }}></div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </main>
      );
    }

    return (
      <section id="blog" className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <div className="text-sm font-bold text-asteria-primary mb-2">asteria感情拯救所</div>
              <h2 className="text-3xl font-bold text-asteria-dark mb-3">相處教學</h2>
              <p className="text-stone-500">不再在感情裡迷路，學會愛與被愛的智慧。</p>
            </div>
            <a href="#teaching" className="btn-primary px-5 py-3 rounded-xl font-bold inline-flex items-center gap-2 justify-center">
              查看全部文章 <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>
  
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {posts.map((post) => (
              <a 
                key={post.id} 
                href="#teaching"
                className="group cursor-pointer bg-white rounded-2xl border border-gray-100 hover:border-asteria-primary/30 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Visual Header */}
                <div className={`aspect-square ${post.color} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-5 border border-white/70 rounded-2xl"></div>
                  <div className="text-center px-6 relative z-10">
                    <i className={`${post.icon} text-5xl text-white drop-shadow-md mb-4 block group-hover:scale-110 transition-transform duration-500`}></i>
                    <div className="font-eng text-xs tracking-[0.2em] text-white/90 mb-2">ASTERIA</div>
                    <div className="text-2xl font-bold text-asteria-dark">{post.imageLabel}</div>
                  </div>
                  <span className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-gray-600 shadow-sm">
                    {post.category}
                  </span>
                </div>
                
                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-asteria-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-3 leading-relaxed">
                    {post.summary}
                  </p>
                  <div className="mt-auto flex items-center text-asteria-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    閱讀更多 <i className="fa-solid fa-arrow-right ml-2"></i>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="text-center mt-10">
              <a href="https://www.instagram.com/asteria.CRYSTAL.TAROT" target="_blank" className="inline-block text-gray-400 hover:text-asteria-primary transition-colors text-sm">
                <i className="fa-brands fa-instagram mr-1"></i> 更多教學請 Follow Instagram
              </a>
          </div>
  
          {/* Modal */}
          {false && selectedPost && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedPost(null)}></div>
              <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto relative z-10 shadow-2xl animate-fade-in-up">
                <button 
                    onClick={() => setSelectedPost(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors text-gray-600"
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>
                
                <div className={`${selectedPost.color} h-32 flex items-center px-8`}>
                   <h2 className="text-2xl md:text-3xl font-bold text-gray-800 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl inline-block shadow-sm">
                     {selectedPost.title}
                   </h2>
                </div>

                <div className="p-8">
                <div className="prose prose-stone max-w-none text-gray-700 leading-loose" dangerouslySetInnerHTML={{ __html: selectedPost.content }}></div>
                    
                    <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <span className="text-sm text-gray-400">想解決類似問題？</span>
                        <a href={WHATSAPP_URL} target="_blank" className="bg-asteria-primary text-white px-6 py-2 rounded-full font-bold hover:bg-amber-800 transition-colors shadow-md text-sm">
                            <i className="fa-brands fa-whatsapp mr-1"></i> 與 Asteria 聊聊
                        </a>
                    </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    );
};

const Services = () => {
  type ServiceCategory = 'love' | 'career' | 'other';
  type ServiceType = 'single' | 'sets';

  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('love');
  const [activeType, setActiveType] = useState<ServiceType>('single');
  const [servicePage, setServicePage] = useState(0);

  const iconStyles = [
    { icon: "fa-solid fa-wand-magic-sparkles", color: "bg-amber-50 text-amber-600" },
    { icon: "fa-solid fa-heart", color: "bg-rose-50 text-rose-500" },
    { icon: "fa-solid fa-fire", color: "bg-orange-50 text-orange-500" },
    { icon: "fa-solid fa-shield-heart", color: "bg-cyan-50 text-cyan-600" },
    { icon: "fa-solid fa-broom", color: "bg-teal-50 text-teal-500" },
    { icon: "fa-solid fa-bolt", color: "bg-yellow-50 text-yellow-600" },
    { icon: "fa-solid fa-link", color: "bg-stone-100 text-stone-600" },
    { icon: "fa-solid fa-gem", color: "bg-rose-50 text-rose-500" }
  ];

  const applyStyle = (items: Array<{ title: string; desc: string; tags: string[] }>) =>
    items.map((item, idx) => ({ ...item, ...iconStyles[idx % iconStyles.length] }));

  const serviceGroups: Record<ServiceCategory, { label: string; intro: string; icon: string; tone: string; single: ReturnType<typeof applyStyle>; sets: ReturnType<typeof applyStyle> }> = {
    love: {
      label: "愛情",
      intro: "復合、曖昧升溫、斷聯破冰、穩定關係與桃花方向。",
      icon: "fa-solid fa-heart",
      tone: "bg-rose-50 border-rose-100 text-rose-700",
      single: applyStyle([
        { title: "絕望", desc: "加強對方失去你後的空缺感與想念感，協助對方意識到無咗你好辛苦、始終想要你的情緒牽引。", tags: ["想念", "挽回", "情緒牽引"] },
        { title: "開路", desc: "突破現有關係卡住的位置，清除相處阻礙，增加聯絡、見面與發展機會。", tags: ["突破阻礙", "推進關係", "增加機會"] },
        { title: "斬斷", desc: "針對第三者、曖昧對象或身邊干擾，協助斬斷不利連結，令對方重新將注意力帶回你身邊。", tags: ["第三者", "斬斷干擾", "回到身邊"] },
        { title: "海地愛/熱情火", desc: "提升熱情度、愛情正能量與主動性，適合關係冷淡、曖昧不前或想重燃火花的情況。", tags: ["熱情", "主動性", "愛情升溫"] },
        { title: "蝨子", desc: "復合方向常用，協助加強對方迷戀感、依賴感與熱情，令對方更掛住你、離不開你。", tags: ["復合", "迷戀", "熱情返"] },
        { title: "龍血", desc: "提升你們之間的愛情正能量、主動性與積極性，推動對方多些接近你。", tags: ["主動接近", "積極性", "愛情能量"] },
        { title: "來我身邊", desc: "吸引對方重新靠近，令對方更願意留在你身邊、喜歡同你相處，對你不再冷淡並增加熱情。", tags: ["復聯", "靠近", "主動付出"] },
        { title: "和諧", desc: "改善關係問題與清走負面能量，緩和爭執、冷戰、誤會或相處不順。", tags: ["改善關係", "清負能量", "緩和"] },
        { title: "鎖心", desc: "協助穩定對方心意，讓對方更專注於你，適合想確立關係或加強專一感的個案。", tags: ["專一", "確立關係", "穩定心意"] },
        { title: "清理", desc: "清理關係中的負能量與不和狀態，讓雙方相處氣氛回到較舒服的位置。", tags: ["關係清理", "不和狀態", "淨化"] },
        { title: "丘比特", desc: "專為招正桃花而設，有助吸引真愛與提升你的愛情能量，較適合無指定對象的客人。", tags: ["正桃花", "真愛", "無指定對象"] },
        { title: "改變現狀", desc: "改變現在不理想的局面，協助逆轉現況，讓關係有新的發展空間。", tags: ["逆轉現況", "改局", "新發展"] },
        { title: "魅力女神", desc: "提升個人魅力磁場、吸引力與桃花感，讓你更容易被注意、被欣賞。", tags: ["魅力", "桃花", "吸引力"] },
        { title: "抗壓", desc: "舒緩壓力與內耗，改善因壓力引起的關係問題，讓自己和相處氣氛更穩定。", tags: ["舒緩壓力", "關係壓力", "穩定"] }
      ]),
      sets: applyStyle([
        { title: "心思思儀式", desc: "加強對方想起你、掛念你與忍不住關注你的能量，適合曖昧或冷淡後重新牽引。", tags: ["想念", "關注", "牽引"] },
        { title: "脫單set儀式", desc: "提升桃花、魅力與被看見的機會，幫助吸引更合適的對象進入生活。", tags: ["脫單", "桃花", "正緣"] },
        { title: "愛上你儀式", desc: "加深好感與情感投入，適合想由曖昧、普通關係推進到更親密階段。", tags: ["好感升溫", "情感投入", "曖昧推進"] },
        { title: "恢復聯絡儀式", desc: "針對斷聯、已讀不回或冷淡狀態，推動對方重新打開聯絡窗口。", tags: ["斷聯", "破冰", "重新聯絡"] },
        { title: "先攻後守儀式", desc: "先推動局面，再穩住後續發展，適合想主動出擊但又希望後續穩陣的個案。", tags: ["主動推進", "穩定後續", "策略"] },
        { title: "金剛箍儀式", desc: "穩定對方心思與關係黏性，減少忽冷忽熱、逃避或心意飄忽。", tags: ["穩定", "黏性", "安全感"] },
        { title: "解壓儀式", desc: "舒緩感情壓力、焦慮與內耗，讓自己和關係都回到較輕鬆的狀態。", tags: ["舒緩", "抗壓", "情緒平衡"] },
        { title: "重修舊好儀式", desc: "修補舊日裂痕與負面印象，適合分開後仍想重新建立信任與好感。", tags: ["修復", "復合", "信任"] },
        { title: "唯一儀式", desc: "加強被重視、被選擇與專一的能量，適合關係中缺乏安全感或有競爭者時。", tags: ["專一", "被選擇", "安全感"] },
        { title: "斬斷儀式", desc: "集中處理第三者、爛桃花或不利關係牽連，協助把干擾從你們之間清走。", tags: ["斬斷", "清障礙", "第三者"] },
        { title: "逆轉儀式", desc: "針對急轉直下或對你不利的現況，協助扭轉能量走勢與關係方向。", tags: ["逆轉", "轉機", "改局"] },
        { title: "主動儀式", desc: "加強對方主動聯絡、主動邀約與主動表態的推動力。", tags: ["主動", "邀約", "表態"] },
        { title: "溝通儀式", desc: "降低誤解、防備與情緒化反應，讓雙方更容易講清楚真正想法。", tags: ["溝通", "化解誤會", "坦白"] },
        { title: "化解儀式", desc: "化解怨氣、心結、誤會與相處中的僵局，讓關係有重新柔和的空間。", tags: ["心結", "怨氣", "緩和"] },
        { title: "趕盡殺絕儀式", desc: "徹底清理反覆出現的阻礙、爛桃花與干擾能量，適合需要清得更乾淨的局面。", tags: ["徹底清理", "阻礙", "爛桃花"] },
        { title: "破冰儀式", desc: "打開沉默、尷尬或冷戰後的第一步，協助重新出現互動。", tags: ["破冰", "冷戰", "重新互動"] },
        { title: "親密儀式", desc: "提升親密感、依戀感與想靠近的能量，適合感情淡化或距離變遠時。", tags: ["親密", "靠近", "升溫"] },
        { title: "讓步儀式", desc: "軟化雙方僵硬立場，減少硬碰硬，讓對方較願意聽、願意退一步。", tags: ["軟化", "退讓", "緩和"] },
        { title: "重燃愛火儀式", desc: "為平淡、冷卻或熱情下降的關係重新注入火花與期待感。", tags: ["重燃", "熱情", "甜蜜"] },
        { title: "愛情三重奏儀式", desc: "結合吸引、修復與穩定三個方向，適合想一次處理多個感情痛點。", tags: ["吸引", "修復", "穩定"] },
        { title: "念念不忘儀式", desc: "加深記掛與回想你的頻率，讓對方更容易被過往美好牽動。", tags: ["思念", "回想", "牽掛"] },
        { title: "重建信心儀式", desc: "修補自我價值感與感情信心，適合被冷待、分手或打擊後重新站穩。", tags: ["自信", "修復", "自我價值"] },
        { title: "動情儀式", desc: "喚起對方情緒波動與感情感受，適合關係太理性、太冷或缺乏情感流動時。", tags: ["動情", "感受", "升溫"] },
        { title: "後悔莫及儀式", desc: "加強對方回想、反省與意識到失去你的重量，適合被忽視或被輕看後使用。", tags: ["反省", "回想", "後悔"] },
        { title: "不計前縑儀式", desc: "淡化舊事、怨氣與過往不快，讓雙方較容易放下防備重新相處。", tags: ["放下舊事", "和解", "重新開始"] }
      ])
    },
    career: {
      label: "金錢事業",
      intro: "工作順利、事業上升、財運、貴人、人緣與機會方向。",
      icon: "fa-solid fa-coins",
      tone: "bg-amber-50 border-amber-100 text-amber-800",
      single: applyStyle([
        { title: "工作", desc: "協助工作更順利，適合近期工作卡住、合作不順或想穩定職場狀態時。", tags: ["工作順利", "職場", "穩定"] },
        { title: "開路", desc: "清除工作上的阻礙，打開新機會、合作空間與職場發展路線。", tags: ["清除阻礙", "工作機會", "發展"] },
        { title: "魅力女神", desc: "提升個人人緣與職場吸引力，協助吸引貴人、客人或有利合作。", tags: ["人緣", "貴人", "合作"] },
        { title: "提運", desc: "增加個人運氣與順勢感，適合想改善近期低迷、卡關或機會不足的狀態。", tags: ["運氣", "轉順", "機會"] },
        { title: "成功", desc: "加強目標達成與順利成事的能量，適合面試、項目、考核或重要計劃。", tags: ["成事", "目標", "順利"] }
      ]),
      sets: applyStyle([
        { title: "生財儀式", desc: "提升財氣流動與收入機會，適合想改善財運、接單量或金錢阻滯的人。", tags: ["財運", "收入", "機會"] },
        { title: "事業上升儀式", desc: "推動事業能量向上，適合想升職、轉工、加強貴人與職場表現。", tags: ["事業", "升職", "貴人"] },
        { title: "大發橫財儀式", desc: "加強偏財、突發機會與金錢驚喜的能量，適合想打開額外財路時。", tags: ["偏財", "財路", "驚喜"] },
        { title: "事業建功儀式", desc: "協助重要工作、考核、項目或合作更順利推進，提升被認可的機會。", tags: ["項目成功", "職場表現", "認可"] }
      ])
    },
    other: {
      label: "其他",
      intro: "能量清理、防護、個人狀態、放下、淡忘與特殊個案方向。",
      icon: "fa-solid fa-leaf",
      tone: "bg-cyan-50 border-cyan-100 text-cyan-800",
      single: applyStyle([
        { title: "清負", desc: "清理個人氣場、關係或生活中的低頻能量，適合近期覺得沉重、混亂或運勢受阻時。", tags: ["清負能量", "淨化", "重新整理"] },
        { title: "特請", desc: "按個案目標特別配置，適合情況複雜、單一儀式未能完整覆蓋的需求。", tags: ["客製化", "複雜個案", "指定方向"] },
        { title: "控制", desc: "協助拉回局面的節奏與主導感，穩定情緒，不再被反覆變化牽動。", tags: ["主導節奏", "穩定局面", "情緒控制"] },
        { title: "保護", desc: "建立能量防護，減少小人、負面磁場或外界干擾對你造成影響。", tags: ["防護", "避小人", "守護"] },
        { title: "毁滅", desc: "終止破壞性牽連與反覆消耗的負面模式，適合需要徹底清走不良影響的情況。", tags: ["終止消耗", "斷開負面", "清場"] },
        { title: "忘記", desc: "淡化執念、痛苦回憶與反覆想起的情緒，幫助自己慢慢放下與恢復平衡。", tags: ["淡忘", "放下", "情緒修復"] }
      ]),
      sets: applyStyle([
        { title: "大掃除儀式", desc: "為個人狀態、關係磁場或近期低迷運勢做全面清理與重整。", tags: ["全面清理", "重整", "淨化"] },
        { title: "詛咒法術移除儀式", desc: "針對疑似受負面能量、詛咒或不明阻滯影響的情況，做深層清理與解除。", tags: ["移除", "深層清理", "解除阻滯"] },
        { title: "轉危為安儀式", desc: "適合局面緊張、關係危機或事情臨界時，協助穩住狀況、減低衝擊。", tags: ["危機", "穩定", "轉機"] },
        { title: "放手淡忘儀式", desc: "幫助慢慢放低一段關係或痛苦記憶，減少反覆回想與情緒拉扯。", tags: ["放手", "淡忘", "療癒"] },
        { title: "執念消除儀式", desc: "針對放不低、想不通、停不下來的內耗，協助消減執念與情緒依附。", tags: ["消除執念", "停止內耗", "情緒自由"] }
      ])
    }
  };

  const categories = Object.entries(serviceGroups) as Array<[ServiceCategory, typeof serviceGroups[ServiceCategory]]>;
  const currentGroup = serviceGroups[activeCategory];
  const activeItems = currentGroup[activeType];
  const itemsPerPage = 9;
  const totalPages = Math.max(1, Math.ceil(activeItems.length / itemsPerPage));
  const visibleItems = activeItems.slice(servicePage * itemsPerPage, servicePage * itemsPerPage + itemsPerPage);

  const handleCategoryChange = (category: ServiceCategory) => {
    setActiveCategory(category);
    setServicePage(0);
    if (serviceGroups[category][activeType].length === 0) {
      setActiveType(serviceGroups[category].single.length > 0 ? 'single' : 'sets');
    }
  };

  const handleTypeChange = (type: ServiceType) => {
    setActiveType(type);
    setServicePage(0);
  };

  return (
    <section id="services" className="py-20 px-4 bg-[#FFFDF8]">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-asteria-primary bg-asteria-yellow/30 border border-asteria-yellow/50 px-3 py-1 rounded-full mb-4">
            <i className="fa-solid fa-star"></i> Ritual Menu
          </div>
          <h2 className="text-3xl font-bold text-asteria-dark mb-4">服務項目</h2>
          <p className="text-stone-500 mb-8">先揀你想處理嘅方向，再睇單項或組合儀式，畫面會清爽好多。</p>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {categories.map(([key, group]) => (
              <button
                key={key}
                onClick={() => handleCategoryChange(key)}
                className={`text-left rounded-2xl border p-5 transition-all duration-300 ${activeCategory === key ? 'bg-white border-asteria-primary shadow-lg -translate-y-1' : `${group.tone} hover:bg-white hover:shadow-md`}`}
              >
                <span className={`w-11 h-11 rounded-xl inline-flex items-center justify-center mb-4 ${activeCategory === key ? 'bg-asteria-primary text-white' : 'bg-white/80'}`}>
                  <i className={group.icon}></i>
                </span>
                <span className="block text-lg font-bold text-asteria-dark">{group.label}</span>
                <span className="block text-sm text-stone-500 mt-2 leading-relaxed">{group.intro}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-center mb-10">
            <div className="bg-asteria-cream/60 p-1.5 rounded-full inline-flex relative shadow-inner border border-white">
              <button 
                onClick={() => handleTypeChange('single')}
                className={`px-8 py-3 rounded-full text-sm md:text-base font-bold transition-all duration-300 ${activeType === 'single' ? 'bg-white text-asteria-primary shadow-md transform scale-105' : 'text-stone-500 hover:text-asteria-primary'}`}
              >
                <i className="fa-solid fa-wand-sparkles mr-2"></i> 單項儀式
              </button>
              <button 
                onClick={() => handleTypeChange('sets')}
                className={`px-8 py-3 rounded-full text-sm md:text-base font-bold transition-all duration-300 ${activeType === 'sets' ? 'bg-white text-asteria-primary shadow-md transform scale-105' : 'text-stone-500 hover:text-asteria-primary'}`}
              >
                <i className="fa-solid fa-layer-group mr-2"></i> 組合儀式
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {visibleItems.map((item, idx) => (
            <div key={`${activeCategory}-${activeType}-${servicePage}-${idx}`} className="bg-white border border-asteria-cream/60 rounded-2xl p-6 hover:shadow-xl hover:border-asteria-yellow/70 transition-all duration-300 group flex flex-col h-full hover:-translate-y-1">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 ${item.color} group-hover:scale-110 transition-transform`}>
                <i className={item.icon}></i>
              </div>
              <h3 className="text-xl font-bold text-asteria-dark mb-2">{item.title}</h3>
              <p className="text-stone-500 text-sm mb-4 leading-relaxed flex-grow">
                {item.desc}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {item.tags.map((tag, tIdx) => (
                  <span key={tIdx} className="text-xs bg-[#FFF8EC] text-stone-500 px-2 py-1 rounded-md border border-asteria-cream/50"># {tag}</span>
                ))}
              </div>

              <a href={WHATSAPP_URL} target="_blank" className="w-full text-center border-2 border-asteria-yellow/60 text-asteria-primary py-2.5 rounded-xl font-bold hover:bg-asteria-primary hover:text-white transition-all text-sm group-hover:shadow-md mt-auto">
                查詢詳情
              </a>
            </div>
          ))}
        </div>

        {activeItems.length > itemsPerPage && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={() => setServicePage((page) => Math.max(0, page - 1))}
              disabled={servicePage === 0}
              className="w-12 h-12 rounded-full border border-asteria-cream bg-white text-asteria-primary shadow-sm hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="上一頁"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <div className="text-sm font-bold text-stone-500">
              {servicePage + 1} / {totalPages}
            </div>
            <button
              onClick={() => setServicePage((page) => Math.min(totalPages - 1, page + 1))}
              disabled={servicePage >= totalPages - 1}
              className="w-12 h-12 rounded-full border border-asteria-cream bg-white text-asteria-primary shadow-sm hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="下一頁"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        )}

        <div className="mt-12 text-center bg-asteria-yellow/30 p-6 rounded-2xl max-w-2xl mx-auto border border-asteria-yellow/50">
           <p className="text-gray-700 text-sm md:text-base">
             <i className="fa-solid fa-circle-info text-yellow-500 mr-2"></i>
             所有儀式均會按個案狀況建議配搭，保證私隱。不確定自己適合哪種儀式？歡迎 WhatsApp 諮詢，我們會為您分析最合適的方向。
           </p>
        </div>

      </div>
    </section>
  );
};

const Reviews = () => (
  <section id="reviews" className="py-20 bg-asteria-blue/10">
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-asteria-dark mb-3">客人真實好評</h2>
        <div className="flex justify-center gap-1 text-yellow-400 text-sm mb-2">
           <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
        </div>
        <p className="text-gray-500">之後可以放 WhatsApp 對話圖、IG story 圖、客人回饋截圖。</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {["對話截圖", "Story 好評", "儀式回饋"].map((label, index) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-asteria-cream/70">
            <div className="aspect-[9/16] rounded-xl border-2 border-dashed border-asteria-yellow/70 bg-[#FFF8EC] flex flex-col items-center justify-center text-center px-6">
              <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-asteria-primary text-xl mb-4">
                <i className={index === 0 ? "fa-solid fa-comments" : index === 1 ? "fa-brands fa-instagram" : "fa-solid fa-star"}></i>
              </div>
              <div className="font-bold text-asteria-dark">{label}</div>
              <div className="text-xs text-stone-400 mt-2">之後放圖片</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-10">
        <a href="https://www.instagram.com/asteria.CRYSTAL.TAROT" target="_blank" className="inline-flex items-center text-asteria-primary font-bold hover:underline bg-white px-6 py-2 rounded-full shadow-sm hover:shadow transition-all">
          查看更多好評 <i className="fa-solid fa-arrow-right ml-2"></i>
        </a>
      </div>
    </div>
  </section>
);

type PortalEntryType = 'relationship' | 'mood' | 'question';

type PortalEntry = {
  id: number;
  type: PortalEntryType;
  text: string;
  images?: string[];
  createdAt: string;
};

type ChatMessage = {
  id: number | string;
  sender: 'customer' | 'admin';
  text: string;
  images?: string[];
  createdAt: string;
};

type PortalCustomer = {
  id: string;
  threadId?: string;
  name: string;
  phone: string;
  whatsapp?: string;
  igHandle?: string;
  telegramHandle?: string;
  email?: string;
  targetName?: string;
  originalChannel?: string;
  interests: string[];
  entries: PortalEntry[];
  messages?: ChatMessage[];
};

const TEACHING_TYPES = [
  '復合',
  '斷聯',
  '曖昧',
  '第三者',
  '情緒管理',
  '溝通',
  '自我價值',
  '放手淡忘'
];

const REVIEW_CASES = [
  { title: '斷聯後重新聯絡', tag: '斷聯', note: '適合睇返破冰、恢復聯絡類型的好評截圖。' },
  { title: '復合後關係升溫', tag: '復合', note: '適合推送重修舊好、熱情回流類型的 story。' },
  { title: '曖昧期對方主動', tag: '曖昧', note: '適合放主動約見、回覆變多的對話圖。' },
  { title: '重建自信之後逆轉', tag: '自我價值', note: '適合放客人心態變穩、關係改善的回饋。' }
];

const DEFAULT_CUSTOMERS: PortalCustomer[] = [
  {
    id: 'demo-1',
    name: 'Demo 客人',
    phone: '0000',
    igHandle: '@demo_ig',
    telegramHandle: '@demo_tg',
    email: 'demo@example.com',
    targetName: 'Demo 真名',
    originalChannel: 'Instagram',
    interests: ['復合', '斷聯', '溝通'],
    messages: [
      {
        id: 101,
        sender: 'customer',
        text: '我想問今日佢有覆我 story，我應唔應該即刻覆返？',
        createdAt: '2026-05-16T10:40:00.000Z'
      },
      {
        id: 102,
        sender: 'admin',
        text: '可以覆，但唔好太長。保持輕鬆，唔好一次過追問關係。',
        createdAt: '2026-05-16T10:52:00.000Z'
      }
    ],
    entries: [
      {
        id: 1,
        type: 'relationship',
        text: '對方今日有覆 story，但語氣仍然比較冷淡，想知道應該主動定等佢。',
        createdAt: '2026-05-16T09:30:00.000Z'
      },
      {
        id: 2,
        type: 'mood',
        text: '今日比之前冷靜，知道自己唔可以一急就連環 message，要練習等一等。',
        createdAt: '2026-05-16T10:15:00.000Z'
      }
    ]
  }
];

type SystemAccount = {
  label: string;
  username: string;
  email: string;
  password: string;
  role: 'customer' | 'staff';
  customerId?: string;
};

const DEFAULT_ACCOUNTS: SystemAccount[] = [
  {
    label: '客人 demo',
    username: 'client-demo',
    email: 'client@asteria.space',
    password: 'client123',
    role: 'customer',
    customerId: 'demo-1'
  },
  {
    label: '客服 demo',
    username: 'staff-demo',
    email: 'staff@asteria.space',
    password: 'staff123',
    role: 'staff'
  }
];

const loadPortalCustomers = () => {
  try {
    const saved = window.localStorage.getItem('asteriaPortalCustomers');
    return saved ? JSON.parse(saved) as PortalCustomer[] : DEFAULT_CUSTOMERS;
  } catch {
    return DEFAULT_CUSTOMERS;
  }
};

const savePortalCustomers = (customers: PortalCustomer[]) => {
  window.localStorage.setItem('asteriaPortalCustomers', JSON.stringify(customers));
};

const loadSystemAccounts = () => {
  try {
    const saved = window.localStorage.getItem('asteriaSystemAccounts');
    const accounts = saved ? JSON.parse(saved) as SystemAccount[] : DEFAULT_ACCOUNTS;
    return accounts.map((account) => {
      const demo = DEFAULT_ACCOUNTS.find((item) => item.email === account.email);
      return {
        ...account,
        username: (!account.username || account.username.includes('@')) ? (demo?.username || account.username || account.email) : account.username
      };
    });
  } catch {
    return DEFAULT_ACCOUNTS;
  }
};

const saveSystemAccounts = (accounts: SystemAccount[]) => {
  window.localStorage.setItem('asteriaSystemAccounts', JSON.stringify(accounts));
};

const getCurrentDemoRole = () => window.localStorage.getItem('asteriaCurrentRole') as 'customer' | 'staff' | null;

const formatEntryDate = (value: string) => {
  return new Intl.DateTimeFormat('zh-HK', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
};

const entryLabels: Record<PortalEntryType, { label: string; icon: string; tone: string }> = {
  relationship: { label: '關係 update', icon: 'fa-solid fa-heart-pulse', tone: 'bg-asteria-pink/45 text-asteria-dark' },
  mood: { label: '心情日記', icon: 'fa-regular fa-note-sticky', tone: 'bg-asteria-blue/50 text-asteria-dark' },
  question: { label: '想睇問題', icon: 'fa-regular fa-circle-question', tone: 'bg-asteria-yellow/55 text-asteria-dark' }
};

const timelineFilters: Array<{ value: 'all' | PortalEntryType; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'relationship', label: '感情 update' },
  { value: 'mood', label: '個人日記' },
  { value: 'question', label: '想睇問題' }
];

const readFilesAsDataUrls = (files: FileList | null) => {
  const selectedFiles = Array.from(files || []);
  return Promise.all(selectedFiles.map((file) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  })));
};

const buildSummary = (customer: PortalCustomer) => {
  const latest = customer.entries.slice(-3).map((entry) => entry.text).join(' ');
  if (!latest) return '未有足夠 update。之後可以接 AI，自動濃縮近況、情緒變化、客服 follow up 重點。';
  return `AI summary 位：${customer.name} 最近重點圍繞「${customer.interests.join('、') || '未選分類'}」。近況摘要：${latest.slice(0, 90)}${latest.length > 90 ? '...' : ''}`;
};

const RegisterPage = () => {
  const [customers, setCustomers] = useState<PortalCustomer[]>(loadPortalCustomers);
  const [accounts] = useState<SystemAccount[]>(loadSystemAccounts);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [igHandle, setIgHandle] = useState('');
  const [telegramHandle, setTelegramHandle] = useState('');
  const [email, setEmail] = useState('');
  const [targetName, setTargetName] = useState('');

  useEffect(() => {
    if (!isBackendConfigured) return;

    let isMounted = true;
    getCurrentAccount()
      .then((account) => {
        if (!isMounted || !account) return;
        window.localStorage.setItem('asteriaCurrentRole', account.role);
        window.localStorage.setItem('asteriaCurrentUsername', account.username);
        window.localStorage.setItem('asteriaCurrentEmail', account.contact_email || '');
        if (account.role === 'customer') {
          window.localStorage.setItem('asteriaCurrentCustomerId', account.user_id);
        }
        window.location.hash = account.role === 'staff' ? '#inbox' : '#portal';
      })
      .catch(() => {
        window.localStorage.removeItem('asteriaCurrentRole');
        window.localStorage.removeItem('asteriaCurrentUsername');
        window.localStorage.removeItem('asteriaCurrentEmail');
        window.localStorage.removeItem('asteriaCurrentCustomerId');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSystemLogin = async () => {
    if (isBackendConfigured) {
      try {
        const account = await loginWithUsername(loginUsername.trim(), loginPassword.trim());
        window.localStorage.setItem('asteriaCurrentRole', account.role);
        window.localStorage.setItem('asteriaCurrentUsername', account.username);
        window.localStorage.setItem('asteriaCurrentEmail', account.contact_email || '');

        if (account.role === 'customer') {
          const existingCustomers = loadPortalCustomers();
          const existing = existingCustomers.find((customer) => customer.id === account.user_id);
          if (!existing) {
            savePortalCustomers([{
              id: account.user_id,
              name: account.label,
              phone: '',
              email: account.contact_email || '',
              originalChannel: 'Asteria Space',
              interests: [],
              entries: [],
              messages: []
            }, ...existingCustomers]);
          }
          window.localStorage.setItem('asteriaCurrentCustomerId', account.user_id);
        }

        window.location.hash = account.role === 'staff' ? '#inbox' : '#portal';
        return;
      } catch (error) {
        setLoginError(error instanceof Error ? error.message : '登入資料不正確。');
        return;
      }
    }

    const account = accounts.find((item) => item.username === loginUsername.trim() && item.password === loginPassword.trim());
    if (!account) {
      setLoginError('登入資料不正確。');
      return;
    }
    window.localStorage.setItem('asteriaCurrentRole', account.role);
    window.localStorage.setItem('asteriaCurrentUsername', account.username);
    window.localStorage.setItem('asteriaCurrentEmail', account.email);
    if (account.customerId) window.localStorage.setItem('asteriaCurrentCustomerId', account.customerId);
    window.location.hash = account.role === 'staff' ? '#inbox' : '#portal';
  };

  const saveRegistration = () => {
    const trimmedPhone = phone.trim();
    const trimmedIg = igHandle.trim();
    const trimmedTelegram = telegramHandle.trim();
    const trimmedEmail = email.trim();
    const trimmedTargetName = targetName.trim();
    const trimmedName = name.trim() || 'Asteria 客人';
    if (!trimmedPhone && !trimmedIg && !trimmedTelegram) return;

    const existing = customers.find((customer) =>
      (trimmedPhone && customer.phone === trimmedPhone) ||
      (trimmedIg && customer.igHandle === trimmedIg) ||
      (trimmedTelegram && customer.telegramHandle === trimmedTelegram)
    );

    const newCustomerId = `customer-${Date.now()}`;
    const activeCustomerId = existing?.id || newCustomerId;

    const nextCustomers = existing
      ? customers.map((customer) => customer.id === existing.id ? {
          ...customer,
          name: trimmedName,
          phone: trimmedPhone || customer.phone,
          igHandle: trimmedIg || customer.igHandle,
          telegramHandle: trimmedTelegram || customer.telegramHandle,
          email: trimmedEmail || customer.email,
          targetName: trimmedTargetName || customer.targetName
        } : customer)
      : [{
          id: newCustomerId,
          name: trimmedName,
          phone: trimmedPhone,
          whatsapp: trimmedPhone,
          igHandle: trimmedIg,
          telegramHandle: trimmedTelegram,
          email: trimmedEmail,
          targetName: trimmedTargetName,
          originalChannel: 'Asteria Space',
          interests: ['復合'],
          entries: [],
          messages: []
        }, ...customers];

    setCustomers(nextCustomers);
    savePortalCustomers(nextCustomers);
    window.localStorage.setItem('asteriaCurrentRole', 'customer');
    window.localStorage.setItem('asteriaCurrentCustomerId', activeCustomerId);
    window.location.hash = '#portal';
  };

  return (
    <main className="pt-56 md:pt-40 pb-20 bg-[#FFFDF8] min-h-screen">
      <div className="container mx-auto px-6 max-w-3xl">
        <a href="#home" className="inline-flex items-center gap-2 text-asteria-primary font-bold mb-6">
          <i className="fa-solid fa-arrow-left"></i> 返回首頁
        </a>

        <div className="bg-white border border-asteria-cream/70 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="text-sm font-bold text-asteria-primary mb-2">Asteria Space</div>
          <h1 className="text-3xl md:text-4xl font-bold text-asteria-dark mb-3">登入你的私人空間</h1>
          <p className="text-stone-500 leading-relaxed mb-6">
            一個方便記錄最近情況、上傳對話、同我哋保持聯絡嘅私人空間。WhatsApp 繼續用嚟即時傾，Asteria Space 就用嚟保留重要 record。
          </p>

          <div className="bg-[#FFF8EC] border border-asteria-cream rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white text-asteria-primary flex items-center justify-center shrink-0 shadow-sm">
                <i className="fa-solid fa-lock"></i>
              </div>
              <div>
                <div className="font-bold text-asteria-dark">系統登入</div>
                <p className="text-sm text-stone-500 leading-relaxed">暫時由 Asteria 開 account 比你。客服同客人用同一個入口登入，系統會自動分去不同版面。</p>
              </div>
            </div>

            <div className="grid gap-3">
              <input value={loginUsername} onChange={(event) => setLoginUsername(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary bg-white" placeholder="Account 名" />
              <input type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') handleSystemLogin(); }} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary bg-white" placeholder="密碼" />
              {loginError && <div className="text-sm font-bold text-red-500">{loginError}</div>}
              <button onClick={handleSystemLogin} className="btn-primary rounded-xl px-5 py-3 font-bold">登入</button>
            </div>

          </div>

          <div className="text-sm text-stone-500 text-center">
            第一次登入後，系統會請你補回聯絡資料。
          </div>
        </div>
      </div>
    </main>
  );
};

const PortalPage = () => {
  const [customers, setCustomers] = useState<PortalCustomer[]>(loadPortalCustomers);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [igHandle, setIgHandle] = useState('');
  const [telegramHandle, setTelegramHandle] = useState('');
  const [email, setEmail] = useState('');
  const [originalChannel, setOriginalChannel] = useState('Instagram');
  const [activeCustomerId, setActiveCustomerId] = useState(DEFAULT_CUSTOMERS[0].id);
  const [relationshipText, setRelationshipText] = useState('');
  const [moodText, setMoodText] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [relationshipImages, setRelationshipImages] = useState<string[]>([]);
  const [moodImages, setMoodImages] = useState<string[]>([]);
  const [questionImages, setQuestionImages] = useState<string[]>([]);
  const [timelineFilter, setTimelineFilter] = useState<'all' | PortalEntryType>('all');
  const [chatText, setChatText] = useState('');
  const [chatImages, setChatImages] = useState<string[]>([]);
  const [spaceView, setSpaceView] = useState<'dashboard' | 'chat' | 'profile'>('dashboard');

  useEffect(() => {
    if (isBackendConfigured) return;
    savePortalCustomers(customers);
  }, [customers]);

  const activeCustomer = customers.find((customer) => customer.id === activeCustomerId) || customers[0];
  const recommendedCases = REVIEW_CASES.filter((item) => activeCustomer?.interests.includes(item.tag));
  const visibleEntries = [...(activeCustomer?.entries || [])]
    .filter((entry) => timelineFilter === 'all' || entry.type === timelineFilter)
    .reverse();

  const upsertCustomer = () => {
    const trimmedPhone = phone.trim();
    const trimmedName = name.trim() || 'Asteria 客人';
    const trimmedIg = igHandle.trim();
    const trimmedTelegram = telegramHandle.trim();
    const trimmedEmail = email.trim();
    if (!trimmedPhone && !trimmedIg && !trimmedTelegram) return;

    const existing = customers.find((customer) =>
      (trimmedPhone && customer.phone === trimmedPhone) ||
      (trimmedIg && customer.igHandle === trimmedIg) ||
      (trimmedTelegram && customer.telegramHandle === trimmedTelegram)
    );
    if (existing) {
      setCustomers((current) => current.map((customer) => customer.id === existing.id ? {
        ...customer,
        name: trimmedName,
        phone: trimmedPhone || customer.phone,
        igHandle: trimmedIg || customer.igHandle,
        telegramHandle: trimmedTelegram || customer.telegramHandle,
        email: trimmedEmail || customer.email,
        originalChannel
      } : customer));
      setActiveCustomerId(existing.id);
      return;
    }

    const nextCustomer: PortalCustomer = {
      id: `customer-${Date.now()}`,
      name: trimmedName,
      phone: trimmedPhone,
      igHandle: trimmedIg,
      telegramHandle: trimmedTelegram,
      email: trimmedEmail,
      originalChannel,
      interests: ['復合'],
      entries: []
    };
    setCustomers((current) => [nextCustomer, ...current]);
    setActiveCustomerId(nextCustomer.id);
  };

  const updateCustomer = (updater: (customer: PortalCustomer) => PortalCustomer) => {
    setCustomers((current) => current.map((customer) => customer.id === activeCustomer.id ? updater(customer) : customer));
  };

  const addEntry = (type: PortalEntryType, text: string, images: string[], clear: () => void) => {
    const trimmed = text.trim();
    if (!trimmed && images.length === 0) return;
    updateCustomer((customer) => ({
      ...customer,
      entries: [
        ...customer.entries,
        { id: Date.now(), type, text: trimmed, images, createdAt: new Date().toISOString() }
      ]
    }));
    clear();
  };

  const sendChatMessage = () => {
    const trimmed = chatText.trim();
    if (!trimmed && chatImages.length === 0) return;
    updateCustomer((customer) => ({
      ...customer,
      messages: [
        ...(customer.messages || []),
        { id: Date.now(), sender: 'customer', text: trimmed, images: chatImages, createdAt: new Date().toISOString() }
      ]
    }));
    setChatText('');
    setChatImages([]);
  };

  const handleImageUpload = async (files: FileList | null, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    const images = await readFilesAsDataUrls(files);
    setter((current) => [...current, ...images]);
  };

  const toggleInterest = (interest: string) => {
    updateCustomer((customer) => ({
      ...customer,
      interests: customer.interests.includes(interest)
        ? customer.interests.filter((item) => item !== interest)
        : [...customer.interests, interest]
    }));
  };

  return (
    <main className="pt-56 md:pt-40 pb-20 bg-[#FFFDF8] min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-10">
          <div>
            <a href="#home" className="inline-flex items-center gap-2 text-asteria-primary font-bold mb-6">
              <i className="fa-solid fa-arrow-left"></i> 返回首頁
            </a>
            <div className="text-sm font-bold text-asteria-primary mb-2">會員關係記錄</div>
            <h1 className="text-4xl font-bold text-asteria-dark mb-3">Asteria 客人 Profile</h1>
            <p className="text-stone-500 max-w-2xl">請補回 WhatsApp / IG / Telegram / Email，之後就算其中一個平台被 ban，我地都搵得返你。</p>
          </div>
          <a href="#admin" className="inline-flex items-center gap-2 bg-asteria-dark text-white px-5 py-3 rounded-xl font-bold shadow-sm hover:shadow-md transition-all">
            <i className="fa-solid fa-lock"></i> Admin 後台
          </a>
        </div>

        <div className="grid gap-8 items-start">
          <section className="bg-white border border-asteria-cream/70 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-asteria-dark mb-2">我的 Profile</h2>
                <p className="text-sm text-stone-500">呢度用嚟睇返你的 timeline、客服訊息同教學推送。未補聯絡資料的客人，請先申請 account。</p>
              </div>
              <a href="#register" className="btn-primary px-5 py-3 rounded-xl font-bold text-center">申請 / 更新 account</a>
            </div>

            <div className="mt-6">
              <div className="text-sm font-bold text-stone-500 mb-3">本地 demo：切換客人</div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {customers.map((customer) => (
                  <button key={customer.id} onClick={() => setActiveCustomerId(customer.id)} className={`text-left px-4 py-3 rounded-xl border transition-all min-w-48 ${activeCustomer?.id === customer.id ? 'bg-asteria-yellow/25 border-asteria-primary' : 'border-asteria-cream/70 hover:bg-asteria-yellow/15'}`}>
                    <div className="font-bold text-asteria-dark">{customer.name}</div>
                    <div className="text-xs text-stone-400">{customer.phone || customer.igHandle || customer.telegramHandle} · {customer.entries.length} 個 update</div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white border border-asteria-cream/70 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <div className="text-sm text-stone-400">失聯備用資料</div>
                <h2 className="text-2xl font-bold text-asteria-dark">我的聯絡方法</h2>
              </div>
              <span className="bg-asteria-yellow/35 text-asteria-dark text-xs font-bold px-3 py-1 rounded-full">客人可見</span>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-[#FFF8EC] rounded-xl p-4">
                <div className="text-xs text-stone-400 mb-1">WhatsApp</div>
                <div className="font-bold text-asteria-dark">{activeCustomer?.phone || '未登記'}</div>
              </div>
              <div className="bg-[#FFF8EC] rounded-xl p-4">
                <div className="text-xs text-stone-400 mb-1">Instagram</div>
                <div className="font-bold text-asteria-dark">{activeCustomer?.igHandle || '未登記'}</div>
              </div>
              <div className="bg-[#FFF8EC] rounded-xl p-4">
                <div className="text-xs text-stone-400 mb-1">Telegram</div>
                <div className="font-bold text-asteria-dark">{activeCustomer?.telegramHandle || '未登記'}</div>
              </div>
              <div className="bg-[#FFF8EC] rounded-xl p-4">
                <div className="text-xs text-stone-400 mb-1">Email</div>
                <div className="font-bold text-asteria-dark">{activeCustomer?.email || '未登記'}</div>
              </div>
            </div>
          </section>

          <section className="grid gap-6">
            <div className="bg-white border border-asteria-cream/70 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                  <div className="text-sm text-stone-400">客人自己睇得到</div>
                  <h2 className="text-2xl font-bold text-asteria-dark">我的近況 Timeline</h2>
                </div>
                <span className="bg-asteria-yellow/35 text-asteria-dark text-xs font-bold px-3 py-1 rounded-full">
                  {activeCustomer?.entries.length || 0} 個記錄
                </span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
                {timelineFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setTimelineFilter(filter.value)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border whitespace-nowrap transition-all ${timelineFilter === filter.value ? 'bg-asteria-primary text-white border-asteria-primary' : 'bg-white text-stone-500 border-asteria-cream hover:border-asteria-primary'}`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {visibleEntries.length === 0 ? (
                <div className="border-2 border-dashed border-asteria-yellow/70 rounded-2xl bg-[#FFF8EC] px-5 py-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-asteria-primary text-xl mx-auto mb-4">
                    <i className="fa-regular fa-note-sticky"></i>
                  </div>
                  <div className="font-bold text-asteria-dark mb-2">呢個分類暫時未有 update</div>
                  <p className="text-sm text-stone-500">可以喺下面寫低關係進展、心情反思，之後就會跟時間線排返喺呢度。</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
                  {visibleEntries.map((entry) => {
                    const meta = entryLabels[entry.type];
                    return (
                      <div key={entry.id} className="relative pl-8 pb-5 border-l-2 border-asteria-cream last:pb-0">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-asteria-primary border-4 border-white shadow-sm"></div>
                        <div className={`inline-flex items-center gap-2 ${meta.tone} text-xs font-bold px-3 py-1 rounded-full mb-2`}>
                          <i className={meta.icon}></i> {meta.label}
                        </div>
                        <p className="text-stone-600 leading-relaxed">{entry.text}</p>
                        {entry.images && entry.images.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                            {entry.images.map((image, index) => (
                              <img key={`${entry.id}-${index}`} src={image} className="aspect-square w-full rounded-xl object-cover border border-asteria-cream" alt="update upload" />
                            ))}
                          </div>
                        )}
                        <div className="text-xs text-stone-400 mt-2">{formatEntryDate(entry.createdAt)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white border border-asteria-cream/70 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                  <div className="text-sm text-stone-400">會留 record 的網頁訊息</div>
                  <h2 className="text-2xl font-bold text-asteria-dark">客服 Chatbox</h2>
                </div>
                <span className="bg-asteria-blue/40 text-asteria-dark text-xs font-bold px-3 py-1 rounded-full">
                  {(activeCustomer?.messages || []).length} 則訊息
                </span>
              </div>

              <div className="bg-[#FFF8EC] border border-asteria-cream/70 rounded-2xl p-4 max-h-[360px] overflow-y-auto mb-4">
                {(activeCustomer?.messages || []).length === 0 ? (
                  <div className="text-center text-sm text-stone-500 py-8">暫時未有訊息，可以喺下面留言比客服。</div>
                ) : (
                  <div className="space-y-3">
                    {(activeCustomer?.messages || []).map((message) => (
                      <div key={message.id} className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${message.sender === 'customer' ? 'bg-asteria-primary text-white' : 'bg-white text-stone-700 border border-asteria-cream/70'}`}>
                          <div className="text-sm leading-relaxed">{message.text}</div>
                          {message.images && message.images.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mt-3">
                              {message.images.map((image, index) => (
                                <img key={`${message.id}-customer-chat-${index}`} src={image} className="aspect-square w-full rounded-xl object-cover border border-white/40" alt="chat upload" />
                              ))}
                            </div>
                          )}
                          <div className={`text-[11px] mt-2 ${message.sender === 'customer' ? 'text-white/70' : 'text-stone-400'}`}>{message.sender === 'customer' ? '你' : 'Asteria'} · {formatEntryDate(message.createdAt)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-[auto_1fr_auto] gap-3">
                <label className="inline-flex items-center justify-center gap-2 border border-asteria-cream bg-white text-asteria-primary px-4 py-3 rounded-xl font-bold cursor-pointer hover:border-asteria-primary transition-all">
                  <i className="fa-regular fa-images"></i>
                  <span className="hidden sm:inline">圖片</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => handleImageUpload(event.target.files, setChatImages)} />
                </label>
                <input value={chatText} onChange={(event) => setChatText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') sendChatMessage(); }} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="留言比客服，會自動留 record..." />
                <button onClick={sendChatMessage} className="btn-primary px-5 py-3 rounded-xl font-bold">送出</button>
              </div>
              {chatImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
                  {chatImages.map((image, index) => (
                    <img key={`chat-preview-${index}`} src={image} className="aspect-square rounded-xl object-cover border border-asteria-cream" alt="chat upload preview" />
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-asteria-cream/70 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <div className="text-sm text-stone-400">寫新記錄</div>
                  <h2 className="text-2xl font-bold text-asteria-dark">{activeCustomer?.name} 的 update</h2>
                </div>
                <span className="bg-asteria-blue/40 text-asteria-dark text-xs font-bold px-3 py-1 rounded-full">客人可見</span>
              </div>

              <div className="grid gap-5">
                <div>
                  <label className="block text-sm font-bold text-asteria-dark mb-2">關係 update</label>
                  <textarea value={relationshipText} onChange={(event) => setRelationshipText(event.target.value)} className="w-full min-h-40 border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="例如：今日有無聯絡、對方態度、事件進展..." />
                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="inline-flex items-center justify-center gap-2 border border-asteria-cream bg-white text-asteria-primary px-4 py-2 rounded-xl font-bold cursor-pointer hover:border-asteria-primary transition-all">
                      <i className="fa-regular fa-images"></i> 加圖片
                      <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => handleImageUpload(event.target.files, setRelationshipImages)} />
                    </label>
                    <button onClick={() => addEntry('relationship', relationshipText, relationshipImages, () => { setRelationshipText(''); setRelationshipImages([]); })} className="bg-asteria-primary text-white px-4 py-2 rounded-xl font-bold">加入 timeline</button>
                  </div>
                  {relationshipImages.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                      {relationshipImages.map((image, index) => (
                        <img key={`relationship-${index}`} src={image} className="aspect-square rounded-xl object-cover border border-asteria-cream" alt="relationship upload preview" />
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-asteria-dark mb-2">心情日記 / 反思</label>
                  <textarea value={moodText} onChange={(event) => setMoodText(event.target.value)} className="w-full min-h-40 border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="例如：今日學到咩、自己有咩改進、感情上的感悟..." />
                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="inline-flex items-center justify-center gap-2 border border-asteria-cream bg-white text-asteria-primary px-4 py-2 rounded-xl font-bold cursor-pointer hover:border-asteria-primary transition-all">
                      <i className="fa-regular fa-images"></i> 加圖片
                      <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => handleImageUpload(event.target.files, setMoodImages)} />
                    </label>
                    <button onClick={() => addEntry('mood', moodText, moodImages, () => { setMoodText(''); setMoodImages([]); })} className="bg-asteria-primary text-white px-4 py-2 rounded-xl font-bold">加入日記</button>
                  </div>
                  {moodImages.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                      {moodImages.map((image, index) => (
                        <img key={`mood-${index}`} src={image} className="aspect-square rounded-xl object-cover border border-asteria-cream" alt="mood upload preview" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-asteria-cream/70 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-asteria-dark mb-3">想睇咩教學 type</h2>
              <div className="flex flex-wrap gap-2 mb-5">
                {TEACHING_TYPES.map((interest) => (
                  <button key={interest} onClick={() => toggleInterest(interest)} className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${activeCustomer?.interests.includes(interest) ? 'bg-asteria-primary text-white border-asteria-primary' : 'bg-white text-stone-500 border-asteria-cream hover:border-asteria-primary'}`}>
                    {interest}
                  </button>
                ))}
              </div>
              <div className="grid md:grid-cols-[1fr_auto] gap-3">
                <input value={questionText} onChange={(event) => setQuestionText(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="問題 box：你想 Asteria 寫咩題目？" />
                <button onClick={() => addEntry('question', questionText, questionImages, () => { setQuestionText(''); setQuestionImages([]); })} className="btn-primary px-5 py-3 rounded-xl font-bold">提交</button>
              </div>
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="inline-flex items-center justify-center gap-2 border border-asteria-cream bg-white text-asteria-primary px-4 py-2 rounded-xl font-bold cursor-pointer hover:border-asteria-primary transition-all">
                  <i className="fa-regular fa-images"></i> 問題補圖
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => handleImageUpload(event.target.files, setQuestionImages)} />
                </label>
                <span className="text-xs text-stone-400">可以放對話截圖、story、對方回覆。</span>
              </div>
              {questionImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                  {questionImages.map((image, index) => (
                    <img key={`question-${index}`} src={image} className="aspect-square rounded-xl object-cover border border-asteria-cream" alt="question upload preview" />
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-6">
              <div className="hidden">
                <h2 className="text-xl font-bold text-asteria-dark mb-4">你的 timeline</h2>
                <div className="space-y-4 max-h-[430px] overflow-y-auto pr-2">
                  {[...(activeCustomer?.entries || [])].reverse().map((entry) => {
                    const meta = entryLabels[entry.type];
                    return (
                      <div key={entry.id} className="border-l-4 border-asteria-yellow pl-4">
                        <div className={`inline-flex items-center gap-2 ${meta.tone} text-xs font-bold px-3 py-1 rounded-full mb-2`}>
                          <i className={meta.icon}></i> {meta.label}
                        </div>
                        <p className="text-stone-600 leading-relaxed">{entry.text}</p>
                        <div className="text-xs text-stone-400 mt-2">{formatEntryDate(entry.createdAt)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-asteria-cream/70 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-asteria-dark mb-4">推送內容</h2>
                <div className="mb-6">
                  <div className="text-sm font-bold text-stone-500 mb-2">建議教學文</div>
                  <div className="grid gap-2">
                    {(activeCustomer?.interests || []).slice(0, 4).map((interest) => (
                      <a key={interest} href="#teaching" className="bg-[#FFF8EC] border border-asteria-cream/70 rounded-xl px-4 py-3 text-sm font-bold text-asteria-dark hover:border-asteria-primary transition-all">
                        {interest} 相關相處教學 <i className="fa-solid fa-arrow-right ml-1 text-asteria-primary"></i>
                      </a>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-stone-500 mb-2">類似好評 case</div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {(recommendedCases.length ? recommendedCases : REVIEW_CASES.slice(0, 2)).map((item) => (
                      <div key={item.title} className="border border-dashed border-asteria-yellow/70 rounded-xl p-4 bg-white">
                        <div className="text-xs font-bold text-asteria-primary mb-1">#{item.tag}</div>
                        <div className="font-bold text-asteria-dark">{item.title}</div>
                        <p className="text-xs text-stone-500 mt-1">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

const SpacePortalPage = () => {
  const [customers, setCustomers] = useState<PortalCustomer[]>(loadPortalCustomers);
  const [accounts, setAccounts] = useState<SystemAccount[]>(loadSystemAccounts);
  const currentCustomerId = window.localStorage.getItem('asteriaCurrentCustomerId');
  const [activeCustomerId] = useState(currentCustomerId || customers[0]?.id || DEFAULT_CUSTOMERS[0].id);
  const [chatText, setChatText] = useState('');
  const [chatImages, setChatImages] = useState<string[]>([]);
  const [chatImageFiles, setChatImageFiles] = useState<File[]>([]);
  const [backendThreadId, setBackendThreadId] = useState<string | null>(null);
  const [spaceMessage, setSpaceMessage] = useState('');
  const [spaceView, setSpaceView] = useState<'dashboard' | 'chat' | 'profile'>('dashboard');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const activeCustomer = customers.find((customer) => customer.id === activeCustomerId) || customers[0];
  const [profileName, setProfileName] = useState(activeCustomer?.name || '');
  const [profilePhone, setProfilePhone] = useState(activeCustomer?.phone || '');
  const [profileWhatsapp, setProfileWhatsapp] = useState(activeCustomer?.whatsapp || activeCustomer?.phone || '');
  const [profileIg, setProfileIg] = useState(activeCustomer?.igHandle || '');
  const [profileTelegram, setProfileTelegram] = useState(activeCustomer?.telegramHandle || '');
  const [profileEmail, setProfileEmail] = useState(activeCustomer?.email || '');
  const [profileSelfName, setProfileSelfName] = useState(activeCustomer?.targetName || '');
  const [profileMessage, setProfileMessage] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const needsFirstProfile = !activeCustomer?.phone && !activeCustomer?.whatsapp && !activeCustomer?.igHandle && !activeCustomer?.telegramHandle && !activeCustomer?.email && !activeCustomer?.targetName;

  useEffect(() => {
    if (isBackendConfigured) return;
    savePortalCustomers(customers);
  }, [customers]);

  useEffect(() => {
    saveSystemAccounts(accounts);
  }, [accounts]);

  const loadBackendSpace = async () => {
    if (!isBackendConfigured) return;
    try {
      const space = await getMySpace();
      const imageMap = await getSignedImageMap(space.messages.flatMap((message) => message.image_urls || []));
      const mappedMessages: ChatMessage[] = space.messages.map((message) => ({
        id: message.id,
        sender: message.sender_role === 'admin' ? 'admin' : 'customer',
        text: message.body,
        images: (message.image_urls || []).map((path) => imageMap[path] || path),
        createdAt: message.created_at
      }));
      const profile = space.profile;
      const nextCustomer: PortalCustomer = {
        id: space.account.user_id,
        name: profile?.display_name || space.account.label,
        phone: profile?.phone_number || '',
        whatsapp: profile?.whatsapp || '',
        igHandle: profile?.ig_handle || '',
        telegramHandle: profile?.telegram_handle || '',
        email: profile?.contact_email || space.account.contact_email || '',
        targetName: profile?.self_name || '',
        originalChannel: 'Asteria Space',
        interests: activeCustomer?.interests || [],
        entries: activeCustomer?.entries || [],
        messages: mappedMessages
      };
      setBackendThreadId(space.thread.id);
      setCustomers((current) => [nextCustomer, ...current.filter((customer) => customer.id !== nextCustomer.id)]);
      window.localStorage.setItem('asteriaCurrentCustomerId', nextCustomer.id);
      setProfileName(nextCustomer.name);
      setProfilePhone(nextCustomer.phone);
      setProfileWhatsapp(nextCustomer.whatsapp || nextCustomer.phone);
      setProfileIg(nextCustomer.igHandle || '');
      setProfileTelegram(nextCustomer.telegramHandle || '');
      setProfileEmail(nextCustomer.email || '');
      setProfileSelfName(nextCustomer.targetName || '');
    } catch (error) {
      setSpaceMessage(error instanceof Error ? error.message : 'Asteria Space 資料暫時載入唔到。');
    }
  };

  useEffect(() => {
    loadBackendSpace();
  }, []);

  const updateCustomer = (updater: (customer: PortalCustomer) => PortalCustomer) => {
    if (!activeCustomer) return;
    setCustomers((current) => current.map((customer) => customer.id === activeCustomer.id ? updater(customer) : customer));
  };

  const handleImageUpload = async (files: FileList | null) => {
    setChatImageFiles((current) => [...current, ...Array.from(files || [])]);
    const images = await readFilesAsDataUrls(files);
    setChatImages((current) => [...current, ...images]);
  };

  const sendChatMessage = async () => {
    const trimmed = chatText.trim();
    if ((!trimmed && chatImages.length === 0) || !activeCustomer) return;
    if (isBackendConfigured && backendThreadId) {
      try {
        const imagePaths = chatImageFiles.length ? await uploadSpaceImages(chatImageFiles) : [];
        const message = await sendMyMessage(backendThreadId, trimmed, imagePaths);
        const imageMap = await getSignedImageMap(message.image_urls || []);
        updateCustomer((customer) => ({
          ...customer,
          messages: [
            ...(customer.messages || []),
            {
              id: message.id,
              sender: 'customer',
              text: message.body,
              images: (message.image_urls || []).map((path) => imageMap[path] || path),
              createdAt: message.created_at
            }
          ]
        }));
        setChatText('');
        setChatImages([]);
        setChatImageFiles([]);
        setSpaceMessage('');
      } catch (error) {
        setSpaceMessage(error instanceof Error ? error.message : '訊息送出失敗。');
      }
      return;
    }
    updateCustomer((customer) => ({
      ...customer,
      messages: [
        ...(customer.messages || []),
        { id: Date.now(), sender: 'customer', text: trimmed, images: chatImages, createdAt: new Date().toISOString() }
      ]
    }));
    setChatText('');
    setChatImages([]);
    setChatImageFiles([]);
  };

  const changePassword = () => {
    const currentUsername = window.localStorage.getItem('asteriaCurrentUsername');
    const account = accounts.find((item) => item.username === currentUsername);
    if (!account) {
      setPasswordMessage('請先登入你的 account。');
      return;
    }
    if (account.password !== oldPassword.trim()) {
      setPasswordMessage('舊密碼不正確。');
      return;
    }
    if (newPassword.trim().length < 6) {
      setPasswordMessage('新密碼最少 6 個字。');
      return;
    }
    setAccounts((current) => current.map((item) => item.email === account.email ? { ...item, password: newPassword.trim() } : item));
    setOldPassword('');
    setNewPassword('');
    setPasswordMessage('密碼已更新。');
  };

  const saveProfile = () => {
    if (isBackendConfigured) {
      upsertMyProfile({
        display_name: profileName.trim() || activeCustomer?.name || 'Asteria Space user',
        self_name: profileSelfName.trim(),
        phone_number: profilePhone.trim(),
        whatsapp: profileWhatsapp.trim(),
        ig_handle: profileIg.trim(),
        telegram_handle: profileTelegram.trim(),
        contact_email: profileEmail.trim()
      }).catch((error) => {
        setProfileMessage(error instanceof Error ? error.message : '資料暫時儲存唔到。');
      });
    }
    updateCustomer((customer) => ({
      ...customer,
      name: profileName.trim() || customer.name,
      phone: profilePhone.trim(),
      whatsapp: profileWhatsapp.trim(),
      igHandle: profileIg.trim(),
      telegramHandle: profileTelegram.trim(),
      email: profileEmail.trim(),
      targetName: profileSelfName.trim()
    }));
    setProfileMessage('資料已更新。');
    setIsEditingProfile(false);
  };

  if (needsFirstProfile) {
    return (
      <main className="pt-56 md:pt-40 pb-20 bg-[#FFFDF8] min-h-screen">
        <div className="container mx-auto px-6 max-w-3xl">
          <section className="bg-white border border-asteria-cream/70 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="text-sm font-bold text-asteria-primary mb-2">Asteria Space</div>
            <h1 className="text-3xl font-bold text-asteria-dark mb-3">第一次登入，請補回聯絡資料</h1>
            <p className="text-stone-500 leading-relaxed mb-6">
              Account 已由 Asteria 開好。請填低常用聯絡方法，之後就算 IG / WhatsApp 其中一邊失效，我哋都搵得返你。
            </p>
            <div className="grid gap-4">
              <input value={profileSelfName} onChange={(event) => setProfileSelfName(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="自己名 / 真名" />
              <input value={profilePhone} onChange={(event) => setProfilePhone(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Phone number" />
              <input value={profileWhatsapp} onChange={(event) => setProfileWhatsapp(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="WhatsApp" />
              <input value={profileTelegram} onChange={(event) => setProfileTelegram(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Telegram" />
              <input value={profileIg} onChange={(event) => setProfileIg(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Instagram username" />
              <input value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Email" />
            </div>
            <button onClick={saveProfile} className="btn-primary w-full rounded-xl px-6 py-3 font-bold mt-6">儲存並進入 Space</button>
            {profileMessage && <div className="text-sm font-bold text-asteria-primary mt-3">{profileMessage}</div>}
            {spaceMessage && <div className="text-sm font-bold text-red-500 mt-3">{spaceMessage}</div>}
          </section>
        </div>
      </main>
    );
  }

  if (spaceView === 'chat') {
    return (
      <main className="pt-56 md:pt-40 bg-[#FFFDF8] min-h-screen flex flex-col">
        <div className="container mx-auto px-4 max-w-4xl flex-1 flex flex-col pb-4">
          <section className="bg-white border border-asteria-cream/70 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[calc(100vh-230px)]">
            <div className="p-4 border-b border-asteria-cream/70 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <button onClick={() => setSpaceView('dashboard')} className="inline-flex items-center gap-2 text-asteria-primary font-bold text-sm mb-2">
                  <i className="fa-solid fa-arrow-left"></i> 返回 Space
                </button>
                <div className="font-bold text-asteria-dark text-lg">Inbox</div>
                <div className="text-xs text-stone-400">{(activeCustomer?.messages || []).length} 則訊息 · 可 upload 對話截圖</div>
                {spaceMessage && <div className="text-xs font-bold text-red-500 mt-1">{spaceMessage}</div>}
              </div>
              <span className="text-sm font-bold text-asteria-primary bg-asteria-yellow/25 px-3 py-2 rounded-xl">Asteria Space</span>
            </div>

            <div className="flex-1 bg-[#FFF8EC] p-5 overflow-y-auto">
              {(activeCustomer?.messages || []).length === 0 ? (
                <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-center text-stone-500">
                  <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-asteria-primary text-xl mb-4">
                    <i className="fa-regular fa-comments"></i>
                  </div>
                  <div className="font-bold text-asteria-dark mb-2">暫時未有訊息</div>
                  <p className="text-sm">可以喺下面留言，或者 upload 對話截圖比客服跟進。</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(activeCustomer?.messages || []).map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${message.sender === 'customer' ? 'bg-asteria-primary text-white' : 'bg-white text-stone-700 border border-asteria-cream/70'}`}>
                        {message.text && <div className="text-sm leading-relaxed">{message.text}</div>}
                        {message.images && message.images.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            {message.images.map((image, index) => (
                              <img key={`${message.id}-space-chat-full-${index}`} src={image} className="aspect-square w-full rounded-xl object-cover border border-white/40" alt="chat upload" />
                            ))}
                          </div>
                        )}
                        <div className={`text-[11px] mt-2 ${message.sender === 'customer' ? 'text-white/70' : 'text-stone-400'}`}>
                          {message.sender === 'customer' ? '你' : 'Asteria'} · {formatEntryDate(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {chatImages.length > 0 && (
              <div className="px-4 pt-3 bg-white border-t border-asteria-cream/70 grid grid-cols-4 sm:grid-cols-6 gap-2">
                {chatImages.map((image, index) => (
                  <img key={`space-chat-preview-full-${index}`} src={image} className="aspect-square rounded-xl object-cover border border-asteria-cream" alt="screenshot preview" />
                ))}
              </div>
            )}

            <div className="p-4 bg-white border-t border-asteria-cream/70 grid grid-cols-[auto_1fr_auto] gap-3">
              <label className="inline-flex items-center justify-center border border-asteria-cream bg-white text-asteria-primary w-12 h-12 rounded-xl font-bold cursor-pointer hover:border-asteria-primary transition-all" title="upload screenshot">
                <i className="fa-regular fa-images"></i>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => handleImageUpload(event.target.files)} />
              </label>
              <input value={chatText} onChange={(event) => setChatText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') sendChatMessage(); }} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="留言 / 補充最近情況..." />
              <button onClick={sendChatMessage} className="btn-primary px-5 py-3 rounded-xl font-bold">
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (spaceView === 'profile') {
    return (
      <main className="pt-56 md:pt-40 pb-20 bg-[#FFFDF8] min-h-screen">
        <div className="container mx-auto px-6 max-w-3xl">
          <button onClick={() => setSpaceView('dashboard')} className="inline-flex items-center gap-2 text-asteria-primary font-bold mb-6">
            <i className="fa-solid fa-arrow-left"></i> 返回 Space
          </button>
          <section className="bg-white border border-asteria-cream/70 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="text-sm font-bold text-asteria-primary mb-2">Asteria Space</div>
            <h1 className="text-3xl font-bold text-asteria-dark mb-3">修改你的聯絡資料</h1>
            <p className="text-stone-500 leading-relaxed mb-6">呢度只係更新資料，不會跳返登入頁。</p>
            <div className="grid gap-4">
              <input value={profileName} onChange={(event) => setProfileName(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="你的稱呼" />
              <input value={profilePhone} onChange={(event) => setProfilePhone(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="WhatsApp 電話" />
              <input value={profileIg} onChange={(event) => setProfileIg(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Instagram username" />
              <input value={profileTelegram} onChange={(event) => setProfileTelegram(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Telegram username / phone" />
              <input value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Email" />
              <input value={profileSelfName} onChange={(event) => setProfileSelfName(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="自己名 / 真名" />
            </div>
            <button onClick={saveProfile} className="btn-primary w-full rounded-xl px-6 py-3 font-bold mt-6">儲存資料</button>
            {profileMessage && <div className="text-sm font-bold text-asteria-primary mt-3">{profileMessage}</div>}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-56 md:pt-40 pb-20 bg-[#FFFDF8] min-h-screen">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
          <div>
            <a href="#home" className="inline-flex items-center gap-2 text-asteria-primary font-bold mb-6">
              <i className="fa-solid fa-arrow-left"></i> 返回首頁
            </a>
            <div className="text-sm font-bold text-asteria-primary mb-2">Asteria Space</div>
            <h1 className="text-4xl font-bold text-asteria-dark mb-3">你的私人聯絡空間</h1>
            <p className="text-stone-500 max-w-2xl leading-relaxed">
              WhatsApp 用嚟即時傾；Asteria Space 用嚟保留重要訊息、對話截圖同聯絡資料。就算 IG / WhatsApp 任何一邊失效，我哋都搵得返你。
            </p>
          </div>
        </div>

        <section className="bg-white border border-asteria-cream/70 rounded-2xl p-5 md:p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-stone-400 mb-1">Login</div>
              <h2 className="text-2xl font-bold text-asteria-dark">{activeCustomer?.name || 'Asteria Space user'}</h2>
              <p className="text-sm text-stone-500 mt-1">系統登入已開啟，客人只會見到自己的資料。</p>
            </div>
            <span className="bg-asteria-yellow/35 text-asteria-dark rounded-xl px-5 py-3 font-bold flex items-center justify-center gap-2">
              <i className="fa-solid fa-circle-check text-asteria-primary"></i> 已登入
            </span>
          </div>
        </section>

        <section className="grid gap-6">
          <div className="bg-white border border-asteria-cream/70 rounded-2xl p-5 md:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <div className="text-sm text-stone-400">Password</div>
                <h2 className="text-2xl font-bold text-asteria-dark">更改密碼</h2>
              </div>
              <span className="bg-asteria-yellow/35 text-asteria-dark text-xs font-bold px-3 py-1 rounded-full">客人自己操作</span>
            </div>
            <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3">
              <input type="password" value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="舊密碼" />
              <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="新密碼" />
              <button onClick={changePassword} className="btn-primary px-5 py-3 rounded-xl font-bold">更新</button>
            </div>
            {passwordMessage && <div className="text-sm font-bold text-asteria-primary mt-3">{passwordMessage}</div>}
          </div>

          <div className="bg-white border border-asteria-cream/70 rounded-2xl p-5 md:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <div className="text-sm text-stone-400">Basic Profile</div>
                <h2 className="text-2xl font-bold text-asteria-dark">你的聯絡資料</h2>
              </div>
              <button onClick={() => { setIsEditingProfile(true); setProfileMessage(''); }} className="bg-white border border-asteria-cream text-asteria-primary px-4 py-2 rounded-xl font-bold inline-flex items-center justify-center gap-2 hover:border-asteria-primary transition-all">
                <i className="fa-regular fa-pen-to-square"></i> Edit
              </button>
            </div>

            {isEditingProfile ? (
              <div className="grid gap-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <input value={profileSelfName} onChange={(event) => setProfileSelfName(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="自己名 / 真名" />
                  <input value={profilePhone} onChange={(event) => setProfilePhone(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Phone number" />
                  <input value={profileWhatsapp} onChange={(event) => setProfileWhatsapp(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="WhatsApp" />
                  <input value={profileTelegram} onChange={(event) => setProfileTelegram(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Telegram" />
                  <input value={profileIg} onChange={(event) => setProfileIg(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Instagram username" />
                  <input value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Email" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-sm text-stone-400">{profileMessage || '修改完記得儲存。'}</div>
                  <button onClick={saveProfile} className="btn-primary px-6 py-3 rounded-xl font-bold sm:self-end">Save</button>
                </div>
              </div>
            ) : (
            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-[#FFF8EC] rounded-xl p-4">
                <div className="text-xs text-stone-400 mb-1">Phone number</div>
                <div className="font-bold text-asteria-dark break-all">{activeCustomer?.phone || '未登記'}</div>
              </div>
              <div className="bg-[#FFF8EC] rounded-xl p-4">
                <div className="text-xs text-stone-400 mb-1">WhatsApp</div>
                <div className="font-bold text-asteria-dark break-all">{activeCustomer?.whatsapp || activeCustomer?.phone || '未登記'}</div>
              </div>
              <div className="bg-[#FFF8EC] rounded-xl p-4">
                <div className="text-xs text-stone-400 mb-1">Telegram</div>
                <div className="font-bold text-asteria-dark break-all">{activeCustomer?.telegramHandle || '未登記'}</div>
              </div>
              <div className="bg-[#FFF8EC] rounded-xl p-4">
                <div className="text-xs text-stone-400 mb-1">Instagram</div>
                <div className="font-bold text-asteria-dark break-all">{activeCustomer?.igHandle || '未登記'}</div>
              </div>
              <div className="bg-[#FFF8EC] rounded-xl p-4">
                <div className="text-xs text-stone-400 mb-1">Email</div>
                <div className="font-bold text-asteria-dark break-all">{activeCustomer?.email || '未登記'}</div>
              </div>
              <div className="bg-[#FFF8EC] rounded-xl p-4">
                <div className="text-xs text-stone-400 mb-1">自己名</div>
                <div className="font-bold text-asteria-dark break-all">{activeCustomer?.targetName || '未填'}</div>
              </div>
            </div>
            )}
          </div>

          {spaceView === 'dashboard' && (
            <button onClick={() => setSpaceView('chat')} className="bg-asteria-dark text-white rounded-2xl p-5 md:p-6 shadow-sm text-left flex items-center justify-between gap-4 hover:brightness-110 transition-all">
              <div>
                <div className="text-sm text-white/70">Message Thread</div>
                <div className="text-2xl font-bold">進入 Inbox</div>
                <div className="text-sm text-white/70 mt-1">{(activeCustomer?.messages || []).length} 則訊息 · 可 upload 對話截圖</div>
              </div>
              <i className="fa-solid fa-arrow-right text-2xl"></i>
            </button>
          )}

          {spaceView === 'chat' && (
          <div className="bg-white border border-asteria-cream/70 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 md:p-6 border-b border-asteria-cream/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <button onClick={() => setSpaceView('dashboard')} className="inline-flex items-center gap-2 text-asteria-primary font-bold text-sm mb-2">
                  <i className="fa-solid fa-arrow-left"></i> 返回 Space
                </button>
                <div className="text-sm text-stone-400">Message Thread</div>
                <h2 className="text-2xl font-bold text-asteria-dark">Inbox</h2>
              </div>
              <span className="bg-asteria-blue/40 text-asteria-dark text-xs font-bold px-3 py-1 rounded-full">
                {(activeCustomer?.messages || []).length} 則訊息
              </span>
            </div>

            <div className="bg-[#FFF8EC] p-5 min-h-[420px] max-h-[560px] overflow-y-auto">
              {(activeCustomer?.messages || []).length === 0 ? (
                <div className="h-[360px] flex flex-col items-center justify-center text-center text-stone-500">
                  <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-asteria-primary text-xl mb-4">
                    <i className="fa-regular fa-comments"></i>
                  </div>
                  <div className="font-bold text-asteria-dark mb-2">暫時未有訊息</div>
                  <p className="text-sm">可以喺下面留言，或者 upload 對話截圖比客服跟進。</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(activeCustomer?.messages || []).map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${message.sender === 'customer' ? 'bg-asteria-primary text-white' : 'bg-white text-stone-700 border border-asteria-cream/70'}`}>
                        {message.text && <div className="text-sm leading-relaxed">{message.text}</div>}
                        {message.images && message.images.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            {message.images.map((image, index) => (
                              <img key={`${message.id}-space-chat-${index}`} src={image} className="aspect-square w-full rounded-xl object-cover border border-white/40" alt="chat upload" />
                            ))}
                          </div>
                        )}
                        <div className={`text-[11px] mt-2 ${message.sender === 'customer' ? 'text-white/70' : 'text-stone-400'}`}>
                          {message.sender === 'customer' ? '你' : 'Asteria'} · {formatEntryDate(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {chatImages.length > 0 && (
              <div className="px-5 pt-4 bg-white border-t border-asteria-cream/70 grid grid-cols-4 sm:grid-cols-6 gap-2">
                {chatImages.map((image, index) => (
                  <img key={`space-chat-preview-${index}`} src={image} className="aspect-square rounded-xl object-cover border border-asteria-cream" alt="screenshot preview" />
                ))}
              </div>
            )}

            <div className="p-4 md:p-5 bg-white border-t border-asteria-cream/70 grid grid-cols-[auto_1fr_auto] gap-3">
              <label className="inline-flex items-center justify-center border border-asteria-cream bg-white text-asteria-primary w-12 h-12 rounded-xl font-bold cursor-pointer hover:border-asteria-primary transition-all" title="upload screenshot">
                <i className="fa-regular fa-images"></i>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => handleImageUpload(event.target.files)} />
              </label>
              <input value={chatText} onChange={(event) => setChatText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') sendChatMessage(); }} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="留言 / 補充最近情況..." />
              <button onClick={sendChatMessage} className="btn-primary px-5 py-3 rounded-xl font-bold">
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </div>
          )}
        </section>
      </div>
    </main>
  );
};

const AdminPage = () => {
  const [customers, setCustomers] = useState<PortalCustomer[]>(loadPortalCustomers);
  const [activeCustomerId, setActiveCustomerId] = useState(customers[0]?.id || DEFAULT_CUSTOMERS[0].id);
  const [adminReply, setAdminReply] = useState('');
  const activeCustomer = customers.find((customer) => customer.id === activeCustomerId) || customers[0];

  useEffect(() => {
    const sync = () => setCustomers(loadPortalCustomers());
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  useEffect(() => {
    savePortalCustomers(customers);
  }, [customers]);

  const sendAdminReply = () => {
    const trimmed = adminReply.trim();
    if (!trimmed || !activeCustomer) return;
    setCustomers((current) => current.map((customer) => customer.id === activeCustomer.id ? {
      ...customer,
      messages: [
        ...(customer.messages || []),
        { id: Date.now(), sender: 'admin', text: trimmed, createdAt: new Date().toISOString() }
      ]
    } : customer));
    setAdminReply('');
  };

  return (
    <main className="pt-56 md:pt-40 pb-20 bg-[#FFFDF8] min-h-screen">
      <div className="container mx-auto px-6 max-w-7xl">
        <a href="#portal" className="inline-flex items-center gap-2 text-asteria-primary font-bold mb-6">
          <i className="fa-solid fa-arrow-left"></i> 返回會員入口
        </a>
        <div className="mb-10">
          <div className="text-sm font-bold text-asteria-primary mb-2">Admin 後台</div>
          <h1 className="text-4xl font-bold text-asteria-dark mb-3">客服跟進 Dashboard</h1>
          <p className="text-stone-500">呢版係後台原型：之後接真 database，就可以睇晒客人 update、AI summary、好評 tag 推送。</p>
          <a href="#inbox" className="mt-5 inline-flex items-center gap-2 bg-asteria-primary text-white px-5 py-3 rounded-xl font-bold shadow-sm hover:shadow-md transition-all">
            <i className="fa-solid fa-comments"></i> 進入客服 Inbox
          </a>
        </div>

        <div className="grid lg:grid-cols-[360px_1fr] gap-8 items-start">
          <aside className="bg-white border border-asteria-cream/70 rounded-2xl p-5 shadow-sm">
            <div className="text-sm font-bold text-stone-500 mb-3">客人列表</div>
            <div className="grid gap-2">
              {customers.map((customer) => (
                <button key={customer.id} onClick={() => setActiveCustomerId(customer.id)} className={`text-left p-4 rounded-xl border transition-all ${activeCustomer?.id === customer.id ? 'bg-asteria-yellow/25 border-asteria-primary' : 'border-asteria-cream/70 hover:bg-asteria-yellow/15'}`}>
                  <div className="font-bold text-asteria-dark">{customer.name}</div>
                  <div className="text-xs text-stone-400 mt-1">{customer.phone || customer.igHandle || customer.telegramHandle || '未有聯絡資料'}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {customer.interests.slice(0, 3).map((interest) => (
                      <span key={interest} className="bg-white text-asteria-primary border border-asteria-cream rounded-full px-2 py-0.5 text-[11px] font-bold">#{interest}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section className="grid gap-6">
            <div className="bg-white border border-asteria-cream/70 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
                <div>
                  <div className="text-sm text-stone-400">Profile</div>
                  <h2 className="text-2xl font-bold text-asteria-dark">{activeCustomer?.name}</h2>
                  <div className="text-sm text-stone-500 mt-1">原本平台：{activeCustomer?.originalChannel || '未填'}</div>
                </div>
                <div className="bg-asteria-blue/35 border border-asteria-blue rounded-2xl p-4 md:max-w-md">
                  <div className="text-xs font-bold text-asteria-primary mb-2">AI SUMMARY</div>
                  <p className="text-sm text-stone-600 leading-relaxed">{activeCustomer ? buildSummary(activeCustomer) : '未有客人資料。'}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-3 mb-5">
                <div className="bg-white border border-asteria-cream/70 rounded-xl p-4">
                  <div className="text-xs text-stone-400 mb-1">WhatsApp</div>
                  <div className="font-bold text-asteria-dark break-all">{activeCustomer?.phone || '未登記'}</div>
                </div>
                <div className="bg-white border border-asteria-cream/70 rounded-xl p-4">
                  <div className="text-xs text-stone-400 mb-1">Instagram</div>
                  <div className="font-bold text-asteria-dark break-all">{activeCustomer?.igHandle || '未登記'}</div>
                </div>
                <div className="bg-white border border-asteria-cream/70 rounded-xl p-4">
                  <div className="text-xs text-stone-400 mb-1">Telegram</div>
                  <div className="font-bold text-asteria-dark break-all">{activeCustomer?.telegramHandle || '未登記'}</div>
                </div>
                <div className="bg-white border border-asteria-cream/70 rounded-xl p-4">
                  <div className="text-xs text-stone-400 mb-1">Email</div>
                  <div className="font-bold text-asteria-dark break-all">{activeCustomer?.email || '未登記'}</div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <div className="bg-[#FFF8EC] rounded-xl p-4">
                  <div className="text-2xl font-bold text-asteria-dark">{activeCustomer?.entries.length || 0}</div>
                  <div className="text-xs text-stone-500">總 update</div>
                </div>
                <div className="bg-[#FFF8EC] rounded-xl p-4">
                  <div className="text-2xl font-bold text-asteria-dark">{activeCustomer?.interests.length || 0}</div>
                  <div className="text-xs text-stone-500">教學偏好</div>
                </div>
                <div className="bg-[#FFF8EC] rounded-xl p-4">
                  <div className="text-2xl font-bold text-asteria-dark">{REVIEW_CASES.filter((item) => activeCustomer?.interests.includes(item.tag)).length}</div>
                  <div className="text-xs text-stone-500">可推好評 case</div>
                </div>
              </div>
            </div>

            <div className="hidden">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                <div>
                  <div className="text-sm text-stone-400">客服 Inbox</div>
                  <h3 className="text-xl font-bold text-asteria-dark">Chat Record</h3>
                </div>
                <span className="bg-asteria-blue/40 text-asteria-dark text-xs font-bold px-3 py-1 rounded-full">
                  {(activeCustomer?.messages || []).length} 則訊息
                </span>
              </div>

              <div className="bg-[#FFF8EC] border border-asteria-cream/70 rounded-2xl p-4 max-h-[360px] overflow-y-auto mb-4">
                {(activeCustomer?.messages || []).length === 0 ? (
                  <div className="text-center text-sm text-stone-500 py-8">暫時未有 chat 訊息。</div>
                ) : (
                  <div className="space-y-3">
                    {(activeCustomer?.messages || []).map((message) => (
                      <div key={message.id} className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${message.sender === 'admin' ? 'bg-asteria-primary text-white' : 'bg-white text-stone-700 border border-asteria-cream/70'}`}>
                          <div className="text-xs font-bold mb-1">{message.sender === 'admin' ? 'Asteria' : activeCustomer?.name}</div>
                          <div className="text-sm leading-relaxed">{message.text}</div>
                          <div className={`text-[11px] mt-2 ${message.sender === 'admin' ? 'text-white/70' : 'text-stone-400'}`}>{formatEntryDate(message.createdAt)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-[1fr_auto] gap-3">
                <input value={adminReply} onChange={(event) => setAdminReply(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') sendAdminReply(); }} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="回覆客人，會留喺 chat record..." />
                <button onClick={sendAdminReply} className="btn-primary px-5 py-3 rounded-xl font-bold">回覆</button>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_360px] gap-6">
              <div className="bg-white border border-asteria-cream/70 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-asteria-dark mb-5">Timeline</h3>
                <div className="space-y-5">
                  {[...(activeCustomer?.entries || [])].reverse().map((entry) => {
                    const meta = entryLabels[entry.type];
                    return (
                      <div key={entry.id} className="grid md:grid-cols-[120px_1fr] gap-3 border-b border-asteria-cream/60 pb-5">
                        <div className="text-xs text-stone-400">{formatEntryDate(entry.createdAt)}</div>
                        <div>
                          <div className={`inline-flex items-center gap-2 ${meta.tone} text-xs font-bold px-3 py-1 rounded-full mb-2`}>
                            <i className={meta.icon}></i> {meta.label}
                          </div>
                          <p className="text-stone-600 leading-relaxed">{entry.text}</p>
                          {entry.images && entry.images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                              {entry.images.map((image, index) => (
                                <img key={`${entry.id}-admin-${index}`} src={image} className="aspect-square w-full rounded-xl object-cover border border-asteria-cream" alt="admin update upload" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-asteria-cream/70 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-asteria-dark mb-4">Tag 好評庫</h3>
                <div className="grid gap-3">
                  {REVIEW_CASES.map((item) => (
                    <div key={item.title} className={`rounded-xl border p-4 ${activeCustomer?.interests.includes(item.tag) ? 'border-asteria-primary bg-asteria-yellow/20' : 'border-asteria-cream/70'}`}>
                      <div className="text-xs font-bold text-asteria-primary mb-1">#{item.tag}</div>
                      <div className="font-bold text-asteria-dark">{item.title}</div>
                      <p className="text-xs text-stone-500 mt-1">{item.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

const AdminInboxPage = () => {
  const [customers, setCustomers] = useState<PortalCustomer[]>(loadPortalCustomers);
  const [accounts, setAccounts] = useState<SystemAccount[]>(loadSystemAccounts);
  const [activeCustomerId, setActiveCustomerId] = useState(customers[0]?.id || DEFAULT_CUSTOMERS[0].id);
  const [inboxView, setInboxView] = useState<'list' | 'thread'>('list');
  const [adminView, setAdminView] = useState<'inbox' | 'accounts'>('inbox');
  const [replyText, setReplyText] = useState('');
  const [replyImages, setReplyImages] = useState<string[]>([]);
  const [replyImageFiles, setReplyImageFiles] = useState<File[]>([]);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountUsername, setNewAccountUsername] = useState('');
  const [newAccountEmail, setNewAccountEmail] = useState('');
  const [newAccountPassword, setNewAccountPassword] = useState('');
  const [newAccountRole, setNewAccountRole] = useState<'customer' | 'staff'>('customer');
  const [resetPasswords, setResetPasswords] = useState<Record<string, string>>({});
  const [accountSearch, setAccountSearch] = useState('');
  const [accountMessage, setAccountMessage] = useState('');
  const [readMarkers, setReadMarkers] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(window.localStorage.getItem('asteriaStaffReadMarkers') || '{}') as Record<string, string>;
    } catch {
      return {};
    }
  });
  const activeCustomer = customers.find((customer) => customer.id === activeCustomerId) || customers[0];
  const sortedCustomers = [...customers].sort((a, b) => {
    const aTime = a.messages?.[a.messages.length - 1]?.createdAt || a.entries[a.entries.length - 1]?.createdAt || '';
    const bTime = b.messages?.[b.messages.length - 1]?.createdAt || b.entries[b.entries.length - 1]?.createdAt || '';
    return bTime.localeCompare(aTime);
  });
  const filteredAccounts = accounts.filter((account) => {
    const query = accountSearch.trim().toLowerCase();
    if (!query) return true;
    return account.label.toLowerCase().includes(query) || account.username.toLowerCase().includes(query) || account.email.toLowerCase().includes(query) || account.role.toLowerCase().includes(query);
  });

  useEffect(() => {
    savePortalCustomers(customers);
  }, [customers]);

  useEffect(() => {
    saveSystemAccounts(accounts);
  }, [accounts]);

  const loadBackendInbox = async () => {
    if (!isBackendConfigured) return;
    try {
      const inbox = await listStaffInbox();
      const imageMap = await getSignedImageMap(inbox.flatMap((item) => item.messages.flatMap((message) => message.image_urls || [])));
      const nextCustomers: PortalCustomer[] = inbox.map((item) => {
        const profile = item.profile;
        const account = item.account;
        return {
          id: item.thread.customer_id,
          threadId: item.thread.id,
          name: profile?.display_name || account?.label || account?.username || 'Asteria 客人',
          phone: profile?.phone_number || '',
          whatsapp: profile?.whatsapp || '',
          igHandle: profile?.ig_handle || '',
          telegramHandle: profile?.telegram_handle || '',
          email: profile?.contact_email || account?.contact_email || '',
          targetName: profile?.self_name || '',
          originalChannel: 'Asteria Space',
          interests: [],
          entries: [],
          messages: item.messages.map((message) => ({
            id: message.id,
            sender: message.sender_role === 'admin' ? 'admin' : 'customer',
            text: message.body,
            images: (message.image_urls || []).map((path) => imageMap[path] || path),
            createdAt: message.created_at
          }))
        };
      });
      setCustomers(nextCustomers);
      if (nextCustomers[0]) setActiveCustomerId(nextCustomers[0].id);
    } catch (error) {
      setAccountMessage(error instanceof Error ? error.message : 'Staff inbox 暫時載入唔到。');
    }
  };

  useEffect(() => {
    loadBackendInbox();
  }, []);

  const getUnreadCount = (customer: PortalCustomer) => {
    const messages = customer.messages || [];
    const lastAdminIndex = [...messages].map((message) => message.sender).lastIndexOf('admin');
    const lastAdminTime = lastAdminIndex >= 0 ? messages[lastAdminIndex].createdAt : '';
    const lastReadTime = readMarkers[customer.id] || '';
    const baseline = [lastAdminTime, lastReadTime].sort().at(-1) || '';
    return messages.filter((message) => message.sender === 'customer' && (!baseline || message.createdAt > baseline)).length;
  };

  const openThread = (customerId: string) => {
    setActiveCustomerId(customerId);
    setInboxView('thread');
    setReplyText('');
    setReplyImages([]);
    setReplyImageFiles([]);
    const customer = customers.find((item) => item.id === customerId);
    const latestCustomerMessage = [...(customer?.messages || [])].reverse().find((message) => message.sender === 'customer');
    if (latestCustomerMessage) {
      setReadMarkers((current) => {
        const next = { ...current, [customerId]: latestCustomerMessage.createdAt };
        window.localStorage.setItem('asteriaStaffReadMarkers', JSON.stringify(next));
        return next;
      });
    }
  };

  const sendReply = async () => {
    const trimmed = replyText.trim();
    if ((!trimmed && replyImages.length === 0) || !activeCustomer) return;
    if (isBackendConfigured && activeCustomer.threadId) {
      try {
        const imagePaths = replyImageFiles.length ? await uploadSpaceImages(replyImageFiles, activeCustomer.id) : [];
        const message = await staffSendMessage(activeCustomer.threadId, activeCustomer.id, trimmed, imagePaths);
        const imageMap = await getSignedImageMap(message.image_urls || []);
        setCustomers((current) => current.map((customer) => customer.id === activeCustomer.id ? {
          ...customer,
          messages: [
            ...(customer.messages || []),
            {
              id: message.id,
              sender: 'admin',
              text: message.body,
              images: (message.image_urls || []).map((path) => imageMap[path] || path),
              createdAt: message.created_at
            }
          ]
        } : customer));
        setReplyText('');
        setReplyImages([]);
        setReplyImageFiles([]);
      } catch (error) {
        setAccountMessage(error instanceof Error ? error.message : '回覆送出失敗。');
      }
      return;
    }
    setCustomers((current) => current.map((customer) => customer.id === activeCustomer.id ? {
      ...customer,
      messages: [
        ...(customer.messages || []),
        { id: Date.now(), sender: 'admin', text: trimmed, images: replyImages, createdAt: new Date().toISOString() }
      ]
    } : customer));
    setReplyText('');
    setReplyImages([]);
  };

  const handleReplyImages = async (files: FileList | null) => {
    setReplyImageFiles((current) => [...current, ...Array.from(files || [])]);
    const images = await readFilesAsDataUrls(files);
    setReplyImages((current) => [...current, ...images]);
  };

  const createAccount = async () => {
    const trimmedUsername = newAccountUsername.trim();
    const trimmedEmail = newAccountEmail.trim();
    const trimmedPassword = newAccountPassword.trim();
    const trimmedName = newAccountName.trim() || 'Asteria 客人';
    if (!trimmedUsername || trimmedPassword.length < 6) {
      setAccountMessage('請填 account 名，同最少 6 個字的 password。');
      return;
    }
    if (accounts.some((account) => account.username === trimmedUsername)) {
      setAccountMessage('呢個 account 名已經存在。');
      return;
    }

    if (isBackendConfigured) {
      try {
        const result = await staffCreateAccount({
          username: trimmedUsername,
          password: trimmedPassword,
          label: trimmedName,
          contactEmail: trimmedEmail,
          role: newAccountRole
        });

        let customerId: string | undefined;
        if (result.account.role === 'customer') {
          customerId = result.account.user_id;
          const customer: PortalCustomer = {
            id: customerId,
            name: result.account.label,
            phone: '',
            email: result.account.contact_email || '',
            originalChannel: 'Asteria Space',
            interests: [],
            entries: [],
            messages: []
          };
          setCustomers((current) => [customer, ...current.filter((item) => item.id !== customerId)]);
          setActiveCustomerId(customerId);
        }

        setAccounts((current) => [{
          label: result.account.label,
          username: result.account.username,
          email: result.account.contact_email || '',
          password: '',
          role: result.account.role,
          customerId
        }, ...current.filter((item) => item.username !== result.account.username)]);
        setNewAccountName('');
        setNewAccountUsername('');
        setNewAccountEmail('');
        setNewAccountPassword('');
        setNewAccountRole('customer');
        setAccountMessage('Account 已在 Supabase 新增。');
      } catch (error) {
        setAccountMessage(error instanceof Error ? error.message : '新增 account 失敗。');
      }
      return;
    }

    let customerId: string | undefined;
    if (newAccountRole === 'customer') {
      customerId = `customer-${Date.now()}`;
      const customer: PortalCustomer = {
        id: customerId,
        name: trimmedName,
        phone: '',
        email: trimmedEmail,
        originalChannel: 'Asteria Space',
        interests: [],
        entries: [],
        messages: []
      };
      setCustomers((current) => [customer, ...current]);
      setActiveCustomerId(customerId);
    }

    setAccounts((current) => [{
      label: trimmedName,
      username: trimmedUsername,
      email: trimmedEmail,
      password: trimmedPassword,
      role: newAccountRole,
      customerId
    }, ...current]);
    setNewAccountName('');
    setNewAccountUsername('');
    setNewAccountEmail('');
    setNewAccountPassword('');
    setNewAccountRole('customer');
    setAccountMessage('Account 已新增。');
  };

  const resetAccountPassword = async (username: string) => {
    const nextPassword = (resetPasswords[username] || '').trim();
    if (nextPassword.length < 6) {
      setAccountMessage('新 password 最少 6 個字。');
      return;
    }
    if (isBackendConfigured) {
      try {
        await staffResetPassword({ username, password: nextPassword });
        setResetPasswords((current) => ({ ...current, [username]: '' }));
        setAccountMessage(`${username} password 已在 Supabase reset。`);
      } catch (error) {
        setAccountMessage(error instanceof Error ? error.message : 'Reset password 失敗。');
      }
      return;
    }
    setAccounts((current) => current.map((account) => account.username === username ? { ...account, password: nextPassword } : account));
    setResetPasswords((current) => ({ ...current, [username]: '' }));
    setAccountMessage(`${username} password 已 reset。`);
  };

  const deleteAccount = async (account: SystemAccount) => {
    const confirmed = window.confirm(`Delete account ${account.username}?`);
    if (!confirmed) return;
    if (isBackendConfigured) {
      try {
        await staffDeleteAccount({ username: account.username });
        setAccounts((current) => current.filter((item) => item.username !== account.username));
        if (account.customerId) {
          setCustomers((current) => current.filter((customer) => customer.id !== account.customerId));
        }
        setAccountMessage(`${account.username} 已在 Supabase 刪除。`);
      } catch (error) {
        setAccountMessage(error instanceof Error ? error.message : 'Delete account 失敗。');
      }
      return;
    }
    setAccounts((current) => current.filter((item) => item.username !== account.username));
    if (account.customerId) {
      setCustomers((current) => current.filter((customer) => customer.id !== account.customerId));
      if (activeCustomerId === account.customerId) {
        setActiveCustomerId(customers.find((customer) => customer.id !== account.customerId)?.id || DEFAULT_CUSTOMERS[0].id);
      }
    }
    setAccountMessage(`${account.username} 已刪除。`);
  };

  return (
    <main className="pt-56 md:pt-40 bg-[#FFFDF8] min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <a href="#home" className="inline-flex items-center gap-2 text-asteria-primary font-bold mb-3">
              <i className="fa-solid fa-arrow-left"></i> 返回主頁
            </a>
            <h1 className="text-3xl font-bold text-asteria-dark">客服 Inbox</h1>
          </div>
          <div className="text-sm text-stone-500">Inbox list → 對話頁 · Account search / reset</div>
        </div>

        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          <button onClick={() => { setAdminView('inbox'); setInboxView('list'); }} className={`px-5 py-3 rounded-xl font-bold border whitespace-nowrap ${adminView === 'inbox' ? 'bg-asteria-dark text-white border-asteria-dark' : 'bg-white text-asteria-primary border-asteria-cream'}`}>
            Inbox
          </button>
          <button onClick={() => setAdminView('accounts')} className={`px-5 py-3 rounded-xl font-bold border whitespace-nowrap ${adminView === 'accounts' ? 'bg-asteria-dark text-white border-asteria-dark' : 'bg-white text-asteria-primary border-asteria-cream'}`}>
            Account 管理
          </button>
        </div>

        {adminView === 'accounts' && (
        <section className="bg-white border border-asteria-cream/70 rounded-2xl shadow-sm p-5 mb-5">
          <div className="flex flex-col lg:flex-row lg:items-start gap-5">
            <div className="lg:w-[360px] shrink-0">
              <div className="text-sm text-stone-400">Staff tools</div>
              <h2 className="text-2xl font-bold text-asteria-dark mb-2">Account 管理</h2>
              <p className="text-sm text-stone-500 leading-relaxed">客服可以新增客人 / staff account，亦可以幫客人 reset password。</p>
            </div>

            <div className="grid gap-3 flex-1">
              <div className="grid md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3">
                <input value={newAccountName} onChange={(event) => setNewAccountName(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="客人 / staff 名" />
                <input value={newAccountUsername} onChange={(event) => setNewAccountUsername(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Account 名" />
                <input value={newAccountEmail} onChange={(event) => setNewAccountEmail(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Email 備用聯絡" />
                <input value={newAccountPassword} onChange={(event) => setNewAccountPassword(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="初始 password" />
                <select value={newAccountRole} onChange={(event) => setNewAccountRole(event.target.value as 'customer' | 'staff')} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary bg-white">
                  <option value="customer">客人</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <button onClick={createAccount} className="btn-primary rounded-xl px-5 py-3 font-bold md:w-fit">新增 account</button>
              {accountMessage && <div className="text-sm font-bold text-asteria-primary">{accountMessage}</div>}
              <input value={accountSearch} onChange={(event) => setAccountSearch(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary bg-white mt-2" placeholder="Search account 名 / 客人名 / email" />

              <div className="grid gap-2 mt-2 max-h-[520px] overflow-y-auto pr-1">
                {filteredAccounts.map((account) => (
                  <div key={account.username} className="grid lg:grid-cols-[1fr_130px_1fr_auto_auto] gap-2 items-center bg-[#FFF8EC] rounded-xl p-3">
                    <div>
                      <div className="font-bold text-asteria-dark">{account.label}</div>
                      <div className="text-xs text-stone-500 break-all">account: {account.username}</div>
                      <div className="text-xs text-stone-400 break-all">email: {account.email || '未填'}</div>
                    </div>
                    <div className="text-xs font-bold text-asteria-primary bg-white border border-asteria-cream rounded-full px-3 py-1 w-fit">
                      {account.role === 'staff' ? 'Staff' : '客人'}
                    </div>
                    <input value={resetPasswords[account.username] || ''} onChange={(event) => setResetPasswords((current) => ({ ...current, [account.username]: event.target.value }))} className="border border-asteria-cream rounded-xl px-4 py-2 outline-none focus:border-asteria-primary bg-white" placeholder="輸入新 password" />
                    <button onClick={() => resetAccountPassword(account.username)} className="bg-asteria-dark text-white rounded-xl px-4 py-2 font-bold">Reset</button>
                    <button onClick={() => deleteAccount(account)} className="bg-white text-red-600 border border-red-200 rounded-xl px-4 py-2 font-bold hover:bg-red-50">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        )}

        {adminView === 'inbox' && (
        <div className="min-h-[calc(100vh-230px)]">
          <section className={`${inboxView === 'list' ? 'block' : 'hidden'} bg-white border border-asteria-cream/70 rounded-2xl shadow-sm overflow-hidden`}>
            <div className="p-4 border-b border-asteria-cream/70">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-asteria-dark text-lg">所有對話</div>
                  <div className="text-xs text-stone-400 mt-1">{customers.length} 個客人</div>
                </div>
                <div className="bg-asteria-yellow/35 text-asteria-dark text-xs font-bold px-3 py-1 rounded-full">
                  {customers.reduce((total, customer) => total + getUnreadCount(customer), 0)} 未讀
                </div>
              </div>
            </div>
            <div className="max-h-[calc(100vh-270px)] overflow-y-auto">
              {sortedCustomers.map((customer) => {
                const lastMessage = customer.messages?.[customer.messages.length - 1];
                const unreadCount = getUnreadCount(customer);
                return (
                  <button
                    key={customer.id}
                    onClick={() => openThread(customer.id)}
                    className="w-full text-left p-4 border-b border-asteria-cream/50 hover:bg-[#FFF8EC] transition-all bg-white"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold shrink-0 ${unreadCount ? 'bg-asteria-primary text-white' : 'bg-asteria-blue/45 text-asteria-primary'}`}>
                        {customer.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-bold text-asteria-dark truncate">{customer.name}</div>
                          <div className="flex items-center gap-2 shrink-0">
                            {unreadCount > 0 && (
                              <span className="min-w-6 h-6 px-2 rounded-full bg-asteria-primary text-white text-xs font-bold flex items-center justify-center">
                                {unreadCount}
                              </span>
                            )}
                            <div className="text-[11px] text-stone-400">{lastMessage ? formatEntryDate(lastMessage.createdAt) : ''}</div>
                          </div>
                        </div>
                        <div className="text-xs text-stone-400 mt-0.5">{customer.phone || customer.igHandle || customer.telegramHandle || '未有聯絡資料'}</div>
                        <div className={`text-sm truncate mt-1 ${unreadCount ? 'text-asteria-dark font-bold' : 'text-stone-500'}`}>
                          {lastMessage ? `${lastMessage.sender === 'admin' ? '你：' : ''}${lastMessage.text || '圖片'}` : '未有訊息'}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className={`${inboxView === 'thread' ? 'flex' : 'hidden'} bg-white border border-asteria-cream/70 rounded-2xl shadow-sm overflow-hidden flex-col min-h-[calc(100vh-230px)]`}>
            <div className="p-4 border-b border-asteria-cream/70 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <button onClick={() => setInboxView('list')} className="inline-flex items-center gap-2 text-asteria-primary font-bold text-sm mb-2">
                  <i className="fa-solid fa-arrow-left"></i> 返回所有對話
                </button>
                <div className="font-bold text-asteria-dark text-lg truncate">{activeCustomer?.name}</div>
                <div className="text-xs text-stone-400">
                  WA {activeCustomer?.phone || '未登記'} · TG {activeCustomer?.telegramHandle || '未登記'} · {(activeCustomer?.messages || []).length} 則訊息
                </div>
              </div>
              <span className="text-sm font-bold text-asteria-primary bg-asteria-yellow/25 px-3 py-2 rounded-xl">Asteria Space</span>
            </div>

            <div className="flex-1 bg-[#FFF8EC] p-5 overflow-y-auto">
              {(activeCustomer?.messages || []).length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-stone-500">未有對話，下面可以開始回覆。</div>
              ) : (
                <div className="space-y-4">
                  {(activeCustomer?.messages || []).map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-sm ${message.sender === 'admin' ? 'bg-asteria-primary text-white' : 'bg-white text-stone-700 border border-asteria-cream/70'}`}>
                        <div className="text-xs font-bold mb-1">{message.sender === 'admin' ? 'Asteria' : activeCustomer?.name}</div>
                        {message.text && <div className="text-sm leading-relaxed">{message.text}</div>}
                        {message.images && message.images.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            {message.images.map((image, index) => (
                              <img key={`${message.id}-inbox-${index}`} src={image} className="aspect-square w-full rounded-xl object-cover border border-white/40" alt="chat attachment" />
                            ))}
                          </div>
                        )}
                        <div className={`text-[11px] mt-2 ${message.sender === 'admin' ? 'text-white/70' : 'text-stone-400'}`}>{formatEntryDate(message.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {replyImages.length > 0 && (
              <div className="px-4 pt-3 bg-white border-t border-asteria-cream/70 grid grid-cols-4 sm:grid-cols-6 gap-2">
                {replyImages.map((image, index) => (
                  <img key={`reply-preview-${index}`} src={image} className="aspect-square rounded-xl object-cover border border-asteria-cream" alt="reply upload preview" />
                ))}
              </div>
            )}

            <div className="p-4 bg-white border-t border-asteria-cream/70 grid grid-cols-[auto_1fr_auto] gap-3">
              <label className="inline-flex items-center justify-center border border-asteria-cream bg-white text-asteria-primary w-12 h-12 rounded-xl font-bold cursor-pointer hover:border-asteria-primary transition-all" title="send image">
                <i className="fa-regular fa-images"></i>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => handleReplyImages(event.target.files)} />
              </label>
              <input value={replyText} onChange={(event) => setReplyText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') sendReply(); }} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="輸入回覆..." />
              <button onClick={sendReply} className="btn-primary px-5 py-3 rounded-xl font-bold">
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </section>
        </div>
        )}
      </div>
    </main>
  );
};

const Footer = () => (
  <footer className="py-12 bg-white border-t border-gray-100 text-center">
    <div className="container mx-auto px-6">
      <div className="flex justify-center items-center gap-2 mb-6 text-2xl text-gray-700 font-eng font-bold">
        <img src={LOGO_SRC} className="w-12 h-12 rounded-full shadow-sm logo-img bg-white p-0.5" alt="Asteria logo" /> ASTERIA
      </div>
      <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
        用心聆聽，用愛療癒。<br/>
        我們致力於運用白魔法與塔羅智慧，為你在迷惘中找到出口。
      </p>
      <div className="flex justify-center gap-6 mb-8">
        <a href="https://www.instagram.com/asteria.CRYSTAL.TAROT" className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-asteria-primary hover:bg-asteria-primary hover:text-white transition-all shadow-sm">
          <i className="fa-brands fa-instagram text-xl"></i>
        </a>
        <a href={WHATSAPP_URL} className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-sm">
          <i className="fa-brands fa-whatsapp text-xl"></i>
        </a>
        <a href={FACEBOOK_URL} className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
          <i className="fa-brands fa-facebook-f text-xl"></i>
        </a>
        <span className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-sky-500 shadow-sm opacity-70" title="Telegram 待公布">
          <i className="fa-brands fa-telegram text-xl"></i>
        </span>
      </div>
      <p className="text-gray-400 text-xs font-sans">
        © {new Date().getFullYear()} Asteria Crystal Tarot. All Rights Reserved.
      </p>
    </div>
  </footer>
);

const App = () => {
  const getPage = () => {
    if (window.location.hash === '#teaching') return 'teaching';
    if (window.location.hash === '#register') return 'register';
    if (window.location.hash === '#portal') return 'portal';
    if (window.location.hash === '#admin') return 'admin';
    if (window.location.hash === '#inbox') return 'inbox';
    return 'home';
  };

  const [page, setPage] = useState(getPage);
  const currentRole = getCurrentDemoRole();

  useEffect(() => {
    const handleHashChange = () => {
      setPage(getPage());
    };
    const handleSessionChange = () => {
      setPage(getPage());
    };
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('asteria-session-change', handleSessionChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('asteria-session-change', handleSessionChange);
    };
  }, []);

  if (page === 'teaching') {
    return (
      <div className="antialiased selection:bg-asteria-primary selection:text-white font-sans text-gray-800">
        <Navbar />
        <Blog fullPage />
        <Footer />
      </div>
    );
  }

  if (page === 'portal' && currentRole === 'staff') {
    return (
      <div className="antialiased selection:bg-asteria-primary selection:text-white font-sans text-gray-800">
        <Navbar />
        <AdminInboxPage />
      </div>
    );
  }

  if (page === 'portal') {
    return (
      <div className="antialiased selection:bg-asteria-primary selection:text-white font-sans text-gray-800">
        <Navbar />
        <SpacePortalPage />
      </div>
    );
  }

  if (page === 'register') {
    if (currentRole === 'staff') {
      return (
        <div className="antialiased selection:bg-asteria-primary selection:text-white font-sans text-gray-800">
          <Navbar />
          <AdminInboxPage />
        </div>
      );
    }
    if (currentRole === 'customer') {
      return (
        <div className="antialiased selection:bg-asteria-primary selection:text-white font-sans text-gray-800">
          <Navbar />
          <SpacePortalPage />
        </div>
      );
    }
    return (
      <div className="antialiased selection:bg-asteria-primary selection:text-white font-sans text-gray-800">
        <Navbar />
        <RegisterPage />
        <Footer />
      </div>
    );
  }

  if ((page === 'admin' || page === 'inbox') && currentRole !== 'staff') {
    return (
      <div className="antialiased selection:bg-asteria-primary selection:text-white font-sans text-gray-800">
        <Navbar />
        <RegisterPage />
        <Footer />
      </div>
    );
  }

  if (page === 'admin') {
    return (
      <div className="antialiased selection:bg-asteria-primary selection:text-white font-sans text-gray-800">
        <Navbar />
        <AdminInboxPage />
        <Footer />
      </div>
    );
  }

  if (page === 'inbox') {
    return (
      <div className="antialiased selection:bg-asteria-primary selection:text-white font-sans text-gray-800">
        <Navbar />
        <AdminInboxPage />
      </div>
    );
  }

  return (
    <div className="antialiased selection:bg-asteria-primary selection:text-white font-sans text-gray-800">
      <Navbar />
      <Hero />
      <Oracle />
      <Blog />
      <Services />
      <Reviews />
      <Footer />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
