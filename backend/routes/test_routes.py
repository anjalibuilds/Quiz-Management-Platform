from flask import Blueprint
from flask_jwt_extended import jwt_required

from middleware.auth_middleware import (
    admin_required,
    student_required
)

test_bp = Blueprint("test", __name__, url_prefix="/api/test")


@test_bp.route("/common")
@jwt_required()
def common():
    return {
        "message": "Logged In User"
    }


@test_bp.route("/admin")
@admin_required
def admin():
    return {
        "message": "Welcome Admin"
    }


@test_bp.route("/student")
@student_required
def student():
    return {
        "message": "Welcome Student"
    }