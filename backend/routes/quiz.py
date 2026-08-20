from datetime import datetime

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity

from extensions import db
from models import Quiz, Question, Option, Attempt, Answer
from middleware.auth_middleware import admin_required, student_required



quiz_bp = Blueprint("quiz", __name__, url_prefix="/api/quizzes")


@quiz_bp.route("", methods=["POST"])
@admin_required
def create_quiz():

    data = request.get_json()

    title = data.get("title")
    description = data.get("description")
    category_id = data.get("category_id")
    difficulty = data.get("difficulty")
    duration = data.get("duration")
    passing_score = data.get("passing_score")
    max_attempts = data.get("max_attempts")
    status = data.get("status", "Draft")
    thumbnail = data.get("thumbnail")

    if not title or not difficulty or duration is None or passing_score is None or max_attempts is None:
        return {
            "message": "Required fields are missing"
        }, 400

    quiz = Quiz(
        title=title,
        description=description,
        category_id=category_id,
        difficulty=difficulty,
        duration=duration,
        passing_score=passing_score,
        max_attempts=max_attempts,
        status=status,
        thumbnail=thumbnail
    )

    db.session.add(quiz)
    db.session.commit()

    return {
        "message": "Quiz Created Successfully",
        "quiz_id": quiz.id
    }, 201


@quiz_bp.route("", methods=["GET"])
@admin_required
def get_quizzes():

    quizzes = Quiz.query.all()

    return [
        {
            "id": quiz.id,
            "title": quiz.title,
            "description": quiz.description,
            "category_id": quiz.category_id,
            "difficulty": quiz.difficulty,
            "duration": quiz.duration,
            "passing_score": quiz.passing_score,
            "max_attempts": quiz.max_attempts,
            "status": quiz.status,
            "thumbnail": quiz.thumbnail
        }
        for quiz in quizzes
    ], 200


@quiz_bp.route("/<int:quiz_id>", methods=["GET"])
@admin_required
def get_quiz(quiz_id):

    quiz = Quiz.query.get(quiz_id)

    if not quiz:
        return {
            "message": "Quiz not found"
        }, 404

    return {
        "id": quiz.id,
        "title": quiz.title,
        "description": quiz.description,
        "category_id": quiz.category_id,
        "difficulty": quiz.difficulty,
        "duration": quiz.duration,
        "passing_score": quiz.passing_score,
        "max_attempts": quiz.max_attempts,
        "status": quiz.status,
        "thumbnail": quiz.thumbnail
    }, 200


@quiz_bp.route("/<int:quiz_id>", methods=["PUT"])
@admin_required
def update_quiz(quiz_id):

    quiz = Quiz.query.get(quiz_id)

    if not quiz:
        return {
            "message": "Quiz not found"
        }, 404

    data = request.get_json()

    quiz.title = data.get("title", quiz.title)
    quiz.description = data.get("description", quiz.description)
    quiz.category_id = data.get("category_id", quiz.category_id)
    quiz.difficulty = data.get("difficulty", quiz.difficulty)
    quiz.duration = data.get("duration", quiz.duration)
    quiz.passing_score = data.get("passing_score", quiz.passing_score)
    quiz.max_attempts = data.get("max_attempts", quiz.max_attempts)
    quiz.status = data.get("status", quiz.status)
    quiz.thumbnail = data.get("thumbnail", quiz.thumbnail)

    db.session.commit()

    return {
        "message": "Quiz Updated Successfully"
    }, 200


@quiz_bp.route("/<int:quiz_id>", methods=["DELETE"])
@admin_required
def delete_quiz(quiz_id):

    quiz = Quiz.query.get(quiz_id)

    if not quiz:
        return {
            "message": "Quiz not found"
        }, 404

    db.session.delete(quiz)
    db.session.commit()

    return {
        "message": "Quiz Deleted Successfully"
    }, 200


