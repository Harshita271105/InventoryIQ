from database import get_connection
from models.supplier import Supplier


class SupplierService:

    @staticmethod
    def create_supplier(supplier):
        connection = get_connection()

        try:
            cursor = connection.execute("""
                INSERT INTO suppliers (
                    name,
                    email,
                    phone,
                    address,
                    reliability_score,
                    average_delivery_days
                )
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                supplier.name,
                supplier.email,
                supplier.phone,
                supplier.address,
                supplier.reliability_score,
                supplier.average_delivery_days
            ))

            connection.commit()

            supplier.id = cursor.lastrowid

            return supplier

        finally:
            connection.close()

    @staticmethod
    def get_all_suppliers():
        connection = get_connection()

        try:
            rows = connection.execute("""
                SELECT *
                FROM suppliers
                ORDER BY id
            """).fetchall()

            suppliers = []

            for row in rows:
                supplier = Supplier(
                    name=row["name"],
                    email=row["email"],
                    phone=row["phone"],
                    address=row["address"],
                    reliability_score=row["reliability_score"],
                    average_delivery_days=row["average_delivery_days"],
                    supplier_id=row["id"]
                )

                suppliers.append(supplier)

            return suppliers

        finally:
            connection.close()

    @staticmethod
    def update_supplier(supplier):
        connection = get_connection()

        try:
            connection.execute("""
                UPDATE suppliers
                SET
                    name = ?,
                    email = ?,
                    phone = ?,
                    address = ?,
                    reliability_score = ?,
                    average_delivery_days = ?
                WHERE id = ?
            """, (
                supplier.name,
                supplier.email,
                supplier.phone,
                supplier.address,
                supplier.reliability_score,
                supplier.average_delivery_days,
                supplier.id
            ))

            connection.commit()

            return supplier

        finally:
            connection.close()

    @staticmethod
    def delete_supplier(supplier_id):
        connection = get_connection()

        try:
            cursor = connection.execute("""
                DELETE FROM suppliers
                WHERE id = ?
            """, (supplier_id,))

            connection.commit()

            return cursor.rowcount > 0

        finally:
            connection.close()