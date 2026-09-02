import csv
import io
from database import get_connection


class ExportService:

    @staticmethod
    def export_products():
        connection = get_connection()

        try:
            rows = connection.execute("""
                SELECT
                    p.id,
                    p.name,
                    p.sku,
                    c.name AS category,
                    s.name AS supplier,
                    p.unit_price,
                    p.current_stock,
                    p.reorder_level,
                    p.current_stock * p.unit_price AS inventory_value
                FROM products p
                LEFT JOIN categories c
                    ON p.category_id = c.id
                LEFT JOIN suppliers s
                    ON p.supplier_id = s.id
                ORDER BY p.id
            """).fetchall()

            output = io.StringIO()
            writer = csv.writer(output)

            writer.writerow([
                "ID",
                "Product Name",
                "SKU",
                "Category",
                "Supplier",
                "Unit Price",
                "Current Stock",
                "Reorder Level",
                "Inventory Value"
            ])

            for row in rows:
                writer.writerow([
                    row["id"],
                    row["name"],
                    row["sku"],
                    row["category"],
                    row["supplier"],
                    row["unit_price"],
                    row["current_stock"],
                    row["reorder_level"],
                    row["inventory_value"]
                ])

            return output.getvalue()

        finally:
            connection.close()

    @staticmethod
    def export_transactions():
        connection = get_connection()

        try:
            rows = connection.execute("""
                SELECT
                    t.id,
                    p.name AS product_name,
                    p.sku,
                    t.type,
                    t.quantity,
                    t.unit_price,
                    t.total_amount,
                    t.transaction_date,
                    t.notes
                FROM transactions t
                JOIN products p
                    ON t.product_id = p.id
                ORDER BY t.transaction_date DESC
            """).fetchall()

            output = io.StringIO()
            writer = csv.writer(output)

            writer.writerow([
                "Transaction ID",
                "Product",
                "SKU",
                "Type",
                "Quantity",
                "Unit Price",
                "Total Amount",
                "Transaction Date",
                "Notes"
            ])

            for row in rows:
                writer.writerow([
                    row["id"],
                    row["product_name"],
                    row["sku"],
                    row["type"],
                    row["quantity"],
                    row["unit_price"],
                    row["total_amount"],
                    row["transaction_date"],
                    row["notes"]
                ])

            return output.getvalue()

        finally:
            connection.close()