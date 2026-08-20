from extensions import db


class Answer(db.Model):
    __tablename__ = "answers"

    id = db.Column(db.Integer, primary_key=True)

    attempt_id = db.Column(db.Integer, db.ForeignKey("attempts.id"), nullable=False)

    question_id = db.Column(db.Integer, db.ForeignKey("questions.id"), nullable=False)

    selected_option_id = db.Column(db.Integer, db.ForeignKey("options.id"))

    is_correct = db.Column(db.Boolean)