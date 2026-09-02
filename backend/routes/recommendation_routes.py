from flask import Blueprint, jsonify
from services.recommendation_service import RecommendationService

recommendation_bp = Blueprint(
    "recommendations",
    __name__,
    url_prefix="/api/recommendations"
)


@recommendation_bp.route("/reorder", methods=["GET"])
def reorder_recommendations():
    return jsonify(
        RecommendationService.get_reorder_recommendations()
    )