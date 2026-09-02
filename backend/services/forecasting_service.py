from database import get_connection


class ForecastingService:

    @staticmethod
    def forecast_product(product_id, days=7):
        connection = get_connection()

        try:
            product = connection.execute("""
                SELECT *
                FROM products
                WHERE id = ?
            """, (product_id,)).fetchone()

            if not product:
                raise ValueError("Product not found")

            sales = connection.execute("""
                SELECT
                    DATE(transaction_date) AS sale_date,
                    SUM(quantity) AS quantity
                FROM transactions
                WHERE product_id = ?
                AND type = 'SALE'
                GROUP BY DATE(transaction_date)
                ORDER BY sale_date DESC
                LIMIT 30
            """, (product_id,)).fetchall()

            total_sold = sum(
                row["quantity"]
                for row in sales
            )

            days_with_sales = len(sales)

            if days_with_sales == 0:
                average_daily_demand = 0
            else:
                average_daily_demand = total_sold / days_with_sales

            predicted_demand = average_daily_demand * days

            current_stock = product["current_stock"]

            stockout_days = None

            if average_daily_demand > 0:
                stockout_days = current_stock / average_daily_demand

            if stockout_days is not None and stockout_days <= 3:
                risk = "CRITICAL"
            elif stockout_days is not None and stockout_days <= 7:
                risk = "HIGH"
            elif stockout_days is not None and stockout_days <= 14:
                risk = "MEDIUM"
            else:
                risk = "LOW"

            recommended_quantity = max(
                0,
                round(predicted_demand - current_stock)
            )

            return {
                "product_id": product_id,
                "product_name": product["name"],
                "current_stock": current_stock,
                "analysis_days": 30,
                "forecast_days": days,
                "total_units_sold": total_sold,
                "average_daily_demand": round(
                    average_daily_demand,
                    2
                ),
                "predicted_demand": round(
                    predicted_demand,
                    2
                ),
                "estimated_stockout_days": (
                    round(stockout_days, 2)
                    if stockout_days is not None
                    else None
                ),
                "stockout_risk": risk,
                "recommended_reorder_quantity": recommended_quantity
            }

        finally:
            connection.close()

    @staticmethod
    def forecast_all_products(days=7):
        connection = get_connection()

        try:
            products = connection.execute("""
                SELECT id
                FROM products
                ORDER BY id
            """).fetchall()

        finally:
            connection.close()

        forecasts = []

        for product in products:
            forecasts.append(
                ForecastingService.forecast_product(
                    product["id"],
                    days
                )
            )

        return forecasts