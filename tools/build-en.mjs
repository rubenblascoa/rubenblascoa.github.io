// Genera en/index.html a partir de index.html: la misma película con el inglés ya escrito en el HTML.
// Los textos en español pasan a data-es (y data-es-label, data-es-alt, data-es-text) para el selector ES / EN.
// Se ejecuta solo en GitHub (.github/workflows/build-en.yml) cada vez que cambia index.html.
// A mano: node tools/build-en.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
// Saltos de línea de Windows (\r\n) → \n: así funciona igual si index.html se editó en Windows
let html = readFileSync(root + 'index.html', 'utf8').replace(/\r\n/g, '\n');

const decode = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const encode = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Sustituye exactamente una vez: si el original cambia, el script avisa en vez de generar algo a medias
function once(from, to) {
  const n = html.split(from).length - 1;
  if (n !== 1) throw new Error(`Se esperaba 1 aparición y hay ${n}: ${from.slice(0, 80)}`);
  html = html.replace(from, () => to);
}

/* ---------- Cabecera ---------- */
const SITE = 'https://rubenblascoa.github.io';
const ES = {
  title: 'Rubén Blasco Armengod | Firmware, ESP32 y sistemas embebidos',
  desc: 'Rubén Blasco Armengod, desarrollador de firmware y sistemas embebidos. Proyectos: ESP32 Blasco OS (FreeRTOS, ESP32-S3) y FondTracker, seguimiento de fondos en tiempo real.',
  social: 'Rubén Blasco Armengod — Del chip al sistema',
  alt: 'Rubén Blasco Armengod — Firmware, ESP32 y sistemas embebidos'
};
const EN = {
  title: 'Rubén Blasco Armengod | Firmware, ESP32 &amp; embedded systems',
  desc: 'Rubén Blasco Armengod, firmware and embedded systems developer. Projects: ESP32 Blasco OS (FreeRTOS, ESP32-S3) and FondTracker, real-time investment fund tracking.',
  social: 'Rubén Blasco Armengod — From chip to system',
  alt: 'Rubén Blasco Armengod — Firmware, ESP32 &amp; embedded systems'
};
once('<html lang="es"', '<html lang="en"');
once(`<title>${ES.title}</title>`, `<title>${EN.title}</title>`);
once(`<link rel="canonical" href="${SITE}/">`, `<link rel="canonical" href="${SITE}/en/">`);
once(`<meta property="og:url" content="${SITE}/">`, `<meta property="og:url" content="${SITE}/en/">`);
once('<meta property="og:locale" content="es_ES">', '<meta property="og:locale" content="en_US">');
once('<meta property="og:locale:alternate" content="en_US">', '<meta property="og:locale:alternate" content="es_ES">');
once('<a href="/privacidad/" id="privacyLink"', '<a href="/en/privacy/" id="privacyLink"');
html = html.replaceAll(`content="${ES.desc}"`, `content="${EN.desc}"`);
html = html.replaceAll(`content="${ES.social}"`, `content="${EN.social}"`);
html = html.replaceAll(`content="${ES.alt}"`, `content="${EN.alt}"`);

/* ---------- Datos estructurados (JSON-LD) en inglés y apuntando a /en/ ---------- */
html = html.replace(/(<script type="application\/ld\+json">\n)([\s\S]*?)(\n\s*<\/script>)/, (all, open, json, close) => {
  const ld = JSON.parse(json);
  const byType = t => ld['@graph'].find(n => n['@type'] === t);
  Object.assign(byType('ProfilePage'), {
    '@id': `${SITE}/en/#webpage`, url: `${SITE}/en/`, inLanguage: 'en',
    name: decode(EN.title), description: EN.desc
  });
  Object.assign(byType('Person'), {
    jobTitle: 'Systems and firmware developer',
    description: 'High school student and self-taught firmware and embedded systems developer, open to sponsorships and collaborations. Learns by doing: starts with a real problem, understands the hardware down to the registers and doesn’t stop until it works.',
    knowsAbout: byType('Person').knowsAbout.map(k => ({
      'Sistemas embebidos': 'Embedded systems', 'Programación de bajo nivel': 'Low-level programming', 'Diseño de PCB': 'PCB design'
    })[k] || k)
  });
  byType('SoftwareSourceCode').description = 'Multi-program runtime for the ESP32-S3: FreeRTOS with one core for networking, storage and OTA and another dedicated to the hardware, wireless access over Telnet, WebSockets and Cloudflare Tunnel, and the Blasco AI assistant.';
  byType('SoftwareApplication').description = 'Real-time tracking of investment funds and ETFs: prices from Yahoo Finance and QueFondos, adding funds by ISIN and automatic summaries over WhatsApp.';
  const indent = json.match(/^\s*/)[0];
  return open + JSON.stringify(ld, null, 2).replace(/^/gm, indent) + close;
});
if (!html.includes(`"url": "${SITE}/en/"`)) throw new Error('No se ha podido traducir el JSON-LD');

/* ---------- Atributos: aria-label y alt ---------- */
html = html.replace(/<[a-zA-Z][^>]*\sdata-en-(label|alt)="[^"]*"[^>]*>/g, (tag, kind) => {
  const attr = kind === 'label' ? 'aria-label' : 'alt';
  const en = tag.match(new RegExp(`\\sdata-en-${kind}="([^"]*)"`))[1];
  const es = tag.match(new RegExp(`\\s${attr}="([^"]*)"`))[1];
  return tag
    .replace(new RegExp(`(\\s)${attr}="[^"]*"`), `$1${attr}="${en}"`)
    .replace(new RegExp(`(\\s)data-en-${kind}="[^"]*"`), `$1data-es-${kind}="${es}"`);
});

/* ---------- Contenido: data-en (HTML) y data-en-text (texto del manifiesto) ---------- */
const open = /<([a-zA-Z][\w-]*)([^>]*?)\sdata-en(-text)?="([^"]*)"([^>]*)>/g;
let out = '', pos = 0, m;
while ((m = open.exec(html))) {
  const [tag, name, before, isText, en, after] = m;
  // Cierre que le corresponde, contando etiquetas del mismo nombre anidadas
  const re = new RegExp(`<(/?)${name}\\b[^>]*>`, 'g');
  re.lastIndex = m.index + tag.length;
  let depth = 1, close;
  while (depth && (close = re.exec(html))) depth += close[1] ? -1 : 1;
  if (depth) throw new Error(`Sin cierre para <${name}> en ${m.index}`);
  const es = html.slice(m.index + tag.length, close.index);
  out += html.slice(pos, m.index)
    + `<${name}${before} data-es${isText || ''}="${encode(es)}"${after}>`
    + (isText ? en : decode(en));
  pos = close.index;
  open.lastIndex = close.index;
}
html = out + html.slice(pos);

if (/\sdata-en(-\w+)?="/.test(html)) throw new Error('Quedan atributos data-en sin convertir');

mkdirSync(root + 'en', { recursive: true });
// El aviso de index.html («la versión en inglés se genera sola…») se cambia por el de página generada
const NOTE = /^(<!DOCTYPE html>\n)(<!-- [^\n]*-->\n)?/i;
writeFileSync(root + 'en/index.html', html.replace(NOTE,
  (m, doctype) => doctype + '<!-- Generado por tools/build-en.mjs a partir de index.html. No editar a mano. -->\n'));
console.log('en/index.html listo');
