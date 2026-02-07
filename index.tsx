import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- Gemini Configuration ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Mock Data: 5 Years of Blog Posts ---
const ALL_POSTS = [
  {
    id: 1,
    title: "明明只係小事，點解成日變嗌交？",
    category: "相處溝通",
    color: "bg-blue-100",
    icon: "fa-regular fa-comments",
    date: "2023.10.05",
    summary: "拆解「情緒勒索」與「無效溝通」的惡性循環。學識這一招，讓爭吵變成了解。",
    content: `<h3>為什麼我們總是為了小事吵架？</h3><p>很多客人都會問我：「明明只係佢唔記得倒垃圾，點解最後會搞到分手咁嚴重？」</p><p>其實，我們吵的往往不是事情本身，而是「態度」與「被忽視感」。</p>`
  },
  {
    id: 2,
    title: "對方事事挑剔，令你唔敢再表達自己？",
    category: "自我價值",
    color: "bg-purple-100",
    icon: "fa-solid fa-person-rays",
    date: "2023.09.28",
    summary: "如何面對「挑剔型」伴侶，重建自信。你不需要變得完美才值得被愛。",
    content: `<p>挑剔往往源於對方內心的不安全感或控制慾。通過貶低你，他能獲得一種優越感。</p>`
  },
  {
    id: 3,
    title: "點解講極分手，佢都唔驚失去我？",
    category: "挽回攻略",
    color: "bg-red-100",
    icon: "fa-solid fa-heart-circle-exclamation",
    date: "2023.09.15",
    summary: "破解「假性分手」與「狼來了」效應。要讓對方學會珍惜，你需要的是底線。",
    content: `<p>要讓他害怕失去你，不是靠嘴巴說，而是靠行為。當你把注意力收回，他才會慌張。</p>`
  }
];

// --- Components ---

const Navbar = ({ currentPage, setPage }: { currentPage: string, setPage: (p: string) => void }) => (
  <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-asteria-purple/30 shadow-sm transition-all">
    <div className="container mx-auto px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setPage('home')}>
        <img src="https://cdn-icons-png.flaticon.com/512/616/616430.png" className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-asteria-purple/20 p-1 group-hover:rotate-12 transition-transform" alt="Logo" />
        <div className="text-lg md:text-xl font-bold text-gray-700 font-eng uppercase tracking-widest">ASTERIA</div>
      </div>
      <div className="flex gap-4 text-sm md:text-base font-medium text-gray-600 items-center">
        {currentPage === 'home' ? (
          <>
            <button onClick={() => setPage('blog')} className="hover:text-asteria-primary transition-colors">愛情補習社</button>
            <a href="#services" className="hover:text-asteria-primary transition-colors">服務</a>
            <a href="#reviews" className="hover:text-asteria-primary transition-colors">好評</a>
          </>
        ) : (
          <button onClick={() => setPage('home')} className="hover:text-asteria-primary transition-colors"><i className="fa-solid fa-house"></i> 回首頁</button>
        )}
        <a href="https://wa.me/85259413688" target="_blank" className="bg-gradient-to-r from-green-400 to-green-500 text-white px-4 py-1.5 rounded-full text-xs md:text-sm flex items-center gap-1 shadow-sm hover:shadow-md transition-all">
          <i className="fa-brands fa-whatsapp"></i> 預約
        </a>
      </div>
    </div>
  </nav>
);

