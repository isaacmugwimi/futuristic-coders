"use client";
import Link from "next/link";
import Image from "next/image";

import { FaXTwitter, FaFacebook, FaInstagram, FaLinkedin, FaMapPin, FaEnvelope, FaPhone } from "react-icons/fa6";
import { FaCode } from "react-icons/fa";
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
                <FaMapPin className="fc-accent-icon" size={15} />
                Nairobi, Kenya
              </p>
              <p>
                <FaEnvelope className="fc-accent-icon" size={15} />
                hello@futuristic.com
              </p>
              <p>
                <FaPhone className="fc-accent-icon" size={15} />
                +254 700 000 000
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