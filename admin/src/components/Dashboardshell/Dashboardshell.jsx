"use client";

import Sidebar from "../Sidebar/Sidebar";
import { useEffect, useState } from "react";
import Header from "../Header/Header";

import "./DashboardShell.css";

export default function DashboardShell({ children }) {
  const [collapsed, setCollapsed] = useState(false); // desktop: icon-only sidebar
  const [mobileOpen, setMobileOpen] = useState(false); // mobile: slide-in drawer

  // Close the mobile drawer with the Escape key
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <div className="dash" data-collapsed={collapsed}>
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />

      {mobileOpen && (
        <button
          type="button"
          className="dash-backdrop"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="dash-main">
        <Header onOpenMenu={() => setMobileOpen(true)} />
        <main className="dash-content" id="main">
          {children}
        </main>
      </div>
    </div>
  );
}
