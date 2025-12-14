from flask_sqlalchemy import SQLAlchemy
import json

db = SQLAlchemy()

class Character(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    char_class = db.Column(db.String(50), nullable=False)
    char_subclass = db.Column(db.String(50))
    species = db.Column(db.String(50), nullable=False)
    level = db.Column(db.Integer, default=1)
    proficiency = db.Column(db.Integer, default=2)
    background = db.Column(db.String(50), nullable=False)
    alignment = db.Column(db.String(30), nullable=False)

    strength = db.Column(db.Integer, default=10)
    dexterity = db.Column(db.Integer, default=10)
    constitution = db.Column(db.Integer, default=10)
    intelligence = db.Column(db.Integer, default=10)
    wisdom = db.Column(db.Integer, default=10)
    charisma = db.Column(db.Integer, default=10)

    skills_data = db.Column(db.String(1000), default="[]")
    weapons_data = db.Column(db.String(1000), default="[]")

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "class": self.char_class,
            "level": self.level,
            "species": getattr(self, 'species', ''), 
            "alignment": getattr(self, 'alignment', ''), 
            "stats": {
                "str": getattr(self, 'strength', 10),
                "dex": getattr(self, 'dexterity', 10),
                "con": getattr(self, 'constitution', 10),
                "int": getattr(self, 'intelligence', 10),
                "wis": getattr(self, 'wisdom', 10),
                "cha": getattr(self, 'charisma', 10)
            },
            "skills": json.loads(self.skills_data) if self.skills_data else [],
            "weapons": json.loads(self.weapons_data) if self.weapons_data else []
        }