"use client";
import { useEffect, useState } from "react";
import { Plus, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Pencil, Trash2, Check, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { COLORS, HEAD, MONO, fmt } from "../../lib/theme";
import Shell from "../../components/Shell";

function Kpi({ label, value, tone }) {
  return (
    <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 16, flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8, ...HEAD }}>{label}</div>
      <div style={{ fontSize: 20, color: tone || COLORS.text, ...MONO }}>{value}</div>
    </div>
  );
}

const shiftDate = (dateStr, delta) => {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
};

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [vista, setVista] = useState("mensual");
  const [dia, setDia] = useState(new Date().toISOString().slice(0, 10));

  const [tipo, setTipo] = useState("ingreso");
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");
  const [fechaForm, setFechaForm] = useState(new Date().toISOString().slice(0, 10));

  const [editandoId, setEditandoId] = useState(null);
  const [editTipo, setEditTipo] = useState("ingreso");
  const [editConcepto, setEditConcepto] = useState("");
  const [editMonto, setEditMonto] = useState("");
  const [editFecha, setEditFecha] = useState("");

  const empezarEdicion = (m) => {
    setEditandoId(m.id);
    setEditTipo(m.tipo);
    setEditConcepto(m.concepto);
    setEditMonto(String(m.monto));
    setEditFecha(m.fecha);
  };

  const guardarEdicion = async (id) => {
    const { error } = await supabase
      .from("movimientos")
      .update({ tipo: editTipo, concepto: editConcepto, monto: Number(editMonto), fecha: editFecha })
      .eq("id", id);
    if (!error) {
      setEditandoId(null);
      cargar();
    } else {
      alert("Error al guardar: " + error.message);
    }
  };

  const borrarMovimiento = async (id) => {
    if (!confirm("¿Borrar este movimiento?")) return;
    const { error } = await supabase.from("movimientos").delete().eq("id", id);
    if (!error) cargar();
    else alert("Error al borrar: " + error.message);
  };

  const cargar = async () => {
    setCargando(true);
    const { data } = await supabase.from("movimientos").select("*").order("fecha", { ascending: false });
    setMovimientos(data || []);
    setCargando(false);
  };

  useEffect(() => {
    cargar();
  }, []);

  const mesActual = dia.slice(0, 7);
  const enRango = movimientos.filter((m) => (vista === "diario" ? m.fecha === dia : m.fecha.slice(0, 7) === mesActual));
  const ingresos = enRango.filter((m) => m.tipo === "ingreso").reduce((a, b) => a + Number(b.monto), 0);
  const egresos = enRango.filter((m) => m.tipo === "egreso").reduce((a, b) => a + Number(b.monto), 0);

  const agregar = async () => {
    if (!concepto.trim() || !monto) return;
    const { error } = await supabase.from("movimientos").insert({ tipo, concepto, monto: Number(monto), fecha: fechaForm });
    if (!error) {
      setConcepto("");
      setMonto("");
      cargar();
    } else {
      alert("Error al guardar: " + error.message);
    }
  };

  const inputStyle = {
    background: COLORS.panelAlt,
    border: `1px solid ${COLORS.border}`,
    color: COLORS.text,
    borderRadius: 6,
    padding: "8px 12px",
    fontSize: 14,
    outline: "none",
  };

  return (
    <Shell title="Ingresos y egresos">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {["mensual", "diario"].map((v) => (
          <button
            key={v}
            onClick={() => setVista(v)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 12,
              textTransform: "capitalize",
              background: vista === v ? COLORS.accentDim : "transparent",
              color: vista === v ? COLORS.accent : COLORS.textMuted,
              border: `1px solid ${vista === v ? COLORS.accent : COLORS.border}`,
              ...HEAD,
            }}
          >
            {v}
          </button>
        ))}
        {vista === "diario" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button onClick={() => setDia((d) => shiftDate(d, -1))} style={{ padding: 6, border: `1px solid ${COLORS.border}`, borderRadius: 6, color: COLORS.textMuted, background: "transparent" }}>
              <ChevronLeft size={14} />
            </button>
            <input type="date" value={dia} onChange={(e) => setDia(e.target.value)} style={{ ...inputStyle, colorScheme: "dark", padding: "6px 8px" }} />
            <button onClick={() => setDia((d) => shiftDate(d, 1))} style={{ padding: 6, border: `1px solid ${COLORS.border}`, borderRadius: 6, color: COLORS.textMuted, background: "transparent" }}>
              <ChevronRight size={14} />
            </button>
          </div>
        ) : (
          <span style={{ fontSize: 12, color: COLORS.textMuted, ...MONO }}>{mesActual}</span>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <Kpi label={vista === "diario" ? "Ingresos del día" : "Ingresos del mes"} value={fmt(ingresos)} tone={COLORS.income} />
        <Kpi label={vista === "diario" ? "Egresos del día" : "Egresos del mes"} value={fmt(egresos)} tone={COLORS.expense} />
        <Kpi label="Balance" value={fmt(ingresos - egresos)} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 6, background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 12 }}>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={inputStyle}>
          <option value="ingreso">Ingreso</option>
          <option value="egreso">Egreso</option>
        </select>
        <input
          type="date"
          value={fechaForm}
          onChange={(e) => setFechaForm(e.target.value)}
          onInput={(e) => setFechaForm(e.target.value)}
          style={{ ...inputStyle, colorScheme: "dark" }}
        />
        <input value={concepto} onChange={(e) => setConcepto(e.target.value)} placeholder="Concepto" style={{ ...inputStyle, flex: 1, minWidth: 140 }} />
        <input value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="Monto" type="number" style={{ ...inputStyle, width: 120 }} />
        <button
          onClick={agregar}
          style={{ display: "flex", alignItems: "center", gap: 6, background: COLORS.accent, color: "#1A1204", border: "none", borderRadius: 6, padding: "8px 14px", fontSize: 14, ...HEAD }}
        >
          <Plus size={15} /> Registrar
        </button>
      </div>
      <div style={{ fontSize: 12, color: COLORS.steel, marginBottom: 16, ...MONO }}>
        Se va a registrar con fecha: {fechaForm}
      </div>
      {cargando ? (
        <div style={{ color: COLORS.textMuted, fontSize: 14 }}>Cargando...</div>
      ) : (
        <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${COLORS.border}` }}>
          {enRango.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", color: COLORS.textMuted, background: COLORS.panel, fontSize: 14 }}>
              Sin movimientos en este período
            </div>
          )}
          {enRango.map((m) =>
            editandoId === m.id ? (
              <div
                key={m.id}
                style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", padding: "12px 16px", background: COLORS.panelAlt, borderTop: `1px solid ${COLORS.border}` }}
              >
                <select value={editTipo} onChange={(e) => setEditTipo(e.target.value)} style={inputStyle}>
                  <option value="ingreso">Ingreso</option>
                  <option value="egreso">Egreso</option>
                </select>
                <input type="date" value={editFecha} onChange={(e) => setEditFecha(e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} />
                <input value={editConcepto} onChange={(e) => setEditConcepto(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 120 }} />
                <input value={editMonto} onChange={(e) => setEditMonto(e.target.value)} type="number" style={{ ...inputStyle, width: 110 }} />
                <button onClick={() => guardarEdicion(m.id)} style={{ background: COLORS.accent, color: "#1A1204", border: "none", borderRadius: 6, padding: 8 }}>
                  <Check size={15} />
                </button>
                <button onClick={() => setEditandoId(null)} style={{ background: "transparent", color: COLORS.textMuted, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 8 }}>
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div
                key={m.id}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: COLORS.panel, borderTop: `1px solid ${COLORS.border}` }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {m.tipo === "ingreso" ? <ArrowUpRight size={15} color={COLORS.income} /> : <ArrowDownRight size={15} color={COLORS.expense} />}
                  <div>
                    <div style={{ fontSize: 14, color: COLORS.text }}>{m.concepto}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted, ...MONO }}>{m.fecha}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ color: m.tipo === "ingreso" ? COLORS.income : COLORS.expense, ...MONO }}>
                    {m.tipo === "ingreso" ? "+" : "-"}
                    {fmt(m.monto)}
                  </div>
                  <button onClick={() => empezarEdicion(m)} style={{ background: "transparent", border: "none", color: COLORS.textMuted, padding: 4 }}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => borrarMovimiento(m.id)} style={{ background: "transparent", border: "none", color: COLORS.expense, padding: 4 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </Shell>
  );
}
