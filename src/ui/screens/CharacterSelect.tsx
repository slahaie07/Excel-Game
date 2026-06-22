import { useState } from "react";
import { useGameStore } from "../../store/gameStore";
import { CLASSES } from "../../data/classes";
import { listSavedCharacters, deleteSavedCharacter, savedToPlayer } from "../../lib/saveManager";

export function CharacterSelect() {
  const setScreen = useGameStore((s) => s.setScreen);
  const loadCharacter = useGameStore((s) => s.loadCharacter);
  const [characters, setCharacters] = useState(listSavedCharacters);

  const refresh = () => setCharacters(listSavedCharacters());

  const play = (id: string) => {
    const saved = characters.find((c) => c.id === id);
    if (!saved) return;
    loadCharacter(savedToPlayer(saved));
  };

  const remove = (id: string) => {
    deleteSavedCharacter(id);
    refresh();
  };

  return (
    <div className="char-select">
      <button className="btn-back" onClick={() => setScreen("splash")}>
        ← Retour
      </button>
      <h2 className="panel-title">Vos Héros</h2>

      {characters.length === 0 ? (
        <p className="char-select-empty">
          Aucun personnage sauvegardé. Créez votre premier héros !
        </p>
      ) : (
        <div className="char-list">
          {characters.map((c) => {
            const cls = CLASSES[c.classId];
            return (
              <div key={c.id} className="char-card" style={{ borderColor: cls.color }}>
                <div className="char-card-info">
                  <strong>{c.name}</strong>
                  <span>{cls.name} — Niv. {c.level}</span>
                  <span className="char-card-zone">{c.zone.replace(/_/g, " ")}</span>
                  <span className="char-card-kamas">💰 {c.kamas}</span>
                </div>
                <div className="char-card-actions">
                  <button className="btn-primary" onClick={() => play(c.id)}>
                    Jouer
                  </button>
                  <button className="btn-secondary" onClick={() => remove(c.id)}>
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        className="btn-primary char-select-new"
        onClick={() => setScreen("character_create")}
      >
        + Créer un nouveau héros
      </button>
    </div>
  );
}
