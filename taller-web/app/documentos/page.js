"use client";
import { useEffect, useState } from "react";
import { Plus, FileText, Trash2, Printer, ArrowLeft, ArrowRightLeft, Check } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { COLORS, HEAD, MONO, fmt } from "../../lib/theme";
import Shell from "../../components/Shell";

function totalDoc(doc) {
  return (doc.documento_items || []).reduce((a, it) => a + Number(it.cantidad) * Number(it.precio_unitario), 0);
}

function montoPagado(doc) {
  return (doc.pagos || []).reduce((a, p) => a + Number(p.monto), 0);
}

function estadoPago(doc) {
  const total = totalDoc(doc);
  const pagado = montoPagado(doc);
  if (pagado <= 0) return "no_pagado";
  if (pagado >= total) return "pagado";
  return "parcial";
}

function PagoPill({ doc }) {
  const map = {
    no_pagado: { bg: "#2C1E1C", fg: COLORS.expense, label: "No pagado" },
    parcial: { bg: COLORS.accentDim, fg: COLORS.accent, label: "Pago parcial" },
    pagado: { bg: "#1E2A22", fg: COLORS.income, label: "Pagado" },
  };
  const c = doc.tipo === "factura" ? map[estadoPago(doc)] : { bg: "#20262B", fg: COLORS.steel, label: "Presupuesto" };
  return (
    <span style={{ fontSize: 11, padding: "4px 8px", borderRadius: 5, background: c.bg, color: c.fg, ...HEAD }}>
      {c.label}
    </span>
  );
}

const inputStyle = {
  background: COLORS.panelAlt,
  border: `1px solid ${COLORS.border}`,
  color: COLORS.text,
  borderRadius: 6,
  padding: "8px 12px",
  fontSize: 14,
  outline: "none",
};

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [autos, setAutos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [vista, setVista] = useState("lista");
  const [filtro, setFiltro] = useState("todos");
  const [docAbierto, setDocAbierto] = useState(null);

  const cargar = async () => {
    setCargando(true);
    const { data: docsData } = await supabase
      .from("documentos")
      .select("*, documento_items(*), pagos(*)")
      .order("fecha", { ascending: false });
    const { data: clientesData } = await supabase.from("clientes").select("id, nombre").order("nombre");
    const { data: autosData } = await supabase.from("autos").select("id, placa, marca, modelo, cliente_id").order("placa");
    setDocumentos(docsData || []);
    setClientes(clientesData || []);
    setAutos(autosData || []);
    setCargando(false);
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirDoc = (id) => {
    const fresh = documentos.find((d) => d.id === id);
    setDocAbierto(fresh);
  };

  const refrescarYReabrir = async (id) => {
    await cargar();
  };

  const deudores = documentos.filter((d) => d.tipo === "factura" && estadoPago(d) !== "pagado");
  const deudaTotal = deudores.reduce((a, d) => a + (totalDoc(d) - montoPagado(d)), 0);
  const listaVisible = filtro === "deudores" ? deudores : documentos;

  if (vista === "nuevo") {
    return (
      <Shell title="Nuevo presupuesto / factura">
        <NuevoDocumento
          clientes={clientes}
          autos={autos}
          onCancel={() => setVista("lista")}
          onGuardado={() => {
            setVista("lista");
            cargar();
          }}
        />
      </Shell>
    );
  }

  return (
    <Shell title="Presupuestos y facturas">
      <button
        onClick={() => setVista("nuevo")}
        style={{ display: "flex", alignItems: "center", gap: 6, background: COLORS.accent, color: "#1A1204", border: "none", borderRadius: 6, padding: "10px 16px", fontSize: 14, marginBottom: 16, ...HEAD }}
      >
        <Plus size={16} /> Nuevo presupuesto / factura
      </button>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[
          { id: "todos", label: "Todos" },
          { id: "deudores", label: `Deudores (${deudores.length})` },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 12,
              background: filtro === f.id ? COLORS.accentDim : "transparent",
              color: filtro === f.id ? COLORS.accent : COLORS.textMuted,
              border: `1px solid ${filtro === f.id ? COLORS.accent : COLORS.border}`,
              ...HEAD,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtro === "deudores" && (
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Total por cobrar</div>
            <div style={{ fontSize: 20, color: COLORS.expense, ...MONO }}>{fmt(deudaTotal)}</div>
          </div>
        </div>
      )}

      {cargando ? (
        <div style={{ color: COLORS.textMuted, fontSize: 14 }}>Cargando...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {listaVisible.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", color: COLORS.textMuted, background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14 }}>
              {filtro === "deudores" ? "No hay facturas pendientes de pago" : "Todavía no hay presupuestos ni facturas"}
            </div>
          )}
          {listaVisible.map((doc) => (
            <button
              key={doc.id}
              onClick={() => abrirDoc(doc.id)}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 8, background: COLORS.panel, border: `1px solid ${COLORS.border}`, textAlign: "left" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FileText size={16} color={doc.tipo === "factura" ? COLORS.income : COLORS.steel} />
                <div>
                  <div style={{ fontSize: 14, color: COLORS.text }}>
                    {doc.cliente_nombre} <span style={{ color: COLORS.textMuted }}>· {doc.auto_label}</span>
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, ...MONO }}>
                    {doc.fecha} · {doc.tipo}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <span style={{ ...MONO, color: COLORS.text }}>{fmt(totalDoc(doc))}</span>
                <PagoPill doc={doc} />
              </div>
            </button>
          ))}
        </div>
      )}

      {docAbierto && (
        <DocumentoPapel
          doc={documentos.find((d) => d.id === docAbierto.id) || docAbierto}
          onClose={() => setDocAbierto(null)}
          onCambio={refrescarYReabrir}
        />
      )}
    </Shell>
  );
}

