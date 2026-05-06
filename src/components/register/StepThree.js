"use client";
import { useState } from "react";
import styles from "./Register.module.css";

export default function StepThree({ data, onBack }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className={styles.success}>
        <h2>🎉 Application received!</h2>
        <p>We’ll be in touch shortly.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className={styles.title}>Confirm Details</h2>

      <div className={styles.summary_row}>
        <span className={styles.summary_label}>Child</span>
        <span className={styles.summary_value}>{data.childName}</span>
      </div>

      <div className={styles.summary_row}>
        <span className={styles.summary_label}>Program</span>
        <span className={styles.summary_value}>{data.program}</span>
      </div>

      <div className={styles.summary_row}>
        <span className={styles.summary_label}>Parent</span>
        <span className={styles.summary_value}>{data.parentName}</span>
      </div>

      <div className={styles.summary_row}>
        <span className={styles.summary_label}>Email</span>
        <span className={styles.summary_value}>{data.email}</span>
      </div>

      <div className={styles.buttons}>
        <button className={styles.btn_back} onClick={onBack}>
          ← Back
        </button>

        <button className={styles.btn_next} onClick={() => setSubmitted(true)}>
          Submit Application
        </button>
      </div>
    </div>
  );
}
