export function AchievementToast({
  name,
  icon,
  onDismiss,
}: {
  name: string;
  icon: string;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-24 z-[100] flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto card border-green-500/50 bg-aether-900/95 px-4 py-3 flex items-center gap-3 shadow-lg">
        <span className="text-2xl">{icon}</span>
        <div className="text-left flex-1">
          <p className="text-green-400 text-[10px] font-semibold uppercase">Succès débloqué</p>
          <p className="text-white text-sm font-medium">{name}</p>
        </div>
        <button type="button" onClick={onDismiss} className="text-aether-400 text-lg">×</button>
      </div>
    </div>
  );
}
