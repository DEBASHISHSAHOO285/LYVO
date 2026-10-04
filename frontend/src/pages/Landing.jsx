import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import WorkspaceShowcase from "../components/landing/WorkspaceShowcase";
import DebateShowcase from "../components/landing/DebateShowcase";
import ImageStudioShowcase from "../components/landing/ImageStudioShowcase";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

function Landing() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <Features />
        <WorkspaceShowcase />
        <DebateShowcase />
        <ImageStudioShowcase />
        <CTA />
      </main>

      <Footer />
    </>
  );
}

export default Landing;