import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { useGameStore } from "./stores/gameStore";
import SplashScreen from "./screens/SplashScreen";
import ChatOverlay from "./components/ChatOverlay";

const LoginScreen = lazy(() => import("./screens/LoginScreen"));
const CharacterSelectScreen = lazy(() => import("./screens/CharacterSelectScreen"));
const CharacterCreateScreen = lazy(() => import("./screens/CharacterCreateScreen"));
const WorldScreen = lazy(() => import("./screens/WorldScreen"));
const CombatScreen = lazy(() => import("./screens/CombatScreen"));
const InventoryScreen = lazy(() => import("./screens/InventoryScreen"));
const QuestsScreen = lazy(() => import("./screens/QuestsScreen"));
const GuildScreen = lazy(() => import("./screens/GuildScreen"));
const GuildHallScreen = lazy(() => import("./screens/GuildHallScreen"));
const MarketplaceScreen = lazy(() => import("./screens/MarketplaceScreen"));
const ProfessionsScreen = lazy(() => import("./screens/ProfessionsScreen"));
const PvPScreen = lazy(() => import("./screens/PvPScreen"));
const DungeonsScreen = lazy(() => import("./screens/DungeonsScreen"));
const RaidsScreen = lazy(() => import("./screens/RaidsScreen"));
const PetsScreen = lazy(() => import("./screens/PetsScreen"));
const HavenScreen = lazy(() => import("./screens/HavenScreen"));
const EventsScreen = lazy(() => import("./screens/EventsScreen"));
const LiveEventsScreen = lazy(() => import("./screens/LiveEventsScreen"));
const DailyRewardsScreen = lazy(() => import("./screens/DailyRewardsScreen"));
const AchievementsScreen = lazy(() => import("./screens/AchievementsScreen"));
const FriendsScreen = lazy(() => import("./screens/FriendsScreen"));
const TradeScreen = lazy(() => import("./screens/TradeScreen"));
const SettingsScreen = lazy(() => import("./screens/SettingsScreen"));
const HallOfFameScreen = lazy(() => import("./screens/HallOfFameScreen"));
const MountsScreen = lazy(() => import("./screens/MountsScreen"));
const SeasonScreen = lazy(() => import("./screens/SeasonScreen"));

function ScreenLoader() {
  return (
    <div className="h-dvh w-full flex flex-col items-center justify-center gap-3 bg-[#0d0618]">
      <div className="w-10 h-10 rounded-full border-2 border-crystal-gold/30 border-t-crystal-gold animate-spin" />
      <p className="text-aether-400 text-sm">Chargement...</p>
    </div>
  );
}

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
  mounts: MountsScreen,
  haven: HavenScreen,
  events: EventsScreen,
  "live-events": LiveEventsScreen,
  daily: DailyRewardsScreen,
  achievements: AchievementsScreen,
  friends: FriendsScreen,
  trade: TradeScreen,
  settings: SettingsScreen,
  "hall-of-fame": HallOfFameScreen,
  season: SeasonScreen,
} as const;

const IN_GAME_SCREENS = new Set([
  "world", "combat", "inventory", "quests", "guild", "guild-hall", "marketplace",
  "professions", "pvp", "dungeons", "raids", "pets", "mounts", "haven", "events", "live-events",
  "daily", "achievements", "friends", "trade", "settings", "hall-of-fame", "season",
]);

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const characterId = useGameStore((s) => s.characterId);
  const Screen = SCREENS[screen] ?? SplashScreen;
  const showChat = characterId && IN_GAME_SCREENS.has(screen);
  const needsSuspense = screen !== "splash";

  const content = <Screen />;

  return (
    <div className="h-dvh w-full flex flex-col overflow-hidden">
      <Routes>
        <Route
          path="*"
          element={
            needsSuspense ? (
              <Suspense fallback={<ScreenLoader />}>{content}</Suspense>
            ) : (
              content
            )
          }
        />
      </Routes>
      {showChat && <ChatOverlay />}
    </div>
  );
}
