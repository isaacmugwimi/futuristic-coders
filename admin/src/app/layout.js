import { Plus_Jakarta_Sans } from "next/font/google";
import QueryProvider from "../providers/QueryProvider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata = {
  title: "Sign in | Futuristic Coders Admin Portal",
  description:
    "Manage students, programs, enrollments, payments and certificates at Futuristic Coders.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body><QueryProvider>{children}</QueryProvider></body>
    </html>
  );
}