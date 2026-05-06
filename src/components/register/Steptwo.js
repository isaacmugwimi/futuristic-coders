import styles from "./Register.module.css";

export default function StepTwo({ data, update, onNext, onBack }) {
  const isValid = data.parentName && data.email && data.phone && data.city;

  return (
    <div>
      <h2 className={styles.title}>Parent Information</h2>

      <div className={styles.field}>
        <input
          className={styles.input}
          value={data.parentName}
          onChange={(e) => update("parentName", e.target.value)}
          placeholder="Parent Full Name"
        />
      </div>

      <div className={styles.field}>
        <input
          className={styles.input}
          value={data.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="Email"
        />
      </div>

      <div className={styles.field}>
        <input
          className={styles.input}
          value={data.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="Phone"
        />
      </div>

      <div className={styles.field}>
        <input
          className={styles.input}
          value={data.city}
          onChange={(e) => update("city", e.target.value)}
          placeholder="City"
        />
      </div>

      <div className={styles.buttons}>
        <button className={styles.btn_back} onClick={onBack}>
          ← Back
        </button>

        <button
          className={styles.btn_next}
          onClick={onNext}
          disabled={!isValid}
        >
          Next →
        </button>
      </div>
    </div>
  );
}