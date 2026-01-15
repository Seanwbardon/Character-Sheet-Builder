import { useState, useEffect } from "react";

// --- DATA CONSTANTS ---
const RACES = ["Human", "Elf", "Dwarf", "Halfling", "Orc", "Tiefling", "Gnome", "Dragonborn", "Goliath", "Aasimar", "Warforged", "Genasi"];

// Map Classes to their Hit Die size
const CLASS_DATA = {
  "Artificer": { hit_die: 8, caster_type: "half_up", saves: ["con", "int"] }, 
  "Barbarian": { hit_die: 12, caster_type: "none", saves: ["str", "con"] },
  "Bard": { hit_die: 8, caster_type: "full", saves: ["dex", "cha"] },
  "Cleric": { hit_die: 8, caster_type: "full", saves: ["wis", "cha"] },
  "Druid": { hit_die: 8, caster_type: "full", saves: ["int", "wis"] },
  "Fighter": { hit_die: 10, caster_type: "none", saves: ["str", "con"] },
  "Monk": { hit_die: 8, caster_type: "none", saves: ["str", "dex"] },
  "Paladin": { hit_die: 10, caster_type: "half", saves: ["wis", "cha"] },
  "Psion": { hit_die: 6, caster_type: "psion", saves: ["int", "wis"] }, 
  "Ranger": { hit_die: 10, caster_type: "half", saves: ["str", "dex"] },
  "Rogue": { hit_die: 8, caster_type: "none", saves: ["dex", "int"] },
  "Sorcerer": { hit_die: 6, caster_type: "full", saves: ["con", "cha"] },
  "Warlock": { hit_die: 8, caster_type: "pact", saves: ["wis", "cha"] },
  "Wizard": { hit_die: 6, caster_type: "full", saves: ["int", "wis"] }
};

// --- SUBCLASS OPTIONS (Names Only) ---
const SUBCLASS_OPTIONS = {
  "Artificer": ["Alchemist", "Armorer", "Artillerist", "Battle Smith"],
  "Barbarian": ["Path of the Berserker", "Path of the Totem Warrior"],
  "Bard": ["College of Lore", "College of Valor"],
  "Cleric": ["Knowledge Domain", "Life Domain", "Light Domain", "Nature Domain", "Tempest Domain", "Trickery Domain", "War Domain"],
  "Druid": ["Circle of the Land", "Circle of the Moon"],
  "Fighter": ["Champion", "Battle Master", "Eldritch Knight"],
  "Monk": ["Way of the Open Hand", "Way of Shadow", "Way of the Four Elements"],
  "Paladin": ["Oath of Devotion", "Oath of the Ancients", "Oath of Vengeance"],
  "Psion": ["Metamorph", "Psi Warper", "Psykinetic", "Telepath"],
  "Ranger": ["Hunter", "Beast Master"],
  "Rogue": ["Thief", "Assassin", "Arcane Trickster"],
  "Sorcerer": ["Draconic Bloodline", "Wild Magic"],
  "Warlock": ["The Archfey", "The Fiend", "The Great Old One"],
  "Wizard": ["School of Abjuration", "School of Conjuration", "School of Divination", "School of Enchantment", "School of Evocation", "School of Illusion", "School of Necromancy", "School of Transmutation"]
};

const WEAPON_TABLE = {
  // Simple Melee
  "Club": { damage: "1d4", type: "Bludgeoning", props: "Light" },
  "Dagger": { damage: "1d4", type: "Piercing", props: "Finesse, Light, Thrown" },
  "Greatclub": { damage: "1d8", type: "Bludgeoning", props: "Two-handed" },
  "Handaxe": { damage: "1d6", type: "Slashing", props: "Light, Thrown" },
  "Javelin": { damage: "1d6", type: "Piercing", props: "Thrown" },
  "Light Hammer": { damage: "1d4", type: "Bludgeoning", props: "Light, Thrown" },
  "Mace": { damage: "1d6", type: "Bludgeoning", props: "" },
  "Quarterstaff": { damage: "1d6", type: "Bludgeoning", props: "Versatile (1d8)" },
  "Sickle": { damage: "1d4", type: "Slashing", props: "Light" },
  "Spear": { damage: "1d6", type: "Piercing", props: "Thrown, Versatile (1d8)" },
  
  // Simple Ranged
  "Crossbow, Light": { damage: "1d8", type: "Piercing", props: "Range, Loading, Two-handed" },
  "Dart": { damage: "1d4", type: "Piercing", props: "Finesse, Thrown" },
  "Shortbow": { damage: "1d6", type: "Piercing", props: "Range, Two-handed" },
  "Sling": { damage: "1d4", type: "Bludgeoning", props: "Range" },

  // Martial Melee
  "Battleaxe": { damage: "1d8", type: "Slashing", props: "Versatile (1d10)" },
  "Flail": { damage: "1d8", type: "Bludgeoning", props: "" },
  "Glaive": { damage: "1d10", type: "Slashing", props: "Heavy, Reach, Two-handed" },
  "Greataxe": { damage: "1d12", type: "Slashing", props: "Heavy, Two-handed" },
  "Greatsword": { damage: "2d6", type: "Slashing", props: "Heavy, Two-handed" },
  "Halberd": { damage: "1d10", type: "Slashing", props: "Heavy, Reach, Two-handed" },
  "Lance": { damage: "1d12", type: "Piercing", props: "Reach, Special" },
  "Longsword": { damage: "1d8", type: "Slashing", props: "Versatile (1d10)" },
  "Maul": { damage: "2d6", type: "Bludgeoning", props: "Heavy, Two-handed" },
  "Morningstar": { damage: "1d8", type: "Piercing", props: "" },
  "Pike": { damage: "1d10", type: "Piercing", props: "Heavy, Reach, Two-handed" },
  "Rapier": { damage: "1d8", type: "Piercing", props: "Finesse" },
  "Scimitar": { damage: "1d6", type: "Slashing", props: "Finesse, Light" },
  "Shortsword": { damage: "1d6", type: "Piercing", props: "Finesse, Light" },
  "Trident": { damage: "1d6", type: "Piercing", props: "Thrown, Versatile (1d8)" },
  "War Pick": { damage: "1d8", type: "Piercing", props: "" },
  "Warhammer": { damage: "1d8", type: "Bludgeoning", props: "Versatile (1d10)" },
  "Whip": { damage: "1d4", type: "Slashing", props: "Finesse, Reach" },

  // Martial Ranged
  "Blowgun": { damage: "1", type: "Piercing", props: "Range, Loading" },
  "Crossbow, Hand": { damage: "1d6", type: "Piercing", props: "Range, Light, Loading" },
  "Crossbow, Heavy": { damage: "1d10", type: "Piercing", props: "Range, Heavy, Loading, Two-handed" },
  "Longbow": { damage: "1d8", type: "Piercing", props: "Range, Heavy, Two-handed" },
  "Net": { damage: "-", type: "Special", props: "Thrown, Special" }
};

const WEAPON_PROPERTIES = [
  "Finesse", "Heavy", "Light", "Loading", "Range", "Reach", "Special", "Thrown", "Two-handed", "Versatile"
];

const DAMAGE_TYPES = [
  "Bludgeoning", "Piercing", "Slashing",
  "Acid", "Cold", "Fire", "Force", "Lightning", "Necrotic", "Poison", "Psychic", "Radiant", "Thunder"
];

const ARMOR_TABLE = {
  "None": { base: 10, type: "none" },
  "Padded": { base: 11, type: "light", stealth_dis: true },
  "Leather": { base: 11, type: "light" },
  "Studded Leather": { base: 12, type: "light" },
  "Hide": { base: 12, type: "medium" },
  "Chain Shirt": { base: 13, type: "medium" },
  "Scale Mail": { base: 14, type: "medium", stealth_dis: true },
  "Breastplate": { base: 14, type: "medium" },
  "Half Plate": { base: 15, type: "medium", stealth_dis: true },
  "Ring Mail": { base: 14, type: "heavy", stealth_dis: true },
  "Chain Mail": { base: 16, type: "heavy", stealth_dis: true, str_req: 13 },
  "Splint": { base: 17, type: "heavy", stealth_dis: true, str_req: 15 },
  "Plate": { base: 18, type: "heavy", stealth_dis: true, str_req: 15 }
};


// --- INVENTORY DATA ---
const PACKS_LIST = ["Burglar's Pack", "Diplomat's Pack", "Dungeoneer's Pack", "Entertainer's Pack", "Explorer's Pack", "Priest's Pack", "Scholar's Pack"];

const SIMPLE_WEAPONS = [
  "Club", "Dagger", "Greatclub", "Handaxe", "Javelin", "Light Hammer", "Mace", "Quarterstaff", "Sickle", "Spear", 
  "Crossbow, Light", "Dart", "Shortbow", "Sling"
];

const MARTIAL_WEAPONS = [
  "Battleaxe", "Flail", "Glaive", "Greataxe", "Greatsword", "Halberd", "Lance", "Longsword", "Maul", "Morningstar", "Pike", "Rapier", "Scimitar", "Shortsword", "Trident", "War Pick", "Warhammer", "Whip", 
  "Blowgun", "Crossbow, Hand", "Crossbow, Heavy", "Longbow", "Net"
];

// --- BACKGROUNDS (Origins - Ability Scores & Skills) ---
const BACKGROUNDS = {
  "Acolyte": { stats: ["wis", "int"], skills: ["Insight", "Religion"] },
  "Charlatan": { stats: ["cha", "dex"], skills: ["Deception", "Sleight of Hand"] },
  "Criminal": { stats: ["dex", "int"], skills: ["Stealth", "Thieves' Tools"] },
  "Entertainer": { stats: ["cha", "dex"], skills: ["Acrobatics", "Performance"] },
  "Folk Hero": { stats: ["wis", "str"], skills: ["Animal Handling", "Survival"] },
  "Guild Artisan": { stats: ["int", "cha"], skills: ["Insight", "Persuasion"] },
  "Hermit": { stats: ["wis", "int"], skills: ["Medicine", "Religion"] },
  "Noble": { stats: ["cha", "int"], skills: ["History", "Persuasion"] },
  "Outlander": { stats: ["str", "wis"], skills: ["Athletics", "Survival"] },
  "Sage": { stats: ["int", "wis"], skills: ["Arcana", "History"] },
  "Sailor": { stats: ["dex", "wis"], skills: ["Athletics", "Perception"] },
  "Soldier": { stats: ["str", "con"], skills: ["Athletics", "Intimidation"] },
  "Urchin": { stats: ["dex", "wis"], skills: ["Sleight of Hand", "Stealth"] }
};

// SPELL SLOT TABLES (Corrected: Index 0 = Level 1)
const SLOT_TABLE = {
  full: [
    [2,0,0,0,0,0,0,0,0], // Lvl 1
    [3,0,0,0,0,0,0,0,0], // Lvl 2
    [4,2,0,0,0,0,0,0,0], // Lvl 3
    [4,3,0,0,0,0,0,0,0], // Lvl 4
    [4,3,2,0,0,0,0,0,0], // Lvl 5
    [4,3,3,0,0,0,0,0,0], // Lvl 6
    [4,3,3,1,0,0,0,0,0], // Lvl 7
    [4,3,3,2,0,0,0,0,0], // Lvl 8
    [4,3,3,3,1,0,0,0,0], // Lvl 9
    [4,3,3,3,2,0,0,0,0], // Lvl 10
    [4,3,3,3,2,1,0,0,0], // Lvl 11
    [4,3,3,3,2,1,0,0,0], // Lvl 12
    [4,3,3,3,2,1,1,0,0], // Lvl 13
    [4,3,3,3,2,1,1,0,0], // Lvl 14
    [4,3,3,3,2,1,1,1,0], // Lvl 15
    [4,3,3,3,2,1,1,1,0], // Lvl 16
    [4,3,3,3,2,1,1,1,1], // Lvl 17
    [4,3,3,3,3,1,1,1,1], // Lvl 18
    [4,3,3,3,3,2,1,1,1], // Lvl 19
    [4,3,3,3,3,2,2,1,1]  // Lvl 20
  ],
  half: [ // Paladin, Ranger (Start at lvl 2)
    [0,0,0,0,0,0,0,0,0], // Lvl 1
    [2,0,0,0,0,0,0,0,0], // Lvl 2
    [3,0,0,0,0,0,0,0,0], // Lvl 3
    [3,0,0,0,0,0,0,0,0], 
    [4,2,0,0,0,0,0,0,0], // Lvl 5
    [4,2,0,0,0,0,0,0,0], 
    [4,3,0,0,0,0,0,0,0], 
    [4,3,0,0,0,0,0,0,0], 
    [4,3,2,0,0,0,0,0,0],
    [4,3,2,0,0,0,0,0,0], // Lvl 10
    [4,3,3,0,0,0,0,0,0], 
    [4,3,3,0,0,0,0,0,0], 
    [4,3,3,1,0,0,0,0,0], 
    [4,3,3,1,0,0,0,0,0], 
    [4,3,3,2,0,0,0,0,0], // Lvl 15
    [4,3,3,2,0,0,0,0,0], 
    [4,3,3,3,1,0,0,0,0], 
    [4,3,3,3,1,0,0,0,0], 
    [4,3,3,3,2,0,0,0,0], // Lvl 19
    [4,3,3,3,2,0,0,0,0]  // Lvl 20
  ],
  half_up: [ // Artificer (Starts at lvl 1)
    [2,0,0,0,0,0,0,0,0], // Lvl 1
    [2,0,0,0,0,0,0,0,0], 
    [3,0,0,0,0,0,0,0,0], 
    [3,0,0,0,0,0,0,0,0], 
    [4,2,0,0,0,0,0,0,0], // Lvl 5
    [4,2,0,0,0,0,0,0,0], 
    [4,3,0,0,0,0,0,0,0], 
    [4,3,0,0,0,0,0,0,0], 
    [4,3,2,0,0,0,0,0,0], 
    [4,3,2,0,0,0,0,0,0], // Lvl 10
    [4,3,3,0,0,0,0,0,0], 
    [4,3,3,0,0,0,0,0,0], 
    [4,3,3,1,0,0,0,0,0], 
    [4,3,3,1,0,0,0,0,0], 
    [4,3,3,2,0,0,0,0,0], // Lvl 15
    [4,3,3,2,0,0,0,0,0], 
    [4,3,3,3,1,0,0,0,0], 
    [4,3,3,3,1,0,0,0,0], 
    [4,3,3,3,2,0,0,0,0], 
    [4,3,3,3,2,0,0,0,0]  // Lvl 20
  ],
  third: [ // Eldritch Knight, Arcane Trickster
    [0,0,0,0,0,0,0,0,0], // Lvl 1
    [0,0,0,0,0,0,0,0,0], 
    [2,0,0,0,0,0,0,0,0], // Lvl 3 (Start)
    [3,0,0,0,0,0,0,0,0], 
    [3,0,0,0,0,0,0,0,0], 
    [3,0,0,0,0,0,0,0,0], 
    [4,2,0,0,0,0,0,0,0], // Lvl 7
    [4,2,0,0,0,0,0,0,0], 
    [4,2,0,0,0,0,0,0,0], 
    [4,3,0,0,0,0,0,0,0], // Lvl 10
    [4,3,0,0,0,0,0,0,0], 
    [4,3,0,0,0,0,0,0,0], 
    [4,3,2,0,0,0,0,0,0], // Lvl 13
    [4,3,2,0,0,0,0,0,0], 
    [4,3,2,0,0,0,0,0,0], 
    [4,3,3,0,0,0,0,0,0], // Lvl 16
    [4,3,3,0,0,0,0,0,0], 
    [4,3,3,0,0,0,0,0,0], 
    [4,3,3,1,0,0,0,0,0], // Lvl 19
    [4,3,3,1,0,0,0,0,0] 
  ],
  pact: [ // Warlock
    [1,0,0,0,0], // Lvl 1
    [2,0,0,0,0], 
    [0,2,0,0,0], 
    [0,2,0,0,0], 
    [0,0,2,0,0], // Lvl 5
    [0,0,2,0,0], 
    [0,0,0,2,0], 
    [0,0,0,2,0], 
    [0,0,0,0,2], 
    [0,0,0,0,2], // Lvl 10
    [0,0,0,0,3], 
    [0,0,0,0,3], 
    [0,0,0,0,3], 
    [0,0,0,0,3], 
    [0,0,0,0,3], // Lvl 15
    [0,0,0,0,3], 
    [0,0,0,0,4], 
    [0,0,0,0,4], 
    [0,0,0,0,4], 
    [0,0,0,0,4]  // Lvl 20
  ]
};

