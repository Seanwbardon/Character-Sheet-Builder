import { useState, useEffect } from "react";

// --- DATA CONSTANTS ---
const RACES = ["Human", "Elf", "Dwarf", "Halfling", "Orc", "Tiefling", "Gnome", "Dragonborn", "Goliath", "Aasimar", "Warforged", "Genasi"];

// Map Classes to their Hit Die size
const CLASS_DATA = {
  "Artificer": { hit_die: "d8", caster_type: "half_up" }, 
  "Barbarian": { hit_die: "d12", caster_type: "none" },
  "Bard": { hit_die: "d8", caster_type: "full" },
  "Cleric": { hit_die: "d8", caster_type: "full" },
  "Druid": { hit_die: "d8", caster_type: "full" },
  "Fighter": { hit_die: "d10", caster_type: "none" },
  "Monk": { hit_die: "d8", caster_type: "none" },
  "Paladin": { hit_die: "d10", caster_type: "half" },
  "Psion": { hit_die: "d6", caster_type: "psion" }, 
  "Ranger": { hit_die: "d10", caster_type: "half" },
  "Rogue": { hit_die: "d8", caster_type: "none" },
  "Sorcerer": { hit_die: "d6", caster_type: "full" },
  "Warlock": { hit_die: "d8", caster_type: "pact" },
  "Wizard": { hit_die: "d6", caster_type: "full" }
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
    background: "", alignment: "", hp_max: 10, ac: 10, speed: 30, initiative: 0, hit_dice_total: "1d8",
    proficiency_bonus: 2, 
    
    // Stats
    str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
    
    // Proficiencies & Features
    armor_prof: {}, weapon_prof: {}, languages: {}, tools_prof: {}, skill_prof: {},
    feats: [], class_features: [], species_features: [], subclass_features: [],

    // --- NEW SPELLCASTING ENGINE ---
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

  // Caster Type: Check Subclass first ("third"), then Class ("full"/"half"), otherwise "none"
  const casterType = subSpellData ? subSpellData.type : (classData?.caster_type || "none");
  const isCaster = casterType !== "none";

  // Casting Stat: Check Subclass first, then Class, default to Int
  const castingStat = subSpellData ? subSpellData.ability : (SPELL_ABILITY[formData.char_class] || "int");

  // Spell List Source: Eldritch Knights use "Wizard" list, etc.
  const spellListSource = subSpellData ? subSpellData.list : formData.char_class;

  // --- AUTOMATION: Hit Dice ---
  useEffect(() => {
    if (CLASS_DATA[formData.char_class]) {
      const die = CLASS_DATA[formData.char_class].hit_die;
      setFormData(prev => ({ ...prev, hit_dice_total: `${formData.level}${die}` }));
    }
  }, [formData.char_class, formData.level]);

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

  // --- AUTOMATION: Subclass Features ---
  useEffect(() => {
    let activeSubFeats = [];
    if (SUBCLASS_FEATURES[formData.subclass]) {
      for (let i = 1; i <= formData.level; i++) {
        if (SUBCLASS_FEATURES[formData.subclass][i]) {
          activeSubFeats = [...activeSubFeats, ...SUBCLASS_FEATURES[formData.subclass][i]];
        }
      }
    }
    setFormData(prev => ({ ...prev, subclass_features: activeSubFeats }));
  }, [formData.subclass, formData.level]);


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

        feats: ext.feats || [],
        class_features: ext.class_features || [], 
        species_features: ext.species_features || [],
        subclass_features: ext.subclass_features || [],

        // NEW SPELL DATA
        spells: loadedSpells,
        slots: loadedSlots,
        spell_save_dc: 0, 
        spell_attack_mod: 0,

        custom_armor: ext.custom_armor || "",
        custom_weapon: ext.custom_weapon || "",
        custom_language: ext.custom_language || "",
        custom_skills: ext.custom_skills || "", 
        custom_tools: ext.custom_tools || "",
        custom_features: ext.custom_features || ""
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
        feats: [], class_features: [], species_features: [], subclass_features: [],

        spell_save_dc: 0, spell_attack_mod: 0,
        spells: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] },
        slots: {
          1: {max: 0, curr: 0}, 2: {max: 0, curr: 0}, 3: {max: 0, curr: 0},
          4: {max: 0, curr: 0}, 5: {max: 0, curr: 0}, 6: {max: 0, curr: 0},
          7: {max: 0, curr: 0}, 8: {max: 0, curr: 0}, 9: {max: 0, curr: 0}
        },

        custom_armor: "", custom_weapon: "", custom_language: "", custom_skills: "", custom_tools: "", custom_features: ""
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
        
        // --- NEW SPELL DATA ---
        spells: formData.spells, // Saves the arrays for Levels 0-9
        slots: formData.slots,   // Saves the slot tracking for Levels 1-9
        // ----------------------

        custom_armor: formData.custom_armor,
        custom_weapon: formData.custom_weapon,
        custom_language: formData.custom_language,
        custom_skills: formData.custom_skills, 
        custom_tools: formData.custom_tools,
        custom_features: formData.custom_features 
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
            
            {/* Race Select (Existing Logic) */}
            {isCustomRace ? (
               <div style={{display: "flex", gap: "5px"}}><input name="race" placeholder="Species..." value={formData.race} onChange={handleChange} autoFocus required style={{flex: 1}}/><button type="button" onClick={() => setIsCustomRace(false)}>Back</button></div>
            ) : (
              <select name="race" value={RACES.includes(formData.race) ? formData.race : ""} onChange={(e) => handleDropdownChange(e, "race", setIsCustomRace)} required><option value="" disabled>Species</option>{RACES.map(r => <option key={r} value={r}>{r}</option>)}<option value="CUSTOM_OPTION">+ Custom...</option></select>
            )}

            {/* Class Select (Updates to reset subclass on change) */}
            {isCustomClass ? (
               <div style={{display: "flex", gap: "5px"}}><input name="char_class" placeholder="Class..." value={formData.char_class} onChange={handleChange} autoFocus required style={{flex: 1}}/><button type="button" onClick={() => setIsCustomClass(false)}>Back</button></div>
            ) : (
              <select name="char_class" value={Object.keys(CLASS_DATA).includes(formData.char_class) ? formData.char_class : ""} onChange={(e) => handleDropdownChange(e, "char_class", setIsCustomClass)} required>
                <option value="" disabled>Class</option>
                {Object.keys(CLASS_DATA).map(c => <option key={c} value={c}>{c}</option>)}
                <option value="CUSTOM_OPTION">+ Custom...</option>
              </select>
            )}

            {/* NEW: Subclass Select */}
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

            <label>Level: <input type="number" name="level" value={formData.level} onChange={handleChange} min="1" max="20" style={{width: "60px"}} /></label>
        </div>
      </fieldset>

      {/* --- VITALS --- */}
      <fieldset style={{ padding: "1rem", border: "1px solid #ccc" }}>
        <legend><strong>Vitals</strong></legend>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <label>HP: <input type="number" name="hp_max" value={formData.hp_max} onChange={handleChange} style={{width: "50px"}} /></label>
            <label>AC: <input type="number" name="ac" value={formData.ac} onChange={handleChange} style={{width: "50px"}} /></label>
            <label>Spd: <input type="number" name="speed" value={formData.speed} onChange={handleChange} style={{width: "50px"}} /></label>
            <label>Init: <input type="number" name="initiative" value={formData.initiative} onChange={handleChange} style={{width: "50px"}} /></label>
            <label>HD: <input name="hit_dice_total" value={formData.hit_dice_total} readOnly style={{width: "60px", background: "#f0f0f0", textAlign: "center"}} /></label>
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

      <button type="submit" style={{ padding: "10px", backgroundColor: characterToEdit ? "#2196F3" : "#4CAF50", color: "white", border: "none", cursor: "pointer" }}>
        {characterToEdit ? "Save Changes" : "Create Character"}
      </button>
    </form>
  );
}

export default CharacterForm;