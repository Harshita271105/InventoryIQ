from database import get_connection


class RecommendationService:

    @staticmethod
    def get_reorder_recommendations():
        connection = get_connection()

        try:
            products = connection.execute("""
                SELECT
                    id,
                    name,
                    sku,
                    current_stock,
                    reorder_level,
                    unit_price
                FROM products
                ORDER BY current_stock ASC
            """).fetchall()

            recommendations = []

            for product in products:
                sales = connection.execute("""
                    SELECT
                        COALESCE(SUM(quantity), 0) AS units_sold,
                        COUNT(*) AS sales_count
                    FROM transactions
                    WHERE product_id = ?
                    AND type = 'SALE'
                """, (product["id"],)).fetchone()

                units_sold = sales["units_sold"]
                sales_count = sales["sales_count"]

                if sales_count > 0:
                    average_sale_quantity = units_sold / sales_count
                else:
                    average_sale_quantity = 0

                current_stock = product["current_stock"]
                reorder_level = product["reorder_level"]

                if current_stock == 0:
                    priority = "CRITICAL"
                elif current_stock <= reorder_level * 0.5:
                    priority = "HIGH"
                elif current_stock <= reorder_level:
                    priority = "MEDIUM"
                else:
                    priority = "LOW"

                if average_sale_quantity > 0:
                    recommended_quantity = max(
                        reorder_level * 2 - current_stock,
                        round(average_sale_quantity * 2)
                    )
                else:
                    recommended_quantity = max(
                        0,
                        reorder_level * 2 - current_stock
                    )

                if priority != "LOW":
                    recommendations.append({
                        "product_id": product["id"],
                        "product_name": product["name"],
                        "sku": product["sku"],
                        "current_stock": current_stock,
                        "reorder_level": reorder_level,
                        "units_sold": units_sold,
                        "average_sale_quantity": round(
                            average_sale_quantity,
                            2
                        ),
                        "priority": priority,
                        "recommended_quantity": recommended_quantity,
                        "estimated_order_value": round(
                            recommended_quantity * product["unit_price"],
                            2
                        )
                    })

            priority_order = {
                "CRITICAL": 1,
                "HIGH": 2,
                "MEDIUM": 3
            }

            recommendations.sort(
                key=lambda item: priority_order[item["priority"]]
            )

            return recommendations

        finally:
            connection.close()