const SPELL_ABILITY = {
  "Artificer": "int", "Bard": "cha", "Cleric": "wis", "Druid": "wis", "Paladin": "cha",
  "Psion": "int", "Ranger": "wis", "Sorcerer": "cha", "Warlock": "cha", "Wizard": "int"
};

const SUBCLASS_SPELL_DATA = {
  "Eldritch Knight": { type: "third", ability: "int", list: "Wizard" },
  "Arcane Trickster": { type: "third", ability: "int", list: "Wizard" }
};

// MASTER SPELL DATABASE (SRD Levels 0-9)
const SPELL_LISTS = {
  "Artificer": {
    0: ["Acid Splash", "Create Bonfire", "Dancing Lights", "Fire Bolt", "Frostbite", "Guidance", "Light", "Mage Hand", "Mending", "Message", "Poison Spray", "Prestidigitation", "Ray of Frost", "Resistance", "Shocking Grasp", "Spare the Dying", "Thorn Whip", "Thunderclap"],
    1: ["Absorb Elements", "Alarm", "Catapult", "Cure Wounds", "Detect Magic", "Disguise Self", "Expeditious Retreat", "Faerie Fire", "False Life", "Feather Fall", "Grease", "Identify", "Jump", "Longstrider", "Purify Food and Drink", "Sanctuary", "Snare", "Tasha's Caustic Brew"],
    2: ["Aid", "Alter Self", "Arcane Lock", "Blur", "Continual Flame", "Darkvision", "Enhance Ability", "Enlarge/Reduce", "Heat Metal", "Invisibility", "Lesser Restoration", "Levitate", "Magic Mouth", "Magic Weapon", "Protection from Poison", "Pyrotechnics", "Rope Trick", "See Invisibility", "Skywrite", "Spider Climb", "Web"],
    3: ["Blink", "Catnap", "Create Food and Water", "Dispel Magic", "Elemental Weapon", "Flame Arrows", "Fly", "Glyph of Warding", "Haste", "Intellect Fortress", "Protection from Energy", "Revivify", "Tiny Servant", "Water Breathing", "Water Walk"],
    4: ["Arcane Eye", "Elemental Bane", "Fabricate", "Freedom of Movement", "Leomund's Secret Chest", "Mordenkainen's Faithful Hound", "Mordenkainen's Private Sanctum", "Otiluke's Resilient Sphere", "Stone Shape", "Stoneskin", "Summon Construct"],
    5: ["Animate Objects", "Bigby's Hand", "Creation", "Greater Restoration", "Skill Empowerment", "Transmute Rock", "Wall of Stone"]
  },
  "Bard": {
    0: ["Blade Ward", "Dancing Lights", "Friends", "Light", "Mage Hand", "Mending", "Message", "Minor Illusion", "Prestidigitation", "Thunderclap", "True Strike", "Vicious Mockery"],
    1: ["Animal Friendship", "Bane", "Charm Person", "Comprehend Languages", "Cure Wounds", "Detect Magic", "Disguise Self", "Dissonant Whispers", "Faerie Fire", "Feather Fall", "Healing Word", "Heroism", "Identify", "Illusory Script", "Longstrider", "Silent Image", "Sleep", "Speak with Animals", "Tasha's Hideous Laughter", "Thunderwave", "Unseen Servant"],
    2: ["Aid", "Animal Messenger", "Blindness/Deafness", "Calm Emotions", "Cloud of Daggers", "Crown of Madness", "Detect Thoughts", "Enhance Ability", "Enthrall", "Heat Metal", "Hold Person", "Invisibility", "Knock", "Lesser Restoration", "Locate Animals or Plants", "Locate Object", "Magic Mouth", "Phantasmal Force", "See Invisibility", "Shatter", "Silence", "Suggestion", "Zone of Truth"],
    3: ["Bestow Curse", "Catnap", "Clairvoyance", "Dispel Magic", "Enemies Abound", "Fear", "Feign Death", "Glyph of Warding", "Hypnotic Pattern", "Leomund's Tiny Hut", "Major Image", "Nondetection", "Plant Growth", "Sending", "Speak with Dead", "Speak with Plants", "Stinking Cloud", "Tongues"],
    4: ["Charm Monster", "Compulsion", "Confusion", "Dimension Door", "Freedom of Movement", "Greater Invisibility", "Hallucinatory Terrain", "Locate Creature", "Phantasmal Killer", "Polymorph"],
    5: ["Animate Objects", "Awaken", "Dominate Person", "Dream", "Geas", "Greater Restoration", "Hold Monster", "Legend Lore", "Mass Cure Wounds", "Mislead", "Modify Memory", "Planar Binding", "Raise Dead", "Scrying", "Seeming", "Skill Empowerment", "Synaptic Static", "Teleportation Circle"],
    6: ["Eyebite", "Find the Path", "Guards and Wards", "Mass Suggestion", "Otto's Irresistible Dance", "Programmed Illusion", "True Seeing"],
    7: ["Etherealness", "Forcecage", "Mirage Arcane", "Mordenkainen's Magnificent Mansion", "Mordenkainen's Sword", "Project Image", "Regenerate", "Resurrection", "Symbol", "Teleport"],
    8: ["Dominate Monster", "Feeblemind", "Glibness", "Mind Blank", "Power Word Stun"],
    9: ["Foresight", "Mass Polymorph", "Power Word Heal", "Power Word Kill", "Prismatic Wall", "Psychic Scream", "True Polymorph"]
  },
  "Cleric": {
    0: ["Guidance", "Light", "Mending", "Resistance", "Sacred Flame", "Spare the Dying", "Thaumaturgy", "Toll the Dead", "Word of Radiance"],
    1: ["Bane", "Bless", "Command", "Create or Destroy Water", "Cure Wounds", "Detect Evil and Good", "Detect Magic", "Detect Poison and Disease", "Guiding Bolt", "Healing Word", "Inflict Wounds", "Protection from Evil and Good", "Purify Food and Drink", "Sanctuary", "Shield of Faith"],
    2: ["Aid", "Augury", "Blindness/Deafness", "Calm Emotions", "Continual Flame", "Enhance Ability", "Find Traps", "Gentle Repose", "Hold Person", "Lesser Restoration", "Locate Object", "Prayer of Healing", "Protection from Poison", "Silence", "Spiritual Weapon", "Warding Bond", "Zone of Truth"],
    3: ["Animate Dead", "Beacon of Hope", "Bestow Curse", "Clairvoyance", "Create Food and Water", "Daylight", "Dispel Magic", "Feign Death", "Glyph of Warding", "Magic Circle", "Mass Healing Word", "Meld into Stone", "Protection from Energy", "Remove Curse", "Revivify", "Sending", "Speak with Dead", "Spirit Guardians", "Tongues", "Water Walk"],
    4: ["Banishment", "Control Water", "Death Ward", "Divination", "Freedom of Movement", "Guardian of Faith", "Locate Creature", "Stone Shape"],
    5: ["Commune", "Contagion", "Dispel Evil and Good", "Flame Strike", "Geas", "Greater Restoration", "Hallow", "Insect Plague", "Legend Lore", "Mass Cure Wounds", "Planar Binding", "Raise Dead", "Scrying"],
    6: ["Blade Barrier", "Create Undead", "Find the Path", "Forbiddance", "Harm", "Heal", "Heroes' Feast", "Planar Ally", "True Seeing", "Word of Recall"],
    7: ["Conjure Celestial", "Divine Word", "Etherealness", "Fire Storm", "Plane Shift", "Regenerate", "Resurrection", "Symbol"],
    8: ["Antimagic Field", "Control Weather", "Earthquake", "Holy Aura"],
    9: ["Astral Projection", "Gate", "Mass Heal", "True Resurrection"]
  },
  "Druid": {
    0: ["Control Flames", "Create Bonfire", "Druidcraft", "Frostbite", "Guidance", "Gust", "Infestation", "Magic Stone", "Mending", "Mold Earth", "Poison Spray", "Primal Savagery", "Produce Flame", "Resistance", "Shape Water", "Shillelagh", "Thorn Whip", "Thunderclap"],
    1: ["Absorb Elements", "Animal Friendship", "Beast Bond", "Charm Person", "Create or Destroy Water", "Cure Wounds", "Detect Magic", "Detect Poison and Disease", "Earth Tremor", "Entangle", "Faerie Fire", "Fog Cloud", "Goodberry", "Healing Word", "Ice Knife", "Jump", "Longstrider", "Purify Food and Drink", "Snare", "Speak with Animals", "Thunderwave"],
    2: ["Animal Messenger", "Barkskin", "Beast Sense", "Darkvision", "Dust Devil", "Earthbind", "Enhance Ability", "Find Traps", "Flame Blade", "Flaming Sphere", "Gust of Wind", "Heat Metal", "Hold Person", "Lesser Restoration", "Locate Animals or Plants", "Locate Object", "Moonbeam", "Pass without Trace", "Protection from Poison", "Spike Growth", "Warding Wind"],
    3: ["Call Lightning", "Conjure Animals", "Daylight", "Dispel Magic", "Erupting Earth", "Feign Death", "Flame Arrows", "Meld into Stone", "Plant Growth", "Protection from Energy", "Sleet Storm", "Speak with Plants", "Tidal Wave", "Wall of Water", "Water Breathing", "Water Walk", "Wind Wall"],
    4: ["Blight", "Charm Monster", "Confusion", "Conjure Minor Elementals", "Conjure Woodland Beings", "Control Water", "Dominate Beast", "Elemental Bane", "Freedom of Movement", "Giant Insect", "Grasping Vine", "Guardian of Nature", "Hallucinatory Terrain", "Ice Storm", "Locate Creature", "Polymorph", "Stone Shape", "Stoneskin", "Wall of Fire", "Watery Sphere"],
    5: ["Antilife Shell", "Awaken", "Commune with Nature", "Conjure Elemental", "Contagion", "Control Winds", "Geas", "Greater Restoration", "Insect Plague", "Maelstrom", "Mass Cure Wounds", "Planar Binding", "Reincarnate", "Scrying", "Transmute Rock", "Tree Stride", "Wall of Stone", "Wrath of Nature"],
    6: ["Bones of the Earth", "Conjure Fey", "Druid Grove", "Find the Path", "Heal", "Heroes' Feast", "Investiture of Flame", "Investiture of Ice", "Investiture of Stone", "Investiture of Wind", "Move Earth", "Primordial Ward", "Sunbeam", "Transport via Plants", "Wall of Thorns", "Wind Walk"],
    7: ["Fire Storm", "Mirage Arcane", "Plane Shift", "Regenerate", "Reverse Gravity", "Whirlwind"],
    8: ["Animal Shapes", "Antipathy/Sympathy", "Control Weather", "Earthquake", "Feeblemind", "Sunburst", "Tsunami"],
    9: ["Foresight", "Shapechange", "Storm of Vengeance", "True Resurrection"]
  },
  "Paladin": {
    0: [], 
    1: ["Bless", "Ceremony", "Command", "Compelled Duel", "Cure Wounds", "Detect Evil and Good", "Detect Magic", "Detect Poison and Disease", "Divine Favor", "Heroism", "Protection from Evil and Good", "Purify Food and Drink", "Searing Smite", "Shield of Faith", "Thunderous Smite", "Wrathful Smite"],
    2: ["Aid", "Branding Smite", "Find Steed", "Lesser Restoration", "Locate Object", "Magic Weapon", "Protection from Poison", "Zone of Truth"],
    3: ["Aura of Vitality", "Blinding Smite", "Create Food and Water", "Crusader's Mantle", "Daylight", "Dispel Magic", "Elemental Weapon", "Magic Circle", "Remove Curse", "Revivify", "Spirit Shroud"],
    4: ["Aura of Life", "Aura of Purity", "Banishment", "Death Ward", "Find Greater Steed", "Locate Creature", "Staggering Smite"],
    5: ["Banishing Smite", "Circle of Power", "Destructive Wave", "Dispel Evil and Good", "Geas", "Holy Weapon", "Raise Dead"]
  },
  "Psion": { // Updated based on standard Psionic themes and UA
    0: ["Energy Beam", "Mind Sliver", "Mage Hand (Psionic)", "Message", "Friends", "Minor Illusion", "Vicious Mockery"],
    1: ["Id Insinuation", "Mental Barrier", "Catapult", "Charm Person", "Command", "Detect Thoughts", "Dissonant Whispers", "Silent Image", "Sleep", "Tasha's Hideous Laughter"],
    2: ["Blindness/Deafness", "Calm Emotions", "Crown of Madness", "Detect Thoughts", "Hold Person", "Levitate", "Mind Spike", "Phantasmal Force", "Suggestion"],
    3: ["Catnap", "Clairvoyance", "Enemies Abound", "Fear", "Fly", "Hypnotic Pattern", "Intellect Fortress", "Major Image", "Sending", "Tongues"],
    4: ["Arcane Eye", "Charm Monster", "Compulsion", "Confusion", "Dimension Door", "Dominate Beast", "Locate Creature", "Phantasmal Killer", "Resilient Sphere"],
    5: ["Animate Objects", "Bigby's Hand", "Dominate Person", "Geas", "Hold Monster", "Modify Memory", "Rary's Telepathic Bond", "Synaptic Static", "Telekinesis", "Wall of Force"],
    6: ["Mass Suggestion", "Mental Prison", "Otto's Irresistible Dance", "True Seeing"],
    7: ["Etherealness", "Forcecage", "Power Word Pain", "Project Image", "Reverse Gravity", "Teleport"],
    8: ["Dominate Monster", "Feeblemind", "Mind Blank", "Power Word Stun", "Telepathy"],
    9: ["Astral Projection", "Foresight", "Gate", "Psychic Scream", "Time Stop", "Weird"]
  },
  "Ranger": {
    0: [], 
    1: ["Absorb Elements", "Alarm", "Animal Friendship", "Beast Bond", "Cure Wounds", "Detect Magic", "Detect Poison and Disease", "Ensnaring Strike", "Entangle", "Fog Cloud", "Goodberry", "Hail of Thorns", "Hunter's Mark", "Jump", "Longstrider", "Snare", "Speak with Animals", "Zephyr Strike"],
    2: ["Animal Messenger", "Barkskin", "Beast Sense", "Cordon of Arrows", "Darkvision", "Find Traps", "Lesser Restoration", "Locate Animals or Plants", "Locate Object", "Pass without Trace", "Protection from Poison", "Silence", "Spike Growth"],
    3: ["Conjure Animals", "Conjure Barrage", "Daylight", "Flame Arrows", "Lightning Arrow", "Nondetection", "Plant Growth", "Protection from Energy", "Speak with Plants", "Water Breathing", "Water Walk", "Wind Wall"],
    4: ["Conjure Woodland Beings", "Freedom of Movement", "Grasping Vine", "Guardian of Nature", "Locate Creature", "Stoneskin"],
    5: ["Commune with Nature", "Conjure Volley", "Greater Restoration", "Steel Wind Strike", "Swift Quiver", "Tree Stride", "Wrath of Nature"]
  },
  "Sorcerer": {
    0: ["Acid Splash", "Blade Ward", "Booming Blade", "Chill Touch", "Control Flames", "Create Bonfire", "Dancing Lights", "Fire Bolt", "Friends", "Frostbite", "Green-Flame Blade", "Gust", "Infestation", "Light", "Lightning Lure", "Mage Hand", "Mending", "Message", "Mind Sliver", "Minor Illusion", "Mold Earth", "Poison Spray", "Prestidigitation", "Ray of Frost", "Shape Water", "Shocking Grasp", "Sword Burst", "Thunderclap", "True Strike"],
    1: ["Absorb Elements", "Burning Hands", "Catapult", "Chaos Bolt", "Charm Person", "Chromatic Orb", "Color Spray", "Comprehend Languages", "Detect Magic", "Disguise Self", "Earth Tremor", "Expeditious Retreat", "False Life", "Feather Fall", "Fog Cloud", "Grease", "Ice Knife", "Jump", "Mage Armor", "Magic Missile", "Ray of Sickness", "Shield", "Silent Image", "Sleep", "Tasha's Caustic Brew", "Thunderwave", "Witch Bolt"],
    2: ["Aganazzar's Scorcher", "Alter Self", "Blindness/Deafness", "Blur", "Cloud of Daggers", "Crown of Madness", "Darkness", "Darkvision", "Detect Thoughts", "Dragon's Breath", "Dust Devil", "Earthbind", "Enhance Ability", "Enlarge/Reduce", "Flame Blade", "Flaming Sphere", "Gust of Wind", "Hold Person", "Invisibility", "Knock", "Levitate", "Maximilian's Earthen Grasp", "Mind Spike", "Mirror Image", "Misty Step", "Phantasmal Force", "Pyrotechnics", "Scorching Ray", "See Invisibility", "Shadow Blade", "Shatter", "Snilloc's Snowball Swarm", "Spider Climb", "Suggestion", "Tasha's Mind Whip", "Web", "Wither and Bloom"],
    3: ["Blink", "Catnap", "Clairvoyance", "Counterspell", "Daylight", "Dispel Magic", "Enemies Abound", "Erupting Earth", "Fear", "Fireball", "Flame Arrows", "Fly", "Gaseous Form", "Haste", "Hypnotic Pattern", "Inciting Greed", "Intellect Fortress", "Lightning Bolt", "Major Image", "Melf's Minute Meteors", "Protection from Energy", "Sleet Storm", "Slow", "Stinking Cloud", "Thunder Step", "Tongues", "Vampiric Touch", "Wall of Water", "Water Breathing", "Water Walk"],
    4: ["Banishment", "Blight", "Charm Monster", "Confusion", "Dimension Door", "Dominate Beast", "Fire Shield", "Greater Invisibility", "Ice Storm", "Polymorph", "Raulothim's Psychic Lance", "Sickening Radiance", "Stoneskin", "Storm Sphere", "Vitriolic Sphere", "Wall of Fire", "Watery Sphere"],
    5: ["Animate Objects", "Bigby's Hand", "Cloudkill", "Cone of Cold", "Control Winds", "Creation", "Dominate Person", "Enervation", "Far Step", "Hold Monster", "Immolation", "Insect Plague", "Seeming", "Skill Empowerment", "Synaptic Static", "Telekinesis", "Teleportation Circle", "Wall of Light", "Wall of Stone"],
    6: ["Arcane Gate", "Chain Lightning", "Circle of Death", "Disintegrate", "Eyebite", "Flesh to Stone", "Globe of Invulnerability", "Investiture of Flame", "Investiture of Ice", "Investiture of Stone", "Investiture of Wind", "Mass Suggestion", "Mental Prison", "Move Earth", "Otiluke's Freezing Sphere", "Scatter", "Sunbeam", "True Seeing"],
    7: ["Crown of Stars", "Delayed Blast Fireball", "Draconic Transformation", "Etherealness", "Finger of Death", "Fire Storm", "Plane Shift", "Power Word Pain", "Prismatic Spray", "Reverse Gravity", "Teleport"],
    8: ["Abi-Dalzim's Horrid Wilting", "Demiplane", "Dominate Monster", "Earthquake", "Incendiary Cloud", "Power Word Stun", "Sunburst"],
    9: ["Blade of Disaster", "Gate", "Mass Polymorph", "Meteor Swarm", "Power Word Kill", "Psychic Scream", "Time Stop", "Wish"]
  },
  "Warlock": {
    0: ["Blade Ward", "Booming Blade", "Chill Touch", "Create Bonfire", "Eldritch Blast", "Friends", "Frostbite", "Green-Flame Blade", "Infestation", "Lightning Lure", "Mage Hand", "Magic Stone", "Mind Sliver", "Minor Illusion", "Poison Spray", "Prestidigitation", "Sword Burst", "Thunderclap", "Toll the Dead", "True Strike"],
    1: ["Armor of Agathys", "Arms of Hadar", "Cause Fear", "Charm Person", "Comprehend Languages", "Distort Value", "Expeditious Retreat", "Hellish Rebuke", "Hex", "Illusory Script", "Protection from Evil and Good", "Unseen Servant", "Witch Bolt"],
    2: ["Cloud of Daggers", "Crown of Madness", "Darkness", "Earthbind", "Enthrall", "Hold Person", "Invisibility", "Mind Spike", "Mirror Image", "Misty Step", "Ray of Enfeeblement", "Shadow Blade", "Shatter", "Spider Climb", "Suggestion"],
    3: ["Counterspell", "Dispel Magic", "Enemies Abound", "Fear", "Fly", "Gaseous Form", "Hunger of Hadar", "Hypnotic Pattern", "Intellect Fortress", "Magic Circle", "Major Image", "Remove Curse", "Spirit Shroud", "Summon Fey", "Summon Lesser Demons", "Summon Shadowspawn", "Summon Undead", "Thunder Step", "Tongues", "Vampiric Touch"],
    4: ["Banishment", "Blight", "Charm Monster", "Dimension Door", "Elemental Bane", "Galder's Speedy Courier", "Hallucinatory Terrain", "Raulothim's Psychic Lance", "Shadow of Moil", "Sickening Radiance", "Summon Aberration", "Summon Greater Demon"],
    5: ["Contact Other Plane", "Danse Macabre", "Dream", "Enervation", "Far Step", "Hold Monster", "Infernal Calling", "Mislead", "Negative Energy Flood", "Planar Binding", "Scrying", "Synaptic Static", "Teleportation Circle", "Wall of Light"],
    6: ["Arcane Gate", "Circle of Death", "Conjure Fey", "Create Undead", "Eyebite", "Flesh to Stone", "Investiture of Flame", "Investiture of Ice", "Investiture of Stone", "Investiture of Wind", "Mass Suggestion", "Mental Prison", "Scatter", "Soul Cage", "Tasha's Otherworldly Guise", "True Seeing"],
    7: ["Crown of Stars", "Dream of the Blue Veil", "Etherealness", "Finger of Death", "Forcecage", "Plane Shift", "Power Word Pain"],
    8: ["Demiplane", "Dominate Monster", "Feeblemind", "Glibness", "Maddening Darkness", "Power Word Stun"],
    9: ["Astral Projection", "Blade of Disaster", "Foresight", "Gate", "Imprisonment", "Power Word Kill", "Psychic Scream", "Shapechange", "True Polymorph", "Weird"]
  },
  "Wizard": {
    0: ["Acid Splash", "Blade Ward", "Booming Blade", "Chill Touch", "Control Flames", "Create Bonfire", "Dancing Lights", "Encode Thoughts", "Fire Bolt", "Friends", "Frostbite", "Green-Flame Blade", "Gust", "Infestation", "Light", "Lightning Lure", "Mage Hand", "Mending", "Message", "Mind Sliver", "Minor Illusion", "Mold Earth", "Poison Spray", "Prestidigitation", "Ray of Frost", "Sapping Sting", "Shape Water", "Shocking Grasp", "Sword Burst", "Thunderclap", "Toll the Dead", "True Strike"],
    1: ["Absorb Elements", "Alarm", "Burning Hands", "Catapult", "Cause Fear", "Charm Person", "Chromatic Orb", "Color Spray", "Comprehend Languages", "Detect Magic", "Disguise Self", "Distort Value", "Earth Tremor", "Expeditious Retreat", "False Life", "Feather Fall", "Find Familiar", "Fog Cloud", "Frost Fingers", "Grease", "Ice Knife", "Identify", "Illusory Script", "Jim's Magic Missile", "Jump", "Longstrider", "Mage Armor", "Magic Missile", "Protection from Evil and Good", "Ray of Sickness", "Shield", "Silent Image", "Sleep", "Snare", "Tasha's Caustic Brew", "Tasha's Hideous Laughter", "Tenser's Floating Disk", "Thunderwave", "Unseen Servant", "Witch Bolt"],
    2: ["Acid Arrow", "Air Bubble", "Alter Self", "Arcane Lock", "Augury", "Blindness/Deafness", "Blur", "Cloud of Daggers", "Continual Flame", "Crown of Madness", "Darkness", "Darkvision", "Detect Thoughts", "Dragon's Breath", "Dust Devil", "Earthbind", "Enhance Ability", "Enlarge/Reduce", "Flaming Sphere", "Gentle Repose", "Gust of Wind", "Hold Person", "Invisibility", "Kinetic Jaunt", "Knock", "Levitate", "Locate Object", "Magic Mouth", "Magic Weapon", "Maximilian's Earthen Grasp", "Melf's Acid Arrow", "Mind Spike", "Mirror Image", "Misty Step", "Nystul's Magic Aura", "Phantasmal Force", "Pyrotechnics", "Ray of Enfeeblement", "Rope Trick", "Scorching Ray", "See Invisibility", "Shadow Blade", "Shatter", "Skywrite", "Snilloc's Snowball Swarm", "Spider Climb", "Suggestion", "Tasha's Mind Whip", "Vortex Warp", "Web", "Wither and Bloom"],
    3: ["Animate Dead", "Ashardalon's Stride", "Bestow Curse", "Blink", "Catnap", "Clairvoyance", "Counterspell", "Dispel Magic", "Enemies Abound", "Erupting Earth", "Fast Friends", "Fear", "Feign Death", "Fireball", "Flame Arrows", "Fly", "Galder's Tower", "Gaseous Form", "Glyph of Warding", "Haste", "Hypnotic Pattern", "Inciting Greed", "Intellect Fortress", "Leomund's Tiny Hut", "Life Transference", "Lightning Bolt", "Magic Circle", "Major Image", "Melf's Minute Meteors", "Nondetection", "Phantom Steed", "Protection from Energy", "Remove Curse", "Sending", "Sleet Storm", "Slow", "Speak with Dead", "Spirit Shroud", "Stinking Cloud", "Summon Fey", "Summon Lesser Demons", "Summon Shadowspawn", "Summon Undead", "Thunder Step", "Tiny Servant", "Tongues", "Vampiric Touch", "Wall of Sand", "Wall of Water", "Water Breathing"],
    4: ["Arcane Eye", "Banishment", "Blight", "Charm Monster", "Confusion", "Conjure Minor Elementals", "Control Water", "Dimension Door", "Divination", "Elemental Bane", "Evard's Black Tentacles", "Fabricate", "Fire Shield", "Galder's Speedy Courier", "Greater Invisibility", "Hallucinatory Terrain", "Ice Storm", "Leomund's Secret Chest", "Locate Creature", "Mordenkainen's Faithful Hound", "Mordenkainen's Private Sanctum", "Otiluke's Resilient Sphere", "Phantasmal Killer", "Polymorph", "Raulothim's Psychic Lance", "Sickening Radiance", "Stone Shape", "Stoneskin", "Storm Sphere", "Summon Aberration", "Summon Construct", "Summon Elemental", "Summon Greater Demon", "Vitriolic Sphere", "Wall of Fire", "Watery Sphere"],
    5: ["Animate Objects", "Bigby's Hand", "Cloudkill", "Cone of Cold", "Conjure Elemental", "Contact Other Plane", "Control Winds", "Creation", "Danse Macabre", "Dawn", "Dominate Person", "Dream", "Enervation", "Far Step", "Geas", "Hold Monster", "Immolation", "Infernal Calling", "Legend Lore", "Mislead", "Modify Memory", "Negative Energy Flood", "Passwall", "Planar Binding", "Rary's Telepathic Bond", "Scrying", "Seeming", "Skill Empowerment", "Steel Wind Strike", "Summon Draconic Spirit", "Synaptic Static", "Telekinesis", "Teleportation Circle", "Transmute Rock", "Wall of Force", "Wall of Light", "Wall of Stone"],
    6: ["Arcane Gate", "Chain Lightning", "Circle of Death", "Contingency", "Create Homunculus", "Create Undead", "Disintegrate", "Drawmij's Instant Summons", "Eyebite", "Flesh to Stone", "Globe of Invulnerability", "Guards and Wards", "Investiture of Flame", "Investiture of Ice", "Investiture of Stone", "Investiture of Wind", "Magic Jar", "Mass Suggestion", "Mental Prison", "Move Earth", "Otiluke's Freezing Sphere", "Otto's Irresistible Dance", "Planar Ally", "Programmed Illusion", "Scatter", "Soul Cage", "Summon Fiend", "Sunbeam", "Tasha's Otherworldly Guise", "Tenser's Transformation", "True Seeing", "Wall of Ice"],
    7: ["Create Magen", "Crown of Stars", "Delayed Blast Fireball", "Draconic Transformation", "Dream of the Blue Veil", "Etherealness", "Finger of Death", "Forcecage", "Mirage Arcane", "Mordenkainen's Magnificent Mansion", "Mordenkainen's Sword", "Plane Shift", "Power Word Pain", "Prismatic Spray", "Project Image", "Reverse Gravity", "Sequester", "Simulacrum", "Symbol", "Teleport", "Tether Essence", "Whirlwind"],
    8: ["Abi-Dalzim's Horrid Wilting", "Antimagic Field", "Antipathy/Sympathy", "Clone", "Control Weather", "Dark Star", "Demiplane", "Dominate Monster", "Feeblemind", "Incendiary Cloud", "Maddening Darkness", "Maze", "Mind Blank", "Power Word Stun", "Reality Break", "Sunburst", "Telepathy"],
    9: ["Astral Projection", "Blade of Disaster", "Foresight", "Gate", "Imprisonment", "Mass Polymorph", "Meteor Swarm", "Power Word Kill", "Prismatic Wall", "Psychic Scream", "Shapechange", "Time Stop", "True Polymorph", "Weird", "Wish"]
  }
};

