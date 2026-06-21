import { useState } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { Section, SectionHeader } from "../components/ui/Section";
import { Button } from "../components/ui/Button";
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
            <article
              key={item.id}
              className={`reveal group relative aspect-[4/5] rounded-sm overflow-hidden bg-gradient-to-br ${item.gradient}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-500" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                <p className="text-m7-gold text-xs tracking-widest uppercase">{item.category}</p>
                <h3 className="font-display text-2xl md:text-3xl text-white mt-1">{item.title}</h3>
                <p className="text-m7-muted text-sm mt-2">{item.client} · {item.year}</p>
                <p className="text-white/70 text-sm mt-3 leading-relaxed opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-24 transition-all duration-300 overflow-hidden">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] tracking-wider uppercase px-2 py-1 border border-m7-gold/30 text-m7-gold-light rounded-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
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
