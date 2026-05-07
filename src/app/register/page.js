import { Suspense } from "react";
// import RegisterPage from "@/components/Register/register";
import RegisterPage from "./RegisterClient"

export default function Register() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#080d1a", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
        Loading...
      </div>
    }>
      <RegisterPage />
    </Suspense>
  );
}