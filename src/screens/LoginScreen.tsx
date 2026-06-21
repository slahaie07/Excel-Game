import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useGameStore } from "../stores/gameStore";
import { UNIVERSE } from "../game/data";
import { isConvexEnabled } from "../lib/convexUtils";
import {
  APP_VERSION,
  VERSION_LABEL,
  loadUserPreferences,
  saveUserPreferences,
  type PlayMode,
} from "../lib/userPreferences";

const V5_FEATURES = [
  { icon: "📜", label: "260 quêtes" },
  { icon: "🏰", label: "120 donjons" },
  { icon: "⚒️", label: "30 métiers" },
  { icon: "⭐", label: "Niveau 200" },
] as const;

function rememberUsername(username: string) {
  saveUserPreferences({ lastUsername: username });
}

function LoginForm({
  onSubmit,
  loading,
  isNew,
  setIsNew,
  initialUsername = "",
}: {
  onSubmit: (username: string) => void;
  loading: boolean;
  isNew: boolean;
  setIsNew: (v: boolean) => void;
  initialUsername?: string;
}) {
  const [username, setUsername] = useState(initialUsername);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed.length < 3) {
      setError("Minimum 3 caractères");
      return;
    }
    if (trimmed.length > 20) {
      setError("Maximum 20 caractères");
      return;
    }
    if (!/^[\p{L}\p{N}_\- ]+$/u.test(trimmed)) {
      setError("Lettres, chiffres, espaces, tirets et underscores uniquement");
      return;
    }
    setError("");
    rememberUsername(trimmed);
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div>
        <label className="block text-aether-300 text-sm mb-2">
          {isNew ? "Nom d'Éveilleur" : "Identifiant"}
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError("");
          }}
          placeholder="Ex: Maëlys, Vorren"
          className="w-full bg-aether-900/80 border border-aether-700 rounded-xl px-4 py-3 text-white placeholder-aether-500 focus:outline-none focus:border-aether-500"
          maxLength={20}
          autoComplete="username"
          disabled={loading}
        />
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
      </div>
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Ouverture du portail..." : isNew ? "Entrer à Terreval" : "Reprendre l'aventure"}
      </button>
      <button
        type="button"
        onClick={() => setIsNew(!isNew)}
        className="w-full text-aether-400 text-sm hover:text-aether-300"
        disabled={loading}
      >
        {isNew ? "Déjà un Éveilleur ? Se connecter" : "Première visite ? Créer un compte"}
      </button>
    </form>
  );
}

function PlayModeToggle({
  mode,
  onChange,
}: {
  mode: PlayMode;
  onChange: (mode: PlayMode) => void;
}) {
  return (
    <div className="w-full grid grid-cols-2 gap-2 p-1 bg-aether-900/60 rounded-xl border border-aether-700/50 mb-6">
      <button
        type="button"
        onClick={() => onChange("cloud")}
        className={`rounded-lg py-2.5 px-3 text-sm font-medium transition-colors ${
          mode === "cloud"
            ? "bg-crystal-cyan/20 text-crystal-cyan border border-crystal-cyan/40"
            : "text-aether-400 hover:text-aether-300"
        }`}
      >
        ☁️ Terreval en ligne
      </button>
      <button
        type="button"
        onClick={() => onChange("sanctuary")}
        className={`rounded-lg py-2.5 px-3 text-sm font-medium transition-colors ${
          mode === "sanctuary"
            ? "bg-aether-700/50 text-aether-200 border border-aether-500/40"
            : "text-aether-400 hover:text-aether-300"
        }`}
      >
        🏠 Mode sanctuaire
      </button>
    </div>
  );
}

