import React, { useState, useEffect, useMemo, useCallback, useRef, createContext, useContext } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import {
  LayoutDashboard, Scale, Wallet, Users, Plus, Trash2, X, Search,
  ArrowUpRight, ArrowDownRight, ChevronDown, ChevronLeft, ChevronRight, Instagram, Music2,
  Target, Flame, ListChecks, BookOpen, CheckCircle2, Circle, Bell, Calendar as CalendarIcon,
  Compass, Settings, Menu, Sparkles, PiggyBank, Repeat, TrendingUp, Pencil
} from "lucide-react";

/* =========================================================
   COLORES DE DOMINIO — constantes, iguales en todos los temas
   (para que cada sección se reconozca por su color pase lo
   que pase con el tema visual general)
========================================================= */
const DOMAIN = {
  cuerpo: "#B7D8CC", cuerpoSoft: "rgba(183,216,204,0.14)",
  ahorro: "#F0C05A", ahorroSoft: "rgba(240,192,90,0.14)",
  redes: "#FF2E92", redesSoft: "rgba(255,46,146,0.14)",
  ingreso: "#3DDC84", ingresoSoft: "rgba(61,220,132,0.14)",
  gasto: "#FF5C7A", gastoSoft: "rgba(255,92,122,0.14)",
  habito: "#FF8A3D", habitoSoft: "rgba(255,138,61,0.14)",
  diario: "#8FA3FF", diarioSoft: "rgba(143,163,255,0.14)",
  objetivo: "#4FD1C5", objetivoSoft: "rgba(79,209,197,0.14)",
  danger: "#FF5C7A",
};
const IG = { purple: "#8B5CF6", grad: "linear-gradient(135deg,#7C3AED 0%,#C026D3 55%,#F472B6 100%)" };
const TT = { pink: "#FE2C55", cyan: "#25F4EE" };

/* =========================================================
   TEMAS — cambian fondo/superficies/tipografía, nunca los
   datos. Cambiar de tema no borra ni transforma nada guardado.
========================================================= */
const THEMES = {
  dark: { id: "dark", label: "Dark", bg: "#08090D", bgSoft: "#0E1116", surface: "#141821", surfaceRaised: "#1A1F29", border: "#242A37", borderSoft: "#1C212B", text: "#ECEEF3", textMuted: "#8B93A6", textFaint: "#5C6478", radius: 16, shadow: "none", paper: false, accent: "#B7D8CC", accent2: "#8B5CF6", fontDisplay: "'Space Grotesk', sans-serif", fontBody: "'Inter', sans-serif" },
  minimal: { id: "minimal", label: "Minimal", bg: "#FFFFFF", bgSoft: "#F7F7F8", surface: "#FFFFFF", surfaceRaised: "#F2F2F4", border: "#E4E4E8", borderSoft: "#EEEEF0", text: "#121316", textMuted: "#6B6E76", textFaint: "#9DA0A8", radius: 10, shadow: "none", paper: false, accent: "#121316", accent2: "#6B6E76", fontDisplay: "'Space Grotesk', sans-serif", fontBody: "'Inter', sans-serif" },
  paper: { id: "paper", label: "Diario de papel", bg: "#F4EEE1", bgSoft: "#EFE7D6", surface: "#FBF6EA", surfaceRaised: "#F3ECDA", border: "#E0D3B4", borderSoft: "#E8DCC0", text: "#3A3226", textMuted: "#786E58", textFaint: "#A79C82", radius: 6, shadow: "0 2px 10px rgba(58,50,38,0.10)", paper: true, accent: "#8A6D3B", accent2: "#B0442E", fontDisplay: "'Space Grotesk', serif", fontBody: "'Inter', serif" },
  modern: { id: "modern", label: "Modern", bg: "#121316", bgSoft: "#191B20", surface: "#1E2127", surfaceRaised: "#262A32", border: "#333844", borderSoft: "#2A2E36", text: "#F5F6F8", textMuted: "#9BA1AE", textFaint: "#666D7A", radius: 20, shadow: "0 10px 26px rgba(0,0,0,0.28)", paper: false, accent: "#8B5CF6", accent2: "#4FD1C5", fontDisplay: "'Space Grotesk', sans-serif", fontBody: "'Inter', sans-serif" },
  soft: { id: "soft", label: "Soft", bg: "#FBF1F4", bgSoft: "#F6E9EE", surface: "#FFFFFF", surfaceRaised: "#FCEEF2", border: "#F0D8E1", borderSoft: "#F5E3EA", text: "#4A3B42", textMuted: "#8C7580", textFaint: "#B79FA9", radius: 18, shadow: "0 6px 18px rgba(196,140,164,0.14)", paper: false, accent: "#D9789B", accent2: "#8FADA3", fontDisplay: "'Space Grotesk', sans-serif", fontBody: "'Inter', sans-serif" },
};
const THEME_LIST = Object.values(THEMES);

