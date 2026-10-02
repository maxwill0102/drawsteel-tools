import {
  monsterEv,
  monsterStamina,
  type MonsterRole,
  type Organization,
} from "@contracts/game";

interface RawMonster {
  name: string;
  group: string;
  keywords: string[];
  level: number;
  organization: Organization;
  role: MonsterRole | null;
}

// Stat lines sourced from the official DRAW STEEL Monsters book
// (published under the DRAW STEEL Creator License).
// EV is verified against the official formula: ceil((2×level+4) × orgModifier).
const RAW: RawMonster[] = [
  // ---- Demons, 1st Echelon ----
  { name: "Ensnarer", group: "Demons", keywords: ["Abyssal", "Demon"], level: 1, organization: "minion", role: "Brute" },
  { name: "Frenzied", group: "Demons", keywords: ["Abyssal", "Demon"], level: 1, organization: "minion", role: "Harrier" },
  { name: "Pitling", group: "Demons", keywords: ["Abyssal", "Demon"], level: 1, organization: "minion", role: "Artillery" },
  { name: "Ruinant", group: "Demons", keywords: ["Abyssal", "Demon"], level: 1, organization: "horde", role: "Harrier" },
  { name: "Torlas", group: "Demons", keywords: ["Abyssal", "Demon"], level: 1, organization: "horde", role: "Controller" },
  { name: "Bendrak", group: "Demons", keywords: ["Abyssal", "Demon"], level: 2, organization: "horde", role: "Hexer" },
  { name: "Remasch", group: "Demons", keywords: ["Abyssal", "Demon"], level: 2, organization: "horde", role: "Ambusher" },
  { name: "Muceron", group: "Demons", keywords: ["Abyssal", "Demon"], level: 3, organization: "horde", role: "Brute" },
  { name: "Chorogaunt", group: "Demons", keywords: ["Abyssal", "Demon"], level: 3, organization: "leader", role: null },
  // ---- Demons, 2nd Echelon ----
  { name: "Grulqin", group: "Demons", keywords: ["Abyssal", "Demon"], level: 4, organization: "minion", role: "Brute" },
  { name: "Orliq", group: "Demons", keywords: ["Abyssal", "Demon"], level: 4, organization: "minion", role: "Harrier" },
  { name: "Wobalas", group: "Demons", keywords: ["Abyssal", "Demon"], level: 4, organization: "minion", role: "Artillery" },
  { name: "Fangling", group: "Demons", keywords: ["Abyssal", "Demon"], level: 4, organization: "horde", role: "Harrier" },
  { name: "Gunge", group: "Demons", keywords: ["Abyssal", "Demon"], level: 4, organization: "horde", role: "Controller" },
  { name: "Bale Eye", group: "Demons", keywords: ["Abyssal", "Demon"], level: 5, organization: "horde", role: "Hexer" },
  { name: "Fiktin", group: "Demons", keywords: ["Abyssal", "Demon"], level: 5, organization: "horde", role: "Ambusher" },
  { name: "Tormenauk", group: "Demons", keywords: ["Abyssal", "Demon"], level: 6, organization: "horde", role: "Brute" },
  { name: "Lumbering Egress", group: "Demons", keywords: ["Abyssal", "Demon"], level: 6, organization: "leader", role: null },
  // ---- Demons, 3rd Echelon ----
  { name: "Soulraker Scout", group: "Demons", keywords: ["Abyssal", "Demon", "Soulraker"], level: 7, organization: "minion", role: "Harrier" },
  { name: "Soulraker Soldier", group: "Demons", keywords: ["Abyssal", "Demon", "Soulraker"], level: 7, organization: "minion", role: "Brute" },
  { name: "Soulraker Stinger", group: "Demons", keywords: ["Abyssal", "Demon", "Soulraker"], level: 7, organization: "minion", role: "Artillery" },
  { name: "Soulraker Praetorian", group: "Demons", keywords: ["Abyssal", "Demon", "Soulraker"], level: 7, organization: "horde", role: "Harrier" },
  { name: "Blight Phage", group: "Demons", keywords: ["Abyssal", "Demon"], level: 7, organization: "horde", role: "Controller" },
  { name: "Styrich", group: "Demons", keywords: ["Abyssal", "Demon"], level: 8, organization: "horde", role: "Hexer" },
  { name: "Soulraker Handmaiden", group: "Demons", keywords: ["Abyssal", "Demon", "Soulraker"], level: 8, organization: "horde", role: "Ambusher" },
  { name: "Chimeron", group: "Demons", keywords: ["Abyssal", "Demon"], level: 9, organization: "horde", role: "Brute" },
  { name: "Soulraker Hivequeen", group: "Demons", keywords: ["Abyssal", "Demon", "Soulraker"], level: 9, organization: "leader", role: null },
  // ---- Demons, 4th Echelon ----
  { name: "Optacus", group: "Demons", keywords: ["Abyssal", "Demon"], level: 10, organization: "minion", role: "Artillery" },
  { name: "Tyburaki", group: "Demons", keywords: ["Abyssal", "Demon"], level: 10, organization: "minion", role: "Harrier" },
  { name: "Unguloid", group: "Demons", keywords: ["Abyssal", "Demon"], level: 10, organization: "minion", role: "Brute" },
  { name: "Izyak", group: "Demons", keywords: ["Abyssal", "Demon"], level: 10, organization: "horde", role: "Controller" },
  { name: "Vicisitator", group: "Demons", keywords: ["Abyssal", "Demon"], level: 10, organization: "horde", role: "Harrier" },
  { name: "Aurumvas", group: "Demons", keywords: ["Abyssal", "Demon"], level: 10, organization: "leader", role: null },
  // ---- Angulotls ----
  { name: "Angulotl Wave", group: "Angulotls", keywords: ["Angulotl", "Humanoid"], level: 1, organization: "horde", role: "Controller" },
  // ---- Animals (reskin templates) ----
  { name: "Animal", group: "Animals", keywords: ["Animal"], level: 1, organization: "elite", role: "Harrier" },
  { name: "Big Animal", group: "Animals", keywords: ["Animal"], level: 1, organization: "elite", role: "Mount" },
  { name: "Predator", group: "Animals", keywords: ["Animal"], level: 1, organization: "elite", role: "Brute" },
  // ---- Basilisks ----
  { name: "Basilisk", group: "Basilisks", keywords: ["Basilisk", "Beast"], level: 1, organization: "elite", role: "Brute" },
  { name: "Basilisk Tonguesnapper", group: "Basilisks", keywords: ["Basilisk", "Beast"], level: 1, organization: "elite", role: "Hexer" },
  // ---- Bugbears ----
  { name: "Bugbear Channeler", group: "Bugbears", keywords: ["Bugbear", "Fey", "Goblin", "Humanoid"], level: 2, organization: "elite", role: "Controller" },
  { name: "Bugbear Roughneck", group: "Bugbears", keywords: ["Bugbear", "Fey", "Goblin", "Humanoid"], level: 2, organization: "elite", role: "Brute" },
  { name: "Bugbear Sneak", group: "Bugbears", keywords: ["Bugbear", "Fey", "Goblin", "Humanoid"], level: 2, organization: "elite", role: "Ambusher" },
  { name: "Bugbear Snare", group: "Bugbears", keywords: ["Bugbear", "Fey", "Goblin", "Humanoid"], level: 5, organization: "minion", role: "Ambusher" },
  // ---- Devils ----
  { name: "Devil Notary", group: "Devils", keywords: ["Devil", "Infernal"], level: 5, organization: "minion", role: "Hexer" },
  { name: "Devil Legate", group: "Devils", keywords: ["Devil", "Infernal"], level: 5, organization: "elite", role: "Defender" },
  { name: "Devil Adjudicator", group: "Devils", keywords: ["Devil", "Infernal"], level: 6, organization: "elite", role: "Controller" },
  // ---- Draconians ----
  { name: "Aeolyxria the Uncanny", group: "Draconians", keywords: ["Draconian", "Dragon", "Humanoid"], level: 6, organization: "elite", role: "Controller" },
  { name: "Locratix the Morningstar", group: "Draconians", keywords: ["Draconian", "Dragon", "Humanoid"], level: 6, organization: "elite", role: "Harrier" },
  { name: "Myxovidan the Sintaker", group: "Draconians", keywords: ["Draconian", "Dragon", "Humanoid"], level: 6, organization: "elite", role: "Hexer" },
  { name: "Phrrygalax the Subduer", group: "Draconians", keywords: ["Draconian", "Dragon", "Humanoid"], level: 6, organization: "elite", role: "Brute" },
  { name: "Dorzinuuth the Base", group: "Draconians", keywords: ["Draconian", "Dragon", "Humanoid"], level: 6, organization: "leader", role: null },
  // ---- Solo creatures ----
  { name: "Ashen Hoarder", group: "Undead", keywords: ["Construct", "Undead"], level: 4, organization: "solo", role: null },
  { name: "Bredbeddle", group: "Giants", keywords: ["Bredbeddle", "Giant"], level: 3, organization: "solo", role: null },
  { name: "Chimera", group: "Beasts", keywords: ["Beast", "Chimera"], level: 3, organization: "solo", role: null },
];

export const MONSTER_SEED = RAW.map((m) => ({
  name: m.name,
  groupName: m.group,
  keywords: m.keywords,
  level: m.level,
  organization: m.organization,
  role: m.role,
  ev: monsterEv(m.level, m.organization),
  stamina: monsterStamina(m.level, m.organization, m.role),
}));
