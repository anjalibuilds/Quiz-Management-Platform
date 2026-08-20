from flask import Blueprint
from sqlalchemy import func

from extensions import db
from models import User, Quiz, Question, Attempt
from middleware.auth_middleware import admin_required


admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/dashboard", methods=["GET"])
@admin_required
def dashboard():

    total_students = User.query.filter_by(role="STUDENT").count()
    total_quizzes = Quiz.query.count()

    published_quizzes = Quiz.query.filter_by(status="Published").count()
    draft_quizzes = Quiz.query.filter_by(status="Draft").count()

    total_questions = Question.query.count()
    total_attempts = Attempt.query.count()

    average_score = db.session.query(
        func.avg(Attempt.percentage)
    ).scalar() or 0

    passed_attempts = Attempt.query.filter(
        Attempt.status == "PASSED"
    ).count()

    failed_attempts = Attempt.query.filter(
        Attempt.status == "FAILED"
    ).count()

    return {
        "total_students": total_students,
        "total_quizzes": total_quizzes,
        "published_quizzes": published_quizzes,
        "draft_quizzes": draft_quizzes,
        "total_questions": total_questions,
        "total_attempts": total_attempts,
        "average_score": round(float(average_score), 2),
        "total_passed_attempts": passed_attempts,
        "total_failed_attempts": failed_attempts
    }, 200
@admin_bp.route("/users", methods=["GET"])
@admin_required
def get_users():

    users = User.query.filter_by(role="STUDENT").all()

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "status": user.status,
            "created_at": user.created_at.isoformat()
        }
        for user in users
    ], 200


@admin_bp.route("/users/<int:user_id>", methods=["GET"])
@admin_required
def get_user(user_id):

    user = User.query.filter_by(
        id=user_id,
        role="STUDENT"
    ).first()

    if not user:
        return {"message": "Student not found"}, 404

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "status": user.status,
        "created_at": user.created_at.isoformat()
    }, 200


@admin_bp.route("/users/<int:user_id>/status", methods=["PATCH"])
@admin_required
def update_user_status(user_id):

    user = User.query.filter_by(
        id=user_id,
        role="STUDENT"
    ).first()

    if not user:
        return {"message": "Student not found"}, 404

    user.status = not user.status

    db.session.commit()

    return {
        "message": "User status updated successfully",
        "status": user.status
    }, 200


@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):

    user = User.query.filter_by(
        id=user_id,
        role="STUDENT"
    ).first()

    if not user:
        return {"message": "Student not found"}, 404

    db.session.delete(user)
    db.session.commit()

    return {
        "message": "Student deleted successfully"
    }, 200
# -----------------------------
# ADMIN ANALYTICS
# -----------------------------

@admin_bp.route("/analytics", methods=["GET"])
@admin_required
def analytics():

    total_students = User.query.filter_by(
        role="STUDENT"
    ).count()

    total_quizzes = Quiz.query.count()

    total_attempts = Attempt.query.count()

    average_score = db.session.query(
        func.avg(Attempt.percentage)
    ).scalar() or 0

    passed_attempts = Attempt.query.filter(
        Attempt.status == "PASSED"
    ).count()

    failed_attempts = Attempt.query.filter(
        Attempt.status == "FAILED"
    ).count()

    quiz_statistics = []

    quizzes = Quiz.query.all()

    for quiz in quizzes:

        attempts = Attempt.query.filter_by(
            quiz_id=quiz.id
        ).all()

        quiz_average = db.session.query(
            func.avg(Attempt.percentage)
        ).filter(
            Attempt.quiz_id == quiz.id
        ).scalar() or 0

        quiz_statistics.append({
            "quiz_id": quiz.id,
            "quiz_title": quiz.title,
            "attempts": len(attempts),
            "average_score": round(
                float(quiz_average), 2
            ),
            "passed": sum(
                1
                for attempt in attempts
                if attempt.status == "PASSED"
            ),
            "failed": sum(
                1
                for attempt in attempts
                if attempt.status == "FAILED"
            )
        })

    return {
        "student_statistics": {
            "total_students": total_students
        },

        "quiz_statistics": {
            "total_quizzes": total_quizzes
        },

        "attempt_statistics": {
            "total_attempts": total_attempts,
            "average_score": round(
                float(average_score), 2
            )
        },

        "pass_fail_analytics": {
            "passed": passed_attempts,
            "failed": failed_attempts
        },

        "quiz_performance": quiz_statistics
    }, 200
# -----------------------------
# VIEW ALL QUIZ ATTEMPTS
# -----------------------------

