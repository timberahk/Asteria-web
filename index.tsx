import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  changeMyPassword,
  createSpaceEntry,
  deleteSpaceEntry,
  getCurrentAccount,
  getMySpace,
  getSignedImageMap,
  getStaffThread,
  isBackendConfigured,
  listStaffAccounts,
  listStaffInbox,
  loginWithUsername,
  markStaffThreadRead,
  sendMyMessage,
  signOutSpace,
  staffCreateAccount,
  staffDeleteAccount,
  staffDeleteMessage,
  staffSendMessage,
  staffResetPassword,
  updateSpaceEntry,
  upsertMyProfile,
  uploadSpaceImages
} from './lib/asteriaSpaceClient';
import type { StaffInboxCustomer } from './lib/asteriaSpaceClient';
import { teachingPosts } from './lib/articlesData';
import type { TeachingPost } from './lib/articlesData';

// --- Components ---

const LOGO_SRC = "/asteria-logo.jpg";
const WHATSAPP_URL = "https://wa.me/85259413688";
const TELEGRAM_URL = "https://t.me/asteriahongkong";
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=100075792163593";
const SITE_URL = "https://asteria-tarot.com";
const DEFAULT_SEO_IMAGE = `${SITE_URL}${LOGO_SRC}`;

const setSeoMeta = ({
  title,
  description,
  canonical,
  image = DEFAULT_SEO_IMAGE,
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
}: {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  robots?: string;
}) => {
  document.title = title;
  const setMeta = (selector: string, attr: 'content' | 'href', value: string) => {
    const element = document.querySelector(selector);
    if (element) element.setAttribute(attr, value);
  };

  setMeta('meta[name="description"]', 'content', description);
  setMeta('link[rel="canonical"]', 'href', canonical);
  setMeta('meta[name="robots"]', 'content', robots);
  setMeta('meta[name="googlebot"]', 'content', robots.replace('max-video-preview:-1', '').replace(/\s+,/g, ','));
  setMeta('meta[property="og:title"]', 'content', title);
  setMeta('meta[property="og:description"]', 'content', description);
  setMeta('meta[property="og:url"]', 'content', canonical);
  setMeta('meta[property="og:image"]', 'content', image);
  setMeta('meta[property="og:image:alt"]', 'content', 'Asteria 感情拯救所');
  setMeta('meta[name="twitter:title"]', 'content', title);
  setMeta('meta[name="twitter:description"]', 'content', description);
  setMeta('meta[name="twitter:image"]', 'content', image);
};

type SpaceSessionRole = 'customer' | 'staff' | null;

const isGenericSpaceName = (name?: string | null) => {
  const trimmed = (name || '').trim();
  return !trimmed || trimmed === 'Asteria Space user';
};

const getStoredSpaceRole = () => window.localStorage.getItem('asteriaCurrentRole') as SpaceSessionRole;

const clearStoredSpaceAccount = () => {
  window.localStorage.removeItem('asteriaCurrentRole');
  window.localStorage.removeItem('asteriaCurrentUsername');
  window.localStorage.removeItem('asteriaCurrentEmail');
  window.localStorage.removeItem('asteriaCurrentCustomerId');
};

const storeSpaceAccount = (account: { role: 'customer' | 'staff'; username: string; contact_email: string | null; user_id: string }) => {
  window.localStorage.setItem('asteriaCurrentRole', account.role);
  window.localStorage.setItem('asteriaCurrentUsername', account.username);
  window.localStorage.setItem('asteriaCurrentEmail', account.contact_email || '');
  if (account.role === 'customer') {
    window.localStorage.setItem('asteriaCurrentCustomerId', account.user_id);
  }
  window.dispatchEvent(new Event('asteria-session-change'));
};

const clearSpaceSession = async () => {
  await signOutSpace();
  clearStoredSpaceAccount();
  window.history.pushState(null, '', '/space/');
  window.dispatchEvent(new Event('asteria-route-change'));
  window.dispatchEvent(new Event('asteria-session-change'));
};

