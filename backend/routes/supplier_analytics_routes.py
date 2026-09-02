from flask import Blueprint, jsonify
from services.supplier_analytics_service import SupplierAnalyticsService

supplier_analytics_bp = Blueprint(
    "supplier_analytics",
    __name__,
    url_prefix="/api/supplier-analytics"
)


@supplier_analytics_bp.route("/performance", methods=["GET"])
def supplier_performance():
    return jsonify(
        SupplierAnalyticsService.get_supplier_performance()
    )