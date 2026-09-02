from flask import Blueprint, jsonify
from services.transaction_service import TransactionService

transaction_bp = Blueprint(
    "transactions",
    __name__,
    url_prefix="/api/transactions"
)


@transaction_bp.route("", methods=["GET"])
def get_transactions():
    transactions = TransactionService.get_all_transactions()

    return jsonify([
        transaction.to_dict()
        for transaction in transactions
    ])


@transaction_bp.route("/<int:transaction_id>", methods=["GET"])
def get_transaction(transaction_id):
    transaction = TransactionService.get_transaction(transaction_id)

    if not transaction:
        return jsonify({
            "error": "Transaction not found"
        }), 404

    return jsonify(transaction.to_dict())