// MASTER LIST OF SPECIES FEATURES (2024 / 5e Standard)
const SPECIES_FEATURES = {
  "Human": ["Resourceful (Heroic Inspiration)", "Skillful (Proficiency +1)", "Versatile (Feat)"],
  "Elf": ["Darkvision (60ft)", "Keen Senses", "Fey Ancestry", "Trance"],
  "Dwarf": ["Darkvision (60ft)", "Dwarven Resilience", "Dwarven Toughness", "Stonecunning"],
  "Halfling": ["Lucky", "Brave", "Halfling Nimbleness", "Naturally Stealthy"],
  "Orc": ["Darkvision (60ft)", "Adrenaline Rush", "Relentless Endurance", "Powerful Build"],
  "Tiefling": ["Darkvision (60ft)", "Hellish Resistance", "Infernal Legacy"],
  "Gnome": ["Darkvision (60ft)", "Gnome Cunning"],
  "Dragonborn": ["Breath Weapon", "Damage Resistance", "Darkvision (60ft)"],
  "Goliath": ["Little Giant", "Mountain Born", "Stone's Endurance"],
  "Aasimar": ["Darkvision (60ft)", "Celestial Resistance", "Healing Hands", "Light Bearer"],
  "Warforged": ["Constructed Resilience", "Sentry's Rest", "Integrated Protection", "Specialized Design"],
  "Genasi": ["Darkvision (60ft)", "Elemental Resistance"]
};

