from database import get_connection


class ReportService:

    @staticmethod
    def inventory_summary():
        connection = get_connection()

        try:
            row = connection.execute("""
                SELECT
                    COUNT(*) AS total_products,
                    COALESCE(SUM(current_stock), 0) AS total_units,
                    COALESCE(SUM(current_stock * unit_price), 0) AS inventory_value,
                    COALESCE(SUM(
                        CASE
                            WHEN current_stock <= reorder_level
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

            return dict(row)

        finally:
            connection.close()

    @staticmethod
    def stock_movement():
        connection = get_connection()

        try:
            rows = connection.execute("""
                SELECT
                    type,
                    SUM(quantity) AS quantity,
                    COUNT(*) AS transactions
                FROM transactions
                GROUP BY type
                ORDER BY type
            """).fetchall()

            return [dict(row) for row in rows]

        finally:
            connection.close()

    @staticmethod
    def sales_report():
        connection = get_connection()

        try:
            row = connection.execute("""
                SELECT
                    COUNT(*) AS transactions,
                    COALESCE(SUM(quantity), 0) AS units_sold,
                    COALESCE(SUM(total_amount), 0) AS total_sales
                FROM transactions
                WHERE type = 'SALE'
            """).fetchone()

            return dict(row)

        finally:
            connection.close()

    @staticmethod
    def purchase_report():
        connection = get_connection()

        try:
            row = connection.execute("""
                SELECT
                    COUNT(*) AS transactions,
                    COALESCE(SUM(quantity), 0) AS units_purchased,
                    COALESCE(SUM(total_amount), 0) AS total_purchases
                FROM transactions
                WHERE type = 'PURCHASE'
            """).fetchone()

            return dict(row)

        finally:
            connection.close()

    @staticmethod
    def low_stock_report():
        connection = get_connection()

        try:
            rows = connection.execute("""
                SELECT
                    id,
                    name,
                    sku,
                    current_stock,
                    reorder_level,
                    unit_price
                FROM products
                WHERE current_stock > 0
                  AND current_stock <= reorder_level
                ORDER BY current_stock ASC
            """).fetchall()

            return [dict(row) for row in rows]

        finally:
            connection.close()

    @staticmethod
    def dead_stock_report():
        connection = get_connection()

        try:
            rows = connection.execute("""
                SELECT
                    p.id,
                    p.name,
                    p.sku,
                    p.current_stock,
                    p.unit_price,
                    p.current_stock * p.unit_price AS inventory_value
                FROM products p
                WHERE p.current_stock > 0
                  AND NOT EXISTS (
                      SELECT 1
                      FROM transactions t
                      WHERE t.product_id = p.id
                        AND t.type = 'SALE'
                  )
                ORDER BY inventory_value DESC
            """).fetchall()

            return [dict(row) for row in rows]

        finally:
            connection.close()

    @staticmethod
    def supplier_performance():
        connection = get_connection()

        try:
            rows = connection.execute("""
                SELECT
                    s.id,
                    s.name,
                    s.email,
                    s.phone,
                    COUNT(DISTINCT p.id) AS products_supplied,
                    COALESCE(SUM(
                        CASE
                            WHEN t.type = 'PURCHASE'
                            THEN t.quantity
                            ELSE 0
                        END
                    ), 0) AS units_purchased,
                    COALESCE(SUM(
                        CASE
                            WHEN t.type = 'PURCHASE'
                            THEN t.total_amount
                            ELSE 0
                        END
                    ), 0) AS purchase_value
                FROM suppliers s
                LEFT JOIN products p
                    ON p.supplier_id = s.id
                LEFT JOIN transactions t
                    ON t.product_id = p.id
                GROUP BY
                    s.id,
                    s.name,
                    s.email,
                    s.phone
                ORDER BY purchase_value DESC
            """).fetchall()

            return [dict(row) for row in rows]

        finally:
            connection.close()