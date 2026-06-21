import { useGameStore } from "../stores/gameStore";

const studioServices = [
  { label: "Branding", detail: "logo, charte, direction artistique", icon: "◆" },
  { label: "Photo & vidéo", detail: "shooting, clips, reels, films premium", icon: "◈" },
  { label: "Audio", detail: "voix, mixage, sound design, jingle", icon: "◇" },
  { label: "Web & app", detail: "site vitrine, landing page, tunnel client", icon: "✦" },
  { label: "3D & motion", detail: "renders, animations, habillage studio", icon: "✧" },
  { label: "Marketing", detail: "campagnes, contenus, réseaux sociaux", icon: "★" },
] as const;

const premiumFiles = [
  "Brand book M7 noir & or",
  "Kit logo HD + icônes sociales",
  "Moodboard studio premium",
  "Pack templates posts/reels",
  "Brief client professionnel",
  "Checklist livraison finale",
] as const;

const studioStats = [
  { value: "360°", label: "studio complet" },
  { value: "24K", label: "style or premium" },
  { value: "Pro", label: "livrables prêts" },
] as const;

export default function M7StudioScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const accountId = useGameStore((s) => s.accountId);
  const characterId = useGameStore((s) => s.characterId);
  const backScreen = characterId ? "world" : accountId ? "character-select" : "login";

  return (
    <div className="flex-1 overflow-y-auto bg-[#050505] text-white">
      <div className="relative min-h-full overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#8a6a1d55,transparent_34%),radial-gradient(circle_at_80%_20%,#f8d56b22,transparent_26%),linear-gradient(135deg,#050505_0%,#111111_52%,#020202_100%)]" />
        <div className="absolute left-[-20%] top-16 h-72 w-72 rounded-full bg-yellow-600/10 blur-3xl" />
        <div className="absolute right-[-30%] bottom-12 h-96 w-96 rounded-full bg-amber-300/10 blur-3xl" />

        <div className="relative mx-auto flex min-h-full w-full max-w-5xl flex-col px-5 py-5 sm:px-8">
          <header className="flex items-center justify-between gap-3">
            <button
              onClick={() => setScreen(backScreen)}
              className="rounded-full border border-yellow-500/30 bg-black/50 px-4 py-2 text-sm font-semibold text-yellow-100 shadow-lg shadow-black/30 active:scale-95"
            >
              ← Retour
            </button>
            <div className="rounded-full border border-yellow-500/30 bg-yellow-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.3em] text-yellow-200">
              Premium studio
            </div>
          </header>

          <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-black/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-yellow-200">
                <span className="h-2 w-2 rounded-full bg-yellow-300 shadow-[0_0_18px_#ffd86b]" />
                M7 Studio
              </div>

              <div className="space-y-4">
                <h1 className="font-display text-5xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-300 to-amber-600 sm:text-7xl">
                  Un studio qui comporte tout.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-zinc-300">
                  M7 Studio réunit identité, contenu, production, web, marketing et fichiers prêts à livrer dans une expérience noir et or super professionnelle.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {studioStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-yellow-500/25 bg-white/[0.04] p-4 shadow-xl shadow-black/25">
                    <p className="text-2xl font-black text-yellow-200">{stat.value}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-zinc-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => document.getElementById("m7-gold-vault")?.scrollIntoView({ behavior: "smooth", block: "center" })}
                  className="rounded-2xl bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-600 px-6 py-3 font-black text-black shadow-2xl shadow-yellow-500/25 active:scale-95"
                >
                  Ouvrir les fichiers M7
                </button>
                <button
                  type="button"
                  onClick={() => document.getElementById("m7-services")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="rounded-2xl border border-yellow-500/35 bg-black/50 px-6 py-3 font-bold text-yellow-100 active:scale-95"
                >
                  Voir le pack complet
                </button>
              </div>
            </div>

            <div id="m7-gold-vault" className="rounded-[2rem] border border-yellow-400/25 bg-black/60 p-4 shadow-2xl shadow-yellow-950/40 backdrop-blur">
              <div className="rounded-[1.5rem] border border-yellow-500/20 bg-gradient-to-br from-zinc-950 via-black to-yellow-950/40 p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-yellow-500">Master files</p>
                    <h2 className="mt-1 font-display text-2xl font-bold text-yellow-100">M7 Gold Vault</h2>
                  </div>
                  <div className="grid h-14 w-14 place-items-center rounded-2xl border border-yellow-300/40 bg-yellow-300/10 font-display text-xl font-black text-yellow-200">
                    M7
                  </div>
                </div>

                <div className="space-y-3">
                  {premiumFiles.map((file, index) => (
                    <div key={file} className="flex items-center gap-3 rounded-2xl border border-yellow-500/15 bg-white/[0.035] p-3">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-yellow-400/10 text-sm font-black text-yellow-200">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-zinc-100">{file}</p>
                        <p className="text-xs text-zinc-500">Format premium prêt à présenter au client</p>
                      </div>
                      <span className="text-yellow-300">↗</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="m7-services" className="grid gap-3 pb-8 sm:grid-cols-2 lg:grid-cols-3">
            {studioServices.map((service) => (
              <article key={service.label} className="rounded-3xl border border-yellow-500/20 bg-white/[0.035] p-5 shadow-xl shadow-black/20">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl border border-yellow-400/25 bg-yellow-300/10 text-xl text-yellow-200">
                  {service.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-yellow-100">{service.label}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{service.detail}</p>
              </article>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
