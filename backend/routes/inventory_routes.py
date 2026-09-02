from flask import Blueprint, request, jsonify
from services.inventory_service import InventoryService

inventory_bp = Blueprint(
    "inventory",
    __name__,
    url_prefix="/api/inventory"
)


@inventory_bp.route("/stock-in", methods=["POST"])
def stock_in():
    data = request.get_json()

    required_fields = [
        "product_id",
        "quantity",
        "unit_price"
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({
                "error": f"{field} is required"
            }), 400

    try:
        result = InventoryService.process_stock_in(
            product_id=data["product_id"],
            quantity=data["quantity"],
            unit_price=data["unit_price"],
            user_id=data.get("user_id"),
            notes=data.get("notes")
        )

        return jsonify(result), 201

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 400


@inventory_bp.route("/stock-out", methods=["POST"])
def stock_out():
    data = request.get_json()

    required_fields = [
        "product_id",
        "quantity",
        "unit_price"
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({
                "error": f"{field} is required"
            }), 400

    try:
        result = InventoryService.process_stock_out(
            product_id=data["product_id"],
            quantity=data["quantity"],
            unit_price=data["unit_price"],
            user_id=data.get("user_id"),
            notes=data.get("notes")
        )

        return jsonify(result), 201

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 400


@inventory_bp.route("/return", methods=["POST"])
def return_stock():
    data = request.get_json()

    required_fields = [
        "product_id",
        "quantity",
        "unit_price"
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({
                "error": f"{field} is required"
            }), 400

    try:
        result = InventoryService.process_return(
            product_id=data["product_id"],
            quantity=data["quantity"],
            unit_price=data["unit_price"],
            user_id=data.get("user_id"),
            notes=data.get("notes")
        )

        return jsonify(result), 201

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 400