# Mesón Barrero — web

Sitio estático del Mesón Barrero (Robledillo de Gata, Sierra de Gata, Cáceres), publicado con GitHub Pages en
https://abrahamrrr180-netizen.github.io/meson-barrero-web/

## Estructura
- `index.html` — página principal (ES; selector ES/PT/EN en la cabecera).
- `aviso-legal.html`, `privacidad.html`, `404.html`.
- `css/styles.css` — estilos (paleta verde bosque / marfil / oro envejecido / marrón carbón).
- `js/i18n.js` — traducciones; `js/main.js` — cabecera, idioma, horario, carta, WhatsApp.
- `fonts/` — Cormorant Garamond y Manrope (woff2 variables, servidas desde el propio sitio).
- `img/` — fotos en WebP a varios tamaños + `og.jpg` para compartir.
- `robots.txt`, `sitemap.xml`, `favicon.svg`, `favicon.png`, `apple-touch-icon.png`, `.nojekyll`.

## Mantenimiento
- **Horario**: `js/main.js`, constante `H` (minutos desde medianoche por día, 0 = domingo). Cambiar también el texto del hero, la FAQ y el JSON-LD de `index.html`.
- **Carta**: bloques `.grp` en `index.html`. Cada plato es un `.d`. Añadir la traducción en `js/i18n.js` (fila `[es, pt, en]`).
- **Fotos del restaurante**: sustituir `img/meson-*.webp` y `img/og.jpg`; comprimir a WebP ~80 de calidad.
- **Datos legales**: rellenar los bloques "pendiente" de `aviso-legal.html` y `privacidad.html`.

## Publicar
`git push origin main` → GitHub Pages redepliega en 1–2 minutos (Settings → Pages → Deploy from a branch → main / root).
La versión anterior está en la rama `backup-v1`.

## Créditos de imágenes
Fotos de Robledillo vía Wikimedia Commons: Joanvega (CC BY-SA 3.0), Agila13 (CC BY-SA 3.0 ES), Chemasanco (CC BY 2.0), DavidDaguerro (CC BY-SA 4.0).
Fachada del mesón: --MARCO POLO-- (Flickr, todos los derechos reservados) — **uso pendiente de autorización**; sustituir por foto propia antes de la publicación definitiva.
