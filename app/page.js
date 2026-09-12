"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { COLORS, HEAD, MONO, fmt } from "../lib/theme";
import Shell from "../components/Shell";

function Kpi({ label, value, tone }) {
  return (
    <div
      style={{
        background: COLORS.panel,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: 16,
        flex: 1,
        minWidth: 150,
      }}
    >
      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8, ...HEAD }}>{label}</div>
      <div style={{ fontSize: 22, color: tone || COLORS.text, ...MONO }}>{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [clientesCount, setClientesCount] = useState(0);
  const [autosEnTaller, setAutosEnTaller] = useState(0);
  const [autosTotal, setAutosTotal] = useState(0);
  const [ingresos, setIngresos] = useState(0);
  const [egresos, setEgresos] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      const hoy = new Date();
      const mesActual = hoy.toISOString().slice(0, 7);

      const { count: cCount } = await supabase.from("clientes").select("*", { count: "exact", head: true });
      const { count: aCount } = await supabase.from("autos").select("*", { count: "exact", head: true });
      const { count: aTallerCount } = await supabase
        .from("autos")
        .select("*", { count: "exact", head: true })
        .eq("estado", "En taller");

      const { data: movs } = await supabase
        .from("movimientos")
        .select("tipo, monto, fecha")
        .gte("fecha", `${mesActual}-01`)
        .lte("fecha", `${mesActual}-31`);

      const ing = (movs || []).filter((m) => m.tipo === "ingreso").reduce((a, b) => a + Number(b.monto), 0);
      const egr = (movs || []).filter((m) => m.tipo === "egreso").reduce((a, b) => a + Number(b.monto), 0);

      setClientesCount(cCount || 0);
      setAutosTotal(aCount || 0);
      setAutosEnTaller(aTallerCount || 0);
      setIngresos(ing);
      setEgresos(egr);
      setCargando(false);
    };
    cargar();
  }, []);

  return (
    <Shell title="Panel general">
      {cargando ? (
        <div style={{ color: COLORS.textMuted, fontSize: 14 }}>Cargando datos...</div>
      ) : (
        <div className="flex" style={{ flexWrap: "wrap", gap: 12 }}>
          <Kpi label="Clientes" value={clientesCount} />
          <Kpi label="Autos en taller" value={autosEnTaller} tone={COLORS.accent} sub={`${autosTotal} en total`} />
          <Kpi label="Ingresos (mes)" value={fmt(ingresos)} tone={COLORS.income} />
          <Kpi label="Egresos (mes)" value={fmt(egresos)} tone={COLORS.expense} />
        </div>
      )}
    </Shell>
  );
}