// MASTER LIST OF CLASS FEATURES (Levels 1-20)
const CLASS_FEATURES = {
  "Artificer": {
    1: ["Magical Tinkering", "Spellcasting"],
    2: ["Infuse Item (2 Infusions)"],
    3: ["Artificer Specialist (Subclass)", "The Right Tool for the Job"],
    4: ["Ability Score Improvement"],
    5: ["Subclass Feature (Extra Attack or Alchemical Savant)"],
    6: ["Tool Expertise", "Infuse Item (3 Infusions)"],
    7: ["Flash of Genius"],
    8: ["Ability Score Improvement"],
    9: ["Subclass Feature (Explosive Cannon/Restorative Reagents)"],
    10: ["Magic Item Adept", "Infuse Item (4 Infusions)"],
    11: ["Spell-Storing Item"],
    12: ["Ability Score Improvement"],
    13: [],
    14: ["Magic Item Savant", "Infuse Item (5 Infusions)"],
    15: ["Subclass Feature (Fortified Position/Chemical Savant)"],
    16: ["Ability Score Improvement"],
    17: [],
    18: ["Magic Item Master", "Infuse Item (6 Infusions)"],
    19: ["Ability Score Improvement"],
    20: ["Soul of Artifice"]
  },
  "Barbarian": {
    1: ["Rage", "Unarmored Defense"],
    2: ["Danger Sense", "Reckless Attack"],
    3: ["Primal Path (Subclass)", "Primal Knowledge"],
    4: ["Ability Score Improvement"],
    5: ["Extra Attack", "Fast Movement"],
    6: ["Path Feature"],
    7: ["Feral Instinct"],
    8: ["Ability Score Improvement"],
    9: ["Brutal Critical (1 die)"],
    10: ["Path Feature"],
    11: ["Relentless Rage"],
    12: ["Ability Score Improvement"],
    13: ["Brutal Critical (2 dice)"],
    14: ["Path Feature"],
    15: ["Persistent Rage"],
    16: ["Ability Score Improvement"],
    17: ["Brutal Critical (3 dice)"],
    18: ["Indomitable Might"],
    19: ["Ability Score Improvement"],
    20: ["Primal Champion"]
  },
  "Bard": {
    1: ["Bardic Inspiration", "Spellcasting"],
    2: ["Jack of All Trades", "Song of Rest"],
    3: ["Bard College (Subclass)", "Expertise"],
    4: ["Ability Score Improvement"],
    5: ["Bardic Inspiration (d8)", "Font of Inspiration"],
    6: ["Countercharm", "College Feature"],
    7: [],
    8: ["Ability Score Improvement"],
    9: ["Song of Rest (d8)"],
    10: ["Bardic Inspiration (d10)", "Expertise", "Magical Secrets"],
    11: [],
    12: ["Ability Score Improvement"],
    13: ["Song of Rest (d10)"],
    14: ["Magical Secrets", "College Feature"],
    15: ["Bardic Inspiration (d12)"],
    16: ["Ability Score Improvement"],
    17: ["Song of Rest (d12)"],
    18: ["Magical Secrets"],
    19: ["Ability Score Improvement"],
    20: ["Superior Inspiration"]
  },
  "Cleric": {
    1: ["Spellcasting", "Divine Domain (Subclass)"],
    2: ["Channel Divinity", "Divine Domain Feature"],
    3: [],
    4: ["Ability Score Improvement"],
    5: ["Destroy Undead (CR 1/2)"],
    6: ["Channel Divinity (2/rest)", "Divine Domain Feature"],
    7: [],
    8: ["Ability Score Improvement", "Destroy Undead (CR 1)", "Potent Spellcasting/Divine Strike"],
    9: [],
    10: ["Divine Intervention"],
    11: ["Destroy Undead (CR 2)"],
    12: ["Ability Score Improvement"],
    13: [],
    14: ["Destroy Undead (CR 3)", "Divine Domain Feature"],
    15: [],
    16: ["Ability Score Improvement"],
    17: ["Destroy Undead (CR 4)", "Divine Domain Feature"],
    18: ["Channel Divinity (3/rest)"],
    19: ["Ability Score Improvement"],
    20: ["Divine Intervention Improved"]
  },
  "Druid": {
    1: ["Druidic", "Spellcasting"],
    2: ["Wild Shape", "Druid Circle (Subclass)"],
    3: [],
    4: ["Ability Score Improvement", "Wild Shape Improvement"],
    5: [],
    6: ["Druid Circle Feature"],
    7: [],
    8: ["Ability Score Improvement", "Wild Shape (Fly)"],
    9: [],
    10: ["Druid Circle Feature"],
    11: [],
    12: ["Ability Score Improvement"],
    13: [],
    14: ["Druid Circle Feature"],
    15: [],
    16: ["Ability Score Improvement"],
    17: [],
    18: ["Timeless Body", "Beast Spells"],
    19: ["Ability Score Improvement"],
    20: ["Archdruid"]
  },
  "Fighter": {
    1: ["Fighting Style", "Second Wind"],
    2: ["Action Surge"],
    3: ["Martial Archetype (Subclass)"],
    4: ["Ability Score Improvement"],
    5: ["Extra Attack"],
    6: ["Ability Score Improvement"],
    7: ["Archetype Feature"],
    8: ["Ability Score Improvement"],
    9: ["Indomitable (1 use)"],
    10: ["Archetype Feature"],
    11: ["Extra Attack (2)"],
    12: ["Ability Score Improvement"],
    13: ["Indomitable (2 uses)"],
    14: ["Ability Score Improvement"],
    15: ["Archetype Feature"],
    16: ["Ability Score Improvement"],
    17: ["Action Surge (2 uses)", "Indomitable (3 uses)"],
    18: ["Archetype Feature"],
    19: ["Ability Score Improvement"],
    20: ["Extra Attack (3)"]
  },
  "Monk": {
    1: ["Unarmored Defense", "Martial Arts"],
    2: ["Ki", "Unarmored Movement"],
    3: ["Monastic Tradition (Subclass)", "Deflect Missiles"],
    4: ["Ability Score Improvement", "Slow Fall"],
    5: ["Extra Attack", "Stunning Strike"],
    6: ["Ki-Empowered Strikes", "Tradition Feature"],
    7: ["Evasion", "Stillness of Mind"],
    8: ["Ability Score Improvement"],
    9: ["Unarmored Movement Improvement"],
    10: ["Purity of Body"],
    11: ["Tradition Feature"],
    12: ["Ability Score Improvement"],
    13: ["Tongue of the Sun and Moon"],
    14: ["Diamond Soul"],
    15: ["Timeless Body"],
    16: ["Ability Score Improvement"],
    17: ["Tradition Feature"],
    18: ["Empty Body"],
    19: ["Ability Score Improvement"],
    20: ["Perfect Self"]
  },
  "Paladin": {
    1: ["Divine Sense", "Lay on Hands"],
    2: ["Fighting Style", "Spellcasting", "Divine Smite"],
    3: ["Divine Health", "Sacred Oath (Subclass)"],
    4: ["Ability Score Improvement"],
    5: ["Extra Attack"],
    6: ["Aura of Protection"],
    7: ["Sacred Oath Feature"],
    8: ["Ability Score Improvement"],
    9: [],
    10: ["Aura of Courage"],
    11: ["Improved Divine Smite"],
    12: ["Ability Score Improvement"],
    13: [],
    14: ["Cleansing Touch"],
    15: ["Sacred Oath Feature"],
    16: ["Ability Score Improvement"],
    17: [],
    18: ["Aura Improvements"],
    19: ["Ability Score Improvement"],
    20: ["Sacred Oath Feature (Avatar)"]
  },
  "Psion": { 
    // Updated to match UA 2025 Psion Update
    1: ["Spellcasting", "Psionic Power (Energy Dice)", "Subtle Telekinesis"],
    2: ["Psionic Discipline"],
    3: ["Psion Subclass"],
    4: ["Ability Score Improvement"],
    5: ["Psionic Discipline", "Psionic Restoration"],
    6: ["Subclass Feature"],
    7: ["Psionic Surge"],
    8: ["Ability Score Improvement"],
    9: [], 
    10: ["Psionic Discipline", "Subclass Feature"],
    11: [], 
    12: ["Ability Score Improvement"],
    13: ["Psionic Discipline"],
    14: ["Subclass Feature"],
    15: [], 
    16: ["Ability Score Improvement"],
    17: ["Psionic Discipline"],
    18: ["Psionic Reserves"],
    19: ["Epic Boon"],
    20: ["Enkindled Life Force"]
  },
  "Ranger": {
    1: ["Favored Enemy", "Natural Explorer"],
    2: ["Fighting Style", "Spellcasting"],
    3: ["Ranger Archetype (Subclass)", "Primeval Awareness"],
    4: ["Ability Score Improvement"],
    5: ["Extra Attack"],
    6: ["Favored Enemy/Natural Explorer Improvement"],
    7: ["Archetype Feature"],
    8: ["Ability Score Improvement", "Land's Stride"],
    9: [],
    10: ["Natural Explorer Improvement", "Hide in Plain Sight"],
    11: ["Archetype Feature"],
    12: ["Ability Score Improvement"],
    13: [],
    14: ["Favored Enemy Improvement", "Vanish"],
    15: ["Archetype Feature"],
    16: ["Ability Score Improvement"],
    17: [],
    18: ["Feral Senses"],
    19: ["Ability Score Improvement"],
    20: ["Foe Slayer"]
  },
  "Rogue": {
    1: ["Expertise", "Sneak Attack", "Thieves' Cant"],
    2: ["Cunning Action"],
    3: ["Roguish Archetype (Subclass)"],
    4: ["Ability Score Improvement"],
    5: ["Uncanny Dodge"],
    6: ["Expertise"],
    7: ["Evasion"],
    8: ["Ability Score Improvement"],
    9: ["Archetype Feature"],
    10: ["Ability Score Improvement"],
    11: ["Reliable Talent"],
    12: ["Ability Score Improvement"],
    13: ["Archetype Feature"],
    14: ["Blindsense"],
    15: ["Slippery Mind"],
    16: ["Ability Score Improvement"],
    17: ["Archetype Feature"],
    18: ["Elusive"],
    19: ["Ability Score Improvement"],
    20: ["Stroke of Luck"]
  },
  "Sorcerer": {
    1: ["Spellcasting", "Sorcerous Origin (Subclass)"],
    2: ["Font of Magic"],
    3: ["Metamagic"],
    4: ["Ability Score Improvement"],
    5: [],
    6: ["Origin Feature"],
    7: [],
    8: ["Ability Score Improvement"],
    9: [],
    10: ["Metamagic (3rd option)"],
    11: [],
    12: ["Ability Score Improvement"],
    13: [],
    14: ["Origin Feature"],
    15: [],
    16: ["Ability Score Improvement"],
    17: ["Metamagic (4th option)"],
    18: ["Origin Feature"],
    19: ["Ability Score Improvement"],
    20: ["Sorcerous Restoration"]
  },
  "Warlock": {
    1: ["Otherworldly Patron (Subclass)", "Pact Magic"],
    2: ["Eldritch Invocations"],
    3: ["Pact Boon"],
    4: ["Ability Score Improvement"],
    5: [],
    6: ["Patron Feature"],
    7: [],
    8: ["Ability Score Improvement"],
    9: [],
    10: ["Patron Feature"],
    11: ["Mystic Arcanum (6th level)"],
    12: ["Ability Score Improvement"],
    13: ["Mystic Arcanum (7th level)"],
    14: ["Patron Feature"],
    15: ["Mystic Arcanum (8th level)"],
    16: ["Ability Score Improvement"],
    17: ["Mystic Arcanum (9th level)"],
    18: [],
    19: ["Ability Score Improvement"],
    20: ["Eldritch Master"]
  },
  "Wizard": {
    1: ["Spellcasting", "Arcane Recovery"],
    2: ["Arcane Tradition (Subclass)"],
    3: [],
    4: ["Ability Score Improvement"],
    5: [],
    6: ["Tradition Feature"],
    7: [],
    8: ["Ability Score Improvement"],
    9: [],
    10: ["Tradition Feature"],
    11: [],
    12: ["Ability Score Improvement"],
    13: [],
    14: ["Tradition Feature"],
    15: [],
    16: ["Ability Score Improvement"],
    17: [],
    18: ["Spell Mastery"],
    19: ["Ability Score Improvement"],
    20: ["Signature Spells"]
  }
};

