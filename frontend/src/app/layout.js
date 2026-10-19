import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import "../global.css";
import QueryProvider from "../providers/QueryProvider";

export const metadata = {
  title: "Futuristic Coders | Coding Education for the Next Generation",
  description:
    "Structured coding education programs for kids and teens. From Scratch to React — we build confident, creative developers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <Navbar />
          {children}
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}