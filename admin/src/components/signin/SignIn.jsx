"use client";
import Image from "next/image";
import "./SignIn.css";
import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import {
  Users,
  BookOpen,
  FileText,
  CreditCard,
  Award,
  Settings,
  CodeXml,
  GraduationCap,
  BarChart3,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    title: "Students",
    text: "Track progress and performance",
    icon: Users,
    tone: "blue",
  },
  {
    title: "Programs",
    text: "Manage courses and curriculum",
    icon: BookOpen,
    tone: "violet",
  },
  {
    title: "Enrollments",
    text: "Handle registrations and subscriptions",
    icon: FileText,
    tone: "green",
  },
  {
    title: "Payments",
    text: "Monitor transactions and invoices",
    icon: CreditCard,
    tone: "amber",
  },
  {
    title: "Certificates",
    text: "Generate and verify certificates",
    icon: Award,
    tone: "magenta",
  },
  {
    title: "Settings",
    text: "Manage users and system preferences",
    icon: Settings,
    tone: "cyan",
  },
];

/* Approximate logo mark: swap for your real logo file when ready */
function Logo({ tone = "dark", size = 56 }) {
  return (
    <div className={`logo logo--${tone}`}>
      <Image
        src="/images/flogo.png"
        alt="Futuristic Coders logo"
        width={size}
        height={size}
        className="logo__mark"
        priority
      />
      <div className="logo__text">
        <span className="logo__name">
          Futuristic <span className="logo__accent">Coders</span>
        </span>
        <span className="logo__sub">Admin Portal</span>
      </div>
    </div>
  );
}

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      // TODO: point this at your real auth endpoint
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.message ||
            "The email or password is incorrect. Check them and try again.",
        );
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogle() {
    // TODO: wire to your provider, e.g. signIn("google") with NextAuth
    console.log("Continue with Google");
  }

  return (
    <main className="portal">
      {/* ---------- Left: showcase ---------- */}
      <div className="hero-media" aria-hidden="true">
        <Image
          src="/images/hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-media__img"
        />
      </div>
      <section className="showcase">
        <span className="chip chip--code" aria-hidden="true">
          <CodeXml size={34} strokeWidth={2} />
        </span>
        <span className="chip chip--cap" aria-hidden="true">
          <GraduationCap size={36} strokeWidth={1.8} />
        </span>
        <span className="chip chip--chart" aria-hidden="true">
          <BarChart3 size={34} strokeWidth={2} />
        </span>

        <div className="secure-pill">
          <Lock size={16} aria-hidden="true" />
          Secure Access
        </div>

        <header className="showcase__header">
          <Logo tone="light" size={80} />
        </header>

        <div className="showcase__body">
          <p className="eyebrow">Learn · Build · Innovate</p>

          <h1 className="headline">
            <span className="headline__line">Manage</span>
            <span className="headline__line headline__line--accent">
              Tomorrow&rsquo;s
            </span>
            <span className="headline__line">Tech Leaders</span>
          </h1>

          <p className="lede">
            Your central workspace for managing students, programs, enrollments,
            payments and academy operations.
          </p>

          <ul className="features">
            {FEATURES.map(({ title, text, icon: Icon, tone }) => (
              <li key={title} className="feature">
                <span className={`feature__tile feature__tile--${tone}`}>
                  <Icon size={32} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="feature__title">{title}</h2>
                  <p className="feature__text">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <footer className="showcase__footer">
          <span className="showcase__rule" aria-hidden="true" />
          Empowering the next generation of creators.
        </footer>
      </section>

      {/* ---------- Right: sign-in card ---------- */}
      <section className="portal__auth" aria-label="Sign in">
        <div className="auth-card">
          <Logo tone="dark" size={54} />

          <div className="auth-card__intro">
            <h2 className="auth-card__title">Welcome back</h2>
            <p className="auth-card__subtitle">
              Sign in to access your admin dashboard
            </p>
          </div>

          <form className="form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label className="field__label" htmlFor="email">
                Email address
              </label>
              <div className="field__control">
                <Mail className="field__icon" size={22} aria-hidden="true" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="field__input"
                  placeholder="admin@futuristic-coders.co.ke"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="password">
                Password
              </label>
              <div className="field__control">
                <Lock className="field__icon" size={22} aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="field__input"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="field__toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <Eye size={22} /> : <EyeOff size={22} />}
                </button>
              </div>
            </div>

            <div className="form__row">
              <label className="check">
                <input
                  type="checkbox"
                  className="check__box"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link href="/forgot-password" className="link">
                Forgot password?
              </Link>
            </div>

            {error && (
              <p className="form__error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign In"}
              {!loading && <ArrowRight size={20} aria-hidden="true" />}
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="btn btn--outline"
              onClick={handleGoogle}
            >
              <FcGoogle size={22} />
              Continue with Google
            </button>
          </form>

          <div className="auth-card__note">
            <ShieldCheck size={36} strokeWidth={1.5} aria-hidden="true" />
            <p>
              <strong>Authorized staff only</strong>
              <span>Your data is secure and protected</span>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
