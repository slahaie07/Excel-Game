export type GuildRole = "leader" | "officer" | "member";

export interface GuildPerk {
  level: number;
  name: string;
  description: string;
  icon: string;
}

export interface GuestGuild {
  id: string;
  name: string;
  tag: string;
  description: string;
  leaderKey: string;
  level: number;
  xp: number;
  treasury: number;
  memberCount: number;
  maxMembers: number;
  emblem: string;
  createdAt: number;
}

export interface GuestGuildMember {
  guildId: string;
  playerKey: string;
  playerName: string;
  role: GuildRole;
  joinedAt: number;
  contribution: number;
}

export const GUILD_XP_PER_LEVEL = 1000;
export const GUILD_MAX_MEMBERS_BASE = 20;
export const GUILD_TREASURY_XP_RATIO = 10;

export const GUILD_PERKS: GuildPerk[] = [
  { level: 1, name: "Bannière de guilde", description: "Accès au hall de guilde.", icon: "🏰" },
  { level: 2, name: "Bonus d'XP +5%", description: "Bientôt : +5 % d'XP pour les membres.", icon: "✨" },
  { level: 3, name: "Trésor étendu", description: "Capacité du trésor augmentée.", icon: "💰" },
  { level: 5, name: "Officiers", description: "Le chef peut nommer des officiers.", icon: "⚔️" },
  { level: 7, name: "Bonus Éclats +5%", description: "Bientôt : +5 % d'Éclats pour les membres.", icon: "✦" },
  { level: 10, name: "Légende d'Étheris", description: "Emblème légendaire débloqué.", icon: "👑" },
];

const GUILDS_KEY = "aetheris-guest-guilds";
const MEMBERS_KEY = "aetheris-guest-guild-members";
const LEGACY_GUILDS_KEY = "aetheris-guilds";

function loadGuilds(): GuestGuild[] {
  try {
    const raw = localStorage.getItem(GUILDS_KEY);
    if (raw) return JSON.parse(raw) as GuestGuild[];
    const legacy = localStorage.getItem(LEGACY_GUILDS_KEY);
    if (!legacy) return [];
    const old = JSON.parse(legacy) as {
      id: string;
      name: string;
      tag: string;
      level: number;
      members: number;
      emblem: string;
    }[];
    const migrated: GuestGuild[] = old.map((g) => ({
      id: g.id,
      name: g.name,
      tag: g.tag,
      description: "",
      leaderKey: "",
      level: g.level,
      xp: 0,
      treasury: 0,
      memberCount: g.members,
      maxMembers: GUILD_MAX_MEMBERS_BASE,
      emblem: g.emblem,
      createdAt: Date.now(),
    }));
    saveGuilds(migrated);
    return migrated;
  } catch {
    return [];
  }
}

function saveGuilds(guilds: GuestGuild[]): void {
  localStorage.setItem(GUILDS_KEY, JSON.stringify(guilds));
}

function loadMembers(): GuestGuildMember[] {
  try {
    const raw = localStorage.getItem(MEMBERS_KEY);
    return raw ? (JSON.parse(raw) as GuestGuildMember[]) : [];
  } catch {
    return [];
  }
}

