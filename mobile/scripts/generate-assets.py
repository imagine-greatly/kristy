#!/usr/bin/env python
"""Generate Kristy's iOS/Android app assets: a gold serif 'K' on the void-green
brand background. Run with Pillow installed (`pip install pillow`). Outputs the
PNGs Expo references in app.config.js.

Brand: bg #0B1F0F, gold #C9A84C, text-cream #F0E6C8. Wordmark uses Georgia
(the same serif the web app uses for its wordmark)."""

import os
from PIL import Image, ImageDraw, ImageFont

BG = (11, 31, 15, 255)        # #0B1F0F void green
GOLD = (201, 168, 76, 255)    # #C9A84C
CREAM = (240, 230, 200, 255)  # #F0E6C8
WHITE = (255, 255, 255, 255)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "assets"))
os.makedirs(OUT, exist_ok=True)

SERIF_CANDIDATES = [
    r"C:\Windows\Fonts\georgiab.ttf",
    r"C:\Windows\Fonts\georgia.ttf",
    r"C:\Windows\Fonts\timesbd.ttf",
    r"C:\Windows\Fonts\times.ttf",
]


def serif(size):
    for path in SERIF_CANDIDATES:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def draw_letter(img, letter, color, box, font_ratio=0.62):
    """Center `letter` within the image using optical centering of the glyph bbox."""
    d = ImageDraw.Draw(img)
    w, h = box
    font = serif(int(h * font_ratio))
    bbox = d.textbbox((0, 0), letter, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (w - tw) / 2 - bbox[0]
    y = (h - th) / 2 - bbox[1]
    d.text((x, y), letter, font=font, fill=color)


def rounded_bg(size, radius_ratio=0.0):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if radius_ratio > 0:
        r = int(size * radius_ratio)
        d.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=BG)
    else:
        d.rectangle([0, 0, size, size], fill=BG)
    return img


def make_icon():
    # iOS app icon — full-bleed void bg, gold K, thin gold hairline frame.
    size = 1024
    img = rounded_bg(size)
    d = ImageDraw.Draw(img)
    inset = int(size * 0.11)
    d.rounded_rectangle(
        [inset, inset, size - inset, size - inset],
        radius=int(size * 0.10),
        outline=(139, 111, 46, 180),  # border-gold, soft
        width=max(2, size // 220),
    )
    draw_letter(img, "K", GOLD, (size, size), font_ratio=0.5)
    img.save(os.path.join(OUT, "icon.png"))


def make_adaptive():
    # Android adaptive foreground — K sized into the ~66% safe zone, transparent
    # bg (app.config sets the void background color behind it).
    size = 1024
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw_letter(img, "K", GOLD, (size, size), font_ratio=0.42)
    img.save(os.path.join(OUT, "adaptive-icon.png"))


def make_splash():
    # Splash (resizeMode: contain) — square, gold K over "Kristy" wordmark.
    size = 1242
    img = rounded_bg(size)
    d = ImageDraw.Draw(img)
    # K mark
    kfont = serif(int(size * 0.30))
    bbox = d.textbbox((0, 0), "K", font=kfont)
    tw = bbox[2] - bbox[0]
    d.text(((size - tw) / 2 - bbox[0], size * 0.30), "K", font=kfont, fill=GOLD)
    # wordmark
    wfont = serif(int(size * 0.075))
    wb = d.textbbox((0, 0), "Kristy", font=wfont)
    ww = wb[2] - wb[0]
    d.text(((size - ww) / 2 - wb[0], size * 0.60), "Kristy", font=wfont, fill=CREAM)
    img.save(os.path.join(OUT, "splash.png"))


def make_notification():
    # Android notification icon — must be a white silhouette on transparent.
    size = 96
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw_letter(img, "K", WHITE, (size, size), font_ratio=0.72)
    img.save(os.path.join(OUT, "notification-icon.png"))


if __name__ == "__main__":
    make_icon()
    make_adaptive()
    make_splash()
    make_notification()
    print("Wrote assets to", OUT)
    for f in sorted(os.listdir(OUT)):
        print("  -", f)
