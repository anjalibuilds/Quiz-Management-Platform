from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS

from config import Config
from models import User

from extensions import db, jwt, bcrypt
from routes.auth import auth_bp
from routes.test_routes import test_bp
from routes.category import category_bp

from routes.admin import admin_bp
from routes.quiz import quiz_bp
from routes.question import question_bp

from routes.leaderboard import leaderboard_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(test_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(quiz_bp)
    app.register_blueprint(category_bp)
    app.register_blueprint(question_bp)
    app.register_blueprint(leaderboard_bp)

    
    @app.route("/api/health")
    def health():
        return {
            "message": "Quiz Management Platform API Running"
        }, 200

    with app.app_context():
        db.create_all()

    

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True)