function saveMembers(members: GuestGuildMember[]): void {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

function xpToNextLevel(level: number): number {
  return level * GUILD_XP_PER_LEVEL;
}

function addGuildXp(guild: GuestGuild, xp: number): GuestGuild {
  let newXp = guild.xp + xp;
  let level = guild.level;
  let maxMembers = guild.maxMembers;

  while (newXp >= xpToNextLevel(level) && level < 20) {
    newXp -= xpToNextLevel(level);
    level++;
    if (level % 3 === 0) maxMembers += 2;
  }

  return { ...guild, xp: newXp, level, maxMembers };
}

export type GuildResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export function listGuilds(search?: string): GuestGuild[] {
  const guilds = loadGuilds();
  if (!search?.trim()) return guilds;
  const q = search.trim().toLowerCase();
  return guilds.filter(
    (g) =>
      g.name.toLowerCase().includes(q) ||
      g.tag.toLowerCase().includes(q)
  );
}

export function getGuildInfo(guildId: string): GuestGuild | null {
  return loadGuilds().find((g) => g.id === guildId) ?? null;
}

export function listGuildMembers(guildId: string): GuestGuildMember[] {
  return loadMembers()
    .filter((m) => m.guildId === guildId)
    .sort((a, b) => {
      const roleOrder: Record<GuildRole, number> = { leader: 0, officer: 1, member: 2 };
      return roleOrder[a.role] - roleOrder[b.role] || a.joinedAt - b.joinedAt;
    });
}

export function getMemberGuild(playerKey: string): GuestGuild | null {
  const member = loadMembers().find((m) => m.playerKey === playerKey);
  if (!member) return null;
  return getGuildInfo(member.guildId);
}

export function getPlayerMembership(playerKey: string): GuestGuildMember | null {
  return loadMembers().find((m) => m.playerKey === playerKey) ?? null;
}

export function createGuild(
  name: string,
  tag: string,
  playerKey: string,
  playerName: string,
  description = ""
): GuildResult<GuestGuild> {
  const trimmedName = name.trim();
  const trimmedTag = tag.trim().toUpperCase();

  if (trimmedName.length < 3) {
    return { success: false, error: "Le nom doit faire au moins 3 caractères" };
  }
  if (trimmedTag.length < 2 || trimmedTag.length > 4) {
    return { success: false, error: "Le tag doit faire 2 à 4 caractères" };
  }

  const existingMember = getPlayerMembership(playerKey);
  if (existingMember) {
    return { success: false, error: "Vous êtes déjà dans une guilde" };
  }

  const guilds = loadGuilds();
  if (guilds.some((g) => g.name.toLowerCase() === trimmedName.toLowerCase())) {
    return { success: false, error: "Ce nom de guilde existe déjà" };
  }
  if (guilds.some((g) => g.tag === trimmedTag)) {
    return { success: false, error: "Ce tag est déjà pris" };
  }

  const guild: GuestGuild = {
    id: `guild_${Date.now()}`,
    name: trimmedName,
    tag: trimmedTag,
    description: description.trim() || `Guilde fondée par ${playerName}`,
    leaderKey: playerKey,
    level: 1,
    xp: 0,
    treasury: 0,
    memberCount: 1,
    maxMembers: GUILD_MAX_MEMBERS_BASE,
    emblem: "🏰",
    createdAt: Date.now(),
  };

  const member: GuestGuildMember = {
    guildId: guild.id,
    playerKey,
    playerName,
    role: "leader",
    joinedAt: Date.now(),
    contribution: 0,
  };

  saveGuilds([...guilds, guild]);
  saveMembers([...loadMembers(), member]);

  return { success: true, data: guild };
}

export function joinGuild(
  guildId: string,
  playerKey: string,
  playerName: string
): GuildResult<GuestGuild> {
  const guild = getGuildInfo(guildId);
  if (!guild) return { success: false, error: "Guilde introuvable" };

  if (getPlayerMembership(playerKey)) {
    return { success: false, error: "Vous êtes déjà dans une guilde" };
  }

  if (guild.memberCount >= guild.maxMembers) {
    return { success: false, error: "Guilde pleine" };
  }

  const member: GuestGuildMember = {
    guildId,
    playerKey,
    playerName,
    role: "member",
    joinedAt: Date.now(),
    contribution: 0,
  };

  const guilds = loadGuilds().map((g) =>
    g.id === guildId ? { ...g, memberCount: g.memberCount + 1 } : g
  );
  saveGuilds(guilds);
  saveMembers([...loadMembers(), member]);

  return { success: true, data: getGuildInfo(guildId)! };
}

export function leaveGuild(playerKey: string): GuildResult {
  const membership = getPlayerMembership(playerKey);
  if (!membership) return { success: false, error: "Vous n'êtes dans aucune guilde" };

  const guild = getGuildInfo(membership.guildId);
  if (!guild) return { success: false, error: "Guilde introuvable" };

  if (membership.role === "leader" && guild.memberCount > 1) {
    return { success: false, error: "Transférez le leadership avant de quitter" };
  }

  const members = loadMembers().filter((m) => m.playerKey !== playerKey);
  let guilds = loadGuilds();

  if (guild.memberCount <= 1) {
    guilds = guilds.filter((g) => g.id !== guild.id);
  } else {
    guilds = guilds.map((g) =>
      g.id === guild.id ? { ...g, memberCount: g.memberCount - 1 } : g
    );
  }

  saveMembers(members);
  saveGuilds(guilds);
  return { success: true, data: undefined };
}

export function donateToGuild(
  guildId: string,
  playerKey: string,
  amount: number,
  playerEclats: number
): GuildResult<{ guild: GuestGuild; newEclats: number }> {
  if (amount <= 0) return { success: false, error: "Montant invalide" };
  if (playerEclats < amount) return { success: false, error: "Kamas insuffisants" };

  const membership = loadMembers().find(
    (m) => m.guildId === guildId && m.playerKey === playerKey
  );
  if (!membership) return { success: false, error: "Vous n'êtes pas membre de cette guilde" };

  const guild = getGuildInfo(guildId);
  if (!guild) return { success: false, error: "Guilde introuvable" };

  const guildXpGain = Math.floor(amount / GUILD_TREASURY_XP_RATIO);
  const updatedGuild = addGuildXp(
    { ...guild, treasury: guild.treasury + amount },
    guildXpGain
  );

  const guilds = loadGuilds().map((g) => (g.id === guildId ? updatedGuild : g));
  const members = loadMembers().map((m) =>
    m.playerKey === playerKey
      ? { ...m, contribution: m.contribution + amount }
      : m
  );

  saveGuilds(guilds);
  saveMembers(members);

  return {
    success: true,
    data: { guild: updatedGuild, newEclats: playerEclats - amount },
  };
}

export function getUnlockedPerks(guildLevel: number): GuildPerk[] {
  return GUILD_PERKS.filter((p) => p.level <= guildLevel);
}

export function getNextPerk(guildLevel: number): GuildPerk | null {
  return GUILD_PERKS.find((p) => p.level > guildLevel) ?? null;
}

export function roleLabel(role: GuildRole): string {
  switch (role) {
    case "leader":
      return "Chef";
    case "officer":
      return "Officier";
    case "member":
      return "Membre";
  }
}
