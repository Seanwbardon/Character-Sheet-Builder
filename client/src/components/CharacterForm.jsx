import { useState, useEffect } from "react";

// --- DATA CONSTANTS ---
const RACES = ["Human", "Elf", "Dwarf", "Halfling", "Orc", "Tiefling", "Gnome", "Dragonborn", "Goliath", "Aasimar", "Warforged", "Genasi"];

// Map Classes to their Hit Die size
const CLASS_DATA = {
  "Artificer": { hit_die: "d8" },
  "Barbarian": { hit_die: "d12" },
  "Bard": { hit_die: "d8" },
  "Cleric": { hit_die: "d8" },
  "Druid": { hit_die: "d8" },
  "Fighter": { hit_die: "d10" },
  "Monk": { hit_die: "d8" },
  "Paladin": { hit_die: "d10" },
  "Psion": { hit_die: "d6" },
  "Ranger": { hit_die: "d10" },
  "Rogue": { hit_die: "d8" },
  "Sorcerer": { hit_die: "d6" },
  "Warlock": { hit_die: "d8" },
  "Wizard": { hit_die: "d6" }
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

function CharacterForm({ onCharacterSaved, characterToEdit, onCancelEdit }) {
  // Main State
  const [formData, setFormData] = useState({
    name: "", race: "", char_class: "", subclass: "", level: 1, 
    background: "", alignment: "", hp_max: 10, ac: 10, speed: 30, initiative: 0,
    hit_dice_total: "1d8",
    str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
    
    armor_prof: {}, weapon_prof: {}, languages: {}, tools_prof: {}, skill_prof: {},
    feats: [], 
    class_features: [], // AUTO-GENERATED LIST
    species_features: [], // NEW AUTO-GENERATED LIST

    custom_armor: "", custom_weapon: "", custom_language: "", custom_skills: "", custom_tools: "", custom_features: ""
  });

  const [isCustomRace, setIsCustomRace] = useState(false);
  const [isCustomClass, setIsCustomClass] = useState(false);

  // --- AUTOMATION: Hit Dice ---
  useEffect(() => {
    if (CLASS_DATA[formData.char_class]) {
      const die = CLASS_DATA[formData.char_class].hit_die;
      setFormData(prev => ({ ...prev, hit_dice_total: `${formData.level}${die}` }));
    }
  }, [formData.char_class, formData.level]);

  // --- AUTOMATION: Class Features ---
  useEffect(() => {
    if (CLASS_FEATURES[formData.char_class]) {
      let activeFeatures = [];
      for (let i = 1; i <= formData.level; i++) {
        const featsAtLevel = CLASS_FEATURES[formData.char_class][i];
        if (featsAtLevel) activeFeatures = [...activeFeatures, ...featsAtLevel];
      }
      setFormData(prev => ({ ...prev, class_features: activeFeatures }));
    } else {
      setFormData(prev => ({ ...prev, class_features: [] }));
    }
  }, [formData.char_class, formData.level]);

  // --- AUTOMATION: Species Features (NEW) ---
  useEffect(() => {
    if (SPECIES_FEATURES[formData.race]) {
      setFormData(prev => ({ ...prev, species_features: SPECIES_FEATURES[formData.race] }));
    } else {
      setFormData(prev => ({ ...prev, species_features: [] }));
    }
  }, [formData.race]);


  // --- LOAD DATA ---
  useEffect(() => {
    if (characterToEdit) {
      const ext = characterToEdit.extended_data || {};
      
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
        species_features: ext.species_features || [], // Load saved species features

        custom_armor: ext.custom_armor || "",
        custom_weapon: ext.custom_weapon || "",
        custom_language: ext.custom_language || "",
        custom_skills: ext.custom_skills || "", 
        custom_tools: ext.custom_tools || "",
        custom_features: ext.custom_features || ""
      });

      setIsCustomRace(!RACES.includes(characterToEdit.race) && characterToEdit.race !== "");
      setIsCustomClass(!Object.keys(CLASS_DATA).includes(characterToEdit.char_class) && characterToEdit.char_class !== "");
    } else {
      setFormData({
        name: "", race: "", char_class: "", subclass: "", level: 1, 
        background: "", alignment: "", hp_max: 10, ac: 10, speed: 30, initiative: 0, hit_dice_total: "1d8",
        str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
        armor_prof: {}, weapon_prof: {}, languages: {}, tools_prof: {}, skill_prof: {}, feats: [], class_features: [], species_features: [],
        custom_armor: "", custom_weapon: "", custom_language: "", custom_skills: "", custom_tools: "", custom_features: ""
      });
      setIsCustomRace(false);
      setIsCustomClass(false);
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
        species_features: formData.species_features, // SAVE SPECIES FEATURES
        
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
            
            {/* Race */}
            {isCustomRace ? (
               <div style={{display: "flex", gap: "5px"}}>
                 <input name="race" placeholder="Type Species..." value={formData.race} onChange={handleChange} autoFocus required style={{flex: 1}}/>
                 <button type="button" onClick={() => setIsCustomRace(false)}>Back</button>
               </div>
            ) : (
              <select name="race" value={RACES.includes(formData.race) ? formData.race : ""} onChange={(e) => handleDropdownChange(e, "race", setIsCustomRace)} required>
                <option value="" disabled>Select Species</option>
                {RACES.map(r => <option key={r} value={r}>{r}</option>)}
                <option value="CUSTOM_OPTION" style={{fontWeight: "bold"}}>+ Enter Custom...</option>
              </select>
            )}

            {/* Class */}
            {isCustomClass ? (
               <div style={{display: "flex", gap: "5px"}}>
                 <input name="char_class" placeholder="Type Class..." value={formData.char_class} onChange={handleChange} autoFocus required style={{flex: 1}}/>
                 <button type="button" onClick={() => setIsCustomClass(false)}>Back</button>
               </div>
            ) : (
              <select name="char_class" value={Object.keys(CLASS_DATA).includes(formData.char_class) ? formData.char_class : ""} onChange={(e) => handleDropdownChange(e, "char_class", setIsCustomClass)} required>
                <option value="" disabled>Select Class</option>
                {Object.keys(CLASS_DATA).map(c => <option key={c} value={c}>{c}</option>)}
                <option value="CUSTOM_OPTION" style={{fontWeight: "bold"}}>+ Enter Custom...</option>
              </select>
            )}

            <input name="subclass" placeholder="Subclass" value={formData.subclass} onChange={handleChange} />
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