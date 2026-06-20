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
  settings: LoginScreen,
} as const;

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const Screen = SCREENS[screen] ?? SplashScreen;

  return (
    <div className="h-dvh w-full flex flex-col overflow-hidden">
      <Routes>
        <Route path="*" element={<Screen />} />
      </Routes>
    </div>
  );
}
