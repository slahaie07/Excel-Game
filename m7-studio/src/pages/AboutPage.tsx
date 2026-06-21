import { useScrollReveal } from "../hooks/useScrollReveal";
import { Section, SectionHeader } from "../components/ui/Section";
import { Button } from "../components/ui/Button";
import { TEAM, VALUES } from "../data/team";
import { STATS } from "../lib/constants";

export function AboutPage() {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <div ref={ref} className="pt-28">
      <Section>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="reveal">
            <p className="text-m7-gold text-xs tracking-[0.3em] uppercase mb-4">À propos</p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-6">
              Le studio où <span className="gold-gradient-text">l&apos;excellence</span> rencontre la créativité
            </h1>
            <p className="text-m7-muted leading-relaxed mb-4">
              Fondé en 2017 à Paris, M7 Studio est né d&apos;une conviction : le digital mérite le même
              niveau d&apos;exigence que le luxe traditionnel. Notre signature or & noir incarne cette
              promesse — élégance, précision et impact.
            </p>
            <p className="text-m7-muted leading-relaxed">
              Nous accompagnons startups ambitieuses, marques établies et entrepreneurs visionnaires
              dans la création d&apos;identités et d&apos;expériences qui marquent les esprits.
            </p>
          </div>
          <div className="reveal relative aspect-square max-w-md mx-auto lg:ml-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-m7-gold/20 via-transparent to-m7-gold/5 rounded-sm" />
            <div className="absolute inset-4 border border-m7-gold/20 rounded-sm flex items-center justify-center">
              <span className="font-display text-8xl gold-gradient-text font-bold">M7</span>
            </div>
          </div>
        </div>
      </Section>

      <Section dark>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="reveal text-center" style={{ transitionDelay: `${i * 80}ms` }}>
              <p className="font-display text-4xl gold-gradient-text font-semibold">{stat.value}</p>
              <p className="text-m7-muted text-sm mt-2">{stat.label}</p>
            </div>
          ))}
        </div>

        <SectionHeader label="Valeurs" title="Ce qui nous guide" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map((v, i) => (
            <div key={v.title} className="reveal glass-card rounded-sm p-6" style={{ transitionDelay: `${i * 80}ms` }}>
              <h3 className="font-display text-xl text-m7-gold-light mb-3">{v.title}</h3>
              <p className="text-m7-muted text-sm leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader label="Équipe" title="Les talents derrière M7" subtitle="Une équipe passionnée, experte et engagée dans chaque détail." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((member, i) => (
            <div key={member.name} className="reveal glass-card rounded-sm p-6 text-center" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="w-20 h-20 mx-auto rounded-full border border-m7-gold/30 flex items-center justify-center mb-4">
                <span className="font-display text-2xl text-m7-gold">{member.initials}</span>
              </div>
              <h3 className="font-display text-xl text-white">{member.name}</h3>
              <p className="text-m7-gold text-xs tracking-widest uppercase mt-1 mb-3">{member.role}</p>
              <p className="text-m7-muted text-sm leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section dark>
        <div className="reveal text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
            Travaillons ensemble
          </h2>
          <p className="text-m7-muted mb-8">
            Nous recrutons des talents créatifs. Et nous adorons les nouveaux défis clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button to="/contact" size="lg">Nous contacter</Button>
            <Button href="mailto:careers@m7studio.fr" variant="outline" size="lg">
              Rejoindre l&apos;équipe
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
