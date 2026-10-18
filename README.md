<div align="center">

<img src="https://api.iconify.design/lucide:user-round.svg?color=black" alt="Person icon" width="120" />

<h3>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.iconify.design/lucide:terminal.svg?color=white">
    <img src="https://api.iconify.design/lucide:terminal.svg?color=black" alt="Terminal" width="28" align="center" />
  </picture>
  Ruben Blasco | Portfolio
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.iconify.design/lucide:cpu.svg?color=white">
    <img src="https://api.iconify.design/lucide:cpu.svg?color=black" alt="CPU" width="28" align="center" />
  </picture>
</h3>

**Español · English** 

---

**Portfolio cinemático: del chip al sistema, contado como una película con scroll.**

![Views](https://komarev.com/ghpvc/?username=rubenblascoa&repo=rubenblascoa.github.io&label=Views&icon=0&color=121011&style=flat-square)
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg?style=flat-square)](LICENSE)
[![Stack](https://img.shields.io/badge/Stack-HTML%20%7C%20GSAP%20%7C%20Three.js-black?style=flat-square)](#)
[![Live Site](https://img.shields.io/badge/Live-Online-brightgreen?style=flat-square)](https://rubenblascoa.github.io/)

Sitio web personal de **Rubén Blasco Armengod**, una única página estática y sin *build* que cuenta su trabajo como una película (inspirada en la web de GTA VI): el logo RB se llena de blanco al cargar, la cámara lo atraviesa para presentarle y, después, la placa real de **ESP32 Blasco OS** se dibuja desde sus archivos Gerber, se despieza en capas y se convierte en un modelo 3D antes de dar paso a los proyectos.

[Ver el sitio](https://rubenblascoa.github.io/) · [Reportar un Error](https://github.com/rubenblascoa/rubenblascoa.github.io/issues) · [Sugerir una mejora](https://github.com/rubenblascoa/rubenblascoa.github.io/issues)

---

</div>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://api.iconify.design/lucide:folder-tree.svg?color=white"><img src="https://api.iconify.design/lucide:folder-tree.svg?color=black" width="26" align="center"></picture> Arquitectura y Estructura

```
index.html                 La película completa (HTML, CSS y la lógica de las escenas), en español
en/index.html              La misma página en inglés, generada (no se edita a mano)
tools/build-en.mjs         Genera en/index.html a partir de index.html
privacidad/ · en/privacy/  Política de privacidad (sin cookies ni formularios), escrita a mano en los dos idiomas
assets/fonts/              Tipografías propias (woff2) y fonts.css
assets/vendor/             GSAP, Lenis y Three.js servidos desde el sitio (sin CDN externas)
assets/legal/legal.css     Estilos de las páginas legales
assets/cinematic/
  pcb-data.js              Capas de la placa generadas desde los Gerber reales (pistas, pads, taladros, serigrafía)
  pcb3d.js                 Modelo 3D de la placa en Three.js (portado de la landing de Blasco OS)
  pcb3d-top/bottom.webp    Texturas de las dos caras de la placa
  og.jpg · favicon.svg     Tarjeta para redes (1200×630) e icono RB
  *-login.jpg              Capturas actuales de Blasco OS y FondTracker
```

### 1. Escenas (una sola página con scroll)
* **Carga**
  * **Lógica detallada:** El monograma RB (SVG) se llena con una ola blanca que sigue el progreso real de carga (fuentes y página), con una duración mínima para que se vea entera.
* **`#intro` — 00 · Sobre mí**
  * **Lógica detallada:** El RB es una máscara SVG: la cámara atraviesa el palo de la R, la pantalla se funde a negro y aparece la presentación. El manifiesto se ilumina palabra a palabra y al fondo corre, en un `<canvas>`, código real del firmware de Blasco OS. Al pie, el stack tecnológico en bucle.
* **`#story` — 01 a 03 · La placa**
  * **Lógica detallada:** Las 174 pistas se dibujan desde el ESP32 hacia fuera; aparecen sustrato, plano de cobre, pads y serigrafía; la placa se despieza en una vista 3D por capas (CSS 3D) y, al aplanarse, el plano se convierte en el modelo 3D real, que la cámara recorre hasta el sello de la serigrafía.
* **`#os` y `#ft` — Protagonistas**
  * **Lógica detallada:** Cada proyecto entra como una tarjeta que se abre hasta llenar la pantalla, con sus datos, terminal animada o gráfica, y captura actual del sitio en vivo.
* **`#timeline` — Trayectoria**
  * **Lógica detallada:** Línea temporal horizontal que avanza con el scroll vertical.
* **`#end` — Créditos**
  * **Lógica detallada:** El RB vuelve a llenarse de blanco, como en la carga, y cierra con el contacto.

### 2. Rendimiento
* **Carga:** solo se espera a las fuentes y a la página; Three.js (minificado) y las texturas se descargan en paralelo y la puesta a punto del 3D (compilación de *shaders*, subida de texturas y sombras) ocurre durante la pantalla de carga.
* **Animación:** las capas que aparecen con fundido tienen su propia capa de GPU, la serigrafía (miles de trazos) no se redibuja fotograma a fotograma, y el lienzo 3D y el de código solo pintan mientras se ven.
* **Accesibilidad:** `prefers-reduced-motion` desactiva las animaciones continuas; enlace para saltar al contacto; textos alternativos en todas las imágenes; con el teclado, la escena avanza hasta el enlace que recibe el foco.
* **A prueba de fallos:** si GSAP no llega a cargar, la web se enseña como una página normal, sin película pero completa. En un móvil en horizontal aparece un aviso para girarlo.

### 3. Idiomas
* Español en `/` e inglés en `/en/`: cada página trae su idioma ya escrito en el HTML, que es lo que leen los buscadores.
* El selector **ES / EN** de la barra superior cambia el texto sin recargar ni perder la posición, actualiza la URL y recuerda la elección del visitante. Los enlaces antiguos `/?lang=en` llevan a `/en/`.
* Los textos en inglés se escriben en `index.html`, en atributos `data-en` junto al original. **Después de cambiar `index.html`, ejecuta `node tools/build-en.mjs`** para regenerar `en/index.html` (el script avisa si algo no cuadra en vez de generar una página a medias).

### 4. SEO
* Título, descripción, `canonical`, Open Graph de perfil y Twitter con tarjeta de 1200×630.
* Datos estructurados (JSON-LD): `WebSite`, `ProfilePage`, `Person`, `SoftwareSourceCode` (ESP32 Blasco OS) y `SoftwareApplication` (FondTracker).
* `hreflang` (es → `/` · en → `/en/` · x-default) en las dos páginas y en el sitemap.
* `sitemap.xml` con imágenes, `robots.txt` y `llms.txt` para buscadores con IA.

---

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://api.iconify.design/lucide:hard-drive.svg?color=white"><img src="https://api.iconify.design/lucide:hard-drive.svg?color=black" width="26" align="center"></picture> Stack e Instalación

* **Maquetado:** HTML5 semántico + CSS propio
* **Animación:** [GSAP](https://gsap.com) + ScrollTrigger, scroll suave con [Lenis](https://lenis.darkroom.engineering)
* **3D:** [Three.js](https://threejs.org) 0.160
* **Tipografía:** `Big Shoulders Display`, `Inter`, `JetBrains Mono` y `Playfair Display`, servidas desde `assets/fonts/` (solo latín y latín extendido), sin Google Fonts
* **Hosting:** GitHub Pages (cualquier hosting estático sirve)

### Despliegue local

1. Clona el repositorio.
2. Sírvelo con cualquier servidor estático, por ejemplo `python -m http.server` o `npx serve .`.
3. Abre `http://localhost:8000/`. (Abrir `index.html` con doble clic no basta: el modelo 3D se carga como módulo y el navegador lo bloquea en `file://`.)

### Despliegue en producción

Al ser un sitio 100% estático, basta con subir los archivos a GitHub Pages; no requiere variables de entorno ni backend. Solo hay que regenerar la versión en inglés (`node tools/build-en.mjs`) antes de subir si has tocado `index.html`.

---

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://api.iconify.design/lucide:scale.svg?color=white"><img src="https://api.iconify.design/lucide:scale.svg?color=black" width="26" align="center"></picture> Licencia

Este portfolio se publica bajo **[Creative Commons Atribución 4.0 (CC BY 4.0)](LICENSE)**. Puedes usarlo, copiarlo y modificarlo libremente, también con fines comerciales, **siempre que reconozcas la autoría** con un enlace a este repositorio. Por ejemplo, en el pie de tu web o en tu README:

> Basado en el portfolio de [Rubén Blasco Armengod](https://github.com/rubenblascoa/rubenblascoa.github.io), CC BY 4.0

Si lo reutilizas para tu propio portfolio, cambia los datos personales (nombre, foto, contacto y proyectos) por los tuyos.

El aviso de autoría está en [`NOTICE`](NOTICE) y el texto legal completo en [`LICENSE`](LICENSE).

No entran en esta licencia las tipografías de `assets/fonts/`, que son de sus autores (SIL Open Font License 1.1, ver [`OFL.txt`](assets/fonts/OFL.txt)), ni GSAP, Lenis y Three.js (`assets/vendor/`), que conservan sus propias licencias ([detalle](assets/vendor/README.md)).

---

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://api.iconify.design/lucide:mail.svg?color=white"><img src="https://api.iconify.design/lucide:mail.svg?color=black" width="26" align="center"></picture> Contacto

Desarrollado por **Rubén Blasco Armengod**.

* **GitHub:** [@rubenblascoa](https://github.com/rubenblascoa)
* **LinkedIn:** [rubenblascoa](https://www.linkedin.com/in/rubenblascoa/)
* **Instagram:** [@rubenblascoa](https://instagram.com/rubenblascoa)
* **Email:** rubenblascoarmengod@gmail.com
