import { Suspense } from "react";
import CertificatesPage from "@/src/components/CertificatesPage/CertificatesPage";

export const metadata = {
  title: "Certificates | Futuristic Coders Admin Portal",
};

// The page reads ?student=<id> from the URL, so it sits inside Suspense.
export default function Page() {
  return (
    <Suspense fallback={null}>
      <CertificatesPage />
    </Suspense>
  );
}
