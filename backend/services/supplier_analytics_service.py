from database import get_connection


class SupplierAnalyticsService:

    @staticmethod
    def get_supplier_performance():
        connection = get_connection()

        try:
            rows = connection.execute("""
                SELECT
                    s.id,
                    s.name,
                    s.email,
                    s.reliability_score,
                    s.average_delivery_days,
                    COUNT(
                        CASE
                            WHEN t.type = 'PURCHASE'
                            THEN t.id
                        END
                    ) AS purchase_count,
                    COALESCE(
                        SUM(
                            CASE
                                WHEN t.type = 'PURCHASE'
                                THEN t.total_amount
                                ELSE 0
                            END
                        ),
                        0
                    ) AS total_purchase_value
                FROM suppliers s
                LEFT JOIN products p
                    ON p.supplier_id = s.id
                LEFT JOIN transactions t
                    ON t.product_id = p.id
                GROUP BY
                    s.id,
                    s.name,
                    s.email,
                    s.reliability_score,
                    s.average_delivery_days
                ORDER BY s.reliability_score DESC
            """).fetchall()

            return [
                {
                    "supplier_id": row["id"],
                    "supplier_name": row["name"],
                    "email": row["email"],
                    "reliability_score": row["reliability_score"],
                    "average_delivery_days": row["average_delivery_days"],
                    "purchase_count": row["purchase_count"],
                    "total_purchase_value": row["total_purchase_value"]
                }
                for row in rows
            ]

        finally:
            connection.close()