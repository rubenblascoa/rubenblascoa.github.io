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

**Español** 

---

**Portfolio personal one-page: sistemas, bajo nivel y proyectos de hardware/software.**

![Views](https://komarev.com/ghpvc/?username=rubenblascoa&repo=rubenblascoa.github.io&label=Views&icon=0&color=121011&style=flat-square)
[![License: MIT](https://img.shields.io/badge/License-MIT-lightgrey.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Stack](https://img.shields.io/badge/Stack-HTML%20%7C%20TailwindCSS%20%7C%20JS-black?style=flat-square)](#)
[![Live Site](https://img.shields.io/badge/Live-Online-brightgreen?style=flat-square)](#)

Sitio web personal de **Rubén Blasco Armengod**, construido como una página única (*single-page*) estática, sin dependencias de *build* ni frameworks pesados. Presenta trayectoria, proyectos destacados y un formulario de contacto funcional, con soporte bilingüe completo (Español/Inglés) y un fondo animado por Canvas inspirado en circuitos electrónicos.

[Ver el sitio](#) · [Reportar un Error](#) · [Sugerir una mejora](#)

---

</div>

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://api.iconify.design/lucide:folder-tree.svg?color=white"><img src="https://api.iconify.design/lucide:folder-tree.svg?color=black" width="26" align="center"></picture> Arquitectura y Estructura

El sitio es un único archivo HTML autocontenido, dividido lógicamente en las siguientes capas:

### 1. Capa de Presentación (Secciones)
* **`#home` (Hero)**
  * **Propósito:** Primera impresión y llamada a la acción principal.
  * **Lógica detallada:** Título editorial con tipografía serif (`Playfair Display`) combinado con texto sans-serif (`Inter`), badge de disponibilidad animado con `pulse`, y doble CTA hacia proyectos y sección "Sobre mí".
* **`#about` (Sobre mí)**
  * **Propósito:** Presentación personal y stack técnico principal.
  * **Lógica detallada:** Layout de dos columnas con imagen de perfil en escala de grises que revela color al pasar el ratón (`grayscale` → `grayscale-0`), tarjeta flotante con datos de contacto rápido, y chips de especialización (Python, C++, IoT).
* **`#experience` (Trayectoria)**
  * **Propósito:** Línea temporal de hitos académicos y de proyectos.
  * **Lógica detallada:** Timeline vertical con línea de degradado y nodos de color por hito (actualidad, colaboraciones, certificaciones), cada tarjeta con efecto `card-glow` al hover.
* **`#repositorio` (Proyectos Destacados)**
  * **Propósito:** Escaparate de los proyectos más relevantes.
  * **Lógica detallada:** Tarjetas grandes alternadas (imagen/texto) con capturas reales de cada proyecto, enlaces directos a repositorio de GitHub y sitio en vivo cuando aplica.
* **`#contacto` (Contacto)**
  * **Propósito:** Captación de mensajes directos sin backend propio.
  * **Lógica detallada:** Formulario enviado vía **FormSubmit** en modo AJAX (`/ajax/`), con honeypot anti-spam (`_honey`), plantilla de tabla, y feedback visual de éxito/error sin recargar la página.

### 2. Fondo Animado (Canvas)
* **Bloque `<script>` — Sistema de partículas "Tech Circuitry"**
  * **Propósito:** Fondo decorativo dinámico que refuerza la temática de sistemas/hardware.
  * **Lógica detallada:** Tres sistemas independientes renderizados sobre `<canvas>`: `Runner` (líneas tipo circuito que se mueven en ángulos rectos sobre una rejilla), `MatrixChar` (dígitos binarios parpadeantes de baja opacidad) y `Star` (partículas de brillo pulsante). La animación se pausa automáticamente cuando la pestaña no está visible (`visibilitychange`) para ahorrar batería/CPU, y respeta `prefers-reduced-motion`.

### 3. Sistema de Internacionalización (i18n)
* **Objeto `translations` + función `setLanguage()`**
  * **Propósito:** Cambio de idioma Español/Inglés sin recargar la página ni depender de librerías externas.
  * **Lógica detallada:** Usa atributos `data-es` / `data-en` sobre cada nodo de texto y `data-es-placeholder` / `data-en-placeholder` sobre los campos de formulario. Actualiza también el atributo `lang` del `<html>`, el título de la pestaña, y el estado visual (`aria-pressed`) del selector de idioma, tanto en la versión de escritorio como en el menú móvil.

### 4. Rendimiento y Accesibilidad
* **Optimización de carga**
  * **Lógica detallada:** Fuentes cargadas con `preconnect` + `display=swap` y `<noscript>` de respaldo; imagen del hero precargada (`rel="preload"`); atributos `loading="lazy"` y `decoding="async"` en imágenes secundarias; `fetchpriority="high"` en la imagen crítica.
* **Accesibilidad**
  * **Lógica detallada:** Enlace "Saltar al contenido principal" para lectores de pantalla, atributos `aria-label`/`aria-pressed`/`aria-expanded` en controles interactivos, y reducción completa de animaciones bajo `prefers-reduced-motion`.

---

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://api.iconify.design/lucide:list.svg?color=white"><img src="https://api.iconify.design/lucide:list.svg?color=black" width="26" align="center"></picture> Características Principales

* **100% Estático:** Sin backend propio, sin *build step* — un único HTML desplegable en cualquier hosting estático.
* **Bilingüe en Tiempo Real:** Cambio instantáneo Español/Inglés, persistido visualmente en toda la interfaz (textos, placeholders, título de pestaña).
* **Formulario de Contacto Funcional:** Envío de mensajes vía FormSubmit con feedback de éxito/error, sin exponer ningún backend propio.
* **Fondo Animado por Canvas:** Sistema de partículas tipo "circuito" con parada automática al cambiar de pestaña, respetuoso con el rendimiento y las preferencias de accesibilidad.
* **Diseño Responsive:** Menú móvil dedicado, *grid* adaptativo en todas las secciones, y tipografía escalable.
* **Efectos de Interacción Cuidados:** *Glassmorphism*, *glow* en tarjetas al hover, revelado progresivo de secciones al hacer scroll (`IntersectionObserver`).

---

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://api.iconify.design/lucide:hard-drive.svg?color=white"><img src="https://api.iconify.design/lucide:hard-drive.svg?color=black" width="26" align="center"></picture> Stack e Instalación

* **Maquetado:** HTML5 semántico
* **Estilos:** [Tailwind CSS](https://tailwindcss.com) (build local, `/tailwind.min.css`) + CSS personalizado para animaciones
* **Tipografía:** Google Fonts — `Playfair Display`, `Inter`, `JetBrains Mono`
* **Interactividad:** JavaScript vanilla (sin frameworks)
* **Formulario:** [FormSubmit](https://formsubmit.co) (modo AJAX)
* **Hosting recomendado:** Cualquier hosting estático gratuito (GitHub Pages, Cloudflare Pages, Netlify, Vercel)

### Despliegue local

1. Clona el repositorio.
2. Genera el CSS de Tailwind si modificas clases nuevas: `npx tailwindcss -i input.css -o tailwind.min.css --minify`.
3. Abre `index.html` directamente en el navegador, o sírvelo con cualquier servidor estático (`npx serve .`).

### Despliegue en producción

Al ser un sitio 100% estático, basta con subir el HTML y el CSS compilado a cualquier proveedor de hosting estático — no requiere variables de entorno ni backend.

---

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://api.iconify.design/lucide:mail.svg?color=white"><img src="https://api.iconify.design/lucide:mail.svg?color=black" width="26" align="center"></picture> Contacto

Desarrollado por **Rubén Blasco Armengod**.

* **GitHub:** [@rubenblascoa](https://github.com/rubenblascoa)
* **Instagram:** [@rubenblascoa](https://instagram.com/rubenblascoa)
* **Email:** rubenblascoarmengod@gmail.com
