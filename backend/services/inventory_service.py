from database import get_connection
from models.transaction import Transaction


class InventoryService:

    @staticmethod
    def process_stock_in(product_id, quantity, unit_price, user_id=None, notes=None):
        connection = get_connection()

        try:
            product = connection.execute("""
                SELECT *
                FROM products
                WHERE id = ?
            """, (product_id,)).fetchone()

            if not product:
                raise ValueError("Product not found")

            new_stock = product["current_stock"] + quantity
            total_amount = quantity * unit_price

            cursor = connection.execute("""
                INSERT INTO transactions (
                    product_id,
                    user_id,
                    type,
                    quantity,
                    unit_price,
                    total_amount,
                    notes
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                product_id,
                user_id,
                "PURCHASE",
                quantity,
                unit_price,
                total_amount,
                notes
            ))

            transaction_id = cursor.lastrowid

            connection.execute("""
                UPDATE products
                SET
                    current_stock = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (
                new_stock,
                product_id
            ))

            connection.execute("""
                INSERT INTO stock_history (
                    product_id,
                    transaction_id,
                    change_type,
                    quantity_change,
                    stock_after
                )
                VALUES (?, ?, ?, ?, ?)
            """, (
                product_id,
                transaction_id,
                "STOCK_IN",
                quantity,
                new_stock
            ))

            connection.commit()

            return {
                "transaction_id": transaction_id,
                "product_id": product_id,
                "previous_stock": product["current_stock"],
                "quantity_added": quantity,
                "new_stock": new_stock,
                "total_amount": total_amount
            }

        except Exception:
            connection.rollback()
            raise

        finally:
            connection.close()

    @staticmethod
    def process_stock_out(product_id, quantity, unit_price, user_id=None, notes=None):
        connection = get_connection()

        try:
            product = connection.execute("""
                SELECT *
                FROM products
                WHERE id = ?
            """, (product_id,)).fetchone()

            if not product:
                raise ValueError("Product not found")

            current_stock = product["current_stock"]

            if quantity > current_stock:
                raise ValueError(
                    f"Insufficient stock. Available: {current_stock}, Requested: {quantity}"
                )

            new_stock = current_stock - quantity
            total_amount = quantity * unit_price

            cursor = connection.execute("""
                INSERT INTO transactions (
                    product_id,
                    user_id,
                    type,
                    quantity,
                    unit_price,
                    total_amount,
                    notes
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                product_id,
                user_id,
                "SALE",
                quantity,
                unit_price,
                total_amount,
                notes
            ))

            transaction_id = cursor.lastrowid

            connection.execute("""
                UPDATE products
                SET
                    current_stock = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (
                new_stock,
                product_id
            ))

            connection.execute("""
                INSERT INTO stock_history (
                    product_id,
                    transaction_id,
                    change_type,
                    quantity_change,
                    stock_after
                )
                VALUES (?, ?, ?, ?, ?)
            """, (
                product_id,
                transaction_id,
                "STOCK_OUT",
                -quantity,
                new_stock
            ))

            connection.commit()

            return {
                "transaction_id": transaction_id,
                "product_id": product_id,
                "previous_stock": current_stock,
                "quantity_removed": quantity,
                "new_stock": new_stock,
                "total_amount": total_amount
            }

        except Exception:
            connection.rollback()
            raise

        finally:
            connection.close()

    @staticmethod
    def process_return(product_id, quantity, unit_price, user_id=None, notes=None):
        connection = get_connection()

        try:
            product = connection.execute("""
                SELECT *
                FROM products
                WHERE id = ?
            """, (product_id,)).fetchone()

            if not product:
                raise ValueError("Product not found")

            new_stock = product["current_stock"] + quantity
            total_amount = quantity * unit_price

            cursor = connection.execute("""
                INSERT INTO transactions (
                    product_id,
                    user_id,
                    type,
                    quantity,
                    unit_price,
                    total_amount,
                    notes
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                product_id,
                user_id,
                "RETURN",
                quantity,
                unit_price,
                total_amount,
                notes
            ))

            transaction_id = cursor.lastrowid

            connection.execute("""
                UPDATE products
                SET
                    current_stock = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (
                new_stock,
                product_id
            ))

            connection.execute("""
                INSERT INTO stock_history (
                    product_id,
                    transaction_id,
                    change_type,
                    quantity_change,
                    stock_after
                )
                VALUES (?, ?, ?, ?, ?)
            """, (
                product_id,
                transaction_id,
                "RETURN",
                quantity,
                new_stock
            ))

            connection.commit()

            return {
                "transaction_id": transaction_id,
                "product_id": product_id,
                "previous_stock": product["current_stock"],
                "quantity_returned": quantity,
                "new_stock": new_stock,
                "total_amount": total_amount
            }

        except Exception:
            connection.rollback()
            raise

        finally:
            connection.close()