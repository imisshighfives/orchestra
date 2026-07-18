"""
Generates flat, mascot-free PWA icons for Transition Readiness:
a solid navy square with a white "TR" monogram, at the sizes iOS/Android expect.
Run: python3 scripts/gen-icons.py
"""
from PIL import Image, ImageDraw, ImageFont

NAVY = (16, 26, 39, 255)  # matches tailwind navy-900
WHITE = (255, 255, 255, 255)
FONT_PATH = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

SIZES = {
    "icon-192.png": 192,
    "icon-512.png": 512,
    "apple-touch-icon.png": 180,
    "favicon-32.png": 32,
}

OUT_DIR = "public/icons"


def make_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), NAVY)
    draw = ImageDraw.Draw(img)
    font_size = int(size * 0.42)
    font = ImageFont.truetype(FONT_PATH, font_size)
    text = "TR"
    bbox = draw.textbbox((0, 0), text, font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - w) / 2 - bbox[0]
    y = (size - h) / 2 - bbox[1]
    draw.text((x, y), text, font=font, fill=WHITE)
    return img


if __name__ == "__main__":
    import os

    os.makedirs(OUT_DIR, exist_ok=True)
    for filename, size in SIZES.items():
        icon = make_icon(size)
        icon.save(os.path.join(OUT_DIR, filename))
        print(f"wrote {OUT_DIR}/{filename} ({size}x{size})")
