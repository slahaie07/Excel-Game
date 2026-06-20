import { useState } from "react";
import { useGameStore } from "../../store/gameStore";
import { CLASSES, type ClassId } from "../../data/classes";

export function CharacterCreate() {
  const createCharacter = useGameStore((s) => s.createCharacter);
  const setScreen = useGameStore((s) => s.setScreen);
  const [name, setName] = useState("");
  const [selectedClass, setSelectedClass] = useState<ClassId>("gardien");

  const handleCreate = () => {
    if (name.trim().length < 2) return;
    createCharacter(name.trim(), selectedClass);
  };

  const cls = CLASSES[selectedClass];

  return (
    <div className="char-create">
      <button className="btn-back" onClick={() => setScreen("splash")}>
        ← Retour
      </button>
      <h2 className="panel-title">Créer votre Héros</h2>

      <div className="char-create-form">
        <label className="input-label">
          Nom du personnage
          <input
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Entrez votre nom..."
            maxLength={16}
          />
        </label>
      </div>

      <h3 className="section-title">Choisissez votre classe</h3>
      <div className="class-grid">
        {(Object.keys(CLASSES) as ClassId[]).map((id) => {
          const c = CLASSES[id];
          return (
            <button
              key={id}
              className={`class-card ${selectedClass === id ? "selected" : ""}`}
              style={{ borderColor: c.color }}
              onClick={() => setSelectedClass(id)}
            >
              <span className="class-role">{c.role}</span>
              <span className="class-name">{c.name}</span>
              <span className="class-desc">{c.description}</span>
            </button>
          );
        })}
      </div>

      <div className="class-preview" style={{ borderColor: cls.color }}>
        <h4>{cls.name}</h4>
        <p>{cls.description}</p>
        <p className="class-passive">Passif : {cls.passive}</p>
        <div className="stat-row">
          <span>❤️ {cls.baseStats.maxHp}</span>
          <span>⚡ {cls.baseStats.maxPa} PA</span>
          <span>👟 {cls.baseStats.maxPm} PM</span>
          <span>💪 {cls.baseStats.force}</span>
          <span>🧠 {cls.baseStats.intelligence}</span>
        </div>
      </div>

      <button
        className="btn-primary"
        onClick={handleCreate}
        disabled={name.trim().length < 2}
      >
        Entrer dans Étheris
      </button>
    </div>
  );
}
