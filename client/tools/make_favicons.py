"""Generate the Kristy favicon set from the gold hair silhouette (kristy-logo.png).

Run from client/:  python tools/make_favicons.py

The app logo is transparent gold with the face as negative space. A favicon is a
small opaque square, so the forest ground gets baked in behind the silhouette.

At 16/32px the fine hair strands fall below one pixel and turn to mud. Blurring
them away rounds the whole mark into a blob, so instead we simplify by *thickness*:
the interior dark regions are morphologically opened, which fills any strand gap
too thin to survive at the target size while the large negative-space face -- the
feature that makes this read as the hair-and-face mark -- comes through untouched.
The outer contour gets the same treatment to shed wispy tendrils. Every radius is
derived from how many source pixels map to one target pixel, so each size is
simplified exactly as much as it needs and no more. 180 keeps full detail.
"""
import os
from PIL import Image, ImageChops, ImageDraw, ImageFilter

SRC = "public/kristy-logo.png"
OUT_DIRS = ["public", "dist"]
FOREST = (11, 31, 15)  # #0B1F0F -- brand ground

SS = 8       # supersample factor for the antialiased downscale
WORK_H = 600  # morphology resolution -- well above any target, cheap to filter
STEP = 9      # structuring element; repeated N times gives radius 4N


def solve3(M, v):
    """Gaussian elimination on a 3x3 system."""
    a = [row[:] + [v[i]] for i, row in enumerate(M)]
    for i in range(3):
        p = max(range(i, 3), key=lambda r: abs(a[r][i]))
        a[i], a[p] = a[p], a[i]
        for r in range(3):
            if r == i:
                continue
            f = a[r][i] / a[i][i]
            for c in range(i, 4):
                a[r][c] -= f * a[i][c]
    return [a[i][3] / a[i][i] for i in range(3)]


def fit_gold_gradient(src):
    """Least-squares fit of the logo's gold ramp as color = a + b*x/w + c*y/h.

    Sampled from opaque pixels only, so the strand gaps we fill in get the mark's
    real gold at that position rather than a flat swatch.
    """
    w, h = src.size
    px = src.load()
    pts = []
    for y in range(0, h, 7):
        for x in range(0, w, 7):
            r, g, b, a = px[x, y]
            if a > 217:
                pts.append((x / w, y / h, r, g, b))
    n = len(pts)
    sx = sum(p[0] for p in pts)
    sy = sum(p[1] for p in pts)
    M = [
        [n, sx, sy],
        [sx, sum(p[0] * p[0] for p in pts), sum(p[0] * p[1] for p in pts)],
        [sy, sum(p[0] * p[1] for p in pts), sum(p[1] * p[1] for p in pts)],
    ]
    return [
        solve3(M, [
            sum(p[2 + c] for p in pts),
            sum(p[0] * p[2 + c] for p in pts),
            sum(p[1] * p[2 + c] for p in pts),
        ])
        for c in range(3)
    ]


def gold_plane(coef, box):
    """Render the fitted gold ramp across the silhouette's bounding box."""
    bw, bh = box
    img = Image.new("RGB", (bw, bh))
    px = img.load()
    for y in range(bh):
        fy = y / bh
        for x in range(bw):
            fx = x / bw
            px[x, y] = tuple(
                max(0, min(255, int(c[0] + c[1] * fx + c[2] * fy))) for c in coef
            )
    return img


def _erode(img, n):
    for _ in range(n):
        img = img.filter(ImageFilter.MinFilter(STEP))
    return img


def _dilate(img, n):
    for _ in range(n):
        img = img.filter(ImageFilter.MaxFilter(STEP))
    return img


def _open(img, n):
    """Morphological opening: drops white features thinner than the element."""
    return _dilate(_erode(img, n), n) if n else img


