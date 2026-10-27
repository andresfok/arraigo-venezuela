#!/usr/bin/env python3
"""Genera las páginas del sitio Arraigo Venezuela a partir de las piezas en tools/src/.

Uso:
  python3 tools/build.py                 # escribe index.html y las páginas de producto en la raíz del repo
  python3 tools/build.py --preview DIR   # versión de vista previa (enlaces a .../index.html) en DIR

Textos de las piezas: tools/src/*.html. Estilos: assets/site.css. Código: assets/site.js.
Precios y productos (lo que ve el cliente): bloque PRODUCTS en assets/site.js.
Si cambias un precio, cámbialo también en PAGES (abajo), que alimenta la descripción para Google.
"""
import json, os, sys

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT_DIR, "tools", "src")
SITE = "https://www.arraigo-venezuela.com/"

def part(name):
    with open(os.path.join(SRC, name + ".html"), encoding="utf-8") as f:
        return f.read()

ORG = {
    "@type": "Organization", "@id": SITE + "#arraigo", "url": SITE,
    "name": "Arraigo Venezuela", "alternateName": "Arraigo",
    "logo": SITE + "logo.png", "image": SITE + "og-image.jpg",
    "description": "Marca venezolana de esenciales para el día a día: bolsos, termos y sombreros.",
    "taxID": "J-508703294",
    "areaServed": [{"@type": "City", "name": "La Guaira"}, {"@type": "City", "name": "Caracas"}],
    "sameAs": ["https://www.instagram.com/arraigo.ve/"],
    "contactPoint": {"@type": "ContactPoint", "telephone": "+1-727-999-1429", "contactType": "sales", "availableLanguage": "es"},
}
SELLER = {"@id": SITE + "#arraigo"}
INSTOCK = "https://schema.org/InStock"

PAGES = {
    "tote-marea": {
        "part": "marea", "key": "tote", "name": "Tote Marea",
        "title": "Tote Marea · Bolso de uso diario | Arraigo Venezuela",
        "description": "Bolso Tote Marea en 2 tamaños y 3 colores: se lava con agua, se para solo y aguanta trote. Desde $28 en divisas. Delivery en La Guaira y Caracas.",
        "faq": ["tamano", "pesado", "material", "limpia_tote", "entregan", "pagos"],
        "product": {
            "@type": "Product", "name": "Tote Marea",
            "description": "Bolso de uso diario que se lava con agua, se para solo y aguanta trote. Grande (48 × 34 × 23 cm, 1.300 g) y mediano (38 × 31 × 13 cm, 820 g). Colores Verde Palma, Coral y Cielo.",
            "image": [SITE + "img2/p-cielo.webp", SITE + "img2/p-coral.webp", SITE + "img2/p-verde.webp"],
            "brand": SELLER, "color": "Verde Palma, Coral, Cielo",
            "offers": [
                {"@type": "Offer", "name": "Tote Marea Grande", "sku": "ARR-MAREA-G", "price": "33.00", "priceCurrency": "USD", "availability": INSTOCK, "seller": SELLER, "url": SITE + "tote-marea/"},
                {"@type": "Offer", "name": "Tote Marea Mediano", "sku": "ARR-MAREA-M", "price": "28.00", "priceCurrency": "USD", "availability": INSTOCK, "seller": SELLER, "url": SITE + "tote-marea/"},
            ],
        },
    },
    "termo-avila": {
        "part": "hydro", "key": "termo", "name": "Termo Ávila",
        "title": "Termo Ávila · Termo de acero con asa, 890 ml | Arraigo Venezuela",
        "description": "Termo de acero 304 de doble pared, 890 ml, con pitillo y tapa con seguro. Frío 12 h, calor 6 h. Llega en caja de regalo. $19 en divisas.",
        "faq": ["termo_frio", "termo_derrame", "termo_regalo", "termo_lavar", "entregan", "pagos"],
        "product": {
            "@type": "Product", "name": "Termo Ávila",
            "description": "Termo de acero 304 de doble pared al vacío, 890 ml, con asa, pitillo y tapa con seguro. Frío 12 h, calor 6 h. Llega en caja de regalo.",
            "image": [SITE + "img2/p-jug.webp"], "brand": SELLER, "sku": "ARR-TERMO-AV", "color": "Ávila",
            "material": "Acero inoxidable 304",
            "offers": {"@type": "Offer", "price": "19.00", "priceCurrency": "USD", "availability": INSTOCK, "seller": SELLER, "url": SITE + "termo-avila/"},
        },
    },
    "sombrero-cristofue": {
        "part": "wings", "key": "sombrero", "name": "Sombrero Cristofué",
        "title": "Sombrero Cristofué · Sombrero tejido de ala ancha | Arraigo Venezuela",
        "description": "Sombrero tejido de ala ancha con el cristofué bordado y estampado tropical bajo el ala. Talla única 56–58 cm. $23 en divisas. Delivery en La Guaira y Caracas.",
        "faq": ["sombrero_talla", "sombrero_parche", "sombrero_limpia", "entregan", "pagos"],
        "product": {
            "@type": "Product", "name": "Sombrero Cristofué",
            "description": "Sombrero tejido de ala ancha con parche bordado del cristofué y estampado tropical bajo el ala. Talla única 56–58 cm, cordón ajustable.",
            "image": [SITE + "img2/p-hat.webp", SITE + "img2/p-hat-under.webp"], "brand": SELLER, "sku": "ARR-SOMB-CR",
            "material": "Fibra natural tejida", "size": "56–58 cm",
            "offers": {"@type": "Offer", "price": "23.00", "priceCurrency": "USD", "availability": INSTOCK, "seller": SELLER, "url": SITE + "sombrero-cristofue/"},
        },
    },
}
HOME_FAQ = ["entregan", "disponibilidad", "pagos", "mayor"]


