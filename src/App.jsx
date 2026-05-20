import React, { useState, useEffect, useRef } from "react";
import {
  ChefHat, Utensils, ClipboardList, Receipt, Package, Users, BarChart3,
  Wallet, Settings, LogOut, Plus, Minus, Trash2, Check, Clock,
  CheckCircle2, FileText, TrendingUp, X, Edit3, Save, AlertTriangle,
  CreditCard, Banknote, Grid3x3, DollarSign, ChevronRight, ShoppingCart,
  Bike, History, Volume2, VolumeX, Download, Upload, Shield, Calculator,
  ArrowRightLeft, PackageMinus, ClipboardCheck
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { store, subscribeRealtime } from "./storage";

/* ====================== PALETA / ESTILOS ====================== */
const T = {
  bg: "#FBF6EE", surface: "#FFFFFF", surfaceAlt: "#F5ECDE",
  ink: "#2B2421", inkSoft: "#7A6E63", line: "#E7DAC7",
  primary: "#C0532A", primaryDk: "#9F411E",
  green: "#1E6F58", gold: "#C7972E", danger: "#B23B3B", warn: "#C77D2E",
};
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Outfit:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.app{font-family:'Outfit',system-ui,sans-serif;color:${T.ink};background:${T.bg};min-height:100vh;-webkit-font-smoothing:antialiased}
.serif{font-family:'Fraunces',Georgia,serif}
.app button{font-family:inherit;cursor:pointer;border:none;background:none}
.app input,.app select,.app textarea{font-family:inherit;font-size:14px;color:${T.ink};background:${T.surface};
  border:1px solid ${T.line};border-radius:10px;padding:10px 12px;width:100%;outline:none}
.app input:focus,.app select:focus,.app textarea:focus{border-color:${T.primary};box-shadow:0 0 0 3px rgba(192,83,42,.12)}
.btn{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:14px;border-radius:11px;
  padding:11px 18px;transition:.15s;white-space:nowrap}
.btn-p{background:${T.primary};color:#fff}.btn-p:hover{background:${T.primaryDk}}
.btn-g{background:${T.green};color:#fff}.btn-g:hover{filter:brightness(1.08)}
.btn-o{background:${T.surface};color:${T.ink};border:1px solid ${T.line}}.btn-o:hover{background:${T.surfaceAlt}}
.btn-d{background:#fff;color:${T.danger};border:1px solid #E7C9C9}.btn-d:hover{background:#FBEEEE}
.btn:disabled{opacity:.45;cursor:not-allowed}
.card{background:${T.surface};border:1px solid ${T.line};border-radius:18px}
.lbl{font-size:12px;font-weight:600;color:${T.inkSoft};text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px;display:block}
.tag{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px}
.scroll::-webkit-scrollbar{width:8px;height:8px}.scroll::-webkit-scrollbar-thumb{background:${T.line};border-radius:8px}
.row{display:flex;gap:10px;align-items:center}
.grid{display:grid;gap:16px}
table{width:100%;border-collapse:collapse}
th{text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:${T.inkSoft};
  padding:10px 12px;border-bottom:2px solid ${T.line};font-weight:700}
td{padding:11px 12px;border-bottom:1px solid ${T.line};font-size:14px}
tr:last-child td{border-bottom:none}
.navlink{display:flex;align-items:center;gap:11px;width:100%;text-align:left;padding:10px 13px;border-radius:11px;
  font-weight:600;font-size:13.5px;color:${T.inkSoft};transition:.13s}
.navlink:hover{background:${T.surfaceAlt};color:${T.ink}}
.navlink.on{background:${T.primary};color:#fff}
.modalbg{position:fixed;inset:0;background:rgba(43,36,33,.55);display:flex;align-items:center;
  justify-content:center;padding:18px;z-index:50;backdrop-filter:blur(3px)}
.modal{background:${T.surface};border-radius:20px;width:100%;max-width:520px;max-height:90vh;overflow:auto;
  border:1px solid ${T.line}}
@media(max-width:860px){.hide-m{display:none!important}}
`;

/* ====================== UTILIDADES ====================== */
const uid = () => Math.random().toString(36).slice(2, 10);
const money = (n) => "$" + Math.round(Number(n) || 0).toLocaleString("es-CO");
const todayISO = () => new Date().toISOString().slice(0, 10);
const monthKey = (d) => (d || todayISO()).slice(0, 7);
const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const ROLES = {
  admin: { label: "Administrador", icon: BarChart3, color: T.primary },
  cocinero: { label: "Cocinero", icon: ChefHat, color: T.gold },
  mesero: { label: "Mesero", icon: Utensils, color: T.green },
};
const STATUS = {
  pendiente: { label: "Pendiente", c: T.warn, bg: "#FBEFDF" },
  preparacion: { label: "En preparación", c: T.gold, bg: "#FBF1D8" },
  lista: { label: "Lista", c: T.green, bg: "#DCEEE7" },
  pagada: { label: "Pagada", c: T.inkSoft, bg: "#EEE7DC" },
  cancelada: { label: "Cancelada", c: T.danger, bg: "#F6E4E4" },
};
const OTYPE = {
  mesa: { label: "Mesa", icon: Grid3x3 },
  llevar: { label: "Para llevar", icon: ShoppingCart },
  domicilio: { label: "Domicilio", icon: Bike },
};
const elapsed = (iso) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return m + " min";
  return Math.floor(m / 60) + "h " + (m % 60) + "m";
};
const productCost = (p, inv) =>
  (p.recipe || []).reduce((s, r) => {
    const it = inv.find((i) => i.id === r.invId);
    return s + (it ? Number(it.unitCost) * Number(r.qty) : 0);
  }, 0);

/* ====================== ALMACENAMIENTO (Supabase) ======================
   `store` (get/set) y `subscribeRealtime` se importan desde ./storage.js,
   que habla con la base de datos PostgreSQL de Supabase. Los datos quedan
   compartidos entre todos los dispositivos y usuarios en tiempo real. */
const KEY_CORE = "resto:core:v2";
const KEY_ORD = "resto:orders:v2";
const KEY_LOG = "resto:logs:v2";

/* ====================== SEMILLA ====================== */
const seedCore = () => ({
  config: { name: "Sabores del Patio", tables: 6, sound: true },
  users: [
    { id: "u1", username: "admin", password: "admin", name: "Ana Restrepo", role: "admin" },
    { id: "u2", username: "cocinero", password: "cocinero", name: "Carlos Gómez", role: "cocinero" },
    { id: "u3", username: "mesero", password: "mesero", name: "María López", role: "mesero" },
  ],
  inventory: [
    { id: "i1", name: "Arroz", unit: "kg", stock: 25, minStock: 10, unitCost: 3200 },
    { id: "i2", name: "Carne de res", unit: "kg", stock: 12, minStock: 8, unitCost: 22000 },
    { id: "i3", name: "Pollo", unit: "kg", stock: 9, minStock: 10, unitCost: 11000 },
    { id: "i4", name: "Papa", unit: "kg", stock: 30, minStock: 15, unitCost: 2200 },
    { id: "i5", name: "Gaseosa lata", unit: "und", stock: 40, minStock: 24, unitCost: 2500 },
    { id: "i6", name: "Fruta jugo", unit: "kg", stock: 14, minStock: 6, unitCost: 4500 },
  ],
  products: [
    { id: "p1", name: "Bandeja Paisa", category: "Platos fuertes", price: 28000, active: true,
      recipe: [{ invId: "i1", qty: 0.15 }, { invId: "i2", qty: 0.18 }] },
    { id: "p2", name: "Ajiaco Santafereño", category: "Platos fuertes", price: 24000, active: true,
      recipe: [{ invId: "i3", qty: 0.22 }, { invId: "i4", qty: 0.25 }] },
    { id: "p3", name: "Arepa con queso", category: "Entradas", price: 8000, active: true, recipe: [] },
    { id: "p4", name: "Empanadas (x3)", category: "Entradas", price: 9000, active: true, recipe: [] },
    { id: "p5", name: "Jugo natural", category: "Bebidas", price: 6000, active: true,
      recipe: [{ invId: "i6", qty: 0.2 }] },
    { id: "p6", name: "Gaseosa", category: "Bebidas", price: 4500, active: true,
      recipe: [{ invId: "i5", qty: 1 }] },
    { id: "p7", name: "Postre de natas", category: "Postres", price: 7000, active: true, recipe: [] },
  ],
  expenses: [
    { id: "e1", type: "fijo", category: "Arriendo", description: "Arriendo del local", amount: 2500000, date: todayISO() },
    { id: "e2", type: "fijo", category: "Servicios", description: "Energía, agua, gas, internet", amount: 850000, date: todayISO() },
    { id: "e3", type: "variable", category: "Insumos", description: "Verduras de la semana", amount: 320000, date: todayISO() },
  ],
  invoices: [
    { id: "f1", supplier: "Distribuidora La 14", number: "FAC-0921", date: todayISO(),
      dueDate: todayISO(), amount: 540000, description: "Carnes y pollo", paid: false },
  ],
  payroll: [
    { id: "n1", name: "Carlos Gómez", role: "cocinero", workDays: [0, 1, 2, 3, 4, 5], dailyRate: 65000 },
    { id: "n2", name: "María López", role: "mesero", workDays: [1, 2, 3, 4, 5], dailyRate: 50000 },
    { id: "n3", name: "Ana Restrepo", role: "admin", workDays: [0, 1, 2, 3, 4, 5], dailyRate: 90000 },
  ],
  purchaseOrders: [],
  cashClosures: [],
});
const seedLogs = () => ({ inv: [], audit: [] });

/* ====================== BASE UI ====================== */
function Modal({ title, onClose, children, wide }) {
  return (
    <div className="modalbg" onClick={onClose}>
      <div className="modal scroll" style={{ maxWidth: wide ? 700 : 520 }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 22px", borderBottom: `1px solid ${T.line}`,
          position: "sticky", top: 0, background: T.surface, zIndex: 2,
        }}>
          <h3 className="serif" style={{ fontSize: 20, fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{ color: T.inkSoft }}><X size={20} /></button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  );
}
const Tag = ({ s }) => (
  <span className="tag" style={{ background: STATUS[s].bg, color: STATUS[s].c }}>{STATUS[s].label}</span>
);
function Stat({ label, value, icon: Icon, color }) {
  return (
    <div className="card" style={{ padding: 18, flex: 1, minWidth: 160 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <span className="lbl" style={{ margin: 0 }}>{label}</span>
        <Icon size={18} style={{ color: color || T.primary }} />
      </div>
      <div className="serif" style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>{value}</div>
    </div>
  );
}
function Field({ label, ...p }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label className="lbl">{label}</label>
      <input {...p} />
    </div>
  );
}
function Empty({ icon: Icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "56px 20px", color: T.inkSoft }}>
      <Icon size={40} style={{ opacity: 0.4, marginBottom: 12 }} />
      <p style={{ fontSize: 15 }}>{text}</p>
    </div>
  );
}
function download(name, content, mime) {
  try {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) { alert("No se pudo descargar: " + e.message); }
}
function beep() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const play = (t) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = 880; o.type = "sine";
      o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.15);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.16);
    };
    play(0); play(0.2);
  } catch {}
}

/* ====================== LOGIN ====================== */
function Login({ users, onLogin }) {
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState("");
  const go = () => {
    const f = users.find((x) => x.username.toLowerCase() === u.trim().toLowerCase() && x.password === p);
    if (f) onLogin(f); else setErr("Usuario o contraseña incorrectos");
  };
  return (
    <div className="app" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 410 }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: T.primary, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <Utensils size={30} />
          </div>
          <h1 className="serif" style={{ fontSize: 30, fontWeight: 700 }}>Gestión de Restaurante</h1>
          <p style={{ color: T.inkSoft, marginTop: 6 }}>Ingresa con tu usuario</p>
        </div>
        <div className="card" style={{ padding: 26 }}>
          <Field label="Usuario" value={u} placeholder="usuario"
            onChange={(e) => { setU(e.target.value); setErr(""); }}
            onKeyDown={(e) => e.key === "Enter" && go()} />
          <Field label="Contraseña" type="password" value={p} placeholder="••••••"
            onChange={(e) => { setP(e.target.value); setErr(""); }}
            onKeyDown={(e) => e.key === "Enter" && go()} />
          {err && <p style={{ color: T.danger, fontSize: 13, marginBottom: 12 }}>{err}</p>}
          <button className="btn btn-p" style={{ width: "100%", justifyContent: "center" }} onClick={go}>
            Entrar <ChevronRight size={18} />
          </button>
        </div>
        <div className="card" style={{ padding: 16, marginTop: 16, background: T.surfaceAlt }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.inkSoft, marginBottom: 8 }}>CUENTAS DE PRUEBA</p>
          {[["admin", "admin", "Administrador"], ["cocinero", "cocinero", "Cocinero"], ["mesero", "mesero", "Mesero"]].map((r) => (
            <div key={r[0]} className="row" style={{ justifyContent: "space-between", fontSize: 13, padding: "3px 0" }}>
              <span>{r[2]}</span><code style={{ color: T.inkSoft }}>{r[0]} / {r[1]}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ====================== APP ====================== */
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [core, setCore] = useState(null);
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState(seedLogs());
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("");
  const skipCore = useRef(true);
  const skipOrd = useRef(true);
  const skipLog = useRef(true);
  const remoteCore = useRef(false);
  const remoteOrd = useRef(false);
  const remoteLog = useRef(false);

  // Carga inicial desde Supabase. Si la base está vacía (primer despliegue),
  // siembra los datos de ejemplo para que la app arranque con contenido.
  useEffect(() => {
    (async () => {
      const c = await store.get(KEY_CORE), o = await store.get(KEY_ORD), l = await store.get(KEY_LOG);
      let cc, oo, ll;
      try { cc = c ? JSON.parse(c) : seedCore(); } catch { cc = seedCore(); }
      try { oo = o ? JSON.parse(o) : []; } catch { oo = []; }
      try { ll = l ? JSON.parse(l) : seedLogs(); } catch { ll = seedLogs(); }
      if (!c) await store.set(KEY_CORE, cc);
      if (!o) await store.set(KEY_ORD, oo);
      if (!l) await store.set(KEY_LOG, ll);
      setCore(cc); setOrders(oo); setLogs(ll); setLoaded(true);
    })();
  }, []);

  // Guardado (con debounce). Si el cambio vino de otro dispositivo
  // (recarga remota) no lo reescribimos para evitar ecos.
  useEffect(() => {
    if (!loaded) return;
    if (skipCore.current) { skipCore.current = false; return; }
    if (remoteCore.current) { remoteCore.current = false; return; }
    const t = setTimeout(() => store.set(KEY_CORE, core), 400);
    return () => clearTimeout(t);
  }, [core, loaded]);
  useEffect(() => {
    if (!loaded) return;
    if (skipOrd.current) { skipOrd.current = false; return; }
    if (remoteOrd.current) { remoteOrd.current = false; return; }
    const t = setTimeout(() => store.set(KEY_ORD, orders), 400);
    return () => clearTimeout(t);
  }, [orders, loaded]);
  useEffect(() => {
    if (!loaded) return;
    if (skipLog.current) { skipLog.current = false; return; }
    if (remoteLog.current) { remoteLog.current = false; return; }
    const t = setTimeout(() => store.set(KEY_LOG, logs), 400);
    return () => clearTimeout(t);
  }, [logs, loaded]);

  // Sincronización en tiempo real: cuando otro dispositivo cambia algo,
  // recargamos esa parte sin volver a escribirla.
  useEffect(() => {
    if (!loaded) return;
    const sub = subscribeRealtime(async (key) => {
      if (key === KEY_CORE) {
        const v = await store.get(KEY_CORE);
        if (v) { try { remoteCore.current = true; setCore(JSON.parse(v)); } catch { remoteCore.current = false; } }
      } else if (key === KEY_ORD) {
        const v = await store.get(KEY_ORD);
        if (v != null) { try { remoteOrd.current = true; setOrders(JSON.parse(v)); } catch { remoteOrd.current = false; } }
      } else if (key === KEY_LOG) {
        const v = await store.get(KEY_LOG);
        if (v) { try { remoteLog.current = true; setLogs(JSON.parse(v)); } catch { remoteLog.current = false; } }
      }
    });
    return () => { try { sub && sub.unsubscribe && sub.unsubscribe(); } catch {} };
  }, [loaded]);

  const log = (action, who) =>
    setLogs((l) => ({ ...l, audit: [{ id: uid(), ts: Date.now(), user: who || user?.name || "sistema", action }, ...l.audit].slice(0, 600) }));

  const addMovements = (changes, type, note) => {
    setCore((c) => {
      const inv = c.inventory.map((x) => ({ ...x }));
      changes.forEach((ch) => { const i = inv.findIndex((v) => v.id === ch.invId); if (i >= 0) inv[i].stock = +(inv[i].stock + ch.delta).toFixed(3); });
      return { ...c, inventory: inv };
    });
    setLogs((l) => ({
      ...l,
      inv: [
        ...changes.map((ch) => {
          const it = core.inventory.find((v) => v.id === ch.invId);
          return { id: uid(), ts: Date.now(), type, invId: ch.invId, name: it?.name || "", qty: ch.delta, user: user?.name || "sistema", note: note || "" };
        }),
        ...l.inv,
      ].slice(0, 600),
    }));
  };

  const payOrder = (order, pm) => {
    const changes = [];
    order.items.forEach((it) => {
      const prod = core.products.find((p) => p.id === it.productId);
      (prod?.recipe || []).forEach((r) => changes.push({ invId: r.invId, delta: -(Number(r.qty) * it.qty) }));
    });
    if (changes.length) addMovements(changes, "venta", `Orden ${order.type === "mesa" ? "mesa " + order.table : OTYPE[order.type].label}`);
    setOrders((p) => p.map((o) => (o.id === order.id ? { ...o, status: "pagada", paidAt: new Date().toISOString(), paymentMethod: pm } : o)));
    log(`Cobró ${order.type === "mesa" ? "mesa " + order.table : OTYPE[order.type].label} · ${money(order.total)} · ${pm}`);
  };

  if (!loaded || !core)
    return (<div className="app" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{STYLE}</style><p style={{ color: T.inkSoft }}>Cargando…</p></div>);

  if (!user)
    return (<><style>{STYLE}</style><Login users={core.users} onLogin={(u) => {
      setUser(u); log(`Inició sesión`, u.name);
      setTab(u.role === "cocinero" ? "cocina" : u.role === "mesero" ? "nueva" : "ordenes");
    }} /></>);

  const NAV = {
    admin: [
      ["ordenes", "Órdenes", ClipboardList], ["cobrar", "Cobrar", CreditCard],
      ["caja", "Cierre de caja", Calculator], ["productos", "Productos y costeo", Utensils],
      ["inventario", "Inventario", Package], ["compras", "Compras", ShoppingCart],
      ["nomina", "Nómina", Users], ["gastos", "Gastos", Wallet],
      ["facturas", "Cuentas por pagar", FileText], ["contabilidad", "Contabilidad", Receipt],
      ["estadisticas", "Estadísticas", BarChart3], ["auditoria", "Auditoría", Shield],
      ["config", "Configuración", Settings],
    ],
    cocinero: [["cocina", "Cocina", ChefHat]],
    mesero: [
      ["nueva", "Nueva orden", Plus], ["mesas", "Mesas", Grid3x3],
      ["cobrar", "Cobrar", CreditCard], ["caja", "Cierre de caja", Calculator],
    ],
  }[user.role];

  const ctx = { core, setCore, orders, setOrders, logs, setLogs, user, log, addMovements, payOrder };
  const RoleIcon = ROLES[user.role].icon;

  return (
    <div className="app">
      <style>{STYLE}</style>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <aside className="hide-m" style={{ width: 250, background: T.surface, borderRight: `1px solid ${T.line}`,
          padding: 16, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflow: "auto" }}>
          <div className="row" style={{ marginBottom: 18, padding: "4px 6px" }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: T.primary, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center" }}><Utensils size={19} /></div>
            <div>
              <div className="serif" style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.1 }}>{core.config.name}</div>
              <div style={{ fontSize: 11, color: T.inkSoft }}>Panel de gestión</div>
            </div>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
            {NAV.map(([k, lbl, Icon]) => (
              <button key={k} className={"navlink" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>
                <Icon size={17} /> {lbl}
              </button>
            ))}
          </nav>
          <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 14, marginTop: 14 }}>
            <div className="row" style={{ marginBottom: 12, padding: "0 6px" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: T.surfaceAlt,
                display: "flex", alignItems: "center", justifyContent: "center", color: ROLES[user.role].color }}>
                <RoleIcon size={17} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{user.name}</div>
                <div style={{ fontSize: 11, color: T.inkSoft }}>{ROLES[user.role].label}</div>
              </div>
            </div>
            <button className="btn btn-o" style={{ width: "100%", justifyContent: "center" }}
              onClick={() => { log("Cerró sesión"); setUser(null); setTab(""); }}>
              <LogOut size={16} /> Salir
            </button>
          </div>
        </aside>

        <main style={{ flex: 1, padding: "26px clamp(16px,3vw,38px)", maxWidth: 1320 }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 className="serif" style={{ fontSize: 26, fontWeight: 700 }}>{NAV.find((n) => n[0] === tab)?.[1] || ""}</h2>
              <p style={{ color: T.inkSoft, fontSize: 13 }}>{core.config.name} · {ROLES[user.role].label}</p>
            </div>
            <button className="btn btn-o" onClick={() => { log("Cerró sesión"); setUser(null); setTab(""); }}>
              <LogOut size={16} /><span className="hide-m">Salir</span>
            </button>
          </div>

          {tab === "cocina" && <Cocina {...ctx} />}
          {tab === "nueva" && <NuevaOrden {...ctx} />}
          {tab === "mesas" && <Mesas {...ctx} />}
          {tab === "ordenes" && <Ordenes {...ctx} />}
          {tab === "cobrar" && <Cobrar {...ctx} />}
          {tab === "caja" && <Caja {...ctx} />}
          {tab === "productos" && <Productos {...ctx} />}
          {tab === "inventario" && <Inventario {...ctx} />}
          {tab === "compras" && <Compras {...ctx} />}
          {tab === "nomina" && <Nomina {...ctx} />}
          {tab === "gastos" && <Gastos {...ctx} />}
          {tab === "facturas" && <Facturas {...ctx} />}
          {tab === "contabilidad" && <Contabilidad {...ctx} />}
          {tab === "estadisticas" && <Estadisticas {...ctx} />}
          {tab === "auditoria" && <Auditoria {...ctx} />}
          {tab === "config" && <Config {...ctx} />}
        </main>
      </div>
    </div>
  );
}

/* ====================== COCINA ====================== */
function OrderCard({ o, children }) {
  const TI = OTYPE[o.type || "mesa"].icon;
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
        <div className="row">
          <span className="row" style={{ background: T.surfaceAlt, fontWeight: 700, fontSize: 13, padding: "5px 11px", borderRadius: 9, gap: 6 }}>
            <TI size={14} /> {o.type === "mesa" ? "Mesa " + o.table : OTYPE[o.type].label}
          </span>
          <Tag s={o.status} />
        </div>
        <span style={{ fontSize: 12, color: T.inkSoft }}><Clock size={12} style={{ verticalAlign: -2 }} /> {elapsed(o.createdAt)}</span>
      </div>
      {o.customer?.name && <p style={{ fontSize: 12, color: T.inkSoft, marginBottom: 8 }}>{o.customer.name} · {o.customer.phone}{o.customer.address ? " · " + o.customer.address : ""}</p>}
      <div style={{ marginBottom: 12 }}>
        {o.items.map((it, i) => (
          <div key={i} style={{ padding: "3px 0", fontSize: 14 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span><b>{it.qty}×</b> {it.name}</span>
              <span style={{ color: T.inkSoft }}>{money(it.price * it.qty)}</span>
            </div>
            {it.notes && <div style={{ fontSize: 12, color: T.warn, fontStyle: "italic" }}>↳ {it.notes}</div>}
          </div>
        ))}
      </div>
      <div className="row" style={{ justifyContent: "space-between", borderTop: `1px solid ${T.line}`, paddingTop: 10 }}>
        <span style={{ fontSize: 12, color: T.inkSoft }}>{o.waiter}</span>
        <b className="serif" style={{ fontSize: 16 }}>{money(o.total)}</b>
      </div>
      {children && <div style={{ marginTop: 12 }}>{children}</div>}
    </div>
  );
}
function Cocina({ orders, setOrders, core, setCore, log }) {
  const prev = useRef(null);
  const active = orders.filter((o) => ["pendiente", "preparacion"].includes(o.status));
  const ready = orders.filter((o) => o.status === "lista");
  useEffect(() => {
    const ids = orders.filter((o) => o.status === "pendiente").map((o) => o.id);
    if (prev.current !== null && core.config.sound) {
      if (ids.some((id) => !prev.current.includes(id))) beep();
    }
    prev.current = ids;
  }, [orders, core.config.sound]);
  const adv = (id, st) => {
    setOrders((p) => p.map((o) => (o.id === id ? { ...o, status: st, ...(st === "lista" ? { completedAt: new Date().toISOString() } : {}) } : o)));
    log(`Orden → ${STATUS[st].label}`);
  };
  return (
    <>
      <div className="row" style={{ gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <Stat label="Por preparar" value={active.length} icon={Clock} color={T.warn} />
        <Stat label="Listas" value={ready.length} icon={CheckCircle2} color={T.green} />
        <button className="btn btn-o" onClick={() => setCore((c) => ({ ...c, config: { ...c.config, sound: !c.config.sound } }))}>
          {core.config.sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
          {core.config.sound ? "Sonido activo" : "Sonido silenciado"}
        </button>
      </div>
      <h3 className="serif" style={{ fontSize: 18, marginBottom: 12 }}>En cocina</h3>
      {active.length === 0 ? <Empty icon={ChefHat} text="No hay órdenes pendientes" /> : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", marginBottom: 28 }}>
          {active.map((o) => (
            <OrderCard key={o.id} o={o}>
              {o.status === "pendiente" ? (
                <button className="btn btn-p" style={{ width: "100%", justifyContent: "center" }} onClick={() => adv(o.id, "preparacion")}>
                  <ChefHat size={16} /> Empezar preparación
                </button>
              ) : (
                <button className="btn btn-g" style={{ width: "100%", justifyContent: "center" }} onClick={() => adv(o.id, "lista")}>
                  <Check size={16} /> Terminar orden
                </button>
              )}
            </OrderCard>
          ))}
        </div>
      )}
      <h3 className="serif" style={{ fontSize: 18, marginBottom: 12 }}>Listas (esperando cobro)</h3>
      {ready.length === 0 ? <Empty icon={CheckCircle2} text="Ninguna orden lista" /> : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>
          {ready.map((o) => <OrderCard key={o.id} o={o} />)}
        </div>
      )}
    </>
  );
}

/* ====================== NUEVA ORDEN ====================== */
function NuevaOrden({ core, setOrders, user, log }) {
  const [type, setType] = useState("mesa");
  const [table, setTable] = useState(1);
  const [cart, setCart] = useState({});
  const [notes, setNotes] = useState({});
  const [cust, setCust] = useState({ name: "", phone: "", address: "" });
  const [q, setQ] = useState("");
  const prods = core.products.filter((p) => p.active);
  const cats = [...new Set(prods.map((p) => p.category))];
  const add = (p) => setCart((c) => ({ ...c, [p.id]: (c[p.id] || 0) + 1 }));
  const sub = (id) => setCart((c) => { const n = { ...c }; n[id] = (n[id] || 0) - 1; if (n[id] <= 0) { delete n[id]; } return n; });
  const items = Object.entries(cart).map(([id, qty]) => {
    const p = prods.find((x) => x.id === id);
    return { productId: id, name: p.name, price: p.price, qty, notes: notes[id] || "" };
  });
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const send = () => {
    if (!items.length) return;
    if (type === "domicilio" && !cust.name) { alert("Ingresa el nombre del cliente para domicilio"); return; }
    const o = {
      id: uid(), type, table: type === "mesa" ? Number(table) : 0, items,
      status: "pendiente", waiter: user.name, createdAt: new Date().toISOString(), total,
      customer: type === "mesa" ? null : { ...cust },
    };
    setOrders((p) => [o, ...p]);
    log(`Nueva orden ${type === "mesa" ? "mesa " + table : OTYPE[type].label} · ${money(total)}`);
    setCart({}); setNotes({}); setCust({ name: "", phone: "", address: "" });
    alert(`Orden enviada a cocina · ${type === "mesa" ? "Mesa " + table : OTYPE[type].label}`);
  };
  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr 340px", alignItems: "start" }}>
      <div>
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <label className="lbl">Tipo de pedido</label>
          <div className="row" style={{ gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            {Object.entries(OTYPE).map(([k, v]) => (
              <button key={k} className={"btn " + (type === k ? "btn-p" : "btn-o")} onClick={() => setType(k)}>
                <v.icon size={15} /> {v.label}
              </button>
            ))}
          </div>
          <div className="row" style={{ gap: 12, flexWrap: "wrap" }}>
            {type === "mesa" && (
              <div style={{ flex: 1, minWidth: 140 }}>
                <label className="lbl">Mesa</label>
                <select value={table} onChange={(e) => setTable(e.target.value)}>
                  {Array.from({ length: core.config.tables }, (_, i) => i + 1).map((n) => <option key={n} value={n}>Mesa {n}</option>)}
                </select>
              </div>
            )}
            {type !== "mesa" && (<>
              <div style={{ flex: 1, minWidth: 140 }}>
                <label className="lbl">Cliente</label>
                <input value={cust.name} onChange={(e) => setCust({ ...cust, name: e.target.value })} placeholder="Nombre" />
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <label className="lbl">Teléfono</label>
                <input value={cust.phone} onChange={(e) => setCust({ ...cust, phone: e.target.value })} placeholder="300…" />
              </div>
              {type === "domicilio" && (
                <div style={{ flex: 2, minWidth: 180 }}>
                  <label className="lbl">Dirección</label>
                  <input value={cust.address} onChange={(e) => setCust({ ...cust, address: e.target.value })} placeholder="Cra 00 #00-00" />
                </div>
              )}
            </>)}
            <div style={{ flex: 2, minWidth: 180 }}>
              <label className="lbl">Buscar producto</label>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre del plato…" />
            </div>
          </div>
        </div>
        {cats.map((cat) => {
          const list = prods.filter((p) => p.category === cat && p.name.toLowerCase().includes(q.toLowerCase()));
          if (!list.length) return null;
          return (
            <div key={cat} style={{ marginBottom: 20 }}>
              <h3 className="serif" style={{ fontSize: 16, marginBottom: 10, color: T.inkSoft }}>{cat}</h3>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))" }}>
                {list.map((p) => (
                  <button key={p.id} className="card" onClick={() => add(p)} style={{ padding: 14, textAlign: "left" }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
                    <div className="row" style={{ justifyContent: "space-between" }}>
                      <span style={{ color: T.primary, fontWeight: 700 }}>{money(p.price)}</span>
                      {cart[p.id] && <span className="tag" style={{ background: T.primary, color: "#fff" }}>{cart[p.id]}</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="card" style={{ padding: 18, position: "sticky", top: 20 }}>
        <h3 className="serif" style={{ fontSize: 18, marginBottom: 4 }}>
          {type === "mesa" ? "Mesa " + table : OTYPE[type].label}
        </h3>
        <p style={{ fontSize: 12, color: T.inkSoft, marginBottom: 14 }}>Resumen de la orden</p>
        {items.length === 0 ? (
          <p style={{ color: T.inkSoft, fontSize: 14, padding: "20px 0", textAlign: "center" }}>Toca un producto para agregarlo</p>
        ) : (
          <div style={{ marginBottom: 14 }}>
            {items.map((it) => (
              <div key={it.productId} style={{ padding: "8px 0", borderBottom: `1px solid ${T.line}` }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{it.name}</div>
                    <div style={{ fontSize: 12, color: T.inkSoft }}>{money(it.price)} c/u</div>
                  </div>
                  <div className="row" style={{ gap: 6 }}>
                    <button className="btn btn-o" style={{ padding: 6 }} onClick={() => sub(it.productId)}><Minus size={14} /></button>
                    <b style={{ minWidth: 20, textAlign: "center" }}>{it.qty}</b>
                    <button className="btn btn-o" style={{ padding: 6 }} onClick={() => add(prods.find((p) => p.id === it.productId))}><Plus size={14} /></button>
                  </div>
                </div>
                <input value={notes[it.productId] || ""} placeholder="Nota (sin cebolla, término…)"
                  onChange={(e) => setNotes((n) => ({ ...n, [it.productId]: e.target.value }))}
                  style={{ marginTop: 6, padding: "6px 9px", fontSize: 12 }} />
              </div>
            ))}
          </div>
        )}
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontWeight: 600 }}>Total</span>
          <b className="serif" style={{ fontSize: 22, color: T.primary }}>{money(total)}</b>
        </div>
        <button className="btn btn-p" style={{ width: "100%", justifyContent: "center" }} disabled={!items.length} onClick={send}>
          Enviar a cocina
        </button>
      </div>
    </div>
  );
}

/* ====================== MESAS ====================== */
function Mesas({ core, orders }) {
  const n = core.config.tables;
  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" }}>
      {Array.from({ length: n }, (_, i) => i + 1).map((t) => {
        const act = orders.filter((o) => o.type === "mesa" && o.table === t && !["pagada", "cancelada"].includes(o.status));
        const busy = act.length > 0;
        const tot = act.reduce((s, o) => s + o.total, 0);
        return (
          <div key={t} className="card" style={{ padding: 18, borderColor: busy ? T.primary : T.line, background: busy ? "#FCF1EA" : T.surface }}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
              <span className="serif" style={{ fontSize: 22, fontWeight: 700 }}>Mesa {t}</span>
              <Grid3x3 size={18} style={{ color: busy ? T.primary : T.inkSoft }} />
            </div>
            {busy ? (<>
              <div style={{ fontSize: 13, marginBottom: 6 }}>{act.length} orden{act.length > 1 ? "es" : ""}</div>
              {act.map((o) => <div key={o.id} style={{ marginBottom: 4 }}><Tag s={o.status} /></div>)}
              <div className="serif" style={{ fontSize: 16, fontWeight: 700, marginTop: 8 }}>{money(tot)}</div>
            </>) : <span className="tag" style={{ background: T.surfaceAlt, color: T.inkSoft }}>Libre</span>}
          </div>
        );
      })}
    </div>
  );
}

/* ====================== ÓRDENES + TRASLADO ====================== */
function Ordenes({ orders, setOrders, core, log }) {
  const [f, setF] = useState("activas");
  const [mv, setMv] = useState(null);
  const [dest, setDest] = useState(1);
  const list = orders.filter((o) => f === "todas" ? true : f === "activas" ? !["pagada", "cancelada"].includes(o.status) : o.status === f);
  const adv = (id, st) => { setOrders((p) => p.map((o) => (o.id === id ? { ...o, status: st } : o))); log(`Orden → ${STATUS[st].label}`); };
  const transfer = () => {
    setOrders((p) => p.map((o) => (o.id === mv.id ? { ...o, type: "mesa", table: Number(dest) } : o)));
    log(`Trasladó orden de ${mv.type === "mesa" ? "mesa " + mv.table : OTYPE[mv.type].label} a mesa ${dest}`);
    setMv(null);
  };
  return (
    <>
      <div className="row" style={{ gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["activas", "pendiente", "preparacion", "lista", "pagada", "todas"].map((k) => (
          <button key={k} className={"btn " + (f === k ? "btn-p" : "btn-o")} onClick={() => setF(k)} style={{ padding: "8px 14px", fontSize: 13 }}>
            {k === "activas" ? "Activas" : k === "todas" ? "Todas" : STATUS[k]?.label || k}
          </button>
        ))}
      </div>
      {list.length === 0 ? <Empty icon={ClipboardList} text="No hay órdenes en esta vista" /> : (
        <div className="card scroll" style={{ overflow: "auto" }}>
          <table>
            <thead><tr><th>Origen</th><th>Items</th><th>Mesero</th><th>Hora</th><th>Total</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id}>
                  <td><b>{o.type === "mesa" ? "Mesa #" + o.table : OTYPE[o.type || "mesa"].label}</b></td>
                  <td style={{ maxWidth: 240 }}>{o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</td>
                  <td>{o.waiter}</td>
                  <td style={{ color: T.inkSoft }}>{elapsed(o.createdAt)}</td>
                  <td><b>{money(o.total)}</b></td>
                  <td><Tag s={o.status} /></td>
                  <td>
                    <div className="row" style={{ gap: 6 }}>
                      {o.status === "pendiente" && <button className="btn btn-o" style={{ padding: 7 }} title="Preparar" onClick={() => adv(o.id, "preparacion")}><ChefHat size={14} /></button>}
                      {o.status === "preparacion" && <button className="btn btn-o" style={{ padding: 7 }} title="Lista" onClick={() => adv(o.id, "lista")}><Check size={14} /></button>}
                      {!["pagada", "cancelada"].includes(o.status) && <button className="btn btn-o" style={{ padding: 7 }} title="Trasladar de mesa" onClick={() => { setMv(o); setDest(1); }}><ArrowRightLeft size={14} /></button>}
                      {!["pagada", "cancelada"].includes(o.status) && <button className="btn btn-d" style={{ padding: 7 }} title="Cancelar" onClick={() => window.confirm("¿Cancelar esta orden?") && adv(o.id, "cancelada")}><X size={14} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {mv && (
        <Modal title="Trasladar orden" onClose={() => setMv(null)}>
          <p style={{ marginBottom: 14, fontSize: 14 }}>
            Mover la orden de <b>{mv.type === "mesa" ? "mesa " + mv.table : OTYPE[mv.type].label}</b> ({money(mv.total)}) a otra mesa.
          </p>
          <label className="lbl">Mesa destino</label>
          <select value={dest} onChange={(e) => setDest(e.target.value)} style={{ marginBottom: 18 }}>
            {Array.from({ length: core.config.tables }, (_, i) => i + 1).map((n) => <option key={n} value={n}>Mesa {n}</option>)}
          </select>
          <button className="btn btn-p" style={{ width: "100%", justifyContent: "center" }} onClick={transfer}>
            <ArrowRightLeft size={16} /> Trasladar
          </button>
        </Modal>
      )}
    </>
  );
}

/* ====================== COBRAR + UNIR ====================== */
function Cobrar({ orders, core, payOrder }) {
  const [sel, setSel] = useState(null);
  const [pm, setPm] = useState("Efectivo");
  const ch = orders.filter((o) => ["lista", "preparacion", "pendiente"].includes(o.status));
  const groups = {};
  ch.forEach((o) => {
    const key = o.type === "mesa" ? "Mesa " + o.table : OTYPE[o.type].label + (o.customer?.name ? " · " + o.customer.name : "");
    (groups[key] = groups[key] || []).push(o);
  });
  const pay = (list) => {
    list.forEach((o) => payOrder(o, pm));
    setSel(null);
    alert(`Cobrado ${money(list.reduce((s, o) => s + o.total, 0))} · ${pm}`);
  };
  return (
    <>
      <p style={{ color: T.inkSoft, marginBottom: 16, fontSize: 14 }}>
        Cuentas pendientes (mesas 1 a {core.config.tables}, para llevar y domicilios). Puedes cobrar una orden o unir toda la cuenta de la mesa.
      </p>
      {Object.keys(groups).length === 0 ? <Empty icon={CreditCard} text="No hay cuentas pendientes por cobrar" /> : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))" }}>
          {Object.entries(groups).map(([k, os]) => {
            const tot = os.reduce((s, o) => s + o.total, 0);
            return (
              <div key={k} className="card" style={{ padding: 18 }}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
                  <span className="serif" style={{ fontSize: 19, fontWeight: 700 }}>{k}</span>
                  <span style={{ fontSize: 12, color: T.inkSoft }}>{os.length} orden(es)</span>
                </div>
                {os.map((o) => (
                  <div key={o.id} className="row" style={{ justifyContent: "space-between", fontSize: 13, padding: "4px 0" }}>
                    <Tag s={o.status} /><span>{money(o.total)}</span>
                  </div>
                ))}
                <div className="serif" style={{ fontSize: 22, fontWeight: 700, color: T.primary, margin: "12px 0" }}>{money(tot)}</div>
                {os.map((o) => (
                  <button key={o.id} className="btn btn-o" style={{ width: "100%", justifyContent: "center", marginBottom: 6, fontSize: 13 }} onClick={() => setSel({ list: [o], label: k })}>
                    Cobrar 1 orden ({money(o.total)})
                  </button>
                ))}
                {os.length > 1 && (
                  <button className="btn btn-g" style={{ width: "100%", justifyContent: "center" }} onClick={() => setSel({ list: os, label: k })}>
                    Unir y cobrar todo ({money(tot)})
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      {sel && (
        <Modal title={`Cobrar · ${sel.label}`} onClose={() => setSel(null)}>
          {sel.list.flatMap((o) => o.items).map((i, k) => (
            <div key={k} className="row" style={{ justifyContent: "space-between", padding: "6px 0", fontSize: 14 }}>
              <span>{i.qty}× {i.name}</span><span>{money(i.price * i.qty)}</span>
            </div>
          ))}
          <div className="row" style={{ justifyContent: "space-between", borderTop: `2px solid ${T.line}`, paddingTop: 12, marginTop: 8 }}>
            <b>Total a cobrar</b>
            <b className="serif" style={{ fontSize: 22, color: T.primary }}>{money(sel.list.reduce((s, o) => s + o.total, 0))}</b>
          </div>
          <label className="lbl" style={{ marginTop: 16 }}>Método de pago</label>
          <div className="row" style={{ gap: 8, marginBottom: 18 }}>
            {[["Efectivo", Banknote], ["Tarjeta", CreditCard], ["Transferencia", DollarSign]].map(([m, Ic]) => (
              <button key={m} className={"btn " + (pm === m ? "btn-p" : "btn-o")} style={{ flex: 1, justifyContent: "center" }} onClick={() => setPm(m)}>
                <Ic size={15} /> {m}
              </button>
            ))}
          </div>
          <button className="btn btn-g" style={{ width: "100%", justifyContent: "center" }} onClick={() => pay(sel.list)}>
            <Check size={16} /> Confirmar cobro
          </button>
        </Modal>
      )}
    </>
  );
}

/* ====================== CIERRE DE CAJA ====================== */
function Caja({ core, setCore, orders, user, log }) {
  const [base, setBase] = useState("");
  const [counted, setCounted] = useState("");
  const day = todayISO();
  const paidToday = orders.filter((o) => o.status === "pagada" && (o.paidAt || o.createdAt).slice(0, 10) === day);
  const by = { Efectivo: 0, Tarjeta: 0, Transferencia: 0 };
  paidToday.forEach((o) => { by[o.paymentMethod || "Efectivo"] += o.total; });
  const ventas = by.Efectivo + by.Tarjeta + by.Transferencia;
  const expected = Number(base || 0) + by.Efectivo;
  const diff = Number(counted || 0) - expected;
  const closeBox = () => {
    const rec = {
      id: uid(), date: day, openingCash: Number(base || 0), countedCash: Number(counted || 0),
      sales: { ...by }, expectedCash: expected, difference: diff, user: user.name, closedAt: new Date().toISOString(),
    };
    setCore((c) => ({ ...c, cashClosures: [rec, ...c.cashClosures] }));
    log(`Cierre de caja ${day} · dif ${money(diff)}`);
    setBase(""); setCounted("");
    alert(`Caja cerrada. Diferencia: ${money(diff)}`);
  };
  return (
    <>
      <div className="row" style={{ gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <Stat label="Ventas de hoy" value={money(ventas)} icon={TrendingUp} color={T.green} />
        <Stat label="Efectivo" value={money(by.Efectivo)} icon={Banknote} />
        <Stat label="Tarjeta" value={money(by.Tarjeta)} icon={CreditCard} />
        <Stat label="Transferencia" value={money(by.Transferencia)} icon={DollarSign} />
      </div>
      <div className="card" style={{ padding: 22, marginBottom: 22 }}>
        <h3 className="serif" style={{ fontSize: 18, marginBottom: 16 }}>Arqueo del día · {day}</h3>
        <div className="row" style={{ gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <Field label="Base inicial en caja" type="number" value={base} onChange={(e) => setBase(e.target.value)} placeholder="0" />
            <Field label="Efectivo contado al cierre" type="number" value={counted} onChange={(e) => setCounted(e.target.value)} placeholder="0" />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            {[["Base inicial", Number(base || 0)], ["+ Ventas en efectivo", by.Efectivo], ["= Efectivo esperado", expected]].map(([l, v], i) => (
              <div key={i} className="row" style={{ justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.line}`, fontWeight: i === 2 ? 700 : 400 }}>
                <span>{l}</span><span>{money(v)}</span>
              </div>
            ))}
            <div className="row" style={{ justifyContent: "space-between", padding: "12px 0" }}>
              <b>Diferencia</b>
              <b className="serif" style={{ fontSize: 20, color: diff === 0 ? T.green : diff > 0 ? T.gold : T.danger }}>
                {diff > 0 ? "+" : ""}{money(diff)}
              </b>
            </div>
            <button className="btn btn-p" style={{ width: "100%", justifyContent: "center" }} disabled={counted === ""} onClick={closeBox}>
              <ClipboardCheck size={16} /> Cerrar caja
            </button>
          </div>
        </div>
      </div>
      <h3 className="serif" style={{ fontSize: 18, marginBottom: 12 }}>Cierres anteriores</h3>
      {core.cashClosures.length === 0 ? <Empty icon={Calculator} text="Aún no se han registrado cierres" /> : (
        <div className="card scroll" style={{ overflow: "auto" }}>
          <table>
            <thead><tr><th>Fecha</th><th>Responsable</th><th>Ventas</th><th>Esperado efvo.</th><th>Contado</th><th>Diferencia</th></tr></thead>
            <tbody>
              {core.cashClosures.map((c) => (
                <tr key={c.id}>
                  <td><b>{c.date}</b></td><td>{c.user}</td>
                  <td>{money(c.sales.Efectivo + c.sales.Tarjeta + c.sales.Transferencia)}</td>
                  <td>{money(c.expectedCash)}</td><td>{money(c.countedCash)}</td>
                  <td style={{ color: c.difference === 0 ? T.green : T.danger, fontWeight: 700 }}>{money(c.difference)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* ====================== CRUD HELPER ====================== */
function useCrud(core, setCore, key) {
  const list = core[key] || [];
  const save = (item) => setCore((c) => ({
    ...c, [key]: item.id && c[key].some((x) => x.id === item.id)
      ? c[key].map((x) => (x.id === item.id ? item : x))
      : [{ ...item, id: item.id || uid() }, ...c[key]],
  }));
  const del = (id) => setCore((c) => ({ ...c, [key]: c[key].filter((x) => x.id !== id) }));
  return [list, save, del];
}

/* ====================== PRODUCTOS + COSTEO + RECETA ====================== */
function Productos({ core, setCore, log }) {
  const [list, save, del] = useCrud(core, setCore, "products");
  const [ed, setEd] = useState(null);
  const inv = core.inventory;
  const blank = { name: "", category: "Platos fuertes", price: "", active: true, recipe: [] };
  const [ri, setRi] = useState(""); const [rq, setRq] = useState("");
  const cost = ed ? productCost(ed, inv) : 0;
  const margin = ed ? Number(ed.price || 0) - cost : 0;
  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ color: T.inkSoft, fontSize: 14 }}>{list.length} productos · costo y margen calculados desde la receta</span>
        <button className="btn btn-p" onClick={() => { setEd(blank); setRi(inv[0]?.id || ""); setRq(""); }}><Plus size={16} /> Nuevo producto</button>
      </div>
      <div className="card scroll" style={{ overflow: "auto" }}>
        <table>
          <thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Costo</th><th>Margen</th><th>%</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {list.map((p) => {
              const c = productCost(p, inv); const m = p.price - c;
              const pct = p.price ? Math.round((m / p.price) * 100) : 0;
              return (
                <tr key={p.id}>
                  <td><b>{p.name}</b></td><td>{p.category}</td><td>{money(p.price)}</td>
                  <td style={{ color: T.inkSoft }}>{money(c)}</td>
                  <td><b style={{ color: m >= 0 ? T.green : T.danger }}>{money(m)}</b></td>
                  <td><span className="tag" style={{ background: pct >= 60 ? "#DCEEE7" : pct >= 30 ? "#FBF1D8" : "#F6E4E4", color: pct >= 60 ? T.green : pct >= 30 ? T.gold : T.danger }}>{pct}%</span></td>
                  <td><span className="tag" style={{ background: p.active ? "#DCEEE7" : "#F6E4E4", color: p.active ? T.green : T.danger }}>{p.active ? "Activo" : "Inactivo"}</span></td>
                  <td>
                    <div className="row" style={{ gap: 6 }}>
                      <button className="btn btn-o" style={{ padding: 7 }} onClick={() => { setEd({ ...p, recipe: p.recipe || [] }); setRi(inv[0]?.id || ""); setRq(""); }}><Edit3 size={14} /></button>
                      <button className="btn btn-d" style={{ padding: 7 }} onClick={() => window.confirm("¿Eliminar producto?") && (del(p.id), log(`Eliminó producto ${p.name}`))}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {ed && (
        <Modal title={ed.id ? "Editar producto" : "Nuevo producto"} onClose={() => setEd(null)} wide>
          <div className="row" style={{ gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <Field label="Nombre" value={ed.name} onChange={(e) => setEd({ ...ed, name: e.target.value })} />
              <div style={{ marginBottom: 14 }}>
                <label className="lbl">Categoría</label>
                <select value={ed.category} onChange={(e) => setEd({ ...ed, category: e.target.value })}>
                  {["Entradas", "Platos fuertes", "Bebidas", "Postres", "Otros"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Field label="Precio de venta" type="number" value={ed.price} onChange={(e) => setEd({ ...ed, price: e.target.value })} />
              <label className="row" style={{ gap: 8, marginBottom: 8, cursor: "pointer" }}>
                <input type="checkbox" style={{ width: "auto" }} checked={ed.active} onChange={(e) => setEd({ ...ed, active: e.target.checked })} />
                <span style={{ fontSize: 14 }}>Disponible en el menú</span>
              </label>
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <label className="lbl">Receta / ficha técnica</label>
              <div style={{ border: `1px solid ${T.line}`, borderRadius: 12, padding: 12, marginBottom: 10 }}>
                {(ed.recipe || []).length === 0 && <p style={{ fontSize: 12, color: T.inkSoft }}>Sin insumos. El costo será 0.</p>}
                {(ed.recipe || []).map((r, idx) => {
                  const it = inv.find((i) => i.id === r.invId);
                  return (
                    <div key={idx} className="row" style={{ justifyContent: "space-between", padding: "4px 0", fontSize: 13 }}>
                      <span>{r.qty} {it?.unit} {it?.name}</span>
                      <div className="row" style={{ gap: 8 }}>
                        <span style={{ color: T.inkSoft }}>{money((it?.unitCost || 0) * r.qty)}</span>
                        <button onClick={() => setEd({ ...ed, recipe: ed.recipe.filter((_, i) => i !== idx) })} style={{ color: T.danger }}><X size={13} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="row" style={{ gap: 6, marginBottom: 12 }}>
                <select value={ri} onChange={(e) => setRi(e.target.value)} style={{ flex: 2 }}>
                  {inv.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                </select>
                <input type="number" placeholder="Cant." value={rq} onChange={(e) => setRq(e.target.value)} style={{ flex: 1 }} />
                <button className="btn btn-o" style={{ padding: "9px 12px" }} disabled={!ri || !rq}
                  onClick={() => { setEd({ ...ed, recipe: [...(ed.recipe || []), { invId: ri, qty: Number(rq) }] }); setRq(""); }}>
                  <Plus size={14} />
                </button>
              </div>
              <div style={{ background: T.surfaceAlt, borderRadius: 12, padding: 14 }}>
                {[["Costo del plato", money(cost), T.ink], ["Precio de venta", money(ed.price || 0), T.ink],
                  ["Margen", money(margin), margin >= 0 ? T.green : T.danger]].map(([l, v, c], i) => (
                  <div key={i} className="row" style={{ justifyContent: "space-between", padding: "4px 0", fontWeight: i === 2 ? 700 : 500 }}>
                    <span>{l}</span><span style={{ color: c }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button className="btn btn-p" style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
            disabled={!ed.name || !ed.price}
            onClick={() => { save({ ...ed, price: Number(ed.price) }); log(`${ed.id ? "Editó" : "Creó"} producto ${ed.name}`); setEd(null); }}>
            <Save size={16} /> Guardar
          </button>
        </Modal>
      )}
    </>
  );
}

/* ====================== INVENTARIO + MOVIMIENTOS + MERMA ====================== */
function Inventario({ core, setCore, logs, addMovements, log }) {
  const [list, save, del] = useCrud(core, setCore, "inventory");
  const [ed, setEd] = useState(null);
  const [merma, setMerma] = useState(null);
  const [view, setView] = useState("stock");
  const blank = { name: "", unit: "kg", stock: "", minStock: "", unitCost: "" };
  const low = list.filter((i) => Number(i.stock) <= Number(i.minStock));
  const value = list.reduce((s, i) => s + i.stock * i.unitCost, 0);
  const MT = { entrada: ["Entrada", T.green], salida: ["Salida", T.danger], ajuste: ["Ajuste", T.gold],
    merma: ["Merma", T.danger], compra: ["Compra", T.green], venta: ["Venta", T.inkSoft] };
  return (
    <>
      <div className="row" style={{ gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <Stat label="Ítems" value={list.length} icon={Package} />
        <Stat label="Valor inventario" value={money(value)} icon={DollarSign} color={T.green} />
        <Stat label="Stock bajo" value={low.length} icon={AlertTriangle} color={T.danger} />
      </div>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div className="row" style={{ gap: 8 }}>
          <button className={"btn " + (view === "stock" ? "btn-p" : "btn-o")} style={{ padding: "8px 14px", fontSize: 13 }} onClick={() => setView("stock")}>Existencias</button>
          <button className={"btn " + (view === "mov" ? "btn-p" : "btn-o")} style={{ padding: "8px 14px", fontSize: 13 }} onClick={() => setView("mov")}><History size={14} /> Movimientos</button>
        </div>
        {view === "stock" && (
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-d" onClick={() => setMerma({ invId: list[0]?.id || "", qty: "", note: "" })}><PackageMinus size={16} /> Registrar merma</button>
            <button className="btn btn-p" onClick={() => setEd(blank)}><Plus size={16} /> Agregar ítem</button>
          </div>
        )}
      </div>
      {view === "stock" ? (
        <div className="card scroll" style={{ overflow: "auto" }}>
          <table>
            <thead><tr><th>Insumo</th><th>Stock</th><th>Mínimo</th><th>Costo unit.</th><th>Valor</th><th></th></tr></thead>
            <tbody>
              {list.map((i) => {
                const lowS = Number(i.stock) <= Number(i.minStock);
                return (
                  <tr key={i.id}>
                    <td><b>{i.name}</b></td>
                    <td><span style={{ color: lowS ? T.danger : T.ink, fontWeight: lowS ? 700 : 400 }}>{i.stock} {i.unit}</span>
                      {lowS && <AlertTriangle size={13} style={{ color: T.danger, verticalAlign: -2, marginLeft: 6 }} />}</td>
                    <td style={{ color: T.inkSoft }}>{i.minStock} {i.unit}</td>
                    <td>{money(i.unitCost)}</td><td><b>{money(i.stock * i.unitCost)}</b></td>
                    <td><div className="row" style={{ gap: 6 }}>
                      <button className="btn btn-o" style={{ padding: 7 }} onClick={() => setEd(i)}><Edit3 size={14} /></button>
                      <button className="btn btn-d" style={{ padding: 7 }} onClick={() => window.confirm("¿Eliminar ítem?") && (del(i.id), log(`Eliminó insumo ${i.name}`))}><Trash2 size={14} /></button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card scroll" style={{ overflow: "auto" }}>
          {logs.inv.length === 0 ? <Empty icon={History} text="Sin movimientos registrados aún" /> : (
            <table>
              <thead><tr><th>Fecha</th><th>Insumo</th><th>Tipo</th><th>Cantidad</th><th>Responsable</th><th>Nota</th></tr></thead>
              <tbody>
                {logs.inv.map((m) => (
                  <tr key={m.id}>
                    <td style={{ color: T.inkSoft, fontSize: 13 }}>{new Date(m.ts).toLocaleString("es-CO")}</td>
                    <td><b>{m.name}</b></td>
                    <td><span className="tag" style={{ background: T.surfaceAlt, color: (MT[m.type] || ["", T.ink])[1] }}>{(MT[m.type] || [m.type])[0]}</span></td>
                    <td style={{ color: m.qty < 0 ? T.danger : T.green, fontWeight: 700 }}>{m.qty > 0 ? "+" : ""}{m.qty}</td>
                    <td>{m.user}</td><td style={{ color: T.inkSoft }}>{m.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {ed && (
        <Modal title={ed.id ? "Editar ítem" : "Nuevo ítem"} onClose={() => setEd(null)}>
          <Field label="Nombre del insumo" value={ed.name} onChange={(e) => setEd({ ...ed, name: e.target.value })} />
          <div className="row" style={{ gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="lbl">Unidad</label>
              <select value={ed.unit} onChange={(e) => setEd({ ...ed, unit: e.target.value })}>
                {["kg", "g", "lt", "ml", "und", "caja"].map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}><Field label="Costo unitario" type="number" value={ed.unitCost} onChange={(e) => setEd({ ...ed, unitCost: e.target.value })} /></div>
          </div>
          <div className="row" style={{ gap: 12 }}>
            <div style={{ flex: 1 }}><Field label="Stock actual" type="number" value={ed.stock} onChange={(e) => setEd({ ...ed, stock: e.target.value })} /></div>
            <div style={{ flex: 1 }}><Field label="Stock mínimo" type="number" value={ed.minStock} onChange={(e) => setEd({ ...ed, minStock: e.target.value })} /></div>
          </div>
          <button className="btn btn-p" style={{ width: "100%", justifyContent: "center" }} disabled={!ed.name}
            onClick={() => { save({ ...ed, stock: Number(ed.stock), minStock: Number(ed.minStock), unitCost: Number(ed.unitCost) }); log(`${ed.id ? "Editó" : "Creó"} insumo ${ed.name}`); setEd(null); }}>
            <Save size={16} /> Guardar
          </button>
        </Modal>
      )}
      {merma && (
        <Modal title="Registrar merma / desperdicio" onClose={() => setMerma(null)}>
          <div style={{ marginBottom: 14 }}>
            <label className="lbl">Insumo</label>
            <select value={merma.invId} onChange={(e) => setMerma({ ...merma, invId: e.target.value })}>
              {list.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.unit}) · stock {i.stock}</option>)}
            </select>
          </div>
          <Field label="Cantidad perdida" type="number" value={merma.qty} onChange={(e) => setMerma({ ...merma, qty: e.target.value })} />
          <Field label="Motivo" value={merma.note} onChange={(e) => setMerma({ ...merma, note: e.target.value })} placeholder="Vencido, dañado, derrame…" />
          {(() => { const it = list.find((i) => i.id === merma.invId);
            return <p style={{ fontSize: 13, color: T.danger, marginBottom: 14 }}>Costo de la pérdida: {money((it?.unitCost || 0) * Number(merma.qty || 0))}</p>; })()}
          <button className="btn btn-d" style={{ width: "100%", justifyContent: "center" }} disabled={!merma.qty}
            onClick={() => { addMovements([{ invId: merma.invId, delta: -Number(merma.qty) }], "merma", merma.note || "Merma"); setMerma(null); }}>
            <PackageMinus size={16} /> Registrar merma
          </button>
        </Modal>
      )}
    </>
  );
}

/* ====================== COMPRAS (órdenes de compra) ====================== */
function Compras({ core, setCore, addMovements, log }) {
  const [list, save] = useCrud(core, setCore, "purchaseOrders");
  const inv = core.inventory;
  const [ed, setEd] = useState(null);
  const [ri, setRi] = useState(inv[0]?.id || ""); const [rq, setRq] = useState(""); const [rc, setRc] = useState("");
  const blank = { supplier: "", date: todayISO(), items: [], status: "pendiente" };
  const lineTotal = (it) => Number(it.qty) * Number(it.unitCost);
  const poTotal = (po) => po.items.reduce((s, i) => s + lineTotal(i), 0);
  const receive = (po) => {
    addMovements(po.items.map((i) => ({ invId: i.invId, delta: Number(i.qty) })), "compra", `OC ${po.supplier}`);
    setCore((c) => ({
      ...c,
      inventory: c.inventory.map((iv) => {
        const li = po.items.find((x) => x.invId === iv.id);
        return li ? { ...iv, unitCost: Number(li.unitCost) } : iv;
      }),
      purchaseOrders: c.purchaseOrders.map((x) => (x.id === po.id ? { ...x, status: "recibida", receivedAt: new Date().toISOString() } : x)),
      invoices: [{
        id: uid(), supplier: po.supplier, number: "OC-" + po.id.slice(0, 5).toUpperCase(),
        date: todayISO(), dueDate: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
        amount: poTotal(po), description: "Compra de insumos (recepción)", paid: false,
      }, ...c.invoices],
    }));
    log(`Recibió OC de ${po.supplier} · ${money(poTotal(po))} (genera cuenta por pagar)`);
  };
  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ color: T.inkSoft, fontSize: 14 }}>Al recibir una orden de compra se suma el stock y se crea una cuenta por pagar.</span>
        <button className="btn btn-p" onClick={() => { setEd(blank); setRi(inv[0]?.id || ""); setRq(""); setRc(""); }}><Plus size={16} /> Nueva orden de compra</button>
      </div>
      {list.length === 0 ? <Empty icon={ShoppingCart} text="No hay órdenes de compra" /> : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}>
          {list.map((po) => (
            <div key={po.id} className="card" style={{ padding: 18 }}>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                <span className="serif" style={{ fontSize: 17, fontWeight: 700 }}>{po.supplier}</span>
                <span className="tag" style={{ background: po.status === "recibida" ? "#DCEEE7" : "#FBEFDF", color: po.status === "recibida" ? T.green : T.warn }}>
                  {po.status === "recibida" ? "Recibida" : "Pendiente"}
                </span>
              </div>
              <p style={{ fontSize: 12, color: T.inkSoft, marginBottom: 10 }}>{po.date}</p>
              {po.items.map((i, k) => { const it = inv.find((v) => v.id === i.invId);
                return <div key={k} className="row" style={{ justifyContent: "space-between", fontSize: 13, padding: "3px 0" }}>
                  <span>{i.qty} {it?.unit} {it?.name}</span><span style={{ color: T.inkSoft }}>{money(lineTotal(i))}</span>
                </div>; })}
              <div className="serif" style={{ fontSize: 20, fontWeight: 700, color: T.primary, margin: "10px 0" }}>{money(poTotal(po))}</div>
              {po.status === "pendiente" && (
                <button className="btn btn-g" style={{ width: "100%", justifyContent: "center" }} onClick={() => window.confirm("¿Confirmar recepción de mercancía?") && receive(po)}>
                  <ClipboardCheck size={16} /> Recibir mercancía
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {ed && (
        <Modal title="Nueva orden de compra" onClose={() => setEd(null)} wide>
          <Field label="Proveedor" value={ed.supplier} onChange={(e) => setEd({ ...ed, supplier: e.target.value })} />
          <Field label="Fecha" type="date" value={ed.date} onChange={(e) => setEd({ ...ed, date: e.target.value })} />
          <label className="lbl">Insumos a pedir</label>
          <div style={{ border: `1px solid ${T.line}`, borderRadius: 12, padding: 12, marginBottom: 10 }}>
            {ed.items.length === 0 && <p style={{ fontSize: 12, color: T.inkSoft }}>Agrega al menos un insumo.</p>}
            {ed.items.map((i, idx) => { const it = inv.find((v) => v.id === i.invId);
              return <div key={idx} className="row" style={{ justifyContent: "space-between", padding: "4px 0", fontSize: 13 }}>
                <span>{i.qty} {it?.unit} {it?.name} @ {money(i.unitCost)}</span>
                <button onClick={() => setEd({ ...ed, items: ed.items.filter((_, x) => x !== idx) })} style={{ color: T.danger }}><X size={13} /></button>
              </div>; })}
          </div>
          <div className="row" style={{ gap: 6, marginBottom: 16 }}>
            <select value={ri} onChange={(e) => setRi(e.target.value)} style={{ flex: 2 }}>
              {inv.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
            </select>
            <input type="number" placeholder="Cant." value={rq} onChange={(e) => setRq(e.target.value)} style={{ flex: 1 }} />
            <input type="number" placeholder="Costo u." value={rc} onChange={(e) => setRc(e.target.value)} style={{ flex: 1 }} />
            <button className="btn btn-o" style={{ padding: "9px 12px" }} disabled={!rq || !rc}
              onClick={() => { setEd({ ...ed, items: [...ed.items, { invId: ri, qty: Number(rq), unitCost: Number(rc) }] }); setRq(""); setRc(""); }}>
              <Plus size={14} />
            </button>
          </div>
          <button className="btn btn-p" style={{ width: "100%", justifyContent: "center" }} disabled={!ed.supplier || !ed.items.length}
            onClick={() => { save(ed); log(`Creó OC para ${ed.supplier}`); setEd(null); }}>
            <Save size={16} /> Crear orden de compra
          </button>
        </Modal>
      )}
    </>
  );
}

/* ====================== NÓMINA ====================== */
function Nomina({ core, setCore, log }) {
  const [list, save, del] = useCrud(core, setCore, "payroll");
  const [ed, setEd] = useState(null);
  const blank = { name: "", role: "mesero", workDays: [], dailyRate: "" };
  const d = new Date(), y = d.getFullYear(), m = d.getMonth();
  const dim = new Date(y, m + 1, 0).getDate();
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (let i = 1; i <= dim; i++) counts[(new Date(y, m, i).getDay() + 6) % 7]++;
  const monthly = (e) => e.workDays.reduce((s, wd) => s + counts[wd] * Number(e.dailyRate), 0);
  const total = list.reduce((s, e) => s + monthly(e), 0);
  const toggleDay = (dd) => setEd((e) => ({ ...e, workDays: e.workDays.includes(dd) ? e.workDays.filter((x) => x !== dd) : [...e.workDays, dd] }));
  return (
    <>
      <div className="row" style={{ gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <Stat label="Empleados" value={list.length} icon={Users} />
        <Stat label="Nómina mensual estimada" value={money(total)} icon={Wallet} color={T.primary} />
      </div>
      <div className="row" style={{ justifyContent: "flex-end", marginBottom: 14 }}>
        <button className="btn btn-p" onClick={() => setEd(blank)}><Plus size={16} /> Agregar empleado</button>
      </div>
      <div className="card scroll" style={{ overflow: "auto" }}>
        <table>
          <thead><tr><th>Empleado</th><th>Rol</th><th>Días que labora</th><th>Pago/día</th><th>Mensual est.</th><th></th></tr></thead>
          <tbody>
            {list.map((e) => (
              <tr key={e.id}>
                <td><b>{e.name}</b></td><td>{ROLES[e.role]?.label || e.role}</td>
                <td><div className="row" style={{ gap: 4, flexWrap: "wrap" }}>
                  {DAYS.map((dd, di) => <span key={di} className="tag" style={{ padding: "2px 7px", fontSize: 11,
                    background: e.workDays.includes(di) ? T.primary : T.surfaceAlt, color: e.workDays.includes(di) ? "#fff" : T.inkSoft }}>{dd}</span>)}
                </div></td>
                <td>{money(e.dailyRate)}</td><td><b>{money(monthly(e))}</b></td>
                <td><div className="row" style={{ gap: 6 }}>
                  <button className="btn btn-o" style={{ padding: 7 }} onClick={() => setEd(e)}><Edit3 size={14} /></button>
                  <button className="btn btn-d" style={{ padding: 7 }} onClick={() => window.confirm("¿Eliminar?") && (del(e.id), log(`Eliminó de nómina ${e.name}`))}><Trash2 size={14} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {ed && (
        <Modal title={ed.id ? "Editar empleado" : "Nuevo empleado"} onClose={() => setEd(null)}>
          <Field label="Nombre completo" value={ed.name} onChange={(e) => setEd({ ...ed, name: e.target.value })} />
          <div style={{ marginBottom: 14 }}>
            <label className="lbl">Rol / cargo</label>
            <select value={ed.role} onChange={(e) => setEd({ ...ed, role: e.target.value })}>
              {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <label className="lbl">Días que labora</label>
          <div className="row" style={{ gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {DAYS.map((dd, di) => <button key={di} className={"btn " + (ed.workDays.includes(di) ? "btn-p" : "btn-o")} style={{ padding: "8px 12px", fontSize: 13 }} onClick={() => toggleDay(di)}>{dd}</button>)}
          </div>
          <Field label="Pago por día (COP)" type="number" value={ed.dailyRate} onChange={(e) => setEd({ ...ed, dailyRate: e.target.value })} />
          <button className="btn btn-p" style={{ width: "100%", justifyContent: "center" }} disabled={!ed.name || !ed.dailyRate}
            onClick={() => { save({ ...ed, dailyRate: Number(ed.dailyRate) }); log(`${ed.id ? "Editó" : "Agregó"} nómina ${ed.name}`); setEd(null); }}>
            <Save size={16} /> Guardar
          </button>
        </Modal>
      )}
    </>
  );
}

/* ====================== GASTOS ====================== */
function Gastos({ core, setCore, log }) {
  const [list, save, del] = useCrud(core, setCore, "expenses");
  const [ed, setEd] = useState(null); const [f, setF] = useState("todos");
  const blank = { type: "variable", category: "Insumos", description: "", amount: "", date: todayISO() };
  const shown = list.filter((e) => f === "todos" || e.type === f);
  const fijos = list.filter((e) => e.type === "fijo").reduce((s, e) => s + Number(e.amount), 0);
  const vars = list.filter((e) => e.type === "variable").reduce((s, e) => s + Number(e.amount), 0);
  return (
    <>
      <div className="row" style={{ gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <Stat label="Gastos fijos" value={money(fijos)} icon={Wallet} color={T.primary} />
        <Stat label="Gastos variables" value={money(vars)} icon={TrendingUp} color={T.warn} />
        <Stat label="Total" value={money(fijos + vars)} icon={DollarSign} color={T.danger} />
      </div>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div className="row" style={{ gap: 8 }}>
          {["todos", "fijo", "variable"].map((k) => (
            <button key={k} className={"btn " + (f === k ? "btn-p" : "btn-o")} style={{ padding: "8px 14px", fontSize: 13 }} onClick={() => setF(k)}>
              {k === "todos" ? "Todos" : k === "fijo" ? "Fijos" : "Variables"}
            </button>
          ))}
        </div>
        <button className="btn btn-p" onClick={() => setEd(blank)}><Plus size={16} /> Registrar gasto</button>
      </div>
      <div className="card scroll" style={{ overflow: "auto" }}>
        <table>
          <thead><tr><th>Tipo</th><th>Categoría</th><th>Descripción</th><th>Fecha</th><th>Monto</th><th></th></tr></thead>
          <tbody>
            {shown.map((e) => (
              <tr key={e.id}>
                <td><span className="tag" style={{ background: e.type === "fijo" ? "#EEE7DC" : "#FBEFDF", color: e.type === "fijo" ? T.primary : T.warn }}>{e.type === "fijo" ? "Fijo" : "Variable"}</span></td>
                <td><b>{e.category}</b></td><td style={{ color: T.inkSoft }}>{e.description}</td>
                <td>{e.date}</td><td><b>{money(e.amount)}</b></td>
                <td><div className="row" style={{ gap: 6 }}>
                  <button className="btn btn-o" style={{ padding: 7 }} onClick={() => setEd(e)}><Edit3 size={14} /></button>
                  <button className="btn btn-d" style={{ padding: 7 }} onClick={() => window.confirm("¿Eliminar gasto?") && (del(e.id), log(`Eliminó gasto ${e.category}`))}><Trash2 size={14} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {ed && (
        <Modal title={ed.id ? "Editar gasto" : "Registrar gasto"} onClose={() => setEd(null)}>
          <div style={{ marginBottom: 14 }}>
            <label className="lbl">Tipo de gasto</label>
            <div className="row" style={{ gap: 8 }}>
              {[["fijo", "Fijo (arriendo, servicios)"], ["variable", "Variable (insumos, otros)"]].map(([k, l]) => (
                <button key={k} className={"btn " + (ed.type === k ? "btn-p" : "btn-o")} style={{ flex: 1, justifyContent: "center", fontSize: 12 }} onClick={() => setEd({ ...ed, type: k })}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="lbl">Categoría</label>
            <select value={ed.category} onChange={(e) => setEd({ ...ed, category: e.target.value })}>
              {["Arriendo", "Servicios", "Nómina", "Insumos", "Mantenimiento", "Marketing", "Otros"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Field label="Descripción" value={ed.description} onChange={(e) => setEd({ ...ed, description: e.target.value })} />
          <div className="row" style={{ gap: 12 }}>
            <div style={{ flex: 1 }}><Field label="Monto" type="number" value={ed.amount} onChange={(e) => setEd({ ...ed, amount: e.target.value })} /></div>
            <div style={{ flex: 1 }}><Field label="Fecha" type="date" value={ed.date} onChange={(e) => setEd({ ...ed, date: e.target.value })} /></div>
          </div>
          <button className="btn btn-p" style={{ width: "100%", justifyContent: "center" }} disabled={!ed.amount}
            onClick={() => { save({ ...ed, amount: Number(ed.amount) }); log(`${ed.id ? "Editó" : "Registró"} gasto ${ed.category}`); setEd(null); }}>
            <Save size={16} /> Guardar
          </button>
        </Modal>
      )}
    </>
  );
}

/* ====================== CUENTAS POR PAGAR ====================== */
function Facturas({ core, setCore, log }) {
  const [list, save, del] = useCrud(core, setCore, "invoices");
  const [ed, setEd] = useState(null);
  const blank = { supplier: "", number: "", date: todayISO(), dueDate: todayISO(), amount: "", description: "", paid: false };
  const today = todayISO();
  const dstate = (i) => i.paid ? "pagada" : i.dueDate < today ? "vencida" : i.dueDate <= new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10) ? "porvencer" : "vigente";
  const SC = { pagada: ["Pagada", T.green, "#DCEEE7"], vencida: ["Vencida", T.danger, "#F6E4E4"], porvencer: ["Por vencer", T.warn, "#FBEFDF"], vigente: ["Vigente", T.inkSoft, "#EEE7DC"] };
  const pend = list.filter((i) => !i.paid).reduce((s, i) => s + Number(i.amount), 0);
  const venc = list.filter((i) => !i.paid && i.dueDate < today).reduce((s, i) => s + Number(i.amount), 0);
  return (
    <>
      <div className="row" style={{ gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <Stat label="Facturas" value={list.length} icon={FileText} />
        <Stat label="Por pagar" value={money(pend)} icon={DollarSign} color={T.warn} />
        <Stat label="Vencido" value={money(venc)} icon={AlertTriangle} color={T.danger} />
      </div>
      <div className="row" style={{ justifyContent: "flex-end", marginBottom: 14 }}>
        <button className="btn btn-p" onClick={() => setEd(blank)}><Plus size={16} /> Nueva factura</button>
      </div>
      <div className="card scroll" style={{ overflow: "auto" }}>
        <table>
          <thead><tr><th>N°</th><th>Proveedor</th><th>Concepto</th><th>Emisión</th><th>Vence</th><th>Monto</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {list.map((i) => { const st = dstate(i);
              return (
                <tr key={i.id}>
                  <td><b>{i.number}</b></td><td>{i.supplier}</td>
                  <td style={{ color: T.inkSoft }}>{i.description}</td>
                  <td>{i.date}</td><td>{i.dueDate}</td><td><b>{money(i.amount)}</b></td>
                  <td><span className="tag" style={{ background: SC[st][2], color: SC[st][1] }}>{SC[st][0]}</span></td>
                  <td><div className="row" style={{ gap: 6 }}>
                    {!i.paid && <button className="btn btn-o" style={{ padding: 7 }} title="Marcar pagada" onClick={() => { save({ ...i, paid: true }); log(`Pagó factura ${i.number}`); }}><Check size={14} /></button>}
                    <button className="btn btn-o" style={{ padding: 7 }} onClick={() => setEd(i)}><Edit3 size={14} /></button>
                    <button className="btn btn-d" style={{ padding: 7 }} onClick={() => window.confirm("¿Eliminar?") && (del(i.id), log(`Eliminó factura ${i.number}`))}><Trash2 size={14} /></button>
                  </div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {ed && (
        <Modal title={ed.id ? "Editar factura" : "Nueva factura"} onClose={() => setEd(null)}>
          <div className="row" style={{ gap: 12 }}>
            <div style={{ flex: 1 }}><Field label="N° de factura" value={ed.number} onChange={(e) => setEd({ ...ed, number: e.target.value })} /></div>
            <div style={{ flex: 1 }}><Field label="Emisión" type="date" value={ed.date} onChange={(e) => setEd({ ...ed, date: e.target.value })} /></div>
          </div>
          <Field label="Proveedor" value={ed.supplier} onChange={(e) => setEd({ ...ed, supplier: e.target.value })} />
          <Field label="Concepto" value={ed.description} onChange={(e) => setEd({ ...ed, description: e.target.value })} />
          <div className="row" style={{ gap: 12 }}>
            <div style={{ flex: 1 }}><Field label="Monto" type="number" value={ed.amount} onChange={(e) => setEd({ ...ed, amount: e.target.value })} /></div>
            <div style={{ flex: 1 }}><Field label="Vencimiento" type="date" value={ed.dueDate} onChange={(e) => setEd({ ...ed, dueDate: e.target.value })} /></div>
          </div>
          <label className="row" style={{ gap: 8, marginBottom: 16, cursor: "pointer" }}>
            <input type="checkbox" style={{ width: "auto" }} checked={ed.paid} onChange={(e) => setEd({ ...ed, paid: e.target.checked })} />
            <span style={{ fontSize: 14 }}>Ya está pagada</span>
          </label>
          <button className="btn btn-p" style={{ width: "100%", justifyContent: "center" }} disabled={!ed.number || !ed.amount}
            onClick={() => { save({ ...ed, amount: Number(ed.amount) }); log(`${ed.id ? "Editó" : "Creó"} factura ${ed.number}`); setEd(null); }}>
            <Save size={16} /> Guardar
          </button>
        </Modal>
      )}
    </>
  );
}

/* ====================== CONTABILIDAD ====================== */
function monthlyPayroll(payroll, ym) {
  const [y, m] = ym.split("-").map(Number);
  const dim = new Date(y, m, 0).getDate();
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (let d = 1; d <= dim; d++) counts[(new Date(y, m - 1, d).getDay() + 6) % 7]++;
  return payroll.reduce((s, e) => s + e.workDays.reduce((a, wd) => a + counts[wd] * Number(e.dailyRate), 0), 0);
}
function Contabilidad({ core, orders }) {
  const [ym, setYm] = useState(monthKey());
  const inM = (d) => d && d.slice(0, 7) === ym;
  const ingresos = orders.filter((o) => o.status === "pagada" && inM(o.paidAt || o.createdAt)).reduce((s, o) => s + o.total, 0);
  const gF = core.expenses.filter((e) => e.type === "fijo" && inM(e.date)).reduce((s, e) => s + Number(e.amount), 0);
  const gV = core.expenses.filter((e) => e.type === "variable" && inM(e.date)).reduce((s, e) => s + Number(e.amount), 0);
  const fact = core.invoices.filter((i) => inM(i.date)).reduce((s, i) => s + Number(i.amount), 0);
  const nom = monthlyPayroll(core.payroll, ym);
  const arr = core.expenses.filter((e) => e.category === "Arriendo" && inM(e.date)).reduce((s, e) => s + Number(e.amount), 0);
  const serv = core.expenses.filter((e) => e.category === "Servicios" && inM(e.date)).reduce((s, e) => s + Number(e.amount), 0);
  const egresos = gF + gV + fact + nom;
  const util = ingresos - egresos;
  const rows = [
    ["Ingresos por ventas", ingresos, T.green, "+"], ["Nómina (estimada)", nom, T.danger, "−"],
    ["Gastos fijos", gF, T.danger, "−"], ["  · Arriendo", arr, T.inkSoft, " "],
    ["  · Servicios", serv, T.inkSoft, " "], ["Gastos variables", gV, T.danger, "−"],
    ["Facturas de proveedores", fact, T.danger, "−"],
  ];
  const exportCSV = () => {
    const lines = [["Concepto", "Valor"], ...rows.map((r) => [r[0].trim(), r[1]]), ["Utilidad neta", util]];
    download(`contabilidad_${ym}.csv`, lines.map((l) => l.join(";")).join("\n"), "text/csv");
  };
  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <p style={{ color: T.inkSoft, fontSize: 14 }}>Estado de resultados del periodo</p>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-o" onClick={exportCSV}><Download size={15} /> Exportar Excel (CSV)</button>
          <input type="month" value={ym} onChange={(e) => setYm(e.target.value)} style={{ width: 170 }} />
        </div>
      </div>
      <div className="row" style={{ gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
        <Stat label="Ingresos" value={money(ingresos)} icon={TrendingUp} color={T.green} />
        <Stat label="Egresos" value={money(egresos)} icon={Wallet} color={T.danger} />
        <Stat label="Utilidad" value={money(util)} icon={DollarSign} color={util >= 0 ? T.green : T.danger} />
      </div>
      <div className="card" style={{ padding: 22 }}>
        <h3 className="serif" style={{ fontSize: 18, marginBottom: 16 }}>Detalle contable · {ym}</h3>
        {rows.map(([l, v, c, sg], i) => (
          <div key={i} className="row" style={{ justifyContent: "space-between", padding: "11px 0", borderBottom: `1px solid ${T.line}`, fontSize: l.startsWith("  ") ? 13 : 14 }}>
            <span style={{ color: l.startsWith("  ") ? T.inkSoft : T.ink, fontWeight: l.startsWith("  ") ? 400 : 600 }}>{l}</span>
            <span style={{ color: c, fontWeight: 600 }}>{sg} {money(v)}</span>
          </div>
        ))}
        <div className="row" style={{ justifyContent: "space-between", padding: "16px 0 4px", marginTop: 6 }}>
          <b className="serif" style={{ fontSize: 18 }}>Utilidad neta</b>
          <b className="serif" style={{ fontSize: 24, color: util >= 0 ? T.green : T.danger }}>{money(util)}</b>
        </div>
        <p style={{ fontSize: 12, color: T.inkSoft, marginTop: 8 }}>
          Margen: {ingresos > 0 ? Math.round((util / ingresos) * 100) : 0}% · La nómina se estima según los días laborados de cada empleado.
        </p>
      </div>
    </>
  );
}

/* ====================== ESTADÍSTICAS ====================== */
function Estadisticas({ core, orders }) {
  const paid = orders.filter((o) => o.status === "pagada");
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    days.push({ dia: iso.slice(5), ventas: paid.filter((o) => (o.paidAt || o.createdAt).slice(0, 10) === iso).reduce((s, o) => s + o.total, 0) });
  }
  const pc = {};
  paid.forEach((o) => o.items.forEach((it) => { pc[it.name] = (pc[it.name] || 0) + it.qty; }));
  const top = Object.entries(pc).map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty).slice(0, 6);
  const tt = {};
  paid.forEach((o) => { const k = o.type === "mesa" ? "Mesa " + o.table : OTYPE[o.type].label; tt[k] = (tt[k] || 0) + o.total; });
  const pie = Object.entries(tt).map(([name, value]) => ({ name, value }));
  const ym = monthKey();
  const ing = paid.filter((o) => (o.paidAt || o.createdAt).slice(0, 7) === ym).reduce((s, o) => s + o.total, 0);
  const egr = core.expenses.filter((e) => e.date.slice(0, 7) === ym).reduce((s, e) => s + Number(e.amount), 0)
    + core.invoices.filter((i) => i.date.slice(0, 7) === ym).reduce((s, i) => s + Number(i.amount), 0)
    + monthlyPayroll(core.payroll, ym);
  const ie = [{ name: "Este mes", Ingresos: ing, Egresos: egr }];
  const PIE = [T.primary, T.green, T.gold, T.warn, T.danger, "#8A6FA8"];
  const totV = paid.reduce((s, o) => s + o.total, 0);
  const tk = paid.length ? totV / paid.length : 0;
  const exportSales = () => {
    const rows = [["Fecha", "Tipo", "Mesa", "Total", "Pago"],
      ...paid.map((o) => [(o.paidAt || o.createdAt).slice(0, 10), o.type, o.table || "", o.total, o.paymentMethod || ""])];
    download("ventas.csv", rows.map((r) => r.join(";")).join("\n"), "text/csv");
  };
  if (paid.length === 0) return <Empty icon={BarChart3} text="Aún no hay ventas pagadas. Crea y cobra órdenes para ver reportes." />;
  return (
    <>
      <div className="row" style={{ gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
        <Stat label="Órdenes pagadas" value={paid.length} icon={Receipt} />
        <Stat label="Ventas totales" value={money(totV)} icon={TrendingUp} color={T.green} />
        <Stat label="Ticket promedio" value={money(tk)} icon={DollarSign} color={T.primary} />
        <button className="btn btn-o" onClick={exportSales}><Download size={15} /> Exportar ventas (CSV)</button>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))" }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 className="serif" style={{ fontSize: 16, marginBottom: 16 }}>Ventas últimos 7 días</h3>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={days}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.line} />
              <XAxis dataKey="dia" tick={{ fontSize: 12 }} stroke={T.inkSoft} />
              <YAxis tick={{ fontSize: 11 }} stroke={T.inkSoft} width={66} tickFormatter={(v) => "$" + v / 1000 + "k"} />
              <Tooltip formatter={(v) => money(v)} />
              <Line type="monotone" dataKey="ventas" stroke={T.primary} strokeWidth={3} dot={{ fill: T.primary, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h3 className="serif" style={{ fontSize: 16, marginBottom: 16 }}>Productos más vendidos</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={top} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={T.line} />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke={T.inkSoft} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} stroke={T.inkSoft} />
              <Tooltip /><Bar dataKey="qty" fill={T.green} radius={[0, 6, 6, 0]} name="Unidades" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h3 className="serif" style={{ fontSize: 16, marginBottom: 16 }}>Ventas por origen</h3>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={pie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {pie.map((e, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => money(v)} /><Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h3 className="serif" style={{ fontSize: 16, marginBottom: 16 }}>Ingresos vs Egresos (mes)</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={ie}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.line} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke={T.inkSoft} />
              <YAxis tick={{ fontSize: 11 }} stroke={T.inkSoft} width={66} tickFormatter={(v) => "$" + v / 1000 + "k"} />
              <Tooltip formatter={(v) => money(v)} /><Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Ingresos" fill={T.green} radius={[6, 6, 0, 0]} />
              <Bar dataKey="Egresos" fill={T.danger} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

/* ====================== AUDITORÍA ====================== */
function Auditoria({ logs }) {
  const [q, setQ] = useState("");
  const list = logs.audit.filter((a) => (a.user + a.action).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <p style={{ color: T.inkSoft, fontSize: 14 }}>Registro de acciones de los usuarios ({logs.audit.length})</p>
        <div style={{ width: 260 }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar usuario o acción…" />
        </div>
      </div>
      {list.length === 0 ? <Empty icon={Shield} text="Sin registros de auditoría" /> : (
        <div className="card scroll" style={{ overflow: "auto" }}>
          <table>
            <thead><tr><th>Fecha y hora</th><th>Usuario</th><th>Acción</th></tr></thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id}>
                  <td style={{ color: T.inkSoft, fontSize: 13, whiteSpace: "nowrap" }}>{new Date(a.ts).toLocaleString("es-CO")}</td>
                  <td><b>{a.user}</b></td><td>{a.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* ====================== CONFIGURACIÓN + RESPALDO ====================== */
function Config({ core, setCore, orders, setOrders, logs, setLogs, log }) {
  const [name, setName] = useState(core.config.name);
  const [tables, setTables] = useState(core.config.tables);
  const [users, saveU, delU] = useCrud(core, setCore, "users");
  const [ed, setEd] = useState(null);
  const fileRef = useRef(null);
  const blank = { username: "", password: "", name: "", role: "mesero" };
  const applyConfig = () => { setCore((c) => ({ ...c, config: { ...c.config, name, tables: Number(tables) } })); log("Actualizó configuración"); };
  const doBackup = () => {
    download(`respaldo_restaurante_${todayISO()}.json`, JSON.stringify({ v: 2, core, orders, logs }, null, 2), "application/json");
    log("Generó respaldo de datos");
  };
  const doRestore = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (!d.core) throw new Error("Archivo inválido");
        if (!window.confirm("Esto reemplazará TODOS los datos actuales. ¿Continuar?")) return;
        setCore(d.core); setOrders(d.orders || []); setLogs(d.logs || seedLogs());
        log("Restauró datos desde respaldo");
        alert("Datos restaurados correctamente.");
      } catch (err) { alert("No se pudo leer el archivo: " + err.message); }
    };
    r.readAsText(f); e.target.value = "";
  };
  return (
    <>
      <div className="card" style={{ padding: 22, marginBottom: 20 }}>
        <h3 className="serif" style={{ fontSize: 18, marginBottom: 16 }}>Datos del restaurante</h3>
        <Field label="Nombre del restaurante" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="lbl">Cantidad de mesas</label>
        <div className="row" style={{ gap: 10, marginBottom: 16 }}>
          <button className="btn btn-o" onClick={() => setTables((t) => Math.max(1, Number(t) - 1))}><Minus size={16} /></button>
          <input type="number" value={tables} min={1} max={50} onChange={(e) => setTables(e.target.value)} style={{ textAlign: "center", maxWidth: 90 }} />
          <button className="btn btn-o" onClick={() => setTables((t) => Math.min(50, Number(t) + 1))}><Plus size={16} /></button>
          <span style={{ color: T.inkSoft, fontSize: 13 }}>mesas habilitadas</span>
        </div>
        <label className="row" style={{ gap: 8, marginBottom: 16, cursor: "pointer" }}>
          <input type="checkbox" style={{ width: "auto" }} checked={core.config.sound}
            onChange={(e) => setCore((c) => ({ ...c, config: { ...c.config, sound: e.target.checked } }))} />
          <span style={{ fontSize: 14 }}>Alerta sonora cuando entra una orden a cocina</span>
        </label>
        <button className="btn btn-p" onClick={applyConfig}><Save size={16} /> Guardar cambios</button>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 20 }}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
          <h3 className="serif" style={{ fontSize: 18 }}>Usuarios del sistema</h3>
          <button className="btn btn-p" onClick={() => setEd(blank)}><Plus size={16} /> Nuevo usuario</button>
        </div>
        <div className="scroll" style={{ overflow: "auto" }}>
          <table>
            <thead><tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td><b>{u.name}</b></td><td><code style={{ color: T.inkSoft }}>{u.username}</code></td>
                  <td>{ROLES[u.role]?.label}</td>
                  <td><div className="row" style={{ gap: 6 }}>
                    <button className="btn btn-o" style={{ padding: 7 }} onClick={() => setEd(u)}><Edit3 size={14} /></button>
                    <button className="btn btn-d" style={{ padding: 7 }} disabled={users.length <= 1} onClick={() => window.confirm("¿Eliminar usuario?") && (delU(u.id), log(`Eliminó usuario ${u.username}`))}><Trash2 size={14} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 20 }}>
        <h3 className="serif" style={{ fontSize: 18, marginBottom: 8 }}>Respaldo y restauración</h3>
        <p style={{ color: T.inkSoft, fontSize: 13, marginBottom: 14 }}>
          Exporta todos los datos (configuración, productos, inventario, órdenes, contabilidad, auditoría) en un archivo, o restaura desde un respaldo previo.
        </p>
        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-p" onClick={doBackup}><Download size={16} /> Descargar respaldo</button>
          <button className="btn btn-o" onClick={() => fileRef.current?.click()}><Upload size={16} /> Restaurar respaldo</button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={doRestore} style={{ display: "none" }} />
        </div>
      </div>

      <div className="card" style={{ padding: 22, borderColor: "#E7C9C9" }}>
        <h3 className="serif" style={{ fontSize: 18, marginBottom: 8 }}>Zona de datos</h3>
        <p style={{ color: T.inkSoft, fontSize: 13, marginBottom: 14 }}>Borra el historial de órdenes. Configuración, productos e inventario se conservan.</p>
        <button className="btn btn-d" onClick={() => window.confirm("¿Borrar TODAS las órdenes?") && (setOrders([]), log("Vació historial de órdenes"))}>
          <Trash2 size={16} /> Vaciar historial de órdenes
        </button>
      </div>

      {ed && (
        <Modal title={ed.id ? "Editar usuario" : "Nuevo usuario"} onClose={() => setEd(null)}>
          <Field label="Nombre completo" value={ed.name} onChange={(e) => setEd({ ...ed, name: e.target.value })} />
          <div className="row" style={{ gap: 12 }}>
            <div style={{ flex: 1 }}><Field label="Usuario" value={ed.username} onChange={(e) => setEd({ ...ed, username: e.target.value })} /></div>
            <div style={{ flex: 1 }}><Field label="Contraseña" value={ed.password} onChange={(e) => setEd({ ...ed, password: e.target.value })} /></div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label className="lbl">Rol</label>
            <select value={ed.role} onChange={(e) => setEd({ ...ed, role: e.target.value })}>
              {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <button className="btn btn-p" style={{ width: "100%", justifyContent: "center" }} disabled={!ed.username || !ed.password || !ed.name}
            onClick={() => { saveU(ed); log(`${ed.id ? "Editó" : "Creó"} usuario ${ed.username}`); setEd(null); }}>
            <Save size={16} /> Guardar
          </button>
        </Modal>
      )}
    </>
  );
}
