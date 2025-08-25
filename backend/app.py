from flask import Flask, jsonify
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
mongo = PyMongo(app)
jwt = JWTManager(app)
CORS(app)

# Import routes
from routes.auth import auth_bp
from routes.games import games_bp
from routes.progress import progress_bp
from routes.dashboard import dashboard_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(games_bp, url_prefix='/api/games')
app.register_blueprint(progress_bp, url_prefix='/api/progress')
app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

@app.route('/api/health')
def health_check():
    return jsonify({'status': 'healthy', 'service': 'Return-0 Backend'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
