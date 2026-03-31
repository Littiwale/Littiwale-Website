import json
import re
import os
import pandas as pd
from PIL import Image

# ----------------------
# CONFIG
# ----------------------
excel_path = '../data/menu.xlsx'
mapping_path = '../data/imagemapping.xlsx'
output_menu = '../data/menu.json'
output_map = '../data/imagemap.json'

# Limit for REAL optimization (200KB)
LIMIT_SIZE_KB = 200

# ----------------------
# HELPERS
# ----------------------
def make_id(name):
    cleaned = re.sub(r'[^a-zA-Z0-9\s-]', '', str(name))
    return re.sub(r'\s+', '-', cleaned.strip().lower())

def normalize_name(name):
    """Normalize item name: lowercase, remove (half)/(full)"""
    # Remove text in parentheses like (half), (full), (1 pc)
    cleaned = re.sub(r'\(.*?\)', '', str(name))
    return cleaned.strip().lower()

def optimize_image(image_relative_path):
    """
    REAL Optimization: convert to WEBP, resize (max 800px), 
    and compress if > 200KB.
    """
    if not image_relative_path or str(image_relative_path).lower() == "nan":
        return None

    full_path = os.path.join('..', image_relative_path)
    
    if not os.path.exists(full_path):
        return image_relative_path

    # Paths for optimized version
    base, _ = os.path.splitext(full_path)
    webp_path = base + ".webp"
    relative_webp_path = os.path.splitext(image_relative_path)[0] + ".webp"

    # Rule: If WEBP exists, skip reprocessing (as per user choice)
    if os.path.exists(webp_path):
        return relative_webp_path

    # Only optimize if above 200KB limit
    file_size_kb = os.path.getsize(full_path) / 1024
    if file_size_kb <= LIMIT_SIZE_KB:
        return image_relative_path

    try:
        with Image.open(full_path) as img:
            # RESIZE: Max width 800px, maintain aspect ratio
            if img.width > 800:
                img.thumbnail((800, 800), Image.Resampling.LANCZOS)

            # FLATTEN: Convert to RGB with white background if transparent
            if img.mode in ("RGBA", "P"):
                # Create white background
                background = Image.new("RGB", img.size, (255, 255, 255))
                # Paste image using its own alpha as mask
                background.paste(img, mask=img.convert("RGBA").split()[3])
                img = background
            elif img.mode != "RGB":
                img = img.convert("RGB")

            # COMPRESS & SAVE: High compression WEBP
            # quality=70, method=6 (highest efficiency), lossless=False
            img.save(webp_path, "WEBP", quality=70, method=6)
            
            new_size_kb = os.path.getsize(webp_path) / 1024
            print(f"✅ Optimized: {image_relative_path} ({file_size_kb:.1f}KB) -> WEBP ({new_size_kb:.1f}KB)")
            return relative_webp_path
            
    except Exception as e:
        print(f"❌ Failed to optimize {image_relative_path}: {e}")
        return image_relative_path

# ----------------------
# LOAD EXCEL
# ----------------------
if not os.path.exists(excel_path):
    print("Excel file not found:", excel_path)
    exit(1)

df_menu = pd.read_excel(excel_path)

# Load mapping if exists
image_map = {}
if os.path.exists(mapping_path):
    df_map = pd.read_excel(mapping_path)
    for _, row in df_map.iterrows():
        item_name = str(row.get("Item Name", "")).strip()
        img_path = str(row.get("Image Path", "")).strip()
        
        if item_name and item_name.lower() != "nan" and img_path and img_path.lower() != "nan":
            # Normalize key
            key = normalize_name(item_name)
            
            # Optimize image asset
            final_path = optimize_image(img_path)
            image_map[key] = final_path

menu = []
bestsellers = [
    "Litti Chokha", "Paneer Pizza", "Chilly Chicken", 
    "Veg Noodles", "Paneer Butter Masala", "Chicken Fried Rice"
]

# ----------------------
# LOGGING SETUP
# ----------------------
fullmenu_log_dir = '../data/logs/mapping/menu/fullmenu'
craziestdeal_log_dir = '../data/logs/mapping/menu/craziestdeal'
os.makedirs(fullmenu_log_dir, exist_ok=True)
os.makedirs(craziestdeal_log_dir, exist_ok=True)

# Tracks for SUCCESS and FAILURE
fullmenu_corrected = []
fullmenu_incorrect = []
craziest_corrected = []
craziest_incorrect = []

