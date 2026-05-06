import styles from "./Register.module.css";

export default function StepOne({ data, update, onNext }) {
  const isValid = data.childName && data.age && data.program;

  return (
    <div>
      <h2 className={styles.title}>Child Information</h2>

      <div className={styles.field}>
        <input
          className={styles.input}
          value={data.childName}
          onChange={e => update("childName", e.target.value)}
          placeholder="Child's Full Name"
        />
      </div>

      <div className={styles.field}>
        <input
          className={styles.input}
          type="number"
          value={data.age}
          onChange={e => update("age", e.target.value)}
          placeholder="Age"
        />
      </div>

      <div className={styles.field}>
        <input
          className={styles.input}
          value={data.school}
          onChange={e => update("school", e.target.value)}
          placeholder="School (optional)"
        />
      </div>

      <div className={styles.field}>
        <select
          className={styles.select}
          value={data.program}
          onChange={e => update("program", e.target.value)}
        >
          <option value="">Select Program</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
      </div>

      <div className={styles.buttons}>
        <button className={styles.btn_next} onClick={onNext} disabled={!isValid}>
          Next →
        </button>
      </div>
    </div>
  );
}