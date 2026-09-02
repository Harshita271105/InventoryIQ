from flask import Blueprint, request, jsonify
from services.auth_service import AuthService

auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth"
)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "error": "Email and password are required"
        }), 400

    user = AuthService.login(email, password)

    if not user:
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    return jsonify({
        "message": "Login successful",
        "user": user
    })


@auth_bp.route("/user/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = AuthService.get_user(user_id)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    return jsonify(user)