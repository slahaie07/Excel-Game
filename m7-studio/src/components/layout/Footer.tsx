import { Link } from "react-router-dom";
import { BRAND, NAV_LINKS } from "../../lib/constants";
import { Logo } from "../ui/Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-m7-charcoal border-t border-m7-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <Logo />
            <p className="text-m7-muted text-sm mt-4 leading-relaxed">
              Studio créatif premium. Branding, web, motion et stratégie digitale en or & noir.
            </p>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.25em] uppercase text-m7-gold mb-4">Navigation</h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-m7-muted text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.25em] uppercase text-m7-gold mb-4">Services</h4>
            <ul className="space-y-2 text-m7-muted text-sm">
              <li>Branding & Identité</li>
              <li>Web Design</li>
              <li>Développement</li>
              <li>Motion Design</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.25em] uppercase text-m7-gold mb-4">Contact</h4>
            <ul className="space-y-2 text-m7-muted text-sm">
              <li>
                <a href={`mailto:${BRAND.email}`} className="hover:text-m7-gold transition-colors">
                  {BRAND.email}
                </a>
              </li>
              <li>{BRAND.phone}</li>
              <li>{BRAND.address}</li>
            </ul>
            <div className="flex gap-4 mt-4">
              {(["instagram", "linkedin", "behance", "dribbble"] as const).map((s) => (
                <a
                  key={s}
                  href={BRAND.social[s]}
                  className="text-m7-muted hover:text-m7-gold transition-colors text-xs uppercase tracking-wider"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.slice(0, 2)}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="gold-line w-full mt-12 mb-6" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-m7-muted text-xs">
          <p>© {year} {BRAND.name}. Tous droits réservés.</p>
          <p className="tracking-wider">Excellence · Or & Noir · Premium</p>
        </div>
      </div>
    </footer>
  );
}
