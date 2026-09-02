from flask import Blueprint, request, jsonify
from models.supplier import Supplier
from services.supplier_service import SupplierService

supplier_bp = Blueprint("suppliers", __name__, url_prefix="/api/suppliers")


@supplier_bp.route("", methods=["GET"])
def get_suppliers():
    suppliers = SupplierService.get_all_suppliers()

    return jsonify([
        supplier.to_dict()
        for supplier in suppliers
    ])


@supplier_bp.route("", methods=["POST"])
def create_supplier():
    data = request.get_json()

    if not data or "name" not in data:
        return jsonify({
            "error": "name is required"
        }), 400

    supplier = Supplier(
        name=data["name"],
        email=data.get("email"),
        phone=data.get("phone"),
        address=data.get("address"),
        reliability_score=data.get("reliability_score", 0),
        average_delivery_days=data.get("average_delivery_days", 0)
    )

    try:
        created_supplier = SupplierService.create_supplier(supplier)

        return jsonify(
            created_supplier.to_dict()
        ), 201

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 400


@supplier_bp.route("/<int:supplier_id>", methods=["PUT"])
def update_supplier(supplier_id):
    data = request.get_json()

    supplier = Supplier(
        name=data["name"],
        email=data.get("email"),
        phone=data.get("phone"),
        address=data.get("address"),
        reliability_score=data.get("reliability_score", 0),
        average_delivery_days=data.get("average_delivery_days", 0),
        supplier_id=supplier_id
    )

    try:
        updated_supplier = SupplierService.update_supplier(supplier)

        return jsonify(
            updated_supplier.to_dict()
        )

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 400


@supplier_bp.route("/<int:supplier_id>", methods=["DELETE"])
def delete_supplier(supplier_id):
    try:
        deleted = SupplierService.delete_supplier(supplier_id)

        if not deleted:
            return jsonify({
                "error": "Supplier not found"
            }), 404

        return jsonify({
            "message": "Supplier deleted successfully"
        })

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 400