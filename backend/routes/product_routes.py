from flask import Blueprint, request, jsonify
from models.product import Product
from services.product_service import ProductService

product_bp = Blueprint(
    "products",
    __name__,
    url_prefix="/api/products"
)


@product_bp.route("", methods=["GET"])
def get_products():
    search = request.args.get("search")
    status = request.args.get("status")
    category_id = request.args.get("category_id", type=int)
    sort_by = request.args.get("sort_by", "id")
    order = request.args.get("order", "asc")

    products = ProductService.search_products(
        search=search,
        status=status,
        category_id=category_id,
        sort_by=sort_by,
        order=order
    )

    return jsonify([
        product.to_dict()
        for product in products
    ])


@product_bp.route("/<int:product_id>", methods=["GET"])
def get_product(product_id):
    products = ProductService.get_all_products()

    for product in products:
        if product.id == product_id:
            return jsonify(product.to_dict())

    return jsonify({
        "error": "Product not found"
    }), 404


@product_bp.route("", methods=["POST"])
def create_product():
    data = request.get_json()

    required_fields = [
        "name",
        "sku",
        "unit_price"
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({
                "error": f"{field} is required"
            }), 400

    product = Product(
        name=data["name"],
        sku=data["sku"],
        category_id=data.get("category_id"),
        supplier_id=data.get("supplier_id"),
        unit_price=data["unit_price"],
        current_stock=data.get("current_stock", 0),
        reorder_level=data.get("reorder_level", 10),
        description=data.get("description")
    )

    try:
        created_product = ProductService.create_product(product)

        return jsonify(
            created_product.to_dict()
        ), 201

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 400


@product_bp.route("/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    data = request.get_json()

    product = Product(
        name=data["name"],
        sku=data["sku"],
        category_id=data.get("category_id"),
        supplier_id=data.get("supplier_id"),
        unit_price=data["unit_price"],
        current_stock=data.get("current_stock", 0),
        reorder_level=data.get("reorder_level", 10),
        description=data.get("description"),
        product_id=product_id
    )

    try:
        updated_product = ProductService.update_product(product)

        return jsonify(
            updated_product.to_dict()
        )

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 400


@product_bp.route("/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    try:
        deleted = ProductService.delete_product(product_id)

        if not deleted:
            return jsonify({
                "error": "Product not found"
            }), 404

        return jsonify({
            "message": "Product deleted successfully"
        })

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 400