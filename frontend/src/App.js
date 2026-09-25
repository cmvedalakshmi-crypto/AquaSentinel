import { useState, useEffect, useRef, useCallback } from "react";

/* ─── THEME ─────────────────────────────────────────────────────────────── */
const T = {
  bg: "#010D1A", surface: "#051525", panel: "#071E30",
  border: "#0D3352", borderHi: "#1A5A8A",
  accent: "#00C8FF", accentDim: "#00C8FF18", accentGlow: "#00C8FF40",
  warn: "#FFAC00", warnDim: "#FFAC0018",
  danger: "#FF2D55", dangerDim: "#FF2D5518",
  success: "#00E5A0", successDim: "#00E5A018",
  text: "#B8DEFF", muted: "#4A7A9B", faint: "#1A3A55",
  mono: "'JetBrains Mono','Fira Code',monospace",
  display: "'Orbitron','Exo 2',sans-serif",
  body: "'Inter','DM Sans',sans-serif",
};

const scoreColor = s => s >= 75 ? T.success : s >= 45 ? T.warn : T.danger;
const scoreLabel = s => s >= 75 ? "CLEAN" : s >= 45 ? "MODERATE" : "CRITICAL";

/* ─── WATER BODIES ───────────────────────────────────────────────────────── */
const WATER_BODIES = [
  { id:"ganges",       name:"Ganges River",      place:"Varanasi",   lat:25.3176, lon:82.9739,  type:"River",  score:38, area:"2,200 km²", depth:"8m avg"  },
  { id:"dal",          name:"Dal Lake",           place:"Kashmir",    lat:34.121,  lon:74.842,   type:"Lake",   score:62, area:"18 km²",    depth:"4m avg"  },
  { id:"chilika",      name:"Chilika Lake",       place:"Odisha",     lat:19.710,  lon:85.320,   type:"Lagoon", score:55, area:"1,100 km²", depth:"3m avg"  },
  { id:"yamuna",       name:"Yamuna River",       place:"Delhi",      lat:28.6692, lon:77.2317,  type:"River",  score:22, area:"380 km²",   depth:"6m avg"  },
  { id:"cauvery",      name:"Cauvery River",      place:"Trichy",     lat:10.7905, lon:78.7047,  type:"River",  score:71, area:"810 km²",   depth:"5m avg"  },
  { id:"brahmaputra",  name:"Brahmaputra River",  place:"Guwahati",   lat:26.1445, lon:91.7362,  type:"River",  score:74, area:"5,800 km²", depth:"12m avg" },
  { id:"godavari",     name:"Godavari River",     place:"Nashik",     lat:19.9975, lon:73.7898,  type:"River",  score:66, area:"3,100 km²", depth:"7m avg"  },
  { id:"krishna",      name:"Krishna River",      place:"Vijayawada", lat:16.5062, lon:80.6480,  type:"River",  score:59, area:"2,580 km²", depth:"6m avg"  },
  { id:"mahanadi",     name:"Mahanadi River",     place:"Cuttack",    lat:20.4625, lon:85.8830,  type:"River",  score:63, area:"1,420 km²", depth:"5m avg"  },
  { id:"narmada",      name:"Narmada River",      place:"Jabalpur",   lat:23.1815, lon:79.9864,  type:"River",  score:69, area:"980 km²",   depth:"9m avg"  },
  { id:"tapti",        name:"Tapti River",        place:"Surat",      lat:21.1702, lon:72.8311,  type:"River",  score:44, area:"540 km²",   depth:"4m avg"  },
  { id:"sabarmati",    name:"Sabarmati River",    place:"Ahmedabad",  lat:23.0225, lon:72.5714,  type:"River",  score:31, area:"320 km²",   depth:"3m avg"  },
  { id:"periyar",      name:"Periyar River",      place:"Kochi",      lat:9.9312,  lon:76.2673,  type:"River",  score:77, area:"410 km²",   depth:"6m avg"  },
  { id:"hussainsagar", name:"Hussain Sagar Lake", place:"Hyderabad",  lat:17.4239, lon:78.4738,  type:"Lake",   score:29, area:"5.7 km²",   depth:"2m avg"  },
  { id:"wular",        name:"Wular Lake",         place:"J&K",        lat:34.3500, lon:74.5300,  type:"Lake",   score:68, area:"130 km²",   depth:"5m avg"  },
];

/* ─── GLOBAL STYLES ──────────────────────────────────────────────────────── */
const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=JetBrains+Mono:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body,#root{height:100%;background:${T.bg};color:${T.text};font-family:${T.body};overflow-x:hidden}
    ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:${T.bg}}
    ::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
    @keyframes slideIn{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}
    @keyframes ripple{0%{transform:scale(.7);opacity:.8}100%{transform:scale(2.8);opacity:0}}
    @keyframes scanline{0%{top:-8%}100%{top:108%}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
    @keyframes glow{0%,100%{box-shadow:0 0 8px ${T.accent}40}50%{box-shadow:0 0 20px ${T.accent}80}}
    .leaflet-container{background:#010D1A !important}
    .leaflet-tile{filter:brightness(.5) saturate(.6) hue-rotate(195deg) !important}
    .leaflet-control-attribution{display:none!important}
    .leaflet-control-zoom a{background:${T.panel}!important;color:${T.accent}!important;border-color:${T.border}!important;font-family:${T.mono}!important}
    .custom-marker{display:flex;align-items:center;justify-content:center;cursor:pointer}
    .map-tooltip{background:${T.panel}!important;border:1px solid ${T.borderHi}!important;color:${T.text}!important;font-family:${T.mono}!important;font-size:10px!important;border-radius:6px!important;padding:6px 10px!important;box-shadow:0 0 20px ${T.accentGlow}!important;white-space:nowrap!important}
    .map-tooltip::before{border-right-color:${T.borderHi}!important}
    button:focus{outline:none}
  `}</style>
);

/* ─── CLAUDE API ─────────────────────────────────────────────────────────── */
async function askClaude(prompt, system = "") {
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
  "Content-Type": "application/json",
  "x-api-key": "YOUR_API_KEY_HERE",
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true"
},
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 1000,
        system: system || "You are an expert water quality and environmental scientist AI. Be concise, technical, and data-driven.",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const d = await r.json();
    return d.content?.map(b => b.text || "").join("") || "";
  } catch { return ""; }
}

/* ─── DATA GENERATORS ────────────────────────────────────────────────────── */
async function generateAnalysis(wb) {
  const pollutions = ["Industrial Discharge", "Sewage Leakage", "Agricultural Runoff", "Mixed Sources"];
  const pollution = pollutions[Math.floor(Math.random() * pollutions.length)];
  const score = Math.max(0, Math.min(100, wb.score + Math.floor((Math.random() - 0.5) * 8)));
  const aiSummary = await askClaude(
    `Water body: ${wb.name}, ${wb.place}. Health score: ${score}/100. Primary pollution: ${pollution}.
     Provide a 3-sentence expert assessment of current water quality, key threats, and immediate concerns. Be specific and scientific.`
  );
  return {
    wb, score, pollution,
    confidence: 78 + Math.floor(Math.random() * 18),
    affectedKm: (2.1 + Math.random() * 12).toFixed(1),
    spreadRate: (0.3 + Math.random() * 2.1).toFixed(2),
    turbidity: Math.floor(30 + Math.random() * 60),
    chlorophyll: Math.floor(20 + Math.random() * 70),
    heavyMetals: Math.floor(10 + Math.random() * 80),
    doLevel: Math.floor(40 + Math.random() * 50),
    phDeviation: Math.floor(15 + Math.random() * 55),
    nitrogenLoad: Math.floor(25 + Math.random() * 65),
    aiSummary: aiSummary || `${wb.name} exhibits ${scoreLabel(score).toLowerCase()} water quality conditions with ${pollution.toLowerCase()} as the dominant stress factor.`,
    timestamp: new Date().toISOString(),
  };
}

async function generatePrediction(analysis) {
  const days = Array.from({ length: 5 }, (_, i) => {
    const s = Math.max(0, Math.min(100, analysis.score + (Math.random() - 0.4) * 8 * (i + 1) * 0.4));
    const risk = s < 35 ? "HIGH" : s < 60 ? "MED" : "LOW";
    return { score: Math.round(s), risk };
  });
  const aiText = await askClaude(
    `${analysis.wb.name} score: ${analysis.score}. Pollution: ${analysis.pollution}. 5-day forecast: ${days.map(d => d.score).join(", ")}.
     Give a 2-sentence forecast with remediation priorities.`
  );
  const factors = [
    { icon:"🌧️", name:"Monsoon Runoff Risk", detail:"Elevated seasonal flow may increase sediment load" },
    { icon:"🏭", name:"Industrial Proximity", detail:"Upstream discharge points detected via satellite" },
    { icon:"🌡️", name:"Thermal Stratification", detail:"Temperature gradient affecting dissolved oxygen" },
    { icon:"🧫", name:"Algal Bloom Potential", detail:"Nutrient levels crossing eutrophication threshold" },
    { icon:"💨", name:"Wind Dispersion", detail:"Surface currents accelerating pollutant spread" },
    { icon:"🐟", name:"Ecosystem Stress", detail:"Bioindicators showing abnormal population patterns" },
  ];
  return {
    days: days.map((d, i) => ({ ...d, note: factors[i % 3].detail })),
    factors: factors.slice(0, 4),
    summary: aiText || "Based on current pollution patterns, degradation is expected to continue without intervention.",
    alert: days.some(d => d.risk === "HIGH"),
  };
}

/* ─── SHARED COMPONENTS ──────────────────────────────────────────────────── */
function Loader({ text = "PROCESSING..." }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:20, padding:60 }}>
      <div style={{ position:"relative", width:60, height:60 }}>
        <div style={{ position:"absolute", inset:0, border:`2px solid ${T.border}`, borderRadius:"50%" }} />
        <div style={{ position:"absolute", inset:0, border:`2px solid transparent`, borderTop:`2px solid ${T.accent}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
        <div style={{ position:"absolute", inset:8, border:`1px solid transparent`, borderTop:`1px solid ${T.warn}`, borderRadius:"50%", animation:"spin 1.4s linear infinite reverse" }} />
      </div>
      <span style={{ color:T.accent, fontSize:10, letterSpacing:5, fontFamily:T.mono, animation:"pulse 1.2s ease infinite" }}>{text}</span>
    </div>
  );
}

