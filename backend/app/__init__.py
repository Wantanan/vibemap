from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    from app.routes import auth, recommendations, profile, ratings
    app.register_blueprint(auth.bp)
    app.register_blueprint(recommendations.bp)
    app.register_blueprint(profile.bp)
    app.register_blueprint(ratings.bp)

    return app