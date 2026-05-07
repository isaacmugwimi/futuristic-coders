import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import Programs from "../components/Programs/Programs";
import About from "../components/About/About";
import Footer from "../components/Footer/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Programs />
      <About />
      <Footer />
    </main>
  );
}
