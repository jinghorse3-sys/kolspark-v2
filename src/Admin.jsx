import { useState, useEffect } from "react";

const API = "/api";
const ADMIN_PASSWORD = "kolspark2024";
const ALL_TAGS = ["Bán chạy", "Hoa hồng cao", "Mới hôm nay"];
const ALL_CATS = ["Làm đẹp", "Gia dụng", "Thực phẩm"];
const fmt = (v) => `₫${Number(v).toLocaleString("vi-VN")}`;
const EMPTY_FORM = { name: "", price: "", commission: "", commRate: "", image: "", tags: [], categories: [], weight: "10", sampleLink: "" };

function UploadBtn({ label, onUploaded, preview }) {
  const [loading, setLoading] = useState(false);
  const upload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setLoading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch(`${API}/upload`, { method: "POST", body: fd }).then(r => r.json());
    onUploaded(res.url); setLoading(false);
  };
  return (
    <label style={{ display: "block", cursor: "pointer" }}>
      <div style={{ border: "2px dashed #333", borderRadius: 10, padding: "14px 0", textAlign: "center", fontSize: 13, color: "#ffffff55", background: "#0d0d0d" }}>
        {loading ? "Uploading…" : preview ? "🔄 Re-upload" : `📁 ${label}`}
      </div>
      <input type="file" accept="image/*" onChange={upload} style={{ display: "none" }} />
    </label>
  );
}