function Card({ children, style, glow, danger, warn }) {
  const glowColor = danger ? T.danger : warn ? T.warn : T.accent;
  return (
    <div style={{
      background:T.panel, borderRadius:12, padding:18,
      border:`1px solid ${glow||danger||warn ? glowColor : T.border}`,
      boxShadow:glow||danger||warn ? `0 0 28px ${glowColor}22,inset 0 0 28px ${glowColor}06` : "none",
      animation:"fadeUp .35s ease", position:"relative", overflow:"hidden", ...style
    }}>
      {(glow||danger||warn) && <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${glowColor},transparent)` }} />}
      {children}
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, paddingBottom:10, borderBottom:`1px solid ${T.border}` }}>
      <span style={{ fontSize:14 }}>{icon}</span>
      <span style={{ color:T.accent, fontFamily:T.mono, fontSize:10, letterSpacing:3, fontWeight:600 }}>{title}</span>
    </div>
  );
}

function StatBadge({ label, value, color, icon }) {
  return (
    <div style={{ background:T.surface, border:`1px solid ${color}33`, borderRadius:8, padding:"10px 14px" }}>
      <div style={{ color:T.muted, fontSize:9, letterSpacing:2, fontFamily:T.mono, marginBottom:4 }}>{icon} {label}</div>
      <div style={{ color, fontFamily:T.mono, fontWeight:600, fontSize:15, filter:`drop-shadow(0 0 6px ${color})` }}>{value}</div>
    </div>
  );
}

function Bar({ label, value, color }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ color:T.muted, fontSize:10, fontFamily:T.mono }}>{label}</span>
        <span style={{ color, fontSize:10, fontFamily:T.mono, fontWeight:600 }}>{value}%</span>
      </div>
      <div style={{ height:3, background:T.faint, borderRadius:2, overflow:"hidden" }}>
        <div style={{ width:`${value}%`, height:"100%", background:`linear-gradient(90deg,${color}88,${color})`,
          borderRadius:2, boxShadow:`0 0 8px ${color}`, transition:"width 1.2s cubic-bezier(.4,0,.2,1)" }} />
      </div>
    </div>
  );
}

function ScoreRing({ score }) {
  const col = scoreColor(score);
  const r = 58, circ = 2 * Math.PI * r;
  return (
    <div style={{ textAlign:"center", position:"relative" }}>
      <svg width={148} height={148} viewBox="0 0 148 148" style={{ transform:"rotate(-90deg)" }}>
        <circle cx={74} cy={74} r={r} fill="none" stroke={T.faint} strokeWidth={8} />
        <circle cx={74} cy={74} r={r} fill="none" stroke={col} strokeWidth={8}
          strokeDasharray={`${(score/100)*circ} ${circ}`} strokeLinecap="round"
          style={{ filter:`drop-shadow(0 0 10px ${col})`, transition:"stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)" }} />
        <circle cx={74} cy={74} r={r-14} fill="none" stroke={`${col}22`} strokeWidth={1} />
      </svg>
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center" }}>
        <div style={{ fontFamily:T.display, fontWeight:900, fontSize:32, color:col, filter:`drop-shadow(0 0 12px ${col})`, lineHeight:1 }}>{score}</div>
        <div style={{ color:T.muted, fontSize:9, fontFamily:T.mono, marginTop:2 }}>/100</div>
        <div style={{ color:col, fontSize:9, fontFamily:T.mono, fontWeight:600, letterSpacing:3, marginTop:4 }}>{scoreLabel(score)}</div>
      </div>
    </div>
  );
}

function ActionBtn({ label, color, icon, onClick, disabled, small }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? T.faint : `${color}22`,
      border: `1px solid ${disabled ? T.border : color}`,
      color: disabled ? T.muted : color,
      borderRadius:8, padding: small ? "8px 14px" : "11px 20px",
      fontFamily:T.display, fontWeight:700, fontSize: small ? 10 : 11,
      letterSpacing:2, cursor: disabled ? "not-allowed" : "pointer",
      display:"flex", alignItems:"center", gap:7,
      boxShadow: disabled ? "none" : `0 0 16px ${color}30`,
      transition:"all .2s"
    }}>
      <span>{icon}</span>{label}
    </button>
  );
}

/* ─── LEAFLET MAP ────────────────────────────────────────────────────────── */
function LiveMap({ selected, onSelect }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.L) { setReady(true); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || mapInstance.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { center:[22,80], zoom:5, zoomControl:true, attributionControl:false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom:18 }).addTo(map);
    mapInstance.current = map;
    WATER_BODIES.forEach(wb => {
      const col = scoreColor(wb.score);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="54" viewBox="0 0 48 54">
        <circle cx="24" cy="22" r="19" fill="${col}18" stroke="${col}" stroke-width="1.5"/>
        <circle cx="24" cy="22" r="9" fill="${col}44" stroke="${col}" stroke-width="2"/>
        <circle cx="24" cy="22" r="4" fill="${col}"/>
        <text x="24" y="44" text-anchor="middle" font-size="8" font-family="monospace" fill="${col}" font-weight="700">${wb.score}</text>
      </svg>`;
      const icon = L.divIcon({ html:svg, iconSize:[48,54], iconAnchor:[24,22], className:"custom-marker" });
      const marker = L.marker([wb.lat, wb.lon], { icon }).addTo(map);
      marker.bindTooltip(`<b style="color:${col}">${wb.name}</b><br>${wb.place} · ${wb.type}<br>Score: <b style="color:${col}">${wb.score}/100</b>`, { className:"map-tooltip", direction:"right", offset:[10,0] });
      marker.on("click", () => onSelect(wb));
    });
  }, [ready, onSelect]);

  useEffect(() => {
    if (!mapInstance.current || !selected) return;
    mapInstance.current.flyTo([selected.lat, selected.lon], 8, { duration:1.4 });
  }, [selected]);

  return (
    <div style={{ position:"relative", borderRadius:12, overflow:"hidden", border:`1px solid ${T.border}`, height:340 }}>
      <div style={{ position:"absolute", inset:0, zIndex:1000, pointerEvents:"none", overflow:"hidden" }}>
        <div style={{ position:"absolute", left:0, right:0, height:"5px",
          background:`linear-gradient(180deg,transparent,${T.accent}20,transparent)`,
          animation:"scanline 4s linear infinite" }} />
      </div>
      {[["tl",{top:8,left:8}],["tr",{top:8,right:8}],["bl",{bottom:8,left:8}],["br",{bottom:8,right:8}]].map(([k,pos])=>(
        <div key={k} style={{ position:"absolute", zIndex:999, pointerEvents:"none", width:14, height:14, ...pos,
          borderTop:k[0]==="t"?`2px solid ${T.accent}`:"none",
          borderBottom:k[0]==="b"?`2px solid ${T.accent}`:"none",
          borderLeft:k[1]==="l"?`2px solid ${T.accent}`:"none",
          borderRight:k[1]==="r"?`2px solid ${T.accent}`:"none",
        }} />
      ))}
      {!ready && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:T.bg, zIndex:10 }}>
          <Loader text="LOADING MAP..." />
        </div>
      )}
      <div ref={mapRef} style={{ width:"100%", height:"100%" }} />
      <div style={{ position:"absolute", bottom:8, left:"50%", transform:"translateX(-50%)", zIndex:999, pointerEvents:"none",
        background:`${T.bg}DD`, border:`1px solid ${T.border}`, borderRadius:4, padding:"3px 10px",
        color:T.muted, fontSize:8, fontFamily:T.mono, letterSpacing:2 }}>
        SENTINEL-2 / LANDSAT-9 · INDIA WATER INTELLIGENCE GRID
      </div>
    </div>
  );
}

