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
import GuildHallScreen from "./screens/GuildHallScreen";
import MarketplaceScreen from "./screens/MarketplaceScreen";
import ProfessionsScreen from "./screens/ProfessionsScreen";
import PvPScreen from "./screens/PvPScreen";
import DungeonsScreen from "./screens/DungeonsScreen";
import RaidsScreen from "./screens/RaidsScreen";
import PetsScreen from "./screens/PetsScreen";
import HavenScreen from "./screens/HavenScreen";
import EventsScreen from "./screens/EventsScreen";
import LiveEventsScreen from "./screens/LiveEventsScreen";
import DailyRewardsScreen from "./screens/DailyRewardsScreen";
import AchievementsScreen from "./screens/AchievementsScreen";
import FriendsScreen from "./screens/FriendsScreen";
import TradeScreen from "./screens/TradeScreen";
import SettingsScreen from "./screens/SettingsScreen";
import HallOfFameScreen from "./screens/HallOfFameScreen";
import ClassScreen from "./screens/ClassScreen";
import FactionsScreen from "./screens/FactionsScreen";
import TerritoryOverviewRouter from "./screens/TerritoryOverviewRouter";
import GuideScreen from "./screens/GuideScreen";
import CreditsScreen from "./screens/CreditsScreen";
import ProgressScreen from "./screens/ProgressScreen";
import ChatOverlay from "./components/ChatOverlay";
import { LevelUpToast } from "./components/LevelUpToast";
import { AchievementToast } from "./components/AchievementToast";
import { useToastStore } from "./stores/toastStore";

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
  "guild-hall": GuildHallScreen,
  marketplace: MarketplaceScreen,
  professions: ProfessionsScreen,
  pvp: PvPScreen,
  dungeons: DungeonsScreen,
  "dungeon-run": DungeonsScreen,
  raids: RaidsScreen,
  pets: PetsScreen,
  haven: HavenScreen,
  events: EventsScreen,
  "live-events": LiveEventsScreen,
  daily: DailyRewardsScreen,
  achievements: AchievementsScreen,
  friends: FriendsScreen,
  trade: TradeScreen,
  settings: SettingsScreen,
  "hall-of-fame": HallOfFameScreen,
  class: ClassScreen,
  factions: FactionsScreen,
  "territory-overview": TerritoryOverviewRouter,
  guide: GuideScreen,
  credits: CreditsScreen,
  progress: ProgressScreen,
} as const;

const IN_GAME_SCREENS = new Set([
  "world", "combat", "inventory", "quests", "guild", "guild-hall", "marketplace",
  "professions", "pvp", "dungeons", "raids", "pets", "haven", "events", "live-events",
  "daily", "achievements", "friends", "trade", "settings", "hall-of-fame", "class", "factions",
  "territory-overview", "guide", "credits", "progress",
]);

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const characterId = useGameStore((s) => s.characterId);
  const Screen = SCREENS[screen] ?? SplashScreen;
  const showChat = characterId && IN_GAME_SCREENS.has(screen);
  const levelUp = useToastStore((s) => s.levelUp);
  const achievement = useToastStore((s) => s.achievement);
  const dismissLevelUp = useToastStore((s) => s.dismissLevelUp);
  const dismissAchievement = useToastStore((s) => s.dismissAchievement);

  return (
    <div className="h-dvh w-full flex flex-col overflow-hidden">
      <Routes>
        <Route path="*" element={<Screen />} />
      </Routes>
      {showChat && <ChatOverlay />}
      {levelUp !== null && (
        <LevelUpToast level={levelUp} onDismiss={dismissLevelUp} />
      )}
      {achievement && (
        <AchievementToast
          name={achievement.name}
          icon={achievement.icon}
          onDismiss={dismissAchievement}
        />
      )}
    </div>
  );
}
