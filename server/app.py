from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins="*")

@app.route('/api/home', methods=['GET'])
def return_home():
    return jsonify({
        'message': "Testing Flask", 
        'people': ['Volk', 'Felix', 'Gearbok']
    })

if __name__ == "__main__":
    app.run(debug=True, port=8080)