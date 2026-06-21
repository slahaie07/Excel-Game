export function LevelUpToast({
  level,
  onDismiss,
}: {
  level: number;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-x-0 top-16 z-[100] flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto card-premium border-crystal-cyan/60 bg-aether-900/95 px-6 py-4 text-center animate-level-up shadow-lg shadow-crystal-cyan/25">
        <p className="text-3xl mb-1">✦</p>
        <p className="font-display text-lg font-bold text-crystal-cyan">Niveau {level}</p>
        <p className="text-aether-400 text-xs mt-1">Votre Éveil s&apos;intensifie — sorts et talents disponibles</p>
        <button type="button" onClick={onDismiss} className="btn-primary mt-3 text-sm py-1.5 px-4">
          Continuer
        </button>
      </div>
    </div>
  );
}
