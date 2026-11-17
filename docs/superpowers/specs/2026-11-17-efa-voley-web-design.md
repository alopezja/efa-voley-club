# EFA Voley Club — Web + Admin · Documento de diseño

- **Fecha:** 2026-11-17
- **Proyecto:** Sitio web público + panel de administración para *Eso Fue Adentro Voley Club* (EFA)
- **Estado:** Diseño aprobado — pendiente de plan de implementación

---

## 1. Objetivo

Dar al club **presencia online profesional** desde cero, con un sitio **muy llamativo pero minimalista**, de navegación simple, **SEO fuerte**, y un **panel de administración a medida ultra simple** ("subir archivo → descripción → guardar") para que dirigentes **no técnicos** publiquen contenido sin depender de un desarrollador.

### Principios
- **Simplicidad radical en el admin.** Nada de paneles tipo WordPress.
- **SEO de primera** (renderizado en servidor, metadatos, sitemap, datos estructurados).
- **Costo $0 para arrancar**, usando infraestructura ya disponible.
- **Mobile-first** y alto impacto visual.
- **YAGNI:** construir solo lo de la v1; lo demás queda en el roadmap.

---

## 2. Stack / Arquitectura

| Capa | Tecnología | Rol |
|------|-----------|-----|
| Frontend + Admin | **Next.js (App Router, TypeScript) + Tailwind CSS** | Sitio público y panel `/admin`, un solo proyecto |
| Hosting | **Vercel** (cuenta de pago ya existente) | Despliegue nativo de Next.js |
| Base de datos + Auth | **Supabase** (proyecto nuevo, plan gratuito) | Postgres + logins de admin |
| Almacenamiento de medios | **Cloudflare R2** (ya en uso) | Archivos de fotos y videos (sin costo de egress) |
| Correo | **Resend** (capa gratuita) | Aviso de nuevos mensajes de contacto |

### Regla de responsabilidades
- **R2** guarda *el archivo* (foto/video).
- **Supabase** guarda *la ficha/metadatos* (título, descripción, orden, estado, relaciones).

### Subida de medios
Subida directa del navegador a R2 mediante **presigned URLs** (el servidor firma la URL; el archivo no pasa pesado por Vercel). Supabase guarda la `url`/`key` resultante más los metadatos.

### Nota sobre videos
En el admin habrá **dos opciones** por video: *subir a R2* (MP4, bien para volúmenes chicos, sin egress) o *pegar enlace de YouTube* (streaming más fino). El modelo soporta ambos.

---

## 3. Modelo de datos (Supabase / Postgres)

> Todas las tablas con `id` (uuid), `created_at`, `updated_at` salvo indicación.

### `admin_users`
Gestionado por **Supabase Auth** (email + contraseña). Tabla `profiles` enlazada con rol `admin`. En v1 se crean a mano (2-3 dirigentes).

### `players` (jugadores)
`nombre, apellido, fecha_nacimiento, genero, categoria, documento, email, telefono, contacto_emergencia, estado (pendiente|aprobado|rechazado), fecha_registro, aprobado_por, fecha_aprobacion`

### `articles` (noticias)
`titulo, slug, resumen, cuerpo, imagen_portada_url (R2), estado (borrador|publicado), fecha_publicacion, autor`

### `convocatorias`
`titulo, slug, fecha_torneo, lugar, categoria, descripcion, imagen_portada_url, estado (borrador|publicado)`

### `gallery_items`
`tipo (foto|video), titulo, descripcion, url (R2) | enlace_youtube, categoria, orden`

### `contact_messages`
`nombre, email, mensaje, leido (bool), fecha`

### `site_content`
Texto editable de "Nosotros" (clave/valor o fila única). Evita depender de código para cambiar el texto institucional.

---

## 4. Páginas públicas (SEO server-side)

