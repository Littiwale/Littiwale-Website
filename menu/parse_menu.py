import json
import re
import os

text_path = 'extracted_text.txt'

if not os.path.exists(text_path):
    print("No extracted text found.")
    exit(1)

with open(text_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

menu = []
current_category = ""

bestsellers = [
    "Litti Chokha",
    "Paneer Pizza",
    "Chilly Chicken",
    "Veg Noodles",
    "Paneer Butter Masala",
    "Chicken Fried Rice"
]

cat_map = {
    "star special": "Star Special",
    "soup": "Soup",
    "mega combos": "Mega Combos",
    "mini combos": "Mini Combos",
    "sandwiches": "Sandwiches",
    "noodles & rice": "Noodles & Rice",
    "starters": "Starters",
    "parathas & naan": "Parathas & Naan",
    "pizza": "Pizza",
    "pizzas": "Pizza",
    "pasta": "Pasta",
    "tandoori/kebabs": "Tandoori/Kebabs",
    "main course": "Main Course",
    "thali": "Thali",
    "pre order specials": "Pre Order Specials"
}


def make_id(name):
    cleaned = re.sub(r'[^a-zA-Z0-9\s-]', '', str(name))
    return re.sub(r'\s+', '-', cleaned.strip().lower())


for raw_line in lines:

    line = raw_line.strip()

    if not line:
        continue

    lower_line = line.lower()

    # ----------------------
    # CATEGORY DETECTION
    # ----------------------

    for cat_key, cat_val in cat_map.items():
        if cat_key in lower_line:
            current_category = cat_val
            break

    # ----------------------
    # SKIP UNWANTED LINES
    # ----------------------

    skip_phrases = [
        "name contents",
        "we accept",
        "delivery",
        "follow us",
        "littiwale menu",
        "order/enquiries",
        "domino’s style / handmade",
        "your choice"
    ]

    if any(x in lower_line for x in skip_phrases):
        continue

    item = None

    # ----------------------
    # HALF / FULL PRICE
    # ----------------------

    match_double = re.search(r'^(.*?)\s+(\d+)\s+(\d+)$', line)

    if match_double:

        raw_name = match_double.group(1).strip()
        half_price = int(match_double.group(2))
        full_price = int(match_double.group(3))

        name = raw_name
        desc = ""

        if " - " in raw_name:
            parts = raw_name.split(" - ")
            name = parts[0].strip()
            desc = parts[1].strip()

        item = {
            "id": make_id(name),
            "name": name,
            "category": current_category,
            "half": half_price,
            "full": full_price,
            "description": desc,
            "image": f"images/menu/{make_id(name)}.jpg"
        }

    else:

        # ----------------------
        # SINGLE PRICE
        # ----------------------

        match_single = re.search(r'^(.*?)\s+(?:-\s+)?(\d+)$', line)

        if match_single:

            raw_name = match_single.group(1).strip()
            price = int(match_single.group(2))

            name = raw_name
            desc = ""

            if " - " in raw_name:
                parts = raw_name.split(" - ", 1)
                name = parts[0].strip()
                desc = parts[1].strip()

            item = {
                "id": make_id(name),
                "name": name,
                "category": current_category,
                "price": price,
                "description": desc,
                "image": f"images/menu/{make_id(name)}.jpg"
            }

    if not item:
        continue

    # ----------------------
    # DOMINO STYLE CLEANUP
    # ----------------------

    if "domino" in str(item["name"]).lower() or "handmade" in str(item["name"]).lower():

        clean_name = (
            str(item["name"])
            .replace("Handmade", "")
            .replace("Domino's Style Pizza", "")
            .replace("Domino's Style", "")
            .replace("(Minimum 3 hours notice)", "")
            .strip()
        )

        item["name"] = clean_name
        item["description"] = "(Minimum 3 hours notice)"
        item["id"] = make_id(clean_name)
        item["image"] = f"images/menu/{item['id']}.jpg"

    # ----------------------
    # PRE ORDER CLEANUP
    # ----------------------

    if "pre order" in str(item["name"]).lower():

        clean_name = (
            str(item["name"])
            .replace("Pre Order Special -", "")
            .replace("Pre Order Special", "")
            .strip()
        )

        item["name"] = clean_name
        item["id"] = make_id(clean_name)
        item["image"] = f"images/menu/{item['id']}.jpg"

    # ----------------------
    # PAV BHAJI SPECIAL FIX
    # ----------------------

    if "pav bhaji" in str(item["name"]).lower():

        item["name"] = "Pav Bhaji"
        item["description"] = "1 pc pav / 2 pc pav"
        item["id"] = make_id(item["name"])
        item["image"] = f"images/menu/{item['id']}.jpg"

    # ----------------------
    # BESTSELLER MARKING
    # ----------------------

    for bs in bestsellers:
        if bs.lower() == str(item["name"]).lower():
            item["bestseller"] = True

    menu.append(item)


# ----------------------
# WRITE JSON
# ----------------------

os.makedirs("../data", exist_ok=True)

with open("../data/menu.json", "w", encoding="utf-8") as f:
    json.dump(menu, f, indent=4)

print("Menu JSON generated successfully!")