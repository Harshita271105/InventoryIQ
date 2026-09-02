from flask import Blueprint, request, jsonify
from services.search_service import SearchService

search_bp = Blueprint(
    "search",
    __name__,
    url_prefix="/api/search"
)


@search_bp.route("", methods=["GET"])
def search():
    query = request.args.get("q", "").strip()

    if not query:
        return jsonify({
            "error": "Search query is required"
        }), 400

    if len(query) < 2:
        return jsonify({
            "error": "Search query must contain at least 2 characters"
        }), 400

    return jsonify(
        SearchService.search(query)
    )