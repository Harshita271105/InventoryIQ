from database import get_connection


class AlertService:

    @staticmethod
    def get_low_stock_alerts():
        connection = get_connection()

        try:
            rows = connection.execute("""
                SELECT
                    id,
                    name,
                    sku,
                    current_stock,
                    reorder_level,
                    unit_price
                FROM products
                WHERE current_stock <= reorder_level
                ORDER BY current_stock ASC
            """).fetchall()

            alerts = []

            for row in rows:
                if row["current_stock"] == 0:
                    severity = "CRITICAL"
                    message = "Product is out of stock"
                elif row["current_stock"] <= row["reorder_level"] * 0.5:
                    severity = "HIGH"
                    message = "Stock is critically low"
                else:
                    severity = "MEDIUM"
                    message = "Stock is running low"

                alerts.append({
                    "product_id": row["id"],
                    "name": row["name"],
                    "sku": row["sku"],
                    "current_stock": row["current_stock"],
                    "reorder_level": row["reorder_level"],
                    "unit_price": row["unit_price"],
                    "severity": severity,
                    "message": message
                })

            return alerts

        finally:
            connection.close()

    @staticmethod
    def get_alert_summary():
        alerts = AlertService.get_low_stock_alerts()

        return {
            "total_alerts": len(alerts),
            "critical": sum(
                1 for alert in alerts
                if alert["severity"] == "CRITICAL"
            ),
            "high": sum(
                1 for alert in alerts
                if alert["severity"] == "HIGH"
            ),
            "medium": sum(
                1 for alert in alerts
                if alert["severity"] == "MEDIUM"
            )
        }