from database import get_connection


class StockHistoryService:

    @staticmethod
    def get_product_history(product_id):
        connection = get_connection()

        try:
            rows = connection.execute("""
                SELECT
                    sh.id,
                    sh.product_id,
                    sh.transaction_id,
                    sh.change_type,
                    sh.quantity_change,
                    sh.stock_after,
                    t.type AS transaction_type,
                    t.unit_price,
                    t.total_amount,
                    t.notes,
                    t.transaction_date
                FROM stock_history sh
                LEFT JOIN transactions t
                    ON sh.transaction_id = t.id
                WHERE sh.product_id = ?
                ORDER BY t.transaction_date DESC
            """, (product_id,)).fetchall()

            return [
                {
                    "id": row["id"],
                    "product_id": row["product_id"],
                    "transaction_id": row["transaction_id"],
                    "change_type": row["change_type"],
                    "quantity_change": row["quantity_change"],
                    "stock_after": row["stock_after"],
                    "transaction_type": row["transaction_type"],
                    "unit_price": row["unit_price"],
                    "total_amount": row["total_amount"],
                    "notes": row["notes"],
                    "transaction_date": row["transaction_date"]
                }
                for row in rows
            ]

        finally:
            connection.close()

    @staticmethod
    def get_all_history():
        connection = get_connection()

        try:
            rows = connection.execute("""
                SELECT
                    sh.id,
                    sh.product_id,
                    p.name AS product_name,
                    p.sku,
                    sh.transaction_id,
                    sh.change_type,
                    sh.quantity_change,
                    sh.stock_after,
                    t.type AS transaction_type,
                    t.unit_price,
                    t.total_amount,
                    t.notes,
                    t.transaction_date
                FROM stock_history sh
                JOIN products p
                    ON sh.product_id = p.id
                LEFT JOIN transactions t
                    ON sh.transaction_id = t.id
                ORDER BY t.transaction_date DESC
            """).fetchall()

            return [
                {
                    "id": row["id"],
                    "product_id": row["product_id"],
                    "product_name": row["product_name"],
                    "sku": row["sku"],
                    "transaction_id": row["transaction_id"],
                    "change_type": row["change_type"],
                    "quantity_change": row["quantity_change"],
                    "stock_after": row["stock_after"],
                    "transaction_type": row["transaction_type"],
                    "unit_price": row["unit_price"],
                    "total_amount": row["total_amount"],
                    "notes": row["notes"],
                    "transaction_date": row["transaction_date"]
                }
                for row in rows
            ]

        finally:
            connection.close()