"""PWA 用の買い物カートアイコンを生成する。
ミント背景に白いカート。通常用とマスカブル用(余白多め)を書き出す。
"""
from PIL import Image, ImageDraw

MINT = (46, 196, 166, 255)
WHITE = (255, 255, 255, 255)
SS = 4  # スーパーサンプリング(後で縮小してアンチエイリアス)


def rounded_bg(size, radius_ratio=0.22):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = int(size * radius_ratio)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=MINT)
    return img, d


def thick_line(d, p1, p2, w, fill):
    d.line([p1, p2], fill=fill, width=w)
    r = w // 2
    for (x, y) in (p1, p2):  # 丸い継ぎ目/端
        d.ellipse([x - r, y - r, x + r, y + r], fill=fill)


def draw_cart(d, ox, oy, scale):
    """24x24 ビューボックス想定の座標を scale 倍して描画。原点 (ox,oy)。"""
    def P(x, y):
        return (ox + x * scale, oy + y * scale)

    w = int(1.7 * scale)
    # ハンドル
    thick_line(d, P(2.5, 4), P(5.5, 4), w, WHITE)
    # 斜めの支柱
    thick_line(d, P(5.5, 4), P(7.6, 15.5), w, WHITE)
    # かご(台形)の輪郭
    basket = [P(6.3, 6.8), P(21.5, 6.8), P(19, 15.5), P(8.2, 15.5)]
    for i in range(len(basket)):
        thick_line(d, basket[i], basket[(i + 1) % len(basket)], w, WHITE)
    # 車輪
    for cx, cy in ((10.5, 19.5), (18, 19.5)):
        rr = int(1.5 * scale)
        c = P(cx, cy)
        d.ellipse([c[0] - rr, c[1] - rr, c[0] + rr, c[1] + rr], fill=WHITE)


def make_icon(size, content_ratio=0.78):
    big = size * SS
    img, d = rounded_bg(big)
    content = big * content_ratio
    scale = content / 24
    ox = (big - content) / 2
    oy = (big - content) / 2
    draw_cart(d, ox, oy, scale)
    return img.resize((size, size), Image.LANCZOS)


def make_maskable(size):
    # マスカブルは中央 80% が安全領域。背景全面、カートは小さめに。
    big = size * SS
    img, d = rounded_bg(big, radius_ratio=0.0)  # マスク側で角丸されるので四角
    img2 = Image.new("RGBA", (big, big), MINT)
    d = ImageDraw.Draw(img2)
    content = big * 0.55
    scale = content / 24
    ox = (big - content) / 2
    oy = (big - content) / 2
    draw_cart(d, ox, oy, scale)
    return img2.resize((size, size), Image.LANCZOS)


make_icon(192).save("public/pwa-192x192.png")
make_icon(512).save("public/pwa-512x512.png")
make_icon(180).save("public/apple-touch-icon.png")
make_maskable(512).save("public/maskable-512x512.png")
print("icons written")
