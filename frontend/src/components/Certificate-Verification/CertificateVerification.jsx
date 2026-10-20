"use client";

import { useEffect, useState } from "react";
import { useVerifyCertificate } from "../../hooks/certificates/useCertificateQueries";
import "./CertificateVerification.css";

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const TYPE_LABELS = {
  completion: "Completion",
  participation: "Participation",
};

function getErrorMessage(error) {
  // The API answered (for example a 400 for a badly formed ID): show its message.
  const serverMessage = error?.response?.data?.message;
  if (error?.response && serverMessage) return serverMessage;

  return "Could not reach the server. Check your connection and try again.";
}

// Decorative QR-style grid for the sample certificate (1 = filled cell)
const QR_PATTERN = [
  "111111101011111",
  "100000101010000",
  "101110100111011",
  "101110110010111",
  "101110101101001",
  "100000100110110",
  "111111101010101",
  "000000001101000",
  "110101110011101",
  "001011001110010",
  "111001110001111",
  "000100011100100",
  "101111010111011",
  "010010101001001",
  "111011010110110",
];

const STEPS = [
  {
    title: "Find the certificate ID",
    text: "It is printed at the bottom of every certificate. It starts with FC-CERT or FC-PART, followed by the year and a four-digit number.",
  },
  {
    title: "Enter it or scan the QR code",
    text: "Type the ID into the box above. Scanning the QR code with your phone camera opens this page and checks it for you.",
  },
  {
    title: "Read the result",
    text: "You will see who the certificate was awarded to, the course, the type of certificate, and the date it was issued.",
  },
];

const RESULTS = [
  {
    tone: "valid",
    label: "Verified",
    text: "Futuristic Coders issued this certificate and it is still valid.",
  },
  {
    tone: "revoked",
    label: "Revoked",
    text: "It was issued by us but has since been withdrawn.",
  },
  {
    tone: "missing",
    label: "Not found",
    text: "We have no record of this ID. Check for typos or contact us.",
  },
];

const FAQS = [
  {
    q: "Where do I find the certificate ID?",
    a: "Look at the bottom of the certificate, next to the QR code. It looks like FC-CERT-2026-0001 for a completion certificate or FC-PART-2026-0001 for a participation certificate.",
  },
  {
    q: "What is the difference between completion and participation?",
    a: "A completion certificate is awarded to learners who finished the whole course. A participation certificate is awarded to learners who took part in the course but did not finish it.",
  },
  {
    q: "The ID says “Not found”. What should I do?",
    a: "Check for look-alike characters such as 0 and O, or 1 and I. If it still fails, contact us with a photo of the certificate and we will check our records.",
  },
  {
    q: "What does “Revoked” mean?",
    a: "The certificate was genuinely issued by Futuristic Coders but has been withdrawn, for example because it was issued in error or replaced by a completion certificate. It should no longer be accepted as proof of completion.",
  },
  {
    q: "What information does the check show?",
    a: "Only the learner’s name, the course, the certificate type, the issue date and the certificate ID. Nothing else about the learner is shown.",
  },
  {
    q: "Do I need an account to verify a certificate?",
    a: "No. Anyone, including employers, schools and parents, can verify a certificate for free.",
  },
];

