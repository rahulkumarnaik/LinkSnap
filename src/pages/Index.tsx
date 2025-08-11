import ShortenForm from "@/components/ShortenForm";
import Spotlight from "@/components/Spotlight";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.title = "LinkSnap • Lightning-fast URL Shortener";
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-hero-gradient opacity-70 pointer-events-none" />
      <Spotlight className="absolute inset-0" />
      <header className="relative z-10">
        <nav className="container flex items-center justify-between py-6">
          <a href="/" className="font-bold tracking-tight text-lg">LinkSnap</a>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <a href="https://github.com/" target="_blank" rel="noreferrer" aria-label="GitHub">
                <Github className="mr-2 size-4" /> Star
              </a>
            </Button>
          </div>
        </nav>
      </header>

      <main className="relative z-10 container py-10 md:py-16">
        <ShortenForm />
      </main>

      <footer className="relative z-10">
        <div className="container py-10 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} LinkSnap • Built with React & Tailwind
        </div>
      </footer>
    </div>
  );
};

export default Index;
