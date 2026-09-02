class Transaction:
    def __init__(
        self,
        product_id,
        transaction_type,
        quantity,
        unit_price,
        total_amount=None,
        user_id=None,
        notes=None,
        transaction_id=None,
        transaction_date=None
    ):
        self.id = transaction_id
        self.product_id = product_id
        self.user_id = user_id
        self.type = transaction_type
        self.quantity = quantity
        self.unit_price = unit_price
        self.total_amount = (
            total_amount
            if total_amount is not None
            else quantity * unit_price
        )
        self.notes = notes
        self.transaction_date = transaction_date

    def calculate_total(self):
        return self.quantity * self.unit_price

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "user_id": self.user_id,
            "type": self.type,
            "quantity": self.quantity,
            "unit_price": self.unit_price,
            "total_amount": self.total_amount,
            "notes": self.notes,
            "transaction_date": self.transaction_date
        }