"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, LogOut } from "lucide-react";
import { MAIN_NAV, SYSTEM_NAV, isActive } from "../Nav/Nav";

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onNavigate }) {
  const pathname = usePathname();

  function renderItem(item) {
    const Icon = item.icon;
    const active = isActive(pathname, item);

    return (
      <li key={item.href}>
        <Link
          href={item.href}
          className={`dash-nav__link${active ? " is-active" : ""}`}
          aria-current={active ? "page" : undefined}
          title={collapsed ? item.label : undefined}
          onClick={onNavigate}
        >
          <Icon size={20} aria-hidden="true" />
          <span className="dash-nav__label">{item.label}</span>
        </Link>
      </li>
    );
  }

  return (
    <aside
      id="dash-sidebar"
      className={`dash-sidebar${mobileOpen ? " is-open" : ""}`}
      aria-label="Main navigation"
    >
      <div className="dash-brand">
        <Image
          src="/images/flogo.png"
          alt="Futuristic Coders logo"
          width={40}
          height={40}
          className="dash-brand__logo"
          priority
        />
        <div className="dash-brand__text">
          <span className="dash-brand__name">
            Futuristic <span>Coders</span>
          </span>
          <span className="dash-brand__sub">Admin Portal</span>
        </div>
      </div>

      <button
        type="button"
        className="dash-collapse"
        onClick={onToggleCollapse}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-pressed={collapsed}
      >
        <ChevronsLeft size={16} aria-hidden="true" />
      </button>

      <nav className="dash-nav">
        <div className="dash-nav__group">
          <p className="dash-nav__heading">Main menu</p>
          <ul className="dash-nav__list">{MAIN_NAV.map(renderItem)}</ul>
        </div>

        <div className="dash-nav__group">
          <p className="dash-nav__heading">System</p>
          <ul className="dash-nav__list">{SYSTEM_NAV.map(renderItem)}</ul>
        </div>
      </nav>

      <div className="dash-sidebar__foot">
        <div className="dash-profile">
          <span className="dash-avatar dash-avatar--soft">AD</span>
          <div className="dash-profile__meta">
            <strong>Admin</strong>
            <span>Owner</span>
          </div>
        </div>

        {/* TODO: call your logout endpoint / clear the session before redirecting */}
        <Link href="/" className="dash-nav__link" title={collapsed ? "Logout" : undefined}>
          <LogOut size={20} aria-hidden="true" />
          <span className="dash-nav__label">Logout</span>
        </Link>
      </div>
    </aside>
  );
}