@quiz_bp.route("/<int:quiz_id>/status", methods=["PATCH"])
@admin_required
def update_quiz_status(quiz_id):

    quiz = Quiz.query.get(quiz_id)

    if not quiz:
        return {
            "message": "Quiz not found"
        }, 404

    # Published -> Unpublished
    if quiz.status == "Published":

        quiz.status = "Unpublished"

    # Draft / Unpublished -> Published
    else:

        # A quiz must have at least one question
        question_count = Question.query.filter_by(
            quiz_id=quiz.id
        ).count()

        if question_count == 0:

            return {
                "message": "Cannot publish a quiz without questions."
            }, 400

        quiz.status = "Published"

    db.session.commit()

    return {
        "message": "Quiz Status Updated Successfully",
        "status": quiz.status
    }, 200

@quiz_bp.route("/student", methods=["GET"])
@student_required
def get_student_quizzes():

    user_id = int(get_jwt_identity())

    quizzes = Quiz.query.filter_by(
        status="Published"
    ).all()

    result = []

    for quiz in quizzes:

        # Current student's completed attempts
        completed_attempts = Attempt.query.filter_by(
            quiz_id=quiz.id,
            user_id=user_id
        ).filter(
            Attempt.completed_at.isnot(None)
        ).count()

        # Total completed attempts by all students
        total_attempts = Attempt.query.filter_by(
            quiz_id=quiz.id
        ).filter(
            Attempt.completed_at.isnot(None)
        ).count()

        result.append({
            "id": quiz.id,
            "title": quiz.title,
            "description": quiz.description,
            "category_id": quiz.category_id,
            "difficulty": quiz.difficulty,
            "duration": quiz.duration,
            "passing_score": quiz.passing_score,
            "max_attempts": quiz.max_attempts,

            "attempts_used": completed_attempts,

            "attempts_remaining": max(
                quiz.max_attempts - completed_attempts,
                0
            ),

            # Used for Recently Added
            "created_at": (
                quiz.created_at.isoformat()
                if quiz.created_at
                else None
            ),

            # Used for Popularity
            "total_attempts": total_attempts,

            "thumbnail": quiz.thumbnail
        })

    return result, 200
@quiz_bp.route("/student/<int:quiz_id>/start", methods=["POST"])
@student_required
def start_quiz(quiz_id):

    user_id = int(get_jwt_identity())

    quiz = Quiz.query.filter_by(
        id=quiz_id,
        status="Published"
    ).first()

    if not quiz:
        return {
            "message": "Quiz not found"
        }, 404

    completed_attempts = Attempt.query.filter_by(
        quiz_id=quiz_id,
        user_id=user_id
    ).filter(
        Attempt.completed_at.isnot(None)
    ).count()

    if completed_attempts >= quiz.max_attempts:
        return {
            "message": "Maximum attempts reached"
        }, 403

    active_attempt = Attempt.query.filter_by(
        quiz_id=quiz_id,
        user_id=user_id,
        status="IN_PROGRESS"
    ).first()

    if active_attempt:
        elapsed_seconds = int(
            (datetime.utcnow() - active_attempt.started_at).total_seconds()
        )

        remaining_seconds = max(
            (quiz.duration * 60) - elapsed_seconds,
            0
        )

        return {
            "message": "Existing attempt resumed",
            "attempt_id": active_attempt.id,
            "quiz_id": quiz.id,
            "duration": quiz.duration,
            "remaining_seconds": remaining_seconds,
            "started_at": active_attempt.started_at.isoformat()
        }, 200

    attempt = Attempt(
        quiz_id=quiz.id,
        user_id=user_id,
        score=0,
        percentage=0,
        correct_answers=0,
        incorrect_answers=0,
        unanswered=0,
        time_taken=0,
        status="IN_PROGRESS"
    )

    db.session.add(attempt)
    db.session.commit()

    return {
        "message": "Quiz Started Successfully",
        "attempt_id": attempt.id,
        "quiz_id": quiz.id,
        "duration": quiz.duration,
        "remaining_seconds": quiz.duration * 60,
        "started_at": attempt.started_at.isoformat()
    }, 201
