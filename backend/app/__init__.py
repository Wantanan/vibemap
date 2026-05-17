from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)

    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    try:
        from app.routes import auth
        app.register_blueprint(auth.bp)
    except Exception as e:
        print(f"Error loading auth: {e}")

    try:
        from app.routes import recommendations
        app.register_blueprint(recommendations.bp)
    except Exception as e:
        print(f"Error loading recommendations: {e}")

    try:
        from app.routes import profile
        app.register_blueprint(profile.bp)
    except Exception as e:
        print(f"Error loading profile: {e}")

    try:
        from app.routes import ratings
        app.register_blueprint(ratings.bp)
    except Exception as e:
        print(f"Error loading ratings: {e}")

    return app