#!/usr/bin/env python3
"""
Generate test images for CueDeck — PNG & JPEG, 1920×1080.
"""
from PIL import Image, ImageDraw, ImageFont
import os, math

OUT = os.path.dirname(__file__)
W, H = 1920, 1080


# ── Font helper ───────────────────────────────────────────────────────────────
def font(size, bold=False):
    """Try system fonts, fall back to default."""
    candidates = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNSDisplay.ttf",
        "/System/Library/Fonts/SFNS.ttf",
        "/System/Library/Fonts/SFPro.ttf",
        "/Library/Fonts/Arial.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


def center_text(draw, text, y, fnt, color, shadow=None):
    bbox = draw.textbbox((0, 0), text, font=fnt)
    tw = bbox[2] - bbox[0]
    x = (W - tw) // 2
    if shadow:
        draw.text((x + 3, y + 3), text, font=fnt, fill=shadow)
    draw.text((x, y), text, font=fnt, fill=color)


def left_text(draw, text, x, y, fnt, color):
    draw.text((x, y), text, font=fnt, fill=color)


# ── 1. ПЕРЕРЫВ — dark branded key visual (PNG) ───────────────────────────────
def img_break():
    img = Image.new("RGB", (W, H), (13, 17, 23))
    d = ImageDraw.Draw(img)

    # gradient-ish stripes (simulate)
    for i in range(H):
        t = i / H
        r = int(13 + 30 * t)
        g = int(17 + 20 * t)
        b = int(23 + 60 * t)
        d.line([(0, i), (W, i)], fill=(r, g, b))

    # accent bar top
    d.rectangle([0, 0, W, 8], fill=(37, 99, 235))

    # big label
    f_big = font(180, bold=True)
    center_text(d, "ПЕРЕРЫВ", 200, f_big, (255, 255, 255),
                shadow=(0, 0, 0))

    # sub
    f_sub = font(60)
    center_text(d, "Начало через несколько минут", 430, f_sub,
                (148, 163, 184))

    # decorative dots row
    for i in range(7):
        cx = W // 2 - 180 + i * 60
        cy = 600
        r = 12 if i == 3 else 8
        col = (37, 99, 235) if i == 3 else (71, 85, 105)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col)

    # CueDeck watermark bottom-right
    f_wm = font(28)
    d.text((W - 260, H - 55), "CueDeck v0.1.2", font=f_wm,
           fill=(51, 65, 85))

    # accent bar bottom
    d.rectangle([0, H - 8, W, H], fill=(37, 99, 235))

    path = os.path.join(OUT, "demo-break.png")
    img.save(path, "PNG")
    print(f"✅  {path}")


