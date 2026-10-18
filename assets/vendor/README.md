# Librerías de terceros

Copias exactas de las librerías que usa la web, servidas desde el propio sitio para no depender de CDN externas.
No están bajo la licencia CC BY 4.0 del portfolio: cada una conserva la de sus autores.

| Librería | Versión | Origen | Licencia |
|---|---|---|---|
| GSAP + ScrollTrigger | 3.12.5 | cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ | [GSAP Standard "No Charge" License](https://gsap.com/standard-license) (aviso en la cabecera de cada archivo) |
| Lenis | 1.1.13 | unpkg.com/lenis@1.1.13/dist/ | MIT, ver `lenis-1.1.13/LICENSE` |
| Three.js (+ RoomEnvironment y RoundedBoxGeometry) | 0.160.0 | cdn.jsdelivr.net/npm/three@0.160.0/ | MIT, ver `three-0.160.0/LICENSE` |

Para actualizar una librería, descarga la nueva versión en una carpeta nueva (`nombre-versión/`) y cambia las rutas en `index.html`
(etiquetas `<script>` e `importmap`); después ejecuta `node tools/build-en.mjs`.
