from database import get_connection


class SearchService:

    @staticmethod
    def search(query):
        connection = get_connection()

        try:
            search_term = f"%{query}%"

            products = connection.execute("""
                SELECT
                    id,
                    name,
                    sku,
                    current_stock,
                    unit_price
                FROM products
                WHERE name LIKE ?
                   OR sku LIKE ?
                ORDER BY name
                LIMIT 20
            """, (search_term, search_term)).fetchall()

            suppliers = connection.execute("""
                SELECT
                    id,
                    name,
                    email,
                    phone
                FROM suppliers
                WHERE name LIKE ?
                   OR email LIKE ?
                ORDER BY name
                LIMIT 20
            """, (search_term, search_term)).fetchall()

            categories = connection.execute("""
                SELECT
                    id,
                    name,
                    description
                FROM categories
                WHERE name LIKE ?
                   OR description LIKE ?
                ORDER BY name
                LIMIT 20
            """, (search_term, search_term)).fetchall()

            return {
                "query": query,
                "products": [
                    {
                        "id": row["id"],
                        "name": row["name"],
                        "sku": row["sku"],
                        "current_stock": row["current_stock"],
                        "unit_price": row["unit_price"]
                    }
                    for row in products
                ],
                "suppliers": [
                    {
                        "id": row["id"],
                        "name": row["name"],
                        "email": row["email"],
                        "phone": row["phone"]
                    }
                    for row in suppliers
                ],
                "categories": [
                    {
                        "id": row["id"],
                        "name": row["name"],
                        "description": row["description"]
                    }
                    for row in categories
                ]
            }

        finally:
            connection.close()