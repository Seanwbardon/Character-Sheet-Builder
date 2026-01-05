from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dnd.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Character(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    name = db.Column(db.String(100), nullable=False)
    char_class = db.Column(db.String(50), nullable=False)
    subclass = db.Column(db.String(50), default="")
    race = db.Column(db.String(50), nullable=False)
    background = db.Column(db.String(50), default="")
    alignment = db.Column(db.String(20), default="")
    level = db.Column(db.Integer, default=1)
    xp = db.Column(db.Integer, default=0)

    hp_current = db.Column(db.Integer, default=10)
    hp_max = db.Column(db.Integer, default=10)
    temp_hp = db.Column(db.Integer, default=0)
    ac = db.Column(db.Integer, default=10)
    speed = db.Column(db.Integer, default=30)
    initiative = db.Column(db.Integer, default=0)
    hit_dice_total = db.Column(db.String(10), default="1d8")
    hit_dice_current = db.Column(db.Integer, default=1)
    
    str_score = db.Column(db.Integer, default=10)
    dex_score = db.Column(db.Integer, default=10)
    con_score = db.Column(db.Integer, default=10)
    int_score = db.Column(db.Integer, default=10)
    wis_score = db.Column(db.Integer, default=10)
    cha_score = db.Column(db.Integer, default=10)

    extended_data = db.Column(db.JSON, default={})

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "char_class": self.char_class,
            "subclass": self.subclass,
            "race": self.race,
            "background": self.background,
            "alignment": self.alignment,
            "level": self.level,
            "xp": self.xp,
            
            "hp_current": self.hp_current,
            "hp_max": self.hp_max,
            "temp_hp": self.temp_hp,
            "ac": self.ac,
            "speed": self.speed,
            "initiative": self.initiative,
            "hit_dice_total": self.hit_dice_total,
            "hit_dice_current": self.hit_dice_current,
            
            "stats": {
                "str": self.str_score,
                "dex": self.dex_score,
                "con": self.con_score,
                "int": self.int_score,
                "wis": self.wis_score,
                "cha": self.cha_score
            },
            
            "extended_data": self.extended_data or {}
        }

# --- ROUTES ---

@app.route("/api/characters", methods=["GET"])
def get_characters():
    characters = Character.query.all()
    return jsonify([character.to_json() for character in characters])

@app.route("/api/characters", methods=["POST"])
def create_character():
    data = request.json
    
    stats = data.get("stats", {})
    
    new_char = Character(
        name=data.get("name"),
        char_class=data.get("char_class"),
        subclass=data.get("subclass", ""),
        race=data.get("race"),
        background=data.get("background", ""),
        alignment=data.get("alignment", ""),
        level=data.get("level", 1),
        
        hp_max=data.get("hp_max", 10),
        hp_current=data.get("hp_max", 10), 
        ac=data.get("ac", 10),
        speed=data.get("speed", 30),
        initiative=data.get("initiative", 0),
        
        str_score=stats.get("str", 10),
        dex_score=stats.get("dex", 10),
        con_score=stats.get("con", 10),
        int_score=stats.get("int", 10),
        wis_score=stats.get("wis", 10),
        cha_score=stats.get("cha", 10),
        
        extended_data=data.get("extended_data", {})
    )
    
    db.session.add(new_char)
    db.session.commit()
    return jsonify(new_char.to_json()), 201

@app.route("/api/characters/<int:id>", methods=["PUT"])
def update_character(id):
    character = Character.query.get(id)
    if not character:
        return jsonify({"error": "Character not found"}), 404
        
    data = request.json
    stats = data.get("stats", {})

    # Update Fields
    character.name = data.get("name", character.name)
    character.race = data.get("race", character.race)
    character.char_class = data.get("char_class", character.char_class)
    character.subclass = data.get("subclass", character.subclass)
    character.level = data.get("level", character.level)
    character.background = data.get("background", character.background)
    character.alignment = data.get("alignment", character.alignment)
    
    new_max = data.get("hp_max", character.hp_max)
    character.hp_max = new_max
    if character.hp_current > new_max:
        character.hp_current = new_max
    character.ac = data.get("ac", character.ac)
    character.speed = data.get("speed", character.speed)
    character.initiative = data.get("initiative", character.initiative)
    
    # Update Stats
    character.str_score = stats.get("str", character.str_score)
    character.dex_score = stats.get("dex", character.dex_score)
    character.con_score = stats.get("con", character.con_score)
    character.int_score = stats.get("int", character.int_score)
    character.wis_score = stats.get("wis", character.wis_score)
    character.cha_score = stats.get("cha", character.cha_score)
    
    # Update Flexible Data
    character.extended_data = data.get("extended_data", character.extended_data)
    
    db.session.commit()
    return jsonify(character.to_json()), 200

@app.route("/api/characters/<int:id>", methods=["DELETE"])
def delete_character(id):
    character = Character.query.get(id)
    if character:
        db.session.delete(character)
        db.session.commit()
        return jsonify({"message": "Character deleted"}), 200
    return jsonify({"error": "Character not found"}), 404

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=8080)