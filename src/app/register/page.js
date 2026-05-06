"use client";
import { useState } from "react";
import StepOne from "../../components/register/StepOne";
import StepTwo from "../../components/register/Steptwo";
import StepThree from "../../components/register/StepThree";
import styles from "../../components/register/Register.module.css"; // 🔥 ADD THIS

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    childName: "",
    age: "",
    school: "",
    program: "",
    parentName: "",
    email: "",
    phone: "",
    city: "",
  });

  const update = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <main className={styles.container}>
      {" "}
      {/* 🔥 APPLY */}
      <div className={styles.card}>
        {" "}
        {/* 🔥 APPLY */}
        {step === 1 && (
          <StepOne data={formData} update={update} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <StepTwo
            data={formData}
            update={update}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && <StepThree data={formData} onBack={() => setStep(2)} />}
      </div>
    </main>
  );
}
