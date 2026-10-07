"use client";

import { useEffect, useState } from "react";
import "./CertificateVerification.css";

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function CertificateVerification() {
  const [code, setCode] = useState("");
  const [state, setState] = useState({ phase: "idle" }); // idle | loading | valid | revoked | not_found | error

  async function verify(rawCode) {
    const value = rawCode.trim().toUpperCase();
    if (!value) return;

    setState({ phase: "loading" });
    try {
      const res = await fetch(
        `/api/verify-certificate?code=${encodeURIComponent(value)}`,
      );
      const data = await res.json();

      if (data.status === "valid" || data.status === "revoked") {
        setState({ phase: data.status, certificate: data.certificate });
      } else if (data.status === "not_found") {
        setState({ phase: "not_found", code: value });
      } else {
        setState({ phase: "error", message: data.message });
      }
    } catch {
      setState({
        phase: "error",
        message:
          "Could not reach the server. Check your connection and try again.",
      });
    }
  }

  // Auto-verify when opened from a QR code: /verify-certificate?code=FC-2026-000001
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("code");
    if (fromUrl) {
      setCode(fromUrl.toUpperCase());
      verify(fromUrl);
    }
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    verify(code);
  }

  const loading = state.phase === "loading";

  return (
    <section className="cv">
      <div className="cv-inner">
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
            placeholder="FC-2026-000001"
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

        <div className="cv-result" aria-live="polite">
          {state.phase === "valid" && (
            <div className="cv-card cv-card--valid">
              <div className="cv-badge cv-badge--valid">Verified</div>
              <p className="cv-statement">This certificate is genuine.</p>
              <dl className="cv-details">
                <div>
                  <dt>Awarded to</dt>
                  <dd>{state.certificate.learnerName}</dd>
                </div>
                <div>
                  <dt>Course</dt>
                  <dd>{state.certificate.course}</dd>
                </div>
                <div>
                  <dt>Issued on</dt>
                  <dd>{formatDate(state.certificate.issuedOn)}</dd>
                </div>
                <div>
                  <dt>Certificate ID</dt>
                  <dd>{state.certificate.code}</dd>
                </div>
              </dl>
            </div>
          )}

          {state.phase === "revoked" && (
            <div className="cv-card cv-card--revoked">
              <div className="cv-badge cv-badge--revoked">Revoked</div>
              <p className="cv-statement">
                This certificate is no longer valid.
              </p>
              <p className="cv-note">
                Certificate {state.certificate.code} was issued by Futuristic
                Coders but has since been withdrawn. Contact us if you think
                this is a mistake.
              </p>
            </div>
          )}

          {state.phase === "not_found" && (
            <div className="cv-card cv-card--missing">
              <div className="cv-badge cv-badge--missing">Not found</div>
              <p className="cv-statement">
                We have no certificate with ID {state.code}.
              </p>
              <p className="cv-note">
                Check the ID for typos (0 vs O, 1 vs I). If it still fails, the
                certificate may not be from Futuristic Coders.
              </p>
            </div>
          )}

          {state.phase === "error" && (
            <div className="cv-card cv-card--missing">
              <div className="cv-badge cv-badge--missing">Error</div>
              <p className="cv-statement">{state.message}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
