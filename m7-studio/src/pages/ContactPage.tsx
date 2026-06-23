import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { Section, SectionHeader } from "../components/ui/Section";
import { Button } from "../components/ui/Button";
import { BRAND } from "../lib/constants";
import { submitContactForm } from "../lib/contact";

const BUDGETS = [
  "Moins de 5 000 €",
  "5 000 – 15 000 €",
  "15 000 – 50 000 €",
  "Plus de 50 000 €",
];

const PROJECT_TYPES = [
  "Branding & Identité",
  "Site web",
  "Application",
  "Motion / Vidéo",
  "Stratégie digitale",
  "Autre",
];

export function ContactPage() {
  const ref = useScrollReveal<HTMLDivElement>();
  const [searchParams] = useSearchParams();
  const [sent, setSent] = useState(searchParams.get("success") === "true");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      await submitContactForm({
        firstName: String(fd.get("firstName")),
        lastName: String(fd.get("lastName")),
        email: String(fd.get("email")),
        company: String(fd.get("company") || ""),
        projectType: String(fd.get("projectType")),
        budget: String(fd.get("budget") || ""),
        message: String(fd.get("message")),
      });
      setSent(true);
      form.reset();
    } catch {
      setError("L'envoi a échoué. Écrivez-nous directement à contact@m7studio.fr");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={ref} className="pt-28">
      <Section>
        <SectionHeader
          label="Contact"
          title="Parlons de votre projet"
          subtitle="Remplissez le formulaire ou contactez-nous directement. Réponse sous 24h."
        />

        <div className="grid lg:grid-cols-5 gap-12">
          <div className="reveal lg:col-span-2 space-y-8">
            <div>
              <h3 className="text-m7-gold text-xs tracking-widest uppercase mb-2">Email</h3>
              <a href={`mailto:${BRAND.email}`} className="text-white hover:text-m7-gold transition-colors">
                {BRAND.email}
              </a>
            </div>
            <div>
              <h3 className="text-m7-gold text-xs tracking-widest uppercase mb-2">Téléphone</h3>
              <p className="text-white">{BRAND.phone}</p>
            </div>
            <div>
              <h3 className="text-m7-gold text-xs tracking-widest uppercase mb-2">Adresse</h3>
              <p className="text-white">{BRAND.address}</p>
            </div>
            <div>
              <h3 className="text-m7-gold text-xs tracking-widest uppercase mb-4">Réseaux</h3>
              <div className="flex flex-wrap gap-3">
                {(["instagram", "linkedin", "behance", "dribbble"] as const).map((s) => (
                  <a
                    key={s}
                    href={BRAND.social[s]}
                    className="text-sm text-m7-muted hover:text-m7-gold capitalize transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-sm p-6">
              <p className="text-m7-gold text-xs tracking-widest uppercase mb-2">Disponibilité</p>
              <p className="text-white text-sm">Lun – Ven, 9h – 18h (CET)</p>
              <p className="text-m7-muted text-sm mt-2">Devis gratuit · Sans engagement</p>
            </div>
          </div>

          <div className="reveal lg:col-span-3">
            {sent ? (
              <div className="glass-card rounded-sm p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-full border border-m7-gold/40 flex items-center justify-center mb-6">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3 className="font-display text-2xl text-white mb-2">Message envoyé</h3>
                <p className="text-m7-muted">Nous vous répondrons sous 24 heures.</p>
              </div>
            ) : (
              <form
                name="contact"
                method="POST"
                data-netlify="true"
                data-netlify-honeypot="bot-field"
                onSubmit={handleSubmit}
                className="glass-card rounded-sm p-8 md:p-10 space-y-6"
              >
                <input type="hidden" name="form-name" value="contact" />
                <p className="hidden">
                  <label>
                    Ne pas remplir : <input name="bot-field" />
                  </label>
                </p>

                {error && (
                  <p className="text-red-400 text-sm border border-red-400/30 rounded-sm px-4 py-3">{error}</p>
                )}

                <div className="grid sm:grid-cols-2 gap-6">
                  <label className="block">
                    <span className="text-xs tracking-widest uppercase text-m7-muted">Prénom *</span>
                    <input
                      required
                      type="text"
                      name="firstName"
                      className="mt-2 w-full bg-m7-black border border-m7-border rounded-sm px-4 py-3 text-white focus:border-m7-gold/50 focus:outline-none transition-colors"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs tracking-widest uppercase text-m7-muted">Nom *</span>
                    <input
                      required
                      type="text"
                      name="lastName"
                      className="mt-2 w-full bg-m7-black border border-m7-border rounded-sm px-4 py-3 text-white focus:border-m7-gold/50 focus:outline-none transition-colors"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-xs tracking-widest uppercase text-m7-muted">Email *</span>
                  <input
                    required
                    type="email"
                    name="email"
                    className="mt-2 w-full bg-m7-black border border-m7-border rounded-sm px-4 py-3 text-white focus:border-m7-gold/50 focus:outline-none transition-colors"
                  />
                </label>

                <label className="block">
                  <span className="text-xs tracking-widest uppercase text-m7-muted">Entreprise</span>
                  <input
                    type="text"
                    name="company"
                    className="mt-2 w-full bg-m7-black border border-m7-border rounded-sm px-4 py-3 text-white focus:border-m7-gold/50 focus:outline-none transition-colors"
                  />
                </label>

                <div className="grid sm:grid-cols-2 gap-6">
                  <label className="block">
                    <span className="text-xs tracking-widest uppercase text-m7-muted">Type de projet *</span>
                    <select
                      required
                      name="projectType"
                      className="mt-2 w-full bg-m7-black border border-m7-border rounded-sm px-4 py-3 text-white focus:border-m7-gold/50 focus:outline-none transition-colors"
                    >
                      <option value="">Sélectionner</option>
                      {PROJECT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs tracking-widest uppercase text-m7-muted">Budget estimé</span>
                    <select
                      name="budget"
                      className="mt-2 w-full bg-m7-black border border-m7-border rounded-sm px-4 py-3 text-white focus:border-m7-gold/50 focus:outline-none transition-colors"
                    >
                      <option value="">Sélectionner</option>
                      {BUDGETS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="text-xs tracking-widest uppercase text-m7-muted">Décrivez votre projet *</span>
                  <textarea
                    required
                    name="message"
                    rows={5}
                    className="mt-2 w-full bg-m7-black border border-m7-border rounded-sm px-4 py-3 text-white focus:border-m7-gold/50 focus:outline-none transition-colors resize-y"
                    placeholder="Objectifs, délais, inspirations..."
                  />
                </label>

                <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading}>
                  {loading ? "Envoi en cours..." : "Envoyer ma demande"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}
