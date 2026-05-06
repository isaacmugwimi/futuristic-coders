import styles from "./Footer.module.css";

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
    <footer className={styles.footer} id="contact">
      <div className="container">
        <div className={styles.footer__grid}>
          {/* Brand */}
          <div>
            <div className={styles.footer__brand_logo}>
              <div className={styles.footer__brand_icon}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <span className={styles.footer__brand_name}>
                Futuristic Coders
              </span>
            </div>
            <p className={styles.footer__brand_desc}>
              Empowering the next generation of developers through structured,
              academic coding education. From Scratch to React.
            </p>
            <div className={styles.footer__socials}>
              {/* Twitter/X */}
              <a
                href="#"
                className={styles.footer__social}
                aria-label="Twitter"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* Facebook */}
              <a
                href="#"
                className={styles.footer__social}
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="#"
                className={styles.footer__social}
                aria-label="Instagram"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="#"
                className={styles.footer__social}
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={styles.footer__col_title}>Quick Links</h4>
            <ul className={styles.footer__links}>
              {QUICK_LINKS.map((link) => (
                <li key={link}>
                  <a href="#" className={styles.footer__link}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className={styles.footer__col_title}>Programs</h4>
            <ul className={styles.footer__links}>
              {PROGRAMS.map((p) => (
                <li key={p}>
                  <a href="#programs" className={styles.footer__link}>
                    {p}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className={styles.footer__col_title}>Contact Us</h4>
            <div className={styles.footer__contact_item}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className={styles.footer__contact_text}>
                123 Education Lane,
                <br />
                Nairobi, Kenya
              </span>
            </div>
            <div className={styles.footer__contact_item}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span className={styles.footer__contact_text}>
                mugwimiisaac230@gmail.com
              </span>
            </div>
            <div className={styles.footer__contact_item}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span className={styles.footer__contact_text}>
                +254 700 000 000
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.footer__bottom}>
          <p className={styles.footer__copyright}>
            © {year} Futuristic Coders. All rights reserved.
          </p>
          <div className={styles.footer__bottom_links}>
            <a href="#" className={styles.footer__bottom_link}>
              Privacy Policy
            </a>
            <a href="#" className={styles.footer__bottom_link}>
              Terms of Service
            </a>
            <a href="#" className={styles.footer__bottom_link}>
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
