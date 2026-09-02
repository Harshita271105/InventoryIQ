from flask import Blueprint, jsonify
from services.stock_history_service import StockHistoryService

stock_history_bp = Blueprint(
    "stock_history",
    __name__,
    url_prefix="/api/stock-history"
)


@stock_history_bp.route("", methods=["GET"])
def get_all_history():
    return jsonify(
        StockHistoryService.get_all_history()
    )


@stock_history_bp.route("/product/<int:product_id>", methods=["GET"])
def get_product_history(product_id):
    return jsonify(
        StockHistoryService.get_product_history(product_id)
    )