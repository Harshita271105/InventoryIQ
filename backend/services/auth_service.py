from database import get_connection
from werkzeug.security import check_password_hash


class AuthService:

    @staticmethod
    def login(email, password):
        connection = get_connection()

        try:
            user = connection.execute("""
                SELECT
                    id,
                    name,
                    email,
                    password_hash,
                    role
                FROM users
                WHERE email = ?
            """, (email,)).fetchone()

            if not user:
                return None

            if not check_password_hash(
                user["password_hash"],
                password
            ):
                return None

            return {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            }

        finally:
            connection.close()

    @staticmethod
    def get_user(user_id):
        connection = get_connection()

        try:
            user = connection.execute("""
                SELECT
                    id,
                    name,
                    email,
                    role
                FROM users
                WHERE id = ?
            """, (user_id,)).fetchone()

            if not user:
                return None

            return {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            }

        finally:
            connection.close()