| Ruta | Contenido |
|------|-----------|
| `/` | Hero de impacto (logo + nombre + frase + CTA "Súmate"), últimas noticias, próximas convocatorias, destacados de galería |
| `/nosotros` | Institucional (texto editable desde el admin) |
| `/noticias` | Listado de noticias |
| `/noticias/[slug]` | Nota individual (página propia = SEO) |
| `/convocatorias` | Listado de convocatorias |
| `/convocatorias/[slug]` | Convocatoria individual |
| `/galeria` | Fotos (R2) + videos (YouTube o R2) |
| `/registro` | Formulario de inscripción de jugador |
| `/contacto` | Datos + formulario |

### SEO técnico
- Metadatos (`title`, `description`, Open Graph con el logo) por página.
- `sitemap.xml` y `robots.txt`.
- Datos estructurados **JSON-LD**: `Organization` (el club) y `Event` (convocatorias).
- URLs limpias con `slug`.

---

## 5. Panel admin (`/admin`, protegido)

- **Login** con Supabase Auth (email + contraseña).
- **Dashboard:** jugadores pendientes, nº de noticias, próximas convocatorias.
- **Noticias / Convocatorias:** crear, editar, publicar o dejar en borrador.
- **Galería:** subir foto (→ R2) con descripción; agregar video (YouTube o R2).
- **Jugadores:** lista filtrable por estado; **aprobar / rechazar**; ver ficha.
- **Mensajes de contacto:** bandeja de entrada (marcar leído).
- **Nosotros:** editar texto institucional.

Patrón único y repetido en todo el panel: **subir / describir / guardar**.

---

## 6. Flujo de registro de jugadores

1. Visitante entra a `/registro` y llena el formulario.
2. Se crea un `players` en estado **`pendiente`**.
3. Aparece en el panel admin (Jugadores → pendientes).
4. El admin **aprueba** o **rechaza**.

En v1 el jugador **no** tiene login propio: es una ficha de control del club. Su panel personal queda para fase 2.

---

## 7. Mensajes de contacto

Formulario `/contacto` → se guarda en `contact_messages` (bandeja del panel) **y** se envía un **aviso por correo** al club vía Resend, para que ningún contacto se pierda.

---

## 8. Identidad visual

- **Paleta (del logo):** negro (fondo), **rojo** (acento/energía), **crema/hueso** (texto y superficies claras).
- **Tipografía:** sans **condensada y deportiva** para títulos (en línea con el logo) + sans legible para el cuerpo.
- **Estilo:** minimalista, mucho aire, imágenes grandes, hero de alto impacto, **mobile-first**.
- **Navegación:** máximo 5-6 ítems (Inicio · Nosotros · Noticias · Convocatorias · Galería · Contacto), con botón destacado "Súmate" → `/registro`.

---

## 9. Decisiones tomadas

1. **Contacto:** se guarda en panel **y** se avisa por correo (Resend).
2. **Campos del jugador:** el set del punto 3, sin añadidos, para minimizar fricción.
3. **Cuentas de admin:** creadas a mano en Supabase en v1; invitación desde el panel → fase 2.
4. **Noticias/Artículos:** **incluidas en v1**.

---

## 10. Alcance v1 (resumen)

**Incluye:** sitio base (Inicio · Nosotros · Contacto) · Noticias · Convocatorias · Galería (fotos + videos) · Registro de jugadores con aprobación · Panel admin a medida · SEO técnico · aviso de contacto por correo.

**No incluye (roadmap fase 2+):**
- Pagos / cuotas / mensualidades (método según país: MercadoPago / Stripe).
- Login de jugadores con panel propio.
- Confirmación de asistencia a convocatorias.
- Invitación de admins desde el panel.
- Integración con redes sociales (aún inexistentes).

---

## 11. Riesgos / notas

- **R2 + presigned URLs:** requiere configurar credenciales S3-compatibles y CORS del bucket.
- **Videos en R2:** adecuado para volúmenes chicos; si crece mucho, evaluar Cloudflare Stream o YouTube.
- **Supabase gratis:** 2 proyectos activos máx. por organización — se crea uno **dedicado** a EFA.
- **Dominio:** el club ya lo posee; se configurará en Vercel al desplegar.
