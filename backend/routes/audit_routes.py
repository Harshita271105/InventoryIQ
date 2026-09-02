from flask import Blueprint, request, jsonify
from services.audit_service import AuditService

audit_bp = Blueprint(
    "audit",
    __name__,
    url_prefix="/api/audit"
)


@audit_bp.route("", methods=["GET"])
def get_logs():
    limit = request.args.get("limit", 100, type=int)

    if limit <= 0 or limit > 500:
        return jsonify({
            "error": "limit must be between 1 and 500"
        }), 400

    return jsonify(
        AuditService.get_logs(limit)
    )