import json
import re
import os
import pandas as pd

# ----------------------
# CONFIG
# ----------------------
excel_path = '../data/menu.xlsx'

# ----------------------
# HELPERS
# ----------------------
def make_id(name):
    cleaned = re.sub(r'[^a-zA-Z0-9\s-]', '', str(name))
    return re.sub(r'\s+', '-', cleaned.strip().lower())

# ----------------------
# LOAD EXCEL
# ----------------------
if not os.path.exists(excel_path):
    print("Excel file not found:", excel_path)
    exit(1)

df = pd.read_excel(excel_path)

menu = []

bestsellers = [
    "Litti Chokha",
    "Paneer Pizza",
    "Chilly Chicken",
    "Veg Noodles",
    "Paneer Butter Masala",
    "Chicken Fried Rice"
]

# ----------------------
# PROCESS ROWS
# ----------------------
for _, row in df.iterrows():

    # ❌ Skip inactive
    if not row.get("Active", True):
        continue

    name = str(row.get("Name", "")).strip()
    desc = str(row.get("Description", "")).strip()
    price = row.get("Price", None)
    category = str(row.get("Category", "")).strip()
    veg_type = str(row.get("VegNonVeg", "")).strip()
    options = str(row.get("Options", "")).strip()

    if not name or name.lower() == "nan":
        continue

    item = {
        "id": make_id(name),
        "name": name,
        "category": category,
        "price": price,
        "description": desc,
        "veg": veg_type,
        "image": f"images/menu/{make_id(name)}.jpg"
    }

    # ✅ OPTIONS (comma separated → array)
    if options and options.lower() != "nan":
        item["options"] = [opt.strip() for opt in options.split(",")]

    # ✅ VARIANT (1pc / 2pc detect)
    if "1 pc" in desc.lower() or "2 pc" in desc.lower():
        item["variant"] = desc

    # ✅ BESTSELLER
    for bs in bestsellers:
        if bs.lower() in name.lower():
            item["bestseller"] = True

    menu.append(item)

# ----------------------
# WRITE JSON
# ----------------------
os.makedirs("../data", exist_ok=True)

with open("../data/menu.json", "w", encoding="utf-8") as f:
    json.dump(menu, f, indent=4)

print("✅ Menu JSON generated from Excel!")