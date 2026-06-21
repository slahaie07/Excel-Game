import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useGameStore } from "../stores/gameStore";
import { UNIVERSE } from "../game/data";
import { isConvexEnabled } from "../lib/convexUtils";

function LoginForm({
  onSubmit,
  loading,
  isNew,
  setIsNew,
}: {
  onSubmit: (username: string) => void;
  loading: boolean;
  isNew: boolean;
  setIsNew: (v: boolean) => void;
}) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed.length < 3) {
      setError("Minimum 3 caractères");
      return;
    }
    setError("");
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div>
        <label className="block text-aether-300 text-sm mb-2">
          {isNew ? "Créer un compte" : "Nom d'utilisateur"}
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => { setUsername(e.target.value); setError(""); }}
          placeholder="Votre nom d'aventurier"
          className="w-full bg-aether-900/80 border border-aether-700 rounded-xl px-4 py-3 text-white placeholder-aether-500 focus:outline-none focus:border-aether-500"
          maxLength={20}
          disabled={loading}
        />
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
      </div>
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Connexion..." : isNew ? "Commencer l'aventure" : "Se connecter"}
      </button>
      <button
        type="button"
        onClick={() => setIsNew(!isNew)}
        className="w-full text-aether-400 text-sm hover:text-aether-300"
        disabled={loading}
      >
        {isNew ? "Déjà un compte ? Se connecter" : "Nouveau ? Créer un compte"}
      </button>
    </form>
  );
}

function CloudLogin() {
  const [isNew, setIsNew] = useState(true);
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
          setError("Compte introuvable");
          return;
        }
        setAccount(accountId, username);
      }
      setScreen("character-select");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoginForm onSubmit={(u) => void handleSubmit(u)} loading={loading} isNew={isNew} setIsNew={setIsNew} />
      {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
    </>
  );
}

function LocalLogin() {
  const [isNew, setIsNew] = useState(true);
  const setAccount = useGameStore((s) => s.setAccount);
  const setScreen = useGameStore((s) => s.setScreen);

  const handleSubmit = (username: string) => {
    setAccount(`local_${username.toLowerCase()}`, username);
    setScreen("character-select");
  };

  return <LoginForm onSubmit={handleSubmit} loading={false} isNew={isNew} setIsNew={setIsNew} />;
}

export default function LoginScreen() {
  const isOnline = useGameStore((s) => s.isOnline);
  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-aether-950 to-aether-900 p-6">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <div className="text-5xl mb-4">💎</div>
        <h1 className="font-display text-3xl font-bold text-aether-200 mb-1">Aetheris</h1>
        <p className="text-aether-400 text-sm mb-8">{UNIVERSE.subtitle}</p>
        <button
          onClick={() => setScreen("m7-studio")}
          className="mb-5 w-full rounded-2xl border border-yellow-400/30 bg-black/35 px-4 py-3 text-left shadow-lg shadow-black/20 active:scale-[0.98]"
        >
          <span className="block text-xs font-bold uppercase tracking-[0.22em] text-yellow-300">M7 Studio</span>
          <span className="mt-1 block text-sm font-semibold text-yellow-50">Studio complet noir & or premium</span>
        </button>
        {isConvexEnabled() ? <CloudLogin /> : <LocalLogin />}
        {isOnline ? (
          <p className="text-green-400/80 text-xs mt-6 text-center">☁️ Mode multijoueur Convex actif</p>
        ) : (
          <p className="text-aether-500 text-xs mt-6 text-center">Mode hors-ligne — données locales</p>
        )}
      </div>
      <p className="text-aether-600 text-xs text-center mt-4">{UNIVERSE.lore.slice(0, 120)}...</p>
    </div>
  );
}
