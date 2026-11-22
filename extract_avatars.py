import os
from PIL import Image, ImageDraw

src_path = r'C:\Users\abila\.gemini\antigravity\brain\fd949e72-3d4d-4351-a8cb-c6827840e6c4\.user_uploaded\media_1795331592975_eac60d42.jpg'
out_dir = r'c:\Users\abila\Desktop\LOTTRY POS system\public\avatars'
os.makedirs(out_dir, exist_ok=True)

im = Image.open(src_path).convert('RGBA')

avatars_meta = [
    # Top row
    {'id': 'char-01', 'name': 'Priyanka (Traditional Saree)', 'cx': 59, 'cy': 58, 'r': 40},
    {'id': 'char-02', 'name': 'Kamal (Mustache & Striped Shirt)', 'cx': 148, 'cy': 58, 'r': 40},
    {'id': 'char-03', 'name': 'Nirosha (Jasmine Flowers)', 'cx': 237, 'cy': 58, 'r': 40},
    # Bottom row
    {'id': 'char-04', 'name': 'Sanjaya (Sri Lanka Cricket)', 'cx': 55, 'cy': 187, 'r': 41},
    {'id': 'char-05', 'name': 'Ananya (Wavy Bob Hair)', 'cx': 144, 'cy': 187, 'r': 41},
    {'id': 'char-06', 'name': 'Ramesh (Traditional Kurtha)', 'cx': 234, 'cy': 187, 'r': 41},
    {'id': 'char-07', 'name': 'Dilan (Spectacles & Kurtha)', 'cx': 325, 'cy': 187, 'r': 41},
    {'id': 'char-08', 'name': 'Mahesh (Athletic Tracksuit)', 'cx': 415, 'cy': 187, 'r': 41},
    {'id': 'char-09', 'name': 'Sunethra (Floral Saree)', 'cx': 549, 'cy': 187, 'r': 41},
    {'id': 'char-10', 'name': 'Ruwan (Professional Beard)', 'cx': 638, 'cy': 187, 'r': 41},
    {'id': 'char-11', 'name': 'Ammachchi (Elderly Mother)', 'cx': 727, 'cy': 187, 'r': 40},
    {'id': 'char-12', 'name': 'Kavinda (Cap & Jacket)', 'cx': 809, 'cy': 187, 'r': 40},
    {'id': 'char-13', 'name': 'Malsha (Earrings & Saree)', 'cx': 896, 'cy': 187, 'r': 40},
    {'id': 'char-14', 'name': 'Bandara (Gentleman Profile)', 'cx': 983, 'cy': 187, 'r': 40},
]

for meta in avatars_meta:
    cx, cy, r = meta['cx'], meta['cy'], meta['r']
    box = (cx - r, cy - r, cx + r, cy + r)
    cropped = im.crop(box)
    
    mask = Image.new('L', cropped.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, cropped.size[0] - 1, cropped.size[1] - 1), fill=255)
    
    cropped.putalpha(mask)
    
    resized = cropped.resize((128, 128), Image.Resampling.LANCZOS)
    filename = f"{meta['id']}.png"
    file_path = os.path.join(out_dir, filename)
    resized.save(file_path, 'PNG')
    print(f"Saved: {filename} - {meta['name']}")

print('SUCCESS: All 14 character avatars extracted and saved to public/avatars!')
