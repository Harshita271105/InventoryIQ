from database import get_connection


class AdvancedAnalyticsService:

    @staticmethod
    def get_top_products(limit=10):
        connection = get_connection()

        try:
            rows = connection.execute("""
                SELECT
                    p.id,
                    p.name,
                    p.sku,
                    p.current_stock,
                    COALESCE(
                        SUM(
                            CASE
                                WHEN t.type = 'SALE'
                                THEN t.quantity
                                ELSE 0
                            END
                        ),
                        0
                    ) AS units_sold,
                    COALESCE(
                        SUM(
                            CASE
                                WHEN t.type = 'SALE'
                                THEN t.total_amount
                                ELSE 0
                            END
                        ),
                        0
                    ) AS sales_value
                FROM products p
                LEFT JOIN transactions t
                    ON p.id = t.product_id
                GROUP BY
                    p.id,
                    p.name,
                    p.sku,
                    p.current_stock
                ORDER BY units_sold DESC
                LIMIT ?
            """, (limit,)).fetchall()

            return [
                {
                    "product_id": row["id"],
                    "name": row["name"],
                    "sku": row["sku"],
                    "current_stock": row["current_stock"],
                    "units_sold": row["units_sold"],
                    "sales_value": row["sales_value"]
                }
                for row in rows
            ]

        finally:
            connection.close()

    @staticmethod
    def get_inventory_turnover():
        connection = get_connection()

        try:
            sales = connection.execute("""
                SELECT
                    COALESCE(SUM(total_amount), 0) AS sales_value,
                    COALESCE(SUM(quantity), 0) AS units_sold
                FROM transactions
                WHERE type = 'SALE'
            """).fetchone()

            inventory = connection.execute("""
                SELECT
                    COALESCE(
                        SUM(current_stock * unit_price),
                        0
                    ) AS inventory_value
                FROM products
            """).fetchone()

            sales_value = sales["sales_value"]
            inventory_value = inventory["inventory_value"]

            if inventory_value > 0:
                turnover_ratio = sales_value / inventory_value
            else:
                turnover_ratio = 0

            return {
                "sales_value": sales_value,
                "inventory_value": inventory_value,
                "units_sold": sales["units_sold"],
                "turnover_ratio": round(turnover_ratio, 2)
            }

        finally:
            connection.close()

    @staticmethod
    def get_recent_activity(limit=10):
        connection = get_connection()

        try:
            rows = connection.execute("""
                SELECT
                    t.id,
                    t.type,
                    t.quantity,
                    t.total_amount,
                    t.notes,
                    t.transaction_date,
                    p.name AS product_name,
                    p.sku
                FROM transactions t
                JOIN products p
                    ON t.product_id = p.id
                ORDER BY t.transaction_date DESC
                LIMIT ?
            """, (limit,)).fetchall()

            return [
                {
                    "transaction_id": row["id"],
                    "type": row["type"],
                    "product_name": row["product_name"],
                    "sku": row["sku"],
                    "quantity": row["quantity"],
                    "total_amount": row["total_amount"],
                    "notes": row["notes"],
                    "transaction_date": row["transaction_date"]
                }
                for row in rows
            ]

        finally:
            connection.close()

    @staticmethod
    def get_inventory_health():
        connection = get_connection()

        try:
            products = connection.execute("""
                SELECT
                    current_stock,
                    reorder_level
                FROM products
            """).fetchall()

            if not products:
                return {
                    "health_score": 0,
                    "health_status": "NO DATA"
                }

            total = len(products)
            healthy = 0

            for product in products:
                stock = product["current_stock"]
                reorder = product["reorder_level"]

                if stock > reorder:
                    healthy += 1

            health_score = round(
                (healthy / total) * 100,
                2
            )

            if health_score >= 80:
                health_status = "HEALTHY"
            elif health_score >= 60:
                health_status = "MODERATE"
            else:
                health_status = "AT RISK"

            return {
                "health_score": health_score,
                "health_status": health_status,
                "total_products": total,
                "healthy_products": healthy
            }

        finally:
            connection.close()