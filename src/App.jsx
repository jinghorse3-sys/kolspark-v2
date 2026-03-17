import { useState, useEffect } from "react";

const API = "http://localhost:3001/api";

const TAG_COLORS = {
  "Bán chạy": { bg: "#FE2C55", color: "#fff" },
  "Hoa hồng cao": { bg: "#25F4EE", color: "#000" },
  "Mới hôm nay": { bg: "#FFD700", color: "#000" },
};

const CATEGORIES = ["Tất cả", "Làm đẹp", "Gia dụng", "Thực phẩm"];
const CAT_ICONS = { "Tất cả": "🔥", "Làm đẹp": "💄", "Gia dụng": "🏠", "Thực phẩm": "🍔" };

const CAT_MAP = {
  "Làm đẹp": ["美妆", "Làm đẹp", "S级爆品"],
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

const TikTokColorLogo = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z" fill="#FE2C55"/>
    <path d="M18.58 5.69a4.83 4.83 0 01-3.77-4.25V1h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V8.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V7.69a8.18 8.18 0 004.78 1.52V5.77a4.85 4.85 0 01-1.01-.08z" fill="#25F4EE"/>
    <path d="M19.09 6.19a4.83 4.83 0 01-3.77-4.25V1.5h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V8.51a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.19a8.18 8.18 0 004.78 1.52V6.27a4.85 4.85 0 01-1.01-.08z" fill="white"/>
  </svg>
);

