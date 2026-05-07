"use client";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import "../../global.css"
import { FaBars, FaTimes, FaChevronRight, FaCode } from "react-icons/fa";

import "./Navbar.css";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Programs", href: "#programs" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* LOGO */}
        <Link href="/" className="navbar-logo">
          <div className="navbar-logo-image">
            <Image
              src="/flogo.png"
              alt="Futuristic Coders Logo"
              width={62}
              height={62}
              priority
            />
          </div>

          <div className="navbar-logo-text">
            <span className="navbar-logo-title">
              {" "}
              <span> Futuristic</span> <span> Coders</span>{" "}
            </span>

            <span className="navbar-logo-subtitle">
              Learn • Build • Innovate
            </span>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="navbar-links">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="navbar-link">
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="navbar-actions">
          <a href="#programs" className="navbar-btn">
            Apply Now
          </a>
        </div>

        {/* MOBILE TOGGLE */}
        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div className={`navbar-mobile ${menuOpen ? "open" : ""}`}>
        <div className="navbar-mobile-links">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="navbar-mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              <span>{link.label}</span>

              <FaChevronRight />
            </a>
          ))}
        </div>

        <a
          href="#programs"
          className="navbar-mobile-btn"
          onClick={() => setMenuOpen(false)}
        >
          Apply Now
        </a>
      </div>
    </header>
  );
}