const Hero = ({ setPage }: { setPage: (p: string) => void }) => (
  <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-purple-50 via-white to-blue-50">
    <div className="container mx-auto px-6 relative z-10 text-center lg:text-left">
      <div className="flex flex-col lg:flex-row items-center gap-12">
        <div className="w-full lg:w-1/2 animate-fade-in-up">
          <div className="inline-block bg-white/60 backdrop-blur px-4 py-1 rounded-full text-asteria-primary text-xs font-bold mb-6 border border-asteria-purple/30 shadow-sm">
            高階白魔法 ＆ 專業塔羅
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-800 leading-tight">
            感情問題<span className="text-asteria-primary">有救了！</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
            Asteria 獨家西班牙儀式與精準塔羅分析。<br className="hidden md:block"/>
            讓對方重新愛上你，找回失去的甜蜜。
          </p>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <a href="#services" className="btn-primary px-8 py-4 rounded-xl font-bold shadow-lg">查看所有儀式</a>
            <button onClick={() => setPage('blog')} className="bg-white text-gray-700 border-2 border-gray-100 px-8 py-4 rounded-xl font-bold hover:border-asteria-primary/30 transition-all">進入愛情補習社</button>
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex justify-center animate-float">
          <div className="relative w-64 md:w-72 bg-white rounded-3xl shadow-2xl border-4 border-white overflow-hidden transform rotate-[-2deg]">
            <div className="bg-asteria-primary p-4 text-white font-bold text-sm flex items-center gap-2">
               <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
               Asteria Tarot
            </div>
            <div className="p-4 bg-gray-50 h-64 flex flex-col gap-3 text-xs">
              <div className="bg-white p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl shadow-sm text-gray-600 max-w-[85%] self-start border border-gray-100">
                這張牌顯示他心裡還有你... 🌸
              </div>
              <div className="bg-purple-100 p-3 rounded-tl-xl rounded-bl-xl rounded-br-xl shadow-sm text-purple-800 max-w-[85%] self-end">
                真的嗎？我昨晚夢見他了！😭
              </div>
              <div className="bg-white p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl shadow-sm text-gray-600 max-w-[85%] self-start border border-gray-100 italic">
                儀式生效中... 對方正在輸入...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Oracle = () => {
  const [step, setStep] = useState<'topic' | 'drawing' | 'result'>('topic');
  const [loading, setLoading] = useState(false);
  const [reading, setReading] = useState<{ card: string, analysis: string, icon: string } | null>(null);

  const topics = [
    { id: 'love', label: '💔 復合挽回', icon: 'fa-solid fa-heart-crack' },
    { id: 'crush', label: '💌 曖昧發展', icon: 'fa-regular fa-paper-plane' },
    { id: 'self', label: '🌱 個人運勢', icon: 'fa-solid fa-seedling' },
  ];

  const handleDraw = async (topicLabel: string) => {
    setStep('drawing');
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `你是一位神祕的塔羅占卜師 Asteria。
        用戶想問關於「${topicLabel}」。
        請從標準78張塔羅牌中隨機選一張，並用一句話（繁體中文，香港口語風格）給予神祕且具備吸引力的暗示。
        回傳格式 JSON: {"card": "牌名", "analysis": "暗示語", "icon": "fa-solid fa-moon"}`,
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || '{}');
      setReading(data);
      setStep('result');
    } catch (e) {
      setReading({ card: "星星 (The Star)", analysis: "宇宙正準備一份驚喜畀你，但你而家需要嘅係耐心等待。", icon: "fa-solid fa-star" });
      setStep('result');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="oracle" className="py-20 bg-white text-center">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">🔮 宇宙解憂信箱</h2>
        <p className="text-gray-500 mb-10">心裡想著那個讓你困擾的人或事，領取今日暗示...</p>
        
        <div className="glass-card max-w-lg mx-auto p-12 rounded-[2.5rem] border-dashed border-2 border-asteria-purple/50 bg-white/50 relative overflow-hidden shadow-2xl">
          
          {step === 'topic' && (
            <div className="animate-fade-in">
              <h3 className="text-lg font-bold text-gray-700 mb-8">你想知道哪方面的啟示？</h3>
              <div className="grid grid-cols-1 gap-4">
                {topics.map(t => (
                  <button 
                    key={t.id} 
                    onClick={() => handleDraw(t.label)}
                    className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-asteria-primary hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 bg-asteria-purple/30 text-asteria-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <i className={t.icon}></i>
                    </div>
                    <span className="font-bold text-gray-700">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'drawing' && (
            <div className="py-10 flex flex-col items-center">
               <div className="w-24 h-36 bg-gradient-to-br from-asteria-primary to-purple-400 rounded-xl shadow-xl animate-bounce flex items-center justify-center border-4 border-white mb-6">
                  <i className="fa-solid fa-star-of-david text-white text-4xl animate-spin-slow"></i>
               </div>
               <p className="text-asteria-primary font-bold animate-pulse">正在連結宇宙能量...</p>
            </div>
          )}

          {step === 'result' && reading && (
            <div className="animate-fade-in flex flex-col items-center">
               <div className="w-16 h-16 bg-asteria-purple/20 text-asteria-primary rounded-full flex items-center justify-center text-3xl mb-4">
                  <i className={reading.icon}></i>
               </div>
               <h3 className="text-2xl font-bold text-gray-800 mb-2">{reading.card}</h3>
               <p className="text-gray-600 leading-relaxed mb-8 bg-white p-4 rounded-2xl italic border border-gray-100">
                 「{reading.analysis}」
               </p>
               <a href="https://wa.me/85259413688" target="_blank" className="btn-primary w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                 <i className="fa-brands fa-whatsapp"></i> 獲取詳細個人占卜解讀
               </a>
               <button onClick={() => setStep('topic')} className="mt-4 text-xs text-gray-400 hover:text-asteria-primary">再抽一次</button>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};

const Services = () => {
  const [activeTab, setActiveTab] = useState<'rituals' | 'tarot'>('rituals');
  const [activeRitualCategory, setActiveRitualCategory] = useState<string>('❤️‍復合挽回');
  
  const ritualCategories: Record<string, string[]> = {
    "❤️‍復合挽回": ["恢復聯絡", "先攻後守", "金剛箍", "重修舊好", "破冰", "重建信心", "主動出擊", "化解冷戰"],
    "💖 甜蜜脫單": ["心思思", "脫單套餐", "愛上你", "唯一寵愛", "親密升溫", "重燃愛火", "魅力女神", "加速顯化"],
    "🛡️ 清理除障": ["斬斷情絲", "趕盡殺絕", "身心大掃除", "解除咒語", "環境清理", "負能量排除"],
    "💰 事業財運": ["八方生財", "事業上升", "大發橫財", "貴人相助", "生意興隆"]
  };

  return (
    <section id="services" className="py-20 bg-gray-50/50">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">專業服務</h2>
          <p className="text-gray-500">無論是能量修復還是塔羅預測，我都為您提供專屬方案</p>
        </div>
        
        <div className="flex justify-center mb-10">
          <div className="bg-white p-1 rounded-full flex gap-1 shadow-sm border border-gray-100">
            <button onClick={() => setActiveTab('rituals')} className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'rituals' ? 'bg-asteria-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>白魔法儀式</button>
            <button onClick={() => setActiveTab('tarot')} className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'tarot' ? 'bg-asteria-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>塔羅占卜</button>
          </div>
        </div>

        {activeTab === 'rituals' ? (
          <div className="animate-fade-in bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {Object.keys(ritualCategories).map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveRitualCategory(cat)} 
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeRitualCategory === cat ? 'bg-asteria-primary text-white shadow-sm' : 'bg-gray-50 text-gray-400 hover:text-gray-600'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ritualCategories[activeRitualCategory].map(item => (
                <div key={item} className="bg-gray-50 p-4 rounded-2xl text-center font-bold text-gray-700 shadow-sm border border-transparent transition-all hover:bg-white hover:border-asteria-purple cursor-default">
                  {item}
                </div>
              ))}
            </div>
            <p className="text-center mt-8 text-xs text-gray-400 italic">儀式通常建議 2-3 支起組合效果最佳。</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
              <h3 className="font-bold text-2xl mb-2 text-gray-800">感情專題 Plan</h3>
              <p className="text-3xl font-bold text-asteria-primary mb-4">$250</p>
              <p className="text-gray-500 mb-6">針對復合、曖昧、單身等特定問題深度解析。</p>
              <a href="https://wa.me/85259413688" target="_blank" className="block text-center border-2 border-asteria-primary text-asteria-primary py-3 rounded-xl font-bold hover:bg-asteria-primary hover:text-white transition-all">立即預約</a>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
              <h3 className="font-bold text-2xl mb-2 text-gray-800">單題占卜</h3>
              <p className="text-3xl font-bold text-asteria-primary mb-4">$80</p>
              <p className="text-gray-500 mb-6">針對一個特定問題快速給予宇宙指引。</p>
              <a href="https://wa.me/85259413688" target="_blank" className="block text-center border-2 border-asteria-primary text-asteria-primary py-3 rounded-xl font-bold hover:bg-asteria-primary hover:text-white transition-all">立即預約</a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const Reviews = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const demoImages = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    url: `https://placehold.co/360x640/E8DAEF/A569BD?text=真實好評截圖+${i + 1}`
  })), []);

  return (
    <section id="reviews" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">奇蹟見證 • 真實對話</h2>
          <p className="text-gray-500">累計超過 11,000+ 成功個案</p>
        </div>
        <div className="columns-2 md:columns-4 gap-4 space-y-4">
          {demoImages.map((img) => (
            <div key={img.id} className="break-inside-avoid bg-white rounded-2xl shadow-sm overflow-hidden cursor-zoom-in group border border-gray-100" onClick={() => setSelectedImage(img.url)}>
              <img src={img.url} className="w-full h-auto group-hover:scale-105 transition-transform duration-500" alt="Review" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
      {selectedImage && (
        <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} className="max-w-full max-h-[90vh] rounded-xl shadow-2xl animate-fade-in" alt="Zoom" />
        </div>
      )}
    </section>
  );
};

const BlogPage = ({ setPage }: { setPage: (p: string) => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const categories = ['全部', '挽回攻略', '相處溝通', '脫單指南', '自我價值'];

  const filteredPosts = useMemo(() => {
    return ALL_POSTS.filter(post => {
      const matchesSearch = post.title.includes(searchTerm) || post.summary.includes(searchTerm);
      const matchesCat = activeCategory === '全部' || post.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchTerm, activeCategory]);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50/30">
      <div className="container mx-auto px-6 max-w-5xl">
        <button onClick={() => setPage('home')} className="text-gray-400 hover:text-asteria-primary mb-8 font-bold flex items-center gap-2 transition-colors">
          <i className="fa-solid fa-arrow-left"></i> 返回主頁
        </button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
           <h1 className="text-4xl font-bold text-gray-800">愛情補習社 📖</h1>
           <input 
             type="text" 
             placeholder="搜尋文章..." 
             className="w-full md:w-64 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-asteria-primary"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === cat ? 'bg-asteria-primary text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-100'}`}>{cat}</button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {filteredPosts.map(post => (
            <div key={post.id} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
              <span className="text-xs font-bold text-asteria-primary bg-asteria-purple/20 px-3 py-1 rounded-full">{post.category}</span>
              <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-4">{post.title}</h2>
              <p className="text-gray-500 leading-relaxed mb-6">{post.summary}</p>
              <button className="text-asteria-primary font-bold flex items-center gap-2">閱讀全文 <i className="fa-solid fa-arrow-right"></i></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className="py-16 bg-white border-t border-gray-100 text-center">
    <div className="container mx-auto px-6">
      <div className="text-2xl font-bold text-gray-800 font-eng uppercase mb-8">ASTERIA</div>
      <div className="flex justify-center gap-8 mb-10">
        <a href="https://www.instagram.com/asteria.CRYSTAL.TAROT" target="_blank" className="text-gray-400 hover:text-asteria-primary transition-colors"><i className="fa-brands fa-instagram text-3xl"></i></a>
        <a href="https://wa.me/85259413688" target="_blank" className="text-gray-400 hover:text-green-500 transition-colors"><i className="fa-brands fa-whatsapp text-3xl"></i></a>
      </div>
      <p className="text-gray-400 text-sm">用心傾聽，用愛療癒。© 2024 Asteria Crystal Tarot.</p>
    </div>
  </footer>
);

const App = () => {
  const [currentPage, setPage] = useState('home');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  return (
    <div className="min-h-screen text-gray-800">
      <Navbar currentPage={currentPage} setPage={setPage} />
      {currentPage === 'home' ? (
        <main className="animate-fade-in">
          <Hero setPage={setPage} />
          <Oracle />
          <section className="py-20 bg-gray-50/30">
            <div className="container mx-auto px-6 max-w-6xl">
              <div className="flex justify-between items-end mb-12">
                <h2 className="text-3xl font-bold text-gray-800">愛情補習社</h2>
                <button onClick={() => setPage('blog')} className="text-asteria-primary font-bold">查看更多 <i className="fa-solid fa-arrow-right"></i></button>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {ALL_POSTS.slice(0, 3).map(post => (
                  <div key={post.id} onClick={() => setPage('blog')} className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-100">
                    <div className={`${post.color} w-12 h-12 rounded-2xl mb-4 flex items-center justify-center`}><i className={`${post.icon} text-white`}></i></div>
                    <h3 className="font-bold text-gray-800 mb-2">{post.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2">{post.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <Services />
          <Reviews />
        </main>
      ) : (
        <BlogPage setPage={setPage} />
      )}
      <Footer />
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}