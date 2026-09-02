class Supplier:
    def __init__(
        self,
        name,
        email=None,
        phone=None,
        address=None,
        reliability_score=0,
        average_delivery_days=0,
        supplier_id=None
    ):
        self.id = supplier_id
        self.name = name
        self.email = email
        self.phone = phone
        self.address = address
        self.reliability_score = reliability_score
        self.average_delivery_days = average_delivery_days

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "address": self.address,
            "reliability_score": self.reliability_score,
            "average_delivery_days": self.average_delivery_days
        }