def simplify_alpha(alpha, hole_n, grow_n, edge_n):
    """Simplify the silhouette for a small target size.

    hole_n -- erosion passes that seed the interior dark regions. Thin strand gaps
              cannot hold the element and vanish; the face survives as a seed.
    grow_n -- extra dilation on that seed. Eroding the face and regrowing it exactly
              would round its corners to mush, so we regrow slightly past the
              original: the face stays a crisp, legible notch instead of a smudge.
    edge_n -- opening passes on the gold mass (sheds wispy tendrils)
    """
    if not hole_n and not edge_n:
        return alpha

    w, h = alpha.size
    ww = max(1, int(w * WORK_H / h))
    a = alpha.resize((ww, WORK_H), Image.LANCZOS).point(lambda v: 255 if v >= 128 else 0)

    # Flood the background in from a transparent border so "outside the mark" is
    # distinguishable from the interior holes. 64 = outside, 0 = hole, 255 = gold.
    pad = 2
    canvas = Image.new("L", (ww + pad * 2, WORK_H + pad * 2), 0)
    canvas.paste(a, (pad, pad))
    ImageDraw.floodfill(canvas, (0, 0), 64)

    outside = canvas.point(lambda v: 255 if v == 64 else 0)
    holes = canvas.point(lambda v: 255 if v == 0 else 0)
    holes = _dilate(_erode(holes, hole_n), hole_n + grow_n)

    # gold = everything that is neither background nor a surviving hole
    gold = ImageChops.subtract(ImageChops.invert(outside), holes)
    gold = _open(gold, edge_n)

    gold = gold.crop((pad, pad, pad + ww, pad + WORK_H))
    return gold.resize((w, h), Image.LANCZOS)


def build(src, coef, size, fill, hole_px, grow_n, edge_px):
    """Render one favicon.

    fill    -- silhouette height as a fraction of the square (padding = 1 - fill)
    hole_px -- strand gaps thinner than this many *target* pixels get filled
    grow_n  -- dilation passes that hold the face notch open (see simplify_alpha)
    edge_px -- contour features thinner than this many target pixels get trimmed
    """
    w, h = src.size
    # source pixels per target pixel, at the working resolution
    per_px = WORK_H / (size * fill)
    to_n = lambda px: round(px * per_px / 2 / 4)  # radius 4 per pass

    alpha = simplify_alpha(src.getchannel("A"), to_n(hole_px), grow_n, to_n(edge_px))

    ch = int(size * fill * SS)
    cw = int(ch * w / h)
    tile = Image.new("RGB", (cw, ch), FOREST)
    tile.paste(gold_plane(coef, (cw, ch)), (0, 0), alpha.resize((cw, ch), Image.LANCZOS))

    canvas = Image.new("RGB", (size * SS, size * SS), FOREST)
    canvas.paste(tile, ((size * SS - cw) // 2, (size * SS - ch) // 2))
    return canvas.resize((size, size), Image.LANCZOS)


def main():
    src = Image.open(SRC).convert("RGBA")
    coef = fit_gold_gradient(src)
    print("gold ramp fit:", [[round(x, 1) for x in c] for c in coef])

    # (size, fill, hole_px, grow_n, edge_px) -- thresholds in target pixels
    specs = [
        (16, 0.92, 1.2, 2, 0.8),
        (32, 0.90, 1.0, 1, 0.5),
        (48, 0.90, 0.8, 0, 0.0),
        (180, 0.78, 0.0, 0, 0.0),  # iOS rounds the corners -- inset more
    ]
    imgs = {}
    for size, fill, hole_px, grow_n, edge_px in specs:
        imgs[size] = build(src, coef, size, fill, hole_px, grow_n, edge_px)
        print("built", size)

    for d in OUT_DIRS:
        if not os.path.isdir(d):
            continue
        imgs[16].save(os.path.join(d, "favicon-16.png"))
        imgs[32].save(os.path.join(d, "favicon-32.png"))
        imgs[48].save(os.path.join(d, "favicon-48.png"))
        imgs[180].save(os.path.join(d, "apple-touch-icon.png"))
        # one .ico carrying 16/32/48 for browser chrome that still asks for it
        imgs[48].save(
            os.path.join(d, "favicon.ico"),
            format="ICO",
            sizes=[(16, 16), (32, 32), (48, 48)],
        )
        print("wrote ->", d)

    sp = os.environ.get("SP")
    if sp:  # optional: drop actual-size copies somewhere for eyeballing
        for s in imgs:
            imgs[s].save(os.path.join(sp, f"fav-{s}.png"))


if __name__ == "__main__":
    main()
