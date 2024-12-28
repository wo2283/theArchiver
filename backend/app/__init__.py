# app/__init__.py

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from .config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Configure CORS to allow requests from frontend
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

    # Register blueprints
    from .routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    return app