const cleanHomeUrl = () => {
  const rawHash = window.location.hash || '';
  const cleanHash = rawHash.replace(/^#/, '').split(/[?&/]/)[0].trim().toLowerCase();
  if (cleanHash === 'home') {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }
};

const goHome = (event?: React.MouseEvent<HTMLAnchorElement>) => {
  event?.preventDefault();
  window.history.pushState(null, '', `/${window.location.search}`);
  window.dispatchEvent(new Event('asteria-route-change'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const goHomeSection = (section: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
  window.history.pushState(null, '', `/${window.location.search}#${section}`);
  window.dispatchEvent(new Event('asteria-route-change'));
  requestAnimationFrame(() => {
    document.getElementById(section)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
};

const goSpaceEntry = (path: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
  window.history.pushState(null, '', path);
  window.dispatchEvent(new Event('asteria-route-change'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

type AppPage = 'home' | 'teaching' | 'about' | 'services' | 'oracle' | 'reviews' | 'register' | 'portal' | 'admin' | 'inbox';

const getRoutePage = (): AppPage => {
  const cleanPath = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (cleanPath === 'teaching' || cleanPath === 'cases' || cleanPath.startsWith('articles/')) return 'teaching';
  if (cleanPath === 'about') return 'about';
  if (cleanPath === 'services') return 'services';
  if (cleanPath === 'oracle') return 'oracle';
  if (cleanPath === 'reviews') return 'reviews';
  if (cleanPath === 'space' || cleanPath === 'login') return 'register';
  if (cleanPath === 'staff') return 'inbox';

  const rawHash = window.location.hash || '';
  const cleanHash = rawHash
    .replace(/^#/, '')
    .split(/[?&/]/)[0]
    .trim()
    .toLowerCase();

  if (cleanHash === 'teaching' || cleanHash === 'cases' || cleanHash.startsWith('article-')) return 'teaching';
  if (cleanHash === 'about') return 'about';
  if (cleanHash === 'services') return 'services';
  if (cleanHash === 'reviews') return 'reviews';
  if (cleanHash === 'register') return 'register';
  if (cleanHash === 'portal') return 'portal';
  if (cleanHash === 'admin') return 'admin';
  if (cleanHash === 'inbox') return 'inbox';
  return 'home';
};

const scrollToHashTarget = () => {
  const hash = window.location.hash;
  if (!hash || hash === '#home') return;
  requestAnimationFrame(() => {
    const target = document.getElementById(hash.slice(1));
    target?.scrollIntoView({ block: 'start' });
  });
};

const Navbar = () => {
  const [role, setRole] = useState<SpaceSessionRole>(getStoredSpaceRole);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const spacePath = role === 'staff' ? '/staff/' : '/space/';
  const spaceHref = spacePath;
  const spaceLabel = role === 'staff' ? 'Staff Inbox' : role === 'customer' ? '我的 Space' : 'Asteria Space';
  const navLinkClass = "hidden xl:inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-bold text-stone-600 transition-colors hover:bg-asteria-cream/30 hover:text-asteria-primary whitespace-nowrap";
  const mobileLinkClass = "flex h-10 items-center justify-between gap-3 rounded-xl px-3 text-sm font-bold text-asteria-dark transition-colors hover:bg-asteria-cream/20";
  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    const syncRole = () => setRole(getStoredSpaceRole());
    window.addEventListener('asteria-session-change', syncRole);
    window.addEventListener('storage', syncRole);
    window.addEventListener('hashchange', syncRole);
    window.addEventListener('asteria-route-change', closeMobileMenu);
    return () => {
      window.removeEventListener('asteria-session-change', syncRole);
      window.removeEventListener('storage', syncRole);
      window.removeEventListener('hashchange', syncRole);
      window.removeEventListener('asteria-route-change', closeMobileMenu);
    };
  }, []);

  return (
    <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-asteria-cream/30 shadow-sm transition-all">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center gap-3">
        <a href="/" onClick={goHome} className="flex min-w-0 shrink-0 items-center gap-2">
          <img src={LOGO_SRC} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-sm border border-asteria-cream/20 logo-img bg-white p-0.5" alt="Asteria logo" />
          <div className="text-base sm:text-lg md:text-xl font-bold text-gray-700 tracking-wide font-eng leading-none whitespace-nowrap">
            ASTERIA <span className="text-asteria-primary text-sm hidden 2xl:inline">感情拯救所</span>
          </div>
        </a>
        <div className="flex min-w-0 items-center justify-end gap-1.5 text-sm font-medium text-gray-600">
          <a href="/about/" className={navLinkClass}><i className="fa-regular fa-heart text-xs"></i> 關於我們</a>
          <a href="/teaching/" className={navLinkClass}><i className="fa-regular fa-newspaper text-xs"></i> 相處教學</a>
          <a href="/services/" className={navLinkClass}><i className="fa-solid fa-wand-magic-sparkles text-xs"></i> 服務</a>
          <a href="/oracle/" className={navLinkClass}><i className="fa-regular fa-star text-xs"></i> 每日指引</a>
          <a href="/reviews/" className={navLinkClass}><i className="fa-regular fa-comment-dots text-xs"></i> 好評</a>
          <a href={spaceHref} onClick={goSpaceEntry(spacePath)} className="border border-asteria-cream bg-white text-asteria-primary px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold hover:border-asteria-primary transition-all flex shrink-0 items-center gap-1 whitespace-nowrap" aria-label={spaceLabel}>
            <i className="fa-regular fa-user"></i> <span className="hidden min-[360px]:inline">{spaceLabel}</span>
          </a>
          {role && (
            <button onClick={clearSpaceSession} className="border border-red-100 bg-white text-red-500 px-3 py-1.5 rounded-full text-sm font-bold hover:bg-red-50 transition-all hidden xl:inline-flex whitespace-nowrap">
              登出
            </button>
          )}
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="bg-gradient-to-r from-green-400 to-green-500 text-white px-4 py-1.5 rounded-full text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all hidden 2xl:flex items-center gap-1 whitespace-nowrap">
            <i className="fa-brands fa-whatsapp"></i> <span>預約</span>
          </a>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="xl:hidden border border-asteria-cream bg-white text-asteria-primary w-10 h-10 rounded-full text-lg font-bold flex shrink-0 items-center justify-center shadow-sm"
            aria-label={mobileMenuOpen ? '收起選單' : '打開選單'}
            aria-expanded={mobileMenuOpen}
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="xl:hidden absolute right-3 top-[72px] z-[60] w-[min(21rem,calc(100vw-1.5rem))] rounded-2xl border border-asteria-cream bg-white p-2 shadow-2xl">
            <div className="grid gap-1">
              <a href="/about/" onClick={closeMobileMenu} className={mobileLinkClass}>
                <span><i className="fa-regular fa-heart mr-2 text-asteria-primary"></i>關於我們</span>
                <i className="fa-solid fa-chevron-right text-[10px] text-stone-300"></i>
              </a>
              <a href="/oracle/" onClick={closeMobileMenu} className={mobileLinkClass}>
                <span><i className="fa-regular fa-star mr-2 text-asteria-primary"></i>每日指引</span>
                <i className="fa-solid fa-chevron-right text-[10px] text-stone-300"></i>
              </a>
              <a href="/teaching/" onClick={closeMobileMenu} className={mobileLinkClass}>
                <span><i className="fa-regular fa-newspaper mr-2 text-asteria-primary"></i>相處教學</span>
                <i className="fa-solid fa-chevron-right text-[10px] text-stone-300"></i>
              </a>
              <a href="/services/" onClick={closeMobileMenu} className={mobileLinkClass}>
                <span><i className="fa-solid fa-wand-magic-sparkles mr-2 text-asteria-primary"></i>服務</span>
                <i className="fa-solid fa-chevron-right text-[10px] text-stone-300"></i>
              </a>
              <a href="/reviews/" onClick={closeMobileMenu} className={mobileLinkClass}>
                <span><i className="fa-regular fa-comment-dots mr-2 text-asteria-primary"></i>好評</span>
                <i className="fa-solid fa-chevron-right text-[10px] text-stone-300"></i>
              </a>
            </div>
            {role && (
              <div className="mt-1 grid gap-1 border-t border-asteria-cream/60 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    void clearSpaceSession();
                  }}
                  className="flex h-10 items-center justify-between gap-3 rounded-xl px-3 text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
                >
                  <span><i className="fa-solid fa-arrow-right-from-bracket mr-2"></i>登出</span>
                  <i className="fa-solid fa-chevron-right text-xs text-red-200"></i>
                </button>
              </div>
            )}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-asteria-cream/60 pt-2">
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" onClick={closeMobileMenu} className="inline-flex h-9 items-center justify-center gap-1 rounded-full bg-[#25D366] px-3 text-xs font-bold text-white">
                <i className="fa-brands fa-whatsapp"></i> WhatsApp
              </a>
              <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" onClick={closeMobileMenu} className="inline-flex h-9 items-center justify-center gap-1 rounded-full bg-[#2AABEE] px-3 text-xs font-bold text-white">
                <i className="fa-brands fa-telegram"></i> Telegram
              </a>
              <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" onClick={closeMobileMenu} className="inline-flex h-9 items-center justify-center gap-1 rounded-full bg-[#1877F2] px-3 text-xs font-bold text-white">
                <i className="fa-brands fa-facebook-f"></i> Facebook
              </a>
            </div>
        </div>
      )}
      <div className="bg-asteria-dark text-white">
        <div className="container mx-auto px-3 py-2 flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs md:text-sm text-center">
          <span className="font-bold whitespace-nowrap">IG 帳號暫停通知</span>
          <span className="text-white/80 whitespace-nowrap">請改用以下官方方法聯絡：</span>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center justify-center gap-1 bg-[#25D366] text-white px-2.5 sm:px-3 py-1 rounded-full font-bold whitespace-nowrap">
            <i className="fa-brands fa-whatsapp"></i> WhatsApp
          </a>
          <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center justify-center gap-1 bg-[#1877F2] text-white px-2.5 sm:px-3 py-1 rounded-full font-bold whitespace-nowrap">
            <i className="fa-brands fa-facebook-f"></i> Facebook
          </a>
          <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center justify-center gap-1 bg-[#2AABEE] text-white px-2.5 sm:px-3 py-1 rounded-full font-bold whitespace-nowrap">
            <i className="fa-brands fa-telegram"></i> Telegram
          </a>
          <a href={spaceHref} onClick={goSpaceEntry(spacePath)} className="inline-flex max-w-full items-center justify-center gap-1 bg-white text-asteria-primary px-2.5 sm:px-3 py-1 rounded-full font-bold whitespace-nowrap">
            <i className="fa-regular fa-user"></i> Asteria Space
          </a>
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
            Asteria Crystal Tarot
            <span className="block text-2xl md:text-4xl mt-3 text-asteria-primary">
              你的感情由你話事！
            </span>
          </h1>

          <p className="text-lg text-stone-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
            asteria.crystal.tarot 香港官方網站。所有感情煩惱一律建議搵我地。復合、斷聯、曖昧、第三者與關係卡住的個案，
            我們會配合塔羅分析與儀式方向，幫你看清下一步。
          </p>

          <div className="bg-white border border-asteria-yellow/70 rounded-2xl p-5 mb-8 shadow-sm max-w-xl mx-auto lg:mx-0 text-left">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-asteria-yellow/35 text-asteria-primary flex items-center justify-center shrink-0">
                <i className="fa-solid fa-bullhorn"></i>
              </div>
              <div>
                <div className="font-bold text-asteria-dark mb-1">IG 帳號暫停通知</div>
                <p className="text-sm text-stone-500 leading-relaxed mb-4">
                  IG 暫時停用。請用 WhatsApp、Telegram、Facebook 或 Asteria Space 聯絡我哋。
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 sm:px-5 py-3 rounded-xl font-bold hover:brightness-95 transition-all whitespace-nowrap">
                    <i className="fa-brands fa-whatsapp"></i> WhatsApp
                  </a>
                  <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#1877F2] text-white px-4 sm:px-5 py-3 rounded-xl font-bold hover:brightness-95 transition-all whitespace-nowrap">
                    <i className="fa-brands fa-facebook-f"></i> Facebook
                  </a>
                  <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center justify-center gap-2 bg-[#2AABEE] text-white px-4 sm:px-5 py-3 rounded-xl font-bold hover:brightness-95 transition-all whitespace-nowrap">
                    <i className="fa-brands fa-telegram"></i> Telegram
                  </a>
                  <a href="/space/" className="inline-flex items-center justify-center gap-2 bg-asteria-dark text-white px-4 sm:px-5 py-3 rounded-xl font-bold hover:brightness-110 transition-all whitespace-nowrap">
                    <i className="fa-regular fa-user"></i> Asteria Space
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#FFF8EC] border border-asteria-cream rounded-2xl p-5 mb-8 shadow-sm max-w-xl mx-auto lg:mx-0 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div>
                <div className="font-bold text-asteria-dark mb-1">請留低你的聯絡資料</div>
              </div>
              <a href="/space/" className="bg-asteria-dark text-white px-5 py-3 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all shrink-0">
                <i className="fa-regular fa-user"></i> 登入 Space
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <a href="/space/" className="bg-asteria-dark text-white px-8 py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all">
              <i className="fa-regular fa-address-card"></i> 留資料 / 登入 Space
            </a>
            <a href="/services/" className="btn-primary px-8 py-4 rounded-xl font-bold shadow-lg shadow-amber-200 flex items-center justify-center gap-2 group">
              <i className="fa-solid fa-wand-magic-sparkles group-hover:rotate-12 transition-transform"></i> 查看儀式分類
            </a>
            <a href="/oracle/" className="bg-white text-asteria-primary border-2 border-asteria-yellow/70 px-8 py-4 rounded-xl font-bold hover:bg-asteria-yellow/20 transition-all flex items-center justify-center gap-2">
              <i className="fa-solid fa-star"></i> 今日指引
            </a>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto lg:mx-0 text-left">
            {[
              ["11,000+", "累積個案"],
              ["極高", "回頭客好評"],
              ["私隱", "一對一跟進"]
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
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="w-full bg-[#25D366] text-white py-3 rounded-xl font-bold hover:brightness-95 transition-all flex items-center justify-center gap-2">
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
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(160,106,54,0.18)_1px,transparent_0)] [background-size:18px_18px] opacity-30 pointer-events-none"></div>
      
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
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.45)_1px,transparent_0)] [background-size:16px_16px] opacity-20"></div>
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
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.45)_1px,transparent_0)] [background-size:16px_16px] opacity-30"></div>
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

                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-primary w-full py-4 rounded-xl font-bold shadow-lg shadow-amber-200 flex items-center justify-center gap-2 text-lg animate-pulse hover:animate-none">
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

const GuidanceSection = () => {
  const guidanceItems = [
    {
      title: "逐句訊息 review",
      desc: "唔係叫你死背罐頭句，而係按你同對方的語氣、關係狀態，睇每句應唔應該講、點樣講會少啲壓迫感。",
      icon: "fa-regular fa-message"
    },
    {
      title: "日常相處指引",
      desc: "對方冷淡、已讀不回、忽冷忽熱、講錯嘢後點補救，我哋會幫你拆解下一步應該點處理。",
      icon: "fa-solid fa-route"
    },
    {
      title: "情緒支援陪伴",
      desc: "失戀、斷聯、等回覆的時間好難捱，我哋會陪你整理情緒，避免你因為太急而做錯下一步。",
      icon: "fa-solid fa-hand-holding-heart"
    },
    {
      title: "感情策略方向",
      desc: "占卜同儀式只係其中一部分，更重要係知道現實中應該點行，幾時進、幾時停、幾時唔好再追問。",
      icon: "fa-solid fa-compass"
    }
  ];

  const painPoints = [
    "一心急就長篇大論，令對方更想避開",
    "不停問「你仲愛唔愛我」，逼對方即刻表態",
    "用情緒試探對方，結果愈試愈無安全感",
    "明明想修補，講出口卻變成責怪或翻舊帳",
    "失戀時太痛，忍唔住追訊息、追答案、追承諾"
  ];

  return (
    <section className="py-20 bg-white" aria-labelledby="guidance-title">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-start">
          <div>
            <div className="text-sm font-bold text-asteria-primary mb-2">Asteria 不只係占卜同儀式</div>
            <h2 id="guidance-title" className="text-3xl md:text-4xl font-bold text-asteria-dark leading-tight mb-5">
              你最亂嗰陣，<br className="hidden md:block" />我哋做你感情路上的指明燈
            </h2>
            <p className="text-stone-500 leading-relaxed mb-6">
              幫襯 Asteria 唔係收完錢就完。我哋會陪你睇清楚局面，亦會手把手教你日常相處：訊息點覆、邊句唔好講、幾時應該退一步、幾時可以推進。尤其失戀、斷聯、冷淡期最難捱的時候，你唔需要自己一個亂估亂衝。
            </p>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-xl font-bold shadow-sm hover:brightness-95 transition-all">
              <i className="fa-brands fa-whatsapp"></i> 想有人陪你拆解
            </a>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {guidanceItems.map((item) => (
              <article key={item.title} className="bg-[#FFF8EC] border border-asteria-cream/70 rounded-2xl p-5">
                <div className="w-11 h-11 rounded-full bg-white text-asteria-primary flex items-center justify-center mb-4 shadow-sm">
                  <i className={item.icon}></i>
                </div>
                <h3 className="text-lg font-bold text-asteria-dark mb-2">{item.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-asteria-cream/70 bg-[#FFFDF8] p-6 md:p-8">
          <div className="grid lg:grid-cols-[260px_1fr] gap-6 items-start">
            <div>
              <div className="text-sm font-bold text-asteria-primary mb-2">常見卡位</div>
              <h3 className="text-2xl font-bold text-asteria-dark">通常唔係你唔夠愛，而係方法錯咗</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {painPoints.map((point) => (
                <div key={point} className="flex items-start gap-3 bg-white rounded-xl border border-asteria-cream/60 p-4">
                  <i className="fa-solid fa-check text-asteria-primary mt-1"></i>
                  <span className="text-sm text-stone-600 leading-relaxed">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const AboutPage = () => (
  <main className="pt-56 md:pt-40 pb-20 bg-[#FFFDF8] min-h-screen">
    <div className="container mx-auto px-6 max-w-6xl">
      <a href="/" onClick={goHome} className="inline-flex items-center gap-2 text-asteria-primary font-bold mb-8">
        <i className="fa-solid fa-arrow-left"></i> 返回首頁
      </a>
      <section className="rounded-3xl bg-white border border-asteria-cream/70 p-8 md:p-10 shadow-sm mb-10">
        <div className="text-sm font-bold text-asteria-primary mb-2">About Asteria</div>
        <h1 className="text-4xl md:text-5xl font-bold text-asteria-dark leading-tight mb-5">Asteria 感情拯救所</h1>
        <p className="text-lg text-stone-500 leading-relaxed max-w-3xl">
          我哋唔只係幫你占卜同安排儀式，更重要係陪你睇清楚局面，教你喺日常相處入面點樣講、點樣做、幾時應該停一停。感情最混亂嗰陣，好多時差一步就講錯、追錯、逼錯；Asteria 就係陪你穩住嗰一步。
        </p>
      </section>
    </div>
    <GuidanceSection />
    <div className="container mx-auto px-6 max-w-6xl">
      <section className="rounded-3xl bg-asteria-dark text-white p-8 md:p-10 mt-10">
        <div className="text-sm font-bold text-asteria-yellow mb-2">你唔需要自己一個估</div>
        <h2 className="text-3xl font-bold mb-4">想知道你個情況可以點行？</h2>
        <p className="text-white/75 leading-relaxed mb-6 max-w-2xl">
          如果你正面對冷淡、斷聯、分手、復合、第三者、訊息唔知點覆，或者只係情緒好亂，可以直接 WhatsApp 我哋。
        </p>
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-xl font-bold shadow-sm hover:brightness-95 transition-all">
          <i className="fa-brands fa-whatsapp"></i> WhatsApp 聯絡
        </a>
      </section>
    </div>
  </main>
);

// --- Blog Component (New) ---
const Blog = ({ fullPage = false }: { fullPage?: boolean }) => {
    const [selectedPost, setSelectedPost] = useState<any>(null);
  
    const posts = teachingPosts;
    const [articleSearch, setArticleSearch] = useState('');
    const [activeArticleCategory, setActiveArticleCategory] = useState('全部');
    const articleCategories = ['全部', ...Array.from(new Set(posts.map((post) => post.category)))];
    const normalizedArticleSearch = articleSearch.trim().toLowerCase();
    const visiblePosts = posts.filter((post) => {
      const matchesCategory = activeArticleCategory === '全部' || post.category === activeArticleCategory;
      const haystack = `${post.title} ${post.summary} ${post.category} ${post.tags.join(' ')}`.toLowerCase();
      return matchesCategory && (!normalizedArticleSearch || haystack.includes(normalizedArticleSearch));
    });

    const stableHash = (value: string) =>
      value.split('').reduce((total, char) => total + char.charCodeAt(0), 0);

    const rotatePosts = (items: TeachingPost[], seed: number) => {
      if (!items.length) return [];
      const offset = Math.abs(seed) % items.length;
      return [...items.slice(offset), ...items.slice(0, offset)];
    };

    const scoreRelatedPost = (source: TeachingPost, candidate: TeachingPost) => {
      let score = 0;
      if (source.category === candidate.category) score += 8;

      const sourceTags = new Set(source.tags || []);
      score += (candidate.tags || []).filter((tag) => sourceTags.has(tag)).length * 4;

      const sourceText = `${source.title} ${source.summary}`.toLowerCase();
      for (const tag of candidate.tags || []) {
        if (sourceText.includes(tag.toLowerCase())) score += 1;
      }

      return score;
    };

    const getRelatedPosts = (currentId: number | null, count: number, offset = 0) => {
      const current = posts.find((post) => post.id === currentId);
      const candidates = posts.filter((post) => post.id !== currentId);
      if (!current) return rotatePosts(candidates, offset).slice(0, count);

      const seed = current.id + stableHash(current.category || '') + offset * 17;
      const rotatedCandidates = rotatePosts(candidates, seed);

      return [...rotatedCandidates]
        .sort((a, b) => {
          const scoreDiff = scoreRelatedPost(current, b) - scoreRelatedPost(current, a);
          if (scoreDiff !== 0) return scoreDiff;
          return ((a.id + seed) % 23) - ((b.id + seed) % 23);
        })
        .slice(0, count);
    };

    const getHomePosts = () => {
      const byCategory = articleCategories
        .filter((category) => category !== '全部')
        .flatMap((category, index) => rotatePosts(posts.filter((post) => post.category === category), index * 11).slice(0, 1));
      return Array.from(new Map([...byCategory, ...rotatePosts(posts, 9)].map((post) => [post.id, post])).values()).slice(0, 4);
    };

    const homePosts = getHomePosts();

    const makeArticleHref = (post: any) => `/articles/${post.id}/`;
    const pathMatch = fullPage ? window.location.pathname.match(/^\/articles\/(\d+)\/?$/) : null;
    const hashMatch = fullPage ? (window.location.hash || '').replace(/^#/, '').match(/^(article|case)-(\d+)$/) : null;
    const articleMatch = pathMatch || hashMatch;
    const activeId = articleMatch ? Number(articleMatch[1] === 'article' ? articleMatch[2] : articleMatch[1]) : null;
    const activePost = posts.find((post) => post.id === activeId);
    const relatedCalloutPost = getRelatedPosts(activeId, 1, 2)[0];
    const relatedPosts = getRelatedPosts(activeId, 5)
      .filter((post) => post.id !== relatedCalloutPost?.id)
      .slice(0, 3);
    const isCaseLibrary = fullPage && window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase() === 'cases';

    const absoluteUrl = (url?: string) => {
      if (!url) return DEFAULT_SEO_IMAGE;
      return url.startsWith('http') ? url : `${SITE_URL}${url}`;
    };

    const buildSeoKeywords = (post?: TeachingPost | null) => {
      const searchIntents = [
        '復合', '挽回', '挽回前任', '分手後點算', '失戀', '放唔低前任',
        '斷聯', '冷淡期', '對方冷淡', '少覆 message', '曖昧', '第三者',
        '感情占卜', '愛情塔羅', '塔羅分析', '愛情儀式', '關係修復',
        '相處教學', '感情教學', '訊息點覆', '情緒支援', 'Asteria 感情拯救所'
      ];
      const articleTerms = post ? [post.title, post.category, post.imageLabel, ...post.tags] : [];
      return Array.from(new Set([...articleTerms, ...searchIntents]))
        .filter(Boolean)
        .join(', ');
    };

    const buildSeoDescription = (post?: TeachingPost | null) => {
      if (!post) {
        return isCaseLibrary
          ? 'Asteria 感情拯救所客人個案長文庫，整理復合、斷聯、冷淡、第三者與關係修復案例。'
          : 'Asteria 感情拯救所相處教學，整理復合挽回、分手失戀、斷聯冷淡、曖昧第三者、感情占卜與日常相處方法。';
      }
      const cleanSummary = post.summary.replace(/[\[\]【】]/g, '').replace(/\s+/g, ' ').trim();
      const base = `${cleanSummary} Asteria 感情拯救所提供復合挽回、斷聯冷淡、曖昧相處、感情占卜、塔羅分析與關係修復方向。`;
      return base.slice(0, 155);
    };

    useEffect(() => {
      if (!fullPage) return;
      const title = activePost
        ? `${activePost.title}｜Asteria 感情拯救所`
        : isCaseLibrary
          ? '客人個案長文｜Asteria 感情拯救所'
          : '相處教學｜Asteria 感情拯救所';
      const description = buildSeoDescription(activePost);
      const canonical = activePost
        ? `https://asteria-tarot.com/articles/${activeId}/`
        : isCaseLibrary ? 'https://asteria-tarot.com/cases/' : 'https://asteria-tarot.com/teaching/';
      const coverImage = absoluteUrl(activePost?.coverImage);
      const keywords = buildSeoKeywords(activePost);

      setSeoMeta({ title, description, canonical, image: coverImage });
      const setMeta = (selector: string, attr: 'content' | 'href', value: string) => {
        const element = document.querySelector(selector);
        if (element) element.setAttribute(attr, value);
      };
      setMeta('meta[name="keywords"]', 'content', keywords);
      setMeta('meta[property="og:image:alt"]', 'content', activePost?.title || 'Asteria 感情拯救所');

      const previous = document.getElementById('asteria-dynamic-article-schema');
      previous?.remove();
      if (activePost) {
        const articleImages = [
          absoluteUrl(activePost.coverImage),
          ...getEditorialImages(activeId).map((image) => absoluteUrl(image.src))
        ];
        const graph: any[] = [
          {
            '@type': 'Article',
            headline: activePost.title,
            description,
            image: Array.from(new Set(articleImages)),
            author: { '@type': 'Organization', name: 'Asteria Crystal Tarot' },
            publisher: {
              '@type': 'Organization',
              name: 'Asteria Crystal Tarot',
              logo: { '@type': 'ImageObject', url: 'https://asteria-tarot.com/asteria-logo.jpg' }
            },
            mainEntityOfPage: canonical,
            inLanguage: 'zh-HK',
            articleSection: activePost.category,
            datePublished: activePost.date,
            dateModified: activePost.date,
            keywords,
            about: [
              '復合挽回',
              '分手失戀',
              '斷聯冷淡',
              '曖昧關係',
              '感情占卜',
              '愛情塔羅',
              '相處教學',
              activePost.category
            ]
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://asteria-tarot.com/' },
              { '@type': 'ListItem', position: 2, name: '相處教學', item: 'https://asteria-tarot.com/teaching/' },
              { '@type': 'ListItem', position: 3, name: activePost.title, item: canonical }
            ]
          }
        ];
        const script = document.createElement('script');
        script.id = 'asteria-dynamic-article-schema';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': graph
        });
        document.head.appendChild(script);
      }
    }, [fullPage, activeId, activePost?.title, isCaseLibrary]);

    useEffect(() => {
      if (!fullPage || !activePost) return;
      requestAnimationFrame(() => {
        document.querySelector('main')?.scrollIntoView({ block: 'start' });
      });
    }, [fullPage, activeId, activePost?.title]);

    const ArticleVisual = ({ post, large = false }: { post: TeachingPost; large?: boolean }) => (
      <div className={`${post.color} ${large ? 'min-h-[280px] md:min-h-[380px]' : 'aspect-[1.2/1]'} relative overflow-hidden flex items-center justify-center`}>
        <div className="absolute inset-5 border border-white/70 rounded-2xl"></div>
        <div className="absolute top-4 left-4 bg-white/90 text-asteria-primary px-3 py-1 rounded-full text-xs font-bold shadow-sm">{post.category}</div>
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/35"></div>
        <div className="absolute -left-8 top-14 w-28 h-28 rounded-full bg-white/25"></div>
        <div className="text-center px-8 relative z-10 max-w-lg">
          <i className={`${post.icon} ${large ? 'text-6xl md:text-7xl' : 'text-5xl'} text-white drop-shadow-md mb-5 block`}></i>
          <div className="font-eng text-sm tracking-[0.2em] text-white/90 mb-2">ASTERIA</div>
          <div className={`${large ? 'text-4xl md:text-6xl' : 'text-3xl'} font-bold text-asteria-dark leading-tight`}>{post.imageLabel}</div>
        </div>
      </div>
    );

    const getEditorialImages = (id?: number | null) => {
      const post = posts.find((item) => item.id === id) || posts[0];
      return post.images?.length ? post.images : [{ src: post.coverImage, caption: post.coverCaption, credit: '', creditUrl: '', prompt: '' }];
    };

    const getCoverImage = (post: TeachingPost) => {
      const imageWithCredit = post.images?.find((image) => image.src === post.coverImage);
      return imageWithCredit || {
        src: post.coverImage,
        caption: post.coverCaption,
        credit: post.coverCredit || '',
        creditUrl: post.coverCreditUrl || '',
        prompt: post.coverPrompt || ''
      };
    };

    const ArticleCover = ({ post, compact = false, hero = false }: { post: TeachingPost; compact?: boolean; hero?: boolean }) => {
      const cover = getCoverImage(post);
      const [failed, setFailed] = useState(false);
      return (
        <div className={`${hero ? 'aspect-[16/9] md:aspect-[2.2/1]' : compact ? 'aspect-[1.15/1]' : 'aspect-[4/3]'} relative overflow-hidden bg-[#FFF8EC]`}>
          {!failed ? (
            <img src={cover.src} alt={cover.caption} className="w-full h-full object-cover" loading="lazy" onError={() => setFailed(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#FFF8EC] text-asteria-primary">
              <i className="fa-regular fa-image text-3xl"></i>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-asteria-dark/18 via-transparent to-transparent pointer-events-none"></div>
          <span className="absolute top-4 left-4 bg-[#FFF8EC]/95 backdrop-blur-sm border border-white/80 px-3.5 py-1.5 rounded-full text-xs font-bold text-asteria-primary shadow-[0_8px_22px_rgba(59,38,29,0.16)]">
            {post.category}
          </span>
        </div>
      );
    };

    const getInlineImages = (id?: number | null) => {
      const post = posts.find((item) => item.id === id) || posts[0];
      const images = post.images || [];
      return images.length ? images : getEditorialImages(post.id);
    };

    const PhotoCredit = ({ image }: { image?: { credit?: string; creditUrl?: string } }) => {
      if (!image?.credit) return null;
      return (
        <figcaption className="px-4 py-2 text-xs md:text-sm text-stone-400 bg-white">
          圖片｜
          {image.creditUrl ? (
            <a href={image.creditUrl} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-asteria-primary">
              {image.credit}
            </a>
          ) : (
            image.credit
          )}
        </figcaption>
      );
    };

    const getArticleSegments = (content: string) => {
      const parts = content.split(/(?=<h2>)/g).filter((part) => part.trim());
      return parts.length ? parts : [content];
    };

    const ArticleInlineImage = ({ index }: { index: number }) => {
      const images = getInlineImages(activeId);
      const image = images[index] || images[0];
      const [failed, setFailed] = useState(false);
      return (
        <figure className="article-figure my-10 md:my-14 overflow-hidden rounded-[24px] md:rounded-[32px] border border-asteria-cream/70 bg-white shadow-sm">
          <div className="aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] bg-[#FFF8EC]">
            {!failed ? (
              <img src={image.src} alt={image.caption} className="w-full h-full object-cover" loading="lazy" onError={() => setFailed(true)} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-asteria-primary">
                <i className="fa-regular fa-image text-3xl"></i>
              </div>
            )}
          </div>
          <PhotoCredit image={image} />
        </figure>
      );
    };

    const ArticleRelatedCallout = ({ recommendation }: { recommendation?: TeachingPost }) => {
      if (!recommendation) return null;
      return (
        <aside className="my-8 md:my-10 rounded-2xl border border-asteria-cream bg-[#FFF8EC] p-5 md:p-6">
          <div className="text-xs font-bold tracking-[0.2em] text-asteria-primary mb-3">你可能也想睇</div>
          <a href={makeArticleHref(recommendation)} className="grid md:grid-cols-[160px_1fr] gap-4 items-center group">
            <ArticleCover post={recommendation} compact />
            <div>
              <h3 className="text-xl font-bold text-asteria-dark leading-snug group-hover:text-asteria-primary transition-colors">{recommendation.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed mt-2 line-clamp-3">{recommendation.summary}</p>
              <div className="text-sm font-bold text-asteria-primary mt-3 inline-flex items-center gap-2">
                繼續閱讀 <i className="fa-solid fa-arrow-right"></i>
              </div>
            </div>
          </a>
        </aside>
      );
    };

    if (fullPage && isCaseLibrary) {
      return (
        <main className="pt-56 md:pt-40 pb-20 bg-[#FFFDF8] min-h-screen">
          <div className="container mx-auto px-6 max-w-5xl">
            <a href="/" onClick={goHome} className="inline-flex items-center gap-2 text-asteria-primary font-bold mb-8">
              <i className="fa-solid fa-arrow-left"></i> 返回首頁
            </a>
            <section className="bg-white border border-asteria-cream/70 rounded-3xl p-8 md:p-10 shadow-sm">
              <div className="text-sm font-bold text-asteria-primary mb-2">asteria感情拯救所</div>
              <h1 className="text-4xl md:text-5xl font-bold text-asteria-dark mb-5">客人個案長文</h1>
              <p className="text-stone-500 leading-relaxed max-w-2xl">
                呢度之後會放真實匿名個案長文，例如復合、斷聯、冷淡、第三者、前任新歡、關係修復等案例拆解。暫時未放內容，等整理好真個案先公開。
              </p>
              <div className="mt-8 grid md:grid-cols-3 gap-4">
                {['復合個案', '斷聯冷淡', '第三者／新歡'].map((label) => (
                  <div key={label} className="rounded-2xl bg-[#FFF8EC] border border-asteria-cream/70 p-5">
                    <div className="text-lg font-bold text-asteria-dark">{label}</div>
                    <div className="text-sm text-stone-400 mt-2">即將整理</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      );
    }

    if (fullPage && activePost) {
      const articleSegments = getArticleSegments(activePost.content);
      return (
        <main className="pt-56 md:pt-40 pb-20 bg-[#FFFDF8] min-h-screen">
          <article className="container mx-auto px-6 max-w-4xl">
            <a href="/teaching/" className="inline-flex items-center gap-2 text-asteria-primary font-bold mb-8">
              <i className="fa-solid fa-arrow-left"></i> 返回文章列表
            </a>
            <div className="overflow-hidden">
              <div className="rounded-[28px] md:rounded-[36px] overflow-hidden shadow-sm border border-asteria-cream/70 bg-white">
                <ArticleCover post={activePost} hero />
                <PhotoCredit image={getCoverImage(activePost)} />
              </div>
              <div className="py-8 md:py-12">
                <div className="flex flex-wrap items-center gap-3 text-sm text-stone-400 mb-5">
                  <span className="text-asteria-primary font-bold">{activePost.category}</span>
                  <span>asteria感情拯救所</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-asteria-dark leading-tight mb-5">{activePost.title}</h1>
                <p className="text-lg md:text-xl text-stone-500 leading-relaxed mb-10 max-w-3xl">{activePost.summary}</p>
                {articleSegments.map((segment, index) => (
                  <React.Fragment key={`${activePost.id}-${index}`}>
                    <div className="article-body" dangerouslySetInnerHTML={{ __html: segment }}></div>
                    {index < 3 && <ArticleInlineImage index={index} />}
                    {index === 0 && <ArticleRelatedCallout recommendation={relatedCalloutPost} />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <section className="mt-12">
              <div className="flex items-end justify-between gap-4 mb-5">
                <div>
                  <div className="text-sm font-bold text-asteria-primary mb-1">繼續閱讀</div>
                  <h2 className="text-2xl font-bold text-asteria-dark">其他推介</h2>
                </div>
                <a href="/teaching/" className="text-sm font-bold text-asteria-primary">全部文章</a>
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                {relatedPosts.map((post) => (
                  <a key={post.id} href={makeArticleHref(post)} className="bg-white border border-asteria-cream/70 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
                    <ArticleCover post={post} compact />
                    <div className="p-4">
                      <h3 className="font-bold text-asteria-dark leading-snug line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-stone-500 mt-2 line-clamp-2">{post.summary}</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          </article>
        </main>
      );
    }
  
    if (fullPage) {
      return (
        <main className="pt-56 md:pt-40 pb-20 bg-[#FFFDF8] min-h-screen">
          <div className="container mx-auto px-6 max-w-6xl">
            <a href="/" onClick={goHome} className="inline-flex items-center gap-2 text-asteria-primary font-bold mb-8">
              <i className="fa-solid fa-arrow-left"></i> 返回首頁
            </a>
            <div className="mb-10 grid lg:grid-cols-[1fr_auto] gap-6 items-end">
              <div>
                <div className="text-sm font-bold text-asteria-primary mb-2">asteria感情拯救所</div>
                <h1 className="text-4xl font-bold text-asteria-dark mb-3">相處教學</h1>
                <p className="text-stone-500 max-w-2xl">用圖文方式慢慢睇，將感情相處、復合心態、曖昧判斷整理成一篇篇短教學。</p>
              </div>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-xl font-bold shadow-sm hover:brightness-95 transition-all">
                <i className="fa-brands fa-whatsapp"></i> 直接 WhatsApp 聯絡
              </a>
            </div>

            <section id="teaching-articles" className="scroll-mt-40">
              <div className="mb-8 rounded-3xl bg-white border border-asteria-cream/70 p-4 md:p-5 shadow-sm">
                <label className="block text-sm font-bold text-asteria-dark mb-2">搜尋教學文</label>
                <div className="relative mb-4">
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-stone-300"></i>
                  <input
                    value={articleSearch}
                    onChange={(event) => setArticleSearch(event.target.value)}
                    placeholder="Search 分手、復合、冷淡、訊息、曖昧..."
                    className="w-full rounded-2xl border border-asteria-cream px-11 py-3 text-asteria-dark focus:outline-none focus:border-asteria-primary"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {articleCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveArticleCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${
                        activeArticleCategory === category
                          ? 'bg-asteria-dark text-white border-asteria-dark'
                          : 'bg-[#FFF8EC] text-asteria-primary border-asteria-cream'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <div className="mt-3 text-sm text-stone-400">{visiblePosts.length} 篇文章</div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {visiblePosts.map((post) => {
                const isActive = selectedPost?.id === post.id;

                return (
                  <article
                    key={post.id}
                    className={`bg-white border rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full ${isActive ? 'border-asteria-primary shadow-lg' : 'border-asteria-cream/70'}`}
                  >
                    <a href={makeArticleHref(post)} className="group text-left w-full h-full flex flex-col">
                      <ArticleCover post={post} />
                      <div className="p-5 flex flex-col flex-grow">
                        <h2 className="text-lg font-bold text-asteria-dark mb-2 leading-snug line-clamp-2 min-h-[3.15rem]">{post.title}</h2>
                        <p className="text-sm text-stone-500 leading-relaxed line-clamp-3 min-h-[4.9rem]">{post.summary}</p>
                        <div className="mt-auto pt-4 inline-flex items-center gap-2 text-asteria-primary text-sm font-bold">
                          閱讀全文 <i className="fa-solid fa-arrow-right"></i>
                        </div>
                      </div>
                    </a>
                  </article>
                );
              })}
              </div>
            </section>

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
            <a href="/teaching/" className="btn-primary px-5 py-3 rounded-xl font-bold inline-flex items-center gap-2 justify-center">
              查看全部文章 <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>
  
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {homePosts.map((post) => (
              <a 
                key={post.id} 
                href={makeArticleHref(post)}
                className="group cursor-pointer bg-white rounded-2xl border border-gray-100 hover:border-asteria-primary/30 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                <ArticleCover post={post} compact />
                
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
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-green-600 bg-white px-5 py-2 rounded-full shadow-sm hover:shadow transition-all text-sm font-bold">
                <i className="fa-brands fa-whatsapp"></i> 直接 WhatsApp 聯絡
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
                        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="bg-asteria-primary text-white px-6 py-2 rounded-full font-bold hover:bg-amber-800 transition-colors shadow-md text-sm">
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

const SearchIntentSection = () => {
  const intents = [
    {
      title: "想復合、想挽回前任",
      question: "分手後佢仲有無掛住你？仲有無機會返轉頭？",
      answer: "唔好淨係估佢冷淡就等於無機會。先睇對方有無保留聯絡窗口、分手原因、假性分手定真性切斷，再決定應該主動、斷聯定慢慢拉返距離。",
      icon: "fa-solid fa-heart-circle-bolt",
      tone: "from-[#FFF3D6] to-[#FFE7DD]",
      accent: "text-[#A65F2B]",
      badge: "bg-[#FBE0B8]",
      motif: "復合"
    },
    {
      title: "分手失戀、放唔低佢",
      question: "明明知道要冷靜，但一到夜晚就忍唔住想搵佢？",
      answer: "失戀最痛係個心停唔到。Asteria 會先陪你整理情緒、分手原因同對方心態，再分清楚係應該挽回、等待、淡化執念，定係學習放低。",
      icon: "fa-solid fa-heart-crack",
      tone: "from-[#F8EAF1] to-[#FFF8EC]",
      accent: "text-[#A95577]",
      badge: "bg-[#F3D3E1]",
      motif: "療癒"
    },
    {
      title: "對方少覆、冷淡、斷聯",
      question: "佢突然少覆 message，係忙、逃避，定係感情變淡？",
      answer: "愈追問答案，對方有時退得愈快。要先降低壓力，睇清楚佢係冷淡期、迴避、情緒爆煲定真係抽離，再用舒服互動慢慢拉近。",
      icon: "fa-solid fa-comment-slash",
      tone: "from-[#E8F4F1] to-[#FFFDF8]",
      accent: "text-[#3F817A]",
      badge: "bg-[#CBE9E5]",
      motif: "復聯"
    },
    {
      title: "曖昧卡住、關係無名份",
      question: "明明有feel，但佢一直唔表態，點解關係推唔前？",
      answer: "曖昧最折磨係唔知自己算咩。要分清楚阻礙來自對方心態、現實因素、前任陰影，定係你哋互動模式令佢唔敢承擔。",
      icon: "fa-solid fa-people-arrows",
      tone: "from-[#EDF0F7] to-[#FFF8EC]",
      accent: "text-[#546C9E]",
      badge: "bg-[#DDE4F6]",
      motif: "卡位"
    },
    {
      title: "前任有新歡、第三者介入",
      question: "佢身邊有新對象，係咪代表你完全無機會？",
      answer: "唔係見到新歡就一定輸。要睇新歡關係深度、你同對方原本的情感連結、分手原因同對方現時防備心，再判斷仲可唔可以逆轉。",
      icon: "fa-solid fa-user-group",
      tone: "from-[#F6E7D8] to-[#FFFDF8]",
      accent: "text-[#7B4A2D]",
      badge: "bg-[#EBC9A7]",
      motif: "新歡"
    },
    {
      title: "感情占卜、塔羅分析",
      question: "想知佢仲有無諗你、會唔會主動聯絡？",
      answer: "當你睇唔清對方真心，塔羅可以幫你整理對方狀態、關係阻礙、復合機會同下一步方向，避免你靠情緒亂估亂做。",
      icon: "fa-solid fa-star",
      tone: "from-[#FFF8EC] to-[#EEF5DD]",
      accent: "text-[#8A6A2F]",
      badge: "bg-[#F4DFAE]",
      motif: "占卜"
    },
    {
      title: "愛情儀式、關係能量調整",
      question: "想復聯、升溫、化解阻礙，可以點樣配合？",
      answer: "愛情儀式會按個案方向配搭，例如復聯、升溫、化解、開路、清理負能量。唔係每個人都同一套，要先睇你哋關係卡喺邊。",
      icon: "fa-solid fa-wand-magic-sparkles",
      tone: "from-[#FFF3D6] to-[#FDE7E2]",
      accent: "text-[#C2733D]",
      badge: "bg-[#F7D6A0]",
      motif: "儀式"
    },
    {
      title: "相處教學、訊息點覆",
      question: "怕自己一開口就講錯，令佢更加唔想理你？",
      answer: "我哋會幫你拆解訊息點覆、邊句唔好講、幾時要退一步。用引導代替逼問，用穩定代替情緒勒索，先有機會令對方願意靠近。",
      icon: "fa-solid fa-comments",
      tone: "from-[#E8F4F1] to-[#FDF4EA]",
      accent: "text-[#6F8752]",
      badge: "bg-[#D8E8BE]",
      motif: "相處"
    }
  ];

  return (
    <section className="py-18 bg-[#FFFDF8]" aria-labelledby="search-intent-title">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-8">
          <div>
            <div className="text-sm font-bold text-asteria-primary mb-2">感情問題搜尋指南</div>
            <h2 id="search-intent-title" className="text-3xl md:text-4xl font-bold text-asteria-dark mb-3">你可能正在搵的答案</h2>
            <p className="text-stone-500 max-w-2xl leading-relaxed">無論你搜尋復合、挽回、斷聯、冷淡、曖昧、占卜或愛情儀式，都可以由呢度開始整理方向。</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {intents.map((item) => (
            <article key={item.title} className={`relative overflow-hidden bg-gradient-to-br ${item.tone} border border-white rounded-3xl p-5 shadow-sm hover:shadow-lg transition-all duration-300`}>
              <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/40"></div>
              <div className="absolute right-5 bottom-4 text-5xl font-bold text-white/55">{item.motif}</div>
              <div className={`relative z-10 w-12 h-12 rounded-2xl ${item.badge} ${item.accent} flex items-center justify-center mb-4 shadow-sm`}>
                <i className={`${item.icon} text-lg`}></i>
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-asteria-dark mb-2">{item.title}</h3>
                <div className={`inline-flex rounded-full bg-white/75 px-3 py-1 text-sm font-bold ${item.accent} mb-3`}>{item.question}</div>
                <p className="text-sm text-stone-600 leading-relaxed">{item.answer}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

const ServicesPreview = () => {
  const serviceDirections = [
    {
      title: "感情占卜分析",
      desc: "睇清對方心態、關係阻礙、復合機會同下一步方向。",
      icon: "fa-solid fa-star",
      tone: "bg-[#FFF8EC]"
    },
    {
      title: "愛情儀式方向",
      desc: "按個案評估復聯、升溫、化解、開路、清理負能量等方向。",
      icon: "fa-solid fa-wand-magic-sparkles",
      tone: "bg-[#FFE7DD]"
    },
    {
      title: "相處訊息指引",
      desc: "教你點覆、邊句唔好講、幾時主動、幾時先停一停。",
      icon: "fa-regular fa-comments",
      tone: "bg-[#E8F4F1]"
    }
  ];

  return (
    <section id="services" className="py-16 bg-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-8 items-center">
          <div>
            <div className="text-sm font-bold text-asteria-primary mb-2">Asteria Services</div>
            <h2 className="text-3xl md:text-4xl font-bold text-asteria-dark leading-tight mb-4">想深入睇服務，可以入去慢慢研究</h2>
            <p className="text-stone-500 leading-relaxed mb-6">
              首頁先俾你揀大方向；完整儀式、組合、金錢事業同其他能量服務，放喺獨立服務頁，畫面會清爽啲。
            </p>
            <a href="/services/" className="btn-primary px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2">
              查看完整服務項目 <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {serviceDirections.map((item) => (
              <a key={item.title} href="/services/" className={`${item.tone} border border-asteria-cream/70 rounded-3xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all`}>
                <div className="w-12 h-12 rounded-2xl bg-white text-asteria-primary flex items-center justify-center mb-4 shadow-sm">
                  <i className={item.icon}></i>
                </div>
                <h3 className="font-bold text-asteria-dark mb-2">{item.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{item.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Services = () => {
  type ServiceCategory = 'tarot' | 'love' | 'career' | 'other';
  type ServiceType = 'single' | 'sets';

  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('tarot');
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
    tarot: {
      label: "占卜",
      intro: "按你而家嘅感情狀態揀牌陣，分析對方心態、關係走向同下一步。",
      icon: "fa-solid fa-star",
      tone: "bg-[#FFF8EC] border-asteria-cream text-asteria-primary",
      single: applyStyle([
        { title: "曖昧 plan", desc: "適合未確定關係、對方忽冷忽熱、唔知佢有無意思，幫你睇清曖昧卡住位同下一步點推進。", tags: ["曖昧", "忽冷忽熱", "推進"] },
        { title: "拍拖 plan", desc: "適合已經拍拖但相處有摩擦、冷淡、溝通唔順，分析雙方心態、問題根源同改善方向。", tags: ["拍拖", "相處", "溝通"] },
        { title: "暗戀 plan", desc: "適合有心儀對象但未開始，想知對方觀感、接近機會、應該主動定慢慢鋪路。", tags: ["暗戀", "心儀對象", "接近"] },
        { title: "復合 plan", desc: "適合分手、斷聯、冷淡或想挽回前任，睇對方現時心態、復合機會同你應該點行。", tags: ["復合", "分手", "挽回"] },
        { title: "單身 plan", desc: "適合想招正桃花、了解感情課題、未來對象方向，幫你整理脫單機會同吸引力位置。", tags: ["單身", "桃花", "脫單"] }
      ]),
      sets: applyStyle([])
    },
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
  const hasSets = currentGroup.sets.length > 0;
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
          <p className="text-stone-500 mb-8">先揀你想處理嘅方向，再睇占卜 plan、單項儀式或組合儀式，畫面會清爽好多。</p>

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
                <i className="fa-solid fa-wand-sparkles mr-2"></i> {activeCategory === 'tarot' ? '占卜 plan' : '單項儀式'}
              </button>
              {hasSets && (
                <button
                  onClick={() => handleTypeChange('sets')}
                  className={`px-8 py-3 rounded-full text-sm md:text-base font-bold transition-all duration-300 ${activeType === 'sets' ? 'bg-white text-asteria-primary shadow-md transform scale-105' : 'text-stone-500 hover:text-asteria-primary'}`}
                >
                  <i className="fa-solid fa-layer-group mr-2"></i> 組合儀式
                </button>
              )}
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

              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="w-full text-center border-2 border-asteria-yellow/60 text-asteria-primary py-2.5 rounded-xl font-bold hover:bg-asteria-primary hover:text-white transition-all text-sm group-hover:shadow-md mt-auto">
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

const reviewImages = [
  { src: '/reviews/review-01.jpg', alt: '回心轉意術客人好評' },
  { src: '/reviews/review-02.jpg', alt: '信任問題改善客人好評' },
  { src: '/reviews/review-03.jpg', alt: '關係和好客人好評' },
  { src: '/reviews/review-04.jpg', alt: '互動升溫客人好評' },
  { src: '/reviews/review-05.jpg', alt: '主動破冰客人好評' },
  { src: '/reviews/review-06.jpg', alt: '塔羅分析準確客人好評' },
  { src: '/reviews/review-07.jpg', alt: '願望逐步實現客人好評' },
  { src: '/reviews/review-08.jpg', alt: '同理心與關係調整客人好評' },
  { src: '/reviews/review-09.jpg', alt: '白魔法溫和推進客人好評' },
  { src: '/reviews/review-10.jpg', alt: '負面情緒清理客人好評' },
  { src: '/reviews/review-11.jpg', alt: '整治口裡說不客人好評' },
  { src: '/reviews/review-12.jpg', alt: '解讀準確及情敵淡定客人好評' },
  { src: '/reviews/review-13.jpg', alt: '解除封鎖關係重見天日客人好評' },
  { src: '/reviews/review-14.jpg', alt: '伴侶重新投入客人好評' },
  { src: '/reviews/review-15.jpg', alt: '占卜準確客人好評' },
  { src: '/reviews/review-16.jpg', alt: '解決不讀不回客人好評' },
  { src: '/reviews/review-17.jpg', alt: '拍拖倦怠期改善客人好評' },
  { src: '/reviews/review-18.jpg', alt: '斬斷潛在桃花客人好評' }
];

const ReviewGrid = ({ reviews }: { reviews: typeof reviewImages }) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
    {reviews.map((review) => (
      <a
        key={review.src}
        href={review.src}
        target="_blank"
        rel="noreferrer"
        className="group bg-white rounded-2xl p-3 shadow-sm border border-asteria-cream/70 hover:shadow-xl hover:-translate-y-1 transition-all"
      >
        <div className="aspect-[9/16] rounded-xl overflow-hidden bg-[#FFF8EC]">
          <img src={review.src} alt={review.alt} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
        </div>
      </a>
    ))}
  </div>
);

const Reviews = () => (
  <section id="reviews" className="py-20 bg-asteria-blue/10">
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-asteria-dark mb-3">客人真實好評</h2>
        <div className="flex justify-center gap-1 text-yellow-400 text-sm mb-2">
           <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
        </div>
        <p className="text-gray-500">真實客人回饋、儀式後情況同塔羅分析好評。</p>
      </div>

      <ReviewGrid reviews={reviewImages.slice(0, 6)} />
      
      <div className="text-center mt-10 flex flex-col sm:flex-row gap-3 justify-center">
        <a href="/reviews/" className="inline-flex items-center justify-center gap-2 text-asteria-primary font-bold bg-white px-6 py-2 rounded-full shadow-sm hover:shadow transition-all">
          <i className="fa-regular fa-images"></i> 查看更多好評
        </a>
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-green-600 font-bold bg-white px-6 py-2 rounded-full shadow-sm hover:shadow transition-all">
          <i className="fa-brands fa-whatsapp"></i> 直接 WhatsApp 聯絡
        </a>
      </div>
    </div>
  </section>
);

const ReviewsPage = () => (
  <main className="pt-48 md:pt-32 pb-20 bg-asteria-blue/10 min-h-screen">
    <div className="container mx-auto px-6">
      <a href="/reviews/" className="inline-flex items-center gap-2 text-asteria-primary font-bold mb-8">
        <i className="fa-solid fa-arrow-left"></i> 返回首頁好評
      </a>
      <div className="text-center mb-12">
        <div className="text-sm font-bold text-asteria-primary mb-2">Asteria Reviews</div>
        <h1 className="text-4xl md:text-5xl font-bold text-asteria-dark mb-4">客人真實好評庫</h1>
        <p className="text-stone-500 max-w-2xl mx-auto leading-relaxed">
          收錄客人回饋、儀式後情況、占卜與關係分析好評，方便你慢慢參考。
        </p>
      </div>
      <ReviewGrid reviews={reviewImages} />
      <div className="text-center mt-12">
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-white font-bold bg-[#25D366] px-7 py-3 rounded-full shadow-lg shadow-green-900/10 hover:brightness-95 transition-all">
          <i className="fa-brands fa-whatsapp"></i> WhatsApp 聯絡 Asteria
        </a>
      </div>
    </div>
  </main>
);

type PortalEntryType = 'relationship' | 'mood' | 'question';

type PortalEntry = {
  id: number | string;
  type: PortalEntryType;
  text: string;
  title?: string;
  entryDate?: string;
  images?: string[];
  createdAt: string;
  updatedAt?: string;
};

type ChatMessage = {
  id: number | string;
  sender: 'customer' | 'admin';
  staffName?: string;
  text: string;
  images?: string[];
  imagePaths?: string[];
  createdAt: string;
};

type PortalCustomer = {
  id: string;
  threadId?: string;
  name: string;
  phone: string;
  accountUsername?: string;
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

const ImageViewer = ({
  images,
  index,
  onSelect,
  onClose
}: {
  images: string[];
  index: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}) => {
  if (images.length === 0) return null;
  const safeIndex = Math.min(Math.max(index, 0), images.length - 1);

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm p-4 md:p-6 flex flex-col" role="dialog" aria-modal="true">
      <div className="flex items-center justify-between gap-3 text-white mb-4">
        <div className="text-sm font-bold">{safeIndex + 1} / {images.length}</div>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center" aria-label="close image viewer">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center">
        <button onClick={() => onSelect((safeIndex - 1 + images.length) % images.length)} className="hidden md:flex w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white items-center justify-center mr-4" aria-label="previous image">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <img src={images[safeIndex]} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" alt="chat attachment enlarged" />
        <button onClick={() => onSelect((safeIndex + 1) % images.length)} className="hidden md:flex w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white items-center justify-center ml-4" aria-label="next image">
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-28 overflow-y-auto">
          {images.map((image, imageIndex) => (
            <button key={`${image}-${imageIndex}`} onClick={() => onSelect(imageIndex)} className={`aspect-square rounded-lg overflow-hidden border-2 ${imageIndex === safeIndex ? 'border-white' : 'border-white/20'}`}>
              <img src={image} className="w-full h-full object-cover" alt="chat attachment thumbnail" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
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

const DEFAULT_CUSTOMERS: PortalCustomer[] = [];

type SystemAccount = {
  userId: string;
  label: string;
  username: string;
  email: string;
  password: string;
  role: 'customer' | 'staff';
  customerId?: string;
};

type StaffReadMarker = {
  lastReadAt: string;
  isUnread: boolean;
};

const DEFAULT_ACCOUNTS: SystemAccount[] = [];

const loadPortalCustomers = () => {
  return DEFAULT_CUSTOMERS;
};

const savePortalCustomers = (customers: PortalCustomer[]) => {
  void customers;
};

const loadSystemAccounts = () => {
  return DEFAULT_ACCOUNTS;
};

const saveSystemAccounts = (accounts: SystemAccount[]) => {
  void accounts;
};

const formatEntryDate = (value: string) => {
  return new Intl.DateTimeFormat('zh-HK', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
};

const toDateInputValue = (value: Date | string = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
};

const formatDisplayDate = (value: string) => {
  return new Intl.DateTimeFormat('zh-HK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  }).format(new Date(`${value}T00:00:00`));
};

const getEntryDateValue = (entry: PortalEntry) => entry.entryDate || entry.createdAt.slice(0, 10);

const isEntryInDateRange = (entry: PortalEntry, from: string, to: string) => {
  const value = getEntryDateValue(entry);
  if (from && value < from) return false;
  if (to && value > to) return false;
  return true;
};

const chatMessageDomId = (scope: string, messageId: string | number) => {
  return `asteria-${scope}-message-${String(messageId).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
};

const scrollToChatDate = (scope: string, messages: ChatMessage[], date: string) => {
  const target = messages.find((message) => toDateInputValue(message.createdAt) === date);
  if (!target) return false;
  window.requestAnimationFrame(() => {
    document.getElementById(chatMessageDomId(scope, target.id))?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
  return true;
};

const scrollChatToBottom = (element: HTMLDivElement | null, behavior: ScrollBehavior = 'auto') => {
  if (!element) return;
  const scroll = () => element.scrollTo({ top: element.scrollHeight, behavior });
  window.requestAnimationFrame(() => {
    scroll();
    window.setTimeout(scroll, 120);
  });
};

const ChatDateJump = ({
  value,
  message,
  onChange,
  onJump
}: {
  value: string;
  message: string;
  onChange: (value: string) => void;
  onJump: () => void;
}) => (
  <div className="bg-white/80 border-b border-asteria-cream/70 px-3 sm:px-4 py-2 flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
    <div className="text-xs font-bold text-stone-500 whitespace-nowrap">跳去日期</div>
    <input
      type="date"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full sm:w-auto min-w-0 border border-asteria-cream rounded-xl px-3 py-1.5 outline-none focus:border-asteria-primary bg-white text-sm"
    />
    <button onClick={onJump} className="w-full sm:w-auto bg-asteria-yellow/35 text-asteria-dark px-4 py-1.5 rounded-xl text-sm font-bold">
      跳去當日
    </button>
    {message && <div className="text-xs font-bold text-asteria-primary">{message}</div>}
  </div>
);

const canEditEntry = (entry: PortalEntry) => Boolean(entry.id);

const buildCalendarDays = (monthValue: string) => {
  const [year, month] = monthValue.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingBlanks = firstDay.getDay();
  return [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => `${monthValue}-${String(index + 1).padStart(2, '0')}`)
  ];
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
  if (!latest) return '暫未有足夠 update。';
  return `${customer.name} 最近重點圍繞「${customer.interests.join('、') || '未選分類'}」。近況摘要：${latest.slice(0, 90)}${latest.length > 90 ? '...' : ''}`;
};

const RegisterPage = () => {
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleSystemLogin = async () => {
    if (isBackendConfigured) {
      try {
        const account = await loginWithUsername(loginUsername.trim(), loginPassword.trim());
        storeSpaceAccount(account);

        if (account.role === 'customer') {
          window.localStorage.setItem('asteriaCurrentCustomerId', account.user_id);
        }

        window.history.pushState(null, '', account.role === 'staff' ? '/staff/' : '/space/');
        window.dispatchEvent(new Event('asteria-route-change'));
        return;
      } catch (error) {
        setLoginError(error instanceof Error ? error.message : '登入資料不正確。');
        return;
      }
    }

    setLoginError('系統暫時未能連線，請稍後再試或聯絡 Asteria。');
  };

  return (
    <main className="pt-56 md:pt-40 pb-20 bg-[#FFFDF8] min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <a href="/" onClick={goHome} className="inline-flex items-center gap-2 text-asteria-primary font-bold mb-6">
          <i className="fa-solid fa-arrow-left"></i> 返回首頁
        </a>

        <div className="bg-white border border-asteria-cream/70 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm overflow-hidden">
          <div className="text-sm font-bold text-asteria-primary mb-2">Asteria Space</div>
          <h1 className="text-3xl md:text-4xl font-bold text-asteria-dark mb-3">登入你的私人空間</h1>
          <p className="text-stone-500 leading-relaxed mb-6">
            查看訊息、上傳截圖，同 Asteria 保持聯絡。
          </p>

          <div className="bg-[#FFF8EC] border border-asteria-cream rounded-2xl p-4 sm:p-5 mb-6 overflow-hidden">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white text-asteria-primary flex items-center justify-center shrink-0 shadow-sm">
                <i className="fa-solid fa-lock"></i>
              </div>
              <div>
                <div className="font-bold text-asteria-dark">登入</div>
                <p className="text-sm text-stone-500 leading-relaxed">請輸入 Asteria 提供的 account 名及密碼。</p>
              </div>
            </div>

            <div className="grid gap-3">
              <input value={loginUsername} onChange={(event) => setLoginUsername(event.target.value)} className="w-full min-w-0 border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary bg-white" placeholder="Account 名" />
              <input type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') handleSystemLogin(); }} className="w-full min-w-0 border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary bg-white" placeholder="密碼" />
              <div className="text-xs text-stone-400">密碼最少 8 個字。如需開通或 reset，請聯絡 Asteria。</div>
              {loginError && <div className="text-sm font-bold text-red-500">{loginError}</div>}
              <button onClick={handleSystemLogin} className="btn-primary rounded-xl px-5 py-3 font-bold">登入</button>
            </div>

          </div>

          <div className="text-sm text-stone-500 text-center">
            如需開通帳戶，請聯絡 Asteria。
          </div>
        </div>
      </div>
    </main>
  );
};

const SpacePortalPage = () => {
  const [customers, setCustomers] = useState<PortalCustomer[]>(loadPortalCustomers);
  const currentCustomerId = window.localStorage.getItem('asteriaCurrentCustomerId');
  const [activeCustomerId, setActiveCustomerId] = useState(currentCustomerId || customers[0]?.id || '');
  const [isSpaceLoading, setIsSpaceLoading] = useState(isBackendConfigured);
  const [chatText, setChatText] = useState('');
  const [chatImages, setChatImages] = useState<string[]>([]);
  const [chatImageFiles, setChatImageFiles] = useState<File[]>([]);
  const [backendThreadId, setBackendThreadId] = useState<string | null>(null);
  const [spaceMessage, setSpaceMessage] = useState('');
  const [spaceView, setSpaceView] = useState<'dashboard' | 'chat' | 'profile' | 'updates' | 'journal'>('dashboard');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [chatJumpDate, setChatJumpDate] = useState(toDateInputValue());
  const [chatJumpMessage, setChatJumpMessage] = useState('');
  const [relationshipDate, setRelationshipDate] = useState(toDateInputValue());
  const [relationshipText, setRelationshipText] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | number | null>(null);
  const [editingEntryDate, setEditingEntryDate] = useState('');
  const [editingEntryText, setEditingEntryText] = useState('');
  const [journalDate, setJournalDate] = useState(toDateInputValue());
  const [journalText, setJournalText] = useState('');
  const [journalMonth, setJournalMonth] = useState(toDateInputValue().slice(0, 7));
  const [relationshipEntryMessage, setRelationshipEntryMessage] = useState('');
  const [journalEntryMessage, setJournalEntryMessage] = useState('');
  const activeCustomer = customers.find((customer) => customer.id === activeCustomerId) || customers[0];
  const activeChatImages = (activeCustomer?.messages || []).flatMap((message) => message.images || []);
  const activeChatImagePaths = (activeCustomer?.messages || []).flatMap((message) => message.imagePaths || []);
  const relationshipEntries = [...(activeCustomer?.entries || [])].filter((entry) => entry.type === 'relationship').sort((a, b) => (b.entryDate || b.createdAt).localeCompare(a.entryDate || a.createdAt));
  const journalEntries = [...(activeCustomer?.entries || [])].filter((entry) => entry.type === 'mood').sort((a, b) => (b.entryDate || b.createdAt).localeCompare(a.entryDate || a.createdAt));
  const currentJournalEntry = journalEntries.find((entry) => entry.entryDate === journalDate);
  const journalDates = new Set(journalEntries.map((entry) => entry.entryDate || entry.createdAt.slice(0, 10)));
  const [profileName, setProfileName] = useState(activeCustomer?.name || '');
  const [profilePhone, setProfilePhone] = useState(activeCustomer?.phone || '');
  const [profileWhatsapp, setProfileWhatsapp] = useState(activeCustomer?.whatsapp || activeCustomer?.phone || '');
  const [profileIg, setProfileIg] = useState(activeCustomer?.igHandle || '');
  const [profileTelegram, setProfileTelegram] = useState(activeCustomer?.telegramHandle || '');
  const [profileEmail, setProfileEmail] = useState(activeCustomer?.email || '');
  const [profileSelfName, setProfileSelfName] = useState(activeCustomer?.targetName || '');
  const [profileMessage, setProfileMessage] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const customerChatScrollRef = useRef<HTMLDivElement | null>(null);
  const needsFirstProfile = !isSpaceLoading && Boolean(activeCustomer) && !activeCustomer?.phone && !activeCustomer?.whatsapp && !activeCustomer?.igHandle && !activeCustomer?.telegramHandle && !activeCustomer?.targetName;

  const hydrateCustomerChatImages = async () => {
    if (!activeCustomer) return [] as string[];
    const paths = (activeCustomer.messages || []).flatMap((message) => message.imagePaths || []);
    if (paths.length === 0) return activeChatImages;
    const imageMap = await getSignedImageMap(paths);
    const urls = paths.map((path) => imageMap[path]).filter(Boolean);
    updateCustomer((customer) => ({
      ...customer,
      messages: (customer.messages || []).map((message) => ({
        ...message,
        images: message.imagePaths?.length
          ? message.imagePaths.map((path) => imageMap[path]).filter(Boolean)
          : message.images
      }))
    }));
    return urls;
  };

  const openAllCustomerImages = async () => {
    const urls = activeChatImages.length ? activeChatImages : await hydrateCustomerChatImages();
    setViewerImages(urls);
    setViewerIndex(0);
  };

  const openChatImage = (image: string) => {
    const imageIndex = activeChatImages.indexOf(image);
    setViewerImages(activeChatImages.length ? activeChatImages : [image]);
    setViewerIndex(imageIndex >= 0 ? imageIndex : 0);
  };

  const openDeferredChatImages = async () => {
    const urls = await hydrateCustomerChatImages();
    if (urls.length === 0) return;
    setViewerImages(urls);
    setViewerIndex(0);
  };

  const jumpCustomerChatDate = (scope: string) => {
    const ok = scrollToChatDate(scope, activeCustomer?.messages || [], chatJumpDate);
    setChatJumpMessage(ok ? `已跳到 ${formatDisplayDate(chatJumpDate)}` : `當日未有訊息：${formatDisplayDate(chatJumpDate)}`);
  };

  useEffect(() => {
    if (isBackendConfigured) return;
    savePortalCustomers(customers);
  }, [customers]);

  useEffect(() => {
    if (spaceView !== 'chat') return;
    scrollChatToBottom(customerChatScrollRef.current);
  }, [spaceView, activeCustomer?.id, activeCustomer?.messages?.length]);

  useEffect(() => {
    if (spaceView !== 'updates') return;
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }, [spaceView]);

  const loadBackendSpace = async () => {
    if (!isBackendConfigured) return;
    setIsSpaceLoading(true);
    try {
      const space = await getMySpace();
      const mappedMessages: ChatMessage[] = space.messages.map((message) => ({
        id: message.id,
        sender: message.sender_role === 'admin' ? 'admin' : 'customer',
        text: message.body,
        images: [],
        imagePaths: message.image_urls || [],
        createdAt: message.created_at
      }));
      const mappedEntries: PortalEntry[] = space.entries.map((entry) => ({
        id: entry.id,
        type: entry.entry_type === 'journal' ? 'mood' : 'relationship',
        title: entry.title,
        text: entry.body,
        entryDate: entry.entry_date,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at
      }));
      const profile = space.profile;
      const customerName = profile?.self_name || (!isGenericSpaceName(profile?.display_name) ? profile?.display_name : '') || space.account.label || space.account.username;
      const nextCustomer: PortalCustomer = {
        id: space.account.user_id,
        name: customerName,
        phone: profile?.phone_number || '',
        accountUsername: space.account.username,
        whatsapp: profile?.whatsapp || '',
        igHandle: profile?.ig_handle || '',
        telegramHandle: profile?.telegram_handle || '',
        email: profile?.contact_email || space.account.contact_email || '',
        targetName: profile?.self_name || '',
        originalChannel: 'Asteria Space',
        interests: activeCustomer?.interests || [],
        entries: mappedEntries,
        messages: mappedMessages
      };
      setBackendThreadId(space.thread.id);
      setActiveCustomerId(nextCustomer.id);
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
    } finally {
      setIsSpaceLoading(false);
    }
  };

  useEffect(() => {
    loadBackendSpace();
  }, []);

  useEffect(() => {
    setJournalText(currentJournalEntry?.text || '');
  }, [journalDate, currentJournalEntry?.id]);

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
              imagePaths: message.image_urls || [],
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
        { id: Date.now(), sender: 'customer', text: trimmed, images: chatImages, imagePaths: [], createdAt: new Date().toISOString() }
      ]
    }));
    setChatText('');
    setChatImages([]);
    setChatImageFiles([]);
  };

  const upsertLocalEntry = (entry: PortalEntry) => {
    updateCustomer((customer) => ({
      ...customer,
      entries: [entry, ...(customer.entries || []).filter((item) => item.id !== entry.id)]
    }));
  };

  const removeLocalEntry = (entryId: string | number) => {
    updateCustomer((customer) => ({
      ...customer,
      entries: (customer.entries || []).filter((entry) => entry.id !== entryId)
    }));
  };

  const saveRelationshipUpdate = async () => {
    const body = relationshipText.trim();
    if (!body) return;
    const selectedRelationshipDate = (document.getElementById('relationship-date-input') as HTMLInputElement | null)?.value || relationshipDate;
    try {
      if (isBackendConfigured) {
        const entry = await createSpaceEntry({
          entryType: 'relationship',
          entryDate: selectedRelationshipDate,
          body
        });
        upsertLocalEntry({
          id: entry.id,
          type: 'relationship',
          text: entry.body,
          entryDate: entry.entry_date,
          createdAt: entry.created_at,
          updatedAt: entry.updated_at
        });
      } else {
        upsertLocalEntry({ id: Date.now(), type: 'relationship', text: body, entryDate: selectedRelationshipDate, createdAt: new Date().toISOString() });
      }
      setRelationshipText('');
      setRelationshipEntryMessage('關係 update 已儲存。');
    } catch (error) {
      setRelationshipEntryMessage(error instanceof Error ? error.message : '關係 update 暫時儲存唔到。');
    }
  };

  const saveJournalEntry = async () => {
    const body = journalText.trim();
    if (!body) return;
    const selectedJournalDate = (document.getElementById('journal-date-input') as HTMLInputElement | null)?.value || journalDate;
    try {
      if (currentJournalEntry && canEditEntry(currentJournalEntry)) {
        if (isBackendConfigured) {
          const updated = await updateSpaceEntry(String(currentJournalEntry.id), { entryDate: selectedJournalDate, title: '', body });
          upsertLocalEntry({
            id: updated.id,
            type: 'mood',
            text: updated.body,
            entryDate: updated.entry_date,
            createdAt: updated.created_at,
            updatedAt: updated.updated_at
          });
        } else {
          upsertLocalEntry({ ...currentJournalEntry, text: body, entryDate: selectedJournalDate, updatedAt: new Date().toISOString() });
        }
      } else {
        if (isBackendConfigured) {
          const entry = await createSpaceEntry({ entryType: 'journal', entryDate: selectedJournalDate, body });
          upsertLocalEntry({
            id: entry.id,
            type: 'mood',
            text: entry.body,
            entryDate: entry.entry_date,
            createdAt: entry.created_at,
            updatedAt: entry.updated_at
          });
        } else {
          upsertLocalEntry({ id: Date.now(), type: 'mood', text: body, entryDate: selectedJournalDate, createdAt: new Date().toISOString() });
        }
      }
      setJournalEntryMessage('心靈日記已儲存。');
    } catch (error) {
      setJournalEntryMessage(error instanceof Error ? error.message : '心靈日記暫時儲存唔到。');
    }
  };

  const startEditEntry = (entry: PortalEntry) => {
    if (!canEditEntry(entry)) return;
    setEditingEntryId(entry.id);
    setEditingEntryDate(entry.entryDate || entry.createdAt.slice(0, 10));
    setEditingEntryText(entry.text);
  };

  const saveEditedEntry = async (entry: PortalEntry) => {
    const body = editingEntryText.trim();
    if (!body || !canEditEntry(entry)) return;
    const nextEntryDate = (document.getElementById('editing-entry-date-input') as HTMLInputElement | null)?.value || editingEntryDate || entry.entryDate || entry.createdAt.slice(0, 10);
    try {
      if (isBackendConfigured) {
        const updated = await updateSpaceEntry(String(entry.id), { entryDate: nextEntryDate, title: entry.title || '', body });
        upsertLocalEntry({
          id: updated.id,
          type: updated.entry_type === 'journal' ? 'mood' : 'relationship',
          title: updated.title,
          text: updated.body,
          entryDate: updated.entry_date,
          createdAt: updated.created_at,
          updatedAt: updated.updated_at
        });
      } else {
        upsertLocalEntry({ ...entry, text: body, entryDate: nextEntryDate, updatedAt: new Date().toISOString() });
      }
      setEditingEntryId(null);
      setEditingEntryDate('');
      setEditingEntryText('');
      setEntryMessage('內容已更新。');
    } catch (error) {
      setEntryMessage(error instanceof Error ? error.message : '內容暫時更新唔到。');
    }
  };

  const deleteEntry = async (entry: PortalEntry) => {
    if (!canEditEntry(entry)) return;
    const confirmed = window.confirm('確定刪除呢段內容？');
    if (!confirmed) return;
    try {
      if (isBackendConfigured) await deleteSpaceEntry(String(entry.id));
      removeLocalEntry(entry.id);
      setEntryMessage('內容已刪除。');
    } catch (error) {
      setEntryMessage(error instanceof Error ? error.message : '內容暫時刪除唔到。');
    }
  };

  const changePassword = async () => {
    if (!oldPassword.trim()) {
      setPasswordMessage('請輸入舊密碼。');
      return;
    }
    if (newPassword.trim().length < 8) {
      setPasswordMessage('新密碼最少 8 個字。');
      return;
    }
    if (!isBackendConfigured) {
      setPasswordMessage('系統暫時未能連線，未能更新密碼。');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changeMyPassword(oldPassword.trim(), newPassword.trim());
      setPasswordMessage('密碼已更新。下次請用新密碼登入。');
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      setPasswordMessage(error instanceof Error ? error.message : '更新密碼失敗。');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const saveProfile = async () => {
    if (!activeCustomer) return;
    const nextDisplayName = profileName.trim()
      || profileSelfName.trim()
      || (!isGenericSpaceName(activeCustomer.name) ? activeCustomer.name : '')
      || activeCustomer.accountUsername
      || 'Asteria 客人';
    const nextProfile = {
      display_name: nextDisplayName,
      self_name: profileSelfName.trim(),
      phone_number: profilePhone.trim(),
      whatsapp: profileWhatsapp.trim(),
      ig_handle: profileIg.trim(),
      telegram_handle: profileTelegram.trim(),
      contact_email: profileEmail.trim()
    };

    if (isBackendConfigured) {
      try {
        await upsertMyProfile(nextProfile);
      } catch (error) {
        setProfileMessage(error instanceof Error ? error.message : '資料暫時儲存唔到。');
        return;
      }
    }

    updateCustomer((customer) => ({
      ...customer,
      name: nextProfile.self_name || nextProfile.display_name,
      phone: nextProfile.phone_number,
      whatsapp: nextProfile.whatsapp,
      igHandle: nextProfile.ig_handle,
      telegramHandle: nextProfile.telegram_handle,
      email: nextProfile.contact_email,
      targetName: nextProfile.self_name
    }));
    setProfileMessage('資料已更新。');
    setIsEditingProfile(false);
    setSpaceMessage('');
    setSpaceView('dashboard');
  };

  if (isSpaceLoading) {
    return (
      <main className="pt-36 md:pt-28 pb-20 bg-[#FFFDF8] min-h-screen">
        <div className="container mx-auto px-6 max-w-3xl">
          <section className="bg-white border border-asteria-cream/70 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="text-sm font-bold text-asteria-primary mb-2">Asteria Space</div>
            <h1 className="text-3xl font-bold text-asteria-dark mb-3">載入你的私人空間</h1>
            <p className="text-stone-500 leading-relaxed">請稍等一下。</p>
          </section>
        </div>
      </main>
    );
  }

  if (needsFirstProfile) {
    return (
      <main className="pt-36 md:pt-28 pb-20 bg-[#FFFDF8] min-h-screen">
        <div className="container mx-auto px-6 max-w-3xl">
          <section className="bg-white border border-asteria-cream/70 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="text-sm font-bold text-asteria-primary mb-2">Asteria Space</div>
            <h1 className="text-3xl font-bold text-asteria-dark mb-3">第一次登入，請補回聯絡資料</h1>
            <div className="grid gap-4">
              <label className="grid gap-1">
                <span className="text-xs font-bold text-stone-500">自己名 / 真名</span>
                <input value={profileSelfName} onChange={(event) => setProfileSelfName(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="自己名 / 真名" />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-bold text-stone-500">Phone number</span>
                <input value={profilePhone} onChange={(event) => setProfilePhone(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Phone number" />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-bold text-stone-500">WhatsApp</span>
                <input value={profileWhatsapp} onChange={(event) => setProfileWhatsapp(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="WhatsApp" />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-bold text-stone-500">Telegram</span>
                <input value={profileTelegram} onChange={(event) => setProfileTelegram(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Telegram" />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-bold text-stone-500">Instagram username</span>
                <input value={profileIg} onChange={(event) => setProfileIg(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Instagram username" />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-bold text-stone-500">Email</span>
                <input value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Email" />
              </label>
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
      <main className="pt-36 md:pt-28 pb-10 bg-[#FFFDF8] min-h-screen">
        <ImageViewer images={viewerImages} index={viewerIndex} onSelect={setViewerIndex} onClose={() => setViewerImages([])} />
        <div className="container mx-auto px-3 sm:px-4 max-w-5xl">
          <section className="bg-white border border-asteria-cream/70 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-9rem)] min-h-[640px] sm:min-h-[700px] max-h-[980px] min-w-0">
            <div className="px-4 py-3 border-b border-asteria-cream/70 flex items-center justify-between gap-4 shrink-0">
              <div className="min-w-0">
                <button onClick={() => setSpaceView('dashboard')} className="inline-flex items-center gap-2 text-asteria-primary font-bold text-sm mb-2">
                  <i className="fa-solid fa-arrow-left"></i> 返回 Space
                </button>
                <div className="font-bold text-asteria-dark">Inbox · {(activeCustomer?.messages || []).length} 則訊息</div>
                {spaceMessage && <div className="text-xs font-bold text-red-500 mt-1">{spaceMessage}</div>}
              </div>
              <button
                onClick={() => void openAllCustomerImages()}
                disabled={activeChatImages.length === 0 && activeChatImagePaths.length === 0}
                className="text-sm font-bold text-asteria-primary bg-asteria-yellow/25 px-3 py-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <i className="fa-regular fa-images mr-1"></i> 所有圖片
              </button>
            </div>

            <ChatDateJump
              value={chatJumpDate}
              message={chatJumpMessage}
              onChange={setChatJumpDate}
              onJump={() => jumpCustomerChatDate('customer-full')}
            />

            <div ref={customerChatScrollRef} className="flex-1 min-h-[0] bg-[#FFF8EC] p-3 sm:p-5 overflow-y-auto scroll-smooth">
              {(activeCustomer?.messages || []).length === 0 ? (
                <div className="h-full min-h-0 flex flex-col items-center justify-center text-center text-stone-500">
                  <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-asteria-primary text-xl mb-4">
                    <i className="fa-regular fa-comments"></i>
                  </div>
                  <div className="font-bold text-asteria-dark mb-2">暫時未有訊息</div>
                  <p className="text-sm">可以喺下面留言，或者 upload 對話截圖比客服跟進。</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(activeCustomer?.messages || []).map((message) => (
                    <div id={chatMessageDomId('customer-full', message.id)} key={message.id} className={`scroll-mt-4 flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[88%] sm:max-w-[82%] rounded-2xl px-4 py-3 shadow-sm select-text cursor-text min-w-0 ${message.sender === 'customer' ? 'bg-asteria-primary text-white' : 'bg-white text-stone-700 border border-asteria-cream/70'}`}>
                        {message.text && <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</div>}
                        {((message.images && message.images.length > 0) || (message.imagePaths && message.imagePaths.length > 0)) && (
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            {(message.images || []).map((image, index) => (
                              <button key={`${message.id}-space-chat-full-${index}`} onClick={() => openChatImage(image)} className="aspect-square w-full rounded-xl overflow-hidden border border-white/40 cursor-zoom-in">
                                <img src={image} className="w-full h-full object-cover" alt="chat upload" />
                              </button>
                            ))}
                            {(!message.images || message.images.length === 0) && (message.imagePaths || []).map((_, index) => (
                              <button key={`${message.id}-space-chat-full-deferred-${index}`} onClick={() => void openDeferredChatImages()} className="aspect-square w-full rounded-xl border border-white/40 bg-white/60 text-asteria-primary flex flex-col items-center justify-center gap-2 cursor-zoom-in">
                                <i className="fa-regular fa-image text-xl"></i>
                                <span className="text-xs font-bold">載入圖片</span>
                              </button>
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
              <div className="px-4 pt-3 bg-white border-t border-asteria-cream/70 grid grid-cols-4 sm:grid-cols-6 gap-2 shrink-0">
                {chatImages.map((image, index) => (
                  <img key={`space-chat-preview-full-${index}`} src={image} className="aspect-square rounded-xl object-cover border border-asteria-cream" alt="screenshot preview" />
                ))}
              </div>
            )}

            <div className="w-full max-w-full overflow-hidden p-3 sm:p-4 bg-white border-t border-asteria-cream/70 grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] gap-2 sm:gap-3 shrink-0 min-w-0">
              <label className="inline-flex items-center justify-center border border-asteria-cream bg-white text-asteria-primary w-11 h-11 rounded-xl font-bold cursor-pointer hover:border-asteria-primary transition-all shrink-0" title="upload screenshot">
                <i className="fa-regular fa-images"></i>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => handleImageUpload(event.target.files)} />
              </label>
              <textarea value={chatText} onChange={(event) => setChatText(event.target.value)} rows={1} className="w-full min-w-0 max-h-28 resize-none border border-asteria-cream rounded-xl px-3 sm:px-4 py-2.5 outline-none focus:border-asteria-primary leading-relaxed" placeholder="留言 / 補充最近情況..." />
              <button onClick={sendChatMessage} className="btn-primary w-11 h-11 px-0 rounded-xl font-bold shrink-0 flex items-center justify-center">
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (spaceView === 'updates') {
    return (
      <main className="pt-36 md:pt-28 pb-20 bg-[#FFFDF8] min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <button onClick={() => setSpaceView('dashboard')} className="inline-flex items-center gap-2 text-asteria-primary font-bold mb-6">
            <i className="fa-solid fa-arrow-left"></i> 返回 Space
          </button>
          <section className="bg-white border border-asteria-cream/70 rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm mb-6 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
              <div>
                <div className="text-sm text-stone-400">Relationship Update</div>
                <h1 className="text-3xl font-bold text-asteria-dark">關係 update</h1>
              </div>
              <span className="bg-asteria-yellow/35 text-asteria-dark text-xs font-bold px-3 py-1 rounded-full">Timeline</span>
            </div>
            <label className="block mb-3">
              <span className="block text-sm font-bold text-asteria-dark mb-2">事情發生日期</span>
              <input id="relationship-date-input" type="date" value={relationshipDate} onInput={(event) => setRelationshipDate(event.currentTarget.value)} onChange={(event) => setRelationshipDate(event.target.value)} className="block w-full max-w-full min-w-0 sm:w-64 border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary bg-white" />
            </label>
            <textarea value={relationshipText} onChange={(event) => setRelationshipText(event.target.value)} className="w-full min-h-36 border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="寫低最近關係進展、對方態度、重要對話背景..." />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
              <div className="text-sm text-stone-400">{relationshipEntryMessage || '新增後會按事情發生日期排返喺下面。'}</div>
              <button onClick={saveRelationshipUpdate} className="btn-primary px-5 py-3 rounded-xl font-bold">加入 timeline</button>
            </div>
          </section>

          <section className="bg-white border border-asteria-cream/70 rounded-2xl p-5 md:p-6 shadow-sm min-h-[640px]">
            <h2 className="text-2xl font-bold text-asteria-dark mb-5">Timeline</h2>
            {relationshipEntries.length === 0 ? (
              <div className="border-2 border-dashed border-asteria-yellow/70 rounded-2xl bg-[#FFF8EC] px-5 py-10 text-center text-stone-500">暫時未有關係 update。</div>
            ) : (
              <div className="space-y-5">
                {relationshipEntries.map((entry) => (
                  <div key={entry.id} className="relative pl-8 pb-5 border-l-2 border-asteria-cream last:pb-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-asteria-primary border-4 border-white shadow-sm"></div>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-asteria-primary mb-2">{formatDisplayDate(entry.entryDate || entry.createdAt.slice(0, 10))}</div>
                        {editingEntryId === entry.id ? (
                          <div className="grid gap-3">
                            <input id="editing-entry-date-input" type="date" value={editingEntryDate} onInput={(event) => setEditingEntryDate(event.currentTarget.value)} onChange={(event) => setEditingEntryDate(event.target.value)} className="block w-full max-w-full min-w-0 sm:w-52 border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary bg-white" />
                            <textarea value={editingEntryText} onChange={(event) => setEditingEntryText(event.target.value)} className="w-full min-h-28 border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" />
                          </div>
                        ) : (
                          <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                        )}
                      </div>
                      {canEditEntry(entry) && (
                        <div className="flex gap-2 shrink-0">
                          {editingEntryId === entry.id ? (
                            <button onClick={() => saveEditedEntry(entry)} className="bg-asteria-primary text-white rounded-xl px-3 py-2 text-sm font-bold">Save</button>
                          ) : (
                            <button onClick={() => startEditEntry(entry)} className="bg-white border border-asteria-cream text-asteria-primary rounded-xl px-3 py-2 text-sm font-bold">Edit</button>
                          )}
                          <button onClick={() => deleteEntry(entry)} className="bg-white border border-red-200 text-red-600 rounded-xl px-3 py-2 text-sm font-bold">Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed right-4 bottom-5 z-40 w-12 h-12 rounded-full bg-asteria-dark text-white shadow-lg flex items-center justify-center"
          aria-label="回到頁頂"
        >
          <i className="fa-solid fa-arrow-up"></i>
        </button>
      </main>
    );
  }

  if (spaceView === 'journal') {
    const calendarDays = buildCalendarDays(journalMonth);
    return (
      <main className="pt-36 md:pt-28 pb-20 bg-[#FFFDF8] min-h-screen">
        <div className="container mx-auto px-6 max-w-7xl">
          <button onClick={() => setSpaceView('dashboard')} className="inline-flex items-center gap-2 text-asteria-primary font-bold mb-6">
            <i className="fa-solid fa-arrow-left"></i> 返回 Space
          </button>
          <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
            <section className="bg-white border border-asteria-cream/70 rounded-2xl p-5 md:p-6 shadow-sm min-h-[720px]">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                <div>
                  <div className="text-sm text-stone-400">Soul Journal</div>
                  <h1 className="text-3xl font-bold text-asteria-dark">心靈日記</h1>
                </div>
              <input id="journal-date-input" type="date" value={journalDate} onInput={(event) => setJournalDate(event.currentTarget.value)} onChange={(event) => setJournalDate(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" />
              </div>
              <div className="bg-[#FFF8EC] border border-asteria-cream/70 rounded-2xl p-4 md:p-5">
                <div className="font-bold text-asteria-dark mb-3">{formatDisplayDate(journalDate)}</div>
                <textarea value={journalText} onChange={(event) => setJournalText(event.target.value)} className="w-full min-h-[520px] bg-white border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary leading-relaxed" placeholder="今日的情緒、反思、相處上想提醒自己的事..." />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                <div className="text-sm text-stone-400">{journalEntryMessage || '可以記低當日的心情、反思同相處提醒。'}</div>
                <div className="flex gap-2">
                  {currentJournalEntry && canEditEntry(currentJournalEntry) && (
                    <button onClick={() => deleteEntry(currentJournalEntry)} className="bg-white border border-red-200 text-red-600 rounded-xl px-4 py-3 font-bold">Delete</button>
                  )}
                  <button onClick={saveJournalEntry} className="btn-primary px-5 py-3 rounded-xl font-bold">Save</button>
                </div>
              </div>
            </section>

            <aside className="bg-white border border-asteria-cream/70 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-xl font-bold text-asteria-dark">月曆</h2>
                <input type="month" value={journalMonth} onChange={(event) => setJournalMonth(event.target.value)} className="border border-asteria-cream rounded-xl px-3 py-2 outline-none focus:border-asteria-primary" />
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-stone-400 mb-2">
                {['日', '一', '二', '三', '四', '五', '六'].map((day) => <div key={day}>{day}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <button
                    key={day || `blank-${index}`}
                    disabled={!day}
                    onClick={() => day && setJournalDate(day)}
                    className={`relative aspect-square rounded-xl text-sm font-bold ${day === journalDate ? 'bg-asteria-primary text-white' : day ? 'bg-[#FFF8EC] text-asteria-dark hover:bg-asteria-yellow/35' : 'bg-transparent'}`}
                  >
                    {day ? Number(day.slice(-2)) : ''}
                    {day && journalDates.has(day) && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-amber-500">★</span>}
                  </button>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </main>
    );
  }

  if (spaceView === 'profile') {
    return (
      <main className="pt-36 md:pt-28 pb-20 bg-[#FFFDF8] min-h-screen">
        <div className="container mx-auto px-6 max-w-3xl">
          <button onClick={() => setSpaceView('dashboard')} className="inline-flex items-center gap-2 text-asteria-primary font-bold mb-6">
            <i className="fa-solid fa-arrow-left"></i> 返回 Space
          </button>
          <section className="bg-white border border-asteria-cream/70 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="text-sm font-bold text-asteria-primary mb-2">Asteria Space</div>
            <h1 className="text-3xl font-bold text-asteria-dark mb-3">修改你的聯絡資料</h1>
            <p className="text-stone-500 leading-relaxed mb-6">呢度只係更新資料，不會跳返登入頁。</p>
            <div className="grid gap-4">
              <label className="grid gap-1">
                <span className="text-xs font-bold text-stone-500">你的稱呼</span>
                <input value={profileName} onChange={(event) => setProfileName(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="你的稱呼" />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-bold text-stone-500">WhatsApp 電話</span>
                <input value={profilePhone} onChange={(event) => setProfilePhone(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="WhatsApp 電話" />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-bold text-stone-500">Instagram username</span>
                <input value={profileIg} onChange={(event) => setProfileIg(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Instagram username" />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-bold text-stone-500">Telegram username / phone</span>
                <input value={profileTelegram} onChange={(event) => setProfileTelegram(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Telegram username / phone" />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-bold text-stone-500">Email</span>
                <input value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Email" />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-bold text-stone-500">自己名 / 真名</span>
                <input value={profileSelfName} onChange={(event) => setProfileSelfName(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="自己名 / 真名" />
              </label>
            </div>
            <button onClick={saveProfile} className="btn-primary w-full rounded-xl px-6 py-3 font-bold mt-6">儲存資料</button>
            {profileMessage && <div className="text-sm font-bold text-asteria-primary mt-3">{profileMessage}</div>}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-36 md:pt-28 pb-20 bg-[#FFFDF8] min-h-screen">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
          <div>
            <a href="/" onClick={goHome} className="inline-flex items-center gap-2 text-asteria-primary font-bold mb-6">
              <i className="fa-solid fa-arrow-left"></i> 返回首頁
            </a>
            <div className="text-sm font-bold text-asteria-primary mb-2">Asteria Space</div>
            <h1 className="text-4xl font-bold text-asteria-dark mb-3">你的私人聯絡空間</h1>
          </div>
        </div>

        <section className="bg-white border border-asteria-cream/70 rounded-2xl p-5 md:p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-stone-400 mb-1">Login</div>
              <h2 className="text-2xl font-bold text-asteria-dark">{activeCustomer?.name || activeCustomer?.accountUsername || 'Asteria 客人'}</h2>
              <p className="text-sm text-stone-500 mt-1">你已登入 Asteria Space。</p>
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
                <p className="text-sm text-stone-500 mt-1">新密碼最少 8 個字。</p>
              </div>
              <span className="bg-asteria-yellow/35 text-asteria-dark text-xs font-bold px-3 py-1 rounded-full">客人自己操作</span>
            </div>
            <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3">
              <input type="password" value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="舊密碼" />
              <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="新密碼" />
              <button onClick={changePassword} disabled={isChangingPassword} className="btn-primary px-5 py-3 rounded-xl font-bold disabled:opacity-60">
                {isChangingPassword ? '更新中...' : '更新密碼'}
              </button>
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
                  <label className="grid gap-1">
                    <span className="text-xs font-bold text-stone-500">自己名 / 真名</span>
                    <input value={profileSelfName} onChange={(event) => setProfileSelfName(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="自己名 / 真名" />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs font-bold text-stone-500">Phone number</span>
                    <input value={profilePhone} onChange={(event) => setProfilePhone(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Phone number" />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs font-bold text-stone-500">WhatsApp</span>
                    <input value={profileWhatsapp} onChange={(event) => setProfileWhatsapp(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="WhatsApp" />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs font-bold text-stone-500">Telegram</span>
                    <input value={profileTelegram} onChange={(event) => setProfileTelegram(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Telegram" />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs font-bold text-stone-500">Instagram username</span>
                    <input value={profileIg} onChange={(event) => setProfileIg(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Instagram username" />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs font-bold text-stone-500">Email</span>
                    <input value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} className="border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Email" />
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-sm text-stone-400">{profileMessage || '修改完記得儲存。'}</div>
                  <button onClick={saveProfile} className="btn-primary px-6 py-3 rounded-xl font-bold sm:self-end">Save</button>
                </div>
              </div>
            ) : (
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-[#FFF8EC] rounded-xl p-4">
                <div className="text-xs text-stone-400 mb-1">自己名 / 真名</div>
                <div className="font-bold text-asteria-dark break-all">{activeCustomer?.targetName || '未填'}</div>
              </div>
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
            </div>
            )}
          </div>

          {spaceView === 'dashboard' && (
            <div className="grid md:grid-cols-3 gap-4">
              <button onClick={() => setSpaceView('chat')} className="bg-asteria-dark text-white rounded-2xl p-5 md:p-6 shadow-sm text-left flex items-center justify-between gap-4 hover:brightness-110 transition-all">
                <div>
                  <div className="text-sm text-white/70">Message Thread</div>
                  <div className="text-2xl font-bold">Inbox</div>
                  <div className="text-sm text-white/70 mt-1">{(activeCustomer?.messages || []).length} 則訊息</div>
                </div>
                <i className="fa-solid fa-arrow-right text-2xl"></i>
              </button>
              <button onClick={() => setSpaceView('updates')} className="bg-white border border-asteria-cream/70 text-asteria-dark rounded-2xl p-5 md:p-6 shadow-sm text-left flex items-center justify-between gap-4 hover:border-asteria-primary transition-all">
                <div>
                  <div className="text-sm text-stone-400">Relationship</div>
                  <div className="text-2xl font-bold">關係 update</div>
                  <div className="text-sm text-stone-500 mt-1">{relationshipEntries.length} 個記錄</div>
                </div>
                <i className="fa-solid fa-timeline text-2xl text-asteria-primary"></i>
              </button>
              <button onClick={() => setSpaceView('journal')} className="bg-[#FFF8EC] border border-asteria-cream/70 text-asteria-dark rounded-2xl p-5 md:p-6 shadow-sm text-left flex items-center justify-between gap-4 hover:border-asteria-primary transition-all">
                <div>
                  <div className="text-sm text-stone-400">Journal</div>
                  <div className="text-2xl font-bold">心靈日記</div>
                  <div className="text-sm text-stone-500 mt-1">{journalEntries.length} 篇</div>
                </div>
                <i className="fa-regular fa-bookmark text-2xl text-asteria-primary"></i>
              </button>
            </div>
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
              <button
                onClick={() => void openAllCustomerImages()}
                disabled={activeChatImages.length === 0 && activeChatImagePaths.length === 0}
                className="bg-asteria-blue/40 text-asteria-dark text-xs font-bold px-3 py-1 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <i className="fa-regular fa-images mr-1"></i> 所有圖片 · {activeChatImages.length || activeChatImagePaths.length}
              </button>
            </div>

            <ChatDateJump
              value={chatJumpDate}
              message={chatJumpMessage}
              onChange={setChatJumpDate}
              onJump={() => jumpCustomerChatDate('customer-card')}
            />

            <div className="bg-[#FFF8EC] p-3 sm:p-5 min-h-[420px] max-h-[560px] overflow-y-auto">
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
                    <div id={chatMessageDomId('customer-card', message.id)} key={message.id} className={`scroll-mt-4 flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[88%] sm:max-w-[82%] rounded-2xl px-4 py-3 shadow-sm select-text cursor-text min-w-0 ${message.sender === 'customer' ? 'bg-asteria-primary text-white' : 'bg-white text-stone-700 border border-asteria-cream/70'}`}>
                        {message.text && <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</div>}
                        {((message.images && message.images.length > 0) || (message.imagePaths && message.imagePaths.length > 0)) && (
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            {(message.images || []).map((image, index) => (
                              <button key={`${message.id}-space-chat-${index}`} onClick={() => openChatImage(image)} className="aspect-square w-full rounded-xl overflow-hidden border border-white/40 cursor-zoom-in">
                                <img src={image} className="w-full h-full object-cover" alt="chat upload" />
                              </button>
                            ))}
                            {(!message.images || message.images.length === 0) && (message.imagePaths || []).map((_, index) => (
                              <button key={`${message.id}-space-chat-deferred-${index}`} onClick={() => void openDeferredChatImages()} className="aspect-square w-full rounded-xl border border-white/40 bg-white/60 text-asteria-primary flex flex-col items-center justify-center gap-2 cursor-zoom-in">
                                <i className="fa-regular fa-image text-xl"></i>
                                <span className="text-xs font-bold">載入圖片</span>
                              </button>
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

            <div className="w-full max-w-full overflow-hidden p-3 md:p-5 bg-white border-t border-asteria-cream/70 grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] gap-2 sm:gap-3 min-w-0">
              <label className="inline-flex items-center justify-center border border-asteria-cream bg-white text-asteria-primary w-11 h-11 rounded-xl font-bold cursor-pointer hover:border-asteria-primary transition-all shrink-0" title="upload screenshot">
                <i className="fa-regular fa-images"></i>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => handleImageUpload(event.target.files)} />
              </label>
              <textarea value={chatText} onChange={(event) => setChatText(event.target.value)} rows={1} className="w-full min-w-0 max-h-28 resize-none border border-asteria-cream rounded-xl px-3 sm:px-4 py-2.5 outline-none focus:border-asteria-primary leading-relaxed" placeholder="留言 / 補充最近情況..." />
              <button onClick={sendChatMessage} className="btn-primary w-11 h-11 px-0 rounded-xl font-bold shrink-0 flex items-center justify-center">
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

const AdminInboxPage = () => {
  const [customers, setCustomers] = useState<PortalCustomer[]>(loadPortalCustomers);
  const [accounts, setAccounts] = useState<SystemAccount[]>(loadSystemAccounts);
  const [activeCustomerId, setActiveCustomerId] = useState(customers[0]?.id || '');
  const [inboxView, setInboxView] = useState<'list' | 'thread'>('list');
  const [adminView, setAdminView] = useState<'inbox' | 'accounts'>('inbox');
  const [staffThreadPanel, setStaffThreadPanel] = useState<'chat' | 'updates' | 'journal' | 'profile'>('chat');
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
  const [inboxSearch, setInboxSearch] = useState('');
  const [accountMessage, setAccountMessage] = useState('');
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [staffChatJumpDate, setStaffChatJumpDate] = useState(toDateInputValue());
  const [staffChatJumpMessage, setStaffChatJumpMessage] = useState('');
  const [staffEntryFromDate, setStaffEntryFromDate] = useState('');
  const [staffEntryToDate, setStaffEntryToDate] = useState('');
  const staffChatScrollRef = useRef<HTMLDivElement | null>(null);
  const [readMarkers, setReadMarkers] = useState<Record<string, StaffReadMarker>>(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem('asteriaStaffReadMarkers') || '{}') as Record<string, string | StaffReadMarker>;
      return Object.entries(stored).reduce<Record<string, StaffReadMarker>>((map, [customerId, value]) => {
        map[customerId] = typeof value === 'string'
          ? { lastReadAt: value, isUnread: false }
          : { lastReadAt: value.lastReadAt || '', isUnread: Boolean(value.isUnread) };
        return map;
      }, {});
    } catch {
      return {};
    }
  });
  const activeCustomer = customers.find((customer) => customer.id === activeCustomerId) || customers[0];
  const activeChatImages = (activeCustomer?.messages || []).flatMap((message) => message.images || []);
  const activeRelationshipEntries = [...(activeCustomer?.entries || [])]
    .filter((entry) => entry.type === 'relationship' && isEntryInDateRange(entry, staffEntryFromDate, staffEntryToDate))
    .sort((a, b) => getEntryDateValue(b).localeCompare(getEntryDateValue(a)));
  const activeJournalEntries = [...(activeCustomer?.entries || [])]
    .filter((entry) => entry.type === 'mood' && isEntryInDateRange(entry, staffEntryFromDate, staffEntryToDate))
    .sort((a, b) => getEntryDateValue(b).localeCompare(getEntryDateValue(a)));
  const openChatImage = (image: string) => {
    const imageIndex = activeChatImages.indexOf(image);
    setViewerImages(activeChatImages.length ? activeChatImages : [image]);
    setViewerIndex(imageIndex >= 0 ? imageIndex : 0);
  };
  const jumpStaffChatDate = () => {
    const ok = scrollToChatDate('staff-thread', activeCustomer?.messages || [], staffChatJumpDate);
    setStaffChatJumpMessage(ok ? `已跳到 ${formatDisplayDate(staffChatJumpDate)}` : `當日未有訊息：${formatDisplayDate(staffChatJumpDate)}`);
  };

  useEffect(() => {
    if (inboxView !== 'thread' || staffThreadPanel !== 'chat') return;
    scrollChatToBottom(staffChatScrollRef.current);
  }, [inboxView, staffThreadPanel, activeCustomer?.id, activeCustomer?.messages?.length]);

  const sortedCustomers = [...customers].sort((a, b) => {
    const aTime = a.messages?.[a.messages.length - 1]?.createdAt || a.entries[a.entries.length - 1]?.createdAt || '';
    const bTime = b.messages?.[b.messages.length - 1]?.createdAt || b.entries[b.entries.length - 1]?.createdAt || '';
    return bTime.localeCompare(aTime);
  });
  const filteredInboxCustomers = sortedCustomers.filter((customer) => {
    const query = inboxSearch.trim().toLowerCase();
    if (!query) return true;
    const searchable = [
      customer.name,
      customer.accountUsername,
      customer.phone,
      customer.whatsapp,
      customer.igHandle,
      customer.telegramHandle,
      customer.email,
      customer.targetName,
      customer.originalChannel,
      ...(customer.messages || []).flatMap((message) => [message.text, message.sender, ...(message.images || [])]),
      ...(customer.entries || []).flatMap((entry) => [entry.title, entry.text, entry.entryDate, entry.type])
    ].filter(Boolean).join(' ').toLowerCase();
    return searchable.includes(query);
  });
  const filteredAccounts = accounts.filter((account) => {
    const query = accountSearch.trim().toLowerCase();
    if (!query) return true;
    const matchedCustomer = customers.find((customer) => {
      return customer.id === account.customerId || customer.accountUsername === account.username;
    });
    const searchable = [
      account.label,
      account.username,
      account.email,
      account.role,
      matchedCustomer?.name,
      matchedCustomer?.phone,
      matchedCustomer?.whatsapp,
      matchedCustomer?.igHandle,
      matchedCustomer?.telegramHandle,
      matchedCustomer?.email,
      matchedCustomer?.targetName,
      matchedCustomer?.originalChannel,
      ...(matchedCustomer?.messages || []).flatMap((message) => [message.text, message.sender, ...(message.images || [])]),
      ...(matchedCustomer?.entries || []).flatMap((entry) => [entry.title, entry.text, entry.entryDate, entry.type])
    ].filter(Boolean).join(' ').toLowerCase();
    return searchable.includes(query);
  });
  const isStaffThreadLayout = adminView === 'inbox' && inboxView === 'thread';

  useEffect(() => {
    savePortalCustomers(customers);
  }, [customers]);

  useEffect(() => {
    saveSystemAccounts(accounts);
  }, [accounts]);

  const mapInboxItemToCustomer = async (item: StaffInboxCustomer, includeSignedImages: boolean): Promise<PortalCustomer> => {
    const imageMap = includeSignedImages
      ? await getSignedImageMap(item.messages.flatMap((message) => message.image_urls || []))
      : {};
    const profile = item.profile;
    const account = item.account;
    const profileDisplayName = (profile?.display_name || '').trim();
    const displayName = profile?.self_name || (!isGenericSpaceName(profileDisplayName)
      ? profileDisplayName
      : account?.label || account?.username || 'Asteria 客人');
    return {
      id: item.thread.customer_id,
      threadId: item.thread.id,
      name: displayName,
      phone: profile?.phone_number || '',
      accountUsername: account?.username || '',
      whatsapp: profile?.whatsapp || '',
      igHandle: profile?.ig_handle || '',
      telegramHandle: profile?.telegram_handle || '',
      email: profile?.contact_email || account?.contact_email || '',
      targetName: profile?.self_name || '',
      originalChannel: 'Asteria Space',
      interests: [],
      entries: item.entries.map((entry) => ({
        id: entry.id,
        type: entry.entry_type === 'journal' ? 'mood' : 'relationship',
        title: entry.title,
        text: entry.body,
        entryDate: entry.entry_date,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at
      })),
      messages: item.messages.map((message) => ({
        id: message.id,
        sender: message.sender_role === 'admin' ? 'admin' : 'customer',
        staffName: message.sender_role === 'admin' ? (message.sender_label || undefined) : undefined,
        text: message.body,
        images: includeSignedImages ? (message.image_urls || []).map((path) => imageMap[path] || path) : [],
        createdAt: message.created_at
      }))
    };
  };

  const loadBackendAccounts = async () => {
    if (!isBackendConfigured) return;
    try {
      const backendAccounts = await listStaffAccounts();
      setAccounts(backendAccounts.map((account) => ({
        userId: account.user_id,
        label: account.label,
        username: account.username,
        email: account.contact_email || '',
        password: '',
        role: account.role,
        customerId: account.role === 'customer' ? account.user_id : undefined
      })));
    } catch (error) {
      setAccountMessage(error instanceof Error ? error.message : 'Account 管理暫時載入唔到。');
    }
  };

  const loadBackendInbox = async () => {
    if (!isBackendConfigured) return;
    try {
      const inbox = await listStaffInbox();
      const nextCustomers = await Promise.all(inbox.map((item) => mapInboxItemToCustomer(item, false)));
      setCustomers(nextCustomers);
      setReadMarkers((current) => {
        const next = { ...current };
        inbox.forEach((item) => {
          if (item.read_state) {
            next[item.thread.customer_id] = {
              lastReadAt: item.read_state.last_read_at || '',
              isUnread: Boolean(item.read_state.is_unread)
            };
          }
        });
        window.localStorage.setItem('asteriaStaffReadMarkers', JSON.stringify(next));
        return next;
      });
      setActiveCustomerId((current) => nextCustomers.find((customer) => customer.id === current)?.id || nextCustomers[0]?.id || '');
    } catch (error) {
      setAccountMessage(error instanceof Error ? error.message : 'Staff inbox 暫時載入唔到。');
    }
  };

  useEffect(() => {
    loadBackendInbox();
  }, []);

  const showInboxList = () => {
    setInboxView('list');
    void loadBackendInbox();
  };

  const openInboxPanel = () => {
    setAdminView('inbox');
    showInboxList();
  };

  const getUnreadCount = (customer: PortalCustomer) => {
    const messages = customer.messages || [];
    const readMarker = readMarkers[customer.id];
    if (readMarker?.isUnread) {
      return 1;
    }
    const lastAdminIndex = [...messages].map((message) => message.sender).lastIndexOf('admin');
    const lastAdminTime = lastAdminIndex >= 0 ? messages[lastAdminIndex].createdAt : '';
    const lastReadTime = readMarker?.lastReadAt || '';
    const baseline = [lastAdminTime, lastReadTime].sort().at(-1) || '';
    return messages.filter((message) => message.sender === 'customer' && (!baseline || message.createdAt > baseline)).length;
  };

  const saveReadMarker = (customerId: string, marker: StaffReadMarker) => {
    setReadMarkers((current) => {
      const next = { ...current, [customerId]: marker };
      window.localStorage.setItem('asteriaStaffReadMarkers', JSON.stringify(next));
      return next;
    });
  };

  const markThreadReadState = async (customer: PortalCustomer, mode: 'read' | 'unread') => {
    const latestCustomerMessage = [...(customer.messages || [])].reverse().find((message) => message.sender === 'customer');
    const fallbackMarker = {
      lastReadAt: mode === 'read' ? (latestCustomerMessage?.createdAt || new Date().toISOString()) : '',
      isUnread: mode === 'unread'
    };
    saveReadMarker(customer.id, fallbackMarker);

    if (!isBackendConfigured || !customer.threadId) return;

    try {
      const result = await markStaffThreadRead({ threadId: customer.threadId, mode });
      if (result.read_state) {
        saveReadMarker(customer.id, {
          lastReadAt: result.read_state.last_read_at || '',
          isUnread: Boolean(result.read_state.is_unread)
        });
      }
    } catch (error) {
      setAccountMessage(error instanceof Error ? error.message : '已讀狀態暫時更新唔到。');
    }
  };

  const markChatUnreadFromList = async (customer: PortalCustomer) => {
    await markThreadReadState(customer, 'unread');
    setInboxView('list');
    void loadBackendInbox();
  };

  const openThread = (customerId: string) => {
    setActiveCustomerId(customerId);
    setInboxView('thread');
    setReplyText('');
    setReplyImages([]);
    setReplyImageFiles([]);
    setStaffThreadPanel('chat');
    const customer = customers.find((item) => item.id === customerId);
    if (customer) void markThreadReadState(customer, 'read');
    if (isBackendConfigured) {
      void (async () => {
        try {
          const item = await getStaffThread({ customerId });
          const fullCustomer = await mapInboxItemToCustomer(item, true);
          setCustomers((current) => current.map((existing) => (
            existing.id === customerId ? fullCustomer : existing
          )));
        } catch (error) {
          setAccountMessage(error instanceof Error ? error.message : '對話暫時載入唔到。');
        }
      })();
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
        const staffName = accounts.find((account) => account.userId === message.sender_id)?.label || window.localStorage.getItem('asteriaCurrentUsername') || 'Staff';
        setCustomers((current) => current.map((customer) => customer.id === activeCustomer.id ? {
          ...customer,
          messages: [
            ...(customer.messages || []),
            {
              id: message.id,
              sender: 'admin',
              staffName,
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
        { id: Date.now(), sender: 'admin', staffName: window.localStorage.getItem('asteriaCurrentUsername') || 'Staff', text: trimmed, images: replyImages, createdAt: new Date().toISOString() }
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

  const unsendStaffMessage = async (message: ChatMessage) => {
    if (message.sender !== 'admin' || !activeCustomer) return;
    const confirmed = window.confirm('確定收回呢句客服訊息？');
    if (!confirmed) return;

    try {
      if (isBackendConfigured) {
        await staffDeleteMessage({ messageId: String(message.id) });
      }
      setCustomers((current) => current.map((customer) => customer.id === activeCustomer.id ? {
        ...customer,
        messages: (customer.messages || []).filter((item) => item.id !== message.id)
      } : customer));
      setAccountMessage('訊息已收回。');
    } catch (error) {
      setAccountMessage(error instanceof Error ? error.message : '收回訊息失敗。');
    }
  };

  const createAccount = async () => {
    const trimmedUsername = newAccountUsername.trim();
    const trimmedEmail = newAccountEmail.trim();
    const trimmedPassword = newAccountPassword.trim();
    const trimmedName = newAccountName.trim() || 'Asteria 客人';
    if (!trimmedUsername || trimmedPassword.length < 8) {
      setAccountMessage('請填 account 名，同最少 8 個字的 password。');
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
            accountUsername: result.account.username,
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
          userId: result.account.user_id,
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
        setAccountMessage(result.repaired ? 'Account 已存在，已補齊 Space record。' : 'Account 已新增。');
      } catch (error) {
        setAccountMessage(error instanceof Error ? error.message : '新增 account 失敗。');
      }
      return;
    }

    setAccountMessage('系統暫時未能連線，未能新增 account。');
    return;
  };

  const resetAccountPassword = async (username: string) => {
    const nextPassword = (resetPasswords[username] || '').trim();
    if (nextPassword.length < 8) {
      setAccountMessage('新 password 最少 8 個字。');
      return;
    }
    if (isBackendConfigured) {
      try {
        await staffResetPassword({ username, password: nextPassword });
        setResetPasswords((current) => ({ ...current, [username]: '' }));
        setAccountMessage(`${username} password 已更新。`);
      } catch (error) {
        setAccountMessage(error instanceof Error ? error.message : 'Reset password 失敗。');
      }
      return;
    }
    setAccountMessage('系統暫時未能連線，未能 reset password。');
    return;
  };

  const deleteAccount = async (account: SystemAccount) => {
    const confirmed = window.confirm(`Delete account ${account.username}?`);
    if (!confirmed) return;
    if (isBackendConfigured) {
      try {
        await staffDeleteAccount({ username: account.username, userId: account.userId });
        setAccounts((current) => current.filter((item) => item.userId !== account.userId));
        if (account.customerId) {
          setCustomers((current) => current.filter((customer) => customer.id !== account.customerId));
        }
        setAccountMessage(`${account.username} 已刪除。`);
      } catch (error) {
        setAccountMessage(error instanceof Error ? error.message : 'Delete account 失敗。');
      }
      return;
    }
    setAccountMessage('系統暫時未能連線，未能 delete account。');
    return;
  };

  return (
    <main className="pt-36 md:pt-28 pb-10 bg-[#FFFDF8] min-h-screen">
      <ImageViewer images={viewerImages} index={viewerIndex} onSelect={setViewerIndex} onClose={() => setViewerImages([])} />
      <div className="container mx-auto px-4 max-w-7xl">
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0 ${isStaffThreadLayout ? 'mb-3' : 'mb-5'}`}>
          <div>
            <a href="/" onClick={goHome} className={`inline-flex items-center gap-2 text-asteria-primary font-bold ${isStaffThreadLayout ? 'mb-1 text-sm' : 'mb-3'}`}>
              <i className="fa-solid fa-arrow-left"></i> 返回主頁
            </a>
            <h1 className={`${isStaffThreadLayout ? 'text-xl' : 'text-3xl'} font-bold text-asteria-dark`}>客服 Inbox</h1>
          </div>
          <div className="text-sm text-stone-500">Asteria Space</div>
        </div>

        <div className={`flex gap-2 overflow-x-auto pb-1 shrink-0 ${isStaffThreadLayout ? 'mb-3' : 'mb-5'}`}>
          <button onClick={openInboxPanel} className={`px-5 py-3 rounded-xl font-bold border whitespace-nowrap ${adminView === 'inbox' ? 'bg-asteria-dark text-white border-asteria-dark' : 'bg-white text-asteria-primary border-asteria-cream'}`}>
            Inbox
          </button>
          <button onClick={() => { setAdminView('accounts'); void loadBackendAccounts(); }} className={`px-5 py-3 rounded-xl font-bold border whitespace-nowrap ${adminView === 'accounts' ? 'bg-asteria-dark text-white border-asteria-dark' : 'bg-white text-asteria-primary border-asteria-cream'}`}>
            Account 管理
          </button>
        </div>

        {adminView === 'accounts' && (
        <section className="bg-white border border-asteria-cream/70 rounded-2xl shadow-sm p-5 mb-8 overflow-visible min-h-[760px]">
          <div className="grid xl:grid-cols-[360px_minmax(0,1fr)] gap-5">
            <div className="min-w-0">
              <div className="text-sm text-stone-400">Account</div>
              <h2 className="text-2xl font-bold text-asteria-dark mb-2">Account 管理</h2>
              <p className="text-sm text-stone-500 leading-relaxed">新增帳戶、搜尋帳戶及重設密碼。</p>
              <div className={`mt-4 rounded-xl border px-4 py-3 text-sm font-bold ${isBackendConfigured ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
                {isBackendConfigured ? '系統連接正常。' : '系統暫時未能連線。'}
              </div>
            </div>

            <div className="grid gap-3 min-w-0">
              <div className="grid sm:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_130px] gap-3 min-w-0">
                <input value={newAccountName} onChange={(event) => setNewAccountName(event.target.value)} className="min-w-0 w-full border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="客人 / staff 名" />
                <input value={newAccountUsername} onChange={(event) => setNewAccountUsername(event.target.value)} className="min-w-0 w-full border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Account 名" />
                <input value={newAccountEmail} onChange={(event) => setNewAccountEmail(event.target.value)} className="min-w-0 w-full border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="Email 備用聯絡" />
                <input value={newAccountPassword} onChange={(event) => setNewAccountPassword(event.target.value)} className="min-w-0 w-full border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary" placeholder="初始 password（最少 8 個字）" />
                <select value={newAccountRole} onChange={(event) => setNewAccountRole(event.target.value as 'customer' | 'staff')} className="min-w-0 w-full border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary bg-white sm:col-span-2 2xl:col-span-1">
                  <option value="customer">客人</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div className="text-xs text-stone-400">Password 最少 8 個字；開 account 後客人可以自行更改。</div>
              <button onClick={createAccount} className="btn-primary rounded-xl px-5 py-3 font-bold md:w-fit">新增 account</button>
              {accountMessage && <div className="text-sm font-bold text-asteria-primary">{accountMessage}</div>}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mt-2">
                <label className="grid gap-1 flex-1 min-w-0">
                  <span className="text-xs font-bold text-stone-500">Search</span>
                  <input value={accountSearch} onChange={(event) => setAccountSearch(event.target.value)} className="min-w-0 w-full border border-asteria-cream rounded-xl px-4 py-3 outline-none focus:border-asteria-primary bg-white" placeholder="Search account 名 / 客人名 / email" />
                </label>
                <div className="text-xs font-bold text-stone-400 whitespace-nowrap">
                  {accountSearch.trim() ? `${filteredAccounts.length} / ${accounts.length}` : `${accounts.length}`} accounts
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2 h-[68vh] min-h-[560px] max-h-[920px] overflow-y-auto pr-1 rounded-2xl border border-asteria-cream/60 bg-white p-2 max-w-full">
                {filteredAccounts.map((account) => (
                  <div key={account.username} className="grid grid-cols-1 lg:grid-cols-[1fr_130px_minmax(0,1fr)_auto_auto] gap-2 items-start lg:items-center bg-[#FFF8EC] rounded-xl p-4 min-w-0">
                    <div className="min-w-0">
                      <div className="font-bold text-asteria-dark">{account.label}</div>
                      <div className="text-xs text-stone-500 break-all">account: {account.username}</div>
                      <div className="text-xs text-stone-400 break-all">email: {account.email || '未填'}</div>
                    </div>
                    <div className="text-xs font-bold text-asteria-primary bg-white border border-asteria-cream rounded-full px-3 py-1 w-fit">
                      {account.role === 'staff' ? 'Staff' : '客人'}
                    </div>
                    <input value={resetPasswords[account.username] || ''} onChange={(event) => setResetPasswords((current) => ({ ...current, [account.username]: event.target.value }))} className="w-full min-w-0 border border-asteria-cream rounded-xl px-4 py-2 outline-none focus:border-asteria-primary bg-white" placeholder="輸入新 password（最少 8 個字）" />
                    <button onClick={() => resetAccountPassword(account.username)} className="w-full lg:w-auto bg-asteria-dark text-white rounded-xl px-4 py-2 font-bold">Reset</button>
                    <button onClick={() => deleteAccount(account)} className="w-full lg:w-auto bg-white text-red-600 border border-red-200 rounded-xl px-4 py-2 font-bold hover:bg-red-50">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        )}

        {adminView === 'inbox' && (
        <div className="min-h-[calc(100vh-180px)]">
          <section className={`${inboxView === 'list' ? 'block' : 'hidden'} bg-white border border-asteria-cream/70 rounded-2xl shadow-sm overflow-hidden`}>
            <div className="p-4 border-b border-asteria-cream/70">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-asteria-dark text-lg">所有對話</div>
                  <div className="text-xs text-stone-400 mt-1">{inboxSearch.trim() ? `${filteredInboxCustomers.length} / ${customers.length}` : customers.length} 個客人</div>
                </div>
                <div className="bg-asteria-yellow/35 text-asteria-dark text-xs font-bold px-3 py-1 rounded-full">
                  {customers.reduce((total, customer) => total + getUnreadCount(customer), 0)} 未讀
                </div>
              </div>
              <div className="relative mt-4">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm"></i>
                <input
                  value={inboxSearch}
                  onChange={(event) => setInboxSearch(event.target.value)}
                  className="w-full border border-asteria-cream rounded-xl pl-10 pr-4 py-3 outline-none focus:border-asteria-primary bg-white"
                  placeholder="Search 客人名 / 聯絡方法 / 對話內容"
                />
              </div>
            </div>
            <div className="max-h-[calc(100vh-270px)] overflow-y-auto">
              {filteredInboxCustomers.length === 0 ? (
                <div className="p-8 text-center text-sm text-stone-500">搵唔到相關對話。</div>
              ) : filteredInboxCustomers.map((customer) => {
                const lastMessage = customer.messages?.[customer.messages.length - 1];
                const unreadCount = getUnreadCount(customer);
                const isMarkedUnread = Boolean(readMarkers[customer.id]?.isUnread);
                return (
                  <div
                    key={customer.id}
                    className="flex items-stretch gap-2 border-b border-asteria-cream/50 bg-white hover:bg-[#FFF8EC] transition-all"
                  >
                    <div className="min-w-0 flex-1 p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold shrink-0 ${unreadCount ? 'bg-asteria-primary text-white' : 'bg-asteria-blue/45 text-asteria-primary'}`}>
                          {customer.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <button onClick={() => openThread(customer.id)} className="w-full text-left">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-bold text-asteria-dark truncate">{customer.name}</div>
                              <div className="flex items-center gap-2 shrink-0">
                                {isMarkedUnread ? (
                                  <span className="rounded-full bg-asteria-yellow/60 px-2.5 py-1 text-[11px] font-bold text-asteria-primary">
                                    未讀
                                  </span>
                                ) : unreadCount > 0 && (
                                  <span className="min-w-6 h-6 px-2 rounded-full bg-asteria-primary text-white text-xs font-bold flex items-center justify-center">
                                    {unreadCount}
                                  </span>
                                )}
                                <div className="text-[11px] text-stone-400">{lastMessage ? formatEntryDate(lastMessage.createdAt) : ''}</div>
                              </div>
                            </div>
                          </button>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-stone-400">
                            <button onClick={() => openThread(customer.id)} className="min-w-0 text-left truncate">
                              {customer.accountUsername ? `@${customer.accountUsername}` : '未有 account 名'} · {customer.phone || customer.igHandle || customer.telegramHandle || '未有聯絡資料'}
                            </button>
                            <button
                              onClick={() => void markChatUnreadFromList(customer)}
                              className="rounded-full border border-asteria-cream bg-asteria-yellow/35 px-2.5 py-1 text-[11px] font-bold text-asteria-primary whitespace-nowrap"
                            >
                              設為未讀
                            </button>
                          </div>
                          <button onClick={() => openThread(customer.id)} className={`block w-full text-left text-sm truncate mt-1 ${unreadCount ? 'text-asteria-dark font-bold' : 'text-stone-500'}`}>
                            {lastMessage ? `${lastMessage.sender === 'admin' ? '你：' : ''}${lastMessage.text || '圖片'}` : '未有訊息'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={`${inboxView === 'thread' ? 'flex' : 'hidden'} bg-white border border-asteria-cream/70 rounded-2xl shadow-sm overflow-hidden flex-col h-[calc(100vh-7rem)] sm:h-[calc(100vh-9rem)] min-h-[600px] sm:min-h-[700px] max-h-[980px] min-w-0`}>
            <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-asteria-cream/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 shrink-0">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1 sm:mb-2">
                  <button onClick={showInboxList} className="inline-flex items-center gap-2 text-asteria-primary font-bold text-xs sm:text-sm">
                    <i className="fa-solid fa-arrow-left"></i> 返回所有對話
                  </button>
                  <button
                    onClick={() => activeCustomer && markThreadReadState(activeCustomer, 'unread')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-asteria-primary bg-asteria-yellow/35 border border-asteria-cream px-3 py-1.5 rounded-full"
                  >
                    <i className="fa-regular fa-envelope"></i> 設為未讀
                  </button>
                </div>
                <div className="font-bold text-asteria-dark truncate text-sm sm:text-base">{activeCustomer?.name}</div>
                <div className="text-[11px] sm:text-xs text-stone-400 truncate">
                  @{activeCustomer?.accountUsername || '未有 account'} · WA {activeCustomer?.phone || '未登記'} · TG {activeCustomer?.telegramHandle || '未登記'} · {(activeCustomer?.messages || []).length} 則訊息
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto">
                <button
                  onClick={() => { setViewerImages(activeChatImages); setViewerIndex(0); }}
                  disabled={activeChatImages.length === 0}
                  className="text-xs sm:text-sm font-bold text-asteria-primary bg-asteria-yellow/25 px-3 py-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <i className="fa-regular fa-images mr-1"></i> 所有圖片
                </button>
              </div>
            </div>

            <div className="px-3 sm:px-4 py-2 border-b border-asteria-cream/70 bg-white flex gap-2 overflow-x-auto shrink-0">
              {[
                { value: 'chat', label: '對話', icon: 'fa-regular fa-comments' },
                { value: 'updates', label: '情況 update', icon: 'fa-solid fa-timeline' },
                { value: 'journal', label: '日記', icon: 'fa-regular fa-bookmark' },
                { value: 'profile', label: '資料', icon: 'fa-regular fa-address-card' }
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setStaffThreadPanel(item.value as 'chat' | 'updates' | 'journal' | 'profile')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border whitespace-nowrap ${staffThreadPanel === item.value ? 'bg-asteria-dark text-white border-asteria-dark' : 'bg-white text-asteria-primary border-asteria-cream'}`}
                >
                  <i className={`${item.icon} mr-1`}></i> {item.label}
                </button>
              ))}
            </div>

            {staffThreadPanel === 'chat' ? (
            <>
            <ChatDateJump
              value={staffChatJumpDate}
              message={staffChatJumpMessage}
              onChange={setStaffChatJumpDate}
              onJump={jumpStaffChatDate}
            />
            <div ref={staffChatScrollRef} className="flex-1 min-h-0 bg-[#FFF8EC] p-3 sm:p-5 overflow-y-auto scroll-smooth">
              {(activeCustomer?.messages || []).length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-stone-500">未有對話，下面可以開始回覆。</div>
              ) : (
                <div className="space-y-4">
                  {(activeCustomer?.messages || []).map((message) => (
                    <div id={chatMessageDomId('staff-thread', message.id)} key={message.id} className={`scroll-mt-4 flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`group relative max-w-[88%] sm:max-w-[78%] rounded-2xl px-4 py-3 shadow-sm select-text cursor-text min-w-0 ${message.sender === 'admin' ? 'bg-asteria-primary text-white' : 'bg-white text-stone-700 border border-asteria-cream/70'}`}>
                        <div className="text-xs font-bold mb-1">
                          {message.sender === 'admin' ? `Asteria${message.staffName ? ` · ${message.staffName}` : ''}` : activeCustomer?.name}
                        </div>
                        {message.text && <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</div>}
                        {message.images && message.images.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            {message.images.map((image, index) => (
                              <button key={`${message.id}-inbox-${index}`} onClick={() => openChatImage(image)} className="aspect-square w-full rounded-xl overflow-hidden border border-white/40 cursor-zoom-in">
                                <img src={image} className="w-full h-full object-cover" alt="chat attachment" />
                              </button>
                            ))}
                          </div>
                        )}
                        <div className={`text-[11px] mt-2 flex items-center gap-2 ${message.sender === 'admin' ? 'text-white/70' : 'text-stone-400'}`}>
                          <span>{formatEntryDate(message.createdAt)}</span>
                          {message.sender === 'admin' && (
                            <button
                              onClick={() => unsendStaffMessage(message)}
                              className="text-[11px] font-bold underline decoration-white/40 underline-offset-2 text-white/85 hover:text-white"
                            >
                              收回
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {replyImages.length > 0 && (
              <div className="px-4 pt-3 bg-white border-t border-asteria-cream/70 grid grid-cols-4 sm:grid-cols-6 gap-2 shrink-0">
                {replyImages.map((image, index) => (
                  <img key={`reply-preview-${index}`} src={image} className="aspect-square rounded-xl object-cover border border-asteria-cream" alt="reply upload preview" />
                ))}
              </div>
            )}

            <div className="w-full max-w-full overflow-hidden p-3 sm:p-4 bg-white border-t border-asteria-cream/70 grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] gap-2 sm:gap-3 shrink-0 min-w-0">
              <label className="inline-flex items-center justify-center border border-asteria-cream bg-white text-asteria-primary w-11 h-11 rounded-xl font-bold cursor-pointer hover:border-asteria-primary transition-all shrink-0" title="send image">
                <i className="fa-regular fa-images"></i>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => handleReplyImages(event.target.files)} />
              </label>
              <textarea value={replyText} onChange={(event) => setReplyText(event.target.value)} rows={1} className="w-full min-w-0 max-h-28 resize-none border border-asteria-cream rounded-xl px-3 sm:px-4 py-2.5 outline-none focus:border-asteria-primary leading-relaxed" placeholder="輸入回覆..." />
              <button onClick={sendReply} className="btn-primary w-11 h-11 px-0 rounded-xl font-bold shrink-0 flex items-center justify-center">
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
            </>
            ) : staffThreadPanel === 'updates' ? (
              <div className="flex-1 min-h-0 bg-[#FFF8EC] p-5 overflow-y-auto">
                <div className="bg-white border border-asteria-cream/70 rounded-2xl p-5 max-h-full overflow-y-auto">
                  <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-asteria-dark">情況 update</h3>
                      <div className="text-xs text-stone-400 mt-1">{activeRelationshipEntries.length} 個記錄</div>
                    </div>
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <input type="date" value={staffEntryFromDate} onChange={(event) => setStaffEntryFromDate(event.target.value)} className="min-w-0 border border-asteria-cream rounded-xl px-3 py-2 text-sm outline-none focus:border-asteria-primary bg-white" />
                      <input type="date" value={staffEntryToDate} onChange={(event) => setStaffEntryToDate(event.target.value)} className="min-w-0 border border-asteria-cream rounded-xl px-3 py-2 text-sm outline-none focus:border-asteria-primary bg-white" />
                      <button onClick={() => { setStaffEntryFromDate(''); setStaffEntryToDate(''); }} className="border border-asteria-cream text-asteria-primary rounded-xl px-3 py-2 text-sm font-bold bg-white">All</button>
                    </div>
                  </div>
                  {activeRelationshipEntries.length ? (
                    <div className="space-y-4">
                      {activeRelationshipEntries.map((entry) => (
                        <div key={entry.id} className="pl-5 border-l-2 border-asteria-primary">
                          <div className="text-xs font-bold text-asteria-primary mb-1">{formatDisplayDate(getEntryDateValue(entry))}</div>
                          <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-stone-500">暫時未有情況 update。</div>
                  )}
                </div>
              </div>
            ) : staffThreadPanel === 'journal' ? (
              <div className="flex-1 min-h-0 bg-[#FFF8EC] p-5 overflow-y-auto">
                <div className="bg-white border border-asteria-cream/70 rounded-2xl p-5 mb-4">
                  <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-asteria-dark">心靈日記</h3>
                      <div className="text-xs text-stone-400 mt-1">{activeJournalEntries.length} 篇</div>
                    </div>
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <input type="date" value={staffEntryFromDate} onChange={(event) => setStaffEntryFromDate(event.target.value)} className="min-w-0 border border-asteria-cream rounded-xl px-3 py-2 text-sm outline-none focus:border-asteria-primary bg-white" />
                      <input type="date" value={staffEntryToDate} onChange={(event) => setStaffEntryToDate(event.target.value)} className="min-w-0 border border-asteria-cream rounded-xl px-3 py-2 text-sm outline-none focus:border-asteria-primary bg-white" />
                      <button onClick={() => { setStaffEntryFromDate(''); setStaffEntryToDate(''); }} className="border border-asteria-cream text-asteria-primary rounded-xl px-3 py-2 text-sm font-bold bg-white">All</button>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 max-h-[calc(100vh-430px)] min-h-[260px] overflow-y-auto pr-1">
                  {activeJournalEntries.length ? (
                    activeJournalEntries.map((entry) => (
                      <div key={entry.id} className="bg-white border border-asteria-cream/70 rounded-2xl p-5">
                        <div className="text-xs font-bold text-asteria-primary mb-2">{formatDisplayDate(getEntryDateValue(entry))}</div>
                        <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white border border-asteria-cream/70 rounded-2xl p-5 text-sm text-stone-500">暫時未有心靈日記。</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 min-h-0 bg-[#FFF8EC] p-5 overflow-y-auto">
                <div className="bg-white border border-asteria-cream/70 rounded-2xl p-5">
                  <h3 className="text-xl font-bold text-asteria-dark mb-4">客人資料</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      ['Account 名', activeCustomer?.accountUsername ? `@${activeCustomer.accountUsername}` : '未登記'],
                      ['自己名', activeCustomer?.targetName || '未填'],
                      ['WhatsApp', activeCustomer?.whatsapp || activeCustomer?.phone || '未登記'],
                      ['Phone number', activeCustomer?.phone || '未登記'],
                      ['Instagram', activeCustomer?.igHandle || '未登記'],
                      ['Telegram', activeCustomer?.telegramHandle || '未登記'],
                      ['Email', activeCustomer?.email || '未登記']
                    ].map(([label, value]) => (
                      <div key={label} className="bg-[#FFF8EC] rounded-xl p-4">
                        <div className="text-xs text-stone-400 mb-1">{label}</div>
                        <div className="font-bold text-asteria-dark break-all">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
      <div className="flex justify-center gap-4 mb-6">
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-sm">
          <i className="fa-brands fa-whatsapp text-xl"></i>
        </a>
        <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" aria-label="Facebook" className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
          <i className="fa-brands fa-facebook-f text-xl"></i>
        </a>
        <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" aria-label="Telegram" className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-sky-500 hover:bg-sky-500 hover:text-white transition-all shadow-sm">
          <i className="fa-brands fa-telegram text-xl"></i>
        </a>
      </div>
      <div className="mx-auto mb-8 grid gap-2 text-sm text-stone-500 max-w-md">
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="hover:text-asteria-primary transition-colors">
          WhatsApp：5941 3688
        </a>
        <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="hover:text-asteria-primary transition-colors">
          Telegram：@asteriahongkong
        </a>
        <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="hover:text-asteria-primary transition-colors">
          Facebook：Asteria
        </a>
      </div>
      <p className="text-gray-400 text-xs font-sans">
        © {new Date().getFullYear()} Asteria Crystal Tarot. All Rights Reserved.
      </p>
    </div>
  </footer>
);

const FloatingWhatsApp = () => (
  <a
    href={WHATSAPP_URL}
    target="_blank"
    rel="noreferrer"
    aria-label="WhatsApp 聯絡 Asteria"
    className="fixed right-5 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-[9999] inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white font-bold shadow-xl shadow-green-900/20 hover:brightness-95 hover:-translate-y-0.5 transition-all"
  >
    <i className="fa-brands fa-whatsapp text-xl"></i>
    <span className="hidden sm:inline">WhatsApp</span>
  </a>
);

const SessionCheckingPage = () => (
  <main className="pt-36 md:pt-28 pb-20 bg-[#FFFDF8] min-h-screen">
    <div className="container mx-auto px-6 max-w-3xl">
      <section className="bg-white border border-asteria-cream/70 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="text-sm font-bold text-asteria-primary mb-2">Asteria Space</div>
        <h1 className="text-3xl font-bold text-asteria-dark mb-3">確認登入狀態</h1>
        <p className="text-stone-500 leading-relaxed">請稍等一下。</p>
      </section>
    </div>
  </main>
);

const App = () => {
  const [page, setPage] = useState<AppPage>(getRoutePage);
  const [routeKey, setRouteKey] = useState(`${window.location.pathname}${window.location.hash || ''}`);
  const [currentRole, setCurrentRole] = useState<SpaceSessionRole>(getStoredSpaceRole);
  const [isCheckingSession, setIsCheckingSession] = useState(isBackendConfigured);

  const restoreBackendSession = async () => {
    if (!isBackendConfigured) {
      setIsCheckingSession(false);
      return;
    }
    setIsCheckingSession(true);
    try {
      const account = await getCurrentAccount();
      if (!account) {
        clearStoredSpaceAccount();
        setCurrentRole(null);
        return;
      }
      storeSpaceAccount(account);
      setCurrentRole(account.role);
    } catch {
      setCurrentRole(getStoredSpaceRole());
    } finally {
      setIsCheckingSession(false);
    }
  };

  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentRole(getStoredSpaceRole());
      setRouteKey(`${window.location.pathname}${window.location.hash || ''}`);
      setPage(getRoutePage());
      cleanHomeUrl();
      restoreBackendSession();
      scrollToHashTarget();
    };
    const handleSessionChange = () => {
      setCurrentRole(getStoredSpaceRole());
      setPage(getRoutePage());
    };
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('asteria-route-change', handleRouteChange);
    window.addEventListener('asteria-session-change', handleSessionChange);
    cleanHomeUrl();
    restoreBackendSession();
    scrollToHashTarget();
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('asteria-route-change', handleRouteChange);
      window.removeEventListener('asteria-session-change', handleSessionChange);
    };
  }, []);

  useEffect(() => {
    if (page === 'teaching') return;

    const pageSeo: Record<AppPage, { title: string; description: string; canonical: string; robots?: string }> = {
      home: {
        title: 'Asteria 感情拯救所｜復合挽回・相處教學・感情占卜・愛情儀式',
        description: 'Asteria 感情拯救所提供感情占卜、塔羅分析、復合挽回、斷聯冷淡、曖昧第三者、愛情儀式與日常相處教學。IG 暫停期間請用 WhatsApp、Telegram、Facebook 或 Asteria Space 聯絡。',
        canonical: `${SITE_URL}/`,
      },
      about: {
        title: '關於我們｜Asteria 感情拯救所',
        description: '認識 Asteria 感情拯救所：不只提供占卜與儀式，亦會陪你整理分手、復合、斷聯、冷淡、曖昧與相處問題，教你下一步點做。',
        canonical: `${SITE_URL}/about/`,
      },
      services: {
        title: '服務項目｜感情占卜・塔羅分析・愛情儀式｜Asteria',
        description: 'Asteria 服務包括感情占卜、塔羅分析、曖昧 plan、拍拖 plan、暗戀 plan、復合 plan、單身 plan、愛情儀式與關係能量調整。',
        canonical: `${SITE_URL}/services/`,
      },
      oracle: {
        title: '每日指引｜Asteria 感情拯救所',
        description: 'Asteria 每日指引，陪你在感情混亂、分手失戀、復合挽回、斷聯冷淡與曖昧不安時整理情緒和方向。',
        canonical: `${SITE_URL}/oracle/`,
      },
      reviews: {
        title: '真實好評｜Asteria 感情拯救所',
        description: 'Asteria 真實好評與客人回饋，整理復合、斷聯、冷淡、曖昧、感情占卜、塔羅分析與愛情儀式相關見證。',
        canonical: `${SITE_URL}/reviews/`,
      },
      register: {
        title: 'Asteria Space 登入｜私人聯絡空間',
        description: '登入 Asteria Space，查看訊息、上傳截圖、更新聯絡資料，與 Asteria 保持私人聯絡。',
        canonical: `${SITE_URL}/space/`,
        robots: 'noindex, nofollow',
      },
      portal: {
        title: 'Asteria Space｜會員私人空間',
        description: 'Asteria Space 會員私人空間。',
        canonical: `${SITE_URL}/space/`,
        robots: 'noindex, nofollow',
      },
      admin: {
        title: 'Asteria Space Admin',
        description: 'Asteria Space staff area.',
        canonical: `${SITE_URL}/staff/`,
        robots: 'noindex, nofollow',
      },
      inbox: {
        title: 'Asteria Staff Inbox',
        description: 'Asteria Space staff inbox.',
        canonical: `${SITE_URL}/staff/`,
        robots: 'noindex, nofollow',
      },
    };

    setSeoMeta(pageSeo[page]);
  }, [page, routeKey]);

  const protectedPage = page === 'register' || page === 'portal' || page === 'admin' || page === 'inbox';

  if (protectedPage && isCheckingSession) {
    return (
      <div className="antialiased selection:bg-asteria-primary selection:text-white font-sans text-gray-800">
        <Navbar />
        <SessionCheckingPage />
        <FloatingWhatsApp />
      </div>
    );
  }

  if (page === 'teaching') {
    return (
      <div className="antialiased selection:bg-asteria-primary selection:text-white font-sans text-gray-800">
        <Navbar />
        <Blog fullPage key={routeKey || 'teaching'} />
        <Footer />
        <FloatingWhatsApp />
      </div>
    );
  }

  if (page === 'about') {
    return (
      <div className="antialiased selection:bg-asteria-primary selection:text-white font-sans text-gray-800">
        <Navbar />
        <AboutPage />
        <Footer />
        <FloatingWhatsApp />
      </div>
    );
  }

  if (page === 'services') {
    return (
      <div className="antialiased selection:bg-asteria-primary selection:text-white font-sans text-gray-800">
        <Navbar />
        <main className="pt-48 md:pt-32 bg-[#FFFDF8] min-h-screen">
          <Services />
        </main>
        <Footer />
        <FloatingWhatsApp />
      </div>
    );
  }

  if (page === 'oracle') {
    return (
      <div className="antialiased selection:bg-asteria-primary selection:text-white font-sans text-gray-800">
        <Navbar />
        <main className="pt-48 md:pt-32 bg-[#FFFDF8] min-h-screen">
          <Oracle />
        </main>
        <Footer />
        <FloatingWhatsApp />
      </div>
    );
  }

  if (page === 'reviews') {
    return (
      <div className="antialiased selection:bg-asteria-primary selection:text-white font-sans text-gray-800">
        <Navbar />
        <ReviewsPage />
        <Footer />
        <FloatingWhatsApp />
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

  if (page === 'portal' && currentRole !== 'customer') {
    return (
      <div className="antialiased selection:bg-asteria-primary selection:text-white font-sans text-gray-800">
        <Navbar />
        <RegisterPage />
        <Footer />
        <FloatingWhatsApp />
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
        <FloatingWhatsApp />
      </div>
    );
  }

  if ((page === 'admin' || page === 'inbox') && currentRole !== 'staff') {
    return (
      <div className="antialiased selection:bg-asteria-primary selection:text-white font-sans text-gray-800">
        <Navbar />
        <RegisterPage />
        <Footer />
        <FloatingWhatsApp />
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
      <SearchIntentSection />
      <Oracle />
      <Blog />
      <ServicesPreview />
      <Reviews />
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
