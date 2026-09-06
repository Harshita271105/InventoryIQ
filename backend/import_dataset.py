import csv
import sqlite3
from pathlib import Path
from collections import defaultdict
from math import ceil
from datetime import datetime


BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_PATH = BASE_DIR / "database" / "inventory.db"
DATASET_PATH = BASE_DIR / "data" / "raw" / "retail_store_inventory.csv"


def import_dataset():
    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATASET_PATH}"
        )

    connection = sqlite3.connect(DATABASE_PATH)
    connection.execute("PRAGMA foreign_keys = ON")

    try:
        with open(
            DATASET_PATH,
            "r",
            newline="",
            encoding="utf-8"
        ) as file:
            rows = list(csv.DictReader(file))

        print(f"Dataset records found: {len(rows)}")

        # ---------------------------------------------------------
        # Group records by Product ID + Category
        # ---------------------------------------------------------
        product_groups = defaultdict(list)

        for row in rows:
            key = (
                row["Product ID"].strip(),
                row["Category"].strip()
            )
            product_groups[key].append(row)

        print(
            f"Unique Product + Category combinations: "
            f"{len(product_groups)}"
        )

        # ---------------------------------------------------------
        # Clear previously imported inventory data
        # ---------------------------------------------------------
        connection.execute("DELETE FROM stock_history")
        connection.execute("DELETE FROM transactions")
        connection.execute("DELETE FROM products")
        connection.execute("DELETE FROM categories")
        connection.execute("DELETE FROM suppliers")

        # ---------------------------------------------------------
        # Create categories
        # ---------------------------------------------------------
        categories = sorted(
            {
                row["Category"].strip()
                for row in rows
            }
        )

        category_ids = {}

        for category in categories:
            cursor = connection.execute(
                """
                INSERT INTO categories (
                    name,
                    description
                )
                VALUES (?, ?)
                """,
                (
                    category,
                    "Category from Retail Store Inventory Forecasting Dataset"
                )
            )

            category_ids[category] = cursor.lastrowid

        print(f"Categories imported: {len(categories)}")

        # ---------------------------------------------------------
        # Create products
        # ---------------------------------------------------------
        product_ids = {}

        for (product_code, category), group in sorted(
            product_groups.items()
        ):
            # Find the latest dataset record for this product/category.
            latest_row = max(
                group,
                key=lambda row: row["Date"]
            )

            # Calculate average price.
            prices = [
                float(row["Price"])
                for row in group
                if row["Price"]
            ]

            average_price = (
                sum(prices) / len(prices)
                if prices
                else 0
            )

            # Calculate average demand forecast.
            forecasts = [
                float(row["Demand Forecast"])
                for row in group
                if row["Demand Forecast"]
            ]

            average_forecast = (
                sum(forecasts) / len(forecasts)
                if forecasts
                else 10
            )

            # Current stock comes from the latest dataset record.
            current_stock = int(
                float(latest_row["Inventory Level"])
            )

            # Reorder level is based on average demand forecast.
            reorder_level = max(
                1,
                ceil(average_forecast)
            )

            sku = f"{product_code}-{category}"

            # The public dataset does not provide product names,
            # so the displayed name is derived from Product ID + Category.
            product_name = f"{product_code} - {category}"

            description = (
                f"Public dataset product. "
                f"Product ID: {product_code}. "
                f"Category: {category}."
            )

            cursor = connection.execute(
                """
                INSERT INTO products (
                    name,
                    sku,
                    category_id,
                    supplier_id,
                    description,
                    unit_price,
                    current_stock,
                    reorder_level
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    product_name,
                    sku,
                    category_ids[category],
                    None,
                    description,
                    average_price,
                    current_stock,
                    reorder_level
                )
            )

            product_ids[
                (product_code, category)
            ] = cursor.lastrowid

        print(f"Products imported: {len(product_ids)}")

        # ---------------------------------------------------------
        # Import daily dataset records
        # ---------------------------------------------------------
        transaction_count = 0
        stock_history_count = 0

        for row in rows:
            product_key = (
                row["Product ID"].strip(),
                row["Category"].strip()
            )

            product_id = product_ids[product_key]

            # -----------------------------------------------------
            # Use the actual date from the public dataset.
            # Validate it before storing it in SQLite.
            # -----------------------------------------------------
            raw_date = row["Date"].strip()

            try:
                dataset_date = datetime.strptime(
                    raw_date,
                    "%Y-%m-%d"
                ).strftime("%Y-%m-%d")
            except ValueError:
                raise ValueError(
                    f"Invalid dataset date: {raw_date}"
                )

            units_sold = int(
                float(row["Units Sold"])
            )

            price = float(
                row["Price"]
            )

            total_amount = units_sold * price

            notes = (
                f"Dataset record | "
                f"Store: {row['Store ID']} | "
                f"Region: {row['Region']} | "
                f"Units Ordered: {row['Units Ordered']} | "
                f"Demand Forecast: {row['Demand Forecast']} | "
                f"Discount: {row['Discount']} | "
                f"Weather: {row['Weather Condition']} | "
                f"Holiday/Promotion: {row['Holiday/Promotion']} | "
                f"Competitor Pricing: {row['Competitor Pricing']} | "
                f"Seasonality: {row['Seasonality']}"
            )

            # -----------------------------------------------------
            # Create a sales transaction when units were sold.
            # IMPORTANT:
            # transaction_date = actual dataset Date
            # -----------------------------------------------------
            if units_sold > 0:
                cursor = connection.execute(
                    """
                    INSERT INTO transactions (
                        product_id,
                        user_id,
                        type,
                        quantity,
                        unit_price,
                        total_amount,
                        transaction_date,
                        notes
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        product_id,
                        None,
                        "SALE",
                        units_sold,
                        price,
                        total_amount,
                        dataset_date,
                        notes
                    )
                )

                transaction_id = cursor.lastrowid
                transaction_count += 1

            else:
                transaction_id = None

            # -----------------------------------------------------
            # Store daily inventory snapshot.
            # timestamp = actual dataset Date
            # -----------------------------------------------------
            connection.execute(
                """
                INSERT INTO stock_history (
                    product_id,
                    transaction_id,
                    change_type,
                    quantity_change,
                    stock_after,
                    timestamp
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    product_id,
                    transaction_id,
                    "DAILY_SNAPSHOT",
                    0,
                    int(float(row["Inventory Level"])),
                    dataset_date
                )
            )

            stock_history_count += 1

        # ---------------------------------------------------------
        # Save everything
        # ---------------------------------------------------------
        connection.commit()

        print(f"Transactions imported: {transaction_count}")
        print(f"Stock history imported: {stock_history_count}")
        print("Dataset import completed successfully.")

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()


if __name__ == "__main__":
    import_dataset()
    