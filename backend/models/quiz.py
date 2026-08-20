from datetime import datetime
from extensions import db


class Quiz(db.Model):
    __tablename__ = "quizzes"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(150), nullable=False)

    description = db.Column(db.Text)

    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"))

    difficulty = db.Column(db.String(30), nullable=False)

    duration = db.Column(db.Integer, nullable=False)

    passing_score = db.Column(db.Integer, nullable=False)

    max_attempts = db.Column(db.Integer, nullable=False)

    status = db.Column(db.Enum("Draft", "Published", "Unpublished"), default="Draft")

    thumbnail = db.Column(db.String(255))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)