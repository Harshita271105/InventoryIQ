
import os
from pathlib import Path

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS

from routes.product_routes import product_bp
from routes.supplier_routes import supplier_bp
from routes.inventory_routes import inventory_bp
from routes.transaction_routes import transaction_bp
from routes.category_routes import category_bp
from routes.analytics_routes import analytics_bp
from routes.alert_routes import alert_bp
from routes.forecasting_routes import forecasting_bp
from routes.stock_history_routes import stock_history_bp
from routes.supplier_analytics_routes import supplier_analytics_bp
from routes.report_routes import report_bp
from routes.advanced_analytics_routes import advanced_analytics_bp
from routes.recommendation_routes import recommendation_bp
from database import initialize_database
from routes.audit_routes import audit_bp
from routes.search_routes import search_bp
from routes.export_routes import export_bp
from routes.auth_routes import auth_bp


app = Flask(__name__)
CORS(app)

FRONTEND_DIST = Path(
    os.environ.get(
        "FRONTEND_DIST",
        str(Path(__file__).resolve().parent.parent / "dist")
    )
).resolve()

initialize_database()

app.register_blueprint(auth_bp)
app.register_blueprint(export_bp)
app.register_blueprint(search_bp)
app.register_blueprint(audit_bp)
app.register_blueprint(product_bp)
app.register_blueprint(supplier_bp)
app.register_blueprint(inventory_bp)
app.register_blueprint(transaction_bp)
app.register_blueprint(category_bp)
app.register_blueprint(analytics_bp)
app.register_blueprint(alert_bp)
app.register_blueprint(forecasting_bp)
app.register_blueprint(stock_history_bp)
app.register_blueprint(supplier_analytics_bp)
app.register_blueprint(report_bp)
app.register_blueprint(advanced_analytics_bp)
app.register_blueprint(recommendation_bp)


@app.route("/")
def home():
    if (FRONTEND_DIST / "index.html").is_file():
        return send_from_directory(str(FRONTEND_DIST), "index.html")

    return jsonify({
        "message": "InventoryIQ API is running",
        "frontend": "Build not found"
    })


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "InventoryIQ API"
    })


@app.route("/<path:path>")
def serve_frontend(path):
    # Do not return the frontend for unknown API endpoints.
    if path == "api" or path.startswith("api/"):
        return jsonify({"error": "API endpoint not found"}), 404

    requested_file = (FRONTEND_DIST / path).resolve()

    # Prevent requests from accessing files outside the frontend build.
    if (
        requested_file.is_relative_to(FRONTEND_DIST)
        and requested_file.is_file()
    ):
        return send_from_directory(str(FRONTEND_DIST), path)

    # Support React client-side routes.
    if (FRONTEND_DIST / "index.html").is_file():
        return send_from_directory(str(FRONTEND_DIST), "index.html")

    return jsonify({"error": "Frontend build not found"}), 404


if __name__ == "__main__":
    app.run(debug=True)
