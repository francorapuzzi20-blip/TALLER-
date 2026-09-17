"use client";
import { useEffect, useState } from "react";
import { Plus, Phone } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { COLORS, HEAD } from "../../lib/theme";
import Shell from "../../components/Shell";

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    setCargando(true);
    const { data, error } = await supabase.from("clientes").select("*").order("created_at", { ascending: false });
    if (!error) setClientes(data || []);
    setCargando(false);
  };

  useEffect(() => {
    cargar();
  }, []);

  const agregar = async () => {
    if (!nombre.trim()) return;
    const { error } = await supabase.from("clientes").insert({ nombre, telefono });
    if (!error) {
      setNombre("");
      setTelefono("");
      cargar();
    } else {
      alert("Error al guardar: " + error.message);
    }
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
    <Shell title="Clientes">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" style={{ ...inputStyle, flex: 1, minWidth: 140 }} />
        <input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Teléfono" style={{ ...inputStyle, flex: 1, minWidth: 140 }} />
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
          {clientes.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", color: COLORS.textMuted, background: COLORS.panel, fontSize: 14 }}>
              Todavía no hay clientes
            </div>
          )}
          {clientes.map((c) => (
            <div
              key={c.id}
              style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: COLORS.panel, borderTop: `1px solid ${COLORS.border}` }}
            >
              <div style={{ fontSize: 14, color: COLORS.text }}>{c.nombre}</div>
              {c.telefono && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: COLORS.textMuted }}>
                  <Phone size={12} /> {c.telefono}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}