export default function CertificateVerification() {
  // What the visitor is typing, and what they last submitted.
  // The check only runs for the submitted ID, not on every keystroke.
  const [code, setCode] = useState("");
  const [submittedCode, setSubmittedCode] = useState("");

  const query = useVerifyCertificate(submittedCode);

  // Auto-verify when opened from a QR code: /verify-certificate?code=FC-CERT-2026-0001
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("code");

    if (fromUrl) {
      const value = fromUrl.trim().toUpperCase();
      setCode(value);
      setSubmittedCode(value);
    }
  }, []);

  function handleSubmit(e) {
    e.preventDefault();

    const value = code.trim().toUpperCase();
    if (!value) return;

    if (value === submittedCode) {
      query.refetch(); // same ID again: check it fresh
    } else {
      setSubmittedCode(value);
    }
  }

  // ---- what to show -------------------------------------------------------

  const loading = Boolean(submittedCode) && query.isFetching;
  const settled = Boolean(submittedCode) && !loading;

  const notFound =
    settled && query.isError && query.error?.response?.status === 404;
  const failed = settled && query.isError && !notFound;

  // The controller wraps the record as { success, data }.
  const record = query.data?.data ?? query.data;
  const found = settled && !query.isError && Boolean(record);

  const verified = found && record.valid === true;
  const revoked = found && record.valid === false;

  return (
    <main className="cv">
      <div className="cv-glow" aria-hidden="true" />

      {/* ---------- Hero: form + sample certificate ---------- */}
      <section className="cv-hero">
        <div className="cv-main">
          <h1 className="cv-title">Verify a Futuristic Coders Certificate</h1>

          <p className="cv-lede">
            Enter the certificate ID printed on the certificate or scan its QR
            code to verify its authenticity and confirm that it was issued by
            Futuristic Coders Academy.
          </p>

          <form className="cv-form" onSubmit={handleSubmit}>
            <label htmlFor="cv-code" className="cv-sr">
              Certificate ID
            </label>
            <input
              id="cv-code"
              className="cv-input"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="FC-CERT-2026-0001"
              autoComplete="off"
              spellCheck={false}
              maxLength={30}
            />
            <button
              className="cv-button"
              type="submit"
              disabled={loading || !code.trim()}
            >
              {loading ? "Checking…" : "Verify certificate"}
            </button>
          </form>

          <p className="cv-hint">Free to use. No account needed.</p>

          <div className="cv-result" aria-live="polite">
            {verified && (
              <div className="cv-card cv-card--valid">
                <div className="cv-badge cv-badge--valid">Verified</div>
                <p className="cv-statement">This certificate is genuine.</p>
                <dl className="cv-details">
                  <div>
                    <dt>Awarded to</dt>
                    <dd>{record.full_name}</dd>
                  </div>
                  <div>
                    <dt>Course</dt>
                    <dd>{record.program_title}</dd>
                  </div>
                  <div>
                    <dt>Certificate type</dt>
                    <dd>
                      {TYPE_LABELS[record.certificate_type] ??
                        record.certificate_type}
                    </dd>
                  </div>
                  <div>
                    <dt>Issued on</dt>
                    <dd>{formatDate(record.issued_at)}</dd>
                  </div>
                  <div>
                    <dt>Certificate ID</dt>
                    <dd>{record.certificate_no}</dd>
                  </div>
                </dl>
              </div>
            )}

            {revoked && (
              <div className="cv-card cv-card--revoked">
                <div className="cv-badge cv-badge--revoked">Revoked</div>
                <p className="cv-statement">
                  This certificate is no longer valid.
                </p>
                <p className="cv-note">
                  Certificate {record.certificate_no} was issued by Futuristic
                  Coders
                  {record.revoked_at
                    ? ` but was withdrawn on ${formatDate(record.revoked_at)}`
                    : " but has since been withdrawn"}
                  . Contact us if you think this is a mistake.
                </p>
              </div>
            )}

            {notFound && (
              <div className="cv-card cv-card--missing">
                <div className="cv-badge cv-badge--missing">Not found</div>
                <p className="cv-statement">
                  We have no certificate with ID {submittedCode}.
                </p>
                <p className="cv-note">
                  Check the ID for typos (0 vs O, 1 vs I). If it still fails,
                  the certificate may not be from Futuristic Coders.
                </p>
              </div>
            )}

            {failed && (
              <div className="cv-card cv-card--missing">
                <div className="cv-badge cv-badge--missing">Error</div>
                <p className="cv-statement">{getErrorMessage(query.error)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sample certificate showing where the ID and QR code are */}
        <figure className="cv-sample">
          <div
            className="cv-cert"
            role="img"
            aria-label="Sample certificate showing the certificate ID and QR code at the bottom"
          >
            <div className="cv-cert-frame">
              <p className="cv-cert-brand">Futuristic Coders</p>
              <p className="cv-cert-kind">Certificate of Completion</p>
              <p className="cv-cert-small">This certifies that</p>
              <p className="cv-cert-name">Learner Name</p>
              <p className="cv-cert-small">has successfully completed</p>
              <p className="cv-cert-course">Course Title</p>

              <div className="cv-cert-foot">
                <div className="cv-cert-id">
                  <span className="cv-cert-idlabel">Certificate ID</span>
                  <span className="cv-cert-idvalue">FC-CERT-2026-0001</span>
                </div>
                <div className="cv-qr">
                  {QR_PATTERN.join("")
                    .split("")
                    .map((cell, i) => (
                      <span
                        key={i}
                        className={cell === "1" ? "cv-qr-on" : "cv-qr-off"}
                      />
                    ))}
                </div>
              </div>
            </div>
          </div>
          <figcaption className="cv-sample-caption">
            Sample certificate. The ID and QR code sit at the bottom.
          </figcaption>
        </figure>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="cv-section">
        <h2 className="cv-h2">How verification works</h2>
        <ol className="cv-steps">
          {STEPS.map((step, i) => (
            <li className="cv-step" key={step.title}>
              <span className="cv-step-num">{i + 1}</span>
              <h3 className="cv-h3">{step.title}</h3>
              <p className="cv-text">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- What the results mean ---------- */}
      <section className="cv-section">
        <h2 className="cv-h2">What the results mean</h2>
        <ul className="cv-results">
          {RESULTS.map((r) => (
            <li
              className={`cv-result-item cv-result-item--${r.tone}`}
              key={r.label}
            >
              <span className={`cv-badge cv-badge--${r.tone}`}>{r.label}</span>
              <p className="cv-text">{r.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="cv-section cv-section--narrow">
        <h2 className="cv-h2">Common questions</h2>
        <div className="cv-faq">
          {FAQS.map((item) => (
            <details className="cv-faq-item" key={item.q}>
              <summary className="cv-faq-q">{item.q}</summary>
              <p className="cv-faq-a">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- Help strip ---------- */}
      <section className="cv-section">
        <div className="cv-help">
          <div>
            <h2 className="cv-help-title">
              Still can&rsquo;t verify a certificate?
            </h2>
            <p className="cv-help-text">
              Send us the certificate ID and a photo of the certificate and we
              will check our records.
            </p>
          </div>
          <a className="cv-help-link" href="/contact">
            Contact us
          </a>
        </div>
      </section>
    </main>
  );
}
