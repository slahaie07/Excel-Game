import { useScrollReveal } from "../hooks/useScrollReveal";
import { Section, SectionHeader } from "../components/ui/Section";
import { ServiceIcon } from "../components/ui/ServiceIcon";
import { Button } from "../components/ui/Button";
import { SERVICES, PROCESS_STEPS } from "../data/services";

export function ServicesPage() {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <div ref={ref} className="pt-28">
      <Section>
        <SectionHeader
          label="Services"
          title="Une offre complète"
          subtitle="Branding, design, développement et stratégie — tout sous un même toit premium."
        />

        <div className="space-y-8">
          {SERVICES.map((service, i) => (
            <article
              key={service.id}
              className="reveal glass-card rounded-sm p-8 md:p-10 grid md:grid-cols-[auto_1fr] gap-8 items-start"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <ServiceIcon icon={service.icon} />
              <div>
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-4">
                  <h3 className="font-display text-3xl text-white">{service.title}</h3>
                  <span className="text-m7-gold text-xs tracking-widest uppercase">{service.subtitle}</span>
                </div>
                <p className="text-m7-muted leading-relaxed mb-6">{service.description}</p>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {service.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-m7-gold shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section dark>
        <SectionHeader
          label="Méthode"
          title="Comment nous travaillons"
          subtitle="Un processus éprouvé, transparent et orienté résultats."
        />
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PROCESS_STEPS.map((step, i) => (
            <div key={step.step} className="reveal flex gap-6" style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="font-display text-3xl text-m7-gold shrink-0">{step.step}</span>
              <div>
                <h3 className="font-display text-xl text-white mb-2">{step.title}</h3>
                <p className="text-m7-muted text-sm leading-relaxed">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="reveal text-center glass-card rounded-sm p-12">
          <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
            Besoin d&apos;un devis sur mesure ?
          </h2>
          <p className="text-m7-muted mb-8 max-w-lg mx-auto">
            Décrivez votre projet et recevez une proposition détaillée sous 24 heures.
          </p>
          <Button to="/contact" size="lg">
            Demander un devis
          </Button>
        </div>
      </Section>
    </div>
  );
}
