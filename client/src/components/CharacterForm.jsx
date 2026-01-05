import { useState, useEffect } from "react";

// --- CONSTANTS ---
const RACES = ["Human", "Elf", "Dwarf", "Halfling", "Orc", "Tiefling", "Gnome", "Dragonborn", "Goliath", "Aasimar"];
const CLASSES = ["Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"];

// Checkbox Options
const ARMOR_OPTIONS = ["Light Armor", "Medium Armor", "Heavy Armor", "Shields"];
const WEAPON_OPTIONS = ["Simple Weapons", "Martial Weapons"];
const LANGUAGE_OPTIONS = ["Common", "Dwarvish", "Elvish", "Giant", "Gnomish", "Goblin", "Halfling", "Orc", "Abyssal", "Celestial", "Draconic", "Infernal", "Primordial", "Sylvan", "Undercommon"];

const SKILLS_LIST = [
  "Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", 
  "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", 
  "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"
];

const TOOLS_LIST = [
  "Thieves' Tools", "Herbalism Kit", "Disguise Kit", "Poisoner's Kit", "Navigator's Tools",
  "Alchemist's Supplies", "Brewer's Supplies", "Calligrapher's Supplies", "Carpenter's Tools", 
  "Cobbler's Tools", "Cook's Utensils", "Glassblower's Tools", "Jeweler's Tools", 
  "Leatherworker's Tools", "Mason's Tools", "Painter's Supplies", "Potter's Tools", 
  "Smith's Tools", "Tinker's Tools", "Weaver's Tools", "Woodcarver's Tools",
  "Dice Set", "Playing Card Set", "Bagpipes", "Drum", "Flute", "Lute", "Lyre", "Horn", "Viol"
];

