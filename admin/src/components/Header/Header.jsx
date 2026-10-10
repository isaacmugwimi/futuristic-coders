"use client";

import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import { ALL_NAV, isActive } from "../Nav/Nav";

export default function Header({ onOpenMenu }) {
  const pathname = usePathname();
  const current = ALL_NAV.find((item) => isActive(pathname, item)) ?? ALL_NAV[0];

  return (
    <header className="dash-header">
      <button
        type="button"
        className="dash-header__menu"
        onClick={onOpenMenu}
        aria-label="Open menu"
        aria-controls="dash-sidebar"
      >
        <Menu size={22} aria-hidden="true" />
      </button>

      <div className="dash-header__titles">
        <h1>{current.label}</h1>
        <p>{current.subtitle}</p>
      </div>

      <div className="dash-header__actions">
        <label className="dash-search">
          <Search size={18} aria-hidden="true" />
          <input type="search" placeholder="Search students, programs, payments…" aria-label="Search" />
        </label>

        <button type="button" className="dash-iconbtn" aria-label="Notifications">
          <Bell size={20} aria-hidden="true" />
          <span className="dash-iconbtn__dot" aria-hidden="true" />
        </button>

        <button type="button" className="dash-user" aria-label="Account menu">
          <span className="dash-avatar">AD</span>
          <span className="dash-user__meta">
            <strong>Admin</strong>
            <span>Owner</span>
          </span>
          <ChevronDown size={18} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}