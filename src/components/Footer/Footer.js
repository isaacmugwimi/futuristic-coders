"use client";
import Link from "next/link";
import { Mail, Phone, MapPin, Code2 } from "lucide-react";
import { FaXTwitter, FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa6";
import "./Footer.css";

const QUICK_LINKS = ["Home", "Programs", "About", "Contact", "Apply Now"];
const PROGRAMS = [
  "Foundations (Beginner)",
  "Web Development",
  "React & AI",
  "Summer Bootcamp",
  "Corporate Training",
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="fc-footer" id="contact">
      <div className="fc-container">
        <div className="fc-footer-grid">

          {/* BRAND */}
          <div className="fc-footer-brand">
            <div className="fc-footer-logo">
              <Code2 className="fc-logo-icon" size={32} strokeWidth={2.5} />
              <span className="fc-logo-text">Futuristic Coders</span>
            </div>
            <p className="fc-footer-description">
              Empowering the next generation of developers through structured
              coding education.
            </p>
            <div className="fc-footer-socials">
              <a href="#" className="fc-social-link" aria-label="X / Twitter">
                <FaXTwitter size={18} />
              </a>
              <a href="#" className="fc-social-link" aria-label="Facebook">
                <FaFacebook size={18} />
              </a>
              <a href="#" className="fc-social-link" aria-label="Instagram">
                <FaInstagram size={18} />
              </a>
              <a href="#" className="fc-social-link" aria-label="LinkedIn">
                <FaLinkedin size={18} />
              </a>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="fc-footer-section">
            <h4 className="fc-footer-title">Quick Links</h4>
            <ul className="fc-footer-links">
              {QUICK_LINKS.map((link) => (
                <li key={link}>
                  <Link href={`/${link.toLowerCase().replace(/\s+/g, "-")}`}>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* PROGRAMS */}
          <div className="fc-footer-section">
            <h4 className="fc-footer-title">Programs</h4>
            <ul className="fc-footer-links">
              {PROGRAMS.map((program) => (
                <li key={program}>
                  <Link href="/programs">{program}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div className="fc-footer-section">
            <h4 className="fc-footer-title">Contact</h4>
            <div className="fc-contact-list">
              <p>
                <MapPin size={16} className="fc-accent-icon" /> Nairobi, Kenya
              </p>
              <p>
                <Mail size={16} className="fc-accent-icon" /> hello@futuristic.com
              </p>
              <p>
                <Phone size={16} className="fc-accent-icon" /> +254 700 000 000
              </p>
            </div>
          </div>

        </div>

        <div className="fc-footer-bottom">
          <p>© {year} Futuristic Coders. All rights reserved.</p>
          <div className="fc-bottom-links">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/cookies">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}