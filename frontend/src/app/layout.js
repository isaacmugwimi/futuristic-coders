import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import "../global.css"
export const metadata = {
  title: "Futuristic Coders | Coding Education for the Next Generation",
  description:
    "Structured coding education programs for kids and teens. From Scratch to React — we build confident, creative developers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Navbar />
        {children}

        <Footer />
      </body>
    </html>
  );
}