/* ─── SIDEBAR ────────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { id:"map",      icon:"🗺️",  label:"MAP"      },
  { id:"analysis", icon:"🔬",  label:"ANALYSIS" },
  { id:"predict",  icon:"📈",  label:"PREDICT"  },
  { id:"simulate", icon:"🌊",  label:"SIMULATE" },
  { id:"actions",  icon:"⚙️",  label:"ACTIONS"  },
  { id:"alerts",   icon:"🚨",  label:"ALERTS"   },
  { id:"restore",  icon:"🌿",  label:"RESTORE"  },
  { id:"monitor",  icon:"📡",  label:"MONITOR"  },
  { id:"report",   icon:"📋",  label:"REPORT"   },
];

function Sidebar({ active, setActive, selected }) {
  return (
    <div style={{ width:70, background:T.surface, borderRight:`1px solid ${T.border}`,
      display:"flex", flexDirection:"column", alignItems:"center", padding:"14px 0", gap:3, flexShrink:0 }}>
      <div style={{ marginBottom:16, textAlign:"center" }}>
        <div style={{ width:38, height:38, borderRadius:10, background:T.accentDim, border:`1px solid ${T.accent}44`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, marginBottom:3 }}>💧</div>
        <div style={{ color:T.accent, fontSize:6, fontFamily:T.mono, letterSpacing:2 }}>AQUA·AI</div>
      </div>
      {NAV_ITEMS.map(n => (
        <button key={n.id} onClick={()=>setActive(n.id)} style={{
          width:54, height:50, borderRadius:9, border:`1px solid ${active===n.id?T.accent:T.border}`,
          background: active===n.id ? T.accentDim : "transparent",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          cursor:"pointer", gap:2, transition:"all .2s",
          boxShadow: active===n.id ? `0 0 18px ${T.accentGlow}` : "none",
        }}>
          <span style={{ fontSize:15 }}>{n.icon}</span>
          <span style={{ color:active===n.id?T.accent:T.muted, fontSize:6, fontFamily:T.mono, letterSpacing:1 }}>{n.label}</span>
        </button>
      ))}
      <div style={{ flex:1 }} />
      {selected && (
        <div style={{ width:54, background:T.panel, border:`1px solid ${T.border}`, borderRadius:8,
          padding:"5px 4px", textAlign:"center", marginBottom:4 }}>
          <div style={{ color:scoreColor(selected.score), fontFamily:T.mono, fontWeight:700, fontSize:13 }}>{selected.score}</div>
          <div style={{ color:T.muted, fontSize:6, fontFamily:T.mono }}>SCORE</div>
        </div>
      )}
    </div>
  );
}

/* ─── HEADER ─────────────────────────────────────────────────────────────── */
function Header({ selected }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString("en-IN",{hour12:false}));
  useEffect(()=>{
    const t = setInterval(()=>setTime(new Date().toLocaleTimeString("en-IN",{hour12:false})),1000);
    return ()=>clearInterval(t);
  },[]);
  return (
    <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:"9px 18px",
      display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ color:T.accent, fontFamily:T.display, fontWeight:900, fontSize:15, letterSpacing:3 }}>AQUA INTELLIGENCE</span>
        <span style={{ color:T.border }}>|</span>
        <span style={{ color:T.muted, fontSize:9, fontFamily:T.mono, letterSpacing:2 }}>AI-POWERED WATER RESTORATION PLATFORM</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        {selected && (
          <div style={{ display:"flex", alignItems:"center", gap:7, background:T.panel,
            border:`1px solid ${T.border}`, borderRadius:6, padding:"4px 12px" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:scoreColor(selected.score),
              boxShadow:`0 0 6px ${scoreColor(selected.score)}` }} />
            <span style={{ color:T.text, fontSize:10, fontFamily:T.mono }}>{selected.name} — {selected.place}</span>
          </div>
        )}
        <span style={{ color:T.accent, fontFamily:T.mono, fontSize:10, letterSpacing:2 }}>{time}</span>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:T.success, animation:"pulse 2s ease infinite" }} />
          <span style={{ color:T.muted, fontSize:9, fontFamily:T.mono }}>SATELLITE ACTIVE</span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SCREEN 1 — MAP