// --- SUBCLASS FEATURES DATABASE ---
const SUBCLASS_FEATURES = {
  // --- ARTIFICER (2024) ---
  "Alchemist": { 3: ["Alchemist Spells", "Experimental Elixir"], 5: ["Alchemical Savant"], 9: ["Restorative Reagents"], 15: ["Chemical Mastery"] },
  "Armorer": { 3: ["Armorer Spells", "Arcane Armor", "Armor Model"], 5: ["Extra Attack"], 9: ["Armor Modifications"], 15: ["Perfected Armor"] },
  "Artillerist": { 3: ["Artillerist Spells", "Eldritch Cannon"], 5: ["Arcane Firearm"], 9: ["Explosive Cannon"], 15: ["Fortified Position"] },
  "Battle Smith": { 3: ["Battle Smith Spells", "Battle Ready", "Steel Defender"], 5: ["Extra Attack"], 9: ["Arcane Jolt"], 15: ["Improved Defender"] },

  // --- PSION (UA 2025) ---
  "Metamorph": { 3: ["Metamorph Spells", "Adaptive Body", "Psionic Weapon"], 6: ["Metabolic Control"], 10: ["Reactive Adaptation"], 14: ["Perfect Form"] },
  "Psi Warper": { 3: ["Psi Warper Spells", "Dimensional Step"], 6: ["Spatial Manipulation"], 10: ["Transposition"], 14: ["Reality Warp"] },
  "Psykinetic": { 3: ["Psykinetic Spells", "Telekinetic Force"], 6: ["Telekinetic Flight"], 10: ["Force Construct"], 14: ["Telekinetic Master"] },
  "Telepath": { 3: ["Telepath Spells", "Telepathic Intrusion"], 6: ["Psychic Defense"], 10: ["Mind Control"], 14: ["Hive Mind"] },

  // --- BARBARIAN ---
  "Path of the Berserker": { 3: ["Frenzy"], 6: ["Mindless Rage"], 10: ["Intimidating Presence"], 14: ["Retaliation"] },
  "Path of the Totem Warrior": { 3: ["Spirit Seeker", "Totem Spirit"], 6: ["Aspect of the Beast"], 10: ["Spirit Walker"], 14: ["Totemic Attunement"] },

  // --- BARD ---
  "College of Lore": { 3: ["Bonus Proficiencies", "Cutting Words"], 6: ["Additional Magical Secrets"], 14: ["Peerless Skill"] },
  "College of Valor": { 3: ["Bonus Proficiencies", "Combat Inspiration"], 6: ["Extra Attack"], 14: ["Battle Magic"] },

  // --- CLERIC ---
  "Knowledge Domain": { 1: ["Blessings of Knowledge", "Domain Spells"], 2: ["Channel Divinity: Knowledge of the Ages"], 6: ["Channel Divinity: Read Thoughts"], 8: ["Potent Spellcasting"], 17: ["Visions of the Past"] },
  "Life Domain": { 1: ["Bonus Proficiency", "Disciple of Life", "Domain Spells"], 2: ["Channel Divinity: Preserve Life"], 6: ["Blessed Healer"], 8: ["Divine Strike"], 17: ["Supreme Healing"] },
  "Light Domain": { 1: ["Bonus Cantrip", "Warding Flare", "Domain Spells"], 2: ["Channel Divinity: Radiance of the Dawn"], 6: ["Improved Flare"], 8: ["Potent Spellcasting"], 17: ["Corona of Light"] },
  "Nature Domain": { 1: ["Acolyte of Nature", "Bonus Proficiency", "Domain Spells"], 2: ["Channel Divinity: Charm Animals and Plants"], 6: ["Dampen Elements"], 8: ["Divine Strike"], 17: ["Master of Nature"] },
  "Tempest Domain": { 1: ["Bonus Proficiencies", "Wrath of the Storm", "Domain Spells"], 2: ["Channel Divinity: Destructive Wrath"], 6: ["Thunderous Strike"], 8: ["Divine Strike"], 17: ["Stormborn"] },
  "Trickery Domain": { 1: ["Blessing of the Trickster", "Domain Spells"], 2: ["Channel Divinity: Invoke Duplicity"], 6: ["Channel Divinity: Cloak of Shadows"], 8: ["Divine Strike"], 17: ["Improved Duplicity"] },
  "War Domain": { 1: ["Bonus Proficiencies", "War Priest", "Domain Spells"], 2: ["Channel Divinity: Guided Strike"], 6: ["Channel Divinity: War God's Blessing"], 8: ["Divine Strike"], 17: ["Avatar of Battle"] },

  // --- DRUID ---
  "Circle of the Land": { 2: ["Bonus Cantrip", "Natural Recovery", "Circle Spells"], 6: ["Land's Stride"], 10: ["Nature's Ward"], 14: ["Nature's Sanctuary"] },
  "Circle of the Moon": { 2: ["Combat Wild Shape", "Circle Forms"], 6: ["Primal Strike"], 10: ["Elemental Wild Shape"], 14: ["Thousand Forms"] },

  // --- FIGHTER ---
  "Champion": { 3: ["Improved Critical"], 7: ["Remarkable Athlete"], 10: ["Additional Fighting Style"], 15: ["Superior Critical"], 18: ["Survivor"] },
  "Battle Master": { 3: ["Combat Superiority", "Student of War"], 7: ["Know Your Enemy"], 10: ["Improved Combat Superiority"], 15: ["Relentless"], 18: ["Final Combat Superiority"] },
  "Eldritch Knight": { 3: ["Weapon Bond", "Spellcasting"], 7: ["War Magic"], 10: ["Eldritch Strike"], 15: ["Arcane Charge"], 18: ["Improved War Magic"] },

  // --- MONK ---
  "Way of the Open Hand": { 3: ["Open Hand Technique"], 6: ["Wholeness of Body"], 11: ["Tranquility"], 17: ["Quivering Palm"] },
  "Way of Shadow": { 3: ["Shadow Arts"], 6: ["Shadow Step"], 11: ["Cloak of Shadows"], 17: ["Opportunist"] },
  "Way of the Four Elements": { 3: ["Disciple of the Elements"], 6: ["Elemental Disciplines"], 11: ["Elemental Disciplines"], 17: ["Elemental Disciplines"] },

  // --- PALADIN ---
  "Oath of Devotion": { 3: ["Channel Divinity: Sacred Weapon", "Channel Divinity: Turn the Unholy", "Oath Spells"], 7: ["Aura of Devotion"], 15: ["Purity of Spirit"], 20: ["Holy Nimbus"] },
  "Oath of the Ancients": { 3: ["Channel Divinity: Nature's Wrath", "Channel Divinity: Turn the Faithless", "Oath Spells"], 7: ["Aura of Warding"], 15: ["Undying Sentinel"], 20: ["Elder Champion"] },
  "Oath of Vengeance": { 3: ["Channel Divinity: Abjure Enemy", "Channel Divinity: Vow of Enmity", "Oath Spells"], 7: ["Relentless Avenger"], 15: ["Soul of Vengeance"], 20: ["Avenging Angel"] },

  // --- RANGER ---
  "Hunter": { 3: ["Hunter's Prey"], 7: ["Defensive Tactics"], 11: ["Multiattack"], 15: ["Superior Hunter's Defense"] },
  "Beast Master": { 3: ["Ranger's Companion"], 7: ["Exceptional Training"], 11: ["Bestial Fury"], 15: ["Share Spells"] },

  // --- ROGUE ---
  "Thief": { 3: ["Fast Hands", "Second-Story Work"], 9: ["Supreme Sneak"], 13: ["Use Magic Device"], 17: ["Thief's Reflexes"] },
  "Assassin": { 3: ["Bonus Proficiencies", "Assassinate"], 9: ["Infiltration Expertise"], 13: ["Impostor"], 17: ["Death Strike"] },
  "Arcane Trickster": { 3: ["Spellcasting", "Mage Hand Legerdemain"], 9: ["Magical Ambush"], 13: ["Versatile Trickster"], 17: ["Spell Thief"] },

  // --- SORCERER ---
  "Draconic Bloodline": { 1: ["Dragon Ancestor", "Draconic Resilience"], 6: ["Elemental Affinity"], 14: ["Dragon Wings"], 18: ["Draconic Presence"] },
  "Wild Magic": { 1: ["Wild Magic Surge", "Tides of Chaos"], 6: ["Bend Luck"], 14: ["Controlled Chaos"], 18: ["Spell Bombardment"] },

  // --- WARLOCK ---
  "The Archfey": { 1: ["Fey Presence", "Expanded Spell List"], 6: ["Misty Escape"], 10: ["Beguiling Defenses"], 14: ["Dark Delirium"] },
  "The Fiend": { 1: ["Dark One's Blessing", "Expanded Spell List"], 6: ["Dark One's Own Luck"], 10: ["Fiendish Resilience"], 14: ["Hurl Through Hell"] },
  "The Great Old One": { 1: ["Awakened Mind", "Expanded Spell List"], 6: ["Entropic Ward"], 10: ["Thought Shield"], 14: ["Create Thrall"] },

  // --- WIZARD ---
  "School of Abjuration": { 2: ["Abjuration Savant", "Arcane Ward"], 6: ["Projected Ward"], 10: ["Improved Abjuration"], 14: ["Spell Resistance"] },
  "School of Conjuration": { 2: ["Conjuration Savant", "Minor Conjuration"], 6: ["Benign Transposition"], 10: ["Focused Conjuration"], 14: ["Durable Summons"] },
  "School of Divination": { 2: ["Divination Savant", "Portent"], 6: ["Expert Divination"], 10: ["The Third Eye"], 14: ["Greater Portent"] },
  "School of Enchantment": { 2: ["Enchantment Savant", "Hypnotic Gaze"], 6: ["Instinctive Charm"], 10: ["Split Enchantment"], 14: ["Alter Memories"] },
  "School of Evocation": { 2: ["Evocation Savant", "Sculpt Spells"], 6: ["Potent Cantrip"], 10: ["Empowered Evocation"], 14: ["Overchannel"] },
  "School of Illusion": { 2: ["Illusion Savant", "Improved Minor Illusion"], 6: ["Malleable Illusions"], 10: ["Illusory Self"], 14: ["Illusory Reality"] },
  "School of Necromancy": { 2: ["Necromancy Savant", "Grim Harvest"], 6: ["Undead Thralls"], 10: ["Inured to Undeath"], 14: ["Command Undead"] },
  "School of Transmutation": { 2: ["Transmutation Savant", "Minor Alchemy"], 6: ["Transmuter's Stone"], 10: ["Shapechanger"], 14: ["Master Transmuter"] }
};

// Feats Data
const FEATS_DATA = [
  // ORIGIN
  { name: "Alert", category: "Origin", desc: "Prof to Init. Swap Init with ally." },
  { name: "Crafter", category: "Origin", desc: "Tool proficiencies. Discount buying. Fast crafting." },
  { name: "Healer", category: "Origin", desc: "Reroll healing 1s. Heal with kit." },
  { name: "Lucky", category: "Origin", desc: "Luck points for Advantage/Disadvantage." },
  { name: "Magic Initiate", category: "Origin", desc: "Two cantrips + 1st level spell." },
  { name: "Musician", category: "Origin", desc: "Grant Heroic Inspiration after rest." },
  { name: "Savage Attacker", category: "Origin", desc: "Advantage on damage rolls." },
  { name: "Skilled", category: "Origin", desc: "Proficiency in 3 skills or tools." },
  { name: "Tavern Brawler", category: "Origin", desc: "Unarmed damage reroll 1s. Push 5ft." },
  { name: "Tough", category: "Origin", desc: "+2 HP per level." },
  // GENERAL
  { name: "Actor", category: "General", desc: "+1 Cha. Impersonate voices." },
  { name: "Athlete", category: "General", desc: "+1 Str/Dex. Climb speed. Stand from prone 5ft." },
  { name: "Charger", category: "General", desc: "+1 Str/Dex. Dash damage bonus or push." },
  { name: "Crossbow Expert", category: "General", desc: "+1 Dex. No loading property. Melee firing okay." },
  { name: "Crusher", category: "General", desc: "+1 Str/Con. Bludgeoning push 5ft. Crit grants Adv." },
  { name: "Defensive Duelist", category: "General", desc: "+1 Dex. React to add Prof to AC." },
  { name: "Dual Wielder", category: "General", desc: "+1 Str/Dex. Non-light weapons for TWF." },
  { name: "Durable", category: "General", desc: "+1 Con. Adv on Death Saves. Bonus healing." },
  { name: "Fey Touched", category: "General", desc: "+1 Int/Wis/Cha. Misty Step + spell." },
  { name: "Great Weapon Master", category: "General", desc: "+1 Str. Heavy weapon damage bonus." },
  { name: "Inspiring Leader", category: "General", desc: "+1 Wis/Cha. Temp HP to party after rest." },
  { name: "Keen Mind", category: "General", desc: "+1 Int. Knowledge expertise. Bonus action study." },
  { name: "Observant", category: "General", desc: "+1 Int/Wis. Search/Perception expertise." },
  { name: "Piercer", category: "General", desc: "+1 Str/Dex. Reroll piercing damage." },
  { name: "Polearm Master", category: "General", desc: "+1 Str. Bonus attack with butt. Reach OA." },
  { name: "Resilient", category: "General", desc: "+1 Stat. Proficiency in that save." },
  { name: "Ritual Caster", category: "General", desc: "+1 Int/Wis/Cha. Cast rituals." },
  { name: "Sentinel", category: "General", desc: "+1 Str/Dex. OA stops movement. OA on disengage." },
  { name: "Shadow Touched", category: "General", desc: "+1 Int/Wis/Cha. Invisibility + spell." },
  { name: "Sharpshooter", category: "General", desc: "+1 Dex. Ignore cover. Long range no disadv." },
  { name: "Shield Master", category: "General", desc: "+1 Str. Shield bash prone. Evasion vs Dex saves." },
  { name: "Slasher", category: "General", desc: "+1 Str/Dex. Slashing slows speed. Crit disadv." },
  { name: "Speedster", category: "General", desc: "+1 Dex/Con. +10 Speed. Dash ignores difficult terrain." },
  { name: "Spell Sniper", category: "General", desc: "+1 Casting Stat. Ignore cover. Double range attack spell." },
  { name: "War Caster", category: "General", desc: "+1 Int/Wis/Cha. Adv Con saves. OA spells." },
];

const ARMOR_OPTIONS = ["Light Armor", "Medium Armor", "Heavy Armor", "Shields"];
const WEAPON_OPTIONS = ["Simple Weapons", "Martial Weapons"];
const LANGUAGE_OPTIONS = ["Common", "Dwarvish", "Elvish", "Giant", "Gnomish", "Goblin", "Halfling", "Orc", "Abyssal", "Celestial", "Draconic", "Infernal", "Primordial", "Sylvan", "Undercommon"];
const SKILLS_LIST = ["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"];
const TOOLS_LIST = ["Thieves' Tools", "Herbalism Kit", "Disguise Kit", "Poisoner's Kit", "Navigator's Tools", "Alchemist's Supplies", "Brewer's Supplies", "Calligrapher's Supplies", "Carpenter's Tools", "Cobbler's Tools", "Cook's Utensils", "Glassblower's Tools", "Jeweler's Tools", "Leatherworker's Tools", "Mason's Tools", "Painter's Supplies", "Potter's Tools", "Smith's Tools", "Tinker's Tools", "Weaver's Tools", "Woodcarver's Tools", "Dice Set", "Playing Card Set", "Bagpipes", "Drum", "Flute", "Lute", "Lyre", "Horn", "Viol"];
const calcMod = (score) => Math.floor((score - 10) / 2);

function CharacterForm({ onCharacterSaved, characterToEdit, onCancelEdit }) {
  // Main State
  const [formData, setFormData] = useState({
    // Identity & Vitals
    name: "", race: "", char_class: "", subclass: "", level: 1, 
    background: "", alignment: "", hp_max: 0, ac: 10, speed: 30, initiative: 0, hit_dice_total: "1d8",
    proficiency_bonus: 2, 
    
    // Stats
    str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,

    //Equipment
    equipped_armor: "None",
    shield_equipped: false,
    custom_armor_stats: { name: "", base: 10, type: "light" },

    //Saving Throws
    saving_throws: [],
    
    // Proficiencies & Features
    armor_prof: {}, weapon_prof: {}, languages: {}, tools_prof: {}, skill_prof: {},
    feats: [], class_features: [], species_features: [], subclass_features: [],

    // INVENTORY ARRAY
    inventory: [],

    // SPELLCASTING ENGINE ---
    spell_save_dc: 0, 
    spell_attack_mod: 0,
    
    // Spells: Key is Level (0=Cantrip, 1-9=Spell Levels), Value is Array of Strings
    spells: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] },
    
    // Slots: Key is Level. Tracks Max (from Class Table) and Current (User Input)
    slots: {
      1: {max: 0, curr: 0}, 2: {max: 0, curr: 0}, 3: {max: 0, curr: 0},
      4: {max: 0, curr: 0}, 5: {max: 0, curr: 0}, 6: {max: 0, curr: 0},
      7: {max: 0, curr: 0}, 8: {max: 0, curr: 0}, 9: {max: 0, curr: 0}
    },

    // Custom Input Fields
    custom_armor: "", custom_weapon: "", custom_language: "", custom_skills: "", custom_tools: "", custom_features: ""
  });

  const [isCustomRace, setIsCustomRace] = useState(false);
  const [isCustomClass, setIsCustomClass] = useState(false);
  const [isCustomSubclass, setIsCustomSubclass] = useState(false);
  const [tempSpells, setTempSpells] = useState({0:"", 1:"", 2:"", 3:"", 4:"", 5:"", 6:"", 7:"", 8:"", 9:""});
  const subSpellData = SUBCLASS_SPELL_DATA[formData.subclass];
  const classData = CLASS_DATA[formData.char_class];
  // Updated state for Tag System
  const [newItem, setNewItem] = useState({ 
    type: "Weapon", name: "", isCustom: false, 
    ac: 10, armorType: "light", stealth: false,
    
    //Weapon Categories
    wpnCategory: "Simple",  // Simple vs Martial
    wpnRange: "Melee",      // Melee vs Ranged

    // Multi-Damage System: List of objects { dice: "1d8", type: "Slashing" }
    damageList: [], 
    tempDice: "", tempType: "", // Temp inputs for adding a damage pair

    properties: [], tempProp: "" // Properties Tags
  });

  // Caster Type: Check Subclass first ("third"), then Class ("full"/"half"), otherwise "none"
  const casterType = subSpellData ? subSpellData.type : (classData?.caster_type || "none");
  const isCaster = casterType !== "none";

  // Casting Stat: Check Subclass first, then Class, default to Int
  const castingStat = subSpellData ? subSpellData.ability : (SPELL_ABILITY[formData.char_class] || "int");

  // Spell List Source: Eldritch Knights use "Wizard" list, etc.
  const spellListSource = subSpellData ? subSpellData.list : formData.char_class;

  // --- MAIN CALCULATOR ENGINE ---
  // Auto-calculates HP, AC, Initiative, Saves, Spell Stats, and Hit Dice
  useEffect(() => {
    // 1. BASICS
    const lvl = formData.level;
    const prof = Math.ceil(lvl / 4) + 1;
    const conMod = calcMod(formData.con);
    const dexMod = calcMod(formData.dex);
    const classInfo = CLASS_DATA[formData.char_class];

    // 2. HP CALCULATION (Fixed HP: Max at Lvl 1 + Avg thereafter)
    // Formula: (MaxDie + Con) + (AvgDie + Con)*(Lvl-1) + Tough
    const hitDie = classInfo?.hit_die || 8;
    const avgDie = Math.ceil(hitDie / 2) + 1;
    const toughFeat = formData.feats.includes("Tough") ? (2 * lvl) : 0;

    const calculatedHP = (hitDie + conMod) + ((avgDie + conMod) * (lvl - 1)) + toughFeat;

    // 3. AC CALCULATION
    let armor = ARMOR_TABLE[formData.equipped_armor];

    // If not in standard table, check Inventory for custom item stats
    if (!armor) {
      const invItem = formData.inventory.find(i => i.name === formData.equipped_armor);
      if (invItem && invItem.stats) {
        armor = invItem.stats;
      }
    }
    
    // Fallback if nothing found
    if (!armor) armor = ARMOR_TABLE["None"];

    let calculatedAC = armor.base;
    // ... (Keep the rest of the logic for Dex/Shield/Monk/Barbarian exactly the same) ...
    if (armor.type === "light" || armor.type === "none") {
      calculatedAC += dexMod;
      if (formData.char_class === "Barbarian" && armor.type === "none" && !formData.shield_equipped) {
        calculatedAC = 10 + dexMod + conMod;
      }
      if (formData.char_class === "Monk" && armor.type === "none" && !formData.shield_equipped) {
        calculatedAC = 10 + dexMod + calcMod(formData.wis);
      }
    } else if (armor.type === "medium") {
      calculatedAC += Math.min(dexMod, 2);
    }
    if (formData.shield_equipped) calculatedAC += 2;

    // 4. INITIATIVE (Dex + Alert Feat)
    const alertBonus = formData.feats.includes("Alert") ? prof : 0;
    const calculatedInit = dexMod + alertBonus;

    // 5. SPELL STATS
    const castMod = calcMod(formData[castingStat]);
    const dc = 8 + prof + castMod;
    const atk = prof + castMod;

    // APPLY UPDATES
    setFormData(prev => ({
      ...prev,
      hp_max: calculatedHP > 0 ? calculatedHP : 1,
      ac: calculatedAC,
      initiative: calculatedInit,
      proficiency_bonus: prof,
      saving_throws: classInfo?.saves || [],
      spell_save_dc: dc,
      spell_attack_mod: atk,
      hit_dice_total: `${lvl}d${hitDie}`
    }));

  }, [
    formData.level, formData.char_class, formData.feats, 
    formData.equipped_armor, formData.shield_equipped,
    formData.str, formData.dex, formData.con, formData.int, formData.wis, formData.cha
  ]);

  // --- AUTOMATION: Class Features ---
  useEffect(() => {
    let combinedFeatures = [];

    // 1. Get Base Class Features
    if (CLASS_FEATURES[formData.char_class]) {
      for (let i = 1; i <= formData.level; i++) {
        const featsAtLevel = CLASS_FEATURES[formData.char_class][i];
        if (featsAtLevel) combinedFeatures = [...combinedFeatures, ...featsAtLevel];
      }
    }

    // 2. Get Subclass Features (if a subclass is selected)
    if (formData.subclass && SUBCLASS_FEATURES[formData.subclass]) {
      for (let i = 1; i <= formData.level; i++) {
        const subFeatsAtLevel = SUBCLASS_FEATURES[formData.subclass][i];
        if (subFeatsAtLevel) combinedFeatures = [...combinedFeatures, ...subFeatsAtLevel];
      }
    }

    setFormData(prev => ({ ...prev, class_features: combinedFeatures }));
  }, [formData.char_class, formData.subclass, formData.level]);

  // --- AUTOMATION: Species Features ---
  useEffect(() => {
    if (SPECIES_FEATURES[formData.race]) {
      setFormData(prev => ({ ...prev, species_features: SPECIES_FEATURES[formData.race] }));
    } else {
      setFormData(prev => ({ ...prev, species_features: [] }));
    }
  }, [formData.race]);

  // --- AUTOMATION: Spell Slots ---
  useEffect(() => {
    const type = casterType;
    const lvl = formData.level;

    if (type && type !== "none" && type !== "psion") {
      const table = SLOT_TABLE[type];
      const slotsRow = table[lvl - 1] || [0,0,0,0,0,0,0,0,0];

      setFormData(prev => {
        const newSlots = { ...prev.slots };
        slotsRow.forEach((amt, idx) => {
          const spellLvl = idx + 1;
          if (spellLvl <= 9) {
            newSlots[spellLvl] = { 
              max: amt, 
              // If max drops (e.g. de-leveling), clamp the current slots so they don't exceed max
              curr: Math.min(prev.slots[spellLvl].curr, amt) 
            };
          }
        });
        return { ...prev, slots: newSlots };
      });
    }
  }, [formData.char_class, formData.level]);

