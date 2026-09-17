"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { COLORS, HEAD, MONO } from "../../lib/theme";
import Shell from "../../components/Shell";

export default function AutosPage() {
  const [autos, setAutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [placa, setPlaca] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    setCargando(true);
    const { data: autosData } = await supabase
      .from("autos")
      .select("*, clientes(nombre)")
      .order("created_at", { ascending: false });
    const { data: clientesData } = await supabase.from("clientes").select("id, nombre").order("nombre");
    setAutos(autosData || []);
    setClientes(clientesData || []);
    if (clientesData && clientesData.length > 0 && !clienteId) setClienteId(clientesData[0].id);
    setCargando(false);
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const agregar = async () => {
    if (!placa.trim()) return;
    const { error } = await supabase.from("autos").insert({
      placa,
      marca,
      modelo,
      anio: anio ? Number(anio) : null,
      cliente_id: clienteId || null,
      estado: "Entregado",
    });
    if (!error) {
      setPlaca("");
      setMarca("");
      setModelo("");
      setAnio("");
      cargar();
    } else {
      alert("Error al guardar: " + error.message);
    }
  };

  const toggleEstado = async (auto) => {
    const nuevoEstado = auto.estado === "En taller" ? "Entregado" : "En taller";
    const { error } = await supabase.from("autos").update({ estado: nuevoEstado }).eq("id", auto.id);
    if (!error) cargar();
    else alert("Error al actualizar: " + error.message);
  };

  const inputStyle = {
    background: COLORS.panel,
    border: `1px solid ${COLORS.border}`,
    color: COLORS.text,
    borderRadius: 6,
    padding: "8px 12px",
    fontSize: 14,
    outline: "none",
  };

  return (
    <Shell title="Autos">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 140 }}>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <input value={placa} onChange={(e) => setPlaca(e.target.value)} placeholder="Placa" style={{ ...inputStyle, width: 100 }} />
        <input value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Marca" style={{ ...inputStyle, flex: 1, minWidth: 100 }} />
        <input value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Modelo" style={{ ...inputStyle, flex: 1, minWidth: 100 }} />
        <input value={anio} onChange={(e) => setAnio(e.target.value)} placeholder="Año" type="number" style={{ ...inputStyle, width: 80 }} />
        <button
          onClick={agregar}
          style={{ display: "flex", alignItems: "center", gap: 6, background: COLORS.accent, color: "#1A1204", border: "none", borderRadius: 6, padding: "8px 14px", fontSize: 14, ...HEAD }}
        >
          <Plus size={15} /> Agregar
        </button>
      </div>

      {cargando ? (
        <div style={{ color: COLORS.textMuted, fontSize: 14 }}>Cargando...</div>
      ) : (
        <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${COLORS.border}` }}>
          {autos.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", color: COLORS.textMuted, background: COLORS.panel, fontSize: 14 }}>
              Todavía no hay autos registrados
            </div>
          )}
          {autos.map((a) => (
            <div
              key={a.id}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: COLORS.panel, borderTop: `1px solid ${COLORS.border}` }}
            >
              <div>
                <div style={{ fontSize: 14, color: COLORS.text }}>
                  {a.marca} {a.modelo} <span style={{ color: COLORS.textMuted }}>· {a.anio}</span>
                </div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>{a.clientes?.nombre || "Sin dueño asignado"}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ ...MONO, color: COLORS.accent, fontSize: 13 }}>{a.placa}</div>
                <button
                  onClick={() => toggleEstado(a)}
                  style={{
                    ...MONO,
                    fontSize: 12,
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: `1px solid ${a.estado === "En taller" ? COLORS.accent : COLORS.border}`,
                    background: a.estado === "En taller" ? COLORS.accentDim : "transparent",
                    color: a.estado === "En taller" ? COLORS.accent : COLORS.textMuted,
                  }}
                >
                  {a.estado || "Entregado"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}
