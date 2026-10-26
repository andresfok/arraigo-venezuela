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

## Cambiar datos (en `index.html`, bloque `CONFIG` y `PRODUCTS`)
- WhatsApp, Instagram, métodos de pago y entrega: `CONFIG`.
- Precios, colores, tallas, SKU y stock: `PRODUCTS`. `stock: 0` muestra "Agotado".
- Canto del cristofué: `cristofueAudio` está en `null`. Actívalo solo con permiso escrito de la autora (XC1183815, Paola Facundo, CC BY-NC-SA 4.0) o con una grabación propia, y agrega el crédito.
- Conexión futura con importador-venezuela: `ordersEndpoint` (POST del pedido) e `inventoryEndpoint` (stock por SKU).

## Después de publicar
- Prueba un pedido real a tu WhatsApp desde el teléfono.
- Pega el enlace en un chat de WhatsApp para ver la vista previa.
- Google Search Console: agrega el dominio y envía `https://www.arraigo-venezuela.com/sitemap.xml`.
- Google Business Profile: punto de retiro en Punta de Mulatos, La Guaira.
- Si cambias imágenes o textos importantes, actualiza `lastmod` en `sitemap.xml`.