// --- LOAD DATA ---
  useEffect(() => {
    if (characterToEdit) {
      const ext = characterToEdit.extended_data || {};

      // 1. MIGRATION: Convert old text/array data to new Level 0-9 Object
      let loadedSpells = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] };

      // Handle "Cantrips" 
      if (Array.isArray(ext.cantrips)) {
        loadedSpells[0] = ext.cantrips;
      } else if (typeof ext.cantrips === 'string' && ext.cantrips.length > 0) {
        loadedSpells[0] = ext.cantrips.split(", ").map(s => s.trim());
      }

      // Handle "Level 1 Spells" 
      if (Array.isArray(ext.spells_lvl1)) {
        loadedSpells[1] = ext.spells_lvl1;
      } else if (typeof ext.spells_lvl1 === 'string' && ext.spells_lvl1.length > 0) {
        loadedSpells[1] = ext.spells_lvl1.split(", ").map(s => s.trim());
      }

      // If new format exists, merge it in
      if (ext.spells) {
        loadedSpells = { ...loadedSpells, ...ext.spells };
      }

      // 2. LOAD SLOT DATA
      const loadedSlots = ext.slots || {
        1: {max: 0, curr: 0}, 2: {max: 0, curr: 0}, 3: {max: 0, curr: 0},
        4: {max: 0, curr: 0}, 5: {max: 0, curr: 0}, 6: {max: 0, curr: 0},
        7: {max: 0, curr: 0}, 8: {max: 0, curr: 0}, 9: {max: 0, curr: 0}
      };

      setFormData({
        name: characterToEdit.name,
        race: characterToEdit.race,
        char_class: characterToEdit.char_class,
        subclass: characterToEdit.subclass || "",
        level: characterToEdit.level,
        background: characterToEdit.background || "",
        alignment: characterToEdit.alignment || "",
        hp_max: characterToEdit.hp_max,
        ac: characterToEdit.ac,
        speed: characterToEdit.speed,
        initiative: characterToEdit.initiative,
        hit_dice_total: characterToEdit.hit_dice_total || "1d8",
        proficiency_bonus: 2, 

        str: characterToEdit.stats.str,
        dex: characterToEdit.stats.dex,
        con: characterToEdit.stats.con,
        int: characterToEdit.stats.int,
        wis: characterToEdit.stats.wis,
        cha: characterToEdit.stats.cha,

        armor_prof: ext.armor_prof || {},
        weapon_prof: ext.weapon_prof || {},
        languages: ext.languages || {},
        tools_prof: ext.tools_prof || {},
        skill_prof: ext.skill_prof || {},
        inventory: ext.inventory || [],

        feats: ext.feats || [],
        class_features: ext.class_features || [], 
        species_features: ext.species_features || [],
        subclass_features: ext.subclass_features || [],

        spells: loadedSpells,
        slots: loadedSlots,
        spell_save_dc: 0, 
        spell_attack_mod: 0,

        custom_armor: ext.custom_armor || "",
        custom_weapon: ext.custom_weapon || "",
        custom_language: ext.custom_language || "",
        custom_skills: ext.custom_skills || "", 
        custom_tools: ext.custom_tools || "",
        custom_features: ext.custom_features || "",
        custom_armor_stats: ext.custom_armor_stats || { name: "", base: 10, type: "light" }
      });

      setIsCustomRace(!RACES.includes(characterToEdit.race) && characterToEdit.race !== "");
      setIsCustomClass(!Object.keys(CLASS_DATA).includes(characterToEdit.char_class) && characterToEdit.char_class !== "");

      // Check if the loaded subclass exists in our options list. If not, it's custom.
      const hasSubclass = characterToEdit.subclass;
      const classHasOptions = SUBCLASS_OPTIONS[characterToEdit.char_class];
      const isKnownSubclass = classHasOptions && classHasOptions.includes(characterToEdit.subclass);
      
      setIsCustomSubclass(hasSubclass && !isKnownSubclass);
    } else {
      // RESET FORM
      setFormData({
        name: "", race: "", char_class: "", subclass: "", level: 1, 
        background: "", alignment: "", hp_max: 10, ac: 10, speed: 30, initiative: 0, hit_dice_total: "1d8",
        proficiency_bonus: 2, str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
        armor_prof: {}, weapon_prof: {}, languages: {}, tools_prof: {}, skill_prof: {},
        feats: [], class_features: [], species_features: [], subclass_features: [], inventory: [],

        spell_save_dc: 0, spell_attack_mod: 0,
        spells: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] },
        slots: {
          1: {max: 0, curr: 0}, 2: {max: 0, curr: 0}, 3: {max: 0, curr: 0},
          4: {max: 0, curr: 0}, 5: {max: 0, curr: 0}, 6: {max: 0, curr: 0},
          7: {max: 0, curr: 0}, 8: {max: 0, curr: 0}, 9: {max: 0, curr: 0}
        },

        custom_armor: "", custom_weapon: "", custom_language: "", custom_skills: "", custom_tools: "", custom_features: "", 
        custom_armor_stats: { name: "", base: 10, type: "light" }
      });
      setIsCustomRace(false);
      setIsCustomClass(false);
      setIsCustomSubclass(false);
    }
  }, [characterToEdit]);

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = e.target.type === "number" ? parseInt(value) || 0 : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleCheckboxChange = (e, category) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [category]: { ...prev[category], [name]: checked }
    }));
  };

  const handleDropdownChange = (e, field, setCustomState) => {
    const value = e.target.value;
    if (value === "CUSTOM_OPTION") {
      setCustomState(true);
      setFormData(prev => ({...prev, [field]: ""}));
    } else {
      handleChange(e);
    }
  };

  const handleAddFeat = (e) => {
    const featName = e.target.value;
    if (!featName) return;
    if (!formData.feats.includes(featName)) {
      setFormData(prev => ({...prev, feats: [...prev.feats, featName]}));
    }
  };

  const handleRemoveFeat = (featToRemove) => {
    setFormData(prev => ({...prev, feats: prev.feats.filter(f => f !== featToRemove)}));
  };

  const handleSlotChange = (level, field, value) => {
    setFormData(prev => ({
      ...prev,
      slots: {
        ...prev.slots,
        [level]: { ...prev.slots[level], [field]: parseInt(value) || 0 }
      }
    }));
  };

  const addSpell = (lvl, spellName) => {
    if (!spellName) return;
    if (!formData.spells[lvl].includes(spellName)) {
      setFormData(prev => ({
        ...prev,
        spells: { ...prev.spells, [lvl]: [...prev.spells[lvl], spellName] }
      }));
    }
  };

  const removeSpell = (lvl, spellName) => {
    setFormData(prev => ({
      ...prev,
      spells: { ...prev.spells, [lvl]: prev.spells[lvl].filter(s => s !== spellName) }
    }));
  };

  // --- HELPER: CALCULATE ATTACK STATS ---
  const getAttackData = (item) => {
    const stats = item.stats || WEAPON_TABLE[item.name] || {};
    
    // 1. Get Modifiers
    const strMod = calcMod(formData.str);
    const dexMod = calcMod(formData.dex);
    const prof = formData.proficiency_bonus;
    
    // 2. Determine Stat (Str vs Dex)
    const props = (stats.properties || stats.props || "").toLowerCase();
    const isFinesse = props.includes("finesse");
    const isRanged = (stats.rangeType === "Ranged") || props.includes("range") || ["shortbow", "longbow", "crossbow", "blowgun", "sling", "dart"].some(n => item.name.toLowerCase().includes(n));
    
    let mod = strMod;
    if (isFinesse) mod = Math.max(strMod, dexMod);
    else if (isRanged && !props.includes("thrown")) mod = dexMod;

    // 3. Construct Damage String
    let damageString = "";
    
    // A. If using new Multi-Damage List
    if (stats.damageList && stats.damageList.length > 0) {
      damageString = stats.damageList.map((d, i) => {
        // Add modifier only to the first damage component
        const modifier = (i === 0 && mod !== 0) ? (mod > 0 ? `+${mod}` : mod) : "";
        return `${d.dice}${modifier} ${d.type}`;
      }).join(" + ");
    } 
    // B. Fallback for Standard/Old items
    else {
      const baseDmg = stats.damage || "?";
      const modifier = mod !== 0 ? (mod > 0 ? `+${mod}` : mod) : "";
      damageString = `${baseDmg}${modifier} ${stats.type || stats.dmgType || ""}`;
    }

    const totalAtk = mod + prof;

    return {
      atk: totalAtk >= 0 ? `+${totalAtk}` : totalAtk,
      dmg: damageString,
      // (Type is now embedded in the damage string)
      type: "" 
    };
  };
  
  // Helper to render a row for Level X spells
  const renderSpellRow = (lvl) => {
    const hasSlots = formData.slots[lvl] && formData.slots[lvl].max > 0;
    const hasSpells = formData.spells[lvl] && formData.spells[lvl].length > 0;
    
    // Hide row if no slots available AND no spells added (except cantrips which always show)
    if (lvl > 0 && !hasSlots && !hasSpells) return null;

    const label = lvl === 0 ? "Cantrips (0)" : `Level ${lvl}`;
    
    return (
      <div key={lvl} style={{ marginTop: "10px", paddingBottom: "10px", borderBottom: "1px dashed #ddd" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
            <label style={{fontWeight: "bold", color: "#4A148C"}}>{label}</label>
            {lvl > 0 && hasSlots && (
               <div style={{fontSize: "0.9em"}}>
                 Slots: 
                 <input type="number" value={formData.slots[lvl].curr} onChange={(e) => handleSlotChange(lvl, 'curr', e.target.value)} style={{width: "40px", marginLeft: "5px", textAlign: "center"}} />
                 <span style={{margin: "0 5px"}}>/</span>
                 <input value={formData.slots[lvl].max} readOnly style={{width: "40px", background: "#f3e5f5", textAlign: "center", border: "none"}} />
               </div>
            )}
        </div>
        <div style={{display: "flex", gap: "5px", marginBottom: "5px"}}>
             {/* Note: Ensure SPELL_LISTS is defined in your file, or remove this select if you don't use it */}
             <select onChange={(e) => { addSpell(lvl, e.target.value); e.target.value = ""; }} style={{flex: 1}}>
                 <option value="">+ Add {lvl === 0 ? "Cantrip" : "Spell"}</option>
                 {/* USE spellListSource HERE: */}
                 {SPELL_LISTS[spellListSource]?.[lvl]?.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
             
             <input placeholder="Custom..." value={tempSpells[lvl]} onChange={e => setTempSpells(prev => ({...prev, [lvl]: e.target.value}))} onKeyDown={e => {if(e.key === 'Enter'){e.preventDefault(); addSpell(lvl, tempSpells[lvl]); setTempSpells(prev => ({...prev, [lvl]: ""}));}}} style={{width: "80px"}} />
             <button type="button" onClick={() => {addSpell(lvl, tempSpells[lvl]); setTempSpells(prev => ({...prev, [lvl]: ""}));}}>Add</button>
        </div>
        <div style={{display: "flex", flexWrap: "wrap", gap: "5px"}}>
             {formData.spells[lvl].map(s => (
               <span key={s} style={{background: lvl === 0 ? "#E1BEE7" : "#D1C4E9", padding: "2px 8px", borderRadius: "10px", fontSize: "0.85em", display: "flex", alignItems: "center"}}>
                 {s} <span onClick={() => removeSpell(lvl, s)} style={{cursor: "pointer", fontWeight: "bold", marginLeft: "6px", color: "#666"}}>x</span>
               </span>
             ))}
        </div>
      </div>
    );
  };
  
  // --- TAG HANDLERS ---
  const addTag = (field, value, tempField) => {
    if (!value) return;
    setNewItem(prev => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field] : [...prev[field], value],
      [tempField]: "" // Clear the text input after adding
    }));
  };

  const removeTag = (field, value) => {
    setNewItem(prev => ({
      ...prev,
      [field]: prev[field].filter(t => t !== value)
    }));
  };

  // --- INVENTORY HANDLERS ---
  const addDamagePair = () => {
    if (!newItem.tempDice || !newItem.tempType) return;
    setNewItem(prev => ({
      ...prev,
      damageList: [...prev.damageList, { dice: prev.tempDice, type: prev.tempType }],
      tempDice: "", tempType: "" // Clear inputs
    }));
  };

  const removeDamagePair = (index) => {
    setNewItem(prev => ({
      ...prev,
      damageList: prev.damageList.filter((_, i) => i !== index)
    }));
  };

  const handleAddItem = () => {
    if (!newItem.name) return;
    
    const itemData = { 
      name: newItem.name, 
      type: newItem.type, 
      id: Date.now() 
    };

    // 1. Capture Custom Armor Stats
    if (newItem.type === "Armor" && newItem.isCustom) {
      itemData.stats = {
        base: parseInt(newItem.ac) || 10,
        type: newItem.armorType,
        stealth_dis: newItem.stealth // New: Stealth Disadvantage
      };
    }
    
    // 2. Capture Custom Weapon Stats 
    if (newItem.type === "Weapon" && newItem.isCustom) {
      itemData.stats = {
        category: newItem.wpnCategory, 
        rangeType: newItem.wpnRange,   
        
        // Save the complex damage list directly
        damageList: newItem.damageList, 
        
        // Also construct a simple string for fallback displays
        damage: newItem.damageList.map(d => `${d.dice} ${d.type}`).join(" + "), 
        
        properties: newItem.properties.join(", ")
      };
    }

    setFormData(prev => ({
      ...prev,
      inventory: [...prev.inventory, itemData]
    }));
    
    // Reset form
    setNewItem({ 
      type: "Weapon", name: "", isCustom: false, 
      ac: 10, armorType: "light", stealth: false,
      wpnCategory: "Simple", wpnRange: "Melee",
      damageList: [], tempDice: "", tempType: "",
      properties: [], tempProp: ""
    });
  };

  const handleRemoveItem = (id) => {
    setFormData(prev => ({
      ...prev,
      inventory: prev.inventory.filter(item => item.id !== id)
    }));
  };

  const handleEquip = (item) => {
    if (item.type === "Armor") {
      setFormData(prev => ({ ...prev, equipped_armor: item.name }));
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      race: formData.race,
      char_class: formData.char_class,
      subclass: formData.subclass,
      level: formData.level,
      background: formData.background,
      alignment: formData.alignment,
      hp_max: formData.hp_max,
      ac: formData.ac,
      speed: formData.speed,
      initiative: formData.initiative,
      hit_dice_total: formData.hit_dice_total,
      
      stats: {
        str: formData.str, dex: formData.dex, con: formData.con,
        int: formData.int, wis: formData.wis, cha: formData.cha,
      },

      extended_data: {
        armor_prof: formData.armor_prof,
        weapon_prof: formData.weapon_prof,
        languages: formData.languages,
        tools_prof: formData.tools_prof,
        skill_prof: formData.skill_prof,
        feats: formData.feats,
        class_features: formData.class_features, 
        species_features: formData.species_features,
        spells: formData.spells,
        slots: formData.slots,  
        custom_armor: formData.custom_armor,
        custom_weapon: formData.custom_weapon,
        custom_language: formData.custom_language,
        custom_skills: formData.custom_skills, 
        custom_tools: formData.custom_tools,
        custom_features: formData.custom_features,
        inventory: formData.inventory,
        custom_armor_stats: formData.custom_armor_stats
      }
    };

    const url = characterToEdit 
      ? `http://localhost:8080/api/characters/${characterToEdit.id}` 
      : "http://localhost:8080/api/characters"; 
    const method = characterToEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) onCharacterSaved();
    } catch (error) { console.error("Error:", error); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "600px", position: "sticky", top: "20px", maxHeight: "90vh", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>{characterToEdit ? `Editing ${characterToEdit.name}` : "New Character"}</h2>
        {characterToEdit && <button type="button" onClick={onCancelEdit} style={{fontSize: "0.8em"}}>Cancel Edit</button>}
      </div>

      {/* --- IDENTITY --- */}
      <fieldset style={{ padding: "1rem", border: "1px solid #ccc" }}>
        <legend><strong>Identity</strong></legend>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", alignItems: "center" }}>
            
            {/* Name & Species */}
            <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
            {isCustomRace ? (
               <div style={{display: "flex", gap: "5px"}}><input name="race" placeholder="Species..." value={formData.race} onChange={handleChange} autoFocus required style={{flex: 1}}/><button type="button" onClick={() => setIsCustomRace(false)}>Back</button></div>
            ) : (
              <select name="race" value={RACES.includes(formData.race) ? formData.race : ""} onChange={(e) => handleDropdownChange(e, "race", setIsCustomRace)} required><option value="" disabled>Species</option>{RACES.map(r => <option key={r} value={r}>{r}</option>)}<option value="CUSTOM_OPTION">+ Custom...</option></select>
            )}

            {/* Class */}
            {isCustomClass ? (
               <div style={{display: "flex", gap: "5px"}}><input name="char_class" placeholder="Class..." value={formData.char_class} onChange={handleChange} autoFocus required style={{flex: 1}}/><button type="button" onClick={() => setIsCustomClass(false)}>Back</button></div>
            ) : (
              <select name="char_class" value={Object.keys(CLASS_DATA).includes(formData.char_class) ? formData.char_class : ""} onChange={(e) => handleDropdownChange(e, "char_class", setIsCustomClass)} required>
                <option value="" disabled>Class</option>
                {Object.keys(CLASS_DATA).map(c => <option key={c} value={c}>{c}</option>)}
                <option value="CUSTOM_OPTION">+ Custom...</option>
              </select>
            )}

            {/* Subclass (Spans Full Width) */}
            {formData.char_class && !isCustomClass && (
              isCustomSubclass ? (
                <div style={{display: "flex", gap: "5px", gridColumn: "span 2"}}>
                  <input name="subclass" placeholder="Subclass..." value={formData.subclass} onChange={handleChange} autoFocus style={{flex: 1}}/>
                  <button type="button" onClick={() => setIsCustomSubclass(false)}>Back</button>
                </div>
              ) : (
                <select name="subclass" value={formData.subclass} onChange={(e) => handleDropdownChange(e, "subclass", setIsCustomSubclass)} style={{gridColumn: "span 2"}}>
                  <option value="" disabled>Select Subclass</option>
                  {SUBCLASS_OPTIONS[formData.char_class] && SUBCLASS_OPTIONS[formData.char_class].map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="CUSTOM_OPTION" style={{fontWeight: "bold"}}>+ Enter Custom...</option>
                </select>
              )
            )}

            {/* Level (Left) & Proficiency Bonus (Right) */}
            <div>
               <label style={{fontWeight: "bold", color: "#444"}}>Level: </label>
               <input type="number" name="level" value={formData.level} onChange={handleChange} min="1" max="20" style={{width: "60px", padding: "5px", marginLeft: "5px"}} />
            </div>

            <div style={{background: "#E8F5E9", padding: "5px 10px", borderRadius: "4px", textAlign: "center", border: "1px solid #C8E6C9"}}>
                <span style={{fontSize: "0.9em", color: "#2E7D32", textTransform: "uppercase", letterSpacing: "1px"}}>Proficiency: </span>
                <strong style={{fontSize: "1.2em", color: "#1B5E20", marginLeft: "5px"}}>+{formData.proficiency_bonus}</strong>
            </div>

        </div>
      </fieldset>

      {/* VITALS & EQUIPMENT (Updated: Inventory Only) */}
      <fieldset style={{ padding: "1rem", border: "1px solid #ccc", background: "#fff" }}>
        <legend><strong>Vitals & Equipment</strong></legend>
        
        {/* Row 1: Calculated Vitals */}
        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "space-around", marginBottom: "15px" }}>
            <div style={{textAlign: "center"}}>
                <div style={{fontSize: "0.8em", color: "#666"}}>HP Max</div>
                <div style={{fontSize: "1.4em", fontWeight: "bold", color: "#D32F2F"}}>{formData.hp_max}</div>
            </div>
            <div style={{textAlign: "center"}}>
                <div style={{fontSize: "0.8em", color: "#666"}}>AC</div>
                <div style={{fontSize: "1.4em", fontWeight: "bold", color: "#1976D2"}}>{formData.ac}</div>
            </div>
            <div style={{textAlign: "center"}}>
                <div style={{fontSize: "0.8em", color: "#666"}}>Init</div>
                <div style={{fontSize: "1.4em", fontWeight: "bold"}}>{formData.initiative >= 0 ? "+" : ""}{formData.initiative}</div>
            </div>
            <div style={{textAlign: "center"}}>
                <div style={{fontSize: "0.8em", color: "#666"}}>Speed</div>
                <input type="number" name="speed" value={formData.speed} onChange={handleChange} style={{width: "40px", textAlign: "center", fontWeight: "bold", border: "none", borderBottom: "1px solid #ccc", fontSize: "1.1em"}} />
            </div>
            <div style={{textAlign: "center"}}>
                <div style={{fontSize: "0.8em", color: "#666"}}>Hit Dice</div>
                <div style={{fontSize: "1.2em", fontWeight: "bold"}}>{formData.hit_dice_total}</div>
            </div>
        </div>

        {/* Row 2: Equipment Controls (Drives AC) */}
        <div style={{borderTop: "1px solid #eee", paddingTop: "10px"}}>
          <div style={{display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap"}}>
               <label style={{fontSize: "0.9em", fontWeight: "bold"}}>Armor:</label>
               
               <select name="equipped_armor" value={formData.equipped_armor} onChange={handleChange} style={{minWidth: "150px", padding: "5px"}}>
                   <option value="None">None (Unarmored)</option>
                   
                   {/* Only show items currently in Inventory */}
                   <optgroup label="From Inventory">
                     {formData.inventory.filter(item => item.type === "Armor").map(item => {
                        const stats = item.stats || ARMOR_TABLE[item.name];
                        return <option key={item.id} value={item.name}>{item.name} {stats ? `(AC ${stats.base})` : ""}</option>;
                     })}
                   </optgroup>
               </select>

               <label style={{fontSize: "0.9em", display: "flex", alignItems: "center", cursor: "pointer", marginLeft: "10px"}}>
                  <input type="checkbox" name="shield_equipped" checked={formData.shield_equipped} onChange={e => setFormData(prev => ({...prev, shield_equipped: e.target.checked}))} style={{marginRight: "5px"}}/> 
                  +Shield
               </label>
          </div>
          
          {/* Helper Text if no armor is available to equip */}
          {formData.inventory.filter(i => i.type === "Armor").length === 0 && (
            <div style={{fontSize: "0.8em", color: "#d32f2f", marginTop: "5px"}}>
              * Add Armor to your Inventory below to see it here.
            </div>
          )}
        </div>
      </fieldset>

      {/* --- COMBAT: ATTACKS & SPELLCASTING --- */}
      <fieldset style={{ padding: "1rem", border: "1px solid #ccc", marginTop: "1rem", background: "#fff" }}>
        <legend><strong>Attacks & Spellcasting</strong></legend>
        
        <div style={{border: "1px solid #ccc", borderRadius: "4px", overflow: "hidden"}}>
          <table style={{width: "100%", borderCollapse: "collapse", fontSize: "0.9em"}}>
            <thead>
              <tr style={{background: "#eee", textAlign: "left"}}>
                <th style={{padding: "8px", borderBottom: "1px solid #ccc"}}>Name</th>
                <th style={{padding: "8px", borderBottom: "1px solid #ccc", width: "60px", textAlign:"center"}}>Atk</th>
                <th style={{padding: "8px", borderBottom: "1px solid #ccc"}}>Damage / Type</th>
                <th style={{padding: "8px", borderBottom: "1px solid #ccc"}}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {/* 1. AUTO-GENERATED WEAPONS FROM INVENTORY */}
              {formData.inventory.filter(i => i.type === "Weapon").map(item => {
                const data = getAttackData(item);
                return (
                  <tr key={item.id} style={{borderBottom: "1px solid #eee"}}>
                    <td style={{padding: "8px", fontWeight: "bold"}}>{item.name}</td>
                    <td style={{padding: "8px", textAlign:"center", background: "#f9f9f9", fontWeight: "bold"}}>{data.atk}</td>
                    <td style={{padding: "8px"}}>{data.dmg} {data.type}</td>
                    <td style={{padding: "8px", color: "#666", fontStyle: "italic"}}>{item.stats?.properties}</td>
                  </tr>
                );
              })}

              {/* 2. MANUAL ATTACK ROW (For Cantrips/Special) */}
              {/* We show a blank row user can type in, or placeholder text if empty */}
              {formData.inventory.filter(i => i.type === "Weapon").length === 0 && (
                 <tr>
                   <td colSpan="4" style={{padding: "15px", textAlign: "center", color: "#888", fontStyle: "italic"}}>
                     Add weapons to your Inventory to see them listed here.
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Simple Manual Entry for things like Fire Bolt */}
        <div style={{marginTop: "10px", fontSize: "0.85em", color: "#666"}}>
           <strong>Tip:</strong> Weapons added to Inventory appear above automatically.
        </div>
      </fieldset>

      {/* --- SPELLCASTING --- */}
      {isCaster && (
        <fieldset style={{ padding: "1rem", border: "1px solid #673AB7", background: "#fff", marginTop: "1rem" }}>
          <legend style={{color: "#4A148C", fontWeight: "bold", fontSize: "1.1em"}}>
            Spellcasting ({castingStat.toUpperCase()})
          </legend>
          
          <div style={{ display: "flex", gap: "20px", marginBottom: "15px", justifyContent: "space-around", background: "#f3e5f5", padding: "10px", borderRadius: "5px" }}>
             <div style={{textAlign: "center"}}>
                <div style={{fontSize: "0.8em", textTransform: "uppercase", letterSpacing: "1px"}}>Save DC</div>
                <div style={{fontSize: "1.8em", fontWeight: "bold", color: "#4A148C"}}>{formData.spell_save_dc}</div>
             </div>
             <div style={{textAlign: "center"}}>
                <div style={{fontSize: "0.8em", textTransform: "uppercase", letterSpacing: "1px"}}>Attack Mod</div>
                <div style={{fontSize: "1.8em", fontWeight: "bold", color: "#4A148C"}}>+{formData.spell_attack_mod}</div>
             </div>
          </div>

          {/* Render Levels 0 through 9 */}
          { [0,1,2,3,4,5,6,7,8,9].map(lvl => renderSpellRow(lvl)) }
          
        </fieldset>
      )}

      {/* --- CLASS FEATURES (Visual Fix Applied) --- */}
      <div style={{ border: "1px solid #ccc", padding: "1rem", marginTop: "1rem", borderRadius: "5px", background: "#fff" }}>
        <h3 style={{ marginTop: 0, fontSize: "1rem", borderBottom: "1px solid #eee", paddingBottom: "5px" }}>Class Features</h3>
        
        {/* Auto-Generated Class Features */}
        <div style={{display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "10px"}}>
          {formData.class_features.length === 0 ? <span style={{color: "#888", fontSize: "0.9em"}}>Features will appear here based on Class & Level...</span> : null}
          {formData.class_features.map((feat, idx) => (
            <span key={idx} style={{background: "#673AB7", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "0.85em", fontWeight: "bold"}}>{feat}</span>
          ))}
        </div>

        {/* Auto-Generated Species Features */}
        <h4 style={{ fontSize: "0.9rem", color: "#666", marginBottom: "5px" }}>Species Features:</h4>
        <div style={{display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "10px"}}>
          {formData.species_features.length === 0 ? <span style={{color: "#888", fontSize: "0.9em"}}>Select a Species...</span> : null}
          {formData.species_features.map((feat, idx) => (
            <span key={idx} style={{background: "#009688", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "0.85em", fontWeight: "bold"}}>{feat}</span>
          ))}
        </div>

        {/* Input with box-sizing fix */}
        <input 
          name="custom_features" 
          placeholder="Additional / Subclass Features (Custom)" 
          value={formData.custom_features} 
          onChange={handleChange} 
          style={{width: "100%", boxSizing: "border-box", padding: "8px", border: "1px solid #ccc", borderRadius: "4px"}} 
        />
      </div>

      {/* --- STATS --- */}
      <fieldset style={{ padding: "1rem", border: "1px solid #ccc", marginTop: "1rem" }}>
        <legend><strong>Ability Scores</strong></legend>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
            {["str", "dex", "con", "int", "wis", "cha"].map(stat => (
              <div key={stat} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <label style={{textTransform: "uppercase", fontSize: "0.8em", fontWeight: "bold", marginBottom: "5px"}}>{stat}</label>
                <input type="number" name={stat} value={formData[stat]} onChange={handleChange} style={{ width: "100%", padding: "5px", textAlign: "center" }} />
              </div>
            ))}
        </div>
        <div style={{marginTop: "10px", borderTop: "1px solid #eee", paddingTop: "5px", fontSize: "0.9em"}}>
            <strong>Attack Bonuses: </strong>
            <span style={{color: "#D32F2F", marginRight: "10px"}}>Melee: +{calcMod(formData.str) + formData.proficiency_bonus}</span>
            <span style={{color: "#1976D2"}}>Ranged: +{calcMod(formData.dex) + formData.proficiency_bonus}</span>
        </div>
      </fieldset>

      {/* --- FEATS --- */}
      <fieldset style={{ padding: "1rem", border: "1px solid #ccc" }}>
        <legend><strong>Feats</strong></legend>
        <select onChange={handleAddFeat} value="" style={{width: "100%", marginBottom: "10px", padding: "5px"}}>
          <option value="" disabled>+ Add a Feat</option>
          <optgroup label="Origin Feats">
            {FEATS_DATA.filter(f => f.category === "Origin").map(f => (<option key={f.name} value={f.name} disabled={formData.feats.includes(f.name)}>{f.name}</option>))}
          </optgroup>
          <optgroup label="General Feats">
            {FEATS_DATA.filter(f => f.category === "General").map(f => (<option key={f.name} value={f.name} disabled={formData.feats.includes(f.name)}>{f.name}</option>))}
          </optgroup>
        </select>
        <div style={{display: "flex", flexDirection: "column", gap: "5px"}}>
          {formData.feats.map(featName => (
            <div key={featName} style={{background: "#e3f2fd", padding: "8px", borderRadius: "5px", display: "flex", justifyContent: "space-between"}}>
              <strong>{featName}</strong>
              <button type="button" onClick={() => handleRemoveFeat(featName)} style={{color: "red", border: "none", background: "none", cursor: "pointer", fontWeight: "bold"}}>✕</button>
            </div>
          ))}
        </div>
      </fieldset>

      {/* --- PROFICIENCIES --- */}
      <fieldset style={{ padding: "1rem", border: "1px solid #ccc" }}>
        <legend><strong>Proficiencies</strong></legend>
        <label><strong>Armor:</strong></label>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "5px" }}>
            {ARMOR_OPTIONS.map(opt => (<label key={opt} style={{fontSize: "0.9em"}}><input type="checkbox" name={opt} checked={!!formData.armor_prof[opt]} onChange={(e) => handleCheckboxChange(e, "armor_prof")} /> {opt}</label>))}
        </div>
        <input name="custom_armor" placeholder="Other Armor" value={formData.custom_armor} onChange={handleChange} style={{width: "100%", marginBottom: "15px", boxSizing: "border-box", padding: "5px"}} />

        <label><strong>Weapons:</strong></label>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "5px" }}>
            {WEAPON_OPTIONS.map(opt => (<label key={opt} style={{fontSize: "0.9em"}}><input type="checkbox" name={opt} checked={!!formData.weapon_prof[opt]} onChange={(e) => handleCheckboxChange(e, "weapon_prof")} /> {opt}</label>))}
        </div>
        <input name="custom_weapon" placeholder="Other Weapons" value={formData.custom_weapon} onChange={handleChange} style={{width: "100%", marginBottom: "15px", boxSizing: "border-box", padding: "5px"}} />

        <label><strong>Languages:</strong></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px", marginBottom: "5px", fontSize: "0.9em" }}>
            {LANGUAGE_OPTIONS.map(opt => (<label key={opt}><input type="checkbox" name={opt} checked={!!formData.languages[opt]} onChange={(e) => handleCheckboxChange(e, "languages")} /> {opt}</label>))}
        </div>
        <input name="custom_language" placeholder="Other Languages" value={formData.custom_language} onChange={handleChange} style={{width: "100%", marginBottom: "15px", boxSizing: "border-box", padding: "5px"}} />

        <div style={{borderTop: "1px solid #eee", paddingTop: "10px"}}>
            <label><strong>Skills:</strong></label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", fontSize: "0.9em", marginTop: "5px", marginBottom: "5px" }}>
                {SKILLS_LIST.map(skill => (<label key={skill}><input type="checkbox" name={skill} checked={!!formData.skill_prof[skill]} onChange={(e) => handleCheckboxChange(e, "skill_prof")} /> {skill}</label>))}
            </div>
            <input name="custom_skills" placeholder="Other Skills" value={formData.custom_skills} onChange={handleChange} style={{width: "100%", marginBottom: "15px", boxSizing: "border-box", padding: "5px"}} />
        </div>

        <div style={{marginTop: "15px"}}>
            <label><strong>Tools:</strong></label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", fontSize: "0.9em", maxHeight: "150px", overflowY: "auto", border: "1px solid #eee", padding: "5px", marginBottom: "5px" }}>
                {TOOLS_LIST.map(tool => (<label key={tool}><input type="checkbox" name={tool} checked={!!formData.tools_prof[tool]} onChange={(e) => handleCheckboxChange(e, "tools_prof")} /> {tool}</label>))}
            </div>
            <input name="custom_tools" placeholder="Other Tools" value={formData.custom_tools} onChange={handleChange} style={{width: "100%", boxSizing: "border-box", padding: "5px"}} />
        </div>
      </fieldset>

      {/* --- INVENTORY --- */}
      <fieldset style={{ padding: "1rem", border: "1px solid #ccc", marginTop: "1rem" }}>
        <legend><strong>Inventory</strong></legend>
        
        {/* ADD ITEM CONTROLS */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap", alignItems: "center" }}>
          <select 
            value={newItem.type} 
            onChange={e => setNewItem({ type: e.target.value, name: "", isCustom: false })}
            style={{ padding: "5px" }}
          >
            <option value="Weapon">Weapon</option>
            <option value="Armor">Armor</option>
            <option value="Pack">Equipment Pack</option>
            <option value="Custom">Other</option>
          </select>

          {/* DYNAMIC INPUTS */}
          {newItem.isCustom || newItem.type === "Custom" ? (
             <div style={{display:"flex", flex: 1, gap: "5px", alignItems: "center", flexWrap: "wrap"}}>
                <input 
                  placeholder={`Custom ${newItem.type} Name`} 
                  value={newItem.name} 
                  onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))} 
                  style={{ flex: 1, padding: "5px", minWidth: "100px" }}
                  autoFocus
                />
                
                {/* CUSTOM ARMOR PARAMS */}
                {newItem.type === "Armor" && (
                   <>
                     <input type="number" placeholder="AC" value={newItem.ac} onChange={e => setNewItem(prev => ({ ...prev, ac: e.target.value }))} style={{width: "40px", padding: "5px"}} />
                     <select value={newItem.armorType} onChange={e => setNewItem(prev => ({ ...prev, armorType: e.target.value }))} style={{padding: "5px"}}>
                       <option value="light">Light</option><option value="medium">Medium</option><option value="heavy">Heavy</option>
                     </select>
                     <label style={{fontSize: "0.8em", display: "flex", alignItems: "center"}}>
                        <input type="checkbox" checked={newItem.stealth} onChange={e => setNewItem(prev => ({...prev, stealth: e.target.checked}))} /> 
                        Stealth Dis.
                     </label>
                   </>
                )}

                {/* CUSTOM WEAPON PARAMS */}
                {newItem.type === "Weapon" && (
                   <div style={{display: "flex", flexDirection: "column", gap: "5px", borderLeft: "2px solid #ddd", paddingLeft: "8px"}}>
                     
                     {/* 1. Category & Range Selectors */}
                     <div style={{display: "flex", gap: "5px"}}>
                        <select value={newItem.wpnCategory} onChange={e => setNewItem(prev => ({...prev, wpnCategory: e.target.value}))} style={{padding: "3px", fontSize: "0.9em"}}>
                          <option value="Simple">Simple</option>
                          <option value="Martial">Martial</option>
                        </select>
                        <select value={newItem.wpnRange} onChange={e => setNewItem(prev => ({...prev, wpnRange: e.target.value}))} style={{padding: "3px", fontSize: "0.9em"}}>
                          <option value="Melee">Melee</option>
                          <option value="Ranged">Ranged</option>
                        </select>
                     </div>

                     {/* 2. Multi-Damage Manager */}
                     <div style={{display: "flex", flexDirection: "column", gap: "3px"}}>
                        <div style={{display: "flex", gap: "3px"}}>
                           <input placeholder="Dice (1d8)" value={newItem.tempDice} onChange={e => setNewItem(prev => ({ ...prev, tempDice: e.target.value }))} style={{width: "60px", padding: "3px"}} />
                           <select value={newItem.tempType} onChange={e => setNewItem(prev => ({ ...prev, tempType: e.target.value }))} style={{padding: "3px", width: "90px"}}>
                              <option value="">Type...</option>
                              {DAMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                           </select>
                           <button type="button" onClick={addDamagePair} style={{fontSize: "0.8em", cursor: "pointer", fontWeight: "bold"}}>+</button>
                        </div>
                        {/* List of Added Damage Pairs */}
                        <div style={{display: "flex", flexWrap: "wrap", gap: "3px"}}>
                          {newItem.damageList.map((pair, idx) => (
                             <span key={idx} style={{background: "#ffebee", color: "#c62828", padding: "2px 6px", borderRadius: "4px", fontSize: "0.8em", border: "1px solid #ffcdd2", display: "flex", alignItems: "center"}}>
                                {pair.dice} {pair.type}
                                <span onClick={() => removeDamagePair(idx)} style={{marginLeft: "4px", cursor: "pointer", fontWeight: "bold"}}>×</span>
                             </span>
                          ))}
                        </div>
                     </div>

                     {/* 3. Properties Manager (Same as before) */}
                     <div style={{display: "flex", flexWrap: "wrap", gap: "3px", maxWidth: "300px"}}>
                        <select value="" onChange={(e) => addTag("properties", e.target.value, "tempProp")} style={{padding: "3px", width: "100px"}}>
                           <option value="" disabled>+ Add Prop</option>
                           {WEAPON_PROPERTIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <div style={{display: "flex"}}>
                           <input placeholder="Custom..." value={newItem.tempProp} onChange={e => setNewItem(prev => ({...prev, tempProp: e.target.value}))} style={{width: "70px", padding: "3px"}} />
                           <button type="button" onClick={() => addTag("properties", newItem.tempProp, "tempProp")} style={{fontSize: "0.8em"}}>+</button>
                        </div>
                        {/* Property Tags */}
                        <div style={{display: "flex", flexWrap: "wrap", gap: "3px"}}>
                          {newItem.properties.map(p => (
                            <span key={p} style={{background: "#e3f2fd", color: "#1565c0", padding: "2px 6px", borderRadius: "4px", fontSize: "0.8em", display: "flex", alignItems: "center", border: "1px solid #bbdefb"}}>
                              {p} <span onClick={() => removeTag("properties", p)} style={{marginLeft: "4px", cursor: "pointer", fontWeight: "bold"}}>×</span>
                            </span>
                          ))}
                        </div>
                     </div>
                   </div>
                )}

                {newItem.type !== "Custom" && <button type="button" onClick={() => setNewItem(prev => ({...prev, isCustom: false, name: ""}))} style={{fontSize: "0.8em"}}>Back</button>}
             </div>
          ) : (
             <>
               {newItem.type === "Weapon" && (
                 <select value={newItem.name} onChange={e => e.target.value === "CUSTOM" ? setNewItem(prev => ({...prev, isCustom: true, name: ""})) : setNewItem(prev => ({ ...prev, name: e.target.value }))} style={{ flex: 1, padding: "5px" }}>
                   <option value="">-- Select Weapon --</option>
                   <optgroup label="Simple Weapons">{SIMPLE_WEAPONS.map(w => <option key={w} value={w}>{w}</option>)}</optgroup>
                   <optgroup label="Martial Weapons">{MARTIAL_WEAPONS.map(w => <option key={w} value={w}>{w}</option>)}</optgroup>
                   <option value="CUSTOM" style={{fontWeight: "bold"}}>+ Custom Weapon...</option>
                 </select>
               )}
               
               {newItem.type === "Armor" && (
                 <select value={newItem.name} onChange={e => e.target.value === "CUSTOM" ? setNewItem(prev => ({...prev, isCustom: true, name: ""})) : setNewItem(prev => ({ ...prev, name: e.target.value }))} style={{ flex: 1, padding: "5px" }}>
                   <option value="">-- Select Armor --</option>
                   {Object.keys(ARMOR_TABLE).filter(a => a !== "None").map(a => <option key={a} value={a}>{a}</option>)}
                   <option value="CUSTOM" style={{fontWeight: "bold"}}>+ Custom Armor...</option>
                 </select>
               )}

               {newItem.type === "Pack" && (
                 <select value={newItem.name} onChange={e => e.target.value === "CUSTOM" ? setNewItem(prev => ({...prev, isCustom: true, name: ""})) : setNewItem(prev => ({ ...prev, name: e.target.value }))} style={{ flex: 1, padding: "5px" }}>
                   <option value="">-- Select Pack --</option>
                   {PACKS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                   <option value="CUSTOM" style={{fontWeight: "bold"}}>+ Custom Pack...</option>
                 </select>
               )}
             </>
          )}

          <button type="button" onClick={handleAddItem} style={{ background: "#4CAF50", color: "white", border: "none", padding: "5px 15px", cursor: "pointer", borderRadius: "4px" }}>Add</button>
        </div>

        {/* INVENTORY LIST (Updated with Equip Button) */}
        <div style={{ background: "#f9f9f9", padding: "10px", borderRadius: "5px", border: "1px solid #eee", minHeight: "50px" }}>
          {formData.inventory.length === 0 ? <span style={{color: "#888", fontStyle: "italic"}}>Inventory is empty...</span> : null}
          
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {formData.inventory.map((item) => {
              // Check if item matches current equipment
              const isEquipped = 
                (formData.equipped_armor === item.name) || 
                (formData.equipped_armor === "Custom" && formData.custom_armor_stats.name === item.name);

              return (
                <li key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #eee" }}>
                  <span>
                    <strong>{item.name}</strong> 
                    <span style={{ fontSize: "0.8em", color: "#666", marginLeft: "5px" }}>({item.type})</span>
                    
                    {/* --- NEW: Display Weapon Stats --- */}
                    {item.stats && item.type === "Weapon" && (
                       <span style={{fontSize: "0.8em", color: "#444", marginLeft: "5px", fontStyle: "italic"}}>
                          — {item.stats.damage} {item.stats.dmgType} {item.stats.properties ? `(${item.stats.properties})` : ""}
                       </span>
                    )}

                    {/* --- NEW: Display Armor Stats --- */}
                    {item.stats && item.type === "Armor" && (
                       <span style={{fontSize: "0.8em", color: "#444", marginLeft: "5px", fontStyle: "italic"}}>
                          — AC {item.stats.base} ({item.stats.type}) {item.stats.stealth_dis ? "[Dis]" : ""}
                       </span>
                    )}

                    {/* Badge */}
                    {isEquipped && <span style={{marginLeft: "10px", fontSize: "0.8em", color: "#2E7D32", fontWeight: "bold", background: "#E8F5E9", padding: "2px 6px", borderRadius: "4px"}}>EQUIPPED</span>}
                  </span>
                  
                  <div>
                    {/* BUTTON: Only show if it's Armor AND NOT equipped */}
                    {item.type === "Armor" && !isEquipped && (
                      <button type="button" onClick={() => handleEquip(item)} style={{ marginRight: "10px", fontSize: "0.8em", cursor: "pointer", background: "#e3f2fd", border: "1px solid #2196F3", color: "#0d47a1", borderRadius: "3px", padding: "2px 8px" }}>
                        Equip
                      </button>
                    )}
                    
                    <button type="button" onClick={() => handleRemoveItem(item.id)} style={{ color: "red", background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}>
                      ✕
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </fieldset>

      <button type="submit" style={{ padding: "10px", backgroundColor: characterToEdit ? "#2196F3" : "#4CAF50", color: "white", border: "none", cursor: "pointer" }}>
        {characterToEdit ? "Save Changes" : "Create Character"}
      </button>
    </form>
  );
}

export default CharacterForm;