import "./RegisterPage.css";
import Image from "next/image";
import { CheckCircle2, Lock } from "lucide-react";
// import { BrandLogo } from "./RegisterWizard/RegisterWizard";
import RegisterWizard, { BrandLogo } from "./RegisterWizard/RegisterWizard";

/**
 * RegisterPage.jsx
 * Full-screen layout: shared hero image, the left showcase and the wizard card.
 */

const PERKS = [
  "Manage students, programs and enrollments",
  "Track payments and invoices in one place",
  "Generate and verify certificates",
];

function RegisterShowcase() {
  return (
    <section className="reg-showcase">
      <div className="reg-showcase__pill">
        <Lock size={16} aria-hidden="true" />
        Secure Access
      </div>

      <header>
        <BrandLogo tone="light" size={64} />
      </header>

      <div className="reg-showcase__body">
        <p className="reg-showcase__eyebrow">Join · Build · Lead</p>
        <h1 className="reg-showcase__headline">
          <span>Create your</span>
          <span className="reg-showcase__accent">admin account</span>
        </h1>
        <p className="reg-showcase__lede">
          Join the team running Futuristic Coders and keep the whole academy
          organised from one workspace.
        </p>

        <ul className="reg-showcase__perks">
          {PERKS.map((perk) => (
            <li key={perk}>
              <CheckCircle2 size={22} aria-hidden="true" />
              {perk}
            </li>
          ))}
        </ul>
      </div>

      <footer className="reg-showcase__footer">
        <span aria-hidden="true" />
        Empowering the next generation of creators.
      </footer>
    </section>
  );
}

export default function RegisterPage() {
  return (
    <main className="reg-page">
      {/* One hero image behind both columns: /public/images/hero.png */}
      <div className="reg-page__hero" aria-hidden="true">
        <Image
          src="/images/hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="reg-page__hero-img"
        />
      </div>

      <RegisterShowcase />

      <section className="reg-page__card-col" aria-label="Create account">
        <RegisterWizard />
      </section>
    </main>
  );
}