function CloudLogin() {
  const saved = loadUserPreferences();
  const [isNew, setIsNew] = useState(!saved.lastUsername);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setAccount = useGameStore((s) => s.setAccount);
  const setScreen = useGameStore((s) => s.setScreen);
  const createAccount = useMutation(api.accounts.createAccount);
  const loginAccount = useMutation(api.accounts.login);

  const handleSubmit = async (username: string) => {
    setLoading(true);
    setError("");
    try {
      if (isNew) {
        const accountId = await createAccount({ username });
        setAccount(accountId, username);
      } else {
        const accountId = await loginAccount({ username });
        if (!accountId) {
          setError("Aucun Éveilleur trouvé sous ce nom — créez un compte ou vérifiez l'orthographe");
          return;
        }
        setAccount(accountId, username);
      }
      setScreen("character-select");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Le portail refuse la connexion";
      if (msg.includes("déjà pris")) {
        setError("Ce nom est déjà pris — connectez-vous ou choisissez un autre nom");
      } else if (msg.toLowerCase().includes("network") || msg.toLowerCase().includes("fetch")) {
        setError("Terreval est injoignable — réessayez ou passez en mode sanctuaire");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoginForm
        onSubmit={(u) => void handleSubmit(u)}
        loading={loading}
        isNew={isNew}
        setIsNew={setIsNew}
        initialUsername={saved.lastUsername}
      />
      {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
      <p className="text-aether-500 text-xs text-center mt-4 leading-relaxed">
        Monde partagé — guildes, PvP, marché et quêtes synchronisés entre Éveilleurs.
      </p>
    </>
  );
}

function LocalLogin() {
  const saved = loadUserPreferences();
  const [isNew, setIsNew] = useState(!saved.lastUsername);
  const setAccount = useGameStore((s) => s.setAccount);
  const setScreen = useGameStore((s) => s.setScreen);

  const handleSubmit = (username: string) => {
    setAccount(`local_${username.toLowerCase()}`, username);
    setScreen("character-select");
  };

  return (
    <>
      <LoginForm
        onSubmit={handleSubmit}
        loading={false}
        isNew={isNew}
        setIsNew={setIsNew}
        initialUsername={saved.lastUsername}
      />
      <p className="text-aether-500 text-xs text-center mt-4 leading-relaxed">
        Progression sur cet appareil — idéal pour explorer Terreval sans connexion.
      </p>
    </>
  );
}

export default function LoginScreen() {
  const convexAvailable = isConvexEnabled();
  const [playMode, setPlayMode] = useState<PlayMode>(() => {
    const saved = loadUserPreferences().playMode;
    return convexAvailable ? saved : "sanctuary";
  });

  const useCloud = convexAvailable && playMode === "cloud";

  const handleModeChange = (mode: PlayMode) => {
    setPlayMode(mode);
    saveUserPreferences({ playMode: mode });
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-aether-950 to-aether-900 p-6 overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full py-4">
        <div className="text-5xl mb-3 animate-pulse-crystal">💎</div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-crystal-cyan border border-crystal-cyan/40 rounded-full px-3 py-0.5 mb-2">
          {VERSION_LABEL} — v{APP_VERSION}
        </span>
        <h1 className="font-display text-3xl font-bold text-aether-200 mb-1">Aetheris</h1>
        <p className="text-aether-400 text-sm mb-5 text-center">{UNIVERSE.subtitle}</p>

        <div className="w-full grid grid-cols-4 gap-2 mb-6">
          {V5_FEATURES.map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center gap-1 rounded-lg bg-aether-900/40 border border-aether-700/30 py-2 px-1"
            >
              <span className="text-lg">{f.icon}</span>
              <span className="text-[9px] text-aether-400 text-center leading-tight">{f.label}</span>
            </div>
          ))}
        </div>

        {convexAvailable && (
          <PlayModeToggle mode={playMode} onChange={handleModeChange} />
        )}

        {useCloud ? <CloudLogin /> : <LocalLogin />}

        <p className="text-aether-600 text-[10px] mt-6 text-center">
          {useCloud ? "☁️ Connexion au monde partagé de Terreval" : "🏠 Session locale — aucun compte distant requis"}
        </p>
      </div>
      <p className="text-aether-600 text-xs text-center mt-2 max-w-sm mx-auto leading-relaxed">
        {UNIVERSE.lore.slice(0, 140)}…
      </p>
    </div>
  );
}
