import { useState } from "react";
import { useGameStore } from "../stores/gameStore";
import { UNIVERSE } from "../game/data";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [isNew, setIsNew] = useState(true);
  const [error, setError] = useState("");
  const setAccount = useGameStore((s) => s.setAccount);
  const setScreen = useGameStore((s) => s.setScreen);
  const isOnline = useGameStore((s) => s.isOnline);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 3) {
      setError("Minimum 3 caractères");
      return;
    }

    const accountId = `local_${username.toLowerCase()}`;
    setAccount(accountId, username.trim());
    setScreen("character-select");
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-aether-950 to-aether-900 p-6">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <div className="text-5xl mb-4">💎</div>
        <h1 className="font-display text-3xl font-bold text-aether-200 mb-1">Aetheris</h1>
        <p className="text-aether-400 text-sm mb-8">{UNIVERSE.subtitle}</p>

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
            />
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
          </div>

          <button type="submit" className="btn-primary w-full">
            {isNew ? "Commencer l'aventure" : "Se connecter"}
          </button>

          <button
            type="button"
            onClick={() => setIsNew(!isNew)}
            className="w-full text-aether-400 text-sm hover:text-aether-300"
          >
            {isNew ? "Déjà un compte ? Se connecter" : "Nouveau ? Créer un compte"}
          </button>
        </form>

        {!isOnline && (
          <p className="text-aether-500 text-xs mt-6 text-center">
            Mode hors-ligne — vos données sont sauvegardées localement
          </p>
        )}
      </div>

      <p className="text-aether-600 text-xs text-center mt-4">
        {UNIVERSE.lore.slice(0, 120)}...
      </p>
    </div>
  );
}
