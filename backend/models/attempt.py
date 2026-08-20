from datetime import datetime
from extensions import db


class Attempt(db.Model):
    __tablename__ = "attempts"

    id = db.Column(db.Integer, primary_key=True)

    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id"), nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    score = db.Column(db.Integer)

    percentage = db.Column(db.Float)

    correct_answers = db.Column(db.Integer)

    incorrect_answers = db.Column(db.Integer)

    unanswered = db.Column(db.Integer)

    time_taken = db.Column(db.Integer)

    status = db.Column(db.String(20))

    started_at = db.Column(db.DateTime, default=datetime.utcnow)

    completed_at = db.Column(db.DateTime)