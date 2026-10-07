from flask import Blueprint, request, jsonify

from models.supplier import Supplier
from services.supplier_service import SupplierService


supplier_bp = Blueprint(
    "suppliers",
    __name__,
    url_prefix="/api/suppliers"
)


@supplier_bp.route("", methods=["GET"])
def get_suppliers():
    suppliers = SupplierService.get_all_suppliers()

    return jsonify([
        supplier.to_dict()
        for supplier in suppliers
    ])


@supplier_bp.route("", methods=["POST"])
def create_supplier():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    if not data.get("name"):
        return jsonify({
            "error": "name is required"
        }), 400

    try:
        reliability_score = float(
            data.get("reliability_score", 0)
        )

        average_delivery_days = float(
            data.get("average_delivery_days", 0)
        )

        if reliability_score < 0 or reliability_score > 100:
            return jsonify({
                "error": "Reliability score must be between 0 and 100"
            }), 400

        if average_delivery_days < 0:
            return jsonify({
                "error": "Average delivery days cannot be negative"
            }), 400

        supplier = Supplier(
            name=data["name"].strip(),
            email=data.get("email"),
            phone=data.get("phone"),
            address=data.get("address"),
            reliability_score=reliability_score,
            average_delivery_days=average_delivery_days
        )

        created_supplier = SupplierService.create_supplier(
            supplier
        )

        return jsonify(
            created_supplier.to_dict()
        ), 201

    except ValueError:
        return jsonify({
            "error": "Reliability score and delivery days must be valid numbers"
        }), 400

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 400


@supplier_bp.route("/<int:supplier_id>", methods=["PUT"])
def update_supplier(supplier_id):
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    if not data.get("name"):
        return jsonify({
            "error": "name is required"
        }), 400

    try:
        reliability_score = float(
            data.get("reliability_score", 0)
        )

        average_delivery_days = float(
            data.get("average_delivery_days", 0)
        )

        if reliability_score < 0 or reliability_score > 100:
            return jsonify({
                "error": "Reliability score must be between 0 and 100"
            }), 400

        if average_delivery_days < 0:
            return jsonify({
                "error": "Average delivery days cannot be negative"
            }), 400

        supplier = Supplier(
            name=data["name"].strip(),
            email=data.get("email"),
            phone=data.get("phone"),
            address=data.get("address"),
            reliability_score=reliability_score,
            average_delivery_days=average_delivery_days,
            supplier_id=supplier_id
        )

        updated_supplier = SupplierService.update_supplier(
            supplier
        )

        if not updated_supplier:
            return jsonify({
                "error": "Supplier not found"
            }), 404

        return jsonify(
            updated_supplier.to_dict()
        )

    except ValueError:
        return jsonify({
            "error": "Reliability score and delivery days must be valid numbers"
        }), 400

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 400


@supplier_bp.route("/<int:supplier_id>", methods=["DELETE"])
def delete_supplier(supplier_id):
    try:
        deleted = SupplierService.delete_supplier(
            supplier_id
        )

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