@admin_bp.route("/attempts", methods=["GET"])
@admin_required
def get_all_attempts():

    attempts = (
        db.session.query(
            Attempt.id,
            Attempt.score,
            Attempt.percentage,
            Attempt.correct_answers,
            Attempt.incorrect_answers,
            Attempt.unanswered,
            Attempt.time_taken,
            Attempt.status,
            Attempt.started_at,
            Attempt.completed_at,
            User.name.label("student_name"),
            User.email.label("student_email"),
            Quiz.title.label("quiz_title")
        )
        .join(User, User.id == Attempt.user_id)
        .join(Quiz, Quiz.id == Attempt.quiz_id)
        .order_by(Attempt.completed_at.desc())
        .all()
    )

    return [
        {
            "id": attempt.id,
            "student_name": attempt.student_name,
            "student_email": attempt.student_email,
            "quiz_title": attempt.quiz_title,
            "score": attempt.score,
            "percentage": round(
                float(attempt.percentage or 0), 2
            ),
            "correct_answers": attempt.correct_answers,
            "incorrect_answers": attempt.incorrect_answers,
            "unanswered": attempt.unanswered,
            "time_taken": attempt.time_taken,
            "status": attempt.status,
            "started_at": (
                attempt.started_at.isoformat()
                if attempt.started_at else None
            ),
            "completed_at": (
                attempt.completed_at.isoformat()
                if attempt.completed_at else None
            )
        }
        for attempt in attempts
    ], 200

# -----------------------------
# ADMIN - VIEW INDIVIDUAL ATTEMPT
# -----------------------------

@admin_bp.route("/attempts/<int:attempt_id>", methods=["GET"])
@admin_required
def get_attempt(attempt_id):

    result = (
        db.session.query(
            Attempt,
            User.name.label("student_name"),
            User.email.label("student_email"),
            Quiz.title.label("quiz_title")
        )
        .join(User, Attempt.user_id == User.id)
        .join(Quiz, Attempt.quiz_id == Quiz.id)
        .filter(Attempt.id == attempt_id)
        .first()
    )

    if not result:
        return {
            "message": "Attempt not found"
        }, 404

    attempt, student_name, student_email, quiz_title = result

    return {
        "id": attempt.id,
        "student_id": attempt.user_id,
        "student_name": student_name,
        "student_email": student_email,
        "quiz_id": attempt.quiz_id,
        "quiz_title": quiz_title,
        "score": attempt.score,
        "percentage": round(
            float(attempt.percentage or 0), 2
        ),
        "correct_answers": attempt.correct_answers,
        "incorrect_answers": attempt.incorrect_answers,
        "unanswered": attempt.unanswered,
        "time_taken": attempt.time_taken,
        "status": attempt.status,
        "started_at": (
            attempt.started_at.isoformat()
            if attempt.started_at
            else None
        ),
        "completed_at": (
            attempt.completed_at.isoformat()
            if attempt.completed_at
            else None
        )
    }, 200
# =====================================
# ADMIN - INDIVIDUAL STUDENT RESULTS
# =====================================

@admin_bp.route("/users/<int:user_id>/results", methods=["GET"])
@admin_required
def get_student_results(user_id):

    user = User.query.filter_by(
        id=user_id,
        role="STUDENT"
    ).first()

    if not user:
        return {
            "message": "Student not found"
        }, 404

    attempts = (
        db.session.query(
            Attempt.id,
            Attempt.score,
            Attempt.percentage,
            Attempt.correct_answers,
            Attempt.incorrect_answers,
            Attempt.unanswered,
            Attempt.status,
            Attempt.started_at,
            Attempt.completed_at,
            Quiz.title.label("quiz_title")
        )
        .join(Quiz, Quiz.id == Attempt.quiz_id)
        .filter(Attempt.user_id == user_id)
        .order_by(Attempt.completed_at.desc())
        .all()
    )

    total_attempts = len(attempts)

    average_score = (
        sum(
            float(attempt.percentage or 0)
            for attempt in attempts
        ) / total_attempts
        if total_attempts
        else 0
    )

    highest_score = (
        max(
            float(attempt.percentage or 0)
            for attempt in attempts
        )
        if attempts
        else 0
    )

    return {
        "student": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "status": user.status
        },

        "statistics": {
            "total_attempts": total_attempts,
            "average_score": round(average_score, 2),
            "highest_score": round(highest_score, 2),
            "passed": sum(
                1
                for attempt in attempts
                if attempt.status == "PASSED"
            ),
            "failed": sum(
                1
                for attempt in attempts
                if attempt.status == "FAILED"
            )
        },

        "results": [
            {
                "attempt_id": attempt.id,
                "quiz_title": attempt.quiz_title,
                "score": attempt.score,
                "percentage": round(
                    float(attempt.percentage or 0),
                    2
                ),
                "correct_answers": attempt.correct_answers,
                "incorrect_answers": attempt.incorrect_answers,
                "unanswered": attempt.unanswered,
                "status": attempt.status,
                "started_at": (
                    attempt.started_at.isoformat()
                    if attempt.started_at
                    else None
                ),
                "completed_at": (
                    attempt.completed_at.isoformat()
                    if attempt.completed_at
                    else None
                )
            }
            for attempt in attempts
        ]
    }, 200
# -----------------------------
# ADMIN - LEADERBOARD
# -----------------------------

@admin_bp.route("/leaderboard", methods=["GET"])
@admin_required
def admin_leaderboard():

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