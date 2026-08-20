from datetime import datetime
from extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)

    email = db.Column(db.String(120), unique=True, nullable=False)

    password = db.Column(db.String(255), nullable=False)

    role = db.Column(
    db.Enum("ADMIN", "STUDENT", name="user_roles"),
    nullable=False
)

    status = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    security_question = db.Column(
    db.String(255),
    nullable=True
)

security_answer = db.Column(
    db.String(255),
    nullable=True
)