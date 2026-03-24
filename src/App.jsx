import { useState, useEffect, useRef, useCallback } from "react";

const API = `/api`;
const PAGE_SIZE = 8;

const TAG_COLORS = {
  "Bán chạy": { bg: "#FE2C55", color: "#fff" },
  "Hoa hồng cao": { bg: "#25F4EE", color: "#000" },
  "Mới hôm nay": { bg: "#FFD700", color: "#000" },
};

const CATEGORIES = ["Tất cả", "Làm đẹp", "Gia dụng", "Thực phẩm"];
const CAT_ICONS = { "Tất cả": "🔥", "Làm đẹp": "💄", "Gia dụng": "🏠", "Thực phẩm": "🍔" };

const CAT_MAP = {
  "Làm đẹp": ["美妆", "Làm đẹp"],
  "Gia dụng": ["家居", "Gia dụng"],
  "Thực phẩm": ["食品", "Thực phẩm"],
};

const TAG_MAP = {
  "Bán chạy": ["爆款", "Bán chạy"],
  "Hoa hồng cao": ["高佣", "Hoa hồng cao"],
  "Mới hôm nay": ["今日上新", "Mới hôm nay"],
};

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80";
const fmt = (v) => `₫${Number(v).toLocaleString("vi-VN")}`;

const isNew = (p) => {
  if (!p.createdAt) return (p.tags || []).some(t => TAG_MAP["Mới hôm nay"]?.includes(t));
  return Date.now() - new Date(p.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
};

const TikTokColorLogo = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z" fill="#FE2C55"/>
    <path d="M18.58 5.69a4.83 4.83 0 01-3.77-4.25V1h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V8.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V7.69a8.18 8.18 0 004.78 1.52V5.77a4.85 4.85 0 01-1.01-.08z" fill="#25F4EE"/>
    <path d="M19.09 6.19a4.83 4.83 0 01-3.77-4.25V1.5h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V8.51a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.19a8.18 8.18 0 004.78 1.52V6.27a4.85 4.85 0 01-1.01-.08z" fill="white"/>
  </svg>
);

// 样品弹窗：两步同时显示
function SampleModal({ product, onClose }) {
  const [copiedTap, setCopiedTap] = useState(false);
  const tapLink = product.sampleLink || "";
  const tiktokDeepLink = "tiktok://app/open?path=/creator/affiliate/product/add";

  const handleCopyTap = () => {
    if (!tapLink) return;
    // 兼容移动端的复制方式
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(tapLink);
      } else {
        const el = document.createElement("textarea");
        el.value = tapLink;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.focus(); el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
    } catch (e) {}
    setCopiedTap(true);
    setTimeout(() => setCopiedTap(false), 2000);
  };

  const handleOpenTikTok = () => {
    window.location.href = "snssdk1233://addsample?url=" + encodeURIComponent(tapLink);
    setTimeout(() => {
      window.location.href = "tiktok://app/open?path=/creator/affiliate/product/add";
      setTimeout(() => {
        window.open("https://www.tiktok.com", "_blank");
      }, 1500);
    }, 1500);
  };

  // 样品数量（每个商品固定随机，基于id）
  const stock = ((product.id?.charCodeAt(0) || 5) * 17 + 23) % 100 + 1;
  const pct = Math.round((stock / 100) * 100);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000dd", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#111", borderRadius: "24px 24px 0 0", padding: "24px 20px 32px", width: "100%", maxWidth: 420, border: "1px solid #222" }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, background: "#333", borderRadius: 4, margin: "0 auto 20px" }} />

        {/* 商品信息 */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, background: "#0d0d0d", borderRadius: 14, padding: "12px 14px" }}>
          {product.image && <img src={product.image} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />}
          <div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{product.name}</div>
            <div style={{ fontSize: 12, color: "#FE2C55", marginTop: 2, fontWeight: 700 }}>Hoa hồng dự kiến {fmt(product.commission)}</div>
          </div>
        </div>

        {/* 样品进度条 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "#ffffff66" }}>Số lượng mẫu còn lại</span>
            <span style={{ fontSize: 11, color: "#FE2C55", fontWeight: 800 }}>🔥 Chỉ còn {stock} mẫu!</span>
          </div>
          <div style={{ height: 6, background: "#222", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#FE2C55,#ff6b6b)", borderRadius: 10, transition: "width 1s ease" }} />
          </div>
        </div>

        {/* 第一步：复制 TAP 链接 */}
        <div style={{ background: "#0d0d0d", borderRadius: 14, padding: 14, marginBottom: 12, border: "1px solid #2a2a2a" }}>
          <div style={{ fontSize: 11, color: "#ffffff44", marginBottom: 8 }}>
            <span style={{ background: "#FE2C55", color: "#fff", borderRadius: 4, padding: "2px 7px", fontWeight: 800, marginRight: 6 }}>Bước 1</span>
            Sao chép link TAP
          </div>
          <div style={{ fontSize: 11, color: "#25F4EE", wordBreak: "break-all", lineHeight: 1.5, marginBottom: 10 }}>
            {tapLink || "Chưa có link mẫu"}
          </div>
          <button onClick={handleCopyTap} style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 13, background: copiedTap ? "#1a2a1a" : "linear-gradient(90deg,#25F4EE,#00c8c8)", color: copiedTap ? "#25F4EE" : "#000", transition: "all .2s" }}>
            {copiedTap ? "✅ Đã sao chép!" : "📋 Sao chép link TAP"}
          </button>
        </div>

        {/* 第二步：直接打开 TAP 链接，浏览器自动唤醒 TikTok */}
        <div style={{ background: "#0d0d0d", borderRadius: 14, padding: 14, border: "1px solid #2a2a2a" }}>
          <div style={{ fontSize: 11, color: "#ffffff44", marginBottom: 8 }}>
            <span style={{ background: "#FE2C55", color: "#fff", borderRadius: 4, padding: "2px 7px", fontWeight: 800, marginRight: 6 }}>Bước 2</span>
            Mở link → TikTok tự động mở trang đăng ký mẫu
          </div>
          <a href={tapLink || "https://www.tiktok.com"} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "11px 0", borderRadius: 10, border: "1px solid #ffffff22", cursor: "pointer", fontWeight: 800, fontSize: 13, background: "#000", color: "#fff", textDecoration: "none", boxSizing: "border-box" }}>
            <TikTokColorLogo size={18} />Mở TikTok đăng ký mẫu
          </a>
        </div>

        <div style={{ textAlign: "center", fontSize: 10, color: "#ffffff22", marginTop: 14 }}>Nhấn bên ngoài để đóng</div>
      </div>
    </div>
  );
}

