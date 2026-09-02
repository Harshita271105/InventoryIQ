from flask import Blueprint, request, jsonify
from services.forecasting_service import ForecastingService

forecasting_bp = Blueprint(
    "forecasting",
    __name__,
    url_prefix="/api/forecasting"
)


@forecasting_bp.route("/product/<int:product_id>", methods=["GET"])
def forecast_product(product_id):
    days = request.args.get("days", 7, type=int)

    if days <= 0 or days > 90:
        return jsonify({
            "error": "days must be between 1 and 90"
        }), 400

    try:
        forecast = ForecastingService.forecast_product(
            product_id,
            days
        )

        return jsonify(forecast)

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 404


@forecasting_bp.route("/all", methods=["GET"])
def forecast_all_products():
    days = request.args.get("days", 7, type=int)

    if days <= 0 or days > 90:
        return jsonify({
            "error": "days must be between 1 and 90"
        }), 400

    try:
        forecasts = ForecastingService.forecast_all_products(days)

        return jsonify(forecasts)

    except Exception as error:
        return jsonify({
            "error": str(error)
        }), 400