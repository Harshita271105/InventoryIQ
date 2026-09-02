from flask import Blueprint, jsonify
from services.alert_service import AlertService

alert_bp = Blueprint(
    "alerts",
    __name__,
    url_prefix="/api/alerts"
)


@alert_bp.route("", methods=["GET"])
def get_alerts():
    return jsonify(
        AlertService.get_low_stock_alerts()
    )


@alert_bp.route("/summary", methods=["GET"])
def get_alert_summary():
    return jsonify(
        AlertService.get_alert_summary()
    )