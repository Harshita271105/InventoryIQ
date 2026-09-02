from database import get_connection


class AuditService:

    @staticmethod
    def create_log(action, entity_type, entity_id=None, details=None):
        connection = get_connection()

        try:
            connection.execute("""
                INSERT INTO audit_logs (
                    action,
                    entity_type,
                    entity_id,
                    details
                )
                VALUES (?, ?, ?, ?)
            """, (
                action,
                entity_type,
                entity_id,
                details
            ))

            connection.commit()

        finally:
            connection.close()

    @staticmethod
    def get_logs(limit=100):
        connection = get_connection()

        try:
            rows = connection.execute("""
                SELECT *
                FROM audit_logs
                ORDER BY id DESC
                LIMIT ?
            """, (limit,)).fetchall()

            return [
                {
                    "id": row["id"],
                    "action": row["action"],
                    "entity_type": row["entity_type"],
                    "entity_id": row["entity_id"],
                    "details": row["details"]
                }
                for row in rows
            ]

        finally:
            connection.close()