"use client";
import NavBar from "./NavBar";
import { COLORS, HEAD } from "../lib/theme";

export default function Shell({ title, children }) {
  return (
    <div className="flex flex-col md:flex-row" style={{ minHeight: "100vh", background: COLORS.bg, ...HEAD }}>
      <NavBar />
      <div style={{ flex: 1, padding: 16, minWidth: 0 }} className="md:p-6">
        <h1 style={{ fontSize: 20, color: COLORS.text, marginBottom: 16, ...HEAD }}>{title}</h1>
        {children}
      </div>
    </div>
  );
}
