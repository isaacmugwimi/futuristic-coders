import Link from "next/link";
import { FaArrowRight, FaPhone, FaEnvelope } from "react-icons/fa";
import "./ContactBanner.css";

export default function ContactBanner() {
  return (
    <section className="cb-section">
      {/* BG EFFECTS */}
      <div className="cb-bg-grid"></div>
      <div className="cb-glow cb-glow--left"></div>
      <div className="cb-glow cb-glow--right"></div>

      <div className="cb-container">
        <div className="cb-inner">
          {/* LEFT */}
          <div className="cb-text">
            <div className="cb-label">
              <span className="cb-label-dot"></span>
              Let's Talk
            </div>

            <h2 className="cb-title">
              Ready to Get Your Child{" "}
              <span className="cb-title-accent">Started?</span>
            </h2>

            <p className="cb-desc">
              Have questions about our programs or need help choosing the right
              track? Our team is happy to help — reach out and we'll get back to
              you within 24 hours.
            </p>

            <div className="cb-contact-pills">
              <a href="tel:+254700000000" className="cb-pill">
                <FaPhone size={13} />
                +254 700 000 000
              </a>
              <a href="mailto:hello@futuristiccoders.com" className="cb-pill">
                <FaEnvelope size={13} />
                hello@futuristiccoders.com
              </a>
            </div>
          </div>

          {/* RIGHT */}
          <div className="cb-actions">
            <div className="cb-card">
              <div className="cb-card-icon">💬</div>
              <h3>Talk to an Advisor</h3>
              <p>
                Get personalised guidance on which program fits your child's
                age, skill level, and goals.
              </p>
              <Link href="/contact" className="cb-btn-primary">
                Contact Us <FaArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