function CharacterForm({ onCharacterSaved, characterToEdit, onCancelEdit }) {
  // Main State
  const [formData, setFormData] = useState({
    name: "", race: "", char_class: "", subclass: "", level: 1, 
    background: "", alignment: "", hp_max: 10, ac: 10, speed: 30, initiative: 0,
    str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
    
    // Checkbox Objects
    armor_prof: {},
    weapon_prof: {},
    languages: {},
    tools_prof: {},
    skill_prof: {},
    
    // Custom Text Inputs
    custom_armor: "",
    custom_weapon: "",
    custom_language: "",
    custom_skills: "", // NEW
    custom_tools: ""   // NEW
  });

  const [isCustomRace, setIsCustomRace] = useState(false);
  const [isCustomClass, setIsCustomClass] = useState(false);

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
        str: characterToEdit.stats.str,
        dex: characterToEdit.stats.dex,
        con: characterToEdit.stats.con,
        int: characterToEdit.stats.int,
        wis: characterToEdit.stats.wis,
        cha: characterToEdit.stats.cha,

        // Load Checkboxes safely
        armor_prof: ext.armor_prof || {},
        weapon_prof: ext.weapon_prof || {},
        languages: ext.languages || {},
        tools_prof: ext.tools_prof || {},
        skill_prof: ext.skill_prof || {},
        
        // Load Custom Strings
        custom_armor: ext.custom_armor || "",
        custom_weapon: ext.custom_weapon || "",
        custom_language: ext.custom_language || "",
        custom_skills: ext.custom_skills || "", // NEW
        custom_tools: ext.custom_tools || ""    // NEW
      });

      setIsCustomRace(!RACES.includes(characterToEdit.race) && characterToEdit.race !== "");
      setIsCustomClass(!CLASSES.includes(characterToEdit.char_class) && characterToEdit.char_class !== "");
    } else {
      // Reset
      setFormData({
        name: "", race: "", char_class: "", subclass: "", level: 1, 
        background: "", alignment: "", hp_max: 10, ac: 10, speed: 30, initiative: 0,
        str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
        armor_prof: {}, weapon_prof: {}, languages: {}, tools_prof: {}, skill_prof: {},
        custom_armor: "", custom_weapon: "", custom_language: "", custom_skills: "", custom_tools: ""
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
        
        custom_armor: formData.custom_armor,
        custom_weapon: formData.custom_weapon,
        custom_language: formData.custom_language,
        custom_skills: formData.custom_skills, // NEW
        custom_tools: formData.custom_tools     // NEW
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
              <select name="char_class" value={CLASSES.includes(formData.char_class) ? formData.char_class : ""} onChange={(e) => handleDropdownChange(e, "char_class", setIsCustomClass)} required>
                <option value="" disabled>Select Class</option>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
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
        </div>
      </fieldset>

      {/* --- STATS --- */}
      <fieldset style={{ padding: "1rem", border: "1px solid #ccc" }}>
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

      {/* --- PROFICIENCIES --- */}
      <fieldset style={{ padding: "1rem", border: "1px solid #ccc" }}>
        <legend><strong>Proficiencies</strong></legend>
        
        {/* ARMOR CHECKBOXES */}
        <label><strong>Armor:</strong></label>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "5px" }}>
            {ARMOR_OPTIONS.map(opt => (
                <label key={opt} style={{fontSize: "0.9em"}}><input type="checkbox" name={opt} checked={!!formData.armor_prof[opt]} onChange={(e) => handleCheckboxChange(e, "armor_prof")} /> {opt}</label>
            ))}
        </div>
        <input name="custom_armor" placeholder="Other Armor (Custom)" value={formData.custom_armor} onChange={handleChange} style={{width: "100%", marginBottom: "15px"}} />

        {/* WEAPON CHECKBOXES */}
        <label><strong>Weapons:</strong></label>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "5px" }}>
            {WEAPON_OPTIONS.map(opt => (
                <label key={opt} style={{fontSize: "0.9em"}}><input type="checkbox" name={opt} checked={!!formData.weapon_prof[opt]} onChange={(e) => handleCheckboxChange(e, "weapon_prof")} /> {opt}</label>
            ))}
        </div>
        <input name="custom_weapon" placeholder="Other Weapons (Custom)" value={formData.custom_weapon} onChange={handleChange} style={{width: "100%", marginBottom: "15px"}} />

        {/* LANGUAGES CHECKBOXES */}
        <label><strong>Languages:</strong></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px", marginBottom: "5px", fontSize: "0.9em" }}>
            {LANGUAGE_OPTIONS.map(opt => (
                <label key={opt}><input type="checkbox" name={opt} checked={!!formData.languages[opt]} onChange={(e) => handleCheckboxChange(e, "languages")} /> {opt}</label>
            ))}
        </div>
        <input name="custom_language" placeholder="Other Languages (Custom)" value={formData.custom_language} onChange={handleChange} style={{width: "100%", marginBottom: "15px"}} />

        {/* SKILLS */}
        <div style={{borderTop: "1px solid #eee", paddingTop: "10px"}}>
            <label><strong>Skills:</strong></label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", fontSize: "0.9em", marginTop: "5px", marginBottom: "5px" }}>
                {SKILLS_LIST.map(skill => (
                    <label key={skill}><input type="checkbox" name={skill} checked={!!formData.skill_prof[skill]} onChange={(e) => handleCheckboxChange(e, "skill_prof")} /> {skill}</label>
                ))}
            </div>
            {/* NEW CUSTOM SKILL INPUT */}
            <input name="custom_skills" placeholder="Other Skills (Custom)" value={formData.custom_skills} onChange={handleChange} style={{width: "100%", marginBottom: "15px"}} />
        </div>

        {/* TOOLS */}
        <div style={{marginTop: "15px"}}>
            <label><strong>Tools:</strong></label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", fontSize: "0.9em", maxHeight: "150px", overflowY: "auto", border: "1px solid #eee", padding: "5px", marginBottom: "5px" }}>
                {TOOLS_LIST.map(tool => (
                    <label key={tool}><input type="checkbox" name={tool} checked={!!formData.tools_prof[tool]} onChange={(e) => handleCheckboxChange(e, "tools_prof")} /> {tool}</label>
                ))}
            </div>
            {/* NEW CUSTOM TOOL INPUT */}
            <input name="custom_tools" placeholder="Other Tools (Custom)" value={formData.custom_tools} onChange={handleChange} style={{width: "100%"}} />
        </div>
      </fieldset>

      <button type="submit" style={{ padding: "10px", backgroundColor: characterToEdit ? "#2196F3" : "#4CAF50", color: "white", border: "none", cursor: "pointer" }}>
        {characterToEdit ? "Save Changes" : "Create Character"}
      </button>
    </form>
  );
}

export default CharacterForm;