═══════════════════════════════════════════════════════════════════════════ */
function MapScreen({ selected, onSelect }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp .4s ease" }}>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
        <div>
          <div style={{ color:T.muted, fontSize:9, fontFamily:T.mono, letterSpacing:4, marginBottom:5 }}>SATELLITE INTELLIGENCE</div>
          <h2 style={{ fontFamily:T.display, fontWeight:900, fontSize:22, color:T.accent, letterSpacing:2 }}>WATER BODY MAP</h2>
          <p style={{ color:T.muted, fontSize:10, marginTop:3, fontFamily:T.mono }}>Click any marker to begin spectral analysis</p>
        </div>
        <div style={{ display:"flex", gap:12 }}>
          {[[T.success,"CLEAN"],[T.warn,"MODERATE"],[T.danger,"CRITICAL"]].map(([c,l])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:9, color:T.muted, fontFamily:T.mono }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:c, boxShadow:`0 0 6px ${c}` }} />{l}
            </div>
          ))}
        </div>
      </div>
      <LiveMap selected={selected} onSelect={onSelect} />
      {/* ── River cards grid — 5 columns, scrollable rows ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
        {WATER_BODIES.map(wb => {
          const col = scoreColor(wb.score), sel = selected?.id===wb.id;
          return (
            <div key={wb.id} onClick={()=>onSelect(wb)} style={{
              background:sel?`${col}12`:T.panel, border:`1px solid ${sel?col:T.border}`,
              borderRadius:10, padding:"11px 10px", cursor:"pointer",
              boxShadow:sel?`0 0 20px ${col}30`:"none", transition:"all .25s",
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                <div style={{ color:T.muted, fontSize:8, fontFamily:T.mono, lineHeight:1.5 }}>
                  <div style={{ color:sel?col:T.text, fontWeight:600, fontSize:10, marginBottom:2 }}>{wb.name}</div>
                  {wb.place} · {wb.type}
                </div>
                <div style={{ color:col, fontFamily:T.display, fontWeight:900, fontSize:18, filter:`drop-shadow(0 0 8px ${col})` }}>{wb.score}</div>
              </div>
              <div style={{ height:2, background:T.faint, borderRadius:1 }}>
                <div style={{ width:`${wb.score}%`, height:"100%", background:col, borderRadius:1 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SCREEN 2 — ANALYSIS
═══════════════════════════════════════════════════════════════════════════ */
function AnalysisScreen({ analysis, loading, selected, onRun }) {
  if (!selected) return <EmptyState icon="🔬" msg="SELECT A WATER BODY ON THE MAP FIRST" />;
  if (loading) return <Loader text="RUNNING SPECTRAL ANALYSIS..." />;
  if (!analysis) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:380, gap:16 }}>
      <div style={{ color:T.text, fontFamily:T.mono, fontSize:12 }}>Ready: <span style={{ color:T.accent }}>{selected.name}</span></div>
      <ActionBtn label="RUN ANALYSIS" color={T.accent} icon="▶" onClick={onRun} />
    </div>
  );
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp .4s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ color:T.muted, fontSize:9, fontFamily:T.mono, letterSpacing:4 }}>SPECTRAL ANALYSIS REPORT</div>
          <h2 style={{ fontFamily:T.display, fontWeight:900, fontSize:20, color:T.accent }}>{analysis.wb.name} — {analysis.wb.place}</h2>
        </div>
        <span style={{ color:T.muted, fontSize:9, fontFamily:T.mono }}>{new Date(analysis.timestamp).toLocaleTimeString()}</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:14 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Card glow>
            <SectionTitle icon="💧" title="HEALTH INDEX" />
            <ScoreRing score={analysis.score} />
          </Card>
          <Card>
            <SectionTitle icon="🧬" title="POLLUTION FINGERPRINT" />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <StatBadge icon="🏭" label="SOURCE" value={analysis.pollution.split(" ")[0]} color={T.danger} />
              <StatBadge icon="🎯" label="CONFIDENCE" value={`${analysis.confidence}%`} color={T.accent} />
              <StatBadge icon="📏" label="AFFECTED" value={`${analysis.affectedKm}km²`} color={T.warn} />
              <StatBadge icon="💨" label="SPREAD" value={`${analysis.spreadRate}km/d`} color={T.text} />
            </div>
          </Card>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <Card>
            <SectionTitle icon="📡" title="SPECTRAL PARAMETERS" />
            <Bar label="TURBIDITY INDEX" value={analysis.turbidity} color={T.warn} />
            <Bar label="CHLOROPHYLL-A" value={analysis.chlorophyll} color={T.success} />
            <Bar label="HEAVY METALS" value={analysis.heavyMetals} color={T.danger} />
            <Bar label="DISSOLVED OXYGEN" value={analysis.doLevel} color={T.accent} />
            <Bar label="pH DEVIATION" value={analysis.phDeviation} color={T.warn} />
            <Bar label="NITROGEN LOAD" value={analysis.nitrogenLoad} color={T.muted} />
          </Card>
          <Card glow>
            <SectionTitle icon="🤖" title="AI ASSESSMENT" />
            <p style={{ color:T.text, fontSize:11, lineHeight:1.9 }}>{analysis.aiSummary}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SCREEN 3 — PREDICT
