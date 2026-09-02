from flask import Blueprint, request, jsonify
from models.category import Category
from services.category_service import CategoryService

category_bp = Blueprint(
    "categories",
    __name__,
    url_prefix="/api/categories"
)


@category_bp.route("", methods=["GET"])
def get_categories():
    categories = CategoryService.get_all_categories()

    return jsonify([
        category.to_dict()
        for category in categories
    ])


@category_bp.route("", methods=["POST"])
def create_category():
    data = request.get_json()

    if not data or "name" not in data:
        return jsonify({
            "error": "name is required"
        }), 400

    category = Category(
        name=data["name"],
        description=data.get("description")
    )

    try:
        created_category = CategoryService.create_category(category)

        return jsonify(
            created_category.to_dict()
        ), 201

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 400


@category_bp.route("/<int:category_id>", methods=["PUT"])
def update_category(category_id):
    data = request.get_json()

    if not data or "name" not in data:
        return jsonify({
            "error": "name is required"
        }), 400

    category = Category(
        name=data["name"],
        description=data.get("description"),
        category_id=category_id
    )

    try:
        updated_category = CategoryService.update_category(category)

        return jsonify(
            updated_category.to_dict()
        )

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 400


@category_bp.route("/<int:category_id>", methods=["DELETE"])
def delete_category(category_id):
    try:
        deleted = CategoryService.delete_category(category_id)

        if not deleted:
            return jsonify({
                "error": "Category not found"
            }), 404

        return jsonify({
            "message": "Category deleted successfully"
        })

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 400