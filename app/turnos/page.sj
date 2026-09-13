"use client";
import { useEffect, useState } from "react";
import { Plus, Clock, Phone, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { COLORS, HEAD, MONO } from "../../lib/theme";
import Shell from "../../components/Shell";

export default function TurnosPage() {
  const [turnos, setTurnos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [autos, setAutos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [hora, setHora] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [telefono, setTelefono] = useState("");
  const [autoId, setAutoId] = useState("");
  const [servicio, setServicio] = useState("");

  const cargar = async () => {
    setCargando(true);
    const { data: turnosData } = await supabase
      .from("turnos")
      .select("*")
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true });
    const { data: clientesData } = await supabase.from("clientes").select("id, nombre, telefono").order("nombre");
    const { data: autosData } = await supabase.from("autos").select("id, placa, marca, modelo, cliente_id").order("placa");
    setTurnos(turnosData || []);
    setClientes(clientesData || []);
    setAutos(autosData || []);
    setCargando(false);
  };
  useEffect(() => {
    cargar();
  }, []);

  const onClienteChange = (id) => {
    setClienteId(id);
    setAutoId("");
    const c = clientes.find((c) => c.id === id);
    setTelefono(c?.telefono || "");
  };

  const autosDelCliente = autos.filter((a) => a.cliente_id === clienteId);

  const agregar = async () => {
    if (!fecha || !hora || !clienteId) return;
    const cliente = clientes.find((c) => c.id === clienteId);
    const auto = autos.find((a) => a.id === autoId);
    const { error } = await supabase.from("turnos").insert({
      fecha,
      hora,
      cliente_id: clienteId,
      cliente_nombre: cliente?.nombre || "",
      telefono,
      auto_id: autoId || null,
      auto_label: auto ? `${auto.marca} ${auto.modelo} · ${auto.placa}` : "",
      servicio,
    });
    if (!error) {
      setHora("");
      setServicio("");
      cargar();
    } else {
      alert("Error al guardar: " + error.message);
    }
  };

  const borrar = async (id) => {
    if (!confirm("¿Borrar este turno?")) return;
    const { error } = await supabase.from("turnos").delete().eq("id", id);
    if (!error) cargar();
    else alert("Error al borrar: " + error.message);
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

  const porFecha = turnos.reduce((acc, t) => {
    acc[t.fecha] = acc[t.fecha] || [];
    acc[t.fecha].push(t);
    return acc;
  }, {});

  return (
    <Shell title="Turnos agendados">
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20, background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 12 }}
      >
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} />
        <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} />
        <select value={clienteId} onChange={(e) => onClienteChange(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 130 }}>
          <option value="">Cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <input
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="Teléfono"
          type="tel"
          style={{ ...inputStyle, flex: 1, minWidth: 120 }}
        />
        <select value={autoId} onChange={(e) => setAutoId(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 130 }}>
          <option value="">Auto (opcional)</option>
          {autosDelCliente.map((a) => (
            <option key={a.id} value={a.id}>
              {a.marca} {a.modelo} · {a.placa}
            </option>
          ))}
        </select>
        <input
          value={servicio}
          onChange={(e) => setServicio(e.target.value)}
          placeholder="Servicio"
          style={{ ...inputStyle, flex: 1, minWidth: 150 }}
        />
        <button
          onClick={agregar}
          style={{ display: "flex", alignItems: "center", gap: 6, background: COLORS.accent, color: "#1A1204", border: "none", borderRadius: 6, padding: "8px 14px", fontSize: 14, ...HEAD }}
        >
          <Plus size={15} /> Agendar
        </button>
      </div>

      {cargando ? (
        <div style={{ color: COLORS.textMuted, fontSize: 14 }}>Cargando...</div>
      ) : Object.keys(porFecha).length === 0 ? (
        <div style={{ padding: 24, textAlign: "center", color: COLORS.textMuted, background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14 }}>
          No hay turnos agendados
        </div>
      ) : (
        Object.entries(porFecha).map(([f, items]) => (
          <div key={f} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: COLORS.steel, marginBottom: 8, ...MONO }}>{f}</div>
            <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${COLORS.border}` }}>
              {items.map((t) => (
                <div
                  key={t.id}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: COLORS.panel, borderTop: `1px solid ${COLORS.border}` }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 5, width: 64, flexShrink: 0, color: COLORS.accent, ...MONO }}>
                    <Clock size={13} /> {t.hora?.slice(0, 5)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: COLORS.text }}>
                      {t.cliente_nombre} {t.auto_label && <span style={{ color: COLORS.textMuted }}>· {t.auto_label}</span>}
                    </div>
                    {t.servicio && <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{t.servicio}</div>}
                    {t.telefono && (
                      <div style={{ fontSize: 11, color: COLORS.steel, marginTop: 2, display: "flex", alignItems: "center", gap: 4, ...MONO }}>
                        <Phone size={10} /> {t.telefono}
                      </div>
                    )}
                  </div>
                  <button onClick={() => borrar(t.id)} style={{ background: "transparent", border: "none", color: COLORS.expense, padding: 4 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </Shell>
  );
}
