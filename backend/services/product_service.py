from database import get_connection
from models.product import Product


class ProductService:

    @staticmethod
    def create_product(product):
        connection = get_connection()

        try:
            cursor = connection.execute("""
                INSERT INTO products (
                    name,
                    sku,
                    category_id,
                    supplier_id,
                    description,
                    unit_price,
                    current_stock,
                    reorder_level
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                product.name,
                product.sku,
                product.category_id,
                product.supplier_id,
                product.description,
                product.unit_price,
                product.current_stock,
                product.reorder_level
            ))

            connection.commit()

            product.id = cursor.lastrowid

            return product

        finally:
            connection.close()

    @staticmethod
    def get_all_products():
        connection = get_connection()

        try:
            cursor = connection.execute("""
                SELECT *
                FROM products
                ORDER BY id
            """)

            rows = cursor.fetchall()

            products = []

            for row in rows:
                product = Product(
                    name=row["name"],
                    sku=row["sku"],
                    category_id=row["category_id"],
                    supplier_id=row["supplier_id"],
                    description=row["description"],
                    unit_price=row["unit_price"],
                    current_stock=row["current_stock"],
                    reorder_level=row["reorder_level"],
                    product_id=row["id"]
                )

                products.append(product)

            return products

        finally:
            connection.close()

    @staticmethod
    def search_products(search=None, status=None, category_id=None, sort_by="id", order="asc"):
        connection = get_connection()

        try:
            query = "SELECT * FROM products WHERE 1=1"
            parameters = []

            if search:
                query += """
                    AND (
                        name LIKE ?
                        OR sku LIKE ?
                    )
                """
                search_value = f"%{search}%"
                parameters.extend([search_value, search_value])

            if category_id:
                query += " AND category_id = ?"
                parameters.append(category_id)

            allowed_sort_columns = {
                "id": "id",
                "name": "name",
                "price": "unit_price",
                "stock": "current_stock",
                "reorder_level": "reorder_level"
            }

            sort_column = allowed_sort_columns.get(sort_by, "id")
            sort_order = "DESC" if order.lower() == "desc" else "ASC"

            query += f" ORDER BY {sort_column} {sort_order}"

            rows = connection.execute(
                query,
                parameters
            ).fetchall()

            products = []

            for row in rows:
                product = Product(
                    name=row["name"],
                    sku=row["sku"],
                    category_id=row["category_id"],
                    supplier_id=row["supplier_id"],
                    description=row["description"],
                    unit_price=row["unit_price"],
                    current_stock=row["current_stock"],
                    reorder_level=row["reorder_level"],
                    product_id=row["id"]
                )

                if status and product.get_stock_status() != status.upper():
                    continue

                products.append(product)

            return products

        finally:
            connection.close()

    @staticmethod
    def update_product(product):
        connection = get_connection()

        try:
            connection.execute("""
                UPDATE products
                SET
                    name = ?,
                    sku = ?,
                    category_id = ?,
                    supplier_id = ?,
                    description = ?,
                    unit_price = ?,
                    current_stock = ?,
                    reorder_level = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (
                product.name,
                product.sku,
                product.category_id,
                product.supplier_id,
                product.description,
                product.unit_price,
                product.current_stock,
                product.reorder_level,
                product.id
            ))

            connection.commit()

            return product

        finally:
            connection.close()

    @staticmethod
    def delete_product(product_id):
        connection = get_connection()

        try:
            cursor = connection.execute("""
                DELETE FROM products
                WHERE id = ?
            """, (product_id,))

            connection.commit()

            return cursor.rowcount > 0

        finally:
            connection.close()