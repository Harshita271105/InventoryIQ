from database import get_connection
from models.transaction import Transaction


class TransactionService:

    @staticmethod
    def create_transaction(transaction):
        connection = get_connection()

        try:
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
                transaction.product_id,
                transaction.user_id,
                transaction.type,
                transaction.quantity,
                transaction.unit_price,
                transaction.total_amount,
                transaction.notes
            ))

            connection.commit()

            transaction.id = cursor.lastrowid

            return transaction

        finally:
            connection.close()

    @staticmethod
    def get_all_transactions():
        connection = get_connection()

        try:
            rows = connection.execute("""
                SELECT *
                FROM transactions
                ORDER BY transaction_date DESC
            """).fetchall()

            transactions = []

            for row in rows:
                transaction = Transaction(
                    product_id=row["product_id"],
                    transaction_type=row["type"],
                    quantity=row["quantity"],
                    unit_price=row["unit_price"],
                    total_amount=row["total_amount"],
                    user_id=row["user_id"],
                    notes=row["notes"],
                    transaction_id=row["id"],
                    transaction_date=row["transaction_date"]
                )

                transactions.append(transaction)

            return transactions

        finally:
            connection.close()

    @staticmethod
    def get_transaction(transaction_id):
        connection = get_connection()

        try:
            row = connection.execute("""
                SELECT *
                FROM transactions
                WHERE id = ?
            """, (transaction_id,)).fetchone()

            if not row:
                return None

            return Transaction(
                product_id=row["product_id"],
                transaction_type=row["type"],
                quantity=row["quantity"],
                unit_price=row["unit_price"],
                total_amount=row["total_amount"],
                user_id=row["user_id"],
                notes=row["notes"],
                transaction_id=row["id"],
                transaction_date=row["transaction_date"]
            )

        finally:
            connection.close()