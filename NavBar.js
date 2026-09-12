"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, Car, Wallet, Wrench } from "lucide-react";
import { COLORS, HEAD } from "../lib/theme";

const ITEMS = [
  { href: "/", label: "Panel general", icon: LayoutGrid },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/autos", label: "Autos", icon: Car },
  { href: "/movimientos", label: "Ingresos y egresos", icon: Wallet },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar (desktop) */}
      <div
        className="hidden md:flex"
        style={{
          width: 224,
          flexShrink: 0,
          padding: 16,
          flexDirection: "column",
          gap: 4,
          borderRight: `1px solid ${COLORS.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 20, paddingLeft: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: COLORS.accentDim,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Wrench size={16} color={COLORS.accent} />
          </div>
          <div>
            <div style={{ fontSize: 14, color: COLORS.text }}>Taller Central</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>gestión interna</div>
          </div>
        </div>

        {ITEMS.map((it) => {
          const active = pathname === it.href;
          return (
            <Link key={it.href} href={it.href}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 16px",
                  borderRadius: 6,
                  fontSize: 14,
                  background: active ? COLORS.accentDim : "transparent",
                  color: active ? COLORS.accent : COLORS.textMuted,
                  ...HEAD,
                }}
              >
                <it.icon size={17} />
                {it.label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Top bar (mobile) */}
      <div
        className="flex md:hidden"
        style={{ alignItems: "center", gap: 8, padding: "12px", borderBottom: `1px solid ${COLORS.border}` }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: COLORS.accentDim,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Wrench size={14} color={COLORS.accent} />
        </div>
        <div style={{ fontSize: 14, color: COLORS.text }}>Taller Central</div>
      </div>
      <div
        className="flex md:hidden"
        style={{ alignItems: "center", gap: 8, padding: "8px 12px", overflowX: "auto", borderBottom: `1px solid ${COLORS.border}` }}
      >
        {ITEMS.map((it) => {
          const active = pathname === it.href;
          return (
            <Link key={it.href} href={it.href}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  whiteSpace: "nowrap",
                  background: active ? COLORS.accentDim : "transparent",
                  color: active ? COLORS.accent : COLORS.textMuted,
                  border: `1px solid ${active ? COLORS.accent : COLORS.border}`,
                  ...HEAD,
                }}
              >
                <it.icon size={14} />
                {it.label}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