# ── 2. ДОБРО ПОЖАЛОВАТЬ — light welcome slide (PNG) ──────────────────────────
def img_welcome():
    img = Image.new("RGB", (W, H), (249, 250, 251))
    d = ImageDraw.Draw(img)

    # left accent column
    d.rectangle([0, 0, 12, H], fill=(37, 99, 235))

    # header bar
    d.rectangle([0, 0, W, 100], fill=(37, 99, 235))
    f_hdr = font(40)
    d.text((40, 28), "CueDeck  ·  Demo Day 2026", font=f_hdr,
           fill=(255, 255, 255))

    # main title
    f_big = font(140, bold=True)
    center_text(d, "ДОБРО", 160, f_big, (17, 24, 39))
    center_text(d, "ПОЖАЛОВАТЬ", 320, f_big, (17, 24, 39))

    # divider
    d.rectangle([W // 2 - 120, 490, W // 2 + 120, 496],
                fill=(37, 99, 235))

    # sub
    f_sub = font(52)
    center_text(d, "Конференция по управлению событиями", 530, f_sub,
                (107, 114, 128))

    # date
    f_date = font(36)
    center_text(d, "26 мая 2026  ·  Москва", 620, f_date,
                (156, 163, 175))

    # footer
    d.rectangle([0, H - 70, W, H], fill=(243, 244, 246))
    d.text((60, H - 50), "Начало регистрации в 09:30", font=font(30),
           fill=(107, 114, 128))
    d.text((W - 420, H - 50), "github.com/ttpa3dhuk/PDF-Presenter",
           font=font(28), fill=(37, 99, 235))

    path = os.path.join(OUT, "demo-welcome.png")
    img.save(path, "PNG")
    print(f"✅  {path}")


# ── 3. ПРОГРАММА — schedule slide (JPEG) ─────────────────────────────────────
def img_schedule():
    img = Image.new("RGB", (W, H), (255, 255, 255))
    d = ImageDraw.Draw(img)

    # top bar
    d.rectangle([0, 0, W, 110], fill=(17, 24, 39))
    f_hdr = font(46, bold=True)
    d.text((60, 30), "ПРОГРАММА", font=f_hdr, fill=(255, 255, 255))
    d.text((W - 320, 38), "26 мая 2026", font=font(36), fill=(148, 163, 184))

    sessions = [
        ("10:00", "Иванова А.В.",   "Введение в тему",              (37, 99, 235)),
        ("10:40", "Петров К.С.",    "Кейс: автоматизация на съёмке",(124, 58, 237)),
        ("11:20", "— перерыв —",    "",                              (107, 114, 128)),
        ("11:40", "Сидорова М.",    "Итоги квартала",                (5,  150, 105)),
        ("12:20", "Хусаенов А.",    "Закрытие",                     (220, 38,  38)),
    ]

    row_h = 150
    for i, (time, speaker, topic, color) in enumerate(sessions):
        y = 130 + i * row_h
        bg_c = (248, 250, 252) if i % 2 == 0 else (255, 255, 255)
        d.rectangle([0, y, W, y + row_h - 4], fill=bg_c)
        d.rectangle([0, y, 6, y + row_h - 4], fill=color)

        # time
        d.text((40, y + 28), time, font=font(52, bold=True), fill=color)

        if topic:  # real session
            d.text((220, y + 18), speaker, font=font(44, bold=True),
                   fill=(17, 24, 39))
            d.text((220, y + 78), topic, font=font(34),
                   fill=(107, 114, 128))
        else:
            d.text((220, y + 45), speaker, font=font(36),
                   fill=(156, 163, 175))

    # footer line
    d.rectangle([0, H - 5, W, H], fill=(37, 99, 235))

    path = os.path.join(OUT, "demo-schedule.jpg")
    img.save(path, "JPEG", quality=92)
    print(f"✅  {path}")


# ── 4. ТЕХНИЧЕСКИЙ — test/calibration pattern (PNG) ─────────────────────────
def img_testcard():
    img = Image.new("RGB", (W, H), (0, 0, 0))
    d = ImageDraw.Draw(img)

    # colour bars (top 2/3)
    bar_colors = [
        (192, 192, 192), (192, 192, 0), (0, 192, 192),
        (0, 192, 0),     (192, 0, 192), (192, 0, 0), (0, 0, 192),
    ]
    bar_w = W // len(bar_colors)
    for i, c in enumerate(bar_colors):
        d.rectangle([i * bar_w, 0, (i + 1) * bar_w, 720], fill=c)

    # grey ramp (bottom)
    steps = 16
    ramp_w = W // steps
    for i in range(steps):
        v = int(i * 255 / (steps - 1))
        d.rectangle([i * ramp_w, 720, (i + 1) * ramp_w, H], fill=(v, v, v))

    # crosshair
    d.line([(W // 2, 0), (W // 2, 720)], fill=(255, 255, 255), width=2)
    d.line([(0, 360), (W, 360)], fill=(255, 255, 255), width=2)
    d.ellipse([W // 2 - 100, 360 - 100, W // 2 + 100, 360 + 100],
              outline=(255, 255, 255), width=2)

    # label
    f = font(42, bold=True)
    center_text(d, "CueDeck  ·  Test Card  ·  1920 × 1080", 300, f,
                (255, 255, 255), shadow=(0, 0, 0))

    path = os.path.join(OUT, "demo-testcard.png")
    img.save(path, "PNG")
    print(f"✅  {path}")


# ── 5. SPEAKER BIO — dark speaker card (JPEG) ────────────────────────────────
def img_speaker():
    img = Image.new("RGB", (W, H), (15, 23, 42))
    d = ImageDraw.Draw(img)

    # left panel
    d.rectangle([0, 0, 640, H], fill=(30, 41, 59))

    # avatar placeholder (circle)
    cx, cy, r = 320, 380, 180
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(51, 65, 85))
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(37, 99, 235), width=6)
    f_av = font(100)
    d.text((cx - 55, cy - 65), "АХ", font=f_av, fill=(148, 163, 184))

    # name under avatar
    center_left = lambda text, y, fnt, col: \
        d.text(((640 - d.textbbox((0,0), text, font=fnt)[2]) // 2,
                y), text, font=fnt, fill=col)

    center_left("Азат Хусаенов", 590, font(42, bold=True), (226, 232, 240))
    center_left("Технический директор", 655, font(28), (148, 163, 184))

    # accent bar
    d.rectangle([640, 0, 646, H], fill=(37, 99, 235))

    # right side
    d.text((700, 80), "О СПИКЕРЕ", font=font(32), fill=(37, 99, 235))
    d.rectangle([700, 126, 1860, 130], fill=(37, 99, 235))

    bio_lines = [
        "Звук  ·  Свет  ·  Видео  ·  Сцена",
        "",
        "10+ лет в профессиональном AV-производстве.",
        "Yamaha CL5, grandMA3, Blackmagic, vMix.",
        "",
        "Создатель CueDeck — open-source инструмента",
        "для управления презентациями на live-событиях.",
    ]
    y = 160
    for line in bio_lines:
        col = (148, 163, 184) if line.startswith(" ") or "·" in line else (226, 232, 240)
        fnt = font(36) if line else font(20)
        d.text((700, y), line, font=fnt, fill=col)
        y += 55 if line else 20

    # topic block
    d.rectangle([700, 760, 1860, 830], fill=(30, 58, 138))
    d.text((740, 774), "Тема:  Беспроводное управление камерами Blackmagic",
           font=font(34), fill=(147, 197, 253))

    path = os.path.join(OUT, "demo-speaker.jpg")
    img.save(path, "JPEG", quality=92)
    print(f"✅  {path}")


# ── Run all ───────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    img_break()
    img_welcome()
    img_schedule()
    img_testcard()
    img_speaker()
    print("\nAll done — 3× PNG + 2× JPEG")
