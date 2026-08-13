import React, { useState, useEffect, useMemo, useCallback, useRef, createContext, useContext } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine
} from "recharts";
import {
  LayoutDashboard, Scale, Wallet, Users, Plus, Trash2, X, Search,
  ArrowUpRight, ArrowDownRight, ChevronDown, ChevronLeft, ChevronRight, Instagram, Music2,
  Target, Flame, ListChecks, BookOpen, CheckCircle2, Circle, Bell, Calendar as CalendarIcon,
  Settings, Menu, Repeat, TrendingUp
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
  { key: "peso", label: "Progreso de peso" }, { key: "patrimonio", label: "Patrimonio" }, { key: "proximos", label: "Próximos eventos" },
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

/* Rango de un periodo (semanal/mensual/anual) que contiene refIso */
function periodRange(periodo, refIso) {
  if (periodo === "semanal") { const s = startOfWeekMon(refIso); return { inicio: s, fin: addDays(s, 6) }; }
  if (periodo === "mensual") { const s = startOfMonth(refIso); return { inicio: s, fin: addDays(addMonths(s, 1), -1) }; }
  if (periodo === "anual") { const y = parseISO(refIso).getFullYear(); return { inicio: `${y}-01-01`, fin: `${y}-12-31` }; }
  return null;
}
function periodLabel(periodo, refIso) {
  const r = periodRange(periodo, refIso);
  if (!r) return "";
  if (periodo === "anual") return String(parseISO(refIso).getFullYear());
  return `${dayNum(r.inicio)}–${dayNum(r.fin)} ${monthLabel(periodo === "mensual" ? r.inicio : r.fin).split(" ")[0]}`;
}
const GOAL_PERIODS = [{ key: "personalizado", label: "Personalizado" }, { key: "semanal", label: "Semanal" }, { key: "mensual", label: "Mensual" }, { key: "anual", label: "Anual" }];
const REFLEXION_TYPES = [{ key: "diario", label: "Diario" }, { key: "semanal", label: "Reflexión semanal" }, { key: "mensual", label: "Reflexión mensual" }, { key: "anual", label: "Reflexión anual" }];
const NETWORTH_PERIODS = [{ key: "1m", label: "1M", days: 30 }, { key: "3m", label: "3M", days: 90 }, { key: "6m", label: "6M", days: 180 }, { key: "1a", label: "1A", days: 365 }, { key: "todo", label: "Todo", days: null }];
function networthDelta(sorted, periodDays) {
  if (!sorted.length) return null;
  const last = sorted[sorted.length - 1];
  let baseline;
  if (periodDays == null) baseline = sorted[0];
  else { const cutoff = addDays(todayISO(), -periodDays); baseline = [...sorted].reverse().find((e) => e.date <= cutoff) || sorted[0]; }
  return { last, baseline, delta: last.monto - baseline.monto };
}

/* =========================================================
   Mensajes — banco de frases de motivación/ánimo que aparecen
   según rachas, ahorro, gasto o seguidores. El tono se mantiene
   siempre amable: nunca es una regañina real, como mucho un
   empujoncito con humor — y con el peso, nunca hay juicio.
========================================================= */
function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
function pick(arr, seed) { return arr[hashStr(String(seed)) % arr.length]; }

const MESSAGES = {
  ahorroPositivo: [
    "¡Enhorabuena! Has ahorrado {amount}", "Vas guardando bien: {amount} ahorrados", "{amount} a tu favor — sigue así",
    "Buen ritmo: llevas {amount} ahorrados", "Tu yo del futuro te lo agradece: {amount} guardados", "{amount} ahorrados. Nada mal",
    "Ahorro en verde: {amount}", "Cuentas sanas — {amount} de colchón", "Vas sumando: {amount} guardados hasta ahora",
    "{amount} más cerca de tus metas", "Bien jugado — {amount} ahorrados", "Sigue así: {amount} a buen recaudo",
    "{amount} ahorrados, y contando", "Pequeños pasos: {amount} guardados ya",
  ],
  ahorroNegativo: [
    "Has gastado {amount} más de lo que has ingresado", "Este periodo sale en rojo: {amount} de más gastado",
    "{amount} por encima de lo ingresado — nada que un ajuste no arregle", "Vas gastando más de lo que entra: {amount} de diferencia",
    "Balance con {amount} de más gastado. La próxima semana lo enderezas", "Cuentas en números rojos: {amount}",
    "Se ha ido {amount} más de lo previsto", "{amount} de gasto extra — vale la pena mirar las categorías",
    "Has gastado {amount}. Sin dramas, se ajusta", "{amount} gastados de más este periodo",
  ],
  streakHabito: [
    "🔥 {n} días seguidos con {name}. Imparable", "Racha de {n} en {name} — ni se te nota el esfuerzo",
    "{n} días sin fallar a {name}. Eso es constancia", "Llevas {n} días con {name}. Sigue así",
    "{name}: {n} días de racha. Que no se rompa", "{n} días seguidos — {name} ya es un hábito de verdad",
    "Constancia con {name}: {n} días y contando", "{n} días con {name}. Se nota el hábito",
  ],
  streakRota: [
    "Se rompió la racha de {name} — hoy es un buen día para empezar otra", "{name} se quedó hoy sin marcar. Mañana toca retomar",
    "Una racha menos, pero el hábito sigue en pie: {name}", "No pasa nada por un día — {name} te espera mañana",
  ],
  seguidoresSubiendo: [
    "+{n} seguidores en {platform}", "{platform} sigue creciendo: +{n}", "Buen ritmo en {platform}: +{n} seguidores",
    "+{n} en {platform} — el contenido está funcionando", "Crecimiento constante en {platform}: +{n}",
  ],
  seguidoresBajando: [
    "{platform} bajó {n} seguidores — pasa, no es lineal", "-{n} en {platform}. Un mes flojo no define la tendencia",
    "{platform}: -{n}. Sigue publicando, se recupera",
  ],
};
function fillMsg(tpl, vars) { return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v), tpl); }

/* =========================================================
   Componentes genéricos
========================================================= */
function Card({ children, style, className = "", onClick }) {
  const C = useContext(ThemeContext);
  return (
    <div
      className={className + (onClick ? " press" : "")}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.radius, boxShadow: C.shadow, cursor: onClick ? "pointer" : "default", textAlign: "left", ...style }}
    >
      {children}
    </div>
  );
}

function Field({ label, children, hint }) {
  const C = useContext(ThemeContext);
  return (
    <label className="font-body" style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: C.textMuted, minWidth: 0, flex: "1 1 132px", overflow: "hidden" }}>
      {label}
      {children}
      {hint && <span style={{ fontSize: 10.5, color: C.textFaint }}>{hint}</span>}
    </label>
  );
}

function staticInputStyle(C, accent) {
  return { background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: Math.min(C.radius, 10), padding: "9px 11px", color: C.text, fontSize: 14, width: "100%", minWidth: 0, maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" };
}
function useInputStyle(accent) {
  const C = useContext(ThemeContext);
  return { ...staticInputStyle(C, accent), "--focus-color": accent || C.accent };
}

function TextInput({ accent, style, ...rest }) {
  const base = useInputStyle(accent);
  return <input style={{ ...base, ...style }} {...rest} />;
}
function TextArea({ accent, style, ...rest }) {
  const base = useInputStyle(accent);
  return <textarea style={{ ...base, resize: "vertical", fontFamily: "inherit", ...style }} {...rest} />;
}
function SelectInput({ accent, style, children, ...rest }) {
  const base = useInputStyle(accent);
  return <select style={{ ...base, ...style }} {...rest}>{children}</select>;
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

function DirectionalLineChart({ data, unit = "", goalValue, goalLabel }) {
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
          {goalValue != null && <ReferenceLine y={goalValue} stroke={DOMAIN.ahorro} strokeDasharray="4 4" strokeWidth={1.5} label={{ value: goalLabel || `objetivo ${goalValue}${unit}`, position: "insideTopRight", fill: DOMAIN.ahorro, fontSize: 10 }} />}
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

function MultiFollowerChart({ entries, goals }) {
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
  const igGoal = goals?.Instagram?.objetivo;
  const ttGoal = goals?.TikTok?.objetivo;
  return (
    <div style={{ height: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={C.borderSoft} vertical={false} />
          <XAxis dataKey="x" tick={{ fill: C.textFaint, fontSize: 11 }} axisLine={{ stroke: C.border }} tickLine={false} minTickGap={30} />
          <YAxis tick={{ fill: C.textFaint, fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: C.textMuted }} />
          {igGoal != null && <ReferenceLine y={igGoal} stroke={IG.purple} strokeDasharray="4 4" strokeWidth={1.5} label={{ value: `objetivo IG ${igGoal}`, position: "insideTopRight", fill: IG.purple, fontSize: 10 }} />}
          {ttGoal != null && <ReferenceLine y={ttGoal} stroke={TT.pink} strokeDasharray="4 4" strokeWidth={1.5} label={{ value: `objetivo TT ${ttGoal}`, position: "insideBottomRight", fill: TT.pink, fontSize: 10 }} />}
          <Line type="monotone" dataKey="Instagram" stroke={IG.purple} strokeWidth={2.75} dot={{ r: 3, fill: IG.purple, strokeWidth: 0 }} connectNulls style={{ filter: `drop-shadow(0 0 5px ${IG.purple}) drop-shadow(0 0 10px ${IG.purple}66)` }} />
          <Line type="monotone" dataKey="TikTok" stroke={TT.pink} strokeWidth={2.75} dot={{ r: 3, fill: TT.pink, strokeWidth: 0 }} connectNulls style={{ filter: `drop-shadow(0 0 4px ${TT.cyan}) drop-shadow(0 0 5px ${TT.pink})` }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* =========================================================
   CALENDARIO
========================================================= */
function dayBundle(iso, habitItems, journalEntries, recurringMap, financeEntries) {
  const wd = weekdayKey(iso);
  const tareas = habitItems.filter((h) => h.tipo === "tarea" && h.fecha === iso).sort((a, b) => (a.hora || "99:99").localeCompare(b.hora || "99:99"));
  const habitosProgramados = habitItems.filter((h) => h.tipo === "habito" && (!h.diasSemana || !h.diasSemana.length || h.diasSemana.includes(wd)));
  const journal = journalEntries.find((e) => e.date === iso) || null;
  const recurrentes = recurringMap[iso] || [];
  const financeReal = (financeEntries || []).filter((e) => e.date === iso);
  const netReal = financeReal.reduce((a, e) => a + (e.tipo === "ingreso" ? Number(e.monto) : -Number(e.monto)), 0);
  return { iso, tareas, habitosProgramados, journal, recurrentes, financeReal, netReal };
}
function dayDots(b) {
  const dots = [];
  if (b.tareas.length || b.habitosProgramados.length) dots.push(DOMAIN.habito);
  if (b.journal) dots.push(DOMAIN.diario);
  if (b.financeReal.length) dots.push(DOMAIN.ahorro);
  else if (b.recurrentes.length) dots.push(`${DOMAIN.ahorro}66`);
  return dots;
}
function LegendDot({ color, label }) {
  const C = useContext(ThemeContext);
  return (<div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: 3, background: color }} /><span className="font-body" style={{ fontSize: 10, color: C.textFaint }}>{label}</span></div>);
}

function MonthGrid({ currentDate, habitItems, journalEntries, recurringMap, financeEntries, onSelectDay }) {
  const C = useContext(ThemeContext);
  const weeks = useMemo(() => getMonthMatrix(currentDate), [currentDate]);
  const today = todayISO();
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 6 }}>
        {WEEKDAYS.map((w) => (<div key={w.key} className="font-mono" style={{ textAlign: "center", fontSize: 10.5, color: C.textFaint }}>{w.label}</div>))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 }}>
          {week.map((iso) => {
            const inMonth = isSameMonth(iso, currentDate);
            const b = dayBundle(iso, habitItems, journalEntries, recurringMap, financeEntries);
            const dots = dayDots(b);
            const isToday = iso === today;
            return (
              <button key={iso} onClick={() => onSelectDay(iso)} className="press" style={{ aspectRatio: "1", borderRadius: 10, border: isToday ? `1.5px solid ${C.accent}` : `1px solid ${inMonth ? C.borderSoft : "transparent"}`, background: isToday ? `${C.accent}18` : (inMonth ? C.bgSoft : "transparent"), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, opacity: inMonth ? 1 : 0.35, padding: 2 }}>
                <span className="font-mono" style={{ fontSize: 11.5, color: C.text }}>{dayNum(iso)}</span>
                <div style={{ display: "flex", gap: 2, height: 4 }}>{dots.map((c, i) => (<div key={i} style={{ width: 4, height: 4, borderRadius: 2, background: c }} />))}</div>
                {b.financeReal.length > 0 && <span className="font-mono" style={{ fontSize: 8, color: b.netReal >= 0 ? DOMAIN.ingreso : DOMAIN.gasto, lineHeight: 1 }}>{b.netReal >= 0 ? "+" : ""}{Math.round(b.netReal)}€</span>}
              </button>
            );
          })}
        </div>
      ))}
      <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
        <LegendDot color={DOMAIN.habito} label="Tareas/hábitos" />
        <LegendDot color={DOMAIN.diario} label="Diario" />
        <LegendDot color={DOMAIN.ahorro} label="Movimiento real" />
        <LegendDot color={`${DOMAIN.ahorro}66`} label="Previsto" />
      </div>
    </div>
  );
}