# -----------------------------
# GET STUDENT QUIZ QUESTIONS
# -----------------------------

@quiz_bp.route("/student/<int:quiz_id>", methods=["GET"])
@student_required
def get_student_quiz(quiz_id):

    quiz = Quiz.query.filter_by(
        id=quiz_id,
        status="Published"
    ).first()

    if not quiz:
        return {
            "message": "Quiz not found"
        }, 404

    questions = Question.query.filter_by(
        quiz_id=quiz_id
    ).all()

    result = []

    for question in questions:

        options = Option.query.filter_by(
            question_id=question.id
        ).all()

        result.append({
            "id": question.id,
            "question_text": question.question_text,
            "marks": question.marks,
            "options": [
                {
                    "id": option.id,
                    "option_text": option.option_text
                }
                for option in options
            ]
        })

    return {
        "id": quiz.id,
        "title": quiz.title,
        "description": quiz.description,
        "difficulty": quiz.difficulty,
        "duration": quiz.duration,
        "passing_score": quiz.passing_score,
        "questions": result
    }, 200
@quiz_bp.route("/<int:quiz_id>/submit", methods=["POST"])
@student_required
def submit_quiz(quiz_id):

    user_id = int(get_jwt_identity())

    quiz = Quiz.query.filter_by(
        id=quiz_id,
        status="Published"
    ).first()

    if not quiz:
        return {
            "message": "Quiz not found"
        }, 404

    attempt = Attempt.query.filter_by(
        quiz_id=quiz_id,
        user_id=user_id,
        status="IN_PROGRESS"
    ).first()

    if not attempt:
        return {
            "message": "No active attempt found"
        }, 400

    data = request.get_json() or {}

    submitted_answers = data.get("answers", [])

    questions = Question.query.filter_by(
        quiz_id=quiz_id
    ).all()

    correct_answers = 0
    incorrect_answers = 0
    unanswered = 0
    score = 0

    for question in questions:

        selected_option_id = None

        for answer in submitted_answers:
            if answer.get("question_id") == question.id:
                selected_option_id = answer.get("selected_option_id")
                break

        if not selected_option_id:
            unanswered += 1

            answer_record = Answer(
                attempt_id=attempt.id,
                question_id=question.id,
                selected_option_id=None,
                is_correct=False
            )

            db.session.add(answer_record)

            continue

        selected_option = Option.query.filter_by(
            id=selected_option_id,
            question_id=question.id
        ).first()

        if not selected_option:
            incorrect_answers += 1

            answer_record = Answer(
                attempt_id=attempt.id,
                question_id=question.id,
                selected_option_id=selected_option_id,
                is_correct=False
            )

            db.session.add(answer_record)

            continue

        is_correct = selected_option.is_correct

        if is_correct:
            correct_answers += 1
            score += question.marks
        else:
            incorrect_answers += 1

        answer_record = Answer(
            attempt_id=attempt.id,
            question_id=question.id,
            selected_option_id=selected_option.id,
            is_correct=is_correct
        )

        db.session.add(answer_record)

    total_marks = sum(
        question.marks for question in questions
    )

    if total_marks > 0:
        percentage = (score / total_marks) * 100
    else:
        percentage = 0

    if percentage >= quiz.passing_score:
        status = "PASSED"
    else:
        status = "FAILED"
    elapsed_seconds = int(
    (datetime.utcnow() - attempt.started_at).total_seconds()
)
    time_taken = min(
    max(elapsed_seconds, 0),
    quiz.duration * 60
)

    attempt.score = score
    attempt.percentage = percentage
    attempt.correct_answers = correct_answers
    attempt.incorrect_answers = incorrect_answers
    attempt.unanswered = unanswered
    attempt.time_taken = time_taken
    attempt.status = status
    attempt.completed_at = datetime.utcnow()

    db.session.commit()

    return {
        "message": "Quiz Submitted Successfully",
        "attempt_id": attempt.id,
        "quiz_id": quiz.id,
        "score": score,
        "total_marks": total_marks,
        "percentage": round(percentage, 2),
        "correct_answers": correct_answers,
        "incorrect_answers": incorrect_answers,
        "unanswered": unanswered,
        "time_taken": time_taken,
        "status": status
    }, 200