def head(title, desc, url, og_image, og_alt, ld, base):
    ld_json = json.dumps(ld, ensure_ascii=False, indent=2)
    return f'''<!doctype html>
<html lang="es-VE" data-base="{base}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<link rel="icon" href="{base}favicon.svg" type="image/svg+xml">
<link rel="icon" href="{base}favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="{base}apple-touch-icon.png">
<meta name="theme-color" content="#0D3474">
<!-- Vista previa al compartir (WhatsApp, Instagram, Facebook) -->
<meta property="og:url" content="{url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_VE">
<meta property="og:site_name" content="Arraigo Venezuela">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{og_image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{og_alt}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;800;900&family=Bodoni+Moda:ital,opsz,wght@1,6..96,400;1,6..96,500&display=swap">
<link rel="stylesheet" href="{base}assets/site.css">
<!-- Datos estructurados (Google) -->
<script type="application/ld+json">
{ld_json}
</script>
</head>
<body>
'''


def tail(base):
    return f'<script src="{base}assets/site.js"></script>\n</body>\n</html>\n'


def fill(html, **kw):
    for k, v in kw.items():
        html = html.replace("{{" + k + "}}", v)
    return html


def product_section(slug, full, root, idx):
    pg = PAGES[slug]
    html = part(pg["part"])
    label, sub = open(os.path.join(SRC, pg["part"] + ".label"), encoding="utf-8").read().strip().split("|")
    start, end = html.index("{{DETAILS_START}}"), html.index("{{DETAILS_END}}")
    body = html[start + len("{{DETAILS_START}}"):end]
    if full:
        details = f'    <div class="more-open">\n      <div class="more-body">{body}      </div>\n    </div>'
    else:
        details = (f'    <a class="more more-link" href="{root}{slug}/{idx}">\n      <span class="wrap more-row"><span class="more-label"><b>{label}</b>'
                   f'<small>{sub}</small></span><span class="more-icon arrow" aria-hidden="true"></span></span>\n    </a>')
    html = html[:start] + details + html[end + len("{{DETAILS_END}}"):]
    return fill(html, HN="h1" if full else "h2", DETAIL="" if full else f"{root}{slug}/{idx}", ROOT=root)


def faq(items):
    return fill(part("faq"), FAQ_ITEMS="".join("        " + part("faq_" + i) for i in items).rstrip("\n"))


