from database import get_connection


class AnalyticsService:

    @staticmethod
    def dashboard_summary():
        connection = get_connection()

        try:
            products = connection.execute("""
                SELECT
                    COUNT(*) AS total_products,
                    COALESCE(SUM(current_stock * unit_price), 0) AS inventory_value,
                    COALESCE(SUM(
                        CASE
                            WHEN current_stock > 0
                             AND current_stock <= reorder_level
                            THEN 1
                            ELSE 0
                        END
                    ), 0) AS low_stock_items,
                    COALESCE(SUM(
                        CASE
                            WHEN current_stock = 0
                            THEN 1
                            ELSE 0
                        END
                    ), 0) AS out_of_stock
                FROM products
            """).fetchone()

            sales = connection.execute("""
                SELECT
                    COALESCE(SUM(total_amount), 0) AS total_sales
                FROM transactions
                WHERE type = 'SALE'
            """).fetchone()

            purchases = connection.execute("""
                SELECT
                    COALESCE(SUM(total_amount), 0) AS total_purchases
                FROM transactions
                WHERE type = 'PURCHASE'
            """).fetchone()

            transactions = connection.execute("""
                SELECT
                    COUNT(*) AS total_transactions
                FROM transactions
            """).fetchone()

            return {
                "total_products": products["total_products"],
                "inventory_value": products["inventory_value"],
                "low_stock_items": products["low_stock_items"],
                "out_of_stock": products["out_of_stock"],
                "total_sales": sales["total_sales"],
                "total_purchases": purchases["total_purchases"],
                "total_transactions": transactions["total_transactions"]
            }

        finally:
            connection.close()