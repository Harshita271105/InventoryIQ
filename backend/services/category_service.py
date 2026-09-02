from database import get_connection
from models.category import Category


class CategoryService:

    @staticmethod
    def create_category(category):
        connection = get_connection()

        try:
            cursor = connection.execute("""
                INSERT INTO categories (
                    name,
                    description
                )
                VALUES (?, ?)
            """, (
                category.name,
                category.description
            ))

            connection.commit()

            category.id = cursor.lastrowid

            return category

        finally:
            connection.close()

    @staticmethod
    def get_all_categories():
        connection = get_connection()

        try:
            rows = connection.execute("""
                SELECT *
                FROM categories
                ORDER BY name
            """).fetchall()

            categories = []

            for row in rows:
                category = Category(
                    name=row["name"],
                    description=row["description"],
                    category_id=row["id"]
                )

                categories.append(category)

            return categories

        finally:
            connection.close()

    @staticmethod
    def update_category(category):
        connection = get_connection()

        try:
            connection.execute("""
                UPDATE categories
                SET
                    name = ?,
                    description = ?
                WHERE id = ?
            """, (
                category.name,
                category.description,
                category.id
            ))

            connection.commit()

            return category

        finally:
            connection.close()

    @staticmethod
    def delete_category(category_id):
        connection = get_connection()

        try:
            cursor = connection.execute("""
                DELETE FROM categories
                WHERE id = ?
            """, (category_id,))

            connection.commit()

            return cursor.rowcount > 0

        finally:
            connection.close()