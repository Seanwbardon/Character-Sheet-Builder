from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Character 
import json

app = Flask(__name__)
CORS(app, origins="*")

# --- DATABASE CONFIGURATION ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dnd.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
with app.app_context():
    db.create_all()

# --- ROUTES ---
@app.route('/api/characters', methods=['GET'])
def get_characters():
    characters = Character.query.all()
    return jsonify({"characters": [char.to_json() for char in characters]})

@app.route('/api/characters', methods=['POST'])
def create_character():
    data = request.json
    stats = data.get('stats', {})

    new_char = Character(
        name=data.get('name'),
        char_class=data.get('class'),
        level=data.get('level', 1),
        species=data.get('species', 'Unknown'),
        background=data.get('background', 'Commoner'),
        alignment=data.get('alignment', 'Neutral'),
        strength=stats.get('str', 10),
        dexterity=stats.get('dex', 10),
        constitution=stats.get('con', 10),
        intelligence=stats.get('int', 10),
        wisdom=stats.get('wis', 10),
        charisma=stats.get('cha', 10),
        skills_data=json.dumps(data.get('skills', [])),
        weapons_data=json.dumps(data.get('weapons', []))
    )
    
    try:
        db.session.add(new_char)
        db.session.commit()
        return jsonify({"message": "Character created!"}), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 400
    
@app.route('/api/characters/<int:id>', methods=['DELETE'])
def delete_character(id):
    character = Character.query.get(id)
    
    if not character:
        return jsonify({"message": "Character not found"}), 404
    
    try:
        db.session.delete(character)
        db.session.commit()
        return jsonify({"message": "Character deleted!"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@app.route('/api/characters/<int:id>', methods=['PATCH'])
def update_character(id):
    character = Character.query.get(id)
    
    if not character:
        return jsonify({"message": "Character not found"}), 404
    
    data = request.json
    stats = data.get('stats', {})

    # Update basic fields if they exist in the request
    character.name = data.get('name', character.name)
    character.char_class = data.get('class', character.char_class)
    character.level = data.get('level', character.level)
    character.species = data.get('species', character.species)
    character.background = data.get('background', character.background)
    character.alignment = data.get('alignment', character.alignment)

    # Update Stats (only if 'stats' dictionary was sent)
    if stats:
        character.strength = stats.get('str', character.strength)
        character.dexterity = stats.get('dex', character.dexterity)
        character.constitution = stats.get('con', character.constitution)
        character.intelligence = stats.get('int', character.intelligence)
        character.wisdom = stats.get('wis', character.wisdom)
        character.charisma = stats.get('cha', character.charisma)

    # Update Lists (Convert back to JSON string)
    if 'skills' in data:
        character.skills_data = json.dumps(data['skills'])
    if 'weapons' in data:
        character.weapons_data = json.dumps(data['weapons'])

    try:
        db.session.commit()
        return jsonify({"message": "Character updated!"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=8080)