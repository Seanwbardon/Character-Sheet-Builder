import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Loading...");
  const [people, setPeople] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/home")
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
        setPeople(data.people);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return (
    <div>
      <h1>D&D Character Builder</h1>
      
      {}
      <p>Server says: <strong>{message}</strong></p>

      {}
      <h3>Party Members:</h3>
      <ul>
        {people.map((person, index) => (
          <li key={index}>{person}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;