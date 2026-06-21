import { useState } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { Section, SectionHeader } from "../components/ui/Section";
import { Button } from "../components/ui/Button";
import { PortfolioCard } from "../components/ui/PortfolioCard";
import { PORTFOLIO, CATEGORIES, type PortfolioItem } from "../data/portfolio";

export function PortfolioPage() {
  const [filter, setFilter] = useState<string>("Tous");
  const ref = useScrollReveal<HTMLDivElement>();

  const filtered: PortfolioItem[] =
    filter === "Tous" ? PORTFOLIO : PORTFOLIO.filter((p) => p.category === filter);

  return (
    <div ref={ref} className="pt-28">
      <Section>
        <SectionHeader
          label="Portfolio"
          title="Nos créations"
          subtitle="Chaque projet raconte une histoire. Découvrez notre sélection de réalisations premium."
        />

        <div className="reveal flex flex-wrap justify-center gap-3 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 text-xs tracking-widest uppercase rounded-sm transition-all ${
                filter === cat
                  ? "bg-m7-gold text-m7-black"
                  : "border border-m7-border text-m7-muted hover:border-m7-gold/40 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, i) => (
            <div key={item.id} className="reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <PortfolioCard item={item} />
            </div>
          ))}
        </div>
      </Section>

      <Section dark>
        <div className="reveal text-center">
          <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
            Votre projet pourrait être le prochain
          </h2>
          <p className="text-m7-muted mb-8">Rejoignez nos clients premium.</p>
          <Button to="/contact" size="lg">
            Démarrer un projet
          </Button>
        </div>
      </Section>
    </div>
  );
}