// 分享弹窗
function ShareModal({ product, siteUrl, onClose }) {
  const [copied, setCopied] = useState(false);
  const url = product ? `${siteUrl}?product=${product.id}` : siteUrl;
  const text = product ? `Nhận mẫu miễn phí: ${product.name}` : "Kolspark × TikTok - Nhận mẫu miễn phí!";

  const handleCopy = () => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: text, url }).catch(() => {});
    } else handleCopy();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000dd", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#111", borderRadius: "24px 24px 0 0", padding: "24px 20px 32px", width: "100%", maxWidth: 420, border: "1px solid #222" }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, background: "#333", borderRadius: 4, margin: "0 auto 20px" }} />
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>📤 Chia sẻ</div>
        <div style={{ fontSize: 12, color: "#ffffff44", marginBottom: 16 }}>{product ? product.name : "Kolspark × TikTok"}</div>
        <div style={{ background: "#0d0d0d", borderRadius: 10, padding: "10px 12px", marginBottom: 12, border: "1px solid #333", fontSize: 11, color: "#25F4EE", wordBreak: "break-all" }}>{url}</div>
        <button onClick={handleNativeShare} style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 14, background: "linear-gradient(90deg,#FE2C55,#ff6b6b)", color: "#fff", marginBottom: 8 }}>
          {navigator.share ? "📤 Chia sẻ ngay" : (copied ? "✅ Đã sao chép!" : "📋 Sao chép link")}
        </button>
        <button onClick={handleCopy} style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "1px solid #333", cursor: "pointer", fontWeight: 700, fontSize: 13, background: "transparent", color: "#ffffff66" }}>
          {copied ? "✅ Đã sao chép!" : "📋 Sao chép link"}
        </button>
      </div>
    </div>
  );
}

