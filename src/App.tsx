import { Routes, Route } from "react-router-dom";
import { useGameStore } from "./stores/gameStore";
import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import CharacterSelectScreen from "./screens/CharacterSelectScreen";
import CharacterCreateScreen from "./screens/CharacterCreateScreen";
import WorldScreen from "./screens/WorldScreen";
import CombatScreen from "./screens/CombatScreen";
import InventoryScreen from "./screens/InventoryScreen";
import QuestsScreen from "./screens/QuestsScreen";
import GuildScreen from "./screens/GuildScreen";
import MarketplaceScreen from "./screens/MarketplaceScreen";
import ProfessionsScreen from "./screens/ProfessionsScreen";
import PvPScreen from "./screens/PvPScreen";
import DungeonsScreen from "./screens/DungeonsScreen";
import PetsScreen from "./screens/PetsScreen";
import HavenScreen from "./screens/HavenScreen";
import EventsScreen from "./screens/EventsScreen";
import ChatOverlay from "./components/ChatOverlay";

const SCREENS = {
  splash: SplashScreen,
  login: LoginScreen,
  "character-select": CharacterSelectScreen,
  "character-create": CharacterCreateScreen,
  world: WorldScreen,
  combat: CombatScreen,
  inventory: InventoryScreen,
  quests: QuestsScreen,
  guild: GuildScreen,
  marketplace: MarketplaceScreen,
  professions: ProfessionsScreen,
  pvp: PvPScreen,
  dungeons: DungeonsScreen,
  "dungeon-run": DungeonsScreen,
  pets: PetsScreen,
  haven: HavenScreen,
  events: EventsScreen,
  settings: LoginScreen,
} as const;

const IN_GAME_SCREENS = new Set(["world", "combat", "inventory", "quests", "guild", "marketplace", "professions", "pvp", "dungeons", "pets", "haven", "events"]);

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const characterId = useGameStore((s) => s.characterId);
  const Screen = SCREENS[screen] ?? SplashScreen;
  const showChat = characterId && IN_GAME_SCREENS.has(screen);

  return (
    <div className="h-dvh w-full flex flex-col overflow-hidden">
      <Routes>
        <Route path="*" element={<Screen />} />
      </Routes>
      {showChat && <ChatOverlay />}
    </div>
  );
}