function NuevoDocumento({ clientes, autos, onCancel, onGuardado }) {
  const [tipo, setTipo] = useState("presupuesto");
  const [clienteId, setClienteId] = useState(clientes[0]?.id || "");
  const [autoId, setAutoId] = useState("");
  const [items, setItems] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const [itemTipo, setItemTipo] = useState("mano_obra");
  const [itemDesc, setItemDesc] = useState("");
  const [itemCant, setItemCant] = useState("1");
  const [itemPrecio, setItemPrecio] = useState("");

  const autosDelCliente = autos.filter((a) => a.cliente_id === clienteId);

  const addItem = () => {
    if (!itemDesc.trim() || !itemPrecio) return;
    setItems([
      ...items,
      { id: Date.now(), tipo_item: itemTipo, descripcion: itemDesc, cantidad: Number(itemCant) || 1, precio_unitario: Number(itemPrecio) },
    ]);
    setItemDesc("");
    setItemPrecio("");
    setItemCant("1");
  };

  const removeItem = (id) => setItems(items.filter((i) => i.id !== id));
  const total = items.reduce((a, it) => a + it.cantidad * it.precio_unitario, 0);

  const guardar = async () => {
    if (!clienteId || items.length === 0 || guardando) return;
    setGuardando(true);
    const cliente = clientes.find((c) => c.id === clienteId);
    const auto = autos.find((a) => a.id === autoId);

    const { data: doc, error } = await supabase
      .from("documentos")
      .insert({
        tipo,
        cliente_id: clienteId,
        auto_id: autoId || null,
        cliente_nombre: cliente?.nombre || "",
        auto_label: auto ? `${auto.marca} ${auto.modelo} · ${auto.placa}` : "",
        fecha: new Date().toISOString().slice(0, 10),
        estado: "pendiente",
      })
      .select()
      .single();

    if (error || !doc) {
      alert("Error al guardar: " + error?.message);
      setGuardando(false);
      return;
    }

    const itemsPayload = items.map((it) => ({
      documento_id: doc.id,
      tipo_item: it.tipo_item,
      descripcion: it.descripcion,
      cantidad: it.cantidad,
      precio_unitario: it.precio_unitario,
    }));
    const { error: errItems } = await supabase.from("documento_items").insert(itemsPayload);

    setGuardando(false);
    if (errItems) {
      alert("Error al guardar los ítems: " + errItems.message);
    } else {
      onGuardado();
    }
  };

  return (
    <div>
      <button onClick={onCancel} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: COLORS.textMuted, fontSize: 14, marginBottom: 16, padding: 0 }}>
        <ArrowLeft size={15} /> Volver
      </button>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["presupuesto", "factura"].map((t) => (
          <button
            key={t}
            onClick={() => setTipo(t)}
            style={{
              padding: "8px 14px",
              borderRadius: 6,
              fontSize: 14,
              textTransform: "capitalize",
              background: tipo === t ? COLORS.accentDim : "transparent",
              color: tipo === t ? COLORS.accent : COLORS.textMuted,
              border: `1px solid ${tipo === t ? COLORS.accent : COLORS.border}`,
              ...HEAD,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        <select
          value={clienteId}
          onChange={(e) => {
            setClienteId(e.target.value);
            setAutoId("");
          }}
          style={{ ...inputStyle, background: COLORS.panel, flex: 1, minWidth: 150 }}
        >
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <select value={autoId} onChange={(e) => setAutoId(e.target.value)} style={{ ...inputStyle, background: COLORS.panel, flex: 1, minWidth: 150 }}>
          <option value="">Seleccionar auto</option>
          {autosDelCliente.map((a) => (
            <option key={a.id} value={a.id}>
              {a.marca} {a.modelo} — {a.placa}
            </option>
          ))}
        </select>
      </div>

      <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: COLORS.text, marginBottom: 12, ...HEAD }}>Ítems del {tipo}</div>

        {items.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {items.map((it) => (
              <div key={it.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: 6, background: COLORS.panelAlt, fontSize: 14 }}>
                <div>
                  <div style={{ color: COLORS.text }}>{it.descripcion}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                    {it.tipo_item === "mano_obra" ? "Mano de obra" : "Repuesto"} · x{it.cantidad} · {fmt(it.precio_unitario)} c/u
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ ...MONO, color: COLORS.text }}>{fmt(it.cantidad * it.precio_unitario)}</span>
                  <button onClick={() => removeItem(it.id)} style={{ background: "transparent", border: "none", color: COLORS.expense }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <select value={itemTipo} onChange={(e) => setItemTipo(e.target.value)} style={inputStyle}>
            <option value="mano_obra">Mano de obra</option>
            <option value="repuesto">Repuesto</option>
          </select>
          <input value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} placeholder="Descripción" style={{ ...inputStyle, flex: 1, minWidth: 130 }} />
          <input value={itemCant} onChange={(e) => setItemCant(e.target.value)} placeholder="Cant." type="number" inputMode="decimal" style={{ ...inputStyle, width: 70 }} />
          <input value={itemPrecio} onChange={(e) => setItemPrecio(e.target.value)} placeholder="Precio unit." type="number" inputMode="decimal" style={{ ...inputStyle, width: 110 }} />
          <button onClick={addItem} style={{ display: "flex", alignItems: "center", background: COLORS.accent, color: "#1A1204", border: "none", borderRadius: 6, padding: "8px 12px" }}>
            <Plus size={15} />
          </button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px", marginBottom: 16 }}>
        <span style={{ fontSize: 14, color: COLORS.textMuted }}>Total</span>
        <span style={{ fontSize: 18, color: COLORS.text, ...MONO }}>{fmt(total)}</span>
      </div>

      <button
        onClick={guardar}
        disabled={guardando}
        style={{ width: "100%", padding: "10px 16px", borderRadius: 6, background: COLORS.accent, color: "#1A1204", border: "none", fontSize: 14, ...HEAD }}
      >
        {guardando ? "Guardando..." : `Guardar ${tipo}`}
      </button>
    </div>
  );
}

function DocumentoPapel({ doc, onClose, onCambio }) {
  const total = totalDoc(doc);
  const pagos = doc.pagos || [];
  const pagado = montoPagado(doc);
  const restante = Math.max(total - pagado, 0);

  const [nuevoMonto, setNuevoMonto] = useState("");
  const [nuevaFecha, setNuevaFecha] = useState(new Date().toISOString().slice(0, 10));
  const [convirtiendo, setConvirtiendo] = useState(false);

  const agregarPago = async () => {
    const val = Number(nuevoMonto);
    if (!val || val <= 0) return;
    const { error } = await supabase.from("pagos").insert({ documento_id: doc.id, fecha: nuevaFecha, monto: val });
    if (!error) {
      setNuevoMonto("");
      onCambio();
    } else {
      alert("Error al guardar el pago: " + error.message);
    }
  };

  const editarPago = async (id, monto) => {
    const { error } = await supabase.from("pagos").update({ monto: Math.max(0, Number(monto) || 0) }).eq("id", id);
    if (!error) onCambio();
  };

  const eliminarPago = async (id) => {
    const { error } = await supabase.from("pagos").delete().eq("id", id);
    if (!error) onCambio();
  };

  const convertirAFactura = async () => {
    setConvirtiendo(true);
    const { error } = await supabase.from("documentos").update({ tipo: "factura", estado: "pendiente" }).eq("id", doc.id);
    setConvirtiendo(false);
    if (!error) onCambio();
    else alert("Error al convertir: " + error.message);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 12, overflowY: "auto", background: "rgba(0,0,0,0.6)" }}>
      <div style={{ width: "100%", maxWidth: 480, borderRadius: 8, overflow: "hidden", background: "#F4F1EA" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid #D8D3C4" }}>
          <div style={{ fontSize: 14, color: "#2C2C2A", ...HEAD }}>{doc.tipo === "presupuesto" ? "Presupuesto" : "Factura"}</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#5F5E5A", fontSize: 14 }}>
            Cerrar
          </button>
        </div>

        <div style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 18, color: "#2C2C2A", marginBottom: 4, ...HEAD }}>Taller Central</div>
          <div style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 16, ...MONO }}>{doc.fecha}</div>

          <div style={{ fontSize: 14, color: "#2C2C2A", marginBottom: 16 }}>
            <div>
              <span style={{ color: "#8B8A80" }}>Cliente: </span>
              {doc.cliente_nombre}
            </div>
            <div>
              <span style={{ color: "#8B8A80" }}>Auto: </span>
              {doc.auto_label || "—"}
            </div>
          </div>

          <div style={{ borderTop: "1px solid #D8D3C4", borderBottom: "1px solid #D8D3C4", padding: "8px 0", marginBottom: 8 }}>
            {(doc.documento_items || []).map((it) => (
              <div key={it.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 14, color: "#2C2C2A" }}>
                <div>
                  <div>{it.descripcion}</div>
                  <div style={{ fontSize: 12, color: "#8B8A80" }}>
                    {it.tipo_item === "mano_obra" ? "Mano de obra" : "Repuesto"} · x{it.cantidad}
                  </div>
                </div>
                <div style={{ ...MONO }}>{fmt(it.cantidad * it.precio_unitario)}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, padding: "8px 0", marginBottom: 4, color: "#2C2C2A", ...HEAD }}>
            <span>Total</span>
            <span style={{ ...MONO }}>{fmt(total)}</span>
          </div>

          {doc.tipo === "factura" ? (
            <div style={{ borderRadius: 6, padding: 12, marginBottom: 4, background: "#E9E4D6" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: "#2C2C2A", ...HEAD }}>Pagos recibidos</span>
                <PagoPill doc={doc} />
              </div>

              {pagos.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                  {pagos.map((p) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, width: 90, flexShrink: 0, color: "#5F5E5A", ...MONO }}>{p.fecha}</span>
                      <input
                        defaultValue={p.monto}
                        onBlur={(e) => editarPago(p.id, e.target.value)}
                        type="number"
                        inputMode="decimal"
                        style={{ flex: 1, padding: "6px 8px", borderRadius: 6, fontSize: 14, background: "#F4F1EA", border: "1px solid #D8D3C4", color: "#2C2C2A" }}
                      />
                      <button onClick={() => eliminarPago(p.id)} style={{ background: "transparent", border: "none", color: COLORS.expense }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#5F5E5A", marginBottom: 8 }}>
                <span>Total pagado: {fmt(pagado)}</span>
                <span>Restante: {fmt(restante)}</span>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={nuevaFecha}
                  onChange={(e) => setNuevaFecha(e.target.value)}
                  type="date"
                  style={{ padding: "8px 10px", borderRadius: 6, fontSize: 14, background: "#F4F1EA", border: "1px solid #D8D3C4", color: "#2C2C2A" }}
                />
                <input
                  value={nuevoMonto}
                  onChange={(e) => setNuevoMonto(e.target.value)}
                  type="number"
                  inputMode="decimal"
                  placeholder="Nuevo pago"
                  style={{ flex: 1, padding: "8px 10px", borderRadius: 6, fontSize: 14, background: "#F4F1EA", border: "1px solid #D8D3C4", color: "#2C2C2A" }}
                />
                <button onClick={agregarPago} style={{ padding: "8px 12px", borderRadius: 6, background: "#2C2C2A", color: "#F4F1EA", border: "none" }}>
                  <Plus size={15} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ borderRadius: 6, padding: 12, marginBottom: 4, background: "#E9E4D6", fontSize: 12, color: "#5F5E5A" }}>
              Los pagos solo se registran sobre facturas. Convertí este presupuesto a factura para empezar a recibir pagos.
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button
              onClick={() => window.print()}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 16px", borderRadius: 6, background: "#2C2C2A", color: "#F4F1EA", border: "none", fontSize: 14, ...HEAD }}
            >
              <Printer size={15} /> Imprimir / Guardar PDF
            </button>
            {doc.tipo === "presupuesto" && (
              <button
                onClick={convertirAFactura}
                disabled={convirtiendo}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 16px", borderRadius: 6, background: COLORS.accent, color: "#1A1204", border: "none", fontSize: 14, ...HEAD }}
              >
                <ArrowRightLeft size={15} /> {convirtiendo ? "Convirtiendo..." : "Convertir a factura"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