function YearGrid({ currentDate, habitItems, journalEntries, recurringMap, financeEntries, onSelectDay, onSelectMonth }) {
  const C = useContext(ThemeContext);
  const year = parseISO(currentDate).getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}-01`);
  const today = todayISO();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
      {months.map((m) => {
        const weeks = getMonthMatrix(m);
        return (
          <div key={m} style={{ border: `1px solid ${C.borderSoft}`, borderRadius: 12, padding: 8 }}>
            <button onClick={() => onSelectMonth(m)} className="font-display press" style={{ background: "none", border: "none", color: C.text, fontSize: 11.5, fontWeight: 600, marginBottom: 6, display: "block", padding: 0 }}>{monthLabel(m).split(" ")[0]}</button>
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 2 }}>
                {week.map((iso) => {
                  const inMonth = isSameMonth(iso, m);
                  if (!inMonth) return <div key={iso} />;
                  const b = dayBundle(iso, habitItems, journalEntries, recurringMap, financeEntries);
                  const dots = dayDots(b);
                  const isToday = iso === today;
                  return (<button key={iso} onClick={() => onSelectDay(iso)} title={iso} style={{ aspectRatio: "1", minHeight: 12, borderRadius: 3, background: isToday ? C.accent : (dots.length ? `${dots[0]}55` : "transparent"), border: "none", padding: 0 }} />);
                })}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function WeekStrip({ currentDate, selectedDay, setSelectedDay, habitItems, journalEntries, recurringMap, financeEntries }) {
  const C = useContext(ThemeContext);
  const start = startOfWeekMon(currentDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const today = todayISO();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
      {days.map((iso) => {
        const b = dayBundle(iso, habitItems, journalEntries, recurringMap, financeEntries);
        const dots = dayDots(b);
        const active = iso === selectedDay;
        const isToday = iso === today;
        return (
          <button key={iso} onClick={() => setSelectedDay(iso)} className="press" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "8px 0", borderRadius: 12, border: active ? `1.5px solid ${C.accent}` : `1px solid ${C.borderSoft}`, background: active ? `${C.accent}18` : C.bgSoft }}>
            <span className="font-mono" style={{ fontSize: 9.5, color: C.textFaint }}>{WEEKDAYS[(parseISO(iso).getDay() + 6) % 7].label}</span>
            <span className="font-mono" style={{ fontSize: 13, color: isToday ? C.accent : C.text, fontWeight: isToday ? 700 : 500 }}>{dayNum(iso)}</span>
            <div style={{ display: "flex", gap: 2, height: 4 }}>{dots.map((c, i) => (<div key={i} style={{ width: 4, height: 4, borderRadius: 2, background: c }} />))}</div>
            <span className="font-mono" style={{ fontSize: 8.5, color: b.financeReal.length ? (b.netReal >= 0 ? DOMAIN.ingreso : DOMAIN.gasto) : "transparent", lineHeight: 1, minHeight: 10 }}>{b.financeReal.length ? `${b.netReal >= 0 ? "+" : ""}${Math.round(b.netReal)}€` : "·"}</span>
          </button>
        );
      })}
    </div>
  );
}

function DayAgenda({ iso, habitItems, journalEntries, recurringMap, financeEntries, catById, onToggleHabit, onToggleTarea, onGoDiario }) {
  const C = useContext(ThemeContext);
  const b = dayBundle(iso, habitItems, journalEntries, recurringMap, financeEntries);
  const today = todayISO();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="font-display" style={{ fontSize: 15, color: C.text, fontWeight: 600 }}>{fmtDateLong(iso)}</div>
        {b.financeReal.length > 0 && <span className="font-mono" style={{ fontSize: 13, color: b.netReal >= 0 ? DOMAIN.ingreso : DOMAIN.gasto }}>{b.netReal >= 0 ? "+" : ""}{fmtMoney(b.netReal)}</span>}
      </div>

      {b.financeReal.length > 0 && (
        <div>
          <div className="font-body" style={{ fontSize: 11, color: C.textFaint, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>Movimientos</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {b.financeReal.map((e) => { const c = catById ? catById(e.categoriaId) : { emoji: "💶", nombre: e.tipo }; return (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 10, background: C.bgSoft, border: `1px solid ${C.borderSoft}` }}>
                <span style={{ fontSize: 15 }}>{c.emoji}</span>
                <span className="font-body" style={{ fontSize: 13, color: C.text, flex: 1 }}>{c.nombre}{e.nota ? ` · ${e.nota}` : ""}</span>
                <span className="font-mono" style={{ fontSize: 12, color: e.tipo === "ingreso" ? DOMAIN.ingreso : DOMAIN.gasto }}>{e.tipo === "ingreso" ? "+" : "-"}{fmtMoney(Number(e.monto)).replace("-", "")}</span>
              </div>
            ); })}
          </div>
        </div>
      )}

      {b.tareas.length > 0 && (
        <div>
          <div className="font-body" style={{ fontSize: 11, color: C.textFaint, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>Tareas</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {b.tareas.map((t) => (
              <button key={t.id} onClick={() => onToggleTarea(t.id, !t.done)} className="press" style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 10, background: C.bgSoft, border: `1px solid ${C.borderSoft}`, textAlign: "left" }}>
                {t.done ? <CheckCircle2 size={17} color={DOMAIN.habito} /> : <Circle size={17} color={C.textFaint} />}
                <span className="font-body" style={{ fontSize: 13, color: t.done ? C.textFaint : C.text, textDecoration: t.done ? "line-through" : "none", flex: 1 }}>{t.nombre}</span>
                {t.hora && <span className="font-mono" style={{ fontSize: 11, color: C.textFaint }}>{t.hora}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {b.habitosProgramados.length > 0 && (
        <div>
          <div className="font-body" style={{ fontSize: 11, color: C.textFaint, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>Hábitos</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {b.habitosProgramados.map((h) => {
              const done = h.completados?.includes(iso);
              return (
                <button key={h.id} onClick={() => onToggleHabit(h.id, iso, !done)} disabled={iso > today} className="press" style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 10, background: C.bgSoft, border: `1px solid ${C.borderSoft}`, textAlign: "left", opacity: iso > today ? 0.5 : 1 }}>
                  {done ? <CheckCircle2 size={17} color={DOMAIN.habito} /> : <Circle size={17} color={C.textFaint} />}
                  <span className="font-body" style={{ fontSize: 13, color: C.text, flex: 1 }}>{h.nombre}</span>
                  {h.hora && <span className="font-mono" style={{ fontSize: 11, color: C.textFaint }}>{h.hora}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {b.recurrentes.length > 0 && (
        <div>
          <div className="font-body" style={{ fontSize: 11, color: C.textFaint, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>Previstos</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {b.recurrentes.map((r) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 10, background: C.bgSoft, border: `1px solid ${C.borderSoft}` }}>
                <span style={{ fontSize: 15 }}>{r.emoji}</span>
                <span className="font-body" style={{ fontSize: 13, color: C.text, flex: 1 }}>{r.nombre}</span>
                <span className="font-mono" style={{ fontSize: 12, color: r.tipo === "ingreso" ? DOMAIN.ingreso : DOMAIN.gasto }}>{r.tipo === "ingreso" ? "+" : "-"}{fmtMoney(Number(r.monto)).replace("-", "")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="font-body" style={{ fontSize: 11, color: C.textFaint, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>Diario</div>
        {b.journal ? (
          <div style={{ padding: "10px 12px", borderRadius: 10, background: C.bgSoft, border: `1px solid ${C.borderSoft}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              {b.journal.animo && <span>{MOODS.find((m) => m.key === b.journal.animo)?.icon}</span>}
              {b.journal.titulo && <span className="font-display" style={{ fontSize: 12.5, color: C.text, fontWeight: 600 }}>{b.journal.titulo}</span>}
            </div>
            <p className="font-body" style={{ fontSize: 12.5, color: C.textMuted, margin: 0, whiteSpace: "pre-wrap" }}>{b.journal.texto.length > 160 ? b.journal.texto.slice(0, 160) + "…" : b.journal.texto}</p>
          </div>
        ) : (
          <button onClick={onGoDiario} className="font-body press" style={{ fontSize: 12.5, color: DOMAIN.diario, background: "none", border: `1px dashed ${DOMAIN.diario}55`, borderRadius: 10, padding: "9px 12px", width: "100%", textAlign: "left" }}>+ Escribir en el diario de este día</button>
        )}
      </div>

      {!b.tareas.length && !b.habitosProgramados.length && !b.recurrentes.length && !b.journal && !b.financeReal.length && (<EmptyState text="Nada registrado este día." accent={C.textFaint} />)}
    </div>
  );
}

function CalendarView({ habitItems, journalEntries, recurringExpenses, financeEntries, cats, onUpdateHabit, onGoDiario }) {
  const C = useContext(ThemeContext);
  const [viewMode, setViewMode] = useState("month");
  const [currentDate, setCurrentDate] = useState(todayISO());
  const [selectedDay, setSelectedDay] = useState(todayISO());
  const catById = (id) => (cats || []).find((c) => c.id === id) || { nombre: "Otros", emoji: "📦" };

  const rangeStart = viewMode === "year" ? `${parseISO(currentDate).getFullYear()}-01-01` : viewMode === "month" ? getMonthMatrix(currentDate)[0][0] : viewMode === "week" ? startOfWeekMon(currentDate) : currentDate;
  const rangeEnd = viewMode === "year" ? `${parseISO(currentDate).getFullYear()}-12-31` : viewMode === "month" ? getMonthMatrix(currentDate)[5][6] : viewMode === "week" ? addDays(startOfWeekMon(currentDate), 6) : currentDate;

  const recurringMap = useMemo(() => {
    const map = {};
    recurringExpenses.forEach((item) => { projectRecurringOccurrences(item, rangeStart, rangeEnd).filter((iso) => !(item.pagos || []).includes(iso)).forEach((iso) => { (map[iso] = map[iso] || []).push(item); }); });
    return map;
  }, [recurringExpenses, rangeStart, rangeEnd]);

  const nav = (dir) => {
    if (viewMode === "day") setCurrentDate((d) => addDays(d, dir));
    else if (viewMode === "week") setCurrentDate((d) => addDays(d, dir * 7));
    else if (viewMode === "month") setCurrentDate((d) => addMonths(d, dir));
    else setCurrentDate((d) => addYears(d, dir));
  };
  const goToday = () => { setCurrentDate(todayISO()); setSelectedDay(todayISO()); };
  const selectDay = (iso) => { setSelectedDay(iso); setCurrentDate(iso); setViewMode("day"); };
  const toggleHabit = (id, iso, val) => { const item = habitItems.find((h) => h.id === id); const list = item?.completados || []; onUpdateHabit(id, { completados: val ? [...list, iso] : list.filter((d) => d !== iso) }); };
  const toggleTarea = (id, val) => onUpdateHabit(id, { done: val });

  let heading = "";
  if (viewMode === "year") heading = String(parseISO(currentDate).getFullYear());
  else if (viewMode === "month") heading = monthLabel(currentDate);
  else if (viewMode === "week") { const s = startOfWeekMon(currentDate); heading = `${dayNum(s)}–${dayNum(addDays(s, 6))} ${monthLabel(s).split(" ")[0]}`; }
  else heading = fmtDateLong(currentDate);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={() => nav(-1)} className="press" style={{ background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 8, padding: 6, color: C.text }}><ChevronLeft size={16} /></button>
            <span className="font-display" style={{ fontSize: 14, color: C.text, fontWeight: 600, minWidth: 118, textAlign: "center" }}>{heading}</span>
            <button onClick={() => nav(1)} className="press" style={{ background: C.bgSoft, border: `1px solid ${C.border}`, borderRadius: 8, padding: 6, color: C.text }}><ChevronRight size={16} /></button>
          </div>
          <button onClick={goToday} className="font-display press" style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.accent}`, background: `${C.accent}18`, color: C.accent, fontWeight: 600 }}>Hoy</button>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[{ k: "year", l: "Año" }, { k: "month", l: "Mes" }, { k: "week", l: "Semana" }, { k: "day", l: "Día" }].map((v) => (
            <button key={v.k} onClick={() => setViewMode(v.k)} className="font-display press" style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${viewMode === v.k ? C.accent : C.border}`, background: viewMode === v.k ? `${C.accent}18` : "transparent", color: viewMode === v.k ? C.accent : C.textFaint }}>{v.l}</button>
          ))}
        </div>
      </Card>

      <Card style={{ padding: 16 }} className="tab-content-enter">
        {viewMode === "month" && <MonthGrid currentDate={currentDate} habitItems={habitItems} journalEntries={journalEntries} recurringMap={recurringMap} financeEntries={financeEntries} onSelectDay={selectDay} />}
        {viewMode === "year" && <YearGrid currentDate={currentDate} habitItems={habitItems} journalEntries={journalEntries} recurringMap={recurringMap} financeEntries={financeEntries} onSelectDay={selectDay} onSelectMonth={(m) => { setCurrentDate(m); setViewMode("month"); }} />}
        {viewMode === "week" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <WeekStrip currentDate={currentDate} selectedDay={selectedDay} setSelectedDay={setSelectedDay} habitItems={habitItems} journalEntries={journalEntries} recurringMap={recurringMap} financeEntries={financeEntries} />
            <div style={{ borderTop: `1px solid ${C.borderSoft}`, paddingTop: 14 }}>
              <DayAgenda iso={selectedDay} habitItems={habitItems} journalEntries={journalEntries} recurringMap={recurringMap} financeEntries={financeEntries} catById={catById} onToggleHabit={toggleHabit} onToggleTarea={toggleTarea} onGoDiario={() => onGoDiario(selectedDay)} />
            </div>
          </div>
        )}
        {viewMode === "day" && <DayAgenda iso={currentDate} habitItems={habitItems} journalEntries={journalEntries} recurringMap={recurringMap} financeEntries={financeEntries} catById={catById} onToggleHabit={toggleHabit} onToggleTarea={toggleTarea} onGoDiario={() => onGoDiario(currentDate)} />}
      </Card>
    </div>
  );
}

/* =========================================================
   DASHBOARD (Inicio)
========================================================= */
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

function MiniStat({ label, value, accent }) {
  const C = useContext(ThemeContext);
  return (
    <div>
      <div className="font-mono" style={{ fontSize: 20, fontWeight: 600, color: accent }}>{value}</div>
      <div className="font-body" style={{ fontSize: 11, color: C.textFaint }}>{label}</div>
    </div>
  );
}

