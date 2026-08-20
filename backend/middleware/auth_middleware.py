from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):

        verify_jwt_in_request()

        claims = get_jwt()

        if claims["role"] != "ADMIN":
            return {
                "message": "Admin access required"
            }, 403

        return fn(*args, **kwargs)

    return wrapper


def student_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):

        verify_jwt_in_request()

        claims = get_jwt()

        if claims["role"] != "STUDENT":
            return {
                "message": "Student access required"
            }, 403

        return fn(*args, **kwargs)

    return wrapper