function SampleModal({ product, onClose }) {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const link = product.sampleLink || "https://www.tiktok.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => { setCopied(false); setStep(2); }, 1500);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000dd", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#111", borderRadius: "24px 24px 0 0", padding: "28px 24px 36px", width: "100%", maxWidth: 420, border: "1px solid #222" }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, background: "#333", borderRadius: 4, margin: "0 auto 24px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, background: "#0d0d0d", borderRadius: 14, padding: "12px 14px" }}>
          {product.image && <img src={product.image} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />}
          <div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{product.name}</div>
            <div style={{ fontSize: 12, color: "#FE2C55", marginTop: 2, fontWeight: 700 }}>Hoa hồng dự kiến {fmt(product.commission)}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#FE2C55", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>1</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Sao chép link mẫu</div>
          </div>
          <div style={{ flex: 1, height: 1, background: step >= 2 ? "#FE2C55" : "#333", margin: "0 10px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: step >= 2 ? "#FE2C55" : "#222", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: step >= 2 ? "#fff" : "#666" }}>2</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: step >= 2 ? "#fff" : "#666" }}>Chuyển sang TikTok</div>
          </div>
        </div>
        {step === 1 && <>
          <div style={{ background: "#0d0d0d", borderRadius: 12, padding: "12px 14px", marginBottom: 16, border: "1px solid #333" }}>
            <div style={{ fontSize: 10, color: "#ffffff44", marginBottom: 6 }}>Link đăng ký mẫu thử</div>
            <div style={{ fontSize: 12, color: "#25F4EE", wordBreak: "break-all", lineHeight: 1.6 }}>{link}</div>
          </div>
          <button onClick={handleCopy} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 15, background: copied ? "#1a1a1a" : "linear-gradient(90deg,#FE2C55,#ff6b6b)", color: copied ? "#FE2C55" : "#fff", transition: "all .2s" }}>
            {copied ? "✅ Đã sao chép! Bước tiếp theo…" : "📋 Bước 1: Sao chép link mẫu"}
          </button>
        </>}
        {step === 2 && <>
          <div style={{ background: "#0d0d0d", borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid #25F4EE33", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#ffffffcc", lineHeight: 1.8 }}>Đã sao chép ✅<br /><span style={{ color: "#ffffff66", fontSize: 12 }}>Dán link vào TikTok Seller Center để nhận mẫu</span></div>
          </div>
          <button onClick={() => window.open("https://www.tiktok.com", "_blank")} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 15, background: "linear-gradient(90deg,#FE2C55,#ff6b6b)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <TikTokColorLogo size={20} />Bước 2: Chuyển sang TikTok đăng ký
          </button>
          <button onClick={() => setStep(1)} style={{ width: "100%", marginTop: 10, padding: "11px 0", borderRadius: 12, border: "1px solid #333", cursor: "pointer", fontWeight: 700, fontSize: 13, background: "transparent", color: "#ffffff66" }}>← Sao chép lại</button>
        </>}
        <div style={{ textAlign: "center", fontSize: 11, color: "#ffffff22", marginTop: 16 }}>Nhấn bên ngoài để đóng</div>
      </div>
    </div>
  );
}

function ProductCard({ p, onApply }) {
  return (
    <div style={{ background: "#111", borderRadius: 16, overflow: "hidden", border: "1px solid #1a1a1a", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", width: "100%", paddingTop: "100%", overflow: "hidden", background: "#0d0d0d" }}>
        {p.image
          ? <img src={p.image} alt={p.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff22", fontSize: 13 }}>Chưa có ảnh</div>}
        <div style={{ position: "absolute", top: 8, left: 8, background: "#FE2C55", color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6 }}>HH {p.commRate}</div>
      </div>
      <div style={{ padding: "10px 10px 12px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 6 }}>{p.name}</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
          {(p.tags || []).map(t => <span key={t} style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 4, background: TAG_COLORS[t]?.bg || "#333", color: TAG_COLORS[t]?.color || "#fff" }}>{t}</span>)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <div><div style={{ fontSize: 9, color: "#ffffff44" }}>Giá bán</div><div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{fmt(p.price)}</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 9, color: "#ffffff44" }}>Hoa hồng</div><div style={{ fontSize: 14, fontWeight: 900, color: "#FE2C55" }}>{fmt(p.commission)}</div></div>
        </div>
        <button onClick={() => onApply(p)} style={{ width: "100%", padding: "9px 0", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 12, background: "linear-gradient(90deg,#FE2C55,#ff6b6b)", color: "#fff", boxShadow: "0 0 12px #FE2C5544" }}>🎁 Nhận mẫu miễn phí</button>
      </div>
    </div>
  );
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [activeTag, setActiveTag] = useState("Tất cả");
  const [products, setProducts] = useState([]);
  const [banner, setBanner] = useState("");
  const [logo, setLogo] = useState("");
  const [loading, setLoading] = useState(true);
  const [sampleProduct, setSampleProduct] = useState(null);

  useEffect(() => {
    fetch(`${API}/products`).then(r => r.json()).then(data => {
      setBanner(data.banner || DEFAULT_BANNER);
      setLogo(data.logo || "");
      setProducts((data.products || []).filter(p => p.name).sort((a, b) => (b.weight || 0) - (a.weight || 0)));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = products
    .filter(p => {
      if (activeCategory === "Tất cả") return true;
      const cats = p.categories || [p.category];
      return cats.some(c => CAT_MAP[activeCategory]?.includes(c));
    })
    .filter(p => {
      if (activeTag === "Tất cả") return true;
      return (p.tags || []).some(t => TAG_MAP[activeTag]?.includes(t));
    });

  return (
    <div style={{ background: "#000", minHeight: "100vh", fontFamily: "'Inter',sans-serif", color: "#fff", maxWidth: 420, margin: "0 auto", paddingBottom: 40 }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {logo
            ? <img src={logo} alt="Logo" style={{ height: 32, objectFit: "contain", maxWidth: 160 }} />
            : <span style={{ fontSize: 24, fontWeight: 600 }}><span style={{ color: "#888" }}>Kol</span><span style={{ background: "linear-gradient(90deg,#e85a2a,#e03030)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>spark</span></span>}
          <span style={{ color: "#ffffff55", fontSize: 18 }}>×</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><TikTokColorLogo size={20} /><span style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>TikTok</span></div>
        </div>
        <a href="https://zalo.me/0838107837" target="_blank" rel="noreferrer" style={{ background: "linear-gradient(135deg,#0d1a2a,#0a2a1a)", border: "1px solid #25F4EE44", borderRadius: 20, padding: "5px 12px", textDecoration: "none" }}>
          <span style={{ fontSize: 9, color: "#25F4EE", fontWeight: 800 }}>✦ Hợp tác chính thức</span>
        </a>
      </div>

      {banner && <div style={{ margin: "0 16px 20px", borderRadius: 18, overflow: "hidden" }}>
        <img src={banner} alt="Banner" style={{ width: "100%", display: "block", objectFit: "cover", maxHeight: 200 }} />
      </div>}

      {/* Phân loại + nhãn gộp 1 hàng */}
      <div style={{ padding: "0 16px", marginBottom: 16 }}>
        {/* Phân loại */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10, overflowX: "auto", scrollbarWidth: "none" }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)} style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 30, border: `2px solid ${activeCategory === c ? "#FE2C55" : "transparent"}`, cursor: "pointer", fontWeight: 700, fontSize: 12, background: activeCategory === c ? "#FE2C55" : "#1a1a1a", color: activeCategory === c ? "#fff" : "#aaa" }}>
              {c}
            </button>
          ))}
        </div>
        {/* Nhãn */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
          {["Tất cả", "Bán chạy", "Hoa hồng cao", "Mới hôm nay"].map(t => {
            const tc = TAG_COLORS[t]; const on = activeTag === t;
            return (
              <button key={t} onClick={() => setActiveTag(t)} style={{ flexShrink: 0, padding: "4px 12px", borderRadius: 20, border: `1px solid ${on ? (tc?.bg || "#FE2C55") : "#2a2a2a"}`, cursor: "pointer", fontWeight: 700, fontSize: 11, background: on ? (tc?.bg || "#FE2C55") : "#1a1a1a", color: on ? (tc?.color || "#fff") : "#666" }}>{t}</button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "0 16px 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 800 }}>🛍 Sản phẩm nổi bật</span>
        <span style={{ fontSize: 11, color: "#FE2C55", border: "1px solid #FE2C5555", borderRadius: 8, padding: "2px 8px" }}>{filtered.length} sản phẩm</span>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ width: 32, height: 32, border: "3px solid #222", borderTop: "3px solid #FE2C55", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <div style={{ fontSize: 13, color: "#ffffff44" }}>Đang tải...</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 16px" }}>
          {filtered.length === 0
            ? <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#ffffff44", padding: 40 }}>Không có sản phẩm</div>
            : filtered.map(p => <ProductCard key={p.id} p={p} onApply={setSampleProduct} />)}
        </div>
      )}

      <div style={{ margin: "20px 16px 0", background: "#0d0d0d", border: "1px solid #FE2C5522", borderRadius: 14, padding: "14px 16px", fontSize: 12, color: "#ffffff55", textAlign: "center", lineHeight: 1.6 }}>
        🔒 Chỉ dành cho KOC đã được xác minh<br /><span style={{ color: "#fff" }}>Kolspark</span> × TikTok
      </div>

      {sampleProduct && <SampleModal product={sampleProduct} onClose={() => setSampleProduct(null)} />}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box}`}</style>
    </div>
  );
}