function getTokens(themeId, overrides) {
  const base = THEMES[themeId] || THEMES.dark;
  const o = overrides || {};
  return {
    ...base,
    accent: o.accent || base.accent,
    accent2: o.accent2 || base.accent2,
    bg: o.bg || base.bg,
  };
}

const ThemeContext = createContext(THEMES.dark);

const TEXT_SIZES = { sm: 0.92, md: 1, lg: 1.12 };

/* =========================================================
   CSS global
========================================================= */
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
* { box-sizing: border-box; }
body { margin: 0; }
.font-display { font-family: var(--font-display); }
.font-body { font-family: var(--font-body); }
.font-mono { font-family: 'JetBrains Mono', monospace; }
.bitacora-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
.bitacora-scroll::-webkit-scrollbar-thumb { background: currentColor; opacity: 0.3; border-radius: 4px; }
input::placeholder, textarea::placeholder { color: inherit; opacity: 0.55; }
input:focus, select:focus, textarea:focus { outline: none; border-color: var(--focus-color, #B7D8CC) !important; }
button { cursor: pointer; font-family: inherit; }
.tab-btn, .press { transition: transform 0.12s ease, opacity 0.12s ease, background 0.15s ease, border-color 0.15s ease; }
.press:active { transform: scale(0.96); }
.entry-row { transition: background 0.15s ease; }
.entry-row:hover { background: rgba(128,128,128,0.08); }
.flame-pop { animation: flamePop 0.4s ease; }
.tab-content-enter { animation: fadeSlideIn 0.22s ease; }
.sheet-enter { animation: sheetUp 0.2s ease; }
@keyframes flamePop { 0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); } }
@keyframes fadeSlideIn { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes sheetUp { 0% { opacity: 0; transform: translateY(16px); } 100% { opacity: 1; transform: translateY(0); } }
.no-motion, .no-motion * { transition: none !important; animation: none !important; }
@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
`;

/* =========================================================
   Utilidades de fecha
========================================================= */
const todayISO = () => new Date().toISOString().slice(0, 10);
const parseISO = (iso) => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); };
const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (iso, n) => { const d = parseISO(iso); d.setDate(d.getDate() + n); return toISO(d); };
const addMonths = (iso, n) => { const d = parseISO(iso); d.setMonth(d.getMonth() + n); return toISO(d); };
const addYears = (iso, n) => { const d = parseISO(iso); d.setFullYear(d.getFullYear() + n); return toISO(d); };
const startOfMonth = (iso) => { const d = parseISO(iso); return toISO(new Date(d.getFullYear(), d.getMonth(), 1)); };
const startOfWeekMon = (iso) => { const d = parseISO(iso); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return toISO(d); };
const isSameMonth = (iso, refIso) => { const a = parseISO(iso), b = parseISO(refIso); return a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear(); };
const dayNum = (iso) => parseISO(iso).getDate();
const fmtDate = (iso) => parseISO(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "2-digit" });
const fmtDateLong = (iso) => { const s = parseISO(iso).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }); return s.charAt(0).toUpperCase() + s.slice(1); };
const monthLabel = (iso) => { const s = parseISO(iso).toLocaleDateString("es-ES", { month: "long", year: "numeric" }); return s.charAt(0).toUpperCase() + s.slice(1); };
const weekdayKey = (iso) => ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][parseISO(iso).getDay()];
function getMonthMatrix(iso) {
  const gridStart = startOfWeekMon(startOfMonth(iso));
  const weeks = [];
  let cur = gridStart;
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) { week.push(cur); cur = addDays(cur, 1); }
    weeks.push(week);
  }
  return weeks;
}
const fmtMoney = (n) => (n < 0 ? "-" : "") + "€" + Math.abs(n).toLocaleString("es-ES", { maximumFractionDigits: 2 });
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

async function waitForStorage(maxTries = 40) {
  for (let i = 0; i < maxTries; i++) {
    if (typeof window !== "undefined" && window.storage) return true;
    await new Promise((r) => setTimeout(r, 125));
  }
  return !!(typeof window !== "undefined" && window.storage);
}
const PUBLISH_HINT = "No se ha guardado. Esta bitácora tiene que estar publicada para poder guardar datos: abre el menú ⋯ del artifact y pulsa «Publish» — luego prueba de nuevo.";

/* =========================================================
   Constantes de dominio
========================================================= */
const MEASUREMENT_BASE_FIELDS = [
  { key: "cuello", label: "Cuello" }, { key: "hombros", label: "Hombros" }, { key: "pecho", label: "Pecho" },
  { key: "brazoIzq", label: "Brazo izq." }, { key: "brazoDer", label: "Brazo der." }, { key: "antebrazo", label: "Antebrazo" },
  { key: "cintura", label: "Cintura" }, { key: "cadera", label: "Cadera" },
  { key: "musloIzq", label: "Muslo izq." }, { key: "musloDer", label: "Muslo der." },
  { key: "gemeloIzq", label: "Gemelo izq." }, { key: "gemeloDer", label: "Gemelo der." },
];
const STREAK_BADGES = [
  { min: 3, icon: "🔥", label: "Racha de 3" }, { min: 5, icon: "🥉", label: "Racha de 5" },
  { min: 7, icon: "🥈", label: "Racha de 7" }, { min: 10, icon: "🥇", label: "Racha de 10" }, { min: 15, icon: "🏆", label: "Racha de 15" },
];
const MOODS = [{ key: "bien", icon: "🙂" }, { key: "normal", icon: "😐" }, { key: "mal", icon: "🙁" }];
const WEEKDAYS = [{ key: "MO", label: "L" }, { key: "TU", label: "M" }, { key: "WE", label: "X" }, { key: "TH", label: "J" }, { key: "FR", label: "V" }, { key: "SA", label: "S" }, { key: "SU", label: "D" }];
const GOAL_CATEGORIES = ["Personal", "Estudios", "Trabajo", "Fitness", "Dinero", "Relaciones", "Otros"];
const RECUR_FREQS = [{ key: "diaria", label: "Diaria" }, { key: "semanal", label: "Semanal" }, { key: "quincenal", label: "Quincenal" }, { key: "mensual", label: "Mensual" }, { key: "trimestral", label: "Trimestral" }, { key: "semestral", label: "Semestral" }, { key: "anual", label: "Anual" }];
const EMOJI_PALETTE = ["💼", "💻", "🎁", "🍔", "🏠", "🚗", "🎮", "📺", "💊", "🏋️", "🐶", "📦", "📚", "✈️", "🛒", "🎓", "👗", "💅", "🎵", "⚡", "🧾", "🍿", "☕", "🍺", "🚕", "🧴", "🎸", "💰", "📱", "🎬"];
const COLOR_SWATCHES = ["#B7D8CC", "#F0C05A", "#FF2E92", "#3DDC84", "#FF5C7A", "#FF8A3D", "#8FA3FF", "#8B5CF6", "#25F4EE", "#FE2C55", "#4FD1C5", "#8B93A6"];
const DEFAULT_CATEGORIAS = [
  { id: "nomina", nombre: "Nómina", emoji: "💼", color: DOMAIN.ingreso, tipo: "ingreso" },
  { id: "freelance", nombre: "Freelance", emoji: "💻", color: DOMAIN.ingreso, tipo: "ingreso" },
  { id: "regalo-in", nombre: "Regalo", emoji: "🎁", color: DOMAIN.ingreso, tipo: "ingreso" },
  { id: "comida", nombre: "Comida", emoji: "🍔", color: "#F0C05A", tipo: "gasto" },
  { id: "vivienda", nombre: "Vivienda", emoji: "🏠", color: "#8FA3FF", tipo: "gasto" },
  { id: "transporte", nombre: "Transporte", emoji: "🚗", color: "#5FD9C4", tipo: "gasto" },
  { id: "ocio", nombre: "Ocio", emoji: "🎮", color: "#FF8A3D", tipo: "gasto" },
  { id: "suscripciones", nombre: "Suscripciones", emoji: "📺", color: "#FF2E92", tipo: "gasto" },
  { id: "salud", nombre: "Salud", emoji: "💊", color: "#3DDC84", tipo: "gasto" },
  { id: "fitness", nombre: "Fitness", emoji: "🏋️", color: "#B7D8CC", tipo: "gasto" },
  { id: "mascotas", nombre: "Animales", emoji: "🐶", color: "#F0C05A", tipo: "gasto" },
  { id: "otros", nombre: "Otros", emoji: "📦", color: "#8B93A6", tipo: "gasto" },
];
const DASHBOARD_WIDGET_DEFS = [
  { key: "resumenHoy", label: "Resumen del día" }, { key: "tareas", label: "Tareas pendientes" },
  { key: "habitos", label: "Hábitos de hoy" }, { key: "objetivos", label: "Objetivos activos" },
  { key: "peso", label: "Progreso de peso" }, { key: "proximos", label: "Próximos eventos" },
  { key: "diario", label: "Acceso al diario" }, { key: "calendario", label: "Agenda de hoy" },
];
const DEFAULT_WIDGETS = DASHBOARD_WIDGET_DEFS.reduce((acc, w) => ({ ...acc, [w.key]: true }), {});
const DEFAULT_SETTINGS = { themeId: "dark", accent: null, accent2: null, bg: null, textSize: "md", animation: "normal", widgets: DEFAULT_WIDGETS };

function projectRecurringOccurrences(item, fromISO, toISOStr) {
  const out = [];
  const step = { diaria: (d) => addDays(d, 1), semanal: (d) => addDays(d, 7), quincenal: (d) => addDays(d, 14), mensual: (d) => addMonths(d, 1), trimestral: (d) => addMonths(d, 3), semestral: (d) => addMonths(d, 6), anual: (d) => addYears(d, 1) }[item.frecuencia] || ((d) => addMonths(d, 1));
  let cur = item.fechaInicio;
  const hardEnd = item.fechaFin && item.fechaFin < toISOStr ? item.fechaFin : toISOStr;
  let guard = 0;
  while (cur <= hardEnd && guard < 400) {
    if (cur >= fromISO) out.push(cur);
    cur = step(cur);
    guard++;
  }
  return out;
}

/* =========================================================
   Componentes genéricos
========================================================= */
function Card({ children, style, className = "" }) {
  const C = useContext(ThemeContext);
  return (
    <div className={className} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.radius, boxShadow: C.shadow, ...style }}>
      {children}
    </div>
  );
}

function Field({ label, children, hint }) {
  const C = useContext(ThemeContext);
  return (
    <label className="font-body" style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: C.textMuted }}>
      {label}
      {children}
      {hint && <span style={{ fontSize: 10.5, color: C.textFaint }}>{hint}</span>}
    </label>
  );
}

function useInputStyle(accent) {
  const C = useContext(ThemeContext);
  return { background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: Math.min(C.radius, 10), padding: "9px 11px", color: C.text, fontSize: 14, width: "100%", "--focus-color": accent || C.accent };
}

function TextInput(props) {
  const style = useInputStyle(props.accent);
  const { accent, ...rest } = props;
  return <input style={style} {...rest} />;
}
function TextArea(props) {
  const style = useInputStyle(props.accent);
  const { accent, ...rest } = props;
  return <textarea style={{ ...style, resize: "vertical", fontFamily: "inherit" }} {...rest} />;
}
function SelectInput(props) {
  const style = useInputStyle(props.accent);
  const { accent, children, ...rest } = props;
  return <select style={style} {...rest}>{children}</select>;
}
function NumInput({ value, onChange, placeholder, step = "0.1", accent }) {
  const style = useInputStyle(accent);
  return <input type="number" step={step} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={style} />;
}

function StatCard({ icon: Icon, renderIcon, label, value, sub, accent, accentSoft }) {
  const C = useContext(ThemeContext);
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
      <div className="font-mono" style={{ fontSize: 25, fontWeight: 600, color: C.text, lineHeight: 1 }}>{value}</div>
      {sub && <div className="font-body" style={{ fontSize: 11.5, color: C.textFaint, marginTop: 6 }}>{sub}</div>}
    </Card>
  );
}

function EmptyState({ text, accent }) {
  const C = useContext(ThemeContext);
  return (
    <div className="font-body" style={{ padding: "36px 20px", textAlign: "center", color: C.textFaint, fontSize: 13 }}>
      <div style={{ width: 6, height: 6, borderRadius: 3, background: accent, margin: "0 auto 10px" }} />
      {text}
    </div>
  );
}

function SectionTitle({ text, accent, right }) {
  const C = useContext(ThemeContext);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 3, height: 14, borderRadius: 2, background: accent }} />
        <span className="font-display" style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{text}</span>
      </div>
      {right}
    </div>
  );
}

function ProgressBar({ value, accent, height = 8 }) {
  const C = useContext(ThemeContext);
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div style={{ height, borderRadius: height, background: C.borderSoft, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: accent, borderRadius: height, transition: "width 0.3s ease" }} />
    </div>
  );
}

function ChartTooltip({ active, payload, label, unit = "" }) {
  const C = useContext(ThemeContext);
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="font-mono" style={{ background: C.surfaceRaised, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 11px", fontSize: 12 }}>
      <div style={{ color: C.textFaint, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (<div key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === "number" ? p.value.toLocaleString("es-ES") : p.value}{unit}</div>))}
    </div>
  );
}

function BrandBadge({ platform, size = 16 }) {
  const C = useContext(ThemeContext);
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

function EmojiPick({ value, onChange, accent }) {
  const C = useContext(ThemeContext);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 92, overflowY: "auto" }} className="bitacora-scroll">
      {EMOJI_PALETTE.map((e) => (
        <button key={e} type="button" onClick={() => onChange(e)} style={{ fontSize: 16, width: 30, height: 30, borderRadius: 8, border: `1px solid ${value === e ? accent : C.border}`, background: value === e ? `${accent}22` : C.bgSoft }}>{e}</button>
      ))}
    </div>
  );
}

function ColorPick({ value, onChange }) {
  const C = useContext(ThemeContext);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
      {COLOR_SWATCHES.map((c) => (
        <button key={c} type="button" onClick={() => onChange(c)} style={{ width: 24, height: 24, borderRadius: "50%", background: c, border: value === c ? `2px solid ${C.text}` : `2px solid transparent`, boxShadow: value === c ? `0 0 0 2px ${C.bg}` : "none" }} />
      ))}
    </div>
  );
}

function TagChips({ tags, accent }) {
  if (!tags || !tags.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
      {tags.map((t) => (<span key={t} className="font-mono" style={{ fontSize: 10.5, padding: "2px 7px", borderRadius: 10, background: `${accent}18`, color: accent }}>#{t}</span>))}
    </div>
  );
}
function parseTags(raw) { return (raw || "").split(",").map((t) => t.trim().toLowerCase().replace(/\s+/g, "-")).filter(Boolean); }

/* =========================================================
   Gráficas
========================================================= */
function buildDirectionalSegments(data, upColor, downColor, key = "v") {
  const segments = [];
  for (let i = 0; i < data.length - 1; i++) {
    const up = data[i + 1][key] >= data[i][key];
    const seg = data.map((d, idx) => ((idx === i || idx === i + 1) ? d[key] : null));
    segments.push({ id: `seg${i}`, color: up ? upColor : downColor, values: seg });
  }
  return segments;
}

function DirectionalLineChart({ data, unit = "" }) {
  const C = useContext(ThemeContext);
  const segments = useMemo(() => buildDirectionalSegments(data, DOMAIN.ingreso, DOMAIN.gasto), [data]);
  const chartData = data.map((d, i) => { const row = { x: d.x }; segments.forEach((s) => { row[s.id] = s.values[i]; }); return row; });
  return (
    <div style={{ height: 190 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={C.borderSoft} vertical={false} />
          <XAxis dataKey="x" tick={{ fill: C.textFaint, fontSize: 11 }} axisLine={{ stroke: C.border }} tickLine={false} minTickGap={30} />
          <YAxis tick={{ fill: C.textFaint, fontSize: 11 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
          <Tooltip content={<ChartTooltip unit={unit} />} />
          {segments.map((s) => (<Line key={s.id} type="linear" dataKey={s.id} stroke={s.color} strokeWidth={3} dot={false} connectNulls={false} isAnimationActive={false} legendType="none" name={unit.trim() || "valor"} />))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniLineChart({ data, color, unit }) {
  const C = useContext(ThemeContext);
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
  return financeEntries.map((e) => { running += e.tipo === "ingreso" ? Number(e.monto) : -Number(e.monto); return { x: fmtDate(e.date), v: Math.round(running * 100) / 100 }; });
}

function computeStreak(entries, goal) {
  if (goal == null || goal === "" || entries.length < 2) return { current: 0, best: 0 };
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  let current = 0, best = 0, prevDist = Math.abs(sorted[0].peso - Number(goal));
  for (let i = 1; i < sorted.length; i++) {
    const dist = Math.abs(sorted[i].peso - Number(goal));
    if (dist < prevDist) { current++; best = Math.max(best, current); } else if (dist > prevDist) { current = 0; }
    prevDist = dist;
  }
  return { current, best };
}

function habitStreak(completados) {
  const set = new Set(completados || []);
  let streak = 0, cursor = new Date();
  if (!set.has(toISO(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (set.has(toISO(cursor))) { streak++; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}

function MultiFollowerChart({ entries }) {
  const C = useContext(ThemeContext);
  const dates = [...new Set(entries.map((e) => e.date))].sort();
  const data = dates.map((date) => {
    const row = { x: fmtDate(date) };
    [{ key: "Instagram" }, { key: "TikTok" }].forEach((p) => {
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
          <Line type="monotone" dataKey="Instagram" stroke={IG.purple} strokeWidth={2.75} dot={{ r: 3, fill: IG.purple, strokeWidth: 0 }} connectNulls style={{ filter: `drop-shadow(0 0 5px ${IG.purple}) drop-shadow(0 0 10px ${IG.purple}66)` }} />
          <Line type="monotone" dataKey="TikTok" stroke={TT.pink} strokeWidth={2.75} dot={{ r: 3, fill: TT.pink, strokeWidth: 0 }} connectNulls style={{ filter: `drop-shadow(0 0 4px ${TT.cyan}) drop-shadow(0 0 5px ${TT.pink})` }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
