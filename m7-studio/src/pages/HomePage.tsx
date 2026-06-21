import { Link } from "react-router-dom";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { Button } from "../components/ui/Button";
import { Section, SectionHeader } from "../components/ui/Section";
import { ServiceIcon } from "../components/ui/ServiceIcon";
import { STATS } from "../lib/constants";
import { SERVICES, PROCESS_STEPS } from "../data/services";
import { PORTFOLIO } from "../data/portfolio";
import { TESTIMONIALS } from "../data/team";

export function HomePage() {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <div ref={ref}>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,169,98,0.12),transparent_50%)]" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-m7-gold/5 rounded-full blur-3xl glow-orb" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-m7-gold/5 rounded-full blur-3xl glow-orb" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <p className="reveal text-m7-gold text-xs tracking-[0.4em] uppercase mb-6">
            Studio créatif premium
          </p>
          <h1 className="reveal font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold leading-[1.05] mb-6">
            <span className="text-white">L&apos;art du</span>
            <br />
            <span className="gold-gradient-text">digital luxe</span>
          </h1>
          <p className="reveal text-m7-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            M7 Studio conçoit des expériences visuelles d&apos;exception — branding, web et motion —
            pour des marques qui exigent le meilleur.
          </p>
          <div className="reveal flex flex-col sm:flex-row gap-4 justify-center">
            <Button to="/portfolio" size="lg">
              Voir nos réalisations
            </Button>
            <Button to="/contact" variant="outline" size="lg">
              Parlons de votre projet
            </Button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-px h-12 bg-gradient-to-b from-m7-gold to-transparent" />
        </div>
      </section>

      {/* Stats */}
      <Section dark>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="reveal text-center" style={{ transitionDelay: `${i * 100}ms` }}>
              <p className="font-display text-4xl md:text-5xl gold-gradient-text font-semibold">{stat.value}</p>
              <p className="text-m7-muted text-sm mt-2 tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Services preview */}
      <Section>
        <SectionHeader
          label="Expertise"
          title="Tout pour votre marque"
          subtitle="De l'identité visuelle au développement, un studio complet à votre service."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.slice(0, 6).map((service, i) => (
            <div
              key={service.id}
              className="reveal glass-card rounded-sm p-8 hover:border-m7-gold/30 transition-all duration-300 group"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <ServiceIcon icon={service.icon} />
              <h3 className="font-display text-2xl text-white mt-6 mb-2 group-hover:text-m7-gold-light transition-colors">
                {service.title}
              </h3>
              <p className="text-m7-gold text-xs tracking-widest uppercase mb-3">{service.subtitle}</p>
              <p className="text-m7-muted text-sm leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
        <div className="reveal text-center mt-12">
          <Button to="/services" variant="outline">
            Tous nos services
          </Button>
        </div>
      </Section>

      {/* Process */}
      <Section dark>
        <SectionHeader
          label="Méthode"
          title="Notre processus"
          subtitle="Quatre étapes pour transformer votre vision en réalité premium."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PROCESS_STEPS.map((step, i) => (
            <div key={step.step} className="reveal relative" style={{ transitionDelay: `${i * 100}ms` }}>
              <span className="font-display text-6xl text-m7-gold/20 font-bold">{step.step}</span>
              <h3 className="font-display text-2xl text-white -mt-4 mb-3">{step.title}</h3>
              <p className="text-m7-muted text-sm leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Portfolio preview */}
      <Section>
        <SectionHeader
          label="Portfolio"
          title="Réalisations sélectionnées"
          subtitle="Des projets qui incarnent notre signature or & noir."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PORTFOLIO.slice(0, 3).map((item, i) => (
            <Link
              key={item.id}
              to="/portfolio"
              className={`reveal group relative aspect-[4/5] rounded-sm overflow-hidden bg-gradient-to-br ${item.gradient}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
              <div className="absolute inset-0 border border-m7-gold/0 group-hover:border-m7-gold/30 transition-colors duration-500 rounded-sm" />
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-m7-gold text-xs tracking-widest uppercase mb-1">{item.category}</p>
                <h3 className="font-display text-2xl text-white">{item.title}</h3>
                <p className="text-m7-muted text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.client} · {item.year}
                </p>
              </div>
            </Link>
          ))}
        </div>
        <div className="reveal text-center mt-12">
          <Button to="/portfolio">Voir tout le portfolio</Button>
        </div>
      </Section>

      {/* Testimonials */}
      <Section dark>
        <SectionHeader label="Témoignages" title="Ils nous font confiance" />
        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <blockquote
              key={t.author}
              className="reveal glass-card rounded-sm p-8"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <p className="text-white/90 text-sm leading-relaxed italic mb-6">&ldquo;{t.quote}&rdquo;</p>
              <footer>
                <p className="text-m7-gold font-medium">{t.author}</p>
                <p className="text-m7-muted text-xs mt-1">{t.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="reveal relative rounded-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-m7-gold/20 via-m7-gold/5 to-transparent" />
          <div className="relative glass-card p-12 md:p-16 text-center">
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
              Prêt à créer quelque chose d&apos;<span className="gold-gradient-text">exceptionnel</span> ?
            </h2>
            <p className="text-m7-muted max-w-xl mx-auto mb-8">
              Discutons de votre projet. Devis gratuit sous 24h.
            </p>
            <Button to="/contact" size="lg">
              Contactez-nous
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
