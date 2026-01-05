import { useState, useEffect } from 'react';
import './App.css';
import CharacterForm from './components/CharacterForm';

function App() {
  const [characters, setCharacters] = useState([]);
  const [characterToEdit, setCharacterToEdit] = useState(null);

  const fetchCharacters = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/characters");
      const data = await response.json();
      setCharacters(data);
    } catch (error) { console.error("Error:", error); }
  };

  useEffect(() => { fetchCharacters(); }, []);

  // --- ACTIONS ---

  const handleSave = () => {
    fetchCharacters();
    setCharacterToEdit(null);
  };

  const handleDelete = async (id) => {
    if(!confirm("Are you sure?")) return;
    await fetch(`http://localhost:8080/api/characters/${id}`, { method: "DELETE" });
    fetchCharacters();
  };

  // NEW: A dedicated Level Up Handler
  const handleLevelUp = async (char) => {
    // PROOF OF CONCEPT LOGIC:
    // Increase Level by 1
    // Increase HP Max by CON modifier (approx) or fixed amount (e.g., 5)
    const newLevel = char.level + 1;
    const hpIncrease = 5 + Math.floor((char.stats.con - 10) / 2); // Simple 5e Math
    
    const payload = {
      ...char, // Keep existing data
      level: newLevel,
      hp_max: char.hp_max + hpIncrease,
      hp_current: char.hp_current + hpIncrease
    };

    // Send the update to the backend
    await fetch(`http://localhost:8080/api/characters/${char.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    fetchCharacters(); // Refresh the screen
    alert(`${char.name} reached Level ${newLevel}! (+${hpIncrease} HP)`);
  };

  return (
    <div className="app-container" style={{ padding: "20px", fontFamily: "Arial", display: "flex", gap: "40px", justifyContent: "center", alignItems: "flex-start" }}>
      
      {/* LEFT: Form Section */}
      <div style={{ flex: "0 0 400px" }}> 
        <CharacterForm 
          onCharacterSaved={handleSave} 
          characterToEdit={characterToEdit} 
          onCancelEdit={() => setCharacterToEdit(null)}
        />
      </div>

      {/* RIGHT: Roster Section */}
      <div style={{ flex: "1", maxWidth: "800px" }}>
        <h2 style={{marginTop: 0}}>Party Roster ({characters.length})</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          
          {characters.map((char) => (
            <div key={char.id} style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "8px", background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <h3 style={{ margin: "0", color: "#333" }}>{char.name}</h3>
                <span style={{background: "#eee", padding: "2px 8px", borderRadius: "10px", fontSize: "0.8em"}}>Lvl {char.level}</span>
              </div>
              
              <p style={{ margin: "5px 0", color: "#666", fontSize: "0.9em", fontStyle: "italic" }}>
                {char.race} {char.char_class}
              </p>
              
              <div style={{ display: "flex", gap: "15px", margin: "15px 0", fontSize: "0.9em", fontWeight: "bold", background: "#f5f5f5", padding: "10px", borderRadius: "5px" }}>
                <span style={{color: "#d32f2f"}}>❤️ {char.hp_current}/{char.hp_max}</span>
                <span style={{color: "#1976d2"}}>🛡️ {char.ac} AC</span>
                <span style={{color: "#388e3c"}}>💨 {char.speed}</span>
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {/* 1. Edit Button (Loads Form) */}
                <button 
                  onClick={() => setCharacterToEdit(char)}
                  style={{ padding: "8px", background: "#2196F3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                  Edit
                </button>

                {/* 2. Level Up Button (Instant Action) */}
                <button 
                  onClick={() => handleLevelUp(char)}
                  style={{ padding: "8px", background: "#FF9800", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                  Level Up! ⬆
                </button>
              </div>
              
              <button 
                  onClick={() => handleDelete(char.id)}
                  style={{ width: "100%", marginTop: "10px", padding: "5px", background: "transparent", color: "#ef5350", border: "1px solid #ef5350", borderRadius: "4px", cursor: "pointer" }}
                >
                  Delete Character
              </button>

            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

export default App;