@quiz_bp.route("/<int:quiz_id>/attempt/<int:attempt_id>/review", methods=["GET"])
@student_required
def review_quiz(quiz_id, attempt_id):

    user_id = int(get_jwt_identity())

    attempt = Attempt.query.filter_by(
        id=attempt_id,
        quiz_id=quiz_id,
        user_id=user_id
    ).first()

    if not attempt:
        return {
            "message": "Attempt not found"
        }, 404

    questions = Question.query.filter_by(
        quiz_id=quiz_id
    ).all()

    result = []

    for question in questions:

        answer = Answer.query.filter_by(
            attempt_id=attempt.id,
            question_id=question.id
        ).first()

        options = Option.query.filter_by(
            question_id=question.id
        ).all()

        selected_option_id = (
            answer.selected_option_id
            if answer
            else None
        )

        correct_option = next(
            (option for option in options if option.is_correct),
            None
        )

        result.append({
            "question_id": question.id,
            "question_text": question.question_text,

            "selected_option_id": selected_option_id,

            "correct_option_id": (
                correct_option.id
                if correct_option
                else None
            ),

            "is_correct": (
                answer.is_correct
                if answer
                else False
            ),
            "explanation": question.explanation,

            "options": [
                {
                    "id": option.id,
                    "option_text": option.option_text
                }
                for option in options
            ]
        })

    return {
        "attempt_id": attempt.id,
        "quiz_id": quiz_id,
        "questions": result
    }, 200
# -----------------------------
# STUDENT ATTEMPT HISTORY
# -----------------------------

@quiz_bp.route("/student/attempts", methods=["GET"])
@student_required
def get_attempt_history():

    user_id = int(get_jwt_identity())

    attempts = Attempt.query.filter_by(
        user_id=user_id
    ).order_by(
        Attempt.completed_at.desc()
    ).all()

    result = []

    for attempt in attempts:

        quiz = Quiz.query.get(attempt.quiz_id)

        result.append({
            "attempt_id": attempt.id,
            "quiz_id": attempt.quiz_id,
            "quiz_title": quiz.title if quiz else "Unknown Quiz",
            "score": attempt.score,
            "percentage": attempt.percentage,
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
        })

    return result, 200
# -----------------------------
# STUDENT DASHBOARD STATISTICS
# -----------------------------

@quiz_bp.route("/student/statistics", methods=["GET"])
@student_required
def get_student_statistics():

    user_id = int(get_jwt_identity())

    attempts = Attempt.query.filter_by(
        user_id=user_id
    ).filter(
        Attempt.completed_at.isnot(None)
    ).order_by(
        Attempt.completed_at.asc()
    ).all()

    total_attempts = len(attempts)

    if total_attempts == 0:
        return {
            "total_attempts": 0,
            "average_score": 0,
            "highest_score": 0,
            "passed_attempts": 0,
            "failed_attempts": 0,
            "performance": []
        }, 200

    percentages = [
        attempt.percentage or 0
        for attempt in attempts
    ]

    passed_attempts = sum(
        1 for attempt in attempts
        if attempt.status == "PASSED"
    )

    failed_attempts = sum(
        1 for attempt in attempts
        if attempt.status == "FAILED"
    )

    performance = []

    for index, attempt in enumerate(attempts):

        quiz = Quiz.query.get(attempt.quiz_id)

        performance.append({
            "attempt": index + 1,
            "quiz_title": (
                quiz.title
                if quiz
                else "Unknown Quiz"
            ),
            "percentage": attempt.percentage or 0
        })

    return {
        "total_attempts": total_attempts,
        "average_score": round(
            sum(percentages) / total_attempts,
            2
        ),
        "highest_score": max(percentages),
        "passed_attempts": passed_attempts,
        "failed_attempts": failed_attempts,
        "performance": performance
    }, 200