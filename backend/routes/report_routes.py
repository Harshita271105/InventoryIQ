from flask import Blueprint, jsonify
from services.report_service import ReportService

report_bp = Blueprint(
    "reports",
    __name__,
    url_prefix="/api/reports"
)


@report_bp.route("/inventory-summary", methods=["GET"])
def inventory_summary():
    return jsonify(ReportService.inventory_summary())


@report_bp.route("/stock-movement", methods=["GET"])
def stock_movement():
    return jsonify(ReportService.stock_movement())


@report_bp.route("/sales", methods=["GET"])
def sales_report():
    return jsonify(ReportService.sales_report())


@report_bp.route("/purchases", methods=["GET"])
def purchase_report():
    return jsonify(ReportService.purchase_report())


@report_bp.route("/low-stock", methods=["GET"])
def low_stock_report():
    return jsonify(ReportService.low_stock_report())


@report_bp.route("/dead-stock", methods=["GET"])
def dead_stock_report():
    return jsonify(ReportService.dead_stock_report())

@report_bp.route("/supplier-performance", methods=["GET"])
def supplier_performance():
    return jsonify(ReportService.supplier_performance())