function WeightCell({ product, onSaved }) {
  const [val, setVal] = useState(String(product.weight || 10));
  const [saving, setSaving] = useState(false);
  const save = async () => {
    const w = parseFloat(val) || 10;
    if (w === (product.weight || 10)) return;
    setSaving(true);
    await fetch(`${API}/products/${product.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...product, weight: w }) });
    setSaving(false); onSaved();
  };
  return (
    <input type="number" value={val} onChange={e => setVal(e.target.value)} onBlur={save} onKeyDown={e => e.key === "Enter" && e.target.blur()}
      style={{ width: 60, padding: "5px 8px", borderRadius: 6, border: "1px solid #333", background: saving ? "#0a2a0a" : "#1a1a1a", color: saving ? "#25F4EE" : "#fff", fontSize: 13, fontWeight: 700, outline: "none", textAlign: "center" }} />
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [products, setProducts] = useState([]);
  const [banner, setBanner] = useState("");
  const [logo, setLogo] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState("products");
  const [listTab, setListTab] = useState("active"); // active | offline
  const [filterCat, setFilterCat] = useState("All");
  const [filterTag, setFilterTag] = useState("All");

  const notify = (m) => { setMsg(m); setTimeout(() => setMsg(""), 2500); };

  const load = () => fetch(`${API}/products`).then(r => r.json()).then(d => {
    setProducts((d.products || []).sort((a, b) => (b.weight || 0) - (a.weight || 0)));
    setBanner(d.banner || ""); setLogo(d.logo || "");
  });

  useEffect(() => { if (authed) load(); }, [authed]);

  const handleLogin = () => { if (pw === ADMIN_PASSWORD) setAuthed(true); else alert("Wrong password"); };

  const toggleTag = (t) => setForm(f => ({ ...f, tags: f.tags.includes(t) ? f.tags.filter(x => x !== t) : [...f.tags, t] }));
  const toggleCat = (c) => setForm(f => ({ ...f, categories: f.categories.includes(c) ? f.categories.filter(x => x !== c) : [...f.categories, c] }));

  const handlePriceOrRate = (field, value) => {
    const updated = { ...form, [field]: value };
    const price = parseFloat(field === "price" ? value : updated.price) || 0;
    const rate = parseFloat((field === "commRate" ? value : updated.commRate).replace("%", "")) / 100 || 0;
    if (price > 0 && rate > 0) updated.commission = (price * rate).toFixed(0);
    setForm(updated);
  };

  const handleSave = async () => {
    if (!form.name) return alert("Please enter product name");
    setSaving(true);
    const payload = { ...form, price: parseFloat(form.price) || 0, commission: parseFloat(form.commission) || 0, weight: parseFloat(form.weight) || 10, category: form.categories[0] || "Làm đẹp" };
    if (editingId) {
      await fetch(`${API}/products/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      notify("✅ Product updated");
    } else {
      await fetch(`${API}/products`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      notify("✅ Product added");
    }
    setForm(EMPTY_FORM); setEditingId(null); setShowForm(false); setSaving(false); load();
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({ ...EMPTY_FORM, ...p, price: String(p.price), commission: String(p.commission), weight: String(p.weight || 10), tags: p.tags || [], categories: p.categories || (p.category ? [p.category] : []) });
    setShowForm(true); setTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOffline = async (p) => {
    const newStatus = p.status === "offline" ? "active" : "offline";
    await fetch(`${API}/products/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...p, status: newStatus }) });
    notify(newStatus === "offline" ? "⏸ Product offline" : "✅ Product restored");
    load();
  };

  const handleBannerSave = async () => {
    await fetch(`${API}/banner`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ banner }) });
    notify("✅ Banner saved");
  };

  const handleLogoSave = async () => {
    await fetch(`${API}/logo`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ logo }) });
    notify("✅ Logo saved");
  };

  const activeProducts = products.filter(p => p.status !== "offline");
  const offlineProducts = products.filter(p => p.status === "offline");

  const currentList = (listTab === "active" ? activeProducts : offlineProducts)
    .filter(p => filterCat === "All" || (p.categories || [p.category]).includes(filterCat))
    .filter(p => filterTag === "All" || (p.tags || []).includes(filterTag));

  const inp = { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, color: "#fff", padding: "9px 12px", fontSize: 13, width: "100%", boxSizing: "border-box", outline: "none" };
  const lbl = { fontSize: 11, color: "#ffffff55", marginBottom: 5, display: "block", marginTop: 12 };

  if (!authed) return (
    <div style={{ background: "#000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif" }}>
      <div style={{ background: "#111", borderRadius: 20, padding: 36, width: 320, border: "1px solid #222" }}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4, textAlign: "center" }}>
          <span style={{ color: "#888" }}>Kol</span><span style={{ background: "linear-gradient(90deg,#e85a2a,#e03030)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>spark</span>
        </div>
        <div style={{ fontSize: 12, color: "#ffffff44", textAlign: "center", marginBottom: 28 }}>Admin Dashboard</div>
        <label style={lbl}>Password</label>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter password" style={{ ...inp, marginBottom: 16 }} />
        <button onClick={handleLogin} style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 14, background: "linear-gradient(90deg,#FE2C55,#ff6b6b)", color: "#fff" }}>Login</button>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", fontFamily: "'Inter',sans-serif", color: "#fff" }}>

      {/* Top nav */}
      <div style={{ background: "#111", borderBottom: "1px solid #222", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ fontSize: 18, fontWeight: 900 }}>
          <span style={{ color: "#888" }}>Kol</span><span style={{ background: "linear-gradient(90deg,#e85a2a,#e03030)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>spark</span>
          <span style={{ fontSize: 12, color: "#ffffff33", marginLeft: 10, fontWeight: 400 }}>Admin</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/" target="_blank" style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 12, padding: "6px 14px", cursor: "pointer", textDecoration: "none" }}>👁 Preview</a>
          <button onClick={() => setAuthed(false)} style={{ background: "transparent", border: "1px solid #333", borderRadius: 8, color: "#ffffff66", fontSize: 12, padding: "6px 14px", cursor: "pointer" }}>Logout</button>
        </div>
      </div>

      {msg && <div style={{ position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)", background: "#0a2a0a", border: "1px solid #25F4EE55", borderRadius: 10, padding: "10px 24px", fontSize: 13, color: "#25F4EE", zIndex: 999, whiteSpace: "nowrap" }}>{msg}</div>}

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>

        {/* Main Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[["products", "🛍 Products"], ["banner", "🖼 Banner"], ["logo", "✨ Logo"]].map(([t, l]) => (
            <button key={t} onClick={() => { setTab(t); setShowForm(false); }} style={{ padding: "9px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: tab === t ? "#FE2C55" : "#1a1a1a", color: tab === t ? "#fff" : "#aaa" }}>{l}</button>
          ))}
        </div>

        {/* Products tab */}
        {tab === "products" && <>

          {/* 新增/编辑表单 */}
          {showForm && (
            <div style={{ background: "#111", borderRadius: 16, padding: 24, border: "1px solid #222", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{editingId ? "✏️ Edit Product" : "➕ New Product"}</div>
                <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }} style={{ background: "transparent", border: "1px solid #333", borderRadius: 8, color: "#aaa", fontSize: 12, padding: "5px 12px", cursor: "pointer" }}>Cancel</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div>
                  <label style={lbl}>Product Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inp} placeholder="Product name" />
                  <label style={lbl}>Price (₫)</label>
                  <input type="number" value={form.price} onChange={e => handlePriceOrRate("price", e.target.value)} style={inp} placeholder="0" />
                  <label style={lbl}>Commission Rate (e.g. 30%)</label>
                  <input value={form.commRate} onChange={e => handlePriceOrRate("commRate", e.target.value)} style={inp} placeholder="30%" />
                  <label style={lbl}>Commission Amount (auto)</label>
                  <input type="number" value={form.commission} onChange={e => setForm(f => ({ ...f, commission: e.target.value }))} style={{ ...inp, color: "#25F4EE" }} placeholder="Auto calculated" />
                  <label style={lbl}>Sample Link</label>
                  <input value={form.sampleLink} onChange={e => setForm(f => ({ ...f, sampleLink: e.target.value }))} style={inp} placeholder="https://..." />
                  <label style={lbl}>Weight (higher = top)</label>
                  <input type="number" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Category (multi-select)</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                    {ALL_CATS.map(c => (
                      <button key={c} onClick={() => toggleCat(c)} style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${form.categories.includes(c) ? "#FE2C55" : "#333"}`, cursor: "pointer", fontWeight: 700, fontSize: 12, background: form.categories.includes(c) ? "#FE2C55" : "transparent", color: form.categories.includes(c) ? "#fff" : "#aaa" }}>{c}</button>
                    ))}
                  </div>
                  <label style={lbl}>Tags (multi-select)</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                    {ALL_TAGS.filter(t => t !== "Mới hôm nay").map(t => {
                      const tc = { "Bán chạy": { bg: "#FE2C55", color: "#fff" }, "Hoa hồng cao": { bg: "#25F4EE", color: "#000" } }[t];
                      const on = form.tags.includes(t);
                      return <button key={t} onClick={() => toggleTag(t)} style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${on ? tc.bg : "#333"}`, cursor: "pointer", fontWeight: 700, fontSize: 12, background: on ? tc.bg : "transparent", color: on ? tc.color : "#aaa" }}>{t}</button>;
                    })}
                    <div style={{ fontSize: 11, color: "#ffffff33", alignSelf: "center" }}>* "Mới hôm nay" auto-assigned (within 7 days)</div>
                  </div>
                </div>
                <div>
                  <label style={lbl}>Product Image</label>
                  <UploadBtn label="Upload product image" onUploaded={url => setForm(f => ({ ...f, image: url }))} preview={form.image} />
                  {form.image && <img src={form.image} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 10, marginTop: 10 }} />}
                </div>
              </div>
              <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                <button onClick={handleSave} disabled={saving} style={{ padding: "12px 32px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 14, background: "linear-gradient(90deg,#FE2C55,#ff6b6b)", color: "#fff" }}>
                  {saving ? "Saving…" : editingId ? "💾 Save Changes" : "✅ Add Product"}
                </button>
              </div>
            </div>
          )}

          {/* 工具栏 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {["All", ...ALL_CATS].map(c => (
                <button key={c} onClick={() => setFilterCat(c)} style={{ padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, background: filterCat === c ? "#FE2C55" : "#1a1a1a", color: filterCat === c ? "#fff" : "#aaa" }}>{c}</button>
              ))}
              <div style={{ width: 1, height: 20, background: "#333" }} />
              {["All", "Bán chạy", "Hoa hồng cao"].map(t => (
                <button key={t} onClick={() => setFilterTag(t)} style={{ padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, background: filterTag === t ? "#25F4EE" : "#1a1a1a", color: filterTag === t ? "#000" : "#aaa" }}>{t}</button>
              ))}
            </div>
            {!showForm && <button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }} style={{ padding: "9px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 13, background: "linear-gradient(90deg,#FE2C55,#ff6b6b)", color: "#fff" }}>＋ Add Product</button>}
          </div>

          {/* Active / Offline 子Tab */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button onClick={() => setListTab("active")} style={{ padding: "7px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: listTab === "active" ? "#25F4EE" : "#1a1a1a", color: listTab === "active" ? "#000" : "#aaa" }}>
              Active ({activeProducts.length})
            </button>
            <button onClick={() => setListTab("offline")} style={{ padding: "7px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: listTab === "offline" ? "#FE2C55" : "#1a1a1a", color: listTab === "offline" ? "#fff" : "#aaa" }}>
              Offline ({offlineProducts.length})
            </button>
          </div>

          {/* 商品列表 */}
          <div style={{ background: "#111", borderRadius: 16, border: "1px solid #222", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 90px 90px 80px 120px 100px 70px 140px", background: "#1a1a1a", padding: "12px 16px", fontSize: 11, color: "#ffffff44", fontWeight: 700 }}>
              <div>Image</div><div>Name</div><div>Price</div><div>Commission</div><div>Rate</div><div>Category</div><div>Tags</div><div>Weight ↕</div><div>Actions</div>
            </div>
            {currentList.length === 0
              ? <div style={{ textAlign: "center", padding: 40, color: "#ffffff33" }}>No products</div>
              : currentList.map((p, i) => (
                <div key={p.id} style={{ display: "grid", gridTemplateColumns: "60px 1fr 90px 90px 80px 120px 100px 70px 140px", padding: "12px 16px", alignItems: "center", borderTop: i === 0 ? "none" : "1px solid #1a1a1a", background: editingId === p.id ? "#1a0a0a" : p.status === "offline" ? "#1a1a0a" : "transparent", opacity: p.status === "offline" ? 0.6 : 1 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", background: "#0d0d0d" }}>
                    {p.image ? <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff22", fontSize: 10 }}>No img</div>}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, paddingLeft: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{fmt(p.price)}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#FE2C55" }}>{fmt(p.commission)}</div>
                  <div style={{ fontSize: 12, color: "#ffffff66" }}>{p.commRate}</div>
                  <div style={{ fontSize: 11, color: "#ffffff55" }}>{(p.categories || [p.category]).join(", ")}</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {(p.tags || []).map(t => {
                      const tc = { "Bán chạy": { bg: "#FE2C55", color: "#fff" }, "Hoa hồng cao": { bg: "#25F4EE", color: "#000" }, "Mới hôm nay": { bg: "#FFD700", color: "#000" } }[t] || { bg: "#333", color: "#fff" };
                      return <span key={t} style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: tc.bg, color: tc.color }}>{t}</span>;
                    })}
                  </div>
                  <WeightCell product={p} onSaved={load} />
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => handleEdit(p)} style={{ padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 11, background: "#25F4EE", color: "#000" }}>Edit</button>
                    <button onClick={() => handleOffline(p)} style={{ padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 11, background: p.status === "offline" ? "#0a2a0a" : "#2a1a0a", color: p.status === "offline" ? "#25F4EE" : "#FFD700" }}>
                      {p.status === "offline" ? "↑ On" : "↓ Off"}
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
          <div style={{ fontSize: 12, color: "#ffffff33", marginTop: 10 }}>{currentList.length} products · Weight editable inline · No delete — use Offline instead</div>
        </>}

        {/* Banner */}
        {tab === "banner" && (
          <div style={{ background: "#111", borderRadius: 16, padding: 24, border: "1px solid #222", maxWidth: 500 }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>🖼 Banner</div>
            <UploadBtn label="Upload banner image" onUploaded={url => setBanner(url)} preview={banner} />
            {banner && <img src={banner} alt="" style={{ width: "100%", borderRadius: 12, marginTop: 14, objectFit: "cover", maxHeight: 180 }} />}
            <button onClick={handleBannerSave} style={{ width: "100%", marginTop: 16, padding: "12px 0", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 14, background: "linear-gradient(90deg,#FE2C55,#ff6b6b)", color: "#fff" }}>💾 Save Banner</button>
          </div>
        )}

        {/* Logo */}
        {tab === "logo" && (
          <div style={{ background: "#111", borderRadius: 16, padding: 24, border: "1px solid #222", maxWidth: 500 }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>✨ Logo</div>
            <UploadBtn label="Upload logo (transparent PNG recommended)" onUploaded={url => setLogo(url)} preview={logo} />
            {logo && <div style={{ marginTop: 14, background: "#000", borderRadius: 12, padding: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={logo} alt="Logo" style={{ maxHeight: 60, maxWidth: "100%", objectFit: "contain" }} />
            </div>}
            <button onClick={handleLogoSave} style={{ width: "100%", marginTop: 16, padding: "12px 0", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 14, background: "linear-gradient(90deg,#FE2C55,#ff6b6b)", color: "#fff" }}>💾 Save Logo</button>
          </div>
        )}
      </div>
    </div>
  );
}