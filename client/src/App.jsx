import { useState, useEffect } from "react";
import "./App.css";

// --- CONSTANTS ---
const STATS_ORDER = ["str", "dex", "con", "int", "wis", "cha"];

const SKILL_LIST = [
  "Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", 
  "History", "Insight", "Intimidation", "Investigation", "Medicine", 
  "Nature", "Perception", "Performance", "Persuasion", "Religion", 
  "Sleight of Hand", "Stealth", "Survival"
];

const RACES = ["Human", "Elf", "Dwarf", "Halfling", "Dragonborn", "Gnome", "Half-Elf", "Half-Orc", "Tiefling", "Golliath", "Aasimar", "Other"];
const CLASSES = ["Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"];
const BACKGROUNDS = ["Acolyte", "Charlatan", "Criminal", "Entertainer", "Folk Hero", "Guild Artisan", "Hermit", "Noble", "Outlander", "Sage", "Sailor", "Soldier", "Urchin", "Other"];
const ALIGNMENTS = ["Lawful Good", "Neutral Good", "Chaotic Good", "Lawful Neutral", "True Neutral", "Chaotic Neutral", "Lawful Evil", "Neutral Evil", "Chaotic Evil"];

function App() {
  const [characters, setCharacters] = useState([]);
  
  // --- FORM STATE ---
  const [editingId, setEditingId] = useState(null); // NULL = Create Mode, ID = Edit Mode
  
  const [name, setName] = useState("");
  const [charClass, setCharClass] = useState(CLASSES[0]);
  const [level, setLevel] = useState(1);
  const [species, setSpecies] = useState(RACES[0]);
  const [background, setBackground] = useState(BACKGROUNDS[0]);
  const [alignment, setAlignment] = useState(ALIGNMENTS[4]); 
  const [stats, setStats] = useState({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [weaponInput, setWeaponInput] = useState(""); 

  useEffect(() => { fetchCharacters(); }, []);

  const fetchCharacters = async () => {
    const response = await fetch("http://localhost:8080/api/characters");
    const data = await response.json();
    setCharacters(data.characters);
  };

  // --- EDIT MODE LOGIC ---
  const startEditing = (char) => {
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
    setEditingId(char.id); // Set the ID so we know we are editing
    
    // Populate form with character data
    setName(char.name);
    setCharClass(char.class);
    setLevel(char.level);
    setSpecies(char.species);
    setBackground(char.background);
    setAlignment(char.alignment);
    setStats(char.stats);
    setSelectedSkills(char.skills);
    setWeaponInput(char.weapons.join(", "));
  };

  const cancelEdit = () => {
    setEditingId(null); // Return to Create Mode
    setName("");
    setWeaponInput("");
    setStats({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
    setSelectedSkills([]);
    // Reset defaults
    setCharClass(CLASSES[0]);
    setLevel(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const weaponList = weaponInput.split(',').map(w => w.trim()).filter(w => w);

    const characterData = { 
      name, class: charClass, level, species, background, alignment,
      stats, skills: selectedSkills, weapons: weaponList
    };

    let url = "http://localhost:8080/api/characters";
    let method = "POST";

    // IF WE ARE EDITING, CHANGE URL AND METHOD
    if (editingId) {
      url = `http://localhost:8080/api/characters/${editingId}`;
      method = "PATCH";
    }

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(characterData),
    });

    if (response.ok) {
      fetchCharacters();
      alert(editingId ? "Character Updated!" : "Character Created!");
      cancelEdit(); // Reset form
    } else {
      alert("Error saving character");
    }
  };

  // --- STANDARD HELPERS ---
  const deleteCharacter = async (id) => {
    if (!window.confirm("Delete this character?")) return;
    const response = await fetch(`http://localhost:8080/api/characters/${id}`, { method: "DELETE" });
    if (response.ok) fetchCharacters();
  };

  const levelUp = async (id, currentLevel) => {
    const response = await fetch(`http://localhost:8080/api/characters/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level: currentLevel + 1 }),
    });
    if (response.ok) fetchCharacters();
  };

  const handleStatChange = (stat, value) => {
    setStats(prev => ({ ...prev, [stat]: parseInt(value) || 0 }));
  };
  const toggleSkill = (skill) => {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  return (
    <div className="App">
      <h1>D&D Character Vault</h1>
      
      <div className="card">
        {/* DYNAMIC HEADER */}
        <h2>{editingId ? "Edit Character" : "Create Character"}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="row">
            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
            <select value={charClass} onChange={e => setCharClass(e.target.value)}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" placeholder="Lvl" value={level} onChange={e => setLevel(e.target.value)} min="1" style={{width: "60px"}} />
          </div>

          <div className="row" style={{ marginTop: "10px" }}>
            <select value={species} onChange={e => setSpecies(e.target.value)}>
              {RACES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={background} onChange={e => setBackground(e.target.value)}>
              {BACKGROUNDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select value={alignment} onChange={e => setAlignment(e.target.value)}>
              {ALIGNMENTS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="stats-grid">
            {STATS_ORDER.map(key => (
                <div key={key} className="stat-box">
                <label>{key.toUpperCase()}</label>
                <input type="number" value={stats[key]} onChange={e => handleStatChange(key, e.target.value)} />
              </div>
            ))}
          </div>

          <h3>Skills</h3>
          <div className="skills-grid">
            {SKILL_LIST.map(skill => (
              <label key={skill} className="skill-item">
                <input type="checkbox" checked={selectedSkills.includes(skill)} onChange={() => toggleSkill(skill)} />
                {skill}
              </label>
            ))}
          </div>

          <h3>Weapons</h3>
          <input placeholder="E.g. Longsword, Shortbow" value={weaponInput} onChange={e => setWeaponInput(e.target.value)} style={{width: "100%"}} />
          
          <div style={{marginTop: "20px"}}>
             {/* DYNAMIC BUTTONS */}
             {editingId ? (
                <>
                    <button type="submit" style={{backgroundColor: "#4CAF50", marginRight: "10px"}}>Update Character</button>
                    <button type="button" onClick={cancelEdit} style={{backgroundColor: "#777"}}>Cancel</button>
                </>
             ) : (
                <button type="submit">Save Character</button>
             )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Party Roster</h2>
        {characters.map(char => (
          <div key={char.id} className="char-display" style={{borderBottom: "1px solid #444", padding: "10px", textAlign: "left", position: "relative"}}>
            
            <div style={{ float: "right" }}>
                {/* EDIT BUTTON */}
                <button onClick={() => startEditing(char)} style={{ marginRight: "5px", padding: "5px 10px", backgroundColor: "#ff9800" }}>
                    ✏️ Edit
                </button>
                
                <button onClick={() => levelUp(char.id, char.level)} style={{ marginRight: "5px", padding: "5px 10px" }}>
                    ⬆️ Lvl Up
                </button>
                <button onClick={() => deleteCharacter(char.id)} style={{ backgroundColor: "#ff4444", padding: "5px 10px" }}>
                    ❌
                </button>
            </div>

            <h3>{char.name}</h3>
            <p>
              <strong>{char.species} {char.class}</strong> (Lvl {char.level}) <br/>
              <em>{char.alignment} {char.background}</em>
            </p>
            <p><strong>Stats:</strong> STR:{char.stats.str} | DEX:{char.stats.dex} | CON:{char.stats.con} | INT:{char.stats.int} | WIS:{char.stats.wis} | CHA:{char.stats.cha}</p>
            <p><strong>Skills:</strong> {char.skills.join(", ")}</p>
            <p><strong>Weapons:</strong> {char.weapons.join(", ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;