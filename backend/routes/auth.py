from datetime import timedelta

from flask import Blueprint, request
from flask_bcrypt import (
    check_password_hash,
    generate_password_hash
)
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt,
    get_jwt_identity
)

from extensions import db
from models import User


auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth"
)


# =====================================================
# REGISTER
# =====================================================

@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    if not data:
        return {"message": "No data received"}, 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return {"message": "All fields are required"}, 400

    existing_user = User.query.filter_by(
        email=email
    ).first()

    if existing_user:
        return {"message": "Email already exists"}, 409

    hashed_password = generate_password_hash(
        password
    ).decode("utf-8")

    user = User(
        name=name,
        email=email,
        password=hashed_password,
        role="STUDENT"
    )

    db.session.add(user)
    db.session.commit()

    return {
        "message": "Student Registered Successfully"
    }, 201


# =====================================================
# LOGIN
# =====================================================

@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(
        email=email
    ).first()

    if not user:
        return {
            "message": "Invalid Email or Password"
        }, 401

    if not check_password_hash(
        user.password,
        password
    ):
        return {
            "message": "Invalid Email or Password"
        }, 401

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": user.role
        }
    )

    return {
        "message": "Login Successful",
        "token": access_token,
        "role": user.role
    }, 200


# =====================================================
# FORGOT PASSWORD
# =====================================================

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():

    data = request.get_json() or {}

    email = data.get("email")

    if not email:
        return {
            "message": "Email is required"
        }, 400

    user = User.query.filter_by(
        email=email
    ).first()

    # Do not reveal whether email exists
    if not user:
        return {
            "message": (
                "If an account exists with this email, "
                "a password reset option has been generated."
            )
        }, 200

    reset_token = create_access_token(
        identity=str(user.id),
        expires_delta=timedelta(minutes=15),
        additional_claims={
            "purpose": "password_reset"
        }
    )

    return {
        "message": "Password reset token generated.",
        "reset_token": reset_token
    }, 200


# =====================================================
# RESET PASSWORD
# =====================================================

@auth_bp.route("/reset-password", methods=["POST"])
@jwt_required()
def reset_password():

    claims = get_jwt()

    if claims.get("purpose") != "password_reset":
        return {
            "message": "Invalid password reset token"
        }, 403

    data = request.get_json() or {}

    new_password = data.get("password")

    if not new_password:
        return {
            "message": "New password is required"
        }, 400

    if len(new_password) < 6:
        return {
            "message": (
                "Password must be at least 6 characters"
            )
        }, 400

    user_id = get_jwt_identity()

    user = User.query.get(int(user_id))

    if not user:
        return {
            "message": "User not found"
        }, 404

    user.password = generate_password_hash(
        new_password
    ).decode("utf-8")

    db.session.commit()

    return {
        "message": "Password reset successfully"
    }, 200


# =====================================================
# LOGOUT
# =====================================================

@auth_bp.route("/logout", methods=["POST"])
def logout():

    return {
        "message": "Logout Successful"
    }, 200