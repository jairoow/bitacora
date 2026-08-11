import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import {
  LayoutDashboard, Scale, Wallet, Users, Plus, Trash2,
  ArrowUpRight, ArrowDownRight, ChevronDown, Instagram, Music2,
  Target, Flame, ListChecks, BookOpen, CheckCircle2, Circle, Bell
} from "lucide-react";

/* ---------------------------------------------------------
   Paleta / tokens de diseño — "Bitácora"
--------------------------------------------------------- */
const C = {
  bg: "#08090D",
  bgSoft: "#0E1116",
  surface: "#141821",
  surfaceRaised: "#1A1F29",
  border: "#242A37",
  borderSoft: "#1C212B",
  text: "#ECEEF3",
  textMuted: "#8B93A6",
  textFaint: "#5C6478",
  cuerpo: "#B7D8CC",
  cuerpoSoft: "rgba(183,216,204,0.12)",
  ahorro: "#F0C05A",
  ahorroSoft: "rgba(240,192,90,0.12)",
  redes: "#FF2E92",
  redesSoft: "rgba(255,46,146,0.14)",
  ingreso: "#3DDC84",
  ingresoSoft: "rgba(61,220,132,0.12)",
  gasto: "#FF5C7A",
  gastoSoft: "rgba(255,92,122,0.12)",
  habito: "#FF8A3D",
  habitoSoft: "rgba(255,138,61,0.12)",
  diario: "#8FA3FF",
  diarioSoft: "rgba(143,163,255,0.12)",
  danger: "#FF5C7A",
};

/* Colores de marca — inspirados en Instagram y TikTok, no sus logos reales */
const IG = { purple: "#8B5CF6", grad: "linear-gradient(135deg,#7C3AED 0%,#C026D3 55%,#F472B6 100%)" };
const TT = { pink: "#FE2C55", cyan: "#25F4EE" };

const FONTS = `
html, body, #root {
  min-height: 100%;
  background: #08090D;
}
body {
  overscroll-behavior-y: none;
  -webkit-tap-highlight-color: transparent;
}
button, input, textarea, select {
  -webkit-appearance: none;
}
@media (max-width: 600px) {
  .bitacora-mobile-pad {
    padding-left: 12px !important;
    padding-right: 12px !important;
  }
}

@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
* { box-sizing: border-box; }
body { margin: 0; }
.font-display { font-family: 'Space Grotesk', sans-serif; }
.font-body { font-family: 'Inter', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }
.bitacora-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
.bitacora-scroll::-webkit-scrollbar-thumb { background: #242A37; border-radius: 4px; }
input::placeholder, textarea::placeholder { color: #5C6478; }
input:focus, select:focus, textarea:focus { outline: none; border-color: var(--focus-color, #B7D8CC) !important; }
button { cursor: pointer; font-family: inherit; }
.tab-btn { transition: all 0.18s ease; }
.entry-row { transition: background 0.15s ease; }
.entry-row:hover { background: #1A1F29; }
.flame-pop { animation: flamePop 0.4s ease; }
@keyframes flamePop { 0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); } }
@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
`;

const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "2-digit" });
};
const fmtMoney = (n) => (n < 0 ? "-" : "") + "€" + Math.abs(n).toLocaleString("es-ES", { maximumFractionDigits: 2 });
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const STORAGE_PREFIX = "bitacora-v1:";

function readLocal(key, fallback) {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeLocal(key, data) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/* ---------------------------------------------------------
   Componentes genéricos
--------------------------------------------------------- */
function Card({ children, style, className = "" }) {
  return (
    <div className={className} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, ...style }}>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="font-body" style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: C.textMuted }}>
      {label}
      {children}
    </label>
  );
}

const inputStyle = {
  background: C.bgSoft,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: "9px 11px",
  color: C.text,
  fontSize: 14,
  width: "100%",
};

function NumInput({ value, onChange, placeholder, step = "0.1", accent }) {
  return (
    <input type="number" step={step} value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, "--focus-color": accent }} />
  );
}

