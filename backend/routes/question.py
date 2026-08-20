from flask import Blueprint, request

from extensions import db
from models import Question, Option, Quiz
from middleware.auth_middleware import admin_required


question_bp = Blueprint(
    "question",
    __name__,
    url_prefix="/api"
)


@question_bp.route("/quizzes/<int:quiz_id>/questions", methods=["POST"])
@admin_required
def create_question(quiz_id):

    quiz = Quiz.query.get(quiz_id)

    if not quiz:
        return {"message": "Quiz not found"}, 404

    data = request.get_json()

    question_text = data.get("question_text")
    marks = data.get("marks", 1)
    explanation = data.get("explanation")
    difficulty = data.get("difficulty")
    options = data.get("options")

    if not question_text or not options:
        return {
            "message": "Question text and options are required"
        }, 400

    if len(options) != 4:
        return {
            "message": "Exactly 4 options are required"
        }, 400

    correct_count = sum(
        1 for option in options
        if option.get("is_correct") is True
    )

    if correct_count != 1:
        return {
            "message": "Exactly one correct answer is required"
        }, 400

    question = Question(
        quiz_id=quiz_id,
        question_text=question_text,
        marks=marks,
        explanation=explanation,
        difficulty=difficulty
    )

    db.session.add(question)
    db.session.flush()

    for option_data in options:

        option = Option(
            question_id=question.id,
            option_text=option_data.get("option_text"),
            is_correct=option_data.get("is_correct", False)
        )

        db.session.add(option)

    db.session.commit()

    return {
        "message": "Question Created Successfully",
        "question_id": question.id
    }, 201


@question_bp.route("/quizzes/<int:quiz_id>/questions", methods=["GET"])
@admin_required
def get_questions(quiz_id):

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
            "explanation": question.explanation,
            "difficulty": question.difficulty,
            "options": [
                {
                    "id": option.id,
                    "option_text": option.option_text,
                    "is_correct": option.is_correct
                }
                for option in options
            ]
        })

    return result, 200


@question_bp.route("/questions/<int:question_id>", methods=["DELETE"])
@admin_required
def delete_question(question_id):

    question = Question.query.get(question_id)

    if not question:
        return {
            "message": "Question not found"
        }, 404

    Option.query.filter_by(
        question_id=question_id
    ).delete()

    db.session.delete(question)
    db.session.commit()

    return {
        "message": "Question Deleted Successfully"
    }, 200

@question_bp.route("/questions/<int:question_id>", methods=["PUT"])
@admin_required
def update_question(question_id):

    question = Question.query.get(question_id)

    if not question:
        return {
            "message": "Question not found"
        }, 404

    data = request.get_json()

    question.question_text = data.get(
        "question_text",
        question.question_text
    )

    question.marks = data.get(
        "marks",
        question.marks
    )

    question.explanation = data.get(
        "explanation",
        question.explanation
    )

    question.difficulty = data.get(
        "difficulty",
        question.difficulty
    )

    options = data.get("options")

    if options is not None:

        if len(options) != 4:
            return {
                "message": "Exactly 4 options are required"
            }, 400

        correct_count = sum(
            1
            for option in options
            if option.get("is_correct") is True
        )

        if correct_count != 1:
            return {
                "message": "Exactly one correct answer is required"
            }, 400

        Option.query.filter_by(
            question_id=question_id
        ).delete()

        for option_data in options:

            option = Option(
                question_id=question_id,
                option_text=option_data.get("option_text"),
                is_correct=option_data.get(
                    "is_correct",
                    False
                )
            )

            db.session.add(option)

    db.session.commit()

    return {
        "message": "Question Updated Successfully"
    }, 200