═══════════════════════════════════════════════════════════════════════════ */
function PredictScreen({ prediction, loading, analysis, onRun }) {
  if (!analysis) return <EmptyState icon="📈" msg="RUN ANALYSIS FIRST TO GENERATE PREDICTIONS" />;
  if (loading) return <Loader text="RUNNING PREDICTIVE MODEL..." />;
  if (!prediction) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:380, gap:16 }}>
      <ActionBtn label="GENERATE 5-DAY FORECAST" color={T.warn} icon="📈" onClick={onRun} />
    </div>
  );
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp .4s ease" }}>
      <div>
        <div style={{ color:T.muted, fontSize:9, fontFamily:T.mono, letterSpacing:4, marginBottom:4 }}>5-DAY PREDICTIVE FORECAST</div>
        <h2 style={{ fontFamily:T.display, fontWeight:900, fontSize:20, color:T.warn }}>{analysis.wb.name}</h2>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
        {prediction.days.map((d,i) => {
          const col = scoreColor(d.score);
          return (
            <Card key={i} glow={d.risk==="HIGH"} danger={d.risk==="HIGH"}>
              <div style={{ textAlign:"center" }}>
                <div style={{ color:T.muted, fontSize:8, fontFamily:T.mono, letterSpacing:2, marginBottom:10 }}>DAY +{i+1}</div>
                <div style={{ fontFamily:T.display, fontWeight:900, fontSize:28, color:col, filter:`drop-shadow(0 0 10px ${col})` }}>{d.score}</div>
                <div style={{ color:col, fontSize:8, fontFamily:T.mono, letterSpacing:2, margin:"6px 0" }}>{scoreLabel(d.score)}</div>
                <span style={{ background:`${d.risk==="HIGH"?T.danger:d.risk==="MED"?T.warn:T.success}22`,
                  border:`1px solid ${d.risk==="HIGH"?T.danger:d.risk==="MED"?T.warn:T.success}55`,
                  color:d.risk==="HIGH"?T.danger:d.risk==="MED"?T.warn:T.success,
                  borderRadius:4, padding:"2px 7px", fontSize:8, fontFamily:T.mono }}>{d.risk} RISK</span>
                <p style={{ color:T.muted, fontSize:9, marginTop:8, lineHeight:1.5, fontFamily:T.mono }}>{d.note}</p>
              </div>
            </Card>
          );
        })}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Card>
          <SectionTitle icon="⚠️" title="CONTRIBUTING RISK FACTORS" />
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {prediction.factors.map((f,i) => (
              <div key={i} style={{ display:"flex", gap:10, background:T.surface, borderRadius:8, padding:"8px 12px", border:`1px solid ${T.border}` }}>
                <span style={{ fontSize:18 }}>{f.icon}</span>
                <div>
                  <div style={{ color:T.text, fontSize:11, fontWeight:600 }}>{f.name}</div>
                  <div style={{ color:T.muted, fontSize:10, marginTop:2 }}>{f.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card glow={prediction.alert} danger={prediction.alert}>
          <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
            <span style={{ fontSize:32, animation:prediction.alert?"pulse .9s ease infinite":"none" }}>🚨</span>
            <div>
              <div style={{ fontFamily:T.display, fontWeight:700, fontSize:12, color:prediction.alert?T.danger:T.success, marginBottom:8 }}>
                {prediction.alert?"HIGH RISK — IMMEDIATE ACTION REQUIRED":"STABLE CONDITIONS FORECASTED"}
              </div>
              <p style={{ color:T.text, fontSize:11, lineHeight:1.8 }}>{prediction.summary}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SCREEN 4 — SIMULATE
═══════════════════════════════════════════════════════════════════════════ */
function SimulateScreen({ analysis }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [day, setDay] = useState(0);
  const [nodes, setNodes] = useState(0);
  const dayRef = useRef(0);
  const particles = useRef([]);

  const run = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    dayRef.current = 0; particles.current = [{ x:canvas.width/2, y:canvas.height/2, r:5, a:.9, vx:.5, vy:.3 }];
    setRunning(true); setDay(0);
    const tick = () => {
      ctx.fillStyle = "#010D1ACC"; ctx.fillRect(0,0,canvas.width,canvas.height);
      for(let i=0;i<canvas.width;i+=28){ctx.strokeStyle="#0D3352";ctx.lineWidth=.3;ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,canvas.height);ctx.stroke();}
      for(let i=0;i<canvas.height;i+=28){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(canvas.width,i);ctx.stroke();}
      ctx.save(); ctx.beginPath();
      ctx.ellipse(canvas.width/2, canvas.height/2, 175, 110, 0, 0, Math.PI*2);
      ctx.fillStyle="#040F1E"; ctx.strokeStyle="#0A3A6A"; ctx.lineWidth=1.5;
      ctx.fill(); ctx.stroke(); ctx.restore();
      if(Math.random()<.35 && particles.current.length<120){
        const src = particles.current[Math.floor(Math.random()*particles.current.length)];
        if(src) particles.current.push({ x:src.x+(Math.random()-.5)*18, y:src.y+(Math.random()-.5)*12,
          r:3+Math.random()*7, a:.8+Math.random()*.2, vx:(Math.random()-.5)*1.4, vy:(Math.random()-.5)*.9 });
      }
      particles.current = particles.current.map(p => {
        const np = {...p, x:p.x+p.vx, y:p.y+p.vy, r:p.r+.05, a:p.a*.997};
        const col = np.a>.65?"#FF2D55":"#FFAC00";
        ctx.beginPath(); ctx.arc(np.x,np.y,np.r,0,Math.PI*2);
        ctx.fillStyle=col+Math.round(np.a*200).toString(16).padStart(2,"0"); ctx.fill();
        return np;
      }).filter(p=>p.a>.08);
      setNodes(particles.current.length);
      dayRef.current+=.018; setDay(Math.floor(dayRef.current));
      ctx.fillStyle=T.accent; ctx.font=`500 11px monospace`;
      ctx.fillText(`DAY ${Math.floor(dayRef.current)} · NODES: ${particles.current.length} · ${analysis?.pollution||"UNKNOWN"}`,14,22);
      if(dayRef.current<10){ animRef.current=requestAnimationFrame(tick); } else { setRunning(false); }
    };
    animRef.current=requestAnimationFrame(tick);
  }, [analysis]);

  useEffect(()=>()=>cancelAnimationFrame(animRef.current),[]);

  if (!analysis) return <EmptyState icon="🌊" msg="ANALYSIS REQUIRED BEFORE SIMULATION" />;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp .4s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div style={{ color:T.muted, fontSize:9, fontFamily:T.mono, letterSpacing:4, marginBottom:4 }}>PARTICLE DISPERSION MODEL</div>
          <h2 style={{ fontFamily:T.display, fontWeight:900, fontSize:20, color:T.accent }}>POLLUTION SPREAD SIMULATION</h2>
          <p style={{ color:T.muted, fontSize:10, marginTop:3, fontFamily:T.mono }}>10-day particle-based dispersion forecast</p>
        </div>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          {running && <div style={{ fontSize:10, fontFamily:T.mono, color:T.muted }}>
            DAY <span style={{ color:T.accent }}>{day}</span> &nbsp;·&nbsp; NODES <span style={{ color:T.danger }}>{nodes}</span>
          </div>}
          <ActionBtn label={running?"SIMULATING...":"▶ RUN SIMULATION"} color={T.accent} icon="" onClick={run} disabled={running} />
        </div>
      </div>
      <Card style={{ padding:6 }}>
        <canvas ref={canvasRef} width={780} height={360}
          style={{ width:"100%", borderRadius:8, display:"block", background:"#010D1A" }} />
      </Card>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        <StatBadge icon="🏭" label="POLLUTION TYPE" value={analysis.pollution.split(" ").slice(0,2).join(" ")} color={T.danger} />
        <StatBadge icon="💧" label="WATER BODY" value={analysis.wb.name.split(" ")[0]} color={T.accent} />
        <StatBadge icon="📏" label="AFFECTED AREA" value={`${analysis.affectedKm} km²`} color={T.warn} />
        <StatBadge icon="💨" label="SPREAD RATE" value={`${analysis.spreadRate} km/d`} color={T.text} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SCREEN 5 — ACTIONS
═══════════════════════════════════════════════════════════════════════════ */
function ActionsScreen({ analysis, selected }) {
  const [deployed, setDeployed] = useState({});
  const [aiRec, setAiRec] = useState("");
  const [loadingRec, setLoadingRec] = useState(false);

  const ACTIONS = [
    { id:"bioremediation", icon:"🧬", title:"Deploy Bioremediation", desc:"Introduce microorganisms to break down organic pollutants and restore natural biological balance.", color:T.success, eta:"14-21 days" },
    { id:"aeration",       icon:"💨", title:"Mechanical Aeration",   desc:"Install floating aerators to increase dissolved oxygen levels and reduce anaerobic conditions.", color:T.accent,  eta:"Immediate" },
    { id:"barrier",        icon:"🚧", title:"Pollution Barrier",     desc:"Deploy containment barriers to prevent further downstream spread of detected contaminants.", color:T.warn,    eta:"24-48 hours" },
    { id:"dredging",       icon:"⚓", title:"Sediment Dredging",     desc:"Remove contaminated sediment layers from the water body floor to reduce heavy metal leaching.", color:T.text,    eta:"30-60 days" },
    { id:"wetland",        icon:"🌾", title:"Constructed Wetlands",  desc:"Create artificial wetland zones to naturally filter pollutants before they enter the main body.", color:T.success, eta:"60-90 days" },
    { id:"chemicals",      icon:"⚗️", title:"Chemical Treatment",    desc:"Apply targeted chemical agents to neutralize specific pollutants detected in spectral analysis.", color:T.danger,  eta:"3-7 days" },
  ];

  const getAIRecommendation = async () => {
    if (!analysis) return;
    setLoadingRec(true);
    const rec = await askClaude(
      `For ${analysis.wb.name} with score ${analysis.score}/100, pollution: ${analysis.pollution}, turbidity: ${analysis.turbidity}%, heavy metals: ${analysis.heavyMetals}%.
       Recommend the top 3 remediation actions from: Bioremediation, Aeration, Pollution Barrier, Sediment Dredging, Constructed Wetlands, Chemical Treatment.
       For each give a one-line reason. Be concise.`
    );
    setAiRec(rec); setLoadingRec(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp .4s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div style={{ color:T.muted, fontSize:9, fontFamily:T.mono, letterSpacing:4, marginBottom:4 }}>REMEDIATION CONTROL PANEL</div>
          <h2 style={{ fontFamily:T.display, fontWeight:900, fontSize:20, color:T.success }}>RESTORATION ACTIONS</h2>
        </div>
        <ActionBtn label="AI RECOMMEND" color={T.accent} icon="🤖" onClick={getAIRecommendation} disabled={!analysis||loadingRec} />
      </div>

      {loadingRec && <Loader text="GENERATING AI RECOMMENDATIONS..." />}
      {aiRec && (
        <Card glow>
          <SectionTitle icon="🤖" title="AI-RECOMMENDED ACTIONS" />
          <p style={{ color:T.text, fontSize:11, lineHeight:1.9, whiteSpace:"pre-wrap" }}>{aiRec}</p>
        </Card>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {ACTIONS.map(a => (
          <Card key={a.id} style={{ border:`1px solid ${deployed[a.id]?a.color:T.border}`,
            boxShadow:deployed[a.id]?`0 0 20px ${a.color}30`:"none" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <span style={{ fontSize:24 }}>{a.icon}</span>
                <div>
                  <div style={{ color:deployed[a.id]?a.color:T.text, fontFamily:T.display, fontWeight:700, fontSize:12 }}>{a.title}</div>
                  <div style={{ color:T.muted, fontSize:9, fontFamily:T.mono, marginTop:2 }}>ETA: {a.eta}</div>
                </div>
              </div>
              {deployed[a.id] && <span style={{ background:`${T.success}22`, border:`1px solid ${T.success}55`, color:T.success,
                borderRadius:4, padding:"2px 8px", fontSize:8, fontFamily:T.mono }}>DEPLOYED</span>}
            </div>
            <p style={{ color:T.muted, fontSize:10, lineHeight:1.7, marginBottom:12 }}>{a.desc}</p>
            <ActionBtn small label={deployed[a.id]?"DEPLOYED ✓":"DEPLOY"} color={deployed[a.id]?T.success:a.color} icon={deployed[a.id]?"":"▶"}
              onClick={()=>setDeployed(d=>({...d,[a.id]:!d[a.id]}))} />
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SCREEN 6 — ALERTS
═══════════════════════════════════════════════════════════════════════════ */
function AlertsScreen({ analysis }) {
  const [alerts, setAlerts] = useState([
    { id:1, level:"CRITICAL", icon:"🚨", title:"Yamuna River — Delhi", msg:"Dissolved oxygen below 2 mg/L. Immediate aeration required.", time:"2 min ago",  ack:false, color:T.danger },
    { id:2, level:"WARNING",  icon:"⚠️", title:"Ganges River — Varanasi", msg:"Heavy metal concentration exceeding CPCB limits. Industrial discharge suspected.", time:"18 min ago", ack:false, color:T.warn },
    { id:3, level:"INFO",     icon:"ℹ️", title:"Dal Lake — Kashmir", msg:"Satellite pass completed. New spectral data available for analysis.", time:"1 hr ago",  ack:false, color:T.accent },
    { id:4, level:"WARNING",  icon:"⚠️", title:"Chilika Lake — Odisha", msg:"Algal bloom detected in northern sector. Chlorophyll-a spike recorded.", time:"3 hrs ago", ack:true,  color:T.warn },
    { id:5, level:"INFO",     icon:"ℹ️", title:"Cauvery River — Trichy", msg:"Water quality improving. Score increased by 4 points over 24 hours.", time:"5 hrs ago", ack:true,  color:T.success },
  ]);
  const [aiAlerts, setAiAlerts] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  const genAIAlert = async () => {
    if (!analysis) return;
    setLoadingAi(true);
    const r = await askClaude(
      `Generate 2 realistic water quality alert messages for ${analysis.wb.name}, score ${analysis.score}/100, pollution: ${analysis.pollution}.
       Format each as: [LEVEL] Title: Message. Use CRITICAL/WARNING/INFO levels.`
    );
    setAiAlerts(r); setLoadingAi(false);
  };

  const ack = id => setAlerts(a=>a.map(x=>x.id===id?{...x,ack:true}:x));
  const dismiss = id => setAlerts(a=>a.filter(x=>x.id!==id));
  const unread = alerts.filter(a=>!a.ack).length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp .4s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div style={{ color:T.muted, fontSize:9, fontFamily:T.mono, letterSpacing:4, marginBottom:4 }}>REAL-TIME NOTIFICATION SYSTEM</div>
          <h2 style={{ fontFamily:T.display, fontWeight:900, fontSize:20, color:T.danger }}>ALERTS & NOTIFICATIONS</h2>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          {unread > 0 && (
            <div style={{ background:T.dangerDim, border:`1px solid ${T.danger}`, borderRadius:6, padding:"4px 12px",
              color:T.danger, fontSize:10, fontFamily:T.mono, animation:"pulse 1.5s ease infinite" }}>
              {unread} UNREAD
            </div>
          )}
          <ActionBtn small label="AI GENERATE" color={T.accent} icon="🤖" onClick={genAIAlert} disabled={!analysis||loadingAi} />
        </div>
      </div>

      {loadingAi && <Loader text="GENERATING ALERTS..." />}
      {aiAlerts && (
        <Card glow>
          <SectionTitle icon="🤖" title="AI-GENERATED ALERTS" />
          <p style={{ color:T.text, fontSize:11, lineHeight:1.9, whiteSpace:"pre-wrap" }}>{aiAlerts}</p>
        </Card>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
        <StatBadge icon="🚨" label="CRITICAL" value={alerts.filter(a=>a.level==="CRITICAL").length} color={T.danger} />
        <StatBadge icon="⚠️" label="WARNING"  value={alerts.filter(a=>a.level==="WARNING").length}  color={T.warn} />
        <StatBadge icon="ℹ️" label="INFO"     value={alerts.filter(a=>a.level==="INFO").length}     color={T.accent} />
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {alerts.map(a => (
          <div key={a.id} style={{
            background:a.ack?T.panel:`${a.color}0A`,
            border:`1px solid ${a.ack?T.border:a.color}`,
            borderRadius:10, padding:"12px 16px",
            display:"flex", gap:12, alignItems:"flex-start",
            animation:"slideIn .3s ease", opacity:a.ack?.7:1,
          }}>
            <span style={{ fontSize:22, marginTop:2 }}>{a.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ background:`${a.color}22`, border:`1px solid ${a.color}55`, color:a.color,
                    borderRadius:4, padding:"1px 7px", fontSize:8, fontFamily:T.mono }}>{a.level}</span>
                  <span style={{ color:T.text, fontFamily:T.mono, fontWeight:600, fontSize:11 }}>{a.title}</span>
                </div>
                <span style={{ color:T.muted, fontSize:9, fontFamily:T.mono }}>{a.time}</span>
              </div>
              <p style={{ color:T.muted, fontSize:10, lineHeight:1.6 }}>{a.msg}</p>
            </div>
            <div style={{ display:"flex", gap:6, flexShrink:0 }}>
              {!a.ack && <ActionBtn small label="ACK" color={T.success} icon="✓" onClick={()=>ack(a.id)} />}
              <ActionBtn small label="✕" color={T.muted} icon="" onClick={()=>dismiss(a.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SCREEN 7 — RESTORE
═══════════════════════════════════════════════════════════════════════════ */
function RestoreScreen({ analysis }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({});

  const PHASES = [
    { id:"assess",   icon:"🔍", title:"Phase 1: Assessment",         desc:"Complete baseline survey and establish monitoring grid across all zones." },
    { id:"contain",  icon:"🚧", title:"Phase 2: Containment",        desc:"Deploy barriers and stop active pollution inflow from identified sources." },
    { id:"treat",    icon:"⚗️", title:"Phase 3: Treatment",          desc:"Apply targeted remediation — chemical, biological, or physical as indicated." },
    { id:"restore",  icon:"🌿", title:"Phase 4: Ecological Restore", desc:"Reintroduce native species, rebuild riparian zones, stabilise ecosystem." },
    { id:"monitor",  icon:"📡", title:"Phase 5: Long-term Monitor",  desc:"Continuous satellite and ground-level monitoring to track recovery trajectory." },
  ];

  const genPlan = async () => {
    if (!analysis) return;
    setLoading(true);
    const r = await askClaude(
      `Create a restoration plan for ${analysis.wb.name}, ${analysis.wb.place}. Score: ${analysis.score}/100. Pollution: ${analysis.pollution}.
       For each of 5 restoration phases (Assessment, Containment, Treatment, Ecological Restoration, Long-term Monitoring) provide:
       - Specific action items (2 bullet points each)
       - Timeline estimate
       - Success metric
       Be specific to this water body and pollution type.`
    );
    setPlan(r); setLoading(false);
  };

  const toggle = id => setProgress(p=>({...p,[id]:!p[id]}));

  if (!analysis) return <EmptyState icon="🌿" msg="RUN ANALYSIS TO GENERATE RESTORATION PLAN" />;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp .4s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div style={{ color:T.muted, fontSize:9, fontFamily:T.mono, letterSpacing:4, marginBottom:4 }}>ECOLOGICAL RECOVERY SYSTEM</div>
          <h2 style={{ fontFamily:T.display, fontWeight:900, fontSize:20, color:T.success }}>RESTORATION PLAN</h2>
        </div>
        <ActionBtn label="GENERATE AI PLAN" color={T.success} icon="🌿" onClick={genPlan} disabled={loading} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        <StatBadge icon="📊" label="CURRENT SCORE" value={`${analysis.score}/100`} color={scoreColor(analysis.score)} />
        <StatBadge icon="🎯" label="TARGET SCORE"  value="80/100"  color={T.success} />
        <StatBadge icon="⏱️" label="EST. TIMELINE" value="6-12 mo" color={T.accent} />
        <StatBadge icon="💰" label="PRIORITY"      value={analysis.score<40?"HIGH":"MED"} color={analysis.score<40?T.danger:T.warn} />
      </div>

      {loading && <Loader text="GENERATING RESTORATION PLAN..." />}
      {plan && (
        <Card glow>
          <SectionTitle icon="🤖" title="AI-GENERATED RESTORATION PLAN" />
          <p style={{ color:T.text, fontSize:11, lineHeight:1.9, whiteSpace:"pre-wrap" }}>{plan}</p>
        </Card>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {PHASES.map((ph, i) => (
          <div key={ph.id} style={{
            background:progress[ph.id]?`${T.success}0A`:T.panel,
            border:`1px solid ${progress[ph.id]?T.success:T.border}`,
            borderRadius:10, padding:"12px 16px",
            display:"flex", gap:12, alignItems:"center",
            transition:"all .3s",
          }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:`${T.success}22`,
              border:`2px solid ${progress[ph.id]?T.success:T.border}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              color:T.success, fontFamily:T.mono, fontWeight:700, fontSize:11, flexShrink:0 }}>
              {progress[ph.id]?"✓":(i+1)}
            </div>
            <span style={{ fontSize:20 }}>{ph.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ color:progress[ph.id]?T.success:T.text, fontFamily:T.display, fontWeight:700, fontSize:11, marginBottom:4 }}>{ph.title}</div>
              <div style={{ color:T.muted, fontSize:10, lineHeight:1.6 }}>{ph.desc}</div>
            </div>
            <ActionBtn small label={progress[ph.id]?"COMPLETE":"MARK DONE"} color={progress[ph.id]?T.success:T.muted} icon={progress[ph.id]?"✓":""} onClick={()=>toggle(ph.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SCREEN 8 — MONITOR
═══════════════════════════════════════════════════════════════════════════ */
function MonitorScreen({ analysis }) {
  const [tick, setTick] = useState(0);
  const [history, setHistory] = useState(() =>
    Array.from({length:12},(_,i)=>({ t:`${(11-i)*5}m`, do:4+Math.random()*4, ph:6.5+Math.random()*2, turb:20+Math.random()*60, temp:22+Math.random()*8 })).reverse()
  );

  useEffect(()=>{
    const iv = setInterval(()=>{
      setTick(t=>t+1);
      setHistory(h=>{
        const last = h[h.length-1];
        return [...h.slice(-23),{
          t:"now",
          do: Math.max(1,Math.min(12, last.do + (Math.random()-.5)*.6)),
          ph: Math.max(5.5,Math.min(9,  last.ph + (Math.random()-.5)*.1)),
          turb: Math.max(5,Math.min(100, last.turb + (Math.random()-.5)*5)),
          temp: Math.max(18,Math.min(38, last.temp + (Math.random()-.5)*.3)),
        }];
      });
    },3000);
    return ()=>clearInterval(iv);
  },[]);

  const latest = history[history.length-1];
  const sensors = [
    { label:"DISSOLVED OXYGEN", value:latest.do.toFixed(2), unit:"mg/L", ideal:"6-9",  color:latest.do<4?T.danger:latest.do<6?T.warn:T.success },
    { label:"pH LEVEL",         value:latest.ph.toFixed(2), unit:"pH",   ideal:"6.5-8.5", color:latest.ph<6||latest.ph>9?T.danger:latest.ph<6.5||latest.ph>8.5?T.warn:T.success },
    { label:"TURBIDITY",        value:latest.turb.toFixed(1), unit:"NTU", ideal:"<10", color:latest.turb>50?T.danger:latest.turb>25?T.warn:T.success },
    { label:"TEMPERATURE",      value:latest.temp.toFixed(1), unit:"°C",  ideal:"<28", color:latest.temp>32?T.danger:latest.temp>28?T.warn:T.success },
  ];

  const Spark = ({ data, color, height=40 }) => {
    const max = Math.max(...data), min = Math.min(...data), range = max-min||1;
    const pts = data.map((v,i)=>`${(i/(data.length-1))*100},${height-((v-min)/range)*(height-4)}`).join(" ");
    return (
      <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round"
          style={{ filter:`drop-shadow(0 0 3px ${color})` }} />
      </svg>
    );
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp .4s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div style={{ color:T.muted, fontSize:9, fontFamily:T.mono, letterSpacing:4, marginBottom:4 }}>REAL-TIME SENSOR NETWORK</div>
          <h2 style={{ fontFamily:T.display, fontWeight:900, fontSize:20, color:T.accent }}>LIVE MONITORING</h2>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:7, background:T.panel, border:`1px solid ${T.border}`, borderRadius:6, padding:"5px 12px" }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:T.success, animation:"pulse 1s ease infinite" }} />
          <span style={{ color:T.success, fontFamily:T.mono, fontSize:9 }}>LIVE · UPDATING EVERY 3s</span>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        {sensors.map(s => (
          <Card key={s.label} style={{ border:`1px solid ${s.color}44` }}>
            <div style={{ color:T.muted, fontSize:8, fontFamily:T.mono, letterSpacing:2, marginBottom:6 }}>{s.label}</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:5, marginBottom:6 }}>
              <span style={{ color:s.color, fontFamily:T.display, fontWeight:900, fontSize:24, filter:`drop-shadow(0 0 8px ${s.color})` }}>{s.value}</span>
              <span style={{ color:T.muted, fontSize:9, fontFamily:T.mono }}>{s.unit}</span>
            </div>
            <Spark data={history.map(h=>h[Object.keys(h)[sensors.indexOf(s)+1]]||0)} color={s.color} />
            <div style={{ color:T.muted, fontSize:8, fontFamily:T.mono, marginTop:4 }}>IDEAL: {s.ideal}</div>
          </Card>
        ))}
      </div>

      <Card>
        <SectionTitle icon="📊" title="LIVE SENSOR LOG" />
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:T.mono, fontSize:10 }}>
            <thead>
              <tr>
                {["TIME","DO (mg/L)","pH","TURBIDITY (NTU)","TEMP (°C)"].map(h=>(
                  <th key={h} style={{ color:T.muted, textAlign:"left", padding:"6px 10px", borderBottom:`1px solid ${T.border}`, letterSpacing:1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...history].reverse().slice(0,10).map((r,i)=>(
                <tr key={i} style={{ background:i===0?`${T.accent}08`:"transparent", transition:"background .3s" }}>
                  <td style={{ padding:"5px 10px", color:i===0?T.accent:T.muted }}>{i===0?"● NOW":r.t}</td>
                  <td style={{ padding:"5px 10px", color:r.do<4?T.danger:r.do<6?T.warn:T.success }}>{r.do.toFixed(2)}</td>
                  <td style={{ padding:"5px 10px", color:r.ph<6.5||r.ph>8.5?T.warn:T.text }}>{r.ph.toFixed(2)}</td>
                  <td style={{ padding:"5px 10px", color:r.turb>50?T.danger:r.turb>25?T.warn:T.text }}>{r.turb.toFixed(1)}</td>
                  <td style={{ padding:"5px 10px", color:r.temp>30?T.warn:T.text }}>{r.temp.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   SCREEN 9 — REPORT
═══════════════════════════════════════════════════════════════════════════ */
function ReportScreen({ analysis }) {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);

  const gen = async () => {
    if (!analysis) return;
    setLoading(true);
    const r = await askClaude(
      `Write a formal environmental intelligence report for ${analysis.wb.name}, ${analysis.wb.place}.
       Score: ${analysis.score}/100. Status: ${scoreLabel(analysis.score)}. Pollution: ${analysis.pollution}.
       Confidence: ${analysis.confidence}%. Turbidity: ${analysis.turbidity}%, Heavy metals: ${analysis.heavyMetals}%, DO: ${analysis.doLevel}%.
       Affected: ${analysis.affectedKm} km², Spread: ${analysis.spreadRate} km/day.

       Include these sections:
       1. EXECUTIVE SUMMARY
       2. CURRENT STATUS ASSESSMENT
       3. POLLUTION SOURCE ANALYSIS
       4. HEALTH RISK EVALUATION
       5. RECOMMENDED INTERVENTIONS
       6. MONITORING PROTOCOL
       7. REGULATORY COMPLIANCE (India CPCB standards)

       Be specific, technical, and actionable.`,
      "You are an expert environmental scientist writing formal water quality intelligence reports for Indian regulatory bodies."
    );
    setReport(r); setLoading(false);
  };

  if (!analysis) return <EmptyState icon="📋" msg="COMPLETE ANALYSIS FIRST TO GENERATE REPORT" />;
  if (loading) return <Loader text="GENERATING FULL REPORT..." />;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp .4s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div style={{ color:T.muted, fontSize:9, fontFamily:T.mono, letterSpacing:4, marginBottom:4 }}>ENVIRONMENTAL INTELLIGENCE</div>
          <h2 style={{ fontFamily:T.display, fontWeight:900, fontSize:20, color:T.success }}>FULL REPORT</h2>
        </div>
        <ActionBtn label={report?"REGENERATE":"GENERATE REPORT"} color={T.success} icon="📋" onClick={gen} />
      </div>
      {!report ? (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:300, gap:12 }}>
          <div style={{ color:T.muted, fontFamily:T.mono, fontSize:11 }}>Ready to generate report for <span style={{ color:T.accent }}>{analysis.wb.name}</span></div>
        </div>
      ) : (
        <Card glow style={{ borderColor:T.success }}>
          <div style={{ whiteSpace:"pre-wrap", color:T.text, fontSize:11, lineHeight:2, fontFamily:T.mono }}>{report}</div>
        </Card>
      )}
    </div>
  );
}

/* ─── EMPTY STATE ────────────────────────────────────────────────────────── */
function EmptyState({ icon, msg }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:380, gap:12 }}>
      <span style={{ fontSize:52 }}>{icon}</span>
      <span style={{ color:T.muted, fontFamily:T.mono, fontSize:11, letterSpacing:3 }}>{msg}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState("map");
  const [selected, setSelected] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [aLoading, setALoading] = useState(false);
  const [pLoading, setPLoading] = useState(false);

  const handleSelect = useCallback(wb => {
    setSelected(wb); setAnalysis(null); setPrediction(null);
  }, []);

  const handleSelectAndAnalyze = useCallback(wb => {
    setSelected(wb); setAnalysis(null); setPrediction(null);
    setScreen("analysis");
    setTimeout(async () => {
      setALoading(true);
      const a = await generateAnalysis(wb);
      setAnalysis(a); setALoading(false);
    }, 80);
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!selected) return;
    setALoading(true);
    const a = await generateAnalysis(selected);
    setAnalysis(a); setALoading(false);
  }, [selected]);

  const runPrediction = useCallback(async () => {
    if (!analysis) return;
    setPLoading(true);
    const p = await generatePrediction(analysis);
    setPrediction(p); setPLoading(false);
  }, [analysis]);

  return (
    <>
      <GS />
      <div style={{ display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden" }}>
        <Header selected={selected} />
        <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
          <Sidebar active={screen} setActive={setScreen} selected={selected} />
          <main style={{ flex:1, overflow:"auto", padding:18 }}>
            {screen==="map"      && <MapScreen      selected={selected} onSelect={handleSelectAndAnalyze} />}
            {screen==="analysis" && <AnalysisScreen analysis={analysis} loading={aLoading} selected={selected} onRun={runAnalysis} />}
            {screen==="predict"  && <PredictScreen  prediction={prediction} loading={pLoading} analysis={analysis} onRun={runPrediction} />}
            {screen==="simulate" && <SimulateScreen analysis={analysis} />}
            {screen==="actions"  && <ActionsScreen  analysis={analysis} selected={selected} />}
            {screen==="alerts"   && <AlertsScreen   analysis={analysis} />}
            {screen==="restore"  && <RestoreScreen  analysis={analysis} />}
            {screen==="monitor"  && <MonitorScreen  analysis={analysis} />}
            {screen==="report"   && <ReportScreen   analysis={analysis} />}
          </main>
        </div>
      </div>
    </>
  );
}