function StatCard({ icon: Icon, renderIcon, label, value, sub, accent, accentSoft }) {
  return (
    <Card style={{ padding: 18, flex: 1, minWidth: 150 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        {renderIcon ? renderIcon : (
          <div style={{ width: 32, height: 32, borderRadius: 9, background: accentSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={16} color={accent} />
          </div>
        )}
        <span className="font-body" style={{ fontSize: 12, color: C.textMuted, letterSpacing: 0.3 }}>{label}</span>
      </div>
      <div className="font-mono" style={{ fontSize: 26, fontWeight: 600, color: C.text, lineHeight: 1 }}>{value}</div>
      {sub && <div className="font-body" style={{ fontSize: 12, color: C.textFaint, marginTop: 6 }}>{sub}</div>}
    </Card>
  );
}

function EmptyState({ text, accent }) {
  return (
    <div className="font-body" style={{ padding: "40px 20px", textAlign: "center", color: C.textFaint, fontSize: 13 }}>
      <div style={{ width: 6, height: 6, borderRadius: 3, background: accent, margin: "0 auto 10px" }} />
      {text}
    </div>
  );
}

function ChartTooltip({ active, payload, label, unit = "" }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="font-mono" style={{ background: C.surfaceRaised, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 11px", fontSize: 12 }}>
      <div style={{ color: C.textFaint, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === "number" ? p.value.toLocaleString("es-ES") : p.value}{unit}</div>
      ))}
    </div>
  );
}

/* Insignia de marca — interpretación propia en color, no el logo original */
function BrandBadge({ platform, size = 16 }) {
  const box = size + 12;
  if (platform === "Instagram") {
    return (
      <div style={{ width: box, height: box, borderRadius: box * 0.3, background: IG.grad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Instagram size={size} color="#fff" strokeWidth={2} />
      </div>
    );
  }
  return (
    <div style={{ width: box, height: box, borderRadius: box * 0.3, background: "#000", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", border: `1px solid ${C.border}` }}>
      <Music2 size={size} style={{ position: "absolute", color: TT.cyan, transform: "translate(-1.5px,-1px)", mixBlendMode: "screen" }} />
      <Music2 size={size} style={{ position: "absolute", color: TT.pink, transform: "translate(1.5px,1px)", mixBlendMode: "screen" }} />
      <Music2 size={size} style={{ position: "relative", color: "#fff" }} />
    </div>
  );
}

/* Construye segmentos coloreados según si suben (verde) o bajan (rojo) */
function buildDirectionalSegments(data, key = "v") {
  const segments = [];
  for (let i = 0; i < data.length - 1; i++) {
    const up = data[i + 1][key] >= data[i][key];
    const seg = data.map((d, idx) => ((idx === i || idx === i + 1) ? d[key] : null));
    segments.push({ id: `seg${i}`, color: up ? C.ingreso : C.gasto, values: seg });
  }
  return segments;
}

function DirectionalLineChart({ data, unit = "" }) {
  const segments = useMemo(() => buildDirectionalSegments(data), [data]);
  const chartData = data.map((d, i) => {
    const row = { x: d.x };
    segments.forEach((s) => { row[s.id] = s.values[i]; });
    return row;
  });
  return (
    <div style={{ height: 190 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={C.borderSoft} vertical={false} />
          <XAxis dataKey="x" tick={{ fill: C.textFaint, fontSize: 11 }} axisLine={{ stroke: C.border }} tickLine={false} minTickGap={30} />
          <YAxis tick={{ fill: C.textFaint, fontSize: 11 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
          <Tooltip content={<ChartTooltip unit={unit} />} />
          {segments.map((s) => (
            <Line key={s.id} type="linear" dataKey={s.id} stroke={s.color} strokeWidth={3} dot={false} connectNulls={false} isAnimationActive={false} legendType="none" name={unit.trim() || "valor"} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---------------------------------------------------------
   App
--------------------------------------------------------- */
const TABS = [
  { id: "resumen", label: "Resumen", icon: LayoutDashboard, accent: C.text },
  { id: "cuerpo", label: "Cuerpo", icon: Scale, accent: C.cuerpo },
  { id: "ahorro", label: "Ahorro", icon: Wallet, accent: C.ahorro },
  { id: "redes", label: "Redes", icon: Users, accent: C.redes },
  { id: "habitos", label: "Hábitos", icon: ListChecks, accent: C.habito },
  { id: "diario", label: "Diario", icon: BookOpen, accent: C.diario },
];

const MEDIDA_FIELDS = [
  { key: "pecho", label: "Pecho" },
  { key: "cintura", label: "Cintura" },
  { key: "cadera", label: "Cadera" },
  { key: "bicepsIzq", label: "Bíceps izq." },
  { key: "bicepsDer", label: "Bíceps der." },
  { key: "musloIzq", label: "Muslo izq." },
  { key: "musloDer", label: "Muslo der." },
  { key: "pantorrillaIzq", label: "Pantorrilla izq." },
  { key: "pantorrillaDer", label: "Pantorrilla der." },
];

const STREAK_BADGES = [
  { min: 3, icon: "🔥", label: "Racha de 3" },
  { min: 5, icon: "🥉", label: "Racha de 5" },
  { min: 7, icon: "🥈", label: "Racha de 7" },
  { min: 10, icon: "🥇", label: "Racha de 10" },
  { min: 15, icon: "🏆", label: "Racha de 15" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("resumen");
  const [ready, setReady] = useState(false);
  const [weightEntries, setWeightEntries] = useState([]);
  const [financeEntries, setFinanceEntries] = useState([]);
  const [socialEntries, setSocialEntries] = useState([]);
  const [weightGoal, setWeightGoal] = useState(null);
  const [habitItems, setHabitItems] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    try {
      setWeightEntries(readLocal("weight-entries", []));
      setFinanceEntries(readLocal("finance-entries", []));
      setSocialEntries(readLocal("social-entries", []));
      setWeightGoal(readLocal("weight-goal", null));
      setHabitItems(readLocal("habit-items", []));
      setJournalEntries(readLocal("journal-entries", []));
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    // Convierte Bitácora en una Web App instalable en iPhone/Android.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Metadatos PWA: no dependen de modificar index.html.
    const addMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };
    addMeta("theme-color", "#08090D");
    addMeta("apple-mobile-web-app-capable", "yes");
    addMeta("apple-mobile-web-app-status-bar-style", "black-translucent");
    addMeta("apple-mobile-web-app-title", "Bitácora");

    if (!document.querySelector('link[rel="manifest"]')) {
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = "/manifest.webmanifest";
      document.head.appendChild(link);
    }
  }, []);

  const persist = useCallback((key, data) => {
    const ok = writeLocal(key, data);
    setSaveError(ok ? "" : "No se pudo guardar el dato. Comprueba el espacio disponible del navegador.");
  }, []);

  const addWeight = (entry) => {
    const next = [...weightEntries, entry].sort((a, b) => a.date.localeCompare(b.date));
    setWeightEntries(next);
    persist("weight-entries", next);
  };
  const removeWeight = (id) => {
    const next = weightEntries.filter((e) => e.id !== id);
    setWeightEntries(next);
    persist("weight-entries", next);
  };
  const saveGoal = (val) => {
    setWeightGoal(val);
    persist("weight-goal", val);
  };
  const addFinance = (entry) => {
    const next = [...financeEntries, entry].sort((a, b) => a.date.localeCompare(b.date));
    setFinanceEntries(next);
    persist("finance-entries", next);
  };
  const removeFinance = (id) => {
    const next = financeEntries.filter((e) => e.id !== id);
    setFinanceEntries(next);
    persist("finance-entries", next);
  };
  const addSocial = (entry) => {
    const next = [...socialEntries, entry].sort((a, b) => a.date.localeCompare(b.date));
    setSocialEntries(next);
    persist("social-entries", next);
  };
  const removeSocial = (id) => {
    const next = socialEntries.filter((e) => e.id !== id);
    setSocialEntries(next);
    persist("social-entries", next);
  };
  const addHabitItem = (item) => {
    const next = [...habitItems, item];
    setHabitItems(next);
    persist("habit-items", next);
  };
  const updateHabitItem = (id, patch) => {
    const next = habitItems.map((h) => (h.id === id ? { ...h, ...patch } : h));
    setHabitItems(next);
    persist("habit-items", next);
  };
  const removeHabitItem = (id) => {
    const next = habitItems.filter((h) => h.id !== id);
    setHabitItems(next);
    persist("habit-items", next);
  };
  const addJournal = (entry) => {
    const next = [...journalEntries, entry].sort((a, b) => a.date.localeCompare(b.date));
    setJournalEntries(next);
    persist("journal-entries", next);
  };
  const removeJournal = (id) => {
    const next = journalEntries.filter((e) => e.id !== id);
    setJournalEntries(next);
    persist("journal-entries", next);
  };

  if (!ready) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{FONTS}</style>
        <div className="font-mono" style={{ color: C.textFaint, fontSize: 13 }}>cargando bitácora…</div>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }} className="font-body">
      <style>{FONTS}</style>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "28px 18px 60px" }}>
        <Header />
        <PulseStrip weightEntries={weightEntries} financeEntries={financeEntries} socialEntries={socialEntries} habitItems={habitItems} journalEntries={journalEntries} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
          <span style={{ width: 5, height: 5, borderRadius: 3, background: C.ingreso, flexShrink: 0 }} />
          <span className="font-body" style={{ fontSize: 11.5, color: C.textFaint, lineHeight: 1.4 }}>
            Guardado automático en este dispositivo.
          </span>
        </div>
        <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />
        {saveError && (
          <div className="font-body" style={{ marginTop: 14, padding: "10px 14px", background: "rgba(255,92,122,0.1)", border: `1px solid ${C.danger}`, borderRadius: 10, color: C.danger, fontSize: 12.5, lineHeight: 1.5 }}>
            {saveError}
          </div>
        )}
        <div style={{ marginTop: 22 }}>
          {activeTab === "resumen" && (
            <Resumen weightEntries={weightEntries} financeEntries={financeEntries} socialEntries={socialEntries} weightGoal={weightGoal} habitItems={habitItems} journalEntries={journalEntries} setActiveTab={setActiveTab} />
          )}
          {activeTab === "cuerpo" && (
            <Cuerpo entries={weightEntries} onAdd={addWeight} onRemove={removeWeight} weightGoal={weightGoal} onSaveGoal={saveGoal} />
          )}
          {activeTab === "ahorro" && (
            <Ahorro entries={financeEntries} onAdd={addFinance} onRemove={removeFinance} />
          )}
          {activeTab === "redes" && (
            <Redes entries={socialEntries} onAdd={addSocial} onRemove={removeSocial} />
          )}
          {activeTab === "habitos" && (
            <Habitos items={habitItems} onAdd={addHabitItem} onUpdate={updateHabitItem} onRemove={removeHabitItem} />
          )}
          {activeTab === "diario" && (
            <Diario entries={journalEntries} onAdd={addJournal} onRemove={removeJournal} />
          )}
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div style={{ position: "relative" }}>
      <div aria-hidden style={{
        position: "absolute", top: -30, left: -18, right: -18, height: 150, pointerEvents: "none",
        background: "radial-gradient(ellipse 55% 100% at 15% 0%, rgba(139,92,246,0.16), transparent 60%), radial-gradient(ellipse 55% 100% at 85% 0%, rgba(240,192,90,0.13), transparent 60%), radial-gradient(ellipse 60% 100% at 50% 20%, rgba(183,216,204,0.10), transparent 65%)",
        filter: "blur(6px)",
      }} />
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
        <div className="font-display" style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#B7D8CC,#F0C05A 55%,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0A0C11", fontWeight: 700, fontSize: 18, flexShrink: 0 }}>B</div>
        <div>
          <h1 className="font-display" style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: 0, letterSpacing: -0.3 }}>Bitácora</h1>
          <p className="font-body" style={{ fontSize: 13, color: C.textFaint, margin: "4px 0 0" }}>Tu cuaderno de a bordo: cuerpo, ahorro, redes, hábitos y diario</p>
        </div>
      </div>
    </div>
  );
}

/* Tira de pulso: últimas 14 fechas con actividad registrada en cualquier dominio */
function PulseStrip({ weightEntries, financeEntries, socialEntries, habitItems, journalEntries }) {
  const days = useMemo(() => {
    const arr = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const habitoHoy = habitItems.some((h) => (h.tipo === "habito" ? h.completados?.includes(iso) : h.fecha === iso));
      arr.push({
        iso,
        cuerpo: weightEntries.some((e) => e.date === iso),
        ahorro: financeEntries.some((e) => e.date === iso),
        redes: socialEntries.some((e) => e.date === iso),
        habito: habitoHoy,
        diario: journalEntries.some((e) => e.date === iso),
      });
    }
    return arr;
  }, [weightEntries, financeEntries, socialEntries, habitItems, journalEntries]);

  return (
    <div style={{ display: "flex", gap: 4, marginTop: 20, position: "relative" }}>
      {days.map((d) => {
        const active = [d.cuerpo && C.cuerpo, d.ahorro && C.ahorro, d.redes && C.redes, d.habito && C.habito, d.diario && C.diario].filter(Boolean);
        return (
          <div key={d.iso} title={d.iso} style={{ flex: 1, height: 5, borderRadius: 3, background: C.borderSoft, display: "flex", overflow: "hidden" }}>
            {active.length > 0 && active.map((color, i) => (<div key={i} style={{ flex: 1, background: color }} />))}
          </div>
        );
      })}
    </div>
  );
}

function TabNav({ activeTab, setActiveTab }) {
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 16, borderBottom: `1px solid ${C.border}`, overflowX: "auto" }} className="bitacora-scroll">
      {TABS.map((t) => {
        const active = activeTab === t.id;
        return (
          <button key={t.id} className="tab-btn font-display" onClick={() => setActiveTab(t.id)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 14px", background: "transparent", border: "none",
              borderBottom: active ? `2px solid ${t.accent}` : "2px solid transparent", color: active ? C.text : C.textFaint,
              fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>
            <t.icon size={15} color={active ? t.accent : C.textFaint} />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------
   RESUMEN
--------------------------------------------------------- */
function Resumen({ weightEntries, financeEntries, socialEntries, weightGoal, habitItems, journalEntries, setActiveTab }) {
  const lastWeight = weightEntries[weightEntries.length - 1];
  const prevWeight = weightEntries[weightEntries.length - 2];
  const weightDelta = lastWeight && prevWeight ? (lastWeight.peso - prevWeight.peso) : null;
  const streak = useMemo(() => computeStreak(weightEntries, weightGoal), [weightEntries, weightGoal]);

  const balance = financeEntries.reduce((acc, e) => acc + (e.tipo === "ingreso" ? Number(e.monto) : -Number(e.monto)), 0);

  const platforms = ["Instagram", "TikTok"];
  const followerTotals = platforms.map((p) => {
    const es = socialEntries.filter((e) => e.plataforma === p).sort((a, b) => a.date.localeCompare(b.date));
    return { plataforma: p, total: es.length ? es[es.length - 1].seguidoresTotal : 0 };
  });
  const totalFollowers = followerTotals.reduce((a, b) => a + b.total, 0);

  const habitosList = habitItems.filter((h) => h.tipo === "habito");
  const doneToday = habitosList.filter((h) => h.completados?.includes(todayISO())).length;
  const diarioHoy = journalEntries.some((e) => e.date === todayISO());

  if (!weightEntries.length && !financeEntries.length && !socialEntries.length && !habitItems.length && !journalEntries.length) {
    return (
      <Card style={{ padding: "48px 24px", textAlign: "center" }}>
        <p className="font-display" style={{ fontSize: 17, color: C.text, margin: "0 0 8px" }}>Tu bitácora está vacía</p>
        <p className="font-body" style={{ fontSize: 13, color: C.textFaint, margin: "0 0 20px" }}>Registra tu primer dato para empezar a ver tu progreso.</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {TABS.slice(1).map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className="font-display" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surfaceRaised, color: t.accent, fontSize: 13, fontWeight: 600 }}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard icon={Scale} label="Peso actual" value={lastWeight ? `${lastWeight.peso} kg` : "—"}
          sub={weightDelta != null ? `${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(1)} kg desde el último registro` : "Sin registros suficientes"}
          accent={C.cuerpo} accentSoft={C.cuerpoSoft} />
        <StatCard icon={Wallet} label="Ahorro total" value={fmtMoney(balance)}
          sub={`${financeEntries.length} movimiento${financeEntries.length === 1 ? "" : "s"} registrados`}
          accent={C.ahorro} accentSoft={C.ahorroSoft} />
        <StatCard icon={Users} label="Seguidores totales" value={totalFollowers.toLocaleString("es-ES")}
          sub={followerTotals.map((f) => `${f.plataforma}: ${f.total.toLocaleString("es-ES")}`).join(" · ")}
          accent={C.redes} accentSoft={C.redesSoft} />
        {habitosList.length > 0 && (
          <StatCard icon={ListChecks} label="Hoy" value={`${doneToday}/${habitosList.length}`}
            sub={`hábitos · diario ${diarioHoy ? "escrito" : "sin escribir"}`}
            accent={C.habito} accentSoft={C.habitoSoft} />
        )}
      </div>

      {weightGoal != null && streak.current > 0 && (
        <Card style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
          <Flame size={18} color="#FF8A3D" />
          <span className="font-body" style={{ fontSize: 13.5, color: C.text }}>
            Racha de <strong>{streak.current}</strong> acercándote a tu objetivo de {weightGoal} kg
          </span>
        </Card>
      )}

      {weightEntries.length > 1 && (
        <Card style={{ padding: 18 }}>
          <SectionTitle text="Peso — evolución" accent={C.cuerpo} />
          <MiniLineChart data={weightEntries.map((e) => ({ x: fmtDate(e.date), v: e.peso }))} color={C.cuerpo} unit=" kg" />
        </Card>
      )}
      {financeEntries.length > 1 && (
        <Card style={{ padding: 18 }}>
          <SectionTitle text="Ahorro acumulado" accent={C.ahorro} />
          <DirectionalLineChart data={buildBalanceSeries(financeEntries)} unit="€" />
        </Card>
      )}
      {socialEntries.length > 1 && (
        <Card style={{ padding: 18 }}>
          <SectionTitle text="Seguidores — evolución" accent={C.redes} />
          <MultiFollowerChart entries={socialEntries} />
        </Card>
      )}
    </div>
  );
}

function SectionTitle({ text, accent, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 3, height: 14, borderRadius: 2, background: accent }} />
        <span className="font-display" style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{text}</span>
      </div>
      {right}
    </div>
  );
}

function MiniLineChart({ data, color, unit }) {
  return (
    <div style={{ height: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={C.borderSoft} vertical={false} />
          <XAxis dataKey="x" tick={{ fill: C.textFaint, fontSize: 11 }} axisLine={{ stroke: C.border }} tickLine={false} minTickGap={30} />
          <YAxis tick={{ fill: C.textFaint, fontSize: 11 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
          <Tooltip content={<ChartTooltip unit={unit} />} />
          <Line type="monotone" dataKey="v" name="Valor" stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color, strokeWidth: 0 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function buildBalanceSeries(financeEntries) {
  let running = 0;
  return financeEntries.map((e) => {
    running += e.tipo === "ingreso" ? Number(e.monto) : -Number(e.monto);
    return { x: fmtDate(e.date), v: Math.round(running * 100) / 100 };
  });
}

function computeStreak(entries, goal) {
  if (goal == null || goal === "" || entries.length < 2) return { current: 0, best: 0 };
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  let current = 0, best = 0, prevDist = Math.abs(sorted[0].peso - Number(goal));
  for (let i = 1; i < sorted.length; i++) {
    const dist = Math.abs(sorted[i].peso - Number(goal));
    if (dist < prevDist) { current++; best = Math.max(best, current); }
    else if (dist > prevDist) { current = 0; }
    prevDist = dist;
  }
  return { current, best };
}

function habitStreak(completados) {
  const set = new Set(completados || []);
  let streak = 0;
  let cursor = new Date();
  if (!set.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function MultiFollowerChart({ entries }) {
  const platforms = [{ key: "Instagram", color: IG.purple }, { key: "TikTok", color: TT.pink }];
  const dates = [...new Set(entries.map((e) => e.date))].sort();
  const data = dates.map((date) => {
    const row = { x: fmtDate(date) };
    platforms.forEach((p) => {
      const es = entries.filter((e) => e.plataforma === p.key && e.date <= date).sort((a, b) => a.date.localeCompare(b.date));
      if (es.length) row[p.key] = es[es.length - 1].seguidoresTotal;
    });
    return row;
  });
  return (
    <div style={{ height: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={C.borderSoft} vertical={false} />
          <XAxis dataKey="x" tick={{ fill: C.textFaint, fontSize: 11 }} axisLine={{ stroke: C.border }} tickLine={false} minTickGap={30} />
          <YAxis tick={{ fill: C.textFaint, fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: C.textMuted }} />
          <Line type="monotone" dataKey="Instagram" stroke={IG.purple} strokeWidth={2.75} dot={{ r: 3, fill: IG.purple, strokeWidth: 0 }} connectNulls
            style={{ filter: `drop-shadow(0 0 5px ${IG.purple}) drop-shadow(0 0 10px ${IG.purple}66)` }} />
          <Line type="monotone" dataKey="TikTok" stroke={TT.pink} strokeWidth={2.75} dot={{ r: 3, fill: TT.pink, strokeWidth: 0 }} connectNulls
            style={{ filter: `drop-shadow(0 0 4px ${TT.cyan}) drop-shadow(0 0 5px ${TT.pink})` }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---------------------------------------------------------
   CUERPO
--------------------------------------------------------- */
function Cuerpo({ entries, onAdd, onRemove, weightGoal, onSaveGoal }) {
  const [date, setDate] = useState(todayISO());
  const [peso, setPeso] = useState("");
  const [medidas, setMedidas] = useState({});
  const [chartField, setChartField] = useState("peso");
  const [showAllMedidas, setShowAllMedidas] = useState(false);
  const [goalInput, setGoalInput] = useState(weightGoal != null ? String(weightGoal) : "");

  const submit = () => {
    if (!date || !peso) return;
    const cleanMedidas = {};
    Object.entries(medidas).forEach(([k, v]) => { if (v !== "" && v != null) cleanMedidas[k] = Number(v); });
    onAdd({ id: uid(), date, peso: Number(peso), medidas: cleanMedidas });
    setPeso("");
    setMedidas({});
  };

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const chartOptions = [{ key: "peso", label: "Peso (kg)" }, ...MEDIDA_FIELDS.map((m) => ({ key: m.key, label: m.label + " (cm)" }))];
  const chartData = sorted
    .filter((e) => chartField === "peso" ? e.peso != null : e.medidas?.[chartField] != null)
    .map((e) => ({ x: fmtDate(e.date), v: chartField === "peso" ? e.peso : e.medidas[chartField] }));

  const lastWeight = sorted[sorted.length - 1];
  const streak = useMemo(() => computeStreak(sorted, weightGoal), [sorted, weightGoal]);
  const badgesEarned = STREAK_BADGES.filter((b) => streak.best >= b.min);
  const distancia = weightGoal != null && lastWeight ? Math.abs(lastWeight.peso - Number(weightGoal)) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card style={{ padding: 18 }}>
        <SectionTitle text="Nuevo registro" accent={C.cuerpo} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 12 }}>
          <Field label="Fecha">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...inputStyle, "--focus-color": C.cuerpo }} />
          </Field>
          <Field label="Peso (kg)">
            <NumInput value={peso} onChange={setPeso} placeholder="72.5" accent={C.cuerpo} />
          </Field>
        </div>
        <button onClick={() => setShowAllMedidas((v) => !v)} className="font-body" style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 14, background: "none", border: "none", color: C.textMuted, fontSize: 12.5 }}>
          <ChevronDown size={14} style={{ transform: showAllMedidas ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
          Medidas corporales (opcional)
        </button>
        {showAllMedidas && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 12, marginTop: 12 }}>
            {MEDIDA_FIELDS.map((f) => (
              <Field key={f.key} label={f.label + " (cm)"}>
                <NumInput value={medidas[f.key] || ""} onChange={(v) => setMedidas((m) => ({ ...m, [f.key]: v }))} placeholder="—" accent={C.cuerpo} />
              </Field>
            ))}
          </div>
        )}
        <button onClick={submit} disabled={!date || !peso} className="font-display" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "none", background: (!date || !peso) ? C.borderSoft : C.cuerpo, color: (!date || !peso) ? C.textFaint : "#12201A", fontSize: 13.5, fontWeight: 600 }}>
          <Plus size={15} /> Guardar registro
        </button>
      </Card>

      <Card style={{ padding: 18 }}>
        <SectionTitle text="Objetivo de peso" accent={C.cuerpo} />
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
          <Field label="Peso objetivo (kg)">
            <NumInput value={goalInput} onChange={setGoalInput} placeholder="68.0" accent={C.cuerpo} />
          </Field>
          <button onClick={() => onSaveGoal(goalInput === "" ? null : Number(goalInput))} className="font-display" style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: `1px solid ${C.cuerpo}`, background: C.cuerpoSoft, color: C.cuerpo, fontSize: 13, fontWeight: 600 }}>
            <Target size={14} /> Fijar objetivo
          </button>
        </div>

        {weightGoal != null && (
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="font-body" style={{ fontSize: 13, color: C.textMuted }}>
              {distancia != null ? <>Te quedan <strong className="font-mono" style={{ color: C.text }}>{distancia.toFixed(1)} kg</strong> para llegar a {weightGoal} kg</> : "Registra tu peso para ver tu distancia al objetivo."}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span className="font-body" style={{ fontSize: 12, color: C.textFaint }}>Racha actual:</span>
              {streak.current > 0 ? (
                <div className="flame-pop" style={{ display: "flex", gap: 3 }}>
                  {Array.from({ length: Math.min(streak.current, 10) }).map((_, i) => (<Flame key={i} size={16} color="#FF8A3D" />))}
                  {streak.current > 10 && <span className="font-mono" style={{ color: "#FF8A3D", fontSize: 12 }}>+{streak.current - 10}</span>}
                </div>
              ) : (
                <span className="font-mono" style={{ fontSize: 12, color: C.textFaint }}>0 — el próximo registro más cerca del objetivo empieza una racha</span>
              )}
            </div>

            {badgesEarned.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {badgesEarned.map((b) => (
                  <div key={b.min} title={b.label} className="font-body" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 20, background: C.surfaceRaised, border: `1px solid ${C.border}`, fontSize: 12, color: C.text }}>
                    <span style={{ fontSize: 14 }}>{b.icon}</span> {b.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {sorted.length > 0 && (
        <Card style={{ padding: 18 }}>
          <SectionTitle text="Evolución" accent={C.cuerpo}
            right={
              <select value={chartField} onChange={(e) => setChartField(e.target.value)} className="font-body" style={{ background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 8, color: C.textMuted, fontSize: 12, padding: "5px 8px" }}>
                {chartOptions.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            } />
          {chartData.length > 1 ? (
            <MiniLineChart data={chartData} color={C.cuerpo} unit={chartField === "peso" ? " kg" : " cm"} />
          ) : (
            <EmptyState text="Añade al menos dos registros con este dato para ver la evolución." accent={C.cuerpo} />
          )}
        </Card>
      )}

      <HistoryTable accent={C.cuerpo} rows={[...sorted].reverse()} onRemove={onRemove}
        renderRow={(e) => `${e.peso} kg${Object.keys(e.medidas || {}).length ? ` · ${Object.keys(e.medidas).length} medida(s)` : ""}`} />
    </div>
  );
}

/* ---------------------------------------------------------
   AHORRO
--------------------------------------------------------- */
const CATEGORIAS = ["Nómina", "Freelance", "Vivienda", "Comida", "Transporte", "Ocio", "Suscripciones", "Salud", "Otros"];

function Ahorro({ entries, onAdd, onRemove }) {
  const [date, setDate] = useState(todayISO());
  const [tipo, setTipo] = useState("ingreso");
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [monto, setMonto] = useState("");
  const [nota, setNota] = useState("");

  const submit = () => {
    if (!date || !monto) return;
    onAdd({ id: uid(), date, tipo, categoria, monto: Number(monto), nota: nota.trim() });
    setMonto("");
    setNota("");
  };

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const totalIngresos = entries.filter((e) => e.tipo === "ingreso").reduce((a, e) => a + Number(e.monto), 0);
  const totalGastos = entries.filter((e) => e.tipo === "gasto").reduce((a, e) => a + Number(e.monto), 0);
  const balance = totalIngresos - totalGastos;
  const balanceSeries = buildBalanceSeries(sorted);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card style={{ padding: 18 }}>
        <SectionTitle text="Nuevo movimiento" accent={C.ahorro} />
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button onClick={() => setTipo("ingreso")} className="font-display" style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: `1px solid ${tipo === "ingreso" ? C.ingreso : C.border}`, background: tipo === "ingreso" ? C.ingresoSoft : "transparent", color: tipo === "ingreso" ? C.ingreso : C.textFaint, fontSize: 13, fontWeight: 600 }}>
            ↑ Ingreso
          </button>
          <button onClick={() => setTipo("gasto")} className="font-display" style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: `1px solid ${tipo === "gasto" ? C.gasto : C.border}`, background: tipo === "gasto" ? C.gastoSoft : "transparent", color: tipo === "gasto" ? C.gasto : C.textFaint, fontSize: 13, fontWeight: 600 }}>
            ↓ Gasto
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 }}>
          <Field label="Fecha">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...inputStyle, "--focus-color": C.ahorro }} />
          </Field>
          <Field label="Importe (€)">
            <NumInput value={monto} onChange={setMonto} placeholder="0.00" step="0.01" accent={C.ahorro} />
          </Field>
          <Field label="Categoría">
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={{ ...inputStyle, "--focus-color": C.ahorro }}>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Nota (opcional)">
            <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="—" style={{ ...inputStyle, "--focus-color": C.ahorro }} />
          </Field>
        </div>
        <button onClick={submit} disabled={!date || !monto} className="font-display" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "none", background: (!date || !monto) ? C.borderSoft : (tipo === "ingreso" ? C.ingreso : C.gasto), color: (!date || !monto) ? C.textFaint : "#0B140F", fontSize: 13.5, fontWeight: 600 }}>
          <Plus size={15} /> Guardar movimiento
        </button>
      </Card>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard icon={ArrowUpRight} label="Ingresos totales" value={fmtMoney(totalIngresos)} accent={C.ingreso} accentSoft={C.ingresoSoft} />
        <StatCard icon={ArrowDownRight} label="Gastos totales" value={fmtMoney(totalGastos)} accent={C.gasto} accentSoft={C.gastoSoft} />
        <StatCard icon={Wallet} label="Ahorro total" value={fmtMoney(balance)} accent={C.ahorro} accentSoft={C.ahorroSoft} />
      </div>

      {sorted.length > 1 && (
        <Card style={{ padding: 18 }}>
          <SectionTitle text="Ahorro acumulado en el tiempo" accent={C.ahorro}
            right={<span className="font-body" style={{ fontSize: 11.5, color: C.textFaint }}><span style={{ color: C.ingreso }}>● sube</span> &nbsp; <span style={{ color: C.gasto }}>● baja</span></span>} />
          <DirectionalLineChart data={balanceSeries} unit="€" />
        </Card>
      )}

      <HistoryTable accent={C.ahorro} rows={[...sorted].reverse()} onRemove={onRemove}
        renderRow={(e) => `${e.tipo === "ingreso" ? "+" : "-"}${fmtMoney(Number(e.monto)).replace("-", "")} · ${e.categoria}${e.nota ? ` · ${e.nota}` : ""}`}
        rowColor={(e) => (e.tipo === "ingreso" ? C.ingreso : C.gasto)} />
    </div>
  );
}

/* ---------------------------------------------------------
   REDES
--------------------------------------------------------- */
function Redes({ entries, onAdd, onRemove }) {
  const [date, setDate] = useState(todayISO());
  const [plataforma, setPlataforma] = useState("Instagram");
  const [publicaciones, setPublicaciones] = useState("");
  const [seguidoresTotal, setSeguidoresTotal] = useState("");

  const submit = () => {
    if (!date || seguidoresTotal === "") return;
    onAdd({ id: uid(), date, plataforma, publicaciones: Number(publicaciones || 0), seguidoresTotal: Number(seguidoresTotal) });
    setPublicaciones("");
    setSeguidoresTotal("");
  };

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const withDelta = sorted.map((e, i) => {
    const prevSame = [...sorted.slice(0, i)].reverse().find((p) => p.plataforma === e.plataforma);
    return { ...e, ganados: prevSame ? e.seguidoresTotal - prevSame.seguidoresTotal : null };
  });

  const totalPosts = entries.reduce((a, e) => a + Number(e.publicaciones || 0), 0);
  const igLast = [...sorted].reverse().find((e) => e.plataforma === "Instagram");
  const ttLast = [...sorted].reverse().find((e) => e.plataforma === "TikTok");
  const postsChartData = sorted.map((e) => ({ x: fmtDate(e.date), publicaciones: e.publicaciones, plataforma: e.plataforma }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card style={{ padding: 18 }}>
        <SectionTitle text="Nuevo registro" accent={C.redes} />
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button onClick={() => setPlataforma("Instagram")} className="font-display" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "8px 0", borderRadius: 10, border: `1px solid ${plataforma === "Instagram" ? IG.purple : C.border}`, background: plataforma === "Instagram" ? "rgba(139,92,246,0.14)" : "transparent", color: plataforma === "Instagram" ? IG.purple : C.textFaint, fontSize: 13, fontWeight: 600 }}>
            <BrandBadge platform="Instagram" size={13} /> Instagram
          </button>
          <button onClick={() => setPlataforma("TikTok")} className="font-display" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "8px 0", borderRadius: 10, border: `1px solid ${plataforma === "TikTok" ? TT.pink : C.border}`, background: plataforma === "TikTok" ? "rgba(254,44,85,0.12)" : "transparent", color: plataforma === "TikTok" ? TT.pink : C.textFaint, fontSize: 13, fontWeight: 600 }}>
            <BrandBadge platform="TikTok" size={13} /> TikTok
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 }}>
          <Field label="Fecha">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...inputStyle, "--focus-color": C.redes }} />
          </Field>
          <Field label="Publicaciones subidas">
            <NumInput value={publicaciones} onChange={setPublicaciones} placeholder="0" step="1" accent={C.redes} />
          </Field>
          <Field label="Seguidores totales">
            <NumInput value={seguidoresTotal} onChange={setSeguidoresTotal} placeholder="1200" step="1" accent={C.redes} />
          </Field>
        </div>
        <button onClick={submit} disabled={!date || seguidoresTotal === ""} className="font-display" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "none", background: (!date || seguidoresTotal === "") ? C.borderSoft : C.redes, color: (!date || seguidoresTotal === "") ? C.textFaint : "#210A15", fontSize: 13.5, fontWeight: 600 }}>
          <Plus size={15} /> Guardar registro
        </button>
      </Card>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard renderIcon={<BrandBadge platform="Instagram" size={15} />} label="Instagram — seguidores" value={igLast ? igLast.seguidoresTotal.toLocaleString("es-ES") : "—"} />
        <StatCard renderIcon={<BrandBadge platform="TikTok" size={15} />} label="TikTok — seguidores" value={ttLast ? ttLast.seguidoresTotal.toLocaleString("es-ES") : "—"} />
        <StatCard icon={Users} label="Publicaciones totales" value={totalPosts.toLocaleString("es-ES")} accent={C.redes} accentSoft={C.redesSoft} />
      </div>

      {sorted.length > 1 && (
        <Card style={{ padding: 18 }}>
          <SectionTitle text="Seguidores por plataforma" accent={C.redes} />
          <MultiFollowerChart entries={sorted} />
        </Card>
      )}

      {postsChartData.length > 1 && (
        <Card style={{ padding: 18 }}>
          <SectionTitle text="Publicaciones por registro" accent={C.redes} />
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={postsChartData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke={C.borderSoft} vertical={false} />
                <XAxis dataKey="x" tick={{ fill: C.textFaint, fontSize: 11 }} axisLine={{ stroke: C.border }} tickLine={false} minTickGap={30} />
                <YAxis tick={{ fill: C.textFaint, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="publicaciones" name="Publicaciones" radius={[4, 4, 0, 0]}>
                  {postsChartData.map((d, i) => (<Cell key={i} fill={d.plataforma === "Instagram" ? IG.purple : TT.pink} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <HistoryTable accent={C.redes} rows={[...withDelta].reverse()} onRemove={onRemove}
        renderRow={(e) => `${e.plataforma} · ${e.seguidoresTotal.toLocaleString("es-ES")} seguidores${e.ganados != null ? ` (${e.ganados >= 0 ? "+" : ""}${e.ganados})` : ""} · ${e.publicaciones} publicación(es)`}
        rowColor={(e) => (e.plataforma === "Instagram" ? IG.purple : TT.pink)} />
    </div>
  );
}

/* ---------------------------------------------------------
   HÁBITOS Y TAREAS
--------------------------------------------------------- */
function Habitos({ items, onAdd, onUpdate, onRemove }) {
  const [tipo, setTipo] = useState("habito");
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState(todayISO());
  const [hora, setHora] = useState("");

  const submit = () => {
    if (!nombre.trim()) return;
    const base = { id: uid(), tipo, nombre: nombre.trim(), hora: hora || null };
    if (tipo === "habito") onAdd({ ...base, completados: [] });
    else onAdd({ ...base, fecha, done: false });
    setNombre("");
    setHora("");
  };

  const habitosList = items.filter((i) => i.tipo === "habito");
  const tareasList = [...items.filter((i) => i.tipo === "tarea")].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const today = todayISO();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card style={{ padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Bell size={15} color={C.habito} style={{ marginTop: 2, flexShrink: 0 }} />
        <span className="font-body" style={{ fontSize: 12.5, color: C.textMuted, lineHeight: 1.5 }}>
          Esta bitácora no puede sonar ni avisarte fuera de aquí — es una web, no una app con permisos de notificación. Si quieres una alarma real en tu iPhone, dime qué hábito o tarea y a qué hora, y te lo creo como recordatorio nativo con aviso de verdad.
        </span>
      </Card>

      <Card style={{ padding: 18 }}>
        <SectionTitle text="Nuevo" accent={C.habito} />
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button onClick={() => setTipo("habito")} className="font-display" style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: `1px solid ${tipo === "habito" ? C.habito : C.border}`, background: tipo === "habito" ? C.habitoSoft : "transparent", color: tipo === "habito" ? C.habito : C.textFaint, fontSize: 13, fontWeight: 600 }}>
            Hábito diario
          </button>
          <button onClick={() => setTipo("tarea")} className="font-display" style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: `1px solid ${tipo === "tarea" ? C.habito : C.border}`, background: tipo === "tarea" ? C.habitoSoft : "transparent", color: tipo === "tarea" ? C.habito : C.textFaint, fontSize: 13, fontWeight: 600 }}>
            Tarea puntual
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 }}>
          <Field label="Nombre">
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={tipo === "habito" ? "Beber 2L de agua" : "Llamar al médico"} style={{ ...inputStyle, "--focus-color": C.habito }} />
          </Field>
          {tipo === "tarea" && (
            <Field label="Fecha">
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ ...inputStyle, "--focus-color": C.habito }} />
            </Field>
          )}
          <Field label="Hora (opcional)">
            <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} style={{ ...inputStyle, "--focus-color": C.habito }} />
          </Field>
        </div>
        <button onClick={submit} disabled={!nombre.trim()} className="font-display" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "none", background: !nombre.trim() ? C.borderSoft : C.habito, color: !nombre.trim() ? C.textFaint : "#211404", fontSize: 13.5, fontWeight: 600 }}>
          <Plus size={15} /> Añadir
        </button>
      </Card>

      {habitosList.length > 0 && (
        <Card style={{ padding: 18 }}>
          <SectionTitle text="Hábitos diarios" accent={C.habito} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {habitosList.map((h) => {
              const done = h.completados?.includes(today);
              const streak = habitStreak(h.completados);
              return (
                <div key={h.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 10, background: C.bgSoft, border: `1px solid ${C.borderSoft}` }}>
                  <button onClick={() => onUpdate(h.id, { completados: done ? h.completados.filter((d) => d !== today) : [...(h.completados || []), today] })} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", flex: 1, textAlign: "left" }}>
                    {done ? <CheckCircle2 size={19} color={C.habito} /> : <Circle size={19} color={C.textFaint} />}
                    <span className="font-body" style={{ fontSize: 13.5, color: done ? C.text : C.textMuted }}>
                      {h.nombre}{h.hora ? <span className="font-mono" style={{ color: C.textFaint, fontSize: 11.5 }}> · {h.hora}</span> : null}
                    </span>
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {streak > 0 && <span className="font-mono" style={{ fontSize: 11.5, color: "#FF8A3D" }}>🔥{streak}</span>}
                    <button onClick={() => onRemove(h.id)} style={{ background: "none", border: "none", padding: 4, color: C.textFaint }} aria-label="Eliminar hábito"><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {tareasList.length > 0 && (
        <Card style={{ padding: 18 }}>
          <SectionTitle text="Tareas" accent={C.habito} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tareasList.map((t) => {
              const overdue = !t.done && t.fecha < today;
              return (
                <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 10, background: C.bgSoft, border: `1px solid ${overdue ? C.gasto : C.borderSoft}` }}>
                  <button onClick={() => onUpdate(t.id, { done: !t.done })} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", flex: 1, textAlign: "left" }}>
                    {t.done ? <CheckCircle2 size={19} color={C.habito} /> : <Circle size={19} color={overdue ? C.gasto : C.textFaint} />}
                    <span className="font-body" style={{ fontSize: 13.5, color: t.done ? C.textFaint : C.text, textDecoration: t.done ? "line-through" : "none" }}>{t.nombre}</span>
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="font-mono" style={{ fontSize: 11, color: overdue ? C.gasto : C.textFaint }}>{fmtDate(t.fecha)}{t.hora ? ` · ${t.hora}` : ""}</span>
                    <button onClick={() => onRemove(t.id)} style={{ background: "none", border: "none", padding: 4, color: C.textFaint }} aria-label="Eliminar tarea"><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {!habitosList.length && !tareasList.length && (
        <EmptyState text="Aún no has añadido hábitos ni tareas." accent={C.habito} />
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   DIARIO
--------------------------------------------------------- */
const MOODS = [{ key: "bien", icon: "🙂" }, { key: "normal", icon: "😐" }, { key: "mal", icon: "🙁" }];

function Diario({ entries, onAdd, onRemove }) {
  const [date, setDate] = useState(todayISO());
  const [texto, setTexto] = useState("");
  const [animo, setAnimo] = useState(null);

  const submit = () => {
    if (!texto.trim()) return;
    onAdd({ id: uid(), date, texto: texto.trim(), animo });
    setTexto("");
    setAnimo(null);
  };

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card style={{ padding: 18 }}>
        <SectionTitle text="Nueva entrada" accent={C.diario} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12, marginBottom: 12 }}>
          <Field label="Fecha">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...inputStyle, "--focus-color": C.diario }} />
          </Field>
          <Field label="Ánimo (opcional)">
            <div style={{ display: "flex", gap: 6 }}>
              {MOODS.map((m) => (
                <button key={m.key} onClick={() => setAnimo(animo === m.key ? null : m.key)} style={{ fontSize: 18, padding: "6px 10px", borderRadius: 9, border: `1px solid ${animo === m.key ? C.diario : C.border}`, background: animo === m.key ? C.diarioSoft : C.bgSoft }}>
                  {m.icon}
                </button>
              ))}
            </div>
          </Field>
        </div>
        <Field label="Cómo ha ido el día">
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe libremente…" rows={4} style={{ ...inputStyle, resize: "vertical", "--focus-color": C.diario, fontFamily: "inherit" }} />
        </Field>
        <button onClick={submit} disabled={!texto.trim()} className="font-display" style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "none", background: !texto.trim() ? C.borderSoft : C.diario, color: !texto.trim() ? C.textFaint : "#0D1230", fontSize: 13.5, fontWeight: 600 }}>
          <Plus size={15} /> Guardar entrada
        </button>
      </Card>

      {sorted.length === 0 ? (
        <EmptyState text="Tu diario está vacío. Escribe tu primera entrada." accent={C.diario} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sorted.map((e) => (
            <Card key={e.id} style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="font-mono" style={{ fontSize: 12, color: C.textFaint }}>{fmtDate(e.date)}</span>
                  {e.animo && <span style={{ fontSize: 15 }}>{MOODS.find((m) => m.key === e.animo)?.icon}</span>}
                </div>
                <button onClick={() => onRemove(e.id)} style={{ background: "none", border: "none", padding: 4, color: C.textFaint }} aria-label="Eliminar entrada"><Trash2 size={14} /></button>
              </div>
              <p className="font-body" style={{ fontSize: 13.5, color: C.text, margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{e.texto}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   Tabla de historial genérica
--------------------------------------------------------- */
function HistoryTable({ rows, onRemove, renderRow, accent, rowColor }) {
  if (!rows.length) return <EmptyState text="Aún no hay registros." accent={accent} />;
  return (
    <Card style={{ overflow: "hidden" }}>
      <div style={{ padding: "12px 18px", borderBottom: `1px solid ${C.borderSoft}` }}>
        <span className="font-display" style={{ fontSize: 13, fontWeight: 600, color: C.textMuted }}>Historial ({rows.length})</span>
      </div>
      <div className="bitacora-scroll" style={{ maxHeight: 320, overflowY: "auto" }}>
        {rows.map((e) => (
          <div key={e.id} className="entry-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px", borderBottom: `1px solid ${C.borderSoft}` }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span className="font-mono" style={{ fontSize: 12, color: C.textFaint }}>{fmtDate(e.date)}</span>
              <span className="font-body" style={{ fontSize: 13.5, color: rowColor ? rowColor(e) : C.text }}>{renderRow(e)}</span>
            </div>
            <button onClick={() => onRemove(e.id)} style={{ background: "none", border: "none", padding: 6, color: C.textFaint }} aria-label="Eliminar registro">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
