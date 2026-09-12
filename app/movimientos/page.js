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
    setE
