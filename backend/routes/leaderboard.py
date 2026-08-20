from flask import Blueprint
from sqlalchemy import func

from extensions import db
from models import User, Attempt, Quiz, Category
from middleware.auth_middleware import student_required


leaderboard_bp = Blueprint(
    "leaderboard",
    __name__,
    url_prefix="/api/leaderboard"
)


@leaderboard_bp.route("/overall", methods=["GET"])
@student_required
def overall_leaderboard():

    results = (
        db.session.query(
            User.id,
            User.name,
            func.count(Attempt.id).label("attempts"),
            func.avg(Attempt.percentage).label("average_score"),
            func.max(Attempt.percentage).label("highest_score")
        )
        .join(Attempt, Attempt.user_id == User.id)
        .filter(User.role == "STUDENT")
        .group_by(User.id, User.name)
        .order_by(
            func.avg(Attempt.percentage).desc()
        )
        .all()
    )

    return [
        {
            "rank": index + 1,
            "user_id": row.id,
            "name": row.name,
            "attempts": row.attempts,
            "average_score": round(
                float(row.average_score or 0), 2
            ),
            "highest_score": round(
                float(row.highest_score or 0), 2
            )
        }
        for index, row in enumerate(results)
    ], 200


@leaderboard_bp.route("/category/<int:category_id>", methods=["GET"])
@student_required
def category_leaderboard(category_id):

    results = (
        db.session.query(
            User.id,
            User.name,
            func.count(Attempt.id).label("attempts"),
            func.avg(Attempt.percentage).label("average_score"),
            func.max(Attempt.percentage).label("highest_score")
        )
        .join(Attempt, Attempt.user_id == User.id)
        .join(Quiz, Quiz.id == Attempt.quiz_id)
        .filter(
            User.role == "STUDENT",
            Quiz.category_id == category_id
        )
        .group_by(User.id, User.name)
        .order_by(
            func.avg(Attempt.percentage).desc()
        )
        .all()
    )

    return [
        {
            "rank": index + 1,
            "user_id": row.id,
            "name": row.name,
            "attempts": row.attempts,
            "average_score": round(
                float(row.average_score or 0), 2
            ),
            "highest_score": round(
                float(row.highest_score or 0), 2
            )
        }
        for index, row in enumerate(results)
    ], 200
@leaderboard_bp.route("/categories", methods=["GET"])
@student_required
def leaderboard_categories():

    categories = Category.query.all()

    return [
        {
            "id": category.id,
            "name": category.name
        }
        for category in categories
    ], 200