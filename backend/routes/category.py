from flask import Blueprint, request

from extensions import db
from models import Category
from middleware.auth_middleware import admin_required


category_bp = Blueprint(
    "category",
    __name__,
    url_prefix="/api/categories"
)


@category_bp.route("", methods=["POST"])
@admin_required
def create_category():

    data = request.get_json()

    name = data.get("name")
    description = data.get("description")

    if not name:
        return {"message": "Category name is required"}, 400

    existing = Category.query.filter_by(name=name).first()

    if existing:
        return {"message": "Category already exists"}, 409

    category = Category(
        name=name,
        description=description
    )

    db.session.add(category)
    db.session.commit()

    return {
        "message": "Category Created Successfully",
        "category_id": category.id
    }, 201


@category_bp.route("", methods=["GET"])
@admin_required
def get_categories():

    categories = Category.query.all()

    return [
        {
            "id": category.id,
            "name": category.name,
            "description": category.description
        }
        for category in categories
    ], 200


@category_bp.route("/<int:category_id>", methods=["PUT"])
@admin_required
def update_category(category_id):

    category = Category.query.get(category_id)

    if not category:
        return {"message": "Category not found"}, 404

    data = request.get_json()

    category.name = data.get("name", category.name)
    category.description = data.get(
        "description",
        category.description
    )

    db.session.commit()

    return {
        "message": "Category Updated Successfully"
    }, 200


@category_bp.route("/<int:category_id>", methods=["DELETE"])
@admin_required
def delete_category(category_id):

    category = Category.query.get(category_id)

    if not category:
        return {"message": "Category not found"}, 404

    db.session.delete(category)
    db.session.commit()

    return {
        "message": "Category Deleted Successfully"
    }, 200