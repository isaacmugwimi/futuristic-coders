import Link from "next/link";
import Image from "next/image";
import "./ProgramDetail.css"

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// Accepts an array, a JSON-encoded array string, or a newline-separated string.
function toList(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return toList(parsed);
    } catch {
      /* not JSON, fall through */
    }
    return value
      .split(/\r?\n/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function formatPrice(value) {
  const n = toNumber(value);
  if (n === null) return null;
  if (n === 0) return "Free";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  }).format(d);
}

function plural(n, singular, pluralWord = `${singular}s`) {
  return `${n} ${n === 1 ? singular : pluralWord}`;
}

function toParagraphs(text) {
  return String(text ?? "")
    .split(/\n{2,}|\r\n\r\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function getInstructorName(program) {
  if (typeof program.instructor === "string") return program.instructor;
  return program.instructor?.name || program.instructor_name || null;
}

/* ------------------------------------------------------------------ */
/* Reusable pieces                                                     */
/* ------------------------------------------------------------------ */

function Breadcrumb({ title }) {
  return (
    <nav className="program-detail__breadcrumb" aria-label="Breadcrumb">
      <ol className="program-detail__breadcrumb-list">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/programs">Programs</Link>
        </li>
        <li aria-current="page">
          <span>{title}</span>
        </li>
      </ol>
    </nav>
  );
}

function HeroFact({ label, value }) {
  if (!value) return null;
  return (
    <div className="program-detail__fact">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ListSection({ id, title, items, variant = "check" }) {
  if (!items.length) return null;
  return (
    <section className="program-detail__section" aria-labelledby={id}>
      <h2 id={id} className="program-detail__section-title">
        {title}
      </h2>
      <ul className={`program-detail__list program-detail__list--${variant}`}>
        {items.map((item, i) => (
          <li key={`${id}-${i}`}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function TechSection({ items }) {
  if (!items.length) return null;
  return (
    <section className="program-detail__section" aria-labelledby="pd-tools">
      <h2 id="pd-tools" className="program-detail__section-title">
        Tools &amp; Technologies
      </h2>
      <ul className="program-detail__tags">
        {items.map((tool, i) => (
          <li key={`tool-${i}`} className="program-detail__tag">
            {tool}
          </li>
        ))}
      </ul>
    </section>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="program-detail__info-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function EnrollmentCard({ program, enrollHref }) {
  const price = formatPrice(program.price);
  const instructor = getInstructorName(program);
  const startDate = formatDate(program.start_date);
  const perWeek = toNumber(program.sessions_per_week);
  const minutes = toNumber(program.session_minutes);

  return (
    <section className="program-detail__card" aria-labelledby="pd-enroll-title">
      <h2 id="pd-enroll-title" className="program-detail__card-title">
        Enroll in this program
      </h2>

      {price && <p className="program-detail__price">{price}</p>}

      <dl className="program-detail__info">
        <InfoRow label="Instructor" value={instructor} />
        <InfoRow label="Schedule" value={program.schedule} />
        <InfoRow label="Start date" value={startDate} />
        <InfoRow
          label="Frequency"
          value={perWeek ? `${plural(perWeek, "session")} per week` : null}
        />
        <InfoRow
          label="Session length"
          value={minutes ? plural(minutes, "minute") : null}
        />
      </dl>

      <Link
        href={enrollHref}
        className="program-detail__btn program-detail__btn--primary program-detail__btn--block"
      >
        Enroll now
      </Link>
    </section>
  );
}

function HelpCard() {
  return (
    <section className="program-detail__help" aria-labelledby="pd-help-title">
      <h2 id="pd-help-title" className="program-detail__help-title">
        Need help choosing?
      </h2>
      <p>
        Not sure if this program is the right fit? Talk to our team and we will
        guide you to the best learning path.
      </p>
      <Link href="/contact" className="program-detail__link">
        Contact us →
      </Link>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function ProgramDetail({ program }) {
  if (!program) return null;

  const {
    title,
    slug,
    summary,
    description,
    level,
    age_group: ageGroup,
    mode,
    thumbnail,
  } = program;

  const weeks = toNumber(program.duration_weeks);
  const duration = weeks ? plural(weeks, "week") : null;

  const outcomes = toList(program.outcomes);
  const prerequisites = toList(program.prerequisites);
  const requirements = toList(program.requirements);
  const tools = toList(program.tools);
  const paragraphs = toParagraphs(description);

  const enrollHref = `/register?program=${encodeURIComponent(slug)}`;

  return (
    <main className="program-detail">
      {/* Hero */}
      <header className="program-detail__hero">
        <div className="program-detail__container program-detail__hero-inner">
          <div className="program-detail__hero-content">
            <Breadcrumb title={title} />

            {level && (
              <p className="program-detail__eyebrow">{level} program</p>
            )}
            <h1 className="program-detail__title">{title}</h1>
            {summary && <p className="program-detail__summary">{summary}</p>}

            <dl className="program-detail__facts">
              <HeroFact label="Level" value={level} />
              <HeroFact label="Age group" value={ageGroup} />
              <HeroFact label="Duration" value={duration} />
              <HeroFact label="Learning mode" value={mode} />
            </dl>

            <div className="program-detail__actions">
              <Link
                href={enrollHref}
                className="program-detail__btn program-detail__btn--primary"
              >
                Enroll now
              </Link>
              <Link
                href="/contact"
                className="program-detail__btn program-detail__btn--secondary"
              >
                Ask a question
              </Link>
            </div>
          </div>

          <div className="program-detail__media">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={`${title}: ${level ? `${level} ` : ""}coding program at Futuristic Coders Academy`}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 480px"
                className="program-detail__image"
              />
            ) : (
              <div
                className="program-detail__media-placeholder"
                aria-hidden="true"
              >
                {"</>"}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="program-detail__container program-detail__layout">
        <div className="program-detail__main">
          {paragraphs.length > 0 && (
            <section
              className="program-detail__section"
              aria-labelledby="pd-about"
            >
              <h2 id="pd-about" className="program-detail__section-title">
                About This Program
              </h2>
              {paragraphs.map((p, i) => (
                <p key={`about-${i}`} className="program-detail__text">
                  {p}
                </p>
              ))}
            </section>
          )}

          <ListSection
            id="pd-outcomes"
            title="What You Will Learn"
            items={outcomes}
          />
          <ListSection
            id="pd-prerequisites"
            title="Prerequisites"
            items={prerequisites}
            variant="dot"
          />
          <ListSection
            id="pd-requirements"
            title="Requirements"
            items={requirements}
            variant="dot"
          />
          <TechSection items={tools} />

          <Link href="/programs" className="program-detail__back">
            ← Back to all programs
          </Link>
        </div>

        <aside
          className="program-detail__sidebar"
          aria-label="Enrollment and help"
        >
          <EnrollmentCard program={program} enrollHref={enrollHref} />
          <HelpCard />
        </aside>
      </div>
    </main>
  );
}
