from flask import Blueprint, request, jsonify
from services.advanced_analytics_service import AdvancedAnalyticsService

advanced_analytics_bp = Blueprint(
    "advanced_analytics",
    __name__,
    url_prefix="/api/advanced-analytics"
)


@advanced_analytics_bp.route("/top-products", methods=["GET"])
def top_products():
    limit = request.args.get("limit", 10, type=int)

    if limit <= 0 or limit > 100:
        return jsonify({
            "error": "limit must be between 1 and 100"
        }), 400

    return jsonify(
        AdvancedAnalyticsService.get_top_products(limit)
    )


@advanced_analytics_bp.route("/turnover", methods=["GET"])
def inventory_turnover():
    return jsonify(
        AdvancedAnalyticsService.get_inventory_turnover()
    )


@advanced_analytics_bp.route("/recent-activity", methods=["GET"])
def recent_activity():
    limit = request.args.get("limit", 10, type=int)

    if limit <= 0 or limit > 100:
        return jsonify({
            "error": "limit must be between 1 and 100"
        }), 400

    return jsonify(
        AdvancedAnalyticsService.get_recent_activity(limit)
    )


@advanced_analytics_bp.route("/health", methods=["GET"])
def inventory_health():
    return jsonify(
        AdvancedAnalyticsService.get_inventory_health()
    )