def cross_sell(current, root, idx):
    hero = part("hero")
    lis = hero[hero.index('<ol class="day"'):hero.index("</ol>")]
    items = lis.split('<li class="moment">')[1:]
    keep = [it for it in items if f"{current}/" not in it]
    out = ['  <section class="xsell">', '    <div class="wrap">',
           '      <div class="sec-head"><div><span class="eyebrow">Completa tu día</span><h2>Un día en <span class="serif">Venezuela</span></h2></div>'
           f'<a class="btn btn-ghost" href="{root}{idx}#tienda">Ver los tres</a></div>',
           '      <ol class="day two">']
    for it in keep:
        out.append('        <li class="moment">' + it.rsplit("</li>", 1)[0].replace('<h3>', '<h3>') + "</li>")
    out += ["      </ol>", "    </div>", "  </section>"]
    return fill("\n".join(out), ROOT=root, IDX=idx)


def shell(root, idx, current=""):
    cur = {k: "" for k in ("CUR_tote", "CUR_termo", "CUR_sombrero")}
    if current:
        cur["CUR_" + current] = ' aria-current="page"'
    home = root + idx
    return lambda html: fill(html, ROOT=root, IDX=idx, HOME=home, **cur)


def build_home(idx):
    f = shell("", idx)
    ld = {"@context": "https://schema.org", "@graph": [ORG, {"@type": "WebSite", "@id": SITE + "#web", "url": SITE, "name": "Arraigo Venezuela", "inLanguage": "es-VE", "publisher": {"@id": SITE + "#arraigo"}}]}
    out = head("Arraigo Venezuela · Bolsos, termos y sombreros diseñados en Venezuela",
               "Bolsos, termos y sombreros diseñados en Venezuela: Tote Marea, Termo Ávila y Sombrero Cristofué. Pide por WhatsApp. Delivery en La Guaira y Caracas.",
               SITE, SITE + "og-image.jpg", "Arraigo Venezuela: Tus esenciales. Tote Marea, Termo Ávila y Sombrero Cristofué", ld, "")
    out += part("symbol") + "\n" + f(part("header")) + "\n<main id=\"top\">\n" + f(part("hero")) + "\n"
    for slug in ("tote-marea", "termo-avila", "sombrero-cristofue"):
        out += product_section(slug, False, "", idx) + "\n"
    for p in ("about", "mayor", "how", "ig"):
        out += part(p) + "\n"
    out += faq(HOME_FAQ) + "\n</main>\n\n" + f(part("footer")) + "\n" + part("cart") + "\n" + tail("")
    return out


def build_product(slug, idx):
    pg = PAGES[slug]
    root = "../"
    f = shell(root, idx, pg["key"])
    url = SITE + slug + "/"
    crumbs = {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Inicio", "item": SITE},
        {"@type": "ListItem", "position": 2, "name": pg["name"], "item": url}]}
    prod = dict(pg["product"]); prod["url"] = url
    ld = {"@context": "https://schema.org", "@graph": [ORG, prod, crumbs]}
    out = head(pg["title"], pg["description"], url, SITE + f"og-{slug}.jpg", pg["name"] + " · Arraigo Venezuela", ld, root)
    out += part("symbol") + "\n" + f(part("header")) + "\n<main id=\"top\">\n"
    out += (f'  <nav class="crumbs" aria-label="Ruta"><div class="wrap"><a href="{root}{idx}">Inicio</a>'
            f'<span aria-hidden="true">›</span><span aria-current="page">{pg["name"]}</span></div></nav>\n')
    out += product_section(slug, True, root, idx) + "\n" + part("how") + "\n" + cross_sell(slug, root, idx) + "\n" + faq(pg["faq"])
    out += "\n</main>\n\n" + f(part("footer")) + "\n" + part("cart") + "\n" + tail(root)
    return out


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(text)


def main():
    preview = "--preview" in sys.argv
    out_dir = sys.argv[sys.argv.index("--preview") + 1] if preview else ROOT_DIR
    idx = "index.html" if preview else ""
    write(os.path.join(out_dir, "index.html"), build_home(idx))
    for slug in PAGES:
        write(os.path.join(out_dir, slug, "index.html"), build_product(slug, idx))
    print("ok:", out_dir)


if __name__ == "__main__":
    main()
