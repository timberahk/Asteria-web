import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- Gemini Configuration ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Components ---

const Navbar = () => (
  <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-asteria-purple/30 shadow-sm transition-all">
    <div className="container mx-auto px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-tr from-asteria-primary to-asteria-purple p-2 rounded-full text-white shadow-md">
          <i className="fa-solid fa-cat"></i>
        </div>
        <div className="text-lg md:text-xl font-bold text-gray-700 tracking-wide font-eng">
          ASTERIA <span className="text-asteria-primary text-sm hidden md:inline">Crystal Tarot</span>
        </div>
      </div>
      <div className="flex gap-3 md:gap-8 text-sm md:text-base font-medium text-gray-600 items-center">
        <a href="#oracle" className="hover:text-asteria-primary transition-colors hidden md:inline-block"><i className="fa-solid fa-star text-xs"></i> 每日指引</a>
        <a href="#blog" className="hover:text-asteria-primary transition-colors hidden md:inline-block">愛情補習社</a>
        <a href="#services" className="hover:text-asteria-primary transition-colors">服務</a>
        <a href="#reviews" className="hover:text-asteria-primary transition-colors">好評</a>
        <a href="https://wa.me/85259413688" target="_blank" className="bg-gradient-to-r from-green-400 to-green-500 text-white px-4 py-1.5 rounded-full text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-1">
          <i className="fa-brands fa-whatsapp"></i> <span className="hidden md:inline">預約</span>
        </a>
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-purple-50 via-white to-blue-50">
    {/* Animated Background Elements */}
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
       <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-asteria-purple/20 rounded-full blur-[100px] animate-pulse"></div>
       <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-asteria-blue/20 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '2s'}}></div>
       <div className="absolute top-[20%] left-[15%] text-asteria-yellow text-4xl opacity-40 animate-bounce-slow"><i className="fa-solid fa-star"></i></div>
       <div className="absolute top-[60%] right-[10%] text-asteria-primary text-2xl opacity-30 animate-bounce-slow" style={{animationDelay: '1s'}}><i className="fa-solid fa-moon"></i></div>
       <div className="absolute top-[15%] right-[30%] text-pink-300 text-3xl opacity-30 animate-spin-slow"><i className="fa-regular fa-snowflake"></i></div>
    </div>

    <div className="container mx-auto px-6 relative z-10">
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* Left Content */}
        <div className="w-full lg:w-1/2 text-center lg:text-left animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur border border-asteria-purple/50 px-4 py-1.5 rounded-full text-asteria-primary text-sm font-bold mb-6 shadow-sm">
             <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-asteria-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-asteria-primary"></span>
            </span>
            專注高階白魔法 ＆ 塔羅占卜
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-800 leading-tight tracking-tight">
            感情問題<span className="text-transparent bg-clip-text bg-gradient-to-r from-asteria-primary to-purple-400">有救了！</span>
            <br />
            <span className="text-2xl md:text-4xl mt-4 block font-medium text-gray-600">
               讓對方<span className="relative inline-block mx-2 after:content-[''] after:absolute after:bottom-1 after:left-0 after:w-full after:h-3 after:bg-yellow-200/50 after:-z-10">重新愛上你</span>
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
            Asteria 獨家西班牙儀式與精準塔羅分析。
            無論是分手復合、趕走第三者，還是想知道他的真心話，
            我們都有對應的解決方案。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <a href="#services" className="btn-primary px-8 py-4 rounded-xl font-bold shadow-lg shadow-purple-200 flex items-center justify-center gap-2 group">
              <i className="fa-solid fa-wand-magic-sparkles group-hover:rotate-12 transition-transform"></i> 查看所有儀式
            </a>
            <a href="https://www.instagram.com/asteria.CRYSTAL.TAROT" target="_blank" className="bg-white text-gray-700 border-2 border-gray-100 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 hover:border-asteria-purple/30">
              <i className="fa-brands fa-instagram text-xl"></i> 追蹤 Instagram
            </a>
          </div>

          <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500 font-medium">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-check-circle text-green-400"></i> 11,000+ 成功個案
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-check-circle text-green-400"></i> 90% 回頭客好評
            </div>
          </div>
        </div>

        {/* Right Visuals (Rich Graphics) */}
        <div className="w-full lg:w-1/2 relative min-h-[400px] md:min-h-[500px] flex items-center justify-center animate-float">
            {/* Main Circle Background */}
            <div className="absolute w-[350px] h-[350px] md:w-[500px] md:h-[500px] border border-asteria-purple/30 rounded-full animate-spin-slow-reverse opacity-50"></div>
            <div className="absolute w-[300px] h-[300px] md:w-[420px] md:h-[420px] border border-dashed border-asteria-primary/20 rounded-full animate-spin-slow"></div>
            
            {/* Center "Phone" Card */}
            <div className="relative w-64 md:w-72 bg-white rounded-3xl shadow-2xl border-4 border-white overflow-hidden z-20 transform rotate-[-3deg] hover:rotate-0 transition-all duration-500">
                <div className="bg-gradient-to-r from-asteria-primary to-purple-400 p-4 flex items-center gap-3 text-white">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><i className="fa-solid fa-cat"></i></div>
                    <div className="font-bold text-sm">Asteria Tarot</div>
                </div>
                <div className="p-4 bg-gray-50 h-64 flex flex-col gap-3">
                    <div className="bg-white p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl shadow-sm text-xs text-gray-600 max-w-[85%] self-start">
                        你要相信，你們的緣分還未斷。這張牌顯示他心裡還有你... 🌸
                    </div>
                    <div className="bg-purple-100 p-3 rounded-tl-xl rounded-bl-xl rounded-br-xl shadow-sm text-xs text-purple-800 max-w-[85%] self-end">
                         真的嗎？我昨晚真的夢見他找我了！😭 多謝你 Asteria！
                    </div>
                    <div className="bg-white p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl shadow-sm text-xs text-gray-600 max-w-[85%] self-start flex items-center gap-2">
                         <i className="fa-solid fa-gift text-pink-400"></i> [儀式生效通知] 對方正在輸入中...
                    </div>
                </div>
                {/* Notification Badge */}
                <div className="absolute top-20 right-[-10px] bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
                    New Message!
                </div>
            </div>

            {/* Floating Cards / Crystals */}
            <div className="absolute top-10 left-0 md:left-10 bg-white p-2 rounded-lg shadow-lg rotate-12 animate-float" style={{animationDelay: '0.5s'}}>
                <div className="w-16 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded border border-yellow-200 flex flex-col items-center justify-center">
                    <i className="fa-solid fa-sun text-2xl text-orange-400"></i>
                    <span className="text-[8px] mt-1 font-bold text-orange-800 uppercase">The Sun</span>
                </div>
            </div>
            
            <div className="absolute bottom-20 right-0 md:right-10 bg-white p-2 rounded-lg shadow-lg -rotate-12 animate-float" style={{animationDelay: '1.5s'}}>
                 <div className="w-16 h-24 bg-gradient-to-br from-pink-100 to-red-100 rounded border border-pink-200 flex flex-col items-center justify-center">
                    <i className="fa-solid fa-heart text-2xl text-pink-400"></i>
                    <span className="text-[8px] mt-1 font-bold text-pink-800 uppercase">Lovers</span>
                </div>
            </div>

            <div className="absolute top-1/2 right-[-20px] w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-400 text-xl animate-pulse z-30">
                <i className="fa-solid fa-gem"></i>
            </div>
             <div className="absolute bottom-10 left-20 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-purple-400 text-lg animate-bounce z-30">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
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

    // Using a simple timeout to trigger the API call ensures visual feedback occurs immediately
    setTimeout(() => {
        getReading(selectedTopic);
    }, 1500);
  };

  const getReading = async (selectedTopic: string) => {
    try {
      const topicLabel = topics.find(t => t.id === selectedTopic)?.label || "一般運勢";
      const randomSeed = Math.floor(Math.random() * 1000000); // Add randomness
      
      const prompt = `
      You are Asteria, a mystical tarot reader. 
      The user has a concern about "${topicLabel}".
      
      Current Random Seed: ${randomSeed}.
      
      CRITICAL INSTRUCTION:
      1. RANDOMLY select ONE Tarot card from the standard 78 cards. 
      2. It can be Major Arcana or Minor Arcana (Cups, Wands, Swords, Pentacles).
      3. DO NOT always pick "The Star" or "The Lovers". Be diverse.
      
      Provide a VERY SHORT, MYSTERIOUS, ONE-SENTENCE TEASER in Traditional Chinese (Hong Kong style).
      DO NOT explain the full situation. 
      DO NOT solve their problem.
      Your goal is to make them curious so they want to book a paid reading.

      Return ONLY raw JSON. Do not use Markdown block.
      
      Structure:
      {
        "type": "Tarot",
        "card_name": "Name of the Card (e.g., The Moon 月亮)",
        "keywords": ["Keyword1", "Keyword2"],
        "analysis": "A single, mysterious sentence. (Max 20 words).",
        "advice": "A short hook suggesting they need a full reading. (Max 15 words).",
        "icon": "fa-solid fa-moon" 
      }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 1.2, // Increase creativity/randomness
        }
      });
      
      let text = response.text;
      
      if (text) {
        // Clean up any potential markdown residue
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
            const parsed = JSON.parse(text);
            setReading(parsed);
            setStep('result');
        } catch (e) {
            console.warn("JSON Parse Error, using fallback.", e);
            useFallback();
        }
      } else {
        // Response blocked or empty
        useFallback();
      }

    } catch (err) {
      console.error("Oracle error:", err);
      // Fallback mechanism: If API fails, show a random pre-set card so user is not disappointed
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
    <section id="oracle" className="py-20 bg-gradient-to-b from-white via-asteria-purple/10 to-white relative overflow-hidden">
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
                    <div className="w-12 h-12 bg-asteria-purple/20 text-asteria-primary rounded-full flex items-center justify-center text-xl mr-4 group-hover:scale-110 transition-transform">
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
                <div className="absolute inset-0 bg-gradient-to-tr from-asteria-primary to-asteria-blue rounded-xl border-4 border-white shadow-xl animate-ping opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-asteria-primary to-asteria-blue rounded-xl border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
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

                <div className="bg-white/80 p-6 rounded-2xl border border-asteria-purple/20 shadow-sm w-full mb-6">
                    <p className="text-lg text-gray-700 font-medium leading-relaxed mb-4">
                        <i className="fa-solid fa-quote-left text-asteria-primary/30 mr-2 text-xl"></i>
                        {reading.analysis}
                        <i className="fa-solid fa-quote-right text-asteria-primary/30 ml-2 text-xl"></i>
                    </p>
                     <p className="text-asteria-primary text-sm font-bold border-t border-dashed border-gray-200 pt-4">
                        {reading.advice}
                    </p>
                </div>

                <a href="https://wa.me/85259413688" target="_blank" className="btn-primary w-full py-4 rounded-xl font-bold shadow-lg shadow-purple-200 flex items-center justify-center gap-2 text-lg animate-pulse hover:animate-none">
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
const Blog = () => {
    const [selectedPost, setSelectedPost] = useState<any>(null);
  
    const posts = [
      {
        id: 1,
        title: "明明只係小事，點解成日變嗌交？",
        category: "相處溝通",
        color: "bg-blue-100",
        icon: "fa-regular fa-comments",
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
        color: "bg-purple-100",
        icon: "fa-solid fa-person-rays",
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
        color: "bg-red-100",
        icon: "fa-solid fa-heart-circle-exclamation",
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
        color: "bg-pink-100",
        icon: "fa-regular fa-face-kiss-wink-heart",
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
  
    return (
      <section id="blog" className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Asteria 愛情補習社</h2>
            <p className="text-gray-500">不再在感情裡迷路，學會愛與被愛的智慧</p>
          </div>
  
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {posts.map((post) => (
              <div 
                key={post.id} 
                onClick={() => setSelectedPost(post)}
                className="group cursor-pointer bg-white rounded-2xl border border-gray-100 hover:border-asteria-primary/30 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Visual Header */}
                <div className={`h-40 ${post.color} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white opacity-20 rotate-12 scale-150 translate-x-10 translate-y-10"></div>
                  <i className={`${post.icon} text-6xl text-white/80 drop-shadow-md group-hover:scale-110 transition-transform duration-500`}></i>
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
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
              <a href="https://www.instagram.com/asteria.CRYSTAL.TAROT" target="_blank" className="inline-block text-gray-400 hover:text-asteria-primary transition-colors text-sm">
                <i className="fa-brands fa-instagram mr-1"></i> 更多教學請 Follow Instagram
              </a>
          </div>
  
          {/* Modal */}
          {selectedPost && (
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
                    <div className="prose prose-purple max-w-none text-gray-700 leading-loose" dangerouslySetInnerHTML={{ __html: selectedPost.content }}></div>
                    
                    <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <span className="text-sm text-gray-400">想解決類似問題？</span>
                        <a href="https://wa.me/85259413688" target="_blank" className="bg-asteria-primary text-white px-6 py-2 rounded-full font-bold hover:bg-purple-600 transition-colors shadow-md text-sm">
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
  const [activeTab, setActiveTab] = useState<'rituals' | 'tarot'>('rituals');

  const rituals = [
    {
      title: "高階復合儀式",
      desc: "專門針對分手、斷聯、被封鎖的情況。修復破碎關係，消除對方負面印象，重新建立聯繫。",
      icon: "fa-solid fa-heart-crack",
      color: "bg-red-50 text-red-500",
      tags: ["挽回前任", "解除封鎖", "修復關係"]
    },
    {
      title: "西班牙紅魔法",
      desc: "強力鎖心術。讓對方眼裡只有你，主動想念你，增加對你的佔有慾和依賴感。",
      icon: "fa-solid fa-fire",
      color: "bg-orange-50 text-orange-500",
      tags: ["鎖心", "增加思念", "主動聯繫"]
    },
    {
      title: "驅除第三者/爛桃花",
      desc: "斬斷對方身邊的異性緣，清理這段關係的障礙，讓第三者自動退出。",
      icon: "fa-solid fa-user-slash",
      color: "bg-slate-50 text-slate-500",
      tags: ["斬桃花", "擊退情敵", "清理障礙"]
    },
    {
      title: "愛情升溫甜蜜儀式",
      desc: "適合感情變淡、經常吵架的情侶。消除隔閡，找回熱戀期的甜蜜感覺。",
      icon: "fa-solid fa-candy-cane",
      color: "bg-pink-50 text-pink-500",
      tags: ["感情升溫", "減少爭執", "甜蜜恩愛"]
    },
    {
      title: "個人魅力/招正緣",
      desc: "提升自身磁場與吸引力，讓你在人群中發光，吸引高質素的對象。",
      icon: "fa-solid fa-wand-magic-sparkles",
      color: "bg-purple-50 text-purple-500",
      tags: ["提升魅力", "脫單", "吸引男神"]
    },
    {
      title: "全方位感情拯救",
      desc: "針對複雜個案，客製化多重儀式方案。全方位解決多個感情痛點。",
      icon: "fa-solid fa-gem",
      color: "bg-blue-50 text-blue-500",
      tags: ["高難度", "客製化", "多重功效"]
    }
  ];

  const tarot = [
    {
      title: "全方位愛情分析",
      desc: "深入剖析對方想法、你們的未來發展、潛在阻礙。提供實際建議。",
      icon: "fa-solid fa-comments",
      color: "bg-indigo-50 text-indigo-500",
      tags: ["對方想法", "未來走向", "解決方案"]
    },
    {
      title: "復合機率占卜",
      desc: "我們還有機會嗎？他心裡還有我嗎？應否繼續等待？清楚告訴你答案。",
      icon: "fa-solid fa-arrows-rotate",
      color: "bg-teal-50 text-teal-500",
      tags: ["復合", "抉擇", "時機"]
    },
    {
      title: "流年運勢詳批",
      desc: "掌握未來一年的整體運勢，包括感情、事業、財運起伏，助你趨吉避凶。",
      icon: "fa-regular fa-calendar-check",
      color: "bg-yellow-50 text-yellow-600",
      tags: ["年運", "月運", "大方向"]
    },
    {
      title: "事業/財運指引",
      desc: "轉工好時機？升職加薪有無份？適合創業嗎？為你的職涯提供明燈。",
      icon: "fa-solid fa-briefcase",
      color: "bg-emerald-50 text-emerald-500",
      tags: ["工作", "正財偏財", "發展"]
    }
  ];

  return (
    <section id="services" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">服務項目</h2>
          <p className="text-gray-500 mb-8">請選擇您需要的服務類別，了解更多詳情</p>
          
          {/* Tabs */}
          <div className="flex justify-center mb-10">
            <div className="bg-gray-100 p-1.5 rounded-full inline-flex relative shadow-inner">
               <button 
                onClick={() => setActiveTab('rituals')}
                className={`px-8 py-3 rounded-full text-sm md:text-base font-bold transition-all duration-300 ${activeTab === 'rituals' ? 'bg-white text-asteria-primary shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <i className="fa-solid fa-wand-sparkles mr-2"></i> 白魔法儀式
              </button>
              <button 
                onClick={() => setActiveTab('tarot')}
                className={`px-8 py-3 rounded-full text-sm md:text-base font-bold transition-all duration-300 ${activeTab === 'tarot' ? 'bg-white text-asteria-primary shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <i className="fa-solid fa-star-half-stroke mr-2"></i> 塔羅占卜
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-float" style={{ animationDuration: '0.5s', animationName: 'fadeIn' }}>
          {(activeTab === 'rituals' ? rituals : tarot).map((item, idx) => (
            <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-asteria-purple/30 transition-all duration-300 group flex flex-col h-full hover:-translate-y-1">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4 ${item.color} group-hover:scale-110 transition-transform`}>
                <i className={item.icon}></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed flex-grow">
                {item.desc}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {item.tags.map((tag, tIdx) => (
                  <span key={tIdx} className="text-xs bg-gray-50 text-gray-500 px-2 py-1 rounded-md"># {tag}</span>
                ))}
              </div>

              <a href="https://wa.me/85259413688" target="_blank" className="w-full text-center border-2 border-asteria-purple/20 text-asteria-primary py-2.5 rounded-xl font-bold hover:bg-asteria-primary hover:text-white transition-all text-sm group-hover:shadow-md mt-auto">
                查詢詳情
              </a>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-asteria-yellow/30 p-6 rounded-2xl max-w-2xl mx-auto border border-asteria-yellow/50">
           <p className="text-gray-700 text-sm md:text-base">
             <i className="fa-solid fa-circle-info text-yellow-500 mr-2"></i>
             所有儀式及占卜均由 Asteria 親自主理，保證私隱。不確定自己適合哪種儀式？歡迎 WhatsApp 諮詢，我們會為您分析最合適的方案。
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
        <h2 className="text-3xl font-bold text-gray-800 mb-3">客人真實好評</h2>
        <div className="flex justify-center gap-1 text-yellow-400 text-sm mb-2">
           <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
        </div>
        <p className="text-gray-500">超過 11,000 宗儀式，見證無數愛情奇蹟</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-white hover:border-asteria-blue transition-colors">
           <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                <i className="fa-solid fa-user text-gray-400"></i>
             </div>
             <div>
               <div className="font-bold text-sm text-gray-700">Chan***</div>
               <div className="text-xs text-asteria-primary font-medium">復合儀式</div>
             </div>
           </div>
           <p className="text-gray-600 text-sm leading-relaxed">
             "真係好神奇！做完儀式第三日佢真係主動搵返我🥺 本身以為冇機會架啦，多謝 Asteria 救返我段感情！儀式過程都好細心解釋。"
           </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-asteria-pink/30 relative">
           <div className="absolute -top-3 -right-3 bg-asteria-pink text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">熱門</div>
           <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 bg-pink-50 rounded-full overflow-hidden flex items-center justify-center">
                <span className="text-lg">👩🏻</span>
             </div>
             <div>
               <div className="font-bold text-sm text-gray-700">Emily</div>
               <div className="text-xs text-asteria-primary font-medium">愛情升溫</div>
             </div>
           </div>
           <p className="text-gray-600 text-sm leading-relaxed">
             "之前男朋友成日掛住打機唔理我，做完升溫儀式之後佢主動約我去街，仲送花比我！好耐冇試過咁sweet🥰 推薦比所有感情平淡既人！"
           </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-white hover:border-asteria-blue transition-colors">
           <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
             <i className="fa-solid fa-user text-gray-400"></i>
             </div>
             <div>
               <div className="font-bold text-sm text-gray-700">Kylie</div>
               <div className="text-xs text-asteria-primary font-medium">塔羅占卜</div>
             </div>
           </div>
           <p className="text-gray-600 text-sm leading-relaxed">
             "Asteria 講得好準！完全講中哂我地之間嘅問題。聽完你意見之後我知道應該點做啦，個心定好多❤️ 唔會再亂諗野。"
           </p>
        </div>
      </div>
      
      <div className="text-center mt-10">
        <a href="https://www.instagram.com/asteria.CRYSTAL.TAROT" target="_blank" className="inline-flex items-center text-asteria-primary font-bold hover:underline bg-white px-6 py-2 rounded-full shadow-sm hover:shadow transition-all">
          查看更多好評 <i className="fa-solid fa-arrow-right ml-2"></i>
        </a>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-12 bg-white border-t border-gray-100 text-center">
    <div className="container mx-auto px-6">
      <div className="flex justify-center items-center gap-2 mb-6 text-2xl text-gray-700 font-eng font-bold">
        <i className="fa-solid fa-cat text-asteria-primary"></i> ASTERIA
      </div>
      <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
        用心聆聽，用愛療癒。<br/>
        我們致力於運用白魔法與塔羅智慧，為你在迷惘中找到出口。
      </p>
      <div className="flex justify-center gap-6 mb-8">
        <a href="https://www.instagram.com/asteria.CRYSTAL.TAROT" className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-asteria-primary hover:bg-asteria-primary hover:text-white transition-all shadow-sm">
          <i className="fa-brands fa-instagram text-xl"></i>
        </a>
        <a href="https://wa.me/85259413688" className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-sm">
          <i className="fa-brands fa-whatsapp text-xl"></i>
        </a>
      </div>
      <p className="text-gray-400 text-xs font-sans">
        © {new Date().getFullYear()} Asteria Crystal Tarot. All Rights Reserved.
      </p>
    </div>
  </footer>
);

const App = () => {
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