function ProductCard({ p, onApply, onTagClick }) {
  const newProduct = isNew(p);
  const stock = ((p.id?.charCodeAt(0) || 5) * 17 + 23) % 100 + 1;
  const pct = Math.round((stock / 100) * 100);
  const tags = (p.tags || []).filter(t => !TAG_MAP["Mới hôm nay"]?.includes(t));

  return (
    <div style={{ background: "#111", borderRadius: 16, overflow: "hidden", border: "1px solid #1a1a1a", display: "flex", flexDirection: "column" }}>
      {/* 正方形图片，点击整图进入申样 */}
      <div onClick={() => onApply(p)} style={{ position: "relative", width: "100%", paddingTop: "100%", overflow: "hidden", background: "#0d0d0d", cursor: "pointer" }}>
        {p.image
          ? <img src={p.image} alt={p.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff22", fontSize: 13 }}>Chưa có ảnh</div>}
        {/* 佣金角标 */}
        <div style={{ position: "absolute", top: 8, left: 8, background: "#FE2C55", color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6 }}>HH {p.commRate}</div>
        {/* NEW 角标 */}
        {newProduct && (
          <div style={{ position: "absolute", top: 8, right: 8, background: "#FFD700", color: "#000", fontSize: 9, fontWeight: 900, padding: "2px 7px", borderRadius: 4, letterSpacing: 0.5 }}>NEW</div>
        )}
      </div>

      <div style={{ padding: "10px 10px 12px", display: "flex", flexDirection: "column", flex: 1 }}>
        {/* 标题单行 */}
        <div style={{ fontSize: 12, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4 }}>{p.name}</div>

        {/* 标签（可点击筛选，排除今日上新） */}
        {tags.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
            {tags.map(t => (
              <span key={t} onClick={() => onTagClick(t)} style={{ fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 3, background: TAG_COLORS[t]?.bg || "#333", color: TAG_COLORS[t]?.color || "#fff", cursor: "pointer", lineHeight: 1.6 }}>{t}</span>
            ))}
          </div>
        )}

        {/* 价格+佣金 */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <div><div style={{ fontSize: 8, color: "#ffffff33" }}>Giá bán</div><div style={{ fontSize: 13, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{fmt(p.price)}</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 8, color: "#ffffff33" }}>Hoa hồng</div><div style={{ fontSize: 13, fontWeight: 900, color: "#FE2C55", lineHeight: 1.2 }}>{fmt(p.commission)}</div></div>
        </div>

        {/* 样品进度条 - 单排 */}
        <div style={{ marginBottom: 7 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <div style={{ flex: 1, height: 3, background: "#222", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#FE2C55,#FFD700)", borderRadius: 10 }} />
            </div>
            <span style={{ fontSize: 8, color: "#FE2C55", fontWeight: 800, whiteSpace: "nowrap" }}>🔥 Còn {stock} mẫu</span>
          </div>
        </div>

        {/* 申样按钮 */}
        <button onClick={() => onApply(p)} style={{ width: "100%", padding: "9px 0", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 12, background: "linear-gradient(90deg,#FE2C55,#ff6b6b)", color: "#fff", boxShadow: "0 0 12px #FE2C5544" }}>🎁 Nhận mẫu miễn phí</button>
      </div>
    </div>
  );
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [activeTag, setActiveTag] = useState("Tất cả");
  const [allProducts, setAllProducts] = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [banner, setBanner] = useState("");
  const [logo, setLogo] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sampleProduct, setSampleProduct] = useState(null);
  const [shareProduct, setShareProduct] = useState(null);
  const [showSiteShare, setShowSiteShare] = useState(false);
  const loaderRef = useRef(null);
  const pageRef = useRef(1);

  const siteUrl = window.location.origin;

  useEffect(() => {
    fetch(`${API}/products`).then(r => r.json()).then(data => {
      setBanner(data.banner || DEFAULT_BANNER);
      setLogo(data.logo || "");
      const sorted = (data.products || [])
        .filter(p => p.name && p.status !== "offline")
        .sort((a, b) => (b.weight || 0) - (a.weight || 0));
      setAllProducts(sorted);
      setDisplayed(sorted.slice(0, PAGE_SIZE));
      pageRef.current = 1;
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = allProducts
    .filter(p => p.status !== "offline")
    .filter(p => {
      if (activeCategory === "Tất cả") return true;
      return (p.categories || [p.category]).some(c => CAT_MAP[activeCategory]?.includes(c));
    })
    .filter(p => {
      if (activeTag === "Tất cả") return true;
      if (activeTag === "Mới hôm nay") return isNew(p);
      return (p.tags || []).some(t => TAG_MAP[activeTag]?.includes(t));
    });

  useEffect(() => {
    setDisplayed(filtered.slice(0, PAGE_SIZE));
    pageRef.current = 1;
  }, [activeCategory, activeTag, allProducts]);

  // 无限滚动
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loadingMore) {
        const next = (pageRef.current + 1) * PAGE_SIZE;
        if (next > filtered.length) return;
        setLoadingMore(true);
        setTimeout(() => {
          setDisplayed(filtered.slice(0, next));
          pageRef.current += 1;
          setLoadingMore(false);
        }, 600);
      }
    }, { threshold: 1 });
    if (loaderRef.current) obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [filtered, loadingMore]);

  const handleTagClick = (tag) => {
    const viTag = Object.keys(TAG_MAP).find(k => TAG_MAP[k].includes(tag));
    if (viTag) setActiveTag(viTag);
  };

  return (
    <div style={{ background: "#000", minHeight: "100vh", fontFamily: "'Inter',sans-serif", color: "#fff", maxWidth: 420, margin: "0 auto", paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {logo
            ? <img src={logo} alt="Logo" style={{ height: 28, objectFit: "contain", maxWidth: 140 }} />
            : <span style={{ fontSize: 22, fontWeight: 600 }}><span style={{ color: "#888" }}>Kol</span><span style={{ background: "linear-gradient(90deg,#e85a2a,#e03030)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>spark</span></span>}
          <span style={{ color: "#ffffff33", fontSize: 16 }}>×</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}><TikTokColorLogo size={18} /><span style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>TikTok</span></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* 悬浮分享按钮 */}
          <button onClick={() => setShowSiteShare(true)} style={{ position: "fixed", bottom: 24, right: 24, width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
          <a href="https://zalo.me/0838107837" target="_blank" rel="noreferrer" style={{ background: "linear-gradient(135deg,#0d1a2a,#0a2a1a)", border: "1px solid #25F4EE44", borderRadius: 20, padding: "5px 10px", textDecoration: "none" }}>
            <span style={{ fontSize: 9, color: "#25F4EE", fontWeight: 800 }}>✦ Hợp tác chính thức</span>
          </a>
        </div>
      </div>

      {/* Banner */}
      {banner && <div style={{ margin: "0 16px 16px", borderRadius: 16, overflow: "hidden" }}>
        <img src={banner} alt="Banner" style={{ width: "100%", display: "block", objectFit: "cover", maxHeight: 180 }} />
      </div>}

      {/* 分类 */}
      <div style={{ display: "flex", gap: 8, padding: "0 16px", marginBottom: 10, overflowX: "auto", scrollbarWidth: "none" }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setActiveCategory(c)} style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 30, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, background: activeCategory === c ? "#FE2C55" : "#1a1a1a", color: activeCategory === c ? "#fff" : "#aaa" }}>
            {c}
          </button>
        ))}
      </div>

      {/* 标签筛选（去掉"全部"） */}
      <div style={{ display: "flex", gap: 8, padding: "0 16px", marginBottom: 16, overflowX: "auto", scrollbarWidth: "none" }}>
        {["Bán chạy", "Hoa hồng cao", "Mới hôm nay"].map(t => {
          const tc = TAG_COLORS[t]; const on = activeTag === t;
          return (
            <button key={t} onClick={() => setActiveTag(on ? "Tất cả" : t)} style={{ flexShrink: 0, padding: "5px 14px", borderRadius: 20, border: `1px solid ${on ? tc.bg : "#2a2a2a"}`, cursor: "pointer", fontWeight: 700, fontSize: 11, background: on ? tc.bg : "#1a1a1a", color: on ? tc.color : "#aaa" }}>{t}</button>
          );
        })}
      </div>

      {/* 商品数量 */}
      <div style={{ padding: "0 16px 10px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 800 }}>🛍 Sản phẩm nổi bật</span>
        <span style={{ fontSize: 11, color: "#FE2C55", border: "1px solid #FE2C5544", borderRadius: 8, padding: "2px 8px" }}>{filtered.length} SP</span>
      </div>

      {/* 商品网格 */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ width: 32, height: 32, border: "3px solid #222", borderTop: "3px solid #FE2C55", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <div style={{ fontSize: 13, color: "#ffffff44" }}>Đang tải...</div>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 16px" }}>
            {displayed.length === 0
              ? <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#ffffff44", padding: 40 }}>Không có sản phẩm</div>
              : displayed.map(p => <ProductCard key={p.id} p={p} onApply={setSampleProduct} onTagClick={handleTagClick} />)}
          </div>
          {/* 无限滚动触发器 */}
          <div ref={loaderRef} style={{ textAlign: "center", padding: "16px 0" }}>
            {loadingMore && <div style={{ width: 24, height: 24, border: "3px solid #222", borderTop: "3px solid #FE2C55", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />}
            {!loadingMore && displayed.length < filtered.length && <div style={{ fontSize: 11, color: "#ffffff22" }}>Cuộn để xem thêm</div>}
          </div>
        </>
      )}

      {/* Footer */}
      <div style={{ margin: "8px 16px 0", background: "#0d0d0d", border: "1px solid #FE2C5522", borderRadius: 14, padding: "12px 16px", fontSize: 11, color: "#ffffff44", textAlign: "center", lineHeight: 1.6 }}>
        🔒 Chỉ dành cho KOC đã được xác minh<br /><span style={{ color: "#fff" }}>Kolspark</span> × TikTok
      </div>

      {/* 弹窗 */}
      {sampleProduct && <SampleModal product={sampleProduct} onClose={() => setSampleProduct(null)} />}
      {shareProduct && <ShareModal product={shareProduct} siteUrl={siteUrl} onClose={() => setShareProduct(null)} />}
      {showSiteShare && <ShareModal product={null} siteUrl={siteUrl} onClose={() => setShowSiteShare(false)} />}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box}::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}