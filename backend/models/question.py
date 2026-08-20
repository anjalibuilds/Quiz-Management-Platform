from datetime import datetime
from extensions import db


class Question(db.Model):
    __tablename__ = "questions"

    id = db.Column(db.Integer, primary_key=True)

    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id"), nullable=False)

    question_text = db.Column(db.Text, nullable=False)

    marks = db.Column(db.Integer, default=1)

    explanation = db.Column(db.Text)

    difficulty = db.Column(db.String(30))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)