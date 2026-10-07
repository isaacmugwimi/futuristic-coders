import CertificateVerification from "../../components/Certificate-Verification/CertificateVerification";

export const metadata = {
  title: "Verify Certificate | Futuristic Coders Academy",

  description:
    "Verify the authenticity of a certificate issued by Futuristic Coders Academy. Enter a certificate ID or scan the QR code to confirm its validity.",

  keywords: [
    "certificate verification",
    "verify certificate",
    "Futuristic Coders certificate",
    "certificate authenticity",
    "online certificate verification",
    "coding certificate verification",
    "Futuristic Coders Academy",
  ],

  alternates: {
    canonical: "https://futuristiccoders.co.ke/verify-certificate",
  },

  openGraph: {
    title: "Verify Certificate | Futuristic Coders Academy",
    description:
      "Verify a certificate issued by Futuristic Coders Academy using its certificate ID or QR code.",
    url: "https://futuristiccoders.co.ke/verify-certificate",
    siteName: "Futuristic Coders Academy",
    type: "website",
    images: [
      {
        url: "https://futuristiccoders.co.ke/og-image.png",
        width: 1200,
        height: 630,
        alt: "Futuristic Coders Academy Certificate Verification",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Verify Certificate | Futuristic Coders Academy",
    description:
      "Check the authenticity of a Futuristic Coders Academy certificate using its certificate ID or QR code.",
    images: ["https://futuristiccoders.co.ke/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function VerifyCertificate() {
  return <CertificateVerification />;
}