function Dashboard({ weightEntries, financeEntries, networthEntries, habitItems, journalEntries, goals, recurringExpenses, weightGoal, widgets, setActiveTab, onGoDiario, onUpdateHabit }) {
  const C = useContext(ThemeContext);
  const today = todayISO();
  const w = widgets || DEFAULT_WIDGETS;
  const [netPeriod, setNetPeriod] = useState("3m");

  const tareasHoy = habitItems.filter((h) => h.tipo === "tarea" && !h.done && h.fecha <= today).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const habitosHoy = habitItems.filter((h) => h.tipo === "habito" && (!h.diasSemana || !h.diasSemana.length || h.diasSemana.includes(weekdayKey(today))));
  const doneHoy = habitosHoy.filter((h) => h.completados?.includes(today)).length;
  const activeGoals = [...goals].filter((g) => !g.fechaLimite || g.fechaLimite >= today).sort((a, b) => (b.progreso || 0) - (a.progreso || 0)).slice(0, 3);
  const sortedWeights = [...weightEntries].sort((a, b) => a.date.localeCompare(b.date));
  const lastWeight = sortedWeights[sortedWeights.length - 1];
  const prevWeight = sortedWeights[sortedWeights.length - 2];
  const sortedNetworth = [...(networthEntries || [])].sort((a, b) => a.date.localeCompare(b.date));
  const netPer = NETWORTH_PERIODS.find((p) => p.key === netPeriod);
  const netD = networthDelta(sortedNetworth, netPer.days);
  const lastJournal = [...journalEntries].sort((a, b) => b.date.localeCompare(a.date))[0];
  const balance = financeEntries.reduce((acc, e) => acc + (e.tipo === "ingreso" ? Number(e.monto) : -Number(e.monto)), 0);

  const upcoming = useMemo(() => {
    const list = [];
    habitItems.filter((h) => h.tipo === "tarea" && !h.done && h.fecha >= today).forEach((t) => list.push({ iso: t.fecha, label: t.nombre, kind: "tarea" }));
    recurringExpenses.forEach((r) => projectRecurringOccurrences(r, today, addDays(today, 30)).forEach((iso) => list.push({ iso, label: `${r.emoji} ${r.nombre}`, kind: "recurrente", monto: r.monto, tipo: r.tipo })));
    return list.sort((a, b) => a.iso.localeCompare(b.iso)).slice(0, 5);
  }, [habitItems, recurringExpenses, today]);

  const isEmpty = !weightEntries.length && !financeEntries.length && !habitItems.length && !journalEntries.length && !goals.length;
  const ahorroMsg = fillMsg(pick(balance >= 0 ? MESSAGES.ahorroPositivo : MESSAGES.ahorroNegativo, Math.round(balance * 10) + financeEntries.length), { amount: fmtMoney(Math.abs(balance)) });
  const stop = (fn) => (e) => { e.stopPropagation(); fn(); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {w.resumenHoy && (
        <Card style={{ padding: 20 }}>
          <div className="font-body" style={{ fontSize: 12.5, color: C.textFaint, marginBottom: 2 }}>{greeting()}</div>
          <div className="font-display" style={{ fontSize: 18, color: C.text, fontWeight: 600, marginBottom: 14 }}>{fmtDateLong(today)}</div>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <MiniStat label="Tareas" value={tareasHoy.length} accent={DOMAIN.habito} />
            <MiniStat label="Hábitos" value={`${doneHoy}/${habitosHoy.length}`} accent={DOMAIN.habito} />
            <MiniStat label="Objetivos" value={activeGoals.length} accent={DOMAIN.objetivo} />
          </div>
          {(financeEntries.length > 0) && (
            <button onClick={() => setActiveTab("finanzas")} className="press" style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", borderTop: `1px solid ${C.borderSoft}`, marginTop: 16, paddingTop: 14 }}>
              <span className="font-body" style={{ fontSize: 13.5, color: balance >= 0 ? DOMAIN.ingreso : DOMAIN.gasto, fontWeight: 600 }}>{ahorroMsg}</span>
            </button>
          )}
        </Card>
      )}

      {w.tareas && tareasHoy.length > 0 && (
        <Card style={{ padding: 18 }} onClick={() => setActiveTab("habitos")}>
          <SectionTitle text="Tareas pendientes" accent={DOMAIN.habito} right={<span className="font-body" style={{ color: C.textFaint, fontSize: 11.5 }}>ver todas</span>} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tareasHoy.slice(0, 5).map((t) => (
              <button key={t.id} onClick={stop(() => onUpdateHabit(t.id, { done: true }))} className="press" style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 10, background: C.bgSoft, border: `1px solid ${t.fecha < today ? DOMAIN.gasto : C.borderSoft}`, textAlign: "left" }}>
                <Circle size={16} color={t.fecha < today ? DOMAIN.gasto : C.textFaint} />
                <span className="font-body" style={{ fontSize: 13, color: C.text, flex: 1 }}>{t.nombre}</span>
                <span className="font-mono" style={{ fontSize: 10.5, color: C.textFaint }}>{fmtDate(t.fecha)}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {w.habitos && habitosHoy.length > 0 && (
        <Card style={{ padding: 18 }} onClick={() => setActiveTab("habitos")}>
          <SectionTitle text="Hábitos de hoy" accent={DOMAIN.habito} right={<span className="font-body" style={{ color: C.textFaint, fontSize: 11.5 }}>gestionar</span>} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {habitosHoy.map((h) => {
              const done = h.completados?.includes(today);
              return (
                <button key={h.id} onClick={stop(() => onUpdateHabit(h.id, { completados: done ? h.completados.filter((d) => d !== today) : [...(h.completados || []), today] }))} className="press" style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 10, background: C.bgSoft, border: `1px solid ${C.borderSoft}`, textAlign: "left" }}>
                  {done ? <CheckCircle2 size={16} color={DOMAIN.habito} /> : <Circle size={16} color={C.textFaint} />}
                  <span className="font-body" style={{ fontSize: 13, color: C.text, flex: 1 }}>{h.nombre}</span>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {w.objetivos && activeGoals.length > 0 && (
        <Card style={{ padding: 18 }} onClick={() => setActiveTab("objetivos")}>
          <SectionTitle text="Objetivos activos" accent={DOMAIN.objetivo} right={<span className="font-body" style={{ color: C.textFaint, fontSize: 11.5 }}>ver todos</span>} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activeGoals.map((g) => (
              <div key={g.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span className="font-body" style={{ fontSize: 13, color: C.text }}>{g.titulo}</span>
                  <span className="font-mono" style={{ fontSize: 12, color: C.textFaint }}>{g.progreso || 0}%</span>
                </div>
                <ProgressBar value={g.progreso || 0} accent={DOMAIN.objetivo} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {w.peso && lastWeight && (
        <Card style={{ padding: 18 }} onClick={() => setActiveTab("progreso")}>
          <SectionTitle text="Progreso de peso" accent={DOMAIN.cuerpo} right={<span className="font-body" style={{ color: C.textFaint, fontSize: 11.5 }}>ver más</span>} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: sortedWeights.length > 1 ? 12 : 0, flexWrap: "wrap" }}>
            <span className="font-mono" style={{ fontSize: 24, color: C.text, fontWeight: 600 }}>{lastWeight.peso} kg</span>
            {prevWeight && <span className="font-mono" style={{ fontSize: 12.5, color: lastWeight.peso <= prevWeight.peso ? DOMAIN.ingreso : DOMAIN.gasto }}>{(lastWeight.peso - prevWeight.peso) > 0 ? "+" : ""}{(lastWeight.peso - prevWeight.peso).toFixed(1)} kg</span>}
            {weightGoal != null && <span className="font-body" style={{ fontSize: 11.5, color: C.textFaint }}>objetivo {weightGoal} kg</span>}
          </div>
          {sortedWeights.length > 1 && <MiniLineChart data={sortedWeights.map((e) => ({ x: fmtDate(e.date), v: e.peso }))} color={DOMAIN.cuerpo} unit=" kg" />}
        </Card>
      )}

      {w.patrimonio && sortedNetworth.length > 0 && (
        <Card style={{ padding: 18 }} onClick={() => setActiveTab("finanzas")}>
          <SectionTitle text="Patrimonio" accent={DOMAIN.ahorro} right={
            <div onClick={stop(() => {})} style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {NETWORTH_PERIODS.map((p) => (<button key={p.key} onClick={stop(() => setNetPeriod(p.key))} className="font-mono press" style={{ padding: "3px 7px", borderRadius: 6, fontSize: 10, fontWeight: 600, border: `1px solid ${netPeriod === p.key ? DOMAIN.ahorro : C.border}`, background: netPeriod === p.key ? DOMAIN.ahorroSoft : "transparent", color: netPeriod === p.key ? DOMAIN.ahorro : C.textFaint }}>{p.label}</button>))}
            </div>
          } />
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: sortedNetworth.length > 1 ? 12 : 0, flexWrap: "wrap" }}>
            <span className="font-mono" style={{ fontSize: 24, color: C.text, fontWeight: 600 }}>{fmtMoney(sortedNetworth[sortedNetworth.length - 1].monto)}</span>
            {netD && netD.delta !== 0 && <span className="font-mono" style={{ fontSize: 12.5, color: netD.delta >= 0 ? DOMAIN.ingreso : DOMAIN.gasto }}>{netD.delta >= 0 ? "+" : ""}{fmtMoney(netD.delta)} ({netPer.label === "Todo" ? "total" : netPer.label})</span>}
          </div>
          {sortedNetworth.length > 1 && <MiniLineChart data={sortedNetworth.map((e) => ({ x: fmtDate(e.date), v: e.monto }))} color={DOMAIN.ahorro} unit="€" />}
        </Card>
      )}

      {w.proximos && upcoming.length > 0 && (
        <Card style={{ padding: 18 }} onClick={() => setActiveTab("calendario")}>
          <SectionTitle text="Próximos" accent={C.accent} right={<span className="font-body" style={{ color: C.textFaint, fontSize: 11.5 }}>calendario</span>} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {upcoming.map((u, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", borderRadius: 10, background: C.bgSoft, border: `1px solid ${C.borderSoft}` }}>
                <span className="font-mono" style={{ fontSize: 10.5, color: C.textFaint, width: 54, flexShrink: 0 }}>{fmtDate(u.iso)}</span>
                <span className="font-body" style={{ fontSize: 13, color: C.text, flex: 1 }}>{u.label}</span>
                {u.monto != null && <span className="font-mono" style={{ fontSize: 11.5, color: u.tipo === "ingreso" ? DOMAIN.ingreso : DOMAIN.gasto }}>{u.tipo === "ingreso" ? "+" : "-"}{fmtMoney(Number(u.monto)).replace("-", "")}</span>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {w.diario && (
        <Card style={{ padding: 18 }} onClick={() => (lastJournal ? setActiveTab("diario") : onGoDiario(today))}>
          <SectionTitle text="Diario" accent={DOMAIN.diario} right={<span className="font-body" style={{ color: C.textFaint, fontSize: 11.5 }}>abrir</span>} />
          {lastJournal ? (
            <div>
              <div className="font-mono" style={{ fontSize: 11, color: C.textFaint, marginBottom: 4 }}>{fmtDate(lastJournal.date)}</div>
              <p className="font-body" style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>{lastJournal.texto.length > 140 ? lastJournal.texto.slice(0, 140) + "…" : lastJournal.texto}</p>
            </div>
          ) : (
            <span className="font-body" style={{ fontSize: 12.5, color: DOMAIN.diario, display: "block", border: `1px dashed ${DOMAIN.diario}55`, borderRadius: 10, padding: "9px 12px" }}>+ Escribe tu primera entrada</span>
          )}
        </Card>
      )}

      {w.calendario && (
        <Card style={{ padding: 18 }} onClick={() => setActiveTab("calendario")}>
          <SectionTitle text="Agenda de hoy" accent={C.accent} right={<span className="font-body" style={{ color: C.textFaint, fontSize: 11.5 }}>calendario</span>} />
          {(tareasHoy.length + habitosHoy.length) === 0 ? (
            <EmptyState text="Nada agendado para hoy." accent={C.textFaint} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {tareasHoy.slice(0, 3).map((t) => (<div key={t.id} className="font-body" style={{ fontSize: 12.5, color: C.textMuted, display: "flex", alignItems: "center", gap: 7 }}><span style={{ width: 5, height: 5, borderRadius: 3, background: DOMAIN.habito, flexShrink: 0 }} />{t.nombre}{t.hora ? ` · ${t.hora}` : ""}</div>))}
              {habitosHoy.slice(0, 3).map((h) => (<div key={h.id} className="font-body" style={{ fontSize: 12.5, color: C.textMuted, display: "flex", alignItems: "center", gap: 7 }}><span style={{ width: 5, height: 5, borderRadius: 3, background: h.completados?.includes(today) ? DOMAIN.ingreso : DOMAIN.habito, flexShrink: 0 }} />{h.nombre}{h.completados?.includes(today) ? " ✓" : ""}</div>))}
              {(tareasHoy.length + habitosHoy.length) > 6 && <span className="font-mono" style={{ fontSize: 11, color: C.textFaint }}>+{tareasHoy.length + habitosHoy.length - 6} más</span>}
            </div>
          )}
        </Card>
      )}

      {isEmpty && (
        <Card style={{ padding: "44px 24px", textAlign: "center" }}>
          <p className="font-display" style={{ fontSize: 16, color: C.text, margin: "0 0 6px" }}>Tu bitácora está vacía</p>
          <p className="font-body" style={{ fontSize: 13, color: C.textFaint, margin: 0 }}>Empieza registrando algo desde el botón + o cualquier pestaña.</p>
        </Card>
      )}
    </div>
  );
}

/* =========================================================
   HÁBITOS Y TAREAS
========================================================= */
function habitCompletionRate(h, days) {
  if (h.tipo !== "habito") return 0;
  const set = new Set(h.completados || []);
  let scheduled = 0, done = 0;
  for (let i = 0; i < days; i++) {
    const iso = addDays(todayISO(), -i);
    const wd = weekdayKey(iso);
    const isScheduled = !h.diasSemana || !h.diasSemana.length || h.diasSemana.includes(wd);
    if (isScheduled) { scheduled++; if (set.has(iso)) done++; }
  }
  return scheduled ? Math.round((done / scheduled) * 100) : 0;
}

function Habitos({ items, goals, onAdd, onUpdate, onRemove }) {
  const C = useContext(ThemeContext);
  const [tipo, setTipo] = useState("habito");
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState(todayISO());
  const [hora, setHora] = useState("");
  const [prioridad, setPrioridad] = useState("media");
  const [diasSemana, setDiasSemana] = useState([]);
  const [tagsRaw, setTagsRaw] = useState("");
  const [objetivoId, setObjetivoId] = useState("");
  const [filtro, setFiltro] = useState("");

  const toggleDia = (k) => setDiasSemana((d) => (d.includes(k) ? d.filter((x) => x !== k) : [...d, k]));

  const submit = () => {
    if (!nombre.trim()) return;
    const base = { id: uid(), tipo, nombre: nombre.trim(), hora: hora || null, tags: parseTags(tagsRaw), objetivoId: objetivoId || null };
    if (tipo === "habito") onAdd({ ...base, diasSemana, completados: [] });
    else onAdd({ ...base, fecha, prioridad, done: false });
    setNombre(""); setHora(""); setTagsRaw(""); setDiasSemana([]); setObjetivoId("");
  };

  const habitosList = items.filter((i) => i.tipo === "habito").filter((h) => !filtro || h.nombre.toLowerCase().includes(filtro.toLowerCase()) || (h.tags || []).some((t) => t.includes(filtro.toLowerCase())));
  const tareasList = [...items.filter((i) => i.tipo === "tarea")].sort((a, b) => a.fecha.localeCompare(b.fecha)).filter((t) => !filtro || t.nombre.toLowerCase().includes(filtro.toLowerCase()) || (t.tags || []).some((x) => x.includes(filtro.toLowerCase())));
  const today = todayISO();
  const topStreak = items.filter((i) => i.tipo === "habito").map((h) => ({ h, streak: habitStreak(h.completados) })).filter((x) => x.streak >= 3).sort((a, b) => b.streak - a.streak)[0];
  const streakMsg = topStreak ? fillMsg(pick(MESSAGES.streakHabito, topStreak.streak + topStreak.h.nombre.length), { n: topStreak.streak, name: topStreak.h.nombre }) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card style={{ padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Bell size={15} color={DOMAIN.habito} style={{ marginTop: 2, flexShrink: 0 }} />
        <span className="font-body" style={{ fontSize: 12.5, color: C.textMuted, lineHeight: 1.5 }}>Esta bitácora no puede sonar ni avisarte fuera de aquí. Si quieres una alarma real en tu iPhone, dime qué hábito o tarea y a qué hora, y te lo creo como recordatorio nativo.</span>
      </Card>

      {streakMsg && (
        <Card style={{ padding: "12px 16px" }}>
          <span className="font-body" style={{ fontSize: 13, fontWeight: 600, color: DOMAIN.habito }}>{streakMsg}</span>
        </Card>
      )}

      <Card style={{ padding: 18 }}>
        <SectionTitle text="Nuevo" accent={DOMAIN.habito} />
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button onClick={() => setTipo("habito")} className="font-display press" style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: `1px solid ${tipo === "habito" ? DOMAIN.habito : C.border}`, background: tipo === "habito" ? DOMAIN.habitoSoft : "transparent", color: tipo === "habito" ? DOMAIN.habito : C.textFaint, fontSize: 13, fontWeight: 600 }}>Hábito</button>
          <button onClick={() => setTipo("tarea")} className="font-display press" style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: `1px solid ${tipo === "tarea" ? DOMAIN.habito : C.border}`, background: tipo === "tarea" ? DOMAIN.habitoSoft : "transparent", color: tipo === "tarea" ? DOMAIN.habito : C.textFaint, fontSize: 13, fontWeight: 600 }}>Tarea</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Field label="Nombre"><TextInput value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={tipo === "habito" ? "Beber 2L de agua" : "Llamar al médico"} accent={DOMAIN.habito} /></Field>
          {tipo === "tarea" && <Field label="Fecha"><TextInput type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} accent={DOMAIN.habito} /></Field>}
          <Field label="Hora (opcional)"><TextInput type="time" value={hora} onChange={(e) => setHora(e.target.value)} accent={DOMAIN.habito} /></Field>
          {tipo === "tarea" && (
            <Field label="Prioridad">
              <SelectInput value={prioridad} onChange={(e) => setPrioridad(e.target.value)} accent={DOMAIN.habito}>
                <option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option>
              </SelectInput>
            </Field>
          )}
          {goals.length > 0 && (
            <Field label="Objetivo (opcional)">
              <SelectInput value={objetivoId} onChange={(e) => setObjetivoId(e.target.value)} accent={DOMAIN.habito}>
                <option value="">— ninguno —</option>
                {goals.map((g) => (<option key={g.id} value={g.id}>{g.titulo}</option>))}
              </SelectInput>
            </Field>
          )}
          <Field label="Etiquetas (opcional)"><TextInput value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} placeholder="salud, mañana" accent={DOMAIN.habito} /></Field>
        </div>
        {tipo === "habito" && (
          <div style={{ marginTop: 12 }}>
            <div className="font-body" style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>Días (vacío = todos los días)</div>
            <div style={{ display: "flex", gap: 5 }}>
              {WEEKDAYS.map((d) => (<button key={d.key} type="button" onClick={() => toggleDia(d.key)} className="press" style={{ width: 32, height: 32, borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${diasSemana.includes(d.key) ? DOMAIN.habito : C.border}`, background: diasSemana.includes(d.key) ? DOMAIN.habitoSoft : C.bgSoft, color: diasSemana.includes(d.key) ? DOMAIN.habito : C.textFaint }}>{d.label}</button>))}
            </div>
          </div>
        )}
        <button onClick={submit} disabled={!nombre.trim()} className="font-display press" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "none", background: !nombre.trim() ? C.borderSoft : DOMAIN.habito, color: !nombre.trim() ? C.textFaint : "#211404", fontSize: 13.5, fontWeight: 600 }}><Plus size={15} /> Añadir</button>
      </Card>

      {items.length > 3 && (<TextInput value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Filtrar por nombre o etiqueta…" accent={DOMAIN.habito} />)}

      {habitosList.length > 0 && (
        <Card style={{ padding: 18 }}>
          <SectionTitle text="Hábitos" accent={DOMAIN.habito} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {habitosList.map((h) => {
              const done = h.completados?.includes(today);
              const streak = habitStreak(h.completados);
              const rate7 = habitCompletionRate(h, 7);
              return (
                <div key={h.id} style={{ padding: "10px 12px", borderRadius: 10, background: C.bgSoft, border: `1px solid ${C.borderSoft}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <button onClick={() => onUpdate(h.id, { completados: done ? h.completados.filter((d) => d !== today) : [...(h.completados || []), today] })} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", flex: 1, textAlign: "left" }}>
                      {done ? <CheckCircle2 size={19} color={DOMAIN.habito} /> : <Circle size={19} color={C.textFaint} />}
                      <span className="font-body" style={{ fontSize: 13.5, color: done ? C.text : C.textMuted }}>{h.nombre}{h.hora ? <span className="font-mono" style={{ color: C.textFaint, fontSize: 11.5 }}> · {h.hora}</span> : null}</span>
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {streak > 0 && <span className="font-mono" style={{ fontSize: 11.5, color: "#FF8A3D" }}>🔥{streak}</span>}
                      <button onClick={() => onRemove(h.id)} style={{ background: "none", border: "none", padding: 4, color: C.textFaint }} aria-label="Eliminar hábito"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, paddingLeft: 29, gap: 8 }}>
                    <TagChips tags={h.tags} accent={DOMAIN.habito} />
                    <span className="font-mono" style={{ fontSize: 10.5, color: C.textFaint, whiteSpace: "nowrap" }}>{rate7}% · 7d</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {tareasList.length > 0 && (
        <Card style={{ padding: 18 }}>
          <SectionTitle text="Tareas" accent={DOMAIN.habito} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tareasList.map((t) => {
              const overdue = !t.done && t.fecha < today;
              const prioColor = t.prioridad === "alta" ? DOMAIN.gasto : t.prioridad === "baja" ? C.textFaint : DOMAIN.ahorro;
              return (
                <div key={t.id} style={{ padding: "10px 12px", borderRadius: 10, background: C.bgSoft, border: `1px solid ${overdue ? DOMAIN.gasto : C.borderSoft}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <button onClick={() => onUpdate(t.id, { done: !t.done })} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", flex: 1, textAlign: "left" }}>
                      {t.done ? <CheckCircle2 size={19} color={DOMAIN.habito} /> : <Circle size={19} color={overdue ? DOMAIN.gasto : C.textFaint} />}
                      <span className="font-body" style={{ fontSize: 13.5, color: t.done ? C.textFaint : C.text, textDecoration: t.done ? "line-through" : "none" }}>{t.nombre}</span>
                      {t.prioridad && !t.done && <span style={{ width: 6, height: 6, borderRadius: 3, background: prioColor, flexShrink: 0 }} />}
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="font-mono" style={{ fontSize: 11, color: overdue ? DOMAIN.gasto : C.textFaint }}>{fmtDate(t.fecha)}{t.hora ? ` · ${t.hora}` : ""}</span>
                      <button onClick={() => onRemove(t.id)} style={{ background: "none", border: "none", padding: 4, color: C.textFaint }} aria-label="Eliminar tarea"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  {t.tags?.length > 0 && <div style={{ marginTop: 8, paddingLeft: 29 }}><TagChips tags={t.tags} accent={DOMAIN.habito} /></div>}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {!habitosList.length && !tareasList.length && <EmptyState text="Aún no has añadido hábitos ni tareas." accent={DOMAIN.habito} />}
    </div>
  );
}

/* =========================================================
   DIARIO
========================================================= */
function Diario({ entries, onAdd, onRemove, prefillDate }) {
  const C = useContext(ThemeContext);
  const [tipo, setTipo] = useState("diario");
  const [date, setDate] = useState(todayISO());
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [animo, setAnimo] = useState(null);
  const [tagsRaw, setTagsRaw] = useState("");
  const [query, setQuery] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todas");

  useEffect(() => { if (prefillDate) { setDate(prefillDate); setTipo("diario"); } }, [prefillDate]);

  const computedRange = tipo !== "diario" ? periodRange(tipo, todayISO()) : null;

  const submit = () => {
    if (!texto.trim()) return;
    const entryDate = computedRange ? computedRange.inicio : date;
    onAdd({ id: uid(), date: entryDate, periodo: tipo, titulo: titulo.trim(), texto: texto.trim(), animo, tags: parseTags(tagsRaw) });
    setTitulo(""); setTexto(""); setAnimo(null); setTagsRaw("");
  };

  const filtered = [...entries].sort((a, b) => b.date.localeCompare(a.date)).filter((e) => {
    if (filtroTipo !== "todas" && (e.periodo || "diario") !== filtroTipo) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return e.texto.toLowerCase().includes(q) || (e.titulo || "").toLowerCase().includes(q) || (e.tags || []).some((t) => t.includes(q)) || e.date.includes(q);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card style={{ padding: 18 }}>
        <SectionTitle text="Nueva entrada" accent={DOMAIN.diario} />
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {REFLEXION_TYPES.map((t) => (<button key={t.key} onClick={() => setTipo(t.key)} className="font-display press" style={{ flex: "1 0 auto", padding: "7px 10px", borderRadius: 9, fontSize: 11, fontWeight: 600, border: `1px solid ${tipo === t.key ? DOMAIN.diario : C.border}`, background: tipo === t.key ? DOMAIN.diarioSoft : "transparent", color: tipo === t.key ? DOMAIN.diario : C.textFaint }}>{t.label}</button>))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
          {tipo === "diario" ? (
            <Field label="Fecha"><TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} accent={DOMAIN.diario} /></Field>
          ) : (
            <Field label="Periodo" hint={computedRange ? `${fmtDate(computedRange.inicio)} – ${fmtDate(computedRange.fin)}` : ""}>
              <div style={{ ...staticInputStyle(C), display: "flex", alignItems: "center", color: C.textMuted }}>{periodLabel(tipo, todayISO())}</div>
            </Field>
          )}
          <Field label="Título (opcional)"><TextInput value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Un buen día" accent={DOMAIN.diario} /></Field>
          <Field label="Ánimo (opcional)">
            <div style={{ display: "flex", gap: 6 }}>
              {MOODS.map((m) => (<button key={m.key} type="button" onClick={() => setAnimo(animo === m.key ? null : m.key)} style={{ fontSize: 18, padding: "6px 10px", borderRadius: 9, border: `1px solid ${animo === m.key ? DOMAIN.diario : C.border}`, background: animo === m.key ? DOMAIN.diarioSoft : C.bgSoft }}>{m.icon}</button>))}
            </div>
          </Field>
          <Field label="Etiquetas (opcional)"><TextInput value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} placeholder="viaje, trabajo" accent={DOMAIN.diario} /></Field>
        </div>
        <Field label={tipo === "diario" ? "Cómo ha ido el día" : "Reflexión"}><TextArea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={tipo === "diario" ? "Escribe libremente…" : "¿Qué destacarías de este periodo?"} rows={4} accent={DOMAIN.diario} /></Field>
        <button onClick={submit} disabled={!texto.trim()} className="font-display press" style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "none", background: !texto.trim() ? C.borderSoft : DOMAIN.diario, color: !texto.trim() ? C.textFaint : "#0D1230", fontSize: 13.5, fontWeight: 600 }}><Plus size={15} /> Guardar entrada</button>
      </Card>

      {entries.length > 2 && (
        <>
          <div style={{ display: "flex", gap: 6, overflowX: "auto" }} className="bitacora-scroll">
            <button onClick={() => setFiltroTipo("todas")} className="font-mono press" style={{ padding: "4px 10px", borderRadius: 20, fontSize: 10.5, fontWeight: 600, whiteSpace: "nowrap", border: `1px solid ${filtroTipo === "todas" ? DOMAIN.diario : C.border}`, background: filtroTipo === "todas" ? DOMAIN.diarioSoft : "transparent", color: filtroTipo === "todas" ? DOMAIN.diario : C.textFaint }}>Todas</button>
            {REFLEXION_TYPES.map((t) => (<button key={t.key} onClick={() => setFiltroTipo(t.key)} className="font-mono press" style={{ padding: "4px 10px", borderRadius: 20, fontSize: 10.5, fontWeight: 600, whiteSpace: "nowrap", border: `1px solid ${filtroTipo === t.key ? DOMAIN.diario : C.border}`, background: filtroTipo === t.key ? DOMAIN.diarioSoft : "transparent", color: filtroTipo === t.key ? DOMAIN.diario : C.textFaint }}>{t.label}</button>))}
          </div>
          <div style={{ position: "relative" }}>
            <Search size={15} color={C.textFaint} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por texto, etiqueta o fecha…" accent={DOMAIN.diario} style={{ paddingLeft: 34 }} />
          </div>
        </>
      )}

      {filtered.length === 0 ? (
        <EmptyState text={query ? "No hay entradas que coincidan." : "Tu diario está vacío. Escribe tu primera entrada."} accent={DOMAIN.diario} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((e) => (
            <Card key={e.id} style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span className="font-mono" style={{ fontSize: 12, color: C.textFaint }}>{fmtDate(e.date)}</span>
                  {e.periodo && e.periodo !== "diario" && <span className="font-mono" style={{ fontSize: 10, padding: "1px 7px", borderRadius: 8, background: DOMAIN.diarioSoft, color: DOMAIN.diario }}>{REFLEXION_TYPES.find((t) => t.key === e.periodo)?.label}</span>}
                  {e.animo && <span style={{ fontSize: 15 }}>{MOODS.find((m) => m.key === e.animo)?.icon}</span>}
                  {e.titulo && <span className="font-display" style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{e.titulo}</span>}
                </div>
                <button onClick={() => onRemove(e.id)} style={{ background: "none", border: "none", padding: 4, color: C.textFaint, flexShrink: 0 }} aria-label="Eliminar entrada"><Trash2 size={14} /></button>
              </div>
              <p className="font-body" style={{ fontSize: 13.5, color: C.text, margin: "0 0 8px", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{e.texto}</p>
              <TagChips tags={e.tags} accent={DOMAIN.diario} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   Tabla de historial genérica
========================================================= */
function HistoryTable({ rows, onRemove, renderRow, accent, rowColor }) {
  const C = useContext(ThemeContext);
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
            <button onClick={() => onRemove(e.id)} style={{ background: "none", border: "none", padding: 6, color: C.textFaint, flexShrink: 0 }} aria-label="Eliminar registro"><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* =========================================================
   PROGRESO (peso + medidas + objetivos)
========================================================= */
function Progreso({ entries, onAdd, onRemove, weightGoal, onSaveGoal, measurementGoals, onSaveMeasurementGoal, customFields, onAddCustomField }) {
  const C = useContext(ThemeContext);
  const [date, setDate] = useState(todayISO());
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [grasa, setGrasa] = useState("");
  const [notas, setNotas] = useState("");
  const [medidas, setMedidas] = useState({});
  const [chartField, setChartField] = useState("peso");
  const [showAllMedidas, setShowAllMedidas] = useState(false);
  const [goalPeso, setGoalPeso] = useState(weightGoal?.pesoObjetivo != null ? String(weightGoal.pesoObjetivo) : "");
  const [goalFecha, setGoalFecha] = useState(weightGoal?.fechaObjetivo || "");
  const [newFieldName, setNewFieldName] = useState("");
  const [editingGoalField, setEditingGoalField] = useState(null);
  const [goalFieldVal, setGoalFieldVal] = useState("");

  const allFields = [...MEASUREMENT_BASE_FIELDS, ...customFields];

  const submit = () => {
    if (!date || !peso) return;
    const cleanMedidas = {};
    Object.entries(medidas).forEach(([k, v]) => { if (v !== "" && v != null) cleanMedidas[k] = Number(v); });
    onAdd({ id: uid(), date, peso: Number(peso), altura: altura ? Number(altura) : null, grasa: grasa ? Number(grasa) : null, notas: notas.trim(), medidas: cleanMedidas });
    setPeso(""); setGrasa(""); setNotas(""); setMedidas({});
  };

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const chartOptions = [{ key: "peso", label: "Peso (kg)" }, ...allFields.map((m) => ({ key: m.key, label: m.label + " (cm)" }))];
  const chartData = sorted.filter((e) => (chartField === "peso" ? e.peso != null : e.medidas?.[chartField] != null)).map((e) => ({ x: fmtDate(e.date), v: chartField === "peso" ? e.peso : e.medidas[chartField] }));

  const lastEntry = sorted[sorted.length - 1];
  const streak = useMemo(() => computeStreak(sorted, weightGoal?.pesoObjetivo), [sorted, weightGoal]);
  const badgesEarned = STREAK_BADGES.filter((b) => streak.best >= b.min);
  const distancia = weightGoal?.pesoObjetivo != null && lastEntry ? Math.abs(lastEntry.peso - Number(weightGoal.pesoObjetivo)) : null;
  const startWeight = sorted[0]?.peso;
  const pesoPct = (weightGoal?.pesoObjetivo != null && lastEntry && startWeight != null && startWeight !== Number(weightGoal.pesoObjetivo))
    ? Math.max(0, Math.min(100, Math.round(((startWeight - lastEntry.peso) / (startWeight - Number(weightGoal.pesoObjetivo))) * 100)))
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card style={{ padding: 18 }}>
        <SectionTitle text="Nuevo registro" accent={DOMAIN.cuerpo} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Field label="Fecha"><TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} accent={DOMAIN.cuerpo} /></Field>
          <Field label="Peso (kg)"><NumInput value={peso} onChange={setPeso} placeholder="72.5" accent={DOMAIN.cuerpo} /></Field>
          <Field label="Altura (opcional, cm)"><NumInput value={altura} onChange={setAltura} placeholder="175" step="1" accent={DOMAIN.cuerpo} /></Field>
          <Field label="Grasa % (opcional)"><NumInput value={grasa} onChange={setGrasa} placeholder="18" accent={DOMAIN.cuerpo} /></Field>
        </div>
        <button onClick={() => setShowAllMedidas((v) => !v)} className="font-body press" style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 14, background: "none", border: "none", color: C.textMuted, fontSize: 12.5 }}>
          <ChevronDown size={14} style={{ transform: showAllMedidas ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} /> Medidas corporales (opcional)
        </button>
        {showAllMedidas && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {allFields.map((f) => (<Field key={f.key} label={f.label + " (cm)"}><NumInput value={medidas[f.key] || ""} onChange={(v) => setMedidas((m) => ({ ...m, [f.key]: v }))} placeholder="—" accent={DOMAIN.cuerpo} /></Field>))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
              <TextInput value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} placeholder="Añadir medida personalizada…" accent={DOMAIN.cuerpo} />
              <button type="button" onClick={() => { if (newFieldName.trim()) { onAddCustomField(newFieldName.trim()); setNewFieldName(""); } }} className="press" style={{ flexShrink: 0, padding: "9px 12px", borderRadius: 10, border: `1px solid ${DOMAIN.cuerpo}`, background: DOMAIN.cuerpoSoft, color: DOMAIN.cuerpo, fontSize: 12.5, fontWeight: 600 }}>Añadir</button>
            </div>
          </div>
        )}
        <div style={{ marginTop: 12 }}><Field label="Notas (opcional)"><TextInput value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="—" accent={DOMAIN.cuerpo} /></Field></div>
        <button onClick={submit} disabled={!date || !peso} className="font-display press" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "none", background: (!date || !peso) ? C.borderSoft : DOMAIN.cuerpo, color: (!date || !peso) ? C.textFaint : "#12201A", fontSize: 13.5, fontWeight: 600 }}><Plus size={15} /> Guardar registro</button>
      </Card>

      <Card style={{ padding: 18 }}>
        <SectionTitle text="Objetivo de peso" accent={DOMAIN.cuerpo} />
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
          <Field label="Peso objetivo (kg)"><NumInput value={goalPeso} onChange={setGoalPeso} placeholder="68.0" accent={DOMAIN.cuerpo} /></Field>
          <Field label="Fecha objetivo (opcional)"><TextInput type="date" value={goalFecha} onChange={(e) => setGoalFecha(e.target.value)} accent={DOMAIN.cuerpo} /></Field>
          <button onClick={() => onSaveGoal(goalPeso === "" ? null : { pesoObjetivo: Number(goalPeso), fechaObjetivo: goalFecha || null })} className="font-display press" style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: `1px solid ${DOMAIN.cuerpo}`, background: DOMAIN.cuerpoSoft, color: DOMAIN.cuerpo, fontSize: 13, fontWeight: 600 }}><Target size={14} /> Fijar</button>
        </div>
        {weightGoal?.pesoObjetivo != null && (
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            {pesoPct != null && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}><span className="font-body" style={{ fontSize: 12.5, color: C.textMuted }}>Progreso hacia el objetivo</span><span className="font-mono" style={{ fontSize: 12, color: C.text }}>{pesoPct}%</span></div>
                <ProgressBar value={pesoPct} accent={DOMAIN.cuerpo} />
              </div>
            )}
            <div className="font-body" style={{ fontSize: 13, color: C.textMuted }}>
              {distancia != null ? <>Te quedan <strong className="font-mono" style={{ color: C.text }}>{distancia.toFixed(1)} kg</strong> para llegar a {weightGoal.pesoObjetivo} kg{weightGoal.fechaObjetivo ? <> antes del {fmtDate(weightGoal.fechaObjetivo)}</> : null}</> : "Registra tu peso para ver tu distancia al objetivo."}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span className="font-body" style={{ fontSize: 12, color: C.textFaint }}>Racha actual:</span>
              {streak.current > 0 ? (
                <div className="flame-pop" style={{ display: "flex", gap: 3 }}>
                  {Array.from({ length: Math.min(streak.current, 10) }).map((_, i) => (<Flame key={i} size={16} color="#FF8A3D" />))}
                  {streak.current > 10 && <span className="font-mono" style={{ color: "#FF8A3D", fontSize: 12 }}>+{streak.current - 10}</span>}
                </div>
              ) : <span className="font-mono" style={{ fontSize: 12, color: C.textFaint }}>0 — el próximo registro más cerca del objetivo empieza una racha</span>}
            </div>
            {badgesEarned.length > 0 && (<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{badgesEarned.map((b) => (<div key={b.min} title={b.label} className="font-body" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 20, background: C.surfaceRaised, border: `1px solid ${C.border}`, fontSize: 12, color: C.text }}><span style={{ fontSize: 14 }}>{b.icon}</span> {b.label}</div>))}</div>)}
          </div>
        )}
      </Card>

      <Card style={{ padding: 18 }}>
        <SectionTitle text="Objetivos de medidas" accent={DOMAIN.cuerpo} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {allFields.map((f) => {
            const lastVal = [...sorted].reverse().find((e) => e.medidas?.[f.key] != null)?.medidas?.[f.key];
            const goalVal = measurementGoals[f.key];
            const editing = editingGoalField === f.key;
            return (
              <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, background: C.bgSoft, border: `1px solid ${C.borderSoft}` }}>
                <span className="font-body" style={{ fontSize: 12.5, color: C.text, flex: 1 }}>{f.label}</span>
                <span className="font-mono" style={{ fontSize: 11.5, color: C.textFaint }}>{lastVal != null ? `${lastVal} cm` : "—"}</span>
                {editing ? (
                  <>
                    <div style={{ width: 64 }}><NumInput value={goalFieldVal} onChange={setGoalFieldVal} step="0.1" accent={DOMAIN.cuerpo} /></div>
                    <button onClick={() => { onSaveMeasurementGoal(f.key, goalFieldVal === "" ? null : Number(goalFieldVal)); setEditingGoalField(null); }} className="press" style={{ background: "none", border: "none", color: DOMAIN.cuerpo, fontSize: 11.5, fontWeight: 600 }}>OK</button>
                  </>
                ) : (
                  <button onClick={() => { setEditingGoalField(f.key); setGoalFieldVal(goalVal != null ? String(goalVal) : ""); }} className="font-mono press" style={{ background: "none", border: `1px dashed ${C.border}`, borderRadius: 6, padding: "3px 7px", color: goalVal != null ? DOMAIN.cuerpo : C.textFaint, fontSize: 11.5 }}>{goalVal != null ? `objetivo ${goalVal}` : "+ objetivo"}</button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {sorted.length > 0 && (
        <Card style={{ padding: 18 }}>
          <SectionTitle text="Evolución" accent={DOMAIN.cuerpo} right={<SelectInput value={chartField} onChange={(e) => setChartField(e.target.value)} accent={DOMAIN.cuerpo} style={{ width: "auto", padding: "5px 8px", fontSize: 12 }}>{chartOptions.map((o) => (<option key={o.key} value={o.key}>{o.label}</option>))}</SelectInput>} />
          {chartData.length > 1 ? <MiniLineChart data={chartData} color={DOMAIN.cuerpo} unit={chartField === "peso" ? " kg" : " cm"} /> : <EmptyState text="Añade al menos dos registros con este dato para ver la evolución." accent={DOMAIN.cuerpo} />}
        </Card>
      )}

      <HistoryTable accent={DOMAIN.cuerpo} rows={[...sorted].reverse()} onRemove={onRemove} renderRow={(e) => `${e.peso} kg${e.grasa != null ? ` · ${e.grasa}% grasa` : ""}${Object.keys(e.medidas || {}).length ? ` · ${Object.keys(e.medidas).length} medida(s)` : ""}${e.notas ? ` · ${e.notas}` : ""}`} />
    </div>
  );
}

/* =========================================================
   FINANZAS
========================================================= */
function Finanzas({ entries, categories, recurring, networthEntries, onAddNetworth, onRemoveNetworth, savingsGoal, onSaveSavingsGoal, onAddEntry, onRemoveEntry, onAddCategory, onRemoveCategory, onAddRecurring, onRemoveRecurring, onMarkPaid }) {
  const C = useContext(ThemeContext);
  const [sub, setSub] = useState("movimientos");
  const cats = categories.length ? categories : DEFAULT_CATEGORIAS;
  const catById = (id) => cats.find((c) => c.id === id) || { nombre: "Otros", emoji: "📦", color: C.textFaint, tipo: "gasto" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", gap: 6, overflowX: "auto" }} className="bitacora-scroll">
        {[{ k: "movimientos", l: "Movimientos" }, { k: "patrimonio", l: "Patrimonio" }, { k: "recurrentes", l: "Recurrentes" }, { k: "categorias", l: "Categorías" }].map((v) => (
          <button key={v.k} onClick={() => setSub(v.k)} className="font-display press" style={{ flex: "1 0 auto", minWidth: 90, padding: "9px 0", borderRadius: 10, fontSize: 12.5, fontWeight: 600, border: `1px solid ${sub === v.k ? DOMAIN.ahorro : C.border}`, background: sub === v.k ? DOMAIN.ahorroSoft : "transparent", color: sub === v.k ? DOMAIN.ahorro : C.textFaint }}>{v.l}</button>
        ))}
      </div>
      {sub === "movimientos" && <FinanzasMovimientos entries={entries} cats={cats} catById={catById} savingsGoal={savingsGoal} onSaveSavingsGoal={onSaveSavingsGoal} onAdd={onAddEntry} onRemove={onRemoveEntry} />}
      {sub === "patrimonio" && <FinanzasPatrimonio entries={networthEntries} onAdd={onAddNetworth} onRemove={onRemoveNetworth} />}
      {sub === "recurrentes" && <FinanzasRecurrentes recurring={recurring} cats={cats} catById={catById} onAdd={onAddRecurring} onRemove={onRemoveRecurring} onMarkPaid={onMarkPaid} />}
      {sub === "categorias" && <FinanzasCategorias cats={cats} onAdd={onAddCategory} onRemove={onRemoveCategory} />}
    </div>
  );
}

function FinanzasPatrimonio({ entries, onAdd, onRemove }) {
  const C = useContext(ThemeContext);
  const [date, setDate] = useState(todayISO());
  const [monto, setMonto] = useState("");
  const [notas, setNotas] = useState("");
  const [period, setPeriod] = useState("3m");

  const submit = () => { if (!date || monto === "") return; onAdd({ id: uid(), date, monto: Number(monto), notas: notas.trim() }); setMonto(""); setNotas(""); };

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const last = sorted[sorted.length - 1];
  const per = NETWORTH_PERIODS.find((p) => p.key === period);
  const d = networthDelta(sorted, per.days);
  const chartData = sorted.map((e) => ({ x: fmtDate(e.date), v: e.monto }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card style={{ padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Wallet size={15} color={DOMAIN.ahorro} style={{ marginTop: 2, flexShrink: 0 }} />
        <span className="font-body" style={{ fontSize: 12.5, color: C.textMuted, lineHeight: 1.5 }}>Tu patrimonio total (cuentas, inversiones, lo que quieras incluir) — distinto del ahorro de Movimientos, que solo suma lo que registras ahí. Aquí metes el número completo cuando quieras.</span>
      </Card>

      <Card style={{ padding: 18 }}>
        <SectionTitle text="Nuevo registro" accent={DOMAIN.ahorro} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Field label="Fecha"><TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} accent={DOMAIN.ahorro} /></Field>
          <Field label="Patrimonio total (€)"><NumInput value={monto} onChange={setMonto} placeholder="15000" step="50" accent={DOMAIN.ahorro} /></Field>
          <Field label="Notas (opcional)"><TextInput value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="—" accent={DOMAIN.ahorro} /></Field>
        </div>
        <button onClick={submit} disabled={!date || monto === ""} className="font-display press" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "none", background: (!date || monto === "") ? C.borderSoft : DOMAIN.ahorro, color: (!date || monto === "") ? C.textFaint : "#211803", fontSize: 13.5, fontWeight: 600 }}><Plus size={15} /> Guardar</button>
      </Card>

      {last && (
        <Card style={{ padding: 18 }}>
          <SectionTitle text="Patrimonio actual" accent={DOMAIN.ahorro} right={<div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{NETWORTH_PERIODS.map((p) => (<button key={p.key} onClick={() => setPeriod(p.key)} className="font-mono press" style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10.5, fontWeight: 600, border: `1px solid ${period === p.key ? DOMAIN.ahorro : C.border}`, background: period === p.key ? DOMAIN.ahorroSoft : "transparent", color: period === p.key ? DOMAIN.ahorro : C.textFaint }}>{p.label}</button>))}</div>} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: chartData.length > 1 ? 12 : 0, flexWrap: "wrap" }}>
            <span className="font-mono" style={{ fontSize: 26, color: C.text, fontWeight: 600 }}>{fmtMoney(last.monto)}</span>
            {d && d.delta !== 0 && <span className="font-mono" style={{ fontSize: 13, color: d.delta >= 0 ? DOMAIN.ingreso : DOMAIN.gasto }}>{d.delta >= 0 ? "+" : ""}{fmtMoney(d.delta)} ({per.label === "Todo" ? "total" : per.label})</span>}
          </div>
          {chartData.length > 1 && <MiniLineChart data={chartData} color={DOMAIN.ahorro} unit="€" />}
        </Card>
      )}

      <HistoryTable accent={DOMAIN.ahorro} rows={[...sorted].reverse()} onRemove={onRemove} renderRow={(e) => `${fmtMoney(e.monto)}${e.notas ? ` · ${e.notas}` : ""}`} />
    </div>
  );
}

function FinanzasMovimientos({ entries, cats, catById, savingsGoal, onSaveSavingsGoal, onAdd, onRemove }) {
  const C = useContext(ThemeContext);
  const [date, setDate] = useState(todayISO());
  const [tipo, setTipo] = useState("ingreso");
  const [categoriaId, setCategoriaId] = useState("");
  const [monto, setMonto] = useState("");
  const [nota, setNota] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [goalMonto, setGoalMonto] = useState(savingsGoal?.montoObjetivo != null ? String(savingsGoal.montoObjetivo) : "");
  const [goalFecha, setGoalFecha] = useState(savingsGoal?.fecha || "");

  const catsForTipo = cats.filter((c) => c.tipo === tipo);
  useEffect(() => { if (!catsForTipo.find((c) => c.id === categoriaId)) setCategoriaId(catsForTipo[0]?.id || ""); }, [tipo, cats]);

  const submit = () => {
    if (!date || !monto || !categoriaId) return;
    onAdd({ id: uid(), date, tipo, categoriaId, monto: Number(monto), nota: nota.trim(), tags: parseTags(tagsRaw) });
    setMonto(""); setNota(""); setTagsRaw("");
  };

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const totalIngresos = entries.filter((e) => e.tipo === "ingreso").reduce((a, e) => a + Number(e.monto), 0);
  const totalGastos = entries.filter((e) => e.tipo === "gasto").reduce((a, e) => a + Number(e.monto), 0);
  const balance = totalIngresos - totalGastos;
  const balanceSeries = buildBalanceSeries(sorted);
  const porCategoria = useMemo(() => {
    const map = {};
    entries.filter((e) => e.tipo === "gasto").forEach((e) => { map[e.categoriaId] = (map[e.categoriaId] || 0) + Number(e.monto); });
    return Object.entries(map).map(([id, total]) => ({ ...catById(id), total })).sort((a, b) => b.total - a.total);
  }, [entries, cats]);
  const balanceMsg = fillMsg(pick(balance >= 0 ? MESSAGES.ahorroPositivo : MESSAGES.ahorroNegativo, Math.round(balance * 100) + sorted.length), { amount: fmtMoney(Math.abs(balance)) });
  const goalPct = savingsGoal?.montoObjetivo ? Math.max(0, Math.min(100, Math.round((balance / Number(savingsGoal.montoObjetivo)) * 100))) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card style={{ padding: 18 }}>
        <SectionTitle text="Nuevo movimiento" accent={DOMAIN.ahorro} />
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button onClick={() => setTipo("ingreso")} className="font-display press" style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: `1px solid ${tipo === "ingreso" ? DOMAIN.ingreso : C.border}`, background: tipo === "ingreso" ? DOMAIN.ingresoSoft : "transparent", color: tipo === "ingreso" ? DOMAIN.ingreso : C.textFaint, fontSize: 13, fontWeight: 600 }}>↑ Ingreso</button>
          <button onClick={() => setTipo("gasto")} className="font-display press" style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: `1px solid ${tipo === "gasto" ? DOMAIN.gasto : C.border}`, background: tipo === "gasto" ? DOMAIN.gastoSoft : "transparent", color: tipo === "gasto" ? DOMAIN.gasto : C.textFaint, fontSize: 13, fontWeight: 600 }}>↓ Gasto</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Field label="Fecha"><TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} accent={DOMAIN.ahorro} /></Field>
          <Field label="Importe (€)"><NumInput value={monto} onChange={setMonto} placeholder="0.00" step="0.01" accent={DOMAIN.ahorro} /></Field>
          <Field label="Categoría"><SelectInput value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} accent={DOMAIN.ahorro}>{catsForTipo.map((c) => (<option key={c.id} value={c.id}>{c.emoji} {c.nombre}</option>))}</SelectInput></Field>
          <Field label="Nota (opcional)"><TextInput value={nota} onChange={(e) => setNota(e.target.value)} placeholder="—" accent={DOMAIN.ahorro} /></Field>
          <Field label="Etiquetas (opcional)"><TextInput value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} placeholder="viaje, necesario" accent={DOMAIN.ahorro} /></Field>
        </div>
        <button onClick={submit} disabled={!date || !monto} className="font-display press" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "none", background: (!date || !monto) ? C.borderSoft : (tipo === "ingreso" ? DOMAIN.ingreso : DOMAIN.gasto), color: (!date || !monto) ? C.textFaint : "#0B140F", fontSize: 13.5, fontWeight: 600 }}><Plus size={15} /> Guardar</button>
      </Card>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard icon={ArrowUpRight} label="Ingresos" value={fmtMoney(totalIngresos)} accent={DOMAIN.ingreso} accentSoft={DOMAIN.ingresoSoft} />
        <StatCard icon={ArrowDownRight} label="Gastos" value={fmtMoney(totalGastos)} accent={DOMAIN.gasto} accentSoft={DOMAIN.gastoSoft} />
        <StatCard icon={Wallet} label={balance >= 0 ? "Ahorro total" : "Gasto neto"} value={fmtMoney(Math.abs(balance))} sub={entries.length > 0 ? balanceMsg : null} accent={DOMAIN.ahorro} accentSoft={DOMAIN.ahorroSoft} />
      </div>

      <Card style={{ padding: 18 }}>
        <SectionTitle text="Objetivo de ahorro" accent={DOMAIN.ahorro} />
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
          <Field label="Ahorrar (€)"><NumInput value={goalMonto} onChange={setGoalMonto} placeholder="1000" step="10" accent={DOMAIN.ahorro} /></Field>
          <Field label="Fecha objetivo"><TextInput type="date" value={goalFecha} onChange={(e) => setGoalFecha(e.target.value)} accent={DOMAIN.ahorro} /></Field>
          <button onClick={() => onSaveSavingsGoal(goalMonto === "" ? null : { montoObjetivo: Number(goalMonto), fecha: goalFecha || null })} className="font-display press" style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: `1px solid ${DOMAIN.ahorro}`, background: DOMAIN.ahorroSoft, color: DOMAIN.ahorro, fontSize: 13, fontWeight: 600 }}><Target size={14} /> Fijar</button>
        </div>
        {savingsGoal?.montoObjetivo != null && (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span className="font-body" style={{ fontSize: 12.5, color: C.textMuted }}>{fmtMoney(balance)} de {fmtMoney(Number(savingsGoal.montoObjetivo))}{savingsGoal.fecha ? ` antes del ${fmtDate(savingsGoal.fecha)}` : ""}</span>
              <span className="font-mono" style={{ fontSize: 12, color: C.text }}>{goalPct}%</span>
            </div>
            <ProgressBar value={goalPct} accent={DOMAIN.ahorro} />
          </div>
        )}
      </Card>

      {sorted.length > 1 && (<Card style={{ padding: 18 }}><SectionTitle text="Ahorro acumulado en el tiempo" accent={DOMAIN.ahorro} right={<span className="font-body" style={{ fontSize: 11.5, color: C.textFaint }}><span style={{ color: DOMAIN.ingreso }}>● sube</span> &nbsp; <span style={{ color: DOMAIN.gasto }}>● baja</span></span>} /><DirectionalLineChart data={balanceSeries} unit="€" goalValue={savingsGoal?.montoObjetivo} goalLabel={savingsGoal?.montoObjetivo != null ? `objetivo ${fmtMoney(Number(savingsGoal.montoObjetivo))}` : null} /></Card>)}

      {porCategoria.length > 0 && (
        <Card style={{ padding: 18 }}>
          <SectionTitle text="Gastos por categoría" accent={DOMAIN.ahorro} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {porCategoria.map((c) => (
              <div key={c.nombre} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 15, width: 22 }}>{c.emoji}</span>
                <span className="font-body" style={{ fontSize: 12.5, color: C.text, width: 90, flexShrink: 0 }}>{c.nombre}</span>
                <div style={{ flex: 1 }}><ProgressBar value={(c.total / porCategoria[0].total) * 100} accent={c.color} height={6} /></div>
                <span className="font-mono" style={{ fontSize: 12, color: C.textFaint, width: 66, textAlign: "right", flexShrink: 0 }}>{fmtMoney(c.total)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <HistoryTable accent={DOMAIN.ahorro} rows={[...sorted].reverse()} onRemove={onRemove} renderRow={(e) => { const c = catById(e.categoriaId); return `${c.emoji} ${e.tipo === "ingreso" ? "+" : "-"}${fmtMoney(Number(e.monto)).replace("-", "")} · ${c.nombre}${e.nota ? ` · ${e.nota}` : ""}`; }} rowColor={(e) => (e.tipo === "ingreso" ? DOMAIN.ingreso : DOMAIN.gasto)} />
    </div>
  );
}

function FinanzasRecurrentes({ recurring, cats, catById, onAdd, onRemove, onMarkPaid }) {
  const C = useContext(ThemeContext);
  const [nombre, setNombre] = useState("");
  const [emoji, setEmoji] = useState("🔁");
  const [monto, setMonto] = useState("");
  const [tipo, setTipo] = useState("gasto");
  const [categoriaId, setCategoriaId] = useState("");
  const [frecuencia, setFrecuencia] = useState("mensual");
  const [fechaInicio, setFechaInicio] = useState(todayISO());
  const [fechaFin, setFechaFin] = useState("");
  const catsForTipo = cats.filter((c) => c.tipo === tipo);

  const submit = () => {
    if (!nombre.trim() || !monto) return;
    onAdd({ id: uid(), nombre: nombre.trim(), emoji, monto: Number(monto), tipo, categoriaId: categoriaId || catsForTipo[0]?.id || "", frecuencia, fechaInicio, fechaFin: fechaFin || null, pagos: [] });
    setNombre(""); setMonto(""); setFechaFin("");
  };

  const today = todayISO();
  const next90 = useMemo(() => { let sum = 0; recurring.forEach((r) => { projectRecurringOccurrences(r, today, addDays(today, 90)).forEach(() => { sum += (r.tipo === "gasto" ? -1 : 1) * Number(r.monto); }); }); return sum; }, [recurring, today]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card style={{ padding: 18 }}>
        <SectionTitle text="Nuevo recurrente" accent={DOMAIN.ahorro} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Field label="Nombre"><TextInput value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Netflix" accent={DOMAIN.ahorro} /></Field>
          <Field label="Importe (€)"><NumInput value={monto} onChange={setMonto} placeholder="15.99" step="0.01" accent={DOMAIN.ahorro} /></Field>
          <Field label="Tipo"><SelectInput value={tipo} onChange={(e) => setTipo(e.target.value)} accent={DOMAIN.ahorro}><option value="gasto">Gasto</option><option value="ingreso">Ingreso</option></SelectInput></Field>
          <Field label="Categoría"><SelectInput value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} accent={DOMAIN.ahorro}><option value="">— por defecto —</option>{catsForTipo.map((c) => (<option key={c.id} value={c.id}>{c.emoji} {c.nombre}</option>))}</SelectInput></Field>
          <Field label="Frecuencia"><SelectInput value={frecuencia} onChange={(e) => setFrecuencia(e.target.value)} accent={DOMAIN.ahorro}>{RECUR_FREQS.map((f) => (<option key={f.key} value={f.key}>{f.label}</option>))}</SelectInput></Field>
          <Field label="Empieza"><TextInput type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} accent={DOMAIN.ahorro} /></Field>
          <Field label="Termina (opcional)"><TextInput type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} accent={DOMAIN.ahorro} /></Field>
        </div>
        <div style={{ marginTop: 12 }}><Field label="Emoji"><div style={{ marginTop: 6 }}><EmojiPick value={emoji} onChange={setEmoji} accent={DOMAIN.ahorro} /></div></Field></div>
        <button onClick={submit} disabled={!nombre.trim() || !monto} className="font-display press" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "none", background: (!nombre.trim() || !monto) ? C.borderSoft : DOMAIN.ahorro, color: (!nombre.trim() || !monto) ? C.textFaint : "#211803", fontSize: 13.5, fontWeight: 600 }}><Repeat size={15} /> Crear recurrente</button>
      </Card>

      {recurring.length > 0 && <StatCard icon={TrendingUp} label="Comprometido próx. 90 días" value={fmtMoney(next90)} accent={DOMAIN.ahorro} accentSoft={DOMAIN.ahorroSoft} />}

      {recurring.length === 0 ? <EmptyState text="Aún no tienes gastos o ingresos recurrentes." accent={DOMAIN.ahorro} /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recurring.map((r) => {
            const nextOcc = projectRecurringOccurrences(r, today, addYears(today, 2)).find((iso) => !(r.pagos || []).includes(iso));
            return (
              <Card key={r.id} style={{ padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{r.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="font-body" style={{ fontSize: 13.5, color: C.text }}>{r.nombre}</div>
                    <div className="font-mono" style={{ fontSize: 11, color: C.textFaint }}>{RECUR_FREQS.find((f) => f.key === r.frecuencia)?.label} · {catById(r.categoriaId).nombre}</div>
                  </div>
                  <span className="font-mono" style={{ fontSize: 13, color: r.tipo === "ingreso" ? DOMAIN.ingreso : DOMAIN.gasto, flexShrink: 0 }}>{r.tipo === "ingreso" ? "+" : "-"}{fmtMoney(Number(r.monto)).replace("-", "")}</span>
                  <button onClick={() => onRemove(r.id)} style={{ background: "none", border: "none", padding: 4, color: C.textFaint, flexShrink: 0 }} aria-label="Eliminar recurrente"><Trash2 size={14} /></button>
                </div>
                {nextOcc && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.borderSoft}` }}>
                    <span className="font-mono" style={{ fontSize: 11.5, color: C.textFaint }}>Próximo: {fmtDate(nextOcc)}</span>
                    <button onClick={() => onMarkPaid(r, nextOcc)} className="font-body press" style={{ fontSize: 11.5, fontWeight: 600, color: DOMAIN.ahorro, background: DOMAIN.ahorroSoft, border: "none", borderRadius: 8, padding: "5px 10px" }}>Registrar ahora</button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FinanzasCategorias({ cats, onAdd, onRemove }) {
  const C = useContext(ThemeContext);
  const [nombre, setNombre] = useState("");
  const [emoji, setEmoji] = useState("🏷️");
  const [color, setColor] = useState(COLOR_SWATCHES[0]);
  const [tipo, setTipo] = useState("gasto");

  const submit = () => { if (!nombre.trim()) return; onAdd({ id: uid(), nombre: nombre.trim(), emoji, color, tipo }); setNombre(""); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card style={{ padding: 18 }}>
        <SectionTitle text="Nueva categoría" accent={DOMAIN.ahorro} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
          <Field label="Nombre"><TextInput value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Viajes" accent={DOMAIN.ahorro} /></Field>
          <Field label="Tipo"><SelectInput value={tipo} onChange={(e) => setTipo(e.target.value)} accent={DOMAIN.ahorro}><option value="gasto">Gasto</option><option value="ingreso">Ingreso</option></SelectInput></Field>
        </div>
        <Field label="Emoji"><div style={{ marginTop: 6, marginBottom: 12 }}><EmojiPick value={emoji} onChange={setEmoji} accent={DOMAIN.ahorro} /></div></Field>
        <Field label="Color"><div style={{ marginTop: 6 }}><ColorPick value={color} onChange={setColor} /></div></Field>
        <button onClick={submit} disabled={!nombre.trim()} className="font-display press" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "none", background: !nombre.trim() ? C.borderSoft : DOMAIN.ahorro, color: !nombre.trim() ? C.textFaint : "#211803", fontSize: 13.5, fontWeight: 600 }}><Plus size={15} /> Crear categoría</button>
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {cats.map((c) => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, background: C.bgSoft, border: `1px solid ${C.borderSoft}` }}>
            <span style={{ fontSize: 17 }}>{c.emoji}</span>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: c.color, flexShrink: 0 }} />
            <span className="font-body" style={{ fontSize: 13, color: C.text, flex: 1 }}>{c.nombre}</span>
            <span className="font-mono" style={{ fontSize: 10.5, color: C.textFaint }}>{c.tipo}</span>
            <button onClick={() => onRemove(c.id)} style={{ background: "none", border: "none", padding: 4, color: C.textFaint }} aria-label="Eliminar categoría"><Trash2 size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   OBJETIVOS
========================================================= */
function Objetivos({ goals, habitItems, onAdd, onUpdate, onRemove }) {
  const C = useContext(ThemeContext);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState(GOAL_CATEGORIES[0]);
  const [periodo, setPeriodo] = useState("personalizado");
  const [fechaLimite, setFechaLimite] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");

  const computedRange = periodo !== "personalizado" ? periodRange(periodo, todayISO()) : null;

  const submit = () => {
    if (!titulo.trim()) return;
    const fechaInicio = computedRange ? computedRange.inicio : todayISO();
    const limite = computedRange ? computedRange.fin : (fechaLimite || null);
    onAdd({ id: uid(), titulo: titulo.trim(), descripcion: descripcion.trim(), categoria, periodo, fechaInicio, fechaLimite: limite, progreso: 0, notas: "" });
    setTitulo(""); setDescripcion(""); setFechaLimite("");
  };

  const visibles = filtroCategoria === "todas" ? goals : goals.filter((g) => g.categoria === filtroCategoria);
  const usedCats = [...new Set(goals.map((g) => g.categoria))];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card style={{ padding: 18 }}>
        <SectionTitle text="Nuevo objetivo" accent={DOMAIN.objetivo} />
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {GOAL_PERIODS.map((p) => (<button key={p.key} onClick={() => setPeriodo(p.key)} className="font-display press" style={{ flex: "1 0 auto", padding: "7px 10px", borderRadius: 9, fontSize: 11.5, fontWeight: 600, border: `1px solid ${periodo === p.key ? DOMAIN.objetivo : C.border}`, background: periodo === p.key ? DOMAIN.objetivoSoft : "transparent", color: periodo === p.key ? DOMAIN.objetivo : C.textFaint }}>{p.label}</button>))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Field label="Título"><TextInput value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Correr una media maratón" accent={DOMAIN.objetivo} /></Field>
          <Field label="Categoría"><SelectInput value={categoria} onChange={(e) => setCategoria(e.target.value)} accent={DOMAIN.objetivo}>{GOAL_CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}</SelectInput></Field>
          {periodo === "personalizado" ? (
            <Field label="Fecha límite (opcional)"><TextInput type="date" value={fechaLimite} onChange={(e) => setFechaLimite(e.target.value)} accent={DOMAIN.objetivo} /></Field>
          ) : (
            <Field label="Periodo" hint={computedRange ? `${fmtDate(computedRange.inicio)} – ${fmtDate(computedRange.fin)}` : ""}>
              <div style={{ ...staticInputStyle(C), display: "flex", alignItems: "center", color: C.textMuted }}>{periodLabel(periodo, todayISO())}</div>
            </Field>
          )}
        </div>
        <div style={{ marginTop: 12 }}><Field label="Descripción (opcional)"><TextArea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} accent={DOMAIN.objetivo} /></Field></div>
        <button onClick={submit} disabled={!titulo.trim()} className="font-display press" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "none", background: !titulo.trim() ? C.borderSoft : DOMAIN.objetivo, color: !titulo.trim() ? C.textFaint : "#062A27", fontSize: 13.5, fontWeight: 600 }}><Plus size={15} /> Crear objetivo</button>
      </Card>

      {usedCats.length > 1 && (
        <div style={{ display: "flex", gap: 6, overflowX: "auto" }} className="bitacora-scroll">
          <button onClick={() => setFiltroCategoria("todas")} className="font-display press" style={{ padding: "6px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap", border: `1px solid ${filtroCategoria === "todas" ? DOMAIN.objetivo : C.border}`, background: filtroCategoria === "todas" ? DOMAIN.objetivoSoft : "transparent", color: filtroCategoria === "todas" ? DOMAIN.objetivo : C.textFaint }}>Todas</button>
          {usedCats.map((c) => (<button key={c} onClick={() => setFiltroCategoria(c)} className="font-display press" style={{ padding: "6px 12px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap", border: `1px solid ${filtroCategoria === c ? DOMAIN.objetivo : C.border}`, background: filtroCategoria === c ? DOMAIN.objetivoSoft : "transparent", color: filtroCategoria === c ? DOMAIN.objetivo : C.textFaint }}>{c}</button>))}
        </div>
      )}

      {visibles.length === 0 ? <EmptyState text="Aún no has creado objetivos." accent={DOMAIN.objetivo} /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {visibles.map((g) => {
            const linked = habitItems.filter((h) => h.objetivoId === g.id);
            const periodDef = GOAL_PERIODS.find((p) => p.key === g.periodo);
            return (
              <Card key={g.id} style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div>
                    <div className="font-display" style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>{g.titulo}</div>
                    <div className="font-mono" style={{ fontSize: 10.5, color: C.textFaint, marginTop: 2 }}>
                      {g.categoria}
                      {periodDef && periodDef.key !== "personalizado" && <span className="font-body" style={{ marginLeft: 6, padding: "1px 6px", borderRadius: 8, background: DOMAIN.objetivoSoft, color: DOMAIN.objetivo, fontSize: 10 }}>{periodDef.label}</span>}
                      {g.fechaLimite ? ` · antes del ${fmtDate(g.fechaLimite)}` : ""}
                    </div>
                  </div>
                  <button onClick={() => onRemove(g.id)} style={{ background: "none", border: "none", padding: 4, color: C.textFaint, flexShrink: 0 }} aria-label="Eliminar objetivo"><Trash2 size={14} /></button>
                </div>
                {g.descripcion && <p className="font-body" style={{ fontSize: 12.5, color: C.textMuted, margin: "8px 0" }}>{g.descripcion}</p>}
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}><span className="font-body" style={{ fontSize: 12, color: C.textFaint }}>Progreso</span><span className="font-mono" style={{ fontSize: 12, color: C.text }}>{g.progreso || 0}%</span></div>
                  <ProgressBar value={g.progreso || 0} accent={DOMAIN.objetivo} />
                  <input type="range" min="0" max="100" value={g.progreso || 0} onChange={(e) => onUpdate(g.id, { progreso: Number(e.target.value) })} style={{ width: "100%", marginTop: 8, accentColor: DOMAIN.objetivo }} />
                </div>
                {linked.length > 0 && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.borderSoft}` }}>
                    <div className="font-body" style={{ fontSize: 11, color: C.textFaint, marginBottom: 6 }}>Vinculado a {linked.length} hábito/tarea</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{linked.map((l) => (<span key={l.id} className="font-mono" style={{ fontSize: 10.5, padding: "3px 8px", borderRadius: 8, background: C.bgSoft, color: C.textMuted }}>{l.tipo === "habito" ? "🔁" : "✓"} {l.nombre}</span>))}</div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   REDES (manual — ver nota)
========================================================= */
function Redes({ entries, onAdd, onRemove, followerGoals, onSaveFollowerGoal }) {
  const C = useContext(ThemeContext);
  const [date, setDate] = useState(todayISO());
  const [plataforma, setPlataforma] = useState("Instagram");
  const [publicaciones, setPublicaciones] = useState("");
  const [seguidoresTotal, setSeguidoresTotal] = useState("");
  const [goalObjetivo, setGoalObjetivo] = useState("");
  const [goalFecha, setGoalFecha] = useState("");

  const submit = () => { if (!date || seguidoresTotal === "") return; onAdd({ id: uid(), date, plataforma, publicaciones: Number(publicaciones || 0), seguidoresTotal: Number(seguidoresTotal) }); setPublicaciones(""); setSeguidoresTotal(""); };

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const withDelta = sorted.map((e, i) => { const prevSame = [...sorted.slice(0, i)].reverse().find((p) => p.plataforma === e.plataforma); return { ...e, ganados: prevSame ? e.seguidoresTotal - prevSame.seguidoresTotal : null }; });
  const totalPosts = entries.reduce((a, e) => a + Number(e.publicaciones || 0), 0);
  const igLast = [...sorted].reverse().find((e) => e.plataforma === "Instagram");
  const ttLast = [...sorted].reverse().find((e) => e.plataforma === "TikTok");
  const postsChartData = sorted.map((e) => ({ x: fmtDate(e.date), publicaciones: e.publicaciones, plataforma: e.plataforma }));
  const goals = followerGoals || {};
  const currentGoal = goals[plataforma];

  const lastDelta = [...withDelta].reverse().find((e) => e.plataforma === plataforma && e.ganados != null);
  const growthMsg = lastDelta ? fillMsg(pick(lastDelta.ganados >= 0 ? MESSAGES.seguidoresSubiendo : MESSAGES.seguidoresBajando, lastDelta.ganados + plataforma.length), { n: Math.abs(lastDelta.ganados), platform: plataforma }) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card style={{ padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Bell size={15} color={DOMAIN.redes} style={{ marginTop: 2, flexShrink: 0 }} />
        <span className="font-body" style={{ fontSize: 12.5, color: C.textMuted, lineHeight: 1.5 }}>Registro manual — no hay conexión OAuth real a Instagram/TikTok aquí dentro (necesitaría un backend propio con las claves de cada plataforma). Anota tú los números y esta sección se encarga de las gráficas y el histórico.</span>
      </Card>

      <Card style={{ padding: 18 }}>
        <SectionTitle text="Nuevo registro" accent={DOMAIN.redes} />
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button onClick={() => setPlataforma("Instagram")} className="font-display press" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "8px 0", borderRadius: 10, border: `1px solid ${plataforma === "Instagram" ? IG.purple : C.border}`, background: plataforma === "Instagram" ? "rgba(139,92,246,0.14)" : "transparent", color: plataforma === "Instagram" ? IG.purple : C.textFaint, fontSize: 13, fontWeight: 600 }}><BrandBadge platform="Instagram" size={13} /> Instagram</button>
          <button onClick={() => setPlataforma("TikTok")} className="font-display press" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "8px 0", borderRadius: 10, border: `1px solid ${plataforma === "TikTok" ? TT.pink : C.border}`, background: plataforma === "TikTok" ? "rgba(254,44,85,0.12)" : "transparent", color: plataforma === "TikTok" ? TT.pink : C.textFaint, fontSize: 13, fontWeight: 600 }}><BrandBadge platform="TikTok" size={13} /> TikTok</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Field label="Fecha"><TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} accent={DOMAIN.redes} /></Field>
          <Field label="Publicaciones subidas"><NumInput value={publicaciones} onChange={setPublicaciones} placeholder="0" step="1" accent={DOMAIN.redes} /></Field>
          <Field label="Seguidores totales"><NumInput value={seguidoresTotal} onChange={setSeguidoresTotal} placeholder="1200" step="1" accent={DOMAIN.redes} /></Field>
        </div>
        <button onClick={submit} disabled={!date || seguidoresTotal === ""} className="font-display press" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "none", background: (!date || seguidoresTotal === "") ? C.borderSoft : DOMAIN.redes, color: (!date || seguidoresTotal === "") ? C.textFaint : "#210A15", fontSize: 13.5, fontWeight: 600 }}><Plus size={15} /> Guardar registro</button>
      </Card>

      {growthMsg && (
        <Card style={{ padding: "12px 16px" }}>
          <span className="font-body" style={{ fontSize: 13, fontWeight: 600, color: lastDelta.ganados >= 0 ? DOMAIN.ingreso : DOMAIN.gasto }}>{growthMsg}</span>
        </Card>
      )}

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <StatCard renderIcon={<BrandBadge platform="Instagram" size={15} />} label="Instagram" value={igLast ? igLast.seguidoresTotal.toLocaleString("es-ES") : "—"} sub={goals.Instagram?.objetivo != null ? `objetivo ${goals.Instagram.objetivo.toLocaleString("es-ES")}${goals.Instagram.fecha ? ` · ${fmtDate(goals.Instagram.fecha)}` : ""}` : null} />
        <StatCard renderIcon={<BrandBadge platform="TikTok" size={15} />} label="TikTok" value={ttLast ? ttLast.seguidoresTotal.toLocaleString("es-ES") : "—"} sub={goals.TikTok?.objetivo != null ? `objetivo ${goals.TikTok.objetivo.toLocaleString("es-ES")}${goals.TikTok.fecha ? ` · ${fmtDate(goals.TikTok.fecha)}` : ""}` : null} />
        <StatCard icon={Users} label="Publicaciones totales" value={totalPosts.toLocaleString("es-ES")} accent={DOMAIN.redes} accentSoft={DOMAIN.redesSoft} />
      </div>

      <Card style={{ padding: 18 }}>
        <SectionTitle text={`Objetivo de seguidores — ${plataforma}`} accent={DOMAIN.redes} />
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
          <Field label="Seguidores objetivo"><NumInput value={goalObjetivo} onChange={setGoalObjetivo} placeholder="5000" step="10" accent={DOMAIN.redes} /></Field>
          <Field label="Fecha objetivo"><TextInput type="date" value={goalFecha} onChange={(e) => setGoalFecha(e.target.value)} accent={DOMAIN.redes} /></Field>
          <button onClick={() => onSaveFollowerGoal(plataforma, goalObjetivo === "" ? null : { objetivo: Number(goalObjetivo), fecha: goalFecha || null })} className="font-display press" style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: `1px solid ${DOMAIN.redes}`, background: DOMAIN.redesSoft, color: DOMAIN.redes, fontSize: 13, fontWeight: 600 }}><Target size={14} /> Fijar</button>
        </div>
        {currentGoal?.objetivo != null && (() => {
          const lastForPlat = plataforma === "Instagram" ? igLast : ttLast;
          const pct = lastForPlat ? Math.max(0, Math.min(100, Math.round((lastForPlat.seguidoresTotal / currentGoal.objetivo) * 100))) : 0;
          return (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span className="font-body" style={{ fontSize: 12.5, color: C.textMuted }}>{lastForPlat ? lastForPlat.seguidoresTotal.toLocaleString("es-ES") : 0} de {currentGoal.objetivo.toLocaleString("es-ES")}{currentGoal.fecha ? ` antes del ${fmtDate(currentGoal.fecha)}` : ""}</span>
                <span className="font-mono" style={{ fontSize: 12, color: C.text }}>{pct}%</span>
              </div>
              <ProgressBar value={pct} accent={DOMAIN.redes} />
            </div>
          );
        })()}
      </Card>

      {sorted.length > 1 && <Card style={{ padding: 18 }}><SectionTitle text="Seguidores por plataforma" accent={DOMAIN.redes} /><MultiFollowerChart entries={sorted} goals={goals} /></Card>}

      {postsChartData.length > 1 && (
        <Card style={{ padding: 18 }}>
          <SectionTitle text="Publicaciones por registro" accent={DOMAIN.redes} />
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={postsChartData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke={C.borderSoft} vertical={false} />
                <XAxis dataKey="x" tick={{ fill: C.textFaint, fontSize: 11 }} axisLine={{ stroke: C.border }} tickLine={false} minTickGap={30} />
                <YAxis tick={{ fill: C.textFaint, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="publicaciones" name="Publicaciones" radius={[4, 4, 0, 0]}>{postsChartData.map((d, i) => (<Cell key={i} fill={d.plataforma === "Instagram" ? IG.purple : TT.pink} />))}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <HistoryTable accent={DOMAIN.redes} rows={[...withDelta].reverse()} onRemove={onRemove} renderRow={(e) => `${e.plataforma} · ${e.seguidoresTotal.toLocaleString("es-ES")} seguidores${e.ganados != null ? ` (${e.ganados >= 0 ? "+" : ""}${e.ganados})` : ""} · ${e.publicaciones} publicación(es)`} rowColor={(e) => (e.plataforma === "Instagram" ? IG.purple : TT.pink)} />
    </div>
  );
}

/* =========================================================
   AJUSTES
========================================================= */
function Ajustes({ settings, onUpdateSettings }) {
  const C = useContext(ThemeContext);
  const set = (patch) => onUpdateSettings({ ...settings, ...patch });
  const toggleWidget = (key) => onUpdateSettings({ ...settings, widgets: { ...settings.widgets, [key]: !settings.widgets[key] } });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card style={{ padding: 18 }}>
        <SectionTitle text="Tema" accent={C.accent} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {THEME_LIST.map((t) => (
            <button key={t.id} onClick={() => set({ themeId: t.id })} className="press" style={{ borderRadius: 12, border: settings.themeId === t.id ? `2px solid ${t.accent}` : `1px solid ${C.border}`, overflow: "hidden", background: t.surface, padding: 0, textAlign: "left" }}>
              <div style={{ height: 42, background: t.bg, display: "flex", alignItems: "center", gap: 5, padding: "0 10px" }}><div style={{ width: 10, height: 10, borderRadius: 5, background: t.accent }} /><div style={{ width: 10, height: 10, borderRadius: 5, background: t.accent2 }} /></div>
              <div className="font-display" style={{ padding: "8px 10px", fontSize: 12, fontWeight: 600, color: t.text }}>{t.label}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card style={{ padding: 18 }}>
        <SectionTitle text="Personalización" accent={C.accent} />
        <div className="font-body" style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>Color de acento</div>
        <ColorPick value={settings.accent} onChange={(c) => set({ accent: c })} />
        <div className="font-body" style={{ fontSize: 12, color: C.textMuted, margin: "16px 0 8px" }}>Color secundario</div>
        <ColorPick value={settings.accent2} onChange={(c) => set({ accent2: c })} />
        {(settings.accent || settings.accent2) && <button onClick={() => set({ accent: null, accent2: null })} className="font-body press" style={{ marginTop: 12, fontSize: 11.5, color: C.textFaint, background: "none", border: "none" }}>Restablecer colores del tema</button>}
      </Card>

      <Card style={{ padding: 18 }}>
        <SectionTitle text="Texto y movimiento" accent={C.accent} />
        <div className="font-body" style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>Tamaño del texto</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>{[{ k: "sm", l: "Pequeño" }, { k: "md", l: "Medio" }, { k: "lg", l: "Grande" }].map((s) => (<button key={s.k} onClick={() => set({ textSize: s.k })} className="font-display press" style={{ flex: 1, padding: "8px 0", borderRadius: 10, fontSize: 12, fontWeight: 600, border: `1px solid ${settings.textSize === s.k ? C.accent : C.border}`, background: settings.textSize === s.k ? `${C.accent}18` : "transparent", color: settings.textSize === s.k ? C.accent : C.textFaint }}>{s.l}</button>))}</div>
        <div className="font-body" style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>Animaciones</div>
        <div style={{ display: "flex", gap: 8 }}>{[{ k: "none", l: "Ninguna" }, { k: "subtle", l: "Sutil" }, { k: "normal", l: "Normal" }].map((s) => (<button key={s.k} onClick={() => set({ animation: s.k })} className="font-display press" style={{ flex: 1, padding: "8px 0", borderRadius: 10, fontSize: 12, fontWeight: 600, border: `1px solid ${settings.animation === s.k ? C.accent : C.border}`, background: settings.animation === s.k ? `${C.accent}18` : "transparent", color: settings.animation === s.k ? C.accent : C.textFaint }}>{s.l}</button>))}</div>
      </Card>

      <Card style={{ padding: 18 }}>
        <SectionTitle text="Widgets del inicio" accent={C.accent} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {DASHBOARD_WIDGET_DEFS.map((wd) => (<button key={wd.key} onClick={() => toggleWidget(wd.key)} className="press" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: 10, background: C.bgSoft, border: `1px solid ${C.borderSoft}` }}><span className="font-body" style={{ fontSize: 13, color: C.text }}>{wd.label}</span>{settings.widgets[wd.key] ? <CheckCircle2 size={18} color={C.accent} /> : <Circle size={18} color={C.textFaint} />}</button>))}
        </div>
      </Card>

      <Card style={{ padding: "14px 16px" }}><div className="font-body" style={{ fontSize: 11.5, color: C.textFaint, lineHeight: 1.6 }}>Cambiar de tema o de ajustes nunca borra tus datos — son cosas totalmente separadas.</div></Card>
    </div>
  );
}

/* =========================================================
   BÚSQUEDA GLOBAL
========================================================= */
function SearchOverlay({ onClose, journalEntries, habitItems, goals, financeEntries, weightEntries, cats, setActiveTab }) {
  const C = useContext(ThemeContext);
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const results = useMemo(() => {
    if (!query) return [];
    const out = [];
    journalEntries.forEach((e) => { if (e.texto.toLowerCase().includes(query) || (e.titulo || "").toLowerCase().includes(query) || (e.tags || []).some((t) => t.includes(query))) out.push({ kind: "Diario", label: e.titulo || e.texto.slice(0, 40), date: e.date, tab: "diario", accent: DOMAIN.diario }); });
    habitItems.forEach((h) => { if (h.nombre.toLowerCase().includes(query) || (h.tags || []).some((t) => t.includes(query))) out.push({ kind: h.tipo === "habito" ? "Hábito" : "Tarea", label: h.nombre, date: h.fecha || null, tab: "habitos", accent: DOMAIN.habito }); });
    goals.forEach((g) => { if (g.titulo.toLowerCase().includes(query) || (g.descripcion || "").toLowerCase().includes(query)) out.push({ kind: "Objetivo", label: g.titulo, date: null, tab: "objetivos", accent: DOMAIN.objetivo }); });
    financeEntries.forEach((f) => { const cat = cats.find((c) => c.id === f.categoriaId); if ((f.nota || "").toLowerCase().includes(query) || (cat?.nombre || "").toLowerCase().includes(query) || (f.tags || []).some((t) => t.includes(query))) out.push({ kind: "Finanzas", label: `${cat?.emoji || ""} ${cat?.nombre || "Movimiento"} · ${fmtMoney(Number(f.monto))}`, date: f.date, tab: "finanzas", accent: DOMAIN.ahorro }); });
    weightEntries.forEach((wt) => { if ((wt.notas || "").toLowerCase().includes(query)) out.push({ kind: "Progreso", label: wt.notas, date: wt.date, tab: "progreso", accent: DOMAIN.cuerpo }); });
    return out.slice(0, 40);
  }, [query, journalEntries, habitItems, goals, financeEntries, weightEntries, cats]);

  return (
    <div style={{ position: "fixed", inset: 0, background: C.bg, zIndex: 100, display: "flex", flexDirection: "column" }} className="sheet-enter">
      <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", gap: 10 }}>
        <Search size={17} color={C.textFaint} />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar en toda la bitácora…" className="font-body" style={{ flex: 1, background: "none", border: "none", color: C.text, fontSize: 15 }} />
        <button onClick={onClose} style={{ background: "none", border: "none", color: C.textFaint }}><X size={20} /></button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }} className="bitacora-scroll">
        {!query ? (<div className="font-body" style={{ fontSize: 13, color: C.textFaint, textAlign: "center", marginTop: 40 }}>Busca en diario, hábitos, tareas, objetivos, finanzas y progreso.</div>)
          : results.length === 0 ? (<div className="font-body" style={{ fontSize: 13, color: C.textFaint, textAlign: "center", marginTop: 40 }}>Sin resultados para "{q}".</div>)
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {results.map((r, i) => (
                  <button key={i} onClick={() => { setActiveTab(r.tab); onClose(); }} className="press" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, textAlign: "left" }}>
                    <span style={{ width: 6, height: 6, borderRadius: 3, background: r.accent, flexShrink: 0 }} />
                    <span className="font-mono" style={{ fontSize: 10, color: C.textFaint, width: 52, flexShrink: 0 }}>{r.kind}</span>
                    <span className="font-body" style={{ fontSize: 13, color: C.text, flex: 1 }}>{r.label}</span>
                    {r.date && <span className="font-mono" style={{ fontSize: 10.5, color: C.textFaint }}>{fmtDate(r.date)}</span>}
                  </button>
                ))}
              </div>
            )}
      </div>
    </div>
  );
}

/* =========================================================
   Cabecera, navegación inferior, "Más" y botón +
========================================================= */
function Header({ onSearchClick }) {
  const C = useContext(ThemeContext);
  return (
    <div style={{ position: "relative" }}>
      <div aria-hidden style={{ position: "absolute", top: -30, left: -18, right: -18, height: 150, pointerEvents: "none", background: "radial-gradient(ellipse 55% 100% at 15% 0%, rgba(139,92,246,0.14), transparent 60%), radial-gradient(ellipse 55% 100% at 85% 0%, rgba(240,192,90,0.12), transparent 60%), radial-gradient(ellipse 60% 100% at 50% 20%, rgba(183,216,204,0.09), transparent 65%)", filter: "blur(6px)" }} />
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="font-display" style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#B7D8CC,#F0C05A 55%,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0A0C11", fontWeight: 700, fontSize: 17, flexShrink: 0 }}>B</div>
          <h1 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0, letterSpacing: -0.3 }}>Bitácora</h1>
        </div>
        <button onClick={onSearchClick} className="press" style={{ width: 36, height: 36, borderRadius: 10, background: C.bgSoft, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.textMuted, flexShrink: 0 }}><Search size={16} /></button>
      </div>
    </div>
  );
}

const BOTTOM_TABS = [
  { id: "inicio", label: "Inicio", icon: LayoutDashboard },
  { id: "calendario", label: "Calendario", icon: CalendarIcon },
  { id: "diario", label: "Diario", icon: BookOpen },
  { id: "habitos", label: "Hábitos", icon: ListChecks },
  { id: "progreso", label: "Progreso", icon: Scale },
];
const MORE_TABS = [
  { id: "objetivos", label: "Objetivos", icon: Target },
  { id: "finanzas", label: "Finanzas", icon: Wallet },
  { id: "redes", label: "Redes", icon: Users },
  { id: "ajustes", label: "Ajustes", icon: Settings },
];

function BottomNav({ activeTab, setActiveTab, onMoreClick }) {
  const C = useContext(ThemeContext);
  const moreActive = MORE_TABS.some((t) => t.id === activeTab);
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, background: C.surface, borderTop: `1px solid ${C.border}`, paddingBottom: "env(safe-area-inset-bottom)", zIndex: 40 }}>
      <div style={{ maxWidth: 880, margin: "0 auto", display: "flex" }}>
        {BOTTOM_TABS.map((t) => {
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className="press" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "9px 0 8px", background: "none", border: "none", color: active ? C.accent : C.textFaint }}>
              <t.icon size={20} />
              <span className="font-body" style={{ fontSize: 9.5, fontWeight: active ? 600 : 500 }}>{t.label}</span>
            </button>
          );
        })}
        <button onClick={onMoreClick} className="press" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "9px 0 8px", background: "none", border: "none", color: moreActive ? C.accent : C.textFaint }}>
          <Menu size={20} />
          <span className="font-body" style={{ fontSize: 9.5, fontWeight: moreActive ? 600 : 500 }}>Más</span>
        </button>
      </div>
    </div>
  );
}

function MorePanel({ activeTab, setActiveTab, onClose }) {
  const C = useContext(ThemeContext);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90, display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="sheet-enter" style={{ background: C.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, width: "100%", maxWidth: 880, margin: "0 auto", padding: "10px 16px calc(16px + env(safe-area-inset-bottom))", border: `1px solid ${C.border}`, borderBottom: "none" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: "6px auto 14px" }} />
        {MORE_TABS.map((t) => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); onClose(); }} className="press" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 8px", background: "none", border: "none", borderBottom: `1px solid ${C.borderSoft}`, color: activeTab === t.id ? C.accent : C.text }}>
            <t.icon size={19} />
            <span className="font-body" style={{ fontSize: 14.5 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const FAB_SHORTCUTS = [
  { tab: "habitos", label: "Tarea o hábito", icon: ListChecks, accent: DOMAIN.habito },
  { tab: "diario", label: "Entrada de diario", icon: BookOpen, accent: DOMAIN.diario },
  { tab: "progreso", label: "Peso o medida", icon: Scale, accent: DOMAIN.cuerpo },
  { tab: "finanzas", label: "Gasto o ingreso", icon: Wallet, accent: DOMAIN.ahorro },
  { tab: "objetivos", label: "Objetivo", icon: Target, accent: DOMAIN.objetivo },
  { tab: "redes", label: "Registro de redes", icon: Users, accent: DOMAIN.redes },
];

function FAB({ setActiveTab }) {
  const C = useContext(ThemeContext);
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && <div style={{ position: "fixed", inset: 0, zIndex: 45 }} onClick={() => setOpen(false)} />}
      <div style={{ position: "fixed", right: 16, bottom: "calc(74px + env(safe-area-inset-bottom))", zIndex: 50, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
        {open && (
          <div className="sheet-enter" style={{ background: C.surfaceRaised, border: `1px solid ${C.border}`, borderRadius: 14, padding: 8, display: "flex", flexDirection: "column", gap: 2, boxShadow: "0 10px 30px rgba(0,0,0,0.35)", minWidth: 208 }}>
            {FAB_SHORTCUTS.map((s, i) => (
              <button key={i} onClick={() => { setActiveTab(s.tab); setOpen(false); }} className="press" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 9, background: "none", border: "none", color: C.text, textAlign: "left" }}>
                <s.icon size={16} color={s.accent} />
                <span className="font-body" style={{ fontSize: 13 }}>{s.label}</span>
              </button>
            ))}
          </div>
        )}
        <button onClick={() => setOpen((v) => !v)} className="press" style={{ width: 52, height: 52, borderRadius: 26, background: C.accent, border: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px rgba(0,0,0,0.3)", color: C.bg }}>
          <Plus size={24} style={{ transform: open ? "rotate(45deg)" : "none", transition: "transform 0.2s" }} />
        </button>
      </div>
    </>
  );
}

/* =========================================================
   APP
========================================================= */
export default function App() {
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState("inicio");
  const [weightEntries, setWeightEntries] = useState([]);
  const [financeEntries, setFinanceEntries] = useState([]);
  const [socialEntries, setSocialEntries] = useState([]);
  const [habitItems, setHabitItems] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [goals, setGoals] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [financeCategories, setFinanceCategories] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [weightGoal, setWeightGoal] = useState(null);
  const [measurementGoals, setMeasurementGoals] = useState({});
  const [networthEntries, setNetworthEntries] = useState([]);
  const [savingsGoal, setSavingsGoalState] = useState(null);
  const [followerGoals, setFollowerGoalsState] = useState({});
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS, widgets: { ...DEFAULT_WIDGETS } });
  const [saveError, setSaveError] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [diaryPrefill, setDiaryPrefill] = useState(null);
  const storageOkRef = useRef(false);

  useEffect(() => {
    (async () => {
      const ok = await waitForStorage();
      storageOkRef.current = ok;
      if (!ok) { setSaveError("El almacenamiento no está disponible en este momento. Tus datos no se guardarán entre sesiones."); setReady(true); return; }
      try {
        const keys = ["weight-entries", "finance-entries", "social-entries", "habit-items", "journal-entries", "goals", "recurring-expenses", "finance-categories", "custom-measurement-fields", "weight-goal", "measurement-goals", "settings", "networth-entries", "savings-goal", "follower-goals"];
        const results = await Promise.allSettled(keys.map((k) => window.storage.get(k, false)));
        const val = (i) => (results[i].status === "fulfilled" && results[i].value) ? JSON.parse(results[i].value.value) : undefined;
        if (val(0) !== undefined) setWeightEntries(val(0));
        if (val(1) !== undefined) setFinanceEntries(val(1));
        if (val(2) !== undefined) setSocialEntries(val(2));
        if (val(3) !== undefined) setHabitItems(val(3));
        if (val(4) !== undefined) setJournalEntries(val(4));
        if (val(5) !== undefined) setGoals(val(5));
        if (val(6) !== undefined) setRecurringExpenses(val(6));
        if (val(7) !== undefined) setFinanceCategories(val(7));
        if (val(8) !== undefined) setCustomFields(val(8));
        if (val(9) !== undefined) setWeightGoal(val(9));
        if (val(10) !== undefined) setMeasurementGoals(val(10));
        if (val(11) !== undefined) { const s = val(11); setSettings({ ...DEFAULT_SETTINGS, ...s, widgets: { ...DEFAULT_WIDGETS, ...(s.widgets || {}) } }); }
        if (val(12) !== undefined) setNetworthEntries(val(12));
        if (val(13) !== undefined) setSavingsGoalState(val(13));
        if (val(14) !== undefined) setFollowerGoalsState(val(14));
      } catch (e) {
        // primer uso — todavía sin datos guardados
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback(async (key, data) => {
    if (!storageOkRef.current) { const ok = await waitForStorage(10); storageOkRef.current = ok; if (!ok) { setSaveError(PUBLISH_HINT); return; } }
    try {
      const res = await window.storage.set(key, JSON.stringify(data), false);
      if (!res) setSaveError(PUBLISH_HINT); else setSaveError("");
    } catch (e) { setSaveError(PUBLISH_HINT); }
  }, []);

  const addWeight = (entry) => { const next = [...weightEntries, entry].sort((a, b) => a.date.localeCompare(b.date)); setWeightEntries(next); persist("weight-entries", next); };
  const removeWeight = (id) => { const next = weightEntries.filter((e) => e.id !== id); setWeightEntries(next); persist("weight-entries", next); };
  const saveWeightGoal = (val) => { setWeightGoal(val); persist("weight-goal", val); };
  const saveMeasurementGoal = (key, val) => { const next = { ...measurementGoals }; if (val == null) delete next[key]; else next[key] = val; setMeasurementGoals(next); persist("measurement-goals", next); };
  const addCustomField = (label) => { const key = "c_" + uid(); const next = [...customFields, { key, label }]; setCustomFields(next); persist("custom-measurement-fields", next); };

  const addNetworth = (entry) => { const next = [...networthEntries, entry].sort((a, b) => a.date.localeCompare(b.date)); setNetworthEntries(next); persist("networth-entries", next); };
  const removeNetworth = (id) => { const next = networthEntries.filter((e) => e.id !== id); setNetworthEntries(next); persist("networth-entries", next); };
  const saveSavingsGoal = (val) => { setSavingsGoalState(val); persist("savings-goal", val); };
  const saveFollowerGoal = (plataforma, val) => { const next = { ...followerGoals, [plataforma]: val }; setFollowerGoalsState(next); persist("follower-goals", next); };

  const addFinance = (entry) => { const next = [...financeEntries, entry].sort((a, b) => a.date.localeCompare(b.date)); setFinanceEntries(next); persist("finance-entries", next); };
  const removeFinance = (id) => { const next = financeEntries.filter((e) => e.id !== id); setFinanceEntries(next); persist("finance-entries", next); };
  const addCategory = (c) => { const base = financeCategories.length ? financeCategories : DEFAULT_CATEGORIAS; const next = [...base, c]; setFinanceCategories(next); persist("finance-categories", next); };
  const removeCategory = (id) => { const base = financeCategories.length ? financeCategories : DEFAULT_CATEGORIAS; const next = base.filter((c) => c.id !== id); setFinanceCategories(next); persist("finance-categories", next); };
  const addRecurring = (r) => { const next = [...recurringExpenses, r]; setRecurringExpenses(next); persist("recurring-expenses", next); };
  const removeRecurring = (id) => { const next = recurringExpenses.filter((r) => r.id !== id); setRecurringExpenses(next); persist("recurring-expenses", next); };
  const markRecurringPaid = (item, iso) => {
    const nextRecurring = recurringExpenses.map((r) => (r.id === item.id ? { ...r, pagos: [...(r.pagos || []), iso] } : r));
    setRecurringExpenses(nextRecurring); persist("recurring-expenses", nextRecurring);
    const entry = { id: uid(), date: iso, tipo: item.tipo, categoriaId: item.categoriaId, monto: Number(item.monto), nota: `${item.nombre} (recurrente)`, tags: [] };
    const nextFinance = [...financeEntries, entry].sort((a, b) => a.date.localeCompare(b.date));
    setFinanceEntries(nextFinance); persist("finance-entries", nextFinance);
  };

  const addSocial = (entry) => { const next = [...socialEntries, entry].sort((a, b) => a.date.localeCompare(b.date)); setSocialEntries(next); persist("social-entries", next); };
  const removeSocial = (id) => { const next = socialEntries.filter((e) => e.id !== id); setSocialEntries(next); persist("social-entries", next); };

  const addHabitItem = (item) => { const next = [...habitItems, item]; setHabitItems(next); persist("habit-items", next); };
  const updateHabitItem = (id, patch) => { const next = habitItems.map((h) => (h.id === id ? { ...h, ...patch } : h)); setHabitItems(next); persist("habit-items", next); };
  const removeHabitItem = (id) => { const next = habitItems.filter((h) => h.id !== id); setHabitItems(next); persist("habit-items", next); };

  const addJournal = (entry) => { const next = [...journalEntries, entry].sort((a, b) => a.date.localeCompare(b.date)); setJournalEntries(next); persist("journal-entries", next); };
  const removeJournal = (id) => { const next = journalEntries.filter((e) => e.id !== id); setJournalEntries(next); persist("journal-entries", next); };

  const addGoal = (g) => { const next = [...goals, g]; setGoals(next); persist("goals", next); };
  const updateGoal = (id, patch) => { const next = goals.map((g) => (g.id === id ? { ...g, ...patch } : g)); setGoals(next); persist("goals", next); };
  const removeGoal = (id) => { const next = goals.filter((g) => g.id !== id); setGoals(next); persist("goals", next); };

  const updateSettings = (next) => { setSettings(next); persist("settings", next); };
  const goDiario = (iso) => { setDiaryPrefill(iso); setActiveTab("diario"); };

  const tokens = useMemo(() => getTokens(settings.themeId, { accent: settings.accent, accent2: settings.accent2, bg: settings.bg }), [settings.themeId, settings.accent, settings.accent2, settings.bg]);
  const cats = financeCategories.length ? financeCategories : DEFAULT_CATEGORIAS;

  if (!ready) {
    return (
      <div style={{ background: THEMES.dark.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{FONTS}</style>
        <div className="font-mono" style={{ color: THEMES.dark.textFaint, fontSize: 13 }}>cargando bitácora…</div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={tokens}>
      <div
        className={"font-body" + (settings.animation === "none" ? " no-motion" : "")}
        style={{ background: tokens.bg, minHeight: "100vh", zoom: String(TEXT_SIZES[settings.textSize] || 1), "--font-display": tokens.fontDisplay, "--font-body": tokens.fontBody }}
      >
        <style>{FONTS}</style>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "24px 16px 110px" }}>
          <Header onSearchClick={() => setSearchOpen(true)} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14 }}>
            <span style={{ width: 4, height: 4, borderRadius: 2, background: tokens.textFaint, flexShrink: 0 }} />
            <span className="font-body" style={{ fontSize: 11, color: tokens.textFaint, lineHeight: 1.4 }}>Para que tus datos se guarden entre visitas, publica esta bitácora la primera vez (menú ⋯ → «Publish»).</span>
          </div>
          {saveError && (<div className="font-body" style={{ marginTop: 14, padding: "10px 14px", background: "rgba(255,92,122,0.1)", border: `1px solid ${DOMAIN.danger}`, borderRadius: 10, color: DOMAIN.danger, fontSize: 12.5, lineHeight: 1.5 }}>{saveError}</div>)}

          <div key={activeTab} className="tab-content-enter" style={{ marginTop: 20 }}>
            {activeTab === "inicio" && <Dashboard weightEntries={weightEntries} financeEntries={financeEntries} networthEntries={networthEntries} habitItems={habitItems} journalEntries={journalEntries} goals={goals} recurringExpenses={recurringExpenses} weightGoal={weightGoal?.pesoObjetivo} widgets={settings.widgets} setActiveTab={setActiveTab} onGoDiario={goDiario} onUpdateHabit={updateHabitItem} />}
            {activeTab === "calendario" && <CalendarView habitItems={habitItems} journalEntries={journalEntries} recurringExpenses={recurringExpenses} financeEntries={financeEntries} cats={cats} onUpdateHabit={updateHabitItem} onGoDiario={goDiario} />}
            {activeTab === "diario" && <Diario entries={journalEntries} onAdd={addJournal} onRemove={removeJournal} prefillDate={diaryPrefill} />}
            {activeTab === "habitos" && <Habitos items={habitItems} goals={goals} onAdd={addHabitItem} onUpdate={updateHabitItem} onRemove={removeHabitItem} />}
            {activeTab === "progreso" && <Progreso entries={weightEntries} onAdd={addWeight} onRemove={removeWeight} weightGoal={weightGoal} onSaveGoal={saveWeightGoal} measurementGoals={measurementGoals} onSaveMeasurementGoal={saveMeasurementGoal} customFields={customFields} onAddCustomField={addCustomField} />}
            {activeTab === "objetivos" && <Objetivos goals={goals} habitItems={habitItems} onAdd={addGoal} onUpdate={updateGoal} onRemove={removeGoal} />}
            {activeTab === "finanzas" && <Finanzas entries={financeEntries} categories={financeCategories} recurring={recurringExpenses} networthEntries={networthEntries} onAddNetworth={addNetworth} onRemoveNetworth={removeNetworth} savingsGoal={savingsGoal} onSaveSavingsGoal={saveSavingsGoal} onAddEntry={addFinance} onRemoveEntry={removeFinance} onAddCategory={addCategory} onRemoveCategory={removeCategory} onAddRecurring={addRecurring} onRemoveRecurring={removeRecurring} onMarkPaid={markRecurringPaid} />}
            {activeTab === "redes" && <Redes entries={socialEntries} onAdd={addSocial} onRemove={removeSocial} followerGoals={followerGoals} onSaveFollowerGoal={saveFollowerGoal} />}
            {activeTab === "ajustes" && <Ajustes settings={settings} onUpdateSettings={updateSettings} />}
          </div>
        </div>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} onMoreClick={() => setMoreOpen(true)} />
        <FAB setActiveTab={setActiveTab} />
        {moreOpen && <MorePanel activeTab={activeTab} setActiveTab={setActiveTab} onClose={() => setMoreOpen(false)} />}
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} journalEntries={journalEntries} habitItems={habitItems} goals={goals} financeEntries={financeEntries} weightEntries={weightEntries} cats={cats} setActiveTab={setActiveTab} />}
      </div>
    </ThemeContext.Provider>
  );
}
