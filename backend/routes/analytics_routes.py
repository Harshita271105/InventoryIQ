from flask import Blueprint, jsonify
from services.analytics_service import AnalyticsService

analytics_bp = Blueprint(
    "analytics",
    __name__,
    url_prefix="/api/analytics"
)


@analytics_bp.route("/dashboard", methods=["GET"])
def dashboard():
    return jsonify(
        AnalyticsService.dashboard_summary()
    )