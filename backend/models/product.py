class Product:
    def __init__(
        self,
        name,
        sku,
        category_id,
        supplier_id,
        unit_price,
        current_stock=0,
        reorder_level=10,
        description=None,
        product_id=None
    ):
        self.id = product_id
        self.name = name
        self.sku = sku
        self.category_id = category_id
        self.supplier_id = supplier_id
        self.unit_price = unit_price
        self.current_stock = current_stock
        self.reorder_level = reorder_level
        self.description = description

    def inventory_value(self):
        return self.current_stock * self.unit_price

    def is_out_of_stock(self):
        return self.current_stock == 0

    def is_critical(self):
        return (
            self.current_stock > 0
            and self.current_stock <= self.reorder_level * 0.5
        )

    def is_low_stock(self):
        return (
            self.current_stock > 0
            and self.current_stock <= self.reorder_level
        )

    def get_stock_status(self):
        if self.is_out_of_stock():
            return "OUT_OF_STOCK"
        if self.is_critical():
            return "CRITICAL"
        if self.is_low_stock():
            return "LOW_STOCK"
        return "HEALTHY"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "sku": self.sku,
            "category_id": self.category_id,
            "supplier_id": self.supplier_id,
            "description": self.description,
            "unit_price": self.unit_price,
            "current_stock": self.current_stock,
            "reorder_level": self.reorder_level,
            "inventory_value": self.inventory_value(),
            "status": self.get_stock_status()
        }