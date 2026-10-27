# Arraigo Venezuela · www.arraigo-venezuela.com

Sitio estático de una página. Tienda de Tote Marea, Termo Ávila y Sombrero Cristofué con pedidos por WhatsApp.

## Publicar con GitHub Pages
1. Sube todo el contenido de esta carpeta a la rama `main` del repo `arraigo-venezuela` (los archivos en la raíz, no dentro de una subcarpeta).
2. En GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**.
3. En **Custom domain** escribe `www.arraigo-venezuela.com` (el archivo `CNAME` ya lo trae) y, cuando aparezca disponible, marca **Enforce HTTPS**.

## DNS en GoDaddy (My Products → arraigo-venezuela.com → DNS)
- Borra el registro **A** con nombre `@` que apunta a "Parked" o al Website Builder.
- Agrega 4 registros **A** con nombre `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
- Registro **CNAME** con nombre `www` y valor `andresfok.github.io`.
- Espera de minutos a unas horas. `arraigo-venezuela.com` redirigirá solo a `www.arraigo-venezuela.com`.

## Estructura
- `index.html` (inicio) y una página por producto: `tote-marea/`, `termo-avila/`, `sombrero-cristofue/`.
- Estas páginas **se generan**: no las edites a mano. Edita las piezas y vuelve a generar:
  - Textos y secciones: `tools/src/*.html` (encabezado, pie, hero, cada producto, preguntas frecuentes `faq_*.html`).
  - Estilos: `assets/site.css`. Código, precios y productos: `assets/site.js`.
  - Título, descripción para Google y datos estructurados de cada producto: `PAGES` en `tools/build.py`.
  - Generar: `python3 tools/build.py` (desde la raíz del repo) y sube los cambios.

## Cambiar datos (en `assets/site.js`, bloque `CONFIG` y `PRODUCTS`)
- WhatsApp, Instagram, métodos de pago y entrega: `CONFIG`.
- Precios en bolívares: la página lee la tasa BCV de `https://andresfok.github.io/bcv-rate-pull/rate.json` (proyecto bcv-rate-pull, se actualiza cada noche). Si no carga o tiene más de `bcvMaxAgeDays` días, muestra los precios en USD a tasa BCV sin monto en Bs.
- Precios, colores, tallas, SKU y stock: `PRODUCTS`. `stock: 0` muestra "Agotado". Si cambias un precio, actualízalo también en `PAGES` (`tools/build.py`) y vuelve a generar.
- Canto del cristofué: `media/cristofue.mp3`, grabación XC1183815 de Paola Facundo (xeno-canto), usada con su permiso para uso comercial. Guarda ese permiso por escrito. Para ocultar el botón, pon `cristofueAudio: null`.
- Conexión futura con importador-venezuela: `ordersEndpoint` (POST del pedido) e `inventoryEndpoint` (stock por SKU).

## Después de publicar
- Prueba un pedido real a tu WhatsApp desde el teléfono.
- Pega el enlace en un chat de WhatsApp para ver la vista previa.
- Google Search Console: agrega el dominio y envía `https://www.arraigo-venezuela.com/sitemap.xml`.
- Google Business Profile: punto de retiro en Punta de Mulatos, La Guaira.
- Si cambias imágenes o textos importantes, actualiza `lastmod` en `sitemap.xml`.
