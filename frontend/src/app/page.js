import Hero from "../components/Hero/Hero";
import Programs from "../components/Programs/Programs";
import About from "../components/About/About";
import ContactBanner from "../components/ContactBanner/ConatctBanner";

export default function Home() {
  return (
    <main>
      <Hero />
      <Programs />
      <About />
      <ContactBanner />
    </main>
  );
}