# Predefined Deal Names (Sync with main.js)
DEAL_NAMES = [
    "Kuch bhi khila de 😭",
    "Tera jo mann wo khila de 😏",
    "Aaj diet bhool ja 😈",
    "Bhook lagi hai boss 🔥",
    "Pet bhar combo 💀"
]

def slugify(title):
    """Sync with JS slugifier logic"""
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    return slug.strip('-')

# ----------------------
# PROCESS ROWS (FULL MENU)
# ----------------------
for _, row in df_menu.iterrows():
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

    # 1. NORMALIZE FOR MAPPING
    normalized = normalize_name(name)
    
    # 2. LOGGING (FULL MENU)
    mapped_image = image_map.get(normalized)
    
    if mapped_image:
        # Verify physical existence
        full_mapped_path = os.path.join("..", mapped_image)
        if os.path.exists(full_mapped_path):
            fullmenu_corrected.append({
                "item": name,
                "normalized": normalized,
                "image": mapped_image,
                "source": "imagemapping.xlsx"
            })
        else:
            fullmenu_incorrect.append({
                "item": name,
                "normalized": normalized,
                "reason": "Mapped path does not exist",
                "attempted_path": mapped_image
            })
    else:
        fullmenu_incorrect.append({
            "item": name,
            "normalized": normalized,
            "reason": "No match found in imagemapping.xlsx"
        })

    item = {
        "id": make_id(name),
        "name": name,
        "category": category,
        "price": price,
        "description": desc,
        "veg": veg_type
    }

    if options and options.lower() != "nan":
        item["options"] = [opt.strip() for opt in options.split(",")]

    if "1 pc" in desc.lower() or "2 pc" in desc.lower():
        item["variant"] = desc

    for bs in bestsellers:
        if bs.lower() in name.lower():
            item["bestseller"] = True

    menu.append(item)

# ----------------------
# LOGGING (CRAZIEST DEALS)
# ----------------------
for deal_title in DEAL_NAMES:
    slug = slugify(deal_title)
    # Check for .png (Primary) or .webp
    found_path = None
    possible_exts = [".png", ".webp"]
    
    for ext in possible_exts:
        test_path = f"images/menu/Craziest Deal Menu/{slug}{ext}"
        if os.path.exists(os.path.join("..", test_path)):
            found_path = test_path
            break
            
    if found_path:
        craziest_corrected.append({
            "deal": deal_title,
            "slug": slug,
            "image": found_path
        })
    else:
        craziest_incorrect.append({
            "deal": deal_title,
            "slug": slug,
            "reason": "File not found in Craziest Deal Menu folder"
        })

# ----------------------
# WRITE JSON & LOGS
# ----------------------
os.makedirs("../data", exist_ok=True)

with open(output_menu, "w", encoding="utf-8") as f:
    json.dump(menu, f, indent=4)

with open(output_map, "w", encoding="utf-8") as f:
    json.dump(image_map, f, indent=4)

# Write Full Menu Logs
with open(os.path.join(fullmenu_log_dir, 'correctedmaps.json'), 'w', encoding='utf-8') as f:
    json.dump(fullmenu_corrected, f, indent=4)

with open(os.path.join(fullmenu_log_dir, 'incorrectmaps.json'), 'w', encoding='utf-8') as f:
    json.dump(fullmenu_incorrect, f, indent=4)

# Write Craziest Deals Logs
with open(os.path.join(craziestdeal_log_dir, 'correctedmaps.json'), 'w', encoding='utf-8') as f:
    json.dump(craziest_corrected, f, indent=4)

with open(os.path.join(craziestdeal_log_dir, 'incorrectmaps.json'), 'w', encoding='utf-8') as f:
    json.dump(craziest_incorrect, f, indent=4)

print(f"✅ Production Data: Menu JSON and Image Map generated.")

print(f"\n📊 [FULL MENU LOGS]")
print(f"   Mapped:   {len(fullmenu_corrected)}")
print(f"   Unmapped: {len(fullmenu_incorrect)}")
print(f"   Path:     {fullmenu_log_dir}")

print(f"\n📊 [CRAZIEST DEALS LOGS]")
print(f"   Mapped:   {len(craziest_corrected)}")
print(f"   Unmapped: {len(craziest_incorrect)}")
print(f"   Path:     {craziestdeal_log_dir}")