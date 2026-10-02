// Shared Draw Steel rules logic — used by both frontend and backend.
// All formulas per the official DRAW STEEL rules (Creator License):
//   Hero ES = 4 + 2 × level
//   Party ES = heroES × (heroes + floor(victories / 2))
//   Monster EV = ceil((2 × level + 4) × organization modifier)
//   Monster Stamina ≈ ceil((10 × level + role modifier) × organization modifier)

export type Organization =
  | "minion"
  | "horde"
  | "platoon"
  | "elite"
  | "leader"
  | "solo";

export type MonsterRole =
  | "Ambusher"
  | "Artillery"
  | "Brute"
  | "Controller"
  | "Defender"
  | "Harrier"
  | "Hexer"
  | "Mount"
  | "Support";

export interface Monster {
  id: number;
  name: string;
  group: string;
  keywords: string[];
  level: number;
  organization: Organization;
  role: MonsterRole | null; // leaders & solos have no role
  ev: number; // for minions: EV per squad of four
  stamina: number; // minions: stamina-only modifier (×0.125)
}

export const ORGANIZATIONS: Organization[] = [
  "minion",
  "horde",
  "platoon",
  "elite",
  "leader",
  "solo",
];

export const ORG_LABEL: Record<Organization, string> = {
  minion: "Minion",
  horde: "Horde",
  platoon: "Platoon",
  elite: "Elite",
  leader: "Leader",
  solo: "Solo",
};

export const ORG_MODIFIER: Record<Organization, number> = {
  minion: 0.5, // EV per four minions
  horde: 0.5,
  platoon: 1,
  elite: 2,
  leader: 2,
  solo: 6,
};

export const ROLE_MODIFIER: Record<MonsterRole | "Leader" | "Solo", number> = {
  Ambusher: 20,
  Artillery: 10,
  Brute: 30,
  Controller: 10,
  Defender: 30,
  Harrier: 20,
  Hexer: 10,
  Mount: 20,
  Support: 20,
  Leader: 30,
  Solo: 30,
};

export function monsterEv(level: number, org: Organization): number {
  return Math.ceil((2 * level + 4) * ORG_MODIFIER[org]);
}

export function monsterStamina(
  level: number,
  org: Organization,
  role: MonsterRole | null,
): number {
  const roleMod =
    org === "solo" ? ROLE_MODIFIER.Solo : org === "leader" ? ROLE_MODIFIER.Leader : ROLE_MODIFIER[role ?? "Brute"];
  const orgMod = org === "minion" ? 0.125 : org === "solo" ? 5 : ORG_MODIFIER[org];
  return Math.ceil((10 * level + roleMod) * orgMod);
}

// ---- Encounter math ----

export function heroES(level: number): number {
  return 4 + 2 * level;
}

/** Effective hero count: +1 hero per 2 average Victories. */
export function effectiveHeroes(heroes: number, victories: number): number {
  return heroes + Math.floor(Math.max(0, victories) / 2);
}

export function partyES(heroes: number, level: number, victories: number): number {
  return heroES(level) * effectiveHeroes(heroes, victories);
}

export type Difficulty = "trivial" | "easy" | "standard" | "hard" | "extreme";

export const DIFFICULTIES: Difficulty[] = [
  "trivial",
  "easy",
  "standard",
  "hard",
  "extreme",
];

export interface DifficultyBand {
  difficulty: Difficulty;
  label: string;
  /** [min, max] EV; max = Infinity for extreme */
  min: number;
  max: number;
  victoriesAwarded: string;
}

export function difficultyBands(
  heroes: number,
  level: number,
  victories: number,
): DifficultyBand[] {
  const h = heroES(level);
  const es = partyES(heroes, level, victories);
  return [
    { difficulty: "trivial", label: "Trivial", min: 0, max: es - h - 1, victoriesAwarded: "0" },
    { difficulty: "easy", label: "Easy", min: es - h, max: es - 1, victoriesAwarded: "1" },
    { difficulty: "standard", label: "Standard", min: es, max: es + h, victoriesAwarded: "1" },
    { difficulty: "hard", label: "Hard", min: es + h + 1, max: es + 3 * h, victoriesAwarded: "2" },
    { difficulty: "extreme", label: "Extreme", min: es + 3 * h + 1, max: Infinity, victoriesAwarded: "2+" },
  ];
}

export function classifyDifficulty(
  totalEv: number,
  heroes: number,
  level: number,
  victories: number,
): Difficulty | null {
  if (totalEv <= 0) return null;
  for (const band of difficultyBands(heroes, level, victories)) {
    if (totalEv >= band.min && totalEv <= band.max) return band.difficulty;
  }
  return "extreme";
}

// ---- Lineup ----

export interface LineupEntry {
  monsterId: number;
  /** minions: number of individuals (multiple of 4); others: count */
  count: number;
}

export function entryEv(monster: Monster, count: number): number {
  if (monster.organization === "minion") {
    return monster.ev * Math.ceil(count / 4);
  }
  return monster.ev * count;
}

export function lineupTotalEv(
  lineup: LineupEntry[],
  monsters: Map<number, Monster>,
): number {
  return lineup.reduce((sum, e) => {
    const m = monsters.get(e.monsterId);
    return m ? sum + entryEv(m, e.count) : sum;
  }, 0);
}

/** Recommended max creature level: heroes + 2 (or +3 with 6+ Victories). Solos cap at +1. */
export function recommendedMaxLevel(level: number, victories: number, org?: Organization): number {
  if (org === "solo") return level + 1;
  return level + (victories >= 6 ? 3 : 2);
}

// ---- Dice ----

export interface PowerRollResult {
  dice: [number, number];
  modifier: number;
  total: number;
  tier: 1 | 2 | 3;
}

export function powerRollTier(total: number): 1 | 2 | 3 {
  if (total <= 11) return 1;
  if (total <= 16) return 2;
  return 3;
}

export const SHARE_SLUG_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
