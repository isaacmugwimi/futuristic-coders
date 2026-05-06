"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Programs", href: "#programs" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav
        className={styles.navbar}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className={styles.navbar__inner}>
          {/* Logo */}
          <Link href="/" className={styles.navbar__logo}>
            <Image
              src="/horizontal_logo.png"
              alt="Futuristic Coders Logo"
              height={10}
              width={170}
            />
            {/* <div className={styles.navbar__logo_text}>
              <span className={styles.navbar__logo_title}>
                Futuristic Coders
              </span>
              <span className={styles.navbar__logo_sub}>Coding Academy</span>
            </div> */}
          </Link>
          {/* Desktop Nav */}
          <ul className={styles.navbar__nav}>
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href} className={styles.navbar__nav_link}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className={styles.navbar__cta}>
            <a href="#programs" className="btn-primary">
              Apply Now
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            className={styles.navbar__toggle}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span
              style={{
                transform: menuOpen
                  ? "rotate(45deg) translate(5px, 5px)"
                  : "none",
              }}
            />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span
              style={{
                transform: menuOpen
                  ? "rotate(-45deg) translate(5px, -5px)"
                  : "none",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`${styles.navbar__mobile} ${menuOpen ? styles.open : ""}`}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className={styles.navbar__mobile_link}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </a>
        ))}
        <a
          href="#programs"
          className={`btn-primary ${styles.navbar__mobile_cta}`}
          onClick={() => setMenuOpen(false)}
        >
          Apply Now
        </a>
      </div>
    </>
  );
}
