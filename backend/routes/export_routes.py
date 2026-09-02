from flask import Blueprint, Response
from services.export_service import ExportService

export_bp = Blueprint(
    "export",
    __name__,
    url_prefix="/api/export"
)


@export_bp.route("/products", methods=["GET"])
def export_products():
    csv_data = ExportService.export_products()

    return Response(
        csv_data,
        mimetype="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=inventory_products.csv"
        }
    )


@export_bp.route("/transactions", methods=["GET"])
def export_transactions():
    csv_data = ExportService.export_transactions()

    return Response(
        csv_data,
        mimetype="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=inventory_transactions.csv"
        }
    )