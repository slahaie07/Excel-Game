import { getPOIsForZone } from "../game/data/mapPOIs";
import { getPoiMapArt } from "../game/data/assets";
import { getRegionForZone } from "../game/data/worldMap";
import { advanceQuestOnPOIVisit } from "../lib/questProgress";

export function ZonePOIList({
  zoneId,
  characterId,
}: {
  zoneId: string;
  characterId: string;
}) {
  const pois = getPOIsForZone(zoneId);
  const region = getRegionForZone(zoneId);

  if (pois.length === 0) return null;

  return (
    <div className="px-4 py-2 border-b border-aether-700/30">
      {region && (
        <p className="text-[10px] mb-1.5" style={{ color: region.color }}>
          {region.name}
        </p>
      )}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {pois.map((poi) => (
          <button
            key={poi.id}
            type="button"
            onClick={() => advanceQuestOnPOIVisit(characterId, poi.id)}
            className="flex-shrink-0 flex items-center gap-1.5 bg-aether-900/60 rounded-lg px-2 py-1 border border-aether-700/40 hover:border-aether-500/60 active:scale-95 transition-colors overflow-hidden"
            title={poi.description}
          >
            {getPoiMapArt(poi.id) ? (
              <img src={getPoiMapArt(poi.id)} alt="" className="w-10 h-6 rounded object-cover flex-shrink-0" />
            ) : (
              <span className="text-sm">{poi.icon}</span>
            )}
            <div className="min-w-0 text-left">
              <p className="text-aether-200 text-[10px] font-medium truncate max-w-[100px]">
                {poi.name}
              </p>
              <p className="text-aether-500 text-[8px] capitalize">{poi.type}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
